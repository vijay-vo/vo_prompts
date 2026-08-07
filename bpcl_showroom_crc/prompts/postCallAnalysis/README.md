# postCallAnalysis (CRC)

**These are not live-call prompts.** They run after the call has ended, against the transcript, and
produce structured JSON. Nothing here is spoken to a consumer.

| File | Lines | What it produces |
|---|---|---|
| `postCallAnalysisFlat.txt` | 178 | The flat structured summary of what the call was about — intent, outcome, disposition |
| `promptQA.txt` | 301 | The prompt-defect review: Vaani's rule violations, as `issues` + `unhandledRequests`. Not a score of the consumer or the call |
| `postCallAnalysisHuman.txt` | 478 | The **human-agent** analyser — the richer nested rubric (checkpoint PASS/FAIL, `conversationInsights`) |

## Which runs, and when

| Who answered | What runs, in order |
|---|---|
| **Vaani (AI)** | `postCallAnalysisFlat.txt` **first**, then `promptQA.txt` |
| **A human agent** | `postCallAnalysisHuman.txt` |

Flat describes the call; QA judges the agent. Do not run QA first, and neither is a substitute for
the other. `postCallAnalysisHuman` is not part of the AI-call path.

## Inputs

`promptQA` needs the runtime data block Vaani held during the call injected (`{{customerStatus}}`,
distributor and CRC variables). If it arrives unfilled, the data-dependent rules silently stop
detecting anything and every call reports clean. `postCallAnalysisHuman` takes `{{callStartDate}}`
(YYYY-MM-DD, IST, used as-is) and `{{callStartTime}}` (HH:MM:SS, 24-hour).

## Keep the nested shapes stable

Monitoring for Vaani reads the **nested** JSON — the checkpoint and insight objects out of
`postCallAnalysisHuman` and `promptQA` — rather than flat counts. Renaming or flattening a field
breaks its consumers silently.

> ⚠️ **Known inconsistency, needs a decision** ([../../../CLAUDE.md](../../../CLAUDE.md) §2b).
> `postCallAnalysisHuman.txt` still describes its subject as *"the BPCL LPG agent (Vaani)"* in its
> own CONTEXT block, and its new-connection-hold / ZIP scoring section scores Vaani-specific
> behaviour. If it is the human analyser that framing is wrong; if it also runs on Vaani calls, its
> **Empathy and Acknowledgement** checkpoint conflicts with the specialist-agent empathy ban
> (CHANNELS.md CPL-05) and needs the carve-out `promptQA` C3j already carries.

> **[../../docs/POSTCALL_STATUS.md](../../docs/POSTCALL_STATUS.md) is stale** — it describes four
> files that no longer match this folder.
