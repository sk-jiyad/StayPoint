package com.jiyad.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Minimal client for Google's Gemini API (generateContent). Used by {@link ChatService} to drive
 * the chatbot conversation. Reads GEMINI_API_KEY / GEMINI_MODEL from the environment; when the key
 * is absent {@link #isEnabled()} is false and the chatbot falls back to its rule-based logic.
 */
@Component
public class GeminiClient {

    private static final String ENDPOINT =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final String apiKey;
    private final String model;
    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper mapper = new ObjectMapper();

    public GeminiClient(@Value("${GEMINI_API_KEY:}") String apiKey,
                        @Value("${GEMINI_MODEL:gemini-2.5-flash}") String model) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = (model == null || model.isBlank()) ? "gemini-2.5-flash" : model.trim();
    }

    public boolean isEnabled() {
        return !apiKey.isBlank();
    }

    /**
     * Calls generateContent and returns the text of the first candidate. `contents` is the
     * conversation (each entry {role, parts:[{text}]}); generationConfig carries the JSON schema.
     */
    public String complete(String systemInstruction,
                           List<Map<String, Object>> contents,
                           Map<String, Object> generationConfig) throws Exception {
        Map<String, Object> body = Map.of(
            "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
            "contents", contents,
            "generationConfig", generationConfig
        );
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(String.format(ENDPOINT, model, apiKey)))
            .timeout(Duration.ofSeconds(25))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
            .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() / 100 != 2) {
            throw new RuntimeException("Gemini HTTP " + resp.statusCode() + ": " + resp.body());
        }
        JsonNode parts = mapper.readTree(resp.body())
            .path("candidates").path(0).path("content").path("parts");
        StringBuilder sb = new StringBuilder();
        for (JsonNode p : parts) {
            if (p.has("text")) sb.append(p.get("text").asText());
        }
        String text = sb.toString();
        if (text.isBlank()) {
            throw new RuntimeException("Gemini returned no text: " + resp.body());
        }
        return text;
    }
}
