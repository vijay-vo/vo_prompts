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

## 8. Round 3 (2026-11-18): 31 YouTube transcripts read in full

Source: the three videos the sales team recommended, plus 28 more from the same
channels and related ones (list at the end of this section). Transcripts are
auto-captions, read in full. Quotes below are short and taken from them. Creators
disagree with each other in places; where they do, both sides are shown.

Videos the sales team recommended:
- Brandon Mulrenin, "I found the best cold calling script of all time"
- Dan Lok, "Best Cold Call Secrets - Joker Calls Batman"
- Connor Murray, "Common Cold Call Objections and How To Overcome Them"

### 8.1 Opening the call

| Idea | Who | Exact line / rule | Fit for us |
|---|---|---|---|
| **Don't open with "Is this John?" or "How are you?"** | Dan Lok, Connor Murray, Sales Feed, Miner | "The minute you say that, right there they know it's a cold call." Confirming the name causes "fight or flight." | Yes. State the name as a greeting ("Hi {{firstName}}, it's Bard from VoiceOwl"), never ask "is this...?" |
| **Context first, then the permission ask** | 30MPC, Jason Bay, Gong | "I just finished reading your press release... I know I'm calling totally out of the blue. Do you mind if I take one minute?" Bay (contact-centre case): "Was on the FAQ page and I noticed that you're pushing customers a lot to self-serve... You got a minute for me to share why I called you specifically?" | Yes. Best fit. Our lead source gives the context. |
| **Warm / form-fill leads: don't say "this is a sales call"** | Jeremy Miner | "You asked us to call you back, looks like you responded to the ad about [END RESULT, not the product]." Then: "What was it that made you want to look into this further?" Avoid: "is this a good time", "do you have two minutes", "how are you doing today". | Yes. Separate branch for website and event leads. |
| **Honest permission, double-permission fallback** | Brandon Mulrenin | "I'll be up front. I'm a realtor. Do you want to hang up, or can I ask you one quick question?" If vague: "Give me 30 seconds. Let me tell you why I called, and then you can decide if we need to have this conversation. Fair enough?" | Yes, but the time limit is only the fallback, not the first breath. |
| **Never a countdown in the first breath** | Miner, Josh Braun | Miner names "full disclosure, this is a cold call, give me 2 minutes, then you can judge" as an opener that still mostly fails. Braun calls "Can I have 27 seconds to tell you why I called" the pushy, attached tone. | Drop "twenty seconds" from the first line. Counter-view: Bay and Sales Feed endorse blunt permission openers. |
| **Low-pressure help-me-out** | Josh Braun | "We've never spoken and I know you weren't expecting my call, but I was hoping you could help me out for a moment." Claims a 70-90% yes. | Yes. Simple words, works across cultures. |
| **A concrete outcome inside 30 seconds** | Hormozi, Pavlo, Connor Cahill | Hormozi: trust is built in the "first 7 seconds"; "blow their minds in under 30 seconds." Pavlo: "an AI employee that can book you four to five estimates... Is that something you would even want?" | Yes, with claims VoiceOwl can really make. Our draft reached value too late (stage 4). |
| **Name the problem, not the product** | Bay, 30MPC, Mailshake | Bay: "speaking with a lot of contact center leaders... they want to reduce the cost to serve, but... How does that resonate with you?" Cites 16% vs 5.5% (problem language vs buzzwords). | Yes. |

### 8.2 The first question after the opener

- **Ask a current-state question with named options (ABC), not a yes/no.**
  Braun: "after hours when calls come in, how are you getting back in touch with
  those people? ... returning voicemail... automated texts?" Brandon: "Most people
  I talk to tell me A or B. Is that the same for you, or something else?"
  This avoids "Is that about right?" and "Has that happened?" (yes/no, leading).
- **Elicitation:** make a guess they can correct. Braun: "Oh, you've probably looked
  into AI dispatchers" gets "they didn't work out for us."
- **Negative presumptive questions** (Brandon: "I get the feeling you're going to tell
  me you're never moving, am I right?") work in English for him, but even he called
  one "a tongue twister." For non-native listeners and other languages, the meaning
  depends on understanding that "no" means yes. Avoid in a worldwide agent. Use the
  simple forms: ABC, and "would there be any downside to...?"
- **"Would you be opposed...?"** (Miner, Braun) has the same problem across languages.
  Use "Would it make sense to...?" (Braun's own transition line).

### 8.3 Asking for the meeting: the creators disagree

| Approach | Who | Lines |
|---|---|---|
| **Two concrete times straight away** | Connor Murray, Connor Cahill (AI agency, live), Kai Stone (live) | "I got an opening at 4:00 and 5:30 p.m. today. Do either of those work?" and "I have 3:00 and 5:00." Both worked on camera. |
| **Day first, then time** | Pavlo (AI agency, live) | "Do you have some time tomorrow, or Monday or Tuesday?" Then "what time Monday is best?" "We'll talk in your time zone." |
| **One decision at a time: interest first, time second** | 30MPC, Brandon, Braun | 30MPC: "are you free at 10 or 2?" asks several decisions at once; first "are you open to learning more?" In their one booked live call, times came only after the yes. Braun: "Would it make sense for you to invest 20 or 30 minutes... so you could see how it works?" |
| **Future-pace, then one slot** | Brandon | "Let's pretend we met and you got what you wanted... would there be any downside to getting together for 20 minutes? I'm not asking you to make a decision." Then "I could do Wednesday evening, would that work?" |
| **Pencil it in** | Brandon | "Let's not commit to anything. Why don't we tentatively put this time down? We could totally reset it." If they pencil it in, it is real. |
| **Calendar hold they can decline** | 30MPC (Armand) | "I'll send the email, let's put five minutes on the calendar, you can totally decline the event." |

Common to all: get a yes to the meeting before the time talk, say how long it is
(15 to 30 minutes), give a reason or takeaway, confirm time zone and where to send
the link. "Don't dillydally" once they say yes (Connor Murray). "Don't burn the
popcorn": stop talking once interest peaks (Braun).

### 8.4 Objections

Two rules that all creators share: **agree first, never argue**, and **sell the
meeting, not the product.** Connor Murray: answer instantly with no pause ("that's
actually why I was reaching out...") because hesitation kills the booking.
Brandon's ARP: Agree ("that makes sense"), Respond with empathy and permission
("before you hang up, can I ask one thing?"), Pivot to a "would there be any downside"
question. Dan Lok: never ask "why are you not interested?"

| Objection | Lines found |
|---|---|
| **Not interested** | Braun: "That's okay. I know you didn't ask me to call you. Before I hang up, if I'm not overstepping, is it because my timing is off, or is this completely irrelevant?" 30MPC: "I should have figured you'd have something in place... is it X, Y, or just that you hate cold calls?" Connor Murray: make them give a specific objection ("is that because you already work with someone, or the team has no bandwidth?"). Dan Lok: "Before I get off the phone, what might have to happen before you begin looking for a different ___?" |
| **Send me an email** | Braun: "What's your email address? ... just so I don't do you a disservice by sending irrelevant information, would it be okay if I asked a couple of questions first?" 30MPC: "Can I ask one question to make sure what I send isn't totally irrelevant?" Then "fifteen minutes would show you faster than any PDF." Fallback: the declinable calendar hold. |
| **We already have someone / solution** | Connor Murray: "we work with customers of X all the time... briefly introduce you to my team." 30MPC: agree, then one "trap question", then "open to a look just so you know what's out there?" Sales Feed: "Have you tried to solve this before? What did you try? Did it work?" Brandon: "would a second opinion be a horrible idea?" |
| **Busy / bad time** | Connor Murray: "I assumed this was a busy time for you... so when you do have that bandwidth we'll be ready... maybe Wednesday or Thursday?" Pavlo: "book sometime next week, if you're busy just shoot me a text and we can reschedule." Real life conflicts (travelling, lunch with family): exit gracefully, agree a callback, leave a calendar hold. 30MPC: "the way you exit determines the way you get to walk back in." |
| **Call me later / in six months** | Braun: mirror ("later this week?"), then "would it make sense to put some time on the calendar so we're not playing phone tag?" Miner: don't say "sure, when works best?" (puts you in chase mode). Dan Lok: don't offer "should I call you next week?" |
| **How did you get my number?** | Braun: answer plainly, no apology, name the source. If they're upset: "Seems like it was inappropriate for me to call on this number." 30MPC: honest answer, then go back to the opener. The made-up referral stories (Kai, Cahill) are lies and are not usable. |
| **What does it cost?** | Connor Cahill: "It's a little bit variable depending on how many calls... I could break it all down on a Google Meet." Pavlo: "I would love to just show you, it makes way more sense than me trying to explain." Cahill's rule: "Don't get into price. Get him to book that call." |
| **Not my area / not the decision-maker** | 30MPC: "just so I make sure I don't call the wrong person again... who would be the right person?" Brazier: "People in your role usually have an input. Are you responsible for that?" Braun: "Anybody else you'd like to invite?" |
| **Wrong person** | Braun: "Sounds like I must have come through to the wrong person. Would it make sense to tell me who might be best to talk to?" |
| **"Is this a robot?" / distrust of AI** | Pavlo's prospect said he didn't "trust the machines." Pavlo agreed on what the AI cannot do, then pitched the rest. |

How many tries? Connor Murray: "get two nos", then sell the time a second time.
Pavlo persisted through four or five deflections and still booked. Everyone stops
at once for a real conflict, hostility or "do not call."

### 8.5 Getting people to actually show up (Jason Bay)

Bay cites about 56% average show rate and 70-80% for the best reps. His five moves:
1. **Get the invite accepted on the call:** "Would you mind hitting accept on that
   real quick? I'll give you a couple of seconds."
2. **Restate the purpose as their problem, not "a demo."** The meeting needs an offer
   worth their time: "a demo of your product is just not enough."
3. **Talk up the person running the meeting** ("seven, eight years of experience
   working with... brands like yours"). People are less likely to bail on a human
   they've heard about.
4. **Tell them exactly what confirmation they'll get and when.**
5. **Do a little discovery before the ask.** The longer the conversation, the more
   likely they book and show up.

Show-rate data (vendor blogs, directional only): average B2B demo no-show 20-30%;
same-day bookings about 7% no-show vs about 25% for 7+ days out; reminders at 24 h,
1 h and 15 min claimed to give a 68-78% show rate. Retell suggests 72 h, 24 h and
2 h reminders for appointments. Takeaway: **offer the earliest slots first**, and
keep the 24 h / 1-2 h reminders already agreed.

### 8.6 Voice delivery and worldwide use

- Miner: sound curious and low-pressure; avoid "Hi, my name is X with Y, the reason
  I called is..." because it raises the guard. (A "confused old man" tone and "it's
  just..." phrasing do not suit an AI voice.)
- Hormozi: "about 85% is the delivery", and 30MPC: tone beats words. For a voice
  agent that is TTS speed, pauses and short sentences.
- Bay: Europe, the Middle East and Africa may expect more formal pleasantries than
  the US "skip the how-are-you." General etiquette guides: formal titles and surnames
  in Germany and parts of East Asia; namaste still common in India; in Japan an
  unsolicited call is a bigger step and relationship comes first; Brazil and Italy
  are more personal. Sources are mostly general etiquette articles, not sales
  research; treat as rough guidance and confirm with the sales team.
- Idioms that translate badly and should not appear: "roll the dice", "tossed
  around", "kick rocks", "triple backflip", "barking up the wrong tree".

### 8.7 What does not transfer to our agent

- **Every pretext or invented story.** Fake referrals ("my friend recommended you",
  "Julie Becker gave me your number"), "sorry, you broke up there", "it said you were
  closed", "I called and no one answered." These are lies, and a lie from an AI that
  is later found out cannot be recovered.
- **Human-timing humour and self-deprecation:** laughing at objections, "I can't speak
  English today", "I'm not as popular as I thought", "it's probably ridiculous for me
  to even call." From an AI they sound odd.
- **"Have you heard our name tossed around?"** It scores 11.24% for human callers but
  works by acting as if the prospect should know you. Use only a real social-proof line
  (a named customer or industry) that sales approves.
- **Familiar-tone tricks** (Miner's "it's it's Jeremy... Jeremy Miner") that make the
  prospect think they already know you: misleading.
- **"Just so no one from my team calls you again"** is only honest if the platform
  really stops calling (the do-not-call flag in post-call analysis does that).
- **Stating a price or "talking about money up front"** (Dan Lok, Kai Stone). The
  agent knows no pricing.
- **Dan Lok's "avoid cold calling"** advice is about strategy, not the call itself. His
  point still holds for us: when the lead came from a form or event, call like you are
  getting back to them.

### 8.8 Round 4 (2026-11-19): voice-AI vendor guides, practitioner write-ups, law, etiquette, show rates

This is the written-source research that was cut off by a usage limit on 2026-11-18,
now run in full. It draws on about 25 new sources. Vendor guidance and show-rate data
are strong. Practitioner write-ups are thin, because Reddit threads were not reachable
directly. Etiquette rests on etiquette guides, not outcome data. [vendor] marks a number
that comes from a company selling the tool. All legal points need review by counsel.

**Voice-AI vendor guidance**
- Vapi prompting guide: "Keep responses to one or two sentences maximum", "Ask only
  one question at a time", never offer more than three options. On interruption:
  "Stop talking, listen, respond." On silence: wait 10-15 s, ask "still there?" once,
  then end. Times are spoken as words ("two fifteen in the afternoon"). Its booking
  example offers two slots. It reads back only what must be exact (time, name
  spelling, email), never the qualification answers.
  https://docs.vapi.ai/prompting-guide
- Vapi voicemail: list the cues ("leave a message", "at the tone", "beep",
  "unavailable", IVR "press 1") and keep the message under 30 s with who, why and the
  next step. The first message waits for the person to speak.
  https://docs.vapi.ai/tools/voicemail-tool ,
  https://docs.vapi.ai/outbound-campaigns/voicemail-and-call-screening
- Retell voicemail: hang up rather than leave a message on a first attempt when a retry
  is planned. Keep any voicemail under 20 s and follow it with a text. Machine
  detection during a long opener hurts calls a person answers.
  https://retellai.com/blog/5-best-voicemail-practices-when-using-ai-voice-agents ,
  https://community.retellai.com/t/outbound-voicemail-detection-cant-fix-it-without-breaking-live-answers-conversation-flow-agent/3365
- Retell prompt guide: one question per step, wait for the answer, read the booking
  back ending "Is that correct?". If the caller changes the slot, check availability
  again before booking. https://docs.retellai.com/build/prompt-engineering-guide
- ElevenLabs prompt guide: hard rules go under a "Guardrails" heading. Before a tool
  with consequences, confirm and wait for the yes. Tool parameters state the written
  format (an email as a real address, not "at" and "dot").
  https://elevenlabs.io/docs/eleven-agents/best-practices/prompting-guide
- PolyAI on barge-in: it happens in 15-20% of calls [vendor]. "A false barge-in is more
  damaging than a missed one." After an interruption, answer it and carry on; do not
  restart the line. https://poly.ai/blog/barge-in-voice-ai-interruption-handling
- Email capture by voice (Famulor, AssemblyAI): recognition is better when the email
  question is the turn just before. The fallback order is spell and read back, then
  send a link by text. Phonetic alphabets can sound garbled. No independent data.
  https://www.famulor.io/blog/email-capture-via-ai-voice-agent-the-complete-guide-to-accurate-data-and-optimized-processes ,
  https://assemblyai.com/blog/conversation-context-voice-agents
- Retell on refusals: when asked "am I talking to a robot?", answer honestly, restate
  the reason and ask to continue. When they want a person, offer a human callback. A
  refusal should stop further AI calls. "A rep who catches a dodge has every reason
  to hang up." https://www.retellai.com/blog/ai-caller-refusal-human-handoff
- Gong: in successful human cold calls the longest rep monologue ran 37-53 s, against
  25 s in failed calls (Gong's own figures vary by year). Once the prospect engages,
  the value explanation can run three or four short sentences.
  https://www.gong.io/blog/cold-call-stats

**Practitioner write-ups**
- Time Doctor field test (a sales director's talk) is the most candid source found.
  AI agents called warm inbound leads and disclosed they were AI up front. About 70%
  of calls produced no meeting and no real conversation. **42% hung up once they
  understood it was an AI**, and most of the rest asked for a human. A second agent,
  which only confirmed demos already booked, was the easier use case.
  https://community.mindstone.com/annotate/article_B17CGIZUhqyBfMln73
- A Reddit thread, summarised secondhand: 12-15 real conversations per 100 AI calls
  against 3-4 manual. Short scripts beat full discovery, and off-script moments felt
  "clunky". https://superintelligentsales.beehiiv.com/p/the-promise-and-pitfalls-of-ai-cold-calling
- "500 real cold calls" (human roofing setters). The top setter converted 23.7% with
  78% script adherence, while the worst converted 11.2% with 93%. The top setter paused
  about 1.8 s before replying and waited 3.1 s after asking for the booking; the worst
  waited 0.7 s and 1.1 s. There were 43 distinct objections against 15 in the playbook,
  and "not interested" was recovered only about 15% of the time.
  https://dev.to/gamlin/how-we-built-an-ai-voice-agent-from-500-real-cold-calls-23jg
- For calibration only [vendor]: 4,312 dials gave 129 meetings in 5 days, about 19% of
  conversations (https://opmai.beehiiv.com/p/4-312-dials-in-5-days-here-s-what-happened-f579).
  The human baseline from Belkins is a 9.9% connect rate and 4.6% conversation to
  meeting (https://belkins.io/blog/cold-calling-benchmarks). Close says cold outbound
  is hard for AI and needs an escape hatch to a human
  (https://www.close.com/blog/do-ai-voice-agents-work).

**How people react to AI callers**
- Surveys [vendor]: 22% hang up immediately when an AI identifies itself (Answering
  Service Care, 2,000 US adults), 29% (AnswerConnect/OnePoll, 6,000 adults), and about
  11% with 30% asking for a human (Metrigy). The real warm-lead test above saw 42%.
  Plan for 20-40% early drop after a disclosure.

**Law by region (needs counsel; summaries of legal press)**
- **US:** the FCC's February 2024 ruling puts AI voices under the TCPA's
  artificial-voice rules, so mobile numbers need consent (prior express written
  consent for telemarketing). The FCC's August 2024 proposal for upfront AI disclosure
  is not known to be final. Among states, Utah requires disclosure only if asked,
  Maine requires it up front where a bot could mislead, and New Jersey up front when
  selling goods or real estate.
  https://www.mayerbrown.com/en/insights/publications/2024/02/fcc-declares-authority-and-intent-to-regulate-ai-generated-calls-under-the-tcpa ,
  https://www.globalpolicywatch.com/2024/08/fcc-proposes-new-consent-and-disclosure-rules-for-ai-generated-calls-and-texts/ ,
  https://www.ibtimes.com/ai-sales-agents-wont-tell-you-theyre-bots-most-states-they-dont-have-3807692
- **EU:** Article 50(1) of the AI Act has applied since 2 August 2026. People must be
  told they are talking to an AI unless it is obvious, and a human-sounding voice is
  unlikely to count as obvious. "Only if asked" probably does not comply for EU leads.
  https://www.traverssmith.com/knowledge/knowledge-container/is-it-a-bot-eu-ai-act-transparency-rules-take-effect-2-august-2026/ ,
  https://datamatters.sidley.com/2026/06/24/eu-ai-act-transparency-obligations-preparing-for-compliance-by-2-august-2026/
- **Germany:** under §7(2) no. 2 UWG, automated advertising calls need prior explicit
  consent even in B2B. Commentary sees no exemption for AI.
  https://www.knowlee.ai/de/blog/ki-kaltakquise-deutschland ,
  https://www.it-recht-kanzlei.de/lg-kleve-telefonwerbung-mutmassliche-einwilligung.html
- **France:** from 11 August 2026, B2C cold calls need consent, while B2B stays opt-out.
  The consumer calling window is weekdays 10-13 and 14-20.
  https://cnil.fr/fr/prospection-commerciale-par-telephone-hors-automate-dappel-quelles-sont-les-regles
- **UK:** live B2B calls are allowed unless the number is on TPS or CTPS. Automated
  marketing calls need consent, and whether conversational AI counts as automated is
  unsettled.
  https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/
- **UAE:** Cabinet Decision 56/2024 allows calls only 9:00-18:00 local time. It requires
  the company name and purpose at the start, TDRA approval, recording and the DNC
  register, with fines up to AED 150k.
  https://www.morganlewis.com/fr/blogs/sourcingatmorganlewis/2024/07/telemarketing-in-an-evolving-legal-landscape-uae-adopts-regulations-on-telemarketing-activities
- **Saudi Arabia:** promotional calls need prior opt-in and must stop at once on
  withdrawal. Calling hours were not found.
  https://tamimi.com/law-update-articles/congratulations-youre-a-winner-new-anti-spam-regulations-in-saudi-arabia
- **India:** the February 2025 TCCCPR amendment requires robo-call disclosure and the
  140 series. An AI-specific rule is still under consideration. TRAI PR 119/2026
  ("A2P calls") is an image-only PDF and was not read; check it. (Sources in the list
  below.)

**Etiquette by country (etiquette guides, no outcome data)**
- **Germany:** Herr or Frau plus surname, Dr. where it applies, the formal "Sie", and
  the company plus name first.
  https://www.brainguide.de/Formality-is-good-form ,
  https://trykaiwa.com/blog/german-phone-call-basics-realistic
- **France:** "Bonjour Madame/Monsieur" and the formal "vous". Skipping the greeting
  reads as rude. Avoid 12:00-14:00.
  https://www.expatica.com/fr/working/employment-basics/french-business-culture-102491
- **UK:** first names are fine. 8:30-10:00 and 16:00-17:30 are strong windows (one
  vendor source).
  https://www.mapsleads.co/blog/cold-calling-best-time-of-day
- **UAE and Saudi Arabia:** a title (Doctor, Engineer) plus first name, and early in the
  day. https://www.talaera.com/blog/working-with-saudi-arabian-clients
- **Japan:** "osewa ni natte orimasu", then company and name, and surname plus -san or
  -sama. Never "moshi moshi". https://cotoacademy.com/make-phone-call-japanese/
- **Korea:** surname plus title plus "-nim", and no first names unless invited.
  https://cibtvisas.com/blog/business-etiquette-south-korea
- **Singapore:** title plus surname until invited.
  https://cibtvisas.com/blog/business-etiquette-singapore
- **India:** Sir or Ma'am by default, and first names are common in tech.
- ZoomInfo (1.4M calls): Wednesday beats Tuesday in Europe, the Middle East and Asia,
  and Friday is worst everywhere.
  https://salestechstar.com/guest-authors/cracking-the-cold-call-code-best-times-according-to-1-4-million-calls/

**Show rates**
- Growth Cab (1,380 B2B meetings booked by cold calls, mostly Italy and the EU,
  observational):

  | Booked this far ahead | Meetings held |
  |---|---|
  | 0-2 days | 85.4% |
  | 3-7 days | 77.6% |
  | 8-14 days | 70.1% |
  | 15-30 days | 60.3% |
  | 30+ days | 58.5% |

  Wednesday meetings were held most often (76.2%); Thursday and Friday had the most
  no-shows (18.5% and 22.2%). C-level prospects no-show more.
  https://www.growthcab.com/b2b-meeting-show-rate-study
- Reply.io (about 2,900 inbound demos; figures via secondary citations) found the
  same direction: no-shows of 6.9% same day, 9.6% next day and 23% for 8+ days out.
  https://reply.io/fight-demo-no-shows/
- Reminder-wording RCT (healthcare, 161,587 appointments): a generic SMS had a 21.1%
  no-show rate. Better wordings were "others are waiting for this slot" at 14.2% and
  stated cost at 15.3%. A personal request did no better than generic.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7310733/
- No B2B data was found on asking the prospect to accept the invite during the call.
  There is only weak support from a secondhand GP study (patients who wrote their own
  appointment card missed 18% fewer).

**Not found:** Bland, Synthflow, Air.ai, Sierra and 11x had nothing usable. There is no
AI-call data by region and no Saudi calling hours.

### 8.9 Videos read

Recommended by the sales team:
- Brandon Mulrenin, I found the best cold calling script of all time: https://www.youtube.com/watch?v=BrBL0YoPSBo
- Dan Lok, Best Cold Call Secrets - Joker Calls Batman: https://www.youtube.com/watch?v=sJAN2HcE_Sw
- Connor Murray, Common Cold Call Objections and How To Overcome Them: https://www.youtube.com/watch?v=jcn9Endg410

Same channels and related:
- Brandon Mulrenin: LXHLhZnzzUs (best opener no one talks about), Sq30kQss7TE (worst opening script), aYF-fTMBzAI (best way to start a cold call), a5aDMvBKVDQ (stop dancing around the appointment), UpJTKm4bfxw (the only objection system)
- Connor Murray: 0hYAqlpzPwE (ultimate guide 2026), OYbrxkYeWoA (first 10 seconds), guU2kWvqwwo (confident tone), iafo36ZWwWA (live role play), 6ketTEn2AxU (value statement)
- 30 Minutes to President's Club: 2vivv2HeiBU (masterclass with live calls), MRJS6nEKjcI (best way to open), vkj_1-NB8YQ (permission opener with a twist), 4Gwt4w4Ran4 (objection handling), cw_RyIGCjRE (reverse pitch)
- Jeremy Miner: pjf5uhOMcTc (mastering cold calling), il2p-OD4Res (2026 techniques), W-WHmvBtjlc (calling leads the right way)
- Josh Braun: EKr0bYFsNrU (first 30 seconds), 0GJlotgjj04 (live "I'm not interested"), fwyxBrj4m-8 (exact script + 7 objections, Chris Bussing)
- Jason Bay (Outbound Squad): Z6EYVb6S2m0 (5 openers), yLK4x_vQRDg (connect rates and meetings that show up)
- Dan Lok: J3Yl1p8FAaM, d0mwebxFxBc, 4JPD-HoMOFw; Alex Hormozi via Glencoco: jvFLW5EClgk; Sales Feed: 4OweikRF7bg
- AI-agency live cold calls (they sell AI like we do): Pavlo CfMJ01KP_ns, Connor Cahill yOMqTCblP4A, Kai Stone tU52nLIUz8Y
All at https://www.youtube.com/watch?v=<id>

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
