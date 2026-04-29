# STEP 12 — Final System Run Guide

## Prerequisites Checklist

Before running, ensure:

- [ ] **PostgreSQL** is running on port 5432
- [ ] **Database** `university_ai_db` created
- [ ] **Java 17** installed (`java -version`)
- [ ] **Maven 3.8+** installed (`mvn -version`)
- [ ] **Python 3.10+** installed (`python --version`)
- [ ] **Node 18+** installed (`node --version`)
- [ ] **API key** set in `ai-service/.env` (`GEMINI_API_KEY` or `OPENAI_API_KEY`)

---

## Quick Start (all OS)

### Linux / Mac
```bash
cd university-ai-platform
bash start-all.sh
```

### Windows
```
Double-click start-all.bat
```

### Manual (for debugging)

**Terminal 1 — AI Service:**
```bash
cd ai-service
cp .env.example .env        # edit and add API key
pip install -r requirements.txt
python main.py
# → Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 — Spring Boot:**
```bash
cd backend-spring
mvn spring-boot:run
# → Tomcat started on port(s): 8080
# → DataInitializer: seeded admin + student users
```

**Terminal 3 — React:**
```bash
cd frontend
npm install
npm start
# → Compiled successfully! http://localhost:3000
```

---

## Full Demo Walkthrough

### 1. First-time setup
- Navigate to http://localhost:3000
- You see the dark login page

### 2. Admin flow — Upload documents + reindex
```
Login: admin@university.edu / admin123
→ /admin dashboard
→ Click "Upload PDF" → select university brochure PDF
→ Click "Reindex" → wait for "Indexed N chunks" toast
→ Navigate to /admin/analytics — see language + query charts
```

### 3. Student flow — Multilingual chat
```
Login: student@university.edu / student123
→ / (chat page)
→ Click example query or type: "What is the fee structure for B.Tech?"
→ AI responds with: answer + green confidence badge + EN badge
→ Switch language to हिंदी
→ Type: "बी.टेक में एडमिशन कैसे होता है?"
→ AI responds in Hindi with Hindi language badge
→ Click History icon → see previous sessions
→ Click + for new session
```

### 4. Low confidence demonstration
```
Ask: "What is the password for the wifi in the canteen?"
→ Red "Low" confidence badge
→ Fallback message: "I don't have reliable information..."
```

---

## Service Health Checks

```bash
# AI Service
curl http://localhost:8000/health
# → {"status":"ok","llm_provider":"gemini","chunks_indexed":847,"initialized":true}

# Spring Boot
curl http://localhost:8080/api/admin/health \
  -H "Authorization: Bearer <admin-token>"
# → same as above

# React
open http://localhost:3000
# → Login page renders
```

---

## Complete File Count

| Service        | Files | Key files |
|----------------|-------|-----------|
| React Frontend | 36    | 5 pages/components groups |
| Spring Boot    | 36    | 4 controllers, 4 services, 5 models |
| AI Service     | 24    | RAG pipeline, LLM service, 2 routers |
| Documentation  | 12+   | All STEP guides + ERD + schema SQL |
| **Total**      | **~100** | — |

---

## Port Reference

| Port | Service | Process |
|------|---------|---------|
| 3000 | React dev server | npm start |
| 8080 | Spring Boot | mvn spring-boot:run / java -jar |
| 8000 | FastAPI AI service | uvicorn main:app |
| 5432 | PostgreSQL | postgres |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login fails | Ensure Spring Boot is running, DB seeded |
| "AI service unavailable" | Start `python main.py` in ai-service/ |
| Chat returns nothing | Click Reindex in admin dashboard |
| Charts empty | Queries needed; demo data shown automatically |
| CORS error | Check `app.cors.allowed-origins=http://localhost:3000` in application.properties |
| Port conflict | `lsof -ti:PORT | xargs kill -9` (Mac/Linux) |
| "Table not found" | Run `mvn spring-boot:run` — Hibernate creates tables on first boot |
