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

// Base URL of the Charon webhook hub (the website). Nomba can only POST to a
// single webhook URL, so the site receives every event, verifies its signature,
// and fans it out to the per-Zap targetUrls registered by the REST-hook triggers.
// Overridable via env for local/preview testing; defaults to production.
const getHooksBase = () =>
  (process.env.CHARON_HOOKS_URL || 'https://paywithcharon.xyz').replace(/\/$/, '');

// Nomba wraps most responses as { code, description, data: {...} }.
// Unwrap defensively so downstream code can rely on the payload shape.
const unwrap = (response) => {
  const body = response && response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }
  return body;
};

module.exports = { BASE_URLS, getBaseUrl, getHooksBase, unwrap };
