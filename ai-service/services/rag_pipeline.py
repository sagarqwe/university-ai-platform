"""
File: ai-service/services/rag_pipeline.py
Purpose: Complete 13-step RAG pipeline.
  1  Load PDFs (PyMuPDF)
  2  Extract text per page
  3  Clean text (utils.text_utils)
  4  Chunk text (~400 words with overlap)
  5  Generate embeddings (sentence-transformers)
  6  Store in FAISS index (cosine similarity)
  7  Query FAISS
  8  Retrieve top-k chunks
  9  Build LLM prompt with context
  10 Call LLM
  11 Return answer
  12 Compute confidence score
  13 Return structured response

Connects to:
  routers/ask.py     — called on POST /ask
  routers/reindex.py — called on POST /reindex
"""

import os
import pickle
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional

import fitz  # PyMuPDF
import faiss
from sentence_transformers import SentenceTransformer

from config.settings import settings
from utils.text_utils import clean_text, count_tokens_approx
from utils.logger import get_logger

logger = get_logger(__name__)


class RAGPipeline:
    """
    Singleton RAG pipeline — loaded once at app startup via initialize().
    Thread-safe for read (retrieve) operations.
    Write (reindex) operations should not be called concurrently.
    """

    def __init__(self):
        self.model: Optional[SentenceTransformer] = None
        self.index: Optional[faiss.IndexFlatIP] = None
        self.chunks: List[str] = []
        self.chunk_metadata: List[dict] = []
        self._initialized = False

    # ──────────────────────────────────────────────────────
    # Startup
    # ──────────────────────────────────────────────────────

    def initialize(self):
        """Load embedding model + existing FAISS index (if any)."""
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        self.model = SentenceTransformer(settings.embedding_model)
        logger.info("Embedding model loaded.")
        self._load_index()
        self._initialized = True
        logger.info(f"RAG pipeline ready — {len(self.chunks)} chunks indexed.")

    # ──────────────────────────────────────────────────────
    # STEP 1-2: Load + extract PDF text
    # ──────────────────────────────────────────────────────

    def _extract_text_from_pdf(self, pdf_path: str) -> List[Tuple[str, int]]:
        """
        Returns list of (cleaned_page_text, page_number) tuples.
        Skips blank pages.
        """
        pages = []
        try:
            doc = fitz.open(pdf_path)
            for page_num, page in enumerate(doc, start=1):
                raw = page.get_text("text")
                cleaned = clean_text(raw)  # STEP 3
                if len(cleaned.strip()) > 30:
                    pages.append((cleaned, page_num))
            doc.close()
            logger.info(f"Extracted {len(pages)} pages from {Path(pdf_path).name}")
        except Exception as e:
            logger.error(f"PDF extraction failed for {pdf_path}: {e}")
        return pages

    # ──────────────────────────────────────────────────────
    # STEP 4: Chunk text
    # ──────────────────────────────────────────────────────

    def _chunk_text(self, text: str, source_pdf: str, page_num: int) -> List[dict]:
        """
        Split text into overlapping word-based chunks of ~chunk_size words.
        Overlap = chunk_overlap words at start of each new chunk.
        """
        words = text.split()
        chunks = []
        step = max(1, settings.chunk_size - settings.chunk_overlap)

        for i in range(0, len(words), step):
            chunk_words = words[i : i + settings.chunk_size]
            chunk_text = " ".join(chunk_words).strip()
            # Skip tiny chunks (header noise etc.)
            if len(chunk_text) < 40:
                continue
            chunks.append({
                "text":        chunk_text,
                "source":      Path(source_pdf).name,
                "page":        page_num,
                "chunk_index": i // step,
            })
        return chunks

    # ──────────────────────────────────────────────────────
    # STEP 5-6: Embed + FAISS index
    # ──────────────────────────────────────────────────────

    def _embed(self, texts: List[str]) -> np.ndarray:
        """
        Generate L2-normalized sentence embeddings.
        Normalized vectors → inner product = cosine similarity.
        """
        return self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=len(texts) > 100,
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).astype(np.float32)

    def _build_index(self, embeddings: np.ndarray) -> faiss.IndexFlatIP:
        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)
        return index

    # ──────────────────────────────────────────────────────
    # STEP 7-8: Retrieve
    # ──────────────────────────────────────────────────────

    def retrieve(self, query: str, top_k: int | None = None) -> Tuple[List[str], float]:
        """
        Embed query → FAISS search → return (chunks, max_similarity_score).
        Returns ([], 0.0) if index is empty.
        """
        if not self._initialized or self.index is None or self.index.ntotal == 0:
            return [], 0.0

        k = min(top_k or settings.top_k_results, self.index.ntotal)
        q_emb = self.model.encode(
            [query],
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).astype(np.float32)

        distances, indices = self.index.search(q_emb, k)

        chunks, max_score = [], 0.0
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            chunks.append(self.chunks[idx])
            max_score = max(max_score, float(dist))

        return chunks, max_score

    # ──────────────────────────────────────────────────────
    # STEP 9: Build prompt
    # ──────────────────────────────────────────────────────

    def build_prompt(self, query: str, context_chunks: List[str], lang: str) -> str:
        """Assemble RAG prompt with language instruction."""
        context = "\n\n---\n\n".join(context_chunks)

        lang_map = {
            "hi": "Respond ONLY in Hindi using Devanagari script.",
            "or": "Respond ONLY in Odia using Odia script.",
            "en": "Respond in clear English.",
        }
        lang_instruction = lang_map.get(lang, "Respond in the same language as the question.")

        return f"""You are a knowledgeable assistant that answers questions based on the provided documents.
Answer based on the context below. If the answer is not clearly in the context, say:
"I don't have enough information in the provided documents to answer this accurately."
Do NOT make up information. Be helpful and detailed for technical/coding topics.
{lang_instruction}

=== CONTEXT ===
{context}

=== QUESTION ===
{query}

=== ANSWER ==="""

    # ──────────────────────────────────────────────────────
    # STEP 12: Confidence scoring
    # ──────────────────────────────────────────────────────

    def compute_confidence(self, similarity: float, num_chunks: int) -> float:
        """
        Map FAISS cosine similarity [0, 1] to a confidence score.
        Applies a small bonus for retrieving multiple chunks.
        """
        if num_chunks == 0 or similarity <= 0:
            return 0.0
        base     = min(float(similarity), 1.0)
        coverage = min(num_chunks / settings.top_k_results, 1.0) * 0.08
        return round(min(base + coverage, 1.0), 3)

    # ──────────────────────────────────────────────────────
    # Full reindex pipeline
    # ──────────────────────────────────────────────────────

    def reindex(self) -> dict:
        """
        Scan all PDFs in data/pdfs/ → chunk → embed → build FAISS.
        Saves index to disk.  Called by POST /reindex.
        """
        pdf_dir   = Path(settings.pdf_storage_path)
        pdf_files = sorted(pdf_dir.glob("*.pdf"))

        if not pdf_files:
            logger.warning("No PDFs found. Upload documents first.")
            return {"status": "no_pdfs", "chunks_indexed": 0, "documents": 0}

        logger.info(f"Reindexing {len(pdf_files)} PDF(s)…")

        all_chunks: List[str] = []
        all_meta:   List[dict] = []

        for pdf in pdf_files:
            for page_text, page_num in self._extract_text_from_pdf(str(pdf)):
                for chunk in self._chunk_text(page_text, str(pdf), page_num):
                    all_chunks.append(chunk["text"])
                    all_meta.append(chunk)

        if not all_chunks:
            return {"status": "empty_pdfs", "chunks_indexed": 0, "documents": len(pdf_files)}

        logger.info(f"Embedding {len(all_chunks)} chunks…")
        embeddings = self._embed(all_chunks)

        logger.info("Building FAISS index…")
        self.index          = self._build_index(embeddings)
        self.chunks         = all_chunks
        self.chunk_metadata = all_meta
        self._save_index()

        logger.info(f"Reindex complete: {len(all_chunks)} chunks / {len(pdf_files)} docs")
        return {
            "status":         "success",
            "chunks_indexed": len(all_chunks),
            "documents":      len(pdf_files),
        }

    # ──────────────────────────────────────────────────────
    # Persistence
    # ──────────────────────────────────────────────────────

    def _save_index(self):
        Path(settings.faiss_index_path).parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, settings.faiss_index_path + ".index")
        with open(settings.faiss_index_path + ".chunks", "wb") as f:
            pickle.dump(self.chunks, f)
        with open(settings.faiss_index_path + ".meta", "wb") as f:
            pickle.dump(self.chunk_metadata, f)
        logger.info(f"Index saved → {settings.faiss_index_path}.index")

    def _load_index(self):
        idx_path    = settings.faiss_index_path + ".index"
        chunks_path = settings.faiss_index_path + ".chunks"
        meta_path   = settings.faiss_index_path + ".meta"

        if Path(idx_path).exists() and Path(chunks_path).exists():
            try:
                self.index = faiss.read_index(idx_path)
                with open(chunks_path, "rb") as f:
                    self.chunks = pickle.load(f)
                with open(meta_path, "rb") as f:
                    self.chunk_metadata = pickle.load(f)
                logger.info(f"Loaded FAISS index: {self.index.ntotal} vectors, {len(self.chunks)} chunks")
            except Exception as e:
                logger.warning(f"Could not load existing index ({e}). Starting fresh.")
                self.index = None; self.chunks = []; self.chunk_metadata = []
        else:
            logger.info("No existing index found. Upload PDFs and call POST /reindex.")


# ── Singleton ─────────────────────────────────────────────────────────────────
rag_pipeline = RAGPipeline()
