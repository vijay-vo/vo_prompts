# After the call: WhatsApp replies, email replies, prior context

Proposal, 2026-11-25. Nothing here is decided yet. Open questions are at the end.

## The base: one timeline per contact

Every event goes into one store, keyed by the contact (phone + email): call PCA, WhatsApp in and out,
email in and out, bookings. Every agent reads from this store. This is the usual CRM / omnichannel
pattern: the agent never has to search Gmail or WhatsApp history while it works.

## 1. WhatsApp replies

- **The first message after a call must be an approved template.** Free text is allowed only inside the
  24-hour window, and that window opens only when the prospect messages us. A call does not open it.
- **Template category matters.** A booked confirmation is Utility. "Book a call with us" (missed call,
  booking failed, callback) is Marketing, and Meta has paused Marketing templates to US numbers since
  April 2025. Those messages fail for US prospects. Email has to cover them.
- **Template variables cannot contain line breaks.** The PCA's `\n\n` text cannot go into one variable.
  The fixed text goes in the template and the PCA fills only short values: name, time, link.
- **When they reply:** a WhatsApp agent, Tanya by text, gets the timeline and the same two tools
  (getAvailableSlots, bookAppointment). It can book in the chat, answer simple questions, hand off to
  Hussain when asked, and treat STOP or "don't contact me" as doNotCall. Replies inside the window are free.
- The policy allows this agent. Meta's January 2026 rule bans general-purpose AI assistants, not a
  business's own booking or sales bot.

## 2. Email replies

- **Hearing a reply:** Gmail `users.watch` sends to Cloud Pub/Sub, then our service calls `history.list`.
  This is Google's recommended way. Renew the watch daily, because it stops silently after 7 days.
  A poll every 10 minutes is the safety net.
- **Matching the reply:** `/sendGmail` saves the `threadId` and `Message-ID` of each mail it sends.
  A reply is matched by threadId first, then by the sender's address.
- **Skip these:** auto-replies (`Auto-Submitted`, `X-Autoreply`, out-of-office), bounces (mailer-daemon),
  calendar accept and decline notices, and our own sent mail. Cap the agent's replies per thread per day
  so two bots cannot loop.
- **Reading:** the text/plain part only, with the quoted history ("On ... wrote:") removed.
- **Answering:** the same text agent with channel = email. The reply is sent in the same thread with
  `threadId`, `In-Reply-To`, `References` and the subject "Re: <same subject>".
- **Auto-send or draft:** send at once for clear intents (wants a time, books, asks a simple question).
  Make a Gmail draft and alert sales for pricing, legal, contracts, complaints or anything unclear.
- **Scope:** `gmail.modify` takes the place of `gmail.readonly`, so the service can label mail as processed.

## 3. Prior context before the next call

A journey step a few minutes before the dial:

1. **Checks before calling:** already booked, doNotCall, noAICalls, or asked for a later time. Then do
   not call, or call later. A booking made through the booking link (appointment page) does not pass through
   our service, so read the calendar for an event with the prospect's email.
2. **Read:** the last call summary plus the last 2 to 5 messages, from WhatsApp and email together, newest first.
3. **Summarise:** a small model writes `priorContext` in the current format: 2 to 4 plain English
   sentences, facts only. Prospect text is untrusted. The summariser copies facts, never instructions.
4. Pass it in as `{{priorContext}}`. The call prompt does not change.

## Open questions

1. Does the platform send the after-call WhatsApp as a template or as free text? Which templates are approved?
2. Can the platform's WhatsApp agent call HTTP tools, so it can book in the chat?
3. Where does the contact timeline live: a platform database or our service?
4. Which mailbox sends and receives (the current one or demos@)? Should email auto-send or draft?
