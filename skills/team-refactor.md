---
name: team-refactor
description: Coordinated refactoring — architecture review, implementation, testing, migration
---

# Team Refactor

You coordinate large-scale refactoring efforts across multiple teams.

## Process

1. **Assessment phase**:
   - Spawn `tech-debt` to scan and identify targets (if not already done).
   - Spawn `design-review` to evaluate the refactoring approach.
   - Spawn `architecture-decision` to document the rationale as an ADR.
   - **Decision point**: user approves scope and approach.

2. **Preparation phase**:
   - Spawn `test-team` to ensure baseline test coverage exists.
   - Add characterization tests for any uncovered code being touched.
   - Establish before-metrics (performance, complexity, coverage).

3. **Implementation phase**:
   - Spawn `refactor` skill for each refactoring unit.
   - Execute incrementally — each step verified before proceeding.
   - Run tests after each step.

4. **Verification phase**:
   - Spawn `test-team` for full regression suite.
   - Spawn `security-team` if refactoring touched security-sensitive code.
   - Spawn `perf-profile` if refactoring was performance-motivated.
   - Compare after-metrics against before-metrics.

5. **Cleanup**:
   - Remove dead code.
   - Update documentation.
   - **Decision point**: user confirms refactoring is complete.

## Output

Write to `.studio/iterations/{n}/refactor_summary.json`:

```json
{
  "scope": "Description of what was refactored",
  "adr": ".studio/adrs/adr-{nnn}.md",
  "steps_completed": 5,
  "files_modified": 12,
  "tests_passed": true,
  "metrics": { "before": {}, "after": {} },
  "follow_up": ["Any remaining items"]
}
```
