# paymentAgent (CC)

| File | Agent | Lines |
|---|---|---|
| `paymentAgent.txt` | `paymentAgent` | 252 |

Payment, refund and overcharge queries — including money taken at the door.

Domain facts it depends on: refund window **3–7 working days**, payment settlement **3 working
days**, hotplate **₹1,500–4,000**. Money is always spoken in Hindi words with "रुपये", never as raw
digits.

An overcharge that has **already happened** is a grievance — nothing said undoes it, so the
complaint *is* the resolution and it registers directly without being slowed down by the resolution
ladder.

A leaf agent — its only switch target is `routingAgent`.
