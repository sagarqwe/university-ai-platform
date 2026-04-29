# STEP 8 — AI Microservice Connection Guide

## Service Communication Map

```
React :3000  ──HTTP──►  Spring Boot :8080  ──HTTP──►  FastAPI :8000
                         AiClientService               RAG Pipeline
                         RestTemplate                  FAISS + LLM
```

## Spring Boot → FastAPI (AiClientService.java)

### POST /ask — Query

Spring Boot sends:
```json
POST http://localhost:8000/ask
{
  "query": "What are the exam dates?",
  "language": "auto",
  "session_id": "a1b2c3..."
}
```

FastAPI returns:
```json
{
  "answer": "The end-semester exams are scheduled...",
  "confidence": 0.87,
  "detected_language": "en",
  "language_name": "English",
  "source_chunks": 5,
  "fallback": false
}
```

### POST /reindex — Rebuild Vector Index

Spring Boot sends: `POST http://localhost:8000/reindex`

FastAPI returns:
```json
{
  "status": "success",
  "chunks_indexed": 847,
  "documents": 3,
  "message": "Indexed 847 chunks from 3 documents"
}
```

### GET /health — Status Check

FastAPI returns:
```json
{
  "status": "ok",
  "llm_provider": "gemini",
  "embedding_model": "all-MiniLM-L6-v2",
  "chunks_indexed": 847,
  "pdf_count": 3,
  "initialized": true
}
```

## Configuration

Spring Boot reads the AI service URL from `application.properties`:
```properties
app.ai.service.url=http://localhost:8000
```

Change this to target a remote AI service:
```properties
app.ai.service.url=http://ai-service.internal:8000
```

## Error Handling

If FastAPI is offline, `AiClientService` catches `RestClientException` and throws:
```
RuntimeException: "AI service unavailable. Please try again later."
```

GlobalExceptionHandler converts this to:
```json
HTTP 500
{ "status": 500, "error": "Internal Server Error",
  "message": "AI service unavailable. Please try again later." }
```

React frontend shows this via toast notification.

## Startup Order

Services must start in this order:
```
1. PostgreSQL      (database)
2. FastAPI :8000   (AI service, loads FAISS + embedding model on startup)
3. Spring Boot :8080 (checks AI health on first admin request)
4. React :3000     (connects to Spring Boot)
```

Use the `start-all.bat` (Windows) or `start-all.sh` (Linux/Mac) scripts in
the project root to launch all services in sequence.
