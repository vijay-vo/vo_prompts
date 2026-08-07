# CRC docs

Reference documents for the CRC channel. None of these ship — the shipped artefacts are the `.txt`
files under [../prompts/](../prompts/).

| File | What it is |
|---|---|
| [agent-workflow.md](agent-workflow.md) | The navigation map: entry points, the routing topology as a Mermaid graph, per-agent tools, and the handoff contract. Start here. |
| [POSTCALL_STATUS.md](POSTCALL_STATUS.md) | Which post-call analysis prompt is deployed, per repo rule 6.6. |
| `Press Note- Field.docx` / `Press Note- Field Hindi.docx` | Client-supplied press notes (English and Hindi), source material only. |

> **`POSTCALL_STATUS.md` is stale.** It describes four files —
> `postCallAnalysis.txt`, `promptQA.txt`, `postCallAnalysis_withPromptQA.txt`,
> `postCallAnalysis_promptQA_merged.txt`. The folder today holds
> [`postCallAnalysisFlat.txt`](../prompts/postCallAnalysis/postCallAnalysisFlat.txt),
> [`postCallAnalysisHuman.txt`](../prompts/postCallAnalysis/postCallAnalysisHuman.txt) and
> [`promptQA.txt`](../prompts/postCallAnalysis/promptQA.txt). Reconcile it before relying on it;
> [../../CLAUDE.md](../../CLAUDE.md) §2b is the current statement of which prompt runs when.

> **`agent-workflow.md` §7 links `customerStatus-spec.md`**, which does not exist in this
> workspace. Its persona line also still describes Vaani as an employee of the consumer's *own*
> distributor office; the current rule is that this CRC is a regional head office and the
> distributor is a third party.
