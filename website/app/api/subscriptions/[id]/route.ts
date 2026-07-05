import { removeSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/subscriptions/:id
 * Called by a Charon trigger's `performUnsubscribe` when a Zap is turned off.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = removeSubscription(id);
  return Response.json({ deleted });
}
