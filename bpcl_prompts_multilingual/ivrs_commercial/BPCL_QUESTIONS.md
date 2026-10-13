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
   Answer:
2. What is the exact IVRS menu wording before "press 9"? Can you share the full IVRS menu?
   Answer:
3. When the customer presses 9, what does the IVRS send to Vaani? For example: the caller's
   mobile number, consumer number, distributor, the language chosen, and what the customer did
   just before (tried to book, booking failed, etc.).
   Answer:
4. Does the customer choose a language in the IVRS before pressing 9? If yes, which languages
   are offered?
   Answer:
5. Can a domestic customer reach press 9 by mistake? If they do, what should Vaani do: help them
   anyway, or ask them to call the domestic line? Which number should they call?
   Answer:
6. Should Vaani greet the customer with a fixed line? Please give the wording you want.
   Answer:
7. What should Vaani call itself, and say it is calling from where (for example "Bharat Petroleum
   commercial LPG support")?
   Answer:
8. What hours will press 9 be available? 24x7, or office hours only?
   Answer:
9. How many calls per day do you expect on press 9, at the start and later?
   Answer:
10. At the end of the call, should Vaani simply end the call, or send the customer back to the
    IVRS menu?
    Answer:

## 2. Who is calling and how we identify them

11. Who usually calls: the business owner, a manager, the kitchen or plant staff, or the
    purchase team? Should Vaani treat all of them the same?
    Answer:
12. How is a commercial customer identified: consumer number, registered mobile number, GST
    number, or something else?
    Answer:
13. What does a commercial consumer number look like (how many digits, letters or numbers)?
    Is it different from a domestic consumer number?
    Answer:
14. One business can have many locations and many connections. If one mobile number is linked to
    more than one connection, how should Vaani know which one the customer means?
    Answer:
15. If the caller is calling from a mobile number that is not registered, what should Vaani do?
    Ask for the consumer number? Take the complaint anyway?
    Answer:
16. Customers who apply on commerciallpg.in get a Request ID before they have a consumer number.
    Should Vaani also help these "applicants" (not yet customers)?
    Answer:
17. Should Vaani ask for any verification (for example name of the business, OTP) before sharing
    account details?
    Answer:

## 3. Customer data and system APIs

18. Are commercial customers in the same system and the same APIs we use for domestic customers
    (the consumer details API we already use)?
    Answer:
19. If not, which API gives commercial customer details? Can you share its documentation and a
    test account?
    Answer:
20. Which details can we get for a commercial customer? Please tick:
    business name, contact person, address, distributor, pack size(s), number of cylinders
    allowed, last order, current order status, delivery date, invoice, outstanding amount,
    security deposit, connection status (active, blocked, suspended).
    Answer:
21. Is there an API to check a cylinder order (booking) status for commercial customers?
    Answer:
22. Is there an API to see past orders (refill history) for commercial customers?
    Answer:
23. Is there an API to check the status of a request made on commerciallpg.in (by Request ID or
    by mobile number)?
    Answer:
24. Is there an API for invoices or payment status?
    Answer:
25. For each API: how fast does it reply, and what happens when it is down? Should Vaani
    register a complaint anyway, or ask the customer to call later?
    Answer:

## 4. Booking (on the IVRS)

26. Booking stays on the IVRS. Should Vaani ever book a cylinder itself, or only help with
    questions about booking?
    Answer:
27. Which ways can a commercial customer book today? (IVRS, SMS, WhatsApp, app, distributor,
    portal, sales officer.) Please give the numbers and links Vaani may share.
    Answer:
28. Why does a commercial booking get rejected? Please list all reasons (for example: payment
    pending, connection blocked, quantity limit, KYC or documents pending, supply restriction).
    Answer:
29. For each reason above, what should the customer do to fix it?
    Answer:
30. Is there a limit on how many cylinders a commercial customer can book per day, week or
    month? Is it per connection or per business?
    Answer:
31. Is there a minimum gap between two bookings for commercial customers (like domestic has)?
    Answer:
32. Can a customer book more than their usual quantity (for an event, a festival, a busy month)?
    How?
    Answer:
33. Can a booking be cancelled or changed? How, and by whom?
    Answer:
34. If the customer pressed 9 because the IVRS booking failed, does the IVRS tell Vaani why it
    failed?
    Answer:

## 5. Delivery

35. What is the normal delivery time for a commercial cylinder after booking?
    Answer:
36. Who delivers: the distributor, or BPCL directly for some customers (direct supply, bulk)?
    Answer:
37. Is delivery free, or is there a delivery charge? Does it change by distance or floor?
    Answer:
38. What should Vaani say when delivery is late? After how many days should it register a
    complaint?
    Answer:
39. What should Vaani say if the delivery person asks for extra money?
    Answer:
40. What are the common delivery complaints you get today? (Late, short weight, leaking
    cylinder, wrong size, seal broken, not delivered but marked delivered, rude staff.)
    Answer:
41. Should the customer check weight and seal at delivery? What is the allowed weight difference?
    Answer:
42. If the cylinder is marked delivered but the customer did not get it, what should Vaani do?
    Answer:

## 6. Complaints

43. Can we use the same complaint API we use for domestic customers? If not, which one?
    Answer:
44. What complaint categories (reasons) should Vaani use for commercial customers? Please share
    the exact list as it is in your system.
    Answer:
45. After a complaint is registered, who handles it: the distributor, the Sales Officer, the
    regional office, the Commercial Manager?
    Answer:
46. How many days does it take to resolve a commercial complaint? May Vaani tell the customer
    a time?
    Answer:
47. Will the customer get an SMS with the complaint number?
    Answer:
48. Can Vaani check the status of an old complaint? Is it the same complaint status API as
    domestic? How many digits is a commercial complaint number?
    Answer:
49. If the customer says "my complaint is not solved", what should Vaani do: register again,
    escalate, or give a contact?
    Answer:
50. Can a customer who is not yet a BPCL customer (for example someone who applied on the portal)
    register a complaint?
    Answer:
51. Are there complaints Vaani should NOT register, and instead send somewhere else? Which, and
    where?
    Answer:

## 7. Payment, invoice, GST and price

52. How do commercial customers pay: cash on delivery, online, credit, advance, bank transfer?
    Answer:
53. Do some customers get credit (pay later)? How many days? Who decides?
    Answer:
54. Is a GST invoice given for every delivery? Who gives it, the distributor or BPCL?
    Answer:
55. What should Vaani do if the GST number on the invoice is wrong or missing?
    Answer:
56. How can a customer get a copy of an old invoice?
    Answer:
57. May Vaani say the price of a commercial cylinder? The LPG Prices page on the website shows
    "No prices found" today. If Vaani may not say a price, where should the customer look?
    Answer:
58. How often does the commercial price change (every month on the 1st)? Can Vaani say that?
    Answer:
59. Is there any discount for large customers or long-term contracts? May Vaani talk about it?
    Answer:
60. What should Vaani say if the customer feels they were overcharged?
    Answer:
61. How are refunds handled (wrong payment, double payment, cancelled order)?
    Answer:
62. Is there a security deposit for commercial cylinders? How much for each size? How is it
    returned when the connection is closed?
    Answer:

## 8. New commercial connection or new supply (commerciallpg.in)

63. Should Vaani explain how to apply for new commercial supply? Is the website
    www.commerciallpg.in the only way, or can customers also go to the distributor?
    (Our domestic support line today says "go to the distributor"; your website says
    "apply online". Which one is correct?)
    Answer:
64. Which documents are needed? The website asks for: a supporting document, last invoice copy,
    photo of the business premises, photo of the place where cylinders are kept, PAN and GST.
    Is this the full list? Is anything else needed (trade licence, FSSAI, fire NOC, PESO licence)?
    Answer:
65. The website says the "ED Committee" reviews each request. How long does it take? May Vaani
    say a time?
    Answer:
66. What are the stages a request goes through (for example Submitted, Under review, Need more
    information, Approved, Sent to distributor, Supply started, Rejected)? Please give the exact
    status names.
    Answer:
67. Why are requests rejected? What should Vaani say to a customer whose request was rejected?
    Answer:
68. If the ED Committee asks for more information, how does the customer know and how do they
    send it?
    Answer:
69. Can a customer change or cancel a request after submitting it?
    Answer:
70. The form asks about PNG (is PNG available, have you applied for PNG). Is commercial LPG given
    only where PNG is not available? What should Vaani say if the customer has PNG in their area?
    Answer:
71. Who can apply: any business? Are some sectors given priority (hospitals, schools, community
    kitchens)?
    Answer:
72. The form has a sector "5 kg FTL for migrant labourers". What is it and who should Vaani tell
    about it?
    Answer:
73. Can customers switching from another company (IOCL, HPCL, private) move to BPCL? Is anything
    special needed?
    Answer:
74. How long after approval does the first cylinder come?
    Answer:
75. Does the OTP on the website ever fail? What should Vaani say then?
    Answer:

## 9. Changes to an existing connection

76. How does a customer:
    a) add more cylinders,
    b) add a new location,
    c) change pack size (for example 19 kg to 47.5 kg),
    d) change from normal cylinders to LOT or bulk,
    e) change business name or owner,
    f) change address,
    g) change registered mobile number or email,
    h) change distributor,
    i) close (surrender) the connection?
    For each, please tell us who does it and what documents are needed.
    Answer:
77. Is there KYC for commercial customers? What happens if it is not done?
    Answer:
78. Can a connection be blocked or suspended? Why, and how does the customer get it unblocked?
    Answer:

## 10. Supply limits and "domestic LPG has priority"

79. Every page of the website says "As per MoPNG guidelines, domestic LPG has priority". What
    should Vaani say when a commercial customer complains that they are not getting enough
    cylinders, or supply is late, because of this?
    Answer:
80. Is there any supply limit or cut for commercial customers today? In all states or only some?
    Answer:
81. Should Vaani mention the priority rule on its own, or only when the customer asks?
    Answer:
82. Are there words or topics about supply shortage that Vaani must avoid?
    Answer:

## 11. Products

83. Please confirm the product list for the voice assistant:
    5 kg, 19 kg, 35 kg, 47.5 kg; 19, 35 and 47.5 kg LOT; Hippo; bulk LPG; BMCG metal cutting gas
    19, 35 and 47.5 kg. Is anything missing or not offered any more?
    Answer:
84. The catalogue says Hippo is 425 kg in the heading and 422 kg in the text, and the form shows
    both "422 Kg" and "425 Kg Bulk LPG". What is the correct size, and are they two products?
    Answer:
85. Which pack sizes are sold in which states? Is any size not available somewhere?
    Answer:
86. What is the difference between a normal (vapour off-take) cylinder and a LOT (liquid off-take)
    cylinder, in simple words for a customer? When should a customer choose LOT?
    Answer:
87. What is the 5 kg commercial cylinder? Is it the same as Bharatgas Mini (FTL)? Who can buy it?
    Answer:
88. Can commercial customers also use Bharat Gas Lite zip (10 kg and 5 kg composite)? Should Vaani
    talk about Lite zip on this line at all?
    Answer:
89. What colour is each commercial cylinder? (Our current information: commercial is Oxford Blue
    with a Signal Red band.) Is that still right for all sizes and for BMCG?
    Answer:
90. Who owns the cylinder, regulator, pigtails and manifold: BPCL, the distributor, or the
    customer?
    Answer:
91. Does BPCL or the distributor sell or rent equipment (regulators, manifolds, vaporisers,
    burners)? May Vaani talk about it?
    Answer:
92. Bulk LPG and SNG (synthetic natural gas): who should a customer contact for these?
    Answer:

## 12. Installation and safety (IS 6044)

93. You asked us to train Vaani on IS 6044 Part 2 (bulk tanks above 450 litres). Most press-9
    callers will likely use cylinders (19, 35, 47.5 kg), which are covered by IS 6044 Part 1.
    Should Vaani use both parts? Is there a newer edition we should use?
    Answer:
94. How deep should Vaani go? Choose one:
    a) only general safety advice (keep cylinders upright, no basement, check leaks with soap
       water, keep fire extinguishers, etc.);
    b) also exact numbers from the code (for example: up to 40 kg indoors needs 5 square metres,
       cylinders above 20 kg not above ground floor, hose not longer than 2 metres, safety
       distances for tanks);
    c) only tell the customer to contact BPCL for anything about installation.
    Answer:
95. The code itself says that rules from the Chief Controller of Explosives (PESO) come first.
    Should Vaani always say "please also follow your PESO licence and local fire rules"?
    Answer:
96. Who installs and checks a commercial installation (manifold, piping): BPCL, the distributor,
    or a private installer? Can the customer ask BPCL for a safety inspection? How?
    Answer:
97. How often should a commercial installation be inspected? Who pays for it?
    Answer:
98. Does a customer need a PESO licence? Above how many kg? Can Vaani say this?
    Answer:
99. What are the most common safety questions customers ask today? Please share a few real ones.
    Answer:
100. If a customer describes an unsafe setup (for example cylinders in a basement, hose through a
     wall), what should Vaani do: give advice, register a complaint, or both?
     Answer:
101. Should Vaani give advice about the customer's burners and appliances (stoves, tandoors, ovens,
     furnaces), or only about the gas supply side?
     Answer:
102. Are there BPCL safety documents, leaflets or training material for commercial customers that
     we should also use? Please share.
     Answer:

## 13. Emergencies (gas leak, fire)

103. For a gas leak or fire at a commercial site, is 1906 the number Vaani should give (as for
     domestic)? Is there a different number for industrial or bulk sites?
     Answer:
104. What steps should Vaani tell a commercial customer during a leak? Our draft from IS 6044:
     stop work and put out flames, do not switch electrical switches on or off, close the cylinder
     valves and the main valve, open doors and windows, move people out, call 1906 and the fire
     brigade (101). Is this correct and complete?
     Answer:
105. For bulk tank sites (large factories), should Vaani tell them to follow their own site
     emergency plan and not give step-by-step advice?
     Answer:
106. After an emergency, should Vaani always register a complaint? With which category?
     Answer:
107. Who goes to the site after a leak report, and how fast?
     Answer:

## 14. Industry uses (application questions)

108. The website has 24 industry pages (heat treatment, forging, glass, hotels, poultry, tea,
     forklifts, and more). Should Vaani answer questions like "can I use LPG for my bakery oven"
     from these pages?
     Answer:
109. Some pages have numbers (temperatures, savings, "95%+ efficiency", "1/10th electricity").
     May Vaani say these numbers, or only describe the uses?
     Answer:
110. If a customer asks "which cylinder size is right for me" or "how many cylinders do I need",
     should Vaani help work it out, or send them to the Sales Officer?
     Answer:
111. There is a "Fuel Savings Calculator" on the website. May Vaani point customers to it?
     Answer:
112. If a business wants to switch from diesel, coal or electricity to LPG, who should they talk
     to?
     Answer:

## 15. Contacts and escalation

113. The Contact Us page lists 16 regional Commercial Managers with their mobile numbers. May Vaani
     give these numbers to callers? Our domestic IVRS line never gives any phone number. Should this
     line be different?
     Answer:
114. If yes: for which problems should Vaani give the Commercial Manager's number? Only after a
     complaint is registered?
     Answer:
115. The website says "for technical support contact your BPCL nodal officer". Who is the nodal
     officer, and how does a customer find theirs?
     Answer:
116. May Vaani give the distributor's phone number and address?
     Answer:
117. May Vaani give the Sales Officer's name or number?
     Answer:
118. Should Vaani ever transfer the call to a person? (Our domestic IVRS line has no transfer; the
     customer gets a complaint number instead.)
     Answer:
119. Is there an email address for commercial customers that Vaani may share?
     Answer:
120. Should Vaani give the Bharat Petroleum head office address in Mumbai if asked?
     Answer:

## 16. Language and voice

121. Which languages should Vaani speak on this line? All Indian languages, like the domestic line?
     Answer:
122. Many business callers mix English and their language. Is it fine for Vaani to use English
     words like "invoice", "GST", "manifold", "regulator"?
     Answer:
123. Should Vaani use a female voice and the name "Vaani", the same as the domestic line?
     Answer:

## 17. What Vaani must never do

124. Please list anything Vaani must never say or promise on this line (for example a price, a
     delivery date, approval of a request, a discount, a supply guarantee).
     Answer:
125. Are there competitor or policy topics Vaani must avoid?
     Answer:
126. What should Vaani say if a caller asks something outside commercial LPG (domestic LPG, petrol
     pumps, lubricants, PNG)?
     Answer:

## 18. Reports after the call

127. What information do you want from each call (for example: reason for calling, complaint
     registered or not, complaint number, sector, pack size, customer happy or not, language)?
     Answer:
128. Where should this information go (your system, a dashboard, an API, a daily file)?
     Answer:
129. Do you want call recordings and transcripts? Who in BPCL will review them?
     Answer:
130. What should count as a "successful" call for you?
     Answer:

## 19. Testing and launch

131. Is this a demo first or straight to live? What is the target date?
     Answer:
132. Can you give us test commercial consumer numbers and test mobile numbers, with different
     cases (active, blocked, order pending, delivered, payment due)?
     Answer:
133. Can you share 10 to 20 real (masked) call recordings or call notes from today's commercial
     helpline, so we learn the common questions?
     Answer:
134. Who in BPCL will test and sign off the voice assistant?
     Answer:
135. Who is our single contact person in BPCL for this project?
     Answer:
