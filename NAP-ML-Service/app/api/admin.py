import anyio

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.training import available_sources, train, training_status
from app.utils.auth import require_admin_token

router = APIRouter()


class TrainResponse(BaseModel):
    trained_at: str
    chunks: int
    stats: dict


@router.get("/status")
async def status():
    status = training_status()
    return {
        "backend": "nap-ml-service",
        "version": "1.0.0",
        "trained": status["trained"],
        "trained_at": status["trained_at"],
        "chunks": status["chunks"],
        "embedding_backend": status["embedding_backend"],
        "embedding_model": status["embedding_model"],
        "store_backend": status["store_backend"],
        "stats": status["stats"],
    }


@router.post("/train", response_model=TrainResponse)
async def train_endpoint(_: None = Depends(require_admin_token)):
    try:
        result = await anyio.to_thread.run_sync(train)
        return TrainResponse(
            trained_at=result.get("last_training_at")
            or result.get("trained_at")
            or "",
            chunks=result.get("chunks", 0),
            stats=result.get("stats", {}),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/sources")
async def sources(_: None = Depends(require_admin_token)):
    found = await anyio.to_thread.run_sync(available_sources)
    collections = training_status().get("stats", {}).get("collections") or {}
    return {"available": found, "indexed": collections}