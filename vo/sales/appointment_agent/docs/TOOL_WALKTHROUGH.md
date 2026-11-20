# Two calls, step by step, with every tool call (India and US)

What happens on the line, inside the model, on the platform, in our service and at Google. The
slot times, labels and IDs below are the real output of the service code
(`service/slots.mjs`), run with a fixed date and time. Only the Meet links and the ngrok URL are
made up.

Setup used in both calls:
- Calendar: vijay.c@voiceowl.ai, `CALENDAR_ID=primary`.
- Service on the laptop at port 8787, reached by the platform through
  `https://tanya-tools.ngrok-free.app` (example).
- Settings from `.env.example`: sales hours IST 9:00 AM to 11:00 PM, Monday to Friday; the prospect's
  own 9:00 AM to 7:00 PM, Monday to Friday; 15-minute demos every quarter hour (:00, :15, :30,
  :45); at least 10 minutes' notice; up to 7 days ahead; the second offer at least 60 minutes
  after the first, else at least 30 minutes, else the next free slot.

---

## First, the short answer: how does Tanya know which times are free?

She doesn't, until she asks the service. Times are never in the prompt, never in her memory and
never guessed. The prompt allows her to speak a time only from a getAvailableSlots Result, and to
book only a slotId from that Result. So the order is always:

1. The prospect agrees to the fifteen minutes.
2. Tanya calls getAvailableSlots, and the prospect hears "Let me check the calendar."
3. The service asks Google which times are busy, works out which are free and fit both
   timezones, and returns two of them as ready-to-say English labels.
4. Only then does Tanya say "I have today at two in the afternoon or today at three in the
   afternoon."

If Tanya ever said "two or three" before step 2, that would be the model inventing times: a prompt
violation, and the booking would fail anyway, because the service only accepts slotIds it signed.

---

## Call 1: India

Prospect: Priya Sharma, BrightLoans, Mumbai. Lead data from the platform: `firstName=Priya`,
`company=BrightLoans`, `industry=lending`, `timezone=Asia/Kolkata`, `language=English`,
`currentDate=2026-11-23`, `currentWeekday=Monday`, `priorContext=First call to them. Sales head at a
lending company, number from a purchased business list.` The platform also holds `lastName=Sharma` and
`email=priya@brightloans.com` for the booking; the model never sees them.

The call happens on **Monday 23 November 2026 at 12:45 PM IST** (07:15 UTC). Vijay's calendar
already has a meeting from 1:00 to 2:00 PM IST today.

### Step 1. The platform dials, Priya answers
Priya: "Hello?"
The platform plays the first message (no model involved): "Hi Priya, it's Tanya from VoiceOwl."

### Step 2. The opener (model turn, no tool)
Priya: "Yes?"
Tanya: "I know you weren't expecting my call. We work with lending companies like BrightLoans on
one thing: every customer call answered and handled well, in the customer's own language. Can I
tell you why I called you specifically?"
Inside: the prompt's EVERY OTHER FIRST CALL line, because `priorContext` shows no earlier
conversation and no website or event visit, with [industry] and [company] filled from the lead data.

### Step 3. Value line and the three-problem question (no tool)
Priya: "Go on."
Tanya: "We build voice AI agents that talk to your customers like a person, in their own
language, and handle thousands of calls at once, connected to your own systems. Most teams tell us
one of three things: calls wait too long, there are more calls than the team can handle, or
customers want their own language. Which is closest to you?"

### Step 4. Her problem (no tool)
Priya: "Too late. Weekend leads wait until Monday."
Tanya: "Tell me more about that."
Priya: "By Monday half of them have gone elsewhere."

### Step 5. The ask (no tool)
Tanya: "That's exactly what we build for. Would it make sense to spend fifteen minutes with
Hussain, our sales head, and see it working on weekend leads that wait until Monday?"
Then silence until Priya answers.
Priya: "Sure, why not."

### Step 6. Tanya checks the calendar (tool call 1: getAvailableSlots)
The model's turn has no text. It invokes getAvailableSlots with:
```json
{ "timezone": "Asia/Kolkata" }
```
and `preToolMessage: "Let me check the calendar."`
- No partOfDay, no preferredDate and no excludeSlotIds, because Priya named no preference and
  nothing has been offered yet.
- **The platform** speaks the preToolMessage to Priya, then sends the HTTP request (it also adds
  `timezone` from the lead data, per the tool setup):
```
POST https://tanya-tools.ngrok-free.app/slots
x-api-key: <API_KEY>
content-type: application/json

{"timezone":"Asia/Kolkata"}
```
- **ngrok** forwards it to `http://localhost:8787/slots` on the laptop.

### Step 7. Inside the service: /slots
1. **Key check:** the `x-api-key` header must equal `API_KEY` in `.env`, otherwise 401.
2. **Timezone check:** `Asia/Kolkata` must be a real IANA timezone, otherwise 400.
3. **Google login:** if the cached access token is older than about 58 minutes, the service
   swaps the refresh token for a new one:
   `POST https://oauth2.googleapis.com/token` with grant_type `refresh_token`. Google returns an
   access token valid for one hour, which is then cached.
4. **Busy times from Google:**
```
POST https://www.googleapis.com/calendar/v3/freeBusy
{"timeMin":"2026-11-23T07:15:00Z","timeMax":"2026-12-01T07:15:00Z","items":[{"id":"primary"}]}
```
   Google answers with only the busy blocks, not their titles:
   `busy: [{"start":"2026-11-23T07:30:00Z","end":"2026-11-23T08:30:00Z"}]` (1:00 to 2:00 PM IST).
5. **The first possible start:** now + 10 minutes of notice = 07:25 UTC (12:55 PM IST), rounded
   up to the next quarter hour = **07:30 UTC (1:00 PM IST)**.
6. **Walk forward in 15-minute steps** for 7 days. Each candidate must pass all checks:

| Candidate | In IST (sales) | In Priya's time | Check that fails |
|---|---|---|---|
| 07:30 to 08:15 UTC | Mon 1:00 to 1:45 PM | Mon 1:00 to 1:45 PM | overlaps the 1:00 to 2:00 PM meeting |
| **08:30 UTC** | Mon 2:00 PM | Mon 2:00 PM | none: **slot 1** |
| 08:45 to 09:15 UTC | Mon 2:15 to 2:45 PM | Mon 2:15 to 2:45 PM | none, but less than 60 minutes after slot 1 |
| **09:30 UTC** | Mon 3:00 PM | Mon 3:00 PM | none, and 60 minutes after slot 1: **slot 2** |

   Had nothing been free 60 minutes after slot 1, the service would take the first free slot 30
   minutes after it, and failing that the very next free slot.

   For India both timezones are the same, so the only limits are the calendar and the hours.
7. **Spoken labels** in Priya's timezone: same date as today → "today"; 14:00 → "two in the
   afternoon"; 15:00 → "three in the afternoon".
8. **slotId:** the start time in milliseconds plus a signature made with `SLOT_SECRET`, packed
   into one string. `1795422600000` (14:00 IST) becomes
   `MTc5NTQyMjYwMDAwMC4xOGZhN2E5M2JmZWZmZTNl`. The model cannot make a valid one up.

The service replies (this is what the model receives as the Result):
```json
{"slots":[
 {"slotId":"MTc5NTQyMjYwMDAwMC4xOGZhN2E5M2JmZWZmZTNl","startUtc":"2026-11-23T08:30:00.000Z","spokenLabel":"today, two in the afternoon"},
 {"slotId":"MTc5NTQyNjIwMDAwMC5mZjRkZWNiYjRjOTA2OWM2","startUtc":"2026-11-23T09:30:00.000Z","spokenLabel":"today, three in the afternoon"}
]}
```

### Step 8. Tanya offers the two times (no tool)
Tanya: "I have today at two in the afternoon or today at three in the afternoon, your time.
Which works better?"
Inside: she reads the two spokenLabels by meaning, earliest first. She keeps both slotIds in the
conversation for the next steps. Then silence until Priya answers.
Priya: "Three is better."

### Step 9. The booking (tool call 2: bookDemo)
The model's turn is the call alone: no text, no preToolMessage. **Priya hears a short silence**
while it runs (usually one to three seconds).
The model passes:
```json
{"slotId":"MTc5NTQyNjIwMDAwMC5mZjRkZWNiYjRjOTA2OWM2","notes":"weekend leads wait until Monday, half are lost"}
```
The platform adds the lead fields from the call data, including the email, and sends:
```
POST https://tanya-tools.ngrok-free.app/book
x-api-key: <API_KEY>

{"slotId":"MTc5NTQyNjIwMDAwMC5mZjRkZWNiYjRjOTA2OWM2","email":"priya@brightloans.com",
 "notes":"weekend leads wait until Monday, half are lost",
 "timezone":"Asia/Kolkata","firstName":"Priya","lastName":"Sharma","company":"BrightLoans"}
```

### Step 10. Inside the service: /book
1. Key check and timezone check, as before. Email format check (something@something.something).
2. **Unpack the slotId:** decode it to `1795426200000.<signature>`, sign `1795426200000` again
   with `SLOT_SECRET`, and compare. It matches, so the start is 09:30 UTC = 3:00 PM IST. It is in
   the future, so the end is 09:45 UTC.
3. **Check it is still free:** a freeBusy call for 09:30 to 09:45 UTC only. Nothing is busy.
   (If someone had booked 3:00 PM since step 7, the answer would be
   `{"booked":false,"reason":"slot_taken"}`.)
4. **A fixed event id** from the slotId and the email (first 40 characters of a SHA-256 hash). If
   the platform sends the same request twice, Google refuses a second event with the same id, and
   the service answers "booked" for the event that already exists. No double booking.
5. **Create the event:**
```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all
{
 "id": "<40-character id>",
 "summary": "VoiceOwl demo: Priya Sharma, BrightLoans",
 "description": "Company: BrightLoans\nNotes: weekend leads wait until Monday, half are lost",
 "start": {"dateTime": "2026-11-23T09:30:00.000Z"},
 "end":   {"dateTime": "2026-11-23T09:45:00.000Z"},
 "attendees": [{"email": "priya@brightloans.com", "displayName": "Priya Sharma"}],
 "conferenceData": {"createRequest": {"requestId": "<same id>", "conferenceSolutionKey": {"type": "hangoutsMeet"}}}
}
```
   - `conferenceDataVersion=1` makes Google create a Meet link.
   - `sendUpdates=all` makes Google email the invite to Priya **at once**, from
     vijay.c@voiceowl.ai, with Accept / Decline buttons and the Meet link.
   - Anyone in `EXTRA_ATTENDEES` (for example Hussain later) is added as a guest too.
6. **The Meet link:** usually in Google's reply as `hangoutLink`. If Google says it is still
   being created, the service reads the event again, up to three times, one second apart.
7. Reply to the platform:
```json
{"booked":true,"spokenLabel":"today, three in the afternoon","meetLink":"https://meet.google.com/abc-defg-hij","eventId":"<40-character id>"}
```

### Step 11. Confirmation and show-up (no tool)
Tanya: "Done. Today at three in the afternoon, with Hussain. The invite is in your
inbox now. Could you accept it while we're on the call, so it's in your calendar?"
Priya: "Okay... yes, accepted."
Inside Google: Priya's click turns her status on the event from "needs action" to "accepted".
Vijay sees that on the event in his calendar. Our service is not involved.
Tanya: "Perfect. You'll also get the details on WhatsApp and email."
Priya: "Great, thanks."

### Step 12. The close (tool call 3: callhangup)
The model's turn has no text. It invokes callhangup with `preToolMessage`: "Thanks, Priya. See
you on Google Meet. Have a great day." (CLOSING LINE D). The platform speaks it and ends the
call.

### Step 13. After the call (platform, not our service)
- The platform sends its WhatsApp and email confirmation.
- The PCA reads the transcript and returns, among other fields: `callResult: booked`,
  `bookedSlot: "today, three in the afternoon, prospect time"`, `inviteAccepted: yes`,
  `painPoint: slowResponse`, and the WhatsApp and email texts (`whatsappMessage`, `emailSubject`,
  `emailMessage`) that the platform sends.
- On Vijay's calendar: "VoiceOwl demo: Priya Sharma, BrightLoans", Monday 3:00 to 3:15 PM, with
  the Meet link.

---

## Call 2: US (New York)

Prospect: Daniel Brooks, Harbor Lending, New York. Lead data: `firstName=Daniel`,
`company=Harbor Lending`, `industry=lending`, **`timezone=America/New_York`**, `language=English`,
`currentDate=2026-11-23`, `currentWeekday=Monday`, `priorContext=First call to them.` The platform
holds `lastName=Brooks` and `email=daniel@harborlending.com` for the booking.

The call happens on **Monday 23 November 2026 at 8:10 PM IST**, which is **9:40 AM in New York**
(14:40 UTC). New York is on winter time (UTC−5), 10 hours 30 minutes behind IST. Vijay's
calendar is empty.

Steps 1 to 5 are the same conversation as India, with Daniel's name and company. Daniel says yes
to the fifteen minutes.

### Step 6. Tool call 1: getAvailableSlots
The model passes `{"timezone":"America/New_York"}` with preToolMessage "Let me check the
calendar." The platform POSTs it to `/slots`, as in India.

### Step 7. Inside /slots: where two timezones really matter
1. Key, timezone and Google login, as before.
2. freeBusy from 14:40 UTC for 8 days: nothing busy.
3. First possible start: 14:40 + 10 minutes = 14:50 UTC, rounded up to **15:00 UTC**.
4. Every candidate is now checked in **two** clocks: IST (Vijay, 9:00 AM to 11:00 PM) and New York
   (Daniel, 9:00 AM to 7:00 PM). Both must pass, and the 15 minutes must end inside both.

| Candidate (UTC) | IST | New York | Result |
|---|---|---|---|
| **Mon 15:00** | Mon 8:30 PM | Mon 10:00 AM | **slot 1**: inside both |
| Mon 15:15 to 15:45 | Mon 8:45 to 9:15 PM | Mon 10:15 to 10:45 AM | free, but less than 60 minutes after slot 1 |
| **Mon 16:00** | Mon 9:30 PM | Mon 11:00 AM | **slot 2**: inside both, 60 minutes after slot 1 |
| Mon 17:15 | Mon 10:45 PM | Mon 12:15 PM | the last start of the day: ends 11:00 PM IST |
| Mon 17:30 | Mon 11:00 PM | Mon 12:30 PM | fails: would end 11:15 PM IST |

   **So for New York there is only one window a day: 9:00 AM to 12:30 PM their time (7:30 to 11:00
   PM IST), with the last start at 12:15 PM.**
5. Labels are built in **Daniel's** timezone, not IST: Monday 10:00 in New York is "today, ten in
   the morning"; Monday 11:00 is "today, eleven in the morning".

Result:
```json
{"slots":[
 {"slotId":"MTc5NTQ0NjAwMDAwMC5kOThiNGRhMjg3ZmFhYWNi","startUtc":"2026-11-23T15:00:00.000Z","spokenLabel":"today, ten in the morning"},
 {"slotId":"MTc5NTQ0OTYwMDAwMC41M2M5YjFmNWNkMGE5ZWQx","startUtc":"2026-11-23T16:00:00.000Z","spokenLabel":"today, eleven in the morning"}
]}
```

### Step 8. Offer, and neither works (no tool)
Tanya: "I have today at ten in the morning or today at eleven in the morning, your time. Which
works better?"
Daniel: "Neither, really. Could we do Wednesday afternoon?"
Daniel has already named a day and a part of the day, so the prompt's branch THEY NAME A TIME OF
THEIR OWN applies: Tanya asks nothing more and goes straight to the next tool call. (Had he only
said "neither", she would first ask which day or part of the day suits him better.)

### Step 9. Tool call 2: getAvailableSlots again, with his preference
The model works out the date: today is `2026-11-23`, a Monday, so Wednesday is `2026-11-25`. This
is the one bit of date work the model does (CALENDAR_TOOLS.md lists it as a risk). It passes:
```json
{"timezone":"America/New_York","partOfDay":"afternoon","preferredDate":"2026-11-25",
 "excludeSlotIds":["MTc5NTQ0NjAwMDAwMC5kOThiNGRhMjg3ZmFhYWNi","MTc5NTQ0OTYwMDAwMC41M2M5YjFmNWNkMGE5ZWQx"]}
```
with preToolMessage "Let me check the calendar."

Inside /slots:
- The two excluded slotIds are unpacked and their times skipped.
- Only candidates on **2026-11-25 in New York time** are kept.
- "Afternoon" means 12:00 noon to 4:00 PM **in New York time**.
- New York afternoon on Wednesday = 10:30 PM IST Wednesday to 2:30 AM IST Thursday. Only 12:00
  noon (10:30 PM IST) and 12:15 PM (10:45 PM IST) also end by 11 PM IST. 12:30 PM New York would
  be 11:00 PM IST and fails.
- Nothing is 60 or 30 minutes after 12:00 noon, so the second offer falls back to the next free
  slot, 12:15 PM. The Result has two slots:
```json
{"slots":[
 {"slotId":"MTc5NTYyNjAwMDAwMC4wNGRmNDk1ZTRjMjJiMWI4","startUtc":"2026-11-25T17:00:00.000Z","spokenLabel":"Wednesday, twelve noon"},
 {"slotId":"MTc5NTYyNjkwMDAwMC40ZmRkZGM5N2UyM2RkNzkx","startUtc":"2026-11-25T17:15:00.000Z","spokenLabel":"Wednesday, twelve fifteen in the afternoon"}
]}
```

### Step 10. Offer the two slots (no tool)
Tanya: "I have Wednesday at twelve noon or twelve fifteen in the afternoon, your time. Which works
better?"
Daniel: "Twelve noon works."
(If he had said "Wednesday at 3 PM", the Result would have been empty, because 3 PM New York is
1:30 AM IST. Tanya would say that day is full, and ask for another day.)

### Step 11. Tool call 3: bookDemo
The model passes `slotId: MTc5NTYyNjAwMDAwMC4wNGRmNDk1ZTRjMjJiMWI4` and
`notes: weekend leads called too late`. The platform adds `email: daniel@harborlending.com`,
`timezone: America/New_York`, `firstName: Daniel`, `lastName: Brooks`, `company: Harbor Lending`.

Inside /book, the same as India:
- The slotId unpacks to 17:00 UTC on 25 November.
- A re-check shows it is free.
- The event is created with start `2026-11-25T17:00:00Z` and end `17:15Z`, with Daniel as the guest
  and a Meet link. Google emails the invite at once.
- Google stores **one** moment in time, and each calendar shows it in its owner's timezone:
  - **On Vijay's calendar:** Wednesday 10:30 to 10:45 PM IST.
  - **On Daniel's calendar and in his invite email:** Wednesday 12:00 to 12:15 PM EST.
- Nobody converts anything by hand.

Reply:
```json
{"booked":true,"spokenLabel":"Wednesday, twelve noon","meetLink":"https://meet.google.com/xyz-abcd-efg","eventId":"<40-character id>"}
```

### Step 12. Confirmation, close, after the call
- Tanya: "Done. Wednesday at twelve noon, with Hussain. The invite is in your inbox
  now. Could you accept it while we're on the call, so it's in your calendar?"
- Then the same show-up line, the callhangup close and the post-call steps as India.
- The PCA gives `bookedSlot: "Wednesday, twelve noon, prospect time"`.

---

## What can go differently, and what happens

| Situation | What the service returns | What Tanya does |
|---|---|---|
| The time was taken between offer and booking | `{"booked":false,"reason":"slot_taken"}` | getAvailableSlots again with that slot excluded, preToolMessage "That time was just taken. Let me check the calendar again.", offers the next ones |
| Google or the laptop fails during booking | `{"booked":false,"reason":"error"}` (or no answer) | "Something went wrong with the booking on my side. Our team will send you the times on WhatsApp." Never a third booking try |
| Nothing free for the day asked | `{"slots":[]}` | "That day's full. The calendar is open for the next two weeks; which other day suits you?" |
| The platform sends the same booking twice | the second call finds the event it made and answers `booked:true` again | nothing different: one event, one invite |
| The model sends a made-up slotId | signature check fails → `booked:false, reason:error` | the error line, no fake booking |
| The laptop is asleep or ngrok is off | the platform gets no reply | the tool fails: Tanya cannot offer times. This is why live calls need an always-on host |

## Points worth deciding
1. **Silence during bookDemo.** That turn has no spoken line (TOOL_CALLING.md: an acting tool is
   not announced), so the prospect hears one to three seconds of silence. Usually fine; if it
   feels long in tests, the fix belongs on the platform (a filler), not in the prompt.
2. **US hours.** With IST 9 AM to 11 PM, New York gets 9:00 AM to 12:30 PM only, and Los Angeles
   9:00 to 9:30 AM only. A later end hour in IST widens this.
3. **preferredDate** is the only date the model works out. Safer would be the tool taking
   "Wednesday" and doing it itself (prompt change, to discuss).
