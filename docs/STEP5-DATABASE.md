# STEP 5 — Database Configuration Guide

## Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────────┐
│        users         │       │       chat_sessions       │
├──────────────────────┤       ├──────────────────────────┤
│ id          BIGSERIAL│◄──┐   │ id            BIGSERIAL  │
│ name        VARCHAR  │   │   │ session_id    VARCHAR(36)│ ← UUID
│ email       VARCHAR  │   │   │ user_id  FK──►users.id   │
│ password    VARCHAR  │   │   │ is_active     BOOLEAN    │
│ role        VARCHAR  │   │   │ created_at    TIMESTAMP  │
│ is_active   BOOLEAN  │   │   │ last_activity TIMESTAMP  │
│ created_at  TIMESTAMP│   │   └──────────┬───────────────┘
│ last_login  TIMESTAMP│   │              │ 1:many
└─────────┬────────────┘   │              ▼
          │                │   ┌──────────────────────────┐
          │ 1:many         │   │      chat_messages        │
          ▼                │   ├──────────────────────────┤
┌──────────────────────┐   │   │ id             BIGSERIAL │
│      documents       │   │   │ session_id FK──►sessions  │
├──────────────────────┤   │   │ role           VARCHAR   │ ← USER|ASSISTANT
│ id          BIGSERIAL│   │   │ content        TEXT      │
│ original_filename    │   │   │ confidence_score NUMERIC │
│ stored_filename      │   │   │ detected_language VARCHAR│
│ file_path            │   └───┤ is_fallback    BOOLEAN   │
│ file_size_bytes      │       │ timestamp      TIMESTAMP │
│ uploaded_by FK──►users│       └──────────┬───────────────┘
│ uploaded_at          │                  │ 1:many
│ is_indexed  BOOLEAN  │                  ▼
│ indexed_at           │       ┌──────────────────────────┐
│ chunks_count         │       │        feedback           │
└──────────────────────┘       ├──────────────────────────┤
                               │ id            BIGSERIAL  │
                               │ message_id FK──►messages  │
                               │ user_id    FK──►users     │
                               │ is_positive   BOOLEAN    │
                               │ comment       VARCHAR    │
                               │ created_at    TIMESTAMP  │
                               └──────────────────────────┘
```

## Setup Commands

### Option A — Automatic (recommended for development)
Just start Spring Boot. `ddl-auto=update` creates all tables automatically:
```bash
mvn spring-boot:run  # tables created on first boot
```

### Option B — Manual DDL (production or custom setup)
```bash
psql -U postgres -c "CREATE DATABASE university_ai_db;"
psql -U postgres -d university_ai_db -f docs/database/schema.sql
```

### Quick DB health check
```bash
psql -U postgres -d university_ai_db -c "\dt"
# Should list: users, chat_sessions, chat_messages, documents, feedback
```

---

## Key Design Decisions

**Why `chat_sessions` + `chat_messages` are separate tables:**
Sessions group messages. One student can have multiple sessions over time.
The `session_id` UUID is what the React frontend tracks in state.

**Why `stored_filename` has a UUID prefix:**
Prevents filename collision when two users upload `syllabus.pdf`.
The file is stored as `<uuid>_syllabus.pdf` but displayed as `syllabus.pdf`.

**Why `confidence_score` is `NUMERIC(5,4)` not `FLOAT`:**
Prevents floating-point drift in analytics aggregations. Stores `0.8547` exactly.

**Why `is_fallback` flag on messages:**
The admin analytics can filter out fallback (low-confidence) responses when computing average confidence, giving a more accurate quality metric.

---

## Performance Indexes

All analytics queries use these indexes:
- `idx_messages_timestamp` → queries per day time series (GROUP BY date)
- `idx_messages_lang` → language distribution (GROUP BY language)
- `idx_messages_role` → filter ASSISTANT messages for confidence trend
- `idx_sessions_activity` → order sessions by recency

---

## Backup (for demo persistence)

```bash
# Dump entire database
pg_dump -U postgres university_ai_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres university_ai_db < backup_20240615.sql
```
