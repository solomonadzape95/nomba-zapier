import {
  addSubscription,
  subscriptionCount,
  type EventKind,
} from "@/lib/subscriptions";

// In-memory store lives in the Node runtime; never cache these responses.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_EVENTS: EventKind[] = ["payment", "transfer"];

/**
 * POST /api/subscriptions
 * Called by a Charon Zapier trigger's `performSubscribe`. Registers the Zap's
 * delivery URL so verified Nomba webhooks get fanned out to it in real time.
 * Body: { targetUrl, event: "payment" | "transfer", accountId? }
 */
export async function POST(req: Request) {
  let body: { targetUrl?: string; event?: string; accountId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { targetUrl, event, accountId } = body;

  if (!targetUrl || typeof targetUrl !== "string") {
    return Response.json({ error: "targetUrl is required" }, { status: 400 });
  }
  if (!VALID_EVENTS.includes(event as EventKind)) {
    return Response.json(
      { error: `event must be one of: ${VALID_EVENTS.join(", ")}` },
      { status: 400 }
    );
  }

  const sub = addSubscription({
    targetUrl,
    event: event as EventKind,
    accountId,
  });

  return Response.json({ id: sub.id }, { status: 201 });
}

/** GET is a lightweight health/inspection endpoint — count only, no URLs/secrets. */
export async function GET() {
  return Response.json({ ok: true, subscriptions: subscriptionCount() });
}
