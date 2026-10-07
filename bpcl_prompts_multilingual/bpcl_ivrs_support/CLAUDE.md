# bpcl_ivrs_support (IVRS) — channel contract

Bharat Petroleum's **IVRS support line**. Calls come in from the IVRS, and Vaani answers from the
Bharat Petroleum Mumbai Headquarters office. It serves LPG consumers across India, in whatever
Indian language they speak, and callers ask about any LPG topic.

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
`bpcl_complaint_status` (CST-PORT-01), `bpcl_create_unregistered_complaint`, `updateContact`,
`get_pincode_data`, `validatecontactno`, `bpcl_fetch_all_api`, plus `bpcl_get_subsidy_details`,
`bpcl_get_refill_history`, `bpcl_get_consumer_details`, `bpcl_check_refill_status`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` **and nothing else**. Every other prompt
that mentions it does so in a tool blocker forbidding the call — their data is pre-injected.

## IVRS is derived from current CRC, in the "You" persona (2026-09-29)

Since CHANNELS.md **IVRS-SYNC-01**, every IVRS agent carries the instructions and methods of the
current `bpcl_prompts/bpcl_showroom_crc` prompts on `main`, translated only on the channel axes
(language, HQ identity, no transfer, own-language digits, callhangup with no parameters) and with
IVRS's Lite zip design kept. **When CRC changes, port the change here** the same way. **Every
agent prompt is written in the "You" persona** — never "I" — even where CRC's source is in "I".

## Tool calling follows TOOL_CALLING.md (2026-09-29)

**The reference for HOW every tool is called is `bpcl_prompts/TOOL_CALLING.md` on `main`** — the
method the client confirmed working on Hindi CRC on 2026-09-29 (CPL-27, NUM-08). Ported here as
[TOOL-PORT-01](../CHANNELS.md). Every tool edit in this channel aligns with it; if tool calling
breaks, start at its §4 checklist. What it means here:
- **An action tool is not announced.** The complaint turn (either complaint tool, and
  `updateContact` / `get_pincode_data`) is the call alone. The empathy rule says outright that a
  complaint about to be registered is never the "next step" a warm sentence carries.
- **No scripted outcome lines.** No success line, no "four-beat" line, no "two turns" block: the
  outcome is whatever the tool's message says, in the consumer's language.
- **`callhangup` takes no parameters.** The closing line is the agent's own text with the call on
  the same turn — never in a `preToolMessage`, and no other key.
- **`bpcl_create_complaint` carries exactly `complaintSummary` + `complaintReason`**, stated as a
  closed set in every COMPLAINT TOOL block; `bpcl_create_unregistered_complaint` adds only
  `ConsumerDetailsConsumerName`. The platform schemas match these keys (client, 2026-09-29).
- **No backticks** in a live prompt; the line-1 directive keeps the tool name without them.
- **The complaint number** is all its digits in one turn, one digit word at a time in the
  consumer's language with `" - "` between them, never a whole number and never an amount (NUM-08,
  with IVRS's own-language digits kept — CRC uses English digit words).

## The complaint method is CRC's, not the old IVRS one (2026-09-24)

**TOOL_CALLING.md above supersedes this section wherever they differ.** The elaborate method IVRS inherited — a spoken registering line, a wait cue, a fixed
`preToolMessage` carrying "I am registering your complaint", and the agent composing its own
success and failure lines after deciding the outcome by looking for a number in the Result — is
**retired**. Do not reintroduce any part of it.

**What replaces it, in every agent that registers:**
- **The registering turn is the call and nothing else.** No text, no acknowledgement, no wait
  cue, no `preToolMessage`. Everything the agent wants to say — the empathy, the reason, the
  outcome — goes on the NEXT turn.
- **The tool returns a message, and that message is the only source of truth**: whether it
  registered, the complaint number, and what to tell the consumer. The agent does what the
  message says, in its own natural words in the call's language, never reading its English aloud.
  *IVRS carve-out:* if the message says to offer a transfer, the agent does not — there is none
  here. It says so honestly and stays with the consumer.
- **No message, no complaint.** Once per issue; if any message reported failure, no further call
  for any issue; never more than two calls per call.
- **`callhangup` follows the same shape** — the closing line is the agent's **own text** on that
  turn, no `preToolMessage`. **No tool in this channel takes a `preToolMessage`** any more, with
  one exception: a `switchagent` retry after a platform failure.

**`unregisteredComplaintAgent`** runs the `bpcl_lite_zip` desk's order — name → `updateContact` →
PIN code → `get_pincode_data` → district → `bpcl_create_unregistered_complaint`, each step its own
turn — but each of the three tool turns is the call alone, with no spoken line (2026-09-24, and
TOOL-PORT-01). Hindi CRC ported this agent from here (UNREG-03).

**Two complaint tools, split by whether we hold a record** (2026-09-24), and **one parameter
vocabulary across both**: `complaintSummary` and `complaintReason`. The old `feedbackDescription`
and `reason` names are **gone from this channel** — renamed across all ten registered-consumer
agents in the same pass, to match [`bpcl_prompts_hindi`](../../bpcl_prompts_hindi/CLAUDE.md), which
is the reference for this contract. Do not reintroduce them.

- **REGISTERED consumer** → the agent that owns the problem registers it itself, on
  `bpcl_create_complaint`, passing **exactly two** parameters: `complaintSummary` (one or two lines
  of English, only what the consumer said) and `complaintReason` (the exact matching phrase from
  that agent's own domain list, or `others`). Everything else — consumer id, mobile, name, state,
  district, date — is the platform's. No PIN code step.
- **UNREGISTERED consumer** → `unregisteredComplaintAgent`, the only holder of
  `bpcl_create_unregistered_complaint`, which runs a fixed three-tool chain: confirmed name →
  `updateContact` → PIN code → `get_pincode_data` → confirmed district →
  `bpcl_create_unregistered_complaint`, passing `ConsumerDetailsConsumerName` + `complaintSummary` +
  `complaintReason`. Its `complaintReason` is copied character for character from a nine-value
  backend list. No other agent may call any of those three tools.

## Bharat Gas Lite zip — `newConnectionAgent` owns it (2026-09-24)

`newConnectionAgent` (`newConnectionAgent_onHold.txt`) is the **Bharat Gas Lite zip specialist**, and
that is now the larger half of its job. Lite zip is the default for anyone asking for gas, a
cylinder or a connection; the 14.2 kg closure is a **reactive** block that never opens a call and
never travels without the lite zip pivot. It owns the product facts, the Q&A-versus-guided mode
gate, the twelve-state Hello BPCL App flow, the dead ends, and the complaint gate.

**The fact set is `bpcl_lite_zip`'s, and it overrides everything older:** two sizes, 10 kg and 5 kg;
**never** a price; **never** a four-hour promise — same day for a daytime order, next day 8am–8pm
for an evening or night one; App-only booking; domestic, commercial and industrial; documents shown
at delivery, never uploaded; no eligibility check; new connection versus refill decided by one
question; no subsidy, stated plainly; availability and stock never claimed and a PIN code never
asked for. `zip` is always **lowercase** — capitals make TTS spell it out.

**Routing.** `Default` and the specialists keep their existing routes untouched; only a clear intent
to take, refill or be guided through lite zip goes to `newConnectionAgent`. Other specialists keep
their short lite zip KB, answer from it, and hold the call — a passing mention is never a handover.
Mini is named only when the consumer asks. `genericInfoComplaintAgent` no longer owns "how to get
one". `routingAgent` **cannot** route to `unregisteredComplaintAgent` — it cannot see registration
state — and that agent reaches `routingAgent` only on the way back out.

**Greeting (IVRS-GREET-01, 2026-09-29).** `Default` opens with a neutral fixed line that names no product:
"नमस्ते, मेरा नाम वाणी है। मैं आपकी किस प्रकार सहायता कर सकती हूँ?" It is usually configured as the
platform's first message, and it is the one turn not in the consumer's language, because they have
not spoken yet. This line takes calls about any LPG topic. Lite zip is no longer the majority of its
calls, so the greeting no longer opens on it. Lite zip ownership (above) is unchanged: it is still
what Vaani offers when a consumer cannot get gas. The Lite zip greeting now belongs to
[`bpcl_lite_zip`](../bpcl_lite_zip/CLAUDE.md) (LZ-01), which is otherwise a copy of this channel.

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
     fixed closing string becomes the agent's own closing text, composed in the call's language,
     on the `callhangup` turn — never a `preToolMessage`.

---

## Open platform dependencies (created by the CC-port pass, 2026-08-27)

1. ~~`calltransfer` forwarding target~~ — **N/A in this channel.** No agent holds the tool.
   `calltransfer` must be **de-registered on the platform for IVRS**, so a model that hallucinates
   the name cannot invoke anything.
2. ~~**`{{crcHolidayList}}` is still named in `Default.txt` and `genericInfoComplaintAgent.txt`.**~~
   **CLOSED 2026-09-29 (CHANNELS.md HOL-01).** Removed from this channel on client instruction: the
   holiday list is CRC's alone. Both prompts now say there is no holiday list on this line — the
   agent says it does not have the holiday information, gives the normal office timing, and
   suggests confirming with the distributor by phone.
