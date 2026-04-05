# Multi-Agent Dev Platform

A multi-agent AI development platform that orchestrates specialized teams to produce applications from a prompt.

## Architecture

- **Orchestrator** — Manages iteration state, routes deliverables between teams, handles human interaction
- **Dashboard** — React TypeScript web app for real-time progress monitoring with auth
- **Standards Engine** — Reference configs and skill definitions encoding best practices per stack

## Teams

| Team     | Role                                                           | Output                                   |
| -------- | -------------------------------------------------------------- | ---------------------------------------- |
| Feature  | Architecture proposals via proposer/challenger/refiner pattern | proposal.md, backlog.json                |
| Dev      | Code generation following standards                            | Code files, dev_report.json              |
| Test     | Test generation and execution                                  | test_report.json                         |
| Security | OWASP compliance and vulnerability scanning                    | security_audit.json                      |
| DevOps   | CI/CD, Docker, deployment configs                              | Infrastructure files, deploy_report.json |

## Setup

```bash
npm install
```

## Configuration

Each project uses a `studio.config.json` at its root. See [design doc](docs/plans/2026-04-05-claude-dev-studio-design.md) for the full schema.

## Development

```bash
# Run orchestrator tests
cd orchestrator && npx vitest run

# Run dashboard server tests
cd dashboard/server && npx vitest run

# Start dashboard server
cd dashboard/server && npx tsx src/index.ts

# Start dashboard frontend
cd dashboard && npx vite dev

# Build dashboard
cd dashboard && npx vite build
```

## Project Structure

```txt
orchestrator/
  src/
    config/         Config schema and parser (Zod)
    providers/      AI provider abstraction (Claude, OpenAI, Ollama)
    workflow/        State machine, handoff documents
    teams/           Team agent implementations
    orchestrator.ts  Main loop
    bridge.ts        Dashboard WebSocket bridge
    cli.ts           CLI entry point

dashboard/
  src/              React frontend (Vite)
  server/src/       Express backend (auth, WebSocket, reports API)

standards/          Reference documents injected into agent prompts
  database/         Query safety, PostgreSQL, MongoDB
  frontend/         React TypeScript, Radix components, state management
  backend/          Python FastAPI, clean Python
  testing/          Unit, integration, scenario testing
  security/         OWASP, auth patterns, data protection
  documentation/    Writing style, code comments, API docs
  devops/           Docker, CI/CD, environment management

skills/             Claude Code skill definitions
```
