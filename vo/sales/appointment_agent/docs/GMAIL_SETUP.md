# Sending the after-call email with the Gmail API

Written 2026-11-20. Goal: after each call, send the PCA's `emailSubject` and `emailMessage` to the
prospect from a voiceowl.ai Gmail account, through the Gmail API, using the same Google Cloud project
and OAuth client as the calendar tools.

What already exists: the Google Cloud project, the Google Calendar API, an Internal OAuth consent
screen, a Desktop-app OAuth client, and `service/auth.mjs`, which gets a refresh token for
`GOOGLE_REFRESH_TOKEN` in `.env`.

---

## 1. Enable the Gmail API

Google Cloud console → the same project → **APIs & Services → Library** → search **Gmail API** →
**Enable**.

## 2. Add the Gmail scopes to the consent screen

**Google Auth Platform → Data Access → Add or remove scopes.** Add:

| Scope | What it allows | Why |
|---|---|---|
| `https://www.googleapis.com/auth/gmail.send` | send email as the signed-in account | the after-call email |
| `https://www.googleapis.com/auth/gmail.readonly` | read the mailbox | later: read prospects' replies and bounces |

Click **Update**, then **Save**.

- These two together are "read and write" without the power to delete mail. Avoid
  `https://mail.google.com/` (full access, including permanent delete).
- Gmail read scopes are "restricted" scopes. With an **Internal** consent screen (voiceowl.ai users
  only) there is no Google review. If the screen were External, Google would require a security
  review before production use.
- Keep the two calendar scopes that are already there.

## 3. No new OAuth client

Use the same Desktop-app client (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

## 4. Decide which mailbox sends the email

The email goes out from the Google account you sign in with in step 5. One refresh token covers one
account, for both Calendar and Gmail.

| Option | How | Notes |
|---|---|---|
| A. Same account as the calendar (now vijay.c@voiceowl.ai) | sign in with it in step 5 | simplest; prospects' replies land in that inbox |
| B. A shared sales address, e.g. demos@voiceowl.ai | create the user in Google Admin, move the demo calendar to it (or share Vijay's calendar with it and set `CALENDAR_ID`), sign in with it in step 5 | best long term: invites and emails come from one team address |
| C. Vijay's account, "From" shown as demos@voiceowl.ai | in Gmail settings → Accounts → **Send mail as**, add demos@voiceowl.ai (a group or alias) and verify it | the service then sets `From: demos@voiceowl.ai` |

Recommended: A for testing now, B before real campaigns.

## 5. Get a new refresh token with Calendar and Gmail scopes

The refresh token in `.env` only carries the calendar scopes, so it cannot send mail.

1. In `service/auth.mjs`, the `scope` list gets the two Gmail scopes added (code change, see section 8).
2. Run `node auth.mjs` in the `service` folder, open the link, sign in with the sending account, and
   approve. The consent screen now lists Calendar and Gmail.
3. Paste the new `GOOGLE_REFRESH_TOKEN` into `.env`, replacing the old one. Restart `node server.mjs`.

The calendar tools keep working on the new token, because it carries all four scopes.

## 6. Check email authentication (deliverability)

So the email does not land in spam: Google Admin console → **Apps → Google Workspace → Gmail →
Authenticate email** → make sure **DKIM** is on for voiceowl.ai. SPF and DMARC records for voiceowl.ai
should already exist in DNS; ask whoever manages the domain if unsure.

## 7. How sending works (what the code does)

One call per email:

```
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
Authorization: Bearer <access token from the refresh token>
Content-Type: application/json

{"raw": "<the whole email, base64url-encoded>"}
```

The email before encoding is plain text:

```
From: Tanya from VoiceOwl <vijay.c@voiceowl.ai>
To: priya@brightloans.com
Subject: =?UTF-8?B?<subject, base64>?=
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: base64

<emailMessage, with each \n\n as a blank line, base64>
```

The subject and body are base64-encoded so Hindi, Arabic or any other language arrives intact.
Google answers with the message `id`. The email also appears in the account's Sent folder.

## 8. Code to add (not built yet)

1. `auth.mjs`: add `gmail.send` and `gmail.readonly` to `scope`.
2. `google.mjs`: a `sendEmail({ to, subject, body })` function that builds the email in section 7 and
   calls the Gmail API with the same cached access token as the calendar calls.
3. `server.mjs`: a new route, protected by the same `x-api-key`:

```
POST /email
{"to":"priya@brightloans.com","subject":"<emailSubject>","body":"<emailMessage>","callId":"<platform call id>"}
→ {"sent":true,"messageId":"18c..."}  or  {"sent":false,"reason":"..."}
```

   - It does nothing and answers `{"sent":false,"reason":"none"}` when subject or body is "none", so
     the platform can call it after every call without its own check.
   - `callId` stops a duplicate email when the platform retries: the same callId is sent once.
4. `.env`: `EMAIL_FROM_NAME=Tanya from VoiceOwl`, and `EMAIL_FROM` when using option C.
5. Tests with a mock Gmail, like the calendar mock.

## 9. Platform mapping, after the PCA

| /email field | From |
|---|---|
| to | contact `email` |
| subject | PCA `emailSubject` |
| body | PCA `emailMessage` |
| callId | the platform's call id |

URL: `https://<your-host>/email`, headers `x-api-key` and `content-type: application/json`.
WhatsApp stays on the platform: `Contact` and PCA `whatsappMessage`.

## 10. Limits and cautions

- **Daily limit:** a Google Workspace user can send about 2,000 emails a day (fewer on trial
  accounts). Above that, sending stops for up to 24 hours. Google's page: "Gmail sending limits in
  Google Workspace". For larger volumes, a mail service (SendGrid, Amazon SES) is the usual route.
- **Replies** go to the sending inbox. The PCA's "information asked for" email invites a reply, so
  someone must watch that inbox, or we build reply reading later with `gmail.readonly`.
- **Bounces** (wrong address) arrive in the same inbox as "Delivery Status Notification" emails.
- **Security:** the refresh token can now send email as that account. Keep `.env` private, never
  commit it, and revoke the app at myaccount.google.com → Security → Third-party access if the laptop
  is lost.
