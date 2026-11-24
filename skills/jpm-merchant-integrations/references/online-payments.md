# Online Payments

The Online Payments APIs allow you to accept web and mobile payments across a variety of regions and countries. Manage the entire payments lifecycle for multiple methods of payments, including recurring payments, chargebacks, transfers, and third-party services.

For additional information, refer to the [Online Payments API documentation](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fonline-payments.md)

## When to Use

- Build recurring billing and subscription management experiences
- Process payments and manage the payment lifecycle for card, wallet, local, and alternative methods of payment
- Integrate with third-party services for payments, payouts, and more

## Authentication

Authentication is handled by the merchant's auth module (set up via the `jpm-oauth` skill). Import `getAccessToken` (or your language's equivalent) from that module and use it as `Authorization: Bearer <token>` on every Online Payments API call. Do **not** reimplement OAuth here — the auth module already caches tokens correctly per JPM guidance.

## Base URLs

| Env | URL | Env var |
|-----|-----|---------|
| CAT | `https://api-ms-test.payments.jpmorgan.com/api/v2` | `JPM_ONLINE_API_URL` |
| PROD | `https://api-ms.payments.jpmorgan.com/api/v2` | `JPM_ONLINE_API_URL` |

Online Payments shares the host root with 3DS and Account Updater (Optimization & Protection family) and uses the `api/v2` path prefix — the `POST /payments`, `/refunds`, and `/payments/{transactionId}/captures` endpoints in the samples below all resolve against this base. Read it from the env var rather than hardcoding so a future host split doesn't require a code change.

## EU / EMEA Compliance Requirements

When the integration targets EMEA/EU, the following requirements apply. Confirm each is met **before production deployment**.

- **Currency.** Submit transactions in **EUR** for the EU/EEA, or **GBP** for the UK, with the amount as an **integer in the smallest currency unit** (cents for EUR, pence for GBP) — e.g. €49.99 → `4999`, £49.99 → `4999`. Keep the submitted amount consistent with the price shown to the customer. `currency` must be ISO 4217 uppercase (`EUR` / `GBP`).
- **PSD2 / SCA (3-D Secure).** Strong Customer Authentication is a regulatory requirement in the EU/EEA and UK. Unlike Checkout, Online Payments is a direct API integration, so **SCA is your responsibility** — you must satisfy it via 3-D Secure. Use either **orchestrated 3DS** (JPM runs the authentication flow; requires `browserInfo` and `paymentAuthenticationRequest`) or **passthrough 3DS** (you pass externally obtained `authentication.threeDS` results). See the "Auth-Capture with Orchestrated 3DS" and "Auth-Capture with Passthrough 3DS" samples below. Pass complete billing address details (`accountHolder.billingAddress`) to support address verification (AVS) and 3DS.
- **Country code.** The billing address `countryCode` must be a valid **ISO 3166-1 alpha-3 code** (e.g. `FRA`, `DEU`, `NLD`, `GBR` — as in the `"USA"` samples throughout this file — not `France`, and not free text). Any free-text country input in your UI must be **replaced with a structured selector that returns the alpha-3 code** before production deployment.

## How Online Payments works

``` mermaid
flowchart LR
    subgraph Merchant["🏪 Merchant"]
    end

    subgraph JPM["J.P.Morgan\nCommerce Platform\necommerce/Card not present"]
        API["Online Payments API"]
        NAPI["Notifications API"]
        API -.-> NAPI
    end

    subgraph GCPN["💳 Global card payment\nnetworks"]
    end

    subgraph LPN["💳 Local payment\nnetworks"]
    end

    subgraph FI["🏛️ Financial institutions"]
    end

    Merchant <-.-> API
    NAPI -.-> Merchant
    API <-.-> GCPN
    API -.-> LPN
    API -.-> FI

    style Merchant fill:#fff,stroke:#1a7a8a,color:#000
    style JPM fill:#1a7a8a,stroke:#1a7a8a,color:#fff
    style API fill:#d4f0f0,stroke:#1a7a8a,color:#000
    style NAPI fill:#fff,stroke:#1a7a8a,color:#000
    style GCPN fill:#fff,stroke:#1a7a8a,color:#000
    style LPN fill:#fff,stroke:#1a7a8a,color:#000
    style FI fill:#fff,stroke:#1a7a8a,color:#000
```

[How it works: Online Payments API](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Foverview.md)

## Relevant Documentation

#### Online Payments

- [Support](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fsupport.md)
- [Testing](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Ftesting.md) Test your payment integration with pre-determined outcomes using test card data for Online Payments. Simulate various scenarios for 3-D Secure, network tokens, and alternative payment methods.
- [Core concepts](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcore-concepts.md) Review the core concepts for Online Payments and Checkout APIs on J.P. Morgan's Payments Developer Portal, covering payment lifecycle, security, integration, and environment reliability.
- [Getting started](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fgetting-started.md) Get started with J.P. Morgan's Online Payments APIs: create a developer account, set up a workspace, apply for a live account, and integrate with our payment processing services.
- [Online Payments](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fonline-payments.md)

##### Online Payments

- [Online Payments](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Foverview.md)  Learn how the Online Payments API works and the benefits of integration to seamlessly accept, process, and settle online payments on the Payments Developer Portal.

###### Payment methods

- [WeChat Pay](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fwechat-pay.md) Accept mobile payments with WeChat Pay via J.P. Morgan's Online Payments API. Supports EUR and USD. Integrate now for seamless transactions through the WeChat Pay digital wallet.
- [Trustly](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Ftrustly.md) Boost revenue with Trustly's real-time bank transfers, reducing fees without leaving your site. Available in Europe through J.P. Morgan's Online Payments API.
- [SEPA](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fsepa.md) Process payments securely in EUR across multiple countries by enabling SEPA direct debits for European consumers with the J.P. Morgan Online Payments API on the Payments Developer Portal.
- [Paze](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fpaze.md) Offer seamless payments and a smooth checkout experience with Paze, a digital wallet supported by J.P. Morgan's Online Payments API.
- [PayPal](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fpaypal.md) Enable quick and convenient online payments with PayPal, offered through J.P. Morgan's Online Payments API in the Payments Developer Portal.
- [iDEAL](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fideal.md) iDEAL enables secure bank transfers for Dutch consumers via their own banks. Integrate iDEAL with J.P. Morgan's Online Payments API for seamless payments in EUR.
- [Google Pay](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fgoogle-pay.md) Enable seamless transactions with digital wallet Google Pay through J.P. Morgan's Online Payments API on the Payments Developer Portal.
- [Apple Pay](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fapple-pay.md) Learn more about how to enable secure payments with Apple Pay on iOS devices with the J.P. Morgan Online Payments API on Payments Developer Portal.
- [Alipay](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Falipay.md) Integrate Alipay to offer Chinese consumers seamless eWallet payments with the J.P. Morgan Online Payments API on the Payments Developer Portal.
- [ACH](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fach.md) Provide cost-effective direct debits from US bank accounts through ACH/eCheck payments with J.P. Morgan's Online Payments API. Ideal for payroll, bills, and subscriptions.
- [Cards](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fcards.md) Explore card transaction support by region, authentication options, and advanced features like sub-merchant data and level 3 details with J.P. Morgan's Online Payments API.
- [Payment methods](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fpayment-methods-overview.md) Explore the payment methods supported by J.P. Morgan's Online Payments API, including cards, wallets, and alternative payments. Check availability by region and currency.

###### Payment enhancements

- [Tokenization](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Ftokenization.md) Discover how you can enhance security with J.P. Morgan's tokenization solutions through the Online Payments API. Replace sensitive card data with tokens for recurring and card-on-file transactions.
- [Stored payments](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Fstored-payments.md) Learn how to store cardholder-initiated payments for seamless transactions with the J.P. Morgan Online Payments API. Store credentials securely and let consumers use cards on file for quick purchases.
- [Recurring payments](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Frecurring-payments.md) Discover how to set up recurring payments for seamless transactions, securely store payment information, and automate regular payments with the J.P. Morgan Online Payments API.
- [Real-Time Account Updater](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Faccount-updater.md) Discover how to enhance payment processing with Real-Time Account Updater (RTAU) for Visa cards with the J.P. Morgan Online Payments API on the Payments Developer Portal.
- [Fraud prevention](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Ffraud-tools.md) Discover how to prevent fraud by analyzing transactions for risk evaluation with the J.P. Morgan Online Payments API on the Payments Developer Portal. Review fraud check responses and status codes.
- [Encryption](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Fencryption.md) Learn how to enhance security with page encryption, reducing PCI scope by encrypting card data in real-time transactions with the J.P. Morgan Online Payments API on the Payments Developer Portal.
- [Direct Pay](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Fdirect-pay.md) Learn how Direct Pay enables real-time P2P and B2C payments for Visa and Mastercard with the J.P. Morgan Online Payments API on Payments Developer Portal.
- [Consumer profile management](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Fconsumer-profile-management.md) Learn how to manage consumer profiles with the J.P. Morgan Online Payments API. Create, store, and update profiles securely for seamless transactions and recurring payments.
- [3-D Secure](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2F3d-secure.md) Learn how you can enhance security with 3-D Secure (3DS) for cardholder authentication with the J.P. Morgan Online Payments API. Reduce fraud, shift cost liability, and meet EU/UK SCA requirements.
- [Payment enhancements](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-enhancements%2Fpayment-enhancement-overview.md) Enhance your payment solutions with the J.P. Morgan Online Payments API. Integrate features like fraud prevention, encryption, tokenization and more, available across various regions.

###### How To

- [Obtain a fraud score](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fhow-to%2Fget-a-fraud-score.md) Utilize Safetech fraud scoring to assess transaction risk with J.P. Morgan's Online Payments API. Generate fraud scores, analyze risk, and enhance fraud prevention strategies.
- [Update a payment](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fhow-to%2Fupdate-a-payment.md) Learn how to make updates to existing payments, such as voiding a payment or partially reversing a payment, through the Online Payments API in the J.P Morgan Payments Developer Portal.
- [Refund a payment](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fhow-to%2Frefund-a-payment.md) Learn how to issue payment refunds with the Online Payments API on J.P. Morgan's Payments Developer Portal, including full, partial, standalone, and multi-capture refunds.
- [Authorize and capture a payment](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fhow-to%2Fauthorize-and-capture-a-payment.md) Learn how to authorize and capture payments with J.P. Morgan's Online Payments API on the Payments Developer Portal, including immediate, delayed, and manual captures.
- [Verify a payment method](https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fhow-to%2Fverify-a-payment.md) Learn how to verify a payment method without holding funds from the consumer's account through the Online Payments API on the J.P.Morgan Payments Developer Portal.

---

## Digital Wallets (Apple Pay, Google Pay, Paze)

A wallet has two halves:

- **Server half** — send the wallet's encrypted payload to `POST /payments` like any other payment method (see the samples below).
- **Browser half** — if the merchant has a web or app UI, integrate the browser side too: availability detection, the wallet button, the payment sheet, and capturing the encrypted payload to POST to your backend. Get the SDK, button, and CSS from the provider's own developer docs (never from this skill or a third-party tutorial, since providers version their branding and revoke non-compliant buttons).

The JPM PDP payment-method page for each wallet is the source of truth and links out to the provider's docs. Read it, and the provider docs it links to, for everything you need — the `paymentMethodType` shape, config fields, SDK, button CSS, availability detection, session events, testing, and go-live steps:

- **Apple Pay** — <https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fapple-pay.md>
- **Google Pay** — <https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fgoogle-pay.md>
- **Paze** — <https://developer.payments.jpmorgan.com/api/llm-content?path=en%2Fdocs%2Fcommerce%2Fonline-payments%2Fcapabilities%2Fonline-payments%2Fpayment-methods%2Fpaze.md>

**Send the encrypted payload; don't decrypt it.** Use the "Bundle" samples (e.g. `01 Paze - Auth-Capture (Bundle)`, `16 Auth-Capture (Apple Pay Bundle)`, `01 Google Pay - Auth-Capture (Bundle)`), which send the wallet's encrypted payload for JPM to decrypt. `02 Paze - Auth-Capture (CDPT)` is different: it sends an already-decrypted device token and cryptogram (`card.accountNumberType: DEVICE_TOKEN`, `walletProvider: PAZE`, `authentication.tokenAuthenticationValue`). Getting those values means decrypting the Paze payload first, through JPM's Wallet Decryptions API (not covered by this skill — see SKILL.md Step 2) or the merchant's own decryption. Only use the CDPT shape if the merchant says they already receive decrypted Paze tokens from elsewhere. Never build wallet decryption as part of this integration.

If the PDP page doesn't link out or the linked docs are unreachable, go straight to the provider's official developer site rather than prompting the user.

**Environment variables — required.** For every config value a wallet needs (merchant identifiers, gateway parameters, certificate paths, client IDs, gateway merchant IDs), reference it in code by an env variable name (e.g. `JPM_APPLEPAY_MERCHANT_ID`) and **append that variable name with an empty placeholder value to the project's `.env.example`** — do this for each value as you wire it in. Never guess a real value, never block waiting for one, and never overwrite a value the user already set; the user fills them in after the integration is built.

---

## Sample Requests

Use these sample requests to understand how to interact with the online payments API and implement various payment scenarios. When generating code use these examples as a reference.

### [Online Payments / 00 Runbook / 01 US PINless Debit](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/01%20US%20PINless%20Debit)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Pinless Debit - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/01%20US%20PINless%20Debit/01%20Pinless%20Debit%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [02 Pinless Debit - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/01%20US%20PINless%20Debit/02%20Pinless%20Debit%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |

### [Online Payments / 00 Runbook / 02 US Health Benefit Cards](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/02%20US%20Health%20Benefit%20Cards)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 HSA - Auth-Capture (IIAS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/02%20US%20Health%20Benefit%20Cards/01%20HSA%20-%20Auth-Capture%20%28IIAS%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 03 Descriptors & Sub-Merchant Data](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/03%20Descriptors%20%26%20Sub-Merchant%20Data)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Soft & Sub Merchant - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/03%20Descriptors%20%26%20Sub-Merchant%20Data/01%20Soft%20%26%20Sub%20Merchant%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [02 Soft & Sub Merchant - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/03%20Descriptors%20%26%20Sub-Merchant%20Data/02%20Soft%20%26%20Sub%20Merchant%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |

### [Online Payments / 00 Runbook / 04 ACH](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/04%20ACH)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 ACH-ECP - Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/04%20ACH/01%20ACH-ECP%20-%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 05 Google Pay](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/05%20Google%20Pay)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Google Pay - Auth-Capture (Bundle)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/05%20Google%20Pay/01%20Google%20Pay%20-%20Auth-Capture%20%28Bundle%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 06 Alternate MOPs / 06 Klarna](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Klarna - Auth (LPM)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/01%20Klarna%20-%20Auth%20%28LPM%29.bru) | POST | `{{online_url}}/payments` |
| [02 Klarna - Get Transaction (Auth)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/02%20Klarna%20-%20Get%20Transaction%20%28Auth%29.bru) | GET | `{{online_url}}/payments/{{authTransactionId}}` |
| [03 Klarna - Auth-Capture (LPM)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/03%20Klarna%20-%20Auth-Capture%20%28LPM%29.bru) | POST | `{{online_url}}/payments` |
| [04 Klarna - Get Transaction (Auth-Capture)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/04%20Klarna%20-%20Get%20Transaction%20%28Auth-Capture%29.bru) | GET | `{{online_url}}/payments/{{authTransactionId}}` |
| [05 Auth-Capture (Delayed)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/05%20Auth-Capture%20%28Delayed%29.bru) | POST | `{{online_url}}/payments` |
| [06 Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/06%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [07 Capture (Multi)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/07%20Capture%20%28Multi%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [08 Capture (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/08%20Capture%20%28Partial%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [09 Get transaction by request id](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/09%20Get%20transaction%20by%20request%20id.bru) | GET | `{{online_url}}/payments?requestIdentifier={{authLPMRequestId}}` |
| [10 Multi-Capture 1 of 3](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/10%20Multi-Capture%201%20of%203.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [11 Multi-Capture 2 of 3](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/11%20Multi-Capture%202%20of%203.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [12 Multi-Capture 3 of 3 (Final)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/12%20Multi-Capture%203%20of%203%20%28Final%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [13 Refund - Full](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/13%20Refund%20-%20Full.bru) | POST | `{{online_url}}/refunds` |
| [14 Refund - Partial](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/14%20Refund%20-%20Partial.bru) | POST | `{{online_url}}/refunds` |
| [15 Void (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/15%20Void%20%28Full%29.bru) | PATCH | `{{online_url}}/payments/{{LPMtransactionId}}` |
| [16 Void (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/06%20Klarna/16%20Void%20%28Partial%29.bru) | PATCH | `{{online_url}}/payments/{{LPMtransactionId}}` |

### [Online Payments / 00 Runbook / 06 Alternate MOPs / 07 PayPal](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/07%20PayPal)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 PayPal - Auth (LPM)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/07%20PayPal/01%20PayPal%20-%20Auth%20%28LPM%29.bru) | POST | `{{online_url}}/payments` |
| [02 PayPal - Get Transaction (Auth)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/07%20PayPal/02%20PayPal%20-%20Get%20Transaction%20%28Auth%29.bru) | GET | `{{online_url}}/payments/{{authTransactionId}}` |

### [Online Payments / 00 Runbook / 06 Alternate MOPs / 08 Affirm](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/01%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [02 Auth-Capture (Delayed)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/02%20Auth-Capture%20%28Delayed%29.bru) | POST | `{{online_url}}/payments` |
| [03 Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/03%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |
| [04 Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/04%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [05 Capture (Multi)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/05%20Capture%20%28Multi%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [06 Capture (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/06%20Capture%20%28Partial%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [07 Get transaction by request id](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/07%20Get%20transaction%20by%20request%20id.bru) | GET | `{{online_url}}/payments?requestIdentifier={{authLPMRequestId}}` |
| [08 Get transaction by transaction Id](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/08%20Get%20transaction%20by%20transaction%20Id.bru) | GET | `{{online_url}}/payments/{{LPMtransactionId}}` |
| [09 Multi-Capture 1 of 3](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/09%20Multi-Capture%201%20of%203.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [10 Multi-Capture 2 of 3](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/10%20Multi-Capture%202%20of%203.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [11 Multi-Capture 3 of 3 (Final)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/11%20Multi-Capture%203%20of%203%20%28Final%29.bru) | POST | `{{online_url}}/payments/{{LPMtransactionId}}/captures` |
| [12 Refund - Full](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/12%20Refund%20-%20Full.bru) | POST | `{{online_url}}/refunds` |
| [13 Refund - Partial](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/13%20Refund%20-%20Partial.bru) | POST | `{{online_url}}/refunds` |
| [14 Void (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/14%20Void%20%28Full%29.bru) | PATCH | `{{online_url}}/payments/{{LPMtransactionId}}` |
| [15 Void (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/06%20Alternate%20MOPs/08%20Affirm/15%20Void%20%28Partial%29.bru) | PATCH | `{{online_url}}/payments/{{LPMtransactionId}}` |

### [Online Payments / 00 Runbook / 08 Paze](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/08%20Paze)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Paze - Auth-Capture (Bundle)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/08%20Paze/01%20Paze%20-%20Auth-Capture%20%28Bundle%29.bru) | POST | `{{online_url}}/payments` |
| [02 Paze - Auth-Capture (CDPT)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/08%20Paze/02%20Paze%20-%20Auth-Capture%20%28CDPT%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 09 SEPA](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/09%20SEPA)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 SEPA - Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/09%20SEPA/01%20SEPA%20-%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 10 3-D Secure](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/10%203-D%20Secure)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 3DS - Auth-Capture (Passthrough)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/10%203-D%20Secure/01%203DS%20-%20Auth-Capture%20%28Passthrough%29.bru) | POST | `{{online_url}}/payments` |
| [02 3DS - Auth-Capture (Orchestrated)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/10%203-D%20Secure/02%203DS%20-%20Auth-Capture%20%28Orchestrated%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 11 Consumer Profile Management](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/11%20Consumer%20Profile%20Management)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Card - Auth (Create Profile)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/11%20Consumer%20Profile%20Management/01%20Card%20-%20Auth%20%28Create%20Profile%29.bru) | POST | `{{online_url}}/payments` |
| [02 Card - Auth (Use Profile)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/11%20Consumer%20Profile%20Management/02%20Card%20-%20Auth%20%28Use%20Profile%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 12 Encryption](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/12%20Encryption)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 PIE - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/12%20Encryption/01%20PIE%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [02 PIE - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/12%20Encryption/02%20PIE%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |

### [Online Payments / 00 Runbook / 13 AUD Card](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/13%20AUD%20Card)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 AUD - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/13%20AUD%20Card/01%20AUD%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [02 AUD - Void (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/13%20AUD%20Card/02%20AUD%20-%20Void%20%28Full%29.bru) | PATCH | `{{online_url}}/payments/{{authTransactionId}}` |

### [Online Payments / 00 Runbook / 14 Tokenization](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/14%20Tokenization)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Card - Auth (Safetech Token)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/14%20Tokenization/01%20Card%20-%20Auth%20%28Safetech%20Token%29.bru) | POST | `{{online_url}}/payments` |
| [02 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/14%20Tokenization/02%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [03 ACH-ECP - Auth-Capture (Safetech Token)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/14%20Tokenization/03%20ACH-ECP%20-%20Auth-Capture%20%28Safetech%20Token%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 15 Authorize and Capture a Payment](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Card - Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/01%20Card%20-%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |
| [02 Card - Auth-Capture (Delayed)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/02%20Card%20-%20Auth-Capture%20%28Delayed%29.bru) | POST | `{{online_url}}/payments` |
| [03 Card - Auth (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/03%20Card%20-%20Auth%20%28Partial%29.bru) | POST | `{{online_url}}/payments` |
| [04 Card - Capture (Multi 1 of 2)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/04%20Card%20-%20Capture%20%28Multi%201%20of%202%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [05 Card - Capture (Multi 2 of 2)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/05%20Card%20-%20Capture%20%28Multi%202%20of%202%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [06 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/06%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [07 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/07%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [08 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/08%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [09 Card - Capture (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/09%20Card%20-%20Capture%20%28Partial%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [10 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/10%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [11 Card - Reauth](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/11%20Card%20-%20Reauth.bru) | PATCH | `{{online_url}}/payments/{{authTransactionId}}` |
| [12 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/12%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [13 Card - Auth-Capture (Partial Auth Support)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/13%20Card%20-%20Auth-Capture%20%28Partial%20Auth%20Support%29.bru) | POST | `{{online_url}}/payments` |
| [14 Auth (Pinless Debit IM)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/14%20Auth%20%28Pinless%20Debit%20IM%29.bru) | POST | `{{online_url}}/payments` |
| [15 Auth-Capture (ACH-ECP)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/15%20Auth-Capture%20%28ACH-ECP%29.bru) | POST | `{{online_url}}/payments` |
| [16 Auth-Capture (Apple Pay Bundle)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/15%20Authorize%20and%20Capture%20a%20Payment/16%20Auth-Capture%20%28Apple%20Pay%20Bundle%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / 00 Runbook / 16 Refund a Payment](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Card - Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/01%20Card%20-%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |
| [02 Card - Refund via Transaction ID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/02%20Card%20-%20Refund%20via%20Transaction%20ID.bru) | POST | `{{online_url}}/refunds` |
| [03 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/03%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [04 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/04%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [05 Card - Refund via Transaction ID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/05%20Card%20-%20Refund%20via%20Transaction%20ID.bru) | POST | `{{online_url}}/refunds` |
| [06 Card - Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/06%20Card%20-%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |
| [07 Card - Refund via Card Number](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/07%20Card%20-%20Refund%20via%20Card%20Number.bru) | POST | `{{online_url}}/refunds` |
| [08 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/08%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [09 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/09%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{transactionId}}/captures` |
| [10 Refund-Auth-Capture](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/16%20Refund%20a%20Payment/10%20Refund-Auth-Capture.bru) | POST | `{{online_url}}/refunds/{{transactionId}}/captures` |

### [Online Payments / 00 Runbook / 17 Update a Payment](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/01%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [02 Card - Incremental Auth](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/02%20Card%20-%20Incremental%20Auth.bru) | PATCH | `{{online_url}}/payments/{{authTransactionId}}` |
| [03 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/03%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [04 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/04%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [05 Card - Void (Partial)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/05%20Card%20-%20Void%20%28Partial%29.bru) | PATCH | `{{online_url}}/payments/{{authTransactionId}}` |
| [06 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/06%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [07 Card - Void (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/17%20Update%20a%20Payment/07%20Card%20-%20Void%20%28Full%29.bru) | PATCH | `{{online_url}}/payments/{{authTransactionId}}` |

### [Online Payments / 00 Runbook / 18 Obtain a Fraud Score](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 Card - Safetech Fraud Check](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/01%20Card%20-%20Safetech%20Fraud%20Check.bru) | POST | `{{online_url}}/fraudcheck` |
| [02 Card - Auth (Manual)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/02%20Card%20-%20Auth%20%28Manual%29.bru) | POST | `{{online_url}}/payments` |
| [03 Card - Capture (Full)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/03%20Card%20-%20Capture%20%28Full%29.bru) | POST | `{{online_url}}/payments/{{authTransactionId}}/captures` |
| [04 Card - Safetech Fraud Check](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/04%20Card%20-%20Safetech%20Fraud%20Check.bru) | POST | `{{online_url}}/fraudcheck` |
| [05 Card - Auth-Capture (Now)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/05%20Card%20-%20Auth-Capture%20%28Now%29.bru) | POST | `{{online_url}}/payments` |
| [06 Auth (Manual) (Fraud Check Negative)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/06%20Auth%20%28Manual%29%20%28Fraud%20Check%20Negative%29.bru) | POST | `{{online_url}}/payments` |
| [07 Auth (Manual) (Fraud Check)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/00%20Runbook/18%20Obtain%20a%20Fraud%20Score/07%20Auth%20%28Manual%29%20%28Fraud%20Check%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / Level 2 and Level 3](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Auth-Capture (Level2 AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level2%20AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level2 DI & DC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level2%20DI%20%26%20DC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level2 MC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level2%20MC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level2 VI)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level2%20VI%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level3 AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level3%20AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level3 DI & DC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level3%20DI%20%26%20DC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level3 MC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level3%20MC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (Level3 VI)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Auth-Capture%20%28Level3%20VI%29.bru) | POST | `{{online_url}}/payments` |
| [Capture (with L3)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Level%202%20and%20Level%203/Capture%20%28with%20L3%29.bru) | POST | `{{online_url}}/payments/{{transactionId}}/captures` |

### [Online Payments / RTAU](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/RTAU)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Auth-Capture (RTAU CONTACT_CARDHOLDER)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20%28RTAU%20CONTACT_CARDHOLDER%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (RTAU Closed Account)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20%28RTAU%20Closed%20Account%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (RTAU Match No Update)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20%28RTAU%20Match%20No%20Update%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (RTAU NEW_ACCOUNT_AND_EXPIRY)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20%28RTAU%20NEW_ACCOUNT_AND_EXPIRY%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (RTAU New Account)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20%28RTAU%20New%20Account%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (RTAU New Expiry)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20%28RTAU%20New%20Expiry%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Using ST (RTAU New Account)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/RTAU/Auth-Capture%20Using%20ST%20%28RTAU%20New%20Account%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CB MOP](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Auth (CB MOP)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth%20%28CB%20MOP%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP 3DS) (CREC + 3DS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%203DS%29%20%28CREC%20%2B%203DS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP 3DS) (CREV + 3DS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%203DS%29%20%28CREV%20%2B%203DS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP 3DS) (MREC + 3DS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%203DS%29%20%28MREC%20%2B%203DS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP 3DS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%203DS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP CIT)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%20CIT%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP MIT) (MREV + 3DS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%20MIT%29%20%28MREV%20%2B%203DS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP MIT)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%20MIT%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP MOTO)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%20MOTO%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP) Negative Trigger](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%29%20Negative%20Trigger.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture (CB MOP)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Auth-Capture%20%28CB%20MOP%29.bru) | POST | `{{online_url}}/payments` |
| [Refund (CB MOP)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Refund%20%28CB%20MOP%29.bru) | POST | `{{online_url}}/refunds` |
| [Standalone Refund (CB MOP)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Standalone%20Refund%20%28CB%20MOP%29.bru) | POST | `{{online_url}}/refunds` |
| [Verifications (CB MOP 3DS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Verifications%20%28CB%20MOP%203DS%29.bru) | POST | `{{online_url}}/verifications` |
| [Void (CB MOP)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CB%20MOP/Void%20%28CB%20MOP%29.bru) | PATCH | `{{online_url}}/payments/{{transactionId}}` |

### [Online Payments / Network & Device Tokens](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Auth-Capture Device Token CIT (AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Device%20Token%20CIT%20%28AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Device Token MIT (AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Device%20Token%20MIT%20%28AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Device Token MIT RC (AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Device%20Token%20MIT%20RC%20%28AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token CIT (AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20CIT%20%28AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token CIT (MC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20CIT%20%28MC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token CIT (VI)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20CIT%20%28VI%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token MIT (AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20MIT%20%28AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token MIT (MC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20MIT%20%28MC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token MIT (VI)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20MIT%20%28VI%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token MIT RC (AX)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20MIT%20RC%20%28AX%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token MIT RC (MC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20MIT%20RC%20%28MC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture Network Token MIT RC (VI)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/Network%20%26%20Device%20Tokens/Auth-Capture%20Network%20Token%20MIT%20RC%20%28VI%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / LPMs](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/LPMs)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Auth LPM (AliPay)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/LPMs/Auth%20LPM%20%28AliPay%29.bru) | POST | `{{online_url}}/payments` |
| [Auth LPM (Ideal)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/LPMs/Auth%20LPM%20%28Ideal%29.bru) | POST | `{{online_url}}/payments` |
| [Auth LPM (Trustly)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/LPMs/Auth%20LPM%20%28Trustly%29.bru) | POST | `{{online_url}}/payments` |
| [Auth LPM (WeChat)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/LPMs/Auth%20LPM%20%28WeChat%29.bru) | POST | `{{online_url}}/payments` |
| [Get transaction by request id](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/LPMs/Get%20transaction%20by%20request%20id.bru) | GET | `{{online_url}}/payments?requestIdentifier={{authLPMRequestId}}` |
| [Get transaction by transaction Id](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/LPMs/Get%20transaction%20by%20transaction%20Id.bru) | GET | `{{online_url}}/payments/{{LPMtransactionId}}` |

### [Online Payments / CIT-MIT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Auth CIT (CEST)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth%20CIT%20%28CEST%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture CIT (CGEN)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20CIT%20%28CGEN%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture CIT (CINS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20CIT%20%28CINS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture CIT (CREC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20CIT%20%28CREC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture CIT (CREV)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20CIT%20%28CREV%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture CIT (CSTO)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20CIT%20%28CSTO%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture CIT (CUSE)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20CIT%20%28CUSE%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MDEL)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MDEL%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MINS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MINS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MNOS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MNOS%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MRAU)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MRAU%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MREC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MREC%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MREV)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MREV%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MRSB)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MRSB%29.bru) | POST | `{{online_url}}/payments` |
| [Auth-Capture MIT (MUSE)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/Auth-Capture%20MIT%20%28MUSE%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Auth MIT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Auth%20MIT)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (CSTO)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Auth%20MIT/01%20-%20Auth-Capture%20CIT%20%28CSTO%29.bru) | POST | `{{online_url}}/payments` |
| [02 - Auth-Capture MIT (MDEL)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Auth%20MIT/02%20-%20Auth-Capture%20MIT%20%28MDEL%29.bru) | POST | `{{online_url}}/payments` |
| [03 - Auth-Capture MIT (MNOS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Auth%20MIT/03%20-%20Auth-Capture%20MIT%20%28MNOS%29.bru) | POST | `{{online_url}}/payments` |
| [04 - Auth-Capture MIT (MRSB)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Auth%20MIT/04%20-%20Auth-Capture%20MIT%20%28MRSB%29.bru) | POST | `{{online_url}}/payments` |
| [05 - Auth-Capture MIT (MRAU)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Auth%20MIT/05%20-%20Auth-Capture%20MIT%20%28MRAU%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Consumer Profile CIT to MIT](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Consumer%20Profile%20CIT%20to%20MIT)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (Consumer Profile Create)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Consumer%20Profile%20CIT%20to%20MIT/01%20-%20Auth-Capture%20CIT%20%28Consumer%20Profile%20Create%29.bru) | POST | `{{online_url}}/payments` |
| [02 - Auth-Capture MIT (MUSE) Use Consumer Profile](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Consumer%20Profile%20CIT%20to%20MIT/02%20-%20Auth-Capture%20MIT%20%28MUSE%29%20Use%20Consumer%20Profile.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Installment CINS to MINS](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Installment%20CINS%20to%20MINS)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (CINS) 1 of 3](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Installment%20CINS%20to%20MINS/01%20-%20Auth-Capture%20CIT%20%28CINS%29%201%20of%203.bru) | POST | `{{online_url}}/payments` |
| [02 - Auth-Capture MIT (MINS) 2 of 3](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Installment%20CINS%20to%20MINS/02%20-%20Auth-Capture%20MIT%20%28MINS%29%202%20of%203.bru) | POST | `{{online_url}}/payments` |
| [03 - Auth-Capture MIT (MINS) 3 of 3 Final](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Installment%20CINS%20to%20MINS/03%20-%20Auth-Capture%20MIT%20%28MINS%29%203%20of%203%20Final.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Negative Cases](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Negative%20Cases)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (CSTO)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Negative%20Cases/01%20-%20Auth-Capture%20CIT%20%28CSTO%29.bru) | POST | `{{online_url}}/payments` |
| [02 - MIT (MUSE) Missing originalTransactionLinkId](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Negative%20Cases/02%20-%20MIT%20%28MUSE%29%20Missing%20originalTransactionLinkId.bru) | POST | `{{online_url}}/payments` |
| [03 - MIT (MUSE) Malformed originalTransactionLinkId](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Negative%20Cases/03%20-%20MIT%20%28MUSE%29%20Malformed%20originalTransactionLinkId.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Recurring Fixed CREC to MREC](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Fixed%20CREC%20to%20MREC)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (CREC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Fixed%20CREC%20to%20MREC/01%20-%20Auth-Capture%20CIT%20%28CREC%29.bru) | POST | `{{online_url}}/payments` |
| [02 - Auth-Capture MIT (MREC)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Fixed%20CREC%20to%20MREC/02%20-%20Auth-Capture%20MIT%20%28MREC%29.bru) | POST | `{{online_url}}/payments` |
| [03 - Auth-Capture MIT (MREC) Next Cycle](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Fixed%20CREC%20to%20MREC/03%20-%20Auth-Capture%20MIT%20%28MREC%29%20Next%20Cycle.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Recurring Variable MC Only CREV to MREV](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Variable%20MC%20Only%20CREV%20to%20MREV)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (CREV)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Variable%20MC%20Only%20CREV%20to%20MREV/01%20-%20Auth-Capture%20CIT%20%28CREV%29.bru) | POST | `{{online_url}}/payments` |
| [02 - Auth-Capture MIT (MREV)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Variable%20MC%20Only%20CREV%20to%20MREV/02%20-%20Auth-Capture%20MIT%20%28MREV%29.bru) | POST | `{{online_url}}/payments` |
| [03 - Auth-Capture MIT (MREV) Next Cycle](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Recurring%20Variable%20MC%20Only%20CREV%20to%20MREV/03%20-%20Auth-Capture%20MIT%20%28MREV%29%20Next%20Cycle.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / CIT-MIT / MC-TLID / Unscheduled COF CSTO to CUSE to MUSE](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Unscheduled%20COF%20CSTO%20to%20CUSE%20to%20MUSE)

| Request | Method | Endpoint |
| --- | --- | --- |
| [01 - Auth-Capture CIT (CSTO)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Unscheduled%20COF%20CSTO%20to%20CUSE%20to%20MUSE/01%20-%20Auth-Capture%20CIT%20%28CSTO%29.bru) | POST | `{{online_url}}/payments` |
| [02 - Auth-Capture CIT (CUSE)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Unscheduled%20COF%20CSTO%20to%20CUSE%20to%20MUSE/02%20-%20Auth-Capture%20CIT%20%28CUSE%29.bru) | POST | `{{online_url}}/payments` |
| [03 - Auth-Capture MIT (MUSE)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/CIT-MIT/MC-TLID/Unscheduled%20COF%20CSTO%20to%20CUSE%20to%20MUSE/03%20-%20Auth-Capture%20MIT%20%28MUSE%29.bru) | POST | `{{online_url}}/payments` |

### [Online Payments / GET Calls](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Get Auth Details by RequestID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Auth%20Details%20by%20RequestID.bru) | GET | `{{online_url}}/payments?requestIdentifier={{authRequestId}}` |
| [Get Auth Details byTxID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Auth%20Details%20byTxID.bru) | GET | `{{online_url}}/payments/{{transactionId}}` |
| [Get Capture Details by RequestID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Capture%20Details%20by%20RequestID.bru) | GET | `{{online_url}}/captures?requestIdentifier={{captureRequestId}}` |
| [Get Capture Details by TxID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Capture%20Details%20by%20TxID.bru) | GET | `{{online_url}}/captures/{{transactionId}}` |
| [Get Fraud Check Details by RequestID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Fraud%20Check%20Details%20by%20RequestID.bru) | GET | `{{online_url}}/fraudcheck?requestId={{fraudRequestId}}` |
| [Get Fraud Check Details by TxID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Fraud%20Check%20Details%20by%20TxID.bru) | GET | `{{online_url}}/fraudcheck/{{transactionId}}` |
| [Get Refund Details by RequestID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Refund%20Details%20by%20RequestID.bru) | GET | `{{online_url}}/refunds?requestIdentifier={{refundRequestId}}` |
| [Get Refund Details by TxID](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Get%20Refund%20Details%20by%20TxID.bru) | GET | `{{online_url}}/refunds/{{transactionId}}` |
| [Health Check for Payments](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Health%20Check%20for%20Payments.bru) | GET | `{{online_url}}/healthcheck/payments` |
| [Health Check for Refunds](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/GET%20Calls/Health%20Check%20for%20Refunds.bru) | GET | `{{online_url}}/healthcheck/refunds` |

### [Online Payments / EFTPOS](https://github.com/jpmorgan-payments/api-collections/tree/refs/heads/main/merchant-services/Online%20Payments/EFTPOS)

| Request | Method | Endpoint |
| --- | --- | --- |
| [Account Verification (EFTPOS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/EFTPOS/Account%20Verification%20%28EFTPOS%29.bru) | POST | `{{online_url}}/verifications` |
| [Auth-Capture Now (EFTPOS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/EFTPOS/Auth-Capture%20Now%20%28EFTPOS%29.bru) | POST | `{{online_url}}/payments` |
| [Refund via Transaction ID (EFTPOS)](https://github.com/jpmorgan-payments/api-collections/blob/refs/heads/main/merchant-services/Online%20Payments/EFTPOS/Refund%20via%20Transaction%20ID%20%28EFTPOS%29.bru) | POST | `{{online_url}}/refunds` |
