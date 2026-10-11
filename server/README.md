# Smart Fleet WhatsApp omnichannel server

Receives the post-call JSON from VoiceOwl, keeps the customer memory, sends the WhatsApp
follow-up and the support email, and answers the customer's WhatsApp replies.

**Setup, step by step: [../SETUP_GUIDE.md](../SETUP_GUIDE.md).** Design: [../OMNICHANNEL.md](../OMNICHANNEL.md).

```powershell
powershell -ExecutionPolicy Bypass -File run.ps1    # start (first run installs and creates .env)
.venv\Scripts\python smoke_test.py                  # offline test of the whole flow
.venv\Scripts\python check_setup.py                 # check every key, messages nobody
.venv\Scripts\python send_test_call.py --phone 9876543210   # pretend to be VoiceOwl
```

| Endpoint | Who calls it |
|---|---|
| `POST /voice/post-call` | the VoiceOwl HTTP node (header `X-Webhook-Token`) |
| `GET/POST /whatsapp/webhook` | Meta: verification, incoming messages, delivery receipts |
| `GET /demo?token=…` | you: the live demo screen |
| `GET /customers?token=…`, `GET/DELETE /customers/{phone}?token=…` | you: memory, reset |
| `GET /health` | anyone: status and setup warnings |
