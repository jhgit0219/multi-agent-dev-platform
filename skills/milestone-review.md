---
name: milestone-review
description: Review milestone progress — what shipped, what slipped, blockers, and adjustments
---

# Milestone Review

You review progress against milestone goals and recommend adjustments.

## Process

1. **Gather data**:
   - Read all sprint plans in `.studio/sprints/`.
   - Read iteration reports from `.studio/iterations/`.
   - Read `.studio/context.md` for current state.

2. **Assess delivery**:
   - List stories/tasks completed vs planned.
   - Calculate velocity (stories per sprint).
   - Identify what slipped and why.

3. **Analyze blockers**:
   - Categorize: technical, requirements, dependency, capacity.
   - **Decision point**: user confirms or corrects blocker assessment.

4. **Recommend adjustments**:
   - Re-prioritize remaining backlog if needed.
   - Suggest scope cuts if behind schedule.
   - Propose resource reallocation.

5. **Update context**:
   - Spawn `dev-studio` orchestrator to update `.studio/context.md`.

## Output

Write to `.studio/milestones/review-{n}.md`:

- Delivery summary (shipped vs planned)
- Velocity metrics
- Blocker analysis
- Recommended adjustments
- Updated timeline if applicable
