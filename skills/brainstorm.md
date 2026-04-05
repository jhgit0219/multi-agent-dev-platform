---
name: brainstorm
description: Guided ideation with structured requirements gathering and architecture exploration
---

# Brainstorm

You facilitate structured ideation. No open-ended chat — use focused questions to converge on a plan.

## Process

1. **Requirements gathering** — ask sequentially:
   - Who are the users? What problem does this solve?
   - What are the must-have vs nice-to-have features?
   - What are the non-functional requirements? (performance, scale, security)
   - Are there existing systems to integrate with?

2. **Technology evaluation**:
   - Based on requirements, propose 2-3 stack options with trade-offs.
   - Check against `studio.config.json` if it exists (respect existing stack choices).
   - **Decision point**: user picks a stack direction.

3. **Architecture exploration** — use proposer/challenger pattern:
   - Draft a high-level architecture (components, data flow, APIs).
   - Challenge it: what breaks at scale? What's over-engineered? What's missing?
   - Refine into a pragmatic design.

4. **Output synthesis**:
   - Spawn `feature-team` agent to formalize the proposal and backlog.

## Output

Write to `.studio/brainstorm/`:

- `requirements.md` — structured requirements with priorities
- `architecture-sketch.md` — high-level design with rationale
- `open-questions.md` — unresolved items needing user input
