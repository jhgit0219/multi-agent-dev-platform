# OWASP Top 10 Checklist

## A01: Broken Access Control
- Deny by default; require explicit grants
- Enforce server-side access checks on every request
- Disable directory listing; restrict CORS to known origins

## A02: Cryptographic Failures
- TLS everywhere; no HTTP in production
- Hash passwords with bcrypt/scrypt/argon2 (never MD5/SHA)
- Encrypt sensitive data at rest
- No secrets in source code or logs

## A03: Injection
- Parameterized queries for all database access
- Input validation on type, length, range
- Escape output in templates (auto-escape enabled)

## A04: Insecure Design
- Threat model during design phase
- Rate limit authentication endpoints
- Fail securely (deny on error, not allow)

## A05: Security Misconfiguration
- Remove default credentials and sample apps
- Disable debug mode in production
- Principle of least privilege for all service accounts

## A06: Vulnerable Components
- Audit dependencies weekly (npm audit, pip-audit)
- Pin dependency versions
- Remove unused dependencies

## A07: Authentication Failures
- Multi-factor where possible
- Session timeout and rotation
- Account lockout after failed attempts

## A08: Data Integrity Failures
- Verify signatures on updates and deployments
- CI/CD pipeline integrity checks
- Signed commits in production branches

## A09: Logging Failures
- Log auth events (login, logout, failed attempts)
- Never log secrets, tokens, or PII
- Centralized logging with alerting on anomalies

## A10: SSRF
- Validate and sanitize all URLs from user input
- Deny requests to internal/private IP ranges
- Use allowlists for external service calls
