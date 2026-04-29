package com.university.platform.dto;

import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class ChatDTOs {

    @Data
    public static class QueryRequest {
        private String query;
        private String language = "auto";
        private String sessionId;
        // Personalization fields (Feature #15)
        private String branch;
        private Integer year;
        private String course;
    }

    @Data @Builder
    public static class QueryResponse {
        private String answer;
        private Double confidence;
        private String detectedLanguage;
        private String languageName;
        private Boolean fallback;
        private String sessionId;
        private LocalDateTime timestamp;
        private String sentiment;
        private Double sentimentScore;
        private List<String> retrievedChunks;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class SessionCreateResponse {
        private String sessionId;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class SessionDTO {
        private Long id;
        private String sessionId;
        private LocalDateTime createdAt;
        private LocalDateTime lastActivity;
        private int messageCount;
    }

    @Data @Builder
    public static class MessageDTO {
        private Long id;
        private String role;
        private String content;
        private Double confidenceScore;
        private String detectedLanguage;
        private Boolean fallback;
        private LocalDateTime timestamp;
        private String sentiment;
        private Double sentimentScore;
    }
}
