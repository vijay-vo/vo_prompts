# routingAgent (CC)

| File | Agent | Lines |
|---|---|---|
| `routingAgent.txt` | `routingAgent` | 271 |

The silent mid-call re-router. Every specialist is a leaf whose only switch target is this agent —
no leaf switches directly to another leaf. It reads the new intent and resolves the next specialist.

- **Never routes to itself and never routes to `Default`.**
- **Owns the out-of-scope hangup ladder** — the graded response when the consumer's query is not
  something this system handles at all.
- **Switching is invisible.** It speaks an anchor line ("ज़रा booking system check करती हूँ, एक
  मिनट।") and never names a team, department, specialist or transfer.

`deliveryGenericAgent` and `refillSupportAgent` appear as routing targets in some prompts.
**Neither agent exists** — any `switchagent` to them dead-ends. Do not propagate those names.

Read [../../docs/ORCHESTRATION.md](../../docs/ORCHESTRATION.md) before editing.
