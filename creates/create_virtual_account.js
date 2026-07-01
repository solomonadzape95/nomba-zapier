'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Create: Create Virtual Account.
// Issues a dedicated bank account number (e.g. one per customer/order) that
// routes inbound transfers to the merchant. Endpoint: POST /v1/accounts/virtual
//   body: { accountRef, accountName, bvn, expiryDate, expectedAmount }
//   -> data: { bankName, bankAccountNumber, bankAccountName, accountRef, ... }

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/accounts/virtual`,
    method: 'POST',
    body: {
      accountRef: bundle.inputData.accountRef,
      accountName: bundle.inputData.accountName,
      bvn: bundle.inputData.bvn,
      expiryDate: bundle.inputData.expiryDate,
      expectedAmount: bundle.inputData.expectedAmount
        ? Number(bundle.inputData.expectedAmount)
        : undefined,
    },
  });
  return unwrap(response) || {};
};

module.exports = {
  key: 'create_virtual_account',
  noun: 'Virtual Account',
  display: {
    label: 'Create Virtual Account',
    description:
      'Creates a dedicated virtual bank account number to receive payments (e.g. one per customer or order).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'accountRef',
        label: 'Account Reference',
        type: 'string',
        required: true,
        helpText: 'Your unique reference for this virtual account.',
      },
      {
        key: 'accountName',
        label: 'Account Name',
        type: 'string',
        required: true,
      },
      {
        key: 'bvn',
        label: 'BVN',
        type: 'string',
        required: false,
        helpText: 'Bank Verification Number, if required by your setup.',
      },
      {
        key: 'expiryDate',
        label: 'Expiry Date',
        type: 'string',
        required: false,
        helpText: 'Format: YYYY-MM-DD HH:mm:ss (e.g. 2026-12-31 23:59:00).',
      },
      {
        key: 'expectedAmount',
        label: 'Expected Amount (NGN)',
        type: 'number',
        required: false,
      },
    ],
    sample: {
      accountRef: 'CUST-0001',
      bankName: 'Nomba (Providus)',
      bankAccountNumber: '9900001234',
      bankAccountName: 'ACME STORES / JOHN DOE',
      currency: 'NGN',
    },
    outputFields: [
      { key: 'bankAccountNumber', label: 'Account Number' },
      { key: 'bankName', label: 'Bank Name' },
      { key: 'bankAccountName', label: 'Account Name' },
      { key: 'accountRef', label: 'Account Reference' },
    ],
  },
};
