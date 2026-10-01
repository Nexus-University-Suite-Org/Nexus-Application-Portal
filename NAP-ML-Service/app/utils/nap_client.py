import httpx

from app.config import NAP_BASE_URL

_TIMEOUT = httpx.Timeout(30.0, connect=3.0)


def _get(path: str):
    url = f"{NAP_BASE_URL}{path}"
    response = httpx.get(url, timeout=_TIMEOUT, follow_redirects=True)
    response.raise_for_status()
    return response.json()


def fetch_collection(name: str):
    return _get(f"/api/v1/content/{name}")


def fetch_all_collections(collections):
    results = {}
    for name in collections:
        try:
            results[name] = fetch_collection(name)
        except Exception:
            results[name] = []
    return results


def fetch_programs():
    try:
        return _get("/api/v1/programs")
    except Exception:
        return []


def fetch_schemes():
    try:
        return _get("/api/v1/schemes")
    except Exception:
        return []


def fetch_site_settings():
    try:
        return _get("/api/v1/content/site-settings")
    except Exception:
        return {}


def fetch_announcements():
    try:
        return _get("/api/v1/announcements")
    except Exception:
        return []