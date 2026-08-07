# CRC prompts

The shipped prompts for the CRC channel. **These `.txt` files are what deploys** — hand-edited, no
build step, no generation.

Folders group related agents; the **file name** is the agent, not the folder. `agentName` values
passed to `switchagent` must match the canonical registry in [../../CLAUDE.md](../../CLAUDE.md) §3
exactly.

| Folder | Agents |
|---|---|
| [getConsumerDetails/](getConsumerDetails/) | `getConsumerDetails` — number capture, entry for unregistered callers |
| [Default/](Default/) | `Default` — greeting, emergency interrupt, FAQ, triage, routing |
| [routingAgent/](routingAgent/) | `routingAgent` — silent mid-call re-router |
| [emergencyAgent/](emergencyAgent/) | `emergencyAgent` — gas hazard, overrides everything |
| [bookingAgent/](bookingAgent/) | `bookingEligibleAgent`, `bookingNonEligibilityAgent` |
| [deliveryAgent/](deliveryAgent/) | `activeDeliveryAgent`, `postDeliveryAgent`, `eligibleDeliveryAgent`, `notEligibleDeliveryAgent` |
| [paymentAgent/](paymentAgent/) | `paymentAgent` — payment, refund, overcharge |
| [subsidyAgent/](subsidyAgent/) | `subsidyAgent` — subsidy / DBTL / PAHAL |
| [connectionServicesAgent/](connectionServicesAgent/) | `connectionServicesAgent` — KYC, address, mobile, name, surrender, portability, PNG |
| [newConnectionAgent/](newConnectionAgent/) | `newConnectionAgent` — deployed file is the `_onHold` variant |
| [genericInfoComplaintAgent/](genericInfoComplaintAgent/) | `genericInfoComplaintAgent` — catch-all; a no-transfer variant sits beside it |
| [callTransferAgent/](callTransferAgent/) | `callTransferAgent` — **CRC only**, the sole holder of `calltransfer` |
| [postCallAnalysis/](postCallAnalysis/) | Not live-call prompts — they run after the call, against the transcript |

## Topology

`Default` triages the front of the call. Every specialist is a leaf whose only switch target is
`routingAgent` — **plus**, in this channel only, `callTransferAgent`, which is terminal and switches
to nothing. Routing a transfer through `routingAgent` would add a hop and risk losing the complaint
context. Nothing ever routes back to `Default`.

## Rules that apply to every file here

- **`calltransfer` — NOT AUTHORIZED** in every prompt except `callTransferAgent`. No other agent may
  call it, name it, or write it.
- **No phone number is offered.** A request for one gets "I don't have a number to give", plus the
  transfer path where it applies. The consumer's own distributor's number is unaffected.
- **The complaint comes first.** Help → route → register → *only then* a transfer, and only if the
  consumer still wants a person. Grievances about something that already happened register directly.
- **The tool call is the action, not the sentence.** A spoken line with no tool call on that same
  turn is a failed turn — recover by invoking the tool before anything else on the next turn.
- **One thing speaks per tool turn.** Hindi line as text, no `preToolMessage` — except `callHangup`.
- **Switching is invisible.** The switching agent speaks a short non-committal line ("जी बिल्कुल, एक
  मिनट।") and never says the call is being transferred; only `callTransferAgent` may say that.
- **Voice/TTS:** Hindi only, 1–2 sentences per turn, one question per turn. "भारत पेट्रोलियम" in
  full, never "BPCL". Never say टंकी or जोड़. Never speak a raw digit or a `{{variable}}`.
  Complaint numbers use English digit words separated by `" - "`.

Two folders hold a variant beside the deployed file. Every file that has a twin carries a `STATUS:`
marker on line 1 — read it before editing.
