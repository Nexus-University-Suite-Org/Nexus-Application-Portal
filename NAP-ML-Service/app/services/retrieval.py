import re
from typing import List, Tuple

from app.config import TOP_K_DEFAULT
from app.models.knowledge_base import kb

_CHUNK = dict
_SCORED = Tuple[_CHUNK, float]

_CONTACT_KEYWORDS = re.compile(
    r"(?i)\b(contact|contacts|email|e-mail|e mail|phone|phones|number|numbers|"
    r"tel|telephone|hotline|line|whatsapp|cell|mobile|reach|reach us|get in touch|"
    r"talk to|address|location|located|where (are|is) you|how do i (reach|contact)|"
    r"call us|phone us|sms|dial|get a hold|footer|foot\b)\b"
)
_CONTACT_HINTS = ("footer_email", "footer_phone", "footer_address",
                  "setting key: footer_", "setting value:", "gabula road",
                  "footer_email ", "footer_phone ", "footer_address ")


def _is_contact_query(query: str) -> bool:
    return bool(_CONTACT_KEYWORDS.search(query))


def _is_contact_chunk(chunk: _CHUNK) -> bool:
    meta = chunk.get("metadata", {}) or {}
    if meta.get("collection") != "site_settings":
        return False
    text = chunk.get("text", "") or ""
    return any(hint in text.lower() for hint in _CONTACT_HINTS)


def _contact_chunks() -> List[_CHUNK]:
    return [c for c in kb.chunks if _is_contact_chunk(c)]


def retrieve(query: str, top_k: int = TOP_K_DEFAULT) -> List[_SCORED]:
    expanded_top_k = max(top_k, TOP_K_DEFAULT)
    hits = kb.query(query, expanded_top_k)
    if not hits:
        return []
    min_score = hits[0][1] * 0.15 if hits[0][1] > 0 else -1.0
    ranked = [h for h in hits if h[1] >= min_score][:top_k]
    ranked = ranked or hits[:top_k]

    if _is_contact_query(query):
        promoted = [c for c in _contact_chunks() if c.get("id") not in {h[0].get("id") for h in ranked}]
        if promoted:
            ranked = [(c, 1.0) for c in promoted] + ranked
            ranked = ranked[:max(top_k, TOP_K_DEFAULT)]

    return ranked[:top_k]
