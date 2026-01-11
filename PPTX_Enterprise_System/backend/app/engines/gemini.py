import logging
import time
from typing import Optional

from google import genai

from app.engines.base import TranslationEngine

logger = logging.getLogger(__name__)


class GeminiEngine(TranslationEngine):
    def __init__(self, api_key: Optional[str]) -> None:
        if not api_key:
            logger.warning("GEMINI_API_KEY is missing; Gemini translations will be no-op.")
            self.client = None
        else:
            self.client = genai.Client(api_key=api_key)

    def translate_text(self, text: str, src: str, tgt: str) -> str:
        if not self.client:
            return text

        prompt = (
            "Translate the following text from "
            f"{src} to {tgt}. Only return the translated text.\n\n{text}"
        )

        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )
                return response.text or text
            except Exception as exc:  # noqa: BLE001
                message = str(exc)
                if "429" in message and attempt < 2:
                    backoff = 2 ** attempt
                    logger.warning("Rate limited by Gemini, retrying in %s seconds", backoff)
                    time.sleep(backoff)
                    continue
                logger.exception("Gemini translation failed: %s", exc)
                return text

        return text
