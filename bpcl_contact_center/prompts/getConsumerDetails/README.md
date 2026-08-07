# getConsumerDetails (CC)

| File | Agent | Lines |
|---|---|---|
| `getConsumerDetails.txt` | `getConsumerDetails` | 138 |

Entry point for callers whose number is **not** registered. Captures a mobile number, validates it,
and calls `bpcl_fetch_all_api`. This is the **only** agent in the channel allowed to call that API —
every other prompt carries a blocker forbidding it, because their consumer data is pre-injected.

On a successful fetch the platform resumes the call at `Default`.

**Known blocker** (see [../../docs/ORCHESTRATION.md](../../docs/ORCHESTRATION.md) §5): the recovery
loop cannot close. The prompt states in three places that it never hands off to another agent and it
holds **no `switchagent` tool** — its only exits are a `calltransfer` or a hangup. It needs
`switchagent` plus a `{{pendingAgent}}` variable.
