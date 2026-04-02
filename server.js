'use strict';

/**
 * server.js — Express.js Application with Security Middleware
 *
 * Migrated from bare Node.js http.createServer() to Express 4.21.2 with
 * comprehensive OWASP-aligned security hardening:
 *
 *   - Helmet 8.1.0     — HTTP security headers (CSP, HSTS, X-Content-Type-Options,
 *                         Cross-Origin-Opener-Policy, etc.) and X-Powered-By removal
 *   - CORS 2.8.6       — Explicit origin allowlisting with preflight handling
 *   - Rate Limiting 8.3.2 — Per-IP request throttling with draft-8 RateLimit headers
 *   - Express-Validator 7.3.1 — Input validation/sanitization (available for routes)
 *   - HTTPS/TLS        — Optional TLS-encrypted server via Node.js built-in https module
 *
 * Backward compatibility preserved:
 *   GET / → 200 OK, Content-Type: text/plain, body: "Hello, World!\n"
 *
 * The Express app is exported via module.exports for supertest-based testing.
 * HTTP/HTTPS servers only start when the file is executed directly
 * (guarded by require.main === module).
 *
 * @module server
 * @requires express
 * @requires https
 * @requires fs
 * @requires path
 * @requires ./middleware/security
 * @requires ./middleware/validation
 * @requires ./config/security
 */

// ---------------------------------------------------------------------------
// External Dependencies
// ---------------------------------------------------------------------------

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Internal Dependencies
// ---------------------------------------------------------------------------

const {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware
} = require('./middleware/security');

const { handleValidationErrors } = require('./middleware/validation');
const config = require('./config/security');

// ---------------------------------------------------------------------------
// Express Application Setup
// ---------------------------------------------------------------------------

const app = express();

// ---------------------------------------------------------------------------
// Body Parsers — Parse incoming request bodies before security middleware
// ---------------------------------------------------------------------------
// express.json() parses application/json bodies (default 100kb limit)
// express.urlencoded() parses application/x-www-form-urlencoded bodies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Security Middleware Stack (applied in strict order)
// ---------------------------------------------------------------------------
// 1. Helmet — Sets security headers on EVERY response before it leaves
// 2. CORS   — Applies cross-origin access control headers
// 3. Rate Limit — Throttles per-IP request volume

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);

// ---------------------------------------------------------------------------
// Route Definitions
// ---------------------------------------------------------------------------

/**
 * GET / — Root endpoint preserving original server behavior.
 * Responds with 200 OK, Content-Type: text/plain, and "Hello, World!\n".
 *
 * The handleValidationErrors middleware is not applied to this route because
 * GET / accepts no user input. It is available for future routes that
 * require input validation (e.g., POST endpoints with body data).
 */
app.get('/', (req, res) => {
  res.type('text').send('Hello, World!\n');
});

// ---------------------------------------------------------------------------
// Server Bootstrap (only when executed directly, not when imported for tests)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const hostname = config.hostname;
  const port = config.port;
  const httpsPort = config.httpsPort;

  // Start HTTP server — preserves original binding to 127.0.0.1:3000
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  // Conditionally start HTTPS server if TLS certificates are available
  const certPath = path.resolve(config.tlsOptions.certPath);
  const keyPath = path.resolve(config.tlsOptions.keyPath);

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const tlsCredentials = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };

    https.createServer(tlsCredentials, app).listen(httpsPort, hostname, () => {
      console.log(`HTTPS Server running at https://${hostname}:${httpsPort}/`);
    });
  }
}

// ---------------------------------------------------------------------------
// Module Export — Express app instance for supertest and external consumers
// ---------------------------------------------------------------------------

module.exports = app;
