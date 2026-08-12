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
leaves, `newConnectionAgent_onHold`, `routingAgent`, and `getConsumerDetails`. There is no transfer
agent and nothing to switch to. `Default` and `emergencyAgent` still carry an explicit
*"`calltransfer` — NOT AUTHORIZED"* clause.

**`{{crcOfficeNumber}}` is deleted.** It was removed from all 13 prompts and from `promptQA` on
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
stalling. The confirming question belongs in exactly two places, both where Vaani is the one raising
it: **T3**, and `getConsumerDetails`' no-data closing.

**The transfer turn speaks nothing of its own.** `calltransfer` is invoked exactly the way
`callHangup` is: the agent generates **no text**, and passes **exactly one parameter** —
`preToolMessage: "आपकी कॉल ट्रांसफर की जा रही है"`. Nothing else goes with it: no `agentName`, no
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
agent produces **nothing** — no text, no `callHangup`; the platform closes the call, and hanging up
there would cut the consumer off from the person they were just connected to. **Failure** —
out-of-office-hours, a platform-side failure, busy, or no-answer, all handled identically — → no tool
that turn; the agent says the team could not be reached and states when they can be reached, in
Hindi words, **from what the Result carried and from nowhere else**. If the Result names no window,
it names none: *"अभी हमारी senior team से सम्पर्क नहीं हो पा रहा, कृपया कुछ समय बाद call कीजिए।"*
Closing is gated on the consumer: the agent **never closes in the same turn as the bad news**, keeps
answering until they actually accept ("ठीक है", "समझ गया", "फिर call करूँगा", a goodbye) or the line
is dead through two waits, and only then calls `callHangup`. Turn count is never a reason to close.
`calltransfer` runs **once per call** and is never retried.

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
   `"आपकी समस्या क्या है, मैं दर्ज कर देती हूँ?"`
3. **Confirm only what is new and consequential** — never re-confirm what the consumer said plainly.
   When the issue is already clear, spend **no** confirmation turn: the one-line summary rides inside
   the registering line itself (`"आपकी शिकायत दर्ज कर रही हूँ कि सिलेंडर अभी तक नहीं आया — एक मिनट रुकिए।"`),
   so the consumer hears what is being filed and can correct it (CHANNELS.md CPL-05).
4. **Speak that line AND invoke `bpcl_create_complaint` on the same turn.** The platform registers
   nothing — the tool runs only because the agent invoked it. A registering line spoken with **no**
   tool call is a **failed turn**: nothing exists, and the next turn invokes the tool before anything
   else and speaks no number. The agent's own spoken line is never evidence the tool ran; only a
   Result is (CHANNELS.md CPL-03). `feedbackDescription` is the consumer's real problem in English —
   never "consumer asked for a senior team" alone. `reason` is the exact matching phrase from **that
   agent's own scoped reason list**, or `others` when nothing matches — never invented (CPL-05).
5. **On success** speak the complaint number **digit by digit in English digit words with `" - "`**
   (NUM-01; Hindi digit words only on consumer preference — CC still uses Hindi words), say it will also
   arrive by SMS, then say the team will make contact. No timeframe is ever promised.
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

**The close question is a turn of its own, and the gate is the consumer's last turn** (CLS-03).
`"क्या कुछ और L P G से related help चाहिए?"` is never in the same turn as anything else — CLS-01
already said that and it still fired eleven times on one call, because the "fully resolved"
definition three lines below granted permission the moment a complaint number was spoken. **That
clause is deleted.** A topic is resolved only when the consumer's own last turn carried nothing
further — no question, no new fact, no fresh grievance. A registered complaint never makes a topic
resolved. **If they never wind down, the question is never asked**: there is no turn cap and no
forced close, and a call that never reaches it is correct.

**Standard success line** (identical in all ten complaint-capable agents):
`"आपकी complaint register हो गई है। आपका complaint number है [digit by digit]. यह number आपको SMS पर भी send किया जाएगा। हमारी team आपसे संपर्क करेगी।"`

**No callback time is ever captured.** CC asks the consumer for a callback slot and writes it into
the complaint; CRC does not. We register and say the team will call — nothing is scheduled.

**Complaint already registered this call?** Never register a second one for the same issue, and
never treat a later "senior से बात कराओ" as a new complaint. Say:
`"आपकी complaint register हो गई है, हमारी team आपको call करेगी।"` and go to close check.

**On `bpcl_create_complaint` failure** — never retry, and never fall back to "register a complaint"
(the tool is what just failed). Say exactly:
`"माफ़ कीजिए! अभी complaint register करने में तकनीकी समस्या आ रही है। कृपया थोड़ी देर बाद call कीजिए।"`
Never invent a complaint number.

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
- **No consumer record.** `getConsumerDetails` still has no complaint tool — with no record there is
  nothing to attach a complaint to. **It now holds `calltransfer`, and no `switchagent` at
  all** (never `routingAgent`, never `Default`, never a specialist). Its no-data closing
  is: *"I can't help without your record, our senior team can — क्या मैं आपकी call connect कर दूँ?"*
  → on yes, switch; on no, `callHangup`. The three-piece dictation loop is **retired** and the office
  hours line with it (../CHANNELS.md XFER-01, superseding GCD-03 and GCD-04's hours clause).

### Who can register, and the one routing hop

Ten agents hold `bpcl_create_complaint` and register in place. Three do not, and **never get it**:

- `Default` — triage only. Its STAGE 0 escalation interrupts route via **STAGE 3** to
  `genericInfoComplaintAgent`, exactly as INTERRUPT A already routes a hazard to `emergencyAgent`.
- `newConnectionAgent` — escalates via `newConnectionAgent → routingAgent → genericInfoComplaintAgent`.
  Leaf-to-leaf switching is forbidden, so `routingAgent` is the only legal path.
- `getConsumerDetails` — see above; it cannot escalate at all.

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
> registered complaint. `promptQA` **C8 is retired**; C7 now says the third-party framing is correct.
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

**Tools:** `switchagent`, `callHangup`, `bpcl_create_complaint`, `validatecontactno`,
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

**Folder naming defect:** this workspace uses `genericInfoComplaint/`; CC uses
`genericInfoComplaintAgent/`. Canonical is `genericInfoComplaintAgent` (NAME-03).

**`getConsumerDetails` now holds `calltransfer` and no `switchagent`** (XFER-03). It is also the
**deployed** entry prompt again — `getConsumerDetails.txt` ships, `getConsumerDetails_MultiToolVersion.txt`
is the QA-environment tool-testing prompt, and `getConsumerDetails_MobileVersion.txt` is **deleted**
(git history only, along with `prompts/callTransferAgent/`).
Its exits are: data found → stop speaking, the platform resumes the call into `Default`; no data →
tell the consumer their record isn't available, offer to connect them to the senior team, and either
call `calltransfer` on a yes or `callHangup` on a no. That platform-owned hop into
`Default` is still described by no prompt — see the open items below.

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
- **GCD-01 (stale)** — this note referenced a `getConsumerDetails_v2.txt` that no longer exists in
  this workspace; only `getConsumerDetails.txt` is present. Remove this item if a future pass
  confirms it stays gone.
- **DOC-01** — [agent-workflow.md](docs/agent-workflow.md) §7 links to `customerStatus-spec.md`,
  which does not exist in this workspace. CC has `CUSTOMER_STATUS_SPEC.md`; CRC has no counterpart.
- **The undocumented `getConsumerDetails` → `Default` hop** (agent-workflow.md §11.3) — works only
  if the platform owns that transition. Worth confirming with the platform team.
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
- **`getConsumerDetails_MultiToolVersion` still carries the `{{crcOfficeNumber}}` dictation closing**
  (NUM-04's twelve-digit flow) while being the QA prompt for a channel where that variable does not
  exist. Its no-data ending needs porting to `getConsumerDetails.txt`'s `calltransfer` ending before
  QA can exercise the shipped flow.
- **`postCallAnalysisHuman.txt` — CONTEXT fixed 2026-08-11, subject framing still open.** Both it and
  `postCallAnalysisFlat` carried a CONTEXT paragraph saying *"there is no call transfer … no senior
  team exists to hand the call to live"* and describing the deleted `{{crcOfficeNumber}}` dictation —
  false since XFER-01 and directly contradicting the calltransfer text elsewhere in the same file.
  Both now describe the XFER-03 inline transfer. **Still open:** whether this file is genuinely the
  human-agent analyser, since its CONTEXT names *"the BPCL LPG agent (Vaani)"*. Its empathy
  checkpoint no longer conflicts with anything — CLS-03 retired the ban.
- **BAN-01 and CPL-08 are shared-truth fixes currently living in CRC only** (2026-08-05, client-scoped).
  CC carries the identical ban-list gap and the identical `FAILED TURN` clause, and is exposed to both.
  Port them before the next CC complaint-path or routing change. **GCD-05** is CRC-only by nature —
  CC has no `crcOffice*` pair to confuse with the distributor's.
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
