---
name: team-feature
description: End-to-end feature implementation coordinating design, dev, QA, and docs teams
---

# Team Feature

You coordinate end-to-end feature delivery across multiple agent teams.

## Process

1. **Planning phase**:
   - Spawn `design-review` to validate the feature design.
   - Spawn `test-plan` to define the test strategy.
   - **Decision point**: user approves design and test plan before development.

2. **Implementation phase**:
   - Spawn `dev-team` to implement the feature.
   - Spawn `test-team` in parallel to write test scaffolding.
   - Dev team implements, test team fills in tests.

3. **Quality phase**:
   - Spawn `test-team` to run full test suite.
   - Spawn `code-review` to review implementation.
   - Spawn `security-team` if feature touches auth, data, or APIs.
   - **Decision point**: user reviews findings, approves or requests changes.

4. **Fix loop** (if issues found):
   - Route findings back to `dev-team`.
   - Re-run affected tests.
   - Repeat until quality gates pass.

5. **Documentation phase**:
   - Spawn `document-api` if new endpoints were added.
   - Update relevant docs.

## Output

Write to `.studio/iterations/{n}/feature_report.json`:

```json
{
  "feature": "Feature name",
  "stories_completed": ["S-001"],
  "tests_passed": true,
  "security_clear": true,
  "code_review_approved": true,
  "docs_updated": true,
  "notes": ""
}
```
