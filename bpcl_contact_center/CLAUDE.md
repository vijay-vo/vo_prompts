# bpcl_contact_center (CC) — channel contract

Bharat Petroleum's **national head office** contact centre, Mumbai — serving LPG consumers
across India, in whatever Indian language they speak.

Read [../CLAUDE.md](../CLAUDE.md) first — it holds the shared truth that must stay identical to
CRC. This file holds **only what is specific to this channel.**

Sister channel: [`bpcl_showroom_crc`](../bpcl_showroom_crc/CLAUDE.md). Their prompts look almost
identical to these and are **not** interchangeable. Never copy a block across without translating
the two axes below.

---

## Axis 1 — Escalation: `calltransfer`, held by every routing-capable agent

Vaani can hand the consumer to a human senior team. **Rewritten 2026-08-27** — the old text on
this page claimed transfer was a `Default` STAGE 0 interrupt only. That was never true of the
prompts, and is doubly untrue now.

**Tool:** `calltransfer`, held and invoked by the agent the consumer is already speaking to.
There is no transfer agent and nothing to switch to.

**Parameters:** `preToolMessage` and **nothing else** (CHANNELS.md XFER-06). The platform supplies
the forwarding target itself. The old `forwardingNumber` SIP string, `contactNumber`,
`consumerLanguage` and `consumerQuery` are gone from every prompt.

**Speech on a transfer turn.** The agent writes **NO text of its own**. The `preToolMessage`
carries the whole spoken line and is the only thing the consumer hears — exactly how `callhangup`
works. Writing the line as text *as well* is the double-speak bug this rule exists to prevent.
Naming the team is permitted inside that `preToolMessage` only, because the consumer is about to
hear a different voice. On `switchagent`, naming it is still forbidden.

**A complaint comes first.** A consumer asking for a human gets their issue **registered** first,
and is transferred only if they still want a person afterwards. Same as CRC.

**One attempt per CALL — never a second.** The spent attempt belongs to the call, not the agent:
it survives a `switchagent`, as does a failed `bpcl_create_complaint` (XFER-05, CPL-20).

**When it must not fire:**
- Never blind, never to route a clear LPG topic — that is `switchagent`'s job.
- **Never a proactive offer.** A consumer who is upset, repeating themselves, or still talking is
  not asking for a human. Dissatisfaction and call length are never transfer triggers.
- Never offered for "better help" after a query has been answered or routed.
- A हाँ/जी/बिल्कुल confirming some other factual question is **not** a human request.

**On failure**, the agent speaks the failure line and the window the Result carried. **There are
no callbacks in this channel** — retired 2026-08-27 (CHANNELS.md CB-01).

## Axis 1b — Language

**Any Indian language the consumer speaks** (CHANNELS.md MULT-01). CC is no longer Hindi-only, so
a request for another language is **not** a transfer trigger — Vaani simply answers in it.

## Axis 1c — The head office address

Fixed KB wording in 13 agents, **not a variable**. CC has no equivalent of `{{crcOfficeCity}}` /
`{{crcOfficeAddress}}`.
- "Where are you calling from?" → **"Bharat Petroleum, Mumbai Headquarters office"**
- Asked for the address itself → Bharat Bhavan, Four and six Currimbhoy Road, Ballard Estate,
  Mumbai. Pin code only on request, then digit by digit.
- **Address only — no phone number.** The "I hold no number, you get a transfer" rule stands.
- **Never offered as somewhere to travel to.** Callers are nationwide; a trip to Mumbai solves
  nothing.
- `emergencyAgent` does not carry this block, matching CRC.


## Axis 2 — Persona: Bharat Petroleum central, distributor is a third party

Vaani is a voice agent **for Bharat Petroleum**, speaking from the **national head office**
in Mumbai, not an employee of the distributor.

- ✅ "आपके distributor", "अपने distributor से संपर्क कीजिए" — correct here
- ❌ Insider phrasing — "हमारे यहाँ", "हमारा office", "आप हमारे पास आ सकते हैं". That is CRC's
  voice. It currently appears 0 times in this workspace; keep it that way.
- "senior team" is a real, reachable destination here (159 references) — not a figure of speech.

---

## Channel-specific inventory

**Tools:** `switchagent`, `callhangup`, **`calltransfer`** (`preToolMessage` only),
`bpcl_create_complaint`,
`validatecontactno`, `bpcl_fetch_all_api`, plus `bpcl_get_subsidy_details`,
`bpcl_get_refill_history`, `bpcl_get_consumer_details`, `bpcl_check_refill_status`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` **and nothing else**. Every other prompt
that mentions it does so in a tool blocker forbidding the call — their data is pre-injected.

**Prompts unique to this channel:** `postCallAnalysis/postCallAnalysis.txt` only —
`postCallAnalysisFlat.txt` now has a CRC twin and was derived from it (2026-08-27).
⚠️ `postCallAnalysis.txt` was **deliberately left untouched** by the CC-port pass and still scores
scheduled callbacks, which no longer exist in this channel (CB-01). Confirm whether it is still
deployed before trusting its output.

**Docs:** [ORCHESTRATION.md](docs/ORCHESTRATION.md) is the live routing spec — the Switch Gate
design, `(topic, consumerPayload) → agentName`. It is **spec-only and not yet applied to the
prompts**; §11 lists the four prompt changes it requires. Read it before touching `Default`,
`routingAgent`, or `getConsumerDetails`, or you will be editing against a design that is about to
change those files. Also [FLOW.md](docs/FLOW.md), [Flow.mmd](docs/Flow.mmd),
[CUSTOMER_STATUS_SPEC.md](docs/CUSTOMER_STATUS_SPEC.md).

---

## Open items specific to CC

- ~~**The `getConsumerDetails` blocker**~~ — **CLOSED 2026-08-27.** The agent was derived from
  its CRC twin and now holds `switchagent`, so the recovery loop has a real exit. The old text
  ("you never hand off to another agent", no `switchagent` tool) is gone with the old file.
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
   block only where escalation is genuinely warranted — otherwise it stays inline. Insider phrasing
   becomes third-party phrasing.

---

## Open platform dependencies (created by the CC-port pass, 2026-08-27)

1. **`calltransfer` must resolve its own forwarding target.** Every CC prompt now passes
   `preToolMessage` alone. If the CC platform does not supply the SIP target the way CRC's does,
   **every transfer in this channel fails silently** — the prompts will be correct and the calls
   will still drop. Test one transfer before wide deployment.
2. **`{{crcHolidayList}}` is still named in `Default.txt` and `genericInfoComplaintAgent.txt`.**
   It came across with the derivation and is a CRC-branded variable. If CC does not inject it, the
   prompts see curly braces, treat the value as absent, and fall back to "I cannot confirm that
   holiday" — safe, but degraded. Decide whether CC gets a holiday calendar and under what name.
