# Competitor research — two-wheeler oil, India (2026-10-03)

Background for the **COMPETITOR BRANDS** block in `prompts/Default/Default.txt`.
**None of this goes into the prompt.** Urja deliberately holds no competitor facts — only brand-name
recognition — so that she cannot invent a grade, a price or a claim. This file exists so that *we*
can check that the reasons she does give are true, and so the next person does not have to redo the
research.

Prices are approximate street prices from Amazon.in / Flipkart / Moglix, October 2026. They move
constantly and several are third-party-seller quotes; treat every figure as indicative, not as MRP.

## Why this came up

BPCL does little consumer advertising for मेक, while Castrol, Gulf, Servo and Shell advertise heavily.
Callers therefore name a competitor's product out of habit on a line they rang *because it is Bharat
Petroleum's*. Client requirement (user, 2026-10-03): Urja must treat a competitor name as a cue to
sell मेक, never as a topic to discuss.

## The three brands we care about

The user chose **Castrol, Servo and Gulf** — Castrol for brand pull, and Servo and Gulf because the
focus is Indian competitors and Indian callers. Mobil, Shell and Motul are named in the prompt's
recognition list only, because callers do say them.

| Brand | Owner | Position in 2W |
|---|---|---|
| **Castrol** | BP (foreign) | Leads the 2W segment on brand pull (~27%). Activ and POWER1 are household names. |
| **Servo** | Indian Oil, PSU | India's largest lubricant brand overall (>27% of finished lubes). मेक's direct mirror: PSU, pump distribution, same mechanic channel. |
| **Gulf** | Gulf Oil Lubricants India, Hinduja (Indian-listed) | #2 private player after Castrol. Loudest advertiser — MS Dhoni since 2011. Recall runs ahead of actual share. |
| Mobil | ExxonMobil | Niche in 2W; known for car oil. Expanding but a minority player. |
| Shell | Shell | AX5/AX7 mainstream, Ultra premium. |
| Motul | Motul | Premium/enthusiast; the default for RE 650 twins and KTM. |

## Main products, by brand

### Castrol
| Product | Grade | Type | Spec | Pack | ~Price |
|---|---|---|---|---|---|
| Activ 4T | 20W-40, 10W-30 | mineral/blend | API SL | 900 ml, 1 L | ₹465–512 |
| Activ Scooter 4T | 10W-30 | blend | JASO MB | 800 ml | ₹418–487 |
| POWER1 4T | 10W-30, 15W-50 | synthetic tech | API SL | 900 ml, 1 L | ~₹505 |
| POWER1 Cruise 4T | 20W-50 | synthetic | API SP | 1 L | ~₹550 |
| POWER1 ULTIMATE 4T | 10W-40, 10W-50 | full synthetic | API SP | 1 L | ₹851–1,156 |

### Servo (Indian Oil)
| Product | Grade | Type | Spec | Pack | ~Price |
|---|---|---|---|---|---|
| Servo 4T (the classic green bottle) | 20W-40 | mineral | API SJ/SL | 900 ml, 1 L | ₹270–400 |
| Servo 4T Xtra | 20W-40, 10W-30 | semi-synthetic | API SN | 900 ml, 1 L | ₹399–465 |
| Servo 4T Zoom | 10W-30 | premium mineral | API SJ/SM | 900 ml | ₹260–275 |
| Servo 4T Synth | 10W-30 | synthetic blend | API SM | 1 L | ₹390–415 |
| Servo Scootomatic 4ST | 10W-30, 20W-40 | mineral | API SL, JASO MB | 1 L | ₹240–350 |
| Servo Hypersport F5 | 10W-50 | full synthetic, ester | API SP | 1 L | ₹740–1,200 |

"Servo Futura" is a **car** oil, not 2W. A caller asking for it for a bike has confused the lines.

### Gulf
| Product | Grade | Type | Spec | Pack | ~Price |
|---|---|---|---|---|---|
| Gulf Pride (was Pride 4T Ultra Plus) | 10W-30, 20W-40, 20W-50, 15W-50 | synthetic blend | **API SP**, JASO MA2 | 900 ml, 1 L | ₹300–445 |
| Gulf Pride 4T Plus | 10W-30, 20W-40, 20W-50 | mineral/blend | API SN/SP | 900 ml, 1 L | ₹300–465 |
| Gulf Pride Scooter Plus | 10W-30, 5W-30 | blend | API SN, JASO MB | 800 ml | ₹265–300 |
| Gulf Syntrac Superbike 4T | 10W-40, 10W-50, 15W-50 | 100% synthetic | API SP | 1 L | ₹560–985 |
| Gulf Zipp 4T | 20W-40, 10W-30 | mineral | entry | 900 ml, 1 L | ₹285–345 |

## Where मेक genuinely wins — checked against all three

This is the only part that matters for the prompt. A reason is listed in BLOCK 8 **only if it survives
all three columns**.

| Claim | vs Castrol | vs Servo | vs Gulf | Verdict |
|---|---|---|---|---|
| Newer generation oil (API SP) | ✅ Activ/POWER1 mass stock is SL | ✅ strongest — 4T is SJ/SL, Zoom SM, Scootomatic SL | ❌ Gulf Pride is already SP | **Say it of मेक alone, never as a comparison** |
| Scooter oil spec | ✅ | ✅ Scootomatic SL | ✅ Scooter Plus SN | ✅ **scootech next is API SP and beats all three** |
| Bharat Petroleum's own, at the pump | ✅ | = Servo is PSU too | ✅ | ✅ safe |
| The grade the maker itself recommends | ✅ | ✅ | ✅ | ✅ safe |
| Easy on the pocket | ✅ | ~ comparable | ~ comparable | soft claim only |
| Coupon and App cashback | ⚠️ | ⚠️ | ⚠️ | **state it, never claim it is unique** |

### Honesty flags — do not let these slip into the prompt
- **"Newer formula" is not a universal win.** Gulf Pride and Gulf Syntrac are already API SP, as are
  Castrol POWER1 Cruise/ULTIMATE and Servo Hypersport F5. It holds against the *mass* Castrol and
  Servo products, not across the board. Urja states it of मेक only, never as a comparison, so she is
  never wrong — but we should not strengthen the wording.
- **मेक has no 20W-40.** Castrol Activ, Servo 4T, Servo 4T Xtra, Gulf Pride and Gulf Zipp all sell
  one, and it is the volume commuter grade. Per the user's "only where मेक wins" rule, Urja never
  enters that comparison: she gives the grade BLOCK 6 lists for the caller's actual vehicle.
- **Cashback is not unique to मेक.** Mechanic loyalty and cashback schemes are common in this
  industry. Claiming "only मेक gives this" could be contradicted by an enrolled mechanic mid-call and
  would cost her credibility. She says what मेक gives, never what others do not.
- **Price is not a win at the premium end.** Gulf Syntrac 1 L runs ~₹650–900 against next synth at
  ₹903. मेक wins on value in the commuter range, not everywhere.

## Sources
Official: castrol.com/en_in · iocl.com (SERVO PDS) · india.gulfoilltd.com · shell.in · mobil.co.in ·
motulindia.com. Pricing cross-checked on Amazon.in, Flipkart and Moglix.
Market position: Persistence Market Research and Mordor (2W lubricants), Autocar Professional,
Hinduja Group.
