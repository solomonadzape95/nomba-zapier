'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Search: Get Wallet Balance.
// Returns the parent account's available balance.
// Endpoint (verified against sandbox): GET /v1/accounts/parent/balance
//   -> data: { amount, currency, timeCreated }

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/accounts/parent/balance`,
    method: 'GET',
  });
  const data = unwrap(response) || {};
  return [
    {
      id: `balance-${bundle.authData.account_id}`,
      amount: data.amount,
      amountValue: data.amount != null ? Number(data.amount) : undefined,
      currency: data.currency || 'NGN',
      timeCreated: data.timeCreated,
    },
  ];
};

module.exports = {
  key: 'get_balance',
  noun: 'Balance',
  display: {
    label: 'Get Wallet Balance',
    description: 'Returns the available balance of your Nomba account.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'currency',
        label: 'Currency',
        type: 'string',
        required: false,
        default: 'NGN',
        choices: { NGN: 'Naira (NGN)' },
        helpText: 'Currency of the balance to return.',
      },
    ],
    sample: {
      id: 'balance-ACC_TEST',
      amount: '10095630.0',
      amountValue: 10095630,
      currency: 'NGN',
      timeCreated: '2026-07-01T10:30:00Z',
    },
    outputFields: [
      { key: 'amount', label: 'Amount (raw string)' },
      { key: 'amountValue', label: 'Amount (number)', type: 'number' },
      { key: 'currency', label: 'Currency' },
    ],
  },
};
