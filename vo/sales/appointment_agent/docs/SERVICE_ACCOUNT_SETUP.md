# Google service account instead of OAuth

Written 2026-11-25. How to switch the booking service (`service/`) from the OAuth refresh token
(`node auth.mjs`) to a Google **service account** using our Google Workspace. The setup is the same
for Calendar (free/busy, booking, Meet link, invite) and Gmail (`/sendGmail`).

---

## 0. How it works and what changes

Today: a person signs in once with `node auth.mjs`. The refresh token in `.env` acts as that person.
If the person changes their password, leaves, or the token is revoked, booking stops.

With a service account: a robot Google identity owned by the Cloud project. It has its own key.
It uses **domain-wide delegation** to **act as** one Workspace user (the calendar owner, for example
`demos@voiceowl.ai`). Calendar and Gmail then behave as if that user did the work. Nobody signs in,
and no refresh token expires.

Why delegation is required and not optional:
- A service account on its own **cannot invite attendees** to a Calendar event. Google returns
  `forbiddenForServiceAccounts`. Our booking must invite the prospect, so the service account has
  to act as a real user.
- A service account **has no Gmail mailbox**. `/sendGmail` has to send as a real user.
- So every token the service asks for names a `sub` (the user it acts as). That user's calendar
  is `primary`, and that user's mailbox is `users/me`.

| | OAuth (today) | Service account + delegation |
|---|---|---|
| Secret in `.env` | client ID, secret, refresh token | path to a JSON key file, and the user to act as |
| Who must click | the calendar owner, once | a Workspace **super admin**, once (Admin console) |
| Breaks when | the token is revoked, the password changes, the user consent is removed | the key is deleted, or delegation is removed |
| Code | `google.mjs` `accessToken()` uses the refresh grant | `accessToken()` signs a JWT (section 6) |
| Everything else | same | same: same Calendar and Gmail calls, same `CALENDAR_ID`, same routes |

---

## 1. Pick the user to act as

Choose the Workspace account whose calendar holds the demos and whose address sends the email.
A dedicated account such as `demos@voiceowl.ai` works better than a person's own account:
- Its calendar holds only demos, so free/busy is the demo schedule.
- Invites and after-call emails come from a neutral sender.
- Add Hussain to every event with `EXTRA_ATTENDEES` in `.env` (this setting already exists).

The account needs a Google Workspace licence with Calendar, Gmail and Google Meet turned on for its
organisational unit. Without Meet, events are created but have no `hangoutLink`.

If the demos must stay on Hussain's own calendar, act as Hussain instead. Nothing else changes.

## 2. Create the service account

Google Cloud console, **the same project** that already has the Calendar API and Gmail API turned on:

1. **IAM & Admin → Service Accounts → Create service account.**
2. Name: `vo-appointment-booking`. Description: `Books VoiceOwl demos and sends after-call email`.
3. **Grant this service account access to project:** skip it. It needs no Cloud IAM role.
   Its power comes only from delegation in section 4.
4. **Done.** Open the new account and note two values:
   - **Email**, for example `vo-appointment-booking@<project-id>.iam.gserviceaccount.com`
   - **Unique ID** (OAuth 2 client ID): a long number such as `1098765432109876543210`.
     You need it in section 4.

Make sure both APIs are on: **APIs & Services → Enabled APIs** should list **Google Calendar API** and
**Gmail API**.

## 3. Create a key (only for running outside Google Cloud)

You need a JSON key on the laptop and on any host outside Google Cloud. On Cloud Run, skip this
step and use section 7.

1. Service account → **Keys → Add key → Create new key → JSON → Create.** A `.json` file downloads.
2. Move it to `service/service-account.json`.
3. Add it to `service/.gitignore` so it can never be committed:
   ```
   .env
   node_modules/
   service-account.json
   ```
4. Treat it like a password. Anyone who has it can read and send mail as the delegated user.
   Never paste it into the platform, Slack or a prompt.

**If key creation is blocked:** Google Cloud organisations created after May 2024 enforce the
policy `iam.disableServiceAccountKeyCreation` by default. An Organisation Policy Administrator can
override it for this one project (**IAM & Admin → Organisation Policies → Disable service account
key creation → Manage policy → Override → Off**), then create the key. Alternatively, skip keys
entirely with section 7.

## 4. Turn on domain-wide delegation (Workspace super admin)

This is the step that lets the service account act as the user. It needs a **super admin** of
the voiceowl.ai Workspace.

1. **admin.google.com → Security → Access and data control → API controls.**
2. **Manage Domain Wide Delegation → Add new.**
3. **Client ID:** the service account's **Unique ID** from section 2 (the number, not the email).
4. **OAuth scopes**, comma-separated, exactly:
   ```
   https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/calendar.freebusy,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly
   ```
5. **Authorise.**

About the scopes:
- `calendar.events` replaces the `calendar.events.owned` we use with OAuth. It reads and creates
  events on calendars the user can edit. Use only these four scopes. Delegation lets the service
  account act as **any** user in the domain, for exactly these scopes, so keep the list small.
- `gmail.readonly` is only for reading replies and bounces. Leave it out if nothing reads the mailbox.
- Never add `https://mail.google.com/` (full mailbox access, including permanent delete).
- The scopes the code asks for must be the same as, or a subset of, the scopes listed here.
  One extra scope in the code, and Google refuses the whole token (`unauthorized_client`).

A new entry usually works within minutes, but Google says it can take up to 24 hours.

## 5. `.env`

Add the new settings. The OAuth lines can stay while you test, then be removed once the service
account works.

```
# Google service account (domain-wide delegation)
GOOGLE_AUTH=service_account
GOOGLE_SA_KEY_FILE=./service-account.json
# The Workspace user the service account acts as: whose calendar and whose mailbox
GOOGLE_IMPERSONATE=demos@voiceowl.ai
CALENDAR_ID=primary
# Optional: also invite Hussain to every demo
EXTRA_ATTENDEES=hussain@voiceowl.ai
```

`CALENDAR_ID=primary` now means the primary calendar of `GOOGLE_IMPERSONATE`. To book on a shared
calendar instead, put its ID here, and give `GOOGLE_IMPERSONATE` the permission
**Make changes to events** on it.

Add the same lines, empty, to `.env.example`.

## 6. Code change in `service/google.mjs`

Only `accessToken()` changes. Every Calendar and Gmail call stays the same. Plain Node `crypto` signs
the token, so there are still no packages to install.

Replace the current `accessToken` function with:

```js
import fs from 'node:fs';

const SA_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ');

let tokenCache = { value: null, exp: 0 };
async function accessToken(env) {
  if (tokenCache.value && Date.now() < tokenCache.exp) return tokenCache.value;
  const params = env.GOOGLE_AUTH === 'service_account' ? serviceAccountGrant(env)
    : { client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' };
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`token request failed: ${j.error || r.status} ${j.error_description || ''}`);
  tokenCache = { value: j.access_token, exp: Date.now() + (j.expires_in - 120) * 1000 };
  return tokenCache.value;
}

// Service account + domain-wide delegation: a JWT signed with the key, acting as GOOGLE_IMPERSONATE.
function serviceAccountGrant(env) {
  const key = JSON.parse(fs.readFileSync(new URL(env.GOOGLE_SA_KEY_FILE, import.meta.url), 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT', kid: key.private_key_id })}.${enc({
    iss: key.client_email, sub: env.GOOGLE_IMPERSONATE, scope: SA_SCOPES,
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(unsigned), key.private_key).toString('base64url');
  return { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` };
}
```

Notes:
- `GOOGLE_AUTH` unset keeps today's OAuth behaviour, so you can switch back with one line.
- `sub` is what makes delegation happen. Without it, the token belongs to the service account
  itself and booking fails (section 0).
- A token lasts one hour. The cache already renews it two minutes early.
- `auth.mjs` is not needed with a service account.

Ask Claude to apply this change and run `node test.mjs` when you are ready. The mock tests do not
touch Google, so they must still pass unchanged.

## 7. Production on Cloud Run: no key file at all (recommended for live calls)

On Cloud Run the service can sign the JWT through Google, without a key file on disk:

1. Deploy the service on Cloud Run **with the service account from section 2** as its identity.
2. Give that service account the role **Service Account Token Creator**
   (`roles/iam.serviceAccountTokenCreator`) **on itself**:
   **IAM & Admin → Service Accounts → vo-appointment-booking → Permissions → Grant access** →
   principal: its own email, role: Service Account Token Creator.
3. Enable the **IAM Service Account Credentials API** in the project.
4. In code, instead of signing with the private key, send the same claims (without `kid`) to
   `POST https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/<SA email>:signJwt`
   with body `{"payload": "<claims JSON as a string>"}`, using a token from the Cloud Run metadata
   server. Then exchange the returned `signedJwt` at `oauth2.googleapis.com/token` exactly as in section 6.

Delegation (section 4) is the same either way. This option has no key file to leak, rotate or block.
The metadata server's own token **cannot** be used directly for Calendar or Gmail, because it
carries no `sub`.

## 8. Test

1. `node server.mjs`
2. Free/busy:
   ```
   curl -s -X POST localhost:8787/getAvailableSlots -H 'x-api-key: KEY' -H 'content-type: application/json' -d '{"timezone":"Asia/Kolkata"}'
   ```
   You should get `"returnCode":200` and two options.
3. Book one returned `startTime` with your own email. Check three things:
   - The event is on the `GOOGLE_IMPERSONATE` calendar.
   - The invite arrives from that account.
   - The reply has a `meetLink`.
4. `/sendGmail` to your own address. The mail should arrive from `GOOGLE_IMPERSONATE`.

## 9. Errors and what they mean

| Error | Cause | Fix |
|---|---|---|
| `unauthorized_client` "Client is unauthorized to retrieve access tokens using this method" | Delegation is missing, the Client ID is wrong, or the code asks for a scope not listed in section 4 | Check that the Unique ID (number) is in the Admin console and the scope lists match exactly. Wait up to 24 hours after adding it |
| `invalid_grant` "Invalid email or User ID" | `GOOGLE_IMPERSONATE` is not an active user in our Workspace, or is a group or alias | Use a real, licensed, not-suspended user's primary address |
| `invalid_grant` "Invalid JWT" / "Token must be a short-lived token" | The machine clock is wrong | Sync the clock (NTP) |
| `403 forbiddenForServiceAccounts` | The token has no `sub`, so it is acting as the bare service account | Set `GOOGLE_IMPERSONATE`, and check `GOOGLE_AUTH=service_account` |
| `404 notFound` on the calendar | `CALENDAR_ID` is not visible to the impersonated user | Use `primary`, or share that calendar with the user |
| Event created but no `meetLink` | Google Meet is off for the user's organisational unit | Admin console → Apps → Google Workspace → Google Meet → turn on for that OU |
| `iam.disableServiceAccountKeyCreation` when creating a key | Organisation policy | Section 3 override, or section 7 |

## 10. Security checklist

- The key file is in `.gitignore`, is never committed, and is never shared outside the server.
- Delegation lists only the four scopes in section 4.
- Act as a dedicated demos account, not an admin account.
- Rotate the key every 90 days (**Keys → Add key**, deploy, then delete the old key), or use section 7.
- When OAuth is no longer used, delete the OAuth client's secret and remove `GOOGLE_CLIENT_SECRET`
  and `GOOGLE_REFRESH_TOKEN` from `.env`.
- To cut access instantly: delete the delegation entry in the Admin console, or disable the
  service account.
