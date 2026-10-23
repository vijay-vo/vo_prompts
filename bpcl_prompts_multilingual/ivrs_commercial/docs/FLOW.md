# BPCL Voice Agent Workflow

---

# High-Level Call Flow

```text
                                        ┌────────────────────────────┐
                                        │        Inbound Call        │
                                        └─────────────┬──────────────┘
                                                      │
                                                      ▼
                                  ┌─────────────────────────────────────┐
                                  │ Inbound HTTP                        │
                                  │ Fetch consumer data using caller    │
                                  │ number                              │
                                  └─────────────────┬───────────────────┘
                                                    │
                                                    ▼
                                  ┌─────────────────────────────────────┐
                                  │          defaultAgent               │
                                  │ • Greet consumer                    │
                                  │ • Understand intent                 │
                                  └──────────────┬──────────────────────┘
                                                 │
        ┌────────────────────────────────────────┼────────────────────────────────────────┐
        │                                        │                                        │
        ▼                                        ▼                                        ▼
┌─────────────────┐                  ┌─────────────────────┐                  ┌──────────────────────┐
│ Emergency Query │                  │ New Connection      │                  │ All Other Queries    │
└────────┬────────┘                  └─────────┬───────────┘                  └──────────┬───────────┘
         │                                     │                                         │
         ▼                                     ▼                                         ▼
┌─────────────────┐                 ┌──────────────────────┐             ┌────────────────────────────────────────────┐
│ emergencyAgent  │                 │ newConnectionAgent   │             │ Consumer Verification                      │
└────────┬────────┘                 └──────────────────────┘             │                                            │
         │                                                               │ {{RefillStatusReturnCode}} == 801          │
         │                                                               │ AND                                        │
         │                                                               │ {{RefillStatusReturnMsg}} ==               │
         │                                                               │ "Consumer not found" ?                     │
         │                                                               └───────────────┬────────────────────────────┘
         │                                                                               │
         │                                               ┌───────────────────────────────┴─────────────────────────────┐
         │                                               │                                                             │
         ▼                                               ▼                                                             ▼
                                             No (Consumer Found)                                      Yes (Consumer Not Found)
                                                   │                                                             │
                                                   ▼                                                             ▼
                                  ┌──────────────────────────────┐                        ┌─────────────────────────────┐
                                  │       Intent Routing         │                        │    getConsumerDetails       │
                                  └──────────────────────────────┘                        │ Capture Registered Mobile   │
                                                                                          └──────────────┬──────────────┘
                                                                                                         │
                                                                                                         ▼
                                                                                     ┌────────────────────────────────────┐
                                                                                     │      bpcl_fetch_all_api            │
                                                                                     └─────────────────┬──────────────────┘
                                                                                                       │
                                                                                                       ▼
                                                                                             ┌──────────────────┐
                                                                                             │ Result Success ? │
                                                                                             └────────┬─────────┘
                                                                                                      │
                                      ┌───────────────────────────────────────────────────────────────┴───────────────────────┐
                                      │                                                                                       │
                                      ▼                                                                                       ▼
                          Success (Data Found)                                                                       Failed (No Data)
                                      │                                                                                                            │
                                      ▼                                                                                                            ▼
                           ┌────────────────────────┐                                                                      ┌────────────────────────────┐
                           │    Intent Routing      │                                                                      │    Offer callTransfer      │
                           └────────────────────────┘                                                                      └──────────────┬─────────────┘
                                                                                                                          │
                                                                                                                          ▼
                                                                                                      ┌────────────────────────────────────┐
                                                                                                      │ Consumer accepts AND               │
                                                                                                      │ Transfer successful ?             │
                                                                                                      └──────────────┬─────────────────────┘
                                                                                                                     │
                                                           ┌─────────────────────────────────────────────────────────┴────────────────────────────────────────────────┐
                                                           │                                                                                                          │
                                                           ▼                                                                                                          ▼
                                              Yes (Transfer Successful)                                                                     No / Declined / Failed
                                                           │                                                                                                          │
                                                           ▼                                                                                                          ▼
                                           ┌────────────────────────────┐                                                    ┌────────────────────────────────────────────┐
                                           │      Senior Team       │                                                    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
                                                          │                                                                  │ Inform consumer:                                                                                   │
                                                          ▼                                                                  │ Unable to help without consumer details. Please contact nearest Bharat Petroleum distributor.     │
                                                 ┌────────────────┐                                                         └─────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │ callhangup()   │                                                                            │
                                                 └────────────────┘                                                                            ▼
                                                                                                                                    ┌────────────────┐
                                                                                                                                    │ callhangup()   │
                                                                                                                                    └────────────────┘
```

---

# Intent Routing

```
Detected Intent
      │
      ├──────────── Booking
      ├──────────── Delivery
      ├──────────── Payment
      ├──────────── Connection Services
      └──────────── Generic Information & Complaint
```

---

# Booking Flow

```
{{ConsumerDetailsConsumerStatusDesc}} == "Active" ?

        │
 ┌──────┴───────┐
 │              │
No             Yes
 │              │
 ▼              ▼
booking       {{gapToNextKyc}} <= 0 ?
NonEligibility
                  │
           ┌──────┴───────┐
           │              │
          No             Yes
           │              │
           ▼              ▼
      booking        {{gapToNextBooking}} <= 0 ?
 NonEligibility
                          │
                   ┌──────┴───────┐
                   │              │
                  No             Yes
                   │              │
                   ▼              ▼
            booking            booking
         NonEligibility      EligibleAgent
```

---

# Delivery Flow

```
{{RefillStatusReturnMsg}} != "No refill found" ?

        │
 ┌──────┴───────────┐
 │                  │
Yes                No
 │                  │
 ▼                  ▼
{{RefillStatusBookingClearDate}}      Use Refill History
>= Today ?                            {{RHReturnCode}}
                                      {{RHReturnMsg}}

 │
 ┌─────────────┴─────────────┐
 │                           │
Yes                         No
 │                           │
 ▼                           ▼
activeDeliveryAgent     postDeliveryAgent


(Refill History Path)

{{ConsumerDetailsConsumerStatusDesc}} == "Active" ?

        │
 ┌──────┴───────┐
 │              │
No             Yes
 │              │
 ▼              ▼
notEligible    {{gapToNextKyc}} <= 0 ?

                   │
            ┌──────┴───────┐
            │              │
           No             Yes
            │              │
            ▼              ▼
     notEligible      {{gapToNextBooking}} <= 0 ?

                             │
                      ┌──────┴───────┐
                      │              │
                     No             Yes
                      │              │
                      ▼              ▼
               notEligible     eligibleDeliveryAgent
```

---

# Payment Flow

```
{{RefillStatusReturnMsg}} != "No refill found" ?

        │
 ┌──────┴─────────┐
 │                │
Yes              No
 │                │
 ▼                ▼
Use              Use
{{RefillStatusCashMemoAmount}}
                 {{RHcashMemoAmount0}}

        │
        ▼
 paymentAgent
```

---

# Connection Services Flow

```
Detected Intent
      │
      ▼
connectionServicesAgent
```

---

# Generic Information & Complaint Flow

```
Detected Intent
      │
      ▼
genericInfoComplaintAgent
```

---

# Multi-Intent Flow

```
Current Agent
      │
      ▼
Consumer asks another question?
      │
 ┌────┴─────┐
 │          │
No         Yes
 │          │
 ▼          ▼
callhangup()   routingAgent
                    │
                    ▼
             Detect new intent
                    │
                    ▼
        Directly switch to the relevant senior agent
```

---

# Runtime Variables

## Consumer Verification

- `{{RefillStatusReturnCode}}`
- `{{RefillStatusReturnMsg}}`

## Consumer Details

- `{{ConsumerDetailsConsumerStatusDesc}}`
- `{{gapToNextKyc}}`
- `{{gapToNextBooking}}`
- `{{ConsumerDetailsDistributorType}}`

## Refill Status

- `{{RefillStatusBookDate}}`
- `{{RefillStatusBookingClearDate}}`
- `{{RefillStatusCashMemoAmount}}`

## Refill History (Fallback)

- `{{RHReturnCode}}`
- `{{RHReturnMsg}}`
- `{{RHorderDate0}}`
- `{{RHdeliveryDate0}}`
- `{{RHcashMemoAmount0}}`

---

# Data Source Priority

| Feature | Primary Source | Fallback Source |
|----------|---------------|-----------------|
| Booking | Consumer Details | None |
| Delivery | Refill Status | Refill History |
| Payment | Refill Status | Refill History |

---

# Call Completion

```
Conversation Completed
        │
        ▼
callhangup()
```
