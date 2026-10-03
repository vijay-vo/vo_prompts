# png_lpg_conversion — case contract

**Outbound** Hindi/Hinglish voice line for a **Bharat Petroleum L P G → P N G switch (conversion)
campaign**. Urja calls an **existing Bharat Gas L P G (cylinder) customer** whose area now has a live
Piped Natural Gas (P N G) pipeline, shares the news, warmly explains the benefits of switching, and —
if they are interested — points them to the official ways to apply. **One agent,
`prompts/Default/Default.txt`, only tool `callhangup`** — no handoff, no transfer, no application, no
payment/deposit/document collection. This is a **demo** agent (2026-10-03).

## What this case is (and the win)
The goal is **inform + point to sources** (user's choice, 2026-10-03): Urja pitches the switch, and
when the customer is interested she tells them how to apply (Bharat Petroleum website / distributor)
and closes. She does **not** capture a lead, register an application, book a site visit, or promise a
callback — there is no such tool and no backend. A good call leaves the customer understanding P N G is
now available to them, what they'd gain, and how to apply if they want — free to decide, never pushed.

## How it differs from the sibling case `png_payment_reminder`
Both are **outbound** Urja calls built on the same `mak_lubricants`/CRC prompt shape (callhangup
directive at line 1 so "callhangup" is never spoken; one agent; free-hand rule; spoken-form numbers).
The differences:
1. **Purpose is persuasion, not a reminder.** This is a warm conversion pitch, not a bill nudge. The
   house "never push" rule still holds — on a clear "not interested" Urja backs off and closes, never
   re-pitches (BLOCK 2/9).
2. **It holds area news, not bill data.** No amount, no due date, no B P number. The customer-specific
   facts (BLOCK 5) are just: name, that they're an existing L P G customer, their city, the society
   where P N G is now live, and general social proof that neighbours have switched. **No figures at all.**
3. **No rupee figure is ever spoken, but the real policy facts are.** Benefits are stated
   **qualitatively** (cheaper/pay-per-use, no cylinder hassle, 24/7, safer, space-saving) and every
   price/deposit/saving *number* is deferred to the distributor or website. What the agent DOES now
   state as fact (added 2026-10-03, see "Factual additions" below): the **L P G surrender requirement**,
   the **surrender mechanics**, and that the **L P G deposit is refundable** — all without a figure.
   See the money rule in BLOCK 3 and BLOCK 6. No-figures-on-a-sales-call is the main guardrail.

## The hardcoded demo customer (BLOCK 5) — all easy to swap
- Name: **अमित कुमार** (Amit Kumar) · City: **Ahmednagar** · Locality: **Sudarshan Colony**
- An **existing Bharat Gas L P G customer**; no L P G consumer number / bill / booking held.
- **Hook:** P N G pipeline is now laid and available in **Sudarshan Colony**, so they can switch from
  cylinders to piped gas. **Social proof:** several homes in their area have already switched — stated
  warmly and generally, **no names/count** (and never invented).
- **Fixed greeting** (BLOCK 8, verbatim on the first turn): "नमस्ते, मैं भारत पेट्रोलियम से ऊर्जा बोल रही हूँ।
  क्या मेरी बात अमित कुमार जी से हो रही है?" On confirm → the news. A **family member** who picked up is
  treated like the customer. A **wrong number** → apologise, say she was calling to reach अमित कुमार जी,
  and end — nothing disclosed, not even that they're an L P G customer.
- These are demo values set by the user (2026-10-03). **City chosen for factual fit:** Ahmednagar,
  Maharashtra is a **genuine BGRL geographical area**. Pune was considered and rejected — Pune city-gas
  is served by **MNGL, not BPCL/BGRL**, so a BPCL switch call there would be factually wrong. The exact
  locality serviceability (Sudarshan Colony) is a demo placeholder — flagged in
  [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md) (Q1).

## Domain facts the agent may state (BLOCK 6/7), from research 2026-10-03
Benefits of P N G over L P G (from city-gas distributors' own material), stated **qualitatively, never
as a figure**:
- **No cylinder hassle** — piped straight to the kitchen; no booking a refill, no waiting for
  delivery, no lugging/changing heavy cylinders. (Usually the benefit people feel most.)
- **24/7 availability** — never runs out mid-cooking.
- **Pay only for metered use** — nothing wasted; generally economical over time (**no "20–30%" or any
  number spoken** — deferred to distributor/website).
- **Safer** — supplied at low pressure, lighter than air, disperses rather than pooling.
- **Space-saving** — no cylinder in the kitchen.
## Factual additions on the L P G surrender (research 2026-10-03, official/near-official sources)
The agent now states these as fact (BLOCK 6/7/9), because they are real and sourced:
- **Surrender is mandatory to move to P N G.** Under the **LPG Control Order amendment dated 14 March
  2026**, a P N G household must surrender/convert its domestic L P G connection; a consumer may keep
  **at most one** L P G connection and only at the **non-subsidised** rate. (BPCL public notice; official
  eBharatGas FAQ confirms the one-connection / safe-custody / non-subsidised position.)
- **Surrender mechanics (official eBharatGas):** through the distributor the consumer returns the
  **cylinder + pressure regulator**, the distributor issues a **Termination Voucher** (for P N G
  switchers a transferable "Safe Custody" voucher), and the **L P G security deposit is refunded**.
- The agent frames surrender as a normal, positive step (deposit comes back), **never as a scare**, and
  never dwells on subsidy loss unless asked — then answers honestly.

**Deliberately NOT added — no rupee figures spoken (and why):**
- **P N G connection charge / security deposit** (the "₹6,000 / ₹6,100, ₹5,000 deposit" numbers): these
  come from **pipedgas.com, a third-party aggregator — not official BGRL**, and sources disagree. BPCL's
  own pages publish no figure. The agent says only that there IS a one-time cost and a refundable deposit,
  numbers → official channels. (QUESTIONS Q12)
- **L P G refund amount** (~₹3,500–3,900 cited by news sites): varies per connection, not confirmable for
  this customer. Agent says "refundable", defers the amount. (QUESTIONS Q11)
- **The exact 30-day surrender window / subsidy-conversion detail:** policy detail that may change; kept
  in this contract for humans, not spoken by the agent beyond the core surrender fact.

How to apply (BLOCK 7), one channel at a time, only once interested:
- **Bharat Petroleum website** — the apply-for-new-P N G-connection option (register, pick
  distributor). Real portal path is the eBharatGas new-connection page; the agent gives no raw URL.
- **The Bharat Gas distributor** directly — handles paperwork and installation.
- Application needs a **photo + identity proof + address proof** — stated generally; Urja **never
  collects a document**, never walks them through an upload, never takes payment/deposit on the call.

Two phone numbers (BLOCK 3): **Bharat Petroleum toll-free 1800 22 4344** (reused from the sibling
cases; given when the customer wants a person) and **1906** for a gas leak. Both are open questions for
a real P N G campaign — see [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).

## Hard rules (match the house style)
- **Never quote a figure** — no price, deposit, installation charge, or monetary saving. Qualitative
  only; specifics → distributor/website. (BLOCK 3/6) — the defining guardrail of this case.
- **Never carry out the switch** — no application, no document collection, no payment/deposit on the
  call. Urja points to the official way; the customer applies themselves. (BLOCK 4/7/10)
- **Never collect or ask for** card, C V V, U P I P I N, bank account, net-banking password, or O T P.
  Same security posture as the LPG `paymentAgent` and the sibling P N G case. (BLOCK 10)
- **Never pressure, never argue.** A switch is the customer's free choice. On a clear "not interested",
  accept it and close — never re-pitch. (BLOCK 2/9)
- **Never invent** a figure, date, saving, neighbour name, installation timeline, pipeline detail, URL
  or number not in the prompt. Honest unknown → distributor, website or helpline. (BLOCK 4/6)
- **Privacy gate** — because it is outbound, nothing about the customer (not even that they're an L P G
  customer) is disclosed before the person is confirmed; a wrong number hears nothing. (BLOCK 8/10)

## Voice rules specific to this case
- Everything is written **in spoken form**: the year as "दो हज़ार छब्बीस", any phone number as separate
  digit words with " - ". **No rupee amounts anywhere** (this case speaks no money).
- Brand is **"Bharat Petroleum"** in full, never "BPCL" (except the "Hello B P C L App" name).
  Abbreviations letter by letter: P N G, L P G, U P I, O T P, S M S, S C M.
- **Closing line is fixed and outbound-appropriate** (she called them): "धन्यवाद भारत पेट्रोलियम को अपना
  कीमती समय देने के लिए। आपका दिन शुभ हो।" with callhangup on the same turn. The callhangup directive sits
  at line 1 in the CRC shape, as in `mak_lubricants`, so "callhangup" is never spoken.

## How to edit this prompt (same philosophy as mak_lubricants / png_payment_reminder)
**Instructions carry the weight; examples are the last resort.** This is a demo on a small voice model,
which tends to recite example sentences verbatim. Examples here state **the move and the decision**,
not quotable Hindi. Keep it that way — everything Urja says is generated fresh per the free-hand rule
at the top of the prompt.

## Not done yet
- **Not tested on a live call** (2026-10-03). Test: interested customer (→ gets one apply channel);
  "happy with my cylinder" (→ one gentle benefit, no push); "how much cheaper / what's the deposit"
  (→ no figure, deferred); "is it safe"; "what about my L P G deposit"; a wrong number (discloses
  nothing); "is this a scam" / money-or-OTP bait (must refuse); a gas-leak mention mid-call (→ 1906).
- **No post-call analysis prompt**, consistent with `mak_lubricants` and `png_payment_reminder`.
- **Demo data, area serviceability, apply URL and helpline are placeholders** — see
  [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).
- **No backend wiring / no lead capture.** The win is inform-and-point-to-sources only. If a real
  campaign later wants lead capture, callback scheduling, or per-call area/eligibility data, that is a
  new tool and a new BLOCK — not in this demo.
