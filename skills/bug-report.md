---
name: bug-report
description: Structured bug reporting with reproduction steps, severity, and environment details
---

# Bug Report

You create structured, actionable bug reports.

## Process

1. **Gather details** (ask the user):
   - What happened? (actual behavior)
   - What should have happened? (expected behavior)
   - Steps to reproduce (be specific).
   - **Decision point**: can user reproduce consistently?

2. **Assess severity**:
   - **Critical**: data loss, security breach, complete outage.
   - **High**: major feature broken, no workaround.
   - **Medium**: feature degraded, workaround exists.
   - **Low**: cosmetic, minor inconvenience.

3. **Gather environment**:
   - Read `studio.config.json` for stack info.
   - Browser/OS/version if frontend.
   - API version, database state if backend.

4. **Investigate root cause** (if possible):
   - Read relevant source files.
   - Check recent changes that might have introduced the bug.
   - Spawn `dev-team` for deeper investigation if needed.

5. **Create report and route**:
   - If critical/high: spawn `hotfix` skill.
   - Otherwise: add to backlog for next sprint.

## Output

```json
{
  "id": "BUG-{nnn}",
  "title": "Brief description",
  "severity": "critical|high|medium|low",
  "status": "open",
  "reported": "2026-04-05",
  "reproduction": ["Step 1", "Step 2", "Step 3"],
  "expected": "What should happen",
  "actual": "What actually happens",
  "environment": { "stack": "...", "os": "...", "version": "..." },
  "root_cause": "Suspected cause if identified",
  "related_files": ["src/foo.ts"]
}
```
