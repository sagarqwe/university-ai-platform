"""
File: ai-service/models/schemas.py
Purpose: Pydantic models for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class LanguageChoice(str, Enum):
    AUTO    = "auto"
    ENGLISH = "en"
    HINDI   = "hi"
    ODIA    = "or"


class AskRequest(BaseModel):
    query:      str             = Field(..., min_length=1, max_length=2000)
    language:   LanguageChoice  = Field(default=LanguageChoice.AUTO)
    session_id: Optional[str]   = None
    # Personalization fields (Feature #15)
    branch:     Optional[str]   = None
    year:       Optional[int]   = None
    course:     Optional[str]   = None


class AskResponse(BaseModel):
    answer:           str
    confidence:       float
    detected_language: str
    language_name:    str
    source_chunks:    int
    fallback:         bool   = False
    # Feature #11 — Sentiment
    sentiment:        str    = "NEUTRAL"
    sentiment_score:  float  = 0.0
    # Feature #16 — Transparency
    retrieved_chunks: List[str] = []


class ReindexResponse(BaseModel):
    status:         str
    chunks_indexed: int
    documents:      int
    message:        str


class HealthResponse(BaseModel):
    status:          str   = "ok"
    llm_provider:    str
    embedding_model: str
    chunks_indexed:  int
    index_ready:     bool


class ImprovementReport(BaseModel):
    total_queries:                int
    low_confidence_count:         int
    low_confidence_rate:          float
    missing_document_suggestions: List[dict]
    faq_suggestions:              List[dict]
    recent_low_confidence:        List[dict]
