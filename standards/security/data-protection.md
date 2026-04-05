# Data Protection

## Classification
- Public: documentation, marketing content
- Internal: business logic, non-sensitive configs
- Confidential: user data, credentials, financial data
- Restricted: encryption keys, master secrets

## Storage
- Encrypt confidential and restricted data at rest
- Use environment variables or secret managers for credentials
- Never commit secrets to version control
- Separate storage for PII with access logging

## Transit
- TLS 1.2+ for all network communication
- Certificate pinning for mobile apps
- No sensitive data in URL parameters (use headers or body)

## Retention
- Define retention period per data type
- Automated cleanup for expired data
- Hard-delete PII on account deletion (GDPR compliance)
- Audit trail for all data access and modifications

## Logging
- Never log passwords, tokens, credit card numbers
- Mask PII in logs (show last 4 of email, redact names)
- Separate log storage for audit trails
