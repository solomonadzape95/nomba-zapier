import {
  verifySignature,
  type NombaWebhookPayload,
} from "@/lib/nomba-webhook";

// node:crypto (HMAC) needs the Node.js runtime, and webhooks must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shared hackathon signing key. Overridable via env for production/rotation.
const SIGNING_KEY = process.env.NOMBA_WEBHOOK_KEY || "NombaHackathon2026";
// Optional: forward verified events to a Zapier "Catch Hook" for real-time Zaps.
const FORWARD_URL = process.env.ZAPIER_HOOK_URL;

/**
 * POST /api/webhooks/nomba
 * Receives Nomba webhooks, verifies the `nomba-signature`, and acknowledges.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature =
    req.headers.get("nomba-signature") ||
    req.headers.get("nomba-sig-value") ||
    "";
  const timestamp = req.headers.get("nomba-timestamp") || "";

  let payload: NombaWebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!verifySignature(payload, timestamp, signature, SIGNING_KEY)) {
    // 401 keeps forged calls out; Nomba retries genuine ones on non-2xx.
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Verified — this genuinely came from Nomba.
  console.log(
    `[nomba-webhook] ${payload.event_type ?? "unknown"} ${payload.requestId ?? ""}`
  );

  // Optionally fan the event out to a Zapier Catch Hook for real-time triggers.
  if (FORWARD_URL) {
    try {
      await fetch(FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw,
      });
    } catch (e) {
      // Don't fail the webhook if forwarding hiccups; Nomba would otherwise retry.
      console.error("[nomba-webhook] forward failed:", e);
    }
  }

  return Response.json({ received: true });
}

/** GET is handy for a quick "is this URL live?" check when filling the form. */
export async function GET() {
  return Response.json({ ok: true, service: "charon-nomba-webhook" });
}
