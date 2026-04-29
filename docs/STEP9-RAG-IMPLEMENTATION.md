# STEP 9 — RAG Implementation Guide

## How the RAG Pipeline Works

RAG = Retrieval Augmented Generation.
Instead of relying on LLM training data, answers come from actual university PDFs.

## Complete 13-Step Pipeline

```
DOCUMENT INGESTION (runs once on POST /reindex)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  STEP 1: Load all *.pdf from ai-service/data/pdfs/        │
│          using PyMuPDF (fitz.open)                        │
│                                                            │
│  STEP 2: Extract text per page                            │
│          page.get_text("text") → raw string               │
│                                                            │
│  STEP 3: Clean text                                       │
│          • Remove null bytes, control chars               │
│          • Preserve Devanagari (U+0900–U+097F) for Hindi  │
│          • Preserve Odia (U+0B00–U+0B7F) script          │
│          • Collapse whitespace                            │
│                                                            │
│  STEP 4: Chunk text                                       │
│          • Window size: 400 words                         │
│          • Overlap: 50 words (prevents answer split)      │
│          • Minimum chunk: 30 words (skip tiny fragments)  │
│          • Each chunk carries: text, source, page_num     │
│                                                            │
│  STEP 5: Generate embeddings                              │
│          all-MiniLM-L6-v2 (384-dim vectors)               │
│          model.encode(chunks, normalize_embeddings=True)  │
│                                                            │
│  STEP 6: Build FAISS index                                │
│          faiss.IndexFlatIP (inner product)                │
│          L2-normalized vectors → cosine similarity        │
│          index.add(np.array(embeddings))                  │
│                                                            │
│  STEP 7: Persist to disk                                  │
│          data/faiss_index.index  (FAISS binary)           │
│          data/faiss_index.chunks (pickled chunk texts)    │
│          data/faiss_index.meta   (pickled metadata)       │
└────────────────────────────────────────────────────────────┘

QUERY TIME (runs on every POST /ask)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  STEP 8: Embed the query                                  │
│          model.encode([query], normalize_embeddings=True) │
│                                                            │
│  STEP 9: Search FAISS                                     │
│          index.search(query_vec, k=5)                     │
│          Returns: (distances, indices)                    │
│          max_similarity = max(distances[0])               │
│                                                            │
│  STEP 10: Retrieve top-5 chunk texts                      │
│           chunks[idx] for idx in indices[0]               │
│                                                            │
│  STEP 11: Compute confidence score                        │
│           base_score = max cosine similarity              │
│           coverage   = min(num_chunks/top_k, 1.0) × 0.08 │
│           confidence = min(base + coverage, 1.0)          │
│                                                            │
│  STEP 12: Hallucination gate                              │
│           IF confidence < 0.45:                           │
│             return fallback message in user's language    │
│           ELSE: continue                                  │
│                                                            │
│  STEP 13: Build prompt + call LLM                         │
│           Prompt template:                                │
│           "You are an official university assistant.      │
│            Answer ONLY from context below.               │
│            Do NOT make up information.                   │
│            Respond in [English/Hindi/Odia].              │
│            === CONTEXT ===                               │
│            {top-5 chunks joined with ---}                │
│            === QUESTION ===                              │
│            {user query}                                  │
│            === ANSWER ==="                              │
│                                                            │
│           → Gemini 1.5 Flash or OpenAI GPT-4o            │
│           → Return: answer, confidence, detected_language │
└────────────────────────────────────────────────────────────┘
```

## Embedding Model Details

| Property | Value |
|----------|-------|
| Model | `all-MiniLM-L6-v2` |
| Dimensions | 384 |
| Download size | ~90MB |
| Speed | ~14k sentences/sec on CPU |
| Multilingual | No — but handles Hindi/Odia characters in text |

For better Hindi/Odia support in production, swap with:
```python
# In .env:
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
# 12-language model, 384-dim, ~120MB
```

## FAISS Index Type

`IndexFlatIP` (Inner Product) on L2-normalized vectors = **cosine similarity**.

- Exact (not approximate) — best for < 100k vectors
- No training required
- Vectors must be L2-normalized before adding (`normalize_embeddings=True`)

## Chunking Strategy

```
Original PDF page text:
"The fee structure for B.Tech is as follows: First year: ₹45,000. Second year:
₹47,000. Third year: ₹50,000. Fourth year: ₹50,000. Hostel fee: ₹25,000/year..."

Chunks (400 words, 50-word overlap):
Chunk 1: "The fee structure for B.Tech is as follows: First year: ₹45,000. Second year:..."
          ← includes fee table fully
Chunk 2: "...Fourth year: ₹50,000. Hostel fee: ₹25,000/year. Mess charges..."
          ← overlaps with last 50 words of chunk 1
```

Overlap prevents an answer being split across chunk boundaries.

## Confidence Threshold Tuning

Edit `ai-service/.env`:
```env
CONFIDENCE_THRESHOLD=0.45   # lower = more answers, higher hallucination risk
                             # higher = fewer answers, safer
TOP_K_RESULTS=5              # more chunks = better recall, slower
CHUNK_SIZE=400               # larger = more context, lower specificity
CHUNK_OVERLAP=50
```

## Adding New PDF Documents

```bash
# Method 1: Direct file copy
cp new-document.pdf ai-service/data/pdfs/
curl -X POST http://localhost:8000/reindex

# Method 2: Via Admin Dashboard
# 1. Login as admin@university.edu
# 2. Click Upload PDF
# 3. Click Reindex
```

Spring Boot `AiFileSyncConfig` auto-copies PDFs from `uploads/pdfs/` to `ai-service/data/pdfs/` on startup.
