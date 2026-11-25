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

## Decided (2026-11-25)

1. Missed calls get the platform's WhatsApp template. booked, bookingFailed and callbackLater messages come from the PCA.
2. The WhatsApp reply agent only holds the conversation for now. It has no tools and does no booking,
   although the platform allows HTTP tools.
3. The contact history lives in the platform database.
4. Email uses the current mailbox, the one that already sends.

## Email, step by step (proposal)

Everything is looked up by the prospect's email address. We never store a thread ID: an incoming
reply already carries its own thread ID, subject and Message-ID, and the answer reuses them.

**A. Before a call: build priorContext from past emails**
1. The journey step calls our service: `POST /emailContext {email}`.
2. The service searches the mailbox the way the Gmail search box does: `{from:<email> to:<email> cc:<email>}`, newest first.
3. It skips calendar notices (Invitation:, Accepted:, Declined:), bounces and auto-replies.
4. It takes the last 5 messages, keeps the plain text only, removes the quoted history, and caps each one at about 1,500 characters.
5. It returns the messages as a short dated list ("12 Nov, we wrote: ...", "13 Nov, they wrote: ...").
   It returns "No earlier emails." when it finds none.
6. A summariser prompt turns this into `priorContext`: 2 to 4 plain sentences, facts only.
   It also keeps the CSV's priorContext when that has a value.
Limit: only this mailbox is searched. Emails in a colleague's mailbox are not found.

**B. They reply to our email: Tanya answers**
1. Gmail tells the service a new mail has arrived (Pub/Sub, with a poll as backup).
2. The service answers only when all of these are true:
   - the sender is a contact in the platform database;
   - the mail is not an auto-reply, a bounce or a calendar notice;
   - nobody from our side has written in the thread since the prospect's last mail, so a human always takes priority;
   - Tanya is under her reply limit for that thread today.
3. It reads the whole thread plus the contact's history and passes both to the email agent.
4. It sends Tanya's answer in the same thread, with "Re: <same subject>" and the In-Reply-To and References headers.
5. It labels the mail "Tanya replied" and writes both messages to the contact history.
Scopes: gmail.readonly, gmail.send and gmail.modify (for the label).

## Open questions

1. The PCA's free-text WhatsApp messages (booked, bookingFailed, callbackLater) need the 24-hour window,
   and a call does not open it. Without a template, are they delivered?
2. The missed-call template is Marketing. Marketing templates to US (+1) numbers fail. Is that accepted?
3. How does our service hand an email to the platform's text agent? Is there an API to run an agent or a session,
   or does the service call the model itself?
4. Who writes priorContext from the email list: a platform LLM step, or our service?
