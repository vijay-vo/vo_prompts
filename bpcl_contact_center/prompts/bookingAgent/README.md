# bookingAgent (CC)

Refill booking. Two agents, split by whether the consumer is allowed to book at all.

| File | Agent | Lines | When it runs |
|---|---|---|---|
| `bookingEligibleAgent.txt` | `bookingEligibleAgent` | 209 | The consumer may book; the booking attempt failed |
| `bookingNonEligibilityAgent.txt` | `bookingNonEligibilityAgent` | 255 | The consumer may not book; explain the blocker |

**Naming defect — do not propagate.** `bookingEligibleAgent.txt` is titled
*"(NON-ELIGIBILITY BLOCKER CASE)"* but contains the eligible flow. The canonical agent name is
`bookingEligibleAgent`.

Relevant domain facts: booking gap **25 days urban / 45 rural**; the 5 kg Bharat Gas Mini has no gap
and no limit.

**Open item.** Refill limits are out of scope for phase 1
([../../docs/ORCHESTRATION.md](../../docs/ORCHESTRATION.md) §6): a consumer who has hit the 2/month
or 15/year limit is judged eligible and sent to `bookingEligibleAgent`, which tells them they can
book — and the booking fails again. The Hindi lines explaining both limits already exist, unused, at
`bookingNonEligibilityAgent.txt:151-153`.

Both agents are leaves — their only switch target is `routingAgent`.
