"""Dry-run check of the whole flow, with no WhatsApp, email or model calls leaving the machine.

Run from the server folder:  .venv/Scripts/python smoke_test.py
"""
import json
import os
import tempfile
from pathlib import Path

os.environ["DRY_RUN"] = "true"
os.environ["DB_PATH"] = str(Path(tempfile.mkdtemp()) / "smoke.db")
os.environ["DEMO_CUSTOMER_EMAIL"] = "suresh@example.com"
os.environ["WEBHOOK_TOKEN"] = ""
os.environ["WHATSAPP_APP_SECRET"] = ""

from fastapi.testclient import TestClient  # noqa: E402

from app import llm, main  # noqa: E402

llm.reply = lambda system, messages: f"[model reply to: {messages[-1]['content']}]"
client = TestClient(main.app)
sample = json.loads(Path("samples/post_call.json").read_text(encoding="utf-8"))

# 1. The post-call webhook saves the call, then sends the WhatsApp template and the email.
r = client.post("/voice/post-call", json=sample)
assert r.json()["status"] == "saved", r.text
assert r.json()["phone"] == "919876543210"

# 2. The same call SID again is ignored.
assert client.post("/voice/post-call", json=sample).json()["status"] == "duplicate"

# 3. The post-call output nested as a JSON string inside one field is also accepted.
wrapped = {"customerPhone": "9876543210", "callSid": "demo-call-0002",
           "postCallAnalysis": json.dumps({**sample, "callSid": "x", "customerPhone": "x"})}
wrapped_result = client.post("/voice/post-call", json={k: v for k, v in wrapped.items()})
assert wrapped_result.status_code == 200, wrapped_result.text

# 4. Missing phone or call SID is rejected.
assert client.post("/voice/post-call", json={"callSummary": "x"}).status_code == 400

# 5. Meta's webhook verification.
v = client.get("/whatsapp/webhook", params={"hub.mode": "subscribe", "hub.verify_token": main.config.WHATSAPP_VERIFY_TOKEN,
                                            "hub.challenge": "42"})
assert v.text == "42", v.text


# 6. The customer replies on WhatsApp; the agent answers with the call memory.
def incoming(message_id: str, text: str) -> dict:
    return {"entry": [{"changes": [{"value": {"messages": [
        {"id": message_id, "from": "919876543210", "type": "text", "text": {"body": text}}]}}]}]}


client.post("/whatsapp/webhook", json=incoming("wamid.1", "fuel credit ke liye kaun se papers chahiye?"))
client.post("/whatsapp/webhook", json=incoming("wamid.1", "fuel credit ke liye kaun se papers chahiye?"))  # duplicate

view = client.get("/customers/9876543210").json()
kinds = [(e["channel"], e["direction"], e["kind"]) for e in view["timeline"]]
print(json.dumps(kinds, indent=1))
print(view["agentMemory"])
assert kinds.count(("whatsapp", "in", "message")) == 1, "duplicate WhatsApp message was saved twice"
assert ("email", "out", "email") in kinds
assert "NEXT BEST ACTION" in view["agentMemory"]

# 7. STOP marks the customer do-not-contact.
client.post("/whatsapp/webhook", json=incoming("wamid.2", "STOP"))
assert client.get("/customers/9876543210").json()["customer"]["do_not_contact"] == 1

print("\nSMOKE TEST PASSED")
