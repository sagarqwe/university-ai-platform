"""
File: ai-service/routers/ask.py
Purpose: POST /ask — full RAG pipeline with proper multilingual translation flow.

Flow:
  1. Detect query language
  2. Translate query to English (for FAISS search)
  3. Retrieve relevant chunks from FAISS
  4. Build English prompt + call LLM
  5. Translate answer back to user's language
  6. Return with sentiment, confidence, transparency data
"""

import logging
from fastapi import APIRouter, HTTPException
from models.schemas import AskRequest, AskResponse
from services.rag_pipeline import rag_pipeline
from services.llm_service import llm_service
from services.language_service import (
    detect_language, get_language_name,
    translate_to_english, translate_from_english
)
from services.sentiment_service import analyze_sentiment
from services.auto_improvement_service import record_query
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest) -> AskResponse:
    query = request.query.strip()

    # ── Step 1: Language detection ────────────────────────────
    if request.language == "auto" or request.language.value == "auto":
        detected_lang = detect_language(query)
    else:
        detected_lang = request.language.value

    lang_name = get_language_name(detected_lang)
    logger.info(f"Query: '{query[:60]}' | Detected lang: {detected_lang}")

    # ── Step 2: Sentiment analysis ────────────────────────────
    sentiment_label, sentiment_score = analyze_sentiment(query)

    # ── Step 3: Translate query to English for FAISS search ───
    # FAISS index contains English text from PDFs, so we translate
    # the query to English before embedding search
    english_query = translate_to_english(query, detected_lang)
    logger.info(f"English query for search: '{english_query[:80]}'")

    # ── Step 4: Personalization context ───────────────────────
    personalization_hint = ""
    if request.branch or request.year or request.course:
        parts = []
        if request.branch: parts.append(f"Branch: {request.branch}")
        if request.year:   parts.append(f"Year: {request.year}")
        if request.course: parts.append(f"Course: {request.course}")
        personalization_hint = f"\n[Student Context: {', '.join(parts)}]"

    # ── Step 5: Retrieve chunks using English query ───────────
    context_chunks, max_similarity = rag_pipeline.retrieve(english_query)
    confidence = rag_pipeline.compute_confidence(max_similarity, len(context_chunks))

    # Track for auto-improvement
    record_query(query, confidence, detected_lang)

    # ── Step 6: Fallback if low confidence ───────────────────
    if confidence < settings.confidence_threshold or not context_chunks:
        fallback_en = (
            "I don't have enough information in the official university documents "
            "to answer this accurately. Please contact the university office or "
            "rephrase your question."
        )
        # Translate fallback message to user's language
        fallback_answer = translate_from_english(fallback_en, detected_lang)

        return AskResponse(
            answer=fallback_answer,
            confidence=round(confidence, 3),
            detected_language=detected_lang,
            language_name=lang_name,
            source_chunks=len(context_chunks),
            fallback=True,
            sentiment=sentiment_label,
            sentiment_score=sentiment_score,
            retrieved_chunks=[],
        )

    # ── Step 7: Build English prompt + call LLM ──────────────
    # Always generate answer in English first for accuracy
    english_prompt = rag_pipeline.build_prompt(
        english_query + personalization_hint,
        context_chunks,
        "en"  # Always generate in English first
    )

    english_answer = llm_service.generate(english_prompt)
    if not english_answer:
        raise HTTPException(status_code=503, detail="LLM service unavailable.")

    # ── Step 8: Translate answer back to user's language ─────
    final_answer = translate_from_english(english_answer, detected_lang)

    logger.info(
        f"Answer generated. Lang: {detected_lang} | "
        f"Confidence: {confidence:.2f} | Sentiment: {sentiment_label}"
    )

    return AskResponse(
        answer=final_answer,
        confidence=confidence,
        detected_language=detected_lang,
        language_name=lang_name,
        source_chunks=len(context_chunks),
        fallback=False,
        sentiment=sentiment_label,
        sentiment_score=sentiment_score,
        retrieved_chunks=context_chunks[:3],  # Feature #16 transparency
    )
