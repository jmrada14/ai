# Tokenization

The Tokenization API replaces sensitive card data with a token that retains the essential information without compromising security. Use it to provision network tokens or Safetech (acquirer) tokens one card at a time or in bulk, request cryptograms for network-token payments, and manage each token's lifecycle.

For additional information, refer to the [Tokenization API documentation](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Foverview.md)

## When to Use

- Keep cards on file as network tokens (Visa, Mastercard, American Express), which work with any payment provider, for stored-credential, subscription, and recurring payments
- Replace stored card numbers with Safetech tokens — acquirer tokens usable only with J.P. Morgan, available in the US and Canada
- Migrate an existing card vault in bulk, by API upload or, for large files, through Managed File Transfer Services (MFTS)
- Keep stored tokens usable by managing their lifecycle state and acting on issuer updates

Provisioning a token sends the raw card number, so your server handles the PAN. If card numbers must never reach your servers, tokenize through Checkout instead (see `checkout.md`).

## Authentication

Authentication is handled by the merchant's auth module (set up via the `jpm-oauth` skill). Import `getAccessToken` (or your language's equivalent) from that module and use it as `Authorization: Bearer <token>` on every Tokenization API call. Do **not** reimplement OAuth here — the auth module already caches tokens correctly per JPM guidance.

## Base URLs

| Env | URL | Env var |
|-----|-----|---------|
| CAT | `https://api-tokens-cat.payments.jpmorgan.com` | `JPM_TOKENIZATION_URL` |
| PROD | `https://api-tokens.payments.jpmorgan.com` | `JPM_TOKENIZATION_URL` |

Tokenization doesn't share the `api-ms` host root used by Online Payments, 3DS, and Account Updater, and its paths sit directly on the host with no version prefix (`{JPM_TOKENIZATION_URL}/tokens`). If the merchant's RM provides a different Tokenization host, use that.

## Integration Notes

- **Onboarding before code.** Network tokenization needs a token requestor ID (TRID) from the card networks, linked to your merchant ID by your J.P. Morgan implementation specialist. Safetech tokenization and MFTS are enabled through your relationship manager.
- **What to store and send.** Store `tokenReferenceIdentifier` for a network token (the lifecycle, details, and cryptogram calls use it), or `acquirerTokenNumber` and the card expiry for a Safetech token. Online Payments takes the token itself, not `tokenReferenceIdentifier`:
  - Network token — the cryptogram response's `tokenNumber` and `expiry` go in `paymentMethodType.card.accountNumber` and `expiry` with `accountNumberType: NETWORK_TOKEN`; its `electronicCommerceIndicator` and `tokenAuthenticationValue` go in `card.authentication`.
  - Safetech token — `acquirerTokenNumber` goes in `card.accountNumber` with `accountNumberType: SAFETECH_TOKEN`, alongside the stored expiry.
  - Samples: the "Network & Device Tokens" and "00 Runbook / 14 Tokenization" groups in `online-payments.md`.
- **Lifecycle notifications.** Token state changes, card-detail updates, and bulk-file status arrive as `tokenLifecycleNotification` events — wire the receiver with the `jpm-notifications` skill. A `CardDetailsUpdate` event doesn't include the new details; follow it with `GET /tokens/{tokenReferenceIdentifier}/details`.
- **CAT smoke test.** With a card from the Testing page: provision a network token, request a cryptogram, authorize a payment with it through Online Payments, then set it to `DELETE` with the lifecycle `PATCH`. For bulk, upload a one-record `PAN2NWT` file containing your TRID.

## How Tokenization works

``` mermaid
flowchart LR
    subgraph Merchant["🏪 Merchant"]
    end

    subgraph JPM["J.P.Morgan\nCommerce Platform"]
        API["Tokenization API"]
        OLP["Online Payments API"]
        NAPI["Notifications API"]
        API -.-> NAPI
    end

    subgraph NET["💳 Card networks"]
    end

    Merchant -- "1 · Tokenize card" --> API
    Merchant -- "2 · Request cryptogram (network tokens)" --> API
    Merchant -- "3 · Pay with token" --> OLP
    API <-.-> NET
    OLP <-.-> NET
    NAPI -. "Token lifecycle events" .-> Merchant

    style Merchant fill:#fff,stroke:#1a7a8a,color:#000
    style JPM fill:#1a7a8a,stroke:#1a7a8a,color:#fff
    style API fill:#d4f0f0,stroke:#1a7a8a,color:#000
    style OLP fill:#fff,stroke:#1a7a8a,color:#000
    style NAPI fill:#fff,stroke:#1a7a8a,color:#000
    style NET fill:#fff,stroke:#1a7a8a,color:#000
```

[How it works: Tokenization API](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Foverview.md)

## Relevant Documentation

#### Optimization & Protection

- [Getting started](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fgetting-started.md) Developer account, workspace project, and how test and production credentials are issued.
- [Core concepts](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcore-concepts.md) Environments, synchronous acknowledgements, and asynchronous notifications.
- [Support](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fsupport.md) What to include when you contact your integration specialist.

##### Tokenization

- [Tokenization](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Foverview.md) Regional availability by tokenization type and the overall integration steps.
- [Network tokenization](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fnetwork-tokenization.md) TRID prerequisite, required fields by card brand, approval statuses, when a cryptogram is required, and 3-D Secure.
- [Safetech tokenization](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fsafetech-tokenization.md) How acquirer tokens work, paying with one, and the SST2 token formats.
- [Bulk tokenization](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fbulk-tokenization.md) API vs. MFTS delivery, size limits, encryption, file naming, and record layouts for PAN2NWT, PAN2SFT, and SFT2NWT.
- [Token lifecycle management](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Ftoken-lifecycle-management.md) Token states and their processing rules, `tokenLifecycleNotification` sub-types, and the card-details update flow.
- [Testing](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Ftesting.md) Test cards and the trigger values that force each endpoint's outcomes, including bulk files.

###### How To

- [Request a token](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fhow-to%2Frequest-a-token.md) Network and Safetech provisioning, plus token information, details, and asset lookups.
- [Request a cryptogram](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fhow-to%2Frequest-a-cryptogram.md) Required fields by card brand, the single-use rule, and token updates returned in the response.
- [Manage token state change](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fhow-to%2Fmanage-token-state-change.md) Retrieve and update a token's state.
- [Manage bulk tokens](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fhow-to%2Fmanage-bulk-tokens.md) Upload a bulk file by API, check its status, and download the response.
- [Manage bulk keys](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Foptimization-protection%2Fcapabilities%2Ftokenization%2Fhow-to%2Fmanage-bulk-keys.md) MFTS onboarding and the PGP key exchange for bulk files.

###### API reference

- [Tokenization API](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fapi%2Fcommerce%2Foptimization-protection%2Ftokenization%2Ftokenization-oas.md) OpenAPI specification: servers, endpoints, headers, and schemas.
- [Tokenization response codes](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fapi%2Fcommerce%2Foptimization-protection%2Ftokenization%2Fresponse-codes.md) `responseStatus`, `responseCode`, and `responseMessage` values by HTTP status.
- [Tokenization changelog](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fapi%2Fcommerce%2Foptimization-protection%2Ftokenization%2Fchangelog.md) API version history, including URL, path, and header changes.

#### Online Payments

- [Tokenization](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Ftokenization.md) Sending network tokens, cryptograms, and Safetech tokens in Online Payments requests.
- [Tokenization of payment data](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fcheckout%2Ftokenization-of-payment-data.md) Getting tokens from Checkout without handling the card number.

---

## Sample Requests

Use these sample requests to understand how to interact with the Tokenization API. When generating code use these examples as a reference. They are the calls the API accepts, so if a documentation page shows a different path, header, or body shape, follow the collection. The collection has no bulk requests; build those from the *Manage bulk tokens* and *Manage bulk keys* pages.

### [Tokenization](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Tokenization)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Change Token Lifecycle](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Change%20Token%20Lifecycle.bru) | PATCH | `{{token_url}}/tokens/{{tokenReferenceIdentifier}}/lifecycle-states` |
| [Get Token Assets](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Get%20Token%20Assets.bru) | GET | `{{token_url}}/tokens/{{tokenReferenceIdentifier}}/assets/{{assetReferenceIdentifier}}` |
| [Get Token Details](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Get%20Token%20Details.bru) | GET | `{{token_url}}/tokens/{{tokenReferenceIdentifier}}/details` |
| [Get Token Information](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Get%20Token%20Information.bru) | GET | `{{token_url}}/tokens/{{tokenReferenceIdentifier}}` |
| [Health check for the Tokenization service](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Health%20check%20for%20the%20Tokenization%20service.bru) | GET | `{{token_url}}/healthcheck` |
| [Request Cryptogram from Token](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Request%20Cryptogram%20from%20Token.bru) | POST | `{{token_url}}/cryptograms` |
| [Token Lifecycle Information](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Token%20Lifecycle%20Information.bru) | GET | `{{token_url}}/tokens/{{tokenReferenceIdentifier}}/lifecycle-states` |
| [Token Request (Network)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Token%20Request%20%28Network%29.bru) | POST | `{{token_url}}/tokens` |
| [Token Request (Safetech)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Tokenization/Token%20Request%20%28Safetech%29.bru) | POST | `{{token_url}}/acquirerToken` |

## Common Pitfalls

- Storing the returned token *and* the PAN — defeats the purpose. Discard the PAN and CVV immediately after tokenization.
- Mixing CAT tokens with PROD tokens — they're not interchangeable. Tokenize production cards against the PROD host, and don't copy CAT token data into production.
- Uploading to MFTS before the key exchange — encrypt the file with J.P. Morgan's key (`GET /bulk-tokens/encryption-key`) and register yours (`POST /bulk-tokens/encryption-key`) first. The upload itself won't report a failure, so track each file with `GET /bulk-tokens/{merchant-file-identifier}` instead of waiting for the response file.
- Sending `PAN2SFT` files through MFTS — MFTS only produces network tokens (`PAN2NWT`, `SFT2NWT`). Upload `PAN2SFT` files with `POST /bulk-tokens`.
