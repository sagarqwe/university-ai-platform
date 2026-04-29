"""
File: ai-service/routers/reindex.py
Purpose: POST /reindex endpoint — triggers full RAG reindexing pipeline.
Called by Spring Boot admin service after a new PDF is uploaded.
Connects to: services/rag_pipeline.py (reindex method)
"""

import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from pathlib import Path

from models.schemas import ReindexResponse
from services.rag_pipeline import rag_pipeline
from config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/reindex", response_model=ReindexResponse)
async def reindex_documents() -> ReindexResponse:
    """
    Trigger full reindexing of all PDFs in the data/pdfs directory.
    This endpoint is called by the Spring Boot admin service after uploading documents.
    """
    try:
        result = rag_pipeline.reindex()

        if result["status"] == "no_pdfs":
            return ReindexResponse(
                status="warning",
                chunks_indexed=0,
                documents=0,
                message="No PDF files found in data/pdfs directory. Upload documents first.",
            )

        return ReindexResponse(
            status="success",
            chunks_indexed=result["chunks_indexed"],
            documents=result["documents"],
            message=f"Successfully indexed {result['chunks_indexed']} chunks from {result['documents']} document(s).",
        )

    except Exception as e:
        logger.error(f"Reindexing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Reindexing failed: {str(e)}")


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Direct PDF upload to the AI service data directory.
    Note: In production, Spring Boot handles upload; this endpoint is for direct AI service access.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_dir = Path(settings.pdf_storage_path)
    pdf_dir.mkdir(parents=True, exist_ok=True)

    file_path = pdf_dir / file.filename
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        logger.info(f"PDF uploaded: {file.filename} ({len(content)} bytes)")
        return {"status": "uploaded", "filename": file.filename, "size_bytes": len(content)}
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# ── Auto-Improvement Report (Feature #12) ──────────────────────────────────
from fastapi import APIRouter as _APIRouter
from models.schemas import ImprovementReport
from services.auto_improvement_service import get_improvement_report

@router.get("/improvement-report", response_model=ImprovementReport)
async def improvement_report():
    """Returns auto-improvement suggestions based on query patterns."""
    return get_improvement_report()
