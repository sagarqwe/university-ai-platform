"""
File: ai-service/main.py
Purpose: FastAPI application entrypoint. Registers routers, initializes services on startup.
Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
Connects to: all routers, services initialized at startup
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import ask, reindex
from services.rag_pipeline import rag_pipeline
from services.llm_service import llm_service
from models.schemas import HealthResponse
from config.settings import settings

# ─────────────────────────────────────────────
# Logging configuration
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Lifespan: startup & shutdown
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all heavy resources on startup."""
    logger.info("=" * 60)
    logger.info("University AI Service starting up...")
    logger.info(f"LLM Provider: {settings.llm_provider}")
    logger.info(f"Embedding Model: {settings.embedding_model}")

    # Initialize RAG pipeline (loads embedding model + FAISS index)
    rag_pipeline.initialize()

    # Initialize LLM client
    llm_service.initialize()

    logger.info("All services initialized. Ready to serve requests.")
    logger.info("=" * 60)

    yield  # App runs here

    logger.info("University AI Service shutting down.")


# ─────────────────────────────────────────────
# FastAPI app instance
# ─────────────────────────────────────────────
app = FastAPI(
    title="University Intelligence AI Service",
    description="RAG-powered multilingual university query system with FAISS vector search",
    version="1.0.0",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# CORS — allow Spring Boot backend (port 8080) and React frontend (port 3000)
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        # Docker container names
        "http://frontend:3000",
        "http://backend:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────
app.include_router(ask.router, tags=["RAG Query"])
app.include_router(reindex.router, tags=["Document Management"])


# ─────────────────────────────────────────────
# GET /health
# ─────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    """
    System health check.
    Returns index status, LLM provider, and chunk count.
    Called by Spring Boot on startup to verify AI service connectivity.
    """
    index_ready = (
        rag_pipeline._initialized
        and rag_pipeline.index is not None
        and rag_pipeline.index.ntotal > 0
    )
    return HealthResponse(
        status="ok",
        llm_provider=settings.llm_provider,
        embedding_model=settings.embedding_model,
        chunks_indexed=len(rag_pipeline.chunks),
        index_ready=index_ready,
    )


@app.get("/", tags=["System"])
async def root():
    return JSONResponse({
        "service": "University Intelligence AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    })


# ─────────────────────────────────────────────
# Run directly (dev mode)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info",
    )
