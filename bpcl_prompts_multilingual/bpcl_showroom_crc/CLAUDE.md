# bpcl_showroom_crc (CRC) — channel contract

Bharat Petroleum's **showroom CRC channel**. Vaani speaks from the **Bharat Petroleum regional CRC
office in each city** (`{{crcOfficeCity}}`), a regional head office covering many districts and many
distributors. She serves LPG consumers in whatever Indian language they speak.

**Re-derived from [`bpcl_ivrs_support`](../bpcl_ivrs_support/CLAUDE.md) on 2026-09-24 (IVRS-PORT-01) and
again on 2026-09-29 (IVRS-SYNC-02).** Every prompt is [`bpcl_contact_center`](../bpcl_contact_center/CLAUDE.md)'s
(= IVRS plus `calltransfer`), with **one further difference: identity** (CRC-ID-01, 2026-09-29). The Mumbai
Headquarters text is replaced by the CRC office text of the same agent in `bpcl_prompts/bpcl_showroom_crc` on
`main`, translated into the multilingual form, and `{{crcHolidayList}}` stays (HOL-01). Everything else — the
topology, the handoff contract, the LPG domain facts, the multilingual rule, the complaint method, the
Bharat Gas Lite zip ownership, the neutral greeting, the post-call set — is IVRS's, word for word, and must
not diverge.

Read [../CLAUDE.md](../CLAUDE.md) first — it holds the shared truth. This file holds **only what is
specific to this channel.**

Sister channels: [`bpcl_contact_center`](../bpcl_contact_center/CLAUDE.md) — identical to these except identity and the
holiday list — and [`bpcl_ivrs_support`](../bpcl_ivrs_support/CLAUDE.md), which also has no transfer.

**Porting rule for this channel:** a fix landing in IVRS lands here too, in the same session, and in
`bpcl_contact_center`. Translate two axes. Where IVRS refuses a transfer, this channel carries the Hindi
CRC's transfer line for the same agent. Where IVRS speaks as the Mumbai Headquarters, this channel speaks
as the CRC in `{{crcOfficeCity}}`, in the Hindi CRC's words for the same agent.

---

## Axis 1 — Escalation: the complaint comes first, then a transfer

**This, with identity (Axis 1c / Axis 2), is what makes this channel different from IVRS.**

**`calltransfer` is held and invoked by the agent the consumer is already speaking to**: the ten
complaint-capable leaves (`SENIOR TEAM TRANSFER` block), `newConnectionAgent_onHold` (§20A),
`routingAgent` (the one case: already helped, still asking) and `unregisteredComplaintAgent`.
`Default` and `emergencyAgent` carry the *"`calltransfer` — NOT AUTHORIZED"* clause. The three
`getConsumerDetails` prompts hold no transfer: they own no ending, and a caller with no record goes
to `unregisteredComplaintAgent` (the IVRS design, kept).

**The complaint comes first.** Help → route → register → *only then*, if the consumer still wants a
person, transfer. Vaani never volunteers one; it happens only at:
- **T1** — the consumer asks for a person *after* Vaani helped and, where needed, registered.
- **T2** — `handoffSummary` shows they already asked *and* the issue was already handled/registered.
- **T3** — the complaint tool FAILED. The one case Vaani raises herself, asking once.
- **T4** — a callback request. This channel schedules none, so it is a request to reach a person.

**The transfer turn is the call alone** — no text, no `preToolMessage`. Two outcomes, read from the
Result: success → silence, the platform closes the call; failure → the team could not be reached
and the window the Result carried, and no close in the same turn as the bad news. **One attempt per
call**, and it survives a switch. No switch after a failed transfer. No phone number, ever — a
request for one gets "I have no number, I can only transfer the call".

## Axis 1b — Language

**Any Indian language the consumer speaks.** Identical to CC.

## Axis 1c — The CRC office pair: `{{crcOfficeCity}}`, `{{crcOfficeAddress}}` (CRC-ID-01)

Injected variables, not fixed KB wording. `{{crcOfficeCity}}` is the bare city name and Vaani builds the
phrase "Bharat Gas, [city]" herself, transliterated into the script of her reply. `{{crcOfficeAddress}}` is
spoken only when the consumer asks for the address of where she is, converted into natural speech in the
call's language (TTS-SAFE DELIVERY — THE CRC OFFICE PAIR), pin code only on request and in the consumer's
own digit words. **Address only, no phone number.** It is never offered as somewhere to travel to and never a
substitute escalation. It is never interchangeable with the distributor's details (DISTRIBUTOR ↔ CRC
NON-SUBSTITUTION). `{{crcHolidayList}}` is this channel's alone (HOL-01).

## Axis 2 — Persona: a regional CRC office, distributor is a third party

Vaani is an insider of Bharat Petroleum at a **regional head office CRC** in `{{crcOfficeCity}}`. It covers a
multi-district territory and many distributors, and it is **not** the consumer's own distributor.

- ✅ "our office", "here with us" mean **this CRC only**. "Your distributor" is a third party, and telling
  the consumer to ask their distributor BY PHONE is correct.
- ❌ Sending anyone to travel. The territory spans many districts, so a visit can mean a very long trip. An
  unresolved problem is a registered complaint, then a transfer if they still want a person.
- ❌ Naming a district or distributor as falling under this CRC. Vaani does not hold the territory list.
- "senior team" is a real destination here, reached only through `calltransfer` per
  `SENIOR TEAM TRANSFER` — never named on a `switchagent` turn.

---

## Channel-specific inventory

**Tools:** `switchagent`, `callhangup`, `bpcl_create_complaint`, `calltransfer`,
`bpcl_complaint_status` (CST-PORT-01), `bpcl_create_unregistered_complaint`, `updateContact`,
`get_pincode_data`, `validatecontactno`, `bpcl_fetch_all_api`, plus `bpcl_get_subsidy_details`,
`bpcl_get_refill_history`, `bpcl_get_consumer_details`, `bpcl_check_refill_status`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` **and nothing else**. Every other prompt
that mentions it does so in a tool blocker forbidding the call — their data is pre-injected.

## Derived from the current IVRS, in the "You" persona (2026-09-29)

Since CHANNELS.md **IVRS-SYNC-02**, every CRC prompt is the CC prompt (the current IVRS plus the Hindi
CRC's transfer text) with the identity axis translated per CRC-ID-01. **Every agent prompt is written in
the "You" persona**, never "I".

## Tool calling follows TOOL_CALLING.md (2026-09-29)

**The reference for HOW every tool is called is `bpcl_prompts/TOOL_CALLING.md` on `main`** — the
method the client confirmed working on Hindi CRC on 2026-09-29 (CPL-27, NUM-08). Ported here as
[TOOL-PORT-01](../CHANNELS.md). Every tool edit in this channel aligns with it; if tool calling
breaks, start at its §4 checklist. What it means here:
- **An action tool is not announced.** The complaint turn (either complaint tool, and
  `updateContact` / `get_pincode_data`) and the `calltransfer` turn are the call alone. The empathy rule says outright that a
  complaint about to be registered is never the "next step" a warm sentence carries.
- **No scripted outcome lines.** No success line, no "four-beat" line, no "two turns" block: the
  outcome is whatever the tool's message says, in the consumer's language.
- **`callhangup` takes no parameters.** The closing line is the agent's own text with the call on
  the same turn — never in a `preToolMessage`, and no other key.
- **`bpcl_create_complaint` carries exactly `complaintSummary` + `complaintReason`**, stated as a
  closed set in every COMPLAINT TOOL block; `bpcl_create_unregistered_complaint` adds only
  `ConsumerDetailsConsumerName`. The platform schemas match these keys (client, 2026-09-29).
- **`bpcl_complaint_status` carries exactly `complaintNumber`** (CST-PORT-01): the 8 digits the consumer
  gave and confirmed, nothing else. Its answer fields (Comments, Complaint Status) are the platform's and
  are never filled. The turn is the call alone, and the status is spoken only from the tool's message.
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
  If the message says to offer a transfer, that offer is T3 in `SENIOR TEAM TRANSFER`.
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

**Greeting (IVRS-GREET-01).** `Default` opens with IVRS's neutral fixed line, "नमस्ते, मेरा नाम वाणी है। मैं
आपकी किस प्रकार सहायता कर सकती हूँ?" — the Hindi CRC's greeting too — usually configured as the platform's
first message. It is the one turn not in the consumer's language, because they have not spoken yet.

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

- **Identity is the regional CRC's since CRC-ID-01 (2026-09-29).** Before that the prompts spoke as the
  Mumbai Headquarters, as IVRS does. `{{crcOfficeCity}}` and `{{crcOfficeAddress}}` must be injected on
  the platform for every CRC deployment, or the agent has no location to give.
- **CRC-only files kept outside the IVRS set:** `postCallAnalysisHuman.txt` (the analyser for calls
  answered by a human staff member) and its sample outputs `naya.json` / `purana.json`.

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
   - **Escalation.** CRC's `calltransfer` / `SENIOR TEAM TRANSFER` / T1–T4 text is carried here
     as it stands in the Hindi CRC, with only its Hindi examples turned into meaning anchors.
   - **Identity.** Keep the Hindi CRC's `{{crcOfficeCity}}` / `{{crcOfficeAddress}}` text, translated to the
     multilingual form (city transliterated into the reply's script, address in natural speech in the
     call's language, digits in the consumer's own digit words). When porting from IVRS, its Mumbai
     Headquarters text becomes that CRC text.
   - **Language.** CRC is Hindi with a fixed Devanagari script rule. IVRS speaks whichever Indian
     language the consumer speaks. Every hard-coded Hindi line becomes a meaning anchor, and a
     fixed closing string becomes the agent's own closing text, composed in the call's language,
     on the `callhangup` turn — never a `preToolMessage`.

---

## Open platform dependencies (created by the CC-port pass, 2026-08-27)

1. **`calltransfer` must resolve its own forwarding target.** Every prompt invokes it with no
   parameters at all. If the platform does not supply the target, every transfer fails silently —
   correct prompt, dropped call. Test one transfer before wide deployment.
2. **`{{crcHolidayList}}` is CRC's own variable and stays here** (CHANNELS.md HOL-01, 2026-09-29).
   It is named in `Default.txt` and `genericInfoComplaintAgent.txt` and is the holiday list for the
   next thirty days. It was removed from IVRS and CC, which have no holiday list.
