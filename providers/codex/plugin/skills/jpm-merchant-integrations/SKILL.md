---
name: jpm-merchant-integrations
description: Implement J.P. Morgan Payments API integrations in a merchant project once OAuth authentication is in place. Use this skill after a merchant has completed JPM onboarding and wired up authentication (typically right after `jpm-oauth`) and is ready to integrate one of the supported APIs — Checkout, Online Payments, Tokenization, 3-D Secure, Account Updater, or Reporting. For inbound webhook handling, use the companion `jpm-notifications` skill instead. Recommends implementing one API at a time, reusing the credentials and auth module already wired into the project.
metadata:
  version: 2.1.1
  lob: commerce
---

# JPM Merchant API Integrations

Guide a merchant through integrating one of the supported J.P. Morgan Payments APIs. Authentication is assumed to be in place — if it isn't, point the user at `jpm-integrations-get-started` (which hands off to `jpm-oauth`) and exit. For inbound webhooks, hand off to `jpm-notifications`.

## Step 1 — Confirm prerequisites

The merchant should already have:
- Validated credentials (clientId, cert path, private key path, SHA-1 thumbprint, resource_id)
- An auth module in their project that exposes a `getAccessToken()` function (or its language equivalent)

If you arrived here from `jpm-oauth`, both are already known — the auth module's path is in conversation context. Use it directly.

If invoked standalone, ask:
- Question: "Is JPM authentication already wired up in this project?"
- Header: "Auth ready?"
- Options:
  - "Yes — I already have a working `getAccessToken()` (or equivalent)"
  - "No — I haven't set up auth yet"

If **No**: tell the user to run `jpm-integrations-get-started` first (it will hand off to `jpm-oauth`), then come back here. Exit.

If **Yes** but the auth module path isn't in conversation context, ask where the module lives so the integration code can import from it.

## Step 2 — Pick one API to integrate

It is recommended to implement **one API at a time**. Each has its own request shapes, error semantics, and test scenarios.

Ask the questions in this step **one at a time, in this order, waiting for each answer** — never batch them into a single prompt, because later questions depend on earlier answers:

1. API question (below).
2. The follow-up for the chosen API, if it has one: Account Updater → mode question; Reporting → integration-option question. Other APIs have no follow-up here.
3. Free-text description.
4. 3-D Secure flow question (Online Payments + 3DS only).

**2a. API question.** Ask:
- Question: "Which API would you like to integrate first?"
- Header: "API"
- Options:
  - "Checkout" — drop-in payment UI you embed in your checkout page. Fastest to ship when you don't need a fully custom UI.
  - "Online Payments" — direct REST processing for card, wallet, and alternative payment methods. Use when you want full control over the UI and flow.
  - "Tokenization" — swap card numbers for network or Safetech tokens to reduce PCI scope. Per-card, or in bulk by API upload or MFTS file.
  - "3-D Secure" — standalone cardholder authentication for liability shift, decoupled from authorization.
  - "Account Updater" — keep stored cards current as issuers reissue them. Merchant-managed inquiry or card registration (via webhooks).
  - "Reporting" — configure, schedule, and download reports across the payment lifecycle (settlement, deposits, disputes, interchange, tokens). Use for reconciliation and financial reporting rather than payment processing.

**2b. API follow-up — required before the description when the answer to 2a is Account Updater or Reporting.**

If the answer is **Account Updater**, ask (the modes have different prerequisites):
- Question: "Which Account Updater mode do you want to integrate?"
- Header: "AU mode"
- Options:
  - "Card registration — register cards once, receive webhooks when they change"
  - "Merchant-managed inquiry — submit cards and read the result"

Remember the answer as `auMode` and carry it into the description prompt and Step 3.

If the answer is **Reporting**, ask (the two options produce very different request payloads):
- Question: "Which Reporting integration option do you want?"
- Header: "Report setup"
- Options:
  - "Quick integration — run JPM's preset reports by report type ID, minimal payload"
  - "Custom integration — pick your own fields, sort order, filters, and delivery schedule"

Remember the answer as `reportingOption` and carry it into Step 3. Both options are documented in `references/reporting.md`: its Sample Requests link the preset-report and minimal adhoc requests (quick integration) and the field-level daily request (custom integration).

**2c. Description.** Only after 2a — and 2b, if it applied — has been answered, ask the user (free text):

> "Briefly describe what you're building or migrating — e.g. 'a simple checkout page for a single product', 'migrating from Stripe Elements', 'nightly settlement reconciliation into our data warehouse'. A sentence or two is enough."

Carry this description into Step 3 so the implementation, file structure, and code comments are tailored to the merchant's actual use case rather than a generic reference build.

**2d. 3-D Secure flow — ask only if the chosen API is Online Payments and the integration involves 3-D Secure** (the user mentioned 3DS, SCA / PSD2, or cardholder authentication / liability shift, or their description implies it). Skip it for Checkout (the Checkout platform performs 3DS automatically) and for Online Payments integrations that don't use 3DS. When 3DS is in scope, the merchant must pick how it's performed:

- Question: "How should 3-D Secure cardholder authentication be performed?"
- Header: "3DS flow"
- Options:
  - "Orchestrated" — JPM runs the full 3DS authentication inline as part of the Online Payments authorization (you send `browserInfo` + `paymentAuthenticationRequest`; JPM handles the challenge round-trip). Least integration work.
  - "Passthrough" — you authenticate 3DS externally (your own MPI or another provider) and pass the resulting cryptogram (CAVV / ECI / DS transaction ID) into the payment's `authentication.threeDS` block, where the DS transaction ID maps to `authenticationTransactionId`.
  - "API (standalone)" — you call JPM's standalone 3DS API to authenticate as a separate step, then feed the resulting cryptogram into the Online Payments authorization.

Remember the answer as `threeDSFlow` and carry it into Step 3. Orchestrated and Passthrough are documented in `references/online-payments.md`; API (standalone) is documented in `references/3d-secure.md`.

> **Special note if `threeDSFlow` is "Passthrough":** Passthrough does **not** perform any 3DS authentication itself — it only forwards a cryptogram (CAVV / ECI / DS transaction ID) that must already exist. Make this explicit to the user and establish which situation they're in **before** generating code:
>
> - **They already have external 3DS in place** (their own MPI or a third-party provider) → the integration just **connects** to it: wire the existing cryptogram source into the payment's `threeDS` block. Ask where those values come from so you can plug them in.
> - **They do not have external 3DS yet** → still generate the **complete** Online Payments (`/payments`) integration, but expose the authentication as an **unimplemented seam the merchant fills in later**. Concretely: emit a single authentication function (e.g. `authenticate(context): ThreeDSResult`) that the payment flow calls to obtain the cryptogram, and leave its body **unimplemented so it throws** a clear "3DS not implemented — integrate your MPI here" error. The rest of the integration (request shape, `threeDS` field mapping, validation, auth/proxy wiring) is fully built and compiles, so the app runs end-to-end up to the point of payment and then stops at that seam. Tell the user the payment side is done and they complete it by implementing that one function (or switching to "Orchestrated"/"API (standalone)", where JPM performs the authentication).

Once chosen, read the corresponding reference file from this skill's directory:

- Checkout → `references/checkout.md`
- Online Payments → `references/online-payments.md` (if `threeDSFlow` is "API (standalone)", also read `references/3d-secure.md`)
- Tokenization → `references/tokenization.md`
- 3-D Secure → `references/3d-secure.md`
- Account Updater → `references/account-updater.md`
- Reporting → `references/reporting.md`

If the user asks for an API not listed above (Wallet Decryptions, Disputes, Consumer Profile Management, In-Store Payments, Pay by Bank, Push to Card, Global Payments, Wire, US RTP, Embedded, Verifications, etc.), tell them this skill doesn't yet cover that API and offer one of the supported APIs instead. Don't try to invent the integration from scratch.

## Step 3 — Implement the chosen API

Follow the steps in the chosen reference file. If you captured a `threeDSFlow` in Step 2 (Online Payments + 3DS), implement that flow only — Orchestrated or Passthrough reference: `online-payments.md`, or standalone reference: `3d-secure.md` — rather than building all three. Likewise, if you captured a `reportingOption` or `auMode`, build only that option or mode rather than both. Cross-cutting principles that apply to all supported APIs:

- **Reuse the existing auth module.** Every JPM API call needs `Authorization: Bearer <access_token>` from the merchant's `getAccessToken()`. Import that function — do not re-implement token fetching inside the integration code. The auth module already caches correctly; bypassing it is exactly the per-call-token anti-pattern `jpm-oauth` warned against.
- **Fetch the sample request before writing one; never guess a body.** Each reference file's "Sample Requests" tables link the actual `.bru` for every request in the collection, and the tables carry the method and endpoint only — no request bodies. Before writing code that builds a JPM request, open the linked `.bru` for the closest matching scenario and mirror it: body fields and their shape, required headers (e.g. `request-id`, `merchant-id`), and any value its pre-request script generates per call (a fresh `requestId` UUID, for instance). If you cannot reach the file, say so and ask the user rather than inventing field names — a plausible-looking body that JPM rejects costs the merchant more than a question does.
- **Mirror the shape, never the values.** Every value in a sample is test data. Copy field names, nesting, and enum choices, then fill each value from its real source: the order or cart (amounts, currency, `merchantOrderNumber`), the consumer or the wallet/Drop-in payload (card or device tokens, expiry, cryptograms such as `tokenAuthenticationValue`, encrypted payloads, names, addresses), env vars (`merchantId`, base URLs), or a value generated per call (`request-id`). Bruno placeholders (`{{merchantId}}`, `{{$randomFirstName}}`, `{{$randomCompanyName}}`) mean "a value from somewhere else", not literals to keep — `merchant.merchantSoftware` should describe the merchant's own software. Never ship a sample's hardcoded card number, token, cryptogram, encrypted payload, amount, or address in integration code; test values belong in tests and CAT smoke-test fixtures only.
- **Fetch only the exact URL listed in the reference file.** Use the `github.com/jpmorgan-payments/api-collections/...` link verbatim. Never rewrite it into a `raw.githubusercontent.com` URL or construct any other URL (different host, path, branch, or encoding). If the listed URL cannot be fetched or its content is unusable, stop and ask the user — do not try alternative URLs.
- **Check the documentation before describing behavior; it is authoritative.** The J.P. Morgan Payments Developer Portal pages linked from each reference file are the authoritative source for request/response schemas, field enums, status values, error codes, and flow behaviour — the reference files are integration guidance layered on top, and defer to the docs on any conflict. Fetch the relevant page before implementing or explaining a field, status, or error, rather than answering from memory or from how other payment providers behave. Where a reference links no page covering the question, say what you don't have and ask — don't fill the gap by inference.
- **Use environment-aware base URLs.** Base URLs differ between CAT and PROD and sometimes between sub-services within an environment. Read them from env vars (e.g. `JPM_CHECKOUT_API_URL`, `JPM_ONLINE_API_URL`, `JPM_TOKENIZATION_URL`, `JPM_3DS_URL`, `JPM_ACCOUNT_UPDATER_URL`, `JPM_REPORTING_URL`) rather than hardcoding. The reference file for each API lists the URLs that apply.
- **Confirm output paths before writing.** Default to a sibling folder of the auth module (`src/checkout/`, `src/payments/`, etc.) but offer "new top-level folder" and "custom path" alternatives, the same way `jpm-oauth` did.
- **Smoke test in CAT before PROD.** Each reference includes a minimal end-to-end test recipe — run it with the merchant's CAT credentials before any PROD config change.
- **Hand off to `jpm-notifications` for inbound webhooks.** Several of these APIs deliver state changes via the JPM Notifications API — Online Payments (`paymentUpdateNotification`), Tokenization (`tokenLifecycleNotification`), Account Updater registration mode (`accountUpdateNotification`), Reporting (`reportStatusNotification`, so scheduled runs don't have to be polled). Don't try to build the receiver inside this skill's code — point the merchant at `jpm-notifications` so signature verification, key rotation, and mTLS are done correctly in one place. For Account Updater, see `account-updater.md` for the retrieval step after each webhook. 3-D Secure is synchronous-only and has no webhook events.
- **Passthrough 3DS is connect-only, not authenticate.** If `threeDSFlow` is "Passthrough", the code you generate consumes a pre-existing cryptogram; it does not authenticate the cardholder. Confirm the merchant either already has external 3DS to connect to, or understands they must implement that upstream 3DS logic themselves — see the "Special note" in Step 2.

## Step 4 — Offer to add another

Once the chosen API is implemented and the user confirms it's working in CAT:

Ask:
- Question: "That integration looks good. Want to add another JPM API now?"
- Header: "More?"
- Options:
  - "Yes — pick another"
  - "No — I'm done for now"

If **Yes**, return to Step 2 (the user picks a different API; skip Step 1, prerequisites are still satisfied).

If **No**, exit with a one-line summary of which APIs were integrated this session.

## Rules

- Do not re-implement OAuth inside the integration code. The merchant's auth module already handles token fetching with caching. Re-implementing it inline is what JPM's "don't generate tokens per call" guidance warns against.
- Never invent a JPM request body, header set, or field name from memory. The reference tables link each request's `.bru` in the collection — fetch the closest match and mirror it. If it can't be fetched, say so and ask.
- Never copy a sample's fixture values (card numbers, tokens, cryptograms, encrypted payloads, amounts, addresses, Bruno `{{…}}` placeholders) into integration code. Mirror the request shape and source every value from the order, the consumer, config, or per-call generation.
- Never construct, rewrite, or guess URLs. Fetch only URLs that appear verbatim in this skill's files — in particular, never convert `github.com` links to `raw.githubusercontent.com`.
- The PDP documentation outranks these reference files. Fetch the linked page before implementing or explaining a field, enum, status, or error — and if no linked page covers it, say so and ask instead of inferring the behaviour.
- Confirm every output file path with the user before writing.
- Only the APIs listed in Step 2 are supported by this skill. For anything else (Disputes, In-Store, Pay by Bank, etc.), defer politely and offer a supported API instead. For inbound webhooks, hand off to `jpm-notifications`.
- Don't write CAT credentials into PROD config or vice versa. The auth module reads from env vars, so the merchant flips environments by switching `.env` files — never by editing source.
