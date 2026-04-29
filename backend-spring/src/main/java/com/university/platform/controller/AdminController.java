package com.university.platform.controller;

import com.university.platform.dto.AdminDTOs;
import com.university.platform.model.User;
import com.university.platform.service.AdminService;
import com.university.platform.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * File: backend-spring/.../controller/AdminController.java
 * Purpose: Admin REST endpoints. All require ROLE_ADMIN (enforced in SecurityConfig).
 *
 * Routes:
 *   POST   /api/admin/documents/upload          → upload PDF
 *   POST   /api/admin/documents/reindex         → trigger AI reindex
 *   GET    /api/admin/documents                 → list all documents
 *   DELETE /api/admin/documents/{id}            → delete document
 *   GET    /api/admin/analytics/overview        → summary stats
 *   GET    /api/admin/analytics/queries-per-day → time series
 *   GET    /api/admin/analytics/language-distribution
 *   GET    /api/admin/analytics/confidence-trend
 *   GET    /api/admin/analytics/query-logs      → recent query log
 *   GET    /api/admin/health                    → AI service health
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService    adminService;
    private final AiClientService aiClientService;

    // ── Documents ──────────────────────────────────────────────────────────────

    @PostMapping("/documents/upload")
    public ResponseEntity<AdminDTOs.DocumentDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(adminService.uploadDocument(file, user));
    }

    @PostMapping("/documents/reindex")
    public ResponseEntity<AdminDTOs.ReindexResultDTO> reindex() {
        return ResponseEntity.ok(adminService.reindexDocuments());
    }

    @GetMapping("/documents")
    public ResponseEntity<List<AdminDTOs.DocumentDTO>> getDocuments() {
        return ResponseEntity.ok(adminService.getAllDocuments());
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        adminService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }

    // ── Analytics ──────────────────────────────────────────────────────────────

    @GetMapping("/analytics/overview")
    public ResponseEntity<AdminDTOs.OverviewDTO> getOverview() {
        return ResponseEntity.ok(adminService.getOverview());
    }

    @GetMapping("/analytics/queries-per-day")
    public ResponseEntity<List<Map<String, Object>>> getQueriesPerDay() {
        return ResponseEntity.ok(adminService.getQueriesPerDay());
    }

    @GetMapping("/analytics/language-distribution")
    public ResponseEntity<List<Map<String, Object>>> getLanguageDistribution() {
        return ResponseEntity.ok(adminService.getLanguageDistribution());
    }

    @GetMapping("/analytics/confidence-trend")
    public ResponseEntity<List<Map<String, Object>>> getConfidenceTrend() {
        return ResponseEntity.ok(adminService.getConfidenceTrend());
    }

    @GetMapping("/analytics/query-logs")
    public ResponseEntity<List<AdminDTOs.QueryLogDTO>> getQueryLogs(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(adminService.getRecentQueryLogs(limit));
    }

    // ── System Health ──────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAiHealth() {
        return ResponseEntity.ok(aiClientService.checkHealth());
    }
}
