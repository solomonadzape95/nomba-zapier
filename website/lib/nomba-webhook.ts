import { createHmac, timingSafeEqual } from "crypto";

/**
 * Nomba webhook signature verification.
 *
 * Nomba signs each webhook it forwards. Per the docs
 * (https://developer.nomba.com/docs/api-basics/webhook) the signed string is a
 * colon-delimited join of specific payload fields plus the request timestamp:
 *
 *   event_type : requestId : data.merchant.userId : data.merchant.walletId :
 *   data.transaction.transactionId : data.transaction.type :
 *   data.transaction.time : data.transaction.responseCode : nomba-timestamp
 *
 * That string is HMAC-SHA256'd with your signing key and base64-encoded. The
 * result must equal the `nomba-signature` header.
 */

export type NombaWebhookPayload = {
  event_type?: string;
  requestId?: string;
  data?: {
    merchant?: { userId?: string; walletId?: string };
    transaction?: {
      transactionId?: string;
      type?: string;
      time?: string;
      responseCode?: string;
    };
  };
};

/** Build the exact string Nomba signs, in field order, from the payload + timestamp. */
export function buildSigningString(
  payload: NombaWebhookPayload,
  timestamp: string
): string {
  const m = payload?.data?.merchant ?? {};
  const t = payload?.data?.transaction ?? {};
  return [
    payload?.event_type ?? "",
    payload?.requestId ?? "",
    m.userId ?? "",
    m.walletId ?? "",
    t.transactionId ?? "",
    t.type ?? "",
    t.time ?? "",
    t.responseCode ?? "",
    timestamp ?? "",
  ].join(":");
}

/** HMAC-SHA256 → base64 of the signing string, using the signing key. */
export function computeSignature(signingString: string, key: string): string {
  return createHmac("sha256", key).update(signingString, "utf8").digest("base64");
}

/** Constant-time comparison of the expected vs provided signature. */
export function verifySignature(
  payload: NombaWebhookPayload,
  timestamp: string,
  providedSignature: string,
  key: string
): boolean {
  const expected = computeSignature(buildSigningString(payload, timestamp), key);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(providedSignature ?? "", "utf8");
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
