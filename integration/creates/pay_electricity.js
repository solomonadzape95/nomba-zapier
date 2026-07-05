'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Create: Pay Electricity Bill.
// Pays a prepaid or postpaid electricity bill and (for prepaid) returns the vend
// token the customer punches into their meter.
// Endpoint: POST /v1/bill/electricity  (verified against the Nomba sandbox → 200)
//   body: { amount, customerId, disco, meterType, merchantTxRef, payerName }
//   -> data: { amount, status, meta: { meterType, phcnVendToken, phcnVendUnits, rrn, ... } }

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/bill/electricity`,
    method: 'POST',
    body: {
      amount: Number(bundle.inputData.amount),
      customerId: bundle.inputData.meterNumber,
      disco: bundle.inputData.disco,
      meterType: bundle.inputData.meterType,
      merchantTxRef: bundle.inputData.merchantTxRef,
      payerName: bundle.inputData.payerName,
    },
  });
  return unwrap(response) || {};
};

module.exports = {
  key: 'pay_electricity',
  noun: 'Electricity Bill',
  display: {
    label: 'Pay Electricity Bill',
    description:
      'Pays a prepaid or postpaid electricity bill from your Nomba balance; returns the prepaid vend token.',
  },
  operation: {
    perform,
    inputFields: [
      { key: 'amount', label: 'Amount (NGN)', type: 'number', required: true },
      {
        key: 'meterNumber',
        label: 'Meter Number',
        type: 'string',
        required: true,
        helpText: 'The customer meter / account number.',
      },
      {
        key: 'disco',
        label: 'Distribution Company',
        type: 'string',
        required: true,
        helpText: 'The electricity provider, e.g. IKEDC, EKEDC, AEDC, PHED, KEDCO.',
      },
      {
        key: 'meterType',
        label: 'Meter Type',
        type: 'string',
        required: true,
        choices: { PREPAID: 'Prepaid', POSTPAID: 'Postpaid' },
      },
      {
        key: 'merchantTxRef',
        label: 'Reference',
        type: 'string',
        required: true,
        helpText: 'Your unique reference for this payment.',
      },
      { key: 'payerName', label: 'Payer Name', type: 'string', required: true },
    ],
    sample: {
      amount: 1000,
      status: 'SUCCESS',
      meta: {
        meterType: 'prepaid',
        phcnVendToken: '1234-5678-9098-7654-3212',
        phcnVendUnits: '23.5',
        rrn: '260705121555',
        merchantTxRef: 'ELEC-0001',
      },
      timeCreated: '2026-07-01T10:30:00Z',
    },
    outputFields: [
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'meta__phcnVendToken', label: 'Vend Token' },
      { key: 'meta__phcnVendUnits', label: 'Units' },
      { key: 'meta__rrn', label: 'RRN' },
      { key: 'meta__merchantTxRef', label: 'Reference' },
    ],
  },
};
