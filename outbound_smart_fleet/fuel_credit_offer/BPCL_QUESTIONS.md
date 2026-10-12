# Smart Fleet fuel credit offer — open questions for BPCL

The agent (`Default.txt`) runs on the same fictional fleet owner as the balance alert and uses demo
values. Nothing here is answered yet (created 2026-10-12).

## Fuel credit
1. **Product name.** The agent says "Smart Fleet fuel credit" on the owner's existing Smart Fleet
   cards (no separate card). Is that right, or is there a distinct fuel credit card?
2. **Finance partners.** The agent never names a partner (user decision, 2026-10-12). Which partners
   should it be allowed to name, if any?
3. **Pay-later terms.** Credit period, interest, fees, limit range and repayment options. The agent
   states none of these today.
4. **Eligibility and papers.** What the partner checks and the exact paper list (the agent says
   "usually business KYC, RC papers and recent bank statements").
5. **Overdue.** Is it right that crossing the overall credit limit blocks all cards until payment?
6. **Wallet alongside credit.** Can an owner keep using the prepaid wallet once credit is active?
7. **Petro miles on credit fills.** Confirm credit fills earn Petro miles at the same rate as wallet fills.

## Shared with the balance alert
The Petro miles figures, rewards catalogue, virtual card timing and fee, Ghar and Be Cafe facts are the
same demo values as `outbound_smart_fleet/balance_alert/BPCL_QUESTIONS.md`; see that file.
