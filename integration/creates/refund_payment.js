'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Create: Refund Payment.
// Refunds a completed checkout payment back to the customer — powers "order
// cancelled → auto-refund" workflows.
// Endpoint: POST /v1/checkout/refund  (verified against the Nomba sandbox → 200
// "Refund Triggered")
//   body: { transactionId, amount? }   (partial refund when amount is supplied)

const perform = async (z, bundle) => {
  const body = { transactionId: bundle.inputData.transactionId };
  if (bundle.inputData.amount != null && bundle.inputData.amount !== '') {
    body.amount = Number(bundle.inputData.amount);
  }

  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/checkout/refund`,
    method: 'POST',
    body,
  });

  const data = unwrap(response) || {};
  // Nomba returns { status: true, description: "Refund Triggered" } — surface the
  // human-readable description rather than the raw boolean.
  return {
    transactionId: bundle.inputData.transactionId,
    ...data,
    status: data.description || (data.status === true ? 'Refund Triggered' : data.status),
  };
};

module.exports = {
  key: 'refund_payment',
  noun: 'Refund',
  display: {
    label: 'Refund Payment',
    description:
      'Refunds a completed Nomba checkout payment to the customer (full or partial).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'transactionId',
        label: 'Transaction ID',
        type: 'string',
        required: true,
        // Offer recent payments as a dropdown; users can still map a custom value
        // (e.g. the ID from the trigger step in the same Zap).
        dynamic: 'new_payment.id.amount',
        helpText:
          'The payment to refund — pick a recent one, or map the ID from the New Payment Received trigger.',
      },
      {
        key: 'amount',
        label: 'Amount (NGN)',
        type: 'number',
        required: false,
        helpText: 'Leave blank for a full refund, or set an amount for a partial refund.',
      },
    ],
    sample: {
      transactionId: 'TXN_123456789',
      status: 'Refund Triggered',
    },
    outputFields: [
      { key: 'transactionId', label: 'Transaction ID' },
      { key: 'status', label: 'Status' },
    ],
  },
};
