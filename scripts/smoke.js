'use strict';

// Read-only live smoke test against the Nomba sandbox.
// Loads .env, authenticates, and inspects response SHAPES (keys only, no secrets,
// no money movement) so we can confirm real field names before expanding.
//
// Run: node scripts/smoke.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// --- tiny .env loader (no dependency); prefers .env.local, falls back to .env ---
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

const { CLIENT_ID, CLIENT_SECRET, ACCOUNT_ID } = env;
const BASE =
  (env.ENVIRONMENT || '').toLowerCase() === 'sandbox'
    ? 'https://sandbox.nomba.com'
    : 'https://api.nomba.com';

if (!CLIENT_ID || !CLIENT_SECRET || !ACCOUNT_ID) {
  console.error('Missing CLIENT_ID / CLIENT_SECRET / ACCOUNT_ID in .env');
  process.exit(1);
}

function request(method, urlPath, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + urlPath);
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          accountId: ACCOUNT_ID,
          ...headers,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let json;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Print the key structure of an object without leaking values.
function shape(obj, depth = 2) {
  if (obj === null || typeof obj !== 'object') return typeof obj;
  if (Array.isArray(obj)) {
    return obj.length ? [shape(obj[0], depth - 1)] : [];
  }
  const out = {};
  for (const k of Object.keys(obj)) {
    out[k] = depth > 0 ? shape(obj[k], depth - 1) : typeof obj[k];
  }
  return out;
}

(async () => {
  console.log('1) POST /v1/auth/token/issue');
  const auth = await request('POST', '/v1/auth/token/issue', {
    body: {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    },
  });
  console.log('   status:', auth.status);
  console.log('   shape :', JSON.stringify(shape(auth.body)));

  const data = auth.body && auth.body.data ? auth.body.data : auth.body;
  const token = data && (data.access_token || data.accessToken);
  if (!token) {
    console.error('   No access token returned — stopping. Full body:', JSON.stringify(auth.body));
    process.exit(1);
  }
  const authHeader = { Authorization: `Bearer ${token}` };

  const acct = ACCOUNT_ID;
  const reads = [
    ['GET', '/v1/transfers/banks'],
    ['GET', '/v1/accounts/parent/balance'],
    ['GET', '/v1/accounts'],
    ['GET', `/v1/transactions/accounts?accountId=${acct}&limit=5`],
    ['GET', '/v1/transactions/accounts?limit=5&order=DESC'],
  ];
  for (const [method, p] of reads) {
    console.log(`\n${method} ${p.split('?')[0]}${p.includes('?') ? ' (+query)' : ''}`);
    try {
      const r = await request(method, p, { headers: authHeader });
      console.log('   status:', r.status);
      if (r.status >= 400) {
        console.log('   desc  :', r.body && r.body.description);
      } else {
        console.log('   shape :', JSON.stringify(shape(r.body, 3)));
      }
    } catch (e) {
      console.log('   error :', e.message);
    }
  }
})();
