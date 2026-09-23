# bpcl_contact_center (CC) — channel contract

Central Bharat Petroleum contact centre for the whole state.

Read [../CLAUDE.md](../CLAUDE.md) first — it holds the shared truth that must stay identical to
CRC. This file holds **only what is specific to this channel.**

Sister channel: [`bpcl_showroom_crc`](../bpcl_showroom_crc/CLAUDE.md). Their prompts look almost
identical to these and are **not** interchangeable. Never copy a block across without translating
the two axes below.

---

## Axis 1 — Escalation: `calltransfer` is available here

Vaani can hand the consumer to a human senior team.

**Tool:** `calltransfer`
**Target:** `sip:1001@21112728532045680.zt.plivo.com` — a parameter only, never spoken
**`contactNumber`:** `{{jNationalNumber}}` — never spoken unless the consumer explicitly asks

**When it fires — `Default` STAGE 0 interrupts only:**
- **B** — the consumer explicitly asks for a human, person, senior, or agent
- **C** — the consumer explicitly asks for a language other than Hindi
- **D** — a non-LPG Bharat Petroleum product (petrol, diesel, lubricants, SmartFleet, fuel cards,
  PNG as a product, aviation fuel, industrial fuel)

**When it must not fire:**
- Never blind, never to route a clear LPG topic — that is `switchagent`'s job.
- **Never a proactive offer.** A consumer who is upset, repeating themselves, or still talking is
  not asking for a human. Dissatisfaction and call length are never transfer triggers.
- Never offered for "better help" after a query has been answered or routed.
- A हाँ/जी/बिल्कुल confirming some other factual question is **not** a human request.

**Speech on a transfer turn.** `calltransfer` takes **no** `preToolMessage` — write the warm line
as text: *"बिल्कुल, मैं आपको हमारी team से बात करवाती हूँ।"* Naming the team **is allowed here** —
this is the one exception to the invisible-switching rule, because the consumer is about to hear a
different voice. On `switchagent`, naming it is still forbidden.

**On failure the call ends.** Do not offer a callback after a failed transfer.

## Axis 2 — Persona: Bharat Petroleum central, distributor is a third party

Vaani is a voice agent **for Bharat Petroleum**, not an employee of the distributor.

- ✅ "आपके distributor", "अपने distributor से संपर्क कीजिए" — correct here
- ❌ Insider phrasing — "हमारे यहाँ", "हमारा office", "आप हमारे पास आ सकते हैं". That is CRC's
  voice. It currently appears 0 times in this workspace; keep it that way.
- "senior team" is a real, reachable destination here (125 references) — not a figure of speech.

---

## Channel-specific inventory

**Tools:** `switchagent`, `callhangup`, **`calltransfer`**, `bpcl_create_complaint`,
`validatecontactno`, `bpcl_fetch_all_api`, plus `bpcl_get_subsidy_details`,
`bpcl_get_refill_history`, `bpcl_get_consumer_details`, `bpcl_check_refill_status`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` **and nothing else**. Every other prompt
that mentions it does so in a tool blocker forbidding the call — their data is pre-injected.

**Prompts unique to this channel:** `postCallAnalysis/postCallAnalysis.txt` and
`postCallAnalysisFlat.txt`. No CRC counterpart; whether that is intended is unconfirmed
([../CHANNELS.md](../CHANNELS.md) D-04).

**Docs:** [ORCHESTRATION.md](docs/ORCHESTRATION.md) is the live routing spec — the Switch Gate
design, `(topic, consumerPayload) → agentName`. It is **spec-only and not yet applied to the
prompts**; §11 lists the four prompt changes it requires. Read it before touching `Default`,
`routingAgent`, or `getConsumerDetails`, or you will be editing against a design that is about to
change those files. Also [FLOW.md](docs/FLOW.md), [Flow.mmd](docs/Flow.mmd),
[CUSTOMER_STATUS_SPEC.md](docs/CUSTOMER_STATUS_SPEC.md).

---

## Open items specific to CC

- **The `getConsumerDetails` blocker** ([ORCHESTRATION.md](docs/ORCHESTRATION.md) §5): the recovery
  loop cannot close. The prompt says in three places (lines 4, 11, 114) *"you never hand off to
  another agent"* and has **no `switchagent` tool** — its only exits are a transfer or a hangup.
  It needs `switchagent` plus a `{{pendingAgent}}` variable.
- **Urban/rural field name unknown** (§7). Until supplied, the 25/45-day booking gap cannot be
  computed and the gate defaults everyone to 25 days.
- **Refill limits are out of scope for phase 1** (§6). A consumer who has hit the 2/month or
  15/year limit is judged eligible and sent to `bookingEligibleAgent`, which tells them they can
  book — and the booking fails again. The Hindi lines explaining both limits already exist, unused,
  at `bookingNonEligibilityAgent.txt:151-153`.
- **Name defects** NAME-01 → NAME-04 in [../CHANNELS.md](../CHANNELS.md) §3 apply here.

---

## Before you edit

1. Never create `.bak` copies of prompt files. Edit in place.
2. Ask: is this change **shared truth** or **CC policy**? Shared truth lands in CRC too, this
   session. CC policy gets a row in [../CHANNELS.md](../CHANNELS.md).
3. If you are porting from CRC, translate the axes: an office-visit block becomes a `calltransfer`
   block only if it is a genuine STAGE 0 interrupt — otherwise it stays inline. Insider phrasing
   becomes third-party phrasing.
