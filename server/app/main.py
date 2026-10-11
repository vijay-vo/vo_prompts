"""Web app: the VoiceOwl post-call webhook, the WhatsApp webhook, and the demo screens.

Run from the server folder:  .venv\\Scripts\\uvicorn app.main:app --port 8000
"""
import hmac
import json
import logging
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, PlainTextResponse, RedirectResponse

from . import config, followup, memory, whatsapp
from .config import SERVER_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)-9s %(levelname)-7s %(message)s")
logging.getLogger("httpx").setLevel(logging.WARNING)
log = logging.getLogger("main")

PHONE_KEYS = ("customerPhone", "customer_phone", "phone", "to", "To", "callee", "toNumber")
SID_KEYS = ("callSid", "callSID", "call_sid", "CallUUID", "callUUID", "call_uuid", "callId", "callID")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    memory.init()
    log.info("Smart Fleet omnichannel server started. DRY_RUN=%s, database %s", config.DRY_RUN, config.DB_PATH)
    for problem in config.problems():
        log.warning("SETUP: %s", problem)
    yield


app = FastAPI(title="Smart Fleet WhatsApp omnichannel demo", lifespan=lifespan)


def require_admin(token: str | None = Query(default=None),
                  x_admin_token: str | None = Header(default=None)) -> None:
    if not config.ADMIN_TOKEN:
        return
    given = token or x_admin_token or ""
    if not hmac.compare_digest(given, config.ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="admin token required (?token=...)")


# ---------------------------------------------------------------- health

@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse("/health")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "dryRun": config.DRY_RUN, "setupWarnings": config.problems()}


# ---------------------------------------------------------------- VoiceOwl

@app.post("/voice/post-call")
async def post_call(request: Request, background: BackgroundTasks,
                    x_webhook_token: str | None = Header(default=None)) -> dict:
    """The VoiceOwl HTTP node posts the flat post-call JSON plus the customer phone and call SID."""
    if config.WEBHOOK_TOKEN and not hmac.compare_digest(x_webhook_token or "", config.WEBHOOK_TOKEN):
        raise HTTPException(status_code=401, detail="bad webhook token")
    try:
        body = await request.json()
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(status_code=400, detail="body is not JSON")
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="body must be a JSON object")
    call = flatten(body)

    phone = memory.normalize_phone(next((call[k] for k in PHONE_KEYS if call.get(k)), ""))
    call_sid = next((call[k] for k in SID_KEYS if call.get(k)), "")
    if len(phone) < 10 or not call_sid:
        log.warning("post-call rejected, phone %r / call SID %r missing. Keys received: %s",
                    phone, call_sid, sorted(call))
        raise HTTPException(status_code=400, detail="customerPhone and callSid are required")

    memory.ensure_customer(phone)
    if not memory.add_event(phone, "voice", "out", "call", text=call.get("callSummary", ""),
                            data=call, ref_id=call_sid):
        log.info("post-call for %s already saved (call SID %s), ignored", phone, call_sid)
        return {"status": "duplicate", "callSid": call_sid}

    log.info("post-call saved: %s, call SID %s, outcome %s, sendWhatsApp %s",
             phone, call_sid, call.get("callOutcome"), call.get("sendWhatsApp"))
    background.add_task(followup.handle_call, phone, call)
    return {"status": "saved", "phone": phone, "callSid": call_sid}


def flatten(body: dict) -> dict:
    """Accept the post-call fields at the top level or as a JSON string / object inside one field.
    Top-level values (the HTTP node's phone and call SID) win over nested ones."""
    nested, top = {}, {}
    for key, value in body.items():
        if isinstance(value, str) and value.strip().startswith(("{", "```")):
            try:
                value = json.loads(_strip_fence(value))
            except json.JSONDecodeError:
                pass
        if isinstance(value, dict):
            nested.update({k: "" if v is None else str(v) for k, v in value.items()})
        else:
            top[key] = "" if value is None else str(value)
    return {**nested, **top}


def _strip_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0]
    return text


# ---------------------------------------------------------------- WhatsApp

@app.get("/whatsapp/webhook")
def whatsapp_verify(mode: str = Query(alias="hub.mode", default=""),
                    token: str = Query(alias="hub.verify_token", default=""),
                    challenge: str = Query(alias="hub.challenge", default="")) -> PlainTextResponse:
    """Meta calls this once, when the webhook URL is saved in the app dashboard."""
    if mode == "subscribe" and hmac.compare_digest(token, config.WHATSAPP_VERIFY_TOKEN):
        log.info("Meta webhook verified")
        return PlainTextResponse(challenge)
    log.warning("Meta webhook verification failed: the verify token does not match WHATSAPP_VERIFY_TOKEN")
    raise HTTPException(status_code=403, detail="verification failed")


@app.post("/whatsapp/webhook")
async def whatsapp_incoming(request: Request, background: BackgroundTasks) -> dict:
    """Incoming messages and delivery receipts. Answer 200 at once; the reply runs in the background."""
    raw = await request.body()
    if not whatsapp.signature_ok(raw, request.headers.get("X-Hub-Signature-256")):
        log.warning("WhatsApp webhook with a bad signature: check WHATSAPP_APP_SECRET")
        raise HTTPException(status_code=401, detail="bad signature")
    try:
        payload = json.loads(raw or b"{}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="body is not JSON")
    messages, statuses = whatsapp.parse_webhook(payload)
    for status in statuses:
        background.add_task(followup.handle_status, status)
    for message in messages:
        log.info("WhatsApp in from %s: %s", message["from"], message["text"] or f"[{message['type']}]")
        background.add_task(followup.handle_whatsapp_message, message)
    return {"ok": True}


# ---------------------------------------------------------------- demo screens (admin)

@app.get("/customers", dependencies=[Depends(require_admin)])
def customer_list() -> list[dict]:
    return memory.customers()


@app.get("/customers/{phone}", dependencies=[Depends(require_admin)])
def customer_view(phone: str) -> dict:
    """The whole memory for one customer: profile, timeline, and what the WhatsApp agent sees."""
    phone = memory.normalize_phone(phone)
    customer = memory.get_customer(phone)
    if not customer:
        raise HTTPException(status_code=404, detail="no such customer yet")
    return {"customer": customer, "agentMemory": followup.memory_block(phone), "timeline": memory.timeline(phone)}


@app.delete("/customers/{phone}", dependencies=[Depends(require_admin)])
def customer_reset(phone: str) -> dict:
    """Forget a customer completely, to run the demo again from a clean start."""
    phone = memory.normalize_phone(phone)
    memory.delete_customer(phone)
    log.info("customer %s reset", phone)
    return {"status": "deleted", "phone": phone}


@app.get("/demo", response_class=HTMLResponse, dependencies=[Depends(require_admin)])
def demo_screen() -> HTMLResponse:
    """The live screen for the demo: one customer, every channel, one timeline."""
    return HTMLResponse((SERVER_DIR / "app" / "demo.html").read_text(encoding="utf-8"))
