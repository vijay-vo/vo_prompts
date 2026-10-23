# ivrs_commercial

**Commercial LPG support line (IVRS press 9).** A commercial and industrial customer presses 9 on
Bharat Petroleum's commercial booking IVRS and reaches Vaani for any query or complaint about their
commercial connection. There is no human transfer: a customer who wants a person gets a registered
complaint.

Read [CLAUDE.md](CLAUDE.md) before editing anything here.

| Path | What it holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The channel contract: the knowledge rule, what is removed, escalation, topology |
| [docs/COMMERCIAL_KB.md](docs/COMMERCIAL_KB.md) | The only source of commercial facts, from official sources |
| [BPCL_QUESTIONS.md](BPCL_QUESTIONS.md) | Open questions for BPCL |
| [prompts/](prompts/) | The shipped `.txt` prompts, one folder per agent group |
| [docs/](docs/) | [ORCHESTRATION.md](docs/ORCHESTRATION.md), [FLOW.md](docs/FLOW.md), [Flow.mmd](docs/Flow.mmd) |

| Folder | Agents |
|---|---|
| [getConsumerDetails/](prompts/getConsumerDetails/) | `getConsumerDetails`: number capture |
| [Default/](prompts/Default/) | `Default`: greeting, emergency interrupt, FAQ, triage, routing |
| [routingAgent/](prompts/routingAgent/) | `routingAgent`: silent mid-call re-router |
| [emergencyAgent/](prompts/emergencyAgent/) | `emergencyAgent`: gas leak, overrides everything |
| [bookingAgent/](prompts/bookingAgent/) | `bookingEligibleAgent`, `bookingNonEligibilityAgent` |
| [deliveryAgent/](prompts/deliveryAgent/) | `activeDeliveryAgent`, `postDeliveryAgent`, `eligibleDeliveryAgent`, `notEligibleDeliveryAgent` |
| [paymentAgent/](prompts/paymentAgent/) | `paymentAgent`: price, GST, payment, refund, overcharge |
| [connectionServicesAgent/](prompts/connectionServicesAgent/) | `connectionServicesAgent`: changes to an existing commercial connection |
| [newConnectionAgent/](prompts/newConnectionAgent/) | `newConnectionAgent`: new commercial supply on commerciallpg.in |
| [genericInfoComplaintAgent/](prompts/genericInfoComplaintAgent/) | `genericInfoComplaintAgent`: products, equipment, safety, catch-all |
| [unregisteredComplaintAgent/](prompts/unregisteredComplaintAgent/) | `unregisteredComplaintAgent`: complaints when no record is found |
| [postCallAnalysis/](prompts/postCallAnalysis/) | `postCallAnalysisFlat.txt`, then `vaaniQA.txt`, after the call |
