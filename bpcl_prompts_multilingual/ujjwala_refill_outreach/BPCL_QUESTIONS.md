# Ujjwala Refill Outreach — open questions for BPCL

Created 2026-10-13. Items answered by the user on 2026-10-13 are marked; the rest are open.

## Call list & per-call data
1. ANSWERED (user): consumer name, consumer number, consumer address, distributor name and
   address. No distributor phone, no last refill date.
2. ANSWERED (user): the platform will send a language later; for now the greeting is Hindi and
   Vaani follows the consumer's language from the first reply.
3. Who does the agent ask for if someone other than the beneficiary answers (the beneficiary is
   usually the woman of the household)?

## Purpose & outcome
4. What is the list of reasons to capture (for example cost, using another fuel, cylinder at
   another place, distributor or delivery problem, booking problem, subsidy not received, moved
   house, connection not in use)? Is it a fixed list or free text?
5. Should the agent only collect the reason, or also help: book a refill on the call, explain how to
   book, or register a complaint?
6. Which subsidy and scheme facts may the agent state? For now: none (no amount, no refill cap).
6a. BNPL: news reports say up to 600 rupees, zero interest, 100 rupees a week for six weeks, in some
   states only. Please confirm the terms and the states. Until then Vaani says only the
   questionnaire's wording. Is BNPL live for every distributor on the call list?

## Tools & wiring
7. ANSWERED (user): callhangup only. Post-call analysis plus an HTTP API push the data to BPCL.
8. What post-call analysis fields does BPCL want (reason category, intent to refill, callback
   wanted, wrong number, language)?
9. ANSWERED (user): no callback time is asked; "we will call again" only.
