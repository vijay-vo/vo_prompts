# genericInfoComplaintAgent (CC)

| File | Agent | Lines |
|---|---|---|
| `genericInfoComplaintAgent.txt` | `genericInfoComplaintAgent` | 379 |

The catch-all specialist: how-to questions, equipment faults (regulator, hose, hotplate), and
complaints about staff behaviour — anything that is not booking, delivery, payment, subsidy,
connection services or a new connection.

It holds `bpcl_create_complaint` and carries the standard **COMPLAINT PROTOCOL**:

- A complaint is the **last** option. The resolution ladder runs first — understand, resolve, route,
  and only then register.
- The carve-out is a **grievance about something that already happened** (cylinder not delivered,
  test not performed, staff behaviour, money taken). Nothing said undoes it, the complaint *is* the
  resolution, and it registers directly.
- **Speaking the registering line is not registering** — the tool must be invoked on the same turn.
- One call per complaint, never retry on failure, max 2 per call. Never invent a complaint number.
  On success it is spoken digit by digit in **Hindi words** (CC form) and the consumer is told an
  SMS follows.

This folder is `genericInfoComplaintAgent/`; CRC's equivalent folder is `genericInfoComplaint/`
in some references. The canonical agent name is `genericInfoComplaintAgent`.

A leaf agent — its only switch target is `routingAgent`.
