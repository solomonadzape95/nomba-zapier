# Nomba for Zapier

Connect **[Nomba](https://nomba.com)** payments, payouts and collections to the
8,000+ apps on Zapier — no code required. Built for the **Nomba × DevCareer
Hackathon 2026**.

Nigerian SMEs run their business across WhatsApp, Google Sheets, Airtable, forms
and accounting tools. This integration lets them automate money movement across
all of them: auto-record every payment, auto-pay suppliers, and generate payment
links from a form — without a developer.

## What it does

**Triggers** (start a Zap when something happens in Nomba)
- **New Payment Received** — fires on each successful inbound payment (checkout or
  virtual-account inflow). Polling-based, so it works in sandbox and live.
- **New Transfer or Payout** — fires when an outbound transfer, payout or bill
  payment completes.

**Actions** (do something in Nomba)
- **Send Bank Transfer** — pay out to any Nigerian bank account, with optional
  automatic name verification first.
- **Create Payment Link** — generate a hosted Nomba checkout link to send a customer.
- **Buy Airtime** — top up a phone number (customer rewards, bulk airtime).
- **Create Virtual Account** — issue a dedicated account number (one per customer/order).

**Searches**
- **Lookup Bank Account** — verify an account number and return the holder's name.
- **Get Wallet Balance** — read your Nomba account balance.

All eight operations are **verified end-to-end against the Nomba sandbox** (see
`scripts/live.js`).

## Example Zaps (the SME automation story)

1. **Auto-bookkeeping** — *New Payment Received* → add a row in Google Sheets → send
   an SMS/WhatsApp receipt.
2. **Auto-payouts** — new "invoice approved" row in Airtable → *Send Bank Transfer*.
3. **Collection** — new Google Form / Typeform response → *Create Payment Link* →
   email/SMS the link to the customer.

## Authentication

Uses Zapier **Session Auth** over Nomba's OAuth2 client-credentials flow. On connect,
the user pastes three values from **Nomba Dashboard → Settings → API Keys**:

- **Account ID** (parent account)
- **Client ID**
- **Client Secret**

Zapier exchanges these at `POST /v1/auth/token/issue` for a short-lived bearer token,
attaches `Authorization: Bearer <token>` + the `accountId` header on every request
(`middleware.js`), and transparently refreshes the token on a 401.

> **Base URLs.** Live = `https://api.nomba.com`, **Sandbox = `https://sandbox.nomba.com`**.
> The token-issue call succeeds on either host, but a *sandbox* token is only accepted
> by the sandbox host — so the **Environment** field (Live/Sandbox) must match your keys.
> Selected in `constants.js` / the auth dropdown.

## Project layout

```
index.js                 App definition (auth, triggers, creates, searches, middleware)
authentication.js        Session Auth: credential exchange + connection test
middleware.js            Inject token/accountId; refresh on 401; surface API errors
constants.js             Base URLs (live/sandbox) + response unwrap helper
triggers/new_payment.js  New Payment Received (polling)
triggers/new_transfer.js New Transfer or Payout (polling)
triggers/bank_list.js    Hidden trigger powering the bank dropdown
creates/send_transfer.js          Send Bank Transfer (with name lookup)
creates/create_payment_link.js    Create checkout payment link
creates/buy_airtime.js            Buy airtime
creates/create_virtual_account.js Create dedicated virtual account
searches/lookup_account.js        Bank account name enquiry
searches/get_balance.js           Wallet balance
scripts/smoke.js         Raw HTTP probe of sandbox endpoints (shapes only)
scripts/live.js          End-to-end run of the real app code vs sandbox
test/basic.test.js       Mocked unit tests for every operation
```

## Local development

```bash
npm install
cp .env.example .env.local  # fill in your Nomba sandbox keys (CLIENT_ID/SECRET/ACCOUNT_ID, ENVIRONMENT=sandbox)
npm test                    # runs the mocked test suite (9 tests)
node scripts/live.js        # runs the app end-to-end against the Nomba sandbox

# validate against Zapier's platform checks
node_modules/.bin/zapier-platform validate

# push a private version and test in the Zap editor
node_modules/.bin/zapier-platform login
node_modules/.bin/zapier-platform register "Nomba"   # first time only
node_modules/.bin/zapier-platform push
```

Then open Zapier, connect a Nomba account with your sandbox keys, and build the
example Zaps above.

## Roadmap

- REST-hook webhook variant of the payment trigger for instant delivery (currently polling)
- **Buy Data Bundle** action (`/v1/bill/data`) and electricity/cable bill payments
- **Refund Payment** and **Cancel Checkout** actions
- Global Payout (cross-border) support

## Notes

- The integration is kept **private/invite-only** for the hackathon demo — public
  App Directory listing requires Zapier's separate review process and is out of scope.
- Response parsing is defensive (`constants.unwrap`) to tolerate Nomba's
  `{ code, description, data }` envelope; a few exact field names should be
  reconfirmed against live sandbox responses.
