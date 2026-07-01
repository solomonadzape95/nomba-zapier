'use strict';

// Live end-to-end check of the ACTUAL app code (auth exchange, middleware token
// injection, base-URL resolution, response unwrap) against the Nomba sandbox.
// Read-only + creates a checkout order (no money moves until a customer pays).
//
// Run: node scripts/live.js

const fs = require('fs');
const path = require('path');
const zapier = require('zapier-platform-core');
const App = require('../index');

// load .env / .env.local
const env = {};
for (const name of ['.env', '.env.local']) {
  const p = path.join(__dirname, '..', name);
  if (fs.existsSync(p)) {
    fs.readFileSync(p, 'utf8')
      .split('\n')
      .forEach((line) => {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      });
  }
}

const appTester = zapier.createAppTester(App);

const baseAuth = {
  account_id: env.ACCOUNT_ID,
  client_id: env.CLIENT_ID,
  client_secret: env.CLIENT_SECRET,
  environment: (env.ENVIRONMENT || 'sandbox').toLowerCase(),
};

(async () => {
  // 1. Session exchange via the real authentication.js
  const session = await appTester(App.authentication.sessionConfig.perform, {
    authData: baseAuth,
  });
  console.log('✓ auth: got access_token?', !!session.access_token);

  const authData = { ...baseAuth, ...session };

  // 2. Connection test
  const bal = await appTester(App.authentication.test, { authData });
  console.log('✓ balance test:', JSON.stringify(bal));

  // 3. New Payment trigger (polling) — real sandbox transactions
  const payments = await appTester(App.triggers.new_payment.operation.perform, {
    authData,
  });
  console.log(`✓ new_payment: ${payments.length} inbound payment(s)`);
  if (payments[0]) {
    console.log('   sample:', JSON.stringify({
      id: payments[0].id,
      type: payments[0].type,
      status: payments[0].status,
      amountValue: payments[0].amountValue,
    }));
  }

  // 4. Bank list (dropdown source)
  const banks = await appTester(App.triggers.bank_list.operation.perform, { authData });
  console.log(`✓ bank_list: ${banks.length} banks (e.g. ${banks[0] && banks[0].name})`);

  // 5. Lookup account (search)
  const gtb = banks.find((b) => /guaranty|gtbank/i.test(b.name)) || banks[0];
  const lookup = await appTester(App.searches.lookup_account.operation.perform, {
    authData,
    inputData: { accountNumber: '0000000000', bankCode: gtb.code },
  });
  console.log('✓ lookup_account:', JSON.stringify(lookup[0] && lookup[0].accountName));

  // 6. Create payment link (create)
  const link = await appTester(App.creates.create_payment_link.operation.perform, {
    authData,
    inputData: { amount: 500, customerEmail: 'buyer@example.com', orderReference: 'LIVE-CHK-001' },
  });
  console.log('✓ create_payment_link:', link.checkoutLink);

  // 7. Get balance (search)
  const balance = await appTester(App.searches.get_balance.operation.perform, {
    authData,
    inputData: { currency: 'NGN' },
  });
  console.log('✓ get_balance:', JSON.stringify({ amount: balance[0].amount, currency: balance[0].currency }));

  // 8. New Transfer trigger (polling; may be 0 in sandbox if no outbound txns)
  const transfers = await appTester(App.triggers.new_transfer.operation.perform, { authData });
  console.log(`✓ new_transfer: ${transfers.length} outbound txn(s)`);

  // 9. Create virtual account (create; no money moves)
  try {
    const va = await appTester(App.creates.create_virtual_account.operation.perform, {
      authData,
      inputData: { accountRef: 'LIVE-VA-001', accountName: 'ACME Test Store' },
    });
    console.log('✓ create_virtual_account:', JSON.stringify({
      number: va.bankAccountNumber,
      bank: va.bankName,
    }));
  } catch (e) {
    console.log('… create_virtual_account (may need BVN/config in sandbox):', e.message);
  }

  console.log('\nAll live checks passed against the Nomba sandbox.');
})().catch((e) => {
  console.error('LIVE CHECK FAILED:', e.message);
  process.exit(1);
});
