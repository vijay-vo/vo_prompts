# Commercial LPG voice support (IVRS "press 9") — questions for BPCL

Created 2026-10-13. All questions are open. Please write your answer under each one. Where you
do not know, please tell us who in BPCL can answer.

## What we understood so far

- Commercial customers book cylinders on the Jio IVRS, as today.
- On the same IVRS, a new option ("press 9 for any query or complaint about your commercial
  connection") will connect the customer to our voice assistant, Vaani.
- Vaani should answer questions and take complaints from commercial and industrial customers,
  in the customer's own language.
- Vaani should know the safety code IS 6044 and the content of www.commerciallpg.in.

What we have read:
- IS 6044 Part 2 (2001): bulk storage tanks (above 450 litres water capacity) at commercial,
  industrial and domestic premises.
- IS 6044 Part 1 (2000, Amendment 1 of 2008): commercial and industrial **cylinder** installations
  (hotels, restaurants, canteens, factories using 19, 35, 47.5 kg cylinders).
- www.commerciallpg.in: home page, Submit Request, Track Request, LPG Prices, Catalogue, Contact Us,
  and the industry pages.

If any of the above is wrong, please correct us first.

---

## 1. The call: from the IVRS to Vaani

1. Is this only for Jio IVRS, or will other phone lines also send commercial calls to Vaani?
   What is the exact IVRS menu wording before "press 9"? Please share the full IVRS menu.
   Answer:
2. When the customer presses 9, what does the IVRS send to Vaani? For example: the caller's
   mobile number, consumer number, distributor, the language chosen in the IVRS, and what the
   customer did just before (tried to book, booking failed and why).
   Answer:
3. How should Vaani greet the customer? Please give the exact greeting, the name it should use
   ("Vaani", female voice, as on the domestic line?), and where it should say it is calling from
   (for example "Bharat Petroleum commercial LPG support").
   Answer:
4. What hours will press 9 be available (24x7 or office hours), and how many calls per day do you
   expect, at the start and later?
   Answer:
5. At the end of the call, should Vaani simply end the call, or send the customer back to the
   IVRS menu?
   Answer:
6. If a domestic customer reaches press 9 by mistake, should Vaani help them anyway, or ask them to
   call the domestic line? Which number?
   Answer:

## 2. Who is calling and how we identify them

7. Who usually calls: the business owner, a manager, the kitchen or plant staff, or the purchase
   team? Should Vaani treat all of them the same?
   Answer:
8. How is a commercial customer identified (consumer number, registered mobile, GST number, other)?
   What does a commercial consumer number look like, and is it different from a domestic one?
   Answer:
9. One business can have many locations and connections. If one mobile number is linked to more
   than one connection, how should Vaani know which one the customer means?
   Answer:
10. If the caller's mobile number is not registered, what should Vaani do: ask for the consumer
    number, or take the complaint anyway? Should Vaani ask for any verification (business name,
    OTP) before sharing account details?
    Answer:
11. People who applied on commerciallpg.in have a Request ID but no consumer number yet. Should
    Vaani help these applicants, and can they register a complaint?
    Answer:

## 3. Customer data and system APIs

12. Are commercial customers in the same system and APIs we already use for domestic customers?
    If not, please share the commercial API documentation and a test account.
    Answer:
13. Which details can we get for a commercial customer? Please tick: business name, contact
    person, address, distributor, pack size(s), cylinders allowed, last order, current order
    status, delivery date, invoice, outstanding amount, security deposit, connection status
    (active, blocked, suspended).
    Answer:
14. Which of these APIs exist for commercial customers: order (booking) status, past orders,
    invoice or payment status, and status of a commerciallpg.in request (by Request ID or mobile)?
    Answer:
15. For each API: how fast does it reply, and what should Vaani do when it is down (register a
    complaint anyway, or ask the customer to call later)?
    Answer:

## 4. Booking (on the IVRS)

16. Booking stays on the IVRS. Should Vaani ever book a cylinder itself, or only help with questions
    about booking? Which other ways can a commercial customer book (SMS, WhatsApp, app, distributor,
    portal, sales officer), and which numbers and links may Vaani share?
    Answer:
17. Why does a commercial booking get rejected (payment pending, connection blocked, quantity
    limit, documents pending, supply restriction, other)? For each reason, what should the
    customer do to fix it?
    Answer:
18. Is there a limit on how many cylinders a commercial customer can book (per day, week or month;
    per connection or per business), or a minimum gap between bookings? Can they book more for an
    event or a busy month, and how?
    Answer:
19. Can a booking be cancelled or changed? How, and by whom?
    Answer:

## 5. Delivery

20. Who delivers (the distributor, or BPCL directly for some customers), and what is the normal
    delivery time after booking?
    Answer:
21. Is there a delivery charge (by distance or floor)? What should Vaani say if the delivery person
    asks for extra money?
    Answer:
22. What should Vaani say when delivery is late, or the cylinder is marked delivered but did not
    arrive? After how many days should it register a complaint?
    Answer:
23. What are the common delivery complaints today (short weight, leaking cylinder, wrong size,
    broken seal, rude staff)? Should the customer check weight and seal at delivery, and what weight
    difference is allowed?
    Answer:

## 6. Complaints

24. Can we use the same complaint API as for domestic customers? Please share the exact list of
    commercial complaint categories (reasons) as it is in your system.
    Answer:
25. After a complaint is registered, who handles it (distributor, Sales Officer, regional office,
    Commercial Manager), how many days does it take, and may Vaani tell the customer a time? Does
    the customer get an SMS with the complaint number?
    Answer:
26. Can Vaani check the status of an old complaint with the same status API as domestic? How many
    digits is a commercial complaint number?
    Answer:
27. If the customer says "my complaint is not solved", what should Vaani do: register again,
    escalate, or give a contact?
    Answer:
28. Are there complaints Vaani should NOT register, and send somewhere else instead? Which, and
    where?
    Answer:

## 7. Payment, invoice, GST and price

29. How do commercial customers pay (cash on delivery, online, advance, bank transfer)? Do some get
    credit (pay later)? How many days, and who decides?
    Answer:
30. Is a GST invoice given for every delivery, and by whom (distributor or BPCL)? What should Vaani
    do if the GST number is wrong or missing, or the customer needs a copy of an old invoice?
    Answer:
31. May Vaani say the price of a commercial cylinder? (The LPG Prices page shows "No prices found"
    today.) If not, where should the customer look? May Vaani say how often the price changes, or
    talk about discounts for large or long-term customers?
    Answer:
32. What should Vaani say if the customer feels overcharged? How are refunds handled (wrong
    payment, double payment, cancelled order)?
    Answer:
33. Is there a security deposit for commercial cylinders? How much for each size, and how is it
    returned when the connection is closed?
    Answer:

## 8. New commercial connection or new supply (commerciallpg.in)

34. Should Vaani explain how to apply for new commercial supply? Is www.commerciallpg.in the only
    way, or can customers also go to the distributor? (Our domestic line today says "go to the
    distributor"; your website says "apply online". Which is correct?) What should Vaani say if the
    website OTP fails?
    Answer:
35. Which documents are needed? The website asks for a supporting document, last invoice copy,
    photo of the business premises, photo of where cylinders are kept, PAN and GST. Is anything
    else needed (trade licence, FSSAI, fire NOC, PESO licence)?
    Answer:
36. The "ED Committee" reviews each request. How long does approval take, and how long after
    approval does the first cylinder come? May Vaani say these times?
    Answer:
37. What are the exact status names a request goes through (for example Submitted, Under review,
    Need more information, Approved, Sent to distributor, Supply started, Rejected)?
    Answer:
38. What should Vaani say when a request is rejected, or when the ED Committee asks for more
    information (how does the customer know, and how do they send it)? Can a customer change or
    cancel a request after submitting?
    Answer:
39. Who can apply? Are some sectors given priority (hospitals, schools, community kitchens)? What
    is the form's "5 kg FTL for migrant labourers" option, and who should Vaani tell about it?
    Answer:
40. The form asks about PNG. Is commercial LPG given only where PNG is not available? What should
    Vaani say if the customer has PNG in their area?
    Answer:
41. Can customers of another company (IOCL, HPCL, private) move to BPCL? Is anything special needed?
    Answer:

## 9. Changes to an existing connection

42. How does a customer: a) add more cylinders, b) add a new location, c) change pack size,
    d) move from normal cylinders to LOT or bulk, e) change business name or owner, f) change
    address, g) change registered mobile or email, h) change distributor, i) close (surrender) the
    connection? For each, who does it and what documents are needed?
    Answer:
43. Is there KYC for commercial customers? Can a connection be blocked or suspended (for KYC or
    anything else), and how does the customer get it unblocked?
    Answer:

## 10. Supply limits and "domestic LPG has priority"

44. Is there any supply limit or cut for commercial customers today? In all states or only some?
    Answer:
45. Every page of the website says "As per MoPNG guidelines, domestic LPG has priority". What
    should Vaani say when a customer complains about short or late supply because of this? Should
    Vaani mention it on its own or only when asked, and are there words it must avoid?
    Answer:

## 11. Products

46. Please confirm the product list: 5, 19, 35, 47.5 kg; 19, 35, 47.5 kg LOT; Hippo; bulk LPG;
    BMCG metal cutting gas 19, 35, 47.5 kg. Is anything missing or no longer offered? Is any size
    not available in some states? Hippo is shown as both 422 kg and 425 kg ("425 Kg Bulk LPG" on
    the form): what is the correct size, and are these two products?
    Answer:
47. In simple words for a customer, what is the difference between a normal (vapour off-take) and
    a LOT (liquid off-take) cylinder, and when should a customer choose LOT?
    Answer:
48. Is the 5 kg commercial cylinder the same as Bharatgas Mini (FTL), and who can buy it? Should
    Vaani talk about Bharat Gas Lite zip (10 kg and 5 kg) on this line at all?
    Answer:
49. What colour is each commercial cylinder? (Our current information: Oxford Blue with a Signal Red
    band.) Is that right for all sizes and for BMCG?
    Answer:
50. Who owns the cylinder, regulator, pigtails and manifold (BPCL, distributor or customer)? Does
    BPCL or the distributor sell or rent equipment (regulators, manifolds, vaporisers, burners), and
    may Vaani talk about it?
    Answer:

## 12. Installation and safety (IS 6044)

51. You asked us to use IS 6044 Part 2 (bulk tanks above 450 litres). Most press-9 callers likely
    use cylinders, which are covered by Part 1. Should Vaani use both parts? Is there a newer
    edition we should use?
    Answer:
52. How deep should Vaani go? a) only general safety advice (cylinders upright, no basement, check
    leaks with soap water, keep fire extinguishers); b) also exact numbers from the code (for
    example up to 40 kg indoors needs 5 square metres, cylinders above 20 kg not above ground floor,
    hose not longer than 2 metres, tank safety distances); c) only tell the customer to contact BPCL.
    The code says PESO rules come first: should Vaani always add "please also follow your PESO
    licence and local fire rules"?
    Answer:
53. Does a customer need a PESO licence, and above how many kg? May Vaani say this?
    Answer:
54. Who installs and checks a commercial installation (BPCL, distributor or private installer)? Can
    the customer ask BPCL for a safety inspection, how often should it happen, and who pays?
    Answer:
55. If a customer describes an unsafe setup (cylinders in a basement, hose through a wall), should
    Vaani give advice, register a complaint, or both?
    Answer:
56. Should Vaani advise on the customer's own burners and appliances (stoves, tandoors, ovens,
    furnaces), or only on the gas supply side?
    Answer:
57. Are there BPCL safety documents, leaflets or training material for commercial customers that we
    should also use? Please share.
    Answer:

## 13. Emergencies (gas leak, fire)

58. For a gas leak or fire at a commercial site, is 1906 the number Vaani should give (as for
    domestic)? Is there a different number for industrial or bulk sites?
    Answer:
59. Our draft leak steps from IS 6044: stop work and put out flames, do not touch electrical
    switches, close the cylinder valves and the main valve, open doors and windows, move people out,
    call 1906 and the fire brigade (101). Is this correct and complete? For bulk tank sites, should
    Vaani only tell them to follow their own site emergency plan?
    Answer:
60. After an emergency, should Vaani always register a complaint, and with which category? Who goes
    to the site, and how fast?
    Answer:

## 14. Industry uses

61. Should Vaani answer questions like "can I use LPG for my bakery oven" from the 24 industry pages
    on the website? May it say the numbers on those pages (temperatures, savings, "95%+ efficiency")
    or only describe the uses? May it point customers to the Fuel Savings Calculator?
    Answer:
62. Who should a customer talk to for: choosing the right cylinder size or number of cylinders,
    bulk LPG or SNG, and switching from diesel, coal or electricity to LPG?
    Answer:

## 15. Contacts and escalation

63. The Contact Us page lists 16 regional Commercial Managers with mobile numbers. Our domestic line
    never gives any phone number. May Vaani give these numbers on this line? If yes, for which
    problems, and only after a complaint is registered?
    Answer:
64. The website says "contact your BPCL nodal officer" for technical support. Who is the nodal
    officer, and how does a customer find theirs?
    Answer:
65. Which of these may Vaani give: the distributor's phone and address, the Sales Officer's name or
    number, a commercial email address, the Bharat Petroleum head office address in Mumbai?
    Answer:
66. Should Vaani ever transfer the call to a person? (Our domestic IVRS line has no transfer; the
    customer gets a complaint number instead.)
    Answer:

## 16. Language

67. Which languages should Vaani speak on this line: all Indian languages, as on the domestic line?
    Is it fine to use English words business callers use, like "invoice", "GST", "manifold",
    "regulator"?
    Answer:

## 17. What Vaani must never do

68. Please list anything Vaani must never say or promise on this line (a price, a delivery date,
    approval of a request, a discount, a supply guarantee), and any competitor or policy topics to
    avoid.
    Answer:
69. What should Vaani say if a caller asks about something outside commercial LPG (domestic LPG,
    petrol pumps, lubricants, PNG)?
    Answer:

## 18. Reports after the call

70. What information do you want from each call (reason for calling, complaint registered or not,
    complaint number, sector, pack size, customer satisfied or not, language)? Where should it go
    (your system, a dashboard, an API, a daily file)?
    Answer:
71. Do you want call recordings and transcripts, and who in BPCL will review them? What counts as a
    "successful" call for you?
    Answer:

## 19. Testing and launch

72. Is this a demo first or straight to live? What is the target date?
    Answer:
73. Can you give us test commercial consumer numbers and test mobile numbers for different cases
    (active, blocked, order pending, delivered, payment due)?
    Answer:
74. Can you share 10 to 20 real (masked) call recordings or call notes from today's commercial
    helpline, and the most common questions and safety questions customers ask?
    Answer:
75. Who is our single contact person in BPCL for this project, and who will test and sign off the
    voice assistant?
    Answer:
