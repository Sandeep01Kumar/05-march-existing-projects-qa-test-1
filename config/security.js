'use strict';

/**
 * Security Configuration Module
 *
 * Single-source-of-truth for all security parameters across the application.
 * Consumed by middleware/security.js (helmet, CORS, rate-limit middleware)
 * and server.js (TLS options, ports, hostname).
 *
 * All settings are environment-variable driven with secure defaults.
 * This module has ZERO external dependencies — pure configuration only.
 *
 * Environment Variables:
 *   CORS_ORIGINS          - Comma-separated list of allowed CORS origins
 *   RATE_LIMIT_WINDOW_MS  - Rate limit window in milliseconds
 *   RATE_LIMIT_MAX        - Maximum requests per window per IP
 *   TLS_CERT_PATH         - Path to TLS certificate PEM file
 *   TLS_KEY_PATH          - Path to TLS private key PEM file
 *   HTTPS_PORT            - HTTPS server listening port
 *   PORT                  - HTTP server listening port
 */

module.exports = {
  /**
   * CORS (Cross-Origin Resource Sharing) configuration.
   *
   * Controls which external origins are permitted to make cross-origin requests.
   * Follows the principle of least privilege — defaults to localhost only.
   *
   * @property {string[]} origin       - Allowed origins (from CORS_ORIGINS env var, comma-separated)
   * @property {string[]} methods      - Allowed HTTP methods for cross-origin requests
   * @property {string[]} allowedHeaders - Headers the client may send in cross-origin requests
   * @property {boolean}  credentials  - Whether to include credentials (cookies, auth headers)
   */
  corsOptions: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },

  /**
   * Rate Limiting configuration.
   *
   * Protects against brute-force and DDoS attacks by throttling per-IP
   * request counts within a configurable sliding window.
   *
   * @property {number}  windowMs        - Time window in milliseconds (default: 15 minutes)
   * @property {number}  limit           - Max requests per IP within the window (default: 100)
   * @property {string}  standardHeaders - RateLimit header format per IETF draft-8
   * @property {boolean} legacyHeaders   - Disable deprecated X-RateLimit-* headers
   */
  rateLimitOptions: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  },

  /**
   * Helmet.js configuration for HTTP security headers.
   *
   * Sets Content-Security-Policy directives to restrict resource loading
   * to same-origin only, mitigating XSS, clickjacking, and data injection.
   * Helmet also sets Strict-Transport-Security, X-Content-Type-Options,
   * Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy,
   * Origin-Agent-Cluster, Referrer-Policy, X-DNS-Prefetch-Control,
   * and removes X-Powered-By by default.
   *
   * @property {object} contentSecurityPolicy            - CSP configuration
   * @property {object} contentSecurityPolicy.directives - Per-resource-type CSP directives
   */
  helmetOptions: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"]
      }
    }
  },

  /**
   * TLS/HTTPS certificate configuration.
   *
   * Paths to the TLS certificate and private key files used by the HTTPS server.
   * Configurable via environment variables for production deployments;
   * defaults point to the local certs/ directory for development.
   *
   * @property {string} certPath - Absolute or relative path to the TLS certificate PEM file
   * @property {string} keyPath  - Absolute or relative path to the TLS private key PEM file
   */
  tlsOptions: {
    certPath: process.env.TLS_CERT_PATH || './certs/cert.pem',
    keyPath: process.env.TLS_KEY_PATH || './certs/key.pem'
  },

  /**
   * HTTPS server listening port.
   * Configurable via HTTPS_PORT environment variable; defaults to 3443.
   *
   * @type {number}
   */
  httpsPort: parseInt(process.env.HTTPS_PORT, 10) || 3443,

  /**
   * HTTP server listening port.
   * Configurable via PORT environment variable; defaults to 3000.
   * Preserves the original server.js binding.
   *
   * @type {number}
   */
  port: parseInt(process.env.PORT, 10) || 3000,

  /**
   * Server hostname / bind address.
   * Fixed to localhost-only binding, preserving the original server.js behavior
   * and limiting network exposure to the local machine.
   *
   * @type {string}
   */
  hostname: '127.0.0.1'
};
