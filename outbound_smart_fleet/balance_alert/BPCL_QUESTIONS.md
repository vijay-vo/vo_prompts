# SmartFleet Balance Alert — open questions for BPCL

The demo agent (`Default.txt`) runs on a fictional fleet owner and some demo values.
Before this goes beyond a demo, confirm the following with BPCL SmartFleet. Nothing here is answered
yet (created 2026-10-10).

## Offers and Petromiles
1. **Bonus offer.** The demo says a recharge of ₹5 lakh or more by a date earns 5,000 bonus Petromiles.
   This is **our proposal, not a BPCL offer**. Would BPCL run a recharge-bonus campaign for these
   calls? If so, what threshold, bonus and validity?
2. **Earn rate.** How many Petromiles per litre or per rupee of fuel? Does it differ by fuel type,
   pump, or prepaid vs credit?
3. **Rewards catalogue.** The points needed per item (demo: truck tyre ≈ 25,000, CV battery ≈ 15,000,
   FASTag / vouchers from ≈ 1,000). Please share the current "List of Rewards".
4. **Wallet conversion value.** What is one Petromile worth as a wallet recharge? (Demo: ≈ ₹0.25.)
5. Are **Amazon / Flipkart vouchers and movie tickets** available to SmartFleet members, or only on
   SmartDrive? (Demo says "online shopping" and "entertainment" only.)
6. How exactly does an owner **redeem** — in the Hello BPCL for Business App, the portal, or at a
   loyalty retail outlet? Which items need an outlet visit?
7. What do **"OE tie-up for commercial vehicle servicing"** rewards actually give (which makers,
   discount or free service)?

## Recharge
8. How long does each recharge mode take to reflect (UPI / card / net banking / NEFT / RTGS / IMPS /
   FINO)? The demo states no time.
9. Is there a **minimum or maximum recharge**, or a UPI cap the agent should know about?
10. Can we send the owner a **WhatsApp summary of the call** (and a payment link) from our side? The
    demo agent now promises "all the details on your WhatsApp" at the end of the call; it needs a
    WhatsApp Business number and approved templates to be real.

## Fuel credit
11. How does an existing prepaid owner **apply for fuel credit** — App, portal, relationship manager,
    or helpline? (Demo: in the App, choosing a partner.)
12. Current **finance partners** (BPCL's page lists Sundaram Finance, Shriram Transport Finance, Tata
    Motor Finance; demo names Sundaram Finance and Shriram Finance).
13. May the agent say anything about **typical limits, interest or eligibility**, or must all of it go
    to the partner? (Demo: nothing.)
14. Can the agent offer a **credit limit increase** to owners already on credit who are near the limit
    (a second demo profile)?

## Cards and fleet
15. Can an owner **add a virtual card for a truck in the Hello BPCL for Business App**, and is it
    ready in about 15 minutes? (Demo assumes yes.)
16. Can a lost card be **blocked in the App**, or only on the portal? (Demo says App.) Same for PIN
    reset, statements, disputed fills and KYC change — the demo sends all of them to the App.
17. **Accident insurance:** cover amount, who is covered (driver / co-driver / cleaner), and how to
    claim. (Demo states the benefit only, no figure.)
18. Which data fields would the backend inject per call: owner name, business, wallet balance, daily
    spend, last recharge, low-balance count, Petromiles and expiry, card counts (active / dormant /
    missing), account type, KYC status?

## Call policy
19. If **office staff or an accountant** answers, may the agent give them the balance figure, or only
    "the wallet is low"? (Demo: no figures.)
20. The demo gives **no helpline number** (Urja answers everything herself). Is that acceptable, or
    must a human escalation number be offered for disputes?
21. Calling hours, DND / opt-out handling, and how often an owner may be called for a low balance.
