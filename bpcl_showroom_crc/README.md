# bpcl_showroom_crc (CRC)

The Consumer Relationship Centre channel — Vaani speaks as staff at a **regional head CRC office**
covering many districts and many distributors. 15 agents — the same topology as CC — plus the
post-call analysis prompts.

**Read [CLAUDE.md](CLAUDE.md) before editing anything here** — it is the channel contract. The
shared truth that must stay identical to CC lives in [../CLAUDE.md](../CLAUDE.md).

## What makes this channel different

- **The complaint comes first, then a transfer.** Help → route → register → *only then*, if the
  consumer still wants a person, `calltransfer`. Vaani never volunteers a transfer. **No office
  visit is ever offered** as an escalation.
- **Every routing-capable agent holds `calltransfer` and invokes it itself** (CHANNELS.md XFER-03,
  2026-08-11 — the dedicated `callTransferAgent` was deleted). The transfer turn works exactly like
  `callHangup`: one parameter, `preToolMessage: "आपकी कॉल ट्रांसफर की जा रही है"`, and **no spoken
  text of the agent's own**. The agent then reads the tool's Result — success → silence; failure →
  it says the team could not be reached and stays until the consumer accepts. `Default` and
  `emergencyAgent` still hold no transfer.
- **No phone number is given out.** `{{crcOfficeNumber}}` does not exist in this channel. A consumer
  who asks for one on the failure branch is told there is none. The consumer's own distributor's
  number is unaffected.
- **Callbacks are not scheduled.** A complaint is registered and the team makes contact — no time
  captured, no window promised.
- **Persona.** The CRC is a regional head office, not the consumer's own distributor — the
  distributor is a third party here too, and "अपने distributor से पूछिए" is correct. "हमारे यहाँ"
  refers to this CRC only.
- **Complaint numbers** are spoken as English digit words separated by `" - "` (CHANNELS.md NUM-01).

## Layout

| Path | What it holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The channel contract — escalation, persona, ZIP policy, complaint rules |
| [prompts/](prompts/) | The shipped `.txt` prompts, one folder per agent group |
| [docs/](docs/) | [agent-workflow.md](docs/agent-workflow.md) — the navigation map for all 15 prompts; §11 lists known gaps. §7 links to a `customerStatus-spec.md` that does not exist here |

### prompts/ — folder to agent

The `.txt` files are **what deploys**: hand-edited, no build step, no generation. Folders group
related agents; the **file name** is the agent, not the folder. `agentName` values passed to
`switchagent` must match the canonical registry in [../CLAUDE.md](../CLAUDE.md) §3 exactly.

| Folder | Agents |
|---|---|
| [getConsumerDetails/](prompts/getConsumerDetails/) | `getConsumerDetails` — number capture, entry for unregistered callers |
| [Default/](prompts/Default/) | `Default` — greeting, emergency interrupt, FAQ, triage, routing |
| [routingAgent/](prompts/routingAgent/) | `routingAgent` — silent mid-call re-router |
| [emergencyAgent/](prompts/emergencyAgent/) | `emergencyAgent` — gas hazard, overrides everything |
| [bookingAgent/](prompts/bookingAgent/) | `bookingEligibleAgent`, `bookingNonEligibilityAgent` |
| [deliveryAgent/](prompts/deliveryAgent/) | `activeDeliveryAgent`, `postDeliveryAgent`, `eligibleDeliveryAgent`, `notEligibleDeliveryAgent` |
| [paymentAgent/](prompts/paymentAgent/) | `paymentAgent` — payment, refund, overcharge |
| [subsidyAgent/](prompts/subsidyAgent/) | `subsidyAgent` — subsidy / DBTL / PAHAL |
| [connectionServicesAgent/](prompts/connectionServicesAgent/) | `connectionServicesAgent` — KYC, address, mobile, name, surrender, portability, PNG |
| [newConnectionAgent/](prompts/newConnectionAgent/) | `newConnectionAgent` — **deployed file is the `_onHold` variant**; the original apply journey sits beside it, parked |
| [genericInfoComplaintAgent/](prompts/genericInfoComplaintAgent/) | `genericInfoComplaintAgent` — catch-all: how-to, equipment faults, behaviour complaints |
| [postCallAnalysis/](prompts/postCallAnalysis/) | Not live-call prompts — they run after the call, against the transcript |

Two folders hold a **variant beside the deployed file** (`newConnectionAgent`, whose original apply
journey is parked; `getConsumerDetails`, whose QA prompt exercises the individual lookup tools).
Every file with a twin carries a `STATUS:` marker on line 1 — read it before editing either.

**Topology.** `Default` triages the front of the call. Every specialist is a leaf whose only switch
target is `routingAgent`. Reaching a person is a `calltransfer` tool call, not a switch, so it adds
no hop and no destination. Nothing ever routes back to `Default`.

**Rules that apply to every prompt file here**

- **`calltransfer` is authorized in every routing-capable prompt** — the ten complaint-capable
  leaves, `newConnectionAgent_onHold`, `routingAgent` and `getConsumerDetails`. `Default` and
  `emergencyAgent` still carry an explicit *"NOT AUTHORIZED"* clause.
- **No phone number is offered.** A request for one gets "I don't have a number to give", plus the
  transfer path where it applies. The consumer's own distributor's number is unaffected.
- **The complaint comes first.** Help → route → register → *only then* a transfer, and only if the
  consumer still wants a person. Grievances about something that already happened register directly.
- **The tool call is the action, not the sentence.** A spoken line with no tool call on that same
  turn is a failed turn — recover by invoking the tool before anything else on the next turn.
- **One thing speaks per tool turn.** Hindi line as text, no `preToolMessage` — except `callHangup`.
- **Switching is invisible.** A `switchagent` turn speaks an anchor line about what the agent is
  personally looking at, and never names a team, a department or another agent. The one place
  "transfer" may be said is the `calltransfer` tool's own `preToolMessage`.
- **Voice/TTS:** Hindi only, 1–2 sentences per turn, one question per turn. "भारत पेट्रोलियम" in
  full, never "BPCL". Never say टंकी or जोड़. Never speak a raw digit or a `{{variable}}`.
  Complaint numbers use English digit words separated by `" - "`.
- `bpcl_fetch_all_api` is callable by `getConsumerDetails` and nothing else — every other prompt
  that mentions it does so in a blocker forbidding the call.

**Known naming defects — do not propagate:** this workspace's folder is `genericInfoComplaint/`
while the canonical agent name is `genericInfoComplaintAgent`; `bookingEligibleAgent.txt` is titled
"(NON-ELIGIBILITY BLOCKER CASE)" but holds the eligible flow; `deliveryGenericAgent` and
`refillSupportAgent` are named as routing targets but **do not exist**.

## Sister channel

[`bpcl_contact_center`](../bpcl_contact_center/) — its prompts look almost identical to these and
are **not** interchangeable. A `calltransfer` block has no valid CRC translation; it becomes a
complaint-escalation block. Every intended difference is recorded in [../CHANNELS.md](../CHANNELS.md).
