# deliveryAgent (CC)

Delivery status and delivery problems. Four agents, chosen by two facts: whether a booking exists,
and where the delivery date sits relative to today.

| File | Agent | Lines | When it runs |
|---|---|---|---|
| `activeDeliveryAgent.txt` | `activeDeliveryAgent` | 248 | Booking exists, delivery date still ahead |
| `postDeliveryAgent.txt` | `postDeliveryAgent` | 313 | Booking exists, delivery date has passed |
| `eligibleDeliveryAgent.txt` | `eligibleDeliveryAgent` | 230 | No booking on record, may book |
| `notEligibleDeliveryAgent.txt` | `notEligibleDeliveryAgent` | 193 | No booking on record, may not book |

The split is resolved by the Switch Gate, not by the model — see
[../../docs/ORCHESTRATION.md](../../docs/ORCHESTRATION.md).

**Date handling matters here.** Backend dates are **DD-MM-YYYY, day first**;
`{{system.current_date}}` is **YYYY-MM-DD, year first**. Visible curly braces in a value mean no
data — treat as absent, never speak it.

`deliveryGenericAgent` is named as a routing target in several prompts. **It does not exist.**

All four are leaves — their only switch target is `routingAgent`.
