# bpcl_contact_center (CC)

Central Bharat Petroleum contact centre for the whole state. 15 agents, plus the post-call
analysis prompts.

**Read [CLAUDE.md](CLAUDE.md) before editing anything here** — it is the channel contract. The
shared truth that must stay identical to CRC lives in [../CLAUDE.md](../CLAUDE.md).

## What makes this channel different

- **Escalation is `calltransfer`.** Vaani can hand the consumer to a human senior team, inline in
  ten agents. It fires only on `Default` STAGE 0 interrupts: an explicit request for a person, a
  request for a language other than Hindi, or a non-LPG Bharat Petroleum product. Never blind,
  never proactively offered, never as a route for a clear LPG topic.
- **Callbacks are scheduled.** After a *failed* transfer only — a slot between 9am and 5pm within
  15 days, written into the complaint. No complaint number is spoken on a callback complaint.
- **Persona: Bharat Petroleum central.** The distributor is a third party — "आपके distributor".
  Insider phrasing ("हमारे यहाँ", "हमारा office") is CRC's voice and must not appear here.

## Layout

| Path | What it holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The channel contract — escalation, persona, tool inventory, open items |
| [prompts/](prompts/) | The shipped `.txt` prompts, one folder per agent group |
| [docs/](docs/) | Routing spec, call-flow diagrams |

## Sister channel

[`bpcl_showroom_crc`](../bpcl_showroom_crc/) — its prompts look almost identical to these and are
**not** interchangeable. Never copy a block across without translating the escalation and persona
axes. Every intended difference is recorded in [../CHANNELS.md](../CHANNELS.md).
