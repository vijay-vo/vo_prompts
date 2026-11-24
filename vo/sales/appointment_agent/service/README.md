# VoiceOwl demo-booking tools (local service)

Three HTTP routes that the platform's tools call. All date, time and timezone work is done here,
never by the model. Plain Node 20, no packages to install.

| Platform tool | Route | Body the platform sends |
|---|---|---|
| getAvailableSlots | `POST /getAvailableSlots` | injected by the platform: `timezone`; from the model: `preferredDay` (one of: today, tomorrow, day after tomorrow, monday...sunday, `in N days`, or a date `1`-`31`), `preferredTime` (morning/afternoon/evening or `HH:MM` 24-hour) |
| bookAppointment | `POST /bookAppointment` | from the model: `startTime` (copied from the chosen option), `appointmentNotes`; injected by the platform: `email`, `timezone`, `fname`, `lname`, `company` |
| sendGmail (after the PCA) | `POST /sendGmail` | `to` (contact email), `subject` (PCA emailSubject), `body` (PCA emailMessage); "none" sends nothing. See docs/GMAIL_SETUP.md |

Every reply carries a `toolResponse` for the model. All times are the prospect's own local time. A booked reply
also has `prospectTime`, `salesTime`, `meetLink` and `eventId`. Full mapping with examples: docs/PLATFORM_SETUP.md.

Every request needs the header `x-api-key: <API_KEY from .env>`.

Responses:
- `/getAvailableSlots` → `{"toolResponse":"Success: Two times are free. Option 1: today, four in the evening, startTime 2026-11-24T16:00. Option 2: ..."}`
- `/bookAppointment` → `{"booked":true,"toolResponse":"...","prospectTime":"...","salesTime":"...","meetLink":"https://meet.google.com/...","eventId":"..."}`
  or `{"booked":false,"reason":"slot_taken" | "not_offered" | "error","toolResponse":"..."}` (the first two offer new times)

## Rules built in
- Slots are 15 minutes, every quarter hour (:00, :15, :30, :45), back to back, inside the sales team's hours (IST 9 AM to
  11 PM, Monday to Friday) AND the prospect's own 9 AM to 7 PM, Monday to Friday.
- At least 10 minutes' notice (a call at 3:00 PM can book 3:15 PM), up to 15 days ahead, earliest
  first. The second offer is the first free slot at least 60 minutes after the first, else at
  least 30 minutes after it, else the next free slot. `AVOID_FRIDAY=1` skips the prospect's Fridays when other days exist (off).
- Booking takes the startTime only when it is still one of the free slots; otherwise it offers the two
  free slots nearest to it. The model cannot book a time that was never free.
- Booking creates the event with a Google Meet link and emails the invite at once
  (`sendUpdates=all`). A retried booking of the same slot and email answers "booked" again
  instead of creating a second event.
- All settings are in `.env` (see `.env.example`).

## Setup (Google Workspace account)
1. Google Cloud console → new project → APIs & Services → enable **Google Calendar API**.
2. OAuth consent screen → User type **Internal** (Workspace only: no app review, no 7-day token
   expiry). Scopes: `.../auth/calendar.freebusy` and `.../auth/calendar.events.owned`.
3. Credentials → Create OAuth client ID → type **Desktop app** → copy the client ID and secret.
4. `cp .env.example .env`, fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, a long random
   `API_KEY` (for example from `openssl rand -hex 24`).
5. `node auth.mjs` → open the link, sign in with the calendar's account, approve → paste the
   printed `GOOGLE_REFRESH_TOKEN` into `.env`. If Google rejects the scope
   `calendar.events.owned`, change it in auth.mjs to `.../auth/calendar.events` and run again.
6. `node server.mjs` → it listens on port 8787.
7. `ngrok http 8787` → copy the https URL. That is the base URL for both platform tools.

## Test
- Without Google: `node test.mjs` (in-memory calendar).
- With Google:
  `curl -s -X POST localhost:8787/getAvailableSlots -H 'x-api-key: KEY' -H 'content-type: application/json' -d '{"timezone":"Asia/Kolkata"}'`
  then book one of the returned startTimes with your own email and check the invite and the Meet link.

## Running locally: limits
- The platform runs in the cloud, so it reaches this laptop only through ngrok.
- The laptop must be on, awake and online, with both `node server.mjs` and `ngrok` running,
  for every call. If it sleeps, Tanya's calendar check fails mid-call.
- A free ngrok URL can change when ngrok restarts. Use the one free static domain in the ngrok
  dashboard, or update both platform tools each time.
- Good for building and test calls. For live calls, move the same code to an always-on host
  (for example Google Cloud Run in the same project): only the URL changes.
