# Blitzy Project Guide — Node.js Security Hardening

---

## 1. Executive Summary

### 1.1 Project Overview

This project delivers a comprehensive OWASP-aligned security hardening of a Node.js HTTP server application. The original `server.js` operated as a bare `http.createServer()` endpoint with zero security controls — no headers, no input validation, no rate limiting, no CORS, and no HTTPS. The security initiative migrated the application to Express.js 4.22.1 and integrated five security middleware packages: Helmet 8.1.0 (HTTP security headers), cors 2.8.6 (cross-origin policy), express-rate-limit 8.3.2 (DDoS/brute-force protection), express-validator 7.3.1 (input sanitization), and HTTPS/TLS via Node.js built-in `https` module. Backward compatibility with the original `GET /` → `"Hello, World!"` response is fully preserved. The security posture improved from zero controls to multi-layer defense across OWASP Top 10 categories A01–A05.

### 1.2 Completion Status

```mermaid
pie title Project Completion — 79.5%
    "Completed (35h)" : 35
    "Remaining (9h)" : 9
```

| Metric | Value |
|--------|-------|
| **Total Project Hours** | 44 |
| **Completed Hours (AI)** | 35 |
| **Remaining Hours** | 9 |
| **Completion Percentage** | 79.5% (35 / 44) |

**Calculation:** 35 completed hours / (35 completed + 9 remaining) = 35 / 44 = 79.5%

### 1.3 Key Accomplishments

- ✅ Migrated server.js from bare `http` module to Express.js 4.22.1 with full middleware support
- ✅ Integrated Helmet 8.1.0 — 11+ HTTP security headers set on every response (CSP, HSTS, X-Content-Type-Options, COOP, CORP, Referrer-Policy, X-DNS-Prefetch-Control); X-Powered-By removed
- ✅ Integrated cors 2.8.6 — explicit origin allowlisting with preflight handling, no wildcard `*`
- ✅ Integrated express-rate-limit 8.3.2 — 100 requests/15-minute window per IP with draft-8 RateLimit headers
- ✅ Created input validation middleware (express-validator 7.3.1) — sanitization chains, Content-Type enforcement
- ✅ Added HTTPS/TLS server capability with configurable certificate paths and graceful HTTP-only fallback
- ✅ Built centralized security configuration module (config/security.js) — all settings env-var driven with secure defaults
- ✅ Delivered 30 passing security tests across 4 test suites covering headers, rate limiting, CORS, and input validation
- ✅ Achieved 0 npm audit vulnerabilities (Express upgraded 4.21.2 → 4.22.1 to resolve 4 transitive CVEs)
- ✅ Preserved backward compatibility: GET / returns 200 OK with "Hello, World!\n"
- ✅ Added global error handler preventing stack trace leakage (OWASP A05:2021)
- ✅ Created comprehensive TLS certificate documentation (certs/README.md, 126 lines)

### 1.4 Critical Unresolved Issues

| Issue | Impact | Owner | ETA |
|-------|--------|-------|-----|
| No production TLS certificates configured | HTTPS server cannot start in production without CA-issued certificates | Human Developer | 2h |
| CORS origins default to localhost only | Cross-origin requests from production domains will be blocked until configured | Human Developer | 0.5h |
| Rate limit uses in-memory store | Rate limit counters are not shared across multiple server instances; ineffective in clustered/load-balanced deployments | Human Developer | 2h |

### 1.5 Access Issues

No access issues identified. All dependencies are publicly available on the npm registry. No private packages, service credentials, or restricted API access are required for the delivered scope.

### 1.6 Recommended Next Steps

1. **[High]** Procure production TLS certificates from a trusted CA (e.g., Let's Encrypt) and configure `TLS_CERT_PATH` / `TLS_KEY_PATH` environment variables
2. **[High]** Set production `CORS_ORIGINS` environment variable with all legitimate client domains
3. **[Medium]** Migrate rate limit store from in-memory to Redis (`@express-rate-limit/redis`) for multi-instance deployments
4. **[Medium]** Add HTTP-to-HTTPS redirect middleware for production environments
5. **[Low]** Conduct integration and load testing in a production-like environment to validate rate limit thresholds and middleware performance

---

## 2. Project Hours Breakdown

### 2.1 Completed Work Detail

| Component | Hours | Description |
|-----------|-------|-------------|
| Express.js Framework Migration | 6 | Migrated server.js from bare `http.createServer()` to Express 4.22.1; restructured routing to `app.get()`; added body parsers; implemented `module.exports` for testability |
| HTTP Security Headers (Helmet) | 3 | Integrated helmet@8.1.0 via middleware/security.js; configured CSP directives in config/security.js; verified 11+ headers set and X-Powered-By removed |
| Input Validation Middleware | 4 | Created middleware/validation.js (134 lines) with `handleValidationErrors`, `sanitizeBody`, `sanitizeQuery`, `validateContentType` exports using express-validator@7.3.1 |
| Rate Limiting Integration | 2 | Configured express-rate-limit@8.3.2 at 100 req/15min per IP with draft-8 RateLimit headers; disabled legacy X-RateLimit-* headers |
| CORS Policy Integration | 2 | Configured cors@2.8.6 with explicit origin allowlisting, preflight handling, credentials support; no wildcard origin |
| HTTPS/TLS Server Bootstrap | 2 | Added HTTPS server creation in server.js using Node.js built-in `https` module; implemented graceful fallback with console warning when certificates absent |
| Security Configuration Module | 3 | Created config/security.js (129 lines) — single source of truth for CORS, rate-limit, helmet, TLS, and port settings; all environment-variable driven with isNaN-safe parsing |
| Dependency Management | 2 | Added 5 production dependencies + 2 dev dependencies to package.json with pinned versions; regenerated package-lock.json; upgraded Express 4.21.2 → 4.22.1 to resolve 4 transitive CVEs |
| Security Test Suite | 8 | Created 30 tests across 4 test files (562 lines): test_security_headers.js (11), test_rate_limiting.js (5), test_cors.js (7), test_input_validation.js (7) — all passing |
| TLS Certificate Documentation | 1.5 | Created certs/README.md (126 lines) with self-signed cert generation, production CA instructions, env-var reference, and security best practices |
| Code Review Fixes & Validation | 1.5 | Three fix commits: Express CVE upgrade, middleware ordering correction (security before body parsers), test precision improvements, CORS trim, isNaN-safe parseInt, error handler |
| **Total** | **35** | |

### 2.2 Remaining Work Detail

| Category | Hours | Priority |
|----------|-------|----------|
| Production TLS Certificate Setup | 2 | High |
| Production Environment Variable Configuration | 1 | High |
| Production CORS Origin Allowlisting | 0.5 | High |
| Rate Limit Store Migration (Redis) | 2 | Medium |
| HTTP-to-HTTPS Redirect Middleware | 1 | Medium |
| Integration & Load Testing | 1.5 | Low |
| Production Deployment Verification | 1 | Low |
| **Total** | **9** | |

---

## 3. Test Results

| Test Category | Framework | Total Tests | Passed | Failed | Coverage % | Notes |
|--------------|-----------|-------------|--------|--------|------------|-------|
| Security Headers | Jest + Supertest | 11 | 11 | 0 | — | Validates all helmet-set headers (CSP, HSTS, X-Content-Type-Options, COOP, CORP, Referrer-Policy, X-DNS-Prefetch-Control), X-Powered-By removal, backward compatibility |
| Rate Limiting | Jest + Supertest | 5 | 5 | 0 | — | Validates 429 enforcement at 100-request threshold, draft-8 RateLimit headers present, legacy X-RateLimit-* headers absent |
| CORS Policy | Jest + Supertest | 7 | 7 | 0 | — | Validates allowed/disallowed origin handling, preflight OPTIONS with 204, allowed methods, credentials header, same-origin requests |
| Input Validation | Jest + Supertest | 7 | 7 | 0 | — | Validates XSS/SQL-injection payload handling, Content-Type enforcement, oversized body rejection (413), malformed JSON handling (400) |
| **Total** | **Jest 29.7.0** | **30** | **30** | **0** | **—** | **100% pass rate across 4 test suites, 15.1s execution time** |

All tests executed autonomously by Blitzy agents using `CI=true npx jest --watchAll=false --ci`. Zero manual test modifications required.

---

## 4. Runtime Validation & UI Verification

### Runtime Health

- ✅ **HTTP Server** — Starts on `127.0.0.1:3000`, responds to requests
- ✅ **GET /** — Returns `200 OK` with `Content-Type: text/plain` and body `"Hello, World!\n"` (backward compatibility confirmed)
- ✅ **Security Headers** — All 7 helmet-set headers verified via runtime HTTP request:
  - `content-security-policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' ...`
  - `strict-transport-security: max-age=31536000; includeSubDomains`
  - `x-content-type-options: nosniff`
  - `cross-origin-opener-policy: same-origin`
  - `cross-origin-resource-policy: same-origin`
  - `referrer-policy: no-referrer`
  - `x-dns-prefetch-control: off`
- ✅ **X-Powered-By** — Confirmed absent from responses (server fingerprinting prevention)
- ✅ **Rate Limiting** — `ratelimit` and `ratelimit-policy` draft-8 headers present in responses
- ✅ **CORS** — `Access-Control-Allow-Origin: http://localhost:3000` returned for allowed origin; absent for disallowed origins
- ✅ **HTTPS Fallback** — Graceful warning logged when TLS certificates not present; HTTP-only mode active
- ✅ **Error Handler** — Malformed JSON returns safe `400` with `"Malformed request body — invalid JSON"` (no stack trace leakage)
- ✅ **Compilation** — All 8 JavaScript files pass `node --check` syntax validation with zero errors

### API Verification

- ✅ `GET /` → `200 OK`, `text/plain`, `Hello, World!\n`
- ✅ `POST /` with valid JSON → `404` (no POST route defined — expected)
- ✅ `POST /` with malformed JSON → `400` with safe error message (no stack trace)
- ✅ `POST /` with oversized body → `413` caught by error handler
- ✅ `OPTIONS /` with allowed Origin → `204 No Content` with CORS headers

### UI Verification

Not applicable — this is a backend HTTP server API with no user interface component.

---

## 5. Compliance & Quality Review

| AAP Requirement | Deliverable | Status | Evidence |
|----------------|-------------|--------|----------|
| Express.js framework migration | server.js rewritten (190 lines) | ✅ Complete | Migrated from `http.createServer()` to `express()` with middleware stack |
| HTTP security headers via Helmet | helmet@8.1.0 integrated | ✅ Complete | 11+ headers verified at runtime; 11/11 tests pass |
| Input validation and sanitization | express-validator@7.3.1 middleware | ✅ Complete | middleware/validation.js (134 lines) with 4 exports; 7/7 tests pass |
| Rate limiting protection | express-rate-limit@8.3.2 | ✅ Complete | 100 req/15min per IP with draft-8 headers; 5/5 tests pass |
| CORS policy implementation | cors@2.8.6 with allowlisting | ✅ Complete | Explicit origin allowlist, preflight handling; 7/7 tests pass |
| HTTPS/TLS encryption support | Node.js `https` module bootstrap | ✅ Complete | Configurable cert paths, graceful fallback when certs absent |
| Security configuration module | config/security.js (129 lines) | ✅ Complete | Env-var driven settings for CORS, rate-limit, helmet, TLS, ports |
| Dependency management | package.json + package-lock.json | ✅ Complete | 5 prod + 2 dev deps; pinned versions; 0 npm audit vulnerabilities |
| Security test suite | 4 test files (30 tests, 562 lines) | ✅ Complete | 30/30 pass; headers, rate-limit, CORS, input validation covered |
| TLS certificate documentation | certs/README.md (126 lines) | ✅ Complete | Self-signed + production CA instructions, env-var reference |
| Backward compatibility | GET / → "Hello, World!" | ✅ Complete | Runtime verified; tests confirm 200 OK with expected body |
| README.md immutability | No changes to README.md | ✅ Complete | "Do not touch!" directive respected; file unmodified |
| Global error handler | Stack trace prevention | ✅ Complete | Error handler catches body-parser errors with safe client messages |

### Autonomous Fixes Applied During Validation

| Fix | Commit | Description |
|-----|--------|-------------|
| Express CVE resolution | `c6dc07b` | Upgraded Express 4.21.2 → 4.22.1 to resolve 4 transitive dependency vulnerabilities |
| Middleware ordering | `aa0ad07` | Reordered security middleware before body parsers so error responses include security headers |
| Test precision | `291708b` | Improved test assertions for accuracy and reliability |
| Code review findings | `7598a18` | CORS origin trim, isNaN-safe parseInt for env vars, removed dead import, HTTPS try/catch + warning, package.json trailing newline |
| Error handler | `e4814de` | Added custom error handler to prevent stack trace exposure in error responses |

---

## 6. Risk Assessment

| Risk | Category | Severity | Probability | Mitigation | Status |
|------|----------|----------|-------------|------------|--------|
| No production TLS certificates available | Security | High | High | Procure CA-issued certificates; configure `TLS_CERT_PATH`/`TLS_KEY_PATH` env vars; HTTPS server will auto-start when certs are present | Open — Human task |
| In-memory rate limit store lost on restart | Technical | Medium | High | Migrate to Redis-backed store (`@express-rate-limit/redis`) for persistent, shared counters across instances | Open — Human task |
| CORS origins default to localhost only | Security | Medium | High | Set `CORS_ORIGINS` environment variable with production domain list before deployment | Open — Human task |
| No HTTP-to-HTTPS redirect in production | Security | Medium | Medium | Add redirect middleware or configure at load balancer / reverse proxy layer | Open — Human task |
| Rate limit thresholds may need production tuning | Operational | Low | Medium | Monitor 429 rate in production; adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` env vars as needed | Open — Human task |
| Self-signed certs accidentally used in production | Security | High | Low | Self-signed certs are not committed to repo; document clearly in certs/README.md; enforce CA validation in deployment pipeline | Mitigated — Documentation in place |
| express-validator not applied to GET / route | Technical | Low | Low | By design — GET / accepts no user input; validation middleware available for future POST/PUT routes | Accepted — Documented in code |
| Single-process memory store scalability | Operational | Medium | Medium | Memory store suitable for single-instance; multi-instance requires external store migration | Open — Human task |

---

## 7. Visual Project Status

```mermaid
pie title Project Hours Breakdown
    "Completed Work" : 35
    "Remaining Work" : 9
```

### Remaining Work by Priority

| Priority | Hours | Categories |
|----------|-------|------------|
| High | 3.5 | Production TLS certs (2h), env var config (1h), CORS origins (0.5h) |
| Medium | 3 | Redis rate limit store (2h), HTTPS redirect (1h) |
| Low | 2.5 | Integration/load testing (1.5h), deployment verification (1h) |
| **Total** | **9** | |

---

## 8. Summary & Recommendations

### Achievements

The Blitzy autonomous agents successfully delivered all 11 AAP-scoped security hardening deliverables across 15 commits. The application security posture was elevated from zero controls (bare `http` module) to a comprehensive OWASP-aligned multi-layer defense including HTTP security headers, CORS policy, rate limiting, input validation infrastructure, and HTTPS/TLS capability. All 30 security tests pass with a 100% rate. The npm dependency tree has 0 known vulnerabilities. Backward compatibility is fully preserved.

### Completion Assessment

The project is **79.5% complete** (35 completed hours / 44 total hours). All AAP-specified code deliverables (11 files, 1,226 net source lines) are fully implemented, compiled, tested, and validated. The remaining 9 hours consist entirely of path-to-production configuration and operational tasks that require human decisions (production TLS certificates, CORS origin list, rate limit store selection, deployment verification).

### Critical Path to Production

1. **TLS Certificates** — The single highest-impact remaining item. Without production certificates, the HTTPS server will not start, leaving traffic unencrypted.
2. **Environment Variables** — CORS_ORIGINS and rate-limit parameters must be configured for production traffic patterns.
3. **Redis Rate Limit Store** — Required for any deployment with more than one server instance.

### Production Readiness Assessment

| Dimension | Status | Notes |
|-----------|--------|-------|
| Code completeness | ✅ Ready | All AAP deliverables implemented and tested |
| Security headers | ✅ Ready | 11+ headers active on every response |
| Input validation | ✅ Ready | Middleware available; applied when POST/PUT routes are added |
| Rate limiting | ⚠️ Partial | Functional with in-memory store; Redis needed for multi-instance |
| CORS policy | ⚠️ Partial | Active with localhost default; production origins need configuration |
| HTTPS/TLS | ⚠️ Partial | Code ready; production certificates required |
| Test coverage | ✅ Ready | 30/30 tests passing |
| Dependency security | ✅ Ready | 0 npm audit vulnerabilities |

---

## 9. Development Guide

### System Prerequisites

| Software | Required Version | Verification Command |
|----------|-----------------|---------------------|
| Node.js | ≥ 18.x (tested with v20.19.5) | `node -v` |
| npm | ≥ 7.x (tested with 10.8.2) | `npm -v` |
| OpenSSL | Any recent version (for TLS cert generation) | `openssl version` |

### Environment Setup

1. **Clone the repository and switch to the feature branch:**

```bash
git clone <repository-url>
cd <repository-directory>
git checkout blitzy-f72e71df-4c41-40a6-8159-612d528c7bfe
```

2. **Install dependencies:**

```bash
CI=true npm install --yes
```

Expected output: packages installed with `0 vulnerabilities` from `npm audit`.

3. **(Optional) Configure environment variables for production:**

```bash
export PORT=3000
export HTTPS_PORT=3443
export CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
export RATE_LIMIT_WINDOW_MS=900000
export RATE_LIMIT_MAX=100
export TLS_CERT_PATH=/path/to/cert.pem
export TLS_KEY_PATH=/path/to/key.pem
```

4. **(Optional) Generate self-signed TLS certificates for development:**

```bash
mkdir -p certs
cd certs
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes -subj '/CN=localhost'
cd ..
```

### Application Startup

```bash
node server.js
```

**Expected output (without TLS certificates):**
```
TLS certificates not found — HTTPS server not started. See certs/README.md for setup instructions.
Server running at http://127.0.0.1:3000/
```

**Expected output (with TLS certificates):**
```
Server running at http://127.0.0.1:3000/
HTTPS Server running at https://127.0.0.1:3443/
```

### Verification Steps

1. **Verify server is responding:**

```bash
curl http://localhost:3000/
```
Expected: `Hello, World!`

2. **Verify security headers:**

```bash
curl -sI http://localhost:3000/ | grep -iE '(content-security-policy|strict-transport-security|x-content-type-options|cross-origin|referrer-policy|x-dns)'
```

3. **Verify X-Powered-By is absent:**

```bash
curl -sI http://localhost:3000/ | grep -i x-powered-by
```
Expected: empty output (no match)

4. **Verify CORS for allowed origin:**

```bash
curl -sI -H "Origin: http://localhost:3000" http://localhost:3000/ | grep -i access-control
```
Expected: `Access-Control-Allow-Origin: http://localhost:3000`

5. **Verify rate limit headers:**

```bash
curl -sI http://localhost:3000/ | grep -i ratelimit
```
Expected: `ratelimit` and `ratelimit-policy` headers present

6. **Run the full test suite:**

```bash
CI=true npx jest --watchAll=false --ci
```
Expected: `Test Suites: 4 passed, 4 total` / `Tests: 30 passed, 30 total`

7. **Run dependency vulnerability scan:**

```bash
npm audit
```
Expected: `found 0 vulnerabilities`

### Troubleshooting

| Issue | Cause | Resolution |
|-------|-------|------------|
| `Cannot find module 'express'` | Dependencies not installed | Run `CI=true npm install --yes` |
| `HTTPS server not started` warning | TLS certificates not present at configured path | Generate self-signed certs (see step 4 above) or set `TLS_CERT_PATH`/`TLS_KEY_PATH` env vars |
| `EADDRINUSE` on port 3000 | Another process using port 3000 | Kill the process: `lsof -ti:3000 \| xargs kill` or set `PORT=3001` |
| CORS blocking in browser | Origin not in allowlist | Add your origin to `CORS_ORIGINS` env var (comma-separated) |
| 429 Too Many Requests | Rate limit exceeded | Wait 15 minutes or increase `RATE_LIMIT_MAX` env var for testing |
| Tests fail with timeout | Rate limit exhausted in test run | Restart test runner (in-memory counters reset on process restart) |

---

## 10. Appendices

### A. Command Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `npm start` | Start the server (`node server.js`) |
| `npm test` | Run test suite (`jest --watchAll=false`) |
| `npx jest --watchAll=false --ci` | Run tests in CI mode |
| `npm audit` | Scan dependencies for vulnerabilities |
| `node --check server.js` | Syntax-check server.js without executing |

### B. Port Reference

| Port | Protocol | Service | Configurable Via |
|------|----------|---------|-----------------|
| 3000 | HTTP | Express application server | `PORT` env var |
| 3443 | HTTPS | Express TLS-encrypted server | `HTTPS_PORT` env var |

### C. Key File Locations

| File | Purpose |
|------|---------|
| `server.js` | Application entry point — Express app with security middleware and HTTPS bootstrap |
| `config/security.js` | Centralized security configuration — CORS, rate-limit, helmet, TLS settings |
| `middleware/security.js` | Security middleware exports — helmet, cors, rate-limit middleware instances |
| `middleware/validation.js` | Input validation middleware — sanitization chains, error handler, Content-Type enforcement |
| `certs/README.md` | TLS certificate documentation — generation, placement, and security instructions |
| `package.json` | Dependency manifest — 5 production + 2 dev dependencies with pinned versions |
| `tests/security/test_security_headers.js` | 11 tests validating all helmet-set security headers |
| `tests/security/test_rate_limiting.js` | 5 tests validating rate limit enforcement and headers |
| `tests/security/test_cors.js` | 7 tests validating CORS origin policy and preflight |
| `tests/security/test_input_validation.js` | 7 tests validating input handling and error responses |

### D. Technology Versions

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.19.5 | JavaScript runtime |
| npm | 10.8.2 | Package manager |
| Express | 4.22.1 | Web framework |
| Helmet | 8.1.0 | HTTP security headers |
| cors | 2.8.6 | CORS middleware |
| express-rate-limit | 8.3.2 | Rate limiting middleware |
| express-validator | 7.3.1 | Input validation middleware |
| Jest | 29.7.0 | Test runner |
| Supertest | 7.2.2 | HTTP assertion library |

### E. Environment Variable Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server listening port |
| `HTTPS_PORT` | `3443` | HTTPS server listening port |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per IP per window |
| `TLS_CERT_PATH` | `./certs/cert.pem` | Path to TLS certificate PEM file |
| `TLS_KEY_PATH` | `./certs/key.pem` | Path to TLS private key PEM file |

### F. Developer Tools Guide

| Tool | Command | Usage |
|------|---------|-------|
| Syntax check all JS files | `for f in server.js config/security.js middleware/security.js middleware/validation.js; do node --check $f && echo "✓ $f"; done` | Verify all source files parse without errors |
| Run specific test file | `npx jest tests/security/test_security_headers.js --watchAll=false` | Execute a single test suite |
| Check dependency tree | `npm ls --depth=0` | List top-level installed packages |
| Verify headers manually | `curl -sI http://localhost:3000/` | Inspect all response headers |
| Test CORS manually | `curl -sI -H "Origin: http://example.com" http://localhost:3000/` | Verify CORS for a specific origin |

### G. Glossary

| Term | Definition |
|------|-----------|
| CSP | Content-Security-Policy — HTTP header that restricts which resources can be loaded |
| HSTS | HTTP Strict-Transport-Security — header instructing browsers to only use HTTPS |
| CORS | Cross-Origin Resource Sharing — mechanism allowing controlled cross-origin requests |
| OWASP | Open Web Application Security Project — organization providing security best practices |
| TLS | Transport Layer Security — cryptographic protocol for secure communication |
| DDoS | Distributed Denial of Service — attack flooding a server with excessive requests |
| XSS | Cross-Site Scripting — injection attack where malicious scripts execute in victim's browser |
| COOP | Cross-Origin-Opener-Policy — header isolating browsing context from cross-origin documents |
| CORP | Cross-Origin-Resource-Policy — header controlling which origins can load a resource |