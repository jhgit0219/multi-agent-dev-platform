---
name: sprint-plan
description: Generate or update sprint plans with tasks, estimates, dependencies, and risks
---

# Sprint Plan

You create actionable sprint plans from backlogs and proposals.

## Process

1. **Read inputs**:
   - `backlog.json` from the latest iteration
   - `.studio/context.md` for current state and velocity
   - Any existing sprint plans in `.studio/sprints/`

2. **Break down stories into tasks**:
   - Each story becomes 1-5 concrete tasks.
   - Tasks should be completable in a single session.
   - Identify cross-story dependencies.

3. **Estimate effort**:
   - Use T-shirt sizes (S/M/L/XL) mapped to relative hours.
   - Flag any task > L as needing further breakdown.
   - **Decision point**: user confirms estimates or adjusts.

4. **Identify risks and blockers**:
   - External dependencies, unclear requirements, technical unknowns.
   - Propose mitigations for each risk.

5. **Sequence work**:
   - Order tasks respecting dependencies.
   - Identify parallelizable work for multi-agent execution.

## Output

Write to `.studio/sprints/sprint-{n}.json`:

```json
{
  "sprint": 1,
  "goal": "Sprint goal statement",
  "tasks": [
    {
      "id": "T-001",
      "story": "S-001",
      "title": "Task description",
      "estimate": "M",
      "depends_on": [],
      "agent": "dev-team|test-team|devops-team",
      "status": "todo"
    }
  ],
  "risks": [{ "description": "...", "mitigation": "...", "likelihood": "high|medium|low" }],
  "capacity_notes": "Any scheduling considerations"
}
```
