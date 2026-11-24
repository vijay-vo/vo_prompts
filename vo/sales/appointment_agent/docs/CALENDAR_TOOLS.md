# Appointment Agent: Google Calendar tools, research and build plan (2026-11-20)

Goal: the two HTTP tools the prompt calls, getAvailableSlots and bookAppointment, working end to end
on one Google Calendar, starting with the user's own calendar and later the sales team's.

## 1. What the Google docs say (read 2026-11-20)

Free/busy: `POST https://www.googleapis.com/calendar/v3/freeBusy`
- Body: `timeMin`, `timeMax` (RFC3339), `timeZone` (optional, default UTC), `items[{id}]`.
- Response: `calendars.<id>.busy[]` of `{start, end}` (start inclusive, end exclusive).
- Scopes (any one): `calendar.freebusy`, `calendar.events.freebusy`, `calendar.readonly`, `calendar`.
- The page states no maximum range, so the 15-day window is fine.
  https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query

Create event: `POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
- `conferenceDataVersion=1` is required. At 0 the Meet request in the body is silently ignored.
- `sendUpdates=all` makes Google email the invite to the guests right away (the default is
  no email). This is what lets the agent say "you'll see the invite now".
- Body: `summary`, `description`, `start`/`end` (`dateTime` with an offset, or with `timeZone`),
  `attendees[{email, displayName}]`, and
  `conferenceData.createRequest = { requestId: <unique string>, conferenceSolutionKey: { type: "hangoutsMeet" } }`.
- The Meet link can come back `pending`: read `conferenceData.createRequest.status`, and if it
  is still pending, fetch the event again for `hangoutLink` / `entryPoints`.
- Scopes (any one): `calendar`, `calendar.events`, `calendar.events.owned`, `calendar.app.created`.
  Narrowest pair that fits: `calendar.freebusy` + `calendar.events.owned`.
  https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
  https://developers.google.com/workspace/calendar/api/guides/create-events
  https://developers.google.com/workspace/calendar/api/auth

Quota: 600 requests per user per minute and 10,000 per project. Far above this use. On 403/429
(`usageLimits`) retry with exponential backoff.
https://developers.google.com/workspace/calendar/api/guides/quota

Tokens: with the OAuth consent screen in **Testing**, refresh tokens expire after **7 days**.
Publish the app to **In production** (fine for personal use, shows an "unverified app" warning
once) and the token lasts until revoked or unused for six months.
https://developers.google.com/identity/protocols/oauth2#expiration

Service accounts: they cannot invite attendees (403 `forbiddenForServiceAccounts`) unless a
paid Google Workspace admin enables domain-wide delegation and the account impersonates a real
user. Community-sourced, consistent across many reports. Not usable on a personal Gmail.

Apps Script web apps: POST answers with a 302 redirect, and community reports show the
redirected request failing for clients that do not re-issue it correctly. Unsafe unless the
platform's HTTP tool is known to follow redirects. Not recommended.

## 2. Architecture

Superseded 2026-11-24 for the tool shapes below: slotId, startUtc and spokenLabel are gone; both tools
work in the prospect's local time with `startTime`, and the window is 15 days. Current shapes: PLATFORM_SETUP.md.

```
Platform HTTP tool  --HTTPS + API key-->  small service (we write it)  --OAuth-->  Google Calendar API
```

The platform's HTTP tool only sends a request, so it cannot refresh a Google token (they last
one hour), compute free slots, convert timezones, or build a spoken label. Those need a few
lines of our own code between the two. DESIGN.md already says the tool does all date, time and
timezone maths. The service has two routes:

**POST /getAvailableSlots** (getAvailableSlots)
1. Input: `timezone`, optional `partOfDay`, `preferredDate`, `excludeSlotIds`.
2. Read busy times with one freeBusy call for now to now + 7 days.
3. Cut candidate 15-minute slots on a fixed grid (every quarter hour: :00, :15, :30, :45) inside
   the sales team's working hours AND inside the prospect's local 9:00-19:00, from a minimum
   notice (10 minutes) onward. Drop busy times and `excludeSlotIds`.
4. Rank: earliest first (DESIGN.md item 24: 0-2 days out show up most, avoid Friday and
   late Thursday when other slots exist). Apply `partOfDay` and `preferredDate`.
5. Return up to two: `slotId`, `startUtc`, `spokenLabel` in English words in the prospect's
   local time (for example "Tuesday the nineteenth, eleven in the morning").
6. `slotId` is the start time signed with a secret (HMAC), so the model cannot invent one and
   the service can verify it on booking.

**POST /bookAppointment** (bookAppointment)
1. Input: `slotId`, `email`, `notes`, plus lead fields (section 4).
2. Verify the slotId signature and that the time is still in the future.
3. Re-check freeBusy for that exact quarter hour. If busy: `{booked:false, reason:"slot_taken"}`.
4. Insert the event with `conferenceDataVersion=1`, `sendUpdates=all`, the prospect as an
   attendee, Hussain as host (calendar owner), a `requestId` made from the slotId + email so a
   retried call cannot double-book.
5. If the Meet link is pending, fetch the event once or twice.
6. Return `{booked:true, spokenLabel, meetLink}` or `{booked:false, reason:"error"}`.

Suggested stack: Node or Python on Cloud Run or a small VM. Secrets in environment variables.
The platform sends an `x-api-key` header, which the service checks.

## 3. What you do, step by step (own calendar first)

Updated 2026-11-20: the calendar is on Google Workspace (voiceowl.ai), so the consent screen is
**Internal** (no app review, no 7-day expiry), the OAuth client is a **Desktop app**, and the
service runs locally first. The exact steps are in `service/README.md`, which replaces steps 2 to 4
and 7 below.


1. **Google Cloud:** create a project, open APIs & Services, enable **Google Calendar API**.
2. **OAuth consent screen:** User type External (or Internal if the calendar is on your own
   Workspace). Add the scopes `.../auth/calendar.freebusy` and `.../auth/calendar.events.owned`
   (if the console does not list the second one, use `.../auth/calendar.events`). Add your
   Google account as a test user. Then press **Publish app** to move it to production, so the
   refresh token does not die after 7 days. The warning screen on first consent is expected.
3. **Create an OAuth client:** type Web application. Redirect URI
   `https://developers.google.com/oauthplayground` (or localhost, if we use a small script).
4. **Get the refresh token once:** sign in with the calendar owner's account and approve the
   scopes. We keep the refresh token, the client id and the client secret as secrets.
5. **Pick the calendar:** use `primary`, or create a dedicated "VoiceOwl Demos" calendar and use
   its id. A dedicated calendar keeps test bookings out of your real one.
6. **Tell me:** the sales team's timezone, working days and hours, slot length (15 minutes),
   buffer between demos, minimum notice, and where to host the service.
7. **I write the service** with both routes, a test script, and the exact request and response
   bodies for the two platform tools.
8. **Register the two HTTP tools on the platform** with the service URL and the API key header.
9. **Test:** curl the two routes, book a test slot with your own email, check that the invite and
   Meet link arrive, then make a test call.
10. **Later:** move to the sales team's calendar by changing the calendar id and the token owner.
    Moving to a shared team calendar means the sales team's Hussain account authorises once.

## 4. Gaps between the prompt and these tools

Superseded 2026-11-20 later the same day: parameter names and the full mapping are now in
PLATFORM_SETUP.md (preferredDay, preferredTime, appointmentNotes, fname, lname; no excludeSlotIds).

Settled 2026-11-20: the platform can add request parameters, so it injects `timezone`,
`firstName`, `lastName` and `company` into bookAppointment, and `timezone` into getAvailableSlots. No
prompt change. Sales hours: IST 9 AM to 11 PM.


- **Lead fields on booking.** The prompt's bookAppointment passes only `slotId`, `email`, `notes`. The
  event title needs the name and company ("Demo: Priya Sharma, BrightLoans"). Either the platform
  adds `firstName`, `lastName` and `company` to the HTTP call from the call variables (best, no
  prompt change), or I add them to the prompt's bookAppointment parameters.
- **Tool schema keys** must match the prompt key for key (TOOL_CALLING.md rule 7). I will write
  the schemas from the prompt, so use the keys exactly as written there.
- **preferredDate.** The prompt asks the model to turn "Friday" into a date. Safer: the tool takes
  the prospect's phrase and resolves it. This is a prompt change, to be discussed first.
- **Timezone data.** The service needs an IANA timezone per lead (`Asia/Kolkata`,
  `America/New_York`). Without it the agent cannot offer correct times (DESIGN.md item 3).
- **Platform limits:** the HTTP tool's timeout, response size, redirect behaviour and how it
  injects call variables are not documented to me. Check them, or send me an exported tool
  definition from the platform.
