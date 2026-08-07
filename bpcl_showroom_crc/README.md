# bpcl_showroom_crc (CRC)

The Consumer Relationship Centre channel — Vaani speaks as staff at a **regional head CRC office**
covering many districts and many distributors. 16 agents (the 15 shared ones plus
`callTransferAgent`), plus the post-call analysis prompts.

**Read [CLAUDE.md](CLAUDE.md) before editing anything here** — it is the channel contract. The
shared truth that must stay identical to CC lives in [../CLAUDE.md](../CLAUDE.md).

## What makes this channel different

- **The complaint comes first, then a transfer.** Help → route → register → *only then*, if the
  consumer still wants a person, `switchagent` to [`callTransferAgent`](prompts/callTransferAgent/).
  Vaani never volunteers a transfer. **No office visit is ever offered** as an escalation.
- **`calltransfer` is held by exactly one agent.** Every other prompt carries an explicit
  *"`calltransfer` — NOT AUTHORIZED"* clause. Since 2026-08-06 the platform invokes `calltransfer`
  automatically the instant a call switches to `callTransferAgent`; that agent only reads the
  attempt's Result and reacts.
- **No phone number is given out.** `{{crcOfficeNumber}}` was removed from the prompts; it survives
  only as a tool parameter inside `callTransferAgent`, which never speaks it. The consumer's own
  distributor's number is unaffected.
- **Callbacks are not scheduled.** A complaint is registered and the team makes contact — no time
  captured, no window promised.
- **Persona.** The CRC is a regional head office, not the consumer's own distributor — the
  distributor is a third party here too, and "अपने distributor से पूछिए" is correct. "हमारे यहाँ"
  refers to this CRC only.
- **Complaint numbers** are spoken as English digit words separated by `" - "` (CHANNELS.md NUM-01).

## Layout

| Path | What it holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The channel contract — escalation, persona, ZIP policy, complaint rules |
| [prompts/](prompts/) | The shipped `.txt` prompts, one folder per agent group |
| [docs/](docs/) | Agent workflow map, post-call file status, press notes |

Two agent folders hold a **variant file beside the deployed one** — see
[prompts/newConnectionAgent/](prompts/newConnectionAgent/) and
[prompts/genericInfoComplaintAgent/](prompts/genericInfoComplaintAgent/). Check the `STATUS:` marker
on line 1 before editing either.

## Sister channel

[`bpcl_contact_center`](../bpcl_contact_center/) — its prompts look almost identical to these and
are **not** interchangeable. A `calltransfer` block has no valid CRC translation; it becomes a
complaint-escalation block. Every intended difference is recorded in [../CHANNELS.md](../CHANNELS.md).
