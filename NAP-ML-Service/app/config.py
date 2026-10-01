import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = Path(os.getenv("ML_DATA_DIR", str(BASE_DIR / "data")))
CORPUS_DIR = DATA_DIR / "corpus"
INDEX_DIR = DATA_DIR / "indices"
MODELS_DIR = Path(os.getenv("ML_MODELS_DIR", str(BASE_DIR / "models")))

NAP_BASE_URL = os.getenv("NAP_BASE_URL", "http://localhost:8080").rstrip("/")
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"
)

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1600"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "160"))
TOP_K_DEFAULT = int(os.getenv("TOP_K_DEFAULT", "5"))
ANSWER_CHUNK_LIMIT = int(os.getenv("ANSWER_CHUNK_LIMIT", "1200"))

DEFAULT_PORT = int(os.getenv("DEFAULT_PORT", "8000"))

CONTENT_COLLECTIONS = [
    "news",
    "events",
    "gallery",
    "faqs",
    "alumni",
    "partners",
    "scholarships",
    "student_stories",
    "legal_pages",
    "quick_links",
    "courses",
    "faculty",
    "page_sections",
    "programs",
    "site_settings",
]

PORTAL_NAME = os.getenv("PORTAL_NAME", "Nexus University")

for _dir in (DATA_DIR, CORPUS_DIR, INDEX_DIR, MODELS_DIR):
    _dir.mkdir(parents=True, exist_ok=True)