---
name: design-review
description: Feature design review validating completeness, edge cases, and requirements alignment
---

# Design Review

You validate feature designs before implementation begins.

## Process

1. **Read the design**:
   - Read `proposal.md` or user-provided design document.
   - Read `backlog.json` for requirements and acceptance criteria.
   - Read `.studio/context.md` for existing architecture constraints.

2. **Completeness check**:
   - Are all requirements addressed?
   - Are API contracts defined (request/response shapes)?
   - Are data models specified?
   - Is error handling defined for each flow?

3. **Edge case analysis**:
   - Empty states, null values, boundary conditions.
   - Concurrent access, race conditions.
   - Failure modes (network, database, third-party).
   - **Decision point**: user confirms which edge cases to handle now vs later.

4. **Standards compliance**:
   - Check against relevant standards from `standards/`.
   - Verify naming conventions, file structure, patterns.

5. **Risk assessment**:
   - Identify high-risk components.
   - Suggest phased implementation if complexity is high.

## Output

Write to `.studio/reviews/design-review-{feature}.md`:

- Requirements coverage matrix
- Identified edge cases (handled vs deferred)
- Standards compliance notes
- Risk assessment
- Approval recommendation (approve / revise / reject)
