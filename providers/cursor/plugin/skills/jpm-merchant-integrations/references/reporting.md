# Reporting

The Reporting API is a modular interface used to configure, customize, and retrieve reports across the payment lifecycle.

For additional information, refer to the [Reporting API overview](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Foverview.md)

## When to Use

- Reconcile settlement, deposit, dispute, and fee activity against your own records
- Run JPM's preset reports, or build custom reports with your own fields, filters, and sort order
- Generate reports ad hoc or on a daily schedule, then download them as files

## Authentication

Authentication is handled by the merchant's auth module (set up via the `jpm-oauth` skill). Import `getAccessToken` (or your language's equivalent) from that module and use it as `Authorization: Bearer <token>` on every Reporting API call. Do **not** reimplement OAuth here — the auth module already caches tokens correctly per JPM guidance.

## Base URLs

| Env | URL | Env var |
|-----|-----|---------|
| CAT | `https://api.reports.test.jpmorgan.com` | `JPM_REPORTING_URL` |
| PROD | `https://api.reports.jpmorgan.com` | `JPM_REPORTING_URL` |

Reporting doesn't share the `api-ms` host root used by Online Payments, 3DS, and Account Updater, and its CAT and PROD hosts sit on different domains — never derive one from the other. `JPM_REPORTING_URL` holds the host only, because the paths don't share one prefix: everything is under `/api/v1/…` except reporting groups, which are under `/v1/…`. Keep both as written — normalizing to one prefix will 404. If the merchant's RM provides a different Reporting host, use that.

## How Reporting works

``` mermaid
flowchart LR
    subgraph Merchant["🏪 Merchant"]
    end

    subgraph JPM["J.P.Morgan\nCommerce Platform"]
        API["Reporting API"]
        NAPI["Notifications API"]
        API -.-> NAPI
    end

    Merchant -- "1 · Run report" --> API
    Merchant -. "2 · Poll status" .-> API
    NAPI -. "2 · Status notification" .-> Merchant
    Merchant -- "3 · Download file" --> API

    style Merchant fill:#fff,stroke:#1a7a8a,color:#000
    style JPM fill:#1a7a8a,stroke:#1a7a8a,color:#fff
    style API fill:#d4f0f0,stroke:#1a7a8a,color:#000
    style NAPI fill:#fff,stroke:#1a7a8a,color:#000
```

### Getting the report URL

Generating a report doesn't return a link to it. `POST /api/v1/reports` only starts the run. To get a URL for viewing the report, make a second call to the report details endpoint once the run finishes:

1. `POST /api/v1/reports` to generate the report, then keep the returned `reportId`.
2. Wait until the run completes: poll `GET /api/v1/reports/{reportId}` or wait for a `reportStatusNotification` (see `jpm-notifications`).
3. `GET /api/v1/reports/{reportId}`. The fields under **`reportDetails.url`** in the response hold the URL for viewing the report.

Tell the merchant about this second call when you build or explain a Reporting integration. Code that stops after the `POST` has no way to show the user their report. If the merchant wants the file contents rather than a link, use `GET /api/v1/report-files/{reportId}` instead (see [Retrieve report files](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Fretrieve-reports.md)).

## Relevant Documentation

##### Reporting

- [Report types](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Freport-types.md)
- [Reporting groups](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Freporting-groups.md) Let one report cover a set of entities instead of listing `entityIds` per call.
- [Attribute glossary](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fattribute-catalogue.md) Valid values and definitions for attributes in the 3000 series report types.
- [Pagination](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpagination.md) Retrieve long-running reports without exceeding time-out limits.
- [Notifications](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Fnotifications%2Foverview.md) Integrate with the Notifications API to receive report status updates.
- [Testing](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Ftesting.md) Downloadable sample reports for creating test scenarios.

###### Integration options

- [Quick integration](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fintegration-options%2Fquick-integration.md) Quickly integrate the Reporting API using preset reports.
- [Custom integration](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fintegration-options%2Fcustom-integration.md) Customize your reports to retrieve only the information you require at the schedule of your choosing.

###### Report configurations

- [Advanced customizations](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Freport-configurations%2Fadvanced-customizations.md) Advanced configuration options, including aliases, aggregates, and calculated fields.
- [Scheduled and ad hoc](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Freport-configurations%2Fscheduled-and-adhoc.md) Scheduling options for ad hoc and recurring reports.

###### Preset reports

- [Preset reports](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Foverview.md) Pre-configured reports tailored to provide meaningful information on the payment lifecycle.
- [Authorization report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fauthorization-report.md) Summary of successful and unsuccessful authorizations per merchant order number.
- [Deposit details report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fdeposit-details-report.md) Details of successful deposit transactions with Interchange & Assessment fees.
- [Deposit activity summary report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fdeposit-activity-summary-report.md) Summary of Sales/Refunds, Fees/Adjustments, and Funds Transfer Activity.
- [Financial activity summary report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Ffinancial-activity-summary-report.md) Conveyed/settled transactions, chargebacks, interchange fees, processing fees.
- [Transaction fee details report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Ftransaction-fee-details.md) Sale, refund, fee, and adjustment details per merchant order number.
- [Funded transaction fee details report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Ffunded-transaction-fee-details-report.md) Transactions, associated fees, and net financial activity for a reporting period.
- [Charge summary report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fcharge-summary-report.md) Details of fees charged and associated tax.
- [Dispute details report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fdispute-details-report.md) Chargebacks, ECP Returns, and debit adjustments across the dispute lifecycle.
- [Exception details report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fexception-details-report.md) Successful and unsuccessful transaction details (Declined/Rejected/Cancelled/On-Hold).
- [Interchange qualification report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Finterchange-qualification-report.md) Transactions with Interchange qualification codes and details.
- [Token provisioning & lifecycle report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Ftoken-lifecycle-report.md) Token and cryptogram provisioning across payment methods.
- [Consumer profile overview report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Fconsumer-profile-report.md) Consumer profile status, contact info, and payment methods.
- [Account updater report](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fpreset-reports%2Faccount-updated-report.md) Account updater activity volume, update types, and methods.

###### How To

- [Get report types](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Fget-report-types.md) View available report types and get details for a specific report type.
- [Manage report configurations](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Fmanage-report-configurations.md) Create, update, and get details of report configurations.
- [Run reports](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Frun-reports.md) Run ad-hoc reports and check report run status.
- [Retrieve report details](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Fretrieve-report-details.md) Retrieve report details for all or individual reports.
- [Retrieve report files](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Fretrieve-reports.md) Download reports via JSON payload or Commerce Center portal.
- [Manage reporting groups](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Freporting%2Fhow-to%2Fmanage-reporting-groups.md) Create, retrieve, and update reporting groups.

---

## Sample Requests

Use these sample requests to understand how to interact with the Reporting API and implement the quick and custom integration options. When generating code use these examples as a reference. Open a request to see its full payload.

### [Reporting / Report Types](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Reporting/Report%20Types)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Get a list of available report types](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Report%20Types/Get%20a%20list%20of%20available%20report%20types.bru) | GET | `{{reporting_url}}/report-types` |
| [Get details for a specific report type](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Report%20Types/Get%20details%20for%20a%20specific%20report%20type.bru) | GET | `{{reporting_url}}/report-types/{{reportTypeId}}` |

### [Reporting / Report Configurations](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Reporting/Report%20Configurations)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Get a list of available report configurations](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Report%20Configurations/Get%20a%20list%20of%20available%20report%20configurations.bru) | GET | `{{reporting_url}}/report-configs` |
| [Get details for a specific report configuration](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Report%20Configurations/Get%20details%20for%20a%20specific%20report%20configuration.bru) | GET | `{{reporting_url}}/report-configs/{{reportConfigId}}` |
| [Update an existing report configuration](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Report%20Configurations/Update%20an%20existing%20report%20configuration.bru) | PUT | `{{reporting_url}}/report-configs/{{reportConfigId}}` |

### [Reporting / Reports](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Reporting/Reports)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Generate a report (Authorization Details report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Authorization%20Details%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Charge Summary report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Charge%20Summary%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Deposit Activity Summary report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Deposit%20Activity%20Summary%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Deposit Details report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Deposit%20Details%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Dispute Details report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Dispute%20Details%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Exception Details report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Exception%20Details%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Financial Activity Summary report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Financial%20Activity%20Summary%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Funded Transaction Fee Details report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Funded%20Transaction%20Fee%20Details%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Interchange Qualification report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Interchange%20Qualification%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (Transaction Fee Details report)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28Transaction%20Fee%20Details%20report%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (adhoc)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28adhoc%29.bru) | POST | `{{reporting_url}}/reports` |
| [Generate a report (daily)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Generate%20a%20report%20%28daily%29.bru) | POST | `{{reporting_url}}/reports` |
| [Get a list of available reports](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Get%20a%20list%20of%20available%20reports.bru) | GET | `{{reporting_url}}/reports` |
| [Get details for a specific report](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Reporting/Reports/Get%20details%20for%20a%20specific%20report.bru) | GET | `{{reporting_url}}/reports/{{reportId}}` |
