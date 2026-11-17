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
prospect experiences the product before the meeting.

Decided 2026-11-17: the agent says it is an AI **only when asked**. So the idea is
used at that moment: when the prospect asks "is this a bot?", the honest yes becomes
the pitch ("Yes, and that's exactly what we build. This call is the demo."). See
DESIGN.md section 4. Legal check on AI disclosure abroad is still open (DESIGN.md
section 9).

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
3. Say it's VoiceOwl's AI only when asked, and turn that moment into the hook: the
   call is the demo.
4. Sell a short, low-pressure demo, not the product.
5. Offer two real slots from Google Calendar; read the booking back once.
6. One short answer per objection; close politely after the second no.
7. Send WhatsApp and email confirmation immediately; consider reminders.
8. Keep the whole call under two minutes and each sentence under 15 words.

---

## 7. Round 2 (2026-11-17): what the popular sales creators actually do

Note: Instagram reels and YouTube videos cannot be watched by the research tools.
This section uses the written versions of the most-followed creators' material: the
30 Minutes to President's Club (30MPC) YouTube/podcast scripts, Sarah Brazier's
script (one of the best-known SDRs on LinkedIn/YouTube), Jeremy Miner (NEPQ, one of
the biggest sales accounts on Instagram/YouTube), Jason Bay, and Gong's call data.

### Sarah Brazier's four stages (30MPC)

1. **Open with personality** — a pattern interrupt, not a script voice.
   "Look, I know nobody likes a cold call... can I have a couple of seconds to tell
   you why I'm calling? Then you can tell me if I should go kick rocks."
2. **Confirm their current state** — show you know their world and check it.
   "Typically when I talk to sales leaders, they do X and Y. Does that sound about
   accurate?"
3. **Show the problem they don't see** — one little-known problem with how they do
   it today, then "Has that ever happened to you?" and "Tell me more about that."
   **No pitch yet.**
4. **Book** — only after they agree there's a problem: tie the solution to *their*
   words in one sentence, then a low-friction ask: "Would that warrant a longer
   conversation?"

Her objection rule: objections are emotional reactions to being called, not logic.
Agree and push away lightly, then ask a question that uses what you know about them.
"Not interested" gets humour: "All good, you'd have called me if you were!"

### Delivery matters more than the words (Brazier, 30MPC, Close, Miner)

- "Word choice doesn't really make a difference" if the structure is right.
- **Speak slowly** (calm confidence). **No up-tones** on statements (rising pitch
  sounds eager and unsure). **Laugh off tough objections** (shows you're
  comfortable).
- Miner: a salesy tone triggers the prospect's defence within seconds. Sound
  curious and slightly detached ("not even sure this is a fit"), never needy.
- Monotone is the biggest failure: it tells the prospect they can tune out.
- For a voice agent these become voice/TTS settings plus prompt rules: short
  sentences, calm pace, genuine-sounding questions, light humour.

### Problem language beats product language

- One report: selling the meeting with problem-based language succeeded 16% of the
  time vs 5.5% with buzzwords (single secondary source).
- Jason Bay: name the pain the role has, not features. If the prospect fits, don't
  ask *whether* they want a meeting; move straight to *when*.
- Template from Mailshake: "Most [roles] I talk to tell me they're trying to do one
  of three things... does that sound like you at all?"

### What VoiceOwl's own site gives us as hooks (voiceowl.ai, read 2026-11-17)

- "Close more calls with voice virtual agents with human-like experience."
- Claims: 135+ languages and dialects; 200M+ customer interactions; 60% operational
  cost reduction; 10x more meaningful conversations; 5x revenue growth; proof of
  concept in 48–72 hours, launch within a week.
- Products: Generate (outbound lead generation), Verify (lead verification), Connect
  (past IVR and gatekeepers, hand-off to humans), Qualify (real-time lead
  qualification); contact-centre automation.
- Industries: ABM, BFSI, NBFC, database, demand generation, e-commerce, recruitment,
  logistics. Compliance: HIPAA, PCI, FERPA, GDPR, DPDPA.
- Which claims the agent may say on a call needs sales-team sign-off (DESIGN.md).

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
- 30MPC — Sarah Brazier's cold call script: https://blog.contactout.io/wp-content/uploads/2023/10/Sarah-Brazier-Cold-Call-Script.pdf
- Summary of Cold Calling Sucks (Farrokh, Cegelski): https://www.shortform.com/summary/cold-calling-sucks-and-thats-why-it-works-summary-armand-farrokh-and-nick-cegelski
- Jeremy Miner on calling leads (video summary): https://recapio.com/digest/how-to-call-leads-the-right-way-prospecting-warm-leads-by-jeremy-miner
- Sales Gravy — leading with curiosity on cold calls: https://salesgravy.com/how-leading-with-curiosity-on-cold-calls-builds-trust/
- Mailshake — 5-step B2B cold calling technique: https://mailshake.com/blog/cold-calling/
- Close — cold call tonality: https://www.close.com/blog/cold-call-voice
- VoiceOwl website: https://voiceowl.ai
