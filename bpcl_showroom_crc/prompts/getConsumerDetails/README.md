# getConsumerDetails (CRC)

| File | Agent | Lines |
|---|---|---|
| `getConsumerDetails.txt` | `getConsumerDetails` | 170 |

Entry point for callers whose number is **not** registered. Captures a mobile number, validates it,
and calls `bpcl_fetch_all_api` — the only agent allowed to call it; every other prompt carries a
blocker forbidding it because their consumer data is pre-injected.

On a successful fetch the platform resumes the call at `Default`.

**Its no-data closing is one of only two places** in this channel where Vaani asks the confirming
question *"shall I connect you to the senior team?"* — the other is T3, a failed
`bpcl_create_complaint`. Everywhere else, a consumer who asked for a person is never asked again.

There is a single `getConsumerDetails.txt` here. The old `getConsumerDetails_v2.txt` that prompted
the repo's duplicate-file rule is gone.
