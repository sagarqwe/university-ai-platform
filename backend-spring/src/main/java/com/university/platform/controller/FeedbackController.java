package com.university.platform.controller;

import com.university.platform.model.ChatMessage;
import com.university.platform.model.Feedback;
import com.university.platform.model.User;
import com.university.platform.repository.ChatMessageRepository;
import com.university.platform.repository.FeedbackRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * File: backend-spring/src/main/java/com/university/platform/controller/FeedbackController.java
 *
 * Purpose: Allows students to submit thumbs-up / thumbs-down feedback on AI messages.
 *          Feedback data is stored in the feedback table and can inform future
 *          confidence calibration and model improvements.
 *
 * Routes:
 *   POST /api/feedback          → submit feedback for a message
 *   GET  /api/feedback/summary  → admin: overall positive/negative ratio
 *
 * Connects to: FeedbackRepository, ChatMessageRepository, React StudentDashboard
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {

    private final FeedbackRepository    feedbackRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Data
    static class FeedbackRequest {
        private Long    messageId;
        private boolean positive;
        private String  comment;
    }

    /**
     * POST /api/feedback
     * Student submits feedback for a specific AI response message.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> submitFeedback(
            @RequestBody FeedbackRequest req,
            @AuthenticationPrincipal User user) {

        ChatMessage message = chatMessageRepository.findById(req.getMessageId())
                .orElseThrow(() -> new RuntimeException("Message not found: " + req.getMessageId()));

        // Only allow feedback on ASSISTANT messages
        if (message.getRole() != ChatMessage.MessageRole.ASSISTANT) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Feedback can only be submitted for AI responses"));
        }

        Feedback feedback = Feedback.builder()
                .message(message)
                .user(user)
                .positive(req.isPositive())
                .comment(req.getComment())
                .build();

        feedbackRepository.save(feedback);
        log.info("Feedback saved: messageId={} positive={} by={}",
                req.getMessageId(), req.isPositive(), user.getEmail());

        return ResponseEntity.ok(Map.of("status", "saved"));
    }

    /**
     * GET /api/feedback/summary
     * Returns overall positive/negative feedback counts (admin view).
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        long total    = feedbackRepository.count();
        long positive = feedbackRepository.countByPositiveTrue();
        long negative = total - positive;
        double rate   = total > 0 ? Math.round((positive * 100.0 / total) * 10) / 10.0 : 0.0;

        return ResponseEntity.ok(Map.of(
                "total",           total,
                "positive",        positive,
                "negative",        negative,
                "positiveRatePct", rate
        ));
    }
}
