# P N G Payment Reminder — open questions for BPCL

The demo agent (`prompts/Default/Default.txt`) runs on sensible placeholders. Before this goes beyond a
demo, confirm the following with BPCL / Bharat Gas Resources Limited (BGRL). Nothing here is answered yet
(created 2026-10-03).

## Customer data & per-call wiring
1. What is the real identifier on a BGRL P N G bill — **Customer ID** (BPCL's own bill term), **BP
   number**, or **Customer Number** (Paytm biller field) — and how many digits? **Demo decision
   (2026-10-03): Urja holds NO account number at all — only name and address; if asked, she says it is
   on the customer's own bill.** Confirm the term for when per-call data is wired in.
2. Which fields will the backend inject per call: name, address, account/Customer ID, amount due, due
   date, billing period, outstanding/arrears, late-payment surcharge, meter reading? (Demo hardcodes
   name, address, amount, bi-monthly period, due date — no account number.)
3. Should the agent ever state **arrears / previous unpaid balance** separately from the current bill?
4. How should the agent behave if injected data is **missing/broken** for a live call (the LPG
   `paymentAgent` has a strict amount-gate / date-gate — do we port it here)?

## Billing & policy
5. Confirm the **bi-monthly** billing cycle for BGRL domestic P N G (demo now uses bi-monthly, Aug–Sep),
   and the exact **due-date window** (days after bill date).
6. What is the real **late-payment** policy — the **surcharge amount** (the bill's "payable after due
   date" tier), and after how many days past due does the **connection get stopped** / how is it
   restored? **Demo decision: Urja states the surcharge and disconnection only in words, never a
   figure** — confirm the numbers so they can be added later if wanted.
7. Can the agent offer any **extension / part-payment / waiver**, or must all such requests go to the
   helpline? (Demo grants nothing and points to the SmartLine.)

## Payment channels
8. ~~P N G bill payment URL~~ — **Demo decision (2026-10-03): no website link is given**; Urja leads with
   the Hello B P C L App, then U P I apps. Confirm the App is the intended primary channel.
9. Confirm the **Hello B P C L App** supports P N G bill view + payment (research says yes; it is the
   demo's first-choice channel).
10. Which **U P I apps / BBPS billers** are officially supported (PhonePe, Paytm, Google Pay, others)?
11. Is there a **P N G-specific customer-care helpline / toll-free number**? **Demo decision: reuse the
    SmartLine 1800 22 4344 for P N G too** (and for any exact figure the customer needs), **1906** for
    gas-leak emergencies, and **no email address is given out**. Confirm 1800 22 4344 is acceptable for
    P N G, or supply the correct P N G care number.

## Call policy / compliance
12. Any **script/compliance language** BGRL requires on an outbound reminder (consent, "this call may
    be recorded", do-not-disturb handling, opt-out)?
13. On reaching a **wrong number or third party**, what exactly may be disclosed? (Demo discloses
    nothing beyond "Bharat Petroleum called about a P N G bill".)
14. Is a **callback / retry** mechanism expected if the customer is unavailable? (Demo just asks them to
    pass a message or says we will try again, then closes — no scheduling.)
15. Confirm **1906** is the correct gas-leak emergency number for BGRL P N G areas.
