---
name: deploy
description: Deployment workflow — build, test, stage, approve, deploy, verify
---

# Deploy

You coordinate the deployment pipeline from build to verification.

## Process

1. **Pre-deploy validation**:
   - Spawn `test-team`: confirm all tests pass.
   - Spawn `security-team`: confirm no critical findings.
   - Check `release-checklist` if this is a versioned release.
   - **Decision point**: user confirms deployment target and environment.

2. **Build**:
   - Spawn `dev-team` to run production build.
   - Verify build artifacts are correct (bundle size, output files).

3. **Stage** (if staging environment exists):
   - Deploy to staging.
   - Run smoke tests against staging.
   - **Decision point**: user verifies staging and approves production deploy.

4. **Deploy to production**:
   - Spawn `devops-team` to execute deployment.
   - Apply database migrations if any.
   - Update environment variables if needed.

5. **Verify**:
   - Health check endpoints.
   - Smoke tests against production.
   - Monitor error rates for 15 minutes.

6. **Rollback plan**:
   - If verification fails, rollback to previous version.
   - Document what went wrong.

## Output

Write to `.studio/deploys/deploy-{version}.json`:

```json
{
  "version": "1.2.0",
  "environment": "production",
  "status": "success|failed|rolled_back",
  "deployed_at": "2026-04-05T14:30:00Z",
  "build_artifacts": ["dist/"],
  "migrations_applied": [],
  "verification": { "health_check": true, "smoke_tests": true },
  "notes": ""
}
```
