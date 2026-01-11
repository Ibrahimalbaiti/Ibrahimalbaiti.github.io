import logging
import os
from pathlib import Path
from typing import Optional

import ctranslate2
import sentencepiece as spm
from huggingface_hub import snapshot_download

from app.engines.base import TranslationEngine

logger = logging.getLogger(__name__)


class NLLBEngine(TranslationEngine):
    def __init__(self, model_dir: str = "/app/data/models/nllb") -> None:
        self.model_dir = model_dir
        self._translator: Optional[ctranslate2.Translator] = None
        self._sp: Optional[spm.SentencePieceProcessor] = None
        self._ensure_model()

    def _ensure_model(self) -> None:
        Path(self.model_dir).mkdir(parents=True, exist_ok=True)
        if not any(Path(self.model_dir).iterdir()):
            self.download_model()
        if not self._translator:
            self._translator = ctranslate2.Translator(self.model_dir, device="cpu")
        if not self._sp:
            spm_path = os.path.join(self.model_dir, "sentencepiece.bpe.model")
            self._sp = spm.SentencePieceProcessor(model_file=spm_path)

    def download_model(self) -> None:
        logger.info("Downloading NLLB model to %s", self.model_dir)
        snapshot_download(
            repo_id="michaelfeil/ct2fast-nllb-200-distilled-600M",
            local_dir=self.model_dir,
            local_dir_use_symlinks=False,
        )

    def _lang_token(self, code: str) -> str:
        if code.startswith("__") and code.endswith("__"):
            return code
        return f"__{code}__"

    def translate_text(self, text: str, src: str, tgt: str) -> str:
        if not text.strip():
            return text
        self._ensure_model()
        assert self._translator
        assert self._sp
        src_token = self._lang_token(src)
        tgt_token = self._lang_token(tgt)
        tokens = self._sp.encode(text, out_type=str)
        tokens = [src_token] + tokens
        results = self._translator.translate_batch([
            tokens
        ], target_prefix=[[tgt_token]])
        translated_tokens = results[0].hypotheses[0]
        if translated_tokens and translated_tokens[0] == tgt_token:
            translated_tokens = translated_tokens[1:]
        return self._sp.decode(translated_tokens)
