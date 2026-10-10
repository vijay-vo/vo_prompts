# inbound_smart_fleet/owner_helpline — case contract

**Inbound** Hindi/Hinglish voice line for **Smart Fleet fleet owners**. The owner rings about their
own account — usually **a recharge that has not shown**, the balance or a card's limit, Petro miles,
or a truck's card not working. Urja **verifies the owner, solves it fully, then sells**. **One agent,
`Default.txt`, only tool `callhangup`** — no transfer, no payment, no SMS, no request
registration. This is a **demo** agent (2026-10-10).

One of three Smart Fleet agents (each on its own number, no IVR):
[`outbound_smart_fleet/balance_alert`](../../outbound_smart_fleet/balance_alert/CLAUDE.md) (outbound),
[`inbound_smart_fleet/driver_helpline`](../driver_helpline/CLAUDE.md), and this owner line. All
three share one demo fleet and one demo day (story in the driver line's CLAUDE.md).

## What this case is (and the win)
**Help first, then the same selling engine as the outbound agent** (user, 2026-10-10: same Urja,
same selling). mak's inbound shape: FIRST SATISFY, THEN SELL THE NEXT — never sell over an open worry;
an angry owner is reassured first and sold to only once calm. The basket, in order (BLOCK 8):
1. **The bonus** — his ₹5 lakh NEFT today is one single ≥₹5 lakh recharge before 20 Oct → 5,000 bonus
   Petro miles once it is added; with it, 53,600 = two truck tyres instead of one. Hearing it settles it.
2. **Petro miles** — the "how are the trucks running" question chooses the item; family rewards
   (Amazon/Flipkart, movie tickets, travel), ways to earn more, the expiry.
3. **Fuel credit** — "today your trucks are waiting while the money clears, third time this month".
4. **Every truck on Smart Fleet** — the 2 quiet cards, the 2 trucks with no card, **and a new virtual
   card for the blocked 7834**.
5. **Bharat Petroleum on the road** — Ghar, BeCafe, In & Out, mæk Quik, Hello BPCL App, with full details.
Exception: an owner with no money right now gets **fuel credit first**, before Petro miles.
Then the sales gate: own answer → bonus → credit → Petro miles → fleet → on the road.
Petro miles figures, the points table and the credit-first rule match the outbound agent (2026-10-11).

The selling text (BLOCK 6 Petro miles, fuel credit in detail, every truck, Ghar/BeCafe) is **ported
from the outbound agent as the user edited it on 2026-10-10** — keep the two in step: a change to one
of those blocks in either prompt is a change to both.

## Verification (BLOCK 8 VERIFY / BLOCK 10)
Name or business (सुरेश यादव / Yadav Roadlines) **and** the last four digits of the registered mobile,
**four - seven - one - nine**, read back and confirmed. Two misses → no account facts, App only,
general Smart Fleet answers still allowed. The accountant / office manager with the right digits is
treated as the owner's side. A **driver** on this line gets the driver-line answer for their own truck
(no verification, no account facts) and the call closes. Urja never says or hints at the digits.

## The demo account (BLOCK 5) — the same fleet as the other two agents
| Field | Value |
|---|---|
| Wallet now | **₹2,100** (prepaid only, KYC complete, no credit) |
| Today ~11:15 | **₹5 lakh NEFT — received, in process, not yet added** → then ≈ ₹5,02,100 |
| 9 Oct 2026 | ₹1 lakh UPI — **failed**, never added (bank returns it if debited) |
| 6 Oct 2026 | ₹3 lakh NEFT — added same day |
| Spend | ≈ ₹75,000 / day · 3rd low balance this month |
| Cards | the same 12 trucks as the driver line, with daily limits; 6649 and 2093 quiet 30 days; 7834 blocked; 9015, 4470 no card |
| Petro miles | 48,600 · 9,200 expire 31 Mar 2027 |

All sums are pre-written (BLOCK 5); Urja never calculates.

**Greeting (verbatim, changed 2026-10-11):** "नमस्ते, मेरा नाम ऊर्जा है। मैं आपकी Smart Fleet संबंधी सवालों में कैसे सहायता कर सकती हूँ?" · **Closing:** "धन्यवाद भारत पेट्रोलियम को call करने के लिए। आपका दिन शुभ हो।"

## Facts: confirmed vs demo
Same sources and ⚠️ list as [`balance_alert/CLAUDE.md`](../../outbound_smart_fleet/balance_alert/CLAUDE.md),
plus, for this line:
- ⚠️ "An NEFT recharge is added once bank clearing completes, **usually the same working day**" —
  a demo assumption; BPCL publishes no timing.
- ⚠️ A failed UPI is returned by the bank automatically (true of UPI generally; no timeline stated).
- ⚠️ Recharge history with statuses, card limits, P I N reset, statements, disputes and KYC all **in the
  Hello BPCL for Business App** (assumed, as in the outbound agent).
- ⚠️ Verification by the registered mobile's last four digits is a demo choice; production should use OTP.

## House rules (as the sibling cases)
No helpline or customer-care number — Urja is the help; **112** only, for an emergency. Never a payment
time beyond "usually the same working day"; never "pay again"; never "I'll speed it up". Never collect
card / P I N / O T P / bank details. Instructions only — no Hindi line Urja could speak.

## WhatsApp line at the end of the call (user, 2026-10-11) — all three Smart Fleet agents
On the close-question turn Urja says, once, that she will share all the details discussed on the
customer's WhatsApp (BLOCK 12, THE WHATSAPP LINE), then asks the close question. Never on the closing
turn (no text there), never to family / staff / a wrong number / an unverified caller / a firm no;
the driver line shares only the driver's own card details. The "never send" rules now carry this one
exception, and "send it on WhatsApp" is answered with it. **Sending is handled outside the prompt:** the
user sends the WhatsApp message by an HTTP request after the call ends (2026-10-11), so the agent has
no WhatsApp tool and needs none.

## Not done yet
- Not tested on a live call. Test: "where is my five lakh" (→ safe, in process, same working day, don't
  pay again, App) → bonus → Petro miles → credit → fleet; the 9 Oct UPI; each truck's card; wrong
  mobile digits twice; accountant with the right digits; a driver on this line; angry owner; "do it
  fast"; "send me a link"; credit detail; a fake "pay to release the recharge" story; accident (→ 112).
- Open points: [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).
