# emergencyAgent (CC)

| File | Agent | Lines |
|---|---|---|
| `emergencyAgent.txt` | `emergencyAgent` | 267 |

Gas hazard handling — leak, smell, fire, burst hose. **This agent owns the call absolutely while a
hazard is live.**

- Any agent, at any moment, switches here on a confirmed hazard, **bypassing all gating**.
- While the hazard is live it **cannot switch, cannot hang up, and has no closing sequence**.
- The *words* "emergency" or "urgent" alone are not a hazard — ask once before switching.
- Emergency helpline **1906**, always spoken digit by digit.

This behaviour is shared truth: it is identical in CRC and any change lands in both channels in the
same session.
