'use strict';

const authentication = require('./authentication');
const middleware = require('./middleware');

// Triggers
const newPayment = require('./triggers/new_payment');
const bankList = require('./triggers/bank_list');

// Creates
const sendTransfer = require('./creates/send_transfer');
const createPaymentLink = require('./creates/create_payment_link');

// Searches
const lookupAccount = require('./searches/lookup_account');

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [...middleware.befores],
  afterResponse: [...middleware.afters],

  triggers: {
    [newPayment.key]: newPayment,
    [bankList.key]: bankList,
  },

  creates: {
    [sendTransfer.key]: sendTransfer,
    [createPaymentLink.key]: createPaymentLink,
  },

  searches: {
    [lookupAccount.key]: lookupAccount,
  },
};

module.exports = App;
