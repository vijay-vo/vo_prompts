"""Check every key in .env against the real services, without messaging anyone.

    .venv\\Scripts\\python check_setup.py
"""
import smtplib
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).parent))
from app import config, llm  # noqa: E402

ok_count = fail_count = 0


def result(name: str, ok: bool, detail: str) -> None:
    global ok_count, fail_count
    ok_count += ok
    fail_count += not ok
    print(f"[{'OK  ' if ok else 'FAIL'}] {name}: {detail}")


print(f"DRY_RUN = {config.DRY_RUN}  (set DRY_RUN=false in .env to really send)\n")

# 1. The model
if config.LLM_API_KEY and config.LLM_MODEL:
    answer = llm.reply("Reply with exactly one word: ready", [{"role": "user", "content": "Are you there?"}])
    result("Model", bool(answer), f"{config.LLM_MODEL} answered {answer!r}" if answer
           else "no answer, see the error above (key, model id or base URL)")
else:
    result("Model", False, "LLM_API_KEY / LLM_MODEL not set")

# 2. WhatsApp token and phone number id
if config.WHATSAPP_TOKEN and config.WHATSAPP_PHONE_NUMBER_ID:
    r = httpx.get(f"https://graph.facebook.com/{config.GRAPH_API_VERSION}/{config.WHATSAPP_PHONE_NUMBER_ID}",
                  params={"fields": "display_phone_number,verified_name"},
                  headers={"Authorization": f"Bearer {config.WHATSAPP_TOKEN}"}, timeout=20)
    if r.is_success:
        info = r.json()
        result("WhatsApp", True, f"sending from {info.get('display_phone_number')} ({info.get('verified_name')})")
    else:
        error = r.json().get("error", {}) if r.headers.get("content-type", "").startswith("application/json") else {}
        from app.whatsapp import explain
        result("WhatsApp", False, explain(error.get("code"), error.get("message", r.text[:200])))
else:
    result("WhatsApp", False, "WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set")

# 3. The template, if the WhatsApp Business Account id is given
if config.WHATSAPP_TOKEN and config.WHATSAPP_BUSINESS_ACCOUNT_ID:
    r = httpx.get(f"https://graph.facebook.com/{config.GRAPH_API_VERSION}/{config.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates",
                  params={"name": config.WHATSAPP_TEMPLATE_NAME, "fields": "name,language,status"},
                  headers={"Authorization": f"Bearer {config.WHATSAPP_TOKEN}"}, timeout=20)
    found = [t for t in (r.json().get("data", []) if r.is_success else [])
             if t.get("name") == config.WHATSAPP_TEMPLATE_NAME and t.get("language") == config.WHATSAPP_TEMPLATE_LANG]
    if found:
        status = found[0].get("status")
        result("Template", status == "APPROVED", f"{config.WHATSAPP_TEMPLATE_NAME} ({config.WHATSAPP_TEMPLATE_LANG}) is {status}")
    else:
        result("Template", False, f"{config.WHATSAPP_TEMPLATE_NAME} in language {config.WHATSAPP_TEMPLATE_LANG} not found"
               + ("" if r.is_success else f" ({r.text[:150]})"))
else:
    print("[SKIP] Template: set WHATSAPP_BUSINESS_ACCOUNT_ID to check the template's approval")

# 4. Gmail
if config.GMAIL_ADDRESS and config.GMAIL_APP_PASSWORD:
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
            smtp.starttls()
            smtp.login(config.GMAIL_ADDRESS, config.GMAIL_APP_PASSWORD.replace(" ", ""))
        result("Gmail", True, f"logged in as {config.GMAIL_ADDRESS}")
    except smtplib.SMTPAuthenticationError:
        result("Gmail", False, "login refused: use a Gmail App Password (16 letters), not the normal password")
    except (smtplib.SMTPException, OSError) as error:
        result("Gmail", False, str(error))
else:
    result("Gmail", False, "GMAIL_ADDRESS / GMAIL_APP_PASSWORD not set")
result("Demo email address", bool(config.DEMO_CUSTOMER_EMAIL), config.DEMO_CUSTOMER_EMAIL or "DEMO_CUSTOMER_EMAIL not set")

print()
for problem in config.problems():
    print("note:", problem)
print(f"\n{ok_count} OK, {fail_count} to fix.")
sys.exit(1 if fail_count else 0)
