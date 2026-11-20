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
| `https://www.googleapis.com/auth/gmail.readonly` | reading the mailbox (replies, bounces) |

Click **Update**, then **Save**. Keep the two calendar scopes.

- Together this is read and write, without the power to delete mail. Do not add
  `https://mail.google.com/` (full access, including permanent delete).
- With an **Internal** consent screen there is no Google review for these scopes.

## 3. Get a token that covers Calendar and Gmail

The email goes out from the account you sign in with here, and the calendar is that account's too.

1. In the `service` folder: `node auth.mjs`
2. Open the link, sign in with the calendar account, approve. The screen lists Calendar and Gmail.
3. The terminal prints `GOOGLE_REFRESH_TOKEN=...`. Put it in `.env` in place of the old one. Press Ctrl+C.
4. Restart `node server.mjs`.

An old token made before the Gmail scopes were added keeps working for Calendar but gets 403
"insufficient authentication scopes" from Gmail.

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
