"""
File: ai-service/tests/test_api.py
Purpose: Integration tests for FastAPI endpoints using httpx TestClient.
Does NOT call real LLM — tests endpoint routing and validation only.
Run with: pytest tests/test_api.py -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    def test_health_returns_ok_structure(self):
        # Patch heavy services to avoid loading models in test
        with patch("services.rag_pipeline.rag_pipeline") as mock_rag, \
             patch("services.llm_service.llm_service") as mock_llm:

            mock_rag._initialized = True
            mock_rag.index = MagicMock()
            mock_rag.index.ntotal = 0
            mock_rag.chunks = []

            from main import app
            client = TestClient(app, raise_server_exceptions=False)
            response = client.get("/health")

            assert response.status_code == 200
            data = response.json()
            assert "status" in data
            assert "llm_provider" in data
            assert "chunks_indexed" in data


class TestAskEndpointValidation:
    def test_empty_query_rejected(self):
        with patch("services.rag_pipeline.rag_pipeline"), \
             patch("services.llm_service.llm_service"):
            from main import app
            client = TestClient(app, raise_server_exceptions=False)
            response = client.post("/ask", json={"query": ""})
            # Pydantic min_length=1 → 422
            assert response.status_code == 422

    def test_invalid_language_rejected(self):
        with patch("services.rag_pipeline.rag_pipeline"), \
             patch("services.llm_service.llm_service"):
            from main import app
            client = TestClient(app, raise_server_exceptions=False)
            response = client.post("/ask", json={"query": "test", "language": "fr"})
            assert response.status_code == 422
