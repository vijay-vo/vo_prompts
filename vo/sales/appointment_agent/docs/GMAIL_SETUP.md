# Gmail for the after-call email

Updated 2026-11-20. The after-call email goes out through **our service's `POST /sendGmail` route**, the same
service that books demos. The platform calls it with one HTTP tool, sending the PCA's `emailSubject` and
`emailMessage`. The service swaps the refresh token in `.env` for a short-lived bearer token and sends the
mail through the Gmail API. Google secrets stay in `.env` and never go into the platform.

Why not call Gmail directly from the platform: Gmail only accepts a bearer (access) token, which lasts about
one hour. A platform HTTP tool cannot refresh it, so a pasted token stops working within the hour.

What already exists: the Google Cloud project, the Calendar API, an Internal OAuth consent screen, and
a Desktop-app OAuth client.

---

## 1. Enable the Gmail API

Google Cloud console → the same project → **APIs & Services → Library** → **Gmail API** → **Enable**.

## 2. Add the Gmail scopes to the consent screen

**Google Auth Platform → Data Access → Add or remove scopes.** Add:

| Scope | Allows |
|---|---|
| `https://www.googleapis.com/auth/gmail.send` | sending email as the signed-in account |
| `https://www.googleapis.com/auth/gmail.readonly` | reading the mailbox (earlier emails, replies, bounces) |
| `https://www.googleapis.com/auth/gmail.modify` | adding labels, such as "Tanya replied" (added 2026-11-25) |

Click **Update**, then **Save**. Keep the two calendar scopes.

- Together this is read, send and label. `gmail.modify` can move mail to Trash but cannot delete it permanently. Do not add
  `https://mail.google.com/` (full access, including permanent delete).
- With an **Internal** consent screen there is no Google review for these scopes.

## 3. Get a token that covers Calendar and Gmail

The email goes out from the account you sign in with here, and the calendar is that account's too.

1. Stop `node server.mjs`, then in the `service` folder: `node auth.mjs`
2. Open the link, sign in with the calendar account, approve. The screen lists Calendar and Gmail (read, send, and manage labels).
3. The terminal prints `GOOGLE_REFRESH_TOKEN=...`. Put it in `.env` in place of the old one. Press Ctrl+C.
4. Restart `node server.mjs`.

An old token keeps working for what it already had, but gets 403 "insufficient authentication scopes"
for anything newer. After adding `gmail.modify` (2026-11-25), repeat this step once.

## 4. Test the route

```bash
curl -s -X POST https://<your-ngrok-host>/sendGmail \
  -H "x-api-key: <API_KEY>" -H "content-type: application/json" \
  -d '{"to":"you@example.com","subject":"VoiceOwl test email","body":"Hi,\n\nThis is a test.\n\nTanya, VoiceOwl"}'
```

Expected: `{"sent":true,"toolResponse":"Success: The email was sent.","messageId":"18c..."}` and the email in
the inbox. The server log shows the subject and `"to":"***"`.

## 5. The platform HTTP tool (sendGmail)

| Part | Value |
|---|---|
| Method and URL | `POST https://<your-host>/sendGmail` |
| Headers | `x-api-key: <API_KEY>`, `content-type: application/json` |
| Query parameters | none |
| Body | `{"to":"{{email}}","subject":"{{emailSubject}}","body":"{{emailMessage}}"}` |
| When | after the PCA, once per call |

`to` is the contact's `email`; `subject` and `body` are the PCA's `emailSubject` and `emailMessage`.
A `\n\n` in the body, as real line breaks or as the two characters `\n`, becomes a blank line.

Replies (always HTTP 200, so the platform never retries a send):

| Case | Reply |
|---|---|
| Sent | `{"sent":true,"toolResponse":"Success: The email was sent.","messageId":"18c..."}` |
| PCA wrote "none" (no message for this call) | `{"sent":false,"reason":"nothing_to_send","toolResponse":"Success: No email was needed for this call."}` |
| `to` missing, Not Available or not an address | `{"sent":false,"reason":"bad_address","toolResponse":"Failure: The email address is not valid."}` |
| Gmail or token failure | `{"sent":false,"reason":"error","toolResponse":"Failure: The email could not be sent."}` |

So the platform can call the tool after every call: when the PCA wrote "none", nothing is sent. A wrong
`x-api-key` gets 401.

## 6. Before going live

- **DKIM:** Google Admin console → Apps → Google Workspace → Gmail → **Authenticate email** → DKIM on
  for voiceowl.ai, so the email does not land in spam.
- **Daily limit:** about 2,000 emails a day per Workspace user (fewer on trial accounts).
- **Replies and bounces** land in the sending inbox; someone should watch it.
- **The refresh token can send email as that account.** Keep it only in the git-ignored `.env`. Revoke it at
  myaccount.google.com → Security → Third-party access if it leaks.
- **A separate sending address later** (such as demos@voiceowl.ai) means signing in with that account in
  step 3; move the calendar to it too, so one token still serves both.

## 7. Earlier emails with a prospect: `POST /emailContext` (added 2026-11-25)

For priorContext before a call. The service finds the prospect's emails by their address, so no thread ID
is needed.

| Part | Value |
|---|---|
| Body | `{"email":"{{email}}"}` or `{"email":"{{email}}","threadId":"..."}` (threadId optional) |
| threadId given and the thread is theirs | that thread is read |
| no threadId, or a wrong one | the mailbox is searched: `{from:<email> to:<email> cc:<email>}` |

Kept: the last 5 real emails (`EMAIL_CONTEXT_MESSAGES` in `.env`), oldest first, new text only (quoted history
removed), up to about 1,500 characters each. Left out: calendar notices, bounces, auto-replies, bulk mail.

Reply (always HTTP 200):
```json
{"found":2,"reason":"found","source":"search",
 "emailContext":"12 Nov 2026, we wrote, subject \"...\": ...\n13 Nov 2026, they wrote, subject \"...\": ...",
 "threadId":"18c..."}
```
`reason`: `found`, `no_emails` (emailContext "No earlier emails."), `bad_address` or `error` (both "Not Available").
Dates are in the sales timezone (`SALES_TZ`). "we" is anyone writing from this mailbox, Tanya or the team.

## 8. Email replies: Tanya answers only her own prospects (added 2026-11-25)

| Route | Body | Does |
|---|---|---|
| `POST /checkReplies` | `{}` | Looks at every new incoming mail once and runs the gate. Runs by itself every `EMAIL_POLL_SECONDS`. |
| `POST /pendingReplies` | `{}` | Lists mails waiting for Tanya: `messageId`, `threadId`, `email`, `subject`, `latestMessage` (new text only), `conversation` (the thread as dated lines). |
| `POST /replyInThread` | `{"messageId":"...","action":"reply","reply":"..."}`: the email agent's JSON (email/email.txt) plus the messageId | Runs the gate again, then acts. `reply`: sends it in the same thread ("Re: subject", In-Reply-To, References, the Tanya header). `human`: sends the handoff email, then labels `Tanya-needs-human` and `Tanya-off`. `stop`: sends nothing, labels `Tanya-needs-human` and `Tanya-off` (record the opt-out on the platform). `none`: sends nothing. Without `action` it is `reply`, and `body` works in place of `reply`. |

**The gate.** Tanya may answer only when all of these hold. Otherwise she leaves the mail alone and the inbox works as usual.
1. Tanya started the thread: it holds a mail from Sent with `X-VoiceOwl-Agent: tanya`. Every /sendGmail and /replyInThread
   mail carries this header. A mail sent any other way, including by hand, does not count.
2. The sender is the address Tanya wrote to. Anyone else gets `Tanya-needs-human`.
3. The contact is still in the funnel (platform database; not checked locally).
4. Nobody from our side has replied by hand since Tanya's last mail, and no mail in the thread has `Tanya-off`.
5. A person wrote it: not an auto-reply, bounce, calendar notice or bulk mail.
6. At most 3 Tanya mails in the last 24 hours and 10 in all, and the mail came within 30 days of her last one.
   Otherwise it gets `Tanya-needs-human`.

**Labels** (created on first use; they hold all the state, there is no database):

| Label | Meaning |
|---|---|
| `Tanya-checked` | the service has looked at this mail |
| `Tanya-to-reply` | passed the gate, waiting for an answer |
| `Tanya-replied` | Tanya answered it |
| `Tanya-needs-human` | a person should look |
| `Tanya-off` | **set by the team** on a thread to stop Tanya there for good |

Test it: send an after-call mail with /sendGmail to your own second address and reply from that address.
Then `POST /checkReplies` shows `to_reply`, `/pendingReplies` lists the mail, and `/replyInThread` answers it in the same
thread. A reply from a third address gets `other_sender`.
