# BPCL Contact Center — Conditional Orchestration Workflow

Routing design for the 15 agents in `prompts/`.
**Status: decisions locked.** One field name still outstanding (§7).

---

## 1. The core idea: two layers

**The model decides the *topic*. Code decides the *agent*.**

`Default` listens to the consumer and classifies the query into a coarse topic — booking,
delivery, payment, subsidy. That is all it does. It cannot pick the final agent, because
`Default` is forbidden from calling any lookup tool (`Default.txt:50`) and therefore has no
way to know whether this consumer is eligible to book.

The **Switch Gate** — code inside the `switchagent` handler — takes that topic, reads the
consumer's data, and resolves it into one concrete agent. Every date comparison, every
eligibility rule, and the registration check lives here.

The model is never asked "have 25 days passed?", and the code is never asked "is this
person angry about delivery or about payment?"

**Confirmed:** the `switchagent` handler is ours to write, on the VoiceOwl platform. The
gate is a pure function — `(topic, consumerPayload) → agentName`.

---

## 2. Canonical agent registry

| agentName | Role |
|---|---|
| `Default` | Entry. Greeting, emergency interrupt, triage. Never hangs up. |
| `getConsumerDetails` | Number capture + `bpcl_fetch_all_api`. Gate-recovery only. |
| `routingAgent` | Silent mid-call re-router. |
| `bookingEligibleAgent` | Consumer may book; their booking attempt failed. |
| `bookingNonEligibilityAgent` | Consumer may not book; explain the blocker. |
| `activeDeliveryAgent` | Booking exists, delivery date still ahead. |
| `postDeliveryAgent` | Booking exists, delivery date already passed. |
| `eligibleDeliveryAgent` | No booking on record, consumer may book. |
| `notEligibleDeliveryAgent` | No booking on record and consumer may not book. |
| `paymentAgent` | Payment / refund / overcharge. |
| `subsidyAgent` | Subsidy / DBTL. |
| `connectionServicesAgent` | KYC, address, mobile, name, surrender, portability, PNG. |
| `newConnectionAgent` | New connection / Ujjwala. |
| `emergencyAgent` | Gas hazard. |
| `genericInfoComplaintAgent` | Everything no senior owns. |

Two **virtual** names exist only as gate input — no prompt file, never activated:

- `bookingAgent` → resolves to `bookingEligibleAgent` \| `bookingNonEligibilityAgent`
- `deliveryAgent` → resolves to one of the four delivery agents

`Default` and `routingAgent` emit the virtual name. The gate returns the real one.

### Name bugs to fix
- `Default.txt:113` says `genericInfoComplaintAgent`; `routingAgent.txt:64` says
  `genericInfoComplaint`. Standardise on `genericInfoComplaintAgent`.
- `connectionServicesAgent.txt:237` routes to `refillSupportAgent`, which does not exist.
- `bookingEligibleAgent.txt:1` is titled "(NON-ELIGIBILITY BLOCKER CASE)" but its body is
  the eligible flow.

---

## 3. Session state the gate owns

```
coarseIntent         # what Default/routingAgent last decided
registrationState    # UNKNOWN | REGISTERED | NOT_REGISTERED
consumerPayload      # injected variables, refreshed after bpcl_fetch_all_api
recoveryAttempted    # bool — loop guard, has getConsumerDetails already run?
```

**Confirmed:** the platform already fetches the consumer record at call setup against the
inbound number, and re-injects the `{{RefillStatus*}}` / `{{ConsumerDetails*}}` variables
after `bpcl_fetch_all_api`. The gate reads the injected variables in both cases — it never
makes its own API call.

`recoveryAttempted` is the loop guard. Without it, a consumer whose number returns no data
is bounced into number capture forever.

---

## 4. The Switch Gate

```
function gate(coarseIntent, session):

    # ---- Stage A: bypass ----
    if coarseIntent == EMERGENCY:        return emergencyAgent
    if coarseIntent == NEW_CONNECTION:   return newConnectionAgent

    # ---- Stage B: registration ----
    if not isRegistered(session.consumerPayload):
        if session.recoveryAttempted:
            return NO_DATA_CLOSING          # do not loop
        session.pendingIntent     = coarseIntent
        session.recoveryAttempted = true
        return getConsumerDetails

    session.registrationState = REGISTERED

    # ---- Stage C: leaf resolution ----
    switch coarseIntent:
        BOOKING:             return resolveBooking(session)
        DELIVERY:            return resolveDelivery(session)
        PAYMENT:             return paymentAgent
        SUBSIDY:             return subsidyAgent
        CONNECTION_SERVICES: return connectionServicesAgent
        GENERIC:             return genericInfoComplaintAgent
```

### Stage A — the two agents that skip the gate

**Emergency** skips because a gas leak cannot wait for a database.

**New connection** skips because `newConnectionAgent.txt:434-438` states that
`"Consumer not found"` is the **normal, expected** state for its callers — a
new-connection caller has no connection yet, by definition. Sending them to
`getConsumerDetails` to produce a registered mobile number they do not have would
dead-end the call.

Everything else — including `GENERIC` — goes through the gate. A pure FAQ needs no consumer
record, but `genericInfoComplaintAgent` also registers complaints, and those need identity.
Gating it means complaint registration always works.

### Stage B — the registration check

```
function isRegistered(payload):
    r = payload.refillStatus
    if r.returnCode == 801:                            return false
    if normalize(r.returnMsg) == "consumer not found":  return false
    return true
```

Note what this deliberately does **not** treat as unregistered. `paymentAgent.txt:49` lists
three messages under one "blocked" state:

| Refill status message | What it means | Gate decision |
|---|---|---|
| `Consumer not found` · code `801` | No record at all | → `getConsumerDetails` |
| `Consumer is not active` | On record, connection dormant | **Passes the gate** |
| `Consumer is non domestic` | On record, commercial account | **Passes the gate** |

Only the first is truly unregistered. The other two are consumers we *do* know — asking
them to re-enter their mobile number would change nothing. They pass through, and Stage C
handles them correctly on its own: an inactive consumer fails the `isActive` check and
lands on `bookingNonEligibilityAgent`, which is exactly the agent written to explain a
dormant connection (`bookingNonEligibilityAgent.txt:147`). No special case needed.

---

## 5. getConsumerDetails — the recovery loop

```
Gate: NOT_REGISTERED, remember pendingIntent
            │
            ▼
   Ask for registered mobile number
   validatecontactno
   Read back digit by digit, wait for confirmation
   bpcl_fetch_all_api
            │
   ┌────────┴─────────┐
record found      no record
   │                  │
Variables re-inject   Offer senior team
Re-enter gate at        │
Stage B with       ┌────┴─────┐
pendingIntent    accepts   declines
   │                │          │
   ▼          calltransfer  "Contact your distributor"
Leaf agent,                    callHangup
chosen from real data
```

`bpcl_fetch_all_api` returns the full consumer record — subsidy, booking, refill, payment.
On success the gate re-runs **Stage B and Stage C** against the refreshed variables, so the
leaf agent is chosen from real data rather than from what we guessed before we had it.

> **This is the blocker.** `getConsumerDetails` cannot do this today. Its prompt says in
> three places (lines 4, 11, 114) *"you never hand off to another agent"*, and it has **no
> `switchagent` tool at all** — its only exits are a human transfer or a hangup. It needs
> `switchagent` added plus a `{{pendingAgent}}` variable. Until that is rewritten, the loop
> above cannot close.

---

## 6. Stage C — booking

**Confirmed scope: active + KYC + gap only.** Refill limits are deliberately out of the
gate for phase 1.

```
function isBookingEligible(payload):
    isActive = payload.consumerStatusDesc == "ACTIVE"
    kycValid = monthsBetween(payload.latestKycDate, today) < 9
    gapDays  = payload.distributorCategory == "RURAL" ? 45 : 25
    gapMet   = daysBetween(payload.lastBookDate, today) >= gapDays
    return isActive AND kycValid AND gapMet
```

| Result | Agent |
|---|---|
| eligible | `bookingEligibleAgent` |
| not eligible | `bookingNonEligibilityAgent` + ordered blocker list |

`bookingNonEligibilityAgent` speaks about the **first** blocker on its opening turn and
defers the rest (`bookingNonEligibilityAgent.txt:157`), so the gate hands it an **ordered**
list, not a set:

| Priority | Blocker | Resolution the agent gives |
|---|---|---|
| 1 | Connection inactive | Contact your distributor |
| 2 | KYC overdue (with months elapsed) | Update via distributor or the Hello Bharat Petroleum app |
| 3 | Booking gap not met (with days remaining) | You can book again in N days |

Whatever the blocker, if the consumer insists they need gas *today*, the agent offers the
5 kg Bharat Gas Mini — no gap, no limit, available at any petrol pump. Already in the prompt.

### Two consequences of the phase-1 scope cut

**"Connection closed" is safely dropped.** A closed or surrendered connection will not have
`consumerStatusDesc == "ACTIVE"`, so `isActive` already catches it and routes to the same
agent. No behaviour is lost.

**The refill limits are NOT safely dropped.** A consumer who has already taken 2 refills
this month, or 15 this year, will be judged **eligible** by the predicate above. The gate
will send them to `bookingEligibleAgent`, which will tell them *"आप booking कर सकते हैं"* and
suggest a booking method — and that booking will fail again, for precisely the reason we
chose not to check. The Hindi lines that explain both limits already exist, unused, at
`bookingNonEligibilityAgent.txt:151-153`. **Revisit in phase 2.**

---

## 7. Stage C — delivery

First classify the refill-status message (states already defined in `paymentAgent.txt:45-49`):

| `RefillStatusReturnMsg` | State |
|---|---|
| "No refill found for the consumer", or blank | `NO_BOOKING` |
| "Refill Order Cancelled. Please contact your distributor." | `NO_BOOKING` — see below |
| "Refill Order received Successfully…" / "…planned for Delivery" / "Previous delivery attempt unsuccessful…" / "Refill Order And Payment received Successfully…" | `BOOKED` |

**Cancelled collapses into NO_BOOKING.** Per your answer: a cancelled order is not a
delivery state of its own. There is no live delivery, so the consumer is treated exactly as
if no booking existed — a booking query resolves through `resolveBooking`, a delivery query
through `resolveDelivery`. This removes the awkward fifth branch entirely.

```
function resolveDelivery(payload):
    state = classify(payload.refillStatus.returnMsg)

    if state == BOOKED:
        if payload.bookingClearDate >= today:  return activeDeliveryAgent
        else:                                  return postDeliveryAgent

    # NO_BOOKING (including cancelled)
    if isBookingEligible(payload):             return eligibleDeliveryAgent
    else:                                      return notEligibleDeliveryAgent
```

| State | Condition | Agent | What the consumer hears |
|---|---|---|---|
| `BOOKED` | clear date ≥ today | `activeDeliveryAgent` | Your refill is on its way |
| `BOOKED` | clear date < today | `postDeliveryAgent` | This was delivered — what went wrong? |
| `NO_BOOKING` | eligible | `eligibleDeliveryAgent` | We see no booking — please book a new refill |
| `NO_BOOKING` | not eligible | `notEligibleDeliveryAgent` | No booking, and here is why you cannot book yet |

The active/post split comes from the prompts, not from your description — you said
post-delivery is when the clear date "is already passed" and then "means the date is in
future", which contradict. `activeDeliveryAgent.txt:57` states its clear date is today or
future; `postDeliveryAgent.txt:63` states its clear date is in the past.

> ### The one thing still outstanding
> **Which field in `ConsumerDetails` carries urban vs rural distributor category?** You
> confirmed it lives there, but I need the exact field name and its values (`RURAL` /
> `URBAN`? `R` / `U`?). Until then the 25/45 split cannot be computed and the gate must
> default everyone to 25 days.

---

## 8. Mid-call re-routing

A leaf agent never picks the next agent itself. When the consumer changes subject, the leaf
calls `switchagent(routingAgent)` and nothing else — every leaf prompt already enforces
this (`paymentAgent.txt:66`, `subsidyAgent.txt:176`, and so on).

`routingAgent` re-classifies to a coarse topic and re-enters the same gate. It stays silent
while doing it (Mode A: text = `"."`), so the consumer never hears the hop.

Because `registrationState` is already `REGISTERED` by then, Stage B is a no-op on the
second pass. **Nobody is ever asked for their mobile number twice.**

Hard rules, already in `routingAgent.txt:166`: never route to `Default`, never route to itself.

---

## 9. Emergency overrides everything

A gas hazard detected in **any** agent at **any** moment switches to `emergencyAgent`
immediately, bypassing the gate. `Default.txt:197-205` (INTERRUPT A) already implements the
detection.

While a hazard is live, `emergencyAgent` owns the call absolutely — it never transfers,
never hangs up, never switches. Only once the consumer confirms they are safe, or the alarm
proves false, does it hand back to `routingAgent` (`emergencyAgent.txt:31`), which
re-enters the gate normally.

The *words* "emergency" or "urgent" are not a hazard. A late delivery is not a gas leak.
`Default.txt:201` already gets this right.

---

## 10. Who may end the call

| Agent | `callHangup`? | Condition |
|---|---|---|
| `Default` | **Never** | It has no closing sequence |
| `emergencyAgent` | **Never** | Not while a hazard is live |
| `getConsumerDetails` | Yes | Only after the no-data closing, once transfer is declined |
| `routingAgent` | Yes | Only after the full 3-attempt out-of-scope sequence |
| Every leaf agent | Yes | At close check, once the topic is resolved |

---

## 11. Prompt changes this design requires

Not yet applied — this document is spec-only, per your call.

| File | Change | Why |
|---|---|---|
| `getConsumerDetails` | Add `switchagent` + `{{pendingAgent}}`; delete the three "never hand off" lines | The recovery loop cannot close otherwise. **The blocker.** |
| `Default` | Emit coarse `bookingAgent` / `deliveryAgent` instead of leaf names | It hard-codes `bookingEligibleAgent` and `activeDeliveryAgent` as the *only* booking and delivery destinations, which is why four of the six leaf agents are unreachable today |
| `routingAgent` | Same change to its 9-destination map | Same reason |
| Three files | Fix the name bugs in §2 | So the gate and the prompts agree on agent names |

The leaf agents themselves need **no changes**. They already read what they need from
`{{handoffSummary}}` and the injected variables, and they already route out through
`routingAgent`.

---

## 12. Decision log

| Question | Answer |
|---|---|
| Where does the gate run? | Platform code, inside the `switchagent` handler |
| Is the consumer record fetched at call setup? | Yes, already happens |
| Do variables re-inject after `bpcl_fetch_all_api`? | Yes |
| Rural booking gap | 45 days (urban 25) |
| Urban/rural field | In `ConsumerDetails` — **exact field name still needed** |
| Refill limits + connection-closed in the gate? | No — phase 1 is active + KYC + gap only |
| Cancelled order | Collapses into `NO_BOOKING`; resolves by topic and eligibility |
| Generic info through the gate? | Yes, gated |
| Deliverable | This spec only |
