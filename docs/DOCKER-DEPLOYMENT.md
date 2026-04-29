# STEP 7 — Final System Run (Docker)

## Prerequisites

- Docker Desktop installed and running
- Git (to clone/manage the project)
- A Gemini or OpenAI API key

---

## One-time Setup

```bash
# 1. Navigate to project root
cd university-ai-platform

# 2. Create the AI service .env with your API key
cp ai-service/.env.example ai-service/.env

# Edit the file and add your key:
#   GEMINI_API_KEY=your_actual_key_here
#   LLM_PROVIDER=gemini
nano ai-service/.env    # or use any text editor
```

---

## Run the Entire System

```bash
docker compose up --build
```

This single command:
1. Builds all 4 Docker images (first run takes ~5 minutes — downloads Java, Node, Python deps)
2. Starts PostgreSQL first (healthcheck ensures it's ready)
3. Starts Spring Boot backend (waits for PostgreSQL)
4. Starts FastAPI AI service (downloads embedding model ~90MB on first build)
5. Starts React frontend via Nginx

**Subsequent runs (no code changes):**
```bash
docker compose up        # reuses cached images, starts in ~15 seconds
docker compose up -d     # run in background
```

---

## Access the System

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | React app |
| **Backend API** | http://localhost:8080 | Spring Boot REST |
| **AI Service** | http://localhost:8000 | FastAPI + Swagger UI at /docs |
| **DB Admin** | http://localhost:5432 | PostgreSQL direct |

### Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.edu | admin123 |
| Student | student@university.edu | student123 |

---

## Demo Walkthrough

```bash
# 1. Open http://localhost:3000
# 2. Login as admin → upload a PDF → click Reindex
# 3. Login as student → ask a question in English or Hindi
# 4. Watch confidence badges and language detection in action
# 5. Admin → Analytics tab → see charts populate
```

---

## Useful Commands

```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f ai-service
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v

# Rebuild a single service after code change
docker compose up --build backend

# Shell into a container for debugging
docker exec -it uni_backend sh
docker exec -it uni_ai_service bash
docker exec -it uni_postgres psql -U postgres -d university_ai_db
```

---

## Service Startup Order

```
postgres (healthcheck: pg_isready)
  └─► backend (waits for postgres healthy)
ai-service (starts independently)
frontend (starts independently)
```

Backend startup takes ~30-60 seconds on first run (Maven build + Hibernate DDL).
AI service takes ~60-90 seconds on first run (loads 384-dim embedding model).

---

## Verify Everything is Running

```bash
# Check all containers are healthy
docker compose ps

# Should show:
# uni_postgres     running (healthy)
# uni_backend      running (healthy)
# uni_ai_service   running (healthy)
# uni_frontend     running

# Test health endpoints manually
curl http://localhost:8080/actuator/health
# → {"status":"UP"}

curl http://localhost:8000/health
# → {"status":"ok","llm_provider":"gemini","chunks_indexed":0,"initialized":true}

curl http://localhost:3000
# → HTML page (React app)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ai-service` fails to start | Check `ai-service/.env` has a valid API key |
| `backend` keeps restarting | Check `docker compose logs backend` — likely DB not ready yet |
| Chat returns "AI service unavailable" | `docker compose logs ai-service` — model may still be loading |
| "Network error" in browser | Wait 60s for all services to become healthy |
| `pdf_uploads` volume permission error | Run `docker compose down -v` then `docker compose up --build` |
| Port already in use | `lsof -ti:3000 | xargs kill -9` or change port in docker-compose.yml |

---

## Architecture in Docker

```
Browser (host machine)
    │
    │ http://localhost:3000
    ▼
┌─────────────────────────────────────┐   Docker network: uni-network
│  uni_frontend (Nginx :3000)         │
│  serves React static files          │
│  proxies /api/* ──────────────────► │──► uni_backend (:8080)
└─────────────────────────────────────┘         │
                                                │ http://ai-service:8000
                                                ▼
                                        uni_ai_service (:8000)
                                        FastAPI + FAISS + LLM
                                                │
                                      shared volume: pdf_uploads
                                                │
                                        uni_backend also writes here
                                        (uploads from admin dashboard)

uni_backend ──► uni_postgres (:5432)
              shared volume: postgres_data
```
