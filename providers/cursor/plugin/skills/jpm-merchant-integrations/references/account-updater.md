# Account Updater

Keeps stored card credentials (PAN, expiry, account status) current so recurring and card-on-file payments don't fail on stale cards.

## Docs

Fetch only the page for the step you're on. If a doc and this file disagree, the doc wins.

| When | Doc | Extract |
| --- | --- | --- |
| Once the mode is chosen | [Overview](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Faccount-updater%2Foverview.md) | Region/card-brand availability, ineligible MCCs, Discover response timing |
| Before writing the POST | [Request card account updates](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Faccount-updater%2Fhow-to%2Frequest-card-account-updates.md) | Request body per intent, `reasonMessage` values and the recommended action for each |
| Before writing the GET or webhook handler | [Retrieve latest card account updates](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Faccount-updater%2Fhow-to%2Fget-latest-card-account-updates.md) | Accepted `account-identifier` values, response shape |
| Wiring card registration | [Notification types](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Fnotifications%2Fnotification-types.md) (Account updater events) | Event and subtype to subscribe to |
| Field or schema questions | [API reference](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fapi%2Fcommerce%2Foptimization-protection%2Faccount-updater%2Faccount-updater-oas.md) | Field names, enums, constraints |
| Handling errors | [Response codes](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fapi%2Fcommerce%2Foptimization-protection%2Faccount-updater%2Faccount-updater-response-codes.md) | HTTP status / `responseCode` handling |
| Only if brand flips or `bypassBrandCheckIndicator` come up | [Brandflip](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Faccount-updater%2Fbrandflip.md) | Brandflip and bypass behaviour |
| CAT smoke test | [Testing](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Faccount-updater%2Ftesting.md) | Scenario cards and expected `reasonMessage` |

## Modes

- **Merchant-managed inquiry** — POST a card, read the result. Real-time for Visa and Mastercard; Discover returns an `expectedRecordUpdateTimestamp` and the result must be fetched later with GET.
- **Card registration** — register cards once; JPM sends `accountUpdateNotification` webhooks (subtype `AccountUpdaterStatus`) when a card changes. Requires `jpm-notifications`.

## Prerequisites

- Auth module + `getAccessToken()` already wired (see `../SKILL.md` Step 1).
- A secure store for cards on file (PCI scope — prefer Tokenization; see `tokenization.md`).
- **Card registration only:** `jpm-notifications` applied, with a reachable webhook endpoint and signature verification working.

## Base URLs

| Env | URL | Env var |
|-----|-----|---------|
| CAT | `https://api-ms-test.payments.jpmorgan.com/api/v1` | `JPM_ACCOUNT_UPDATER_URL` |
| PROD | `https://api-ms.payments.jpmorgan.com/api/v1` | `JPM_ACCOUNT_UPDATER_URL` |

## Endpoints

`POST /account-updates` — intent is set by `cardAccountAction`:

- omitted → one-time inquiry
- `REGISTER` → subscribe the card for ongoing updates
- `UNREGISTER` → stop updates

`GET /account-updates/{account-identifier}` — accepts the `requestId` or `responseId` from a prior POST, or the `transactionId` from an Account Updater webhook.

## Reference flow

### Merchant-managed inquiry

1. Before writing the body, fetch the Request doc and the closest One Time Inquiry `.bru` below.
2. POST each card without `cardAccountAction`; persist `requestId` and `responseId`.
3. If the response carries `expectedRecordUpdateTimestamp` (e.g. Discover), GET the result after that time.
4. Act on `reasonMessage` per the Request doc's recommended-action table. Do not infer outcomes from undocumented values.

### Card registration

1. Subscribe to Account Updater events via `jpm-notifications`.
2. On card-on-file creation, POST with `cardAccountAction: "REGISTER"` (mirror the Register `.bru`); persist `requestId` against the card record. On card removal, POST with `UNREGISTER`.
3. On each `accountUpdateNotification`, call `GET /account-updates/{transactionId}` with the notification's `transactionId` and update the stored card from `newAccountInformation`.

## CAT smoke test

- **Inquiry:** POST cards from the Testing page and confirm each returns its documented `reasonMessage`.
- **Registration:** (1) confirm the webhook is subscribed and reachable, (2) REGISTER a Testing-page card and confirm an `accountUpdateNotification` arrives, (3) GET with its `transactionId` and confirm the full updated card details are returned.

## Sample Requests

Use these sample requests to understand how to interact with the Account Updater API. When generating code use these examples as a reference.

Every scenario folder below holds the same requests, so they are listed once rather than repeated per folder — open a scenario to run them against a card that forces that outcome. `{{…}}` stands for the lookup variable each scenario names for itself. Scenario names are the collection's own labels.

### Requests in each scenario folder

| Request | Method | Endpoint |
| --- | --- | --- |
| One Time Inquiry - Get by request Id | GET | `{{accountupdater_url}}/account-updates/{{…}}` |
| One Time Inquiry - Get by response Id | GET | `{{accountupdater_url}}/account-updates/{{…}}` |
| One Time Inquiry | POST | `{{accountupdater_url}}/account-updates` |
| Register - Get by request Id | GET | `{{accountupdater_url}}/account-updates/{{…}}` |
| Register - Get by response Id | GET | `{{accountupdater_url}}/account-updates/{{…}}` |
| Register | POST | `{{accountupdater_url}}/account-updates` |
| Un Register - Get by request Id | GET | `{{accountupdater_url}}/account-updates/{{…}}` |
| Un Register - Get by response Id | GET | `{{accountupdater_url}}/account-updates/{{…}}` |
| Un Register | POST | `{{accountupdater_url}}/account-updates` |

### [Account Updater](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Health check for the Account Updater service](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Account%20Updater/Health%20check%20for%20the%20Account%20Updater%20service.bru) | GET | `{{accountupdater_url}}/healthcheck/account-updates` |

### [Account Updater / Discover](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover)

| Scenario | Requests |
| --- | --- |
| [CLOSED_ACCOUNT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/CLOSED_ACCOUNT) | 9 |
| [CONTACT_CARDHOLDER](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/CONTACT_CARDHOLDER) | 9 |
| [MATCH_NO_UPDATE](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/MATCH_NO_UPDATE) | 9 |
| [NEW_ACCOUNT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/NEW_ACCOUNT) | 9 |
| [NEW_ACCOUNT_AND_EXPIRY](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/NEW_ACCOUNT_AND_EXPIRY) | 9 |
| [NEW_ACCOUNT_AND_EXPIRY_OVERRIDE](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/NEW_ACCOUNT_AND_EXPIRY_OVERRIDE) | 9 |
| [NEW_EXPIRY](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/NEW_EXPIRY) | 9 |
| [NEW_EXPIRY_OVERRIDE](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Discover/NEW_EXPIRY_OVERRIDE) | 9 |

### [Account Updater / Mastercard](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard)

| Scenario | Requests |
| --- | --- |
| [CONTACT_CARDHOLDER](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/CONTACT_CARDHOLDER) | 9 |
| [MATCH_NO_UPDATE](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/MATCH_NO_UPDATE) | 9 |
| [NEW_ACCOUNT_AND_EXPIRY](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/NEW_ACCOUNT_AND_EXPIRY) | 9 |
| [NEW_ACCOUNT_SAFETECH_TOKEN](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/NEW_ACCOUNT_SAFETECH_TOKEN) | 3 |
| [NEW_EXPIRY](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/NEW_EXPIRY) | 9 |
| [NO_MATCH_NON_PARTICIPATING_BIN](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/NO_MATCH_NON_PARTICIPATING_BIN) | 9 |
| [NO_MATCH_PARTICIPATING_BIN](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Mastercard/NO_MATCH_PARTICIPATING_BIN) | 9 |

### [Account Updater / Visa](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa)

| Scenario | Requests |
| --- | --- |
| [BRAND_FLIP](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/BRAND_FLIP) | 9 |
| [CLOSED_ACCOUNT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/CLOSED_ACCOUNT) | 9 |
| [CONTACT_CARDHOLDER](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/CONTACT_CARDHOLDER) | 9 |
| [MATCH_NO_UPDATE](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/MATCH_NO_UPDATE) | 9 |
| [NEW_ACCOUNT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/NEW_ACCOUNT) | 9 |
| [NEW_ACCOUNT_AND_EXPIRY](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/NEW_ACCOUNT_AND_EXPIRY) | 9 |
| [NEW_EXPIRY](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/NEW_EXPIRY) | 9 |
| [NO_MATCH_NON_PARTICIPATING_BIN](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/NO_MATCH_NON_PARTICIPATING_BIN) | 9 |
| [NO_MATCH_PARTICIPATING_BIN](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/NO_MATCH_PARTICIPATING_BIN) | 9 |
| [PAN_OPT_OUT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/PAN_OPT_OUT) | 9 |
| [STOP_ADVICE_ON_MERCHANT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Account%20Updater/Visa/STOP_ADVICE_ON_MERCHANT) | 9 |

## Common Pitfalls

- **The registration webhook is not the source of updated card data.** Its card details are masked; always follow it with the GET in step 3. (Not yet documented on the portal — remove once published.)
- Registering cards before `jpm-notifications` is wired → updates are never received.
