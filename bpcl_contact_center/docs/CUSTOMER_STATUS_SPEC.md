# `{{customerStatus}}` — Template Specification

**Status:** v3 — for platform team implementation
**Owner:** Prompt / Conversation Design
**Purpose:** Replace 12 separate dynamic variables with one deterministic, platform-generated English text block.

> **Changes from v1.** The v1 delete-list would have broken live calls. `jNationalNumber` is restored — it is the `contactNumber` on **every call transfer in every agent**, and v1 omitted it entirely. The payable amount is now a single authoritative number (§8.2). Booking blockers are fixed at three. Consumer status is Active/Inactive only.
>
> **Changes in v3.** The distributor contact list is cut to `DistMobileNumber1` + `DistMobileNumber2` only (safe — a documented no-number fallback already exists). `ConDisReturnMsg` is **renamed** to `ConsumerDetailsReturnMsg`. `updatedAt` is **replaced** by `system.current_date` + `system.current_time`. All monthly-limit, annual-limit and closed-connection content is removed from the knowledge base.

---

## 1. What this replaces

**Net effect: 31 dynamic variables → 13.**
12 fold into `{{customerStatus}}`, 7 are deleted, 1 is renamed, 11 survive unchanged.

### 1.1 Variables that MOVE INTO `{{customerStatus}}` (12)

Removed from all prompts. Agents must never reference them again.

| Source variable | Feeds section |
|---|---|
| `ConsumerDetailsConsumerStatusDesc` | Customer Status |
| `gapToNextKyc` | Customer Status (drives `eKYC is valid` / `not valid`) |
| `RefillStatusBookDate` | Booking Status |
| `RefillStatusReturnMsg` | Booking / Delivery / Payment Status |
| `RefillStatusBookingClearDate` | Delivery Status |
| `RefillStatusCurrenRSP` | Payment Status |
| `RefillStatusAdvancePayment` | Payment Status |
| `RefillStatusCashMemoAmount` | Payment Status (see §8.2) |
| `SDoptedOutStatus` | Subsidy Status |
| `SDsubsidyAmountEligible0` | Subsidy Status |
| `SDpaymentTransferStatus0` | Subsidy Status |
| `SDsettlementDate0` | Subsidy Status |

### 1.2 Variables DELETED ENTIRELY (7)

| Deleted variable | Reason |
|---|---|
| `ConsumerDetailsLatesteKYCDate` | The blob states only `eKYC is valid` / `not valid`. The month count is dropped — it does not change what the consumer must do. |
| `SDoptedOutDate` | Business decision: the opt-out **fact** is now disclosed, the opt-out **date** is not. |
| `DistLandLineNumber1` | Distributor contact is cut to the two mobile numbers only. |
| `DistLandLineNumber2` | ″ |
| `DistEmergenyNumber1` | ″ — true gas hazards use the fixed `1906` helpline, which is hardcoded in the prompts and unaffected. |
| `DistEmergenyNumber2` | ″ |
| `updatedAt` | Replaced by `system.current_date` + `system.current_time` in `postCallAnalysis`. |

> **On cutting the distributor numbers.** These six were a fallback chain (*"first populated one wins"*). Cutting to two is safe **only because a documented no-number fallback already exists** — `connectionServicesAgent` §7-D: if the value is blank, never invent one; point the consumer to the website or escalate. The chain is now `DistMobileNumber1 → DistMobileNumber2 → §7-D fallback`. **That fallback must not be removed.** It is now the last line of defence.

### 1.3 Variables RENAMED (1)

| Old name | New name | Note |
|---|---|---|
| `ConDisReturnMsg` | `ConsumerDetailsReturnMsg` | Same value, same meaning. It is the *"this caller is not in the system and that is expected"* guard for prospective customers in `newConnectionAgent` (§13 of that prompt). It is **not** a duplicate of `RefillStatusReturnMsg` and must not be deleted. |

### 1.4 Variables that STAY unchanged (11)

`handoffSummary` · `jNationalNumber` · `system.current_date` · `system.current_time` ·
`ConsumerDetailsConsumerName` · `ConsumerDetailsConsumerNumber` · `ConsumerDetailsConsumerAddress` ·
`ConsumerDetailsDistributorName` · `ConsumerDetailsDistributorAddress` ·
`ConsumerDetailsDistMobileNumber1` · `ConsumerDetailsDistMobileNumber2`

> ⚠️ **`jNationalNumber` must not be folded or deleted.** It is the `contactNumber` parameter on **every `calltransfer` call in every agent**. Dropping it breaks every call transfer and every callback in the system.

### 1.4a Known limitation — "delivered" is inferred from the date, not confirmed

Delivery routing is purely date-based: **expected date today or in the future → `activeDeliveryAgent`; date already passed → `postDeliveryAgent`.** The blob follows the same rule, printing *"was delivered on X"* once X is in the past.

This means a delivery that was **scheduled** for a past date but never actually arrived is indistinguishable from one that completed. Vaani will open by saying it was delivered.

**This is pre-existing behaviour, not introduced by this migration** — the previous prompt made the same assumption. It is handled, not silently: `postDeliveryAgent` has a dispute flow for *"consumer says they did not receive the cylinder despite the system showing delivered"*, which registers a complaint. The consumer is never stranded.

If the backend ever exposes a true delivery-confirmation signal (a status or POS/cash-memo event, distinct from the date), the generator should switch to using it and this limitation disappears.

### 1.5 Known, accepted losses

- **KYC due date / months overdue.** Vaani can say eKYC is not valid, but not for how long. The consumer's action is identical either way.
- **Opt-out date.** Vaani can say the consumer opted out, but not when.
- **Distributor landline and emergency numbers.** If the distributor has no mobile number on file, Vaani gives no number at all and falls back to the website / escalation.
- **Monthly limits, annual limits, closed connections — removed entirely.** See §1.6.

### 1.6 Knowledge-base removal: refill limits and closed connections

The platform does not evaluate monthly limits, annual limits, or closed connections. **All content about them is removed from the prompts — both the claims and the policy answers.**

| File | What goes |
|---|---|
| `bookingNonEligibilityAgent` | The monthly-limit, annual-limit and closed-connection blocker lines; the "why only 2 / why only 15" answers; the declaration-form answer |
| `Default` | The `Refill Limits: Maximum 2 refills per month, 15 per year` KB line |
| `genericInfoComplaint` | The same limit line and the refill-limit FAQ answer |

**Consequence, stated plainly:** if a consumer asks *"साल में कितने cylinder मिलते हैं?"*, Vaani will say she does not have that information and offer the distributor. That is a common question and it now goes unanswered. This is a deliberate choice, accepted by the client.

> The unverifiable **claims** (*"इस साल आप पंद्रह refill ले चुके हैं"*) had to go regardless — the system never counted the consumer's refills, so that sentence was a hallucination fed by LLM-written handoff prose. Removing the **policy answers** as well goes further than safety requires.

### 1.7 ⚠️ TWO DATE FORMATS ARE IN PLAY — AND THEY ARE OPPOSITES

Confirmed by the platform team:

| Source | Format | Example |
|---|---|---|
| `{{system.current_date}}` | **YYYY-MM-DD** (year first) | `2026-07-14` |
| `{{system.current_time}}` | `HH:MM:SS` (24-hour) | `15:22:59` |
| **Every date inside `{{customerStatus}}`** | **DD-MM-YYYY** (day first) | `03-07-2026` |

**These are reversed.** `2026-07-14` puts the year first; `03-07-2026` puts the day first. Both appear in the same prompt, on the same turn, and a model will eventually read one as the other — the failure mode is Vaani telling a consumer their subsidy was credited in **March** when it was credited in **July**.

**This is the single highest live-user risk in the migration.** Every receiving prompt states both formats explicitly, side by side, in its date rule. If the platform can align them to one format, do it — that removes the risk entirely rather than managing it.

`postCallAnalysis` runs **immediately after the call ends**, so `system.current_date` equals the call date. It must still convert `2026-07-14` into its required `YYYY-MM-DD` output (already the same format — no conversion needed) and resolve relative dates like *"कल"* / *"दो दिन पहले"* from it. If it is ever batched or re-run later, the call date and every relative date it resolves will be wrong by the delay.

---

## 2. Where `{{customerStatus}}` is injected

Only into the **6 agents** that use the replaced variables today.

| Agent | Sections it is permitted to read |
|---|---|
| `paymentAgent` | **Payment Status** (+ Customer Status) |
| `subsidyAgent` | **Subsidy Status** (+ Customer Status) |
| `connectionServicesAgent` | **Customer Status** only |
| `bookingNonEligibilityAgent` | **Booking Status** (+ Customer Status) |
| `activeDeliveryAgent` | **Delivery Status, Booking Status** (+ Customer Status) |
| `postDeliveryAgent` | **Delivery Status, Booking Status** (+ Customer Status) |

**Not injected into (10):** `bookingEligibleAgent`, `eligibleDeliveryAgent`, `notEligibleDeliveryAgent`, `genericInfoComplaint`, `emergencyAgent`, `newConnectionAgent`, `routingAgent`, `Default`, `getConsumerDetails`, `postCallAnalysis`.

> The first three of those use **zero** refill/subsidy variables today. Injecting the blob would hand them data they have never had.

Each receiving prompt carries a hard rule: **"Read ONLY your permitted section(s). Ignore all others, even if the consumer asks about them and the answer is visible."** This preserves an existing guarantee — `paymentAgent` is today forbidden to discuss delivery timing, and the blob now always contains delivery text.

---

## 3. Global format rules

1. **English only.** Vaani translates to Hindi at speaking time.
2. **Exactly five sections, always, in this fixed order:**
   `Customer Status:` → `Booking Status:` → `Delivery Status:` → `Payment Status:` → `Subsidy Status:`
3. **A section is never omitted.** Missing data or a failed API prints `<Section Name>: Not available.`
   Mandatory. Vaani must be able to tell *"no advance payment was received"* apart from *"we don't know"* — those need opposite replies.

3a. **⚠️ A CLAUSE WHOSE VALUE IS MISSING MUST BE SUPPRESSED, NOT PRINTED WITH `not available` IN THE SLOT.**

   Individual fields can be missing even when the section is populated. The generator currently emits things like:

   > `Subsidy Status: The consumer is enrolled for subsidy. The eligible subsidy amount is not available. The subsidy payment status is not available. The subsidy was credited on not available.`

   That final clause **asserts a credit happened** while admitting it does not know when — and the clause before it says the payment status is not even known. It is a template that fired with an empty slot, and it turns a missing field into a **positive claim about a consumer's money**. An agent reading it in good faith tells the consumer *"आपकी subsidy credit हो गई"*.

   **The rule: if a clause's value is missing, do not emit the clause at all.** An event clause ("was credited on X", "was delivered on X", "an advance of X was received") must be printed **only** when its value is real. The correct output for the example above is:

   > `Subsidy Status: The consumer is enrolled for subsidy. No further subsidy information is available.`

   Never `"... on not available."` Never `"... is not available."` inside a sentence that otherwise asserts the event occurred.

   All six agents have been hardened to survive this if it is not fixed — they are instructed to treat any `not available` value as UNKNOWN and to **never speak the claim a clause makes when its value is missing**. But that is a seatbelt, not a fix. Two guards is right; one of them belongs here.
4. **One paragraph.** Sections separated by a single space.
5. **Dates: `DD-MM-YYYY`, always day-first.** `03-07-2026` is 3 July. Never any other format.
6. **Amounts: `₹` + two decimals**, e.g. `₹968.50`.
7. **Length target: ≤ 150 words.** It rides on every turn of every call.
8. **Generated once per call. It does not update mid-call.**
   - Registered caller → generated at call start.
   - Unregistered caller → generated immediately after `getConsumerDetails` completes its fetch, then injected from that point on.
9. **Deterministic template fill only. Never LLM-generated.**
   An LLM writing this text puts an unverifiable hallucination surface upstream of every agent.

### 3.1 Tense

- **Present tense** for anything in progress — "is booked", "is payable", "is Pending".
- **Past tense** for anything completed — "was delivered", "was payable", "was credited".

### 3.2 The blob must NEVER contain

Consumer name · consumer number · consumer address · distributor name, address or numbers · emergency numbers · Hindi text · instructions to the agent · complaint numbers · bank, Aadhaar, UPI, OTP or card data.

---

## 4. Consistency contract (platform guarantees)

Not style preferences. If any of these break, Vaani speaks a contradiction to a live consumer, and **there is no second variable left to cross-check against.**

1. The **same date** must be identical everywhere it appears across sections.
2. Every **day count** must agree with the dates and with today.
   *Today 13-07-2026, booked 03-07-2026 → exactly `10 days ago`.*
3. Every **derived date** must agree with its inputs.
   *Booked 03-07-2026 + 25-day gap = 28-07-2026, which must also equal today + "15 more days".*
4. **All arithmetic is pre-computed.** The agent never subtracts. If a balance is owed, the blob states the balance — never the two numbers to subtract from.
5. An **"expected delivery" date is never in the past.** If the expected date has passed and delivery is unconfirmed, use D3, not D2.
6. **Booking Status must agree with Customer Status.** If Customer Status says `Inactive`, Booking Status must carry the Inactive clause. They cannot disagree.
7. **One payable number, one meaning** (§8.2).
8. The blob must **never contradict the agent the platform routed to.** Do not route to `bookingEligibleAgent` while the blob says the consumer is not eligible to book.

---

## 5. Section 1 — Customer Status

Source: `ConsumerDetailsConsumerStatusDesc`, `gapToNextKyc`

```
Customer Status: Consumer is <Active|Inactive> and eKYC is <valid|not valid>.
```

| ID | Condition | Text |
|---|---|---|
| C1 | Active, eKYC valid | `Customer Status: Consumer is Active and eKYC is valid.` |
| C2 | Active, eKYC not valid | `Customer Status: Consumer is Active and eKYC is not valid.` |
| C3 | Inactive, eKYC valid | `Customer Status: Consumer is Inactive and eKYC is valid.` |
| C4 | Inactive, eKYC not valid | `Customer Status: Consumer is Inactive and eKYC is not valid.` |
| C5 | Missing | `Customer Status: Not available.` |

> Status is **Active or Inactive only**. There is no Blocked or Closed state.
> `gapToNextKyc` is used **only** to decide valid vs not valid. The number is never printed.

---

## 6. Section 2 — Booking Status

Source: `RefillStatusBookDate`, `RefillStatusReturnMsg`, connection status, eKYC, booking-gap policy

There are exactly **three blockers**: connection Inactive, eKYC not valid, booking gap not met. **No others exist.** The platform does not evaluate monthly limits, annual limits, or closed connections, so the blob must never mention them.

| ID | Condition | Text |
|---|---|---|
| B1 | Eligible, has booked before | `Booking Status: The consumer is eligible to book a new refill. The last refill was booked <N> days ago on <DD-MM-YYYY>.` |
| B2 | Eligible, never booked | `Booking Status: The consumer is eligible to book a new refill. No previous refill booking is on record.` |
| B3 | Booking in progress | `Booking Status: A refill is currently booked and in progress. It was booked on <DD-MM-YYYY>. A new refill cannot be booked until this one is delivered.` |
| B4 | Last booking cancelled | `Booking Status: The last refill, booked on <DD-MM-YYYY>, was cancelled. The consumer is eligible to book a new refill.` |
| B5 | **Not eligible** — one or more blockers | Built by the composition rule below. |
| B6 | Missing | `Booking Status: Not available.` |

### 6.1 B5 — the composition rule (handles all blocker combinations)

Blockers can occur **together**. Do not pick one. Emit **every clause that applies**, in this fixed order.

**Open with:**
```
Booking Status: The consumer is not eligible to book a refill.
```

**Then append each applicable clause, in this order:**

| Order | Blocker | Clause |
|---|---|---|
| 1 | Connection Inactive | ` The connection is Inactive.` |
| 2 | eKYC not valid | ` eKYC is not valid and must be completed before booking.` |
| 3 | Booking gap not met | ` The required booking gap of <G> days has not been met. The last refill was booked <N> days ago on <DD-MM-YYYY>. The next refill can be booked after <R> more days, on <DD-MM-YYYY>.` |

**Then, if the gap clause was NOT emitted, append the booking history:**
- Has booked before → ` The last refill was booked <N> days ago on <DD-MM-YYYY>.`
- Never booked → ` No previous refill booking is on record.`

`<G>` = required gap in days · `<N>` = days since last booking · `<R>` = days remaining until eligible

This produces all seven blocker combinations from one rule, and the agent explains every applicable reason — so the consumer fixes everything in one call instead of calling back.

---

## 7. Section 3 — Delivery Status

Source: `RefillStatusBookingClearDate`, `RefillStatusReturnMsg`

| ID | Condition | Text |
|---|---|---|
| D1 | Delivered | `Delivery Status: The last refill was delivered on <DD-MM-YYYY>.` |
| D2 | Out for delivery, expected date known **and not in the past** | `Delivery Status: The current refill is out for delivery and is expected to be delivered on <DD-MM-YYYY>.` |
| D3 | Booked, delivery pending, no date **or expected date has passed** | `Delivery Status: The current refill is booked and delivery is pending. No delivery date is available.` |
| D4 | Booking cancelled | `Delivery Status: No delivery is in progress because the booking was cancelled.` |
| D5 | No booking at all | `Delivery Status: No delivery is in progress.` |
| D6 | Missing | `Delivery Status: Not available.` |

> **D2 vs D3 is a hard rule.** Never tell a consumer a cylinder "is expected on" a date that has already passed. See §4.5.

---

## 8. Section 4 — Payment Status

Source: `RefillStatusCurrenRSP`, `RefillStatusAdvancePayment`, `RefillStatusCashMemoAmount`

| ID | Condition | Text |
|---|---|---|
| P1 | No advance, delivery pending | `Payment Status: The retail selling price is ₹<RSP>. No advance payment has been received, so ₹<RSP> is payable to the delivery person at the time of delivery.` |
| P2 | No advance, already delivered | `Payment Status: The retail selling price was ₹<RSP>. No advance payment was received, and ₹<RSP> was payable to the delivery person at the time of delivery.` |
| P3 | Advance covers full price, delivery pending | `Payment Status: The retail selling price is ₹<RSP>. An advance payment of ₹<ADV> has been received in full. No amount is payable to the delivery person.` |
| P3b | Advance covered full price, already delivered | `Payment Status: The retail selling price was ₹<RSP>. An advance payment of ₹<ADV> was received in full. No amount was payable to the delivery person.` |
| P4 | Partial advance, delivery pending | `Payment Status: The retail selling price is ₹<RSP>. An advance payment of ₹<ADV> has been received. The remaining ₹<DUE> is payable to the delivery person at the time of delivery.` |
| P5 | Partial advance, already delivered | `Payment Status: The retail selling price was ₹<RSP>. An advance payment of ₹<ADV> was received. The remaining ₹<DUE> was payable to the delivery person at the time of delivery.` |
| P6 | Advance exceeds price, delivery pending | `Payment Status: The retail selling price is ₹<RSP>. An advance payment of ₹<ADV> has been received, which is more than the price. The difference of ₹<DIFF> is due to be refunded.` |
| P6b | Advance exceeded price, already delivered | `Payment Status: The retail selling price was ₹<RSP>. An advance payment of ₹<ADV> was received, which is more than the price. The difference of ₹<DIFF> is due to be refunded.` |
| P7 | Booking cancelled, advance was paid | `Payment Status: The booking was cancelled. An advance payment of ₹<ADV> was received and is due to be refunded.` |
| P8 | Booking cancelled, no advance | `Payment Status: The booking was cancelled. No advance payment was received.` |
| P9 | No booking on record | `Payment Status: No refill booking is on record, so no refill payment is due. The retail selling price is ₹<RSP>.` |
| P10 | Missing | `Payment Status: Not available.` |

`<DIFF>` = advance − RSP (platform-computed)

### 8.1 Payment Status must be self-contained on booking position

`paymentAgent` is **not permitted to read Booking Status**. But its core flows — *"money was deducted and my booking isn't showing"*, *"my order was cancelled, where is my refund"* — depend on knowing whether a booking exists.

So the Payment Status sentence states booking position **in payment terms, on its own**:
- **P1–P6** imply a live booking (there is a price and an amount paid or payable).
- **P7 / P8** state the booking was **cancelled**.
- **P9** states **no booking is on record**.

This replaces `paymentAgent`'s old A/B/C/D/X state machine, which derived booking position from `RefillStatusReturnMsg`. That machine is deleted from the prompt. A Payment Status sentence that leaves booking position ambiguous will strand the agent mid-flow.

### 8.2 `<DUE>` — one number, one meaning ⚠️

`<DUE>` is **the amount the delivery person was entitled to collect.** Exactly one number ever occupies this slot.

- Normally `<DUE>` = RSP − advance, computed by the platform.
- **If a cash memo / billed amount exists and differs from that, the cash memo amount IS `<DUE>`** — because that is the amount the consumer actually saw on their receipt.

The blob never prints two competing figures. The agent does **not** compare them and does **not** subtract.

**Why this matters:** `paymentAgent`'s overcharging flow works by comparing *what the consumer says they were charged* against `<DUE>`.

- Consumer says they were charged **`<DUE>`** → correct, no complaint.
- Consumer says they were charged **more than `<DUE>`** → overcharging, register a complaint.
- Blob says **"No amount is payable"** (P3) and cash was still demanded → wrong, register a complaint.

If two different numbers could ever land in the `<DUE>` slot, Vaani will accuse an honest delivery person of overcharging on a live call.

---

## 9. Section 5 — Subsidy Status

Source: `SDoptedOutStatus`, `SDsubsidyAmountEligible0`, `SDpaymentTransferStatus0`, `SDsettlementDate0`

Evaluate **top to bottom, stop at the first match.**

| ID | Condition | Text |
|---|---|---|
| S1 | `SDoptedOutStatus` = yes | `Subsidy Status: The consumer has opted out from subsidy, so no subsidy is applicable.` |
| S2 | Enrolled, eligible amount is zero | `Subsidy Status: The consumer is enrolled for subsidy. No subsidy amount is eligible on this refill.` |
| S3 | Enrolled, amount > 0, Credited | `Subsidy Status: The consumer is enrolled for subsidy. The eligible subsidy amount is ₹<AMT>. The subsidy payment status is Credited. The subsidy was credited on <DD-MM-YYYY>.` |
| S4 | Enrolled, amount > 0, Pending | `Subsidy Status: The consumer is enrolled for subsidy. The eligible subsidy amount is ₹<AMT>. The subsidy payment status is Pending. The subsidy has not been credited yet.` |
| S5 | Enrolled, amount > 0, Failed | `Subsidy Status: The consumer is enrolled for subsidy. The eligible subsidy amount is ₹<AMT>. The subsidy payment status is Failed. The subsidy could not be credited.` |
| S6 | Enrolled, amount > 0, status unknown | `Subsidy Status: The consumer is enrolled for subsidy. The eligible subsidy amount is ₹<AMT>. The subsidy payment status is not available.` |
| S7 | Missing | `Subsidy Status: Not available.` |

### 9.1 Why S1 and S2 must stay separate

*"Opted out"* and *"enrolled but zero eligible amount"* are different facts requiring opposite replies. Collapse them and Vaani tells an **enrolled** consumer they opted out — a false accusation on a live call that the consumer will dispute.

### 9.2 Policy change — opt-out is now disclosed ⚠️

Today `subsidyAgent` is **engineered never to raise the topic**: it says only *"अभी आप eligible नहीं हैं"* and is explicitly forbidden to mention opt-out. The blob now states it outright. **This requires client sign-off.**

Three consequences the prompt must handle:

1. **The opt-out neutrality rules are deleted** from `subsidyAgent` (§7, §15, §21 of that prompt).
2. **A new dispute flow.** *"मैंने opt-out नहीं किया"* → do not argue, do not defend the system → register a complaint with `"Consumer says system data is wrong."` appended to `feedbackDescription`.
3. **A new re-enrolment flow.** *"मुझे subsidy वापस चाहिए"* → Vaani has **no opt-in process in her knowledge base**. She directs the consumer to the distributor office and shares the distributor contact. She never invents a process.

> **Reporting note for the client:** `subsidyAgent` files **every** complaint with `reason = "others"` — the fixed reason enum has no subsidy categories. Opt-out disputes will land there too. Reporting granularity on this new complaint type will be zero until the enum is extended.

---

## 10. Worked examples

### 10.1 Cycle complete — gap blocks rebooking, subsidy credited
*(today = 13-07-2026)*

> Customer Status: Consumer is Active and eKYC is valid. Booking Status: The consumer is not eligible to book a refill. The required booking gap of 25 days has not been met. The last refill was booked 10 days ago on 03-07-2026. The next refill can be booked after 15 more days, on 28-07-2026. Delivery Status: The last refill was delivered on 08-07-2026. Payment Status: The retail selling price was ₹968.50. No advance payment was received, and ₹968.50 was payable to the delivery person at the time of delivery. Subsidy Status: The consumer is enrolled for subsidy. The eligible subsidy amount is ₹300.00. The subsidy payment status is Credited. The subsidy was credited on 10-07-2026.

✅ 03-07 + 25 = 28-07. 13-07 + 15 = 28-07. 13-07 − 03-07 = 10 days. Delivery after booking. Subsidy after delivery.

### 10.2 Refill in progress, partial advance, consumer opted out
*(today = 13-07-2026)*

> Customer Status: Consumer is Active and eKYC is valid. Booking Status: A refill is currently booked and in progress. It was booked on 11-07-2026. A new refill cannot be booked until this one is delivered. Delivery Status: The current refill is out for delivery and is expected to be delivered on 14-07-2026. Payment Status: The retail selling price is ₹968.50. An advance payment of ₹500.00 has been received. The remaining ₹468.50 is payable to the delivery person at the time of delivery. Subsidy Status: The consumer has opted out from subsidy, so no subsidy is applicable.

### 10.3 Two blockers at once — Inactive connection + eKYC + gap
*(today = 13-07-2026)*

> Customer Status: Consumer is Inactive and eKYC is not valid. Booking Status: The consumer is not eligible to book a refill. The connection is Inactive. eKYC is not valid and must be completed before booking. The required booking gap of 25 days has not been met. The last refill was booked 8 days ago on 05-07-2026. The next refill can be booked after 17 more days, on 30-07-2026. Delivery Status: The last refill was delivered on 09-07-2026. Payment Status: The retail selling price was ₹968.50. An advance payment of ₹968.50 was received in full. No amount was payable to the delivery person. Subsidy Status: The consumer is enrolled for subsidy. No subsidy amount is eligible on this refill.

✅ 05-07 + 25 = 30-07. 13-07 + 17 = 30-07. 13-07 − 05-07 = 8 days. Customer Status `Inactive` matches the Booking Status Inactive clause (§4.6).

### 10.4 Cancelled booking, refund pending — proves the payment agent can work from its section alone
*(today = 13-07-2026)*

> Customer Status: Consumer is Active and eKYC is valid. Booking Status: The last refill, booked on 02-07-2026, was cancelled. The consumer is eligible to book a new refill. Delivery Status: No delivery is in progress because the booking was cancelled. Payment Status: The booking was cancelled. An advance payment of ₹500.00 was received and is due to be refunded. Subsidy Status: The consumer is enrolled for subsidy. No subsidy amount is eligible on this refill.

✅ `paymentAgent` reads only Payment Status and still knows the booking was cancelled and a refund is due. This is the §8.1 guarantee working.

### 10.5 Partial data — subsidy API failed, eKYC blocks booking
*(today = 13-07-2026)*

> Customer Status: Consumer is Active and eKYC is not valid. Booking Status: The consumer is not eligible to book a refill. eKYC is not valid and must be completed before booking. No previous refill booking is on record. Delivery Status: No delivery is in progress. Payment Status: No refill booking is on record, so no refill payment is due. The retail selling price is ₹968.50. Subsidy Status: Not available.

✅ The failed subsidy API prints `Not available.` — it is never silently omitted (§3.3).

---

## 11. Required prompt-side rules (not the platform's job)

The blob carries raw `03-07-2026` and `₹968.50`. The agents speak Hindi and are banned from reading raw digits aloud. Every receiving prompt therefore gets these six rule blocks:

1. **Section scope.** *"I read ONLY `<my section>` and `Customer Status:`. Even if the consumer asks about another domain and the answer is sitting right there in the text, I do NOT use it. I route instead."*
2. **The system already decided.** *"The sentence is the final, authoritative answer. I READ it and EXPLAIN it. I do not re-derive it and I never contradict it."*
3. **Never calculate.** *"I never add or subtract days, dates or amounts. I never work out a balance or how long ago something happened. If a number is not written there, I do not have it."*
4. **Date format.** *"Every date is DD-MM-YYYY, ALWAYS DAY FIRST. `03-07-2026` is the THIRD of JULY. It is NEVER the seventh of March."*
5. **Never speak raw text.** Convert before speaking: `10-07-2026` → `दस जुलाई दो हज़ार छब्बीस`; `₹968.50` → `नौ सौ अड़सठ रुपये पचास पैसे`. Never speak the raw string, never the ₹ symbol, never quote the blob, never mention that a status record exists.
6. **Missing data + staleness.** *"If a section reads `Not available.`, that data is genuinely unknown to me. I do not guess it, I do not infer it from another section, and I never report it as zero. `{{customerStatus}}` was generated at the start of this session and does not update."*

**Plus one precedence rule**, because `handoffSummary` and the blob can both carry a reason:

> **`handoffSummary` tells me WHAT the consumer asked about. `{{customerStatus}}` tells me the FACTS and the NUMBERS. If they disagree, the blob always wins.**

### 11.1 Logic to DELETE from the prompts

**The 6 receiving agents:**

| Agent | Deleted |
|---|---|
| `paymentAgent` | The `State A/B/C/D/X` classifier (~10 branches); the legitimate-vs-overcharge determination; all subtraction; the `{{_or_}}` broken-data rule → replaced by `Not available.` |
| `subsidyAgent` | The 3-step S1 eligibility chain; the entire opt-out neutrality policy (3 places). **Two new flows added** (§9.2). |
| `bookingNonEligibilityAgent` | The rural/non-rural gap rules; the monthly-limit, annual-limit and closed-connection blocker lines and their FAQ answers (§1.6) |
| `activeDeliveryAgent` | The `BookingClearDate` vs `current_date` comparison |
| `postDeliveryAgent` | The same date comparison |
| `connectionServicesAgent` | The `gapToNextKyc` comparisons |

**Other agents — variable renames and KB removal only (no blob injected):**

| Agent | Change |
|---|---|
| `newConnectionAgent` | `ConDisReturnMsg` → `ConsumerDetailsReturnMsg` |
| `postCallAnalysis` | `updatedAt` → `system.current_date` + `system.current_time` (see §1.7) |
| `Default` | Remove the refill-limits KB line (§1.6) |
| `genericInfoComplaint` | Remove the refill-limits KB line and FAQ answer (§1.6) |
| `subsidyAgent`, `connectionServicesAgent` | Remove `DistLandLineNumber1/2` and `DistEmergenyNumber1/2` from the contact chain |

---

## 12. Open items for the client / platform team

1. **Sign-off on disclosing subsidy opt-out** (§9.2). This is a policy change, not a wording change.
2. **The opt-in / re-enrolment process.** Until the client supplies it, Vaani routes these consumers to the distributor.
3. **Complaint reason enum.** Every subsidy complaint — including the new opt-out dispute — files as `"others"`. Extending the enum would restore reporting granularity.
4. **Confirm the format of `{{system.current_date}}`** (§1.7). It is undefined everywhere in the repo and `postCallAnalysis` now depends on it.
5. **Confirm `postCallAnalysis` runs immediately after the call**, not in a delayed batch (§1.7).
6. **Accept that refill-limit questions now go unanswered** (§1.6).
