package com.university.platform.repository;

import com.university.platform.model.ChatSession;
import com.university.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * File: backend-spring/src/main/java/com/university/platform/repository/ChatSessionRepository.java
 */
@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByLastActivityDesc(User user);
    Optional<ChatSession> findBySessionId(String sessionId);
    Optional<ChatSession> findBySessionIdAndUser(String sessionId, User user);
    long countByActiveTrue();
}
