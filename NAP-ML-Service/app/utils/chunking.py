import re
from typing import Dict, List

_STRIP_KEY = re.compile(r"(\b(id|createdAt|updatedAt|created_at|updated_at)\b)", re.IGNORECASE)
_DROP_KEYS = {"id", "createdAt", "updatedAt", "created_at", "updated_at", "deletedAt", "deleted_at", "status"}


def _to_text(value, key: str = "") -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return key if value else ""
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        parts = [
            _to_text(v, k)
            for k, v in value.items()
            if not re.fullmatch(_DROP_KEYS_re(), str(k))
        ]
        return ", ".join(p for p in parts if p)
    if isinstance(value, (list, tuple)):
        return "; ".join(p for p in (_to_text(v, key) for v in value) if p)
    return str(value).strip()


def _DROP_KEYS_re() -> str:
    return "id|createdAt|updatedAt|created_at|updated_at|deletedAt|deleted_at|status|password|passwordHash"


def _label(key: str) -> str:
    return re.sub(r"([a-z])([A-Z])", r"\1 \2", str(key)).replace("_", " ").replace("  ", " ").strip()


def _iter_fields(record):
    if isinstance(record, dict):
        for key, value in record.items():
            if str(key).lower() in {k.lower() for k in _DROP_KEYS} or re.match(_STRIP_KEY, str(key)):
                continue
            text = _to_text(value)
            if text:
                yield (str(key), text)
    elif isinstance(record, (list, tuple)):
        for idx, item in enumerate(record):
            for key, text in _iter_fields(item):
                yield (f"{key}", text)


def _pick_title(record) -> str:
    if isinstance(record, dict):
        for key in ("title", "name", "programName", "settingKey", "question", "heading", "pageKey", "fullName"):
            if record.get(key):
                return str(record[key])
    return ""


def chunk_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= chunk_size:
        return [text] if text else []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = max(start + chunk_size - overlap, start + 1)
    return chunks


def record_to_chunks(
    record,
    collection: str,
    index: int,
    chunk_size: int,
    overlap: int,
) -> List[Dict]:
    title = _pick_title(record) or f"{collection} #{index + 1}"
    fields = list(_iter_fields(record))
    if not fields:
        return []

    text = " / ".join(f"{_label(k)}: {v}" for k, v in fields)
    chunks = []

    for chunk_idx, piece in enumerate(chunk_text(text, chunk_size, overlap)):
        chunks.append(
            {
                "id": f"{collection}:{index}:{chunk_idx}",
                "text": piece,
                "metadata": {
                    "collection": collection,
                    "title": title,
                    "entity_id": record.get("id") if isinstance(record, dict) else None,
                },
            }
        )
    return chunks