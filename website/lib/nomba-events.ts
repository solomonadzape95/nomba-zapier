import type { NombaWebhookPayload } from "@/lib/nomba-webhook";
import type { EventKind } from "@/lib/subscriptions";

/**
 * Turn a verified Nomba webhook into the exact shape Charon's Zapier triggers emit,
 * so a Zap sees identical fields whether it fired from a real-time webhook or from
 * the polling fallback (`new_payment` / `new_transfer` `performList`).
 */

const OUTBOUND = ["transfer", "payout", "topup", "bill", "withdraw", "disburse", "debit"];
const INBOUND = [
  "payment",
  "checkout",
  "collection",
  "credit",
  "inflow",
  "deposit",
  "virtual",
];

/** Decide whether an event is inbound money (payment) or outbound (transfer). */
export function classifyEvent(payload: NombaWebhookPayload): EventKind | null {
  const txnType = payload.data?.transaction?.type ?? "";
  const hay = `${payload.event_type ?? ""} ${txnType}`.toLowerCase();
  // Outbound is checked first: an outbound keyword (transfer/payout/bill) is a
  // stronger signal of direction than the generic word "payment".
  if (OUTBOUND.some((k) => hay.includes(k))) return "transfer";
  if (INBOUND.some((k) => hay.includes(k))) return "payment";
  return null;
}

export type NormalizedEvent = {
  id?: string;
  status?: string;
  type?: string;
  amount?: string;
  amountValue?: number;
  currency?: string;
  orderReference?: string;
  merchantTxRef?: string;
  customerEmail?: string;
  senderName?: string;
  timeCreated?: string;
  event_type?: string;
  requestId?: string;
};

export function normalizeEvent(payload: NombaWebhookPayload): NormalizedEvent {
  const t = payload.data?.transaction ?? {};
  const o = payload.data?.order ?? {};
  const c = payload.data?.customer ?? {};

  const rawAmount = t.amount ?? o.amount;
  const amountValue = rawAmount != null ? Number(rawAmount) : undefined;

  // Nomba uses responseCode "00" for success on some events; map it if no explicit
  // status is present.
  const status =
    t.status ?? (t.responseCode === "00" ? "SUCCESS" : t.responseCode) ?? undefined;

  return {
    id: t.transactionId || t.merchantTxRef || o.orderReference || payload.requestId,
    status,
    type: t.type,
    amount: rawAmount != null ? String(rawAmount) : undefined,
    amountValue: Number.isNaN(amountValue) ? undefined : amountValue,
    currency: t.currency || o.currency || "NGN",
    orderReference: o.orderReference || t.merchantTxRef,
    merchantTxRef: t.merchantTxRef || o.orderReference,
    customerEmail: c.email || o.customerEmail,
    senderName: t.senderName || c.name,
    timeCreated: t.time,
    event_type: payload.event_type,
    requestId: payload.requestId,
  };
}
