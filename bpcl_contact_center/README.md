# bpcl_contact_center (CC)

Central Bharat Petroleum contact centre for the whole state. 15 agents, plus the post-call
analysis prompts.

**Read [CLAUDE.md](CLAUDE.md) before editing anything here** — it is the channel contract. The
shared truth that must stay identical to CRC lives in [../CLAUDE.md](../CLAUDE.md).

## What makes this channel different

- **Escalation is `calltransfer`.** Vaani can hand the consumer to a human senior team, inline in
  ten agents. It fires only on `Default` STAGE 0 interrupts: an explicit request for a person, a
  request for a language other than Hindi, or a non-LPG Bharat Petroleum product. Never blind,
  never proactively offered, never as a route for a clear LPG topic.
- **Callbacks are scheduled.** After a *failed* transfer only — a slot between 9am and 5pm within
  15 days, written into the complaint. No complaint number is spoken on a callback complaint.
- **Persona: Bharat Petroleum central.** The distributor is a third party — "आपके distributor".
  Insider phrasing ("हमारे यहाँ", "हमारा office") is CRC's voice and must not appear here.

## Layout

| Path | What it holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The channel contract — escalation, persona, tool inventory, open items |
| [prompts/](prompts/) | The shipped `.txt` prompts, one folder per agent group |
| [docs/](docs/) | [ORCHESTRATION.md](docs/ORCHESTRATION.md) (routing spec, spec-only — not yet applied to the prompts), [FLOW.md](docs/FLOW.md), [Flow.mmd](docs/Flow.mmd), [CUSTOMER_STATUS_SPEC.md](docs/CUSTOMER_STATUS_SPEC.md) |

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
| [newConnectionAgent/](prompts/newConnectionAgent/) | `newConnectionAgent` — new connection / Ujjwala / PMUY |
| [genericInfoComplaintAgent/](prompts/genericInfoComplaintAgent/) | `genericInfoComplaintAgent` — catch-all |
| [postCallAnalysis/](prompts/postCallAnalysis/) | Not live-call prompts — they run after the call, against the transcript. On an AI call: `postCallAnalysisFlat.txt` first, then `promptQA.txt` |

**Topology.** `Default` triages the front of the call. Every specialist is a leaf whose only switch
target is `routingAgent`. No leaf switches to another leaf, and **nothing ever routes back to
`Default`**.

**Rules that apply to every prompt file here**

- **The tool call is the action, not the sentence.** Speaking a registering line registers nothing.
  A spoken line with no tool call on that same turn is a failed turn.
- **One thing speaks per tool turn.** Write the Hindi line as text and pass no `preToolMessage` —
  except `callHangup`, which carries the closing line in `preToolMessage` and generates no text.
- **Switching is invisible.** Never reveal that other agents, teams or systems exist. The one
  exception in this channel is `calltransfer`, where naming the team is allowed because the
  consumer is about to hear a different voice.
- **Voice/TTS:** Hindi only, 1–2 sentences per turn, one question per turn. "भारत पेट्रोलियम" in
  full, never "BPCL". Never say टंकी or जोड़. Never speak a raw digit or a `{{variable}}`.
  Complaint numbers are spoken in Hindi digit words here.
- `bpcl_fetch_all_api` is callable by `getConsumerDetails` and nothing else — every other prompt
  that mentions it does so in a blocker forbidding the call.

**Known naming defects — do not propagate:** `bookingEligibleAgent.txt` is titled "(NON-ELIGIBILITY
BLOCKER CASE)" but holds the eligible flow; `deliveryGenericAgent` and `refillSupportAgent` are
named as routing targets in several prompts but **do not exist**.

## Sister channel

[`bpcl_showroom_crc`](../bpcl_showroom_crc/) — its prompts look almost identical to these and are
**not** interchangeable. Never copy a block across without translating the escalation and persona
axes. Every intended difference is recorded in [../CHANNELS.md](../CHANNELS.md).
