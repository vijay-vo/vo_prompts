# ujjwala_refill_outreach — case contract

**Outbound**, **fully multilingual** voice line for Bharat Petroleum (Bharat Gas) **P M U Y (Ujjwala)
beneficiaries** who have done biometric authentication recently but have not taken a refill.
Created 2026-10-13. **One agent, `prompts/Default/Default.txt`, only tool `callhangup`.** Built
from BPCL's questionnaire in `docs/`, rewritten as a conversation (the questionnaire is not read out).

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
- `docs/Proposed Questionnaire for Nil Refill PMUY Customers.txt`: BPCL's questionnaire (the .docx
  copy had the same text and was removed, 2026-10-13).
- `prompts/Default/Default.txt`: the agent.
- `BPCL_QUESTIONS.md`: open points for BPCL.

## Two parts: the agent and post-call analysis
The questionnaire mixes two jobs. **The agent** (Vaani) only talks: it finds the reason, helps, and
closes. **Post-call analysis** (not written yet) reads the transcript and fills BPCL's fields: the
reason codes R01-R18, the second reason, the BNPL interest, the refill timing, the distributor
callback and the disposition C01-C13. A separate HTTP API pushes that to BPCL, and BPCL's side does
the follow-up. So the prompt never names a code and never reads options out.

## Decisions taken with the user (2026-10-13)
1. **Greeting** (user's line, kept as a fixed English line): "Namaste, I am Vaani speaking from
   Bharat Petroleum. Am I speaking with [consumer name]?" Said in the call's opening language: Hindi
   for now, another Indian language once the platform sends one (platform first message). BPCL's long
   opening is NOT in the greeting. The purpose is the next turn: "No gas refill has been taken on
   your connection since April two thousand twenty five. Is there some difficulty?" From the first
   reply, Vaani speaks the consumer's language.
2. **A conversation, not a form.** Vaani has five things to understand (reason, how they cook now,
   what helps, when they will refill, distributor contact) and asks only what has not come out.
   One soft try for any help, then the no is final.
3. **Data:** the same variables as IVRS: `ConsumerDetailsConsumerName`, `ConsumerDetailsConsumerNumber`,
   `ConsumerDetailsConsumerAddress`, `ConsumerDetailsDistributorName`,
   `ConsumerDetailsDistributorAddress`. **No** last refill date, **no** distributor phone number, no
   mobile number in the prompt.
4. **"Your distributor will contact you"** is said when the consumer has a need and agrees. There is
   no callback list on our side; post-call analysis plus BPCL's API carry it. Never a time.
5. **No callback time is asked** for "call later": Vaani says "we will call again" and closes.
6. **BNPL:** only BPCL's own wording (take the refill now, pay later; the distributor gives details;
   it depends on eligibility and terms). News reports (2-4 Oct 2026, from BPCL's X post of
   24 Sep 2026) say up to 600 rupees, zero interest, 100 rupees a week for 6 weeks, some states only.
   That is not BPCL-confirmed, so none of it is spoken.
7. **14.2 kg only.** No Mini, no Lite zip, no 5 kg. Low use is accepted without selling anything; cost
   goes to BNPL; a question about a smaller cylinder is "your distributor can tell you".
8. **Firewood or biomass:** one soft line (no smoke, better for health), and at most one more (cooks
   faster, saves time gathering wood). Induction: works when the power goes off.
9. **Death:** condolence, then the connection can be transferred to a family member through the
   distributor. **Shifted:** transfer to the new place through the distributor.
10. **Booking help:** missed call 7718955555 first (no smartphone needed), then WhatsApp 18002243344
    ("Refill"), then the Hello BPCL App, one per turn, numbers in pieces (from IVRS bookingEligibleAgent).
11. **Closing** in callhangup's preToolMessage only, in the consumer's language. Every close ends with
    the user's line "Thank you for giving your valuable time to Bharat Petroleum. Have a good day.";
    B (distributor will contact), C (call again) and D (wrong number or refused) put one short clause
    before it. After a death, E (no distributor contact) and F (distributor will contact) repeat the
    condolence ("Once again, I am very sorry for your loss. Please take care of yourself and your
    family.") and drop "Have a good day". The condolence turn itself is "I am very sad to hear this.
    I am very sorry for your loss.", said in plain village words.

## Learnings carried over from the other agents
Fixed English lines translated, not transliterated (FIXED-01, XLIT-01); feminine self-reference;
greeting once, no re-introduction (INTRO-01); A I only when asked (ID-01); "Bharat Petroleum" in full;
"distributor" kept as is; names and addresses never spelled (TTS-03); long numbers in three pieces,
digit words in the consumer's language; missing data answered, never invented (GAP-01); the close
question only when the consumer is done (CLOSE-01); one complete tool list (TOOLS-01).

## Not done yet
- Post-call analysis prompt (BPCL's fields R01-R18, C01-C13 and the rest).
- Not tested on a live call.
