# ujjwala_refill_outreach — case contract

**Outbound**, **fully multilingual** voice line for Bharat Petroleum (Bharat Gas) **P M U Y (Ujjwala)
beneficiaries** who have done biometric authentication recently but have not taken a refill.
Created 2026-10-13. **No prompt written yet.** The client's script goes in `docs/` first, and the
prompt is built from that script.

## The campaign (from the user, 2026-10-13)
- About 2.74 crore Ujjwala beneficiaries in all.
- About 30 lakh of them have taken **no refill since 01.04.2025**.
- About 12 lakh of those 30 lakh have done **biometric authentication recently**. These 12 lakh
  are the call list.
- Goal: call each one, find out **why they have not taken a refill**, and go further from there
  (the details come from the client script).

## How it is built (house rules for this folder)
- **Multilingual, instructions only.** The agent speaks the consumer's language. Spoken lines are
  FIXED ENGLISH LINES in quotes, said in the consumer's language and script, with the same meaning
  and nothing added. Data goes in square-bracket slots. No Indian script, no sample data inside a
  line, no stories from live calls.
- Plain text, no markdown, in the shipped `.txt` files.
- Second person ("You ...") everywhere in the prompt, never "I".
- Give positive instructions, not lists of things never to say.
- **The client docs in `docs/` are the source of truth.** Report any mismatch in chat, and log open
  points in `BPCL_QUESTIONS.md`.
- Tool work follows `bpcl_prompts/TOOL_CALLING.md`. To avoid a closing line being spoken twice, it
  goes in callhangup's preToolMessage only.

## Layout
- `docs/`: the client script and any reference material BPCL sends.
- `prompts/Default/Default.txt`: the agent (to be written).
- `BPCL_QUESTIONS.md`: open points for BPCL.

## Not done yet
- Client script not received yet.
- Prompt not written. Wait for the script and an explicit go-ahead.
