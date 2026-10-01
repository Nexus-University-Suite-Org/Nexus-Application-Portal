import re

from app.config import ANSWER_CHUNK_LIMIT

_GREETING_RE = re.compile(r"^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)[\s!?.]*$", re.IGNORECASE)
_THANKS_RE = re.compile(r"^(thanks|thank\s+you|thx|ty)[\s!?.]*$", re.IGNORECASE)
_FAREWELL_RE = re.compile(r"^(bye|goodbye|see\s+ya|see\s+you)[\s!?.]*$", re.IGNORECASE)

PORTAL_FALLBACK = (
    "I couldn't find specific information about that in our knowledge base yet. "
    "Please contact the admissions office for accurate assistance.\n\n"
    "You can also ask me about programs offered, application requirements, tuition "
    "and fees, scholarships, admission schemes, news, or student success stories."
)

INTENTS = {
    "greeting": "Hello! I'm the Nexus University assistant. I can help you with programs, admissions, tuition and fees, scholarships, and more. What would you like to know?",
    "thanks": "You're welcome! Feel free to ask if you need anything else about Nexus University.",
    "farewell": "Goodbye! If you need help later, just open this chat again. Best of luck with your application!",
}


def _classify(query: str):
    query = query.strip().lower()
    if _GREETING_RE.match(query):
        return "greeting"
    if _THANKS_RE.match(query):
        return "thanks"
    if _FAREWELL_RE.match(query):
        return "farewell"
    return "question"


def build_answer(query: str, hits, portal_name: str = "Nexus University") -> str:
    intent = _classify(query)
    if intent != "question":
        return INTENTS[intent]

    if not hits:
        return PORTAL_FALLBACK

    lines = []
    lines.append("Here's what I found based on our information:")
    lines.append("")
    seen_titles = set()
    for idx, (chunk, _score) in enumerate(hits, start=1):
        title = chunk.get("metadata", {}).get("title") or portal_name
        if title in seen_titles and idx > 1:
            continue
        seen_titles.add(title)
        snippet = chunk.get("text", "").strip()
        if len(snippet) > ANSWER_CHUNK_LIMIT:
            snippet = snippet[:ANSWER_CHUNK_LIMIT].rsplit(" ", 1)[0] + "…"
        lines.append(f"**{idx}. {title}**")
        lines.append(snippet)
        lines.append("")
    lines.append("Would you like to know more about any of these topics, such as how to apply, requirements, or deadlines?")
    return "\n".join(lines)


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