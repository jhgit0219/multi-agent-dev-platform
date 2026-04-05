# Authentication Patterns

## JWT
- Short expiry (15 min access, 7 day refresh)
- Store refresh token server-side (database or Redis)
- Include minimal claims: sub, role, exp
- Rotate refresh tokens on use (one-time use)

## Session
- HttpOnly, Secure, SameSite=Strict cookies
- Server-side session store (Redis preferred)
- Regenerate session ID after authentication
- Absolute timeout (24h) plus idle timeout (30min)

## Password
- bcrypt with cost factor >= 12
- Minimum 8 characters, no maximum under 128
- Check against known breached passwords (HaveIBeenPwned API)
- No password composition rules beyond minimum length

## OAuth
- Use authorization code flow with PKCE
- Validate state parameter to prevent CSRF
- Store tokens server-side, never expose to client
- Request minimum scopes needed

## API Keys
- Prefix keys for identification (e.g., `sk_live_...`)
- Hash stored keys; only show full key once at creation
- Per-key rate limits and scope restrictions
- Key rotation support without downtime
