'use strict';

const { getBaseUrl, getHooksBase, unwrap } = require('../constants');

// Trigger: New Payment Received.
//
// REST HOOK with a polling fallback. Real-time delivery works like this:
//   Nomba → (single webhook) → Charon website /api/webhooks/nomba (verifies the
//   signature) → fans the event out to every Zap's `targetUrl` registered here.
//
// `performSubscribe`/`performUnsubscribe` register/unregister this Zap's hook URL
// with the Charon hub. `perform` handles the delivered event. `performList` is the
// polling path Zapier uses for the "test trigger" step and as a safety net — it
// hits Nomba's transaction history directly, so the trigger still works even if
// no webhook is configured on the Nomba dashboard.
//
// We surface inbound, successful transactions (money received): checkout payments
// and virtual-account inflows. Outbound transfers are handled by new_transfer.

const EVENT = 'payment';

// Register this Zap's delivery URL with the Charon webhook hub (the website).
const subscribe = async (z, bundle) => {
  const response = await z.request({
    url: `${getHooksBase()}/api/subscriptions`,
    method: 'POST',
    body: {
      targetUrl: bundle.targetUrl,
      event: EVENT,
      accountId: bundle.authData.account_id,
    },
    // This call goes to Charon's own hub, not Nomba — don't attach the Nomba token.
    skipHttpMiddleware: true,
  });
  return unwrap(response) || response.data;
};

// Remove this Zap's subscription when the Zap is turned off / deleted.
const unsubscribe = async (z, bundle) => {
  const id = bundle.subscribeData && bundle.subscribeData.id;
  const response = await z.request({
    url: `${getHooksBase()}/api/subscriptions/${id}`,
    method: 'DELETE',
    skipHttpMiddleware: true,
  });
  return unwrap(response) || response.data;
};

// Handle a real-time event delivered by the hub. The hub already normalises the
// payload to the same shape performList returns, so downstream field mappings are
// identical whether the Zap fired from a webhook or a poll.
const perform = (z, bundle) => {
  const p = bundle.cleanedRequest || {};
  return [
    {
      ...p,
      id: p.id || p.transactionId || p.merchantTxRef || p.orderReference,
      amountValue:
        p.amountValue != null
          ? p.amountValue
          : p.amount != null
            ? Number(p.amount)
            : undefined,
    },
  ];
};

// Polling fallback + "test trigger" source: pull recent inbound payments directly.
const performList = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/transactions/accounts`,
    method: 'GET',
    params: {
      limit: 50,
      // Nomba returns most-recent first; no cursor => first (newest) page.
    },
  });

  const data = unwrap(response) || {};
  const results = Array.isArray(data) ? data : data.results || data.transactions || [];

  // Transaction `type` values that represent money RECEIVED (verified against
  // sandbox: checkout payments report as "online_checkout"). Outbound transfers,
  // bills and payouts are excluded (handled by the New Transfer trigger).
  const INBOUND_TYPES = ['online_checkout', 'checkout', 'virtual_account', 'collection'];
  const INBOUND_KEYWORDS = ['credit', 'inflow', 'deposit', 'checkout', 'collection', 'virtual'];

  const isInbound = (t) => {
    const type = String(t.type || '').toLowerCase();
    const status = String(t.status || '').toLowerCase();
    const succeeded = ['success', 'successful', 'completed', 'paid'].includes(status);
    const inbound =
      INBOUND_TYPES.includes(type) ||
      INBOUND_KEYWORDS.some((k) => type.includes(k));
    return succeeded && inbound;
  };

  return results.filter(isInbound).map((t) => ({
    // Zapier requires a stable `id` for dedupe.
    id: t.id || t.transactionId || t.merchantTxRef || t.orderReference,
    ...t,
    // Normalise the string amount to a number for downstream math/formatting.
    amountValue: t.amount != null ? Number(t.amount) : undefined,
  }));
};

module.exports = {
  key: 'new_payment',
  noun: 'Payment',
  display: {
    label: 'New Payment Received',
    description:
      'Triggers when your Nomba account receives a successful payment (checkout or virtual-account inflow). Real-time via webhook, with automatic polling fallback.',
  },
  operation: {
    type: 'hook',
    performSubscribe: subscribe,
    performUnsubscribe: unsubscribe,
    perform,
    performList,
    // Sample used by Zapier to build downstream field mappings before a real event.
    sample: {
      id: 'TXN_123456789',
      status: 'SUCCESS',
      type: 'online_checkout',
      amount: '5000.00',
      amountValue: 5000,
      currency: 'NGN',
      source: 'web',
      orderReference: 'ORD-2026-0001',
      merchantTxRef: 'ORD-2026-0001',
      customerEmail: 'buyer@example.com',
      senderName: 'JOHN DOE',
      timeCreated: '2026-07-01T10:30:00Z',
    },
    outputFields: [
      { key: 'id', label: 'Transaction ID' },
      { key: 'status', label: 'Status' },
      { key: 'type', label: 'Type' },
      { key: 'amount', label: 'Amount (raw string)' },
      { key: 'amountValue', label: 'Amount (number)', type: 'number' },
      { key: 'currency', label: 'Currency' },
      { key: 'source', label: 'Source' },
      { key: 'orderReference', label: 'Order Reference' },
      { key: 'merchantTxRef', label: 'Merchant Reference' },
      { key: 'customerEmail', label: 'Customer Email' },
      { key: 'senderName', label: 'Sender Name' },
      { key: 'timeCreated', label: 'Time Created' },
    ],
  },
};
