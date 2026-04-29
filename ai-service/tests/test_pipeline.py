"""
File: ai-service/tests/test_pipeline.py
Purpose: Unit tests for RAG pipeline logic that doesn't require GPU/FAISS/LLM.
Run with: pytest tests/ -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.text_utils import clean_text, count_tokens_approx, split_into_sentences
from services.rag_pipeline import RAGPipeline


class TestTextUtils:
    def test_clean_removes_null_bytes(self):
        assert "\x00" not in clean_text("hello\x00world")

    def test_clean_collapses_whitespace(self):
        result = clean_text("hello   world")
        assert "  " not in result

    def test_clean_preserves_hindi(self):
        hindi = "विश्वविद्यालय में प्रवेश"
        result = clean_text(hindi)
        assert "विश्वविद्यालय" in result

    def test_clean_preserves_odia(self):
        odia = "ବିଶ୍ୱବିଦ୍ୟାଳୟ"
        result = clean_text(odia)
        assert len(result) > 0

    def test_token_count_non_zero(self):
        assert count_tokens_approx("hello world") > 0

    def test_sentence_split_english(self):
        text = "The fee is 50000. Admission closes in July. Apply online."
        sentences = split_into_sentences(text)
        assert len(sentences) == 3

    def test_sentence_split_hindi(self):
        text = "शुल्क 50000 है। प्रवेश जुलाई में बंद होता है।"
        sentences = split_into_sentences(text)
        assert len(sentences) >= 2


class TestRAGPipeline:
    def setup_method(self):
        self.pipeline = RAGPipeline()

    def test_chunking_basic(self):
        text = " ".join([f"word{i}" for i in range(500)])
        chunks = self.pipeline._chunk_text(text, "test.pdf", 1)
        assert len(chunks) > 1
        assert all(isinstance(c["text"], str) for c in chunks)
        assert all(c["source"] == "test.pdf" for c in chunks)

    def test_chunking_skips_tiny_chunks(self):
        tiny_text = "hi there"
        chunks = self.pipeline._chunk_text(tiny_text, "test.pdf", 1)
        # Should produce 0 chunks — too small
        assert len(chunks) == 0

    def test_confidence_zero_when_no_chunks(self):
        score = self.pipeline.compute_confidence(0.9, 0)
        assert score == 0.0

    def test_confidence_max_one(self):
        score = self.pipeline.compute_confidence(1.0, 5)
        assert 0.0 <= score <= 1.0

    def test_confidence_increases_with_chunks(self):
        s1 = self.pipeline.compute_confidence(0.7, 1)
        s5 = self.pipeline.compute_confidence(0.7, 5)
        assert s5 >= s1

    def test_retrieve_returns_empty_when_not_initialized(self):
        chunks, score = self.pipeline.retrieve("test query")
        assert chunks == []
        assert score == 0.0

    def test_build_prompt_contains_query(self):
        prompt = self.pipeline.build_prompt(
            query="What is the fee?",
            context_chunks=["The fee is INR 50,000 per year."],
            lang="en"
        )
        assert "What is the fee?" in prompt
        assert "INR 50,000" in prompt

    def test_build_prompt_hindi_instruction(self):
        prompt = self.pipeline.build_prompt("शुल्क क्या है?", ["Fee is 50000"], "hi")
        assert "Hindi" in prompt or "Devanagari" in prompt
