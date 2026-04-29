package com.university.platform.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

/**
 * File: backend-spring/.../config/AiFileSyncConfig.java
 *
 * Purpose: Ensures upload directory exists on startup.
 *
 * LOCAL DEV:  uploadDir = ./uploads/pdfs
 *             aiDataDir = ../ai-service/data/pdfs
 *             → copies PDFs across so both services share files on the same machine
 *
 * DOCKER:     Both paths point to the SAME Docker volume mount (/app/uploads/pdfs)
 *             because docker-compose.yml sets APP_UPLOAD_DIR and APP_AI_DATA_DIR
 *             to the same value. No copy is needed — the volume is shared.
 */
@Configuration
@Slf4j
public class AiFileSyncConfig {

    @Value("${app.upload.dir:./uploads/pdfs}")
    private String uploadDir;

    @Value("${app.ai.data.dir:../ai-service/data/pdfs}")
    private String aiDataDir;

    @Bean
    public ApplicationRunner ensureDirectories() {
        return args -> {
            // Always ensure the upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }

            // In Docker, uploadDir == aiDataDir (same volume), so skip sync
            Path aiPath = Paths.get(aiDataDir);
            if (uploadPath.toAbsolutePath().equals(aiPath.toAbsolutePath())) {
                log.info("Docker mode: upload and AI data paths are the same volume. No sync needed.");
                return;
            }

            // Local dev: copy PDFs from uploadDir → aiDataDir
            try {
                if (!Files.exists(aiPath)) {
                    Files.createDirectories(aiPath);
                    log.info("Created AI data directory: {}", aiPath.toAbsolutePath());
                }
                syncPdfs(uploadPath, aiPath);
            } catch (IOException e) {
                log.warn("Could not sync PDFs to AI data dir ({}): {}",
                        aiPath.toAbsolutePath(), e.getMessage());
            }
        };
    }

    private void syncPdfs(Path source, Path target) throws IOException {
        if (!Files.exists(source)) return;
        Files.walkFileTree(source, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                if (file.toString().toLowerCase().endsWith(".pdf")) {
                    Path dest = target.resolve(file.getFileName());
                    if (!Files.exists(dest)) {
                        Files.copy(file, dest, StandardCopyOption.REPLACE_EXISTING);
                        log.info("Synced PDF: {}", file.getFileName());
                    }
                }
                return FileVisitResult.CONTINUE;
            }
        });
    }
}
