package com.university.platform.service;

import com.university.platform.dto.AdminDTOs;
import com.university.platform.model.ChatMessage;
import com.university.platform.model.Document;
import com.university.platform.model.User;
import com.university.platform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * File: backend-spring/src/main/java/com/university/platform/service/AdminService.java
 * Purpose: Admin operations — document upload, reindex, analytics queries.
 * Returns DTOs (not raw JPA entities) to avoid lazy-load serialization issues.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final DocumentRepository    documentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository        userRepository;
    private final AiClientService       aiClientService;

    // ─────────────────────────────────────────────
    // Document Management
    // ─────────────────────────────────────────────

    @Transactional
    public AdminDTOs.DocumentDTO uploadDocument(MultipartFile file, User uploader) throws IOException {
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are accepted.");
        }

        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        String stored = UUID.randomUUID() + "_" + name;
        Path filePath = uploadPath.resolve(stored);
        Files.write(filePath, file.getBytes());

        Document doc = Document.builder()
                .originalFilename(name)
                .storedFilename(stored)
                .filePath(filePath.toString())
                .fileSizeBytes(file.getSize())
                .uploadedBy(uploader)
                .build();

        documentRepository.save(doc);
        log.info("Document uploaded: {} by {}", name, uploader.getEmail());
        return toDocumentDTO(doc);
    }

    @Transactional
    public AdminDTOs.ReindexResultDTO reindexDocuments() {
        Map<String, Object> result = aiClientService.triggerReindex();

        List<Document> docs = documentRepository.findAll();
        docs.forEach(d -> {
            d.setIndexed(true);
            d.setIndexedAt(LocalDateTime.now());
        });
        documentRepository.saveAll(docs);

        String status  = String.valueOf(result.getOrDefault("status", "unknown"));
        int    chunks  = ((Number) result.getOrDefault("chunks_indexed", 0)).intValue();
        int    docsCount = ((Number) result.getOrDefault("documents", 0)).intValue();

        return AdminDTOs.ReindexResultDTO.builder()
                .status(status)
                .chunksIndexed(chunks)
                .documents(docsCount)
                .message("Indexed " + chunks + " chunks from " + docsCount + " document(s).")
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminDTOs.DocumentDTO> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc()
                .stream().map(this::toDocumentDTO).toList();
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        try { Files.deleteIfExists(Paths.get(doc.getFilePath())); }
        catch (IOException e) { log.warn("Could not delete file: {}", doc.getFilePath()); }
        documentRepository.delete(doc);
        log.info("Document deleted: {}", doc.getOriginalFilename());
    }

    // ─────────────────────────────────────────────
    // Analytics
    // ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminDTOs.OverviewDTO getOverview() {
        long   totalDocs    = documentRepository.count();
        long   totalQueries = chatMessageRepository.countByRole(ChatMessage.MessageRole.USER);
        Double avgConf      = chatMessageRepository.getAverageConfidence();
        long   activeSessions = chatSessionRepository.countByActiveTrue();
        long   totalUsers   = userRepository.count();

        return AdminDTOs.OverviewDTO.builder()
                .totalDocuments(totalDocs)
                .totalQueries(totalQueries)
                .averageConfidence(avgConf != null ? Math.round(avgConf * 1000.0) / 1000.0 : 0.0)
                .activeSessions(activeSessions)
                .totalUsers(totalUsers)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQueriesPerDay() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rows = chatMessageRepository.countQueriesPerDay(since);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date",  row[0].toString());
            point.put("count", ((Number) row[1]).longValue());
            result.add(point);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLanguageDistribution() {
        List<Object[]> rows = chatMessageRepository.getLanguageDistribution();
        Map<String, String> names = Map.of("en","English","hi","Hindi","or","Odia");
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            String code = (String) row[0];
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("language", names.getOrDefault(code, code));
            entry.put("code",     code);
            entry.put("count",    ((Number) row[1]).longValue());
            result.add(entry);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConfidenceTrend() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rows = chatMessageRepository.getConfidenceTrend(since);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date",          row[0].toString());
            point.put("avgConfidence", Math.round(((Number) row[1]).doubleValue() * 1000.0) / 1000.0);
            result.add(point);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<AdminDTOs.QueryLogDTO> getRecentQueryLogs(int limit) {
        var messages = chatMessageRepository.findRecentUserMessages(PageRequest.of(0, limit));
        List<AdminDTOs.QueryLogDTO> result = new ArrayList<>();

        for (var msg : messages) {
            AdminDTOs.QueryLogDTO.QueryLogDTOBuilder b = AdminDTOs.QueryLogDTO.builder()
                    .id(msg.getId())
                    .query(msg.getContent())
                    .timestamp(msg.getTimestamp().toString())
                    .user(msg.getSession().getUser().getEmail());

            // Find paired AI response for confidence + language
            chatMessageRepository
                    .findBySessionOrderByTimestampAsc(msg.getSession())
                    .stream()
                    .filter(m -> m.getRole() == ChatMessage.MessageRole.ASSISTANT
                            && m.getTimestamp().isAfter(msg.getTimestamp()))
                    .findFirst()
                    .ifPresent(ai -> b.confidence(ai.getConfidenceScore())
                                      .language(ai.getDetectedLanguage())
                                      .sentiment(ai.getSentiment()));

            result.add(b.build());
        }
        return result;
    }

    // ─────────────────────────────────────────────
    // Mapping helpers
    // ─────────────────────────────────────────────

    private AdminDTOs.DocumentDTO toDocumentDTO(Document doc) {
        return AdminDTOs.DocumentDTO.builder()
                .id(doc.getId())
                .originalFilename(doc.getOriginalFilename())
                .storedFilename(doc.getStoredFilename())
                .fileSizeBytes(doc.getFileSizeBytes())
                .uploadedAt(doc.getUploadedAt())
                .uploadedByEmail(doc.getUploadedBy() != null ? doc.getUploadedBy().getEmail() : null)
                .indexed(doc.isIndexed())
                .indexedAt(doc.getIndexedAt())
                .chunksCount(doc.getChunksCount())
                .build();
    }
}
