# CC prompts

The shipped prompts for the contact-centre channel. **These `.txt` files are what deploys** —
hand-edited, no build step, no generation.

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
| [newConnectionAgent/](newConnectionAgent/) | `newConnectionAgent` — new connection / Ujjwala / PMUY |
| [genericInfoComplaintAgent/](genericInfoComplaintAgent/) | `genericInfoComplaintAgent` — catch-all |
| [postCallAnalysis/](postCallAnalysis/) | Not live-call prompts — they run after the call, against the transcript |

## Topology

`Default` triages the front of the call. Every specialist is a leaf whose only switch target is
`routingAgent`. No leaf switches to another leaf, and **nothing ever routes back to `Default`**.

## Rules that apply to every file here

- **The tool call is the action, not the sentence.** Speaking a registering line registers nothing.
  A spoken line with no tool call on that same turn is a failed turn.
- **One thing speaks per tool turn.** Write the Hindi line as text and pass no `preToolMessage` —
  except `callHangup`, which carries the closing line in `preToolMessage` and generates no text.
- **Switching is invisible.** Never reveal that other agents, teams or systems exist. The one
  exception in this channel is `calltransfer`, where naming the team is allowed because the
  consumer is about to hear a different voice.
- **Voice/TTS:** Hindi only, 1–2 sentences per turn, one question per turn. "भारत पेट्रोलियम" in
  full, never "BPCL". Never say टंकी or जोड़. Never speak a raw digit or a `{{variable}}`.

`bpcl_fetch_all_api` is callable by `getConsumerDetails` and nothing else — every other prompt that
mentions it does so in a blocker forbidding the call.
