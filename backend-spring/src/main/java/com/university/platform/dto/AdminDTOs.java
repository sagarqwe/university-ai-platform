package com.university.platform.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * File: backend-spring/src/main/java/com/university/platform/dto/AdminDTOs.java
 * Purpose: DTOs for Admin API responses.
 * Using DTOs instead of raw JPA entities prevents:
 *  - LazyInitializationException on lazy-loaded relations
 *  - Infinite JSON recursion (bidirectional OneToMany)
 *  - Leaking internal fields
 */
public class AdminDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DocumentDTO {
        private Long id;
        private String originalFilename;
        private String storedFilename;
        private Long fileSizeBytes;
        private LocalDateTime uploadedAt;
        private String uploadedByEmail;
        private boolean indexed;
        private LocalDateTime indexedAt;
        private Integer chunksCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OverviewDTO {
        private long totalDocuments;
        private long totalQueries;
        private double averageConfidence;
        private long activeSessions;
        private long totalUsers;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReindexResultDTO {
        private String status;
        private int chunksIndexed;
        private int documents;
        private String message;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QueryLogDTO {
        private Long id;
        private String user;
        private String query;
        private Double confidence;
        private String language;
        private String sentiment;   // Feature #11 & #14
        private String timestamp;
    }
}
