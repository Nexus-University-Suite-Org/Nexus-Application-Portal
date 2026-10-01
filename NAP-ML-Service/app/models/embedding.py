import math
import re
from collections import Counter
from typing import List

import numpy as np

from app.config import EMBEDDING_MODEL_NAME

_TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")


def _tokenize(text: str) -> List[str]:
    return _TOKEN_RE.findall(text.lower())


class TfidfEmbedder:
    def __init__(self):
        self.vocab: dict = {}
        self.idf: np.ndarray | None = None
        self.fitted = False

    def fit(self, texts):
        doc_freq = Counter()
        for text in texts:
            tokens = set(_tokenize(text))
            for tok in tokens:
                doc_freq[tok] += 1
        self.vocab = {tok: idx for idx, (tok, _) in enumerate(doc_freq.items())}
        n_docs = max(len(texts), 1)
        parts = [math.log((1 + n_docs) / (1 + freq)) + 1.0 for tok, freq in doc_freq.items()]
        self.idf = np.asarray(parts, dtype="float32")
        self.fitted = True

    def transform(self, texts) -> np.ndarray:
        if not self.fitted:
            return np.zeros((len(texts), 1), dtype="float32")
        rows = []
        for text in texts:
            counts = Counter(_tokenize(text))
            row = np.zeros(len(self.vocab), dtype="float32")
            for tok, count in counts.items():
                idx = self.vocab.get(tok)
                if idx is not None:
                    row[idx] = (1 + math.log(count)) * self.idf[idx]
            rows.append(row)
        matrix = np.asarray(rows, dtype="float32")
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms


class EmbeddingModel:
    def __init__(self, lazy: bool = True):
        self._lazy = lazy
        self._initialized = False
        self._backend = "pending"
        self._sentence_model = None
        self._tfidf = TfidfEmbedder()

    def ensure_initialized(self) -> None:
        if self._initialized:
            return
        try:
            from sentence_transformers import SentenceTransformer

            self._sentence_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            self._backend = "sentence-transformers"
        except Exception:
            self._backend = "tfidf"
        self._initialized = True

    @property
    def backend(self) -> str:
        return self._backend if self._initialized else "pending"

    @property
    def model_name(self) -> str:
        if self.backend == "sentence-transformers":
            return EMBEDDING_MODEL_NAME
        if self.backend == "tfidf":
            return "builtin-tfidf"
        return ""

    def fit(self, texts) -> None:
        if self.backend == "tfidf":
            self._tfidf.fit(texts)

    def encode(self, texts, batch_size: int = 64) -> np.ndarray:
        self.ensure_initialized()
        if self.backend == "tfidf":
            return self._tfidf.transform(list(texts))
        vectors = self._sentence_model.encode(
            list(texts),
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return np.asarray(vectors, dtype="float32")