'use strict';

const { getBaseUrl, unwrap, makeRef } = require('../constants');

// Create: Send Bank Transfer (payout).
//
// Optionally verifies the recipient name first (name enquiry), then initiates a
// payout via POST /v2/transfers/bank. Reuses the same lookup endpoint as the
// Lookup Bank Account search.

const performLookupName = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/transfers/bank/lookup`,
    method: 'POST',
    body: {
      accountNumber: bundle.inputData.accountNumber,
      bankCode: bundle.inputData.bankCode,
    },
  });
  const data = unwrap(response) || {};
  return data.accountName || data.name || data.beneficiaryName;
};

const perform = async (z, bundle) => {
  let accountName = bundle.inputData.accountName;

  // If the user didn't pre-fill a name and asked us to verify, resolve it.
  if (!accountName && bundle.inputData.verifyName !== false) {
    accountName = await performLookupName(z, bundle);
  }

  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v2/transfers/bank`,
    method: 'POST',
    body: {
      amount: Number(bundle.inputData.amount),
      accountNumber: bundle.inputData.accountNumber,
      accountName,
      bankCode: bundle.inputData.bankCode,
      narration: bundle.inputData.narration,
      // Nomba requires merchantTxRef; auto-generate one if the user left it blank.
      merchantTxRef: bundle.inputData.merchantTxRef || makeRef('charon-tr'),
      senderName: bundle.inputData.senderName,
    },
  });

  const data = unwrap(response) || {};
  // Surface the resolved bank name (Nomba returns it under meta) at the top level.
  if (data.meta && data.meta.bankName && !data.bankName) {
    data.bankName = data.meta.bankName;
  }
  return data;
};

module.exports = {
  key: 'send_transfer',
  noun: 'Transfer',
  display: {
    label: 'Send Bank Transfer',
    description:
      'Sends a payout from your Nomba wallet to a Nigerian bank account (with optional name verification).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'amount',
        label: 'Amount (NGN)',
        type: 'number',
        required: true,
        helpText: 'Amount to send, in Naira.',
      },
      {
        key: 'bankCode',
        label: 'Recipient Bank',
        type: 'string',
        required: true,
        dynamic: 'bank_list.code.name',
      },
      {
        key: 'accountNumber',
        label: 'Recipient Account Number',
        type: 'string',
        required: true,
        helpText: '10-digit NUBAN account number.',
      },
      {
        key: 'accountName',
        label: 'Recipient Account Name',
        type: 'string',
        required: false,
        helpText:
          'Leave blank to auto-verify via name enquiry before sending.',
      },
      {
        key: 'narration',
        label: 'Narration',
        type: 'string',
        required: false,
        helpText: 'Description shown on the transaction.',
      },
      {
        key: 'merchantTxRef',
        label: 'Reference',
        type: 'string',
        required: false,
        helpText:
          'Your unique reference for this transfer (for reconciliation). Auto-generated if left blank.',
      },
      {
        key: 'senderName',
        label: 'Sender Name',
        type: 'string',
        required: false,
      },
    ],
    sample: {
      id: 'TRF_123456789',
      status: 'SUCCESS',
      amount: 5000,
      accountNumber: '0123456789',
      accountName: 'JOHN DOE',
      bankCode: '000013',
      merchantTxRef: 'PAYOUT-0001',
    },
    outputFields: [
      { key: 'id', label: 'Transfer ID' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'accountName', label: 'Account Name' },
      { key: 'bankName', label: 'Bank Name' },
      { key: 'meta__sender_name', label: 'Sender Name' },
      { key: 'merchantTxRef', label: 'Reference' },
    ],
  },
};
