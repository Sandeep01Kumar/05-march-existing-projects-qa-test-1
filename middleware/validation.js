'use strict';

/**
 * middleware/validation.js — Input Validation and Sanitization Middleware
 *
 * Provides reusable input validation and sanitization middleware using
 * express-validator@7.3.1. Addresses OWASP A03:2021 — Injection prevention
 * by sanitizing request body fields, query parameters, and enforcing
 * Content-Type headers on body-carrying HTTP methods.
 *
 * Exports:
 *   - handleValidationErrors: Express middleware that extracts validation
 *     errors and returns a structured 400 JSON response when validation fails.
 *   - sanitizeBody: Array of validation chains that trim and HTML-escape
 *     all body fields to prevent XSS.
 *   - sanitizeQuery: Array of validation chains that trim and HTML-escape
 *     all query parameters to prevent XSS.
 *   - validateContentType: Express middleware that enforces the presence of
 *     a Content-Type header on POST, PUT, and PATCH requests.
 *
 * Usage with Express 4.21.2:
 *   const { handleValidationErrors, sanitizeBody, validateContentType } = require('./middleware/validation');
 *   app.post('/route', validateContentType, ...sanitizeBody, handleValidationErrors, handler);
 */

const { body, query, validationResult } = require('express-validator');

// ---------------------------------------------------------------------------
// handleValidationErrors — Validation Error Handling Middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware that checks for validation errors accumulated by
 * preceding express-validator chains. If errors exist, responds immediately
 * with HTTP 400 and a structured JSON error payload. If no errors are found,
 * passes control to the next middleware/route handler.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// sanitizeBody — Body Field Sanitization Chain
// ---------------------------------------------------------------------------

/**
 * Reusable validation chain array that trims leading/trailing whitespace
 * and escapes HTML entities (< > & ' " /) in ALL body fields. This prevents
 * stored XSS when body content is later rendered in HTML contexts.
 *
 * Usage: app.post('/route', ...sanitizeBody, handleValidationErrors, handler);
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const sanitizeBody = [
  body('*').trim().escape()
];

// ---------------------------------------------------------------------------
// sanitizeQuery — Query Parameter Sanitization Chain
// ---------------------------------------------------------------------------

/**
 * Reusable validation chain array that trims leading/trailing whitespace
 * and escapes HTML entities in ALL query string parameters. This prevents
 * reflected XSS when query values are echoed back in responses.
 *
 * Usage: app.get('/search', ...sanitizeQuery, handleValidationErrors, handler);
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const sanitizeQuery = [
  query('*').trim().escape()
];

// ---------------------------------------------------------------------------
// validateContentType — Content-Type Header Enforcement Middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware that enforces the presence of a Content-Type header on
 * HTTP methods that typically carry a request body (POST, PUT, PATCH).
 * Requests using GET, DELETE, OPTIONS, or HEAD bypass this check since they
 * are not expected to include a body.
 *
 * Rejecting body-carrying requests without Content-Type prevents ambiguous
 * parsing and potential content-type confusion attacks.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
const validateContentType = (req, res, next) => {
  if (
    req.method !== 'GET' &&
    req.method !== 'DELETE' &&
    req.method !== 'OPTIONS' &&
    req.method !== 'HEAD'
  ) {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      return res.status(400).json({
        status: 'error',
        message: 'Content-Type header is required for this request method'
      });
    }
  }
  next();
};

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  handleValidationErrors,
  sanitizeBody,
  sanitizeQuery,
  validateContentType
};
