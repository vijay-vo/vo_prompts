# bookingAgent (CRC)

Refill booking. Two agents, split by whether the consumer is allowed to book at all.

| File | Agent | Lines | When it runs |
|---|---|---|---|
| `bookingEligibleAgent.txt` | `bookingEligibleAgent` | 328 | The consumer may book; the booking attempt failed |
| `bookingNonEligibilityAgent.txt` | `bookingNonEligibilityAgent` | 468 | The consumer may not book; explain the blocker |

**Naming defect — do not propagate.** `bookingEligibleAgent.txt` is titled
*"(NON-ELIGIBILITY BLOCKER CASE)"* but contains the eligible flow.

Domain facts: booking gap **25 days urban / 45 rural**; the 5 kg Bharat Gas Mini has no gap and no
limit and is the **only** alternative these agents may offer.

**ZIP is knowledge only here** — both agents may answer a ZIP question the consumer asks, but never
raise it, never present it as an option, and never offer it against a blocked booking (CHANNELS.md
ZIP-02).

The **extra-refill block** is a separate thing from the new-connection hold: an additional cylinder
*is* affected by it. Do not quote the limits, give a date or a reason, or volunteer the application
process unasked.

Both hold `bpcl_create_complaint` and carry the standard COMPLAINT PROTOCOL. Both are leaves —
switching only to `routingAgent`, or to `callTransferAgent` once help/registration has happened.
