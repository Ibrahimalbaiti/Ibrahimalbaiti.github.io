import importlib.util
import io
import logging
from typing import Any

from PIL import Image

logger = logging.getLogger(__name__)


class VisionEngine:
    _ocr_model = None
    _table_detector = None

    def __init__(self) -> None:
        if VisionEngine._ocr_model is None:
            VisionEngine._ocr_model = self._load_ocr_model()
        if VisionEngine._table_detector is None:
            VisionEngine._table_detector = self._load_table_detector()

    def _load_ocr_model(self):
        if importlib.util.find_spec("surya.ocr") is not None:
            from surya.ocr import SuryaOCR

            logger.info("Loading Surya OCR model")
            return SuryaOCR()
        if importlib.util.find_spec("pytesseract") is not None:
            import pytesseract

            logger.warning("Surya OCR unavailable, falling back to Tesseract")
            return pytesseract
        logger.error("No OCR backend available")
        return None

    def _load_table_detector(self):
        if importlib.util.find_spec("transformers") is not None:
            from transformers import pipeline

            logger.info("Loading table transformer model")
            return pipeline(
                "object-detection",
                model="microsoft/table-transformer-detection",
                device=-1,
            )
        logger.warning("Table detector unavailable")
        return None

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        if not self._ocr_model:
            return ""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        if hasattr(self._ocr_model, "predict"):
            return self._ocr_model.predict(image)
        return self._ocr_model.image_to_string(image)

    def detect_table_structure(self, image_bytes: bytes) -> dict[str, Any]:
        if not self._table_detector:
            return {"tables": []}
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = self._table_detector(image)
        return {"tables": results}
