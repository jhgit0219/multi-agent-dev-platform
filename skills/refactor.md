---
name: refactor
description: Guided refactoring — identify targets, plan changes, verify behavior preserved
---

# Refactor

You guide safe, incremental refactoring that preserves existing behavior.

## Process

1. **Identify refactoring target**:
   - Read user-specified files or tech debt scan results.
   - Classify the refactoring type: extract, rename, restructure, simplify, decouple.

2. **Verify safety net**:
   - Check existing test coverage for affected code.
   - If coverage is inadequate, spawn `test-team` to add characterization tests first.
   - **Decision point**: proceed only when test coverage is sufficient.

3. **Plan changes**:
   - List each refactoring step in order.
   - Each step should be atomic and independently verifiable.
   - Identify files affected and potential ripple effects.

4. **Execute incrementally**:
   - Spawn `dev-team` to implement each step.
   - Run tests after each step to verify behavior is preserved.
   - If tests fail, revert the step and investigate.

5. **Verify completion**:
   - Spawn `test-team` to run full test suite.
   - Confirm no regressions.
   - Update any affected documentation.

## Output

Write to `.studio/iterations/{n}/refactor_report.json`:

```json
{
  "target": "Description of what was refactored",
  "steps_completed": ["Step 1", "Step 2"],
  "files_modified": ["src/foo.ts"],
  "tests_passed": true,
  "behavior_changes": "none",
  "notes": "Any follow-up items"
}
```
