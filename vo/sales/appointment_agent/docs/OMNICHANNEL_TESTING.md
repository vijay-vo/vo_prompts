# Testing emails, replies and the new prompts

Two parts: A runs everything on your laptop; B runs it on the platform. You need two email addresses:
**your sending mailbox** (the one in `.env`) and **a test inbox** (any other address you can read and reply from),
here called `TEST_EMAIL`.

## A. Local

### A0. Setup (once per terminal)

```bash
cd ~/Desktop/vo_prompts && git pull
cd vo/sales/appointment_agent/service
node test.mjs | tail -3          # "all tests passed" (mock Gmail, no real mail sent)
```

In `.env`, set `EMAIL_POLL_SECONDS=0` while testing, so mail is checked only when you call `/checkReplies`. Then:

```bash
node server.mjs                  # terminal 1; keep it running
```

In terminal 2:

```bash
cd ~/Desktop/vo_prompts/vo/sales/appointment_agent/service
export BASE=http://localhost:8787
export KEY=$(grep '^API_KEY=' .env | cut -d= -f2)
export TEST_EMAIL=you.test@example.com          # your test inbox
api() { curl -s -X POST "$BASE/$1" -H "x-api-key: $KEY" -H 'content-type: application/json' -d "${2:-{\}}" | jq .; }
curl -s $BASE/health                            # {"ok":true}
```

### A1. Earlier emails for priorContext (`/emailContext`)

```bash
api emailContext "{\"email\":\"$TEST_EMAIL\"}"
```
Expect `reason: "found"` with dated lines, or `no_emails` when you have never written to that address.
With a thread ID (from A2 or the reply above): `api emailContext "{\"email\":\"$TEST_EMAIL\",\"threadId\":\"<threadId>\"}"`.
`source` is `thread`, or `search` when the thread ID is wrong.

### A2. Ruchika AI's after-call email (starts a thread she owns)

```bash
api sendGmail "{\"to\":\"$TEST_EMAIL\",\"subject\":\"Book your VoiceOwl call with Ruchika\",\"body\":\"Hi Priya,\\n\\nThis is Ruchika AI from VoiceOwl. Thanks for your time today.\\n\\nYou can book a 15-minute call with Ruchika (Co-founder) here: https://calendar.app.google/QPAsAjq8fW6FPv9o6\\n\\nRuchika AI, VoiceOwl\"}"
```
Expect `sent: true`, a `messageId` and a `threadId`. In your sending mailbox: Sent, open the mail, ⋮ → **Show original**.
It must contain the header `X-VoiceOwl-Agent: ruchika-ai`.

### A3. Reply as the prospect, then run the gate

From the test inbox, **reply** to that mail (for example "Can we do Thursday afternoon? We get 300 calls a day."). Then:

```bash
api checkReplies
```
Expect `result: "to_reply"` for that mail. In Gmail the mail now has the labels `RuchikaAI-checked` and `RuchikaAI-to-reply`.
Calling `checkReplies` again gives `checked: 0`: each mail is looked at once.

### A4. See what is waiting for Ruchika AI

```bash
api pendingReplies
```
Each item has `messageId`, `email`, `subject`, `latestMessage` and `conversation`.

### A5. Run the email prompt on it

```bash
api pendingReplies | node fill.mjs ../email/email.txt fname=Priya company=BrightLoans "priorContext=Ruchika AI called on 25 November; the booking did not go through and we sent the booking link." > /tmp/email_prompt.txt
```
Paste the contents of `/tmp/email_prompt.txt` into any LLM chat (claude.ai or the platform playground) as one message.
It answers with `{"action": "...", "reply": "..."}`. fill.mjs prints the `messageId` on the terminal.

### A6. Send Ruchika AI's answer

Put the model's JSON into a file, `/tmp/answer.json`, and add the messageId:

```bash
jq --arg id "<messageId>" '. + {messageId: $id}' /tmp/answer.json > /tmp/send.json
api replyInThread "$(cat /tmp/send.json)"
```
Expect `sent: true`. In the test inbox the answer arrives **in the same conversation**, with the subject "Re: ...".
The prospect's mail gets `RuchikaAI-replied`.

### A7. Cases the gate must refuse (run `api checkReplies` after each)

| Do this | Expected `result` | Label |
|---|---|---|
| Send a new mail (not a reply) from the test inbox to your mailbox | `not_agent_thread` | RuchikaAI-checked only |
| Write to the test inbox by hand from Gmail, then reply to that | `not_agent_thread` | RuchikaAI-checked only |
| Forward Ruchika AI's mail to a third address and reply from there | `other_sender` | RuchikaAI-needs-human |
| In a Ruchika AI thread, reply yourself from Gmail, then reply again as the prospect | `human_took_over` | RuchikaAI-checked only |
| Add the label `RuchikaAI-off` to a Ruchika AI thread in Gmail, then reply as the prospect | `agent_off` | RuchikaAI-checked only |
| Turn on an out-of-office reply on the test inbox, then send Ruchika AI's mail again | `not_a_person` | RuchikaAI-checked only |

### A8. The email agent's other actions

Reply as the prospect, run `api checkReplies`, then try each one (one pending mail per try):

```bash
api replyInThread '{"messageId":"<id>","action":"human","reply":"Hi Priya,\n\nThanks for your email. I'\''ve passed it to our team, and someone will reply to you personally.\n\nRuchika AI, VoiceOwl"}'
api replyInThread '{"messageId":"<id>","action":"stop","reply":"none"}'
api replyInThread '{"messageId":"<id>","action":"none","reply":"none"}'
```
`human`: the handoff email is sent, and the thread gets `RuchikaAI-needs-human` and `RuchikaAI-off`. `stop`: nothing is sent, and the thread
gets the same two labels. `none`: nothing is sent, and the mail leaves the queue.
Good prospect messages to try the prompt with: "Please remove me from your list" (stop), "Can a real person call me?" (human),
"Thanks!" (none), "How much does it cost?" (reply with the price line and the link), "Are you a bot?" (reply, yes it is AI).

### A9. The priorContext summariser

```bash
api emailContext "{\"email\":\"$TEST_EMAIL\"}" | jq -r .emailContext > /tmp/emails.txt
node fill.mjs ../prior_context/prior_context.txt fname=Priya company=BrightLoans \
  "salesNotes=Head of operations at a lending company; filled the website form." \
  "callHistory=25 Nov 2026, bookingFailed: Priya said her team cannot keep up with about 300 calls a day; agreed to a demo but the booking did not go through." \
  "emailHistory=$(cat /tmp/emails.txt)" \
  "whatsappHistory=Not Available" < /dev/null > /tmp/prior_prompt.txt
```
Paste `/tmp/prior_prompt.txt` into an LLM. Expect `{"priorContext": "..."}`: 2 to 5 sentences, the last one saying what is open.
Also try it with every history `Not Available`: the answer must start "First call to them."

### A10. The call with that priorContext

Put the priorContext from A9 in the contact's `priorContext` column (or the agent variable) and make a test call.
Ruchika AI should open with "I'm following up on your email about ..." and pick up what is open, such as Thursday, then check the
calendar only after you confirm it. Then check the PCA summary: it should say the call followed up an email.

### A11. WhatsApp prompt and post-chat analysis

```bash
node fill.mjs ../whatsapp/whatsapp.txt fname=Priya company=BrightLoans "priorContext=Ruchika AI called on 25 November and could not reach them; we sent the missed-call message." < /dev/null > /tmp/wa_prompt.txt
```
Paste it as the system prompt of an LLM chat, then type as the prospect: "Hi, who is this?", "What do you do?",
"Ok send me the link", "stop messaging me". Then copy the chat as `agent:` / `customer:` lines and run:
```bash
node fill.mjs ../text_pca/text_pca.txt channel=whatsapp fname=Priya company=BrightLoans "priorContext=Not Available" < /dev/null > /tmp/tpca_prompt.txt
```
Paste `/tmp/tpca_prompt.txt` with the chat lines after it. Expect `chatResult` and the flags, such as `doNotContact: "yes"` after "stop".

## B. On the platform

The service must be reachable: `ngrok http 8787` (or the static ngrok domain), then use `https://<ngrok-host>` in place of
`localhost:8787`. Every HTTP tool sends the header `x-api-key: <API_KEY>` and `content-type: application/json`.

| What | Platform piece | Set up |
|---|---|---|
| After-call email | HTTP tool after the PCA (exists) | `POST /sendGmail`, body `{"to":"{{email}}","subject":"{{emailSubject}}","body":"{{emailMessage}}"}` |
| Email history for priorContext | HTTP tool in the journey, before the call | `POST /emailContext`, body `{"email":"{{email}}"}`; save `emailContext` as `emailHistory` |
| priorContext | LLM step after it, prompt `prior_context/prior_context.txt` | inputs fname, company, salesNotes (the CSV priorContext), callHistory, emailHistory, whatsappHistory; save the output `priorContext` on the contact, where the call agent reads it |
| Outbound call | voice agent, `default/default.txt` and `pca/pca.txt` (both changed) | publish the new versions |
| Email replies, checking | the service's own timer | `EMAIL_POLL_SECONDS=60` in `.env` (or a scheduled HTTP call to `POST /checkReplies`) |
| Email replies, answering | a scheduled flow: `POST /pendingReplies` → for each item an LLM step with `email/email.txt` (fname, company, priorContext from the contact; conversation, latestMessage from the item) → `POST /replyInThread` with `{"messageId":"<item messageId>","action":"<LLM action>","reply":"<LLM reply>"}` | When "stop" or "human" comes back, also set the contact's doNotCall or needs-human flag |
| WhatsApp replies | chat agent on the WhatsApp number, prompt `whatsapp/whatsapp.txt`, no tools | variables fname, company, priorContext (run the priorContext step when the chat starts, if the platform allows) |
| After a WhatsApp chat | post-chat analysis, prompt `text_pca/text_pca.txt` | map doNotContact, noAICalls, needsHuman and callbackTime to the contact |

Platform test, end to end:
1. Upload one contact with your own phone number and `TEST_EMAIL`, and a `salesNotes` value.
2. Call: agree to a demo but let the booking fail (or say "call me later"). The PCA email and WhatsApp arrive.
3. Reply to the email from `TEST_EMAIL`. Within a minute (the timer), `/pendingReplies` lists it. Run the reply flow and check the answer lands in the thread.
4. Reply to the WhatsApp message from your phone. The WhatsApp agent answers; try "send me the link" and "stop".
5. Start the next call from the journey. The priorContext step must mention the call, the email and the WhatsApp chat, and Ruchika AI follows up on the latest of them.
