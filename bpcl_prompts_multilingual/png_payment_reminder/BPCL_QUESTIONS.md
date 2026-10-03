# P N G Payment Reminder — open questions for BPCL

The demo agent (`prompts/Default/Default.txt`) runs on sensible placeholders. Before this goes beyond a
demo, confirm the following with BPCL / Bharat Gas Resources Limited (BGRL). Nothing here is answered yet
(created 2026-10-03).

## Customer data & per-call wiring
1. What is the real identifier format on a BGRL P N G bill — is it called the **B P number**, consumer
   number, or customer id, and how many digits? (Demo uses a 9-digit B P number.)
2. Which fields will the backend inject per call: name, B P number, amount due, due date, billing
   period, outstanding/arrears, late-payment charge, meter reading? (Demo currently hardcodes name,
   B P number, amount, period, due date.)
3. Should the agent ever state **arrears / previous unpaid balance** separately from the current bill?
4. How should the agent behave if injected data is **missing/broken** for a live call (the LPG
   `paymentAgent` has a strict amount-gate / date-gate — do we port it here)?

## Billing & policy
5. Confirm the **bi-monthly** billing cycle for BGRL domestic P N G, and the exact **due-date window**
   (days after bill date).
6. What is the real **late-payment** policy — a late fee amount? After how many days past due does the
   **connection get stopped**? (Demo says only "eventually, well past the due date", no number.)
7. Can the agent offer any **extension / part-payment / waiver**, or must all such requests go to the
   helpline? (Demo grants nothing and points to the helpline.)

## Payment channels
8. Confirm the exact **P N G bill payment URL** on the Bharat Petroleum / eBharatGas / BGRL website.
   (Demo says "the P N G bill payment option on the Bharat Petroleum website" and gives no link.)
9. Does the **Hello B P C L App** support P N G bill payment? If so, add it as a channel.
10. Which **U P I apps / BBPS billers** are officially supported (PhonePe, Paytm, Google Pay, others)?
11. Is there a **P N G-specific customer-care helpline / toll-free number** the agent should give? The
    demo currently reuses the LPG toll-free **1800 22 4344** (from `mak_lubricants`) for "I want a
    person", and uses **1906** for gas-leak emergencies. Confirm 1800 22 4344 is acceptable for P N G,
    or supply the correct P N G care number.

## Call policy / compliance
12. Any **script/compliance language** BGRL requires on an outbound reminder (consent, "this call may
    be recorded", do-not-disturb handling, opt-out)?
13. On reaching a **wrong number or third party**, what exactly may be disclosed? (Demo discloses
    nothing beyond "Bharat Petroleum called about a P N G bill".)
14. Is a **callback / retry** mechanism expected if the customer is unavailable? (Demo just asks them to
    pass a message or says we will try again, then closes — no scheduling.)
15. Confirm **1906** is the correct gas-leak emergency number for BGRL P N G areas.
