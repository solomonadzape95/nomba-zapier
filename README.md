# Charon

**Put your money on autopilot.** Charon connects your [Nomba](https://nomba.com)
account to the 8,000+ apps on Zapier, so payments record themselves, suppliers get
paid automatically, and customers get payment links — with no code.

Built for the **Nomba × DevCareer Hackathon 2026**. Domain: **paywithcharon.xyz**.

## Repo layout

This is a monorepo with two parts:

| Folder | What it is |
|--------|------------|
| [`integration/`](./integration) | **The engine** — the Zapier integration for Nomba (Zapier Platform CLI, Node.js). Auth, triggers, actions, searches, tests. |
| [`website/`](./website) | **The shop window** — the marketing site (Next.js 16 + Tailwind v4). |

## Quick start

**Integration**
```bash
cd integration
npm install
cp .env.example .env.local          # add your Nomba sandbox keys
npm test                            # 9 unit tests
node scripts/live.js                # end-to-end run against the Nomba sandbox
node_modules/.bin/zapier-platform validate
```

**Website**
```bash
cd website
npm install
npm run dev                         # http://localhost:3000
```

## Nomba webhook receiver

The site ships a verified webhook endpoint at **`/api/webhooks/nomba`**
(`website/app/api/webhooks/nomba/route.ts`). It checks the `nomba-signature`
header (HMAC-SHA256 → base64 over Nomba's colon-delimited field string) before
accepting an event, returns `200` on success and `401` on a bad signature, and a
`GET` returns a health check. Configure via env:

- `NOMBA_WEBHOOK_KEY` — the signing key (defaults to the hackathon key).
- `ZAPIER_HOOK_URL` — optional; verified events are forwarded here for real-time Zaps.

Once deployed, the URL to register with Nomba is
`https://<your-domain>/api/webhooks/nomba`.

## Learn more

- New here? Read [`integration/WHAT-IS-CHARON.md`](./integration/WHAT-IS-CHARON.md) —
  a plain-English guide to what Charon does and how it's built.
- Developer setup and API details: [`integration/README.md`](./integration/README.md).
