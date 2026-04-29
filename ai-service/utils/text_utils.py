"""
File: ai-service/utils/text_utils.py
Purpose: Text processing utilities shared by the RAG pipeline.
"""

import re
import unicodedata


def clean_text(text: str) -> str:
    """
    Normalise raw PDF-extracted text.
    Preserves code characters: {}, [], (), #, <>, =, /, *, &, |, ^, ~
    so that coding/technical PDFs are not stripped of their content.
    """
    if not text:
        return ""

    # Normalise unicode to NFC
    text = unicodedata.normalize("NFC", text)

    # Strip null bytes and non-printable control chars (keep newline + tab)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

    # Collapse 3+ newlines → 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Collapse inline whitespace
    text = re.sub(r'[ \t]{2,}', ' ', text)

    # Remove only truly non-printable / garbage characters
    # Keep: letters, digits, whitespace, common punctuation,
    #       code chars: {}[]()<>=!+*/\\&#@^~|%$`,;:.?'"_-
    #       Hindi (U+0900-U+097F), Odia (U+0B00-U+0B7F)
    text = re.sub(
        r'[^\w\s\.,;:!?()\[\]{}<>=+\-*/\\&#@^~|%$\'\"``\'\'_\u0900-\u097F\u0B00-\u0B7F]',
        ' ',
        text
    )

    # Collapse multiple spaces again after substitution
    text = re.sub(r' {2,}', ' ', text)

    return text.strip()


def count_tokens_approx(text: str) -> int:
    return max(1, len(text) // 4)


def truncate_to_tokens(text: str, max_tokens: int) -> str:
    max_chars = max_tokens * 4
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(' ', 1)[0]


def split_into_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?।])\s+', text)
    return [s.strip() for s in sentences if s.strip()]
