# Platform setup: contact upload, call variables, tool mapping, after-call messages

Updated 2026-11-20 from the current files: default/default.txt (agent), pca/pca.txt (post-call analysis),
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

| Body key | Set by | Value |
|---|---|---|
| timezone | platform, from the contact | Asia/Kolkata (required) |
| preferredDay | model, only when the prospect named a day | today, tomorrow, monday ... friday (saturday, sunday answer "weekdays only") |
| preferredTime | model, only when the prospect named a time | morning, afternoon, evening, or an exact time in 24-hour form such as 16:00 |

preToolMessage: `Let me check the calendar.`

Examples the service receives:
- No preference: `{"timezone":"Asia/Kolkata"}`
- "Tomorrow at 4 PM?": `{"timezone":"Asia/Kolkata","preferredDay":"tomorrow","preferredTime":"16:00"}`
  The 4:00 PM slot comes first when free, then the nearest other free slot.
- "Wednesday afternoon": `{"timezone":"America/New_York","preferredDay":"wednesday","preferredTime":"afternoon"}`

Result (what the model reads):

```json
{"slots":[
 {"slotId":"htda6-6f65e2","startUtc":"2026-11-23T08:30:00.000Z","spokenLabel":"today, two in the afternoon"},
 {"slotId":"htdbu-31f5ca","startUtc":"2026-11-23T09:30:00.000Z","spokenLabel":"today, three in the afternoon"}],
 "toolResponse":"Success: Two times are free: today, two in the afternoon, or today, three in the afternoon. Offer both and ask which works better."}
```

Every toolResponse starts with `Success:` or `Failure:`. All of them:

| Case | toolResponse |
|---|---|
| Two slots | `Success: Two times are free: today, four in the evening, or today, five in the evening. Offer both and ask which works better.` |
| One slot | `Success: One time is free: Wednesday, twelve noon. Offer it and ask if it works.` |
| Nothing free | `Failure: No time is free for that request. Ask which other day or time in the next seven days suits them.` |
| Weekend asked | `Failure: Demos are Monday to Friday only. Ask which weekday suits them.` |
| Service or Google down | `Failure: The calendar could not be checked. Tell the prospect our team will send them the details on email and WhatsApp.` |

---

## 4. Tool 2: bookAppointment

`POST https://<your-host>/bookAppointment`, same headers. No preToolMessage.

| Body key | Set by | Value | Required |
|---|---|---|---|
| slotId | model | the chosen slot's slotId, e.g. htdbu-31f5ca | yes |
| appointmentNotes | model | one English line: their problem, any colleague, any email request, or "none" | no |
| email | platform, from the contact | priya@brightloans.com | yes |
| timezone | platform, from the contact | Asia/Kolkata | yes |
| fname | platform, from the contact | Priya | no |
| lname | platform, from the contact | Sharma | no |
| company | platform, from the contact | BrightLoans Financial Services Pvt Ltd | no |

Example the service receives:

```json
{"slotId":"htdbu-31f5ca","appointmentNotes":"weekend leads wait until Monday, half are lost",
 "email":"priya@brightloans.com","timezone":"Asia/Kolkata","fname":"Priya","lname":"Sharma",
 "company":"BrightLoans Financial Services Pvt Ltd"}
```

Result when booked:

```json
{"booked":true,"spokenLabel":"today, three in the afternoon",
 "toolResponse":"Success: The demo is booked for today, three in the afternoon. Tell the prospect the invite is in their email and they can accept it whenever it suits them. Do not push them to accept it now.",
 "prospectTime":"Monday, 23 November 2026, 3:00 PM (Asia/Kolkata)",
 "salesTime":"Monday, 23 November 2026, 3:00 PM (Asia/Kolkata)",
 "startUtc":"2026-11-23T09:30:00.000Z","meetLink":"https://meet.google.com/abc-defg-hij","eventId":"bc64c442..."}
```

- Slot taken: `{"booked":false,"reason":"slot_taken","toolResponse":"Failure: That time was just taken. Check the calendar again and offer the new times."}`
- Error: `{"booked":false,"reason":"error","toolResponse":"Failure: The booking did not go through. Tell the prospect our team will send them the details on email and WhatsApp. Do not try to book again."}`

**Save two fields from this reply as call variables for the PCA:** `prospectTime` → `bookedTime`, and
`meetLink` → `meetLink`. When nothing was booked, they stay `Not Available`.

Timezones: Google stores one moment in time (startUtc). The service writes it in the prospect's timezone
(`prospectTime`, used in messages) and in the sales team's (`salesTime`, for your CRM). Google shows the event in
each person's own calendar timezone by itself. Nobody converts anything by hand.

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

Inputs: the transcript, `{{system.current_date}}`, `{{system.current_time}}`, `{{fname}}`, `{{company}}`,
`{{email}}`, `{{priorContext}}`, `{{bookedTime}}`, `{{meetLink}}`.

### Where each detail comes from

| Detail | Most reliable source |
|---|---|
| Booked day and time, Meet link | bookAppointment reply (`prospectTime`, `meetLink`), saved as call variables, then given to the PCA |
| Booked or not, slot taken, error | bookAppointment reply (`booked`, `reason`); the PCA's `callResult` agrees with it |
| Invite accepted | only what the prospect said on the call (PCA `inviteAccepted`). Google's own accept status needs a later check by `eventId` (not built) |
| Problem, objections, interest, callback time, colleague, do-not-call | the conversation (PCA) |

### PCA output, example for a booked call

```json
{
 "callResult": "booked",
 "bookedSlot": "Monday, 23 November 2026, 3:00 PM (Asia/Kolkata)",
 "inviteAccepted": "yes",
 "painPoint": "slowResponse",
 "painDetail": "weekend leads wait until Monday, half are lost",
 "mainObjection": "none",
 "colleagueToInvite": "none",
 "callbackTime": "none",
 "interestLevel": "high",
 "askedIfAI": "no",
 "noAICalls": "no",
 "doNotCall": "no",
 "summary": "Priya answered ... (40 to 80 words)",
 "whatsappMessage": "Hi Priya, thanks for your time. Your fifteen-minute VoiceOwl demo with Hussain, our Sales Head, is booked for Monday, 23 November 2026, 3:00 PM, your time, on Google Meet. The slot is reserved for you. Join here: https://meet.google.com/abc-defg-hij. Hussain will show you how an agent handles weekend leads that wait until Monday. Tanya, VoiceOwl",
 "emailSubject": "Your VoiceOwl demo is booked for Monday, 23 November, 3:00 PM",
 "emailMessage": "Hi Priya,\n\nThanks for your time today. Your fifteen-minute VoiceOwl demo with Hussain, our Sales Head, is booked for Monday, 23 November 2026, 3:00 PM, your time, on Google Meet. The slot is reserved for you.\n\nJoin here: https://meet.google.com/abc-defg-hij. The link is also in the calendar invite we sent you. Hussain will show you how a VoiceOwl agent handles weekend leads that wait until Monday.\n\nTanya, VoiceOwl"
}
```

### Where each field goes

| PCA field | Send to | Notes |
|---|---|---|
| whatsappMessage | WhatsApp, free text, to Contact | send only when not "none" |
| emailSubject | `subject` of the sendGmail tool (section 5a) | the service skips "none" |
| emailMessage | `body` of the sendGmail tool (section 5a) | `\n\n` is a paragraph break |
| callResult | CRM status | booked, bookingFailed, doNotCall, callbackLater, notInterested, gatekeeper, wrongNumber, voicemail, disconnected |
| bookedSlot, inviteAccepted | CRM | |
| painPoint, painDetail, mainObjection, interestLevel | CRM notes for sales | painPoint: slowResponse, tooManyCalls, language, other, none |
| colleagueToInvite | sales follow-up | |
| callbackTime | callback scheduling | the prospect's own words, not a date |
| doNotCall, noAICalls | suppression list | "yes": never call again / only a human may call |
| summary | CRM | |

Messages are written in three cases only: booked; booking failed or no slot (the team will send times); information
asked for. All other calls, and anyone with doNotCall or noAICalls "yes", get "none" in all three fields.

---

## 7. Check list before the first test call

1. Upload columns: Contact, fname, lname, company, industry, email, timezone, defaultLanguage, priorContext.
   Not Available where unknown; valid timezone and email.
2. Agent variables: fname, company, industry, defaultLanguage, priorContext. Nothing else.
3. getAvailableSlots: timezone added by the platform; preferredDay and preferredTime from the model.
4. bookAppointment: slotId and appointmentNotes from the model; email, timezone, fname, lname, company added by the platform.
5. Save bookAppointment's `prospectTime` and `meetLink` as call variables `bookedTime` and `meetLink` for the PCA.
6. PCA inputs as in section 6; three message fields mapped; emailStatus and correctedEmail gone.
7. sendGmail tool after the PCA: to, subject, body (section 5a). Token from `node auth.mjs` with the Gmail scopes.
8. Server and ngrok running; test the URL from Postman first.
