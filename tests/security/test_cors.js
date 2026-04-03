'use strict';

/**
 * CORS Policy Validation Tests
 *
 * Verifies that the CORS (Cross-Origin Resource Sharing) middleware is
 * correctly configured and enforcing origin-based access control on every
 * response from the Express application.
 *
 * CORS configuration under test (from config/security.js):
 *   - Allowed origins : ['http://localhost:3000']
 *   - Allowed methods : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
 *   - Allowed headers : ['Content-Type', 'Authorization']
 *   - Credentials     : true
 *
 * Middleware under test: cors@2.8.6 configured in middleware/security.js
 * via corsMiddleware = cors(config.corsOptions).
 *
 * Security context:
 *   OWASP A01:2021 — Broken Access Control prevention
 *   No wildcard '*' — only explicit origin allowlisting is used
 *
 * @module tests/security/test_cors
 * @requires supertest
 * @requires ../../server
 */

const request = require('supertest');
const app = require('../../server');

describe('CORS Policy', () => {
  // -------------------------------------------------------------------------
  // Test 1: Allowed origin receives Access-Control-Allow-Origin header
  // -------------------------------------------------------------------------
  test('should set Access-Control-Allow-Origin for allowed origin', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');

    // The CORS middleware must reflect the allowed origin back in the header
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  // -------------------------------------------------------------------------
  // Test 2: Disallowed origin does NOT receive Access-Control-Allow-Origin
  // -------------------------------------------------------------------------
  test('should not set Access-Control-Allow-Origin for disallowed origin', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://evil.com');

    // Non-allowlisted origins must NOT receive the Access-Control-Allow-Origin
    // header, confirming that no wildcard '*' is in use
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Test 3: Preflight OPTIONS request returns correct CORS headers
  // -------------------------------------------------------------------------
  test('should handle preflight OPTIONS request with correct CORS headers', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');

    // cors@2.8.6 responds to preflight with status 204 (No Content) by default
    expect(response.status).toBe(204);

    // The allowed origin must be reflected in the preflight response
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');

    // The preflight response must advertise which methods are allowed
    expect(response.headers['access-control-allow-methods']).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Test 4: Preflight response includes all configured allowed methods
  // -------------------------------------------------------------------------
  test('should include allowed methods in preflight response', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'PUT');

    const allowedMethods = response.headers['access-control-allow-methods'];
    expect(allowedMethods).toBeDefined();

    // Configured methods from config/security.js:
    //   ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    expect(allowedMethods).toContain('GET');
    expect(allowedMethods).toContain('POST');
    expect(allowedMethods).toContain('PUT');
    expect(allowedMethods).toContain('DELETE');
    expect(allowedMethods).toContain('OPTIONS');
  });

  // -------------------------------------------------------------------------
  // Test 5: CORS allows credentials (cookies, auth headers)
  // -------------------------------------------------------------------------
  test('should include Access-Control-Allow-Credentials header', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');

    // credentials: true in corsOptions must produce this header so that
    // browsers include cookies and Authorization headers in cross-origin requests
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  // -------------------------------------------------------------------------
  // Test 6: Request without Origin header (same-origin simulation)
  // -------------------------------------------------------------------------
  test('should handle request without Origin header', async () => {
    const response = await request(app).get('/');

    // Same-origin requests (no Origin header) must not be blocked
    expect(response.status).toBe(200);
    expect(response.text).toContain('Hello, World!');
  });

  // -------------------------------------------------------------------------
  // Test 7: Disallowed origin preflight is rejected
  // -------------------------------------------------------------------------
  test('should not set CORS headers for disallowed origin preflight', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://malicious-site.com')
      .set('Access-Control-Request-Method', 'POST');

    // A preflight request from a non-allowlisted origin must NOT receive
    // the Access-Control-Allow-Origin header, preventing cross-origin abuse
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
