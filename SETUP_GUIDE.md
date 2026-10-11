# Setup guide: Smart Fleet WhatsApp omnichannel demo

This guide takes you from nothing to a working demo:

> Urja calls the fleet owner about a low wallet → the call ends → VoiceOwl's post-call analysis
> produces a flat JSON → the HTTP node posts it to **our server** → the server saves it to the
> customer's memory, sends the **WhatsApp** summary and a support **email** → the owner replies on
> WhatsApp → our WhatsApp agent answers, **knowing everything said on the call**.

All the code is written and tested. You only create the accounts, paste keys into one file
(`server/.env`) and run it. Plan about **1 to 1.5 hours** the first time, most of it on Meta.

---

## Contents

0. [What you need](#0-what-you-need)
1. [Get the code and start it once](#1-get-the-code-and-start-it-once)
2. [Make up two passwords](#2-make-up-two-passwords)
3. [Groq (the model for WhatsApp replies)](#3-groq-the-model-for-whatsapp-replies)
4. [Gmail (the support email)](#4-gmail-the-support-email)
5. [WhatsApp (Meta Cloud API, free test number)](#5-whatsapp-meta-cloud-api-free-test-number)
6. [Check every key](#6-check-every-key)
7. [Start the server and give it a public address](#7-start-the-server-and-give-it-a-public-address)
8. [Connect Meta's webhook](#8-connect-metas-webhook)
9. [Test the whole flow without a voice call](#9-test-the-whole-flow-without-a-voice-call)
10. [Connect VoiceOwl](#10-connect-voiceowl)
11. [Run the demo](#11-run-the-demo)
12. [Troubleshooting](#12-troubleshooting)
13. [Optional: run it on a cloud server](#13-optional-run-it-on-a-cloud-server)
14. [How it works and where everything is](#14-how-it-works-and-where-everything-is)

---

## 0. What you need

| Thing | Why | Cost |
|---|---|---|
| Windows laptop with **Python 3.10+** (you have 3.12) | runs the server | free |
| A **Facebook account** and a **Meta Business** account (created during step 5) | WhatsApp Cloud API | free test number |
| A **phone with WhatsApp** for the "customer" (yours) | receives the demo messages | free |
| A **Groq** account | the model behind WhatsApp replies | free tier |
| A **Gmail** account with 2-Step Verification | sends the email | free |
| **cloudflared** | gives your laptop a public HTTPS address | free |
| Your **VoiceOwl** workspace | the voice call, post-call analysis and HTTP node | — |

---

## 1. Get the code and start it once

Open PowerShell:

```powershell
cd C:\Users\vijay\Desktop\vo
git checkout whatsapp-omnichannel-demo
git pull
cd server
powershell -ExecutionPolicy Bypass -File run.ps1
```

The first run creates the Python environment (`.venv`), installs the packages and creates
**`server\.env`** from `.env.example`, then stops and asks you to fill it in. Every key in the
following steps goes into **`server\.env`**. Open it in VS Code.

Optional, to see that everything works before any key is in:

```powershell
.venv\Scripts\python smoke_test.py
```

It ends with `SMOKE TEST PASSED`. Nothing is sent; it runs the whole flow against fake services.

---

## 2. Make up two passwords

In `.env`, replace the two placeholders with long random words of your own:

```ini
WEBHOOK_TOKEN=<something long, e.g. sf-hook-7Gq2xL9pRt>
ADMIN_TOKEN=<something long, e.g. sf-admin-K3vN8wQz>
```

- `WEBHOOK_TOKEN` is what VoiceOwl's HTTP node sends so that only VoiceOwl can post calls.
- `ADMIN_TOKEN` opens the demo screen and the memory viewer.

---

## 3. Groq (the model for WhatsApp replies)

1. Go to **console.groq.com** and sign in.
2. **API Keys → Create API Key**. Copy it (it is shown once).
3. **Docs → Models**: pick a current, large **chat/instruct** model that handles Hindi and
   Hinglish well (a 70B-class Llama, or the biggest general model listed). Copy its **model id**
   exactly as written there.
4. In `.env`:

```ini
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_...
LLM_MODEL=<the model id>
LLM_TEMPERATURE=0.4
```

To switch to NVIDIA or Azure OpenAI later, change only these lines; `.env.example` has both
written out. If a model returns an error about `temperature`, leave `LLM_TEMPERATURE=` empty.

---

## 4. Gmail (the support email)

1. Sign in to the Gmail account that will **send** the email.
2. **myaccount.google.com → Security → 2-Step Verification**: turn it on if it is off.
3. Open **myaccount.google.com/apppasswords**, name it `smartfleet`, **Create**. Google shows a
   16-letter password. Copy it.
4. In `.env`:

```ini
GMAIL_ADDRESS=yourname@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
DEMO_CUSTOMER_EMAIL=<the inbox where the demo email should arrive, e.g. your own>
```

The normal Gmail password does **not** work here; only the App Password does.

---

## 5. WhatsApp (Meta Cloud API, free test number)

### 5.1 Create the app

1. Go to **developers.facebook.com**, log in, **My Apps → Create App**.
2. Choose the use case **Connect with customers through WhatsApp** (or app type **Business**),
   give it a name such as `Smart Fleet Demo`, and create it. If asked for a Business portfolio,
   create one (any name, e.g. `VoiceOwl Demo`).
3. In the app's left menu open **WhatsApp → API Setup**.

### 5.2 Test number, recipient and IDs

On **API Setup**:

1. **From**: Meta has already given you a **test phone number**. Below it you see the
   **Phone number ID** and the **WhatsApp Business Account ID**. Copy both.
2. **To**: click **Manage phone number list** → **Add phone number** → enter the demo
   customer's WhatsApp number (your phone) → enter the code WhatsApp sends you. Up to 5 numbers.
   A test number can **only** message numbers on this list.
3. Click **Send message** once: you should get Meta's "Hello World" message on your phone.
   **Reply "Hi" to it** — this also opens the 24-hour chat window used in step 9.

### 5.3 A token that does not expire after 24 hours

The token on API Setup works for 24 hours only. For the demo make a permanent one:

1. **business.facebook.com → Settings (Business settings) → Users → System users → Add**.
   Name `smartfleet-server`, role **Admin**.
2. Select the new user → **Assign assets** → **Apps** → your app → **Full control**. Also assign
   your **WhatsApp account** with full control.
3. **Generate new token** → choose your app → expiry **Never** → tick
   `whatsapp_business_messaging` and `whatsapp_business_management` → **Generate**. Copy it.

(Short on time? Paste the 24-hour token from API Setup now and do this later.)

### 5.4 App secret

**App settings → Basic → App secret → Show**. Copy it.

### 5.5 Fill in `.env`

```ini
WHATSAPP_TOKEN=<the permanent token>
WHATSAPP_PHONE_NUMBER_ID=<Phone number ID>
WHATSAPP_BUSINESS_ACCOUNT_ID=<WhatsApp Business Account ID>
WHATSAPP_VERIFY_TOKEN=smartfleet-demo
WHATSAPP_APP_SECRET=<App secret>
```

### 5.6 The message template (submit it now; approval can take a while)

WhatsApp lets a business start a conversation only with an **approved template**. Ours carries
the call summary.

1. **business.facebook.com → WhatsApp Manager → Message templates → Create template**.
2. Category **Utility**. Name `smartfleet_call_summary`. Language **Hindi**.
3. Body, **exactly** this (it must match the server's text word for word):

   ```
   नमस्ते! Bharat Petroleum Smart Fleet की आज की call के लिए धन्यवाद। {{1}} कोई भी सवाल हो तो इसी chat पर reply कीजिए।
   ```

4. Sample for `{{1}}`:
   `आपने आज शाम App से ₹5,00,000 का recharge करने का तय किया है।`
5. **Submit**. Meta may move it to the Marketing category; that is fine for the demo.

Until it shows **Active / Approved**, use Meta's ready-made template. In `.env`:

```ini
WHATSAPP_TEMPLATE_NAME=hello_world
WHATSAPP_TEMPLATE_LANG=en_US
WHATSAPP_TEMPLATE_HAS_SUMMARY=false
```

With `hello_world`, the owner first gets "Hello World", and the moment they reply, the server
sends the call summary and carries on the chat. Once your template is approved, switch back:

```ini
WHATSAPP_TEMPLATE_NAME=smartfleet_call_summary
WHATSAPP_TEMPLATE_LANG=hi
WHATSAPP_TEMPLATE_HAS_SUMMARY=true
```

**Shortcut for any demo:** if the customer's phone has sent the test number any message in the
last 24 hours, the server skips the template and sends the summary as a normal message.

---

## 6. Check every key

```powershell
.venv\Scripts\python check_setup.py
```

It checks the model, the WhatsApp token and number, the template's approval and the Gmail
login, **without messaging anyone**:

```
[OK  ] Model: <model> answered 'ready'
[OK  ] WhatsApp: sending from +1 555 ... (Test Number)
[OK  ] Template: smartfleet_call_summary (hi) is APPROVED
[OK  ] Gmail: logged in as yourname@gmail.com
[OK  ] Demo email address: you@example.com
```

Fix any `FAIL` with the hint it prints (also see [Troubleshooting](#12-troubleshooting)).
A template that is still `PENDING` is fine while you use `hello_world`.

Then turn real sending on in `.env`:

```ini
DRY_RUN=false
```

---

## 7. Start the server and give it a public address

Meta and VoiceOwl must reach your laptop over HTTPS. Use two PowerShell windows.

**Window 1, the server:**

```powershell
cd C:\Users\vijay\Desktop\vo\server
powershell -ExecutionPolicy Bypass -File run.ps1
```

It prints `Application startup complete` and a `SETUP:` line for anything still missing.

**Window 2, the tunnel** (install once with `winget install --id Cloudflare.cloudflared`):

```powershell
cloudflared tunnel --url http://localhost:8000
```

It prints an address like `https://quiet-river-1234.trycloudflare.com`. That is
**`<public-url>`** in the rest of this guide. Open `<public-url>/health` in a browser: you should
see `"ok": true`.

The address changes every time cloudflared restarts; then update it in Meta (step 8) and VoiceOwl
(step 10). For a fixed address use a named Cloudflare tunnel, ngrok with a reserved domain, or
step 13.

---

## 8. Connect Meta's webhook

This is how the owner's WhatsApp replies reach the server.

1. developers.facebook.com → your app → **WhatsApp → Configuration**.
2. **Webhook → Edit**:
   - Callback URL: `<public-url>/whatsapp/webhook`
   - Verify token: `smartfleet-demo` (the value of `WHATSAPP_VERIFY_TOKEN`)
   - **Verify and save**. Window 1 prints `Meta webhook verified`.
3. **Webhook fields → Manage** → subscribe to **messages**.

Test it: send "hello" from your phone to the test number. Window 1 shows
`WhatsApp in from 91...: hello`, and a reply arrives on your phone within a few seconds.

---

## 9. Test the whole flow without a voice call

`send_test_call.py` pretends to be VoiceOwl's HTTP node and posts a sample call. Window 3:

```powershell
cd C:\Users\vijay\Desktop\vo\server
.venv\Scripts\python send_test_call.py --phone <your WhatsApp number, e.g. 9876543210>
```

You should see:

1. `200 {"status":"saved",...}` in this window.
2. On your phone: the WhatsApp summary (or "Hello World", if you are on `hello_world`; reply
   anything to get the summary).
3. In `DEMO_CUSTOMER_EMAIL`'s inbox: "Smart Fleet: summary of today's call".
4. Reply on WhatsApp, e.g. `fuel credit ke liye kaun se papers chahiye?` — the answer uses the
   call's memory.
5. Open the demo screen: **`<public-url>/demo?token=<ADMIN_TOKEN>`** (or
   `http://127.0.0.1:8000/demo?token=<ADMIN_TOKEN>`). The call, the WhatsApp chat and the email
   sit on one timeline, and the right panel shows exactly what the WhatsApp agent remembers.

A second scenario, a customer short of cash:

```powershell
.venv\Scripts\python send_test_call.py --phone 9876543210 --file samples/post_call_short_of_cash.json
```

---

## 10. Connect VoiceOwl

### 10.1 The voice agent

Load `outbound_smart_fleet/balance_alert/Default.txt` as the outbound agent's prompt (as before).
It now tells the owner the details will come on WhatsApp and that they can reply there.

### 10.2 The post-call analysis

Create a post-call analysis for this agent with the prompt
`outbound_smart_fleet/balance_alert/postCallAnalysis.txt`. It needs only the transcript and
returns one flat JSON object with 29 string fields. When it should run (every call, or only
connected calls) is your choice on the platform; the server handles every outcome.

### 10.3 The HTTP node

After the post-call analysis, add the HTTP node:

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `<public-url>/voice/post-call` |
| Header | `Content-Type: application/json` |
| Header | `X-Webhook-Token: <WEBHOOK_TOKEN>` |
| Body | JSON: the post-call fields, plus `customerPhone` and `callSid` |

Body, either shape works:

```json
{ "customerPhone": "<the called number>", "callSid": "<Plivo call SID>",
  "callOutcome": "...", "spokeTo": "...", "...": "all 29 post-call fields" }
```

```json
{ "customerPhone": "<the called number>", "callSid": "<Plivo call SID>",
  "postCallAnalysis": "<the whole post-call JSON, as an object or as a string>" }
```

The phone can be in any format (`+91 98765 43210`, `09876543210`, `9876543210`). Other names the
server also accepts: `phone`, `to`, `To` for the number; `CallUUID`, `call_uuid`, `callId` for
the SID. If the server rejects a post, window 1 logs the field names it received, so you can
see what VoiceOwl actually sent.

### 10.4 One real call

Call the demo phone from VoiceOwl, talk to Urja as Suresh, agree to something, and hang up.
Within a minute of the post-call analysis finishing: WhatsApp on the phone, the email in the
inbox, and the call on the demo screen.

---

## 11. Run the demo

1. Before the meeting: server and tunnel running, `check_setup.py` all OK, `DRY_RUN=false`.
   If using `hello_world`, or to be safe, send "Hi" from the demo phone to the test number
   (this opens the 24-hour window, so the summary arrives as a normal message).
2. Open the demo screen on the projector: `<public-url>/demo?token=<ADMIN_TOKEN>`.
3. Trigger the outbound call to the demo phone. Let the audience hear the call.
4. Hang up. The call appears on the screen; WhatsApp and email arrive.
5. Reply on WhatsApp with a question from the call (fuel credit papers, the bonus date,
   Petro miles for a tyre). The answer continues the call's conversation. **This is the
   omnichannel moment**: the WhatsApp agent knows what was agreed on the voice call.
6. Point at the right panel: one memory, shared by every channel.

**Run it again from a clean start:** on the demo screen, **Reset this customer**.

**What the customer can type:** anything; `STOP` stops all messages (also after future calls),
`START` turns them back on.

---

## 12. Troubleshooting

Window 1 explains every failure in plain words. The most common:

| What you see | What to do |
|---|---|
| `131030 ... not in the test number's recipient list` | Add the phone in API Setup → To → Manage phone number list (step 5.2). |
| `190 ... access token has expired` | The 24-hour token ran out. Make the permanent token (5.3). |
| `132001 ... template ... not approved` | Template still pending or the name/language is wrong. Use `hello_world` (5.6). |
| `132000 ... number of variables` | `WHATSAPP_TEMPLATE_HAS_SUMMARY` is wrong for the template: `true` for ours, `false` for `hello_world`. |
| `131047 ... more than 24 hours` | Free text outside the window. Normal; the server uses the template. If it persists, check the template settings. |
| No reply on WhatsApp, nothing in window 1 | Meta webhook not set or not subscribed to **messages** (step 8), or the tunnel address changed. |
| `bad signature` in window 1 | `WHATSAPP_APP_SECRET` is wrong (step 5.4). |
| `Meta webhook verification failed` | The verify token in Meta differs from `WHATSAPP_VERIFY_TOKEN`. |
| WhatsApp reply is "technical problem" | The model call failed; the line above it shows why (key, model id). Run `check_setup.py`. |
| `post-call rejected, phone / call SID missing. Keys received: [...]` | The HTTP node body lacks `customerPhone` or `callSid`; the log shows the names it did send. |
| `401 bad webhook token` | The HTTP node's `X-Webhook-Token` header differs from `WEBHOOK_TOKEN`. |
| `post-call ... already saved, ignored` | The same call SID was posted twice. Normal on retries. |
| `sendWhatsApp is 'no'` | The post-call analysis decided no WhatsApp (staff answered, wrong number, refusal, do-not-call, emergency). Correct behaviour. |
| Email: `Gmail refused the login` | Use the App Password (step 4), not the Gmail password. |
| No email | `DEMO_CUSTOMER_EMAIL` is empty, or the call was not with the owner. |
| Nothing sent at all, messages printed in window 1 | `DRY_RUN=true`. Set `false` and restart. |
| PowerShell refuses to run `run.ps1` | Use `powershell -ExecutionPolicy Bypass -File run.ps1`. |

---

## 13. Optional: run it on a cloud server

For a fixed address that does not depend on your laptop, deploy `server/` with its `Dockerfile`
to any host that runs containers (Render, Railway, Azure Container Apps, a VM with Docker):

- Set every `.env` value as an environment variable on the host (never upload `.env`).
- Mount a persistent disk at `/data` so the memory survives restarts.
- The host gives you a fixed HTTPS address: use it as `<public-url>` in steps 8 and 10.

```bash
docker build -t smartfleet-omnichannel server
docker run -p 8000:8000 --env-file server/.env -v smartfleet-data:/data smartfleet-omnichannel
```

---

## 14. How it works and where everything is

```
outbound_smart_fleet/balance_alert/
  Default.txt               the voice agent (Urja)
  postCallAnalysis.txt      post-call prompt -> flat JSON, 29 string fields
OMNICHANNEL.md              the design: flow, webhook contract, rules
SETUP_GUIDE.md              this file
server/
  run.ps1                   start the server (first run installs everything)
  .env.example              every setting, explained (copy to .env)
  check_setup.py            checks each key against the real service, messages nobody
  send_test_call.py         pretends to be VoiceOwl's HTTP node
  smoke_test.py             full offline test of the flow
  samples/                  sample post-call JSONs
  prompts/whatsappAgent.txt the WhatsApp agent: same facts as the call, written for chat
  app/main.py               endpoints: /voice/post-call, /whatsapp/webhook, /demo, /customers
  app/followup.py           after a call: WhatsApp + email; answering WhatsApp replies
  app/memory.py             the customer memory (SQLite file server/memory.db)
  app/whatsapp.py           Meta Cloud API: send, receipts, signature, error hints
  app/llm.py                the model call (Groq / NVIDIA / Azure, any OpenAI-compatible API)
  app/emailer.py            Gmail SMTP
  app/demo.html             the live demo screen
```

**Rules built in:**
- The same call posted twice is saved once (by `callSid`); the same WhatsApp message delivered
  twice is answered once.
- WhatsApp goes out only when the post-call analysis says `sendWhatsApp = "yes"`; email only
  when the owner was on a connected call.
- `doNotCall = "yes"` on a call, or `STOP` on WhatsApp, stops every message to that number.
- Outside WhatsApp's 24-hour window the server uses the template; inside it, a normal message.
  If the template fails or has no variable, the summary is held and sent when the owner writes.
- The WhatsApp agent gets the latest call's decisions, open questions and next best action,
  up to three earlier calls, the current date and time, and the last 20 WhatsApp messages.
- One customer's messages are answered one at a time, in order.
- Meta's delivery receipts (sent, delivered, read, failed) show on the demo screen, failures
  with the reason.
