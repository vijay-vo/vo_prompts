# Platform setup: contact upload, call variables, tool mapping, after-call messages

Updated 2026-11-25 from the current files: default/default.txt (agent), pca/pca.txt (post-call analysis),
service/server.mjs and service/slots.mjs (booking service). Field names below must match exactly.

---

## 1. Contact upload (one row per prospect)

| Column | Required | Example | Used for |
|---|---|---|---|
| Contact | yes | +919876543210 | the number to dial |
| fname | yes | Priya | agent `{{fname}}`; /bookAppointment; PCA |
| lname | no | Sharma | /bookAppointment (name on the calendar invite) |
| company | no | BrightLoans Financial Services Pvt Ltd | agent `{{company}}`; /bookAppointment; PCA. Tanya says only the short name |
| industry | no | lending | agent `{{industry}}` |
| email | yes | priya@brightloans.com | /bookAppointment (the invite goes here); PCA. Never read out on the call |
| timezone | yes | Asia/Kolkata | added by the platform to /getAvailableSlots and /bookAppointment |
| defaultLanguage | yes | English | agent `{{defaultLanguage}}`: the language the call opens in |
| priorContext | yes | First call to them. Sales head at a lending company. | agent `{{priorContext}}`; PCA |

Rules:
- Any value you do not have is the text `Not Available`. Never leave a cell empty.
- `timezone` must be an IANA name (Asia/Kolkata, America/New_York, Europe/London), not "IST" or "EST".
  A wrong value makes the service answer 400, and Tanya cannot offer times.
- `email` must be a real address, or every booking for that contact fails.
- `priorContext` is plain English, a few sentences, no instructions, no budget or internal ratings. Examples:
  - First call: `First call to them. Sales head at a lending company, filled the website form about delivery-update calls.`
  - Follow-up: `Spoke with Rohit from our sales team on 12 November. They need inbound support in Hindi and Tamil and CRM updates after each call. Concern: data security. Agreed next step: a demo.`

Example CSV:

```
Contact,fname,lname,company,industry,email,timezone,defaultLanguage,priorContext
+919876543210,Priya,Sharma,BrightLoans Financial Services Pvt Ltd,lending,priya@brightloans.com,Asia/Kolkata,English,First call to them. Sales head at a lending company.
+12125550147,Daniel,Not Available,Harbor Lending,lending,daniel@harborlending.com,America/New_York,English,Not Available
```

---

## 2. Agent prompt variables (5)

| In the prompt | From | Example |
|---|---|---|
| `{{fname}}` | contact fname | Priya |
| `{{company}}` | contact company | BrightLoans Financial Services Pvt Ltd |
| `{{industry}}` | contact industry | lending |
| `{{defaultLanguage}}` | contact defaultLanguage | English |
| `{{priorContext}}` | contact priorContext | First call to them. Sales head at a lending company. |

No date variables in the agent. `{{system.current_date}}` and `{{system.current_day_of_week}}` are the platform's
own clock, which can be a different day from the prospect's (a call to New York at 1 AM IST Tuesday is still
Monday there). So Tanya passes a day as a word ("tomorrow", "wednesday") and the service works out the date in the
prospect's own timezone.

Greeting (first message): `Hi {{fname}}, it's Tanya from VoiceOwl.`, played after the prospect says hello, in
`{{defaultLanguage}}`.

---

## 3. Tool 1: getAvailableSlots

`POST https://<your-host>/getAvailableSlots`, headers `x-api-key: <API_KEY>` and `content-type: application/json`.
Everything is in the **prospect's own time**: the model never sees IST or UTC.

| Body key | Set by | Accepted values |
|---|---|---|
| timezone | platform, from the contact (hidden from the model) | an IANA name: Asia/Kolkata, America/New_York, Asia/Tokyo (required) |
| preferredDay | model, only when the prospect named a day | exactly one of: `today`, `tomorrow`, `day after tomorrow`, `monday` ... `sunday`, `in N days` (digits, e.g. `in 4 days`), or the date of the month as digits `1` to `31` (e.g. `30`) |
| preferredTime | model, only when the prospect named a time | `morning` (before 12), `afternoon` (12 to 4 PM), `evening` (4 PM on), or an exact 24-hour time `HH:MM` such as `16:00`. The model confirms an hour like "at four" (morning or afternoon?) before passing it |

Both model parameters are text. Leave them out when the prospect named nothing: the service offers the earliest
free times. A value it does not understand is ignored the same way.

No preToolMessage (2026-11-24): the turn is the call alone, as with bookAppointment. Leave the field empty on the platform.

Examples the service receives:
- On the prospect's yes, no preference yet: `{"timezone":"Asia/Kolkata"}`
- "Tomorrow at 4 PM?": `{"timezone":"Asia/Kolkata","preferredDay":"tomorrow","preferredTime":"16:00"}`
  When 4:00 PM is free, the reply offers that one time and Tanya asks "Shall I book it?". When it is not
  available for any reason (taken, outside hours, passed), the reply says so and offers the two nearest free times.
- "On the 27th, afternoon": `{"timezone":"America/New_York","preferredDay":"27","preferredTime":"afternoon"}`
- "In three days": `{"timezone":"Asia/Tokyo","preferredDay":"in 3 days"}`

Result: `returnCode`, then the toolResponse. Each option has its time in words (spoken) and its `startTime` (copied into
bookAppointment, never spoken), the prospect's local time:

```json
{"returnCode":200,"toolResponse":"Success: Two times are free. Option 1: tomorrow, four in the evening, startTime 2026-11-25T16:00. Option 2: tomorrow, five in the evening, startTime 2026-11-25T17:00. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose."}
```

Platform variable for this reply's `toolResponse`: **availableSlotstoolResponse** (the prompt calls it by this name).

`returnCode` comes first in every reply of both tools and is only ever `200` or `500`: `200` when the API worked and returned data (any `Success:` or `Failure:` answer, booked or not), `500` when the calendar could not be checked, the booking did not go through, or the request was rejected. The calendar-down reply is `{"returnCode":500,"toolResponse":"Failure: The calendar could not be checked. …"}`.

Every toolResponse starts with `Success:` or `Failure:`. All of them:

| Case | toolResponse |
|---|---|
| Two free | `Success: Two times are free. Option 1: …, startTime …. Option 2: …, startTime …. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose.` |
| One free | `Success: One time is free. The one free time is Wednesday, twelve noon, startTime 2026-11-25T12:00. Offer it in words, never the startTime, and ask if it works. To book, pass this startTime.` |
| Nothing free | `Failure: No time is free for that request. Ask which other day suits them.` |
| Exact time asked, free | `Success: That time is free: tomorrow, four in the evening, startTime 2026-11-25T16:00. Say it in words, never the startTime, and ask if they want it. On a yes, book this startTime.` |
| Exact time asked, not available | `Failure: That time is not available. Option 1: …, startTime …. Option 2: …, startTime …. Offer both in words, never the startTime, and ask which works better. To book, pass the startTime of the option they choose.` |
| Weekend asked (Saturday, Sunday, or a date that falls on one) | `Failure: Calls are Monday to Friday only. Ask which weekday suits them.` |
| Day already passed (yesterday, or a date earlier this month) | `Failure: That day has passed. Ask which day suits them.` |
| Day not in the list (e.g. "next week") | `Failure: That day was not understood. Ask which day suits them.` |
| More than 15 days away | `Failure: That day is more than 15 days away. Ask for a day in the next 15 days.` |
| Service or Google down | `Failure: The calendar could not be checked. Tell the prospect our team will send them the details on email and WhatsApp.` |

---

## 4. Tool 2: bookAppointment

`POST https://<your-host>/bookAppointment`, same headers. No preToolMessage.

| Body key | Set by | Value | Required |
|---|---|---|---|
| startTime | model | copied from the chosen option, e.g. `2026-11-25T16:00` (prospect's local time) | yes |
| appointmentNotes | model | one English line: their problem, any colleague, any email request, or "none" | no |
| email | platform, from the contact | priya@brightloans.com | yes |
| timezone | platform, from the contact | Asia/Kolkata | yes |
| fname | platform, from the contact | Priya | no |
| lname | platform, from the contact | Sharma | no |
| company | platform, from the contact | BrightLoans Financial Services Pvt Ltd | no |

Example the service receives:

```json
{"startTime":"2026-11-25T16:00","appointmentNotes":"weekend leads wait until Monday, half are lost",
 "email":"priya@brightloans.com","timezone":"Asia/Kolkata","fname":"Priya","lname":"Sharma",
 "company":"BrightLoans Financial Services Pvt Ltd"}
```

The service books the startTime only when it is still one of the free slots (15-minute grid, both working hours,
within 15 days, free in Google). Result when booked:

```json
{"returnCode":200,"booked":true,"reason":"booked",
 "toolResponse":"Success: The call is booked for tomorrow, four in the evening. Tell the prospect the invite is in their email and they can accept it whenever it suits them. Do not push them to accept it now.",
 "prospectTime":"Wednesday, 25 November 2026, 4:00 PM (Asia/Kolkata)",
 "salesTime":"Wednesday, 25 November 2026, 4:00 PM (Asia/Kolkata)",
 "meetLink":"https://meet.google.com/abc-defg-hij","eventId":"bc64c442..."}
```

For a New York prospect at 11:00 AM their time: `prospectTime` "Wednesday, 25 November 2026, 11:00 AM
(America/New_York)", `salesTime` "Wednesday, 25 November 2026, 9:30 PM (Asia/Kolkata)".

Not booked (each comes with the two free times nearest the one asked, so the model offers them at once):
- Taken meanwhile: `{"returnCode":200,"booked":false,"reason":"slot_taken","toolResponse":"Failure: That time was just taken. Option 1: …, startTime …. Option 2: …","prospectTime":"Not Available","salesTime":"Not Available","meetLink":"Not Available","eventId":"Not Available"}`
- Wrong or garbled startTime: `{"returnCode":200,"booked":false,"reason":"not_offered","toolResponse":"Failure: That startTime is not a free time. Option 1: …", …the same four "Not Available" fields}`
- Error: `{"returnCode":500,"booked":false,"reason":"error","toolResponse":"Failure: The booking did not go through. Tell the prospect our team will send them the details on email and WhatsApp. Do not try to book again.", …the same four "Not Available" fields}`

A repeat of a booking that already went through answers booked again, with no second event.

Every reply, booked or not, has the same eight fields in the same order: `returnCode`, `booked`, `reason` (`booked`,
`slot_taken`, `not_offered`, `no_start_time` or `error`), `toolResponse`, `prospectTime`, `salesTime`, `meetLink`, `eventId`. When
nothing was booked the last four are `Not Available`, so the call variables can be mapped once for every case.

Platform variable for this reply's `toolResponse`: **bookAppointmenttoolResponse** (the prompt calls it by this name).

**Save from this reply as call variables:** `prospectTime` → `bookedTime` (used by the PCA), `salesTime` →
`salesTime` (for the CRM), and `meetLink` → `meetLink`. When nothing was booked, they stay `Not Available`.

Google shows the event in each person's own calendar timezone by itself. Nobody converts anything by hand.

## 5. Tool 3: callhangup

Platform tool, no parameters. The closing line goes in its preToolMessage (the prompt sets it).

## 5a. After-call tool: sendGmail

Not an agent tool: the platform calls it after the PCA. Full details in GMAIL_SETUP.md.

`POST https://<your-host>/sendGmail`, same headers. Body:
`{"to":"{{email}}","subject":"{{emailSubject}}","body":"{{emailMessage}}"}`

Reply: `{"sent":true,"toolResponse":"Success: The email was sent.","messageId":"18c..."}`. When the PCA wrote
"none" the service sends nothing and answers `"reason":"nothing_to_send"`, so the tool can run after every call.

---

## 6. After the call: PCA

Inputs: the transcript, `{{fname}}`, `{{company}}`, `{{priorContext}}`, `{{bookedTime}}`, `{{meetLink}}`.

### Where each detail comes from

| Detail | Most reliable source |
|---|---|
| Booked day and time, Meet link | bookAppointment reply (`prospectTime`, `meetLink`), saved as call variables, then given to the PCA |
| Booked or not, slot taken, error | bookAppointment reply (`booked`, `reason`); the PCA's `callResult` agrees with it |
| Invite accepted | not tracked by the PCA (removed 2026-11-25). Google's own accept status needs a later check by `eventId` (not built) |
| Problem, objections, interest, callback time, colleague, do-not-call | the conversation (PCA) |

### PCA output, example for a booked call

```json
{
 "callResult": "booked",
 "painPoint": "slowResponse",
 "painDetail": "weekend leads wait until Monday, half are lost",
 "mainObjection": "none",
 "colleagueToInvite": "none",
 "callbackTime": "none",
 "interestLevel": "high",
 "noAICalls": "no",
 "doNotCall": "no",
 "summary": "Priya answered ... (40 to 80 words)",
 "whatsappMessage": "Hi Priya,\n\nThanks for your time. Your 15-minute call with Hussain is booked for Monday, 23 November 2026, 3:00 PM, where you'll see how VoiceOwl helps your customers speak in their own language.\n\nJoin here: https://meet.google.com/abc-defg-hij\nA calendar invite has also been sent to you; please accept it whenever it suits you.\n\nTanya, VoiceOwl",
 "emailSubject": "Your VoiceOwl call is booked for Monday, 23 November, 3:00 PM",
 "emailMessage": "Hi Priya,\n\nThanks for your time. Your 15-minute call with Hussain is booked for Monday, 23 November 2026, 3:00 PM, where you'll see how VoiceOwl helps your customers speak in their own language.\n\nJoin here: https://meet.google.com/abc-defg-hij\nA calendar invite has also been sent to you; please accept it whenever it suits you.\n\nTanya, VoiceOwl"
}
```

### Where each field goes

| PCA field | Send to | Notes |
|---|---|---|
| whatsappMessage | WhatsApp, free text, to Contact | send only when not "none" |
| emailSubject | `subject` of the sendGmail tool (section 5a) | the service skips "none" |
| emailMessage | `body` of the sendGmail tool (section 5a) | `\n\n` is a paragraph break |
| callResult | CRM status | booked, bookingFailed, doNotCall, callbackLater, notInterested, gatekeeper, wrongNumber, voicemail, disconnected |
| painPoint, painDetail, mainObjection, interestLevel | CRM notes for sales | painPoint: slowResponse, tooManyCalls, language, other, none |
| colleagueToInvite | sales follow-up | |
| callbackTime | callback scheduling | the prospect's own words, not a date |
| doNotCall, noAICalls | suppression list | "yes": never call again / only a human may call |
| summary | CRM | |

The PCA writes messages for three callResult values only: booked, bookingFailed and callbackLater (the last two
carry the booking link). gatekeeper, voicemail and disconnected (and platform no-answer or busy) get the platform's own
fixed missed-call template. notInterested, doNotCall and wrongNumber get nothing. Anyone with doNotCall or noAICalls
"yes" gets nothing, whatever callResult says.

---

## 7. Check list before the first test call

1. Upload columns: Contact, fname, lname, company, industry, email, timezone, defaultLanguage, priorContext.
   Not Available where unknown; valid timezone and email.
2. Agent variables: fname, company, industry, defaultLanguage, priorContext. Nothing else.
3. getAvailableSlots: timezone added by the platform; preferredDay and preferredTime from the model.
4. bookAppointment: startTime and appointmentNotes from the model; email, timezone, fname, lname, company added by the platform.
5. Save bookAppointment's `prospectTime`, `salesTime` and `meetLink` as call variables `bookedTime`, `salesTime` and `meetLink`.
6. PCA inputs as in section 6 (bookedSlot, inviteAccepted, askedIfAI removed 2026-11-25); three message fields mapped; emailStatus and correctedEmail gone.
7. sendGmail tool after the PCA: to, subject, body (section 5a). Token from `node auth.mjs` with the Gmail scopes.
8. Server and ngrok running; test the URL from Postman first.
