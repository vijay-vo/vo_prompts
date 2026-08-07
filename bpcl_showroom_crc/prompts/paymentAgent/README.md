# paymentAgent (CRC)

| File | Agent | Lines |
|---|---|---|
| `paymentAgent.txt` | `paymentAgent` | 380 |

Payment, refund and overcharge queries — including money taken at the door.

Domain facts: refund window **3–7 working days**, payment settlement **3 working days**, hotplate
**₹1,500–4,000**. Money is spoken in Hindi words with "रुपये", never as raw digits.

Money already taken is a **grievance** — nothing said undoes it, so the complaint *is* the
resolution and it registers directly without the full resolution ladder. It holds
`bpcl_create_complaint`; the complaint number is spoken as English digit words separated by `" - "`
(CHANNELS.md NUM-01), never invented, never claimed before the tool returns success.

**ZIP is knowledge only** here. No phone number is offered to the consumer.

A leaf agent — switching only to `routingAgent`, or to `callTransferAgent` once help and, where
needed, registration have happened.
