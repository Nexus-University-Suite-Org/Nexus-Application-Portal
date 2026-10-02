import json
import logging
import threading
import time

from app.config import (
    AUTO_TRAIN_ATTEMPTS,
    AUTO_TRAIN_BACKOFF_SECONDS,
    CORPUS_DIR,
    INDEX_DIR,
)
from app.models.knowledge_base import kb
from app.services.ingestion import extract_all_chunks
from app.utils import nap_client

log = logging.getLogger(__name__)

_CORPUS_FILE = CORPUS_DIR / "corpus.json"
_LOCK = threading.Lock()

STATE_FILE = INDEX_DIR / "training_state.json"


def train() -> dict:
    with _LOCK:
        chunks = extract_all_chunks()
        if not chunks:
            # Rebuilding with an empty list would wipe a working index and then
            # stamp a fresh trained_at on it, so the assistant would look
            # trained while answering nothing. Refuse and let the caller retry.
            raise RuntimeError(
                "no content retrieved from the NAP API; refusing to overwrite "
                "the existing index"
            )
        _CORPUS_FILE.write_text(
            json.dumps(chunks, ensure_ascii=False), encoding="utf-8"
        )
        stats = kb.rebuild(chunks)
        state = {
            "last_training_at": kb.trained_at,
            "chunks": kb.count(),
            "stats": stats,
        }
        STATE_FILE.write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")
        return state


def train_with_retries(attempts: int = AUTO_TRAIN_ATTEMPTS) -> dict | None:
    """Run `train`, retrying transient upstream failures.

    Content is pulled from the NAP API over the network, so a single failed
    fetch during a deploy would otherwise leave the assistant untrained until
    someone noticed and clicked the button.
    """
    last_error: Exception | None = None
    for attempt in range(1, max(attempts, 1) + 1):
        try:
            state = train()
            log.info(
                "knowledge base trained: %s chunks (%s)",
                state.get("chunks"),
                state.get("stats", {}).get("backend"),
            )
            return state
        except Exception as exc:  # noqa: BLE001 - retried, then reported
            last_error = exc
            log.warning(
                "training attempt %s/%s failed: %s", attempt, attempts, exc
            )
            if attempt < attempts:
                time.sleep(AUTO_TRAIN_BACKOFF_SECONDS)
    log.error("giving up on automatic training: %s", last_error)
    return None


def training_status() -> dict:
    return {
        "trained_at": kb.trained_at,
        "trained": kb.is_trained(),
        "chunks": kb.count(),
        "embedding_backend": kb.embedding.backend,
        "embedding_model": kb.embedding.model_name,
        "store_backend": kb.store_backend,
        "stats": kb.stats,
    }


def available_sources() -> dict:
    collections = [
        "news",
        "events",
        "gallery",
        "faqs",
        "alumni",
        "partners",
        "scholarships",
        "student_stories",
        "legal_pages",
        "quick_links",
        "courses",
        "faculty",
        "page_sections",
        "programs",
        "site_settings",
    ]
    payloads = nap_client.fetch_all_collections(collections)
    counts = {}
    for collection, payload in payloads.items():
        if isinstance(payload, list):
            counts[collection] = {"available": True, "records": len(payload)}
        elif isinstance(payload, dict):
            counts[collection] = {
                "available": True,
                "records": len(payload),
            }
        else:
            counts[collection] = {"available": False, "records": 0}
    return counts