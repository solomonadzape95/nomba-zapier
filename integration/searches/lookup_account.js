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

  // Nomba's lookup returns only the account name, not the bank name — resolve the
  // bank name from the supported-banks list (best-effort; never fail the lookup).
  let bankName = data.bankName;
  if (!bankName && bundle.inputData.bankCode) {
    try {
      const banksResp = await z.request({
        url: `${getBaseUrl(bundle)}/v1/transfers/banks`,
        method: 'GET',
      });
      const bd = unwrap(banksResp) || {};
      const banks = Array.isArray(bd) ? bd : bd.banks || bd.results || [];
      const match = banks.find(
        (b) => String(b.code || b.bankCode) === String(bundle.inputData.bankCode)
      );
      bankName = match && (match.name || match.bankName);
    } catch (e) {
      // best-effort — leave bankName undefined if the banks call fails
    }
  }

  return [
    {
      id: `${bundle.inputData.bankCode}-${bundle.inputData.accountNumber}`,
      accountNumber: bundle.inputData.accountNumber,
      bankCode: bundle.inputData.bankCode,
      bankName,
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
      bankName: 'Guaranty Trust Bank',
      accountName: 'JOHN DOE',
    },
    outputFields: [
      { key: 'accountName', label: 'Account Name' },
      { key: 'accountNumber', label: 'Account Number' },
      { key: 'bankCode', label: 'Bank Code' },
      { key: 'bankName', label: 'Bank Name' },
    ],
  },
};
