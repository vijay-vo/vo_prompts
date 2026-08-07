# deliveryAgent (CRC)

Delivery status and delivery problems. Four agents, chosen by two facts: whether a booking exists,
and where the delivery date sits relative to today.

| File | Agent | Lines | When it runs |
|---|---|---|---|
| `activeDeliveryAgent.txt` | `activeDeliveryAgent` | 417 | Booking exists, delivery date still ahead |
| `postDeliveryAgent.txt` | `postDeliveryAgent` | 532 | Booking exists, delivery date has passed |
| `eligibleDeliveryAgent.txt` | `eligibleDeliveryAgent` | 452 | No booking on record, may book |
| `notEligibleDeliveryAgent.txt` | `notEligibleDeliveryAgent` | 389 | No booking on record, may not book |

**Date handling matters here.** Backend dates are **DD-MM-YYYY, day first**;
`{{system.current_date}}` is **YYYY-MM-DD, year first**. Visible curly braces in a value mean no
data — treat as absent, never speak it.

All four hold `bpcl_create_complaint`. A cylinder that was **not delivered** is a grievance about
something that already happened: nothing said undoes it, so the complaint *is* the resolution and it
registers directly rather than running the full resolution ladder.

**ZIP is knowledge only** in all four — never offered against a delivery problem. `deliveryGenericAgent`
is named as a routing target in some prompts and **does not exist**.

All four are leaves — switching only to `routingAgent`, or to `callTransferAgent` once help and,
where needed, registration have happened.
