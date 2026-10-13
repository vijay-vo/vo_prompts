# Ujjwala Refill Outreach — open questions for BPCL

Created 2026-10-13. Nothing is answered yet. Some of these may be answered by the client script
once it is added to `docs/`.

## Call list & per-call data
1. Which fields come with each call: name, consumer number, distributor name and phone, last refill
   date, biometric authentication date, preferred language, state or district?
2. Is the beneficiary's preferred language in the data, or should the agent detect it from the
   first reply?
3. Who does the agent ask for if someone other than the beneficiary answers (the beneficiary is
   usually the woman of the household)?

## Purpose & outcome
4. What is the list of reasons to capture (for example cost, using another fuel, cylinder at
   another place, distributor or delivery problem, booking problem, subsidy not received, moved
   house, connection not in use)? Is it a fixed list or free text?
5. Should the agent only collect the reason, or also help: book a refill on the call, explain how to
   book, or register a complaint?
6. Which subsidy and scheme facts may the agent state (subsidy per cylinder, refill cap per year,
   5 kg option, payment options)? Only facts BPCL confirms will be used.

## Tools & wiring
7. Which tools are available: callhangup only, or also a tool to save the reason or disposition,
   refill booking, or complaint registration?
8. What post-call analysis fields does BPCL want (reason category, intent to refill, callback
   wanted, wrong number, language)?
9. Retry and callback policy: can the agent offer a callback at a time the beneficiary chooses?
