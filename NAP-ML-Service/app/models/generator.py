import re

from app.config import (
    ANSWER_CHUNK_LIMIT,
    ANSWER_MAX_SOURCES,
    MIN_HIT_SCORE,
)
from app.models.embedding import content_terms

_GREETING_RE = re.compile(r"^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)[\s!?.]*$", re.IGNORECASE)
_THANKS_RE = re.compile(r"^(thanks|thank\s+you|thx|ty)[\s!?.]*$", re.IGNORECASE)
_FAREWELL_RE = re.compile(r"^(bye|goodbye|see\s+ya|see\s+you)[\s!?.]*$", re.IGNORECASE)
_WELLBEING_RE = re.compile(
    r"^how\s+(are|r)\s+(you|u|things)(\s+(doing|today|these\s+days))?[\s!?.]*$"
    r"|^how('s| is)?\s*it\s+going[\s!?.]*$"
    r"|^how\s+do\s+you\s+do[\s!?.]*$",
    re.IGNORECASE,
)
_IDENTITY_RE = re.compile(
    r"^(who|what)\s+are\s+you[\s!?.]*$"
    r"|^what('s| is)?\s*your\s+name[\s!?.]*$"
    r"|^what\s+is\s+this[\s!?.]*$"
    r"|^are\s+you\s+(a\s+)?(bot|robot|human|real|ai)[\s!?.]*$",
    re.IGNORECASE,
)
_CAPABILITY_RE = re.compile(
    r"^what\s+can\s+you\s+(do|help\s+(me\s+)?with|answer)[\s!?.]*$"
    r"|^what\s+do\s+you\s+do[\s!?.]*$"
    r"|^what\s+can\s+i\s+(ask|say)[\s!?.]*$"
    r"|^help[\s!?.]*$",
    re.IGNORECASE,
)

PORTAL_FALLBACK = (
    "I couldn't find that in our information yet. The admissions office can "
    "give you an accurate answer.\n\n"
    "I can help with programmes offered, how to apply, entry requirements, "
    "tuition and fees, scholarships, admission schemes, news and events, or "
    "student success stories."
)

# Used when a message carries no topical words at all (e.g. "how are you",
# "what's up"). Rather than retrieving the nearest neighbour -- which always
# exists and reads as an unrelated data dump -- ask what the user wants.
CLARIFY = (
    "Happy to help! What would you like to know about Nexus University? "
    "I can cover programmes, how to apply, entry requirements, tuition and "
    "fees, scholarships, news and events, or student success stories."
)

INTENTS = {
    "greeting": "Hello! I'm the Nexus University assistant. I can help with programmes, how to apply, entry requirements, tuition and fees, scholarships, and more. What would you like to know?",
    "thanks": "You're welcome! Feel free to ask if you need anything else about Nexus University.",
    "farewell": "Goodbye! If you need help later, just open this chat again. Best of luck with your application!",
    "wellbeing": "I'm doing well, thanks for asking! How can I help you with Nexus University — programmes, applications, entry requirements, tuition and fees, or scholarships?",
    "identity": "I'm the Nexus University assistant, a virtual guide for programmes, admissions, entry requirements, tuition and fees, scholarships, and more.",
    "capability": "I can help with programmes offered, how to apply, entry requirements, tuition and fees, scholarships, admission schemes, news and events, and student success stories. What would you like to know?",
}

# Promotional and testimonial copy. Allowed as the lead source, but it has to
# be virtually as strong as the best hit before it is listed underneath a
# factual answer.
_LOW_PRIORITY_COLLECTIONS = {"student_stories", "alumni", "partners"}
_LOW_PRIORITY_RATIO = 0.95

_WHITESPACE_RE = re.compile(r"\s+")


def _classify(query: str):
    query = query.strip().lower()
    if _GREETING_RE.match(query):
        return "greeting"
    if _THANKS_RE.match(query):
        return "thanks"
    if _FAREWELL_RE.match(query):
        return "farewell"
    if _WELLBEING_RE.match(query):
        return "wellbeing"
    if _IDENTITY_RE.match(query):
        return "identity"
    if _CAPABILITY_RE.match(query):
        return "capability"
    return "question"


def is_conversational(query: str) -> bool:
    """Whether a message is small talk or carries nothing to retrieve on.

    A message with no topical words (all stopwords, e.g. "how are you") must
    not reach retrieval: the vector store always returns the nearest
    neighbours, which is how an unrelated terms/CTA dump got attached to a
    plain greeting.
    """
    return _classify(query) != "question" or not content_terms(query)


def _normalise(text: str) -> str:
    """Fingerprint used to spot the same passage quoted twice."""
    return _WHITESPACE_RE.sub(" ", (text or "").strip().lower())


def _relevant(hits, min_score: float):
    """Keep only passages that are actually about the question.

    Retrieval returns the top-k neighbours, which always exists even when the
    question shares almost no vocabulary with the corpus. Without a floor the
    reply padded itself with unrelated records.
    """
    kept = [h for h in hits if h[1] >= min_score]
    return kept


def _dedupe(hits):
    """Drop repeats of the same title or the same body text."""
    seen_titles = set()
    seen_bodies = set()
    unique = []
    for chunk, score in hits:
        meta = chunk.get("metadata", {}) or {}
        title = (meta.get("title") or "").strip().lower()
        body = _normalise(chunk.get("text", ""))
        if title and title in seen_titles:
            continue
        if body and body in seen_bodies:
            continue
        if title:
            seen_titles.add(title)
        if body:
            seen_bodies.add(body)
        unique.append((chunk, score))
    return unique


def _select(hits):
    """Drop noise and off-topic neighbours, keeping the strongest sources.

    Marketing and testimonial copy is welcome when it is the answer, but not as a
    second or third source under a factual question: an admissions query was
    answered with the admissions FAQ followed by a student's water-filter
    project, which read as two unrelated facts stapled together.
    """
    candidates = _dedupe(_relevant(hits, MIN_HIT_SCORE))
    if not candidates:
        return candidates

    best_score = candidates[0][1]
    keep = []
    for index, (chunk, score) in enumerate(candidates):
        collection = (chunk.get("metadata", {}) or {}).get("collection")
        if index and collection in _LOW_PRIORITY_COLLECTIONS:
            if score < best_score * _LOW_PRIORITY_RATIO:
                continue
        keep.append((chunk, score))
    return keep


def _truncate(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def _body_of(chunk) -> str:
    """The display text for a chunk.

    The indexed text carries the heading so retrieval can match on it; only the
    body should be quoted back.
    """
    meta = chunk.get("metadata", {}) or {}
    return (meta.get("body") or chunk.get("text", "") or "").strip()


def _compose(query: str, hits):
    """Return (answer text, hits actually quoted).

    The two are produced together so the source list shown under a reply cannot
    advertise a record the reply dropped: an admissions question kept the FAQ and
    discarded the student story, and the UI used to list both.
    """
    intent = _classify(query)
    if intent != "question":
        return INTENTS[intent], []
    if not content_terms(query):
        return CLARIFY, []
    if not hits:
        return PORTAL_FALLBACK, []

    selected = _select(hits)[:ANSWER_MAX_SOURCES]
    entries = []
    for chunk, _score in selected:
        title = (chunk.get("metadata", {}) or {}).get("title") or ""
        body = _truncate(_body_of(chunk), ANSWER_CHUNK_LIMIT)
        if not body:
            continue
        entries.append((title.strip(), body))

    if not entries:
        return PORTAL_FALLBACK, []

    quoted = [
        (chunk, score)
        for chunk, score in selected
        if _truncate(_body_of(chunk), ANSWER_CHUNK_LIMIT)
    ]

    # A single strong match is quoted on its own rather than dressed up with an
    # introduction, which reads like a search result instead of an answer.
    if len(entries) == 1:
        title, body = entries[0]
        text = f"**{title}**\n{body}" if title else body
        return text, quoted

    lines = ["Here's what our information says:", ""]
    for title, body in entries:
        if title:
            lines.append(f"**{title}**")
        lines.append(body)
        lines.append("")
    lines.append("Let me know if you'd like more detail on any of these.")
    return "\n".join(lines).rstrip(), quoted


def build_answer(query: str, hits, portal_name: str = "Nexus University") -> str:
    return _compose(query, hits)[0]


def quoted_sources(query: str, hits):
    """Sources the reply actually used, in the order it used them."""
    return extract_sources(_compose(query, hits)[1])


def extract_sources(hits):
    sources = []
    seen = set()
    for chunk, _score in hits:
        meta = chunk.get("metadata", {})
        title = meta.get("title")
        if title in seen:
            continue
        seen.add(title)
        sources.append(
            {
                "title": title,
                "collection": meta.get("collection"),
                "entity_id": meta.get("entity_id"),
            }
        )
    return sources