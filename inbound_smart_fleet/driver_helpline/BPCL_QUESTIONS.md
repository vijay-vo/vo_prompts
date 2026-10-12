# Smart Fleet Driver Helpline — open questions for BPCL

The general Smart Fleet questions (offers, Petro miles, credit, cards) are in
[`../../outbound_smart_fleet/balance_alert/BPCL_QUESTIONS.md`](../../outbound_smart_fleet/balance_alert/BPCL_QUESTIONS.md).
These are specific to the driver line (created 2026-10-10, none answered yet).

1. **Identifying the truck.** Is the **last four digits of the vehicle number** the right key? Could two
   trucks in one fleet share them? Can the platform pass the **caller's mobile** to look up the driver
   (cardless drivers are registered by mobile)?
2. **Decline reasons.** What decline codes / messages does the pump terminal show (low balance, daily
   limit, per-transaction limit, blocked, wrong P I N, KYC pending, product restriction)? The demo
   covers only four.
3. **Daily limit.** When does a card's daily limit reset — midnight, or 24 hours after the first fill?
   (Demo: "the next day".)
4. **Blocked card.** Can a blocked (hotlisted) card ever be reactivated, or is it always replaced?
   (Demo: replaced by a new virtual card.)
5. **Privacy.** May a driver be told *anything* about the account — e.g. "the owner's recharge is on
   its way"? (Demo: no account fact at all, only "the account needs balance".)
6. **What a stuck driver can do now.** Is there any emergency option for a driver at a pump (e.g. a
   small emergency credit, cardless fallback)? (Demo: none; the driver calls the owner.)
7. **Owner contact.** Should the line be able to **notify the owner** (SMS) when a driver's card fails?
   That needs a tool; the demo agent cannot.
8. Should the driver line give the **owner line's number** to an owner who calls here? (Demo gives no
   number.)
