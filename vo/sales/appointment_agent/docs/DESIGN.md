# Appointment Agent — Design (discussion draft, no prompt yet)

Status 2026-11-17: decisions from the user, plus proposals marked **[Proposed]**
for the user to accept or change. `default/default.txt` stays empty until the
go-ahead. Research behind each point: RESEARCH.md.

---

## 1. Decided by the user (2026-11-17)

| Topic | Decision |
|---|---|
| Purpose | Outbound call that books a 15-minute demo with the VoiceOwl sales team. |
| Who we call | Anyone VoiceOwl's services could help. Leads come mixed: website, events, LinkedIn, cold lists, others. Sales team to confirm the source per lead. |
| Reach | Worldwide. |
| Language | Multilingual: the agent speaks the prospect's language. |
| Persona | Male voice. Other details decided by Claude (section 2). |
| AI disclosure | Only when the prospect asks. |
| Opening | Must be engaging and lead to booking. The opener is the most important part. |
| Demo | 15 minutes, Google Meet link from the calendar event, run by the sales team. |
| Calendar | One shared Google Calendar (sales team). Any free time there in the next 15 days is bookable. |
| Tools | HTTP tools on the VoiceOwl platform, built by the user: check availability, book appointment. |
| Prospect email | Already in the lead data. |
| Slots | Offer two. If both refused, ask what they prefer and check that. |
| Confirmation | WhatsApp and email sent by the platform after the call: "you booked a demo" + details. |
| Reminders | Confirmation at booking, 24 hours before, 1–2 hours before (platform). |
| Objections | Intelligent, conversational, engaging: built to win the booking, not one line and give up. |
| Product talk | Allowed. Pricing: the agent knows nothing; it's covered in the demo. |
| Not interested / do not call | Respect it; post-call analysis marks it and we never call again. |
| Compliance | Agreed: number series, DND scrubbing, consent are platform/ops work. |

---

## 2. Persona [Proposed]

- **Name: Neil.** Short, one syllable, easy to say and hear in any language and
  accent, and not tied to one country. Alternatives: Adam, Ryan, Arjun.
- **Role, if asked:** "I'm on the team at VoiceOwl." No job title on a cold call.
- **Character:** a calm, curious peer, not a salesman. Warm, a little playful,
  never needy. He sounds like he is checking whether there's a fit, not pushing.
- **Delivery** (from RESEARCH.md section 7): calm pace, statements end flat or
  down (no eager up-tone), questions sound genuinely curious, short sentences
  (under 15 words), light humour on objections. Part of this is TTS voice
  settings (speed, stability), part is prompt rules.

---

## 3. Call flow [Proposed]

Built on Sarah Brazier's four stages (30MPC), cut to a short call. Target: booked
inside about two minutes. Example lines are for discussion only; they are not the
prompt, and the real lines get written per language.

### Stage 0 — Who picked up (first turn)

Platform first message: "Hi, is this {{firstName}}?"
- Yes → stage 1.
- Gatekeeper / wrong person → ask for {{firstName}} or a better time to reach them;
  never pitch to a gatekeeper.
- Voicemail → see section 6.

### Stage 1 — The opener: earn the next 30 seconds (the first 8 seconds)

Three parts, said together in one breath:
1. **Name + one line of context** (why *them*), from the lead source if we have it.
2. **Honest pattern interrupt.**
3. **Permission with a time limit**, handing them control.

Example with context (website / event / LinkedIn):
> "Hey {{firstName}}, Neil from VoiceOwl. You checked us out at {{leadContext}}...
> I'll be honest, this is a sales call. Can I take twenty seconds to tell you why I
> called, and you tell me if it's worth another minute?"

Example without context (cold list):
> "Hey {{firstName}}, Neil from VoiceOwl. I know, nobody loves a call out of the
> blue. Give me twenty seconds to tell you why I picked {{company}}, and then you
> decide if I hang up. Fair?"

Why: context first + reason for the call + permission are the three
best-performing elements in Gong's data; the honest line and "you decide" hand back
control and kill the hang-up reflex. Never "is this a bad time?" or "how are you
today?".

### Stage 2 — Their current state (one question)

Show we know their world; ask them to confirm. Line picked by role/industry:
> "Most {{role}}s I talk to tell me the same thing: lead lists keep growing, but
> the team can only call so many people a day. Is that about right for you?"

### Stage 3 — The problem they don't see (no pitch yet)

> "The catch is, the leads you don't reach in the first few minutes mostly go cold.
> Has that happened at {{company}}?"
Then listen. One follow-up: "Tell me more about that."
(Problem lines per audience are in section 5. The speed-to-lead fact, 21x within 5
minutes, is the strongest hook because it's true for nearly every sales team.)

### Stage 4 — Tie it to their words and book

One sentence of solution using what *they* just said, then go straight to *when*,
not *whether* (Jason Bay):
> "That's exactly what we fix. Our voice agents call every lead in under a minute,
> in their own language, around the clock. Let me get you a quick fifteen minutes
> with our team so you can hear it for yourself. I have Tuesday at eleven or
> Wednesday at four, your time. Which works better?"

If the prospect is lukewarm, soften to the low-friction version:
> "Would a fifteen-minute look be worth it, just so you know what's out there?"

### Stage 5 — Confirm and close

1. Read back once: day, date, time, "your time".
2. Email: confirm without reading the full address aloud: "I'll send the Google
   Meet invite to your email at {{emailDomain}}. Is that the right one?"
   - Different email → book with the one on file and say the WhatsApp message lets
     them reply with the right one (no spelling on the call). [Proposed — needs
     platform support, see section 9.]
3. Book (tool). Then: "You'll get the details on WhatsApp and email. When the
   invite arrives, could you accept it so it's in your calendar?" (a small spoken
   commitment improves show-up).
4. Close warm and short.

---

## 4. "Are you a bot?" — the reveal [Proposed]

Disclosure only when asked (decided). When asked, the honest yes *is* the pitch:
> "Yes, I'm VoiceOwl's AI agent. And honestly, that's the whole point: this call is
> the demo. Imagine your customers getting a call like this one. Shall I book you
> fifteen minutes with the team to see how it would work for you?"

If the prospect is upset about talking to an AI: apologise once, offer a human from
the sales team on the demo, or close politely.

---

## 5. Objections: conversational, built to book [Proposed]

Rule set (30MPC "Mr. Miyagi" + Brazier):
1. **Agree** first, lightly, with some humour. Never argue.
2. **Ask one question** to find the real reason.
3. **Sell the 15-minute look, not the product**, tied to what they just said.
4. **Two rounds maximum** on the same call. A clear second no, or "don't call me",
   closes politely (post-call analysis marks it).

| They say | Neil's direction |
|---|---|
| "Not interested." | "All good, you'd have called *us* if you were!" Then: "Is it just not a priority, or do you already have something for this?" Real reason → round 2. |
| "Send me an email." | "Happy to. So I don't send you something useless, what's your biggest headache with calls right now?" → "Honestly, fifteen minutes would show you faster than any PDF whether it's relevant." Offer two slots. |
| "We already have a solution / a call centre." | "Makes sense, most teams we talk to do." Ask how happy they are with it (a 6 or a 10 out of 10?). → "Then fifteen minutes just to compare, keeps your current setup honest." |
| "Busy / in a meeting." | "No problem. Two seconds: can I book fifteen minutes later this week instead?" Else ask for a callback time. |
| "Call me in six months." | "Fair, timing's everything. Fifteen minutes now means you'll know your options when the time comes." If no, ask the month and close. |
| "What does it cost?" | "That depends on your volumes, and I'm not the right one for numbers. The team covers exactly that in the demo." Offer slots. |
| "How did you get my number?" | Fixed honest line per lead source (sales team to provide). |
| "I'm not the decision-maker." | "Totally get it. People in your role usually have a big say in this though. Who else should join the fifteen minutes?" Book them + note the colleague. |
| Product questions | One or two short, true answers from the approved facts (section 7), then: "The demo shows that live." |

---

## 6. Edge cases [Proposed]

- **Voicemail:** hang up, no message (a voicemail from an AI with no human callback
  rarely converts). Mark in post-call analysis; platform retries.
- **"Hello?" / silence:** repeat the last line, shorter.
- **No free slots on the chosen day:** offer the nearest two.
- **Slot taken between check and booking:** apologise, offer the next two.
- **Tool fails:** "Our team will send you a couple of times on WhatsApp", close;
  analysis marks it.
- **Prospect switches language:** switch with them for the rest of the call.
- **Wants to reschedule mid-call:** rebook once.
- **Abuse / angry:** apologise once, close, mark do-not-call.

---

## 7. Data the agent needs per call (variables) [Proposed]

| Variable | Use | Required? |
|---|---|---|
| {{firstName}} | Greeting | Yes |
| {{company}} | Opener, problem line | Yes |
| {{role}} | Picks the problem line | Optional (generic line if missing) |
| {{industry}} | Picks the problem line | Optional |
| {{leadSource}} | website / event / linkedin / cold / other | Yes |
| {{leadContext}} | e.g. event name, page they visited | Optional |
| {{country}} | Language default, greeting style | Yes |
| {{timezone}} | IANA, e.g. Asia/Kolkata, America/New_York. Slots are spoken in the prospect's local time | Yes |
| {{language}} | Starting language | Yes (or derived from country) |
| {{email}} / {{emailDomain}} | Invite + spoken confirmation | Yes |

Plus an **approved facts list** for product questions (from voiceowl.ai: 135+
languages, 200M+ interactions, 60% cost reduction, proof of concept in 48–72 hours,
launch in a week, compliance list). Sales team to approve which ones Neil may say.

---

## 8. Tools [Proposed contract for the HTTP tools]

Principle: **the tool does all date, time and timezone maths**; the model only reads
out labels. LLMs are unreliable at date arithmetic and timezone conversion.

### getAvailableSlots

Input:
- `timezone` — prospect's IANA timezone
- `preferredDate` — optional, YYYY-MM-DD in the prospect's timezone
- `partOfDay` — optional: morning / afternoon / evening
- `excludeSlotIds` — optional, slots already offered and refused

Output: up to **two** free 15-minute slots inside the next 15 days, inside
working hours (see section 9), each with:
- `slotId`
- `startUtc`
- `spokenLabel` — in the prospect's local time and words, e.g. "Tuesday the
  nineteenth, eleven in the morning". Language: English label, or one per call
  language? (section 9)

Empty list = nothing free for that request.

### bookDemo

Input: `slotId`, `firstName`, `lastName`, `company`, `email`, `timezone`, `notes`
(one line: pain mentioned, colleague to invite).

Output: `booked: true` + `spokenLabel` + `meetLink`, or `booked: false` +
`reason: slot_taken | error`.

The calendar event adds the prospect as a guest, so Google itself emails the Meet
invite. The platform then sends WhatsApp + email after the call.

---

## 9. Still open (needs the user or the sales team)

1. **Persona name** — Neil OK?
2. **Working hours** — free calendar time in the sales team's timezone (IST?) may
   fall at night for a prospect in the US. Should the tool also filter to the
   prospect's working hours (e.g. 9 am–7 pm their time)? Recommended: yes.
3. **Which variables the lead data really carries** (section 7). Without
   {{timezone}} the agent cannot offer correct times.
4. **"How did you get my number?"** — answer per lead source (sales team).
5. **Approved claims** — which VoiceOwl facts Neil may say (sales team).
6. **Spoken slot labels** — tool returns them per language, or English labels that
   Neil translates? Recommended: tool returns date/time parts, Neil speaks them in
   the call language using fixed rules (as the BPCL agents do for dates).
7. **Wrong email on file** — is a WhatsApp "reply with your email" flow possible on
   the platform? If not, Neil spells it back on the call.
8. **Callbacks** — when the prospect says "call me tomorrow", does the platform
   re-dial at a time from the post-call analysis?
9. **AI disclosure abroad — legal check.** Disclosure only when asked is the
   decision. Some places may require AI calls to say so up front (EU AI Act
   transparency rules for AI that talks to people; the US FCC treats AI voices as
   "artificial voice" under the TCPA, which needs prior consent). Ask legal whether
   some countries need a disclosure line the platform adds per country. The prompt
   design does not change either way.
10. **Call recording notice** — some countries/states need "this call is recorded".
    Platform or prompt?
11. **Post-call analysis fields** — proposed: callResult (booked / callback /
    notInterested / doNotCall / wrongPerson / gatekeeper / voicemail / failed),
    slotStartUtc, email, emailCorrection, objection, painMentioned, colleagueToInvite,
    callbackTime, interestLevel, askedIfAI, language.
