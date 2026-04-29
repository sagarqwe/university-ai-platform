"""
File: ai-service/utils/validators.py
Purpose: Input validation helpers called by routers before processing.
"""

from pathlib import Path


def validate_pdf_filename(filename: str) -> bool:
    """Check file extension is .pdf (case-insensitive)."""
    return filename.lower().endswith(".pdf")


def sanitize_query(query: str, max_length: int = 2000) -> str:
    """
    Strip leading/trailing whitespace and enforce max length.
    Returns sanitized query string.
    """
    q = query.strip()
    if len(q) > max_length:
        q = q[:max_length]
    return q


def is_meaningful_query(query: str, min_chars: int = 3) -> bool:
    """Return False for trivially short or whitespace-only queries."""
    return len(query.strip()) >= min_chars
