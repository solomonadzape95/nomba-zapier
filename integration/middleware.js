'use strict';

// Request/response middleware applied to every z.request call in the app.

// beforeRequest: attach the bearer access token and the accountId header that
// Nomba requires on every authenticated call. Requests that opt out via
// `skipHttpMiddleware: true` (e.g. the token-issue call itself) are left alone.
const includeBearerToken = (request, z, bundle) => {
  if (request.skipHttpMiddleware) {
    return request;
  }
  if (bundle.authData && bundle.authData.access_token) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
    if (bundle.authData.account_id) {
      request.headers.accountId = bundle.authData.account_id;
    }
  }
  return request;
};

// afterResponse: when Nomba rejects an expired/invalid token with 401, signal
// Zapier to refresh the session (re-run sessionConfig.perform) and retry once.
const handleAuthError = (response, z) => {
  if (response.status === 401) {
    throw new z.errors.RefreshAuthError();
  }
  return response;
};

// afterResponse: surface Nomba's own error messages instead of a bare status
// code, so users see actionable errors (e.g. "insufficient funds").
const handleApiError = (response, z) => {
  if (response.status >= 400) {
    let message = `Nomba API error (HTTP ${response.status}).`;
    try {
      const body = response.json || JSON.parse(response.content || '{}');
      // Nomba reports validation failures in different shapes: a `description`
      // string, a `message`/`error`, or an `errors` array (e.g. 422s).
      const fromErrors = Array.isArray(body.errors) ? body.errors.join(', ') : null;
      message =
        (body && (body.description || body.message || body.error || fromErrors)) ||
        message;
    } catch (e) {
      // non-JSON body; keep the default message
    }
    throw new z.errors.Error(message, 'NombaApiError', response.status);
  }
  return response;
};

module.exports = {
  befores: [includeBearerToken],
  // Order matters: check auth (401 -> refresh) before generic error handling.
  afters: [handleAuthError, handleApiError],
};
