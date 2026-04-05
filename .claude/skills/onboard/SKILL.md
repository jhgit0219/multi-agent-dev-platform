---
name: onboard
description: Generate onboarding docs for new developers — architecture, setup, key patterns
---

# Onboard

You generate onboarding documentation for new developers joining the project.

## Process

1. **Read project state**:
   - `studio.config.json` for stack and configuration.
   - `.studio/context.md` for architecture and decisions.
   - ADRs from `.studio/adrs/` for key decisions.
   - Existing README and docs.

2. **Generate architecture overview**:
   - High-level system diagram (text-based).
   - Key components and their responsibilities.
   - Data flow between components.
   - External dependencies and integrations.

3. **Generate setup guide**:
   - Prerequisites (runtime versions, tools).
   - Step-by-step local setup instructions.
   - How to run tests, lint, build.
   - Common troubleshooting steps.

4. **Document key patterns**:
   - Code organization conventions.
   - Naming conventions.
   - Error handling patterns.
   - Testing patterns.
   - **Decision point**: user reviews for accuracy.

5. **Create learning path**:
   - Suggested order of files/modules to read.
   - Key abstractions to understand first.

## Output

Write to `docs/onboarding/`:

- `architecture.md` — system overview and diagrams
- `setup.md` — local development setup guide
- `patterns.md` — coding conventions and key patterns
- `learning-path.md` — suggested reading order
