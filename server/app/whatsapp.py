"""Meta WhatsApp Cloud API: send a template or a text, mark as read, read the webhook."""
import hashlib
import hmac
import json
import logging

import httpx

from . import config

log = logging.getLogger("whatsapp")

MAX_TEXT = 4000          # WhatsApp's limit is 4096 characters
MAX_TEMPLATE_PARAM = 1000  # template variables: 1024, no line breaks

# The Meta error codes that mean a setup step is missing, with what to do.
KNOWN_ERRORS = {
    131030: "this phone number is not in the test number's recipient list (API Setup > To > Manage)",
    131047: "more than 24 hours since the customer's last message: only a template can be sent",
    132001: "the template name or language does not exist or is not approved yet",
    132000: "the template's number of variables does not match WHATSAPP_TEMPLATE_HAS_SUMMARY",
    190: "the access token has expired or is wrong (the API Setup token lasts 24 hours)",
    131026: "the message could not be delivered to this number (not on WhatsApp, or old app)",
    100: "a request parameter is wrong (check WHATSAPP_PHONE_NUMBER_ID)",
}


def explain(code, message: str = "") -> str:
    try:
        hint = KNOWN_ERRORS.get(int(code))
    except (TypeError, ValueError):
        hint = None
    return f"{code}: {message}" + (f" -> {hint}" if hint else "")


def _post(payload: dict, what: str) -> str | None:
    """Send one request. Returns the WhatsApp message id ('dry-run' in dry run), or None on failure."""
    if config.DRY_RUN:
        log.info("DRY RUN, WhatsApp %s not sent:\n%s", what, json.dumps(payload, ensure_ascii=False, indent=2))
        return "dry-run"
    if not (config.WHATSAPP_TOKEN and config.WHATSAPP_PHONE_NUMBER_ID):
        log.error("WhatsApp %s not sent: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing", what)
        return None
    url = f"https://graph.facebook.com/{config.GRAPH_API_VERSION}/{config.WHATSAPP_PHONE_NUMBER_ID}/messages"
    try:
        response = httpx.post(url, json=payload, timeout=20,
                              headers={"Authorization": f"Bearer {config.WHATSAPP_TOKEN}"})
    except httpx.HTTPError as error:
        log.error("WhatsApp %s not sent, network error: %s", what, error)
        return None
    if response.is_success:
        messages = response.json().get("messages") or [{}]
        return messages[0].get("id", "ok")
    try:
        error = response.json().get("error", {})
        log.error("WhatsApp %s not sent: %s", what, explain(error.get("code"), error.get("message", "")))
    except ValueError:
        log.error("WhatsApp %s not sent: HTTP %s %s", what, response.status_code, response.text[:300])
    return None


def send_text(to: str, body: str) -> str | None:
    body = body.strip()
    if len(body) > MAX_TEXT:
        body = body[:MAX_TEXT].rsplit(" ", 1)[0] + "…"
    return _post({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"body": body, "preview_url": False},
    }, "text")


def send_template(to: str, body_params: list[str]) -> str | None:
    template = {"name": config.WHATSAPP_TEMPLATE_NAME, "language": {"code": config.WHATSAPP_TEMPLATE_LANG}}
    if body_params:
        clean = [" ".join(p.split())[:MAX_TEMPLATE_PARAM] for p in body_params]  # no line breaks or tabs
        template["components"] = [{"type": "body", "parameters": [{"type": "text", "text": p} for p in clean]}]
    return _post({"messaging_product": "whatsapp", "to": to, "type": "template", "template": template},
                 f"template {config.WHATSAPP_TEMPLATE_NAME}")


def mark_read(message_id: str) -> None:
    """Blue ticks plus the typing indicator while the reply is being written. Best effort."""
    if config.DRY_RUN or not message_id:
        return
    _post({"messaging_product": "whatsapp", "status": "read", "message_id": message_id,
           "typing_indicator": {"type": "text"}}, "read receipt")


def signature_ok(raw_body: bytes, header: str | None) -> bool:
    if not config.WHATSAPP_APP_SECRET:
        return True
    expected = "sha256=" + hmac.new(config.WHATSAPP_APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header or "")


def parse_webhook(payload: dict) -> tuple[list[dict], list[dict]]:
    """Meta's webhook payload -> (messages, statuses)."""
    messages, statuses = [], []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for message in value.get("messages", []):
                kind = message.get("type")
                text = (message.get("text") or {}).get("body", "")
                if kind == "button":  # a quick-reply button on a template
                    text = (message.get("button") or {}).get("text", "")
                elif kind == "interactive":
                    reply = message.get("interactive") or {}
                    text = (reply.get("button_reply") or reply.get("list_reply") or {}).get("title", "")
                messages.append({"id": message.get("id"), "from": message.get("from", ""),
                                 "type": "text" if text else kind, "text": text})
            for status in value.get("statuses", []):
                errors = status.get("errors") or [{}]
                statuses.append({
                    "id": status.get("id"), "status": status.get("status"),
                    "to": status.get("recipient_id", ""),
                    "error": explain(errors[0].get("code"), errors[0].get("title", "")) if status.get("errors") else "",
                })
    return messages, statuses
