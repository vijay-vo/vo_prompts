# bpcl_showroom_crc (CRC) — channel contract

The physical Consumer Relationship Centre — the distributor's own office, in each major city of
the state. The consumer can walk in.

Read [../CLAUDE.md](../CLAUDE.md) first — it holds the shared truth that must stay identical to CC.
This file holds **only what is specific to this channel.**

Sister channel: [`bpcl_contact_center`](../bpcl_contact_center/CLAUDE.md). Their prompts look
almost identical to these and are **not** interchangeable. Never copy a block across without
translating the two axes below.

---

## Axis 1 — Escalation: the complaint comes first, then a transfer. Still no office visit.

> **REVISED 2026-08-11 — see [../CHANNELS.md](../CHANNELS.md) XFER-03.** This channel used to have
> no transfer at all. XFER-01 gave it one, owned by a single agent. XFER-03 deleted that agent and
> gave the tool to every routing-capable agent instead. The *when* is unchanged; the *how* is not.

**`calltransfer` is held and invoked by every routing-capable agent**: the ten complaint-capable
leaves, `unregisteredComplaintAgent`, `newConnectionAgent_onHold` and `routingAgent`. `getConsumerDetails`
holds none since GCD-06 (2026-10-06). There is no transfer agent and nothing to switch to. `Default` and `emergencyAgent` still carry an explicit
*"`calltransfer` — NOT AUTHORIZED"* clause.

**`{{crcOfficeNumber}}` is deleted.** It was removed from all 13 prompts and from `vaaniQA` on
2026-08-05, and XFER-03 removed its last home — the `forwardingNumber` is now the platform's to
supply, not any prompt's. **No agent holds, speaks, dictates, or offers a phone number for the
consumer to call us.** A request for one gets "मेरे पास कोई number नहीं है, मैं सिर्फ़ आपकी call
transfer कर सकती हूँ" — the transfer is the only connection on offer. The consumer's **own
distributor's** number (`{{ConsumerDetailsDistMobileNumber1}}`/`2`) is unaffected. GCD-03, NUM-02
and CPL-07 are all retired.

**The complaint still comes first.** A transfer is never the first move. Help → route → register →
*only then*, if the consumer still wants a person, transfer. Vaani **never volunteers** a transfer;
she offers one only at the four moments below.

### SENIOR TEAM TRANSFER (canonical — in every routing-capable agent)

- **T1** — the consumer asks for a person *after* Vaani helped and, where needed, registered.
- **T2** — `handoffSummary` shows they already asked *and* the issue was already handled/registered.
- **T3** — `bpcl_create_complaint` FAILED. The one case Vaani raises herself, asking once.
- **T4** — a callback request. This channel schedules none, so it is a request to reach a person.

**Never re-ask someone who already asked.** *"किसी और से बात करवाओ"* **is** the request — asking
*"क्या मैं आपकी call senior team से connect कर दूँ?"* back at them costs a turn and reads as
stalling. The confirming question belongs in exactly one place, where Vaani is the one raising it:
**T3**. `getConsumerDetails` has no closing of its own any more — see GCD-06 below.

> **REVISED 2026-09-14 — CHANNELS.md TOOL-07.** `calltransfer` is now called with **no `preToolMessage` and no text** — there is no transfer announcement at all. `callhangup` carries the closing line as the agent's **own text**, with the call on the same turn; if a `callhangup` Result comes back, the agent produces no text (TOOL-08, 2026-09-15). No agent ever speaks a tool name — a complaint is only "complaint" or "शिकायत" (TOOL-08). The next paragraph describes the superseded XFER-03 shape.

**The transfer turn speaks nothing of its own.** `calltransfer` is invoked exactly the way
`callhangup` is: the agent generates **no text**, and passes **exactly one parameter** —
`preToolMessage: "आपकी कॉल ट्रांसफर की जा रही है।"`. Nothing else goes with it: no `agentName`, no
`handoffSummary`, no `consumerQuery`, no number. Writing that line as text *as well* makes the
consumer hear it twice. `transfer` is the one word from the forbidden list that may appear — inside
that `preToolMessage` and nowhere else in an agent's own speech. The old non-committal switch line
(`"जी बिल्कुल, एक मिनट।"`) is retired with the switch it belonged to.

> **REVISED 2026-08-11 (client instruction).** XFER-01's automatic-on-switch model is gone with the
> agent it belonged to. `calltransfer` is invoked **by the agent the consumer is already speaking
> to**, on its own turn, with `preToolMessage` as its only parameter. See CHANNELS.md XFER-03 for the
> full revision and the platform dependencies it replaces.

**The transfer has two outcomes and no third**, decided from the tool's **Result** — never from the
agent's own spoken line, and an absent or unclear Result is never read as success. **Success** → the
agent produces **nothing** — no text, no `callhangup`; the platform closes the call, and hanging up
there would cut the consumer off from the person they were just connected to. **Failure** —
out-of-office-hours, a platform-side failure, busy, or no-answer, all handled identically — → no tool
that turn; the agent says the team could not be reached and states when they can be reached, in
Hindi words, **from what the Result carried and from nowhere else**. If the Result names no window,
it names none: *"अभी हमारी senior team से सम्पर्क नहीं हो पा रहा, कृपया कुछ समय बाद call कीजिए।"*
Closing is gated on the consumer: the agent **never closes in the same turn as the bad news**, keeps
answering until they actually accept ("ठीक है", "समझ गया", "फिर call करूँगा", a goodbye) or the line
is dead through two waits, and only then calls `callhangup`. Turn count is never a reason to close.
`calltransfer` runs **once per call** and is never retried. That once is **per call, not per agent — it survives a `switchagent`** (CHANNELS.md **XFER-05**): before invoking it, an agent reads back through the whole call for a transfer line or Result, including turns from before it became active. The *offer* dies with the attempt too — once a transfer has been attempted, a later complaint failure gets the failure line and no second T3 question — and with the complaint tool down and the transfer spent there is nothing left, so the agent says so once and closes rather than circling on *"कुछ समय बाद call कीजिए"*. **`bpcl_create_complaint`'s failure is call-scoped in the same way** (CPL-20): a fresh agent is not a fresh attempt.

**Who never transfers:** `Default` (routes human requests to `genericInfoComplaintAgent` first, so
the issue gets registered) and `emergencyAgent` (a live hazard outranks everything). `routingAgent`
may, but only for an already-helped consumer — an out-of-scope query is still the hangup ladder.

**The escalation path is `bpcl_create_complaint`, not the office door.** The consumer has usually
already tried their distributor before calling a CRC, and one CRC covers a multi-district territory
— sending them to *any* counter can mean a 100+ km trip. Telling a consumer to travel is not an
outcome. Registering a complaint and telling them the team will call is.

### The COMPLAINT ESCALATION block (canonical — every agent implements this)

1. **Acknowledge warmly.** Never name a team, a senior, a specialist, or another agent as something
   the consumer is being passed to.
2. **Do I already know the issue?** If the consumer has already described their problem anywhere in
   this call, use it — do **not** ask again. Only if the issue is genuinely unknown (a bare
   "इंसान से बात करनी है" with nothing else) ask exactly one question:
   `"आपकी समस्या क्या है, थोड़ा बताइए?"`
3. **Confirm only what is new and consequential** — never re-confirm what the consumer said plainly.
   When the issue is already clear, spend **no** confirmation turn: the issue goes straight into
   `complaintSummary` (CHANNELS.md CPL-05, TOOL-06).
4. **Invoke `bpcl_create_complaint`, with no text of its own** (CHANNELS.md TOOL-06, 2026-09-14). The
   platform registers nothing — the tool runs only because the agent invoked it, and what the agent
   says next comes from the Result. A complaint the agent had decided to register with no Result behind
   it was never registered: the next turn invokes the tool before anything else and speaks no number (CPL-03). `complaintSummary` is the consumer's real problem in English —
   never "consumer asked for a senior team" alone. `complaintReason` is the exact matching phrase from **that
   agent's own scoped reason list**, or `others` when nothing matches — never invented (CPL-05).
   Those two are the **whole** call: the parameter set is closed by rule, so any other key —
   `caseId`, `caseNumber`, consumer id, mobile number — is the platform's, whether or not the
   prompt names it, and a Result field is an output that never goes back in as an input (PARAM-01).
5. **Do what the tool's message says** (CPL-22) — a complaint number in it is spoken digit by digit in English
   digit words with `" - "` (NUM-01). No timeframe is ever promised.
6. Go to close check.

**A complaint is the last option, not the first.** Every complaint-capable agent runs the
`RESOLUTION LADDER` before registering: is the query clear (if not, one clarifying question) → can I
resolve it from my own data or knowledge → does it belong to another domain (route) → only then
register. **Carve-out:** a *grievance about something that already happened* — cylinder not
delivered, test not performed, staff behaviour, money already taken — skips the ladder entirely,
because nothing said undoes it and the complaint *is* the correct resolution (CHANNELS.md CPL-04).

**Empathy is allowed everywhere, in the model's own words — RETIRED CPL-05's blanket ban
(CHANNELS.md CLS-03, 2026-08-11).** The ban was already dead in production: live transcripts show
Vaani saying `"समझ सकती हूँ"` and `"क्षमा चाहती हूँ"` regardless. What made those calls hollow was
warmth carrying nothing. **The rule now is that every warm sentence carries a fact, an answer, or a
next step with it** — warmth alone, on a turn where the consumer asked something, is worse than
none. Acknowledge an issue **once**, never re-acknowledge the same feeling, never reuse a phrase
already spoken in the call. **No fixed phrases and no script** — the wording is generated fresh.
Never apologise on the distributor's behalf and never pass judgement on the distributor or their
staff; stay with what happened to this consumer. Naming back the specific thing that happened is
acknowledgement, not echo, and `"जी"` / `"अच्छा"` may open a turn where they genuinely fit.
**A complaint about to be registered is never that "next step"** (CHANNELS.md CPL-27, 2026-09-28):
the complaint turn is the call alone, and the warmth waits for the next turn and the tool's message.

**The close question is a turn of its own, and the gate is the consumer's last turn** (CLS-03).
`"क्या कुछ और L P G से related help चाहिए?"` is never in the same turn as anything else — CLS-01
already said that and it still fired eleven times on one call, because the "fully resolved"
definition three lines below granted permission the moment a complaint number was spoken. **That
clause is deleted.** A topic is resolved only when the consumer's own last turn carried nothing
further — no question, no new fact, no fresh grievance. A registered complaint never makes a topic
resolved. **If they never wind down, the question is never asked**: there is no turn cap and no
forced close, and a call that never reaches it is correct.

> **REVISED 2026-09-17 — CHANNELS.md CPL-22.** There are **no fixed complaint lines any more** — no
> success line, no already-registered line, no failure line. The tool returns only a **message**
> (no `caseId`/`caseNumber`) that says what happened and what to tell the consumer, e.g.
> *"Complaint registration successful. Share Complaint Number: … with the consumer and mention that an
> SMS confirmation will be sent."* or *"Complaint registration failed. Inform the consumer the complaint
> could not be registered and offer to transfer the call."* Every complaint agent carries one identical
> `COMPLAINT TOOL — THE WHOLE PROCEDURE` block: **call** (nothing said before or with it) → **read the
> message** → **do what it says, in natural Hindi, never reading its English aloud** → no message means
> nothing is registered, so call. Once per issue; never again after a failure on the call; never more
> than two calls. A failure message's transfer offer is T3. **Do not re-add example Hindi lines for any
> complaint outcome** — they were what the model copied instead of calling the tool.

**No callback time is ever captured.** CC asks the consumer for a callback slot and writes it into
the complaint; CRC does not. We register and say the team will call — nothing is scheduled.

**Complaint already registered this call?** Never register a second one for the same issue, and
never treat a later "senior से बात कराओ" as a new complaint — answer from the tool's earlier message.

**An earlier complaint is checked, not re-registered blind (CHANNELS.md CST-01, 2026-10-05).** The ten
complaint agents and `unregisteredComplaintAgent` hold `bpcl_complaint_status` (one key, `complaintNumber`)
and one identical `COMPLAINT STATUS` block. When the consumer asks about an earlier complaint, or a complaint
is due and they say they already complained, Vaani asks for the number (or points to the SMS), reads it back,
makes the call alone, then gives the status first and the comment second — never the comment's English, names,
numbers or dates. A new complaint follows only when the consumer asks, accepts one offer after being unhappy,
or no status could be found while the problem still stands. Two checks per call. `Default` is unchanged and
routes on the problem. Design: [docs/COMPLAINT_STATUS_PLAN.md](docs/COMPLAINT_STATUS_PLAN.md).

### What triggers it

- **Escalation** — the consumer asks for a human, a person, a specialist, a senior, or a callback.
- **Terminal fallback** — a flow cannot be resolved, or the data Vaani needs is genuinely missing.
  The old "यह जानकारी मेरे पास नहीं है, आप office आ सकते हैं" ending is retired: it becomes a
  complaint.
- **Non-Hindi and non-LPG, on insistence only.** Answer once inline, with the two lines kept
  **separate** — never merged:
  - language → `"मैं सिर्फ़ Hindi में मदद कर सकती हूँ।"` (and keep replying in Hindi)
  - non-LPG product → `"मैं सिर्फ़ LPG से जुड़े सवालों में मदद कर सकती हूँ।"`

  If the consumer repeats the same request on the very next turn, that is insistence — register a
  complaint so the team can help.

### What does NOT become a complaint

- **Genuinely physical actions** keep the existing office guidance, unchanged: hotplate/stove
  purchase and KYC document submission. A complaint does not sell a hotplate or accept a document.
- **A truly out-of-scope query** stays with `routingAgent`'s hangup ladder. No complaint.
- **A live gas hazard.** `emergencyAgent` is fully carved out — no complaint, no escalation block,
  no closing, while the hazard is live.
- **No consumer record — ../CHANNELS.md GCD-06 (2026-10-06), on UNREG-03's flow.** `getConsumerDetails`
  holds **no complaint tool, no `calltransfer`, no `callhangup` and no `switchagent`**. It looks up at
  most two numbers ("no registered number" or a refusal is asked again for any number the consumer
  uses; a consumer with no second number has the first one fetched again silently) and, after the
  second empty fetch, says nothing: the platform switches to **`unregisteredComplaintAgent`**, which
  answers from its knowledge base, registers through **`bpcl_create_unregistered_complaint`** against
  a confirmed name and PIN-code district, and transfers per T1–T4 if the consumer still wants a
  person. The old no-data closing (senior-team offer, `calltransfer` or `callhangup`, XFER-01) is gone
  with the files that carried it.

### Who can register, and the one routing hop

Ten agents hold `bpcl_create_complaint` and register in place. Three do not, and **never get it**:

- `Default` — triage only. Its STAGE 0 escalation interrupts route via **STAGE 3** to
  `genericInfoComplaintAgent`, exactly as INTERRUPT A already routes a hazard to `emergencyAgent`.
- `newConnectionAgent` — escalates via `newConnectionAgent → routingAgent → genericInfoComplaintAgent`.
  Leaf-to-leaf switching is forbidden, so `routingAgent` is the only legal path.
- `getConsumerDetails` — see above; it cannot escalate at all.

`unregisteredComplaintAgent` is the one agent that registers **without a consumer record**, and it
never holds `bpcl_create_complaint`: its tool is `bpcl_create_unregistered_complaint`, reached through
`updateContact` → `get_pincode_data` → a confirmed district, with the IVRS nine-value
`complaintReason` list (UNREG-03).

`bookingEligibleAgent` was in this list until 2026-07-29. It now holds the tool and registers directly — a repeated
booking failure is a technical fault on our side, so the complaint is the first action, and the
distributor's phone number is only ever offered afterwards as a convenience.

The consumer must never learn any of this happened. Every hop obeys the invisible-switching rule.

**Address sharing survives as knowledge only — but not in `Default`.** In every agent *except*
`Default`, `{{ConsumerDetailsDistributorName}}` / `{{ConsumerDetailsDistributorAddress}}` /
`{{crcOfficeAddress}}` are spoken when the consumer *asks* — "आप कहाँ से बोल रही हैं?", "मेरे
distributor का पता क्या है?" — and for the physical actions above. They are never offered as the
resolution to a problem.

**`Default` holds no consumer-specific data at all** (CHANNELS.md DATA-01, 2026-07-29). It runs
before the platform's data gate resolves, so it kept placeholders that could be uninjected — and
invented values for them. It now holds only `{{crcOfficeCity}}`/`{{crcOfficeAddress}}` (static
per-office config). A consumer asking for their own distributor's name, address, or phone is
routed to `genericInfoComplaintAgent` immediately, **not** answered and **not** escalated as a
complaint — it is a data question, not a problem.

## Axis 2 — Persona: Vaani works at a REGIONAL HEAD CRC, and the distributor is a third party

> **REVERSED 2026-08-05 (client correction).** This channel previously banned "आपके distributor" and
> required insider phrasing for the distributor. That was wrong. Vaani calls from a **head CRC office
> for an area/region covering multiple districts and multiple distributors** — she is NOT inside the
> consumer's own distributor office. **"अपने distributor से पूछ लीजिए" is correct and expected.**
> She remains an insider of भारत पेट्रोलियम itself. Escalation (Axis 1) is untouched: pointing to a
> distributor means a **phone enquiry**, never a journey, and an unresolved problem is still a
> registered complaint. `vaaniQA` **C8 is retired**; C7 now says the third-party framing is correct.
> Hotplate purchase and KYC submission now point at the consumer's **own distributor**, not this CRC.

Vaani works at a Bharat Gas / Bharat Petroleum Consumer Relationship Centre (CRC), identified by
`{{crcOfficeCity}}` and `{{crcOfficeAddress}}` (the CRC's own full address). **One CRC serves a
whole multi-district territory** (e.g. the Indore CRC covers Indore, Dhar, Ujjain, Ratlam, Neemuch,
Jhabua, Dewas, Mandsaur, Khandwa, Khargone, Burhanpur, Badwani, Alirajpur) — the calling consumer's
own city and distributor can be anywhere in that territory, and `{{crcOfficeAddress}}` is **always a
different physical place** from `{{ConsumerDetailsDistributorAddress}}`.

**`{{crcOfficeCity}}` holds ONLY the bare city name** — nothing else, no brand word, no "CRC", no
punctuation (e.g. `Indore`). The office name is always **भारत गैस** and never comes from a variable,
so the prompts build the spoken phrase themselves: `"भारत गैस, {{crcOfficeCity}}"`. The variable is
never spoken alone as if it were the office name. (It was `{{crcOfficeName}}` until 2026-07-29 and
carried a mixed "brand + city" label — see [../CHANNELS.md](../CHANNELS.md) D-05.)

Vaani still speaks as an insider of Bharat Gas / Bharat Petroleum throughout — the two-office split
is a factual/routing distinction, not a persona/tone one. Both addresses are spoken in the same
natural, TTS-safe Hindi style.

**Neither variable is ever spoken as it arrives** (../CHANNELS.md TTS-01, 2026-07-31). Both are raw
backend text — Latin script, usually ALL CAPS, with abbreviations and a pin code. Every prompt that
holds the pair carries a `TTS-SAFE DELIVERY — THE CRC OFFICE PAIR` block directly under the variable
definition: city transliterated to Devanagari inside the self-built phrase, address broken into
natural spoken parts with numbers as Hindi words, abbreviations expanded, pin code dropped unless
asked. `connectionServicesAgent` carries the canonical long form as §9 Rule 6. Coverage is **every
file holding a `crcOffice*` variable**, `getConsumerDetails` and the parked `newConnectionAgent`
included.

The block deliberately contains **no worked example address**, and says so — a specimen in the
prompt becomes a hallucinated one on a call. Under the same rule, every pre-existing specimen was
removed: the `"Indore"` city example (11 prompts + 3 QA files) and the `KHARGHAR…` name/address/
number example in §9 Rule 6 and `TTS-SAFE DELIVERY` (**both channels**, now a shape-only template).
**Do not re-add an illustrative address, city or phone number to any of these blocks.** The one
survivor is §9 Rule 2's digit-flow example, which cannot be shown without digits — see TTS-01.

The same gap on `{{ConsumerDetailsDistributorName}}`/`Address` outside `connectionServicesAgent`
is still open in **both** channels; see TTS-01.

**Priority rule, post-ESC-01:** neither address is ever a resolution. For any unresolved problem the
answer is a registered complaint (Axis 1). `{{ConsumerDetailsDistributorName}}` /
`{{ConsumerDetailsDistributorAddress}}` are spoken when the consumer asks for them, and proactively
for the two physical actions (hotplate/stove purchase, KYC document submission).
`{{crcOfficeCity}}` / `{{crcOfficeAddress}}` are spoken only when the consumer asks where Vaani
herself is calling from, or explicitly asks for this office's address.
**`Default` is the exception to the first half of this rule** — it does not hold the distributor
pair at all and routes the question instead (DATA-01). In `Default` the hotplate/KYC carve-outs
give the action, price, and timing and point at the consumer's **own distributor**, but never a name
or address, which `Default` does not hold.

- ✅ "हमारे यहाँ", "हमारा office" — for **this CRC** only
- ✅ **"आपके distributor" / "अपने distributor"** — correct as of 2026-08-05. The consumer's
  distributor is a genuinely separate party from this regional head office. Naming it factually
  ("distributor का नाम ... है") is equally correct.
- ❌ Telling the consumer to **travel** to any office or distributor to resolve a problem. That rule
  (Axis 1 / ESC-01) is unchanged — a phone enquiry is fine, a journey is not.

**CS-01 is now moot.** It recorded third-party phrasing in `connectionServicesAgent`'s §7-D fallback
and C12 examples as a defect and rewrote it. Under the corrected persona that phrasing was never
wrong; the factual naming it was rewritten to is also fine, so nothing needs reverting.

---

## Channel-specific inventory

**Tools:** `switchagent`, `callhangup`, `bpcl_create_complaint`, `bpcl_complaint_status` (held by the ten
complaint agents and `unregisteredComplaintAgent`, CST-01), `validatecontactno`,
`bpcl_fetch_all_api`, plus `bpcl_get_subsidy_details`, `bpcl_get_refill_history`,
`bpcl_get_consumer_details`, `bpcl_check_refill_status`, and **`calltransfer` — held by every
routing-capable agent and invoked by it directly** (XFER-03); forbidden by name in `Default` and
`emergencyAgent`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` **and nothing else**. Every other prompt
that mentions it does so in a tool blocker forbidding the call — their data is pre-injected.

**Variables unique to this channel:** `{{crcOfficeCity}}` / `{{crcOfficeAddress}}` — the CRC's own
identity, distinct from `{{ConsumerDetailsDistributorAddress}}` (the consumer's own distributor).
**`{{crcOfficeNumber}}` no longer exists anywhere in this channel** (XFER-01, 2026-08-05; its last
home, the `forwardingNumber` parameter, went with XFER-03 — the platform supplies it now). A request
for their **own distributor's** number is still `{{ConsumerDetailsDistMobileNumber1}}`/`2`.
See Axis 2 above for the priority rule. CC has no equivalent — it has no physical location concept
at all — so this is CRC-only by design, not drift. Logged in [../CHANNELS.md](../CHANNELS.md).

`{{crcHolidayList}}` joined them 2026-08-18 (CHANNELS.md **HOL-01**): the Bharat Petroleum holidays
falling on working days in the **next thirty days**, as plain sentences naming occasion, weekday and
date. Unlike the office pair it describes **both** offices — a BPCL holiday closes this CRC and the
consumer's distributor alike — so it is the one office fact exempt from distributor ↔ CRC
non-substitution. Nothing outside the thirty-day window may be answered: absence from the list is
*"मेरे पास यह जानकारी नहीं है"*, **never** "the office will be open", and never a date worked out
from festival-calendar knowledge. Held by `Default` and `genericInfoComplaintAgent` only — the query
is ~0.01% of calls and `routingAgent` already carries a mid-call general-information question to the
latter.

**Folder naming defect:** this workspace uses `genericInfoComplaint/`; CC uses
`genericInfoComplaintAgent/`. Canonical is `genericInfoComplaintAgent` (NAME-03).

**The Vaani QA reviewer is `vaaniQA.txt` here, `promptQA.txt` in CC** — renamed 2026-08-19 because the
file reviews **Vaani**, not prompts, and sits beside `postCallAnalysisHuman.txt`, which reviews the
human agent. Intended, recorded as [../CHANNELS.md](../CHANNELS.md) **NAME-05**; rename CC's copy when
CC is next opened. Every `promptQA` reference in ledger rows dated before that day means this file.
⚠️ **Nothing in the prompts points at the filename, so the platform's post-call config must be
repointed** — if that is missed, CRC's QA analyser silently stops running.

**`getConsumerDetails` is one prompt: `getConsumerDetails.txt`** (GCD-06, 2026-10-06) — the former
`getConsumerDetails-unreg.txt` (UNREG-03), renamed unchanged. It holds `validatecontactno` and
`bpcl_fetch_all_api` only, both invoked silently, and speaks only after a Result. Its exits:
data found → stop speaking, the platform resumes the call into `Default`; first empty fetch → one
request for another number; second empty fetch → silence, the platform switches to
`unregisteredComplaintAgent`. **Deleted (git history only):** `getConsumerDetailsLive.txt` and the old
`getConsumerDetails.txt` (both ended in a senior-team offer and `callhangup`),
`getConsumerDetails_MobileVersion.txt` and `prompts/callTransferAgent/`. There is no
`getConsumerDetails_MultiToolVersion.txt` in this repo. Both platform-owned hops — into `Default` and
into `unregisteredComplaintAgent` — are described by no prompt; see the open items below.
⚠️ **The platform's `getConsumerDetails` agent must point at this prompt.**
**`unregisteredComplaintAgent`** — tools `updateContact`, `get_pincode_data`,
`bpcl_create_unregistered_complaint`, `bpcl_complaint_status` (CST-01), `calltransfer`, `switchagent` (→ `routingAgent` only, for a new
topic after its own work is done) and `callhangup`. Its SECTION 4 is still pre-ZIP-04 (see
UNREG-03's open item).

**Docs:** [agent-workflow.md](docs/agent-workflow.md) — the full navigation map for all 15 prompts.
§11 lists known gaps, and they are worth reading before any routing change.

---

## New connections are ON HOLD (2026-07-31) — read before touching `newConnectionAgent`

New connections for the **14.2 kg domestic cylinder, Ujjwala included**, are closed. Open-ended, no
reopening date, no stated reason. Full policy in [../CHANNELS.md](../CHANNELS.md) **NC-01**.

**Two files sit side by side in `prompts/newConnectionAgent/`:**

- **`newConnectionAgent_onHold.txt` — DEPLOYED.** The live prompt. Informs, offers Bharat Gas Mini
  (5 kg), handles commercial and "already applied", never guides an application.
- **`newConnectionAgent.txt` — PARKED, DO NOT SHIP.** The original 2,033-line apply journey,
  retained **unchanged** because there is no version control and it is the only copy. Do not edit
  it, do not port fixes into it, do not delete it.

⚠️ **The platform must point at the `_onHold` file.** The old filename was kept, so this is a
config change nothing in the prompts can enforce. If it was missed, the full apply flow is live.

**This agent does not escalate on the hold topic** — a deliberate exception to Axis 1. A prospective
consumer has no record, so there is nothing to attach a complaint to, and no complaint could reopen
connections. It holds the consumer itself: restate calmly, offer Mini once, close. Never promise a
person, a callback, a complaint, or an office visit. A genuinely different problem still routes.

**Not affected, and must never get the hold message:** commercial connections, Bharat Gas Mini,
second/additional cylinder, portability, and the city-shift Transfer Voucher path (so
`connectionServicesAgent` C1 is unchanged).

**CC is deliberately behind on this** — client decision. It is a recorded gap, not a design
difference. See NC-01.

> 🛑 **READ CHANNELS.md ZIP-04 (2026-09-09) FIRST — it reverses parts of every ZIP row below.**
> The standalone `bpcl_lite_zip/litezipAgent.txt` KB was merged in, client ruling that it wins on
> facts while CRC keeps its channel layer (Hindi only, 1906 → `emergencyAgent`, tools, complaint
> protocol, no office visit). What changed: ZIP has **two sizes, 10 kg and 5 kg** (ZIP-02's
> "10 kg only" is gone); **no ZIP amount is ever spoken** — the ₹2,700+GST cylinder price and the
> ₹250 regulator are deleted everywhere and the App shows the GST-inclusive bill on selection;
> **`commercial-lpg.in` is deleted from every prompt** and from all allowed-address lists;
> **commercial and industrial consumers may take ZIP** (ZIP-03's domestic-only is reversed —
> domestic 2/month, commercial 10, industrial the same); documents are **not uploaded in advance**
> and the **App shows the ID list** rather than Vaani reciting one; **"the connection comes
> immediately" and the App's "New Connection" label are now sayable — wording only**, with the
> routing and the hold-exemption untouched. Added: the **11-step App walkthrough in every
> ZIP-bearing agent**, the **Refill-vs-New-Connection fork** (assume New Connection until the
> consumer says they have an empty cylinder to exchange), the **regulator as a New-Connection-only
> Add On**, the **order number + distributor details + SMS OTP** after payment, the **after-6pm →
> next-day 8am–8pm** rule beside the unchanged four-hour standard, and the **three dead ends**
> (area, stock, no smartphone). Unknowns are down to two: warranty/damage cover and which cities.

> ⚠️ **Also amended by CHANNELS.md ZIP-03 (2026-08-17)**, the KB refresh against the business team's
> reviewed FAQ: ZIP is **domestic-only** (the commercial 10-cylinder limit is deleted everywhere);
> every lookup leads with the **Hello BPCL App** — "Bharatgas for Home" → "Explore Bharatgas
> Products" → PIN code — and falls back to `commercial-lpg.in` only for a consumer not comfortable
> with the app, one route or the other, never both; **IVRS is no longer a ZIP booking channel** and
> there is **no cash on delivery** — payment completes before the cylinder is handed over; the limit
> is 2 a month **and 2 at a time**, the at-a-time figure only if asked; ID proof is **Aadhaar, PAN,
> DL, Ration Card or Passport** (Voter ID and the "any Government-issued ID" catch-all dropped); the
> cylinder carries the **ISI mark**; **anyone may apply**. The FAQ's "instant new connection" wording
> was **deliberately not adopted** — ZIP stays a product, not a connection.

> ⚠️ **The ZIP section below is superseded by CHANNELS.md ZIP-02 (2026-08-05).** ZIP is now a
> **product, not a connection**; it is **offered together with Mini** at three moments (the
> new-connection hold, the extra-refill block, a non-eligible booking) rather than answered-only;
> the Lite-cylinder/ZIP-package framing is deleted; and most of the soft-unknown list is retired
> because the facts are now held. Read ZIP-02 before touching any ZIP block.

## Bharat Gas Lite ZIP (2026-07-31) — live across 13 CRC prompts

**भारत गैस लाइट ज़िप**, launched July 2026. Premium Free Trade LPG: composite cylinder + instant
new connection + express delivery within four hours. Non-subsidised — no subsidy, no DBTL. Full
policy in [../CHANNELS.md](../CHANNELS.md) **ZIP-01**.

**ZIP is exempt from the new-connection hold** — it is the one connection route still open, so
`newConnectionAgent_onHold` offers Mini and ZIP together and lets the consumer choose.

**ZIP is OFFERED in exactly one place: `newConnectionAgent_onHold`.** Everywhere else — `Default`,
both booking agents, all four delivery agents, `paymentAgent`, `subsidyAgent`,
`connectionServicesAgent`, `genericInfoComplaint` — ZIP is a **knowledge base only**: answer it when
the consumer raises it, never bring it up, never present it as an option, never offer it as a way
around a blocked booking, a delivery problem or the extra-refill block. **Bharat Gas Mini is the only
alternative offered outside the new-connection flow.** Every one of those ten agents carries the
`ZIP IS KNOWLEDGE ONLY IN MY FLOW — I NEVER OFFER IT` clause; `Default` carries the imperative form
in MODULE Z. Removing that clause reopens the drift it exists to stop.

**Four rules that are easy to break when editing:**

1. **Never say ZIP is available in the consumer's city.** Availability varies by city and
   distributor and nothing on this side can see it. The hedge rides with every offer.
2. **Four hours is a product standard, never a promise about one delivery.** The existing
   no-delivery-promise rule still binds when ZIP is confirmed.
3. **Never ask whether a connection or order is ZIP.** Use it only when the consumer volunteers it.
   Asking is banned fact-gathering.
4. **Never offer ZIP outside `newConnectionAgent_onHold`.** Answering a ZIP question is correct
   everywhere; raising it is not. Mini is the only alternative anywhere else.

**The soft unknown line is fenced to ZIP.** For ZIP specs nobody holds yet, Vaani says the service
is new and points to the distributor / app / website instead of the flat
`"यह जानकारी मेरे पास नहीं है"`. Every agent carries a clause saying this does **not** apply outside
ZIP — without it, the distributor-redirect habit ESC-01 retired creeps back. Use "संपर्क कीजिए",
never "जाकर पूछिए": a phone enquiry is not a journey.

**Never asserted:** whether an existing registered consumer can take or switch to ZIP. Unconfirmed
both ways, so ZIP is not offered as a route around a blocked booking.

⚠️ **There is no product-type variable — ZIP is confirmed by the consumer only.** A
`{{ConsumerDetailsProductType}}` variable was written into ten prompts and **removed on 04-08-2026**:
no such variable is injected, and `customerStatus` carries no product-type field either. Do not
re-add it under that name. Consequence: delivery agents cannot tell a ZIP booking from a standard
one unless the consumer says so. If the platform team ever exposes a real product field, rename the
references back in — see CHANNELS.md ZIP-01.

⚠️ **"यह service अभी नई है" expires.** True in July 2026, silently wrong later. Client will reword.

**CC is deliberately behind on this**, as with NC-01.

## Open items specific to CRC

- **CS-01 (fixed)** — the third-party phrasing leak in `connectionServicesAgent.txt` (§7-D fallback
  and C12 examples) is corrected; distributor details are now named factually rather than as
  "आपके distributor".
- **DOC-01** — [agent-workflow.md](docs/agent-workflow.md) §7 links to `customerStatus-spec.md`,
  which does not exist in this workspace. CC has `CUSTOMER_STATUS_SPEC.md`; CRC has no counterpart.
- **The undocumented `getConsumerDetails` hops** (agent-workflow.md §11.3) — into `Default` on data
  found, and into `unregisteredComplaintAgent` after two empty fetches. Both work only if the platform
  owns those transitions. Worth confirming with the platform team.
- **Four prompts unreachable by name** (§11.4): `bookingNonEligibilityAgent`, `postDeliveryAgent`,
  `eligibleDeliveryAgent`, `notEligibleDeliveryAgent` are never a `switchagent` target anywhere.
  They work only if the platform resolves the family name to the right variant from backend state.
  If it does not, a not-eligible consumer lands in `bookingEligibleAgent`, which opens with *"the
  system confirms you can book"* — the exact contradiction to avoid.
- **XFER-03 open items (platform team):** expose `calltransfer` to all thirteen routing-capable
  agents, accepting `preToolMessage` alone — the `forwardingNumber` is the platform's to supply, not
  any prompt's; surface that call's **Result** to the calling agent on the next turn, carrying
  success/failure and, on failure, a reason (out-of-office-hours, platform failure, busy, no-answer)
  and the office-hours window where one exists — the failure branch is written against it and names
  no window without it; close the call itself on a **successful** transfer, since the agent
  deliberately calls no tool there; and de-register `callTransferAgent`, whose prompt is deleted.
- **QA environment:** `getConsumerDetails_MultiToolVersion.txt` is not in this repo. QA should
  exercise the shipped `getConsumerDetails.txt` (GCD-06).
- **`postCallAnalysisHuman.txt` — CLOSED 2026-08-13 (../CHANNELS.md PCA-02).** It is genuinely the
  human-agent analyser: two people talking, no Vaani. Fully rewritten for that subject and given four
  flat root scores for the human-QA dashboard (`riskEscalationIndex`, `customerEffortScore`,
  `conversationQualityScore`, `overallScore` — all strings, no arithmetic anywhere) plus a ninth
  `evaluations[]` checkpoint, and the root fields `greeting`, `containment` and `csatScore` (renamed
  from `csat`). **No transcript → `"NA"` for every string in the payload, `0` for every number,
  empty arrays, `false` for the five `riskObservations` booleans, and its own fixed sentence in
  `notes`** — revised 2026-08-13, superseding the original `""`-for-four-fields rule. **The two
  denominators are constants and never move** (`qaScore.total` 10, `csatAnalysis.maxScore` 5), on
  no-transcript rows included — only the earned numbers go to 0. **`overallScore` is the
  reviewability gate the dashboard filters on** — there is no `analysisStatus` field, so unreviewable
  rows are dropped before anything aggregates. Scales stay native and are never averaged across each
  other: CSAT 1–5, the three QA scores 1–10, `qaScore` a fraction out of 10 rather than a third
  scale. `evaluations[]` now carries **ten** checkpoints — the tenth is Customer Identification and
  Verification.
  **Amended 2026-08-19 by [../CHANNELS.md](../CHANNELS.md) PCA-03:** `customerSentiment` was
  collapsing into `"neutral"`/`"negative"` on nearly every call — topic bleed, an unreachable
  `"positive"`, and the *uncertainty resolves downward* rule leaking onto a judgement field. It keeps
  its name, position and four values (client decision: **no `start`/`trend` split — one field, decided
  better**) and is now a procedure: what it is **not**, a **middle-and-end weighting** rule, five
  signals, and a first-match ladder `angry → negative → positive → neutral` with `neutral` explicitly
  the *narrow* bucket rather than the default. New root field **`agentTone`**
  (`empathetic`/`professional`/`impatient`/`rude`) records the agent's **tone**, where
  `conversationQualityScore` records their **conduct** — it moves no score and fails no checkpoint, and
  `conversationQualityScore` keeps all eight dimensions. Both sentiment fields are **exempt from the
  downward-uncertainty rule** and both return `"NA"` on a no-transcript row.
  **Section 1.1 added 2026-08-19 ([../CHANNELS.md](../CHANNELS.md) PCA-04)** — the prompt now describes
  its own input. Transcripts arrive as `agent:` / `customer:` prefixed lines, and three artefacts in
  them were about to be scored as behaviour. **The recorded IVR preamble is prefixed `agent:` and names
  भारत गैस**, so `greeting`, checkpoint 1 and dimension 1 would have passed on *every* call — they are
  now judged on the agent's first real turn *after* that block, and hold-music lyrics transcribed as
  agent speech are ignored entirely. **System and tool text also carries a speaker prefix** (a
  transfer-failure notice arrived under `customer:`) — it is event evidence for `containment` and
  `callResult`, never speech, never quoted, and it sets no language or sentiment. And **ASR partials
  are not repetitions**, which `customerEffortScore` would otherwise have counted on nearly every call.
  **Extended to the other two analysers 2026-08-19 ([../CHANNELS.md](../CHANNELS.md) PCA-05).** All three
  CRC post-call prompts read the same platform transcript, so `vaaniQA` and `postCallAnalysisFlat` now
  carry the transcript-format block too — and `postCallAnalysisFlat` also takes PCA-03's
  `customerSentiment` rewrite, having carried the identical collapsing definition. **`agentTone` is
  deliberately NOT ported to either**: Vaani's tone comes from her prompt, not the call, so the column
  would score the prompt. **The IVR block is optional on every channel**, and Vaani's fixed first line
  (*"नमस्ते, मेरा नाम वाणी है…"*) is the boundary between recording and agent. **PCA sees no tool calls
  and no tool results** — no rule may assume otherwise; `callTransferred` is judged from what follows the consumer's request — a platform message that the transfer did not connect, or the call leaving the agent's hands (TOOL-07: there is no spoken transfer line any more).
  Two defects fixed in the same pass: `vaaniQA`'s PART C still said *"THERE IS NO TRANSFER IN THIS
  CHANNEL"*, contradicting its own C5, and the filler allowance was cut from four to
  **`"अच्छा"` and `"hmm"` only** — with **CLS-03's live carve-out narrowed to match in eight agent
  prompts**, so QA cannot flag an opener the agents are told they may use.
  ✅ The client's reference transcript is unmistakably a **Vaani** call, so a routing error was raised
  and **ruled out — client confirmed 2026-08-19 that this analyser receives only human-answered calls**,
  and the sample showed the transcript *shape*, not its subject. Should that ever change, §3.2's staff
  latitude would wrongly exonerate Vaani, for whom each of those allowances is an ESC-01 violation.
  **It deliberately diverges from
  `postCallAnalysisFlat` and from CC — do not reconcile.** Note it also records staff latitude that
  Vaani does not have (a number, an office visit, a price, a callback are not risks for a person);
  that is scoped to this analyser and changes no live prompt. The earlier CONTEXT fix (2026-08-11,
  the false *"there is no call transfer"* paragraph) is superseded by this rewrite.
- **BAN-01 and CPL-08 are shared-truth fixes currently living in CRC only** (2026-08-05, client-scoped).
  CC carries the identical ban-list gap and the identical `FAILED TURN` clause, and is exposed to both.
  Port them before the next CC complaint-path or routing change. **GCD-05** is CRC-only by nature —
  CC has no `crcOffice*` pair to confuse with the distributor's.
- **OTP-01 (landed 2026-08-17, CC pending)** — the delivery O T P is **correct process, never a
  grievance**: it reaches the consumer by SMS on their registered mobile number and the delivery
  person hands the cylinder over only after receiving it. No CRC agent registers or routes a
  complaint because it was asked for; the explanation *is* the resolution. Registering starts only
  where the consumer **gave** the O T P and the refill still did not arrive — and then for the
  non-delivery, never for the O T P. It is also the one carve-out to the PII "never share an O T P"
  rule: shared at the door, with the delivery person, and nowhere else. Thirteen files; see
  [../CHANNELS.md](../CHANNELS.md) **OTP-01**. Port to CC before the next CC delivery-path change.
- **NAME-01, NAME-02, NAME-04** in [../CHANNELS.md](../CHANNELS.md) §3 apply here too.

---

## Before you edit

1. Never create `.bak` copies of prompt files. Edit in place.
2. Ask: is this change **shared truth** or **CRC policy**? Shared truth lands in CC too, this
   session. CRC policy gets a row in [../CHANNELS.md](../CHANNELS.md).
3. If you are porting from CC, translate the axes: a `calltransfer` block has **no valid CRC
   translation** — it becomes a COMPLAINT ESCALATION block (Axis 1). A CC callback block loses its
   time capture entirely. Third-party phrasing becomes insider phrasing. Check both, separately — a
   block can have the right escalation and still leak the wrong persona.
4. **"आप हमारे office आ सकते हैं" is no longer a valid ending to a problem.** If you find one
   outside the hotplate/KYC carve-outs, it is a leftover from the retired policy — it becomes a
   complaint.
