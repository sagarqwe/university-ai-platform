package com.university.platform.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * File: backend-spring/src/main/java/com/university/platform/model/Document.java
 * Purpose: Tracks uploaded PDF documents.
 * Table: documents
 */
@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false, unique = true)
    private String storedFilename;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "is_indexed")
    @Builder.Default
    private boolean indexed = false;

    @Column(name = "indexed_at")
    private LocalDateTime indexedAt;

    @Column(name = "chunks_count")
    private Integer chunksCount;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
