FROM python:3.11-slim

# Increase pip timeout for slow connections
ENV PIP_DEFAULT_TIMEOUT=300
ENV PIP_RETRIES=5

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libglib2.0-0 wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install in small batches to avoid network timeouts
RUN pip install --no-cache-dir --timeout=300 \
    fastapi==0.111.0 uvicorn[standard]==0.30.1 \
    python-multipart==0.0.9 pydantic==2.7.1 \
    pydantic-settings==2.3.0 python-dotenv==1.0.1

RUN pip install --no-cache-dir --timeout=300 \
    PyMuPDF==1.24.5 langdetect==1.0.9 \
    deep-translator==1.11.4 httpx==0.27.0

RUN pip install --no-cache-dir --timeout=300 \
    numpy==1.26.4

RUN pip install --no-cache-dir --timeout=300 \
    sentence-transformers==3.0.1

RUN pip install --no-cache-dir --timeout=300 \
    faiss-cpu==1.8.0

RUN pip install --no-cache-dir --timeout=300 \
    groq>=0.4.0 openai==1.35.7

# Pre-download embedding model at build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .
RUN mkdir -p /app/data/pdfs /app/data

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
