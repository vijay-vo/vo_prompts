# bpcl_lite_zip

**The Bharat Gas Lite zip line.** It is the same as [`bpcl_ivrs_support`](../bpcl_ivrs_support/README.md): calls come
from the IVRS, and Vaani answers from the Bharat Petroleum Mumbai Headquarters office with no human transfer.
The one difference is that most callers here want Bharat Gas Lite zip, so `Default` greets with the Lite zip line.

See [CLAUDE.md](CLAUDE.md) for the channel contract and [../CHANNELS.md](../CHANNELS.md) LZ-01 for the ledger row.

## Layout

| Path | What it holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | The channel contract: what differs from IVRS, and the porting rule |
| [prompts/](prompts/) | The shipped `.txt` prompts. Same folders and agents as [IVRS's prompts/](../bpcl_ivrs_support/README.md#prompts--folder-to-agent) |
| [docs/](docs/) | Copied from IVRS: [ORCHESTRATION.md](docs/ORCHESTRATION.md), [FLOW.md](docs/FLOW.md), [Flow.mmd](docs/Flow.mmd) |
| [legacy/](legacy/) | The old two-agent Lite zip design. **NOT DEPLOYED**, kept for reference |
