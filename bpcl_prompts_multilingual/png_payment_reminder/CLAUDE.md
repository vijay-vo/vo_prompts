# png_payment_reminder — case contract

**Outbound** Hindi/Hinglish voice line for **Bharat Petroleum Piped Natural Gas (P N G) bill payment
reminders**. Urja calls a P N G consumer, reminds them their bi-monthly bill is due, and nudges them
to pay on time. **One agent, `prompts/Default/Default.txt`, only tool `callhangup`** — no handoff, no
transfer, no payment collection. This is a **demo** agent (2026-10-03).

## What makes this case different from every other in the repo
1. **Outbound, not inbound.** Bharat Petroleum places the call. So — unlike the LPG agents and
   `mak_lubricants`, which are told *never* to greet or introduce themselves — Urja here **opens the
   call, says who she is and why she is calling, and verifies the right person** before anything else.
2. **It depends on customer bill data.** `mak_lubricants` holds no caller data; this agent must state
   a name, amount and due date. For the demo those are **hardcoded** in BLOCK 5 (see below), not
   injected `{{variables}}` — chosen by the user 2026-10-03 so the demo runs standalone. To wire it to
   a backend later, replace BLOCK 5's literals with injected variables and add the broken-data
   discipline the LPG `paymentAgent` uses.
3. **Privacy gate.** Because it is outbound, the amount is disclosed **only after** confirming the
   person (BLOCK 8/10). A wrong number or unknown third party hears nothing beyond "Bharat Petroleum
   called about a P N G bill".

## The hardcoded demo customer (BLOCK 5) — all easy to swap
- Name: **राजेश शर्मा** (Rajesh Sharma) · City: **Mumbai**
- B P number: **7 0 0 5 6 8 2 3 1** (written as digit words in the prompt)
- Period: **September 2026** · Amount: **₹1,200** ("one thousand two hundred rupees") · Due:
  **20 October 2026** (after today, so a genuine reminder, not yet overdue). Real BGRL P N G is
  bi-monthly; the demo is simplified to a single September-month bill at the user's request (2026-10-03).
- **Fixed greeting** (BLOCK 8, said verbatim on the first turn): "नमस्ते, मैं भारत पेट्रोलियम से ऊर्जा बोल
  रही हूँ। क्या मेरी बात राजेश शर्मा जी से हो रही है?" On confirm → reminder. A **family member** who
  picked up is treated like the customer (full reminder). A **wrong number** → apologise, say she was
  calling to reach राजेश शर्मा जी, and end — no bill detail disclosed.
- **End-of-call issue check** (BLOCK 8 steps 6–8): after the reminder lands, Urja asks if they face any
  P N G connection issue; if yes she hears it out, says she is noting it down, and answers **only from
  her own knowledge base** (BLOCK 6/7) — anything outside it is noted and pointed to the helpline/website,
  never invented. She then asks if more help is needed and **closes only on a clear "no"**. The payment
  reminder stays the primary purpose; she does not wander off-topic.
- These are demo values. The real format of a BGRL B P number, the real amount/period, and the real
  payment URL/helpline are open questions — see [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).

## Domain facts the agent may state (BLOCK 6/7), from research 2026-10-03
- **BPCL genuinely provides P N G** through **Bharat Gas Resources Limited (BGRL)**, its city-gas arm
  (1.73 lakh+ connections; areas include Aurangabad, Ahmednagar, Darbhanga, Purulia, Bidar, Goa).
- P N G is billed on the **meter reading** (gas in S C M) — the honest answer to "bill is too high" is
  that it follows the meter, never a guess at the reason. (Real BGRL billing is bi-monthly; the demo
  bill is a single September month.)
- Non-payment well past the due date can **eventually stop the connection** — stated **only if asked**,
  calmly, never as a threat.
- Payment channels: Bharat Petroleum website; U P I apps (PhonePe/Paytm → bills → Piped Gas → B P
  number); net banking / N E F T. The agent explains **where to go and what to enter**, never walks
  through or collects a card/UPI-PIN/password/OTP.
- Two phone numbers (BLOCK 3): the **Bharat Petroleum toll-free helpline 1800 22 4344** (reused from
  `mak_lubricants`; given when the customer wants a person/customer care) and **1906** for a gas leak
  (the common gas emergency number, same as the LPG agents). 1800 22 4344 is the LPG toll-free — whether
  BGRL has a P N G-specific care line is open question 11.

## Hard rules (match the house style)
- **Never collect or ask for** card, C V V, U P I P I N, bank account, net-banking password, or O T P.
  Same security posture as the LPG `paymentAgent`. (BLOCK 10)
- **Never threaten disconnection** as a stick; never argue; never push. A reminder is a courtesy. If
  the customer says they paid or will pay, take it at face value and thank them. (BLOCK 2/9)
- **Never invent** a figure, date, reason, past payment, meter reading, or URL/number not in the
  prompt. Honest unknown → website or helpline. (BLOCK 4/6)

## Voice rules specific to this case
- Everything is written **in spoken form**: amounts as "one thousand two hundred rupees", dates
  as "fifteen October" with the year in Hindi ("दो हज़ार छब्बीस"), the B P number and any phone number
  as separate digit words with " - ".
- Brand is **"Bharat Petroleum"** in full, never "BPCL" (except the "Hello B P C L App" name).
  Abbreviations letter by letter: P N G, U P I, O T P, S M S, S C M, N E F T, B P.
- **Closing line is fixed and outbound-appropriate** (she called them, so *not* "thanks for calling"):
  "धन्यवाद भारत पेट्रोलियम को अपना कीमती समय देने के लिए। आपका दिन शुभ हो।" with callhangup on the same
  turn. The callhangup directive sits at line 1 in the CRC shape, as in `mak_lubricants`, so "callhangup"
  is never spoken.

## How to edit this prompt (same philosophy as mak_lubricants)
**Instructions carry the weight; examples are the last resort.** This is a demo on a small voice model,
which tends to recite example sentences verbatim. Examples here state **the move and the decision**,
not quotable Hindi. Keep it that way — everything Urja says is generated fresh per the free-hand rule
at the top of the prompt.

## Not done yet
- **Not tested on a live call** (2026-10-03). Test: right person pays / says already paid / disputes
  the amount / can't pay now; a wrong number (must disclose nothing); "is this a scam" and an O T P
  bait (must refuse); a gas-leak mention mid-call (must jump to 1906).
- **No post-call analysis prompt**, consistent with `mak_lubricants`; every LPG channel has one.
- **Demo data and payment URL/helpline are placeholders** — see [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).
- **No backend wiring.** When real per-call data is available, swap BLOCK 5 literals for injected
  variables and port the broken-data / amount-gate discipline from the LPG `paymentAgent`.
