# Gmail for the after-call email

Updated 2026-11-20. **The VoiceOwl platform sends the email**, using the PCA's `emailSubject` and
`emailMessage`. Nothing runs locally for email. The only local step is getting a Google refresh token
that is allowed to send (and read) mail, with `service/auth.mjs`, and giving it to the platform.

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

## 3. Pick the sending account

The email goes out from the account you sign in with in step 4.
- For testing: the calendar account.
- For real campaigns: a shared address such as demos@voiceowl.ai (a Workspace user). The calendar
  can move to it too, so the invite and the email come from one team address.

## 4. Get the token

`service/auth.mjs` already asks for all four scopes (Calendar and Gmail).

1. In the `service` folder: `node auth.mjs`
2. Open the link, sign in with the sending account, approve. The screen lists Calendar and Gmail.
3. The terminal prints `GOOGLE_REFRESH_TOKEN=...`. Press Ctrl+C after.

## 5. Give the platform its three values

| Platform setting | Value |
|---|---|
| Client ID | `GOOGLE_CLIENT_ID` from `.env` |
| Client secret | `GOOGLE_CLIENT_SECRET` from `.env` |
| Refresh token | the new token from step 4 |
| Sender | the account from step 3 |

If you signed in with the calendar account, put the same new token in `.env` too and restart
`node server.mjs`: it carries the calendar scopes as well, so one token serves both.

## 6. Platform mapping

| Email field | From |
|---|---|
| To | contact `email` |
| Subject | PCA `emailSubject` |
| Body | PCA `emailMessage` (each `\n\n` is a blank line) |
| Send only when | `emailSubject` is not "none" |

## 7. Before going live

- **DKIM:** Google Admin console → Apps → Google Workspace → Gmail → **Authenticate email** → DKIM on
  for voiceowl.ai, so the email does not land in spam.
- **Daily limit:** about 2,000 emails a day per Workspace user (fewer on trial accounts).
- **Replies and bounces** land in the sending inbox; someone should watch it.
- **The token can send email as that account.** Store it only in the platform's secret settings and
  in the git-ignored `.env`. Revoke it at myaccount.google.com → Security → Third-party access if it
  leaks.
