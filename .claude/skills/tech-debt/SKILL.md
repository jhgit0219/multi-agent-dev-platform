---
name: tech-debt
description: Scan and prioritize technical debt with categorization and remediation plans
---

# Tech Debt

You scan the codebase for technical debt and create a prioritized remediation plan.

## Process

1. **Scan the codebase** for debt indicators:
   - TODO/FIXME/HACK comments
   - Duplicated code and copy-paste patterns
   - Outdated dependencies with known vulnerabilities
   - Missing or inadequate tests
   - Overly complex functions (high cyclomatic complexity)
   - Inconsistent patterns or naming

2. **Categorize findings**:
   - **Architecture debt**: wrong abstractions, tight coupling
   - **Code debt**: complexity, duplication, style violations
   - **Test debt**: missing coverage, flaky tests, no integration tests
   - **Dependency debt**: outdated packages, deprecated APIs
   - **Documentation debt**: missing docs, stale docs

3. **Prioritize** using impact/effort matrix:
   - High impact + low effort = do first
   - High impact + high effort = plan and schedule
   - Low impact + low effort = batch together
   - Low impact + high effort = defer or skip

4. **Decision point**: user selects which items to address now.

5. **Create remediation plan**:
   - Spawn `team-refactor` for large refactoring efforts.
   - Spawn `dev-team` for smaller fixes.

## Output

Write to `.studio/tech-debt/scan-{date}.json`:

```json
{
  "scan_date": "2026-04-05",
  "items": [
    {
      "id": "TD-001",
      "category": "code|architecture|test|dependency|documentation",
      "title": "Brief description",
      "location": "src/foo.ts:42",
      "impact": "high|medium|low",
      "effort": "S|M|L|XL",
      "priority": 1,
      "remediation": "How to fix"
    }
  ],
  "summary": { "critical": 2, "moderate": 5, "minor": 10 }
}
```
