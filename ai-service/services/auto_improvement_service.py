"""
File: ai-service/services/auto_improvement_service.py
Purpose: Feature #12 — Auto-Improvement System.
Detects low-confidence query patterns and suggests missing documents / FAQ topics.
"""

import logging
from typing import List, Dict
from collections import Counter

logger = logging.getLogger(__name__)

# In-memory store for low-confidence queries (resets on restart)
# In production this would be persisted to DB
_low_confidence_queries: List[Dict] = []
_all_queries: List[str] = []


def record_query(query: str, confidence: float, language: str):
    """Called after every query to track patterns."""
    _all_queries.append(query.lower())
    if confidence < 0.45:
        _low_confidence_queries.append({
            "query": query,
            "confidence": confidence,
            "language": language,
        })
        logger.info(f"Low confidence query recorded: '{query[:60]}' ({confidence:.2f})")


def get_missing_document_suggestions() -> List[Dict]:
    """
    Analyzes low-confidence queries to suggest what documents are missing.
    Groups similar queries by topic keywords.
    """
    if not _low_confidence_queries:
        return []

    # Extract key topics from low-confidence queries
    topic_keywords = {
        "fees": ["fee", "fees", "payment", "scholarship", "tuition", "फीस", "शुल्क"],
        "admission": ["admission", "apply", "application", "entrance", "प्रवेश"],
        "exam": ["exam", "examination", "schedule", "syllabus", "परीक्षा"],
        "hostel": ["hostel", "room", "accommodation", "mess", "छात्रावास"],
        "placement": ["placement", "job", "internship", "company", "campus"],
        "library": ["library", "book", "resource", "digital", "पुस्तकालय"],
        "sports": ["sport", "game", "ground", "athletics", "खेल"],
        "transport": ["bus", "transport", "shuttle", "vehicle"],
    }

    topic_counts = Counter()
    for item in _low_confidence_queries:
        q = item["query"].lower()
        for topic, keywords in topic_keywords.items():
            if any(kw in q for kw in keywords):
                topic_counts[topic] += 1

    suggestions = []
    for topic, count in topic_counts.most_common(5):
        suggestions.append({
            "topic": topic.title(),
            "missing_queries": count,
            "suggestion": f"Upload official {topic.title()} document/circular",
            "priority": "HIGH" if count >= 3 else "MEDIUM" if count >= 1 else "LOW",
        })

    return suggestions


def get_faq_suggestions() -> List[Dict]:
    """
    Generates FAQ suggestions from most frequently asked (all) queries.
    """
    if len(_all_queries) < 3:
        return []

    # Common question starters
    patterns = {
        "What is": [],
        "How to": [],
        "When is": [],
        "Where is": [],
        "Who is": [],
    }

    for q in _all_queries:
        for pattern in patterns:
            if q.startswith(pattern.lower()):
                patterns[pattern].append(q)

    faqs = []
    for pattern, queries in patterns.items():
        if queries:
            # Pick most common variant
            counter = Counter(queries)
            top_q = counter.most_common(1)[0][0]
            faqs.append({
                "pattern": pattern,
                "example": top_q[:100],
                "frequency": len(queries),
            })

    return sorted(faqs, key=lambda x: x["frequency"], reverse=True)[:5]


def get_improvement_report() -> Dict:
    return {
        "total_queries": len(_all_queries),
        "low_confidence_count": len(_low_confidence_queries),
        "low_confidence_rate": round(len(_low_confidence_queries) / max(len(_all_queries), 1), 3),
        "missing_document_suggestions": get_missing_document_suggestions(),
        "faq_suggestions": get_faq_suggestions(),
        "recent_low_confidence": _low_confidence_queries[-5:] if _low_confidence_queries else [],
    }
