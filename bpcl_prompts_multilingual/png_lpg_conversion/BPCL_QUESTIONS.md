# L P G → P N G Switch Campaign — open questions for BPCL

The demo agent (`prompts/Default/Default.txt`) runs on sensible placeholders. Before this goes beyond a
demo, confirm the following with BPCL / Bharat Gas Resources Limited (BGRL). Nothing here is answered yet
(created 2026-10-03).

## Target list, area serviceability & per-call wiring
1. **Area serviceability is the whole premise.** For each customer, confirm P N G is actually live at
   their address before calling. The demo uses **Sudarshan Colony, Ahmednagar** — Ahmednagar is a genuine
   BGRL geographical area (Pune was rejected: Pune city-gas is MNGL, not BPCL/BGRL). The exact **locality
   serviceability** (Sudarshan Colony) is an unverified placeholder — confirm how per-society/colony
   serviceability is sourced for the real call list.
2. Which fields will the backend inject per call: name, area/society, existing-L P G confirmation,
   nearest distributor, P N G-serviceable flag? (Demo hardcodes name, city, society; holds no L P G
   account details.)
3. How is the **call list** built — all L P G customers in a newly-piped area, or a filtered subset
   (owners vs tenants, usage, consent)?
4. How should the agent behave if injected data (name/area/serviceability) is **missing or broken** on a
   live call?

## The pitch — benefits & figures
5. May the agent ever quote **concrete numbers** (e.g. "around 20–30% cheaper", a per-S C M rate, a
   monthly saving)? The demo deliberately speaks **no figures** and defers all cost questions to the
   distributor/website. Confirm this stays, or supply approved, accurate figures.
6. Confirm the **benefit claims** are acceptable as stated (cheaper/pay-per-use, no cylinder hassle,
   24/7, safer at low pressure, space-saving) and whether any must be qualified or dropped.
7. Is there approved **social-proof** language ("neighbours in your area have switched")? The demo
   states it generally with no names/count. Confirm this is acceptable and not a compliance issue.

## The switch process & costs
8. Confirm the exact **apply-for-P N G URL** (eBharatGas new-connection page vs a BGRL P N G page). The
   demo gives no raw link, only "the apply-for-P N G option on the Bharat Petroleum website".
9. Does the **Hello B P C L App** support applying for a P N G connection? If so, add it as a channel.
10. Confirm the **documents** needed (demo says photo + identity proof + address proof, generally).
11. **L P G surrender + deposit-refund** — the agent now states this as fact (research 2026-10-03):
    surrender is mandatory to move to P N G (LPG Control Order amendment 14 Mar 2026; keep at most one
    L P G at non-subsidised rate), done via distributor (return cylinder + regulator → Termination
    Voucher → deposit refunded). **Confirm this is accurate for BGRL P N G switchers and worded
    acceptably.** The refund **amount (~₹3,500–3,900 per news sources) and timeline are deferred** — not
    spoken — pending official confirmation.
12. **P N G connection charge / security deposit figures NOT added** (deliberately). Third-party sources
    (pipedgas.com) cite ~₹6,000–6,100 incl. a ₹5,000 refundable installation deposit, but this is **not
    official BGRL** and sources disagree; BPCL's own pages publish no figure. The agent says only that
    there IS a one-time cost + refundable deposit, numbers → official channels. **Supply the official BGRL
    domestic P N G tariff/connection card** to let the agent speak real figures.

## Call policy / compliance
13. Any **script/compliance language** required on an outbound sales/marketing call (consent, "this call
    may be recorded", DND/do-not-disturb handling, opt-out)? A conversion pitch has stricter
    telemarketing rules than a bill reminder.
14. On reaching a **wrong number or third party**, what exactly may be disclosed? (Demo discloses
    nothing — not even that the person is an L P G customer.)
15. Is **lead capture / callback / site-visit scheduling** wanted for interested customers? The demo is
    **inform + point-to-sources only** (user's choice 2026-10-03) — no tool, no follow-up promise. A real
    campaign may want to capture interest; that is a new tool and a new BLOCK.
16. Is there a **P N G-specific customer-care helpline**? The demo reuses the L P G toll-free
    **1800 22 4344** for "I want a person", and **1906** for a gas leak. Confirm both are correct for the
    P N G switch context, or supply the right numbers.
