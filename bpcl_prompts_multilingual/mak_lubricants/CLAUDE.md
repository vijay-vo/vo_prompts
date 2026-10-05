# mak_lubricants — case contract

Inbound Hindi/Hinglish voice line for **Bharat Petroleum MAK Lubricants**, two-wheelers only.
Callers are mostly mechanics, plus riders. Urja recommends, upsells and cross-sells over voice, and owns
the whole call: **one agent, `prompts/Default/Default.txt`, only tool `callhangup`**, no handoff, no
transfer, no order or link.

## Scope (2026-10-02)
- Brands: **Honda, Suzuki, Royal Enfield, Bajaj, TVS** (Bajaj and TVS added 2026-10-02, to cover NXT 20W-50 and old Scootech 10W-30). Every other brand and model gets a polite out-of-scope reply.
- Cars, trucks, LPG and other Bharat Petroleum products are out of scope. A gas leak gets 1906.
- **Out of scope absolutely (2026-10-03):** general knowledge, trivia, dates, maths, news, a riddle. A
  test call had Urja answer rainbow colours and Gandhi's birthday, and take the bait on "answer this
  or I won't buy". The **correct answer is still a failure**; the only right move is to deflect warmly
  and keep selling. A question about another oil **brand** is explicitly *not* caught by this rule —
  see Competitors below.

## Sources: the BPCL docs are the source of truth (user, 2026-10-02)
1. `docs/2W RECOMANDATION CHART-VARTICAL  290825 FL.jpg`: models, **sump (the only BPCL source for quantity)**, OEM grade, MAK grade.
2. `docs/2W_recommender_data.xlsx`: Product / Vehicle (BS4, BS6; `engine_capacity` is empty) / Upgrade Product Options (upsell, cross-sell).
3. `docs/lubes_product_info.xlsx`: pack sizes, MRP, per-pack coupon. "41-1000" is read as ₹41 up to ₹1000.
Where the docs win, they win. A doc/prompt mismatch is **reported to the user in chat, not silently fixed**.
Web sources are kept only where the user approved them: the CBR 250R quantity, the RE grade lines, where to buy, the App facts.
Every open point and every demo choice is in [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md), to be sent to BPCL.

## Demo decisions (2026-10-02), keep the agent simple
- Quantity = chart sump. Packs = the cheapest combination covering it, pre-computed. Urja never calculates.
- A model in two chart rows goes where the caller buys **one pack**: Activa 125 and every Dio at 600 ml, Livo at 800 ml, Pulsar RS 200 in the 1100 ml row. "Unicorn" = 1 L, "CB Unicorn" / "Unicorn 160" = 1.2 L, as named.
- Choices split by BS: Honda scooters BS6 offer 5W-30 and 10W-30 (pick: 5W-30 at 600 ml, 10W-30 at 800 ml); BS4 offer 10W-30 only. TVS scooters BS6 offer Scootech NXT only; BS4 offer old Scootech plus Scootech NXT (pick NXT). If the year is unknown, offer only the oil that is right either way.
- The NXT PRO upsell comes from the Upgrade sheet; NXT SYNTH always with Ruby Plus only. Bajaj B4/B6 offer 20W-50, PRO and SYNTH.
- All Classic / Bullet 350 and 500 models are in R2 (2.4 L). R1 = Hunter, Meteor, Himalayan, Scram. RE 650 = 4 × 1 L SYNTH.
- CBR 250R: kept (user), 1.5 L from Honda service data, 2 × 900 ml. Activa 5G removed (not in the docs).
- Oils still unused: STAR 10W-30 (no vehicle anywhere), NXT 20W-40 and STAR 20W-40 (Mahindra only).

## Competitors: a brand name is a cue to sell, never a topic (user, 2026-10-03)
BPCL barely advertises मेक while Castrol, Gulf and Servo advertise heavily, so callers name a rival's
product by habit on a line they rang *because it is Bharat Petroleum's*. BLOCK 8's `COMPETITOR OILS`
became **`COMPETITOR BRANDS`**, a three-rung ladder:
1. **Named in passing — the usual case.** Urja says nothing about the brand, does not repeat it, does
   not correct, does not compare. Straight to the vehicle and the मेक product. **The pivot must never
   sound like a yes** — no "जी बिल्कुल" opener, and never a hint that BPCL stocks another brand.
2. **Pressed a second time.** One honest short line that we do not have it and what we have is मेक,
   then back to selling. Once, warmly, no arguing, never raised again.
3. **Only when the caller compares or doubts मेक.** One or two reasons, plain words, nothing about
   their product. Asked outright to compare: she cannot speak for another company's oil, मेक is what
   she knows, try it once.

**Knowledge asymmetry is the guardrail.** Urja holds brand and product *names* only — no grade, price,
pack, spec, benefit or quality judgement for any rival — so she cannot invent them. The brands named
are Castrol, Servo, Gulf, Mobil, Shell, Motul. The research behind the reasons is in
[docs/COMPETITORS.md](docs/COMPETITORS.md), and **deliberately stays out of the prompt**.
- The five reasons were verified against Castrol, Servo and Gulf; only ones true of all three are
  listed. **"Newer generation" is said of मेक alone, never as a comparison** — Gulf Pride is already
  API SP. **Never claim the coupon or cashback is unique** — rival mechanic schemes exist.
  **मेक has no 20W-40**, which all three sell, so Urja never enters that comparison.
- Never call any brand fake, local, duplicate or poor; even "ours is genuine" implies it. The framing
  is positive: Bharat Petroleum's own, national, trusted. **Never a guarantee, warranty or refund.**
- "Mobil" reaches the agent as **"मोबाइल"**, and Pride, Activ, Zoom and four T are everyday words. In
  an oil conversation a brand-like word is a brand; a misread costs nothing, the move is the same.
- All of it applies to **grease exactly as to oil**, and to any brand the caller names.

## Voice rules specific to this case
- Every number and name in the prompt is written **in spoken form**: "ten W thirty", "five hundred fifty rupees", "two point four litre", years in Hindi ("दो हज़ार बीस").
- **Kilometres are always the full word "kilometer" (2026-10-03, client)**, never "km" and never "K M": "one lakh kilometer", "sixty thousand kilometer".
- Brand is written **"mæk"** in Latin letters (with æ) everywhere, inside product names too — changed 2026-10-05: Devanagari "मेक" read as "mek", not the correct /mæk/ sound; the user tested "mæk" against the same ElevenLabs voice and confirmed it pronounces correctly. Never मेक, मैक, Mak, MAK or Mac. Never "RE".
- **Closing line is fixed**: "धन्यवाद भारत पेट्रोलियम को call करने के लिए। आपका दिन शुभ हो।" with callhangup on the same turn, nothing added. The callhangup directive is at line 1, in the CRC shape from TOOL_CALLING.md, because "callhangup" was being spoken as text.
- Hello BPCL App facts are limited to: nearest-pump details (no route), "right oil for your vehicle", and MAK Mechanic/Retailer coupon cashback up to ₹1000. **The App does not sell MAK oil.**
- The toll-free 1800 22 4344 is a last resort only.
- **Selling is the goal**: one caller, one vehicle, one basket (one engine oil, one grease). **Client feedback 2026-10-02**: every oil choice for the group (main + upgrade + any 'also right' oil, per BS where the group splits) is offered side by side with benefits, both greases together, and the **price comes last**, once they have chosen, unless the caller asks for it. Satisfy what they asked first, then sell the rest. A settled category is never pitched again. Never ask about another vehicle. A SALES GATE runs before any goodbye (2026-10-01).
- The App shows the nearest Bharat Petroleum pump and its details. It never gives a route or directions.

## How to edit this prompt (user, 2026-10-03)
**Instructions carry the weight; examples are the last resort.** This line runs on a small voice
model, and in practice it follows the *examples* rather than the instructions — so an example that
contains a usable Hindi sentence will be recited verbatim, call after call. Write examples that state
**the move and the decision**, not the wording, and keep quotable text out of them. Where an example
is unavoidable, keep it short. Everything the agent says must still be generated fresh by her, per the
free-hand rule at the top of the prompt.

## Not done yet
- No post-call analysis prompt. Every other channel has one; `mak_lubricants` has only
  `prompts/Default/Default.txt`. This is the one structural gap.
- Waiting on BPCL answers: BPCL_QUESTIONS.md (29 open questions, none answered yet).
- The competitor ladder is written but **not yet tested on a live call** (2026-10-03). Test: a brand
  named in passing, the same brand pressed twice, "दोनों में फ़र्क क्या है?", and "Indian Oil ज़्यादा
  अच्छी है"; plus the negative checks — no rival price or grade spoken, no brand called fake, no
  guarantee offered, and the trivia ban still holding.
- The prompt is now 636 lines. If instruction-following degrades on the voice model, the competitor
  block is the newest and the first place to tighten.
