# postCallAnalysis — file status (CRC)

Four prompts sit side by side in [../prompts/postCallAnalysis/](../prompts/postCallAnalysis/).
Per root [CLAUDE.md](../../CLAUDE.md) §6.6, this records which of them is deployed.

| File | Status | What it does |
|---|---|---|
| `postCallAnalysis.txt` | **DEPLOYED** | Call metrics (15 flat fields) + the nested ADVANCED QA ANALYSIS block (overallVerdict, qaScore, csatAnalysis, summary, callDataCapture, behaviorOverview, riskObservations, evaluations, conversationInsights, coachingFeedback). |
| `vaaniQA.txt` | **DEPLOYED** (separate run) | Prompt-defect review. Emits `issues` + `unhandledRequests` only. Needs the runtime data block (`{{customerStatus}}`, distributor and CRC variables) injected. |
| `postCallAnalysis_withPromptQA.txt` | **CANDIDATE — not deployed** | `postCallAnalysis.txt` with the ADVANCED QA ANALYSIS section (and its nested output objects) replaced by the vaaniQA rule set. Output = 15 flat fields + `issues` + `unhandledRequests`. Original wording kept verbatim for easy review. |
| `postCallAnalysis_promptQA_merged.txt` | **CANDIDATE — not deployed** | Same field set, rewritten as one coherent prompt: single input/context block, two explicitly separated jobs, deduped headers. |

Both candidates **require the vaaniQA runtime variables to be injected into the post-call run**.
`postCallAnalysis.txt` today receives only the transcript, `{{system.current_date}}` and
`{{system.current_time}}`. If the data block arrives unfilled, the D-rules and A13 silently stop
detecting anything and every call reports clean.

## Rendering — why vaaniQA does not display

`postCallAnalysis` has a fixed shape: every key exists on every call, so a renderer can bind a
template to a known path. `vaaniQA` is two variable-length arrays and no scalar keys at all, so a
generic renderer prints only the cardinality (`14 items`, `2 items`). The proposed fix is a fixed
scalar header on vaaniQA (`reviewResult`, `reviewReason`, `issueCount`, `unhandledCount`,
`topArea`, `severity`), an `issueCountByArea` object carrying all 14 area keys including zeros, and
`id` / `title` / `severity` on every array element, with areas in camelCase.

**Partly applied, 2026-07-31, in both channels' `vaaniQA.txt`.** The first four scalars now ship:
`reviewResult` (`issuesFound` / `clean` / `notReviewed` / `partialReview`), `reviewReason`,
`issueCount`, `unhandledCount`. A clean call now says so explicitly instead of being an empty array,
and a call with no usable transcript returns `notReviewed` rather than looking clean. `partialReview`
covers the silent-failure mode described above — transcript present, consumer data block uninjected —
so it no longer reports as a good call. Still outstanding: `topArea`, `severity`,
`issueCountByArea`, and the per-element `id` / `title` / `severity`. The two undeployed CRC
candidates (`postCallAnalysis_withPromptQA.txt`, `postCallAnalysis_promptQA_merged.txt`) still carry
the old bare-arrays output and need the same header before either is deployed.

## Known defects, unrelated to the candidates above

- **Editing artifact in the deployed prompt.** `postCallAnalysis.txt:218` reads
  `2. Add this section after your existing FIELD DEFINITIONS` — a leftover instruction to a human
  that shipped into the prompt. CC has the same line at `postCallAnalysis.txt:290`. Delete in both.
- **`complaintRegistered` over-reports (fixed 2026-07-31, both channels).** Two observed variants:
  Vaani telling the consumer to *come to the office and register it themselves*, and Vaani saying
  *"मैं आपकी complaint register कर रही हूँ"* followed by the tool-failure line
  *"अभी complaint register करने में तकनीकी समस्या आ रही है"* — both returned
  `complaintRegistered: "yes"`, `complaintRegisteredAnalysis.result: "YES"` and
  `callResult: "complaintRegistered"`. The definition matched *any mention* of registering, so an
  in-progress statement scored as an outcome and a later failure never cancelled it. Now: only a
  completed, past-tense registration counts, and the last statement about the complaint wins, so a
  failed attempt is `complaintRegistered: "no"`. Patched in `postCallAnalysis.txt` (both channels)
  and CC's `postCallAnalysisFlat.txt`.
- **`callResult` gained `complaintFailed` (2026-07-31, both channels).** A tool outage is an
  operational signal, not a service outcome, so it no longer collapses into `unresolved`. It applies
  **only** to a real attempt that failed — never to a call where no complaint was attempted, never
  to one where the agent told the consumer to register it themselves (still `unresolved`), and a
  later successful attempt in the same call still returns `complaintRegistered`. Priority sits
  directly below `complaintRegistered` and above `issueResolved`. `callResult` only — the
  `complaintRegistered` yes/no field and `complaintRegisteredAnalysis` are unchanged by this, and
  both read `"no"` / `"NO"` on such a call. **Downstream reporting must accept the new enum value.**
- **`notes` added (2026-07-31, both channels).** A flat field after `callResult`: the whole call in
  one plain-English paragraph of 30–50 words — why they called, what the agent did, how it ended.
  Named `notes`, not `summary`, because the top-level `summary` key is taken by the pre-existing
  nested manager summary object (`customerName` / `agentName` / `callLanguage` / `issueRaised` /
  `resolutionStatus` / `overallAssessment`), which is unchanged. All three prompts use `notes`,
  including CC's `postCallAnalysisFlat.txt`, so the name means one thing everywhere.
- **CC's `feedbackDescription` removed, replaced by `notes` (2026-07-31).** It asked for the
  same 30–50 word English call summary, so the two duplicated each other. Dropped from
  `postCallAnalysis.txt` — key and definition both. `feedbackDate` stays. The two things it covered
  that `notes` did not are now folded into it in both channels: mention the customer's
  reaction when it stood out, and always populate the field. CC's copy additionally names transfer
  and scheduled callback as outcomes; CRC's does not, since neither exists in that channel.
