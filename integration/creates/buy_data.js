'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Create: Buy Data Bundle.
// Sends a mobile data bundle to a phone number — powers "reward the customer" and
// bulk-data workflows, alongside Buy Airtime.
// Endpoint: POST /v1/bill/data  (verified against the Nomba sandbox → 200 SUCCESS)
//   body: { amount, phoneNumber, network, merchantTxRef, senderName }
//   -> data: { amount, status, timeCreated, type, meta: { merchantTxRef, rrn, ... } }
// Nomba selects the data plan by amount+network, mirroring the airtime top-up flow.

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/bill/data`,
    method: 'POST',
    body: {
      amount: Number(bundle.inputData.amount),
      phoneNumber: bundle.inputData.phoneNumber,
      network: bundle.inputData.network,
      merchantTxRef: bundle.inputData.merchantTxRef,
      senderName: bundle.inputData.senderName,
    },
  });
  return unwrap(response) || {};
};

module.exports = {
  key: 'buy_data',
  noun: 'Data Bundle',
  display: {
    label: 'Buy Data Bundle',
    description: 'Sends a mobile data bundle to a Nigerian phone number from your Nomba balance.',
  },
  operation: {
    perform,
    inputFields: [
      { key: 'amount', label: 'Amount (NGN)', type: 'number', required: true },
      {
        key: 'phoneNumber',
        label: 'Phone Number',
        type: 'string',
        required: true,
        helpText: 'e.g. 08012345678',
      },
      {
        key: 'network',
        label: 'Network',
        type: 'string',
        required: true,
        choices: { MTN: 'MTN', AIRTEL: 'Airtel', GLO: 'Glo', '9MOBILE': '9mobile' },
      },
      {
        key: 'merchantTxRef',
        label: 'Reference',
        type: 'string',
        required: true,
        helpText: 'Your unique reference for this purchase.',
      },
      { key: 'senderName', label: 'Sender Name', type: 'string', required: false },
    ],
    sample: {
      amount: 100,
      type: 'data',
      status: 'SUCCESS',
      meta: { merchantTxRef: 'DATA-0001', rrn: '1234567890' },
      timeCreated: '2026-07-01T10:30:00Z',
    },
    outputFields: [
      { key: 'status', label: 'Status' },
      { key: 'type', label: 'Type' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'meta__merchantTxRef', label: 'Reference' },
      { key: 'meta__rrn', label: 'RRN' },
    ],
  },
};
