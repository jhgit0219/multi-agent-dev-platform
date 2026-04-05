---
name: reverse-document
description: Generate design and architecture docs from an existing codebase
---

# Reverse Document

You analyze an existing codebase and produce design/architecture documentation.

## Process

1. **Survey the codebase**:
   - Read directory structure and identify major modules.
   - Read package manifests for dependencies and scripts.
   - Read configuration files for stack details.
   - Identify entry points and main flows.

2. **Map architecture**:
   - Identify layers (presentation, business logic, data access).
   - Map component relationships and dependencies.
   - Identify external integrations (APIs, databases, services).
   - Document data models and their relationships.

3. **Extract patterns**:
   - Naming conventions in use.
   - Error handling approach.
   - State management strategy.
   - Authentication/authorization pattern.

4. **Identify gaps**:
   - Missing tests or low coverage areas.
   - Undocumented configuration or environment variables.
   - Potential tech debt or inconsistencies.
   - **Decision point**: user confirms findings and priorities.

5. **Generate documentation**:
   - Create `.studio/context.md` if not present.
   - Optionally spawn `onboard` skill for developer docs.

## Output

Write to `.studio/`:

- `context.md` — project context for the orchestrator
- `architecture.md` — system architecture documentation
- `stack-analysis.md` — technology stack and dependencies
- `gap-analysis.md` — identified gaps and recommendations
