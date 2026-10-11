"""Settings, read once from the environment (.env in the server folder)."""
import os
from pathlib import Path

from dotenv import load_dotenv

SERVER_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVER_DIR / ".env")


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


# When true, nothing leaves the server: WhatsApp and email are printed instead of sent.
DRY_RUN = _env("DRY_RUN", "true").lower() == "true"

DB_PATH = Path(_env("DB_PATH") or SERVER_DIR / "memory.db")

# Shared secret the VoiceOwl HTTP node sends in the X-Webhook-Token header. Empty = not checked.
WEBHOOK_TOKEN = _env("WEBHOOK_TOKEN")

# Meta WhatsApp Cloud API
WHATSAPP_TOKEN = _env("WHATSAPP_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = _env("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_VERIFY_TOKEN = _env("WHATSAPP_VERIFY_TOKEN")
WHATSAPP_APP_SECRET = _env("WHATSAPP_APP_SECRET")  # empty = signature not checked
WHATSAPP_TEMPLATE_NAME = _env("WHATSAPP_TEMPLATE_NAME", "smartfleet_call_summary")
WHATSAPP_TEMPLATE_LANG = _env("WHATSAPP_TEMPLATE_LANG", "hi")
GRAPH_API_VERSION = _env("GRAPH_API_VERSION", "v23.0")

# Any OpenAI-compatible chat API: Azure OpenAI (v1 endpoint), NVIDIA, xAI Grok, ...
LLM_BASE_URL = _env("LLM_BASE_URL")
LLM_API_KEY = _env("LLM_API_KEY")
LLM_MODEL = _env("LLM_MODEL")

# Gmail SMTP (needs an App Password, not the normal Gmail password)
GMAIL_ADDRESS = _env("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = _env("GMAIL_APP_PASSWORD")

# The demo customer's profile
DEMO_CUSTOMER_NAME = _env("DEMO_CUSTOMER_NAME", "Suresh Yadav")
DEMO_CUSTOMER_BUSINESS = _env("DEMO_CUSTOMER_BUSINESS", "Yadav Roadlines")
DEMO_CUSTOMER_EMAIL = _env("DEMO_CUSTOMER_EMAIL")

DEFAULT_COUNTRY_CODE = _env("DEFAULT_COUNTRY_CODE", "91")
