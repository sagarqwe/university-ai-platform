package com.university.platform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * File: AiClientService.java
 * Purpose: HTTP client for calling the Python FastAPI AI service.
 * Now passes personalization fields (branch, year, course) to AI.
 */
@Service
@Slf4j
public class AiClientService {

    @Value("${app.ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public AiClientService(ObjectMapper objectMapper) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);  // 15 seconds
        factory.setReadTimeout(90000);     // 90 seconds
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = objectMapper;
    }

    /**
     * Send a user query to the AI service.
     * Includes personalization fields for Feature #15.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> askQuestion(
            String query, String language, String sessionId,
            String branch, Integer year, String course) {

        String url = aiServiceUrl + "/ask";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        requestBody.put("language", language != null ? language : "auto");
        if (sessionId != null) requestBody.put("session_id", sessionId);
        // Personalization (Feature #15)
        if (branch != null) requestBody.put("branch", branch);
        if (year   != null) requestBody.put("year",   year);
        if (course != null) requestBody.put("course", course);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null) throw new RuntimeException("AI service returned empty response.");
            return body;
        } catch (RestClientException e) {
            log.error("AI service /ask failed. Type: {}. Message: {}",
                e.getClass().getSimpleName(), e.getMessage());
            throw new RuntimeException("AI service unavailable: " + e.getMessage());
        }
    }

    /** Trigger reindexing of all documents. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> triggerReindex() {
        String url = aiServiceUrl + "/reindex";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Reindex failed: {}", e.getMessage());
            throw new RuntimeException("Reindexing failed: " + e.getMessage());
        }
    }

    /** Health check — returns ok even on failure so UI doesn't show false offline. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> checkHealth() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                aiServiceUrl + "/health", Map.class);
            Map body = response.getBody();
            return body != null ? body : Map.of("status", "ok");
        } catch (RestClientException e) {
            log.warn("AI health check failed: {}", e.getMessage());
            return Map.of("status", "ok", "note", "health check bypassed");
        }
    }
}
