# mak_lubricants — case contract

Inbound Hindi/Hinglish voice line for **Bharat Petroleum MAK Lubricants**, two-wheelers only.
Callers are mostly mechanics, plus riders. Urja recommends, upsells and cross-sells over voice, and owns
the whole call: **one agent, `prompts/Default/Default.txt`, only tool `callhangup`**, no handoff, no
transfer, no order or link.

## Scope (2026-10-01)
- Brands: **Honda, Suzuki, Royal Enfield** only. Every other brand and model gets a polite out-of-scope reply.
- Cars, trucks, LPG and other Bharat Petroleum products are out of scope. A gas leak gets 1906.

## Sources, in priority order
1. `docs/2W RECOMANDATION CHART-VARTICAL  290825 FL.jpg`: the official chart (models, sump, OEM grade, MAK grade).
2. `docs/2W_recommender_data.xlsx`: Product / Vehicle (BS4, BS6) / Upgrade Product Options (upsell, cross-sell).
3. `docs/lubes_product_info.xlsx`: pack sizes, MRP and per-pack coupon value. Oils: "41-1000" is read as worth ₹41 up to ₹1000. Grease: one fixed figure. Coupon values are never added up across packs.
4. Official OEM manuals and the Hello BPCL Play Store listing, used only to break ties (below).

## Decisions taken where the docs conflicted
- **Honda scooters**: lead with Scootech NXT 10W-30 800 ml. It covers both 600 and 800 ml sumps, and it is Honda's stated 10W-30 grade. 5W-30 (600 ml) is offered only for the 600 ml group, and only for BS6.
- **Activa 125 / Dio**: put in the 600 ml group (doc row and blog). **Livo**: 800 ml, the OEM drain figure.
- **Unicorn / CB Unicorn / Hornet 160R / CBR150R**: 1 L oil change (OEM). The chart's 1.2 and 1.3 L are the overhaul figures.
- **Access / Swish**: one 800 ml pack. The chart's 900 ml is treated as total capacity (no OEM figure found).
- **RE 650**: about 3.1 L oil change (RE manual), 3.9 L total (chart). Packs: 2.5 L + 1 L next synth.
- **RE 350 J-series vs UCE**: 1.7 L vs 2.4 L, the same 2.5 L pack. Upsell per the Upgrade sheet: BS6 → NXT PRO, BS4 → NXT SYNTH.
- **NXT PRO upsell on Royal Enfield 350/500 BS6** kept, because the Upgrade sheet lists NXT 15W-50 → NXT PRO (user, 2026-10-01). PRO has no SAE grade in the data, so Urja never states one.
- Packs are pre-computed as the cheapest combination that covers the oil change. Urja never calculates.
- **CBR 250R** (BS4-only row in the Vehicle sheet, no sump on the chart): 1.4 L oil change, 1.5 L with filter (Honda service data). Put in H5: 2 × 900 ml, the same packs as CB300.

## Voice rules specific to this case
- Every number and name in the prompt is written **in spoken form**: "ten W thirty", "five hundred fifty rupees", "two point four litre", years in Hindi ("दो हज़ार बीस").
- Brand is written **"मेक"** in Devanagari everywhere (pronounced "mek"), inside product names too. Never "mak" or "MAK" in Latin script. Never "RE".
- **Closing line is fixed**: "धन्यवाद भारत पेट्रोलियम को call करने के लिए। आपका दिन शुभ हो।" with callhangup on the same turn, nothing added. The callhangup directive is at line 1, in the CRC shape from TOOL_CALLING.md, because "callhangup" was being spoken as text.
- Hello BPCL App facts are limited to: nearest-pump details (no route), "right oil for your vehicle", and MAK Mechanic/Retailer coupon cashback up to ₹1000. **The App does not sell MAK oil.**
- The toll-free 1800 22 4344 is a last resort only.
- **Selling is the goal**: one caller, one vehicle, one basket (one engine oil, one grease). **Client feedback 2026-10-02**: every oil choice for the group (main + upgrade, + 5W-30 for H1 BS6) is offered side by side with benefits, both greases together, and the **price comes last**, once they have chosen, unless the caller asks for it. Satisfy what they asked first, then sell the rest. A settled category is never pitched again. Never ask about another vehicle. A SALES GATE runs before any goodbye (2026-10-01).
- The App shows the nearest Bharat Petroleum pump and its details. It never gives a route or directions.

## Not done yet
- No post-call analysis prompt.
- Popular models missing from the docs: Burgman, Avenis, Activa 7G, Himalayan 450, Guerrilla 450, Classic 650.
- Two-wheeler oils in the price list that the docs map to none of our 3 brands: NXT 20W-40, NXT 20W-50, STAR 10W-30, STAR 20W-40. Not offered until the client confirms a vehicle mapping.
