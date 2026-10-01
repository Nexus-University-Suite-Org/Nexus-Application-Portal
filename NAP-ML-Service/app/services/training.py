import json
import threading

from app.config import CORPUS_DIR, INDEX_DIR
from app.models.knowledge_base import kb
from app.services.ingestion import extract_all_chunks
from app.utils import nap_client

_CORPUS_FILE = CORPUS_DIR / "corpus.json"
_LOCK = threading.Lock()

STATE_FILE = INDEX_DIR / "training_state.json"


def train() -> dict:
    with _LOCK:
        chunks = extract_all_chunks()
        if chunks:
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