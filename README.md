# 🎓 UniMind AI — University Intelligence System

> **Not just a chatbot. An AI-powered university intelligence platform.**

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/AI%20Service-Python-3776AB?logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?logo=docker)](https://www.docker.com/)
[![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS-FF6F00)](https://faiss.ai/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [What Makes This Win](#-what-makes-this-win)
- [License](#-license)

---

## 🧠 Overview

**UniMind AI** is a RAG (Retrieval-Augmented Generation) powered university intelligence system built for students and administrators. It answers queries using **official university documents only** — no hallucinations, no guessing.
### 🎯 Key Differentiators
| Feature | Status |
|---|---|
| Query Intelligence Dashboard | ✅ |
| Sentiment Analysis | ✅ |
| Auto-Improvement System | ✅ |
| Hallucination Control | ✅ |
| Multilingual Support | ✅ |
| Confidence Scoring | ✅ |

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│   Student Dashboard │ Admin Dashboard │ Auth UI     │
└──────────────────────────┬──────────────────────────┘
│ REST API
┌──────────────────────────▼──────────────────────────┐
│               Spring Boot Backend                   │
│   JWT Auth │ Role-Based Access │ Chat Logging       │
└──────────────────────────┬──────────────────────────┘
│ Internal API
┌──────────────────────────▼──────────────────────────┐
│               Python AI Microservice                │
│   LangDetect │ RAG Engine │ FAISS │ LLM │ Sentiment │
└──────────────────────────┬──────────────────────────┘
│
┌──────────────────────────▼──────────────────────────┐
│                   PostgreSQL DB                     │
│   Users │ Chat Logs │ Documents │ Analytics         │
└─────────────────────────────────────────────────────┘
---

## ✨ Features

### 🔐 1. Authentication System
- **Sign In** — Email, Password, Role selector (Student / Admin)
- **Sign Up** — Full Name, Email, Password (Students only)
- **Profile Setup** (First login) — Branch, Year, Course, Hostel
- JWT Authentication with role-based access control
- Demo login buttons for quick evaluation

### 🧠 2. Core AI / RAG Engine
- PDF-based knowledge ingestion
- Context-restricted answers (no hallucination)
- Multilingual query support
- FAISS vector similarity search

### 🌍 3. Multilingual System
- Auto language detection via `langdetect`
- English ↔ Hindi support (optional Odia)
- Detect → Translate → Process → Translate back
- Response always in the user's query language

### 🛑 4. Hallucination Control
```python
if similarity_score < threshold:
    return "Information not available in official documents."
```
- Red-styled warning in UI for low-confidence responses
- Zero hallucination guarantee on out-of-scope queries

### 📊 5. Confidence Scoring System
| Score | Status | UI Color |
|---|---|---|
| > 0.8 | Verified | 🟢 Green |
| 0.5 – 0.8 | Moderate | 🟡 Yellow |
| < 0.5 | Low Confidence | 🔴 Red |

### 💬 6. Chat System
- Message bubbles with timestamps
- Confidence badge per response
- Language badge per response
- Full session history

### 📁 7. Admin Document Management
- Upload PDF documents
- Store metadata & version tracking
- One-click reindex button

### 🔄 8. Vector Reindex System
- Auto-triggered after PDF upload
- Regenerates FAISS embeddings
- Keeps vector DB always up to date

### 📊 9. Query Intelligence Dashboard ⭐ (Winning Feature)
- Most asked topics
- Queries per day
- Peak usage hours
- Department-wise query breakdown

### 😡 10. Sentiment Analysis
- Detects Negative / Neutral / Positive sentiment
- Tracks student frustration trends
- Useful for admin intervention alerts

### 🔁 11. Auto-Improvement System
- Detects low-confidence query patterns
- Suggests missing documents to admin
- Auto-generates FAQ suggestions

### 📊 12. Analytics Dashboard
- Queries over time — Line Chart
- Most asked topics — Bar Chart
- Language distribution — Pie Chart
- Confidence score trends

### 🧾 13. Chat Logging System
Stores per query: `Query` · `Response` · `Confidence` · `Language` · `Sentiment` · `Timestamp` · `User`

### 🧠 14. Personalization System
Responses are tailored based on:
- Branch (CSE, ECE, etc.)
- Year (1–4)
- Course (B.Tech / M.Tech)

> Example: *"CSE students often ask about placements"*

### 🔍 15. Transparency Feature
- Shows retrieved document chunks
- Displays similarity score per chunk

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Spring Boot, Spring Security |
| AI Service | Python, FastAPI, LangChain |
| Vector DB | FAISS |
| LLM | OpenAI / Ollama (configurable) |
| Database | PostgreSQL |
| Auth | JWT |
| Language Detection | langdetect |
| Containerization | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed
- OpenAI API Key (or local Ollama setup)

### Run the full system

```bash
git clone https://github.com/your-username/unimind-ai.git
cd unimind-ai
cp .env.example .env
# Fill in your environment variables
docker-compose up --build
```

### Access
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Spring Boot API | http://localhost:8080 |
| Python AI Service | http://localhost:8000 |

---

## 🔧 Environment Variables

```env
# Spring Boot
JWT_SECRET=your_jwt_secret
POSTGRES_URL=jdbc:postgresql://db:5432/unimind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword

# Python AI Service
OPENAI_API_KEY=your_openai_key
FAISS_INDEX_PATH=./faiss_index
SIMILARITY_THRESHOLD=0.5
DEFAULT_LANGUAGE=en

# React Frontend
REACT_APP_API_URL=http://localhost:8080
REACT_APP_AI_URL=http://localhost:8000
```

---

## 📡 API Reference

### Auth Endpoints (Spring Boot)
POST /api/auth/signup        → Register new user
POST /api/auth/login         → Login, returns JWT
POST /api/auth/profile       → Complete first-time profile

### Chat Endpoints
POST /api/chat/query         → Send a query
GET  /api/chat/history       → Get session history

### Admin Endpoints
POST /api/admin/upload       → Upload PDF document
POST /api/admin/reindex      → Trigger FAISS reindex
GET  /api/admin/logs         → Get all chat logs
GET  /api/admin/analytics    → Get analytics data
GET  /api/admin/documents    → List all documents

### Python AI Service
POST /query                  → RAG query + confidence + language + sentiment
POST /reindex                → Rebuild FAISS index
GET  /language/detect        → Detect query language
GET  /sentiment              → Sentiment on text

---

## 🏆 What Makes This Win

This is **not a chatbot**.

It is an **AI-powered university intelligence system** with:

1. **🔍 Query Intelligence Dashboard** — Admins see *exactly* what students are confused about, when, and from which department.

2. **😡 Sentiment Analysis** — Detects student frustration in real-time. No other university chatbot does this.

3. **🔁 Auto-Improvement System** — The system tells admins *which documents are missing* based on unanswered queries. It gets smarter over time.

Combined with RAG-based hallucination control, multilingual support, and confidence scoring, this system is production-ready and genuinely useful.
