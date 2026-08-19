# BPCL Vaani — Prompt Repository

Production voice-AI prompts for Bharat Petroleum (Bharat Gas) LPG consumer support, in Hindi.
Two channels, one agent topology, two different escalation policies.

**This repo is now under git** (first commit + push 2026-08-07, `origin` = `github.com/vijay-vo/bpcl_prompts`).
Commit deliberately — see "Change discipline" below.

---

## 1. The two channels

| | `bpcl_contact_center` (CC) | `bpcl_showroom_crc` (CRC) |
|---|---|---|
| What it is | Central contact centre for the whole state | Physical consumer-facing office (CRC) in each major city |
| Who Vaani is | An agent **of Bharat Petroleum**. The distributor is a third party. | Staff at a **regional head CRC office** covering many districts and many distributors. The distributor is **also a third party** (corrected 2026-08-05) |
| Language for the distributor | "आपके distributor" — third party | "आपके distributor" — third party too. "हमारे यहाँ" refers to **this CRC only**. Never send them travelling |
| Escalation to a human | `calltransfer` to a senior team, inline in ten agents | **Register a complaint first**, then — only if the consumer still wants a person — **`calltransfer`, invoked by the agent itself** (CHANNELS.md **XFER-03**, 2026-08-11, superseding XFER-01's dedicated transfer agent). **No office visit** — see ESC-01 |
| Callbacks | **Scheduled** — after a failed `calltransfer` only, Vaani asks for a slot (9am–5pm, within 15 days) and writes it into the complaint; no complaint number is spoken on a callback complaint. All ten complaint-capable agents support this | Not scheduled — a complaint is registered and the team makes contact, with no time captured and no window promised |
| Extra prompts | `postCallAnalysisFlat.txt` | — |

Both channels run the **same 15-agent topology** (CRC's 16th agent, `callTransferAgent`, was deleted by XFER-03), the same handoff contract, the same LPG domain
facts, and the same Hindi/TTS voice rules. Those are shared truth and must not diverge.

Every intended difference is recorded in [CHANNELS.md](CHANNELS.md). **A difference between the
two channels that is not in that ledger is a drift bug, by definition.** That rule is the whole
point of this repo's structure.

---

## 2. Layout

```
bpcl_contact_center/
  CLAUDE.md              channel contract — read before editing anything here
  prompts/<agent>/*.txt  the shipped prompts
  docs/                  ORCHESTRATION.md, FLOW.md, Flow.mmd, CUSTOMER_STATUS_SPEC.md
bpcl_showroom_crc/
  CLAUDE.md              channel contract
  prompts/<agent>/*.txt
  docs/                  agent-workflow.md
CHANNELS.md              the divergence ledger — every intended CC/CRC difference
CLAUDE.md                this file
```

The `.txt` files under `prompts/` are **what ships**. They are hand-edited and deployed as-is.
Nothing is generated; there is no build step. Keep it that way unless we deliberately change it.

---

## 2b. Post-call analysis — which prompt runs, and when

The `postCallAnalysis/` prompts are **not** live-call prompts. They run after the call ends, against
the transcript. **Which ones run depends on who took the call.**

| Who answered | What runs, in order |
|---|---|
| **Vaani (AI agent)** | `postCallAnalysisFlat.txt` **first**, then `promptQA.txt` |
| **A human agent** | `postCallAnalysisHuman.txt` |

**On an AI call the order matters.** `postCallAnalysisFlat` produces the flat structured summary of
what the call was about — intent, outcome, disposition. `promptQA` then reviews the same transcript
for **rule violations by Vaani** and returns the issue/unhandled-request JSON. Flat describes the
call; QA judges the agent. Do not run QA first and do not treat either as a substitute for the other.

**`postCallAnalysisHuman` is the human-agent analyser** and carries the richer nested scoring rubric
(checkpoint PASS/FAIL, `conversationInsights`). It is not part of the AI-call path.

**Monitoring for Vaani reads the nested JSON** — the structured checkpoint and insight objects out of
`postCallAnalysisHuman` and `promptQA` — rather than flat counts. Keep both outputs' nested shapes
stable: anything that consumes them breaks silently when a field is renamed or flattened.

✅ **The subject-framing question is closed (2026-08-13, CHANNELS.md PCA-02).** `postCallAnalysisHuman.txt`
is genuinely the human-agent analyser: its transcripts are a **CRC staff member talking to a customer**,
with no Vaani in them at all. Its CONTEXT, its complaint detection, and its ZIP / new-connection-hold
scoring have all been rewritten accordingly — tool language removed, the agent referred to as they/them,
and complaint registration judged by **meaning rather than Vaani's scripted phrasing**. It also carries
four flat root-level scores (`riskEscalationIndex`, `customerEffortScore`, `conversationQualityScore`,
`overallScore`) that feed a human-QA dashboard, plus `greeting`, `containment` and `csatScore`
(renamed from `csat`). Its `evaluations[]` carries **ten** checkpoints, scored out of a fixed
`qaScore.total` of 10 — two of them exist only because the agent is a person: Interruptions and Talk
Balance, and Customer Identification and Verification. **`customerSentiment` was rewritten and
`agentTone` added on 2026-08-19 (CHANNELS.md PCA-03)** — sentiment had collapsed into
neutral/negative on nearly every call, so it is now decided by a five-signal read of the **middle and
closing** turns and a first-match ladder that puts `neutral` *below* `positive`; both sentiment fields
are exempt from the *uncertainty resolves downward* rule, and `agentTone` records the agent's
**tone** (`empathetic`/`professional`/`robotic`/`impatient`/`rude`) beside `conversationQualityScore`'s
judgement of their **conduct**, moving no score of its own. **It is `agentTone` and not
`agentSentiment` on purpose** — "sentiment" names the positive/neutral/negative *scale* and would
imply it shares one with `customerSentiment`; "behaviour" would name *actions*, which is
`conversationQualityScore`'s job. Do not rename it to either. **Its output is aggregated across hundreds of
calls onto a manager's dashboard**, so every field has one fixed type and one closed value set, the
scales are deliberately unlike each other and must never be averaged together (CSAT 1–5, the three QA
scores 1–10, `qaScore` a fraction out of 10), and an unreadable recording returns `"NA"` for every
string, `0` for every earned number, empty arrays and `false` booleans — with `overallScore` as the
single field the dashboard filters unreviewable rows on. **It now diverges from
`postCallAnalysisFlat` and from CC's copies by design; do not reconcile them.**
The empathy question closed earlier: its **Empathy and Acknowledgement** checkpoint used to conflict
with the specialist-agent empathy ban, and CHANNELS.md **CLS-03 (2026-08-11) retired that ban**, so
warmth is correct behaviour in both analysers and no carve-out is needed. Both analysers' CONTEXT
blocks were corrected in that same pass — they had said *"there is no call transfer … no senior team
exists"*, which stopped being true at XFER-01.

---

## 3. Agent registry (canonical names)

Both channels. `agentName` values passed to `switchagent` must come from this list exactly.

| Agent | Role |
|---|---|
| `getConsumerDetails` | Number capture + `bpcl_fetch_all_api`. Entry for unregistered callers. |
| `Default` | Greeting, emergency interrupt, FAQ, triage, routing. Never hangs up. |
| `routingAgent` | Silent mid-call re-router. Owns the out-of-scope hangup ladder. |
| `emergencyAgent` | Gas hazard. Owns the call absolutely while a hazard is live. |
| `bookingEligibleAgent` | May book; the booking attempt failed. |
| `bookingNonEligibilityAgent` | May not book; explain the blocker. |
| `activeDeliveryAgent` | Booking exists, delivery date still ahead. |
| `postDeliveryAgent` | Booking exists, delivery date passed. |
| `eligibleDeliveryAgent` | No booking on record, may book. |
| `notEligibleDeliveryAgent` | No booking on record, may not book. |
| `paymentAgent` | Payment, refund, overcharge. |
| `subsidyAgent` | Subsidy / DBTL / PAHAL. |
| `connectionServicesAgent` | KYC, address, mobile, name, surrender, portability, PNG. |
| `newConnectionAgent` | New connection / Ujjwala / PMUY. |
| `genericInfoComplaintAgent` | Catch-all: how-to, equipment faults, behaviour complaints. |
| ~~`callTransferAgent`~~ | **Deleted 2026-08-11 (CHANNELS.md XFER-03).** Every routing-capable CRC agent now holds `calltransfer` and invokes it itself, passing `preToolMessage: "आपकी कॉल ट्रांसफर की जा रही है।"` and nothing else, with no spoken text of its own — then reads the Result: success → silence, the platform closes the call; failure → it says the team could not be reached, gives the window the Result carried, and closes only once the consumer accepts. |

**Known naming defects — do not propagate:**
- CRC's folder is `genericInfoComplaint/`, CC's is `genericInfoComplaintAgent/`. Canonical is
  `genericInfoComplaintAgent`.
- `deliveryGenericAgent` and `refillSupportAgent` are named as routing targets in several prompts.
  **Neither exists.** Any `switchagent` to them dead-ends.
- `bookingEligibleAgent.txt` is titled "(NON-ELIGIBILITY BLOCKER CASE)" but contains the eligible flow.

---

## 4. Shared truth — identical in both channels

Change these in **both** channels or in neither.

**Topology.** `Default` triages the front of the call. Every specialist is a leaf whose only
switch target is `routingAgent`. No leaf switches to another leaf. **Nothing ever routes back to
`Default`.** `routingAgent` never routes to itself or to `Default`.
XFER-01's recorded exception — every leaf may *also* switch to `callTransferAgent` — was **removed by
XFER-03 (2026-08-11)** along with the agent itself. Reaching a person is a `calltransfer` tool call
made by the agent the consumer is already speaking to, not a switch, so the rule above holds in full.

**Handoff contract.** `switchagent` carries `agentName`, `handoffSummary`, `preToolMessage`.
`handoffSummary` is one plain-English line: `"Intent: [INTENT]. Context: [ONE FACT]. Please help
consumer with [NEXT_ACTION]."` No history, no raw API output, no mobile number, no consumer id.

**The tool call is the action, not the sentence.** The platform never invokes a tool on the agent's
behalf. Speaking a registering line registers nothing; speaking a "ज़रा details देखती हूँ" line
switches nothing. A spoken line with **no tool call on that same turn is a failed turn** — this is
true of `bpcl_create_complaint`, of `switchagent`, and of every other tool. Recovery: if the
transcript shows a line implying a tool ran and no Result came back, invoke the tool before anything
else on the next turn. The agent's own spoken line is never evidence a tool ran; only a Result is.
(CHANNELS.md CPL-03 for the complaint case, XFER-01 for the generalisation to every tool.)

**The tool-turn rule.** On a tool turn exactly one thing speaks. Write the Hindi line as regular
**text** and pass **no** `preToolMessage`. Two tools are the exception, and both carry their whole
spoken line in `preToolMessage` while generating no text of their own: `callHangup`, which carries
the exact closing line, and `calltransfer`, which carries the transfer line — in CRC that is
`"आपकी कॉल ट्रांसफर की जा रही है।"` and it is the tool's **only** parameter (CHANNELS.md XFER-03).
Doing both makes the consumer hear the line twice — that is the bug this rule exists to prevent.

**Switching is invisible.** Never reveal that other agents, teams, experts, or systems exist.
Forbidden on a `switchagent` turn: transfer, connect, specialist, agent, team, department, desk,
switch, handoff, forward, भेजती, जोड़ती. **A ban list is only half the rule** — every routing-capable
prompt now also carries a *menu of anchor lines* saying what to speak instead ("ज़रा booking system
check करती हूँ, एक मिनट।"), because a prompt that only forbids gives the model nothing to reach for
and it reaches for "मैं आपको हमारे department से connect करती हूँ" (XFER-01).
One exception in each channel, because the consumer is about to hear a different voice: the
`calltransfer` tool's own `preToolMessage`. In CRC that message is "आपकी कॉल ट्रांसफर की जा रही है।"
and it is the **only** thing spoken on that turn — the agent writes no text of its own (XFER-03).

**Emergency overrides everything.** A confirmed gas hazard in any agent at any moment switches to
`emergencyAgent`, bypassing all gating. While the hazard is live that agent cannot switch, cannot
hang up, and has no closing sequence. The *words* "emergency" or "urgent" alone are not a hazard —
ask once. Helpline 1906, always digit by digit.

**LPG domain facts.** Booking gap 25 days urban / 45 rural · KYC valid under 9 months · refund
window 3–7 working days · payment settlement 3 working days · hotplate ₹1,500–4,000 · 5 kg Bharat
Gas Mini has no gap and no limit · office hours all weekdays 9am–7pm.

**Voice and TTS rules.** Hindi only, 1–2 sentences per turn, one question per turn (FAQs 2–3
sentences). Brand always "भारत पेट्रोलियम" in full, never "BPCL" — the sole exception is the app
name "Hello B P C L App". Never say **टंकी**. Never say **जोड़** (TTS mispronounces it) — use
"connect". Never speak a raw digit, a `{{variable}}`, or a placeholder. Numbers digit by digit;
money in Hindi words with "रुपये". Never a double form — never "एल पी जी (LPG)". Dates from the
backend are **DD-MM-YYYY, day first**; `{{system.current_date}}` is YYYY-MM-DD, year first.
Visible curly braces in a value = no data; treat as absent, never speak it.

**Complaint discipline.** Every agent holding `bpcl_create_complaint` carries the same `COMPLAINT PROTOCOL — STANDARD` block (CHANNELS.md CPL-01). A complaint is the **last** option, not the first: the `RESOLUTION LADDER` runs before any registration — understand the query, resolve it if the answer is yours, route it if it is another domain's, and only then register. The one carve-out is a **grievance about something that already happened** (cylinder not delivered, test not performed, staff behaviour, money taken), where nothing said undoes it and the complaint *is* the resolution — those register directly and are never slowed down. Confirmation is **only for what is new and consequential**; what the consumer said plainly is never re-confirmed, and when the issue is clear the one-line summary rides inside the registering line itself rather than costing a turn. **Speaking the registering line is not registering** — the agent invokes the tool on that same turn, and a line spoken with no tool call is a failed turn that must be recovered on the next one (CHANNELS.md CPL-03/CPL-04/CPL-05; CRC only so far). Never claim registration
before the tool returns success. One call per complaint, never retry on failure, max 2 per call.
Never invent a complaint number. On success the number is spoken digit by digit — **Hindi words in CC,
English digit words with `" - "` in CRC since CHANNELS.md NUM-01** — and
the consumer is told it will also arrive by SMS — the sole exception is CC's callback complaint,
which confirms the callback slot instead and speaks no number.

---

## 5. Channel policy — the axes that legitimately differ

Only two axes. Everything in §4 stays identical.

**Axis 1 — Escalation.** How Vaani responds when the consumer wants a human, a language other than
Hindi, a non-LPG product, or a callback; and what the terminal fallback is when a flow cannot be
resolved. CC transfers. CRC invites an office visit.

**Axis 2 — Persona positioning.** Whether Vaani speaks as Bharat Petroleum central (distributor is
a third party) or as staff inside the consumer's own distributor office (insider language).

These two axes are correlated but **not the same axis** — a CRC prompt can carry the right
office-visit escalation and still leak third-party phrasing. Check both separately.

---

## 6. Change discipline

Git is in place (since 2026-08-07), but these rules still matter — a commit history is only useful
if commits are deliberate and diffable, and the repo's first ~1.6 MB landed as one unreviewed
baseline commit with no prior history to diff against.

1. **Before editing a prompt, read the channel's own `CLAUDE.md`.** The escalation and persona
   rules differ, and an edit copied across without translating them ships a policy violation.
2. **Never create `.bak` copies of prompt files.** Edit in place. Backup files are not wanted in
   this repo.
3. **Never blind-copy a block between channels.** Port the *intent*, translate the escalation and
   the persona framing. A `calltransfer` block has no valid CRC translation — it becomes a
   COMPLAINT ESCALATION block (CHANNELS.md ESC-01), and a CC callback block loses its time capture
   entirely.
4. **A fix to shared truth (§4) lands in both channels in the same session**, or the ledger records
   why it did not.
5. **New intended difference → add a row to [CHANNELS.md](CHANNELS.md) in the same edit.** An
   unrecorded difference is indistinguishable from a bug six weeks later.
6. **Duplicate prompt files need a status marker.** If two versions of a prompt ever sit side by
   side, annotate which one is deployed before touching either. (The old `getConsumerDetails_v2.txt`
   that prompted this rule is gone — CRC has a single `getConsumerDetails.txt`.)
7. **Commit at logical boundaries, not at session end.** One commit per intended change (a single
   agent's fix, a CHANNELS.md ledger entry plus its prompt edits, a §4 shared-truth fix landed in
   both channels) — not one giant commit per session. Write commit messages that say *why*, the
   same way this file's history sections do. Never `--amend` a pushed commit, never force-push,
   never commit `.bak` files (rule 2 still applies with git in place).

---

## 7. What is deliberately not here yet

- **Commit history.** Git now exists (2026-08-07) but the repo's entire prior state landed as one
  baseline commit — there is no history behind it to diff against or roll back to. Attribution and
  rollback only start working from here forward, as commits are made deliberately per rule 6.7.
- **A drift audit.** ~2,800 differing lines across the 14 shared agents have never been classified
  as intended policy vs. unported fix. [CHANNELS.md](CHANNELS.md) §3 lists what is confirmed so far;
  the rest is unclassified.
- **Lint tooling** (`/channel-lint`) and **cross-channel diff** (`/prompt-diff`).
- **Scenario tests** — golden transcripts (gas leak, overcharge at door, KYC-blocked booking,
  out-of-scope ladder) with expected route and expected closing.
- **Platform dependencies for inline `calltransfer`** (CHANNELS.md XFER-03, 2026-08-11):
  exposing `calltransfer` to all thirteen routing-capable agents, accepting `preToolMessage` alone —
  the `forwardingNumber` is the platform's to supply; surfacing that call's **Result** to the agent on
  the next turn, carrying success/failure and, on failure, a reason (out-of-office-hours, platform
  failure, busy, no-answer) and the office-hours window where one exists; closing the call itself on a
  **successful** transfer, since the agent deliberately calls no tool at that point; and de-registering
  `callTransferAgent`.

- **A CRC `CUSTOMER_STATUS_SPEC`.** CRC's [agent-workflow.md](bpcl_showroom_crc/docs/agent-workflow.md)
  §7 links to `customerStatus-spec.md`, which does not exist in that workspace.
