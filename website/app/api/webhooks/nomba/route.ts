import {
  verifySignature,
  type NombaWebhookPayload,
} from "@/lib/nomba-webhook";
import { classifyEvent, normalizeEvent } from "@/lib/nomba-events";
import { subscribersFor } from "@/lib/subscriptions";

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

  // Fan the verified event out to every Zap subscribed to this event kind. Each
  // subscriber (registered via /api/subscriptions) gets the SAME normalised shape
  // the polling trigger emits, so downstream Zap field mappings are identical.
  const kind = classifyEvent(payload);
  let delivered = 0;
  if (kind) {
    const merchantAccountId = payload.data?.merchant?.userId;
    const subs = subscribersFor(kind, merchantAccountId);
    if (subs.length) {
      const normalized = normalizeEvent(payload);
      const body = JSON.stringify(normalized);
      const results = await Promise.allSettled(
        subs.map((s) =>
          fetch(s.targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          })
        )
      );
      delivered = results.filter((r) => r.status === "fulfilled").length;
    }
  }

  // Optionally also forward the raw event to a single Zapier "Catch Hook" — a
  // no-subscription fallback that works before the native REST-hook triggers exist.
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

  return Response.json({ received: true, event: kind, delivered });
}

/** GET is handy for a quick "is this URL live?" check when filling the form. */
export async function GET() {
  return Response.json({ ok: true, service: "charon-nomba-webhook" });
}
