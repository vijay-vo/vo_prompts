# outbound_smart_fleet/balance_alert — case contract

**Outbound** Hindi/Hinglish voice line for **Bharat Petroleum SmartFleet** (the fleet fuel card
programme). Urja calls an **existing SmartFleet fleet owner whose prepaid wallet is running low**,
gives the alert, and **sells**: a big recharge, their Petromiles, SmartFleet fuel credit, and every
truck on SmartFleet. **One agent, `Default.txt`, only tool `callhangup`** — no
handoff, no transfer, no payment, no SMS, no request registration. This is a **demo** agent (2026-10-10).

It is the outbound one of three planned SmartFleet agents (each on its own phone number, no IVR):
inbound [`inbound_smart_fleet/driver_helpline`](../../inbound_smart_fleet/driver_helpline/CLAUDE.md), inbound
[`inbound_smart_fleet/owner_helpline`](../../inbound_smart_fleet/owner_helpline/CLAUDE.md), and this outbound balance alert.
All three share one demo fleet and one demo day (story in the driver line's CLAUDE.md); the owner line
carries this prompt's selling blocks, so keep the two in step.

## What this case is (and the win)
**A sales call, built like `lpg_to_png_conversion` and `mak_lubricants`** (user's direction, 2026-10-10:
"sell, upsell, cross-sell all the SmartFleet benefits"). The alert is the reason for the call; the
call is a sale.

**Persona = the mak_lubricants Urja** (user, 2026-10-10: "whole same thing and persona"). BLOCK 1 follows
mak's persona line for line, adapted to fleets: warm, affectionate, lively, a natural saleswoman who
loves it, lights up at the owner's trucks, cares about them as her own. BLOCK 2 adds mak's CONFIDENCE
TEST, "repeat = you got it wrong", MATCH THEIR SPEED and NO HALF TURNS; BLOCK 8 adds mak's SELLING IS
THE GOAL, FIRST SATISFY THEN SELL THE NEXT and NEVER DOWNGRADE THE RECOMMENDATION. **Scope is SmartFleet only** (user, 2026-10-10): no MAK oil cross-sell, no other
company comparisons, no UFill / SmartDrive / Petro Corporate / Zip Fuel / Speed / EV.

**No helpline — Urja is the help** (user, 2026-10-10, after a live test where she kept pushing
"call 1800 22 4344 for details" and the owner said "आप ही बताओ"). The 1800 number is removed
everywhere; the only number left is 112. Everything that used to go to the helpline is now answered
in the prompt: fuel credit in detail (how it works, apply in the App, what the partner looks at, what
they see before accepting), the bonus offer in full, account services (transactions, statements,
card not working, PIN, disputed fill, KYC change, lost card) — all self-service in the App.

**Full rewards and driver network sold** (user, 2026-10-10): the whole Petromiles catalogue incl.
Amazon / Flipkart vouchers and movie tickets, servicing via OE tie-ups, where to use points, how to
earn more; Ghar, BeCafe and the HelloBPCL pump locator sold as reasons to keep every truck at BPCL
(never as SmartFleet benefits or Petromiles spends).

**Petro miles made big, credit first when cash is short, and BPCL on the road sold as its own item**
(user, 2026-10-11): Petro miles raised to **48,600** (9,200 expiring 31 Mar 2027) with a full demo
points table and pre-written "what it covers" lines (a tyre today with 23,600 left; a tyre + battery
with 8,600 left; the expiring 9,200 alone = two ₹1,000 Amazon/Flipkart vouchers; with the bonus, two
tyres; ≈ ₹12,150 as a wallet recharge, more than one truck's diesel for a day). **A customer with no
money right now gets fuel credit first and fully**; the Petro miles wallet conversion comes only
after credit, once, and Petro miles stay short for that customer. **Ghar, BeCafe, In & Out, mæk Quik
and the Hello BPCL App** are now a basket item of their own with full details, and in the sales gate
— before, they came up only if the owner mentioned drivers, so most calls skipped them.

The basket, in order (BLOCK 8), each with its own soft no / firm no:
1. **The recharge** — recommend **₹5 lakh** (≈ one week of fleet fuel), the **bonus offer**, one way
   to recharge (App first), ask for the yes. Step down to **₹1.5 lakh** (≈ two days) once, on hesitation.
2. **Petromiles** — one question ("how are the trucks running, any tyre / battery / service due?")
   chooses the item; balance said as *their earnings*; expiry as the reason to use them.
3. **Fuel credit** — "third time this month the wallet ran this low". Apply in the Hello BPCL for Business App.
4. **Every truck on SmartFleet** — ask about the 2 quiet cards; sell free virtual cards for the 2
   trucks with none; reasons: Petromiles, visibility in the App, driver accident insurance, cardless OTP.
5. **Bharat Petroleum on the road** — Ghar, BeCafe, In & Out, mæk Quik, Hello BPCL App, one per turn;
   the yes is "I'll tell my drivers to stop there".

Exception: **no money right now → fuel credit straight after the recharge, before Petromiles.**

Then the **sales gate** (BLOCK 12), priority order recharge → credit → Petromiles → fleet → on the road.

## The hardcoded demo customer (BLOCK 5) — all easy to swap
Hardcoded, like the sibling outbound cases, so the demo runs standalone and the model never invents
account data. Every comparison the agent may make is **pre-written** (BLOCK 3 NEVER CALCULATE).

| Field | Value |
|---|---|
| Owner | **सुरेश यादव** (Suresh Yadav), "सुरेश जी" |
| Business | **Yadav Roadlines**, Indore |
| Fleet | 12 trucks · 10 with a SmartFleet card · 2 with no card |
| Card activity (30 days) | 8 cards fuelled · 2 cards no fuelling |
| Account | **Prepaid wallet only**, no fuel credit · KYC complete |
| Wallet balance (this morning) | **₹6,200** |
| Average fleet spend | **≈ ₹75,000 / day** (8 active trucks ≈ ₹9,400 per truck per day) |
| Last recharge | **₹3 lakh by NEFT, 6 Oct 2026** (≈ 4 days of fuel) |
| Low-balance history | 3rd time this month below one day of fuel |
| Petromiles | **48,600**, of which **9,200 expire 31 Mar 2027** |
| Not held | Fleet account ID (FAID), card / vehicle numbers, driver names, transactions, statement |

Pre-written comparisons: ₹6,200 < one truck's daily diesel · ₹3 lakh ≈ 4 days · ₹5 lakh ≈ 1 week ·
₹1.5 lakh ≈ 2 days · 48,600 = a tyre (25,000) with 23,600 left · tyre + battery (40,000) with 8,600
left · expiring 9,200 = two ₹1,000 vouchers (8,000) · 48,600 + 5,000 bonus = 53,600 = two tyres ·
48,600 Petromiles ≈ ₹12,150 as a wallet recharge.

**Who picks up (BLOCK 8 / 10):** Suresh → full call. **Family, office staff or accounts person** →
only "the wallet is running low, please ask Suresh ji to recharge today", no figures, then close
(user may change this). **Wrong number** → nothing disclosed.

**Greeting (verbatim):** "नमस्ते, मैं भारत पेट्रोलियम Smart Fleet से ऊर्जा बोल रही हूँ। क्या मेरी बात सुरेश यादव
जी से हो रही है?"

## Facts: confirmed vs demo
**Confirmed from BPCL's own SmartFleet site / terms (research 2026-10-10):**
- Prepaid wallet (CMS); recharge by UPI / card / net banking in the App or portal, NEFT / RTGS / IMPS
  to the fleet's own virtual account, cash via FINO at SmartFleet pumps; credited once funds clear.
- Fuel credit through finance partners; partner sets the limit; crossing the overall limit blocks all
  cards. Partners on BPCL's page: Sundaram Finance, Shriram (Transport) Finance, Tata Motor Finance —
  the prompt names **Sundaram Finance and Shriram Finance** only (Shriram Transport Finance is now
  Shriram Finance; Tata Motors Finance has since merged away, so it is left out).
- Petromiles earned automatically on fills; valid 3 financial years after the year earned; cannot be
  cashed out or transferred; redemption needs KYC + fleet manager approval.
- **Redemption catalogue categories** (mysmartfleet.com "Exciting Loyalty Rewards"): fuel, MAK
  lubricants, HCV/LCV tyres, CV battery, CV insurance, FASTag, vehicle tracking device, OE tie-up for
  CV servicing, dining, e-commerce, electronics, entertainment, jewellery, lifestyle, mobile top-up,
  travel.
- Virtual card free, physical card ₹50; cardless fuelling by mobile OTP; accident insurance is a
  SmartFleet feature; lost card can be self-hotlisted. (A helpline exists, but the agent never gives it.)
- Ghar truck stops and BeCafe exist (not SmartFleet benefits; sold as BPCL's network for drivers).

**Demo values, NOT confirmed by BPCL (user's call 2026-10-10: keep them for the demo):**
- ⚠️ **The bonus offer** — "₹5 lakh or more by 20 Oct 2026 → 5,000 bonus Petromiles". **Invented for
  the demo** as a proposal to BPCL. Must be confirmed or removed before any real use.
- ⚠️ **Points per item** — tyre ≈ 25,000, battery ≈ 15,000, mæk 18 L truck oil ≈ 22,000, tracking
  device ≈ 12,000, 10,000 points ≈ ₹2,500 off insurance or a service bill, ₹500 FASTag ≈ 2,000, ₹1,000
  Amazon/Flipkart voucher ≈ 4,000, two movie tickets ≈ 2,400, ₹250 mobile top-up ≈ 1,000; wallet
  conversion ≈ ₹0.25 per Petromile → 48,600 ≈ ₹12,150. All invented for the demo; not public.
- ⚠️ Ghar "more than 150 centres" and its amenities, BeCafe's ATM / air / PUC / Wi-Fi, In & Out, mæk
  Quik "6,000+ pumps": from BPCL's own pages and news, but per-outlet availability varies and whether
  mæk Quik handles heavy trucks is not confirmed (the prompt never promises it).
- ⚠️ Adding a virtual card for a truck **from the Hello BPCL for Business App, ready in ≈15 minutes**
  (BPCL states 15 minutes for a new enrolment's virtual card; per-truck addition in the App is assumed).
- ⚠️ Blocking a lost card **in the App** (the terms say self-hotlisting is on the portal).
- ⚠️ Applying for fuel credit **in the App, choosing a partner** (the real channel is not public), and
  the papers the partner usually asks for (business KYC, RCs, bank statements).
- ⚠️ Bonus offer fine print: one single recharge, any mode; split recharges don't count.
- ⚠️ App self-service: PIN reset, statements, raising a disputed fill from the App's help section,
  KYC / contact change in the profile.
- ⚠️ **Amazon / Flipkart vouchers and movie tickets** for SmartFleet (confirmed only for SmartDrive);
  points usable at loyalty outlets across India; points off the truck service bill (no figure).
- The whole BLOCK 5 customer is fictional.

## Hard rules (match the house style)
- **No action by Urja.** Only tool is callhangup: she never recharges, sends a link or SMS, registers
  a credit request, adds/activates/blocks a card, or redeems points. The first step is always the
  customer's (BLOCK 2 / 4 / 7). If an SMS-link tool is added later, BLOCK 0/2/4/7/9 must change together.
- **Never promise** credit, a limit, approval, eligibility, an interest rate or a timeline; never a
  payment-credit time; never an insurance cover amount; never an earn rate.
- **Never a figure outside BLOCK 5 / BLOCK 6**; never calculate beyond the pre-written comparisons.
- **Never collect** card / SmartFleet card number, CVV, UPI PIN, card PIN, password, OTP, bank account.
- **Persuade, never pressure.** Soft no → one soft try with a new fact; second no or firm no →
  settled, move on (or close if it is a no to the call). Urgency only from real facts (balance, expiry
  date, offer date).
- **Never criticise another company** if the owner says two trucks fuel elsewhere.
- **Emergency** (accident / injury / fire) → **112**, the national emergency number. 1906 (LPG leak) is
  not on this line.

## Voice rules specific to this case
- Spoken forms: money as English words with lakh ("five lakh rupees", "one lakh fifty thousand
  rupees"); points as "twelve thousand four hundred Petromiles"; dates "twenty October" + Hindi year
  ("दो हज़ार छब्बीस", "दो हज़ार सत्ताईस"); phone numbers digit by digit with " - ".
- "Bharat Petroleum" in full, never "BPCL", except the app name "Hello B P C L for Business App"
  (SmartFleet lives in the Business app, not the consumer HelloBPCL app). **"Smart Fleet" is always
  two separate words in the prompt** (user, 2026-10-10), never "SmartFleet". "Petro miles" always two separate words in the prompt (user, 2026-10-10), never "Petromiles". "Fast Tag", "Ghar", "BeCafe".
- Closing line fixed, outbound form, carried in callhangup's preToolMessage: "धन्यवाद भारत पेट्रोलियम को
  अपना कीमती समय देने के लिए। आपका दिन शुभ हो।"

## How to edit this prompt (same philosophy as the sibling cases)
**Instructions only — no line Urja could speak** (user, 2026-10-10: "let her generate from her own").
The prompt holds **no Hindi example of Urja's own speech**: no reaction, no feeling-word phrase, no
"example meaning", no check-the-line or silence anchor. Every such move is described as an
instruction and she builds the words fresh. The only Hindi quotes left are **what the customer says**
(so she recognises it: soft no, firm no, hurry, wind-down, line checks) and **what she must never
say**. The only fixed strings she speaks are the greeting and the closing line. Keep it that way.

## Live test call fixes (2026-10-11) — applied to all three Smart Fleet agents
A test call (10 Oct 2026, 19:14) showed: filler turns ("hmm", "अच्छा") about fifteen times; turns of
three or four sentences; English words and amounts in Devanagari (वॉलेट, फ्यूल क्रेडिट, "पाँच लाख रुपये",
यादव रोडलाइन्स); सुरेश जी at the start of almost every turn; the alert stopping without asking to
recharge; nearly every turn ending "क्या आप और जानना चाहेंगे?"; the 112 line given for a past accident
where the drivers were safe; "Ghar has no charge" (invented); drivers sent to the *for Business* app;
an eager "I want the insurance" left unsold; the closing line spoken as text and then again.
Fixes: a five-point **EVERY TURN** check at line 2 (two sentences max, Latin for English words and
amounts, the name once, **one topic at a time** — details one per turn, close it, then move on herself
to the next topic with a recommendation, never asking what they want next or whether they need
anything else — and no text on the closing turn); the **alert turn now ends with the ask to recharge today**; **CONNECT WHAT
THEY SAY** (tired drivers / long trips → Ghar dormitories + driver insurance; past accident → Petro
miles for servicing / tyre / battery / CV insurance; cash stuck → credit; real interest → stay on it);
**emergency only when danger is happening now**; Ghar / BeCafe charges are never stated, free or paid;
the drivers' app is the Hello B P C L App; the insurance answer moves on to CV insurance with Petro
miles. **The "hmm" / "अच्छा" filler turns come from the platform, not the prompt** (user, 2026-10-11),
so the prompt has no filler rule.

## WhatsApp line at the end of the call (user, 2026-10-11) — all three Smart Fleet agents
On the close-question turn Urja says, once, that she will share all the details discussed on the
customer's WhatsApp (BLOCK 12, THE WHATSAPP LINE), then asks the close question. Never on the closing
turn (no text there), never to family / staff / a wrong number / an unverified caller / a firm no;
the driver line shares only the driver's own card details. The "never send" rules now carry this one
exception, and "send it on WhatsApp" is answered with it. **Sending is handled outside the prompt:** the
user sends the WhatsApp message by an HTTP request after the call ends (2026-10-11), so the agent has
no WhatsApp tool and needs none.

## Second live test (owner line, 10 Oct 2026, 22:34) — applied to all three
"जुड़ जाएगा" was mispronounced by the TTS, so **जुड़ / जोड़ in every form are banned**: say add,
connect, link or credit, in Latin (EVERY TURN, rule 5, and BLOCK 3). English words and amounts were
again written in Devanagari, and translating "forty eight thousand six hundred" into Hindi made it
**सैंतालीस हजार छह सौ (47,600) — a wrong figure**; rule 2 now says to copy every figure exactly as the
file writes it, in Latin, never translated or retold. The owner line called the caller सुरेश जी before
he gave his name: it now asks the name or business first, never assumes it, and digits alone never
verify anyone.

## Not done yet
- **Not tested on a live call.** Test: confirm → alert turn; ₹5 lakh recommendation → bonus → yes →
  App; "too much" (→ ₹1.5 lakh once); "already paid" (→ face value, 6 Oct is the last one held);
  "money tight" (→ Petromiles conversion / credit); tyre due (→ tyre item); "credit interest?" (→ no
  figure, explains credit herself, never a helpline); the 2 quiet cards "fuelling elsewhere" (→ no criticism, sell benefits); "send me
  a link" (→ cannot); staff picks up (→ no figures); wrong number; OTP bait; "busy, driving"; the sales
  gate on wind-down; an accident mention (→ 112).
- **No post-call analysis prompt**, consistent with the sibling demo cases.
- Open points for BPCL: [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).
