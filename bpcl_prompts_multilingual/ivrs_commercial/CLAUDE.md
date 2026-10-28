# ivrs_commercial — channel contract

Bharat Petroleum's **commercial LPG support line**. Commercial and industrial customers (hotels,
restaurants, canteens, hospitals, institutions, factories) book cylinders on Bharat Petroleum's
commercial IVRS. Pressing 9 there brings them to Vaani for any query or complaint about their
commercial connection, in whatever Indian language they speak.

**Created 2026-10-23 as a copy of [`bpcl_contact_center`](../bpcl_contact_center/CLAUDE.md) (the domestic
IVRS line), then converted to commercial end to end (CHANNELS.md COMM-01, COMM-02).** Nothing on this
line is domestic. The machinery is the domestic IVRS line's and stays aligned with it:
- the stage machines;
- the tool-calling method and the complaint protocol;
- complaint status;
- no human transfer;
- the language, fixed-line and TTS rules;
- the handoff contract;
- the head office address.

Read [../CLAUDE.md](../CLAUDE.md) for the shared machinery and [`bpcl_contact_center/CLAUDE.md`](../bpcl_contact_center/CLAUDE.md)
for the IVRS axes (no transfer, tool calling, complaint method). This file holds only what is
specific to the commercial line.

## The knowledge rule

**Every commercial fact in these prompts comes from [docs/COMMERCIAL_KB.md](docs/COMMERCIAL_KB.md), and
that file comes only from official sources** (BPCL, commerciallpg.in, Bharatgas, MoPNG, PIB, BIS, the
Gazette).

- A fact that is not in COMMERCIAL_KB.md is not stated.
- Prompts do not carry "Vaani does not know X" lines for missing facts. The fact is simply absent.
- The gap goes to the user and to [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md).
- When BPCL answers, update COMMERCIAL_KB.md first, then the prompts that need it.

## What is removed for good

Nothing domestic is in these prompts:
- subsidy, DBTL, PAHAL;
- Ujjwala and PMUY;
- the 14.2 kg cylinder;
- the household rule and the domestic refill limits and booking gaps;
- the extra-refill block and the new-connection hold;
- Bharat Gas Lite zip and Bharat Gas Lite;
- hotplate and stove purchase;
- Transfer Voucher and Transfer Advice;
- the domestic booking numbers;
- "domestic LPG has priority".

`subsidyAgent` and the tool `bpcl_get_subsidy_details` do not exist on this line. A subsidy question is
answered in one line: commercial LPG carries no subsidy.

## Escalation

The same as the domestic IVRS line: **no human transfer, no phone number for any BPCL official or
manager.** The escalation is a registered complaint. The regional Commercial Managers' numbers on
commerciallpg.in are never given.

## Topology (14 live agents + 2 post-call)

`getConsumerDetails`, `Default`, `routingAgent`, `emergencyAgent`, `bookingEligibleAgent`,
`bookingNonEligibilityAgent`, `activeDeliveryAgent`, `postDeliveryAgent`, `eligibleDeliveryAgent`,
`notEligibleDeliveryAgent`, `paymentAgent`, `connectionServicesAgent`, `newConnectionAgent`,
`genericInfoComplaintAgent`, `unregisteredComplaintAgent`; then `postCallAnalysisFlat` and `vaaniQA`.

- `newConnectionAgent` ([newConnectionAgent.txt](prompts/newConnectionAgent/newConnectionAgent.txt))
  is the **new commercial supply** agent. It explains the commerciallpg.in request: the form,
  documents, Request ID, ED Committee review, Sales Officer and distributor, SMS updates, tracking with
  mobile and OTP, cancelling, and the status names. It never promises approval, a time or a date.
- **Booking.** Commercial customers book on the commercial IVRS. No other booking channel is named.
  No commercial booking limit is stated: whether a booking is allowed comes only from data and tool
  Results.

## `genericInfoComplaintAgent_v2.txt` — a test candidate, NOT deployed (2026-10-28)

**`prompts/genericInfoComplaintAgent/genericInfoComplaintAgent.txt` stays deployed and unchanged.**
`genericInfoComplaintAgent_v2.txt` is the restructured replica for testing, ported from the Hindi CRC's
GIC-V2-01 ([../CHANNELS.md](../CHANNELS.md) PORT-1028) and built from the domestic IVRS v2 with this
line's commercial content:
- the routing list, switch lines and knowledge base of the deployed commercial file;
- less weight registered directly;
- nothing domestic: no extra-refill block, delivery O T P block, Lite zip, hotplate or B A S, and no
  underweight verify step.

It adds no fact that is not in the deployed file. Deploy it only when the user says so.

## Platform changes needed

- De-register `subsidyAgent` and `bpcl_get_subsidy_details` for this line.
- Deploy `newConnectionAgent.txt` as `newConnectionAgent`.
- The greeting and the identity line name the commercial line.
