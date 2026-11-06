# bpcl_feedback — case contract

**Outbound**, **fully multilingual** voice line. Bharat Petroleum calls **any L P G consumer** (not only
Ujjwala) whose last cylinder has been delivered, and takes their feedback on that delivery. It replaces
the year-old Hindi refill-audit prompts. Redesigned with the user on 2026-11-05; written the same day.
**One agent, `Default/Default.txt`, tools `bpcl_create_complaint` and `callhangup` only.** The workflow also
holds `bpcl_complaint_access_token`; the platform runs it, and the agent never calls it (user, 2026-11-06). Post-call analysis
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
1. **Greeting split in two** (user, 2026-11-06). The platform's first message is static and carries only the
   greeting and her name: "Namaste, I am Vaani speaking from Bharat Petroleum." (table below). The prompt's
   first turn, after the consumer's first reply, is the fixed line "Am I speaking with [consumer name]?",
   in the consumer's language (the greeting's language if the reply has none). The name stays out of the
   platform message, so the prompt's name cleaning (salutation dropped, whole words in script) applies.
2. **Who answered:** consumer or any adult of the household → carry on. Child → ask for an elder. Wrong
   person → "This number is registered under the name [consumer name]." then close C (or carry on if they
   turn out to be family). Busy → close B, no time asked.
3. **Purpose and consent.** Refusal or anger → close A.
4. **Recording notice**, once, on the turn after consent, with question one.
5. **Eight questions**, one per turn: delivery confirmed on [date]; within two days of booking; price is
   [amount], how much did you pay; weight checked; leak test; uniform; delivered to registered address
   (no → "where did you receive it?"); any other suggestion or complaint.
   - **A conversation, not a form** (user, 2026-11-06, after live calls where she ignored what the consumer
     said): a block near the top outranks the flow. She listens first, responds in one short sentence of her
     own to anything beyond the bare answer (a story, a question, a worry, praise), explains a question she
     was not understood on, then asks the next question. The questions stay fixed lines.
   - Plain positive answer → the next question, no thanks or praise.
   - Negative answer → her own short, specific, varied acknowledgement (sorry + noted) + the next question.
   - Price: **the agent compares** the amount the consumer says with `{{RHcashMemoAmount0}}` herself, in whole
     rupees (paise ignored), and never asks "was it more?". Higher, or extra paid **for any reason** (tip,
     rounding, delivery charge) → negative. Same or less → fine. Rough, forgotten or garbled → not sure, move on.
     She never states the difference (comparing is allowed; adding or subtracting is not). Decided 2026-11-06.
   - Cylinder never received → the questions stop, consent question at once, reason Cylinder Delivery.
6. **After the last question:** she lists only the negative answers. None → close A. Any → ONE consent
   question naming them. Yes → ONE `bpcl_create_complaint`; no → close A.
7. **Close** in preToolMessage only (HANG-PTM-01 as on crc-complaint-status 3b80d35, after a live double goodbye
   2026-11-06): the top CALL ENDING line carries the exact closing lines; the closing line is never text; the
   complaint-outcome turn never carries the goodbye. A: "Thank you for giving your valuable time to Bharat Petroleum."
   B (busy, silence, no adult): "I will call you later." + A. C (wrong person): "Sorry for the
   inconvenience." + A. There is no "anything else?" question: question eight is it.

## Platform first message, per language (static, no name)
Spoken with each language's own greeting word. The second column is only what the prompt's first turn
will say in that language, for checking; it is not configured anywhere.

| Language | First message | First turn of the prompt |
|---|---|---|
| Hindi | नमस्ते, मैं भारत पेट्रोलियम से वाणी बोल रही हूँ। | क्या मेरी बात [name] जी से हो रही है? |
| English | Hello, this is Vaani from Bharat Petroleum. | Am I speaking with [name]? |
| Kannada | ನಮಸ್ಕಾರ, ನಾನು ಭಾರತ್ ಪೆಟ್ರೋಲಿಯಂನಿಂದ ವಾಣಿ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. | ನಾನು [name] ಅವರೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆಯೇ? |
| Telugu | నమస్కారం, నేను భారత్ పెట్రోలియం నుండి వాణి మాట్లాడుతున్నాను. | నేను [name] గారితో మాట్లాడుతున్నానా? |
| Tamil | வணக்கம், நான் பாரத் பெட்ரோலியத்திலிருந்து வாணி பேசுகிறேன். | நான் [name] அவர்களிடம் பேசுகிறேனா? |
| Malayalam | നമസ്കാരം, ഞാൻ ഭാരത് പെട്രോളിയത്തിൽ നിന്ന് വാണിയാണ് സംസാരിക്കുന്നത്. | [name] ആണോ സംസാരിക്കുന്നത്? |
| Odia | ନମସ୍କାର, ମୁଁ ଭାରତ ପେଟ୍ରୋଲିୟମରୁ ବାଣୀ କହୁଛି। | ମୁଁ କ'ଣ [name]ଙ୍କ ସହ କଥା ହେଉଛି? |
| Marathi | नमस्कार, मी भारत पेट्रोलियममधून वाणी बोलत आहे. | मी [name] यांच्याशी बोलत आहे का? |
| Gujarati | નમસ્તે, હું ભારત પેટ્રોલિયમમાંથી વાણી બોલું છું. | શું હું [name] સાથે વાત કરી રહી છું? |
| Bengali | নমস্কার, আমি ভারত পেট্রোলিয়াম থেকে বাণী বলছি। | আমি কি [name]-এর সঙ্গে কথা বলছি? |
| Punjabi | ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੈਂ ਭਾਰਤ ਪੈਟਰੋਲੀਅਮ ਤੋਂ ਵਾਣੀ ਬੋਲ ਰਹੀ ਹਾਂ। | ਕੀ ਮੇਰੀ ਗੱਲ [name] ਜੀ ਨਾਲ ਹੋ ਰਹੀ ਹੈ? |

Sarvam's standard speech recognition covers eleven languages; the four South Indian ones are Kannada, Telugu,
Tamil and Malayalam. Have a native speaker check each line on the TTS voice before going live.

## Language (live failure, 2026-11-06)
A Malayalam consumer ("Athe", then Malayalam script on every turn) got Hindi for the whole call: she kept the
language of her own earlier turns. Fixed with a top-of-file LANGUAGE — HIGHEST PRIORITY line and a rewritten
LANGUAGE block: the language is decided again before every turn from the consumer's latest words; her own
turns and the opening language never decide it; one-word replies carry a language (athe, aamaa, avunu, houdu,
ho, haan); a reply with no language keeps the current one. Same call also showed: a yes ("athe") not taken as
a yes, the name read with "S/O ...", the off-topic line repeated word for word five times, and Devanagari
digits. All four fixed in the prompt. The English "Hello?" / "Are you there?" turns every eight seconds are
the platform's inactivity prompts, not the agent: they need a longer timeout and the call's language.

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
`uniformCheck`, `addressCheck` (yes / no / notSure / noAnswer, "yes" = fine;
no "unknown" and no "notAsked": Vaani must ask every question, so a missing answer is "noAnswer" — user, 2026-11-06), `issue` (2–5 word label,
same priority order; "no issue reported" / "feedback not taken"), `summary` (English paragraph), `csat`
(1–5, predicted, never asked), `allQA` (yes only if questions one to seven all answered), `complaintRegistered`,
`callResult`.

`callResult` ladder: complaintRegistered > complaintFailed > issueReported > feedbackCaptured >
feedbackIncomplete > callbackLater > feedbackRefused > wrongNumber > disconnected.

`csat` is scored high on purpose (user, 2026-11-06): a consumer who stays on an outbound feedback call is
already cooperating. "5" is the normal score for a completed polite call even with problems reported; a busy,
wrong-number or polite-refusal call is "4"; "1" only for abuse; between two scores, the higher.

Removed from the old PCA: rating, reason, feedbackDate, districtName, billingState, billingCity and the
district/state code tables (unreliable for an LLM, and not needed now complaints are registered on the call).

## Not done yet
- Not tested on a live call.
