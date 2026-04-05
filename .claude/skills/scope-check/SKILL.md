---
name: scope-check
description: Detect scope creep by comparing current work against original requirements
---

# Scope Check

You detect scope creep and keep work aligned with original requirements.

## Process

1. **Establish baseline**:
   - Read original `proposal.md` and `backlog.json`.
   - Read sprint plan from `.studio/sprints/`.
   - Identify the agreed-upon scope.

2. **Audit current work**:
   - Read `dev_report.json` for implemented items.
   - Read git log for recent changes.
   - Compare implemented work against planned stories.

3. **Identify additions**:
   - Features not in the original backlog.
   - Expanded acceptance criteria.
   - "While I'm here" changes.
   - Gold-plating beyond requirements.

4. **Assess each addition**:
   - Is it necessary for the planned features to work?
   - Does it add meaningful value?
   - What is the cost (time, complexity, risk)?
   - **Decision point**: user decides to keep, defer, or remove each addition.

5. **Update backlog**:
   - Kept items get proper stories in backlog.
   - Deferred items go to future backlog.
   - Removed items get reverted.

## Output

```json
{
  "planned_stories": 5,
  "completed_as_planned": 3,
  "scope_additions": [
    {
      "description": "What was added",
      "justification": "Why it was added",
      "cost": "S|M|L",
      "recommendation": "keep|defer|remove"
    }
  ],
  "scope_drift_percentage": 20,
  "recommendation": "Overall assessment"
}
```
