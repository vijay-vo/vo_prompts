"""Meta WhatsApp Cloud API: send a template, send a text, verify the webhook signature."""
import hashlib
import hmac
import json
import logging

import httpx

from . import config

log = logging.getLogger("whatsapp")


def _post(payload: dict) -> str | None:
    """Send one message. Returns the WhatsApp message id, or None if it failed."""
    if config.DRY_RUN:
        log.info("DRY RUN, WhatsApp not sent:\n%s", json.dumps(payload, ensure_ascii=False, indent=2))
        return "dry-run"
    url = f"https://graph.facebook.com/{config.GRAPH_API_VERSION}/{config.WHATSAPP_PHONE_NUMBER_ID}/messages"
    try:
        response = httpx.post(url, json=payload, timeout=20,
                              headers={"Authorization": f"Bearer {config.WHATSAPP_TOKEN}"})
        response.raise_for_status()
        return response.json()["messages"][0]["id"]
    except httpx.HTTPError as error:
        body = getattr(getattr(error, "response", None), "text", "")
        log.error("WhatsApp send failed: %s %s", error, body)
        return None


def send_text(to: str, body: str) -> str | None:
    return _post({
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": body, "preview_url": False},
    })


def send_template(to: str, body_params: list[str]) -> str | None:
    template = {"name": config.WHATSAPP_TEMPLATE_NAME, "language": {"code": config.WHATSAPP_TEMPLATE_LANG}}
    if body_params:
        template["components"] = [{
            "type": "body",
            "parameters": [{"type": "text", "text": p} for p in body_params],
        }]
    return _post({"messaging_product": "whatsapp", "to": to, "type": "template", "template": template})


def signature_ok(raw_body: bytes, header: str | None) -> bool:
    if not config.WHATSAPP_APP_SECRET:
        return True
    expected = "sha256=" + hmac.new(config.WHATSAPP_APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header or "")


def incoming_messages(payload: dict) -> list[dict]:
    """Flatten Meta's webhook payload into [{id, from, type, text}]. Status updates are skipped."""
    messages = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            for message in change.get("value", {}).get("messages", []):
                messages.append({
                    "id": message.get("id"),
                    "from": message.get("from", ""),
                    "type": message.get("type"),
                    "text": (message.get("text") or {}).get("body", ""),
                })
    return messages
