# bpcl_complaint_status — plan (CRC pilot)

Status: **design finalized 2026-10-05, not implemented.** No prompt file has been changed. The
prompt work starts only when Vijay says so. Branch: `crc-complaint-status`.

---

## 1. Why

Today every CRC agent is told that nobody on the call can look up an earlier complaint. A consumer
asking "पिछली complaint का क्या हुआ?" therefore gets a **new** complaint ("raised before, no
response", reason "others"), and Vaani is forbidden to ask for the old number or offer to check it.
The new tool lets Vaani read the old complaint's status first, then decide with the consumer
whether a new one is needed.

## 2. The tool

| | |
|---|---|
| **Name** | `bpcl_complaint_status` |
| **Input** | `complaintNumber` only, 6 to 8 digits, given by the consumer. No mobile number. |
| **Output** | `complaintStatus` and `comments` |
| **`complaintStatus` values** | `New`, `In Progress`, `On Hold`, `Escalated`, `ReOpen`, `Closed`, or an error value (`Error`, `Case not found` or similar) |
| **`comments`** | Free text written by the BPCL person handling the complaint |
| **Not available** | Looking up the last 3 cases by mobile number alone |

## 3. Scope

- **CRC only**, and **only `postDeliveryAgent`** for the pilot.
- **`Default` is not changed.** It keeps routing on the consumer's problem, not on the earlier
  complaint.
- Every other file the pilot needs changes too: QA, post-call analysis and docs (section 6).
- The `postDeliveryAgent` persona stays in its current "I" voice for this pilot.

**Pilot limitation:** the platform sends a consumer to `postDeliveryAgent` only when their latest
refill shows as delivered. A follow-up about a booking, a payment or a cylinder that never arrived
reaches another agent that has no lookup yet. Testing needs a consumer whose latest refill is marked
delivered.

## 4. The flow

**When Vaani looks it up (trigger)**
- The consumer wants an update on an earlier complaint.
- Or a complaint is about to be registered and the consumer says one already exists. She checks
  that complaint's status first, then decides what to do next.
- She does **not** ask for the number when the consumer is only raising the problem again and the
  delivery record answers it.

**Getting the number**
1. She asks for the complaint number, as one question on its own turn.
2. She reads it back in English digit words ("four - five - one - ...") and asks whether it is right.
3. If they say no, or it is not 6 to 8 digits, she asks once more. A 10-digit number is probably
   their mobile number; she says so and asks for the complaint number.
4. If they don't have the number, she tells them it is in the SMS they received, and waits.

**The call**
- Only after the consumer confirms the number.
- Same turn shape as `bpcl_create_complaint` (TOOL_CALLING.md): the call alone, no text, no
  `preToolMessage`, nothing spoken until the Result arrives.

**What she tells them, in this order**
1. **The status first**, its meaning in plain Hindi.
2. **Then the comment**, paraphrased in Hindi, only the part about the complaint's progress. Never
   read out the English. No staff names, phone numbers or internal notes, and nothing the comment
   does not say: no promises, no dates of her own.

If the comment is empty or unclear, she gives only the status.

| Status | What Vaani conveys |
|---|---|
| New | Registered, not yet picked up by the team |
| In Progress | The team is working on it |
| On Hold | Paused for now (the comment usually says why) |
| Escalated | Sent to a senior level |
| ReOpen | Closed earlier, opened again for action |
| Closed | Marked resolved and closed |

**Limits**
- At most **2 lookups per call**.
- **Case not found:** she asks for the number once more (this uses the second lookup).
- **Error:** no more lookups for the rest of the call.
- If no status can be found, today's behaviour applies: a new complaint saying the consumer raised
  it before and got no response.

**After the status**
- **The consumer insists on a new complaint:** register it, whatever the old status is.
- **Dissatisfied but not asking:** offer a new complaint once and let them decide.
- **Satisfied:** no new complaint. Wait for them.
- The new `complaintSummary` names the old complaint number, its status and why they are unhappy.
- The existing complaint limits still apply: once per issue, at most two per call, and never
  retried after a failure.

**Underweight cylinder:** look up the status first. If they are not satisfied, the existing
underweight verify-first block takes over, instead of going straight to a new complaint.

## 5. Rules in postDeliveryAgent that change (line numbers on `1dc6ad6`)

| Where | Today | Change |
|---|---|---|
| Line 1 directive | `bpcl_create_complaint` only | Add the status tool |
| Tool definitions | No lookup tool | Add `bpcl_complaint_status` with a `Parameters:` block holding exactly `complaintNumber` (TOOL_CALLING.md rule 7) |
| Line 21, NO CHECKING TURNS | "I have no lookup" | Carve-out for this tool |
| Line 52, SOURCE GATE | A spoken number comes only from a Result or an injected variable | Allow the read-back of the consumer's own complaint number |
| Line 163, TOOL NAMES | Tool names never spoken | Unchanged, now covers the new tool |
| PATH 4 follow-up, lines 502-504 | "never ask for the old complaint number… never offer to check its status"; new complaint straight away | Rewritten to the flow in section 4 |
| Underweight exception, line 504 | Underweight skips the follow-up shortcut | Lookup first, then the underweight block |

## 6. Other files that change

| File | Change |
|---|---|
| `postCallAnalysis/vaaniQA.txt` | C23 flags at high severity any non-getConsumerDetails agent asking for an identifier or using a lookup tool. Add an exception for this tool and the complaint number in `postDeliveryAgent`, plus checks for the new flow (read-back before the call, status before comment, no names or numbers from the comment, limit of 2) |
| `postCallAnalysis/postCallAnalysisHuman.txt`, `postCallAnalysisFlat.txt` | A status-only call can be resolved; asking for the complaint number is not "customer effort increased" |
| `bpcl_prompts/CHANNELS.md` | New ledger entry |
| `bpcl_prompts/TOOL_CALLING.md` | Turn-shape table row for the new tool |
| `bpcl_showroom_crc/CLAUDE.md` | Tools list |

## 7. Decisions log (2026-10-05)

| Question | Decision |
|---|---|
| New agent or the specialist agents? | The specialists hold the tool. Pilot in `postDeliveryAgent` only |
| Mobile number? | Not used at all |
| Consumer has no number | Tell them it is in the SMS they received, and wait |
| Error response | `complaintStatus` carries `Error` / `Case not found` or similar |
| Lookups per call | 2 |
| What is shared | The status first, then the comment's progress content; nothing more |
| When to ask for the number | Only when they want an update, or when a complaint is about to be registered and they say one exists |
| Consumer insists on a new complaint | Register it, whatever the status |
| Underweight | Lookup first, then the underweight block |
| Persona conversion | Not in this pilot |

## 8. Later (not in this pilot)

- Roll out to the other complaint-capable agents with one identical block, plus one line per agent
  for what "still a problem" means there. routingAgent's COMPLAINT FOLLOW-UP line
  (`routingAgent.txt:140`) would change too.
- Contact Center and the multilingual channels.
