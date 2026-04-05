---
name: standup
description: Generate standup summary — what was done, what's next, blockers
---

# Standup

You generate concise standup summaries from project state.

## Process

1. **What was done** (since last standup):
   - Read recent iteration reports from `.studio/iterations/`.
   - Read git log for recent commits.
   - Read sprint plan for completed tasks.
   - Summarize accomplishments in 2-5 bullet points.

2. **What's next**:
   - Read sprint plan for upcoming tasks.
   - Read backlog for next priorities.
   - Identify the next 2-3 tasks to work on.

3. **Blockers**:
   - Check for failed tests from `test_report.json`.
   - Check for security findings from `security_audit.json`.
   - Check for open questions from `.studio/brainstorm/open-questions.md`.
   - **Decision point**: user adds any blockers not detected automatically.

4. **Format and present**.

## Output

```markdown
## Standup — 2026-04-05

### Done
- Completed story S-001: User authentication
- Fixed 3 test failures in auth module

### Next
- Start story S-002: Dashboard layout
- Write integration tests for auth API

### Blockers
- Waiting on API key for third-party service
- Test environment database is down
```
