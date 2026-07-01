'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Search: Lookup Bank Account.
//
// Resolves the account holder's name for a given account number + bank code via
// Nomba's name-enquiry endpoint. Used standalone (verify before paying) and as a
// building block by the Send Bank Transfer create.

const performLookup = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/transfers/bank/lookup`,
    method: 'POST',
    body: {
      accountNumber: bundle.inputData.accountNumber,
      bankCode: bundle.inputData.bankCode,
    },
  });

  const data = unwrap(response) || {};
  return [
    {
      id: `${bundle.inputData.bankCode}-${bundle.inputData.accountNumber}`,
      accountNumber: bundle.inputData.accountNumber,
      bankCode: bundle.inputData.bankCode,
      accountName: data.accountName || data.name || data.beneficiaryName,
      ...data,
    },
  ];
};

module.exports = {
  key: 'lookup_account',
  noun: 'Bank Account',
  display: {
    label: 'Lookup Bank Account',
    description:
      'Verifies a Nigerian bank account number and returns the account holder name.',
  },
  operation: {
    perform: performLookup,
    inputFields: [
      {
        key: 'accountNumber',
        label: 'Account Number',
        type: 'string',
        required: true,
        helpText: '10-digit NUBAN account number.',
      },
      {
        key: 'bankCode',
        label: 'Bank Code',
        type: 'string',
        required: true,
        dynamic: 'bank_list.code.name',
        helpText: 'The recipient bank.',
      },
    ],
    sample: {
      id: '000013-0123456789',
      accountNumber: '0123456789',
      bankCode: '000013',
      accountName: 'JOHN DOE',
    },
    outputFields: [
      { key: 'accountName', label: 'Account Name' },
      { key: 'accountNumber', label: 'Account Number' },
      { key: 'bankCode', label: 'Bank Code' },
    ],
  },
};
