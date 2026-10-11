"""Web app: the VoiceOwl post-call webhook, the WhatsApp webhook, and a memory viewer.

Run from the server folder:  uvicorn app.main:app --port 8000
"""
import json
import logging

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse

from . import config, followup, memory, whatsapp

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("main")

app = FastAPI(title="Smart Fleet WhatsApp omnichannel demo")
memory.init()

PHONE_KEYS = ("customerPhone", "phone", "to", "To", "callee")
SID_KEYS = ("callSid", "callSID", "CallUUID", "callUUID", "call_uuid", "callId")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "dryRun": config.DRY_RUN}


@app.post("/voice/post-call")
async def post_call(request: Request, background: BackgroundTasks,
                    x_webhook_token: str | None = Header(default=None)) -> dict:
    """Step 3: the VoiceOwl HTTP node posts the flat post-call JSON plus phone and call SID."""
    if config.WEBHOOK_TOKEN and x_webhook_token != config.WEBHOOK_TOKEN:
        raise HTTPException(status_code=401, detail="bad webhook token")
    try:
        body = await request.json()
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="body is not JSON")
    call = _flatten(body)

    phone = memory.normalize_phone(next((call[k] for k in PHONE_KEYS if call.get(k)), ""))
    call_sid = next((call[k] for k in SID_KEYS if call.get(k)), "")
    if not phone or not call_sid:
        raise HTTPException(status_code=400, detail="customerPhone and callSid are required")

    memory.ensure_customer(phone)
    if not memory.add_event(phone, "voice", "out", "call", text=call.get("callSummary", ""),
                            data=call, ref_id=call_sid):
        return {"status": "duplicate", "callSid": call_sid}

    background.add_task(followup.handle_call, phone, call)
    return {"status": "saved", "phone": phone, "callSid": call_sid}


@app.get("/whatsapp/webhook")
def whatsapp_verify(mode: str = Query(alias="hub.mode", default=""),
                    token: str = Query(alias="hub.verify_token", default=""),
                    challenge: str = Query(alias="hub.challenge", default="")) -> PlainTextResponse:
    """Meta calls this once, when the webhook URL is saved in the app dashboard."""
    if mode == "subscribe" and token == config.WHATSAPP_VERIFY_TOKEN:
        return PlainTextResponse(challenge)
    raise HTTPException(status_code=403, detail="verification failed")


@app.post("/whatsapp/webhook")
async def whatsapp_incoming(request: Request, background: BackgroundTasks) -> dict:
    """Step 5: the customer replies on WhatsApp. Answer 200 at once, reply in the background."""
    raw = await request.body()
    if not whatsapp.signature_ok(raw, request.headers.get("X-Hub-Signature-256")):
        raise HTTPException(status_code=401, detail="bad signature")
    for message in whatsapp.incoming_messages(json.loads(raw or b"{}")):
        background.add_task(followup.handle_whatsapp_message, message)
    return {"ok": True}


@app.get("/customers/{phone}")
def customer_view(phone: str) -> dict:
    """The whole memory for one customer: profile, timeline, and what the WhatsApp agent sees."""
    phone = memory.normalize_phone(phone)
    return {
        "customer": memory.ensure_customer(phone),
        "agentMemory": followup.memory_block(phone),
        "timeline": memory.timeline(phone),
    }


def _flatten(body: dict) -> dict:
    """Accept the post-call fields at the top level or as a JSON string / object inside one field.
    Top-level values (the HTTP node's phone and call SID) win over nested ones."""
    nested, top = {}, {}
    for key, value in body.items():
        if isinstance(value, str) and value.strip().startswith("{"):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                pass
        if isinstance(value, dict):
            nested.update({k: "" if v is None else str(v) for k, v in value.items()})
        else:
            top[key] = "" if value is None else str(value)
    return {**nested, **top}
