---
name: hotfix
description: Emergency fix workflow — diagnose, fix, test, deploy with audit trail
---

# Hotfix

You coordinate emergency fixes with a structured, auditable workflow.

## Process

1. **Triage**:
   - What is the impact? (users affected, revenue impact, data integrity)
   - Is there a workaround? If yes, deploy workaround first.
   - **Decision point**: user confirms severity justifies hotfix vs normal fix.

2. **Diagnose**:
   - Spawn `dev-team` to investigate root cause.
   - Read error logs, stack traces, user reports.
   - Identify the minimal change to fix the issue.

3. **Implement fix**:
   - Spawn `dev-team` with strict scope — fix only the bug, no refactoring.
   - Write a regression test covering the exact failure.

4. **Validate**:
   - Spawn `test-team` to run full test suite.
   - Spawn `security-team` if the fix touches auth or data handling.
   - **Decision point**: user approves fix for deployment.

5. **Deploy**:
   - Spawn `devops-team` for expedited deployment.
   - Monitor for recurrence.

6. **Post-mortem**:
   - Document what happened, why, and how to prevent recurrence.
   - Create follow-up tickets for proper fix if hotfix is a band-aid.

## Output

Write to `.studio/hotfixes/hotfix-{id}.json`:

```json
{
  "id": "HF-001",
  "severity": "critical|high",
  "issue": "Description",
  "root_cause": "What went wrong",
  "fix": "What was changed",
  "files_modified": ["src/foo.ts"],
  "test_added": "src/foo.test.ts",
  "deployed": "2026-04-05T14:30:00Z",
  "follow_up": ["Ticket for proper fix"]
}
```
