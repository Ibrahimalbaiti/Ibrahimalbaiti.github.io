from abc import ABC, abstractmethod


class TranslationEngine(ABC):
    @abstractmethod
    def translate_text(self, text: str, src: str, tgt: str) -> str:
        raise NotImplementedError
