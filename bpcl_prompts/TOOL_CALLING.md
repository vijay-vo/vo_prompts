# TOOL_CALLING.md — the tool-calling method that works

**Status: confirmed working (client, 2026-09-29).** After the CRC fixes up to CPL-27 and NUM-08,
Vaani invokes every tool correctly: `bpcl_create_complaint`, `calltransfer`, `callhangup`,
`switchagent` and the rest. She no longer writes the call out as text, narrates it, or speaks an
outcome with no Result behind it.

**This is the reference.** Every new prompt, every port (CC, IVRS, multilingual) and every future
edit to a tool block aligns with it. If tool calling breaks again, start at §4 before trying
anything new. Most of the failures listed there have already happened once.

Reference channel: **`bpcl_showroom_crc`** (Hindi). CC still carries the older line-plus-call
contract (CPL-03, XFER-01) and has **not** been ported. See §5.

---

## 1. The failure this fixed

The agent **wrote the tool call out as text** instead of invoking it. For example,
*"मैं आपकी शिकायत दर्ज कर रही हूँ"* followed by `bpcl_create_complaint(caseId=123, …)` as spoken
text. It then read out a complaint number that no tool had returned. The same thing happened with
`calltransfer` and `callhangup`. Every number spoken on those calls was invented (CPL-27, 28-09).
Earlier forms of the same failure: CPL-11/12, CPL-17, CPL-19, TOOL-06, CPL-21, CPL-23, CPL-26.

---

## 2. The method: eight rules

1. **The tool call is the action.** The platform never invokes a tool for the agent. Only a
   **Result** proves a tool ran. An outcome with no Result behind it is never spoken (TOOL-01, CPL-21).

2. **A tool that acts is not announced.** No sentence before or alongside the call says what is
   about to happen. Once an announcing sentence exists, the model types the call out after it
   instead of invoking it (the CPL-19 mechanism, CPL-27). This covers "I am registering it",
   "connecting you" and "one moment while I check".

3. **Each tool has a fixed turn shape (CRC):**

   | Tool | The turn | After the Result |
   |---|---|---|
   | `bpcl_create_complaint`, `bpcl_create_unregistered_complaint` | The call alone. No text, no `preToolMessage` (TOOL-06). | Read the tool's message and do what it says in natural Hindi. Never read its English aloud (CPL-22). |
   | `bpcl_complaint_status` (CST-01) | The call alone, exactly like `bpcl_create_complaint`. No text, no `preToolMessage`. Only after the consumer has confirmed the number read back to them. | The status first, then the comment's progress, in natural Hindi. Never its English, and never a name, number or date out of the comment. Two per call; none after an `Error`. |
   | `calltransfer` | The call alone. No text, no `preToolMessage` (TOOL-07). | Success → nothing; the platform closes the call. Failure → say the team could not be reached, using only the window the Result gave. Once per call (XFER-05). |
   | `callhangup` | The closing line as the agent's own text, with the call on the same turn. | No text (TOOL-08). |
   | `switchagent` | A short anchor line as text, plus `agentName` and `handoffSummary`. | — |

   **No CRC tool takes a `preToolMessage`.**

4. **No scripted outcome lines.** The prompt holds no example Hindi line for complaint success,
   failure or already-registered. The model copied those lines *instead of* calling the tool
   (CPL-22, CPL-23, CPL-24). The outcome comes from the tool's message and nowhere else.

5. **Warmth never takes the complaint's place.** The empathy rule says every warm sentence carries
   "a fact, an answer, or a next step". On a grievance the only next step available was "I am
   registering it", and that brought back rule 2's announcement. So **a complaint about to be
   registered is never that next step.** The complaint turn is the call alone, and the warmth comes
   on the next turn along with the tool's message (CPL-27).

6. **The directive comes first, with the tool name and no backticks.** The complaint directive is
   line 1 of every complaint-registering agent (CPL-25). The tool name stays in the directive,
   because the client confirmed it helps, but no backticks go around it: the model spoke the
   backticks aloud (CPL-27). No live CRC prompt contains a backtick. A tool name is never spoken to
   the consumer (TOOL-08).

7. **The prompt and the tool schema agree key for key.** This is the client's diagnosis (CPL-27)
   of why `switchagent` always worked and the other three did not. `switchagent` is the only tool
   whose prompt `Parameters:` block names exactly the keys the schema asks for, each with its value.
   When the schema asks for keys the prompt never teaches, the model fills every one of them with
   placeholders, as text. The rules:
   - `bpcl_create_complaint` takes **exactly two** keys: `complaintSummary` and `complaintReason`.
     The set is closed by rule. Any other key belongs to the platform, and a field that comes back
     in a Result is never passed back in as an input (PARAM-01).
   - `bpcl_complaint_status` takes **exactly one** key: `complaintNumber`. No mobile number and no
     consumer id (CST-01).
   - The schema for every tool holds only what its prompt teaches. When a tool needs a new key,
     it goes into the prompt's `Parameters:` block with its value in the same change.
   - Never write code-shaped call syntax such as `tool(key=value)` in a prompt. It teaches the model
     to write the call out as text (CPL-11).

8. **Recovery is based on state.** If the agent decided to use a tool and no Result followed, the
   tool never ran. The agent invokes it on the next turn before doing anything else, and speaks no
   number (CPL-03). A complaint is registered once per issue, never retried after a failure, and at
   most twice per call. Transfer and complaint-failure limits carry across a `switchagent`
   (XFER-05, CPL-20). So does the status check: two per call, none after an `Error` (CST-01).

The complaint number comes **only from the tool's message**. It is spoken as English digit words
separated by `" - "`, never as one whole number or as an amount (NUM-01, NUM-08).

---

## 3. What not to reintroduce

Each of these has broken tool calling at least once:

- A "registering" / "transferring" / "checking" line before or alongside an action tool.
- `preToolMessage` on any CRC tool.
- Example Hindi lines for any complaint or transfer outcome.
- A warmth or empathy rule that can be satisfied by announcing the complaint.
- Backticks, or `tool(key=value)` syntax, anywhere in a live prompt.
- A tool key in the platform schema that the prompt does not teach, or a prompt key that the
  schema does not have.
- Any outcome or number spoken with no Result behind it.

---

## 4. If tool calling breaks again

Work through these in order. They are ranked by how often each one caused the failure:

1. **Look for an announcing sentence.** Is there text on the tool turn? If so, find the rule that
   produced it (an empathy rule, a scripted line, an example, a "tell them you are …" instruction)
   and remove it. Don't add a ban on the sentence. Naming the unwanted phrase teaches it (TOOL-02).
2. **Compare the schema with the prompt.** List the keys in the platform's tool definition next to
   the prompt's `Parameters:` block. Every difference is a suspect (rule 7).
3. **Look for scripted outcomes.** Any example line for success, failure or a repeat complaint is
   something the model can copy instead of calling (rule 4).
4. **Look for code-shaped text.** Search for backticks, `(key=value)`, JSON-looking parameter
   examples and quoted tool names in speech (rule 6, rule 7).
5. **Check where the directive sits.** Is the tool directive still at line 1, carrying the tool
   name?
6. **Check the recovery path.** A second call where only one was expected usually means the first
   attempt was typed out and never ran. It does not mean the recovery rule is wrong (CPL-27,
   "Deliberately NOT changed").

Record whatever you find as a ledger row in [CHANNELS.md](CHANNELS.md), citing this file.

---

## 5. Where this applies

| Channel | Status |
|---|---|
| CRC (`bpcl_showroom_crc`) | **Reference. Confirmed working 2026-09-29.** |
| CC (`bpcl_contact_center`) | Not ported. Still on line-plus-call (CPL-03, XFER-01). Port this method, keeping CC's escalation axis (CC keeps `calltransfer` as its escalation). |
| IVRS / multilingual (branch `multilingual-vijay-contact-center`) | The CPL-22 complaint method came from IVRS. Check CPL-25/27 and NUM-08 against it before the next change there. |

Ledger rows behind this method, oldest to newest: CPL-03, CPL-11, CPL-19, PARAM-01, TOOL-01…08,
CPL-21, CPL-22, CPL-23, CPL-24, CPL-25, CPL-27, NUM-08.
