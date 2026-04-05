# Claude Dev Studio -- Design Document

## Overview

Claude Dev Studio is a multi-agent development platform that takes a project prompt and produces a production-ready application through simulated agile team collaboration. Five specialized teams (Feature, Dev, Test, Security, DevOps) work in iterative cycles with human oversight at key decision points.

Three main parts:

- **Agent System** -- Orchestrator + team agents running as Claude skills by default, swappable to any AI provider.
- **Dashboard** -- React TypeScript web app showing real-time iteration progress, team reports, test results, and logs. Auth-protected with admin/viewer roles.
- **Standards Engine** -- Reference configs and skill definitions encoding best practices per stack. Teams consult these during every phase.

Default stack: Python (FastAPI) + PostgreSQL/MongoDB + React TypeScript. Overridable per project.

Standalone repo: `multi-agent-dev-platform`.

## Project Configuration

Every project has a `studio.config.json` at its root:

```json
{
  "project": {
    "name": "",
    "mode": "new",
    "description": ""
  },
  "stack": {
    "frontend": "react-typescript",
    "backend": "python-fastapi",
    "database": "postgresql",
    "orm": "sqlalchemy"
  },
  "ai": {
    "provider": "claude",
    "model": "claude-sonnet-4-6",
    "api_key_env": "CLAUDE_API_KEY",
    "team_overrides": {}
  },
  "deployment": {
    "target": "local",
    "environments": {
      "staging": { "auto_deploy": true, "branch": "staging" },
      "production": { "auto_deploy": false, "branch": "main" }
    },
    "secrets": {
      "source": "env_file",
      "path": ".env"
    }
  },
  "standards": {
    "frontend": "radix-component-architecture",
    "backend": "clean-python",
    "testing": {
      "min_coverage": 80,
      "required": ["unit", "integration", "scenario"]
    },
    "documentation": "concise-human"
  },
  "workflow": {
    "iteration_style": "agile-iterative",
    "require_human_approval": ["proposal", "deployment", "destructive_db_ops"]
  }
}
```

Key points:

- `ai.team_overrides` lets you assign different providers per team.
- `require_human_approval` defines what always needs sign-off.
- `standards` maps to skill definitions in the Standards Engine.
- `mode` supports `new` now and `migration` later.
- Config is modifiable at any time. Orchestrator reads it at the start of each iteration.

Supported deployment targets: `local`, `render`, `vercel`, `aws`, `railway`, `custom`.

## Agent System Architecture

Two layers: Orchestrator and Team Agents.

### Orchestrator

The main control loop. It:

- Reads `studio.config.json` for stack, provider, and workflow settings.
- Manages iteration state (current story, active team, blockers).
- Routes deliverables between teams.
- Handles all conversation with the human. You never talk directly to a team agent.
- Persists iteration summaries and reports for the dashboard.
- Pushes real-time status events over WebSocket.

In Claude Code, the orchestrator is a skill that spawns sub-agents. In API mode, it's a Python process making calls to whichever provider is configured.

### Team Agents

Each team is defined by:

- A system prompt with role, responsibilities, and constraints.
- Access to specific tools (Dev writes code, Test runs tests, etc.).
- Reference to relevant standards from the Standards Engine.
- Guardrails (no destructive DB ops without human approval).

### Communication

Teams don't talk to each other directly. The orchestrator passes structured handoff documents:

- Feature team: `proposal.md`, `backlog.json`
- Dev team: code commits, `dev_report.json`
- Test team: `test_report.json`
- Security team: `security_audit.json`
- DevOps team: infra configs, `deploy_report.json`

Handoff documents live in `.studio/iterations/<iteration_number>/`.

### Project Context

Provider-agnostic context lives in `.studio/context.md`. This file describes the project structure, key files, and architecture decisions. The orchestrator injects it into every agent's system prompt.

For Claude Code users, the project CLAUDE.md points to `.studio/context.md`.

## Team Breakdown

### Feature Team (Product/Architecture)

- Takes initial prompt and breaks it into epics and user stories.
- Agents discuss among themselves: one proposes, another challenges, a third refines.
- Outputs a structured proposal with tech decisions, data models, API surface, unknowns.
- Presents proposal to human for approval/rejection/modification.
- Produces prioritized backlog.
- On subsequent iterations, reviews progress and picks next stories.
- If external resources are needed (API keys, third-party services), asks the human conversationally.

### Dev Team

- Picks stories from backlog in priority order.
- Writes code following Standards Engine rules.
- Each delivery goes to Test + Security before next story starts.
- Handles bug fixes from Test/Security within the same iteration.

### Test Team

- Runs unit, integration, and scenario tests on every delivery.
- Generates regression suites that grow with each iteration.
- Reports pass/fail with coverage metrics and failure details.
- Blocks progression on critical test failures.

### Security Team

- Audits for vulnerabilities (injection, XSS, auth bypass, etc.).
- Validates DB operations are intentionally scoped (not accidentally destructive).
- Runs every iteration, parallel with Test.

### DevOps Team

- Sets up CI/CD (GitHub Actions by default).
- Manages environment configs, secrets handling.
- Generates Dockerfiles, compose files, platform-specific deployment configs.
- Production deploys always require human approval.

## Agile Iteration Workflow

### Phase 1 -- Planning (Feature Team)

First iteration: Feature team takes prompt, discusses, produces proposal. Human approves/modifies.

Subsequent iterations: Feature team reviews progress, picks next stories.

### Phase 2 -- Build (Dev Team)

Dev picks current story, writes code, commits to feature branch. Produces `dev_report.json`.

### Phase 3 -- Validate (Test + Security, parallel)

Both teams run on Dev output simultaneously.

- Test: unit, integration, scenario tests. Produces `test_report.json`.
- Security: vulnerability scan. Produces `security_audit.json`.

Critical issues loop back to Phase 2. Dev fixes, Phase 3 reruns.

### Phase 4 -- Ship (DevOps Team)

Tests pass, security clears. DevOps updates CI/CD, deploys to staging if auto-deploy is on. Production requires human approval.

### Phase 5 -- Report

Orchestrator compiles iteration summary. Pushes to `.studio/iterations/` and WebSocket.

Next iteration starts.

### Failure Handling

- Test failures: Dev fixes and resubmits. Max 3 retries before escalating to human.
- Security findings: Critical blocks iteration. High/Medium flagged but don't block by default.
- Unresolvable issues: Orchestrator asks human for guidance conversationally.

## Dashboard

React + TypeScript app (Vite). Runs locally or deploys to Vercel as static build.

### Auth

- User accounts in local SQLite.
- Roles: Admin (full control, manage users) and Viewer (read-only).
- JWT sessions.
- First registered user becomes admin. Others need invite.

### Views

- **Project Overview** -- Current project, config summary, iteration count, status.
- **Iteration Timeline** -- Vertical timeline of cycles. Color-coded: green/red/yellow.
- **Team Panels** -- Per-team status, latest report, key output snippets.
- **Log Stream** -- Real-time filterable log. Summary lines, expandable for detail.
- **Reports Archive** -- Browse past iteration reports with summaries, code snippets, test results, GitHub links.
- **User Management** -- Admin only. Invite, assign roles, revoke.

### Data Source

Reads from `.studio/iterations/` for history. WebSocket for real-time updates from the orchestrator.

Small Express backend for auth API and WebSocket server.

## Standards Engine

Lives in `standards/` in the Dev Studio repo.

```
standards/
  frontend/
    react-typescript.md
    radix-components.md
    state-management.md
  backend/
    python-fastapi.md
    clean-python.md
  database/
    query-safety.md
    postgresql.md
    mongodb.md
  testing/
    unit-testing.md
    integration-testing.md
    scenario-testing.md
  security/
    owasp-checklist.md
    auth-patterns.md
    data-protection.md
  documentation/
    writing-style.md
    code-comments.md
    api-docs.md
  devops/
    docker.md
    ci-cd.md
    env-management.md
```

Each file is a concise reference injected into the relevant team's system prompt.

Query safety rules:

- Deletes are fine when they're the explicit purpose of the operation.
- Deletes must be scoped (WHERE clause, never unbounded).
- No accidental deletes as side effects of another operation.
- Bulk deletes or DROP TABLE require soft-delete or backup step first.
- Migrations that remove columns or tables must be reversible.

Standards are overridable per project via `studio.config.json`.

## Migration Support (Future)

Config schema supports `"mode": "migration"` with source/target stack definitions and migration strategies (incremental, full rewrite, replatform only). Implementation deferred until core greenfield flow works.

## Repo Structure

```
multi-agent-dev-platform/
  .studio/                  # Dev Studio's own context
  dashboard/                # React TypeScript app (Vite)
    src/
      components/
      pages/
      hooks/
      api/
      types/
    server/                 # Express backend for auth + WebSocket
  orchestrator/             # Core orchestrator logic
    src/
      providers/            # AI provider abstractions
      teams/                # Team agent definitions and prompts
      workflow/             # Iteration state machine
      config/               # Config parser and validator
  standards/                # Standards Engine reference docs
  skills/                   # Claude Code skill definitions
  docs/
  package.json
  README.md
```
