# AI-Powered Multilingual University Intelligence Platform

A production-style enterprise AI platform built with React, Spring Boot, Python FastAPI, FAISS, and LLM APIs.

---

## Architecture

```
React (3000) → Spring Boot (8080) → Python AI Service (8000)
                                  ↓
                            FAISS Index + LLM (Gemini/OpenAI)
```

---

## Prerequisites

| Tool        | Version     |
|-------------|-------------|
| Node.js     | 18+         |
| Java        | 17          |
| Maven       | 3.8+        |
| Python      | 3.10+       |
| PostgreSQL  | 14+         |

---

## 1. Database Setup

```sql
-- Run in psql or pgAdmin
CREATE DATABASE university_ai_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE university_ai_db TO postgres;
```

---

## 2. AI Service Setup

```bash
cd ai-service

# Copy and configure environment
cp .env.example .env
# Edit .env: set GEMINI_API_KEY or OPENAI_API_KEY

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
# OR: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Service runs at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

---

## 3. Spring Boot Backend Setup

```bash
cd backend-spring

# Run (Maven auto-downloads dependencies)
mvn spring-boot:run
```

Backend runs at: http://localhost:8080

Default users created automatically:
- Admin:   admin@university.edu / admin123
- Student: student@university.edu / student123

---

## 4. React Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: http://localhost:3000

---

## 5. Upload & Index Documents (Admin Flow)

1. Log in as admin at http://localhost:3000/login
2. Go to Admin Dashboard → Upload PDF
3. Click "Reindex" to build FAISS index
4. Test with student account

---

## API Reference

### Auth
| Method | Endpoint            | Body                          |
|--------|---------------------|-------------------------------|
| POST   | /api/auth/login     | { email, password }           |
| POST   | /api/auth/register  | { name, email, password, role}|
| GET    | /api/auth/me        | -                             |

### Chat
| Method | Endpoint                    | Body                          |
|--------|-----------------------------|-------------------------------|
| POST   | /api/chat/query             | { query, language, sessionId }|
| POST   | /api/chat/session           | -                             |
| GET    | /api/chat/sessions          | -                             |
| GET    | /api/chat/history/{sid}     | -                             |

### Admin
| Method | Endpoint                              |
|--------|---------------------------------------|
| POST   | /api/admin/documents/upload           |
| POST   | /api/admin/documents/reindex          |
| GET    | /api/admin/documents                  |
| DELETE | /api/admin/documents/{id}             |
| GET    | /api/admin/analytics/overview         |
| GET    | /api/admin/analytics/queries-per-day  |
| GET    | /api/admin/analytics/language-distribution |
| GET    | /api/admin/analytics/confidence-trend |

### AI Service (Direct)
| Method | Endpoint    | Body                        |
|--------|-------------|------------------------------|
| POST   | /ask        | { query, language }          |
| POST   | /reindex    | -                            |
| GET    | /health     | -                            |

---

## Demo Flow

1. Login as student → ask "What is the fee structure?" in Hindi
2. See: AI answer + confidence score + language badge
3. Login as admin → upload university PDF → click Reindex
4. Go to Analytics → see charts update

---

## Project Structure

```
university-ai-platform/
├── frontend/               React app (port 3000)
│   └── src/
│       ├── pages/          LoginPage, StudentDashboard, AdminDashboard, AnalyticsPage
│       ├── components/     Layout, ConfidenceBadge, LanguageBadge
│       ├── services/       api.js (Axios layer)
│       └── hooks/          useAuth.js
│
├── backend-spring/         Spring Boot (port 8080)
│   └── src/main/java/com/university/platform/
│       ├── controller/     AuthController, ChatController, AdminController
│       ├── service/        AuthService, ChatService, AdminService, AiClientService
│       ├── model/          User, ChatSession, ChatMessage, Document, Feedback
│       ├── repository/     JPA repos with analytics queries
│       ├── security/       JwtUtils, JwtAuthFilter
│       └── config/         SecurityConfig, AppConfig, DataInitializer
│
└── ai-service/             Python FastAPI (port 8000)
    ├── main.py             FastAPI app entry
    ├── routers/            ask.py, reindex.py
    ├── services/           rag_pipeline.py, llm_service.py, language_service.py
    ├── models/             schemas.py (Pydantic)
    └── config/             settings.py
```
