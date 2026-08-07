# Default (CC)

| File | Agent | Lines |
|---|---|---|
| `Default.txt` | `Default` | 462 |

The front of the call: greeting, emergency interrupt, FAQ answering, triage, and routing to a
specialist. The largest prompt in the channel apart from `newConnectionAgent`.

- **Never hangs up.** It is not a terminal agent.
- **Nothing ever routes back here.** Once the call leaves `Default` it does not return.
- **Calls no lookup tool** — it cannot know whether the consumer is eligible to book, which is why
  the Switch Gate resolves `(topic, consumerPayload) → agentName` outside the prompt.
- **STAGE 0 interrupts own `calltransfer`** in this channel: an explicit request for a person, a
  request for a language other than Hindi, or a non-LPG Bharat Petroleum product. A हाँ confirming
  some other factual question is not a human request.
- **Emergency overrides everything** — a confirmed gas hazard switches to `emergencyAgent`,
  bypassing all gating.

Read [../../docs/ORCHESTRATION.md](../../docs/ORCHESTRATION.md) before editing — its §11 lists
prompt changes due to land here.
