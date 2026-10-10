# inbound_smart_fleet/driver_helpline — case contract

**Inbound** Hindi/Hinglish voice line for **truck drivers** whose trucks run on Bharat Petroleum Smart
Fleet cards. A driver rings, usually from a pump with the truck waiting; Urja finds the truck by the
**last four digits** of its number, says **why the card is not working** and **what to do next**.
**One agent, `Default.txt`, only tool `callhangup`** — no transfer, no unblock, no SMS,
no contacting the owner. This is a **demo** agent (2026-10-10).

One of three Smart Fleet agents, each on its own phone number (no IVR, user 2026-10-10):
[`outbound_smart_fleet/balance_alert`](../../outbound_smart_fleet/balance_alert/CLAUDE.md) (outbound to the owner),
this driver line, and [`inbound_smart_fleet/owner_helpline`](../owner_helpline/CLAUDE.md).
All three share **one demo fleet and one demo day** — see "The shared demo story" below.

## What this case is (and the win)
**A service line, not a sales line.** A stuck driver is not a buyer. Speed is the help: digits → read
back → reason in one turn → what to do in the next. One small "for the road" extra (the Hello BPCL App
pump locator, or Ghar / BeCafe) at most once, never to a driver in a hurry. **Persona is the same Urja**
as `mak_lubricants` / the outbound agent (warm, affectionate, lively), tuned for a driver under pressure.

## Privacy — the rule that shapes the whole prompt (BLOCK 4 / 10)
A driver hears **only their own truck's card**: active or blocked, the reason, today's card limit and
what is left, what to do. A driver **never** hears the wallet balance, any payment, the fleet spend,
fuel credit, Petro miles, another truck, or the owner's number. For the wallet reason Urja says only
"the account needs balance, the owner has to add it". The account state is in BLOCK 5 "for your
reasoning only".

## The demo fleet (BLOCK 5) — same as the other two agents
Yadav Roadlines, Indore, owner सुरेश यादव. **The wallet has too little for a normal fill right now**
(owner's ₹5 lakh NEFT is still clearing — the driver is never told this). Trucks by last four digits:

| Digits | Card | Reason a driver hears |
|---|---|---|
| 4521 | active, ₹15,000/day, all used | daily limit used up → owner raises it in the App, or next day |
| 7834 | **blocked** 8 Oct 2026 (reported lost) | blocked → owner adds a new free virtual card |
| 2290, 6107, 3368, 5402, 8816, 1175, 6649, 2093 | active (6107: ₹11,000 left; 3368, 5402: ₹12,000 limit) | card fine, **account needs balance** → call the owner |
| 9015, 4470 | **no card** | not on Smart Fleet → owner adds a free virtual card |
| anything else | — | not found on this fleet → ask once more, then check with the owner |

Digits are **read back and confirmed** before any answer (BLOCK 2 DIGITS ARE CHECKED) — the
GCD-IVRS lesson: never guess a number.

**Greeting (verbatim):** "नमस्ते, मैं भारत पेट्रोलियम Smart Fleet से ऊर्जा बोल रही हूँ। बताइए, मैं आपकी क्या मदद कर
सकती हूँ?" · **Closing (verbatim, in callhangup's preToolMessage):** "धन्यवाद भारत पेट्रोलियम को call करने के लिए।
आपका दिन शुभ हो।"

## The shared demo story (all three agents, one day)
Morning: the **outbound** agent calls सुरेश जी — wallet ₹6,200. He sends **₹5 lakh by NEFT around
11:15**; it is received but **in process**. Wallet falls to **₹2,100**. A **driver** rings this line:
card declined → "account needs balance, call the owner". सुरेश जी rings the **owner line**: "where is my
money?" → safe, in process, same working day; then the bonus (his ₹5 lakh qualifies), Petro miles,
fuel credit, carding every truck.

## Facts: confirmed vs demo
Same sources and same ⚠️ demo list as [`balance_alert/CLAUDE.md`](../../outbound_smart_fleet/balance_alert/CLAUDE.md).
Specific to this line:
- Confirmed: per-card limits set by the owner ("ad hoc balance limits on cards"), self-blocking a lost
  card, free virtual card, card P I N set by the member, Hello BPCL App pump locator, Ghar, BeCafe.
- ⚠️ Demo: a **daily limit resets the next day**; the owner **raises a card limit in the Hello BPCL
  for Business App**; a **blocked card cannot be unblocked**, only replaced; all the card data.

## House rules (as the sibling cases)
No helpline or customer-care number (user, 2026-10-10: Urja is the help); **112** only, for an
emergency. Never ask for a card number, P I N or O T P — also not from the pump attendant. Never
tell a driver to pay with their own money or promise repayment. Instructions only: no Hindi line in
the prompt that Urja could speak; the Hindi quotes are what callers say.

## Not done yet
- Not tested on a live call. Test each digit row, unclear digits, digits not found, "how much balance
  / has the owner paid" (must refuse), "owner's number", attendant on the phone, P I N wrong, "pay
  cash?", a caller who says they are the owner, a driver in a hurry, an accident mention (→ 112).
- No switchagent: a caller on the wrong line is helped here as far as allowed (see BLOCK 8).
- Open points: [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).
