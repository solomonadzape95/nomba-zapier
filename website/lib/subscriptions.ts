import { randomUUID } from "crypto";

/**
 * Subscription registry for the Charon webhook hub.
 *
 * Nomba can only POST to a single webhook URL, so the site is the one receiver.
 * Each Zap that uses a real-time Charon trigger registers its own delivery URL
 * (`targetUrl`) here via `POST /api/subscriptions`; when a verified Nomba event
 * arrives we fan it out to every matching subscriber.
 *
 * The store is kept on `globalThis` so it survives Next's dev HMR and is shared
 * within a warm serverless instance. For multi-instance production, back this with
 * a shared store (Vercel KV / Upstash Redis) — the surface below is deliberately
 * small (list/add/remove) so swapping the backing store is a one-file change.
 */

export type EventKind = "payment" | "transfer";

export type Subscription = {
  id: string;
  targetUrl: string;
  event: EventKind;
  accountId?: string;
  createdAt: number;
};

type Store = Map<string, Subscription>;

const g = globalThis as unknown as { __charonSubs?: Store };
const store: Store = (g.__charonSubs ??= new Map());

export function addSubscription(input: {
  targetUrl: string;
  event: EventKind;
  accountId?: string;
}): Subscription {
  const sub: Subscription = {
    id: randomUUID(),
    targetUrl: input.targetUrl,
    event: input.event,
    accountId: input.accountId,
    createdAt: Date.now(),
  };
  store.set(sub.id, sub);
  return sub;
}

export function removeSubscription(id: string): boolean {
  return store.delete(id);
}

/** All subscribers for a given event kind (optionally scoped to one Nomba account). */
export function subscribersFor(event: EventKind, accountId?: string): Subscription[] {
  return [...store.values()].filter(
    (s) =>
      s.event === event &&
      // If the subscription was scoped to an account, only match that account.
      (!s.accountId || !accountId || s.accountId === accountId)
  );
}

export function subscriptionCount(): number {
  return store.size;
}
