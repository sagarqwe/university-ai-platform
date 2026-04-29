"""
File: ai-service/services/sentiment_service.py
Purpose: Lightweight sentiment analysis for student queries.
Feature #11 — Detects frustration/satisfaction trends.
Uses keyword-based + TextBlob approach (no extra API needed).
"""

import re
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

# Negative indicators — frustration, confusion, urgency
NEGATIVE_KEYWORDS = [
    "not working", "broken", "error", "wrong", "bad", "terrible", "awful",
    "confused", "don't understand", "no idea", "frustrated", "angry",
    "useless", "waste", "stupid", "fail", "failed", "problem", "issue",
    "help me", "urgent", "emergency", "stuck", "cant", "cannot", "won't",
    "doesn't work", "समझ नहीं", "परेशान", "गलत", "नहीं मिल रहा",
]

POSITIVE_KEYWORDS = [
    "thank", "thanks", "great", "good", "helpful", "excellent", "perfect",
    "amazing", "awesome", "love", "nice", "clear", "understood", "got it",
    "धन्यवाद", "शुक्रिया", "अच्छा", "बढ़िया",
]

QUESTION_PATTERNS = [
    r'\bwhat\b', r'\bhow\b', r'\bwhen\b', r'\bwhere\b', r'\bwhy\b',
    r'\bwhich\b', r'\bcan\b', r'\bdo\b', r'\bdoes\b', r'\bis\b',
]


def analyze_sentiment(text: str) -> Tuple[str, float]:
    """
    Returns (sentiment_label, score).
    sentiment_label: POSITIVE | NEUTRAL | NEGATIVE
    score: -1.0 (most negative) to 1.0 (most positive)
    """
    if not text:
        return "NEUTRAL", 0.0

    text_lower = text.lower()

    neg_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text_lower)
    pos_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_lower)

    # Exclamation marks boost negativity if negative words present
    exclamation = text.count('!')
    question_marks = text.count('?')

    # All-caps words suggest frustration
    caps_words = len([w for w in text.split() if w.isupper() and len(w) > 2])

    neg_score = neg_count * 0.3 + caps_words * 0.2 + (exclamation * 0.1 if neg_count > 0 else 0)
    pos_score = pos_count * 0.3

    net = pos_score - neg_score

    # Clamp to [-1, 1]
    net = max(-1.0, min(1.0, net))

    if net > 0.15:
        label = "POSITIVE"
    elif net < -0.15:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"

    logger.debug(f"Sentiment: {label} ({net:.2f}) for: {text[:60]}")
    return label, round(net, 3)
