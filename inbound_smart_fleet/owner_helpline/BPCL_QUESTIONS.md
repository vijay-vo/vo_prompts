# Smart Fleet Owner Helpline — open questions for BPCL

The general Smart Fleet questions (bonus offer, Petro miles, fuel credit, cards, insurance) are in
[`../../outbound_smart_fleet/balance_alert/BPCL_QUESTIONS.md`](../../outbound_smart_fleet/balance_alert/BPCL_QUESTIONS.md).
These are specific to the owner line (created 2026-10-10, none answered yet).

1. **Verification.** How should an inbound owner be verified — registered mobile (caller ID), last
   digits, FAID, OTP? (Demo: name + last four digits of the registered mobile.)
2. **Recharge statuses.** What statuses does the system show for a recharge (initiated, received,
   in process, credited, failed, returned), and what does each mean for the owner?
3. **Timing per mode.** How long until a recharge is added — NEFT / RTGS / IMPS / UPI / card / net
   banking / FINO? (Demo: NEFT "usually the same working day"; nothing else stated.)
4. **Wrong-account transfers.** What happens to an NEFT sent to the wrong virtual account or without
   it — is it returned, and how does the owner trace it?
5. **Failed UPI.** For a UPI recharge that failed but was debited, is it returned by the bank, or by
   Smart Fleet? Is there a reference the owner should use?
6. **Escalation.** If a recharge is not added after the expected time, what should the owner do — App
   help section, a ticket, a number? (Demo: no number; App only.)
7. **Data per call.** Which fields could a backend return for an inbound owner: wallet balance, recent
   recharges with status, per-card limits and usage, card status, Petro miles and expiry, account type?
8. **Accountant access.** May an accountant or office manager with the verification detail hear account
   facts? (Demo: yes.)
9. **Bonus on a pending recharge.** If a qualifying recharge is still in process on the offer's last
   day, does it count? (Demo: the owner's NEFT is well before the date.)
