package com.university.platform.repository;

import com.university.platform.model.ChatMessage;
import com.university.platform.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * File: backend-spring/src/main/java/com/university/platform/repository/ChatMessageRepository.java
 * Contains custom JPQL queries for analytics.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionOrderByTimestampAsc(ChatSession session);

    // Analytics: count queries per day
    @Query("""
        SELECT CAST(m.timestamp AS date), COUNT(m)
        FROM ChatMessage m
        WHERE m.role = 'USER'
        AND m.timestamp >= :since
        GROUP BY CAST(m.timestamp AS date)
        ORDER BY CAST(m.timestamp AS date)
        """)
    List<Object[]> countQueriesPerDay(@Param("since") LocalDateTime since);

    // Analytics: language distribution
    @Query("""
        SELECT m.detectedLanguage, COUNT(m)
        FROM ChatMessage m
        WHERE m.role = 'ASSISTANT'
        AND m.detectedLanguage IS NOT NULL
        GROUP BY m.detectedLanguage
        """)
    List<Object[]> getLanguageDistribution();

    // Analytics: average confidence per day
    @Query("""
        SELECT CAST(m.timestamp AS date), AVG(m.confidenceScore)
        FROM ChatMessage m
        WHERE m.role = 'ASSISTANT'
        AND m.confidenceScore IS NOT NULL
        AND m.timestamp >= :since
        GROUP BY CAST(m.timestamp AS date)
        ORDER BY CAST(m.timestamp AS date)
        """)
    List<Object[]> getConfidenceTrend(@Param("since") LocalDateTime since);

    // Total query count (USER messages only)
    long countByRole(ChatMessage.MessageRole role);

    // Average confidence
    @Query("SELECT AVG(m.confidenceScore) FROM ChatMessage m WHERE m.role = 'ASSISTANT' AND m.confidenceScore IS NOT NULL")
    Double getAverageConfidence();

    // Recent messages for admin query log
    @Query("""
        SELECT m FROM ChatMessage m
        WHERE m.role = 'USER'
        ORDER BY m.timestamp DESC
        """)
    List<ChatMessage> findRecentUserMessages(org.springframework.data.domain.Pageable pageable);
}
