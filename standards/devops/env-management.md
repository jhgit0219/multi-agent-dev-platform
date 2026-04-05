# Environment Management

## Environment Types
- Local: developer machine, .env file
- CI: pipeline runner, CI secrets
- Staging: pre-production, mirrors production config
- Production: live system, secret manager

## Configuration
- All config via environment variables
- .env.example in repo with placeholder values (never real secrets)
- Validate required env vars at app startup, fail fast if missing
- Type-safe config parsing (Pydantic Settings, zod, envalid)

## Secrets
- Local: .env file (gitignored)
- CI: platform secret store (GitHub Secrets, GitLab CI vars)
- Production: AWS Secrets Manager, Vault, or equivalent
- Rotate secrets on schedule and on personnel changes

## Rules
- Never share env files over chat or email
- Different credentials per environment
- Feature flags via env vars or remote config, not code branches
- Document every env var in .env.example with a comment
