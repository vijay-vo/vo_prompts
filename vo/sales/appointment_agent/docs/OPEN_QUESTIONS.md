# Appointment Agent — Decisions Needed Before Writing the Prompt

`default/default.txt` stays empty until these are answered and we have a go-ahead.
Background for each point is in RESEARCH.md.

## Who and why

1. **Lead source** — who are we calling: inbound form fills (website "book a
   demo"), event or LinkedIn leads, or a cold list? This decides the opener and
   the reason for the call.
2. **Who we call** — role (CX head, call-centre manager, founder) and industry.
   This gives the one relevance line.
3. **Agent name and voice** — the persona's name, gender and accent.
4. **AI disclosure** — say "VoiceOwl's AI assistant" in the opener and use "this
   call is the demo" as the hook? Or say it only when asked?
5. **Language** — English only, or switch to Hindi or other languages when the
   prospect does?

## What we offer

6. **The one-line value statement** — what VoiceOwl does, in under 15 words.
7. **Demo length and format** — 15 or 30 minutes? Google Meet link from the
   calendar event? Who runs the demo (one host, or a round-robin of sales reps)?
8. **Which calendar** — one shared demo calendar, or several reps' calendars?

## Booking mechanics (Google Calendar)

9. **Tools** — names and inputs of the availability check and the booking tool on
   the platform. Does booking send the Google invite to the prospect's email?
10. **Booking window** — how far ahead (same day, next 7 days)? Working hours and
    days, buffer between demos, holidays.
11. **Timezone** — IST only, or do we call prospects abroad?
12. **Slots offered** — two at a time (recommended). If both are refused: ask for
    the day they prefer, or offer the next two?

## Confirmation

13. **WhatsApp and email** — sent by the platform after the booking tool, or by a
    separate tool the agent calls? What does the message contain?
14. **Email address** — do we already have it from the lead data (confirm only), ask
    on the call, or ask by WhatsApp reply (recommended, avoids spelling on the call)?
15. **Reminders** — 24 hours and 1 hour before on WhatsApp? (Platform work, not the
    prompt.)

## Edges

16. **"How did you get my number?"** — a fixed honest answer per lead source.
17. **Objections** — one short answer then close (recommended, matches "no more
    conversation")?
18. **Product and pricing questions** — the agent defers everything to the demo, or
    answers a few fixed FAQs?
19. **Voicemail** — leave a short message or hang up?
20. **Not interested / do not call** — mark in the post-call analysis so we never
    call again?
21. **Post-call analysis** — fields wanted (booked yes/no, slot, email, objection,
    callback time, interest level)?
22. **Compliance** — calling from a registered 140/1600 series number, DND
    scrubbing and consent are handled by the platform/ops team, not the prompt?
