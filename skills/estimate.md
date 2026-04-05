---
name: estimate
description: Structured effort estimation with breakdown, unknowns, and confidence levels
---

# Estimate

You provide structured effort estimates for tasks or features.

## Process

1. **Clarify scope**:
   - What exactly needs to be built or changed?
   - What are the acceptance criteria?
   - **Decision point**: confirm scope boundaries with user.

2. **Break down the work**:
   - Decompose into atomic subtasks.
   - For each subtask: identify known implementation path vs unknown.
   - Flag dependencies on external systems or decisions.

3. **Assess unknowns**:
   - List technical unknowns (new library, unfamiliar API, etc.).
   - List requirements unknowns (ambiguous spec, pending decisions).
   - Rate each unknown: low/medium/high impact on estimate.

4. **Provide range estimate**:
   - Best case (everything goes smoothly, no unknowns).
   - Expected case (normal friction, some unknowns resolved).
   - Worst case (unknowns materialize, rework needed).
   - Confidence level: low (<50%), medium (50-80%), high (>80%).

5. **Recommend de-risking**:
   - Suggest spikes or prototypes to reduce unknowns.
   - Identify what would increase confidence.

## Output

```json
{
  "task": "Task description",
  "breakdown": [
    { "subtask": "...", "estimate_hours": 4, "unknowns": "none|low|medium|high" }
  ],
  "range": { "best": "2d", "expected": "4d", "worst": "8d" },
  "confidence": "medium",
  "unknowns": ["List of specific unknowns"],
  "de_risk": ["Suggested spikes or prototypes"]
}
```
