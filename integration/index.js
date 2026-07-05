'use strict';

const authentication = require('./authentication');
const middleware = require('./middleware');

// Triggers
const newPayment = require('./triggers/new_payment');
const newTransfer = require('./triggers/new_transfer');
const bankList = require('./triggers/bank_list');

// Creates
const sendTransfer = require('./creates/send_transfer');
const createPaymentLink = require('./creates/create_payment_link');
const buyAirtime = require('./creates/buy_airtime');
const buyData = require('./creates/buy_data');
const payElectricity = require('./creates/pay_electricity');
const refundPayment = require('./creates/refund_payment');
const createVirtualAccount = require('./creates/create_virtual_account');

// Searches
const lookupAccount = require('./searches/lookup_account');
const getBalance = require('./searches/get_balance');

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [...middleware.befores],
  afterResponse: [...middleware.afters],

  triggers: {
    [newPayment.key]: newPayment,
    [newTransfer.key]: newTransfer,
    [bankList.key]: bankList,
  },

  creates: {
    [sendTransfer.key]: sendTransfer,
    [createPaymentLink.key]: createPaymentLink,
    [buyAirtime.key]: buyAirtime,
    [buyData.key]: buyData,
    [payElectricity.key]: payElectricity,
    [refundPayment.key]: refundPayment,
    [createVirtualAccount.key]: createVirtualAccount,
  },

  searches: {
    [lookupAccount.key]: lookupAccount,
    [getBalance.key]: getBalance,
  },
};

module.exports = App;
