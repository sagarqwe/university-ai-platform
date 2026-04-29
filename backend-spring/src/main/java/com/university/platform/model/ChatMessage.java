package com.university.platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatMessage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageRole role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private Double confidenceScore;
    private String detectedLanguage;
    private Boolean fallback;

    // ── Sentiment Analysis (Feature #11) ──────────────────
    private String sentiment;      // POSITIVE, NEUTRAL, NEGATIVE
    private Double sentimentScore; // -1.0 to 1.0

    // ── Transparency (Feature #16) ─────────────────────────
    @Column(columnDefinition = "TEXT")
    private String sourceChunks;   // JSON array of retrieved chunks

    private Integer chunksUsed;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum MessageRole { USER, ASSISTANT }

    public boolean isFallback() { return Boolean.TRUE.equals(fallback); }
}
