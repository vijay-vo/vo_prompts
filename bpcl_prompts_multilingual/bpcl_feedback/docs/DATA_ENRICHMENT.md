# BPCL Feedback Data Enrichment

## Purpose

`BPCL Nov Feedback - Sheet1.csv` contains the base consumer list. Some fields required for the feedback journey are not in that file. Before uploading or configuring the journey, obtain those fields from the BPCL APIs below and write them to the named CSV columns.

The exact API request configuration, authentication, and identifiers are maintained in the Console Platform Journey tool. This document records only the response-to-CSV mapping.

## Base File

- Base customer file: `BPCL Nov Feedback - Sheet1.csv`
- Consumer identifier available in the base file: `ConsumerId`
- Phone number available in the base file: `PhoneNumber`
- Distributor identifier available in the base file: `SapDistCd`
- Distributor name available in the base file: `DistName`

Use the identifier(s) required by the configured Console journey/API request. Do not derive API data from distributor name, consumer name, or phone number when the configured API identifies the consumer differently.

## Consumer Details API

- Endpoint: `/Consumer/GetDistDetails`
- Response root: `data`

| BPCL response field | CSV column to populate |
|---|---|
| `data.ReturnCode` | `ConsumerDetailsReturnCode` |
| `data.ReturnMsg` | `ConsumerDetailsReturnMsg` |
| `data.ConsumerAddress` | `ConsumerDetailsConsumerAddress` |
| `data.DistrictName` | `ConsumerDetailsDistrictName` |
| `data.DistrictCode` | `ConsumerDetailsDistrictCode` |
| `data.StateName` | `ConsumerDetailsStateName` |
| `data.StateCode` | `ConsumerDetailsStateCode` |
| `data.NoOfCylinder` | `ConsumerDetailsNoOfCylinder` |

## Refill History API

- Endpoint: `/consumer/showRefillHistory`
- Response root: `data`
- Use the first item in `data.refillSubsidy`, index `0`, for the current feedback journey.

| BPCL response field | CSV column to populate |
|---|---|
| `data.returnCode` | `RHReturnCode` |
| `data.returnMsg` | `RHReturnMsg` |
| `data.refillSubsidy.0.orderDate` | `RHorderDate0` |
| `data.refillSubsidy.0.deliveryDate` | `RHdeliveryDate0` |
| `data.refillSubsidy.0.cashMemoAmount` | `RHcashMemoAmount0` |

## Data Handling Rules

- Copy API values as returned. Do not invent a value when an API field is missing, null, or an API call fails.
- Keep return codes and return messages in the output so API failures can be identified and retried.
- Preserve the API date values exactly in the CSV. The feedback prompt expects `RHdeliveryDate0` in the format supplied by the API: `M/D/YYYY h:mm:ss AM/PM`.
- Preserve `RHcashMemoAmount0` as returned. The prompt uses this as the expected cylinder amount.
- A consumer can have no refill-history item at index `0`. In that case, leave the three `RH...0` value columns empty and retain the API return code/message.
- Do not use refill-status data for this journey. The feedback journey uses refill history because a more recent booking can be undelivered.

## Language Field Recovery

The BPCL source workbook had a broken external `VLOOKUP` in the `Language` column. The recovered CSV is:

- `Customers data 27.10.2026 updated language.csv`

Language values were recovered from BPCL's embedded lookup results. The 100 rows for `BLUE FLAME BHARATGAS` / `SapDistCd` `167219` were supplied by BPCL as `0`; these were set to `Oriya` based on the confirmed Sambalpur LPG Territory / Odisha district assignment.

## Existing Journey Fields Used by the Prompt

| CSV column | Journey use |
|---|---|
| `ConsumerDetailsConsumerAddress` | Identifies the connection only if the consumer asks which connection is being discussed. |
| `RHdeliveryDate0` | Delivery-feedback question. |
| `RHcashMemoAmount0` | Price-feedback question. |
| `Language` | Selects the appropriate multilingual journey language. |
