"""What happens after a call, and how a WhatsApp message from the customer is answered."""
import logging
from datetime import datetime

from . import config, emailer, llm, memory, whatsapp
from .config import SERVER_DIR

log = logging.getLogger("followup")

WHATSAPP_AGENT_PROMPT = (SERVER_DIR / "prompts" / "whatsappAgent.txt").read_text(encoding="utf-8")

# Must match the approved template body word for word; {summary} is the template's {{1}}.
FOLLOWUP_TEXT = ("नमस्ते! Bharat Petroleum Smart Fleet की आज की call के लिए धन्यवाद। {summary} "
                 "कोई भी सवाल हो तो इसी chat पर reply कीजिए।")
STOP_WORDS = {"stop", "unsubscribe", "message mat karo", "मैसेज मत करो", "message मत करो", "बंद करो"}
START_WORDS = {"start", "subscribe"}
FALLBACK_REPLY = "माफ़ कीजिए, अभी technical problem आ रही है। कृपया थोड़ी देर बाद message कीजिए।"
STOP_REPLY = "ठीक है, अब आपको Smart Fleet से कोई message नहीं आएगा। फिर से शुरू करने के लिए START लिखें।"
START_REPLY = "स्वागत है! अब आपको Smart Fleet के message फिर से मिलेंगे। अपना सवाल लिखिए।"
NON_TEXT_REPLY = "अभी मैं सिर्फ़ text message पढ़ सकती हूँ। अपना सवाल लिखकर भेज दीजिए।"

CONNECTED = {"completed", "hungUpEarly"}
EMPTY = {"", "none", "notDiscussed"}

# Post-call fields handed to the WhatsApp agent, with their labels.
MEMORY_FIELDS = [
    ("callOutcome", "Call outcome"), ("spokeTo", "Spoke to"), ("customerMood", "Mood"),
    ("callLanguage", "Language"), ("callSummary", "Summary"),
    ("rechargeDecision", "Recharge decision"), ("rechargeAmount", "Recharge amount (₹)"),
    ("rechargeWhen", "Recharge when"), ("rechargeMode", "Recharge mode"),
    ("bonusOfferHeard", "Heard the bonus offer"), ("cashShortToday", "Short of cash"),
    ("petroMilesDecision", "Petro miles decision"), ("petroMilesInterest", "Petro miles interest"),
    ("truckNeeds", "Truck needs"), ("fuelCreditDecision", "Fuel credit decision"),
    ("fuelCreditPartner", "Preferred partner"), ("quietCardsReason", "The 2 quiet cards"),
    ("newCardsDecision", "Cards for the 2 trucks"), ("driverNetworkDecision", "Ghar / Be Cafe for drivers"),
    ("accountServiceIssue", "Account issue"), ("objections", "Objections"),
    ("openQuestions", "OPEN QUESTIONS"), ("nextBestAction", "NEXT BEST ACTION"),
]


# ---------------------------------------------------------------- after the call

def handle_call(phone: str, call: dict) -> None:
    """Runs after the post-call JSON is saved: do-not-contact, WhatsApp, email."""
    with memory.customer_lock(phone):
        customer = memory.ensure_customer(phone)

        if call.get("doNotCall") == "yes":
            memory.update_customer(phone, do_not_contact=1, pending_followup=None)
            log.info("%s asked not to be contacted: nothing sent", phone)
            return
        if customer["do_not_contact"]:
            log.info("%s is marked do-not-contact: nothing sent", phone)
            return

        if call.get("sendWhatsApp") == "yes":
            _send_followup(phone, customer, call)
        else:
            log.info("%s: sendWhatsApp is %r, no WhatsApp", phone, call.get("sendWhatsApp"))

        if call.get("spokeTo") == "owner" and call.get("callOutcome") in CONNECTED:
            _send_email(phone, customer, call)


def _send_followup(phone: str, customer: dict, call: dict) -> None:
    summary = " ".join((call.get("whatsappSummary") or "").split())
    if summary in EMPTY:
        log.warning("%s: sendWhatsApp is yes but whatsappSummary is empty, no WhatsApp", phone)
        return
    text = FOLLOWUP_TEXT.format(summary=summary)

    if memory.window_open(customer):
        # The customer wrote to us in the last 24 hours: plain text is allowed, no template needed.
        _send_and_log(phone, text, kind="message")
        return

    if config.WHATSAPP_TEMPLATE_HAS_SUMMARY:
        message_id = whatsapp.send_template(phone, [summary])
        if message_id:
            _log_out(phone, text, kind="template", message_id=message_id)
            return
        log.warning("%s: template failed, the summary is held until the customer writes", phone)
    else:
        # A template with no variables opens the chat; the summary follows when they reply.
        message_id = whatsapp.send_template(phone, [])
        if message_id:
            _log_out(phone, f"[template {config.WHATSAPP_TEMPLATE_NAME}]", kind="template", message_id=message_id)
    memory.update_customer(phone, pending_followup=text)


def _send_email(phone: str, customer: dict, call: dict) -> None:
    if not customer.get("email"):
        log.info("%s: no email address on the profile, no email", phone)
        return
    subject = "Smart Fleet: summary of today's call"
    body = email_body(customer, call)
    if emailer.send(customer["email"], subject, body):
        memory.add_event(phone, "email", "out", "email", text=subject, data={"to": customer["email"], "body": body})


# ---------------------------------------------------------------- the customer writes

def handle_whatsapp_message(message: dict) -> None:
    phone = memory.normalize_phone(message["from"])
    with memory.customer_lock(phone):
        memory.ensure_customer(phone)
        text = (message.get("text") or "").strip()
        if not memory.add_event(phone, "whatsapp", "in", "message", text=text or f"[{message['type']}]",
                                ref_id=message["id"]):
            return  # Meta delivered the same message twice
        memory.update_customer(phone, last_inbound_at=memory.now())
        whatsapp.mark_read(message["id"])
        customer = memory.get_customer(phone)

        command = text.lower().strip(" .!")
        if command in STOP_WORDS:
            memory.update_customer(phone, do_not_contact=1, pending_followup=None)
            _send_and_log(phone, STOP_REPLY)
            return
        if command in START_WORDS:
            memory.update_customer(phone, do_not_contact=0)
            _send_and_log(phone, START_REPLY)
            return

        # The customer wrote first, so the 24-hour window is open: deliver a held-back summary now.
        # If their message was only a greeting, the summary is the whole answer.
        if customer.get("pending_followup"):
            _send_and_log(phone, customer["pending_followup"])
            memory.update_customer(phone, pending_followup=None)
            if message["type"] == "text" and len(text.split()) <= 3 and "?" not in text:
                return

        if message["type"] != "text" or not text:
            _send_and_log(phone, NON_TEXT_REPLY)
            return
        answer = llm.reply(WHATSAPP_AGENT_PROMPT + "\n\n" + memory_block(phone), _chat_messages(phone))
        _send_and_log(phone, answer or FALLBACK_REPLY)


def handle_status(status: dict) -> None:
    """Meta's delivery receipts: sent, delivered, read, failed."""
    if not status.get("id"):
        return
    memory.set_status(status["id"], status["status"], status.get("error", ""))
    if status["status"] == "failed":
        log.error("WhatsApp to %s FAILED: %s", status.get("to"), status.get("error"))


# ---------------------------------------------------------------- the agent's memory

def memory_block(phone: str) -> str:
    """The customer's memory as plain text for the WhatsApp agent."""
    customer = memory.get_customer(phone) or {}
    lines = [f"NOW: {datetime.now(memory.IST).strftime('%d %B %Y, %I:%M %p')} IST",
             f"CUSTOMER: {customer.get('name', '')}, {customer.get('business', '')}"]
    calls = memory.calls(phone)
    if not calls:
        lines.append("MEMORY: no call with this customer is on record. Help with what they ask, from the FACTS.")
        return "\n".join(lines)
    latest = calls[-1]
    lines.append(f"MEMORY — THE LATEST CALL ({memory.to_ist(latest['created_at'])})")
    for key, label in MEMORY_FIELDS:
        value = (latest["data"] or {}).get(key, "")
        if value not in EMPTY:
            lines.append(f"- {label}: {value}")
    for older in reversed(calls[:-1][-3:]):
        summary = (older["data"] or {}).get("callSummary", "")
        if summary not in EMPTY:
            lines.append(f"EARLIER CALL ({memory.to_ist(older['created_at'])}): {summary}")
    lines.append("The WhatsApp chat so far follows as messages; the follow-up summary we sent is part of it.")
    return "\n".join(lines)


def _chat_messages(phone: str) -> list[dict]:
    messages = []
    for event in memory.whatsapp_history(phone):
        role = "user" if event["direction"] == "in" else "assistant"
        content = event["text"] or ""
        if messages and messages[-1]["role"] == role:  # some providers reject two same-role turns in a row
            messages[-1]["content"] += "\n" + content
        else:
            messages.append({"role": role, "content": content})
    # A held-back summary is sent just after the customer's message; the model must still answer
    # that message, so the summary goes before it.
    if len(messages) >= 2 and messages[-1]["role"] == "assistant" and messages[-2]["role"] == "user":
        messages[-1], messages[-2] = messages[-2], messages[-1]
    return messages


# ---------------------------------------------------------------- helpers

def _send_and_log(phone: str, text: str, kind: str = "message") -> None:
    message_id = whatsapp.send_text(phone, text)
    if message_id:
        _log_out(phone, text, kind, message_id)


def _log_out(phone: str, text: str, kind: str, message_id: str) -> None:
    ref = None if message_id in ("dry-run", "ok") else message_id
    memory.add_event(phone, "whatsapp", "out", kind, text=text, ref_id=ref, status="sent")


def _indian(digits: str) -> str:
    """500000 -> 5,00,000"""
    head, tail = digits[:-3], digits[-3:]
    groups = []
    while len(head) > 2:
        groups.insert(0, head[-2:])
        head = head[:-2]
    return ",".join(([head] if head else []) + groups + [tail])


def email_body(customer: dict, call: dict) -> str:
    def field(key: str) -> str:
        value = call.get(key, "")
        return "" if value in EMPTY else value

    lines = [f"Dear {customer.get('name') or 'Customer'},", "",
             "Thank you for speaking with Bharat Petroleum Smart Fleet today. Here is a summary of the call.", "",
             field("callSummary"), ""]
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
              config.EMAIL_FROM_NAME]
    return "\n".join(lines)
