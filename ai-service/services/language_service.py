"""
File: ai-service/services/language_service.py
Purpose: Language detection + translation for multilingual support.
Feature #3 & #6 — Detect → Translate to English → Process → Translate back

Translation flow:
  1. Detect query language (langdetect)
  2. If Hindi/Odia: translate query to English for FAISS search
  3. LLM generates answer in English
  4. Translate answer back to original language
"""

import logging
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

DetectorFactory.seed = 42
logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "or": "Odia",
}

# deep_translator language codes
TRANSLATOR_CODES = {
    "hi": "hi",
    "or": "or",  # Odia support varies; fallback to English if fails
    "en": "en",
}


def detect_language(text: str) -> str:
    """Detect query language. Returns 'en', 'hi', or 'or'."""
    if not text or len(text.strip()) < 3:
        return "en"
    try:
        detected = detect(text)
        if detected in SUPPORTED_LANGUAGES:
            return detected
        if detected in ("od", "or"):
            return "or"
        return "en"
    except LangDetectException as e:
        logger.warning(f"Language detection failed: {e}. Defaulting to 'en'.")
        return "en"


def get_language_name(code: str) -> str:
    return SUPPORTED_LANGUAGES.get(code, "English")


def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text from source_lang to English.
    Used to translate Hindi/Odia queries before FAISS search.
    Returns original text if translation fails or source is already English.
    """
    if source_lang == "en" or not text:
        return text
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source=source_lang, target="en").translate(text)
        logger.info(f"Translated query from {source_lang} to en: '{text[:40]}' → '{translated[:40]}'")
        return translated if translated else text
    except Exception as e:
        logger.warning(f"Translation to English failed ({source_lang}→en): {e}. Using original.")
        return text


def translate_from_english(text: str, target_lang: str) -> str:
    """
    Translate English text to target_lang.
    Used to translate LLM answer back to user's language.
    Returns original text if translation fails or target is English.
    """
    if target_lang == "en" or not text:
        return text
    try:
        from deep_translator import GoogleTranslator
        # Split long text into chunks (GoogleTranslator has 5000 char limit)
        if len(text) > 4500:
            chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
            translated_chunks = []
            for chunk in chunks:
                t = GoogleTranslator(source="en", target=target_lang).translate(chunk)
                translated_chunks.append(t if t else chunk)
            translated = " ".join(translated_chunks)
        else:
            translated = GoogleTranslator(source="en", target=target_lang).translate(text)
        
        logger.info(f"Translated answer from en to {target_lang}")
        return translated if translated else text
    except Exception as e:
        logger.warning(f"Translation from English failed (en→{target_lang}): {e}. Using English.")
        return text
