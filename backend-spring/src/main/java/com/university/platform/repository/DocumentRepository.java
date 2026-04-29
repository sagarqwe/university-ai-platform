package com.university.platform.repository;

import com.university.platform.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * File: backend-spring/src/main/java/com/university/platform/repository/DocumentRepository.java
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByOrderByUploadedAtDesc();
    Optional<Document> findByStoredFilename(String storedFilename);
    long countByIndexedTrue();
}
