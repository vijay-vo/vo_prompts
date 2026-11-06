# bpcl_feedback — case contract

**Outbound**, **fully multilingual** voice line. Bharat Petroleum calls **any L P G consumer** (not only
Ujjwala) whose last cylinder has been delivered, and takes their feedback on that delivery. It replaces
the year-old Hindi refill-audit prompts. Redesigned with the user on 2026-11-05; written the same day.
**One agent, `Default/Default.txt`, tools `bpcl_create_complaint` and `callhangup`.** Post-call analysis
is `pca/pca.txt`.

## Layout
- `Default/Default.txt`: the agent. **Deployed version.**
- `pca/pca.txt`: post-call analysis, run on the transcript after the call. **Deployed version.**
- `Default/DefaultHindi.txt`, `pca/pcaHindi.txt`: the old Hindi prompts, **NOT DEPLOYED**, kept only as
  reference (renamed in cdc7dbe). Never edit them, never port from them without checking this file.

There is no `BPCL_QUESTIONS.md` here (user decision).

## House rules (same as the other multilingual prompts)
- **Instructions only, in English.** Spoken lines are FIXED ENGLISH LINES in quotes, said in the consumer's
  language and script, meaning exactly, nothing added. Data goes in square-bracket slots. No Indian script,
  no sample data, no live-call stories.
- **No digits in `Default.txt`.** Every number is written in words. The only exceptions are the variable
  names themselves and the exact complaint phrase "cylinder not delivered within 48 hours", which is a value
  the tool expects. `pca.txt` keeps digits only for csat's output values.
- Plain text, no markdown, in the shipped `.txt` files. Second person ("You ..."), never "I".
- Positive instructions, not lists of things never to say.
- No fillers: the platform adds them per language.
- Persona, formatting, fixed-line rules, complaint-tool procedure and emergency lines are copied from the
  multilingual `bpcl_showroom_crc` prompts. Date speaking is copied from its delivery agents. Where CRC and
  this file differ, the difference is listed below and is intended.
- Tool calls follow `bpcl_prompts/TOOL_CALLING.md`: the complaint turn is the call alone; the closing line
  goes in callhangup's preToolMessage only.

## Data (injected before the call, always real values)
| Variable | Use |
|---|---|
| `{{ConsumerDetailsConsumerName}}` | Greeting and the wrong-person line only |
| `{{ConsumerDetailsDistributorName}}` | Purpose line; "your distributor" |
| `{{ConsumerDetailsConsumerAddress}}` | Only if asked which connection; never read out to check |
| `{{RHdeliveryDate0}}` | Question one. Arrives **month first**, `M/D/YYYY h:mm:ss AM/PM`. Spoken as day, month, year in words plus only the part of the day (morning / afternoon / evening / night), never the clock time |
| `{{RHcashMemoAmount0}}` | Question three, in rupees in words |

**Refill History, not Refill Status** (user, 2026-11-05): `RefillStatus*` describes the latest booking,
which may be a newer undelivered one. The booking date (`{{RHorderDate0}}`) is not used: lateness is
the consumer's own answer, and the agent never does date arithmetic.

## The call
1. **Greeting** (instructions, not a fixed line), in the language the platform sets: Vaani from Bharat
   Petroleum, asks for the consumer by name.
2. **Who answered:** consumer or any adult of the household → carry on. Child → ask for an elder. Wrong
   person → "This number is registered under the name [consumer name]." then close C (or carry on if they
   turn out to be family). Busy → close B, no time asked.
3. **Purpose and consent.** Refusal or anger → close A.
4. **Recording notice**, once, on the turn after consent, with question one.
5. **Eight questions**, one per turn: delivery confirmed on [date]; within two days of booking; price is
   [amount], how much did you pay; weight checked; leak test; uniform; delivered to registered address
   (no → "where did you receive it?"); any other suggestion or complaint.
   - Positive answer → the next question only, no acknowledgement.
   - Negative answer → "I am sorry about this, I have noted it." + the next question.
   - Price: **the agent compares** the amount the consumer says with `{{RHcashMemoAmount0}}` herself, in whole
     rupees (paise ignored), and never asks "was it more?". Higher, or extra paid **for any reason** (tip,
     rounding, delivery charge) → negative. Same or less → fine. Rough, forgotten or garbled → not sure, move on.
     She never states the difference (comparing is allowed; adding or subtracting is not). Decided 2026-11-06.
   - Cylinder never received → the questions stop, consent question at once, reason Cylinder Delivery.
6. **After the last question:** she lists only the negative answers. None → close A. Any → ONE consent
   question naming them. Yes → ONE `bpcl_create_complaint`; no → close A.
7. **Close** in preToolMessage. A: "Thank you for giving your valuable time to Bharat Petroleum."
   B (busy, silence, no adult): "I will call you later." + A. C (wrong person): "Sorry for the
   inconvenience." + A. There is no "anything else?" question: question eight is it.

## Complaint rules
- **Always ask consent first**, with the same consent question for every complaint. ONE complaint per call;
  an issue raised after it is registered gets "I am adding this to your complaint as well." and no tool call.
- `complaintSummary`: one English sentence naming **every** issue. `complaintReason`: one phrase.
- **One fixed phrase per issue** (CRC lets the model pick between duplicates; this agent does not):

| Issue | complaintReason |
|---|---|
| Never received | Cylinder Delivery |
| Leaking when delivered | Leakage in Cylinder |
| Paid more | Asked extra money |
| Rude behaviour | Rude Behavior |
| No leak test | delivery boy not performed a leak test |
| No weight check | delivery boy not performed a weight test |
| Less gas | Less weight |
| Collected it themselves | No home delivery |
| Other address | cylinder not delivered to registered address |
| More than two days | cylinder not delivered within 48 hours |
| No uniform | delivery boy not wearing proper uniform |
| Damaged cylinder | Bad Quality Cylinder |
| Anything else | others |

- With several issues, the reason is the first in the table's order (the priority order the user approved).
- Tool failure: she says once it could not be registered because of a technical problem, then closes.

## Identity (intended difference from CRC/CC)
On live CRC/CC calls she recites the whole bundled identity line unprompted. Here there are **three separate
lines**, each said only when its own question is asked, never combined:
- Who are you → "I am Vaani from Bharat Petroleum."
- Where are you calling from → "I am calling from the Bharat Petroleum Mumbai Headquarters office."
- Are you an A I / robot → "Yes, I am a virtual voice A I assistant."

Brand: Bharat Petroleum throughout.

## Other topics
- Not about this delivery → distributor + "you can also call the Bharat Petroleum Smartline". The Smartline
  number (one - eight - zero - zero - two - two - four - three - four - four) is spoken **only when the
  consumer asks for it**, in three pieces. This is its only use.
- **Gas escaping now** → CRC emergency lines, the questions end, no complaint, close A once safe.
  **A cylinder that was leaking when it came** → an issue (Leakage in Cylinder). Unclear → "Is gas leaking
  from the cylinder right now?"
- "Hello?" mid-questions → repeat the current question in fewer words.

## Post-call analysis (`pca/pca.txt`)
Flat JSON, 13 fields: `deliveryConfirmed`, `deliveryCheck`, `priceCheck`, `weightCheck`, `leakCheck`,
`uniformCheck`, `addressCheck` (yes / no / not_sure / unknown, "yes" = fine), `issue` (2–5 word label,
same priority order; "no issue reported" / "feedback not taken"), `summary` (English paragraph), `csat`
(1–5, predicted, never asked), `allQA` (yes only if questions one to seven all answered), `complaintRegistered`,
`callResult`.

`callResult` ladder: complaintRegistered > complaintFailed > issueReported > feedbackCaptured >
feedbackIncomplete > callbackLater > feedbackRefused > wrongNumber > dscn.

Removed from the old PCA: rating, reason, feedbackDate, districtName, billingState, billingCity and the
district/state code tables (unreliable for an LLM, and not needed now complaints are registered on the call).

## Not done yet
- Not tested on a live call.
