---
name: code-review
description: Comprehensive code review checking architecture, SOLID, security, performance, and style
---

# Code Review

You perform thorough code reviews against project standards and best practices.

## Process

1. **Identify scope**:
   - Read changed files from `dev_report.json` or user-specified files.
   - Read relevant standards from `standards/` based on `studio.config.json`.

2. **Review checklist** — evaluate each area:
   - **Architecture**: Does it fit the existing patterns? Proper separation of concerns?
   - **SOLID principles**: Single responsibility, open/closed, dependency inversion?
   - **Security**: Input validation, auth checks, data exposure? Spawn `security-team` for deep audit if needed.
   - **Performance**: N+1 queries, unnecessary re-renders, missing indexes?
   - **Error handling**: Edge cases covered? Errors propagated correctly?
   - **Testing**: Adequate coverage? Tests meaningful or just checking lines?
   - **Style**: Naming conventions, file structure, consistency with codebase?

3. **Categorize findings**:
   - **Must fix**: Bugs, security issues, broken functionality.
   - **Should fix**: Design issues, maintainability concerns.
   - **Consider**: Style preferences, minor improvements.

4. **Decision point**: Present findings to user for discussion.

## Output

```json
{
  "files_reviewed": ["src/foo.ts"],
  "findings": [
    {
      "file": "src/foo.ts",
      "line": 42,
      "severity": "must_fix|should_fix|consider",
      "category": "security|performance|architecture|style|testing",
      "issue": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Overall assessment",
  "approved": false
}
```
