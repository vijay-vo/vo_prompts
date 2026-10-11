# Smart Fleet WhatsApp omnichannel server

Receives the post-call JSON from VoiceOwl, keeps the customer memory, sends the WhatsApp
follow-up and the support email, and answers the customer's WhatsApp replies. Flow and
contract: [../OMNICHANNEL.md](../OMNICHANNEL.md).

| Endpoint | Who calls it |
|---|---|
| `POST /voice/post-call` | the VoiceOwl HTTP node, after the post-call analysis |
| `GET/POST /whatsapp/webhook` | Meta (verification, then every incoming WhatsApp message) |
| `GET /customers/{phone}` | you, to show the shared memory during the demo |
| `GET /health` | you |

## 1. Run it locally

```powershell
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env          # then fill it in
.venv\Scripts\python smoke_test.py      # dry-run check, sends nothing
.venv\Scripts\uvicorn app.main:app --port 8000
```

Keep `DRY_RUN=true` until the keys are in; WhatsApp and email are then printed, not sent.

## 2. A public URL

Meta and VoiceOwl need an HTTPS address. Quickest free option, no account needed:

```powershell
cloudflared tunnel --url http://localhost:8000
```

It prints an `https://….trycloudflare.com` address (new on every start). `ngrok http 8000` works too.

## 3. WhatsApp (Meta Cloud API, free test number)

1. developers.facebook.com → **Create app** → Business type → add the **WhatsApp** product.
2. **WhatsApp → API Setup**: Meta gives a test number. Copy the **Phone number ID** and the
   access token into `.env`. Add up to 5 recipient numbers (the demo phone) and verify each.
   The token there lasts 24 hours; for a longer one, create a System User token in Business
   settings with the `whatsapp_business_messaging` permission.
3. **WhatsApp → Configuration → Webhook**: callback URL `https://<public-url>/whatsapp/webhook`,
   verify token = `WHATSAPP_VERIFY_TOKEN` from `.env`. Then subscribe to the **messages** field.
4. **Message template** (WhatsApp Manager → Message templates → Create): name
   `smartfleet_call_summary`, category **Utility**, language **Hindi**, body:
   `नमस्ते! Bharat Petroleum Smart Fleet की आज की call के लिए धन्यवाद। {{1}} कोई भी सवाल हो तो इसी chat पर reply कीजिए।`
   The body must stay word for word the same as `FOLLOWUP_TEXT` in `app/followup.py`.
   Meta may move it to the Marketing category; that still works for the demo.
5. App settings → Basic → **App secret** into `WHATSAPP_APP_SECRET` (checks Meta's signature).

**Demo shortcut while the template waits for approval:** send any message ("Hi") from the demo
phone to the test number before the call. That opens WhatsApp's 24-hour window, and the server
then sends the follow-up as normal text, so no template is needed.

## 4. The model (Groq)

`LLM_BASE_URL=https://api.groq.com/openai/v1`, a Groq API key, and a Groq model id in `LLM_MODEL`.
To switch to NVIDIA or Azure OpenAI later, change only these three lines (examples in `.env.example`).
The agent's prompt is [prompts/whatsappAgent.txt](prompts/whatsappAgent.txt).

## 5. Gmail

Turn on 2-Step Verification on the Gmail account, create an **App password**, and put the
address and app password in `.env`. `DEMO_CUSTOMER_EMAIL` is where the demo email goes.

## 6. The VoiceOwl HTTP node

- URL: `https://<public-url>/voice/post-call`, method POST, `Content-Type: application/json`.
- Header `X-Webhook-Token: <WEBHOOK_TOKEN>` if you set one.
- Body: the post-call JSON fields, plus `customerPhone` and `callSid` (the Plivo call SID).
  The post-call output may also arrive as one field holding the JSON (string or object): the
  server unpacks it, and the top-level `customerPhone` / `callSid` win.

## During the demo

Open `https://<public-url>/customers/<demo phone>` to show the one memory: the call, the
WhatsApp messages and the email on one timeline, and exactly what the WhatsApp agent knows.
