package com.university.platform.controller;

import com.university.platform.dto.ChatDTOs;
import com.university.platform.model.User;
import com.university.platform.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * File: backend-spring/src/main/java/com/university/platform/controller/ChatController.java
 * Purpose: Chat REST endpoints.
 * Routes:
 *   POST /api/chat/query              → submit a query
 *   POST /api/chat/session            → create a new session
 *   GET  /api/chat/sessions           → list user's sessions
 *   GET  /api/chat/history/{sessionId} → get messages in a session
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/query")
    public ResponseEntity<ChatDTOs.QueryResponse> query(
            @RequestBody ChatDTOs.QueryRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.processQuery(request, user));
    }

    @PostMapping("/session")
    public ResponseEntity<ChatDTOs.SessionCreateResponse> createSession(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.createSession(user));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatDTOs.SessionDTO>> getSessions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getUserSessions(user));
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatDTOs.MessageDTO>> getHistory(
            @PathVariable String sessionId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getSessionHistory(sessionId, user));
    }
}
