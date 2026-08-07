# newConnectionAgent (CRC)

**Two files, one agent name.** `agentName` stays `newConnectionAgent` in both cases.

| File | Status | Lines |
|---|---|---|
| `newConnectionAgent_onHold.txt` | **DEPLOYED** — the live prompt | 763 |
| `newConnectionAgent.txt` | **PARKED** — the original full apply journey, retained unchanged | 2,087 |

> ⚠️ **Deployment risk (CHANNELS.md NC-01).** The client kept the old filename, so **the platform
> must be pointed at `newConnectionAgent_onHold.txt`**. If that step is missed, the full apply
> journey is still live and consumers will be walked through applying for something that is on hold.
> No prompt-side guard can prevent this.

## The live prompt (`_onHold`)

New connections for the **14.2 kg domestic cylinder are on hold**, so the job is narrow and honest:
inform, then offer the two routes still open — **Bharat Gas Mini and ZIP, together in one short
turn**, consumer chooses, and only the chosen one is explained on the next turn. Benefits are never
crammed into the offer; the consumer has just been told no.

**This is the only agent in the channel that *offers* ZIP** (CHANNELS.md ZIP-02). Everywhere else
ZIP is a knowledge base only.

It holds **no complaint tool and no ordinary escalation**. §16A is the carve-out: a consumer who
still wants a person after the hold has been explained goes to `callTransferAgent` — never offered
first, and never as a route around the hold.

## The parked file

Retained because it is the only copy of the §15-EC / §15-MS / §15-OV sections and the §15A guided
app flow and §15B office flow. It **still carries the old persona text** and was deliberately left
out of later edits — it must be reconciled if it is ever unparked.
