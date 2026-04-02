# TLS/SSL Certificates

This directory (`certs/`) is the default location for TLS/SSL certificate files used by the application's HTTPS server. The server reads certificate files from this directory by default, as configured in `config/security.js`.

**No actual certificates are committed to this repository.** Only this README is stored in version control. Certificate files must be generated or obtained separately before the HTTPS server can start.

## Expected Certificate Files

The HTTPS server expects the following two files in this directory:

- **`cert.pem`** — The TLS/SSL certificate file (public certificate). This file contains the server's public key and identity information, and is sent to clients during the TLS handshake.
- **`key.pem`** — The TLS/SSL private key file. This file contains the server's private key used to decrypt incoming TLS traffic and prove server identity.

These files are **NOT** included in the repository and must be generated locally for development or obtained from a trusted Certificate Authority (CA) for production use.

## Generating Self-Signed Certificates for Development

For local development, you can generate a self-signed certificate and private key using OpenSSL. Run the following command from the `certs/` directory:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes -subj '/CN=localhost'
```

### Command Flag Reference

| Flag | Description |
|------|-------------|
| `-x509` | Generate a self-signed certificate (instead of a certificate signing request) |
| `-newkey rsa:4096` | Create a new 4096-bit RSA private key |
| `-keyout key.pem` | Write the private key to `key.pem` |
| `-out cert.pem` | Write the certificate to `cert.pem` |
| `-sha256` | Use the SHA-256 hash algorithm for signing the certificate |
| `-days 365` | Set the certificate validity period to 1 year (365 days) |
| `-nodes` | Do not encrypt the private key with a passphrase (for development use only) |
| `-subj '/CN=localhost'` | Set the certificate Common Name (CN) to `localhost` |

> **Warning:** Self-signed certificates will trigger security warnings in browsers and HTTP clients. They should **ONLY** be used for local development and testing — **never in production**.

## Environment Variable Configuration

The default certificate file paths and HTTPS port can be overridden using environment variables. These are read by `config/security.js` and used by the HTTPS server bootstrap in `server.js`.

| Environment Variable | Description | Default Value |
|---------------------|-------------|---------------|
| `TLS_CERT_PATH` | Path to the TLS/SSL certificate file | `./certs/cert.pem` |
| `TLS_KEY_PATH` | Path to the TLS/SSL private key file | `./certs/key.pem` |
| `HTTPS_PORT` | Port number for the HTTPS server listener | `3443` |

### Example Usage

Start the server with custom certificate paths and HTTPS port:

```bash
TLS_CERT_PATH=/path/to/production/cert.pem TLS_KEY_PATH=/path/to/production/key.pem HTTPS_PORT=443 node server.js
```

Or export the variables in your shell session:

```bash
export TLS_CERT_PATH=/etc/ssl/certs/myapp.pem
export TLS_KEY_PATH=/etc/ssl/private/myapp-key.pem
export HTTPS_PORT=443
node server.js
```

## Production Certificate Instructions

For production deployments, certificates **must** be obtained from a trusted Certificate Authority (CA). Recommended providers include:

- [Let's Encrypt](https://letsencrypt.org/) — Free, automated, and widely trusted CA
- Commercial CAs such as DigiCert, Comodo, or GlobalSign

### Placing Production Certificates

Production certificates can be configured in one of two ways:

1. **Default location:** Place the certificate and key files in this directory as `cert.pem` and `key.pem`:
   ```
   certs/cert.pem    # Public certificate from your CA
   certs/key.pem     # Corresponding private key
   ```

2. **Custom location:** Set the `TLS_CERT_PATH` and `TLS_KEY_PATH` environment variables to point to certificates stored elsewhere on the filesystem (e.g., `/etc/ssl/certs/`).

### HTTPS Server Startup Behavior

The server will **only** start the HTTPS listener if valid certificate files are found at the configured paths. If the certificate or key file is missing, the server gracefully falls back to HTTP-only mode on port `3000`. This means:

- **Certificates present:** Both HTTP (port `3000`) and HTTPS (port `3443` by default) servers start
- **Certificates absent:** Only the HTTP server starts; a warning is logged to the console

## Security Best Practices

### ⚠️ Private Key Protection

**CRITICAL: Private key files (`key.pem`) must NEVER be committed to version control.** Exposing private keys compromises the entire TLS security model, allowing attackers to impersonate the server and decrypt traffic.

### Recommended Practices

- **Add `*.pem` to `.gitignore`** to prevent accidental commits of certificate and key files:
  ```
  # .gitignore
  *.pem
  ```

- **Restrict file permissions** on private keys to owner-only read/write access:
  ```bash
  chmod 600 key.pem
  ```

- **Never use self-signed certificates in production.** Self-signed certificates do not provide trust chain verification and will cause client-side warnings or connection failures.

- **Use TLS 1.2 or higher.** The application enforces modern TLS versions via Node.js defaults. Ensure your certificates and server configuration do not downgrade to TLS 1.0 or 1.1, which have known vulnerabilities.

- **Rotate certificates regularly.** Monitor certificate expiration dates and renew before expiry. Let's Encrypt certificates are valid for 90 days and support automated renewal via `certbot`.

- **Keep private keys secure.** Store private keys in a secrets manager or encrypted filesystem in production environments. Avoid copying keys across systems unnecessarily.

---

## Related Files

| File | Purpose |
|------|---------|
| `config/security.js` | Exports TLS configuration options including `certPath`, `keyPath`, and `httpsPort` defaults |
| `server.js` | Contains the HTTPS server bootstrap logic that reads certificates and starts the TLS listener |
