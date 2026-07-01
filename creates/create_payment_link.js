'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Create: Create Payment Link.
//
// Creates a Nomba online-checkout order and returns the hosted `checkoutLink`
// you can send to a customer to collect payment.
// Endpoint: POST /v1/checkout/order

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/checkout/order`,
    method: 'POST',
    body: {
      order: {
        amount: Number(bundle.inputData.amount),
        currency: bundle.inputData.currency || 'NGN',
        orderReference: bundle.inputData.orderReference,
        customerEmail: bundle.inputData.customerEmail,
        customerId: bundle.inputData.customerId,
        callbackUrl: bundle.inputData.callbackUrl,
        accountId: bundle.authData.account_id,
      },
      tokenizeCard: false,
    },
  });

  const data = unwrap(response) || {};
  return {
    checkoutLink: data.checkoutLink || data.checkout_url || data.url,
    orderReference: bundle.inputData.orderReference,
    ...data,
  };
};

module.exports = {
  key: 'create_payment_link',
  noun: 'Payment Link',
  display: {
    label: 'Create Payment Link',
    description:
      'Creates a Nomba checkout order and returns a hosted payment link to send to a customer.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'amount',
        label: 'Amount (NGN)',
        type: 'number',
        required: true,
      },
      {
        key: 'customerEmail',
        label: 'Customer Email',
        type: 'string',
        required: false,
      },
      {
        key: 'orderReference',
        label: 'Order Reference',
        type: 'string',
        required: false,
        helpText: 'Your unique reference for this order.',
      },
      {
        key: 'customerId',
        label: 'Customer ID',
        type: 'string',
        required: false,
      },
      {
        key: 'callbackUrl',
        label: 'Callback URL',
        type: 'string',
        required: false,
        helpText: 'Where to redirect the customer after payment.',
      },
      {
        key: 'currency',
        label: 'Currency',
        type: 'string',
        required: false,
        default: 'NGN',
      },
    ],
    sample: {
      checkoutLink: 'https://checkout.nomba.com/pay/abc123',
      orderReference: 'ORD-2026-0001',
      amount: 5000,
    },
    outputFields: [
      { key: 'checkoutLink', label: 'Payment Link' },
      { key: 'orderReference', label: 'Order Reference' },
    ],
  },
};
