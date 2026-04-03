'use strict';

/**
 * Rate Limiting Enforcement Tests
 *
 * Validates that the express-rate-limit@8.3.2 middleware is correctly
 * configured and enforcing per-IP request thresholds as defined in
 * config/security.js.
 *
 * Configuration under test (from config/security.js → rateLimitOptions):
 *   - windowMs:        900000 (15 minutes)
 *   - limit:           100 requests per window per IP
 *   - standardHeaders: 'draft-8' (IETF RateLimit header format)
 *   - legacyHeaders:   false (no X-RateLimit-* headers)
 *   - store:           Built-in MemoryStore (per-IP tracking)
 *
 * Security context:
 *   Addresses OWASP A04:2021 — Insecure Design by ensuring that
 *   brute-force and DDoS protection is active on all endpoints.
 *
 * NOTE: The rate limiter uses an in-memory store that persists across
 * requests within the same Jest test run. All tests in this file share
 * the same rate-limit counter because they use the same app instance.
 * Tests that verify 429 enforcement are placed at the end of the
 * describe block and send enough requests to guarantee exceeding the
 * configured limit regardless of prior test state.
 *
 * @module tests/security/test_rate_limiting
 * @requires supertest
 * @requires ../../server
 */

const request = require('supertest');
const app = require('../../server');

describe('Rate Limiting', () => {

  // -----------------------------------------------------------------------
  // Test 1: Requests under the rate limit are allowed
  // -----------------------------------------------------------------------
  test('should allow requests under the rate limit', async () => {
    const response = await request(app).get('/');

    // A single request is well under the 100-request-per-window threshold
    expect(response.status).toBe(200);
    expect(response.text).toContain('Hello, World!');
  });

  // -----------------------------------------------------------------------
  // Test 2: draft-8 RateLimit headers are present
  // -----------------------------------------------------------------------
  test('should include RateLimit headers in response', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);

    // express-rate-limit with standardHeaders: 'draft-8' sets two headers:
    //   ratelimit       — combined remaining/reset info, e.g. "limit=100, remaining=98, reset=900"
    //   ratelimit-policy — policy definition, e.g. "100;w=900"
    // Node.js normalises header names to lowercase in the response object.
    const hasRateLimitHeader =
      response.headers['ratelimit'] !== undefined ||
      response.headers['ratelimit-policy'] !== undefined;

    expect(hasRateLimitHeader).toBe(true);

    // Verify the specific draft-8 headers individually for completeness
    expect(response.headers['ratelimit']).toBeDefined();
    expect(response.headers['ratelimit-policy']).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // Test 3: Legacy X-RateLimit-* headers are NOT present
  // -----------------------------------------------------------------------
  test('should not include legacy X-RateLimit headers', async () => {
    const response = await request(app).get('/');

    // legacyHeaders: false in config/security.js disables the deprecated
    // X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset
    // headers to prevent information leakage via non-standard headers.
    expect(response.headers['x-ratelimit-limit']).toBeUndefined();
    expect(response.headers['x-ratelimit-remaining']).toBeUndefined();
    expect(response.headers['x-ratelimit-reset']).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // Test 4: Exceeding rate limit returns 429 Too Many Requests
  // -----------------------------------------------------------------------
  test('should return 429 when rate limit is exceeded', async () => {
    // The configured limit is 100 requests per 15-minute window per IP.
    // Previous tests (1–3) have already consumed 3 requests against the
    // shared in-memory counter. Sending 101 additional concurrent requests
    // guarantees the total (104) exceeds the limit, triggering 429 responses.
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(request(app).get('/'));
    }

    const responses = await Promise.all(requests);

    // At least one response must be 429 (rate limited)
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);

    // Verify the 429 status explicitly on the first rate-limited response
    const limitedResponse = rateLimited[0];
    expect(limitedResponse.status).toBe(429);
  }, 30000); // Extended timeout for bulk concurrent requests

  // -----------------------------------------------------------------------
  // Test 5: Rate limit response includes proper error message
  // -----------------------------------------------------------------------
  test('should return proper error message when rate limited', async () => {
    // After test 4, the in-memory counter has already exceeded the 100-request
    // limit. Sending 110 more requests ensures ALL responses are 429, making
    // the assertion on the error message body reliable.
    const requests = [];
    for (let i = 0; i < 110; i++) {
      requests.push(request(app).get('/'));
    }

    const responses = await Promise.all(requests);

    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);

    // express-rate-limit default message: "Too many requests, please try again later."
    if (rateLimited.length > 0) {
      expect(rateLimited[0].text).toBeDefined();
      expect(rateLimited[0].text).toContain('Too many requests');
    }
  }, 30000); // Extended timeout for bulk concurrent requests

});
