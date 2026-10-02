import re
from typing import List, Tuple

from app.config import MIN_HIT_COVERAGE, MIN_HIT_SCORE, TOP_K_DEFAULT
from app.models.embedding import content_terms
from app.models.knowledge_base import kb

_CHUNK = dict
_SCORED = Tuple[_CHUNK, float]

_CONTACT_KEYWORDS = re.compile(
    r"(?i)\b(contact|contacts|email|e-mail|e mail|phone|phones|number|numbers|"
    r"tel|telephone|hotline|line|whatsapp|cell|mobile|reach|reach us|get in touch|"
    r"talk to|address|location|located|where (are|is) you|how do i (reach|contact)|"
    r"call us|phone us|sms|dial|get a hold|footer|foot\b)\b"
)
_CONTACT_SETTING_RE = re.compile(
    r"(?i)(e?mail|phone|mobile|tel\b|telephone|whatsapp|address|contact)"
)
_CONTACT_HINTS = ("gabula road", "footer_email", "footer_phone", "footer_address")


def _coverage(terms: set, text: str) -> float:
    """Fraction of the question's content words that the record mentions."""
    if not terms:
        return 0.0
    return len(terms & content_terms(text)) / len(terms)


def _is_contact_query(query: str) -> bool:
    return bool(_CONTACT_KEYWORDS.search(query))


def _is_contact_chunk(chunk: _CHUNK) -> bool:
    meta = chunk.get("metadata", {}) or {}
    if meta.get("collection") != "site_settings":
        return False
    # Match the setting key itself. Sniffing the rendered text used to look for
    # "footer_email", but the label is humanised to "Footer email", so the
    # lookup silently stopped finding the rows it was written for.
    entity_id = str(meta.get("entity_id") or "")
    if entity_id and _CONTACT_SETTING_RE.search(entity_id):
        return True
    text = (chunk.get("text") or "").lower()
    return any(hint in text for hint in _CONTACT_HINTS)


def _contact_chunks() -> List[_CHUNK]:
    return [c for c in kb.chunks if _is_contact_chunk(c)]


def retrieve(query: str, top_k: int = TOP_K_DEFAULT) -> List[_SCORED]:
    expanded_top_k = max(top_k, TOP_K_DEFAULT)
    hits = kb.query(query, expanded_top_k)
    if not hits:
        return []

    terms = content_terms(query)

    # A neighbour has to clear an absolute floor, stay within reach of the best
    # hit, and actually mention what was asked. The last test is what stops a
    # records about something else being quoted as if it answered the question;
    # returning nothing at all is better, because the generator turns an empty
    # result into an honest "not in our information yet" reply.
    best = hits[0][1]
    floor = max(MIN_HIT_SCORE, best * 0.5)
    ranked = [
        hit
        for hit in hits
        if hit[1] >= floor and _coverage(terms, hit[0].get("text", "")) >= MIN_HIT_COVERAGE
    ]
    ranked = ranked[:top_k]

    if _is_contact_query(query):
        promoted = [c for c in _contact_chunks() if c.get("id") not in {h[0].get("id") for h in ranked}]
        if promoted:
            ranked = [(c, 1.0) for c in promoted] + ranked
            ranked = ranked[:max(top_k, TOP_K_DEFAULT)]

    return ranked[:top_k]
