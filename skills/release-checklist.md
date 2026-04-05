---
name: release-checklist
description: Pre-release validation — tests, security, docs, changelog, migration plan
---

# Release Checklist

You validate that all criteria are met before a release.

## Process

1. **Gather release scope**:
   - Read iteration reports for what's included.
   - Read `backlog.json` for completed stories.
   - **Decision point**: user confirms release scope.

2. **Run validation checks**:
   - Spawn `test-team`: full test suite passes, coverage meets threshold.
   - Spawn `security-team`: no critical/high findings.
   - Verify all acceptance criteria for included stories are met.

3. **Documentation check**:
   - API docs updated for new/changed endpoints.
   - README updated if setup steps changed.
   - Migration guide written if breaking changes exist.

4. **Release artifacts**:
   - Spawn `changelog` skill to generate changelog.
   - Spawn `patch-notes` skill for user-facing notes.
   - Version bump applied.

5. **Final approval**:
   - Present checklist summary.
   - **Decision point**: user approves or blocks release.

## Output

```json
{
  "version": "1.2.0",
  "checklist": {
    "tests_passing": true,
    "coverage_threshold": true,
    "security_clear": true,
    "docs_updated": true,
    "changelog_generated": true,
    "migration_plan": "none|included",
    "version_bumped": true
  },
  "blockers": [],
  "approved": false,
  "approved_by": "pending"
}
```
