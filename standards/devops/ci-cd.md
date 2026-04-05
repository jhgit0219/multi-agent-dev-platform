# CI/CD

## Pipeline Stages
1. Lint (fast feedback)
2. Unit tests
3. Build
4. Integration tests
5. Security scan
6. Deploy to staging
7. Smoke tests
8. Deploy to production (manual gate)

## Rules
- Pipeline must pass before merge
- No skipping stages; fix failures, don't bypass
- Cache dependencies between runs
- Parallel jobs where possible (lint + unit tests)

## Deployment
- Blue/green or rolling deploys, never overwrite in place
- Automated rollback on health check failure
- Deploy artifacts, not source code (build once, deploy many)
- Environment-specific config via env vars, not build flags

## Secrets
- Never echo secrets in CI logs
- Use CI platform's secret management
- Rotate CI credentials on schedule
- Minimum permissions per pipeline step
