# genericInfoComplaintAgent (CRC)

The catch-all specialist: how-to questions, equipment faults (regulator, hose, hotplate), staff
behaviour complaints, and the **ZIP knowledge base** (CHANNELS.md ZIP-03).

**Two files, one agent name. Exactly one of them ships** — the platform config decides, and nothing
in the prompts can enforce it. Both carry a `STATUS:` marker on line 1.

| File | Status | Lines | Difference |
|---|---|---|---|
| `genericInfoComplaintAgent.txt` | **DEPLOYED** | 565 | Can switch to `callTransferAgent` when the consumer still wants a person after help and registration |
| `genericInfoComplaintAgent_noTransfer.txt` | **VARIANT — not deployed** (CHANNELS.md XFER-02) | 562 | Never reaches a human by any route; a registered complaint is the terminal escalation, and the office number returns on the complaint-failure path |

**Keep the two files identical apart from the transfer path** — any fix to one lands in the other in
the same session.

## Complaint protocol

Holds `bpcl_create_complaint` and carries the standard block:

- A complaint is the **last** option — the resolution ladder runs first.
- The carve-out is a **grievance about something that already happened** (cylinder not delivered,
  test not performed, staff behaviour, money taken): the complaint *is* the resolution and it
  registers directly.
- **Speaking the registering line is not registering** — the tool must be invoked on that same turn.
  A line spoken with no tool call is a failed turn, recovered on the next one.
- One call per complaint, never retry on failure, max 2 per call. Never invent a number. On success
  it is spoken as English digit words separated by `" - "`, plus an SMS confirmation.

No office visit is ever offered as an escalation — the territory covers many districts and a visit
can mean a very long trip. The two physical actions that genuinely need a counter (buying a
hotplate/stove, submitting KYC documents) are information, not escalation.

The canonical agent name is `genericInfoComplaintAgent`; some references use the folder name
`genericInfoComplaint/`.
