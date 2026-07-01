# What is Charon? (a plain-English guide)

> **In one sentence:** Charon lets a Nigerian business connect its **Nomba** money
> account to the everyday apps it already uses (Google Sheets, WhatsApp, Airtable,
> web forms…), so money tasks happen **automatically** — no coding required.

This guide explains, in simple terms: what Charon does, why it's useful, everything
that was built, how you'd use it, and how we tested it.

---

## 1. The idea, explained like you're new to this

Imagine you run a small shop that gets paid through **Nomba** (a Nigerian payments
company — think of it like your business bank + card machine).

Every day you do the same boring money chores by hand:

- A customer pays you → you open Nomba, copy the amount, and paste it into a
  spreadsheet so your records stay up to date.
- A supplier sends an invoice → you open Nomba, retype their account number, and
  send the transfer.
- A new customer wants to buy → you manually create a payment link and send it to them.

These are small tasks, but you do them **dozens of times a day**. That's time you
could spend actually running your business.

**Charon does these chores for you, automatically.**

You set up a rule once, in plain language, like:

> "**When** a payment lands in my Nomba account, **then** add a row to my Google
> Sheet and text the customer a receipt."

From then on, Charon watches your Nomba account 24/7 and does that automatically —
even while you sleep.

> **Why the name "Charon"?** In old myths, Charon was the ferryman who took a coin
> as payment to carry you across the river. Our Charon carries your money where it
> needs to go — you just set the route once. (That's also why the brand colour is
> coin-gold.)

---

## 2. The two pieces of technology it stands on

Charon itself doesn't move money or store your data. It's the **bridge** between two
services:

- **Nomba** — the payments company. It has an "API" (a way for other software to
  talk to it) that can receive payments, send transfers, buy airtime, check
  balances, and so on.
- **Zapier** — a hugely popular website (used by millions) that lets non-technical
  people connect apps together with simple "**when this happens, do that**" rules.
  Each rule is called a **Zap**. Zapier already connects to 8,000+ apps.

**Charon is a Zapier "integration" for Nomba.** Once it exists, anyone on Zapier can
pick "Nomba" from the list and connect it to any of those 8,000+ apps — no code.

Before Charon, Nomba was **not** on Zapier, so none of this was possible without a
developer. Charon fills that gap.

---

## 3. What was actually built

There are **two folders**. Think of them as *the engine* and *the shop window*.

### A) `nomba-zapier/` — the engine (the Zapier integration)

This is the real product: the code that teaches Zapier how to talk to Nomba. It's
written in JavaScript using Zapier's official toolkit.

Here's every important file and what it does, in plain words:

| File | What it does |
|------|--------------|
| `authentication.js` | The "login". Asks you for your Nomba keys and exchanges them for a temporary access pass Nomba accepts. |
| `middleware.js` | The "doorman". Attaches your access pass to every request, refreshes it when it expires, and turns Nomba's error codes into readable messages. |
| `constants.js` | Small helper: knows the two Nomba web addresses (test vs. live) and tidies up Nomba's responses. |
| `index.js` | The "table of contents". Lists all the triggers, actions, and searches so Zapier can find them. |
| **Triggers** (things that *start* an automation) | |
| `triggers/new_payment.js` | Fires when money **comes into** your Nomba account. |
| `triggers/new_transfer.js` | Fires when money **leaves** your account (a payout or bill). |
| `triggers/bank_list.js` | A hidden helper that fills the "choose a bank" dropdown. |
| **Actions** (things Charon *does* for you) | |
| `creates/send_transfer.js` | Sends money to a Nigerian bank account (checks the name first). |
| `creates/create_payment_link.js` | Creates a Nomba payment link to send a customer. |
| `creates/buy_airtime.js` | Tops up a phone number with airtime. |
| `creates/create_virtual_account.js` | Creates a dedicated account number (e.g. one per customer). |
| **Searches** (look-ups) | |
| `searches/lookup_account.js` | Confirms the real name behind a bank account number. |
| `searches/get_balance.js` | Reads your available Nomba balance. |
| **Testing & docs** | |
| `test/basic.test.js` | Automated tests that check every piece works (using fake, controlled data). |
| `scripts/smoke.js` | A quick script that pokes the real Nomba test server to confirm the web addresses and data shapes. |
| `scripts/live.js` | Runs the *actual* Charon code against Nomba's real test server, end to end. |
| `README.md` | The technical setup guide for a developer. |
| `WHAT-IS-CHARON.md` | This friendly guide. |

### B) `paywithcharon/` — the shop window (the website)

This is the marketing website for the product, at the domain **paywithcharon.xyz**.
It explains Charon to visitors and looks the part. It's built with **Next.js**
(a popular website framework) and styled to feel premium and editorial — a
coin-gold accent on a deep black canvas, with light/sepia/dark themes you can switch
between (top-right button).

Key files: `app/page.tsx` (the whole landing page and its wording),
`app/layout.tsx` (fonts + page shell), `app/globals.css` (the colours, themes, and
type styles), and small building blocks in `components/` (the top navigation, the
footer, the theme switcher, the logo, and the scrolling banner of example
automations).

---

## 4. The "building blocks" in everyday language

An automation is always **one trigger + one or more actions**. Here's the full menu
Charon offers:

**Triggers — what can start an automation:**
- **New Payment Received** — someone paid you.
- **New Transfer or Payout** — money left your account.

**Actions — what Charon can do:**
- **Send Bank Transfer** — pay any Nigerian bank account (name verified first).
- **Create Payment Link** — make a link a customer can pay through.
- **Buy Airtime** — top up any phone number.
- **Create Virtual Account** — hand a customer their own account number.

**Look-ups — quick answers you can use mid-automation:**
- **Lookup Bank Account** — "whose account is this number?"
- **Get Wallet Balance** — "how much do I have right now?"

---

## 5. How you'd actually use it (a real example)

Let's build the "automatic bookkeeping" recipe.

1. **Get your Nomba keys.** In your Nomba dashboard, go to *Settings → API Keys* and
   copy three things: your **Account ID**, **Client ID**, and **Client Secret**.
2. **Connect Nomba on Zapier.** In Zapier, choose Nomba, paste those three values,
   and pick "Sandbox" (for testing) or "Live". Zapier confirms the connection works.
3. **Pick the trigger.** Choose **New Payment Received**.
4. **Pick the action.** Choose Google Sheets → *Create Spreadsheet Row*, and map the
   payment's amount, reference, and customer email into your columns.
5. **(Optional) add another action.** Add SMS/WhatsApp → *Send Message* to text the
   customer a receipt.
6. **Turn it on.** Done. Every future payment now records itself and thanks the
   customer — forever, hands-free.

Other ready-made recipes work the same way:
- **Invoice approved in Airtable → Send Bank Transfer** (hands-free payouts)
- **Order form submitted → Create Payment Link → email it** (instant collection)
- **Order paid → Buy Airtime** (loyalty reward)

---

## 6. How it was tested (and how you can re-run the tests)

Charon wasn't just written — it was **checked three different ways**, and all three
pass. From inside the `nomba-zapier/` folder:

1. **Automated unit tests** — 9 tests using fake, controlled responses to prove each
   piece behaves correctly (login, payment filtering, transfers, payment links,
   airtime, virtual accounts, error handling).
   ```bash
   npm test
   ```
2. **Zapier's own validator** — checks the integration is built correctly to Zapier's
   platform standards (23 checks, 0 failures).
   ```bash
   node_modules/.bin/zapier-platform validate
   ```
3. **A real live run** against Nomba's **sandbox** (test) server — proves the actual
   code works against the real API, end to end. This is what caught real-world
   details (see below).
   ```bash
   # put your sandbox keys in .env.local first
   node scripts/live.js
   ```

**Things the live testing caught that guessing would have missed:**
- Nomba's **test server uses a different web address** (`sandbox.nomba.com`) than the
  live one (`api.nomba.com`).
- The list-of-banks address is spelled `.../banks` (plural).
- Real payments are labelled `"online_checkout"` and amounts come back as text like
  `"500.00"` — so the code was adjusted to recognise real payments correctly and to
  also provide the amount as a proper number.

All eight money features were confirmed working against the sandbox, including a real
₦50 airtime top-up and a real payment link.

---

## 7. What's still left (needs a human)

Everything code-related is done, tested, and verified. The remaining steps need
*your* accounts and can't be automated:

- **Publish on Zapier:** log in to Zapier from the CLI and upload the integration
  (`zapier-platform login`, then `register`, then `push`). It stays private/invite-only
  — good enough to demo without Zapier's public review.
- **Build the demo Zaps** in the Zapier editor and switch them on.
- **Record a short demo video** and write the hackathon submission.
- **Deploy the website** (e.g. to Vercel) and point **paywithcharon.xyz** at it.

---

### Quick reference

| Thing | Where |
|------|-------|
| The integration (engine) | `nomba-zapier/` |
| The website (shop window) | `paywithcharon/` → run `npm run dev`, open http://localhost:3000 |
| Technical setup | `nomba-zapier/README.md` |
| This friendly guide | `nomba-zapier/WHAT-IS-CHARON.md` |
