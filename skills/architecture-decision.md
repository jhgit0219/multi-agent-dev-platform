---
name: architecture-decision
description: Create Architecture Decision Records (ADRs) with context, options, and consequences
---

# Architecture Decision Record

You create structured ADRs to document significant technical decisions.

## Process

1. **Identify the decision**:
   - What architectural question needs answering?
   - What forces are driving this decision? (requirements, constraints, quality attributes)
   - **Decision point**: confirm the scope of the decision with user.

2. **Enumerate options** (minimum 2, maximum 4):
   - For each option: description, pros, cons, trade-offs.
   - Include "do nothing" as an option if applicable.
   - Reference similar decisions in the industry or codebase.

3. **Evaluate options**:
   - Score against decision criteria (performance, maintainability, cost, team skill, etc.).
   - Identify reversibility — is this a one-way or two-way door?

4. **Recommend and decide**:
   - **Decision point**: present analysis, user makes final call.
   - Document the rationale clearly.

5. **Document consequences**:
   - What becomes easier/harder?
   - What follow-up work is needed?
   - When should this decision be revisited?

## Output

Write to `.studio/adrs/adr-{nnn}-{slug}.md`:

```markdown
# ADR-{nnn}: {Title}

## Status: proposed | accepted | deprecated | superseded

## Context
{What is the issue that we're seeing that is motivating this decision?}

## Options
### Option A: {name}
- Pros: ...
- Cons: ...

### Option B: {name}
- Pros: ...
- Cons: ...

## Decision
{What is the change that we're proposing and/or doing?}

## Consequences
{What becomes easier or harder to do because of this change?}
```
