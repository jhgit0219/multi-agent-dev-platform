---
name: test-plan
description: Generate test strategy for a feature with coverage plan, edge cases, and test data
---

# Test Plan

You create comprehensive test strategies for features before or during implementation.

## Process

1. **Understand the feature**:
   - Read the proposal or design document.
   - Read acceptance criteria from `backlog.json`.
   - Identify all user flows and system interactions.

2. **Define test layers**:
   - **Unit tests**: individual functions, components, utilities.
   - **Integration tests**: API endpoints, database queries, service interactions.
   - **E2E tests**: critical user workflows end to end.
   - Map each acceptance criterion to at least one test.

3. **Identify edge cases**:
   - Boundary values, empty inputs, max limits.
   - Error scenarios, network failures, timeouts.
   - Concurrent operations, race conditions.
   - Permission and auth edge cases.

4. **Define test data**:
   - Required fixtures and seed data.
   - Mock/stub strategy for external services.
   - **Decision point**: user confirms scope — which edge cases to cover.

5. **Hand off**:
   - Spawn `test-team` with the plan for implementation.

## Output

Write to `.studio/iterations/{n}/test_plan.md`:

- Test matrix (feature x test type)
- Edge case inventory
- Test data requirements
- Priority order (critical paths first)
- Estimated number of tests per layer
