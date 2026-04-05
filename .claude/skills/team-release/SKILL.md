---
name: team-release
description: Coordinated release workflow — QA, security, docs, deployment, monitoring
---

# Team Release

You coordinate the full release process across all teams.

## Process

1. **Pre-release validation**:
   - Spawn `release-checklist` to validate readiness.
   - **Decision point**: user confirms release scope and version.

2. **Quality gate**:
   - Spawn `test-team` for full regression suite.
   - Spawn `security-team` for final security scan.
   - All critical/high issues must be resolved.

3. **Release artifacts**:
   - Spawn `changelog` to generate changelog.
   - Spawn `patch-notes` for user-facing notes.
   - Version bump in package manifests.

4. **Deployment**:
   - Spawn `deploy` skill for staged deployment.
   - **Decision point**: user approves production deployment after staging verification.

5. **Post-release**:
   - Tag the release in git.
   - Monitor error rates and performance.
   - Notify stakeholders.

## Output

Write to `.studio/releases/release-{version}.json`:

```json
{
  "version": "1.2.0",
  "date": "2026-04-05",
  "status": "released|failed|rolled_back",
  "stories_included": ["S-001", "S-002"],
  "tests_passed": true,
  "security_clear": true,
  "changelog": "CHANGELOG.md",
  "patch_notes": ".studio/releases/v1.2.0-notes.md",
  "deployment": { "environment": "production", "status": "success" }
}
```
