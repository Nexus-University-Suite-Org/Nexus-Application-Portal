"""Contact details the assistant quotes for "who can I contact?".

The site footer and contact page read ``footer_email``, ``footer_phone``,
``footer_whatsapp_cta`` and ``footer_address`` from
``/api/v1/content/site-settings``. The assistant reads the same endpoint so the
chat can never contradict the rendered page, and so adding the keys in the CMS
updates the bot without a retrain.

No fallbacks are invented: a field that is not configured is simply omitted, and
when nothing is configured the assistant says so rather than quoting placeholder
contact details.

Precedence, highest first:
  1. ``CONTACT_*`` environment variables (deployments that keep contact info
     out of the database).
  2. The ``footer_*`` site settings.
"""

import time
from typing import Dict, Optional

import httpx

from app import config

_BLANK = {"email": "", "phone": "", "whatsapp": "", "address": "", "hours": ""}

_CACHE_TTL = 300.0
_cache: Optional[Dict[str, str]] = None
_cache_at = 0.0

_TIMEOUT = httpx.Timeout(5.0, connect=3.0)


def _normalise_settings(settings) -> Dict[str, str]:
    """Accept either the map or the list shape the CMS can return."""
    if isinstance(settings, list):
        return {
            str(item.get("settingKey") or item.get("key") or ""): str(
                item.get("settingValue") or item.get("value") or ""
            )
            for item in settings
            if isinstance(item, dict)
        }
    if isinstance(settings, dict):
        return {str(k): str(v) for k, v in settings.items()}
    return {}


def _fetch_settings() -> Dict[str, str]:
    try:
        response = httpx.get(
            f"{config.NAP_BASE_URL}/api/v1/content/site-settings",
            timeout=_TIMEOUT,
            follow_redirects=True,
        )
        response.raise_for_status()
        return _normalise_settings(response.json())
    except Exception:
        return {}


def _compose(settings: Dict[str, str]) -> Dict[str, str]:
    details = dict(_BLANK)
    phone = settings.get("footer_phone", "").strip()
    if phone:
        details["phone"] = phone
        details["whatsapp"] = phone
    if settings.get("footer_email", "").strip():
        details["email"] = settings["footer_email"].strip()
    if settings.get("footer_address", "").strip():
        details["address"] = settings["footer_address"].strip()

    # Env overrides win over the CMS.
    if config.CONTACT_EMAIL:
        details["email"] = config.CONTACT_EMAIL
    if config.CONTACT_PHONE:
        details["phone"] = config.CONTACT_PHONE
        details["whatsapp"] = config.CONTACT_PHONE
    if config.CONTACT_WHATSAPP:
        details["whatsapp"] = config.CONTACT_WHATSAPP
    if config.CONTACT_ADDRESS:
        details["address"] = config.CONTACT_ADDRESS
    if config.CONTACT_HOURS:
        details["hours"] = config.CONTACT_HOURS
    return details


def prime(settings) -> Dict[str, str]:
    """Warm the cache from settings the caller already fetched."""
    global _cache, _cache_at
    _cache = _compose(_normalise_settings(settings))
    _cache_at = time.monotonic()
    return _cache


def get_contact_details(force: bool = False) -> Dict[str, str]:
    global _cache, _cache_at
    now = time.monotonic()
    if not force and _cache is not None and (now - _cache_at) < _CACHE_TTL:
        return _cache
    return prime(_fetch_settings())
