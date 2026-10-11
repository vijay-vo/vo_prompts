"""What happens after a call, and how a WhatsApp reply is answered."""
import logging

from . import config, emailer, llm, memory, whatsapp
from .config import SERVER_DIR

log = logging.getLogger("followup")

WHATSAPP_AGENT_PROMPT = (SERVER_DIR / "prompts" / "whatsappAgent.txt").read_text(encoding="utf-8")

# Must match the approved template body word for word; {summary} is the template's {{1}}.
FOLLOWUP_TEXT = ("नमस्ते! Bharat Petroleum Smart Fleet की आज की call के लिए धन्यवाद। {summary} "
                 "कोई भी सवाल हो तो इसी chat पर reply कीजिए।")
STOP_WORDS = {"stop", "unsubscribe", "message mat karo", "मैसेज मत करो", "बंद करो"}
FALLBACK_REPLY = "माफ़ कीजिए, अभी technical problem आ रही है। कृपया थोड़ी देर बाद message कीजिए।"
STOP_REPLY = "ठीक है, अब आपको Smart Fleet से कोई message नहीं आएगा। धन्यवाद।"

CONNECTED = {"completed", "hungUpEarly"}

# Post-call fields worth handing to the WhatsApp agent, with their labels.
MEMORY_FIELDS = [
    ("callOutcome", "Call outcome"), ("spokeTo", "Spoke to"), ("customerMood", "Mood"),
    ("callSummary", "Summary"), ("rechargeDecision", "Recharge decision"),
    ("rechargeAmount", "Recharge amount (₹)"), ("rechargeWhen", "Recharge when"),
    ("rechargeMode", "Recharge mode"), ("bonusOfferHeard", "Heard the bonus offer"),
    ("cashShortToday", "Short of cash"), ("petroMilesDecision", "Petro miles decision"),
    ("petroMilesInterest", "Petro miles interest"), ("truckNeeds", "Truck needs"),
    ("fuelCreditDecision", "Fuel credit decision"), ("fuelCreditPartner", "Preferred partner"),
    ("quietCardsReason", "The 2 quiet cards"), ("newCardsDecision", "Cards for the 2 trucks"),
    ("driverNetworkDecision", "Ghar / Be Cafe for drivers"), ("accountServiceIssue", "Account issue"),
    ("openQuestions", "OPEN QUESTIONS"), ("objections", "Objections"),
    ("nextBestAction", "NEXT BEST ACTION"),
]


def handle_call(phone: str, call: dict) -> None:
    """Runs after the post-call JSON is saved: do-not-contact, WhatsApp, email."""
    customer = memory.ensure_customer(phone)

    if call.get("doNotCall") == "yes":
        memory.set_do_not_contact(phone)
        log.info("%s asked not to be contacted: nothing sent", phone)
        return
    if customer["do_not_contact"]:
        log.info("%s is marked do-not-contact: nothing sent", phone)
        return

    if call.get("sendWhatsApp") == "yes":
        summary = " ".join((call.get("whatsappSummary") or "").split())  # templates reject line breaks
        if summary and summary != "none":
            text = FOLLOWUP_TEXT.format(summary=summary)
            if memory.window_open(customer):
                message_id, kind = whatsapp.send_text(phone, text), "message"
            else:
                message_id, kind = whatsapp.send_template(phone, [summary]), "template"
            if message_id:
                memory.add_event(phone, "whatsapp", "out", kind, text=text, ref_id=_ref(message_id))

    if call.get("spokeTo") == "owner" and call.get("callOutcome") in CONNECTED and customer["email"]:
        subject = "Smart Fleet: summary of today's call"
        body = _email_body(customer, call)
        if emailer.send(customer["email"], subject, body):
            memory.add_event(phone, "email", "out", "email", text=subject, data={"body": body})


def handle_whatsapp_message(message: dict) -> None:
    phone = memory.normalize_phone(message["from"])
    customer = memory.ensure_customer(phone)
    text = message["text"].strip()
    if not memory.add_event(phone, "whatsapp", "in", "message", text=text or f"[{message['type']}]",
                            ref_id=message["id"]):
        return  # Meta delivered the same message twice
    memory.mark_inbound(phone)

    if customer["do_not_contact"]:
        return
    if text.lower() in STOP_WORDS:
        memory.set_do_not_contact(phone)
        _send_reply(phone, STOP_REPLY)
        return

    if message["type"] != "text":
        answer = "अभी मैं सिर्फ़ text message पढ़ सकती हूँ। अपना सवाल लिखकर भेज दीजिए।"
    else:
        answer = llm.reply(WHATSAPP_AGENT_PROMPT + "\n\n" + memory_block(phone), _chat_messages(phone))
    _send_reply(phone, answer or FALLBACK_REPLY)


def memory_block(phone: str) -> str:
    """The customer's memory as plain text for the WhatsApp agent."""
    calls = memory.calls(phone)
    if not calls:
        return "MEMORY: no call with this customer is on record. Help with what they ask, from the FACTS."
    lines = ["MEMORY — THE LATEST CALL (" + calls[-1]["created_at"][:16].replace("T", " ") + " UTC)"]
    latest = calls[-1]["data"] or {}
    for key, label in MEMORY_FIELDS:
        value = latest.get(key)
        if value and value not in ("none", "notDiscussed"):
            lines.append(f"- {label}: {value}")
    for older in reversed(calls[:-1][-3:]):
        lines.append(f"EARLIER CALL ({older['created_at'][:10]}): {(older['data'] or {}).get('callSummary', '')}")
    return "\n".join(lines)


def _chat_messages(phone: str) -> list[dict]:
    return [
        {"role": "user" if e["direction"] == "in" else "assistant", "content": e["text"] or ""}
        for e in memory.whatsapp_history(phone)
    ]


def _send_reply(phone: str, text: str) -> None:
    message_id = whatsapp.send_text(phone, text)
    if message_id:
        memory.add_event(phone, "whatsapp", "out", "message", text=text, ref_id=_ref(message_id))


def _ref(message_id: str) -> str | None:
    return None if message_id == "dry-run" else message_id


def _indian(digits: str) -> str:
    """500000 -> 5,00,000"""
    head, tail = digits[:-3], digits[-3:]
    groups = []
    while len(head) > 2:
        groups.insert(0, head[-2:])
        head = head[:-2]
    return ",".join(([head] if head else []) + groups + [tail])


def _email_body(customer: dict, call: dict) -> str:
    def field(key: str) -> str:
        value = call.get(key, "")
        return "" if value in ("", "none", "notDiscussed") else value

    lines = [f"Dear {customer['name']},", "",
             "Thank you for speaking with Bharat Petroleum Smart Fleet today. Here is a summary of the call.", "",
             call.get("callSummary", ""), ""]
    if field("rechargeAmount").isdigit():
        lines.append(f"Recharge you planned: ₹{_indian(call['rechargeAmount'])}"
                     + (f", {call['rechargeWhen']}" if field("rechargeWhen") else ""))
    if field("openQuestions"):
        lines.append(f"Your questions: {call['openQuestions']}")
    lines += ["",
              "How to do it yourself, in the Hello BPCL for Business App:",
              "- Recharge the wallet: Smart Fleet > Recharge, by UPI, debit or credit card, or net banking.",
              "- Bonus offer: one single recharge of ₹5,00,000 or more by 20 October 2026 earns 5,000 bonus Petro miles.",
              "- Petro miles: the Rewards section.",
              "- Fuel credit: Smart Fleet > Fuel credit, choose Sundaram Finance or Shriram Finance.",
              "- A card for a truck: add a free virtual card, ready in about 15 minutes.",
              "",
              "Any question? Reply to us on WhatsApp, on the same chat.",
              "We will never ask for your OTP, PIN, card or bank details.",
              "",
              "Bharat Petroleum Smart Fleet (demo)"]
    return "\n".join(lines)
