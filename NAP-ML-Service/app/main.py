import logging
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, chat
from app.config import AUTO_TRAIN_ON_STARTUP
from app.models.knowledge_base import kb
from app.services.training import train_with_retries

log = logging.getLogger(__name__)

app = FastAPI(
    title="NAP ML Service",
    description="Custom knowledge-base QA service for the Nexus Application Portal",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(admin.router, prefix="/api", tags=["admin"])


@app.on_event("startup")
async def _startup():
    loaded = kb.load_if_exists()
    if kb.is_trained():
        log.info(
            "loaded existing index: %s chunks (trained %s)",
            kb.count(),
            kb.trained_at,
        )
        return

    if not AUTO_TRAIN_ON_STARTUP:
        log.warning(
            "no index found and AUTO_TRAIN_ON_STARTUP is off; "
            "the assistant will report that it is untrained"
        )
        return

    # The container filesystem is ephemeral, so a fresh deploy always starts
    # with an empty knowledge base. Rebuild in the background so the port is
    # accepting traffic (and the healthcheck can pass) while this runs.
    log.warning(
        "no knowledge base index found (loaded=%s); training in the background",
        loaded,
    )

    def _run():
        try:
            train_with_retries()
        except Exception:  # noqa: BLE001 - never kill the worker thread
            log.exception("background training crashed")

    threading.Thread(target=_run, name="auto-train", daemon=True).start()


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "trained": kb.is_trained(),
        "chunks": kb.count(),
        "embedding_backend": kb.embedding.backend,
        "trained_at": kb.trained_at,
    }