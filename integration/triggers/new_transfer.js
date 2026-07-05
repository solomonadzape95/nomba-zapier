'use strict';

const { getBaseUrl, getHooksBase, unwrap } = require('../constants');

// Trigger: New Transfer/Payout Completed.
//
// REST HOOK with a polling fallback (see new_payment.js for the full picture of how
// the Charon website fans verified Nomba webhooks out to each Zap's targetUrl).
// Covers successful OUTBOUND money movement — bank transfers, payouts and bill
// payments (airtime/data/electricity). Complements new_payment (inbound money).

const EVENT = 'transfer';

const subscribe = async (z, bundle) => {
  const response = await z.request({
    url: `${getHooksBase()}/api/subscriptions`,
    method: 'POST',
    body: {
      targetUrl: bundle.targetUrl,
      event: EVENT,
      accountId: bundle.authData.account_id,
    },
    skipHttpMiddleware: true,
  });
  return unwrap(response) || response.data;
};

const unsubscribe = async (z, bundle) => {
  const id = bundle.subscribeData && bundle.subscribeData.id;
  const response = await z.request({
    url: `${getHooksBase()}/api/subscriptions/${id}`,
    method: 'DELETE',
    skipHttpMiddleware: true,
  });
  return unwrap(response) || response.data;
};

const perform = (z, bundle) => {
  const p = bundle.cleanedRequest || {};
  return [
    {
      ...p,
      id: p.id || p.transactionId || p.merchantTxRef,
      amountValue:
        p.amountValue != null
          ? p.amountValue
          : p.amount != null
            ? Number(p.amount)
            : undefined,
    },
  ];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/transactions/accounts`,
    method: 'GET',
    params: { limit: 50 },
  });

  const data = unwrap(response) || {};
  const results = Array.isArray(data) ? data : data.results || data.transactions || [];

  const OUTBOUND_KEYWORDS = ['transfer', 'payout', 'topup', 'bill', 'withdraw', 'disburse', 'debit'];

  const isOutbound = (t) => {
    const type = String(t.type || '').toLowerCase();
    const status = String(t.status || '').toLowerCase();
    const succeeded = ['success', 'successful', 'completed', 'paid'].includes(status);
    return succeeded && OUTBOUND_KEYWORDS.some((k) => type.includes(k));
  };

  return results.filter(isOutbound).map((t) => ({
    id: t.id || t.transactionId || t.merchantTxRef,
    ...t,
    amountValue: t.amount != null ? Number(t.amount) : undefined,
  }));
};

module.exports = {
  key: 'new_transfer',
  noun: 'Transfer',
  display: {
    label: 'New Transfer or Payout',
    description:
      'Triggers when an outbound transfer, payout or bill payment completes successfully. Real-time via webhook, with automatic polling fallback.',
  },
  operation: {
    type: 'hook',
    performSubscribe: subscribe,
    performUnsubscribe: unsubscribe,
    perform,
    performList,
    sample: {
      id: 'TRF_123456789',
      type: 'transfer',
      status: 'SUCCESS',
      amount: '5000.00',
      amountValue: 5000,
      currency: 'NGN',
      merchantTxRef: 'PAYOUT-0001',
      senderName: 'ACME STORES',
      timeCreated: '2026-07-01T10:30:00Z',
    },
    outputFields: [
      { key: 'id', label: 'Transaction ID' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount (raw string)' },
      { key: 'amountValue', label: 'Amount (number)', type: 'number' },
      { key: 'merchantTxRef', label: 'Reference' },
      { key: 'timeCreated', label: 'Time Created' },
    ],
  },
};
