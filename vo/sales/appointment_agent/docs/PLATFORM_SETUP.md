# Platform setup: contact upload, call variables, tool mapping, after-call messages

Written 2026-11-20 from the current files: default/default.txt (agent), pca/pca.txt (post-call analysis),
service/server.mjs and service/slots.mjs (booking service). Field names below must match exactly.

---

## 1. Contact upload (one row per prospect)

| Column | Required | Example | Used for |
|---|---|---|---|
| phone | yes | +919876543210 | the number to dial (platform field) |
| firstName | yes | Priya | agent variable `{{firstName}}`; greeting; closing lines; /book |
| lastName | no | Sharma | sent to /book (name on the calendar invite) |
| company | no | BrightLoans Financial Services Pvt Ltd | agent variable `{{company}}`; /book. Tanya says only the short name |
| industry | no | lending | agent variable `{{industry}}` |
| email | yes | priya@brightloans.com | sent to /book (invite goes here); never read out |
| timezone | yes | Asia/Kolkata | agent variable `{{timezone}}`; every /slots and /book call |
| defaultLanguage | yes | English | agent variable `{{defaultLanguage}}`; language the call opens in |
| priorContext | yes | First call to them. Sales head at a lending company. | agent variable `{{priorContext}}` |

Rules:
- Any value you do not have is the text `Not Available`. Never leave a cell empty.
- `timezone` must be an IANA name (Asia/Kolkata, America/New_York, Europe/London). Not "IST" or "EST".
  A wrong value makes the booking service return 400, so Tanya cannot offer times.
- `email` must be a real address (something@something.something). If it is Not Available, the booking fails.
- `priorContext` is always filled. Two examples:
  - First call: `First call to them. Sales head at a lending company, filled the website form about
    delivery-update calls.`
  - Follow-up: `Spoke with Rohit from our sales team on 12 November. They need inbound support in Hindi and
    Tamil and CRM updates after each call. Concern: data security. Agreed next step: a demo.`
  Plain English, a few sentences, no instructions. Do not put budget or internal ratings in it.

Example CSV:

```
phone,firstName,lastName,company,industry,email,timezone,defaultLanguage,priorContext
+919876543210,Priya,Sharma,BrightLoans Financial Services Pvt Ltd,lending,priya@brightloans.com,Asia/Kolkata,English,First call to them. Sales head at a lending company.
+12125550147,Daniel,Brooks,Harbor Lending,lending,daniel@harborlending.com,America/New_York,English,Not Available
```

---

## 2. Variables the platform fills when the call starts (agent prompt)

| Variable in the prompt | Comes from | Example |
|---|---|---|
| `{{firstName}}` | contact: firstName | Priya |
| `{{company}}` | contact: company | BrightLoans Financial Services Pvt Ltd |
| `{{industry}}` | contact: industry | lending |
| `{{priorContext}}` | contact: priorContext | First call to them. Sales head at a lending company. |
| `{{timezone}}` | contact: timezone | Asia/Kolkata |
| `{{defaultLanguage}}` | contact: defaultLanguage | English |
| `{{currentDate}}` | the platform, computed at dial time in the prospect's timezone, as YYYY-MM-DD | 2026-11-23 |
| `{{currentWeekday}}` | the platform, same moment and timezone | Monday |

Eight variables. `currentDate` and `currentWeekday` are not columns in the upload; the platform works them out
for each call. Greeting (first message): `Hi {{firstName}}, it's Tanya from VoiceOwl.`, played after the prospect
says hello, in `{{defaultLanguage}}`.

---

## 3. Tool 1: getAvailableSlots

Method and URL: `POST https://<your-ngrok-or-host>/slots`
Headers: `x-api-key: <API_KEY from .env>` and `content-type: application/json`

| Body key | Who sets it | Value |
|---|---|---|
| timezone | platform, fixed | `{{timezone}}` (required) |
| partOfDay | model, only when the prospect said it | morning / afternoon / evening |
| preferredDate | model, only when the prospect named a day | 2026-11-25 |
| excludeSlotIds | model, slots already offered and refused | ["MTc5...", "MTc5..."] |

Example sent for a first check: `{"timezone":"Asia/Kolkata"}`

Example Result (the model reads this):

```json
{"slots":[
 {"slotId":"MTc5NTQyMjYwMDAwMC4xOGZhN2E5M2JmZWZmZTNl","startUtc":"2026-11-23T08:30:00.000Z","spokenLabel":"today, two in the afternoon"},
 {"slotId":"MTc5NTQyNjIwMDAwMC5mZjRkZWNiYjRjOTA2OWM2","startUtc":"2026-11-23T09:30:00.000Z","spokenLabel":"today, three in the afternoon"}
]}
```

An empty `{"slots":[]}` means nothing free for that request. preToolMessage: `Let me check the calendar.`

---

## 4. Tool 2: bookDemo

Method and URL: `POST https://<your-ngrok-or-host>/book`, same two headers.

| Body key | Who sets it | Value | Required by the service |
|---|---|---|---|
| slotId | model | exactly the chosen slot's slotId | yes |
| notes | model | one English line: their problem, any colleague, any email request, or "none" | no |
| email | platform, from the contact | priya@brightloans.com | yes (valid address) |
| timezone | platform, from the contact | Asia/Kolkata | yes |
| firstName | platform, from the contact | Priya | no |
| lastName | platform, from the contact | Sharma | no |
| company | platform, from the contact | BrightLoans Financial Services Pvt Ltd | no |

Tanya passes only slotId and notes. The platform adds the other five from the contact record. No preToolMessage
on this tool.

Example the service receives:

```json
{"slotId":"MTc5NTQyNjIwMDAwMC5mZjRkZWNiYjRjOTA2OWM2","notes":"weekend leads wait until Monday, half are lost",
 "email":"priya@brightloans.com","timezone":"Asia/Kolkata","firstName":"Priya","lastName":"Sharma",
 "company":"BrightLoans Financial Services Pvt Ltd"}
```

Results:
- Booked: `{"booked":true,"spokenLabel":"today, three in the afternoon","meetLink":"https://meet.google.com/abc-defg-hij","eventId":"..."}`
- Slot taken: `{"booked":false,"reason":"slot_taken"}`
- Error: `{"booked":false,"reason":"error"}`

The calendar event is titled `VoiceOwl demo: Priya Sharma, BrightLoans Financial Services Pvt Ltd` and Google emails the
invite, with the Meet link, to the prospect at once.

## 5. Tool 3: callhangup

Platform tool. No parameters. The closing line goes in its preToolMessage (set by the prompt).

---

## 6. After the call: post-call analysis (PCA)

Inputs the platform gives the PCA: the transcript, `{{callStartDate}}`, `{{callStartTime}}`, `{{firstName}}`,
`{{company}}`, `{{email}}`, `{{priorContext}}`.

Output: one flat JSON. Example for the booked call:

```json
{
 "callResult": "booked",
 "bookedSlot": "today, three in the afternoon, prospect time",
 "inviteAccepted": "yes",
 "painPoint": "slowResponse",
 "painDetail": "weekend leads wait until Monday, half are lost",
 "mainObjection": "none",
 "objectionCount": "0",
 "colleagueToInvite": "none",
 "callbackTime": "none",
 "interestLevel": "high",
 "askedIfAI": "no",
 "noAICalls": "no",
 "doNotCall": "no",
 "language": "English",
 "summary": "Priya answered, ... (40 to 80 words)",
 "whatsappMessage": "Hi Priya, thanks for your time. Your fifteen-minute VoiceOwl demo with Hussain, our Sales Head, is booked for today at 3:00 PM, your time, on Google Meet. The slot is reserved for you, and the Meet link is in the calendar invite sent to your email. He will show you how an agent can handle weekend leads that wait until Monday. Tanya, VoiceOwl",
 "emailSubject": "Your VoiceOwl demo is booked for today at 3:00 PM",
 "emailMessage": "Hi Priya,\n\nThanks for your time today. Your fifteen-minute VoiceOwl demo with Hussain, our Sales Head, is booked for today at 3:00 PM, your time, on Google Meet. The slot is reserved for you.\n\nThe Google Meet link is in the calendar invite we sent to your email. In the demo, Hussain will show you how a VoiceOwl agent can handle weekend leads that wait until Monday.\n\nTanya, VoiceOwl"
}
```

### Where each field goes

| PCA field | Send it to | Notes |
|---|---|---|
| whatsappMessage | WhatsApp message body, to the contact's phone | send only when it is not "none" |
| emailSubject | Email subject line, to the contact's email | send only when it is not "none" |
| emailMessage | Email body, to the contact's email | plain text; `\n\n` is a paragraph break, convert to a blank line (or `<br><br>` in HTML) |
| callResult | CRM status / next action | booked, bookingFailed, doNotCall, callbackLater, notInterested, gatekeeper, wrongNumber, voicemail, disconnected |
| bookedSlot, inviteAccepted | CRM / dashboard | the demo time and whether they accepted the invite |
| painPoint, painDetail, mainObjection, interestLevel | CRM notes for the sales team | slowResponse, tooManyCalls, language, other, none |
| colleagueToInvite | sales follow-up | someone to add by hand |
| callbackTime | callback scheduling | text in the prospect's own words, not a date |
| doNotCall, noAICalls | suppression list | "yes" means never call again, or only a human may call |
| summary | CRM call note | one paragraph |
| language | CRM / future calls | the language the prospect spoke |

### When messages are sent

The PCA writes messages in three cases only, all other calls give "none" in all three fields:
1. callResult is booked: confirmation of the demo.
2. The booking failed or no slot was free and Tanya said the team will send times: "the team will send you a couple of times".
3. The prospect asked for information by email and no booking was made: a short VoiceOwl note and the demo offer.

Never sent: doNotCall or noAICalls is "yes".

The platform rule: `if whatsappMessage != "none" then send it`, and the same for the email pair. The Meet link is not
in the messages. It is in the Google invite, which Google sends at booking.

### WhatsApp templates (check with your provider)
A business-started WhatsApp message to someone who has not messaged you in the last 24 hours usually has to use a
template approved in advance, not free text. If so, make one template with one variable, `Hi, {{1}}`, and put
`whatsappMessage` in `{{1}}`; or tell us the template and we change the PCA to output its variable values.
Email has no such limit.

---

## 7. Check list before the first test call

1. Contact row has all nine columns, with Not Available where unknown, and a valid `timezone` and `email`.
2. Agent variables: exactly the eight in section 2. Remove role, leadSource, leadContext, leadSourceSpoken,
   emailDomain, and rename language to defaultLanguage.
3. getAvailableSlots body: `timezone` fixed from the contact; the other three from the model.
4. bookDemo body: model's `slotId` and `notes`, plus `email`, `timezone`, `firstName`, `lastName`, `company` added
   by the platform.
5. Both tools: URL, `x-api-key` header, JSON content type.
6. PCA: add the three message fields to the mapping; drop emailStatus and correctedEmail; painPoint values are
   slowResponse, tooManyCalls, language, other, none.
7. Server and ngrok running; test the URL from Postman first.
