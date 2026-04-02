'use strict';

/**
 * Centralized Security Middleware Configuration
 *
 * This module imports and configures three core security middleware packages
 * for the Express.js application, reading all settings from config/security.js:
 *
 *   1. helmet   — Sets comprehensive HTTP security headers (CSP, HSTS,
 *                  X-Content-Type-Options, Cross-Origin-Opener-Policy,
 *                  Cross-Origin-Resource-Policy, Origin-Agent-Cluster,
 *                  Referrer-Policy, X-DNS-Prefetch-Control) and removes
 *                  the X-Powered-By header to prevent server fingerprinting.
 *                  Addresses OWASP A05:2021 — Security Misconfiguration.
 *
 *   2. cors     — Enforces explicit origin allowlisting for cross-origin
 *                  requests, sets Access-Control-Allow-* headers, and handles
 *                  OPTIONS preflight requests automatically. No wildcard '*'.
 *                  Addresses OWASP A01:2021 — Broken Access Control.
 *
 *   3. rateLimit — Tracks per-IP request counts using a built-in memory store,
 *                  returns 429 Too Many Requests when the configurable threshold
 *                  is exceeded, and includes draft-8 RateLimit response headers.
 *                  Addresses OWASP A04:2021 — Insecure Design.
 *
 * Middleware application order in server.js should be:
 *   helmet → cors → rate-limit
 * (helmet first so security headers are set before any response leaves)
 *
 * @module middleware/security
 * @requires helmet
 * @requires cors
 * @requires express-rate-limit
 * @requires ../config/security
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config/security');

// ---------------------------------------------------------------------------
// Helmet Middleware — HTTP Security Headers
// ---------------------------------------------------------------------------
// Configures helmet with CSP directives from config.helmetOptions.
// Helmet automatically sets:
//   - Content-Security-Policy (from directives: defaultSrc, scriptSrc, styleSrc, imgSrc)
//   - Cross-Origin-Opener-Policy: same-origin
//   - Cross-Origin-Resource-Policy: same-origin
//   - Origin-Agent-Cluster: ?1
//   - Referrer-Policy: no-referrer
//   - Strict-Transport-Security: max-age=15552000; includeSubDomains
//   - X-Content-Type-Options: nosniff
//   - X-DNS-Prefetch-Control: off
// Helmet also removes the X-Powered-By header and disables X-XSS-Protection.
const helmetMiddleware = helmet(config.helmetOptions);

// ---------------------------------------------------------------------------
// CORS Middleware — Cross-Origin Resource Sharing Policy
// ---------------------------------------------------------------------------
// Configures cors with explicit origin allowlisting from config.corsOptions.
// Does NOT use wildcard '*' — only origins in the allowlist receive
// Access-Control-Allow-Origin headers. Preflight OPTIONS requests are
// handled automatically by the cors package.
const corsMiddleware = cors(config.corsOptions);

// ---------------------------------------------------------------------------
// Rate Limit Middleware — Request Throttling
// ---------------------------------------------------------------------------
// Configures express-rate-limit with settings from config.rateLimitOptions.
// Uses the built-in memory store for per-IP request counting.
// Returns 429 Too Many Requests when the configured limit is exceeded.
// Includes draft-8 RateLimit response headers per IETF specification.
const rateLimitMiddleware = rateLimit(config.rateLimitOptions);

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware
};
