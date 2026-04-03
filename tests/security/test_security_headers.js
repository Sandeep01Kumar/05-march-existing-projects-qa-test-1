'use strict';

/**
 * Security Header Validation Tests
 *
 * Validates that ALL helmet-set HTTP security headers are correctly present
 * in every response from the Express application, and verifies backward
 * compatibility — GET / still returns "Hello, World!" with 200 OK.
 *
 * Uses supertest to send HTTP requests to the Express app instance exported
 * from server.js without starting a live server.
 *
 * Helmet 8.1.0 sets the following headers by default:
 *   - Content-Security-Policy (with directives from config/security.js)
 *   - Cross-Origin-Opener-Policy: same-origin
 *   - Cross-Origin-Resource-Policy: same-origin
 *   - Origin-Agent-Cluster: ?1
 *   - Referrer-Policy: no-referrer
 *   - Strict-Transport-Security: max-age=31536000; includeSubDomains
 *   - X-Content-Type-Options: nosniff
 *   - X-DNS-Prefetch-Control: off
 *
 * Helmet REMOVES:
 *   - X-Powered-By (prevents server fingerprinting)
 *
 * Helmet DISABLES:
 *   - X-XSS-Protection (legacy header that can worsen security)
 *
 * Addresses OWASP A05:2021 — Security Misconfiguration prevention validation.
 *
 * @module tests/security/test_security_headers
 */

const request = require('supertest');
const app = require('../../server');

describe('Security Headers', () => {

  // -------------------------------------------------------------------------
  // Test 1: Backward Compatibility — GET / returns "Hello, World!" with 200 OK
  // -------------------------------------------------------------------------
  test('should return 200 OK with Hello, World! for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Hello, World!');
  });

  // -------------------------------------------------------------------------
  // Test 2: Content-Security-Policy header is set with 'self' directive
  // -------------------------------------------------------------------------
  test('should set Content-Security-Policy header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  // -------------------------------------------------------------------------
  // Test 3: Strict-Transport-Security (HSTS) header is set
  // -------------------------------------------------------------------------
  test('should set Strict-Transport-Security header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['strict-transport-security']).toBeDefined();
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });

  // -------------------------------------------------------------------------
  // Test 4: X-Content-Type-Options header is set to nosniff
  // -------------------------------------------------------------------------
  test('should set X-Content-Type-Options to nosniff', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  // -------------------------------------------------------------------------
  // Test 5: Cross-Origin-Opener-Policy header is set to same-origin
  // -------------------------------------------------------------------------
  test('should set Cross-Origin-Opener-Policy header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['cross-origin-opener-policy']).toBeDefined();
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
  });

  // -------------------------------------------------------------------------
  // Test 6: Cross-Origin-Resource-Policy header is set to same-origin
  // -------------------------------------------------------------------------
  test('should set Cross-Origin-Resource-Policy header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['cross-origin-resource-policy']).toBeDefined();
    expect(response.headers['cross-origin-resource-policy']).toBe('same-origin');
  });

  // -------------------------------------------------------------------------
  // Test 7: Referrer-Policy header is set to no-referrer
  // -------------------------------------------------------------------------
  test('should set Referrer-Policy header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['referrer-policy']).toBeDefined();
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  // -------------------------------------------------------------------------
  // Test 8: X-Powered-By header is ABSENT (server fingerprinting prevention)
  // -------------------------------------------------------------------------
  test('should NOT include X-Powered-By header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Test 9: X-DNS-Prefetch-Control header is set to off
  // -------------------------------------------------------------------------
  test('should set X-DNS-Prefetch-Control header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-dns-prefetch-control']).toBeDefined();
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
  });

  // -------------------------------------------------------------------------
  // Test 10: Response Content-Type is text/plain for GET /
  // -------------------------------------------------------------------------
  test('should return text/plain Content-Type for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-type']).toContain('text/plain');
  });

  // -------------------------------------------------------------------------
  // Test 11: All security headers present in a single comprehensive check
  // -------------------------------------------------------------------------
  test('should include all required security headers in response', async () => {
    const response = await request(app).get('/');

    // Headers that MUST be present (set by helmet 8.1.0)
    const requiredHeaders = [
      'content-security-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy',
      'referrer-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-dns-prefetch-control'
    ];

    requiredHeaders.forEach(header => {
      expect(response.headers[header]).toBeDefined();
    });

    // Headers that MUST be absent (removed by helmet for security)
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
