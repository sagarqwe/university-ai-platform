"""
File: ai-service/services/llm_service.py
Purpose: Abstraction layer for LLM providers — OpenAI, Gemini, and Groq.
"""

import logging
from typing import Optional
from config.settings import settings

logger = logging.getLogger(__name__)


class LLMService:

    def __init__(self):
        self.provider = settings.llm_provider.lower()
        self._openai_client = None
        self._gemini_model = None
        self._groq_client = None

    def initialize(self):
        if self.provider == "openai":
            self._init_openai()
        elif self.provider == "gemini":
            self._init_gemini()
        elif self.provider == "groq":
            self._init_groq()
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}. Use 'openai', 'gemini', or 'groq'.")
        logger.info(f"LLM service initialized: provider={self.provider}")

    def _init_openai(self):
        try:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
            logger.info("OpenAI client initialized.")
        except Exception as e:
            logger.error(f"OpenAI init failed: {e}")
            raise

    def _init_gemini(self):
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.gemini_api_key)
            self._gemini_model = genai.GenerativeModel(settings.gemini_model)
            logger.info(f"Gemini model loaded: {settings.gemini_model}")
        except Exception as e:
            logger.error(f"Gemini init failed: {e}")
            raise

    def _init_groq(self):
        try:
            from groq import Groq
            self._groq_client = Groq(api_key=settings.groq_api_key)
            logger.info(f"Groq client initialized: model={settings.groq_model}")
        except Exception as e:
            logger.error(f"Groq init failed: {e}")
            raise

    def generate(self, prompt: str, max_tokens: int = 1024) -> Optional[str]:
        try:
            if self.provider == "openai":
                return self._generate_openai(prompt, max_tokens)
            elif self.provider == "gemini":
                return self._generate_gemini(prompt)
            elif self.provider == "groq":
                return self._generate_groq(prompt, max_tokens)
        except Exception as e:
            logger.error(f"LLM generation error ({self.provider}): {e}")
            return None

    def _generate_openai(self, prompt: str, max_tokens: int) -> str:
        response = self._openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    def _generate_gemini(self, prompt: str) -> str:
        response = self._gemini_model.generate_content(
            prompt,
            generation_config={"temperature": 0.3, "max_output_tokens": 1024}
        )
        return response.text.strip()

    def _generate_groq(self, prompt: str, max_tokens: int) -> str:
        response = self._groq_client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()


llm_service = LLMService()
