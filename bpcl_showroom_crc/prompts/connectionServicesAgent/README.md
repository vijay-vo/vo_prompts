# connectionServicesAgent (CRC)

| File | Agent | Lines |
|---|---|---|
| `connectionServicesAgent.txt` | `connectionServicesAgent` | 414 |

Everything about an existing connection's record and lifecycle: **KYC, address change, mobile
number change, name change, surrender, portability, PNG**.

Domain fact: **KYC is valid under 9 months**.

- It owns the canonical **§9 Rule 6 TTS-SAFE DELIVERY** rules, widened from "ALL distributor data"
  to "ALL injected location data" so the CRC office pair is covered (CHANNELS.md).
- Web addresses are spoken only in the form written in this prompt — never `www.`, never a full stop
  inside the address, never `.com`/`.in` as written text, `"dot"` spoken with parts separated by
  `" - "`.
- **No empathy phrases** (CHANNELS.md CPL-05) — acknowledgement belongs to `Default`.
- **ZIP is knowledge only.**
- Submitting KYC documents is one of the two physical actions that genuinely need a counter — that
  is information, not an escalation. An office visit is never offered as a way to escalate.

Holds `bpcl_create_complaint`. A leaf agent — switching only to `routingAgent`, or to
`callTransferAgent` once help and, where needed, registration have happened.
