-- =============================================================================
-- File: docs/schema.sql
-- Purpose: Explicit PostgreSQL schema for the University AI Platform.
--
-- Hibernate (spring.jpa.hibernate.ddl-auto=update) creates these tables
-- automatically on first run. This file is for:
--   1. Reference / documentation
--   2. Manual setup or migrations
--   3. Seeding a fresh database without Spring Boot
--
-- Run with: psql -U postgres -d university_ai_db -f docs/schema.sql
-- =============================================================================

-- Enable UUID extension (optional — we use BIGSERIAL PKs but available)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop in reverse dependency order (safe for re-runs)
DROP TABLE IF EXISTS feedback      CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS documents     CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- =============================================================================
-- Table: users
-- Maps to: User.java
-- =============================================================================
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,           -- BCrypt hash
    role        VARCHAR(20)  NOT NULL            -- 'STUDENT' | 'ADMIN'
                  CHECK (role IN ('STUDENT', 'ADMIN')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login  TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- =============================================================================
-- Table: documents
-- Maps to: Document.java
-- =============================================================================
CREATE TABLE documents (
    id                  BIGSERIAL PRIMARY KEY,
    original_filename   VARCHAR(255) NOT NULL,
    stored_filename     VARCHAR(255) NOT NULL UNIQUE,   -- UUID-prefixed
    file_path           TEXT         NOT NULL,
    file_size_bytes     BIGINT,
    uploaded_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    uploaded_by         BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    is_indexed          BOOLEAN      NOT NULL DEFAULT FALSE,
    indexed_at          TIMESTAMP,
    chunks_count        INTEGER
);

CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- =============================================================================
-- Table: chat_sessions
-- Maps to: ChatSession.java
-- =============================================================================
CREATE TABLE chat_sessions (
    id            BIGSERIAL PRIMARY KEY,
    session_id    VARCHAR(36) NOT NULL UNIQUE,     -- UUID string
    user_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMP   NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_chat_sessions_user    ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_session ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_active  ON chat_sessions(is_active, last_activity DESC);

-- =============================================================================
-- Table: chat_messages
-- Maps to: ChatMessage.java
-- =============================================================================
CREATE TABLE chat_messages (
    id                BIGSERIAL PRIMARY KEY,
    session_id        BIGINT      NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role              VARCHAR(20) NOT NULL
                        CHECK (role IN ('USER', 'ASSISTANT')),
    content           TEXT        NOT NULL,
    confidence_score  DOUBLE PRECISION,           -- NULL for USER messages
    detected_language VARCHAR(10),                -- 'en' | 'hi' | 'or'
    is_fallback       BOOLEAN     NOT NULL DEFAULT FALSE,
    timestamp         TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session   ON chat_messages(session_id, timestamp);
CREATE INDEX idx_chat_messages_role      ON chat_messages(role);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
CREATE INDEX idx_chat_messages_language  ON chat_messages(detected_language)
    WHERE detected_language IS NOT NULL;

-- =============================================================================
-- Table: feedback
-- Maps to: Feedback.java
-- =============================================================================
CREATE TABLE feedback (
    id          BIGSERIAL PRIMARY KEY,
    message_id  BIGINT      REFERENCES chat_messages(id) ON DELETE SET NULL,
    user_id     BIGINT      REFERENCES users(id)         ON DELETE SET NULL,
    is_positive BOOLEAN     NOT NULL,
    comment     VARCHAR(500),
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Seed default users (passwords are BCrypt of "admin123" and "student123")
-- Only run this if not using Spring Boot DataInitializer
-- =============================================================================
-- INSERT INTO users (name, email, password, role) VALUES
--   ('Admin User',   'admin@university.edu',   '$2a$10$...', 'ADMIN'),
--   ('Student Demo', 'student@university.edu', '$2a$10$...', 'STUDENT');

-- =============================================================================
-- Useful analytics queries (for reference / testing)
-- =============================================================================

-- Total queries per day (last 30 days)
-- SELECT DATE(timestamp) AS day, COUNT(*) AS queries
-- FROM chat_messages
-- WHERE role = 'USER' AND timestamp >= NOW() - INTERVAL '30 days'
-- GROUP BY day ORDER BY day;

-- Language distribution
-- SELECT detected_language, COUNT(*) AS count
-- FROM chat_messages
-- WHERE role = 'ASSISTANT' AND detected_language IS NOT NULL
-- GROUP BY detected_language;

-- Average confidence trend
-- SELECT DATE(timestamp) AS day, ROUND(AVG(confidence_score)::NUMERIC, 3) AS avg_conf
-- FROM chat_messages
-- WHERE role = 'ASSISTANT' AND confidence_score IS NOT NULL
--   AND timestamp >= NOW() - INTERVAL '30 days'
-- GROUP BY day ORDER BY day;
