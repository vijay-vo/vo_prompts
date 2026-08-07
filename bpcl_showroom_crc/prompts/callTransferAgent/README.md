# callTransferAgent (CRC only)

| File | Agent | Lines |
|---|---|---|
| `callTransferAgent.txt` | `callTransferAgent` | 94 |

**The sole holder of `calltransfer` in this channel.** Every other prompt carries an explicit
*"`calltransfer` — NOT AUTHORIZED"* clause. It also owns `callHangup`. It is **terminal** — it
switches to nothing.

## It does not start the transfer

Since 2026-08-06 (CHANNELS.md XFER-01), **the platform invokes `calltransfer` automatically** —
`forwardingNumber: {{crcOfficeNumber}}`, `blindTransfer: false`, with the exact `preToolMessage`
"आपकी कॉल ट्रांसफर की जा रही है" — the instant any agent switches the call here, before this agent's
first turn. This prompt's job is purely to read that attempt's **Result** and react.

## Two outcomes, no third

| Result | What it does |
|---|---|
| **Success** | Produces **nothing** — no text, no `callHangup`. The platform closes the call. |
| **Failure** (out-of-office-hours, platform failure, busy, no-answer) | Says the team could not be reached, states the hours from `handoffSummary`, stays on the line, and closes only once the consumer accepts. |

## What it never does

Never handles the LPG query itself, never re-asks what the problem is, never registers a complaint
(it holds no complaint tool), never sends anyone to an office, and never promises what the senior
team will do or when.

It is the only agent allowed to say the call is being transferred — the agent *switching to* it may
not, because it does not yet know whether the transfer will happen.

**Open platform dependencies** are listed in [../../../CLAUDE.md](../../../CLAUDE.md) §7: registering
the agent, the automatic `calltransfer` invocation, surfacing its Result on the first turn, writing
senior-team hours into the `handoffSummary`, and closing the call on success.
