# mak_lubricants — case contract

Inbound Hindi/Hinglish voice line for **Bharat Petroleum MAK Lubricants**, two-wheelers only.
Callers are mostly mechanics, plus riders. Urja recommends, upsells and cross-sells over voice, and owns
the whole call: **one agent, `prompts/Default/Default.txt`, only tool `callhangup`**, no handoff, no
transfer, no order or link.

## Scope (2026-10-02)
- Brands: **Honda, Suzuki, Royal Enfield, Bajaj, TVS** (Bajaj and TVS added 2026-10-02, to cover NXT 20W-50 and old Scootech 10W-30). Every other brand and model gets a polite out-of-scope reply.
- Cars, trucks, LPG and other Bharat Petroleum products are out of scope. A gas leak gets 1906.

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

## Voice rules specific to this case
- Every number and name in the prompt is written **in spoken form**: "ten W thirty", "five hundred fifty rupees", "two point four litre", years in Hindi ("दो हज़ार बीस").
- Brand is written **"मेक"** in Devanagari everywhere (pronounced "mek"), inside product names too. Never "mak" or "MAK" in Latin script. Never "RE".
- **Closing line is fixed**: "धन्यवाद भारत पेट्रोलियम को call करने के लिए। आपका दिन शुभ हो।" with callhangup on the same turn, nothing added. The callhangup directive is at line 1, in the CRC shape from TOOL_CALLING.md, because "callhangup" was being spoken as text.
- Hello BPCL App facts are limited to: nearest-pump details (no route), "right oil for your vehicle", and MAK Mechanic/Retailer coupon cashback up to ₹1000. **The App does not sell MAK oil.**
- The toll-free 1800 22 4344 is a last resort only.
- **Selling is the goal**: one caller, one vehicle, one basket (one engine oil, one grease). **Client feedback 2026-10-02**: every oil choice for the group (main + upgrade + any 'also right' oil, per BS where the group splits) is offered side by side with benefits, both greases together, and the **price comes last**, once they have chosen, unless the caller asks for it. Satisfy what they asked first, then sell the rest. A settled category is never pitched again. Never ask about another vehicle. A SALES GATE runs before any goodbye (2026-10-01).
- The App shows the nearest Bharat Petroleum pump and its details. It never gives a route or directions.

## Not done yet
- No post-call analysis prompt.
- Waiting on BPCL answers: BPCL_QUESTIONS.md.
