# CC docs

Design and reference documents for the contact-centre channel. None of these ship — the shipped
artefacts are the `.txt` files under [../prompts/](../prompts/).

| File | What it is |
|---|---|
| [ORCHESTRATION.md](ORCHESTRATION.md) | The routing spec for the 15 agents: the two-layer "model decides the topic, code decides the agent" design and the Switch Gate that resolves `(topic, consumerPayload) → agentName`. **Spec-only — not yet applied to the prompts;** §11 lists the four prompt changes it requires. |
| [FLOW.md](FLOW.md) | The call flow in ASCII diagrams — inbound call, consumer fetch, triage, per-agent branches. |
| [Flow.mmd](Flow.mmd) | The same flow as a Mermaid `flowchart TD` source. |

**Read `ORCHESTRATION.md` before touching `Default`, `routingAgent`, or `getConsumerDetails`** —
otherwise you are editing against a design that is about to change those files.

Open items it records: the `getConsumerDetails` recovery loop cannot close (§5), the urban/rural
field name is still unknown so the 25/45-day booking gap defaults everyone to 25 days (§7), and
refill limits are out of scope for phase 1 (§6).

> **Note:** [../CLAUDE.md](../CLAUDE.md) links a `CUSTOMER_STATUS_SPEC.md` in this folder. That
> file does not exist here.
