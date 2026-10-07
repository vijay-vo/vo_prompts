# bpcl_ivrs_support

**IVRS self-service line.** A copy of `bpcl_contact_center` with one difference: **no human transfer.**
A consumer who wants a person gets a registered complaint — that is the escalation, and nothing follows it.

See [CLAUDE.md](CLAUDE.md) for the channel contract and [../CHANNELS.md](../CHANNELS.md) IVRS-01 for the ledger row.


Central Bharat Petroleum contact centre for the whole state. 15 agents, plus the post-call
analysis prompts.

**Read [CLAUDE.md](CLAUDE.md) before editing anything here** — it is the channel contract. The
shared truth that must stay identical across all three channels lives in [../CLAUDE.md](../CLAUDE.md).

## What makes this channel different

- **There is NO `calltransfer` and NO escalation to a person.** No agent in this channel holds the
  tool. There is no senior team a consumer can be put through to and no number any agent may give.
  When a consumer asks for a person, the correct turn has two halves and a missing half is a
  defect: (a) that Vaani has no option to connect them, said plainly and warmly, and (b) what IS
  happening for them — a registered complaint, its number, and that our team will make contact.
  `calltransfer` must be **de-registered on the platform for IVRS**.
- **Escalation is a registered complaint, and there is nothing after it.** No transfer, no
  callback, no office visit. `bpcl_create_complaint` is the only escalation any agent holds, and
  `Default`, `emergencyAgent`, `newConnectionAgent_onHold` and `getConsumerDetails` hold not even
  that.
- **No callbacks are scheduled.** This channel schedules none. A consumer asking to be called back
  is asking to reach a person, and is answered the same way — honestly, plus the complaint.
- **Persona: Bharat Petroleum central.** This is the national head office in Mumbai, so the
  distributor is a third party and saying so is correct and expected — it always means a PHONE
  enquiry, never a journey. Insider phrasing that implies the consumer's own local office is CRC's
  voice and must not appear here. No agent ever sends a consumer to an office to resolve a problem;
  the only two carve-outs are physical actions at their own distributor's counter — buying a
  hotplate/stove and submitting K Y C documents.

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
| [getConsumerDetails/](prompts/getConsumerDetails/) | `getConsumerDetails.txt` — the one number-capture prompt (renamed from `getConsumerDetailsLive.txt`; the old `getConsumerDetails.txt` and the `-unreg` pointer were deleted 2026-10-01, GCD-LOOP-01) |
| [Default/](prompts/Default/) | `Default` — greeting, emergency interrupt, FAQ, triage, routing |
| [routingAgent/](prompts/routingAgent/) | `routingAgent` — silent mid-call re-router |
| [emergencyAgent/](prompts/emergencyAgent/) | `emergencyAgent` — gas hazard, overrides everything |
| [bookingAgent/](prompts/bookingAgent/) | `bookingEligibleAgent`, `bookingNonEligibilityAgent` |
| [deliveryAgent/](prompts/deliveryAgent/) | `activeDeliveryAgent`, `postDeliveryAgent`, `eligibleDeliveryAgent`, `notEligibleDeliveryAgent` |
| [paymentAgent/](prompts/paymentAgent/) | `paymentAgent` — payment, refund, overcharge |
| [subsidyAgent/](prompts/subsidyAgent/) | `subsidyAgent` — subsidy / DBTL / PAHAL |
| [connectionServicesAgent/](prompts/connectionServicesAgent/) | `connectionServicesAgent` — KYC, address, mobile, name, surrender, portability, PNG |
| [newConnectionAgent/](prompts/newConnectionAgent/) | `newConnectionAgent_onHold` — **the LIVE prompt**, the 14.2 kg hold. `newConnectionAgent.txt` is **PARKED — do not ship**: it is the full journey, retained for restoration, and still carries Hindi/CRC/transfer conversion debt (see its header) |
| [genericInfoComplaintAgent/](prompts/genericInfoComplaintAgent/) | `genericInfoComplaintAgent` — catch-all |
| [unregisteredComplaintAgent/](prompts/unregisteredComplaintAgent/) | `unregisteredComplaintAgent` — activated by the platform when identification found no record; holds the KB, the unregistered-complaint tools and `bpcl_complaint_status`, and `switchagent` to `routingAgent` only; no transfer |
| [postCallAnalysis/](prompts/postCallAnalysis/) | Not live-call prompts — they run after the call, against the transcript. On an AI call: `postCallAnalysisFlat.txt` first, then `vaaniQA.txt` |

**Topology.** `Default` triages the front of the call. Every specialist is a leaf whose only switch
target is `routingAgent`. No leaf switches to another leaf, and **nothing ever routes back to
`Default`**.

**Rules that apply to every prompt file here**

- **The tool call is the action, not the sentence.** Speaking a registering line registers nothing.
  A spoken line with no tool call on that same turn is a failed turn.
- **One thing speaks per tool turn.** Write the spoken line, in the consumer's language, as text
  and pass no `preToolMessage` — except `callhangup`, which carries the closing line in
  `preToolMessage`, composed in the consumer's language, and generates no text of its own.
- **Switching is invisible.** Never reveal that other agents, teams or systems exist. The one
  exception in this channel is saying that a consumer CANNOT be connected to a senior team — the
  meaning is permitted there only in order to refuse it honestly.
- **Voice/TTS:** Consumer's Indian language, 1–2 sentences per turn, one question per turn. "भारत पेट्रोलियम" in
  full, transliterated into the call's own script, never "BPCL". Never speak a raw digit or a
  `{{variable}}`. Every long number — complaint numbers included — is spoken digit by digit in the
  digit words of the language the consumer is speaking, one language per number, never mixed.
- `bpcl_fetch_all_api` is callable by `getConsumerDetails` and nothing else — every other prompt
  that mentions it does so in a blocker forbidding the call.

**Known naming defects — do not propagate:** `bookingEligibleAgent.txt` is titled "(NON-ELIGIBILITY
BLOCKER CASE)" but holds the eligible flow; `deliveryGenericAgent` and `refillSupportAgent` are
named as routing targets in several prompts but **do not exist**.

## Sister channel

[`bpcl_showroom_crc`](../bpcl_showroom_crc/) — its prompts look almost identical to these and are
**not** interchangeable. Never copy a block across without translating the escalation and persona
axes. Every intended difference is recorded in [../CHANNELS.md](../CHANNELS.md).
