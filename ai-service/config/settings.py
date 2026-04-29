"""
File: ai-service/config/settings.py
Purpose: Centralized configuration using pydantic-settings.
Reads from .env file automatically.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # LLM Provider
    llm_provider: str = "gemini"  # "openai" or "gemini"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Groq (free tier, generous limits)
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"

    # Embedding
    embedding_model: str = "all-MiniLM-L6-v2"

    # Storage
    faiss_index_path: str = "./data/faiss_index"
    pdf_storage_path: str = "./data/pdfs"

    # RAG
    chunk_size: int = 200
    chunk_overlap: int = 30
    top_k_results: int = 5
    confidence_threshold: float = 0.25

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure data directories exist on import
Path(settings.pdf_storage_path).mkdir(parents=True, exist_ok=True)
Path(settings.faiss_index_path).parent.mkdir(parents=True, exist_ok=True)
