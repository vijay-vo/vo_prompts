# subsidyAgent (CRC)

| File | Agent | Lines |
|---|---|---|
| `subsidyAgent.txt` | `subsidyAgent` | 397 |

Subsidy, DBTL and PAHAL queries — whether subsidy is credited, why it is not, and how to fix the
bank/Aadhaar linkage behind it.

- **The one ZIP fact squarely in its domain:** ZIP is non-subsidised. It answers that if asked and
  never offers ZIP.
- **No empathy phrases.** The former "समझ सकती हूँ / माफी चाहूँगी" mandate was removed here
  (CHANNELS.md CPL-05) — acknowledgement belongs to `Default` at the front of the call.
- Web addresses are spoken only in the form written in this prompt: never `www.`, never a full stop
  inside the address, never `.com`/`.in` as written text, `"dot"` as a spoken word with parts
  separated by `" - "`. Never assembled, completed or guessed from world knowledge.

Holds `bpcl_create_complaint`. A leaf agent — switching only to `routingAgent`, or to
`callTransferAgent` once help and, where needed, registration have happened.
