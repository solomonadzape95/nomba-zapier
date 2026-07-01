'use strict';

// Nomba API base URLs. The live and sandbox environments use the same API shape;
// which one you hit is determined by whether your API keys are live or test keys.
// If Nomba issues you a distinct sandbox host, set it here / via the auth dropdown.
const BASE_URLS = {
  live: 'https://api.nomba.com',
  sandbox: 'https://sandbox.nomba.com',
};

// Resolve the base URL for the connected account. Defaults to live.
const getBaseUrl = (bundle) => {
  const env = (bundle && bundle.authData && bundle.authData.environment) || 'live';
  return BASE_URLS[env] || BASE_URLS.live;
};

// Nomba wraps most responses as { code, description, data: {...} }.
// Unwrap defensively so downstream code can rely on the payload shape.
const unwrap = (response) => {
  const body = response && response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }
  return body;
};

module.exports = { BASE_URLS, getBaseUrl, unwrap };
