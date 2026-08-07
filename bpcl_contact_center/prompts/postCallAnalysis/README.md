# postCallAnalysis (CC)

**These are not live-call prompts.** They run after the call has ended, against the transcript, and
produce structured JSON. Nothing here is spoken to a consumer.

| File | Lines | What it produces |
|---|---|---|
| `postCallAnalysisFlat.txt` | 165 | The flat structured summary of what the call was about — intent, outcome, disposition |
| `promptQA.txt` | 206 | The prompt-defect review: rule violations by Vaani, as `issues` + `unhandledRequests`. Not a score of the consumer or the call |
| `postCallAnalysis.txt` | 520 | The older combined analyser — flat call metrics plus a nested QA/scoring block |

## Order on an AI call

`postCallAnalysisFlat.txt` runs **first**, then `promptQA.txt`. Flat describes the call; QA judges
the agent. Do not run QA first, and neither is a substitute for the other.

## Inputs

All three take the transcript plus `{{system.current_date}}` (YYYY-MM-DD, IST, used as-is — no
timezone conversion) and `{{system.current_time}}` (HH:MM:SS, 24-hour). `promptQA` additionally
needs the runtime data block Vaani held during the call injected — if it arrives unfilled, the
data-dependent rules silently stop detecting anything and every call reports clean.

## Keep the output shapes stable

Monitoring reads the **nested** JSON out of the QA output rather than flat counts. Renaming or
flattening a field breaks the consumers of it silently.

> **Status note.** [../../CLAUDE.md](../../CLAUDE.md) records `postCallAnalysis.txt` and
> `postCallAnalysisFlat.txt` as unique to this channel, with [../../../CHANNELS.md](../../../CHANNELS.md)
> D-04 marking it unconfirmed whether the absence of a CRC counterpart is intended. Per repo rule
> 6.6, which of `postCallAnalysis.txt` and `postCallAnalysisFlat.txt` is deployed should be marked
> in the files themselves; it currently is not.
