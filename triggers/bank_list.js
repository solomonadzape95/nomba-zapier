'use strict';

const { getBaseUrl, unwrap } = require('../constants');

// Hidden trigger that powers the "Bank" dropdown used by transfer/lookup actions.
// Not shown to users as a standalone trigger (display.hidden = true).

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/transfers/banks`,
    method: 'GET',
  });

  const data = unwrap(response) || {};
  const banks = Array.isArray(data) ? data : data.banks || data.results || [];

  return banks.map((b) => ({
    id: b.code || b.bankCode,
    code: b.code || b.bankCode,
    name: b.name || b.bankName,
  }));
};

module.exports = {
  key: 'bank_list',
  noun: 'Bank',
  display: {
    label: 'Bank List',
    description: 'Internal list of supported banks for dropdowns.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    canPaginate: false,
    sample: { id: '000013', code: '000013', name: 'Guaranty Trust Bank' },
  },
};
