'use strict';

const { getBaseUrl, unwrap } = require('./constants');

// Session Auth for Nomba.
//
// Nomba uses an OAuth2 client-credentials flow:
//   POST /v1/auth/token/issue
//     headers: { accountId }
//     body:    { grant_type: 'client_credentials', client_id, client_secret }
//   -> { access_token, refresh_token, expiresAt }
//
// Zapier's Session Auth model asks the user for long-lived credentials
// (client_id / client_secret / account_id), then calls `sessionConfig.perform`
// to exchange them for a short-lived access token. The token is stored in
// `bundle.authData` and injected on every request by middleware. On a 401 the
// middleware throws RefreshAuthError, prompting Zapier to re-run this exchange.

const getSessionKey = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/auth/token/issue`,
    method: 'POST',
    headers: {
      accountId: bundle.authData.account_id,
      'Content-Type': 'application/json',
    },
    body: {
      grant_type: 'client_credentials',
      client_id: bundle.authData.client_id,
      client_secret: bundle.authData.client_secret,
    },
    // This request must not run the auth middleware (no token exists yet).
    skipHttpMiddleware: true,
  });

  const data = unwrap(response) || {};
  const accessToken = data.access_token || data.accessToken;
  const refreshToken = data.refresh_token || data.refreshToken;

  if (!accessToken) {
    throw new z.errors.Error(
      'Could not obtain an access token from Nomba. Check your Client ID, Client Secret and Account ID.',
      'AuthenticationError',
      response.status
    );
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

// Connection test — cheap authenticated call that confirms the credentials work
// and gives Zapier a label for the connected account.
const test = async (z, bundle) => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/v1/accounts/parent/balance`,
    method: 'GET',
  });
  return unwrap(response) || {};
};

module.exports = {
  type: 'session',

  sessionConfig: {
    perform: getSessionKey,
  },

  fields: [
    {
      key: 'account_id',
      label: 'Account ID',
      type: 'string',
      required: true,
      helpText:
        'Your Nomba **parent Account ID** (Dashboard → Settings → API Keys).',
    },
    {
      key: 'client_id',
      label: 'Client ID',
      type: 'string',
      required: true,
      helpText: 'Your Nomba API **Client ID** (Dashboard → Settings → API Keys).',
    },
    {
      key: 'client_secret',
      label: 'Client Secret',
      type: 'password',
      required: true,
      helpText:
        'Your Nomba API **Client Secret** (Dashboard → Settings → API Keys). Kept encrypted by Zapier.',
    },
    {
      key: 'environment',
      label: 'Environment',
      type: 'string',
      required: false,
      default: 'live',
      choices: { live: 'Live', sandbox: 'Sandbox' },
      helpText: 'Use **Sandbox** with test keys, **Live** with production keys.',
    },
  ],

  test,

  // Shown on the connected-account label in the Zap editor.
  connectionLabel: '{{bundle.authData.account_id}}',
};
