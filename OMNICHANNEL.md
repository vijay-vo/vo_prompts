# WhatsApp omnichannel demo — Smart Fleet balance alert

One customer journey across three channels that share one memory. The voice call starts it, our
server remembers it, and WhatsApp continues it. Email is support only.

## The flow

```
1. Outbound voice call (VoiceOwl, Urja)       outbound_smart_fleet/balance_alert/Default.txt
        │  call ends
2. Post-call analysis (VoiceOwl)              outbound_smart_fleet/balance_alert/postCallAnalysis.txt
        │  flat JSON, 29 string fields
3. HTTP node (VoiceOwl) ──POST──► our webhook
        │
4. Our server
     ├─ save the call to the customer's memory (keyed by phone number)
     ├─ if sendWhatsApp = "yes": send the WhatsApp template (opens with whatsappSummary)
     └─ send the support email (full summary + steps)
        │
5. Customer replies on WhatsApp ──► our WhatsApp agent (LLM on our server)
        reads the memory, answers with the same Smart Fleet facts as the call, logs every message
```

## Who owns what

| Part | Owner |
|---|---|
| Voice call, post-call analysis, HTTP node | VoiceOwl platform |
| Webhook, memory, WhatsApp sending and replies, email | Our server |

## Webhook contract (step 3)

The HTTP node sends the post-call JSON plus call metadata. Every value is a flat string.

| Field | From | Needed for |
|---|---|---|
| `customerPhone` | HTTP node (call metadata) | the memory key and the WhatsApp number — **must be present** |
| `callId` | HTTP node (call metadata) | ignoring a duplicate delivery of the same call |
| `callStartTime` | HTTP node (call metadata) | the memory timeline |
| the 29 post-call fields | post-call analysis | everything else (see `postCallAnalysis.txt`) |

To confirm in the HTTP node: that the customer's phone number and the call ID can be added to
the body, and whether the node runs on calls that never connected (`callOutcome = noConversation`).

## Server rules

- **Duplicates:** if `callId` is already saved, return 200 and do nothing.
- **Send WhatsApp only when `sendWhatsApp = "yes"`.** It is already "no" for staff, wrong numbers,
  refusals, do-not-call and emergencies.
- **`doNotCall = "yes"`:** mark the customer, send nothing on any channel, and never call again.
- **First WhatsApp message = an approved template.** WhatsApp allows free text only within 24
  hours of the customer's last message. Template body idea (one variable):
  `Namaste, Bharat Petroleum Smart Fleet ki aaj ki call ke liye dhanyavaad. {{1}} Koi bhi sawal ho to isi chat par reply karein.`
  where `{{1}}` = `whatsappSummary`. A template variable cannot contain line breaks, which is why the
  post-call prompt writes it on one line.
- **Email:** one message after the call with `callSummary`, the agreed recharge and the steps.
  No replies are handled on email. Demo email address comes from the demo customer's profile.

## The WhatsApp agent (step 5) — to build

- Same facts as the voice prompt (BLOCK 5–7 of `Default.txt`), rewritten for chat: short
  messages, no voice/TTS rules, digits and ₹ allowed.
- Gets the memory in its context: the call's `callSummary`, the decision fields, `openQuestions`,
  `nextBestAction`, and the WhatsApp history.
- Starts from `nextBestAction` and `openQuestions`; never re-asks what the call already settled.
- Must never contradict the call: same recommendation (₹5,00,000, step down ₹1,50,000), same
  bonus offer, same Petro miles figures, no new promises.

## Demo customer

Suresh Yadav, Yadav Roadlines, Indore — the hardcoded customer in `Default.txt` BLOCK 5.
