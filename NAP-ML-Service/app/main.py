from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, chat
from app.models.knowledge_base import kb

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
    kb.load_if_exists()


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "trained": kb.is_trained(),
        "chunks": kb.count(),
        "embedding_backend": kb.embedding.backend,
        "trained_at": kb.trained_at,
    }