# Default (CRC)

| File | Agent | Lines |
|---|---|---|
| `Default.txt` | `Default` | 518 |

The front of the call: greeting, emergency interrupt, FAQ answering, triage, and routing to a
specialist.

- **Never hangs up**, and **nothing ever routes back here**.
- **Calls no lookup tool** — eligibility is resolved outside the prompt.
- **Acknowledgement lives here.** Empathy phrases belong at the front of the call; specialist agents
  are banned from them (CHANNELS.md CPL-05).
- **MODULE Z — ZIP is knowledge only here.** `Default` answers a ZIP question inline (Hello BPCL App
  steps) and never *offers* ZIP. ZIP is offered in exactly one agent, `newConnectionAgent_onHold`.
- **Holds no distributor variables at all**, so the office-pair TTS rules do not bite here.
- **Emergency overrides everything** — a confirmed gas hazard switches to `emergencyAgent`.
- A transfer is never raised here first. Help → route → register → *only then* a person.

See [../../docs/agent-workflow.md](../../docs/agent-workflow.md) for the routing map.
