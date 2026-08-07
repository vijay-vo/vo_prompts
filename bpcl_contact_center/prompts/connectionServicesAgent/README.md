# connectionServicesAgent (CC)

| File | Agent | Lines |
|---|---|---|
| `connectionServicesAgent.txt` | `connectionServicesAgent` | 331 |

Everything about an existing connection's record and lifecycle: **KYC, address change, mobile
number change, name change, surrender, portability, PNG**.

Domain fact it depends on: **KYC is valid under 9 months**.

It owns the canonical **TTS-SAFE DELIVERY** rules for injected data — the same rule set other
prompts carry a narrower copy of. Web addresses are spoken only in the form written in the prompt:
never `www.`, never a full stop inside the address, never `.com`/`.in` as written text, `"dot"` as a
spoken word with every part separated by `" - "`.

A leaf agent — its only switch target is `routingAgent`.
