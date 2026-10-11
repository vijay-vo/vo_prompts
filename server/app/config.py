"""Settings, read once from the environment (.env in the server folder)."""
import os
from pathlib import Path

from dotenv import load_dotenv

SERVER_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVER_DIR / ".env")


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _flag(name: str, default: str) -> bool:
    return _env(name, default).lower() in ("1", "true", "yes", "on")


# When true, nothing leaves the server: WhatsApp and email are printed instead of sent.
DRY_RUN = _flag("DRY_RUN", "true")

DB_PATH = Path(_env("DB_PATH") or SERVER_DIR / "memory.db")

# Shared secret the VoiceOwl HTTP node sends in the X-Webhook-Token header. Empty = not checked.
WEBHOOK_TOKEN = _env("WEBHOOK_TOKEN")
# Password for the memory viewer, the demo screen and the reset endpoint. Empty = open (local only!).
ADMIN_TOKEN = _env("ADMIN_TOKEN")

# Meta WhatsApp Cloud API
WHATSAPP_TOKEN = _env("WHATSAPP_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = _env("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_BUSINESS_ACCOUNT_ID = _env("WHATSAPP_BUSINESS_ACCOUNT_ID")  # only used by check_setup.py
WHATSAPP_VERIFY_TOKEN = _env("WHATSAPP_VERIFY_TOKEN", "smartfleet-demo")
WHATSAPP_APP_SECRET = _env("WHATSAPP_APP_SECRET")  # empty = signature not checked
WHATSAPP_TEMPLATE_NAME = _env("WHATSAPP_TEMPLATE_NAME", "smartfleet_call_summary")
WHATSAPP_TEMPLATE_LANG = _env("WHATSAPP_TEMPLATE_LANG", "hi")
# true: the template has one body variable {{1}} that takes the call summary.
# false: a template with no variables (such as Meta's ready-made hello_world); the summary is then
# held back and sent as the first message after the customer replies.
WHATSAPP_TEMPLATE_HAS_SUMMARY = _flag("WHATSAPP_TEMPLATE_HAS_SUMMARY", "true")
GRAPH_API_VERSION = _env("GRAPH_API_VERSION", "v23.0")

# Any OpenAI-compatible chat API: Groq, NVIDIA, Azure OpenAI (v1 endpoint), ...
LLM_BASE_URL = _env("LLM_BASE_URL")
LLM_API_KEY = _env("LLM_API_KEY")
LLM_MODEL = _env("LLM_MODEL")
LLM_TEMPERATURE = _env("LLM_TEMPERATURE", "0.4")  # empty = not sent (some models reject it)

# Gmail SMTP (needs an App Password, not the normal Gmail password)
GMAIL_ADDRESS = _env("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = _env("GMAIL_APP_PASSWORD")
EMAIL_FROM_NAME = _env("EMAIL_FROM_NAME", "Bharat Petroleum Smart Fleet (demo)")

# The demo customer's profile, given to every new phone number
DEMO_CUSTOMER_NAME = _env("DEMO_CUSTOMER_NAME", "Suresh Yadav")
DEMO_CUSTOMER_BUSINESS = _env("DEMO_CUSTOMER_BUSINESS", "Yadav Roadlines")
DEMO_CUSTOMER_EMAIL = _env("DEMO_CUSTOMER_EMAIL")

DEFAULT_COUNTRY_CODE = _env("DEFAULT_COUNTRY_CODE", "91")


def problems() -> list[str]:
    """Missing settings, as readable lines. Shown at startup and on /health."""
    missing = []
    if not DRY_RUN:
        if not (WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID):
            missing.append("WhatsApp: WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are needed to send")
        if not (GMAIL_ADDRESS and GMAIL_APP_PASSWORD):
            missing.append("Email: GMAIL_ADDRESS and GMAIL_APP_PASSWORD are not set, email is skipped")
    if not DEMO_CUSTOMER_EMAIL:
        missing.append("Email: DEMO_CUSTOMER_EMAIL is not set, email is skipped")
    if not (LLM_API_KEY and LLM_MODEL):
        missing.append("Model: LLM_API_KEY and LLM_MODEL are needed for WhatsApp replies")
    if not WHATSAPP_APP_SECRET:
        missing.append("Security: WHATSAPP_APP_SECRET is not set, Meta's signature is not checked")
    if not WEBHOOK_TOKEN:
        missing.append("Security: WEBHOOK_TOKEN is not set, anyone can post to /voice/post-call")
    if not ADMIN_TOKEN:
        missing.append("Security: ADMIN_TOKEN is not set, the memory viewer is open to anyone")
    return missing
