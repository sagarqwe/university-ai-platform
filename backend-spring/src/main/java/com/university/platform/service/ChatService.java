package com.university.platform.service;

import com.university.platform.dto.ChatDTOs;
import com.university.platform.model.ChatMessage;
import com.university.platform.model.ChatSession;
import com.university.platform.model.User;
import com.university.platform.repository.ChatMessageRepository;
import com.university.platform.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * File: ChatService.java
 * Purpose: Chat business logic. Now passes user profile for personalization.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final AiClientService aiClientService;

    @Transactional
    public ChatDTOs.SessionCreateResponse createSession(User user) {
        ChatSession session = ChatSession.builder().user(user).build();
        session = sessionRepository.save(session);
        log.info("New session created: {} for user: {}", session.getSessionId(), user.getEmail());
        return ChatDTOs.SessionCreateResponse.builder()
                .sessionId(session.getSessionId())
                .createdAt(session.getCreatedAt())
                .build();
    }

    @Transactional
    public ChatDTOs.QueryResponse processQuery(ChatDTOs.QueryRequest request, User user) {
        ChatSession session = getOrCreateSession(request.getSessionId(), user);

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role(ChatMessage.MessageRole.USER)
                .content(request.getQuery())
                .build();
        messageRepository.save(userMessage);

        // Call AI service — pass personalization from request OR user profile
        String branch = request.getBranch() != null ? request.getBranch() : user.getBranch();
        Integer year  = request.getYear()   != null ? request.getYear()   : user.getYear();
        String course = request.getCourse() != null ? request.getCourse() : user.getCourse();

        Map<String, Object> aiResponse = aiClientService.askQuestion(
                request.getQuery(),
                request.getLanguage(),
                session.getSessionId(),
                branch, year, course
        );

        String answer       = (String)  aiResponse.get("answer");
        double confidence   = ((Number) aiResponse.getOrDefault("confidence", 0.0)).doubleValue();
        String detectedLang = (String)  aiResponse.getOrDefault("detected_language", "en");
        String langName     = (String)  aiResponse.getOrDefault("language_name", "English");
        boolean fallback    = Boolean.TRUE.equals(aiResponse.get("fallback"));
        String sentiment    = (String)  aiResponse.getOrDefault("sentiment", "NEUTRAL");

        // Save AI response
        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .role(ChatMessage.MessageRole.ASSISTANT)
                .content(answer)
                .confidenceScore(confidence)
                .detectedLanguage(detectedLang)
                .fallback(fallback)
                .sentiment(sentiment)
                .build();
        messageRepository.save(aiMessage);

        session.setLastActivity(LocalDateTime.now());
        sessionRepository.save(session);

        // Extract retrieved chunks if present
        List<String> chunks = null;
        Object chunksObj = aiResponse.get("retrieved_chunks");
        if (chunksObj instanceof List) {
            chunks = ((List<?>) chunksObj).stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        }

        return ChatDTOs.QueryResponse.builder()
                .answer(answer)
                .confidence(confidence)
                .detectedLanguage(detectedLang)
                .languageName(langName)
                .fallback(fallback)
                .sessionId(session.getSessionId())
                .timestamp(aiMessage.getTimestamp())
                .sentiment(sentiment)
                .retrievedChunks(chunks)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatDTOs.MessageDTO> getSessionHistory(String sessionId, User user) {
        ChatSession session = sessionRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return messageRepository.findBySessionOrderByTimestampAsc(session)
                .stream().map(this::toMessageDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatDTOs.SessionDTO> getUserSessions(User user) {
        return sessionRepository.findByUserOrderByLastActivityDesc(user)
                .stream().map(s -> ChatDTOs.SessionDTO.builder()
                        .id(s.getId())
                        .sessionId(s.getSessionId())
                        .createdAt(s.getCreatedAt())
                        .lastActivity(s.getLastActivity())
                        .messageCount(s.getMessages().size())
                        .build())
                .collect(Collectors.toList());
    }

    private ChatSession getOrCreateSession(String sessionId, User user) {
        if (sessionId != null && !sessionId.isBlank()) {
            return sessionRepository.findBySessionIdAndUser(sessionId, user)
                    .orElseGet(() -> createNewSession(user));
        }
        return createNewSession(user);
    }

    private ChatSession createNewSession(User user) {
        ChatSession session = ChatSession.builder().user(user).build();
        return sessionRepository.save(session);
    }

    private ChatDTOs.MessageDTO toMessageDTO(ChatMessage m) {
        return ChatDTOs.MessageDTO.builder()
                .id(m.getId())
                .role(m.getRole().name())
                .content(m.getContent())
                .confidenceScore(m.getConfidenceScore())
                .detectedLanguage(m.getDetectedLanguage())
                .fallback(m.isFallback())
                .timestamp(m.getTimestamp())
                .sentiment(m.getSentiment())
                .build();
    }
}
