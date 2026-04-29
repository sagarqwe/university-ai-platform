package com.university.platform.repository;

import com.university.platform.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * File: backend-spring/src/main/java/com/university/platform/repository/FeedbackRepository.java
 * Purpose: Feedback persistence — counts used by FeedbackController summary endpoint.
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    long countByPositiveTrue();
    long countByPositiveFalse();
}
