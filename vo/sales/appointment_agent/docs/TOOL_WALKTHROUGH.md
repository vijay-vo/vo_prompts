# One call, step by step, with every tool call

Updated 2026-11-25 for the startTime design, the preferredDay list and the single-time offer. Every toolResponse below is the real output of the service
code (`service/slots.mjs`) run with a fixed date and time and an in-memory calendar. Only the Meet link
and the event id are made up.

The example:
- Today: Tuesday 24 November 2026. The call is at 10:00 AM in New York, 8:30 PM in India.
- Prospect: Daniel, Harbor Lending, New York (`America/New_York`).
- Ruchika's calendar: busy today until 11 PM IST. Her hours, 10 AM to 11 PM IST, are 9:00 AM to
  12:30 PM in New York.
- Settings from `.env.example`: 15-minute demos every quarter hour, the prospect's own 9 AM to 7 PM,
  Monday to Friday, at least 10 minutes' notice, up to 15 days ahead, the second offer about an hour
  after the first.

**The one rule:** everything the model sees is in Daniel's own time. The service does every date,
timezone and calendar step. The model reads one thing, the `toolResponse`, speaks the words in it, and
copies a `startTime` from it to book.

---

## Step 1. The call starts

The platform dials Daniel with his contact row:

```
fname=Daniel, company=Harbor Lending, email=daniel@harborlending.com, timezone=America/New_York,
defaultLanguage=English, priorContext=Not Available
```

Tanya talks about his problem and asks whether fifteen minutes with Ruchika makes sense. He says yes.

## Step 2. On the yes, Tanya checks the calendar at once

She asks nothing about time first. Her turn is the tool call alone: no text and no preToolMessage
(2026-11-24: no time can exist before the Result, so the turn carries no words).

```json
POST /getAvailableSlots
{"timezone":"America/New_York"}
```

`timezone` is added by the platform; the model passes nothing because Daniel named no day or time.

Inside the service (the model never sees this):
1. One Google freeBusy call reads Ruchika's busy times for the next 15 days.
2. It cuts 15-minute slots that fit both Daniel's 9 AM to 7 PM and Ruchika's 10 AM to 11 PM IST.
3. Today has nothing left: Ruchika is busy until 12:30 PM New York, her day ends then.
4. The earliest is tomorrow 9:00 AM; the second, an hour later, 10:00 AM.

```json
{"returnCode":200,"toolResponse":"Success: Two times are free. Option 1: tomorrow, nine in the morning, startTime 2026-11-25T09:00. Option 2: tomorrow, ten in the morning, startTime 2026-11-25T10:00. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose."}
```

## Step 3. Tanya offers both, in words

> Tanya: "I have tomorrow at nine in the morning or ten in the morning, your time. Which works better?"
> Daniel: "Neither. Can we do tomorrow around eleven?"

## Step 4. Tanya checks his time

```json
POST /getAvailableSlots
{"timezone":"America/New_York","preferredDay":"tomorrow","preferredTime":"11:00"}
```

When his exact time is free, the reply offers that one time alone, and Tanya asks before booking.

```json
{"returnCode":200,"toolResponse":"Success: That time is free: tomorrow, eleven in the morning, startTime 2026-11-25T11:00. Say it in words, never the startTime, and ask if they want it. On a yes, book this startTime."}
```

> Tanya: "Tomorrow at eleven in the morning, your time, is free. Shall I book it?"
> Daniel: "Hmm, let me look… yes, go ahead."

It took him two turns. Tanya takes the startTime from that toolResponse.

If he had asked for 2 PM, which is after Ruchika's day ends, the reply would be:

```json
{"returnCode":200,"toolResponse":"Failure: That time is not available. Option 1: tomorrow, twelve noon, startTime 2026-11-25T12:00. Option 2: tomorrow, twelve fifteen in the afternoon, startTime 2026-11-25T12:15. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose."}
```

> Tanya: "Sorry, that time is not available. I have twelve noon or twelve fifteen, your time. Which works better?"

She never says why. If he had said only "at two", she would first ask "Two in the afternoon?" and pass
`14:00` after his yes.

## Step 5. Tanya books

A turn with no text and no preToolMessage. The model passes `startTime` and `appointmentNotes`; the
platform adds the rest.

```json
POST /bookAppointment
{"startTime":"2026-11-25T11:00",
 "appointmentNotes":"missed calls after hours, leads go cold",
 "email":"daniel@harborlending.com","timezone":"America/New_York",
 "fname":"Daniel","lname":"Not Available","company":"Harbor Lending"}
```

Inside the service:
1. `2026-11-25T11:00` in New York is 16:00 UTC, 9:30 PM IST.
2. It must still be one of the free slots: on the quarter hour, inside both sets of hours, within 15
   days, at least 10 minutes away, and free in Google right now. It is.
3. It creates the event with a Google Meet link, Daniel as guest; Google emails him the invite.

```json
{"returnCode":200,"booked":true,"reason":"booked",
 "toolResponse":"Success: The call is booked for tomorrow, eleven in the morning. Tell the prospect the invite is in their email and they can accept it whenever it suits them. Do not push them to accept it now.",
 "prospectTime":"Wednesday, 25 November 2026, 11:00 AM (America/New_York)",
 "salesTime":"Wednesday, 25 November 2026, 9:30 PM (Asia/Kolkata)",
 "meetLink":"https://meet.google.com/abc-defg-hij",
 "eventId":"7d82dec850f5c850281540b2a5be1030e644fa28"}
```

The platform saves `prospectTime` as `bookedTime`, `salesTime` as `salesTime` and `meetLink` as `meetLink`.

## Step 6. Tanya confirms and closes

> Tanya: "Done. Tomorrow, eleven in the morning, with Ruchika. The invite is in your email; please
> accept it whenever it suits you. You'll also get the details on WhatsApp and email."

She answers anything he asks, says the closing line, and hangs up.

## Step 7. After the call

The PCA reads the transcript with `bookedTime` and `meetLink` and writes `callResult: booked`,
`whatsappMessage`, `emailSubject` and `emailMessage`. The platform sends the email:

```json
POST /sendGmail
{"to":"daniel@harborlending.com","subject":"Your VoiceOwl demo is booked for Wednesday, 25 November, 11:00 AM","body":"Hi Daniel,\n\n..."}
→ {"sent":true,"toolResponse":"Success: The email was sent.","messageId":"18c..."}
```

---

## When it goes differently

**The time is taken between offer and booking.** Someone else took 11:00. The reply carries new options,
so Tanya offers them without checking again:

```json
{"returnCode":200,"booked":false,"reason":"slot_taken","toolResponse":"Failure: That time was just taken. Option 1: tomorrow, ten forty-five in the morning, startTime 2026-11-25T10:45. Option 2: tomorrow, eleven fifteen in the morning, startTime 2026-11-25T11:15. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose.","prospectTime":"Not Available","salesTime":"Not Available","meetLink":"Not Available","eventId":"Not Available"}
```

> Tanya: "That time was just taken. I have ten forty-five or eleven fifteen. Which works?"

**The model passes a wrong startTime** (garbled, never offered, outside hours, such as
`2026-11-25T11:07`). Nothing is booked; the reply offers the two real free times nearest to it:

```json
{"returnCode":200,"booked":false,"reason":"not_offered","toolResponse":"Failure: That startTime is not a free time. Option 1: tomorrow, ten forty-five in the morning, startTime 2026-11-25T10:45. Option 2: tomorrow, eleven fifteen in the morning, startTime 2026-11-25T11:15. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose."}
```

**The prospect names another day.** The model passes what he said; the service finds the date in his time.

| Daniel says | preferredDay | toolResponse starts |
|---|---|---|
| "Thursday" | `thursday` | `Success: Two times are free. Option 1: Thursday the twenty-sixth of November, nine in the morning, startTime 2026-11-26T09:00. …` |
| "On the 27th" | `27` | `Success: Two times are free. Option 1: Friday the twenty-seventh of November, nine in the morning, startTime 2026-11-27T09:00. …` |
| "In three days" | `in 3 days` | `Success: Two times are free. Option 1: Friday the twenty-seventh of November, nine in the morning, startTime 2026-11-27T09:00. …` |
| "Day after tomorrow" | `day after tomorrow` | `Success: Two times are free. Option 1: Thursday the twenty-sixth of November, nine in the morning, startTime 2026-11-26T09:00. …` |
| "Saturday" | `saturday` | `Failure: Calls are Monday to Friday only. Ask which weekday suits them.` |
| "The 20th" (already gone) | `20` | `Failure: That day has passed. Ask which day suits them.` |
| "Next week" | not passed: Tanya asks which day first | (if passed anyway) `Failure: That day was not understood. Ask which day suits them.` |
| "The 31st" | `31` | `Failure: That day is more than 15 days away. Ask for a day in the next 15 days.` |

For any day other than today and tomorrow, the words name the date, so a wrong day is heard before booking.

**Nothing is free that day.** `Failure: No time is free for that request. Ask which other day suits them.`

**The calendar or the booking breaks.** `Failure: The calendar could not be checked. …` or
`Failure: The booking did not go through. …` Tanya tells Daniel the team will send the details on email
and WhatsApp, never retries the booking, and closes.

---

## What each country can be offered

The prospect only ever hears their own time, but every slot must also fall in Ruchika's 10 AM to 11 PM IST.

| Prospect | Times offered (their time, weekdays) |
|---|---|
| India | 10:00 AM to 7:00 PM |
| Dubai | 9:00 AM to 7:00 PM |
| Japan | 1:30 PM to 7:00 PM |
| UK | 9:00 AM to 5:30 PM |
| New York | 9:00 AM to 12:30 PM |
| California | 9:00 AM to 9:30 AM |
