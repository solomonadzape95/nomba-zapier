'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Trigger: New Payment Received.
//
// Implemented as a POLLING trigger against Nomba's transaction history — it works
// in both sandbox and live and needs no webhook registration. Zapier dedupes on
// the `id` field, so returning the most recent page each poll is correct.
//
// We surface inbound, successful transactions (money received): checkout payments
// and virtual-account inflows. Outbound transfers are handled by new_transfer.

const perform = async (z, bundle) => {
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
      'Triggers when your Nomba account receives a successful payment (checkout or virtual-account inflow).',
  },
  operation: {
    type: 'polling',
    perform,
    // Sample used by Zapier to build downstream field mappings before a real poll.
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
