'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Create: Buy Airtime.
// Tops up a phone number — powers "reward the customer" / bulk airtime workflows.
// Endpoint: POST /v1/bill/topup
//   body: { amount, phoneNumber, network, merchantTxRef, senderName }
//   -> data: { amount, meta: { merchantTxRef, rrn }, timeCreated, type: 'topup', status }

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/bill/topup`,
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
  key: 'buy_airtime',
  noun: 'Airtime',
  display: {
    label: 'Buy Airtime',
    description: 'Tops up a Nigerian phone number with airtime from your Nomba balance.',
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
        required: false,
        helpText: 'Your unique reference for this top-up.',
      },
      { key: 'senderName', label: 'Sender Name', type: 'string', required: false },
    ],
    sample: {
      amount: 500,
      type: 'topup',
      status: 'PROCESSING',
      meta: { merchantTxRef: 'AIR-0001', rrn: '1234567890' },
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
