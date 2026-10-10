"""Lightweight question-intent helpers shared by retrieval and generation.

The catalogue intent answers "what courses/programmes do you offer". It is kept
separate from the small-talk intents because it still needs retrieval: unlike a
greeting, the reply is built from records in the knowledge base.
"""

from app.models.embedding import content_terms

# Nouns that name the catalogue itself.
_CATALOG_NOUNS = frozenset(
    {
        "course",
        "programme",
        "program",
        "degree",
        "discipline",
        "field",
        "study",
        "major",
        "subject",
    }
)

# Verbs that describe offering the catalogue. Note that stopword removal in
# ``content_terms`` already drops "offer"/"offers"/"provide"/"available"; the
# forms below survive as raw tokens and are kept so a bare "what do you teach"
# is still recognised.
_CATALOG_VERBS = frozenset(
    {
        "offer",
        "teach",
        "list",
        "learn",
        "study",
        "enrol",
        "enroll",
        "run",
        "available",
        "major",
    }
)

def is_catalog_query(query: str) -> bool:
    """Whether a question asks for the list of courses/programmes.

    A question is a catalogue request when every meaningful word is either the
    catalogue itself or the act of offering it. That keeps "what courses do you
    offer" in, while a question that introduces another topic -- "how do I
    register for courses?", "what is the fee for the nursing programme" -- stays
    out and is answered by normal retrieval.
    """
    text = (query or "").strip()
    if not text:
        return False

    terms = content_terms(text)
    if not terms:
        return False

    if terms & _CATALOG_NOUNS:
        leftover = terms - _CATALOG_NOUNS - _CATALOG_VERBS
        return not leftover

    if terms <= _CATALOG_VERBS and _has_question_word(text):
        return True

    return False


def _has_question_word(text: str) -> bool:
    lowered = text.lower()
    return any(
        word in lowered
        for word in ("what", "which", "list", "show", "name", "any")
    )
