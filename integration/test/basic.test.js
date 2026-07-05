'use strict';

require('should');
const nock = require('nock');
const zapier = require('zapier-platform-core');

// Point the REST-hook triggers at a stub hub so subscribe/unsubscribe can be nocked.
process.env.CHARON_HOOKS_URL = 'https://hub.test';

const App = require('../index');
const appTester = zapier.createAppTester(App);

const BASE = 'https://api.nomba.com';
const HUB = 'https://hub.test';

const authData = {
  account_id: 'ACC_TEST',
  client_id: 'CID_TEST',
  client_secret: 'SECRET_TEST',
  environment: 'live',
  // Pre-seed a token so middleware can attach it without a live exchange.
  access_token: 'TEST_ACCESS_TOKEN',
  refresh_token: 'TEST_REFRESH_TOKEN',
};

describe('Nomba Zapier integration', () => {
  afterEach(() => nock.cleanAll());

  it('exchanges credentials for an access token (session auth)', async () => {
    nock(BASE)
      .post('/v1/auth/token/issue')
      .reply(200, {
        code: '00',
        data: {
          access_token: 'NEW_ACCESS',
          refresh_token: 'NEW_REFRESH',
          expiresAt: '2026-07-01T11:00:00Z',
        },
      });

    const session = await appTester(App.authentication.sessionConfig.perform, {
      authData: {
        account_id: 'ACC_TEST',
        client_id: 'CID_TEST',
        client_secret: 'SECRET_TEST',
      },
    });

    session.should.have.property('access_token', 'NEW_ACCESS');
    session.should.have.property('refresh_token', 'NEW_REFRESH');
  });

  it('attaches Bearer token + accountId header on requests (new_payment)', async () => {
    let sawAuthHeader = null;
    let sawAccountId = null;

    nock(BASE)
      .get('/v1/transactions/accounts')
      .query(true)
      .reply(function () {
        sawAuthHeader = this.req.headers.authorization;
        sawAccountId = this.req.headers.accountid;
        return [
          200,
          {
            code: '00',
            description: 'SUCCESS',
            data: {
              results: [
                {
                  id: 'TXN_1',
                  type: 'online_checkout',
                  status: 'SUCCESS',
                  amount: '5000.00',
                  source: 'web',
                },
                {
                  id: 'TXN_2',
                  type: 'transfer',
                  status: 'SUCCESS',
                  amount: '200.00',
                },
              ],
              cursor: null,
            },
          },
        ];
      });

    const results = await appTester(
      App.triggers.new_payment.operation.performList,
      { authData }
    );

    // Only the inbound checkout payment should pass; the outbound transfer is excluded.
    results.should.have.length(1);
    results[0].should.have.property('id', 'TXN_1');
    results[0].should.have.property('amountValue', 5000);
    // nock exposes headers as strings or single-element arrays depending on version.
    String(sawAuthHeader).should.containEql('TEST_ACCESS_TOKEN');
    String(sawAccountId).should.containEql('ACC_TEST');
  });

  it('sends a bank transfer after auto-verifying the recipient name', async () => {
    nock(BASE)
      .post('/v1/transfers/bank/lookup')
      .reply(200, { data: { accountName: 'JOHN DOE' } });

    nock(BASE)
      .post('/v2/transfers/bank', (body) => body.accountName === 'JOHN DOE')
      .reply(200, {
        data: { id: 'TRF_1', status: 'SUCCESS', amount: 5000, accountName: 'JOHN DOE' },
      });

    const result = await appTester(App.creates.send_transfer.operation.perform, {
      authData,
      inputData: {
        amount: 5000,
        accountNumber: '0123456789',
        bankCode: '000013',
      },
    });

    result.should.have.property('id', 'TRF_1');
    result.should.have.property('accountName', 'JOHN DOE');
  });

  it('creates a checkout payment link', async () => {
    nock(BASE)
      .post('/v1/checkout/order')
      .reply(200, {
        code: '00',
        data: {
          success: true,
          message: 'Order created',
          checkoutLink: 'https://checkout.nomba.com/pay/abc123',
          orderReference: 'ORD-1',
        },
      });

    const result = await appTester(
      App.creates.create_payment_link.operation.perform,
      { authData, inputData: { amount: 5000, customerEmail: 'buyer@example.com' } }
    );

    result.should.have.property('checkoutLink', 'https://checkout.nomba.com/pay/abc123');
  });

  it('gets the wallet balance', async () => {
    nock(BASE)
      .get('/v1/accounts/parent/balance')
      .reply(200, {
        code: '00',
        data: { amount: '10095630.0', currency: 'NGN', timeCreated: '2026-07-01T10:00:00Z' },
      });

    const result = await appTester(App.searches.get_balance.operation.perform, {
      authData,
      inputData: { currency: 'NGN' },
    });
    result.should.have.length(1);
    result[0].should.have.property('amountValue', 10095630);
    result[0].should.have.property('currency', 'NGN');
  });

  it('buys airtime', async () => {
    nock(BASE)
      .post('/v1/bill/topup', (b) => b.network === 'MTN' && b.amount === 50)
      .reply(200, {
        code: '202',
        data: { status: 'SUCCESS', type: 'topup', amount: 50, meta: { merchantTxRef: 'AIR-1' } },
      });

    const result = await appTester(App.creates.buy_airtime.operation.perform, {
      authData,
      inputData: { amount: 50, phoneNumber: '08012345678', network: 'MTN', merchantTxRef: 'AIR-1' },
    });
    result.should.have.property('type', 'topup');
    result.should.have.property('status', 'SUCCESS');
  });

  it('creates a virtual account', async () => {
    nock(BASE)
      .post('/v1/accounts/virtual', (b) => b.accountRef === 'CUST-1')
      .reply(200, {
        code: '00',
        data: { accountRef: 'CUST-1', bankName: 'Nombank MFB', bankAccountNumber: '1611508642' },
      });

    const result = await appTester(App.creates.create_virtual_account.operation.perform, {
      authData,
      inputData: { accountRef: 'CUST-1', accountName: 'ACME Store' },
    });
    result.should.have.property('bankAccountNumber', '1611508642');
  });

  it('new_transfer surfaces only outbound successful txns', async () => {
    nock(BASE)
      .get('/v1/transactions/accounts')
      .query(true)
      .reply(200, {
        data: {
          results: [
            { id: 'T1', type: 'transfer', status: 'SUCCESS', amount: '5000.00' },
            { id: 'T2', type: 'online_checkout', status: 'SUCCESS', amount: '300.00' },
          ],
        },
      });

    const result = await appTester(App.triggers.new_transfer.operation.performList, { authData });
    result.should.have.length(1);
    result[0].should.have.property('id', 'T1');
  });

  it('surfaces Nomba error messages on failure', async () => {
    nock(BASE)
      .get('/v1/transactions/accounts')
      .query(true)
      .reply(400, { description: 'Insufficient permissions' });

    await appTester(App.triggers.new_payment.operation.performList, { authData }).should.be.rejectedWith(
      /Insufficient permissions/
    );
  });

  it('new_payment REST hook: subscribes, handles an event, and unsubscribes', async () => {
    // performSubscribe registers this Zap's delivery URL with the Charon hub.
    nock(HUB)
      .post('/api/subscriptions', (b) => b.event === 'payment' && b.targetUrl === 'https://hooks.zapier.com/abc')
      .reply(201, { id: 'sub_1' });

    const sub = await appTester(App.triggers.new_payment.operation.performSubscribe, {
      authData,
      targetUrl: 'https://hooks.zapier.com/abc',
    });
    sub.should.have.property('id', 'sub_1');

    // perform parses the delivered webhook body (no HTTP call).
    const events = await appTester(App.triggers.new_payment.operation.perform, {
      authData,
      cleanedRequest: { id: 'TXN_9', type: 'online_checkout', amount: '750.00' },
    });
    events.should.have.length(1);
    events[0].should.have.property('id', 'TXN_9');
    events[0].should.have.property('amountValue', 750);

    // performUnsubscribe removes the subscription when the Zap is turned off.
    nock(HUB).delete('/api/subscriptions/sub_1').reply(200, { deleted: true });
    const gone = await appTester(App.triggers.new_transfer.operation.performUnsubscribe, {
      authData,
      subscribeData: { id: 'sub_1' },
    });
    gone.should.have.property('deleted', true);
  });

  it('buys a data bundle', async () => {
    nock(BASE)
      .post('/v1/bill/data', (b) => b.network === 'MTN' && b.amount === 100 && b.merchantTxRef === 'DATA-1')
      .reply(200, {
        code: '00',
        data: { status: 'SUCCESS', type: 'data', amount: 100, meta: { merchantTxRef: 'DATA-1' } },
      });

    const result = await appTester(App.creates.buy_data.operation.perform, {
      authData,
      inputData: { amount: 100, phoneNumber: '08012345678', network: 'MTN', merchantTxRef: 'DATA-1' },
    });
    result.should.have.property('status', 'SUCCESS');
    result.should.have.property('type', 'data');
  });

  it('pays an electricity bill and returns the vend token', async () => {
    nock(BASE)
      .post('/v1/bill/electricity', (b) => b.disco === 'IKEDC' && b.meterType === 'PREPAID')
      .reply(200, {
        code: '00',
        data: {
          amount: 1000,
          status: 'SUCCESS',
          meta: { meterType: 'prepaid', phcnVendToken: '1234-5678', phcnVendUnits: '23.5' },
        },
      });

    const result = await appTester(App.creates.pay_electricity.operation.perform, {
      authData,
      inputData: {
        amount: 1000,
        meterNumber: '45700123456',
        disco: 'IKEDC',
        meterType: 'PREPAID',
        merchantTxRef: 'ELEC-1',
        payerName: 'ACME Store',
      },
    });
    result.should.have.property('status', 'SUCCESS');
    result.meta.should.have.property('phcnVendToken', '1234-5678');
  });

  it('refunds a payment', async () => {
    nock(BASE)
      .post('/v1/checkout/refund', (b) => b.transactionId === 'TXN_9')
      .reply(200, { code: '00', description: 'Refund Triggered', status: true });

    const result = await appTester(App.creates.refund_payment.operation.perform, {
      authData,
      inputData: { transactionId: 'TXN_9' },
    });
    result.should.have.property('transactionId', 'TXN_9');
    result.should.have.property('status');
  });
});
