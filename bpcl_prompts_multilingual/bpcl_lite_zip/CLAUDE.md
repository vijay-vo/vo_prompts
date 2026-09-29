# bpcl_lite_zip — channel contract

The **Bharat Gas Lite zip line.** Calls arrive from the IVRS, and Vaani answers from the
**Bharat Petroleum Mumbai Headquarters office**, exactly as on [`bpcl_ivrs_support`](../bpcl_ivrs_support/CLAUDE.md).
The difference is who calls: **most callers on this line are asking about Bharat Gas Lite zip.**

**Since 2026-09-29 ([../CHANNELS.md](../CHANNELS.md) LZ-01) this channel is a copy of IVRS:** the same
15 agents plus `unregisteredComplaintAgent`, the same post-call set, the same tools, the same
escalation (no human transfer), the same persona and the same Lite zip ownership by
`newConnectionAgent_onHold`. It was copied byte for byte from `bpcl_ivrs_support/prompts/` and
`docs/`.

**Read [`../bpcl_ivrs_support/CLAUDE.md`](../bpcl_ivrs_support/CLAUDE.md) first.** Every rule in it
applies here, except the differences listed below. This file does not repeat IVRS's contract, so the
two cannot drift apart. Shared truth for every channel is in [../CLAUDE.md](../CLAUDE.md).

---

## The one difference from IVRS: the greeting opens on Lite zip

`Default` STAGE 1 keeps the Lite zip greeting, because that is what most callers here want:

> "नमस्ते, भारत पेट्रोलियम में आपका स्वागत है। मेरा नाम वाणी है। मैं आपकी लाइट ज़िप कनेक्शन लेने में कैसे सहायता कर सकती हूँ?"

IVRS moved to a neutral greeting on 2026-09-29 (CHANNELS.md IVRS-GREET-01), along with the
"most consumers on this line are calling about Lite zip" framing that went with it. **This channel
keeps both.** Opening on Lite zip still decides nothing: Vaani routes on what the caller actually
says, so a refill, delivery or payment caller is routed as usual.

Any other difference from IVRS is a drift bug.

## Porting rule

**A fix landing in IVRS lands here too, in the same session**, unless it touches the greeting or the
Lite zip framing. Port it byte for byte. This channel has no transfer, so IVRS text needs no
escalation translation here.

## The old two-agent design is in `legacy/`, not deployed

Before LZ-01, this channel ran its own two-agent design. It is kept in [legacy/](legacy/) for
reference, and every file there starts with a NOT DEPLOYED banner:

| File | What it was |
|---|---|
| `legacy/Default.txt` | The standalone Lite zip agent (greeting to goodbye, the twelve-state App flow) |
| `legacy/unregisteredComplaintAgent.txt` | The complaint desk (name → `updateContact` → PIN code → `get_pincode_data` → `bpcl_create_unregistered_complaint`) |
| `legacy/pcalitezip.txt` | Its post-call analyser, already stale |
| `legacy/CLAUDE.md` | Its channel contract |

Its Lite zip facts and its complaint order were already carried into IVRS's
`newConnectionAgent_onHold` and `unregisteredComplaintAgent` on 2026-09-24. **Never deploy a legacy file.**

## Before you edit

1. Never create `.bak` copies of prompt files. Edit in place.
2. Make the change in IVRS first, then copy it here, unless it concerns the greeting or the Lite zip
   framing.
3. A new intended difference from IVRS needs a row in [../CHANNELS.md](../CHANNELS.md) in the same edit.
