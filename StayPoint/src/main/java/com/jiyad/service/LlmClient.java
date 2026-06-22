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
import java.util.stream.Collectors;

/**
 * LLM client for the chatbot, with runtime failover across providers. Configured providers are tried
 * in order — Groq first (if GROQ_API_KEY is set), then Gemini (if GEMINI_API_KEY is set). For each
 * provider it retries transient failures (429 rate-limit, 5xx, timeouts) with backoff and tries a
 * secondary model; if a provider is unusable (bad key/request, or out of quota) it moves on to the
 * next. Only when every provider fails does it throw, so {@link ChatService} falls back to its
 * rule-based logic. If no key is set at all it is disabled.
 */
@Component
public class LlmClient {

    private enum Provider { GROQ, GEMINI }

    private static final String GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GEMINI_ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final int MAX_ATTEMPTS = 3;       // per model
    private static final long BASE_BACKOFF_MS = 400; // ×attempt

    private final List<ProviderConfig> providers = new ArrayList<>();
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
        if (!trim(groqKey).isBlank()) {
            providers.add(new ProviderConfig(Provider.GROQ, trim(groqKey),
                models(blankTo(groqModel, "llama-3.3-70b-versatile"), groqFallback)));
        }
        if (!trim(geminiKey).isBlank()) {
            providers.add(new ProviderConfig(Provider.GEMINI, trim(geminiKey),
                models(blankTo(geminiModel, "gemini-2.5-flash"), geminiFallback)));
        }
        String summary = providers.isEmpty() ? "none (rule-based only)"
            : providers.stream().map(p -> p.provider + "(" + p.models.get(0) + ")")
                .collect(Collectors.joining(" -> "));
        System.out.println("[LLM] providers: " + summary);
    }

    public boolean isEnabled() {
        return !providers.isEmpty();
    }

    /**
     * Runs a completion and returns the model's text (the JSON our prompt asks for), failing over
     * across providers/models and retrying transient errors before giving up.
     */
    public String complete(String systemInstruction,
                           List<Map<String, Object>> contents,
                           Map<String, Object> generationConfig) throws Exception {
        Exception last = null;
        for (ProviderConfig pc : providers) {
            modelLoop:
            for (String m : pc.models) {
                for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                    try {
                        return callOnce(pc, m, systemInstruction, contents, generationConfig);
                    } catch (LlmHttpException e) {
                        last = e;
                        if (e.status == 400 || e.status == 401 || e.status == 403) {
                            // Bad key/request for this provider — retrying or its other model won't
                            // help; move on to the next provider.
                            System.err.println("[LLM] " + pc.provider + "/" + m + " " + e.getMessage()
                                + " -> trying next provider");
                            break modelLoop;
                        }
                        boolean retryable = e.status == 408 || e.status == 429 || e.status >= 500;
                        if (retryable && attempt < MAX_ATTEMPTS) {
                            System.err.println("[LLM] " + pc.provider + "/" + m + " attempt " + attempt
                                + " -> " + e.getMessage() + " (retrying)");
                            sleep(BASE_BACKOFF_MS * attempt);
                            continue;
                        }
                        System.err.println("[LLM] " + pc.provider + "/" + m + " gave up: " + e.getMessage());
                        break; // next model
                    } catch (IOException | InterruptedException e) {
                        last = e;
                        if (attempt < MAX_ATTEMPTS) {
                            System.err.println("[LLM] " + pc.provider + "/" + m + " attempt " + attempt
                                + " connection error: " + e.getMessage() + " (retrying)");
                            sleep(BASE_BACKOFF_MS * attempt);
                            continue;
                        }
                        System.err.println("[LLM] " + pc.provider + "/" + m + " connection failed: " + e.getMessage());
                        break; // next model
                    }
                }
            }
            // this provider exhausted -> try the next one
        }
        throw (last != null ? last : new RuntimeException("LLM call failed"));
    }

    private String callOnce(ProviderConfig pc, String model, String systemInstruction,
                            List<Map<String, Object>> contents, Map<String, Object> genConfig)
            throws LlmHttpException, IOException, InterruptedException {
        return pc.provider == Provider.GROQ
            ? callGroq(pc.apiKey, model, systemInstruction, contents, genConfig)
            : callGemini(pc.apiKey, model, systemInstruction, contents, genConfig);
    }

    // --- Groq (OpenAI-compatible) ---
    private String callGroq(String apiKey, String model, String systemInstruction,
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
    private String callGemini(String apiKey, String model, String systemInstruction,
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

    private static List<String> models(String primary, String fallback) {
        List<String> list = new ArrayList<>();
        list.add(primary);
        fallback = trim(fallback);
        if (!fallback.isBlank() && !fallback.equalsIgnoreCase(primary)) {
            list.add(fallback);
        }
        return list;
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

    /** A configured provider and the models to try for it (primary, then optional fallback). */
    private static class ProviderConfig {
        final Provider provider;
        final String apiKey;
        final List<String> models;
        ProviderConfig(Provider provider, String apiKey, List<String> models) {
            this.provider = provider;
            this.apiKey = apiKey;
            this.models = models;
        }
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
