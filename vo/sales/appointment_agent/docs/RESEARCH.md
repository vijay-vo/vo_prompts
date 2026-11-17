# Appointment Agent — Research: How Good Calls Book a Demo

Purpose: collect the best ideas from sales research, sales podcasts, Reddit-style
practitioner advice and voice-AI vendors on how an outbound call opens, earns
attention in the first few seconds, and books a demo. This is input for
`default/default.txt`, which is not written yet.

The agent: VoiceOwl's own outbound voice agent. It calls a lead, books a demo slot
in Google Calendar, and sends the details over WhatsApp and email. The call stays
short and simple: open, give the reason, offer slots, book, confirm, close.

A word on the evidence: most numbers below come from vendors that sell calling or
scheduling tools (Gong, Nooks, Orum, reminder platforms). Treat them as direction,
not proof. Where sources disagree, that is noted.

---

## 1. The first 7–8 seconds

After the prospect picks up, they decide in about 8 seconds whether to keep
listening. In that window they are silently asking three things: who is this,
why me, and how long will this take. The opener has to answer all three, briefly.

### What works

| Idea | What it sounds like | Why it works |
|---|---|---|
| **Context first, then name** | "We work with call centres like yours on voice AI... this is [agent name] from VoiceOwl." | Gong's best-performing opener (11.24% meeting rate) leads with context, then gives the name. The prospect hears relevance before they hear "sales call". |
| **Say the reason for the call straight away** | "The reason for my call is you asked about a demo on our website." | Gong: reps who state a reason for calling succeed **2.1x** more often. People want a reason for an unexpected call. |
| **Permission opener, tied to a time limit** | "Can I take thirty seconds to tell you why I called, then you decide?" | Gong: 11.18% meeting rate. Nooks: 13.9% with vs 5.8% without. Owning the interruption lowers resistance. |
| **Honesty as a pattern interrupt** | "Honestly, this is a sales call, but a short one." | An unexpected, honest line breaks the "hang up on telemarketers" reflex. Practitioners are split on it; it works best with a light tone. |

### What to avoid

| Line | Result |
|---|---|
| "Did I catch you at a bad time?" | Worst opener in Gong's data (about 0.9–2.15%, **40% less likely** to book). It hands the prospect an exit. |
| "How's your day going?" | 7.6%. It sounds like every telemarketer. |
| "How have you been?" | Gong's top line (10.01%), **but only with a prior relationship**. For a cold lead or an AI agent it rings false. Do not use. |
| A long pitch before any question | Prospects decide to leave inside 8 seconds; a monologue loses them. |

### The creative angle that only we have

**The call itself is the demo.** VoiceOwl sells voice AI, and the prospect is talking
to VoiceOwl's voice AI right now. Several AI-SDR vendors use the same move: the
prospect experiences the product before the meeting. Possible uses:

- Say openly early on that this is VoiceOwl's AI agent: "I'm VoiceOwl's AI
  assistant, and booking calls like this one is exactly what we build."
- Turn curiosity into the reason to meet: "If this call is working for you, the demo
  shows how it would sound for your customers."
- Disclosure is honest and, in our case, is also the pitch. Vendors report that open
  disclosure helps rapport more than it hurts, and India's TRAI is looking at AI
  voice-call rules (not final yet), so disclosing up front is also the safe choice.

This is the strongest idea in this research. Whether and how to use it is an open
decision (see OPEN_QUESTIONS.md).

---

## 2. Shape of the whole call (target: under two minutes)

A consistent pattern across sources:

1. **Opener** — who, why, a short time ask (seconds 0–10).
2. **One relevance line** — one sentence about what VoiceOwl does for companies like
   theirs. Not a pitch. Sell the meeting, not the product.
3. **One easy question** — optional; e.g. "Are you handling customer calls in-house
   today?" Keeps it a conversation. Skip if the lead already asked for a demo.
4. **Calendar-first ask** — offer two specific slots (section 3).
5. **Confirm once** — read back day, date, time, then book.
6. **Tell them what comes next** — "You'll get the details on WhatsApp and email."
7. **Close** — short, warm, done.

Voice-script guidance from voice-AI vendors:

- Keep each spoken sentence under about 15 words. Long sentences sound robotic and
  people lose track.
- One question per turn. Wait for the answer.
- Plan for the usual failure points: voicemail, the prospect going off-script, and
  results not reaching the CRM.

---

## 3. Booking the slot

### Offer two slots, not an open question

- "When are you free?" makes the prospect do work and often ends with "I'll get back
  to you".
- Offer **two concrete slots from real calendar availability**: "I have Tuesday at
  eleven or Wednesday at four. Which suits you better?" (the alternative-choice
  close).
- Why two: a third option reopens the whole decision. The evidence that fewer
  choices book more is thin (mostly vendor anecdotes and the jam study), but every
  practitioner source recommends two.
- If neither works, ask which day suits them, check the calendar for that day,
  and offer two slots from it.

### Make the meeting a small ask

From 30 Minutes to President's Club (Armand Farrokh): **sell the test drive, not the
car**. Pitch the meeting as short and low-pressure: "A fifteen-minute look, just so
you know what's out there." A short demo is far easier to say yes to than a "product
presentation".

### Speed to lead (if the leads are inbound form fills)

- The widely cited MIT/InsideSales study: contact within 5 minutes is **21x** more
  likely to qualify the lead than contact at 30 minutes. InsideSales 2021: conversion
  is 8x higher in the first five minutes. Few companies respond that fast; an AI
  agent can.
- If the lead filled a form, call immediately and use it as the reason for the call:
  "You asked about a demo a few minutes ago."
- This is a platform/trigger decision, not a prompt line, but it changes the opener.

### Confirmation and no-shows

- Read the booked slot back **once**, clearly: day, date, time, timezone if relevant.
- Send the WhatsApp confirmation **immediately** after booking (Rasayel and others:
  instant confirmation reassures and drives engagement).
- Reminder pattern from scheduling vendors: confirmation at booking, a reminder
  24 hours before, a nudge 1–2 hours before, with an easy reschedule reply. Vendors
  claim 40–70% fewer no-shows; Calendly-sourced story: +28% attendance. Vendor
  numbers.
- A small spoken commitment helps attendance: "When the invite arrives, could you
  accept it so it's in your calendar?"

### Collecting the email address

Spelling an email by voice is error-prone (speech recognition mangles letters,
dots and domains). Options to discuss:

- Ask for the email on the call and read it back letter by letter (slow, error-prone).
- Send the WhatsApp confirmation to the number we called and ask them to reply with
  their email there (no spelling on the call).
- Use the email we already have from the lead data and only confirm it.

---

## 4. Objections (keep it short — at most one try)

The user brief is "no more conversation". So the agent gets **one** short, polite
answer per objection, then either books or closes. The 30MPC "Mr. Miyagi" framework
fits in one or two lines:

1. **Agree** with the objection (lowers their guard).
2. **Ask one question** or reframe.
3. **Sell the meeting**, not the product: short, low pressure, "just so you know
   what's out there".

| Objection | Short answer pattern |
|---|---|
| "Send me an email / some information." | Agree; "I'll send it. A fifteen-minute look would tell you faster whether it's even relevant. Tuesday at eleven or Wednesday at four?" ("Send me info" is usually a polite exit; nobody reads it.) |
| "Not interested." | It's a swat, not a real objection. Agree lightly, ask once what the reason is (not a priority, already have something?). If still no, close politely. |
| "We already have a solution." | "Makes sense. Some teams like to see what's out there to keep the current vendor honest. Fifteen minutes?" Social proof, no competitor talk. |
| "Busy right now." | Don't pitch. Offer to book in fifteen seconds, or ask when to call back. |
| "Call me in six months." | Agree the timing may be off; offer a short look now so they know what's out there when the time comes. If no, accept and close. |
| "How did you get my number?" | Honest, one line, from the lead source (form fill, event, referral). Needs a fixed answer from us. |
| "Is this a robot / AI?" | Yes, VoiceOwl's AI agent — and that is what we build. (See the creative angle in section 1.) |

Never argue, never repeat the pitch, and never push past the second "no".

---

## 5. Edge cases the prompt must cover

- **Voicemail / answering machine** — a short message or hang up (platform may
  detect it); no booking attempt.
- **Wrong person / gatekeeper** — ask for the right person or the best time; do not
  pitch to the gatekeeper.
- **"Hello?" / silence** — repeat the last line briefly.
- **No slots available / calendar tool fails** — say the team will send slots on
  WhatsApp; close.
- **Prospect wants a slot outside working hours or on a holiday** — offer the nearest
  available.
- **Prospect wants to reschedule mid-call** — rebook once.
- **Prospect asks product or pricing questions** — one short answer at most, then
  "the demo covers exactly that". The agent is not the salesperson.
- **Language** — Indian prospects may switch to Hindi or another language.

---

## 6. Summary of recommendations

1. Lead with context and the reason for the call, then the name.
2. Never ask "is this a bad time?" or "how have you been?".
3. Disclose that it's VoiceOwl's AI early and use that as the hook: the call is the
   demo.
4. Sell a short, low-pressure demo, not the product.
5. Offer two real slots from Google Calendar; read the booking back once.
6. One short answer per objection; close politely after the second no.
7. Send WhatsApp and email confirmation immediately; consider reminders.
8. Keep the whole call under two minutes and each sentence under 15 words.

---

## Sources

- Gong — best and worst cold call openers (300M calls): https://www.gong.io/resources/labs/the-best-and-worst-cold-call-openers-backed-by-data-from-300m-calls/
- Gong — cold call opening lines (reason for call 2.1x, "how have you been"): https://www.gong.io/resources/labs/cold-call-opening-lines/
- 30 Minutes to President's Club x Orum — 5 cold call objection talk tracks (Mr. Miyagi framework): https://blog.contactout.io/wp-content/uploads/2023/10/30MPC-Orum-Cold-Call-Guide.pdf
- Nooks — 12 openers that get you past "what's this about": https://www.nooks.ai/blog-posts/cold-calling-scripts-12-openers-that-get-you-past-whats-this-about
- Prospeo — permission-based opener: https://prospeo.io/s/permission-based-opener
- Prospeo — cold call scripts from Reddit: https://prospeo.io/s/cold-call-script-reddit
- Prospeo — pattern interrupt openers: https://prospeo.io/s/pattern-interrupt-cold-call
- Prospeo — "send me an email" objection: https://prospeo.io/s/send-me-an-email-objection
- Tomba — cold call script Reddit threads: https://tomba.io/blog/cold-call-script-reddit
- JustCall — best practices for AI voice agent scripts: https://justcall.io/blog/best-practices-ai-voice-agent-scripts.html
- Parloa — AI appointment setting best practices: https://www.parloa.com/knowledge-hub/ai-appointment-setting-best-practices/
- Rework — alternative choice close: https://resources.rework.com/libraries/deal-closing/alternative-choice-close
- Sequence Health — choice architecture and booking rates: https://www.sequencehealth.com/appointment-scheduling/choice-architecture-booking-rates/
- InsideSales — response time matters: https://www.insidesales.com/response-time-matters/
- Workato — lead response time study: https://workato.com/the-connector/lead-response-time-study
- Rasayel — reduce no-shows in WhatsApp-scheduled demos: https://learn.rasayel.io/en/blog/tips-to-reduce-no-shows-whatsapp/
- Regal — AI agent ethics and disclosure timing: https://regal.ai/blog/ai-agent-ethics-disclosure-timing
- Bar & Bench — TRAI's crackdown on spam calls and AI-driven telemarketing: https://www.barandbench.com/view-point/trais-crackdown-on-spam-calls-and-ai-driven-telemarketing
- TRAI press release No. 11 of 2025 (140 / 1600 series): https://cms.trai.gov.in/sites/default/files/2025-02/PR_No.11of2025.pdf
