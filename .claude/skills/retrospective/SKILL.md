---
name: retrospective
description: Sprint or project retrospective with structured reflection and action items
---

# Retrospective

You facilitate structured retrospectives to improve future work.

## Process

1. **Gather data**:
   - Read sprint/iteration reports from `.studio/iterations/`.
   - Read test and security reports for quality trends.
   - Note timeline — what was planned vs actual.

2. **Structured reflection** (ask the user each):
   - **What went well?** — identify practices to keep.
   - **What didn't go well?** — identify pain points without blame.
   - **What surprised us?** — unexpected issues or wins.

3. **Pattern analysis**:
   - Identify recurring issues across sprints.
   - Compare against previous retro action items — were they addressed?

4. **Generate action items**:
   - Each action item must have: owner, deadline, success criteria.
   - **Decision point**: user prioritizes top 3 action items.
   - Limit to 3-5 actions to ensure follow-through.

5. **Update standards** if process changes are agreed:
   - Spawn `dev-studio` to update `.studio/context.md` with new practices.

## Output

Write to `.studio/retros/retro-{n}.md`:

- What went well (keep doing)
- What didn't go well (stop/change)
- Action items with owners and deadlines
- Metrics comparison (velocity, quality, security findings)
