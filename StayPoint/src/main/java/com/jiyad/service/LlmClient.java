package com.jiyad.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * LLM client for the chatbot. Provider is chosen from the environment: if GROQ_API_KEY is set it
 * uses Groq (OpenAI-compatible, generous free tier), otherwise it uses Google Gemini, otherwise it
 * is disabled and {@link ChatService} falls back to its rule-based logic.
 *
 * <p>Both providers are driven through the same {@link #complete} method (system prompt + a Gemini
 * style conversation + a generation config). Transient failures (429 rate-limit, 5xx, timeouts) are
 * retried with backoff and, if the primary model stays unavailable, a secondary model is tried.
 */
@Component
public class LlmClient {

    private enum Provider { GROQ, GEMINI, NONE }

    private static final String GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GEMINI_ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final int MAX_ATTEMPTS = 3;
    private static final long BASE_BACKOFF_MS = 400;

    private final Provider provider;
    private final String apiKey;
    private final String model;
    private final String fallbackModel;
    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8)).build();
    private final ObjectMapper mapper = new ObjectMapper();

    public LlmClient(
            @Value("${GROQ_API_KEY:}") String groqKey,
            @Value("${GROQ_MODEL:llama-3.3-70b-versatile}") String groqModel,
            @Value("${GROQ_FALLBACK_MODEL:llama-3.1-8b-instant}") String groqFallback,
            @Value("${GEMINI_API_KEY:}") String geminiKey,
            @Value("${GEMINI_MODEL:gemini-2.5-flash}") String geminiModel,
            @Value("${GEMINI_FALLBACK_MODEL:gemini-2.0-flash}") String geminiFallback) {
        groqKey = trim(groqKey);
        geminiKey = trim(geminiKey);
        if (!groqKey.isBlank()) {
            this.provider = Provider.GROQ;
            this.apiKey = groqKey;
            this.model = blankTo(groqModel, "llama-3.3-70b-versatile");
            this.fallbackModel = trim(groqFallback);
        } else if (!geminiKey.isBlank()) {
            this.provider = Provider.GEMINI;
            this.apiKey = geminiKey;
            this.model = blankTo(geminiModel, "gemini-2.5-flash");
            this.fallbackModel = trim(geminiFallback);
        } else {
            this.provider = Provider.NONE;
            this.apiKey = "";
            this.model = "";
            this.fallbackModel = "";
        }
        System.out.println("[LLM] provider=" + provider + (provider == Provider.NONE ? "" : " model=" + model));
    }

    public boolean isEnabled() {
        return provider != Provider.NONE;
    }

    /**
     * Runs a completion and returns the model's text (expected to be the JSON our prompt asks for),
     * retrying transient failures and trying the secondary model when the primary is unavailable.
     */
    public String complete(String systemInstruction,
                           List<Map<String, Object>> contents,
                           Map<String, Object> generationConfig) throws Exception {
        List<String> models = new ArrayList<>();
        models.add(model);
        if (!fallbackModel.isBlank() && !fallbackModel.equalsIgnoreCase(model)) {
            models.add(fallbackModel);
        }
        Exception last = null;
        for (int mi = 0; mi < models.size(); mi++) {
            String m = models.get(mi);
            for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                try {
                    return callOnce(m, systemInstruction, contents, generationConfig);
                } catch (LlmHttpException e) {
                    last = e;
                    if (mi == 0 && (e.status == 400 || e.status == 401 || e.status == 403)) {
                        throw e; // bad request / auth on primary: retry & model-switch won't help
                    }
                    boolean retryable = e.status == 408 || e.status == 429 || e.status >= 500;
                    if (retryable && attempt < MAX_ATTEMPTS) {
                        System.err.println("[LLM] " + m + " attempt " + attempt + " -> "
                            + e.getMessage() + " (retrying)");
                        sleep(BASE_BACKOFF_MS * attempt);
                        continue;
                    }
                    System.err.println("[LLM] " + m + " gave up: " + e.getMessage());
                    break;
                } catch (IOException | InterruptedException e) {
                    last = e;
                    if (attempt < MAX_ATTEMPTS) {
                        System.err.println("[LLM] " + m + " attempt " + attempt
                            + " connection error: " + e.getMessage() + " (retrying)");
                        sleep(BASE_BACKOFF_MS * attempt);
                        continue;
                    }
                    System.err.println("[LLM] " + m + " connection failed: " + e.getMessage());
                    break;
                }
            }
        }
        throw (last != null ? last : new RuntimeException("LLM call failed"));
    }

    private String callOnce(String model, String systemInstruction,
                            List<Map<String, Object>> contents, Map<String, Object> genConfig)
            throws LlmHttpException, IOException, InterruptedException {
        return provider == Provider.GROQ
            ? callGroq(model, systemInstruction, contents, genConfig)
            : callGemini(model, systemInstruction, contents, genConfig);
    }

    // --- Groq (OpenAI-compatible) ---
    private String callGroq(String model, String systemInstruction,
                            List<Map<String, Object>> contents, Map<String, Object> genConfig)
            throws LlmHttpException, IOException, InterruptedException {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemInstruction));
        for (Map<String, Object> c : contents) {
            String role = String.valueOf(c.getOrDefault("role", "user"));
            String openAiRole = "model".equalsIgnoreCase(role) ? "assistant" : "user";
            messages.add(Map.of("role", openAiRole, "content", firstPartText(c)));
        }
        Map<String, Object> body = Map.of(
            "model", model,
            "messages", messages,
            "temperature", genConfig.getOrDefault("temperature", 0.4),
            "response_format", Map.of("type", "json_object")
        );
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(GROQ_ENDPOINT))
            .timeout(Duration.ofSeconds(20))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
            .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new LlmHttpException(resp.statusCode(), "HTTP " + resp.statusCode() + ": " + truncate(resp.body()));
        }
        String text = mapper.readTree(resp.body())
            .path("choices").path(0).path("message").path("content").asText("");
        if (text.isBlank()) {
            throw new LlmHttpException(0, "empty response: " + truncate(resp.body()));
        }
        return text;
    }

    // --- Gemini ---
    private String callGemini(String model, String systemInstruction,
                              List<Map<String, Object>> contents, Map<String, Object> genConfig)
            throws LlmHttpException, IOException, InterruptedException {
        Map<String, Object> body = Map.of(
            "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
            "contents", contents,
            "generationConfig", genConfig
        );
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(String.format(GEMINI_ENDPOINT, model, apiKey)))
            .timeout(Duration.ofSeconds(20))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
            .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new LlmHttpException(resp.statusCode(), "HTTP " + resp.statusCode() + ": " + truncate(resp.body()));
        }
        JsonNode parts = mapper.readTree(resp.body())
            .path("candidates").path(0).path("content").path("parts");
        StringBuilder sb = new StringBuilder();
        for (JsonNode p : parts) {
            if (p.has("text")) sb.append(p.get("text").asText());
        }
        String text = sb.toString();
        if (text.isBlank()) {
            throw new LlmHttpException(0, "empty response: " + truncate(resp.body()));
        }
        return text;
    }

    @SuppressWarnings("unchecked")
    private static String firstPartText(Map<String, Object> content) {
        Object parts = content.get("parts");
        if (parts instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> p) {
            Object t = ((Map<String, Object>) p).get("text");
            if (t != null) return t.toString();
        }
        return "";
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private static String trim(String s) { return s == null ? "" : s.trim(); }
    private static String blankTo(String s, String def) { return (s == null || s.isBlank()) ? def : s.trim(); }
    private static String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "…" : s;
    }

    /** Non-2xx (or empty) LLM response; carries the HTTP status for retry decisions. */
    private static class LlmHttpException extends Exception {
        final int status;
        LlmHttpException(int status, String message) {
            super(message);
            this.status = status;
        }
    }
}
