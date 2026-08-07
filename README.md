# BPCL Vaani — Prompt Repository

Production voice-AI prompts for **Bharat Petroleum (Bharat Gas)** LPG consumer support, in Hindi.
The agent is **Vaani**. Two channels run the same agent topology with two different escalation
policies.

The `.txt` files under `prompts/` are **what ships**. They are hand-edited and deployed as-is —
nothing is generated and there is no build step.

---

## The two channels

| | [`bpcl_contact_center/`](bpcl_contact_center/) (CC) | [`bpcl_showroom_crc/`](bpcl_showroom_crc/) (CRC) |
|---|---|---|
| What it is | Central contact centre for the whole state | Regional head Consumer Relationship Centre covering many districts and many distributors |
| Who Vaani is | An agent of Bharat Petroleum; the distributor is a third party | CRC staff; the distributor is **also** a third party |
| Reaching a human | `calltransfer`, inline in ten agents | Register a complaint first, then `switchagent` to `callTransferAgent` — the sole holder of `calltransfer` |
| Callbacks | Scheduled (9am–5pm, within 15 days) after a failed transfer | Not scheduled — a complaint is registered instead |
| Agents | 15 | 16 (adds `callTransferAgent`) |

Both channels share the same handoff contract, the same LPG domain facts, and the same Hindi/TTS
voice rules. Those are **shared truth** and must not diverge.

---

## Layout

```
bpcl_contact_center/     CC channel — contract, prompts, docs
bpcl_showroom_crc/       CRC channel — contract, prompts, docs
CHANNELS.md              the divergence ledger — every intended CC/CRC difference
CLAUDE.md                repo contract: shared truth, agent registry, change discipline
```

Each channel holds:

```
CLAUDE.md                channel contract — read before editing anything in that channel
prompts/<agent>/*.txt    the shipped prompts
docs/                    routing specs, flow diagrams, status notes
```

## Where to start

1. [CLAUDE.md](CLAUDE.md) — shared truth (§4), the canonical agent registry (§3), change
   discipline (§6). Read this first.
2. The channel's own `CLAUDE.md` — [CC](bpcl_contact_center/CLAUDE.md) ·
   [CRC](bpcl_showroom_crc/CLAUDE.md). Escalation and persona rules differ; an edit copied across
   without translating them ships a policy violation.
3. [CHANNELS.md](CHANNELS.md) — every intended difference between the channels.
   **A difference that is not in that ledger is a drift bug, by definition.**

## Editing rules (short form)

- Read the channel `CLAUDE.md` before touching one of its prompts.
- Never create `.bak` copies. Edit in place.
- Never blind-copy a block between channels — port the *intent*, translate escalation and persona.
- A fix to shared truth lands in **both** channels in the same session, or the ledger records why not.
- A new intended difference gets a `CHANNELS.md` row in the same edit.
- Commit at logical boundaries, one commit per intended change, and say *why* in the message.
