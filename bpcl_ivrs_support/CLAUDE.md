# bpcl_ivrs_support (IVRS) — channel contract

Bharat Petroleum's **IVRS self-service line** — serving LPG consumers across India, in whatever
Indian language they speak.

**Created 2026-08-31 as a copy of [`bpcl_contact_center`](../bpcl_contact_center/CLAUDE.md), with
exactly one policy difference: there is NO human transfer.** Everything else — the 15-agent
topology, the handoff contract, the LPG domain facts, the multilingual rule, the head office
address, the complaint discipline — is identical to CC and must not diverge. See
[../CHANNELS.md](../CHANNELS.md) IVRS-01.

Read [../CLAUDE.md](../CLAUDE.md) first — it holds the shared truth that must stay identical across
all three channels. This file holds **only what is specific to this channel.**

Sister channels: [`bpcl_contact_center`](../bpcl_contact_center/CLAUDE.md) — this channel's parent,
identical except for the transfer — and [`bpcl_showroom_crc`](../bpcl_showroom_crc/CLAUDE.md).
All three look almost identical and are **not** interchangeable.

**Porting rule for this channel:** a fix landing in CC lands here too, in the same session, UNLESS
it touches escalation. Anything that offers, mentions, or implies a human handover has no valid
IVRS translation — it becomes a complaint, or it is dropped.

---

## Axis 1 — Escalation: there is NO transfer. The registered complaint IS the escalation

**This is the only thing that makes this channel different from CC.**

No agent holds `calltransfer`. There is no transfer agent, no senior team a consumer can be put
through to, no queue, and no phone number. A consumer cannot reach a person from this call.

**What happens when the consumer asks for a person**, in this order:
1. Resolve it from own data and knowledge, per the `RESOLUTION LADDER`.
2. If it belongs to another domain, route to `routingAgent`. Out of scope is never an escalation.
3. Otherwise register a complaint per `COMPLAINT PROTOCOL`, speak the number, and say the team
   will make contact.

**Step 3 IS the escalation, and it is delivered as an answer, not a refusal.** A consumer asking
for a person is asking for their problem to reach a human who can act on it; a registered
complaint is exactly that.

**Never said, in any language, on any turn:** transferring, connecting, putting through, handing
to a team / senior / specialist / department / desk; someone will call back; call another number;
visit an office. Each is a promise this channel cannot keep.

**When the complaint tool itself fails**, there is genuinely nothing left. Speak the technical
failure line once, ask them to call again later, and close after they respond. No transfer to fall
back on, no callback, no number, no offer to note details down.

Every agent carries the shared `NO HUMAN TRANSFER IN THIS CHANNEL` block (13 agents; `emergencyAgent`
and `routingAgent` do not need it). It replaced CC's `SENIOR TEAM TRANSFER` block one-for-one.

## Axis 1b — Language

**Any Indian language the consumer speaks.** Identical to CC.

## Axis 1c — The head office address

Identical to CC — fixed KB wording, not a variable. "Bharat Petroleum, Mumbai Headquarters office";
full address on request; **address only, no phone number**; never offered as somewhere to travel to.
That last rule matters more here than in CC: with no transfer, the address is the only concrete
thing Vaani holds, and it must not become a substitute escalation.

## Axis 2 — Persona: Bharat Petroleum central, distributor is a third party

Vaani is a voice agent **for Bharat Petroleum**, speaking from the **national head office**
in Mumbai, not an employee of the distributor.

- ✅ "आपके distributor", "अपने distributor से संपर्क कीजिए" — correct here
- ❌ Insider phrasing — "हमारे यहाँ", "हमारा office", "आप हमारे पास आ सकते हैं". That is CRC's
  voice. It currently appears 0 times in this workspace; keep it that way.
- ❌ "senior team" is **not** a reachable destination here. It exists in the prompts only inside
  prohibitions and recognition lists — never as somewhere a consumer can be sent.

---

## Channel-specific inventory

**Tools:** `switchagent`, `callHangup`, `bpcl_create_complaint`,
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

1. ~~`calltransfer` forwarding target~~ — **N/A in this channel.** No agent holds the tool.
   `calltransfer` must be **de-registered on the platform for IVRS**, so a model that hallucinates
   the name cannot invoke anything.
2. **`{{crcHolidayList}}` is still named in `Default.txt` and `genericInfoComplaintAgent.txt`.**
   It came across with the derivation and is a CRC-branded variable. If CC does not inject it, the
   prompts see curly braces, treat the value as absent, and fall back to "I cannot confirm that
   holiday" — safe, but degraded. Decide whether CC gets a holiday calendar and under what name.
