"""Dry-run check of the whole flow. Nothing leaves the machine: no WhatsApp, email or model calls.

    .venv\\Scripts\\python smoke_test.py
"""
import json
import os
import tempfile
from pathlib import Path

os.environ.update({
    "DRY_RUN": "true", "DB_PATH": str(Path(tempfile.mkdtemp()) / "smoke.db"),
    "DEMO_CUSTOMER_EMAIL": "suresh@example.com", "WEBHOOK_TOKEN": "hook-secret", "ADMIN_TOKEN": "admin-secret",
    "WHATSAPP_APP_SECRET": "", "WHATSAPP_VERIFY_TOKEN": "verify-me", "WHATSAPP_TEMPLATE_HAS_SUMMARY": "true",
})

from fastapi.testclient import TestClient  # noqa: E402

from app import config, followup, llm, main  # noqa: E402

seen_prompts = []


def fake_model(system, messages):
    seen_prompts.append((system, messages))
    assert messages[-1]["role"] == "user", "the model must always answer a customer message"
    return f"**[model reply to: {messages[-1]['content']}]**"


llm.reply = lambda system, messages: llm.clean(fake_model(system, messages))
HOOK = {"X-Webhook-Token": "hook-secret"}
ADMIN = {"token": "admin-secret"}
sample = json.loads(Path("samples/post_call.json").read_text(encoding="utf-8"))
PHONE = "919876543210"


def incoming(message_id, text, sender=PHONE):
    return {"entry": [{"changes": [{"value": {"messages": [
        {"id": message_id, "from": sender, "type": "text", "text": {"body": text}}]}}]}]}


def receipt(message_id, status, code=None):
    s = {"id": message_id, "status": status, "recipient_id": PHONE}
    if code:
        s["errors"] = [{"code": code, "title": "test"}]
    return {"entry": [{"changes": [{"value": {"statuses": [s]}}]}]}


def view(phone=PHONE):
    return client.get(f"/customers/{phone}", params=ADMIN).json()


with TestClient(main.app) as client:
    # Security
    assert client.post("/voice/post-call", json=sample).status_code == 401, "webhook token not checked"
    assert client.get(f"/customers/{PHONE}").status_code == 401, "admin token not checked"
    assert client.get("/demo", params=ADMIN).status_code == 200

    # 1. Post-call webhook: saved, WhatsApp template + email sent
    r = client.post("/voice/post-call", json=sample, headers=HOOK)
    assert r.json() == {"status": "saved", "phone": PHONE, "callSid": "demo-call-0001"}, r.text
    kinds = [(e["channel"], e["kind"]) for e in view()["timeline"]]
    assert kinds == [("voice", "call"), ("whatsapp", "template"), ("email", "email")], kinds

    # 2. Same call SID again: ignored
    assert client.post("/voice/post-call", json=sample, headers=HOOK).json()["status"] == "duplicate"

    # 3. Post-call nested as a JSON string (even in a code fence); top-level phone and SID win
    wrapped = {"customerPhone": "+91 98765 43210", "callSid": "demo-call-0002",
               "postCallAnalysis": "```json\n" + json.dumps({**sample, "callSid": "x", "customerPhone": "x"}) + "\n```"}
    assert client.post("/voice/post-call", json=wrapped, headers=HOOK).json()["callSid"] == "demo-call-0002"
    unpacked = next(e for e in view()["timeline"] if e["ref_id"] == "demo-call-0002")["data"]
    assert unpacked["callSummary"] == sample["callSummary"], "nested post-call JSON was not unpacked"

    # 4. Missing phone or SID: rejected
    assert client.post("/voice/post-call", json={"callSummary": "x"}, headers=HOOK).status_code == 400

    # 5. Meta webhook verification
    ok = client.get("/whatsapp/webhook", params={"hub.mode": "subscribe", "hub.verify_token": "verify-me", "hub.challenge": "42"})
    assert ok.text == "42"
    assert client.get("/whatsapp/webhook", params={"hub.mode": "subscribe", "hub.verify_token": "no", "hub.challenge": "1"}).status_code == 403

    # 6. Customer replies: answered by the model with the call memory; duplicates ignored
    client.post("/whatsapp/webhook", json=incoming("wamid.1", "fuel credit ke liye kaun se papers chahiye?"))
    client.post("/whatsapp/webhook", json=incoming("wamid.1", "fuel credit ke liye kaun se papers chahiye?"))
    timeline = view()["timeline"]
    assert sum(1 for e in timeline if e["direction"] == "in") == 1, "duplicate message saved twice"
    assert timeline[-1]["text"] == "[model reply to: fuel credit ke liye kaun se papers chahiye?]", "markdown not cleaned"
    system, messages = seen_prompts[-1]
    assert "NEXT BEST ACTION" in system and "OPEN QUESTIONS" in system and "NOW:" in system
    assert messages[0]["role"] == "assistant" and "धन्यवाद" in messages[0]["content"], "follow-up missing from chat history"

    # 7. Delivery receipts: a failure is recorded with its reason
    from app import memory
    memory.add_event(PHONE, "whatsapp", "out", "message", text="test", ref_id="wamid.out1", status="sent")
    client.post("/whatsapp/webhook", json=receipt("wamid.out1", "read"))
    client.post("/whatsapp/webhook", json=receipt("wamid.out1", "delivered"))  # late receipt: must not go back
    assert next(e for e in view()["timeline"] if e["ref_id"] == "wamid.out1")["status"] == "read"
    memory.add_event(PHONE, "whatsapp", "out", "message", text="test2", ref_id="wamid.out2", status="sent")
    client.post("/whatsapp/webhook", json=receipt("wamid.out2", "failed", code=131030))
    failed = next(e for e in view()["timeline"] if e["ref_id"] == "wamid.out2")
    assert failed["status"] == "failed" and "recipient list" in failed["data"]["error"], failed

    # 8. STOP / START
    client.post("/whatsapp/webhook", json=incoming("wamid.2", "STOP"))
    assert view()["customer"]["do_not_contact"] == 1
    r = client.post("/voice/post-call", json={**sample, "callSid": "demo-call-0003"}, headers=HOOK)
    assert view()["timeline"][-1]["kind"] == "call", "a do-not-contact customer was messaged after a call"
    client.post("/whatsapp/webhook", json=incoming("wamid.3", "start"))
    assert view()["customer"]["do_not_contact"] == 0

    # 9. A template with no variables (hello_world): summary held, then delivered when the customer writes
    config.WHATSAPP_TEMPLATE_HAS_SUMMARY = False
    OTHER = "919800000001"
    client.post("/voice/post-call", json={**sample, "customerPhone": OTHER, "callSid": "demo-call-0004"}, headers=HOOK)
    assert view(OTHER)["customer"]["pending_followup"], "summary not held back"
    calls_before = len(seen_prompts)
    client.post("/whatsapp/webhook", json=incoming("wamid.4", "Hi", sender=OTHER))
    last = view(OTHER)
    assert not last["customer"]["pending_followup"] and "धन्यवाद" in last["timeline"][-1]["text"]
    assert len(seen_prompts) == calls_before, "a greeting after the held summary should not call the model"
    client.post("/whatsapp/webhook", json=incoming("wamid.5", "bonus kab tak hai?", sender=OTHER))
    assert view(OTHER)["timeline"][-1]["text"].startswith("[model reply to: bonus")

    # 10. sendWhatsApp = no (staff answered): no WhatsApp, no email
    STAFF = "919800000002"
    client.post("/voice/post-call", json={**sample, "customerPhone": STAFF, "callSid": "demo-call-0005",
                                          "spokeTo": "familyOrStaff", "callOutcome": "messageLeft",
                                          "sendWhatsApp": "no"}, headers=HOOK)
    assert [e["channel"] for e in view(STAFF)["timeline"]] == ["voice"]

    # 11. Reset
    client.delete(f"/customers/{STAFF}", params=ADMIN)
    assert client.get(f"/customers/{STAFF}", params=ADMIN).status_code == 404

    # 12. Email content
    body = followup.email_body({"name": "Suresh Yadav"}, sample)
    assert "₹5,00,000, today evening" in body

    print(view()["agentMemory"])
    print("\nSMOKE TEST PASSED")
