# bpcl_complaint_status — design (CRC)

Status: **implemented 2026-10-05 in every CRC complaint agent**, on branch `crc-complaint-status`.
Ledger entry: [../../CHANNELS.md](../../CHANNELS.md) **CST-01**. Commits: `92f986c` (agents), `55924a1`
(QA and post-call). The pilot planned for `postDeliveryAgent` alone was widened to every agent that
registers complaints, at the client's request.

---

## 1. Why

Until now every CRC agent was told that nobody on the call could look up an earlier complaint. A
consumer asking "पिछली complaint का क्या हुआ?" therefore got a **new** complaint ("raised before, no
response", reason "others"), and Vaani was forbidden to ask for the old number or offer to check it.
The new tool lets Vaani read the old complaint's status first, then decide with the consumer
whether a new one is needed.

## 2. The tool

| | |
|---|---|
| **Name** | `bpcl_complaint_status` |
| **Input** | `complaintNumber` only, exactly 8 digits (client clarification 2026-10-06), given by the consumer. No mobile number. |
| **Output** | `complaintStatus` and `comments` |
| **`complaintStatus` values** | `New`, `In Progress`, `On Hold`, `Escalated`, `ReOpen`, `Closed`, or an error value (`Error`, `Case not found` or similar) |
| **`comments`** | Free text written by the BPCL person handling the complaint |
| **Not available** | Looking up the last 3 cases by mobile number alone |

## 3. Scope

- **CRC only** (`bpcl_prompts/bpcl_showroom_crc`).
- **Holds the tool (11):** the ten `bpcl_create_complaint` agents (`bookingEligibleAgent`,
  `bookingNonEligibilityAgent`, the four delivery agents, `paymentAgent`, `subsidyAgent`,
  `connectionServicesAgent`, `genericInfoComplaintAgent`) and `unregisteredComplaintAgent`.
- **Routing only:** `routingAgent` routes a follow-up by the problem underneath. The owning agent
  checks the status, and a bare status request goes to `genericInfoComplaintAgent`.
- **Unchanged:** `Default` still routes on the consumer's problem. A bare status request with no
  placeable topic already falls to `genericInfoComplaintAgent`. Also unchanged: the three
  `getConsumerDetails` prompts, `emergencyAgent`, `newConnectionAgent_onHold` (it has no complaint
  tool, so a follow-up there is a different problem and routes) and the parked
  `newConnectionAgent.txt`.
- **Not ported:** CC and the Hindi/multilingual copies on the `multilingual-vijay-*` branches.
- **Persona:** every agent was already "You" (VOICE-01, `8038cc6`, merged into this branch first).

## 4. The flow (the `COMPLAINT STATUS` block, identical in all eleven)

**When Vaani checks**
- The consumer wants an update on an earlier complaint.
- Or a complaint is due and the consumer has said they already complained about this problem. The
  check comes before the grievance carve-out and before any first-turn registration.
- Never: asking whether they complained before, bringing up an earlier complaint herself, checking
  a complaint registered earlier in the same call, or switching to have it checked.

**Getting the number**
1. Taken from the call, or from handoffSummary's Context, if the consumer already said it.
   Otherwise she asks, as one question on its own turn.
2. No number → it is in the SMS they received; she waits. She asks for the eight digit
   complaint number; anything that is not eight digits is simply asked for again. She never reads back
   or checks a number that is not eight digits.
3. She reads it back in English digit words and asks whether it is right. She never calls on an
   unconfirmed number.

**The call:** the call alone, same turn shape as `bpcl_create_complaint` (TOOL_CALLING.md). The
only key is `complaintNumber`.

**What she tells them, in this order:** the status first, then what the comment says about the
complaint's progress, in at most two sentences of her own Hindi. Never the comment's English, never
a name, phone number, amount, date or code from it, and nothing added to it. An empty or unclear
comment → the status alone.

The table below is for people reading this doc. **It is deliberately not in the prompts** (CST-02):
a list of outcome meanings was copied as a fake status on a live test call.

| Status | What Vaani conveys |
|---|---|
| New | Registered, not yet taken up by the team |
| In Progress | The team is working on it |
| On Hold | Paused for now (the comment usually says why) |
| Escalated | Raised to a senior level |
| ReOpen | Closed earlier, opened again for action |
| Closed | Marked resolved and closed |

**After the status** (CST-06, 2026-10-06: a new complaint only after Closed, Error or Case not found)
- **Still open — New, In Progress, On Hold, Escalated, ReOpen:** no new complaint for the same
  problem, never registered and never offered, and no transfer offered because of it. Vaani helps
  herself from the status, the comment and her own knowledge.
- **They insist anyway:** she says the earlier complaint already exists and is still open (naming
  its status), so a new one cannot be made for the same problem. A different problem can have its
  own complaint. Said fresh each time; nothing is registered.
- **A request for a person** follows each channel's existing transfer rules, unchanged.
- **Closed and accepted:** nothing more. **Closed and the problem still stands:** registered if
  they ask, otherwise one offer (CC: one offer; lite_zip: the name turn).
- **The new complaint's summary** names the old number, the checked status and why they are
  unhappy. That is the one place a checked status enters `complaintSummary`.
- **Another domain's problem:** a new complaint for it is routed. The Result stays in the call, and
  the next agent answers from it without checking again.
- **Underweight:** the check first, then the verify-first block if they are not satisfied.
- **An O T P-only complaint:** may be checked, but is never re-registered.
- **`unregisteredComplaintAgent`:** a new complaint starts at its OFFER-AND-NAME turn, and the
  check itself needs no consumer record.

**When no status comes back**
- **Case not found:** one more, different number. The same number is never checked twice.
- **Error:** the tool is down for the rest of the call.
- **No number at all, or no status found**, while the problem still stands: the old rule applies, a
  new complaint saying they raised it before and got no response.

**Limits:** two checks per call, counted by Results and call-scoped across switches. Checks and
complaints never count against each other's limits.

## 5. What changed in each agent

| Rule | Change |
|---|---|
| Line 2 (the ten) | A `COMPLAINT STATUS` directive under the complaint directive |
| TOOL BLOCKER / tools list | `bpcl_complaint_status` added |
| HOW YOU USE YOUR TOOLS | A line for the new tool |
| NOT KNOWING SOMETHING… | "The one lookup you hold is narrow…" |
| YOU NEVER ASK… ANY OTHER IDENTIFIER | "The one thing you may ask for is an earlier complaint's number…" |
| SOURCE GATE | The consumer's own read-back number is an allowed source |
| TOOL RECOVERY, "a tool has been used only when…" | The status check is included |
| The grievance carve-out | "One thing comes before it… COMPLAINT STATUS runs first" |
| COMPLAINT FOLLOW-UP (new in `bookingEligibleAgent`, `connectionServicesAgent`, `subsidyAgent`) | Points to COMPLAINT STATUS, plus what "the problem still standing" means in that domain |
| `postDeliveryAgent` NO CHECKING TURNS | The status call is the one lookup, still with no checking line |
| `postDeliveryAgent` / `genericInfoComplaintAgent` underweight override | Now overrides step 6, after the check |
| `bookingNonEligibilityAgent` Step 6A | States the block first if not yet said, then COMPLAINT STATUS |

## 6. QA and post-call

| File | Change |
|---|---|
| `vaaniQA.txt` | F10 (the flow is confirmed-correct), C29 (what is reportable), and pointers from A11, A16 and C23 |
| `postCallAnalysisFlat.txt` | An earlier complaint's status is not a registration; an accepted status is `issueResolved`; `repeatCaller` "yes"; issue example "earlier complaint status check" |
| `postCallAnalysisHuman.txt` | An earlier complaint's status is not a registration; `repeatCaller` "yes"; an accepted status is issueResolved |

## 7. Decisions log (2026-10-05)

| Question | Decision |
|---|---|
| New agent or the specialist agents? | The specialists, and all of them, not just `postDeliveryAgent` |
| Mobile number? | Not used at all |
| Consumer has no number | Tell them it is in the SMS they received, and wait |
| Error response | `complaintStatus` carries `Error` / `Case not found` or similar |
| Lookups per call | 2 |
| What is shared | The status first, then the comment's progress; nothing more |
| When to ask for the number | When they want an update, or when a complaint is due and they say one exists |
| Consumer insists on a new complaint | Only after Closed, Error or Case not found (CST-06). While the complaint is open: tell them it already exists and is in progress, so not for the same problem; a different problem can be registered |
| Transfer | No transfer offered because of a status; each channel's existing transfer rules apply unchanged (CST-06) |
| Underweight | Lookup first, then the underweight block |
| `Default` | Unchanged |
| Turn shape | The same as `bpcl_create_complaint`: the call alone |

**Choices made while writing the prompts, without a client ruling** (also in CST-01):
- No date, amount, name, phone number or code is spoken out of `comments`.
- After a failed check, a new complaint is registered only while the problem still stands.
- The status meanings are English instructions with no Hindi outcome lines (TOOL_CALLING.md rule 4).

## 8. Open

- **Platform:** expose `bpcl_complaint_status` to all eleven agents with a schema holding exactly
  `complaintNumber`, and surface its Result on the next turn.
- **Client:** does the tool find complaints registered through `bpcl_create_unregistered_complaint`?
  If not, `unregisteredComplaintAgent` will always hit "Case not found".
- **Not ported:** CC and the multilingual channels.
