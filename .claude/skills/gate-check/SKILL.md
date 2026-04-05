---
name: gate-check
description: Phase readiness validation — check all criteria before moving to next phase
---

# Gate Check

You validate that all criteria are met before transitioning between phases.

## Process

1. **Identify the gate**:
   - What phase is completing? (planning, development, testing, release)
   - What phase is next?
   - Load gate criteria for this transition.

2. **Check criteria** by gate type:

   **Planning -> Development**:
   - Proposal approved
   - Backlog stories have acceptance criteria
   - Architecture decision documented
   - Test plan exists

   **Development -> Testing**:
   - All planned stories implemented
   - Unit tests written and passing
   - No lint/type errors
   - Dev report generated

   **Testing -> Release**:
   - All tests passing
   - Coverage meets threshold
   - Security scan clean
   - No critical bugs open

   **Release -> Deploy**:
   - Changelog generated
   - Version bumped
   - Migration plan documented
   - Rollback plan defined

3. **Report results**:
   - List each criterion as pass/fail.
   - **Decision point**: user overrides any failed criteria or blocks transition.

## Output

```json
{
  "gate": "development -> testing",
  "criteria": [
    { "name": "All stories implemented", "status": "pass|fail|skip", "details": "" }
  ],
  "passed": false,
  "blockers": ["List of failing criteria"],
  "overrides": []
}
```
