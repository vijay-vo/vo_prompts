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

## Axis 1 — Escalation: no transfer. Register the complaint, and say plainly you cannot connect them

**This is the only thing that makes this channel different from CC.**

No agent holds `calltransfer`. There is no transfer agent, no senior team a consumer can be put
through to, no queue, and no phone number.

**When the consumer asks for a person, the answer has two halves and both are said in the same
turn:**
1. **That Vaani has no option to connect them to a senior team** — plainly and warmly.
2. **What is actually happening** — the complaint is registered, or is registered now per
   `COMPLAINT PROTOCOL`, it has a number, and the team will contact them.

**Half an answer is the bug.** Saying only "I can't connect you" leaves the consumer with nothing.
Offering only the complaint without answering the question they actually asked leaves them asking
again — and again — because nobody answered them. That circling is the failure mode this policy
exists to prevent, and it is what an earlier draft of this channel got wrong.

**Vaani MAY say she cannot connect them.** This is the one place the meaning "connect you to a
senior team" is permitted, precisely because she is denying it. The invisible-switching ban is
unchanged everywhere else: on a `switchagent` turn she never reveals a switch, a team, or another
agent.

**Never:** promise a callback or a time, give a phone number, send them to an office, or say
someone will call back. The only future contact promised is the team acting on a registered
complaint.

**When the complaint tool itself fails** there is nothing left: the technical-failure line once,
tell them there is no way to connect them to anyone, ask them to call again later, close after they
respond.

Carried by the 11 agents that can register or route; `emergencyAgent`, `routingAgent`,
`getConsumerDetails` and `Default` reference it rather than repeating it.

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

**Tools:** `switchagent`, `callhangup`, `bpcl_create_complaint`,
`validatecontactno`, `bpcl_fetch_all_api`, plus `bpcl_get_subsidy_details`,
`bpcl_get_refill_history`, `bpcl_get_consumer_details`, `bpcl_check_refill_status`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` **and nothing else**. Every other prompt
that mentions it does so in a tool blocker forbidding the call — their data is pre-injected.

**Post-call set (aligned to CRC 2026-09-23):** `postCallAnalysisFlat.txt` and `vaaniQA.txt`, and
those two only. `postCallAnalysis.txt` was **deleted** — it still scored scheduled callbacks, which
do not exist in this channel (CB-01). `promptQA.txt` was **renamed to `vaaniQA.txt`** to match the
CRC filename; its content is unchanged apart from the channel label, the removal of a leftover
"call transfer path" header that contradicted this channel, and a hard-coded Hindi failure line
replaced with a language-neutral one. CRC's `postCallAnalysisHuman.txt` is deliberately **not**
ported here.

**Docs:** [ORCHESTRATION.md](docs/ORCHESTRATION.md) is the live routing spec — the Switch Gate
design, `(topic, consumerPayload) → agentName`. It is **spec-only and not yet applied to the
prompts**; §11 lists the four prompt changes it requires. Read it before touching `Default`,
`routingAgent`, or `getConsumerDetails`, or you will be editing against a design that is about to
change those files. Also [FLOW.md](docs/FLOW.md), [Flow.mmd](docs/Flow.mmd),
[CUSTOMER_STATUS_SPEC.md](docs/CUSTOMER_STATUS_SPEC.md).

---

## Open items specific to this channel

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
3. If you are porting from CRC, translate **three** axes, not one:
   - **Escalation.** CRC's `calltransfer` / `SENIOR TEAM TRANSFER` / T1–T4 blocks have NO IVRS
     translation. They become a registered complaint plus the honest two-half answer (Axis 1), or
     they are dropped. Never leave a dangling reference to a transfer section you deleted.
   - **Identity.** CRC's `{{crcOfficeCity}}` / `{{crcOfficeAddress}}` do not exist here. This is
     the Bharat Petroleum, Mumbai Headquarters office, and its address is fixed knowledge, not
     injected data. Insider phrasing becomes third-party phrasing.
   - **Language.** CRC is Hindi with a fixed Devanagari script rule. IVRS speaks whichever Indian
     language the consumer speaks. Every hard-coded Hindi line becomes a meaning anchor, and a
     fixed closing string becomes a `preToolMessage` composed in the call's language.

---

## Open platform dependencies (created by the CC-port pass, 2026-08-27)

1. ~~`calltransfer` forwarding target~~ — **N/A in this channel.** No agent holds the tool.
   `calltransfer` must be **de-registered on the platform for IVRS**, so a model that hallucinates
   the name cannot invoke anything.
2. **`{{crcHolidayList}}` is still named in `Default.txt` and `genericInfoComplaintAgent.txt`.**
   It came across with the derivation and is a CRC-branded variable. If CC does not inject it, the
   prompts see curly braces, treat the value as absent, and fall back to "I cannot confirm that
   holiday" — safe, but degraded. Decide whether CC gets a holiday calendar and under what name.
