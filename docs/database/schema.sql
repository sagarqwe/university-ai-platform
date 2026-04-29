-- =============================================================================
-- File: docs/database/schema.sql
-- Purpose: Complete PostgreSQL schema for the University AI Platform.
--
-- USAGE:
--   psql -U postgres -d university_ai_db -f schema.sql
--
-- NOTE: Hibernate ddl-auto=update creates these automatically on Spring Boot
-- startup. This file is provided for reference, manual setup, or if you want
-- to create tables with exact indexes before the first run.
-- =============================================================================

-- Enable UUID extension (optional, Spring uses BIGSERIAL instead)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,          -- BCrypt hash
    role         VARCHAR(20)  NOT NULL DEFAULT 'STUDENT', -- STUDENT | ADMIN
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users (role);

-- =============================================================================
-- TABLE: chat_sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id            BIGSERIAL    PRIMARY KEY,
    session_id    VARCHAR(36)  NOT NULL UNIQUE,   -- UUID string
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user        ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id  ON chat_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_activity    ON chat_sessions (last_activity DESC);

-- =============================================================================
-- TABLE: chat_messages
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id                BIGSERIAL    PRIMARY KEY,
    session_id        BIGINT       NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role              VARCHAR(20)  NOT NULL,          -- USER | ASSISTANT
    content           TEXT         NOT NULL,
    confidence_score  NUMERIC(5,4),                  -- 0.0000 – 1.0000
    detected_language VARCHAR(10),                   -- en | hi | or
    is_fallback       BOOLEAN      NOT NULL DEFAULT FALSE,
    timestamp         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session   ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_messages_role      ON chat_messages (role);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON chat_messages (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_lang      ON chat_messages (detected_language)
    WHERE detected_language IS NOT NULL;

-- =============================================================================
-- TABLE: documents
-- =============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id                 BIGSERIAL    PRIMARY KEY,
    original_filename  VARCHAR(255) NOT NULL,
    stored_filename    VARCHAR(255) NOT NULL UNIQUE,  -- UUID prefix to avoid collision
    file_path          VARCHAR(512) NOT NULL,
    file_size_bytes    BIGINT,
    uploaded_by        BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    is_indexed         BOOLEAN      NOT NULL DEFAULT FALSE,
    indexed_at         TIMESTAMP,
    chunks_count       INTEGER
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_indexed     ON documents (is_indexed);

-- =============================================================================
-- TABLE: feedback
-- =============================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id          BIGSERIAL  PRIMARY KEY,
    message_id  BIGINT     REFERENCES chat_messages(id) ON DELETE SET NULL,
    user_id     BIGINT     REFERENCES users(id)         ON DELETE SET NULL,
    is_positive BOOLEAN    NOT NULL,
    comment     VARCHAR(500),
    created_at  TIMESTAMP  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_message  ON feedback (message_id);
CREATE INDEX IF NOT EXISTS idx_feedback_positive ON feedback (is_positive);

-- =============================================================================
-- Seed: Default admin and student users
-- Password for both: use bcrypt hash of 'admin123' / 'student123'
-- Spring's DataInitializer does this automatically — these are backup seeds.
-- =============================================================================
-- INSERT INTO users (name, email, password, role) VALUES
--   ('Admin User',   'admin@university.edu',   '$2a$10$...', 'ADMIN'),
--   ('Student Demo', 'student@university.edu', '$2a$10$...', 'STUDENT')
-- ON CONFLICT (email) DO NOTHING;
