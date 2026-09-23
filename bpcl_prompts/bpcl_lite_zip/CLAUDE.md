# bpcl_lite_zip — channel contract

The **Bharat Gas Lite zip** channel. A standalone, **fully multilingual** voice agent whose whole
job is getting a caller to a Lite zip booking on the **Hello BPCL App**.

Read [../CLAUDE.md](../CLAUDE.md) for repo-wide conventions, but note this channel is **not** one of
the two Hindi channels described there. It shares neither their 15-agent topology nor their
Hindi-only voice rules. Where a rule below differs from CC or CRC, **the difference is deliberate**.

---

## 1. What is here

```
Default.txt                      the live call agent — greeting to goodbye
unregisteredComplaintAgent.txt   registers complaints, and nothing else
pcalitezip.txt                   post-call analysis (runs after the call, on the transcript)
```

Two agents, two prompts. `Default.txt` was `litezipAgent.txt` until 2026-09-23 — it was renamed
because **every call starts on the agent the platform calls `Default`**, and a filename that did not
say so was a standing invitation to deploy it under the wrong name.

---

## 2. The two ways this channel is unlike CC and CRC

**It is multilingual, not Hindi.** Vaani speaks whatever Indian language the caller speaks, in that
language's own script, and never English. Every number — the emergency helpline, the complaint
number — is spoken as **digit words in the caller's own language**, not CRC's English digit words.
When porting anything from CC or CRC, port the *intent*: their fixed Hindi lines have no place here,
and every spoken turn in these prompts is given as **content beats** for the model to word itself.

**The App is the only route to a Lite zip booking.** There is no counter, no SMS, no IVRS, no
missed-call and no WhatsApp booking path for it, and the App assigns the distributor itself after
payment. Vaani never sends anyone to a distributor office **to make a Lite zip booking or to apply
for a standard new connection** — the first has nowhere to go, the second is closed, and a wasted
trip is worse than saying no.

⚠️ **But the distributor is NOT scrubbed from this prompt, and must not be.** Where the distributor
genuinely owns something, Vaani still names them: a full commercial or industrial connection outside
Lite zip (BLOCK 3), office timings (G3), a hotplate (G4), Ujjwala eligibility (G7), and the fact that
the distributor and the App are how a reopening will become known (BLOCK 4). Those were briefly
removed on 2026-09-23 and **restored the same day on the client's instruction.** Do not remove them
again in the name of "App only" — that rule is about the *booking route*, not about erasing the
distributor.

---

## 3. Topology — two agents, and the loop between them

```
        ┌──────────switchagent──────────┐
        ▼                               │
     Default  ──switchagent──▶  unregisteredComplaintAgent
        │                               │
   callhangup                      callhangup
        ▼                               ▼
       end                             end
```

`Default` holds **two** tools: `switchagent`, with exactly one legal `agentName` —
`unregisteredComplaintAgent` — and `callhangup`. It holds no complaint tool and registers nothing
itself.

`unregisteredComplaintAgent` holds **four**: `get_pincode_data`,
`bpcl_create_unregistered_complaint`, `switchagent` (one legal target: `Default`), and `callhangup`.

**Either agent can end the call, and both end it the same way** — the CRC close pattern: help with
everything first, then ask whether any more help is needed **as a turn of its own**, and only on a
"no" write the goodbye as text and call `callhangup` on that same turn, with no `preToolMessage`. The
gate is the consumer's own last turn: a topic is finished only when their last turn carried nothing
further. There is no turn cap and no forced close, and a call that never reaches the question is
correct. Neither agent hangs up on a silence before the third rung of its silence ladder, in the same
turn as bad news, or while a gas hazard is live.

**Routing back to `Default` is deliberate**, and it is the one place this channel breaks CRC's
"nothing ever routes back to Default" rule. With two agents and no `routingAgent` there is nowhere
else to send someone who still wants booking help after a complaint. Platform-side this is confirmed
working.

**There is no `calltransfer` and no callback in this channel.** No human, no senior team, no
department, no number for anyone to call back on. Neither agent may offer, hint at, or promise one.
This is the sharpest divergence from both other channels — a `calltransfer` block ported from CRC has
**no valid translation here**; it simply has no equivalent.

**Switching is invisible**, exactly as in CC and CRC: one short line as the agent's own **text**, no
`preToolMessage` on any tool, nothing after the tool call, and never a word that reveals another
agent exists (transfer, connect, forward, team, department, specialist, agent).

**The tool call is the action.** Both prompts carry the `FAILED TURN` / `RECOVERY` rule: a spoken
line with no Result behind it means the tool never fired, and the agent's own sentence is never
evidence that it did. This is shared truth with CC and CRC and must stay identical in substance.

---

## 4. When a complaint is the right answer — the gate

This is the whole point of the channel's design, and it is easy to break. `Default` BLOCK 8.5 holds
the gate.

**Guidance is the solution. A complaint is not.** Almost everyone calling does not yet know how to
get gas; for them a complaint is a form filed *instead of* an answer.

**Never a complaint** — every one of these already has an answer in `Default`: the new-connection
closure (reason, reopening date, a pending application), price, city or area availability, sizes,
out of stock, how to book, documents, subsidy, Ujjwala, no smartphone, an existing-connection matter
(that is the helpline), anything outside BPCL LPG.

**A complaint is right** only for something that already happened and no guidance undoes: money
debited with no booking confirmed; paid and confirmed but never delivered; the delivery person
refused, demanded extra money, or behaved badly; the cylinder was wrong, damaged or short; the App
keeps failing to complete a booking after genuine retries.

**Asking for a complaint is not itself a reason.** Before switching, the agent must be able to state
in one sentence *what already went wrong*. "Register my complaint" about the closure, the price, or
their city not being covered gets another warm answer, not a switch. But a real grievance from the
list is registered **the first time they raise it** — no interrogation, no arguing.

---

## 5. The complaint tool contract

`bpcl_create_unregistered_complaint` behaves like CRC's `bpcl_create_complaint` — same discipline,
different parameters. It takes **exactly three**, and the set is closed by rule: any other key is the
platform's, whether or not the prompt names it, and a field that comes back in a Result is an output
that never goes back in as an input.

| Parameter | Value |
|---|---|
| `ConsumerDetailsConsumerName` | The caller's full name, **read back once and confirmed correct by them**, then held unchanged for the rest of the call. **Latin script**, title case, no honorific — spoken aloud in their own script, passed in English. Never a guess, a placeholder, or a name they corrected away from. |
| `complaintReason` | One of **nine fixed phrases**, copied character for character. |
| `complaintSummary` | One complete English sentence of what the caller said went wrong. The only record anyone ever sees. |

### The nine `complaintReason` values — copy exactly, never re-case

```
Bharatgas Mini New Connection Enquiry
Process for taking New Connection
Process to book the new connection through Website
Status of new connection
Non release of New Connection against waitlist
10 kg Bharat Gas Lite Zip cylinder
14.2 kg Subsidized domestic LPG connection
19 kg commercial connection
Industrial Cylinder (35/47.5/422 kg)
```

⚠️ **There is no `others` value and no free text.** `10 kg Bharat Gas Lite Zip cylinder` is the
**default**, and it is the right phrase for nearly every complaint this channel files — including a
5 kg Lite zip one, since no 5 kg phrase exists. The other eight are used only when the caller's
complaint genuinely is about that topic.

⚠️ **The casing is load-bearing.** A changed case, word or plural and the tool does not register at
all — silently, in production. The list above is the source of truth; if the backend's list ever
changes, this table and both prompts change in the same edit.

⚠️ **Note the capital `Zip`** in the reason value against the lowercase `zip` rule in §6. That is
intended: the reason is a backend value that is **never spoken**, so the TTS rule does not touch it.
Do not "fix" either one to match the other.

### `get_pincode_data`

Takes one parameter, `pinCode` — the six digits the caller confirmed. Its two outcomes:

- **Failure** (`Unable to fetch Get pincode data`) → tell the caller plainly, re-capture the pincode,
  try again. After a few honest attempts, stop and tell them to call later. **Never register without
  a successful fetch** and never promise contact — nothing was registered.
- **Success** (`Get pincode data fetched successfully.`) → say **nothing** about it and go straight
  to the complaint tool. Calling `bpcl_create_unregistered_complaint` next is **mandatory**: a
  successful pincode fetch on its own has registered nothing.

🚨 **The pincode is for the complaint and nothing else.** It is **never** a serviceability check.
Neither agent may ever say whether Lite zip is available in a caller's area, name their city back at
them, or read any part of the Result aloud. This is written in capitals in both prompts on purpose —
it directly contradicts `Default`'s Z12 and HARD CONSTRAINT 6 (*never ask for a pincode*), and
without the carve-out the model starts answering "yes, zip is in your city" the moment it holds a
pincode. **`Default` still never asks for a pincode at all.** Only the complaint agent does.

---

## 6. Voice rules that are easy to break

- **`zip`, never `ZIP`.** Capitals make TTS spell it out as "Z - I - P", which is not the product's
  name. The sole exception is inside the backend `complaintReason` values (§5).
- **Both phone numbers are pre-written as digit words** so the model never has to build one:
  emergency **one - nine - zero - six**, BPCL helpline **one - eight - zero - zero - two - two -
  four - three - four - four**. Each digit word is then spoken in the caller's own language. No other
  number exists in this channel — no office number, no distributor number, no callback number.
- **Emergency is 1906, not the helpline.** Both agents handle a hazard themselves, on the spot, with
  the helpline on the **first** turn and one or two safety steps per turn. The guidance is ported
  from CRC's `emergencyAgent` in minimal form, including the active-fire carve-out: never tell
  someone to touch, lift or move a burning cylinder, or to reach a regulator past flames. A hazard
  outranks every other rule in both prompts, the switch included.
- **The helpline is not a general exit.** Only an existing-connection matter, a non-LPG BPCL query, a
  commercial or industrial connection outside Lite zip, or alongside the App at a dead end. Never for
  a new-connection question, never for an emergency, and never for a debited payment — that last one
  is a complaint.
- **No double form.** Never a word and its translation together; TTS reads a bracketed pair twice.

---

## 7. Post-call analysis

`pcalitezip.txt` runs after the call, against the transcript. **It is currently stale** and was
deliberately left untouched in the 2026-09-23 change: it still asserts *"Vaani has NO tools"* and
describes the old distributor-selection states. Bring it in step before relying on its output.

---

## 8. Before you edit

1. **Read the gate in `Default` BLOCK 8.5 before touching anything about complaints.** The whole
   design is that guidance wins and a complaint is the exception.
2. **Never port a fixed Hindi line from CC or CRC.** Port the intent; every turn here is content
   beats in the caller's own language.
3. **A `calltransfer` block has no translation in this channel.** There is no human to reach.
4. **Never create `.bak` copies.** Edit in place, as everywhere in this repo.
5. **`Default` answers; `unregisteredComplaintAgent` registers.** Do not let knowledge leak into the
   complaint agent — it holds no knowledge base on purpose, and duplicating one there means two
   copies of every fact drifting apart.
