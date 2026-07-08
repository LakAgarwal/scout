package com.scout.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService() {
        this.httpClient = HttpClient.newBuilder().build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateContent(String systemInstruction, String prompt) {
        if ("mock_key".equals(geminiApiKey) || geminiApiKey == null || geminiApiKey.isEmpty()) {
            logger.warn("GEMINI_API_KEY is not configured or set to mock_key. Gemini requests will fail or use mock fallbacks.");
            return null;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", List.of(contentObj));

            if (systemInstruction != null && !systemInstruction.isEmpty()) {
                Map<String, Object> sysTextPart = Map.of("text", systemInstruction);
                Map<String, Object> sysObj = Map.of("parts", List.of(sysTextPart));
                payload.put("systemInstruction", sysObj);
            }

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                logger.error("Gemini API returned error code {}: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode candidate = rootNode.path("candidates").get(0);
            if (candidate != null) {
                JsonNode textNode = candidate.path("content").path("parts").get(0).path("text");
                return textNode.asText();
            }

            return null;
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API", e);
            return null;
        }
    }
}
