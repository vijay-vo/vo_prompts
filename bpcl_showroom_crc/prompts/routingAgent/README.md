# routingAgent (CRC)

| File | Agent | Lines |
|---|---|---|
| `routingAgent.txt` | `routingAgent` | 315 |

The silent mid-call re-router. Every specialist is a leaf whose only switch target is this agent —
except for `callTransferAgent`, which leaves reach **directly**, because routing a transfer through
here would add a hop and risk losing the complaint context that agent depends on.

- **Never routes to itself and never routes to `Default`.**
- **Owns the out-of-scope hangup ladder.**
- **Switching is invisible.** It speaks an anchor line and never names a team, department,
  specialist or transfer.
- **ZIP routing:** a consumer who wants a ZIP or asks what one is goes to `genericInfoComplaintAgent`
  (which owns the ZIP knowledge base); a problem with a ZIP they already hold goes to the agent that
  owns that problem (CHANNELS.md ZIP-03).

`deliveryGenericAgent` and `refillSupportAgent` are named as routing targets in some prompts.
**Neither exists** — any `switchagent` to them dead-ends.
