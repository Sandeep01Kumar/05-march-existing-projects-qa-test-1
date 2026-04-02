# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification


### 0.1.1 Core Security Objective

Based on the security concern described, the Blitzy platform understands that the security vulnerabilities to resolve are **multiple configuration and infrastructure weaknesses** across the entire Node.js HTTP server application. The current application (`server.js`) operates as a bare HTTP server using Node.js's built-in `http` module with zero security controls in place.

- **Vulnerability category:** Multiple vulnerabilities — Configuration weakness, Missing security headers, Absence of input validation, No rate limiting protection, No HTTPS/TLS encryption, No CORS policy
- **Severity level:** High — The server exposes a public HTTP endpoint with no security hardening, leaving it susceptible to XSS, clickjacking, MIME-sniffing attacks, brute-force/DDoS, and cross-origin abuse
- **Security requirements identified:**
  - Add HTTP security headers via helmet.js middleware (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, etc.)
  - Implement input validation and sanitization on all incoming requests to prevent injection attacks
  - Add rate limiting to protect against brute-force and DDoS attacks
  - Enable HTTPS/TLS support for encrypted transport-layer communication
  - Introduce proper CORS policies to control cross-origin resource sharing
  - Migrate from bare `http` module to Express.js framework to support middleware-based security architecture
- **Implicit security needs surfaced:**
  - The current application uses Node.js built-in `http` — the user's request for helmet.js, CORS middleware, and rate limiting all require an Express.js (or compatible) framework, meaning a framework migration is an implicit prerequisite
  - Dependency management must be introduced since the project currently has zero dependencies
  - A `package-lock.json` update is required to lock dependency versions for supply-chain security
  - Backward compatibility with the existing `Hello, World!` response behavior must be preserved

### 0.1.2 Special Instructions and Constraints

- **User-specified implementation rule:** `npm create` — indicating preference for npm-based package management and project initialization patterns
- **Change scope preference:** Standard — the user requested multiple security layers (headers, validation, rate limiting, HTTPS, CORS) which indicates a comprehensive security hardening effort rather than a minimal single-patch fix
- **Repository immutability note:** The `README.md` contains the directive "Do not touch!" — this file should remain unmodified
- **Web search requirements documented:** Research conducted on latest stable versions of helmet.js, cors, express-rate-limit, express-validator, and Express.js framework; OWASP Node.js security best practices consulted
- **Zero-dependency baseline:** The project currently has no `dependencies` or `devDependencies` — all security packages are net-new additions, not updates to existing vulnerable versions
- **No CVE-specific fixes:** This is a security hardening initiative rather than a response to a specific CVE disclosure

### 0.1.3 Technical Interpretation

This security vulnerability translates to the following technical fix strategy:

- To resolve the **missing security headers**, we will migrate the server from the bare `http` module to Express.js and integrate `helmet@8.1.0` as middleware, which automatically sets Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Origin-Agent-Cluster, Referrer-Policy, and X-DNS-Prefetch-Control headers while removing the X-Powered-By header
- To resolve the **absence of input validation**, we will integrate `express-validator@7.3.1` to provide request body, query parameter, and header validation/sanitization capabilities
- To resolve the **lack of rate limiting**, we will integrate `express-rate-limit@8.3.2` with configurable window and request-limit settings to protect against brute-force and DDoS patterns
- To resolve the **absence of HTTPS/TLS**, we will add an HTTPS server configuration module using Node.js built-in `https` module with self-signed certificate support for development and configurable TLS options for production
- To resolve the **missing CORS policy**, we will integrate the `cors@2.8.6` middleware with explicit origin allowlisting and proper preflight handling
- To resolve the **dependency update requirement**, we will introduce Express.js as the foundational framework and add all security middleware packages with pinned versions

The user's understanding level is **general security concern** — they have identified specific security mechanisms to implement (helmet, CORS, rate limiting, input validation, HTTPS) without referencing specific CVEs or vulnerability disclosures.


## 0.2 Vulnerability Research and Analysis


### 0.2.1 Initial Assessment

Security-related information extracted from the user request and repository analysis:

- **CVE numbers mentioned:** None — this is a proactive security hardening effort
- **Vulnerability names:**
  - Missing HTTP Security Headers (OWASP A05:2021 — Security Misconfiguration)
  - Missing Input Validation (OWASP A03:2021 — Injection)
  - No Rate Limiting (OWASP A04:2021 — Insecure Design)
  - No Transport Layer Encryption (OWASP A02:2021 — Cryptographic Failures)
  - No CORS Policy (OWASP A01:2021 — Broken Access Control)
- **Affected packages:** No existing packages are vulnerable; the vulnerability is the *absence* of security packages entirely
- **Symptoms described:** Bare HTTP server (`server.js`) on `127.0.0.1:3000` responding with `text/plain` "Hello, World!" to all requests without any security controls
- **Security advisories referenced:** None by user; OWASP Top 10 (2021) and Node.js Security Cheat Sheet apply

### 0.2.2 Required Web Research

Research was conducted across the following authoritative sources:

- **npm registry:** Confirmed latest stable versions — `helmet@8.1.0`, `cors@2.8.6`, `express-rate-limit@8.3.2`, `express-validator@7.3.1`, `express@5.2.1` (latest) / `express@4.21.2` (v4 LTS)
- **OWASP Node.js Security Cheat Sheet:** Confirmed that input validation, security headers, rate limiting, and output encoding are core recommended practices for Node.js applications
- **Snyk vulnerability databases:** Confirmed that `cors@2.8.6` has no known direct vulnerabilities; `express-rate-limit` has a 100 vulnerability score; `helmet@8.1.0` has zero dependencies reducing supply-chain risk
- **Helmet.js official documentation:** Confirmed that helmet sets Content-Security-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Origin-Agent-Cluster, Referrer-Policy, Strict-Transport-Security, X-Content-Type-Options, X-DNS-Prefetch-Control headers by default, and removes X-Powered-By
- **Express.js releases:** Express v5.1.0 became the default npm `latest` tag on March 31, 2025; v5 drops support for Node.js versions below v18 and updates to `path-to-regexp@8.x` for ReDoS mitigation

Research reveals that this is not a response to a specific CVE but rather a proactive OWASP-aligned security hardening initiative addressing multiple categories from the OWASP Top 10 (2021).

### 0.2.3 Vulnerability Classification

| Aspect | Detail |
|--------|--------|
| **Vulnerability type** | Security Misconfiguration, Missing Security Headers, No Input Validation, No Rate Limiting, No Transport Encryption, No CORS Policy |
| **Attack vector** | Network — the HTTP server is exposed on port 3000 |
| **Exploitability** | High — no security controls exist, any network client can interact with the server without restriction |
| **Impact** | Confidentiality, Integrity, Availability — XSS via missing CSP, clickjacking via missing X-Frame-Options, MIME-sniffing via missing X-Content-Type-Options, DDoS via missing rate limiting, data interception via missing TLS |
| **Root cause** | The application was deliberately built as a minimal test fixture using only Node.js built-in `http` module with zero security infrastructure |

### 0.2.4 Web Search Research Conducted

- **Official security advisories reviewed:**
  - OWASP Node.js Security Cheat Sheet (https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
  - Express.js v5 security improvements and ReDoS mitigation (https://expressjs.com/2025/03/31/v5-1-latest-release.html)
  - Helmet.js official documentation (https://helmetjs.github.io/)
  - Snyk cors package analysis (https://security.snyk.io/package/npm/cors)
  - Snyk express-rate-limit analysis (https://security.snyk.io/package/npm/express-rate-limit)
- **Recommended mitigation strategies:**
  - Use helmet.js for comprehensive HTTP security headers (OWASP-recommended)
  - Implement input validation with express-validator using allowlist-based validation
  - Apply rate limiting via express-rate-limit with configurable per-IP request windows
  - Enable CORS with explicit origin allowlisting (avoid wildcard `*` in production)
  - Add HTTPS support with TLS 1.2+ enforcement
- **Alternative solutions considered:**
  - **Manual header setting** vs. helmet.js — Rejected: helmet provides 15 security headers with one line and is actively maintained with zero dependencies
  - **Joi/Yup** vs. express-validator — express-validator chosen for tighter Express integration and built-in sanitization
  - **Custom rate limiter** vs. express-rate-limit — express-rate-limit chosen for production-proven memory store and external store support
  - **Express 5.x** vs. Express 4.x — Express 4.21.2 chosen for broader middleware ecosystem compatibility; express-validator explicitly states verification with Express 4.x


## 0.3 Security Scope Analysis


### 0.3.1 Affected Component Discovery

The repository was searched exhaustively to identify ALL files affected by the security hardening. The repository is a flat structure with 14 files at the root level and zero subdirectories.

**Directly affected files (require modification or creation):**

| File | Impact Type | Reason |
|------|------------|--------|
| `server.js` | UPDATE | Core application — must be migrated from bare `http` to Express with security middleware |
| `package.json` | UPDATE | Must add all security dependencies (express, helmet, cors, express-rate-limit, express-validator) and update scripts |
| `package-lock.json` | UPDATE | Will be regenerated with new dependency tree |

**Files requiring creation for security infrastructure:**

| File | Type | Purpose |
|------|------|---------|
| `middleware/security.js` | CREATE | Centralized security middleware configuration (helmet, CORS, rate limiting) |
| `middleware/validation.js` | CREATE | Input validation middleware using express-validator |
| `config/security.js` | CREATE | Security configuration constants (CORS origins, rate-limit settings, CSP directives) |
| `certs/README.md` | CREATE | Instructions for TLS certificate placement |
| `tests/security/test_security_headers.js` | CREATE | Security header validation tests |
| `tests/security/test_rate_limiting.js` | CREATE | Rate limiting behavior tests |
| `tests/security/test_cors.js` | CREATE | CORS policy validation tests |
| `tests/security/test_input_validation.js` | CREATE | Input validation tests |

**Unaffected files (no security relevance):**

| File | Reason for Exclusion |
|------|---------------------|
| `README.md` | Contains "Do not touch!" directive — immutable |
| `LoginTest.java` | Non-compilable Java stub — not a runtime component |
| `LoginTest - Copy.java` | Duplicate Java stub — not a runtime component |
| `industry.csv` | Static data fixture — no security impact |
| `industry - Copy.csv` | Duplicate data fixture — no security impact |
| `server - Copy.js` | Duplicate of server.js — will mirror parent changes only if needed |
| `test.py.txt` | Zero-byte placeholder — not executable |
| `test.py - Copy.txt` | Zero-byte placeholder — not executable |
| `.blitzyignore.txt` | Zero-byte placeholder — no patterns defined |
| `test.blitzyignore.txt` | Zero-byte placeholder — no patterns defined |
| `test1.blitzyignore.txt` | Zero-byte placeholder — no patterns defined |

Vulnerability affects **3 existing files** requiring updates and **7+ new files** to be created across **3 new directories** (`middleware/`, `config/`, `tests/security/`).

### 0.3.2 Root Cause Identification

The identified vulnerability exists in the **application architecture** due to the deliberate absence of any security infrastructure:

- **`server.js`** (14 lines) creates a raw HTTP server using `http.createServer()` with a single request handler that returns `200 OK` with `text/plain` body for ALL requests, regardless of method, path, headers, or body content
- **No middleware layer exists** — the bare `http` module does not support middleware patterns, preventing the use of security middleware like helmet, cors, or rate limiters
- **`package.json`** contains zero dependencies — no security packages are installed or available
- **No configuration files exist** — there are no security settings, CORS origins, rate-limit policies, or TLS configurations anywhere in the codebase

The root cause is that the application was built as a minimal test fixture for integration testing, with security explicitly out of scope in its original design.

### 0.3.3 Current State Assessment

| Security Control | Current State | Risk |
|-----------------|---------------|------|
| **Security headers** | None set — raw HTTP response contains only `Content-Type: text/plain` | XSS, clickjacking, MIME-sniffing, information leakage |
| **Input validation** | None — all requests accepted without inspection | Injection attacks, malformed data processing |
| **Rate limiting** | None — unlimited requests from any IP | DDoS, brute-force attacks, resource exhaustion |
| **HTTPS/TLS** | None — plain HTTP only | Data interception, man-in-the-middle attacks |
| **CORS policy** | None — no `Access-Control-*` headers set | Cross-origin abuse (though absence of CORS headers defaults to same-origin restriction in browsers) |
| **Framework** | Bare `http` module | No middleware support, no route-level security controls |
| **Dependencies** | Zero third-party packages | Zero supply-chain risk, but zero security tooling |
| **Server binding** | `127.0.0.1:3000` (localhost only) | Partially mitigates network exposure, but does not address application-layer vulnerabilities |


## 0.4 Version Compatibility Research


### 0.4.1 Secure Version Identification

Since this project has **zero existing dependencies**, all packages are net-new additions rather than upgrades. The following versions are recommended based on comprehensive web research:

| Package | Recommended Version | Rationale |
|---------|-------------------|-----------|
| `express` | `4.21.2` | Latest stable v4 LTS release; all security middleware explicitly verified for v4.x; broad ecosystem compatibility; v5.2.1 is available but express-validator documentation only confirms v4.x verification |
| `helmet` | `8.1.0` | Latest stable release; zero dependencies; sets 11+ security headers by default; fully compatible with Express 4.x |
| `cors` | `2.8.6` | Latest release (published January 2026); no known vulnerabilities per Snyk; full Express 4.x support |
| `express-rate-limit` | `8.3.2` | Latest stable release; built-in memory store; supports `draft-8` RateLimit headers; requires Node.js 16+ (satisfied by v20.20.2) |
| `express-validator` | `7.3.1` | Latest stable release; requires Node.js 14+; verified with Express 4.x; built on validator.js for comprehensive string validation/sanitization |

**No breaking changes in any selected version** — since all packages are net-new additions, there is no upgrade path to manage. The selected versions represent the latest stable releases as of the research date.

### 0.4.2 Compatibility Verification

**Runtime compatibility:**

| Requirement | Current Environment | Status |
|------------|-------------------|--------|
| Node.js ≥ 18 (Express 5.x requirement) | v20.20.2 | ✅ Compatible (but using Express 4.x which requires Node.js ≥ 0.10) |
| Node.js ≥ 16 (express-rate-limit requirement) | v20.20.2 | ✅ Compatible |
| Node.js ≥ 14 (express-validator requirement) | v20.20.2 | ✅ Compatible |
| npm ≥ 7 (lockfileVersion 3 support) | 11.1.0 | ✅ Compatible |

**Inter-package compatibility:**

- `helmet@8.1.0` — Zero dependencies, Express middleware pattern (`app.use(helmet())`)
- `cors@2.8.6` — Depends on `object-assign` and `vary`; standard Express middleware pattern
- `express-rate-limit@8.3.2` — Zero runtime dependencies; Express middleware pattern
- `express-validator@7.3.1` — Depends on `validator.js`; Express middleware pattern
- All packages use the standard Express middleware signature `(req, res, next)` — no conflicts expected

**Alternative packages considered (not selected):**

| Alternative | Reason Not Selected |
|-------------|-------------------|
| `@fastify/helmet` | Project uses Express, not Fastify |
| `@koa/cors` | Project uses Express, not Koa |
| `joi` / `yup` | express-validator provides tighter Express integration with built-in middleware patterns |
| `rate-limiter-flexible` | express-rate-limit is the de-facto standard for Express with 15M+ weekly downloads |


## 0.5 Security Fix Design


### 0.5.1 Minimal Fix Strategy

**PRINCIPLE:** Apply the smallest set of changes that completely addresses all five security vulnerability categories (headers, validation, rate limiting, HTTPS, CORS) while preserving the existing application behavior.

**Fix approach:** Combination — Framework migration + Dependency addition + Configuration creation + Code patch

**Framework Migration (prerequisite for all security middleware):**

- Migrate `server.js` from bare `http.createServer()` to Express.js application pattern
- Preserve the existing endpoint behavior: respond with `200 OK` and `"Hello, World!\n"` for `GET /` requests
- Add Express.js as a runtime dependency in `package.json`
- The migration is the minimal structural change required to support middleware-based security controls

**For missing security headers:**

- Integrate `helmet@8.1.0` as Express middleware via `app.use(helmet())`
- Helmet sets the following headers by default: Content-Security-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Origin-Agent-Cluster, Referrer-Policy, Strict-Transport-Security, X-Content-Type-Options, X-DNS-Prefetch-Control
- Helmet removes: X-Powered-By (prevents server fingerprinting)
- Helmet disables: X-XSS-Protection (legacy header that can worsen security)
- Side effects: None expected for existing `text/plain` responses

**For missing input validation:**

- Integrate `express-validator@7.3.1` middleware for request validation and sanitization
- Create validation middleware module with reusable validation chains
- Apply to any routes accepting user input (currently none, but infrastructure in place for future routes)

**For missing rate limiting:**

- Integrate `express-rate-limit@8.3.2` with default configuration: 100 requests per 15-minute window per IP
- Use built-in memory store (appropriate for single-server deployment)
- Return standard `RateLimit` headers per draft-8 specification
- Return `429 Too Many Requests` when limit exceeded

**For missing HTTPS/TLS:**

- Add HTTPS server capability using Node.js built-in `https` module alongside Express
- Support configurable TLS certificate paths via environment variables
- Maintain HTTP server for development with option to redirect to HTTPS in production

**For missing CORS policy:**

- Integrate `cors@2.8.6` with explicit configuration
- Default to restrictive origin policy (not wildcard `*`)
- Support configurable allowed origins, methods, and headers
- Handle preflight `OPTIONS` requests automatically

### 0.5.2 Dependency Replacement Analysis

No dependency replacement is needed — all packages are net-new additions. The one structural "replacement" is the migration from the bare `http` module to Express.js:

- **Replace:** `const http = require('http')` → `const express = require('express')`
- **Rationale:** The built-in `http` module does not support middleware patterns required by helmet, cors, express-rate-limit, and express-validator. Express is the standard Node.js framework for middleware-based web applications.
- **Compatibility analysis:** Express preserves the `req`/`res` API surface from Node.js `http` module, ensuring backward compatibility
- **API differences requiring code changes:**
  - `http.createServer(callback)` → `express()` application with `app.get()` route handlers
  - `res.writeHead(200, {'Content-Type': 'text/plain'})` → `res.type('text').send('Hello, World!\n')`
  - `server.listen(3000, '127.0.0.1')` → `app.listen(3000, '127.0.0.1')`
- **Performance trade-offs:** Express adds minimal overhead (~1ms per request) while enabling the complete middleware security stack

### 0.5.3 Security Improvement Validation

**How the fix eliminates each vulnerability:**

| Vulnerability | Fix Component | Elimination Mechanism |
|--------------|--------------|----------------------|
| Missing security headers | helmet@8.1.0 | Automatically sets 11+ protective HTTP headers on every response |
| No input validation | express-validator@7.3.1 | Provides validation chains and sanitization middleware for all request data |
| No rate limiting | express-rate-limit@8.3.2 | Tracks per-IP request counts and returns 429 when threshold exceeded |
| No HTTPS/TLS | Node.js `https` module | Encrypts all data in transit using TLS 1.2+ |
| No CORS policy | cors@2.8.6 | Sets `Access-Control-Allow-Origin` and related headers with explicit origin allowlisting |

**Verification methods:**

- **Security header verification:** `curl -sI http://localhost:3000/` — confirm presence of all helmet-set headers
- **Rate limiting verification:** Send 101+ requests within 15 minutes — confirm `429` response on 101st
- **CORS verification:** Send request with `Origin` header — confirm `Access-Control-Allow-Origin` in response
- **Input validation verification:** Send malformed request data — confirm `422` or `400` response with validation errors
- **HTTPS verification:** `curl -k https://localhost:3443/` — confirm TLS handshake and encrypted response

**Rollback plan:** Revert to the original `server.js` and `package.json` (both are simple files tracked in version control). Remove `node_modules/` and regenerate from original `package-lock.json`.


## 0.6 File Transformation Mapping


### 0.6.1 File-by-File Security Fix Plan

| Target File | Transformation | Source File/Reference | Security Changes |
|------------|----------------|----------------------|------------------|
| `package.json` | UPDATE | `package.json` | Add express@4.21.2, helmet@8.1.0, cors@2.8.6, express-rate-limit@8.3.2, express-validator@7.3.1 as dependencies; add supertest and jest as devDependencies for security testing; update `main` entry and `scripts` |
| `package-lock.json` | UPDATE | `package-lock.json` | Regenerated lockfile with full dependency tree for all new packages |
| `server.js` | UPDATE | `server.js` | Migrate from `http.createServer()` to Express app; integrate helmet, cors, rate-limit, and validation middleware; preserve `/` route returning "Hello, World!"; add HTTPS server bootstrap |
| `middleware/security.js` | CREATE | `server.js` | New module exporting configured helmet, cors, and rate-limit middleware functions |
| `middleware/validation.js` | CREATE | `server.js` | New module providing reusable express-validator validation chains and error-handling middleware |
| `config/security.js` | CREATE | `server.js` | New module exporting security configuration constants: CORS origins, rate-limit windows, CSP directives, TLS options |
| `certs/README.md` | CREATE | — | Documentation for TLS certificate placement; instructions for generating self-signed certs for development |
| `tests/security/test_security_headers.js` | CREATE | `server.js` | Test cases verifying all helmet-set security headers are present in responses |
| `tests/security/test_rate_limiting.js` | CREATE | `server.js` | Test cases verifying rate-limit enforcement and 429 responses |
| `tests/security/test_cors.js` | CREATE | `server.js` | Test cases verifying CORS headers for allowed and disallowed origins |
| `tests/security/test_input_validation.js` | CREATE | `server.js` | Test cases verifying input validation rejects malformed data and accepts valid data |
| `server - Copy.js` | REFERENCE | `server.js` | Existing duplicate — serves as reference for original server implementation; no direct modification needed |

### 0.6.2 Code Change Specifications

**`server.js` — Full Migration**

- **Lines affected:** All 14 lines (complete rewrite)
- **Before state:** Currently vulnerable because it uses bare `http.createServer()` with no middleware support, no security headers, no input validation, no rate limiting, no CORS, and no HTTPS
- **After state:** After fix, will be an Express.js application with helmet security headers, CORS policy, rate limiting, input validation infrastructure, and HTTPS server capability
- **Security improvement:** Eliminates all five vulnerability categories simultaneously

**`package.json` — Dependency Addition**

- **Lines affected:** Lines 5-10 (new `dependencies` and `devDependencies` blocks)
- **Before state:** Currently vulnerable because it contains zero dependencies — no security packages available
- **After state:** After fix, will contain all five security dependencies with pinned versions and test tooling
- **Security improvement:** Establishes security dependency baseline with locked versions for supply-chain protection

**`middleware/security.js` — New Security Middleware Module**

- **File:** `middleware/security.js` (new file)
- **Before state:** Does not exist — no centralized security configuration
- **After state:** Exports configured `helmetMiddleware`, `corsMiddleware`, and `rateLimitMiddleware` functions ready for `app.use()` integration
- **Security improvement:** Centralizes security middleware configuration for consistent application across all routes

**`middleware/validation.js` — New Validation Module**

- **File:** `middleware/validation.js` (new file)
- **Before state:** Does not exist — no input validation capability
- **After state:** Exports reusable validation chains and a `handleValidationErrors` middleware that returns `400` with structured error details for invalid requests
- **Security improvement:** Prevents injection attacks and malformed data processing

**`config/security.js` — New Security Configuration Module**

- **File:** `config/security.js` (new file)
- **Before state:** Does not exist — no security settings anywhere
- **After state:** Exports environment-aware configuration for CORS origins, rate-limit settings, CSP directives, and TLS certificate paths
- **Security improvement:** Provides single-source-of-truth for all security parameters, enabling environment-specific tuning

### 0.6.3 Configuration Change Specifications

| File | Setting | Current Value | New Value | Security Rationale |
|------|---------|--------------|-----------|-------------------|
| `config/security.js` | `corsOptions.origin` | N/A (does not exist) | `['http://localhost:3000']` (configurable via env) | Restricts cross-origin access to explicitly allowed domains instead of wildcard `*` |
| `config/security.js` | `rateLimitOptions.windowMs` | N/A | `15 * 60 * 1000` (15 minutes) | Standard OWASP-recommended rate-limit window |
| `config/security.js` | `rateLimitOptions.limit` | N/A | `100` | Limits each IP to 100 requests per window, preventing brute-force and DDoS |
| `config/security.js` | `rateLimitOptions.standardHeaders` | N/A | `'draft-8'` | Returns standard `RateLimit` response header per latest IETF draft |
| `config/security.js` | `rateLimitOptions.legacyHeaders` | N/A | `false` | Disables deprecated `X-RateLimit-*` headers |
| `config/security.js` | `helmetOptions.contentSecurityPolicy.directives.defaultSrc` | N/A | `["'self'"]` | Restricts resource loading to same-origin only |
| `config/security.js` | `tlsOptions.certPath` | N/A | `process.env.TLS_CERT_PATH` or `'./certs/cert.pem'` | Configurable TLS certificate path |
| `config/security.js` | `tlsOptions.keyPath` | N/A | `process.env.TLS_KEY_PATH` or `'./certs/key.pem'` | Configurable TLS private key path |
| `config/security.js` | `httpsPort` | N/A | `process.env.HTTPS_PORT` or `3443` | Separate HTTPS listening port |
| `package.json` | `scripts.start` | `"echo \"Error...\"` | `"node server.js"` | Enables proper application startup |
| `package.json` | `scripts.test` | `"echo \"Error...\"` | `"jest --watchAll=false"` | Enables security test execution |


## 0.7 Dependency Inventory


### 0.7.1 Security Patches and Updates

Since the project currently has **zero dependencies**, all entries below are net-new additions rather than patches to existing vulnerable versions. Each package addresses a specific security gap identified in the vulnerability analysis.

| Registry | Package Name | Current | Added Version | Security Gap Addressed | Severity |
|----------|-------------|---------|--------------|----------------------|----------|
| npm | express | (none) | 4.21.2 | Framework prerequisite — enables middleware-based security architecture | High |
| npm | helmet | (none) | 8.1.0 | Missing HTTP security headers (CSP, HSTS, X-Content-Type-Options, etc.) | High |
| npm | cors | (none) | 2.8.6 | Missing CORS policy — no cross-origin access control | Medium |
| npm | express-rate-limit | (none) | 8.3.2 | Missing rate limiting — no DDoS/brute-force protection | High |
| npm | express-validator | (none) | 7.3.1 | Missing input validation — no injection attack prevention | High |

**Development dependencies (for security testing):**

| Registry | Package Name | Current | Added Version | Purpose |
|----------|-------------|---------|--------------|---------|
| npm | jest | (none) | ^29.7.0 | Test runner for security test execution |
| npm | supertest | (none) | ^7.0.0 | HTTP assertion library for testing Express middleware responses |

### 0.7.2 Dependency Chain Analysis

**Direct dependencies requiring addition:**
- `express@4.21.2` — Core web framework
- `helmet@8.1.0` — Security headers middleware (zero transitive dependencies)
- `cors@2.8.6` — CORS middleware
- `express-rate-limit@8.3.2` — Rate limiting middleware (zero transitive dependencies)
- `express-validator@7.3.1` — Input validation middleware

**Transitive dependencies introduced:**
- `express@4.21.2` brings: `body-parser`, `cookie`, `debug`, `depd`, `destroy`, `encodeurl`, `escape-html`, `etag`, `finalhandler`, `fresh`, `http-errors`, `merge-descriptors`, `methods`, `on-finished`, `parseurl`, `path-to-regexp`, `proxy-addr`, `qs`, `range-parser`, `raw-body`, `safe-buffer`, `safer-buffer`, `send`, `serve-static`, `setprototypeof`, `statuses`, `type-is`, `unpipe`, `utils-merge`, `vary`
- `cors@2.8.6` brings: `object-assign`, `vary`
- `express-validator@7.3.1` brings: `validator`
- `helmet@8.1.0` — None (standalone)
- `express-rate-limit@8.3.2` — None (standalone)

**Peer dependencies to verify:**
- None of the selected packages declare peer dependencies that could conflict

**Development dependencies with considerations:**
- `jest@^29.7.0` — Well-maintained test framework; no security concerns
- `supertest@^7.0.0` — HTTP testing utility; devDependency only, not shipped to production

### 0.7.3 Import and Reference Updates

**Source files requiring import additions (all in `server.js`):**

```javascript
const express = require('express');
const { securityMiddleware } = require('./middleware/security');
const { validationMiddleware } = require('./middleware/validation');
```

**New module files with their imports:**

- `middleware/security.js`:
  - `const helmet = require('helmet')`
  - `const cors = require('cors')`
  - `const rateLimit = require('express-rate-limit')`
  - `const config = require('../config/security')`

- `middleware/validation.js`:
  - `const { body, query, validationResult } = require('express-validator')`

- `config/security.js`:
  - No external imports — exports pure configuration objects

**Configuration reference updates:**
- `package.json` `"main"` field: Update from `"index.js"` (non-existent) to `"server.js"` (actual entry point)
- `package.json` `"scripts.start"`: Update from error stub to `"node server.js"`
- `package.json` `"scripts.test"`: Update from error stub to `"jest --watchAll=false"`
- No environment variable files exist to update (`.env` files not currently in the project; new `config/security.js` reads from `process.env` with defaults)


## 0.8 Impact Analysis and Testing Strategy


### 0.8.1 Security Testing Requirements

**Vulnerability regression tests (verify each security control is active):**

| Test Scenario | File | Validation |
|--------------|------|------------|
| Security headers present on all responses | `tests/security/test_security_headers.js` | Assert `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Referrer-Policy` headers are set; assert `X-Powered-By` header is absent |
| Rate limiting enforces request threshold | `tests/security/test_rate_limiting.js` | Send requests exceeding configured limit (100/15min); assert 101st request returns `429 Too Many Requests` with `RateLimit` response header |
| CORS allows configured origins only | `tests/security/test_cors.js` | Assert `Access-Control-Allow-Origin` matches configured origins; assert disallowed origins receive no `Access-Control-Allow-Origin` header |
| CORS preflight handled correctly | `tests/security/test_cors.js` | Send `OPTIONS` request with `Origin` and `Access-Control-Request-Method` headers; assert `200` or `204` response with appropriate CORS headers |
| Input validation rejects malformed data | `tests/security/test_input_validation.js` | Send requests with XSS payloads, SQL injection strings, and oversized bodies; assert `400` or `422` response with validation errors |
| Input validation accepts valid data | `tests/security/test_input_validation.js` | Send well-formed requests; assert `200` response with expected body |
| Existing `/` route still returns "Hello, World!" | `tests/security/test_security_headers.js` | Assert `GET /` returns `200` with body containing `Hello, World!` |

**Specific attack scenarios to test:**
- XSS payload in query parameters: `?name=<script>alert('xss')</script>`
- Oversized request body exceeding Express default limit
- Rapid sequential requests from single IP exceeding rate limit
- Cross-origin request from disallowed domain
- Request without `Origin` header (same-origin simulation)

### 0.8.2 Verification Methods

**Automated security scanning:**

| Tool | Command | Expected Result |
|------|---------|----------------|
| `npm audit` | `npm audit --audit-level=moderate` | Zero vulnerabilities in dependency tree |
| Jest test suite | `npx jest --watchAll=false --ci` | All security test cases pass |

**Manual verification steps:**
- Start server: `node server.js`
- Verify security headers: `curl -sI http://localhost:3000/` — confirm all helmet headers present
- Verify rate limiting: Use `for i in $(seq 1 105); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/; done` — confirm `429` appears after 100th request
- Verify CORS: `curl -sI -H "Origin: http://evil.com" http://localhost:3000/` — confirm no `Access-Control-Allow-Origin` header for disallowed origin
- Verify CORS allowed: `curl -sI -H "Origin: http://localhost:3000" http://localhost:3000/` — confirm `Access-Control-Allow-Origin: http://localhost:3000`
- Verify existing behavior: `curl http://localhost:3000/` — confirm `Hello, World!` response

**Penetration testing scenarios (if applicable):**
- Attempt to bypass rate limiting using `X-Forwarded-For` header spoofing
- Attempt to inject headers via CRLF injection in request parameters
- Attempt to load cross-origin resources via CSP bypass techniques

### 0.8.3 Impact Assessment

**Direct security improvements achieved:**
- **Missing Security Headers** → Eliminated: 11+ protective HTTP headers now set on every response via helmet
- **Missing Input Validation** → Eliminated: Request data validated and sanitized before processing via express-validator
- **Missing Rate Limiting** → Eliminated: Per-IP request throttling active with configurable thresholds via express-rate-limit
- **Missing CORS Policy** → Eliminated: Explicit origin allowlisting with proper preflight handling via cors
- **Missing HTTPS/TLS** → Eliminated: HTTPS server capability with configurable TLS certificates
- **Security posture** improved from zero security controls to OWASP-aligned multi-layer defense

**Minimal side effects on existing functionality:**
- The `GET /` endpoint preserves its `200 OK` response with `Hello, World!` body
- Server continues to bind to `127.0.0.1:3000` for HTTP (with optional `127.0.0.1:3443` for HTTPS)
- No breaking changes to the existing HTTP response format for the root endpoint
- The `server - Copy.js` duplicate is not modified and serves as a reference for the original implementation

**Potential impacts to address:**
- **Added startup time:** Express + middleware adds ~50-100ms to server cold start (negligible for this application)
- **Response latency:** Middleware chain adds ~1-2ms per request (acceptable)
- **Memory footprint:** `node_modules` grows from 0 bytes to approximately 5-10 MB with all dependencies
- **Rate limiting false positives:** Legitimate high-volume clients from a single IP could be rate-limited; mitigate by configuring appropriate thresholds in `config/security.js`
- **CORS restrictions:** Clients from unlisted origins will be blocked by browser CORS enforcement; ensure all legitimate origins are added to the allowlist


## 0.9 Scope Boundaries


### 0.9.1 Exhaustively In Scope

**Dependency manifests:**
- `package.json` — Add security dependencies with pinned versions
- `package-lock.json` — Regenerated with complete dependency tree

**Core application source files:**
- `server.js` — Migrate to Express with security middleware integration

**New security middleware modules:**
- `middleware/security.js` — Helmet, CORS, and rate-limit middleware configuration
- `middleware/validation.js` — Input validation and sanitization middleware

**New security configuration files:**
- `config/security.js` — CORS origins, rate-limit settings, CSP directives, TLS paths

**Infrastructure and deployment files:**
- `certs/README.md` — TLS certificate placement instructions

**Security test files:**
- `tests/security/test_security_headers.js` — Security header validation tests
- `tests/security/test_rate_limiting.js` — Rate-limit enforcement tests
- `tests/security/test_cors.js` — CORS policy validation tests
- `tests/security/test_input_validation.js` — Input validation tests

**Complete file pattern coverage:**
- `server.js` — Primary application entry point
- `package.json` / `package-lock.json` — Dependency manifests
- `middleware/*.js` — All security middleware modules
- `config/*.js` — All security configuration modules
- `certs/README.md` — TLS certificate documentation
- `tests/security/*.js` — All security-focused test files

### 0.9.2 Explicitly Out of Scope

- **Feature additions unrelated to security:** No new application routes, business logic, or API endpoints beyond what is needed for security middleware demonstration
- **Performance optimizations:** No profiling, caching, or performance tuning beyond security middleware integration
- **Code refactoring beyond security fix requirements:** The Java stubs (`LoginTest.java`, `LoginTest - Copy.java`), CSV files (`industry.csv`, `industry - Copy.csv`), and zero-byte placeholders are not modified
- **Non-security files:**
  - `README.md` — Explicitly marked "Do not touch!" in its content
  - `server - Copy.js` — Duplicate file; not modified (serves as original reference)
  - `LoginTest.java` / `LoginTest - Copy.java` — Non-compilable Java stubs
  - `industry.csv` / `industry - Copy.csv` — Static data fixtures
  - `test.py.txt` / `test.py - Copy.txt` — Zero-byte placeholders
  - `.blitzyignore.txt` / `test.blitzyignore.txt` / `test1.blitzyignore.txt` — Empty ignore files
- **Style or formatting changes:** No linting, code formatting, or style standardization beyond security-related modifications
- **Authentication and authorization:** Not requested by user; the security hardening focuses on headers, validation, rate limiting, HTTPS, and CORS
- **Database security:** No database exists in the project
- **Session management:** No sessions exist; not requested
- **Logging infrastructure:** Security event logging is not part of this scope (though recommended as a follow-up)
- **CI/CD pipeline security scanning:** Not requested; no CI/CD pipeline exists in the repository
- **Docker/Kubernetes hardening:** No containerization exists in the project


## 0.10 Execution Parameters


### 0.10.1 Security Verification Commands

| Purpose | Command |
|---------|---------|
| Install all dependencies | `CI=true npm install --yes` |
| Dependency vulnerability scan | `npm audit --audit-level=moderate` |
| Security test execution | `npx jest --watchAll=false --ci --testPathPattern=tests/security` |
| Full test suite validation | `npx jest --watchAll=false --ci` |
| Verify security headers | `curl -sI http://localhost:3000/ \| grep -iE '(content-security-policy\|strict-transport-security\|x-content-type-options\|x-frame-options\|referrer-policy\|cross-origin)'` |
| Verify rate limiting | `for i in $(seq 1 105); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/; done \| sort \| uniq -c` |
| Verify CORS headers | `curl -sI -H "Origin: http://localhost:3000" http://localhost:3000/` |
| Verify X-Powered-By removed | `curl -sI http://localhost:3000/ \| grep -i x-powered-by` (should return empty) |
| Start server for manual testing | `node server.js &` |
| Stop server after testing | `kill %1` |

### 0.10.2 Research Documentation

**Security advisories consulted:**
- OWASP Node.js Security Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
- OWASP Top 10 (2021) — A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration
- Helmet.js official documentation — https://helmetjs.github.io/
- Express.js security best practices — https://expressjs.com/en/advanced/best-practice-security.html
- Express v5.1.0 release announcement — https://expressjs.com/2025/03/31/v5-1-latest-release.html

**Specific CVE numbers:** None — this is a proactive security hardening effort, not a CVE response

**Vulnerability databases consulted:**
- Snyk — https://security.snyk.io/package/npm/cors (no vulnerabilities)
- Snyk — https://security.snyk.io/package/npm/express-rate-limit (vulnerability score: 100)
- npm registry — https://www.npmjs.com/package/helmet (8.1.0, 0 dependencies)
- npm registry — https://www.npmjs.com/package/express-rate-limit (8.3.2)
- npm registry — https://www.npmjs.com/package/cors (2.8.6)
- npm registry — https://www.npmjs.com/package/express-validator (7.3.1)

**Security best practices followed:**
- OWASP Recommendation: Use helmet for secure HTTP headers
- OWASP Recommendation: Validate and sanitize all user input
- OWASP Recommendation: Implement rate limiting to prevent DDoS and brute-force attacks
- OWASP Recommendation: Enforce HTTPS for all communications
- OWASP Recommendation: Configure CORS with explicit origin allowlisting (avoid wildcard `*`)
- Express.js Recommendation: Disable `X-Powered-By` header to prevent server fingerprinting

### 0.10.3 Implementation Constraints

| Constraint | Value |
|-----------|-------|
| **Priority** | Security fix first, minimal disruption second |
| **Backward compatibility** | Must maintain — the `GET /` endpoint must continue to return `Hello, World!` with `200 OK` status |
| **Deployment considerations** | Immediate — changes are self-contained within the application and require only `npm install` to activate |
| **Node.js version** | v20.20.2 (no change required) |
| **npm version** | 11.1.0 (no change required) |
| **Express version choice** | 4.21.2 (v4 LTS) — chosen over v5.2.1 for broader middleware ecosystem compatibility |
| **Module system** | CommonJS (`require()`) — consistent with existing `server.js` |
| **Server binding** | Preserve `127.0.0.1:3000` for HTTP; add `127.0.0.1:3443` for HTTPS |
| **TLS certificates** | Not bundled — configurable paths via environment variables with development self-signed cert instructions |
| **Environment variables** | `PORT`, `HTTPS_PORT`, `TLS_CERT_PATH`, `TLS_KEY_PATH`, `CORS_ORIGINS`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` |


## 0.11 Special Instructions for Security Fixes


### 0.11.1 Security-Specific Requirements

The following directives apply to the implementation of this security hardening effort:

- **Change scope:** All changes are directly related to the five requested security controls (headers, validation, rate limiting, HTTPS, CORS) and the prerequisite Express.js migration. No unrelated refactoring or feature additions are included.
- **Preserve existing functionality:** The `GET /` endpoint must continue to return `"Hello, World!\n"` with `200 OK` status after all security middleware is applied. The server must continue to bind to `127.0.0.1:3000`.
- **Do not modify immutable files:** `README.md` contains "Do not touch!" directive and must not be modified. All zero-byte placeholder files, Java stubs, CSV files, and `server - Copy.js` are outside the security fix scope.
- **Follow principle of least privilege:** CORS configuration defaults to restrictive origin allowlisting. Rate limiting applies to all routes by default. CSP directives default to `'self'` only.
- **Maintain audit trail:** All security package additions are documented in `package.json` with exact version pinning. The `package-lock.json` provides a complete dependency tree for audit purposes. `server - Copy.js` is preserved as a reference to the original pre-security implementation.
- **No secrets in source code:** TLS certificate paths are configurable via environment variables (`TLS_CERT_PATH`, `TLS_KEY_PATH`). No private keys or certificates are committed to the repository. The `certs/` directory contains only a `README.md` with generation instructions.

### 0.11.2 User-Specified Implementation Rule

- **Rule name:** `02-Apr-rules`
- **Rule content:** `npm create`
- **Interpretation:** The user prefers npm-based tooling for project management. All dependency operations use `npm install`, `npm audit`, and `npm test` commands consistent with this preference. No alternative package managers (yarn, pnpm) are used.

### 0.11.3 Security Architecture Decision Record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Express 4.21.2 | Most widely used Node.js web framework; all security middleware explicitly supports v4.x; 71M+ weekly downloads |
| Security headers | helmet 8.1.0 | OWASP-recommended; zero dependencies; 15 sub-middleware security headers; single-line integration |
| CORS | cors 2.8.6 | Official Express.js middleware; 21M+ weekly downloads; no known vulnerabilities |
| Rate limiting | express-rate-limit 8.3.2 | De-facto standard for Express; 15M+ weekly downloads; supports draft-8 RateLimit headers |
| Input validation | express-validator 7.3.1 | Tightest Express integration; built on validator.js; 1.5M+ weekly downloads |
| HTTPS | Node.js built-in `https` | No additional dependency needed; configurable TLS certificate paths |
| Test framework | Jest + Supertest | Industry standard for Node.js testing; Supertest enables HTTP assertion testing without starting a live server |
| Module system | CommonJS | Consistent with existing codebase; no migration to ESM required |

All decisions prioritize security effectiveness, minimal dependency footprint, ecosystem maturity, and backward compatibility with the existing application.


