from typing import Dict, List

from app.config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    CONTENT_COLLECTIONS,
    PORTAL_NAME,
)
from app.utils import chunking
from app.utils import nap_client


def _records_from_payload(payload):
    if isinstance(payload, dict):
        if "settingKey" in payload and "settingValue" in payload:
            return [payload]
        for value in payload.values():
            if isinstance(value, list):
                return value
        return [payload]
    if isinstance(payload, list):
        return payload
    return []


def _site_settings_chunks(settings: Dict) -> List[Dict]:
    if isinstance(settings, dict):
        pairs = [
            {
                "settingKey": str(key),
                "settingValue": str(value) if value is not None else "",
            }
            for key, value in settings.items()
            if str(value).strip()
        ]
    elif isinstance(settings, list):
        pairs = [
            {
                "settingKey": str(item.get("settingKey") or item.get("key") or "setting"),
                "settingValue": str(item.get("settingValue") or item.get("value") or ""),
            }
            for item in settings
            if isinstance(item, dict)
        ]
    else:
        pairs = []

    chunks = []
    for idx, pair in enumerate(pairs):
        text = f"Site setting {pair['settingKey']}: {pair['settingValue']}"
        chunked = chunking.chunk_text(text, CHUNK_SIZE, CHUNK_OVERLAP)
        for sub_idx, piece in enumerate(chunked):
            chunks.append(
                {
                    "id": f"site_settings:{idx}:{sub_idx}",
                    "text": piece,
                    "metadata": {
                        "collection": "site_settings",
                        "title": f"{PORTAL_NAME} – {pair['settingKey'].replace('_', ' ')}",
                        "entity_id": pair["settingKey"],
                    },
                }
            )
    return chunks


def _program_chunks(program: Dict, index: int, source: str) -> List[Dict]:
    title = (
        program.get("programName")
        or program.get("name")
        or program.get("title")
        or f"{source} #{index + 1}"
    )
    record = dict(program)
    record["programName"] = title

    fields = list(chunking._iter_fields(record))
    if not fields:
        return []

    full = " / ".join(f"{chunking._label(k)}: {v}" for k, v in fields)
    chunks = []
    for sub_idx, piece in enumerate(
        chunking.chunk_text(full, CHUNK_SIZE, CHUNK_OVERLAP)
    ):
        chunks.append(
            {
                "id": f"{source}:{index}:{sub_idx}",
                "text": piece,
                "metadata": {
                    "collection": source,
                    "title": str(title),
                    "entity_id": program.get("id"),
                },
            }
        )
    return chunks


def extract_all_chunks() -> List[Dict]:
    chunks: List[Dict] = []

    collections = nap_client.fetch_all_collections(CONTENT_COLLECTIONS)
    for collection, payload in collections.items():
        records = _records_from_payload(payload)
        for idx, record in enumerate(records):
            chunks.extend(
                chunking.record_to_chunks(
                    record, collection, idx, CHUNK_SIZE, CHUNK_OVERLAP
                )
            )

    settings = nap_client.fetch_site_settings()
    chunks.extend(_site_settings_chunks(settings))

    programs = nap_client.fetch_programs()
    for idx, program in enumerate(programs):
        chunks.extend(_program_chunks(program, idx, "programs"))

    schemes = nap_client.fetch_schemes()
    for idx, scheme in enumerate(schemes):
        chunks.extend(
            chunking.record_to_chunks(scheme, "schemes", idx, CHUNK_SIZE, CHUNK_OVERLAP)
        )

    return chunks