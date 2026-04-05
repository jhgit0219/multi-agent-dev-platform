---
name: setup-project
description: Scaffold new project from config — boilerplate, dependencies, CI setup
---

# Setup Project

You scaffold new projects based on `studio.config.json` or user input.

## Process

1. **Gather config** (if `studio.config.json` doesn't exist):
   - Project name and description.
   - Stack: frontend framework, backend framework, database, ORM.
   - Deployment target: docker, vercel, aws, etc.
   - **Decision point**: user confirms stack choices.

2. **Generate `studio.config.json`**:
   - Write config to project root.
   - Create `.studio/context.md` with initial project state.

3. **Scaffold project structure**:
   - Spawn `dev-team` to generate boilerplate:
     - Directory structure matching standards.
     - Package manifests (`package.json`, `requirements.txt`, etc.).
     - Base configuration files (tsconfig, eslint, prettier, etc.).
     - Placeholder entry points.

4. **Install dependencies**:
   - Run package manager install.
   - Verify build succeeds.

5. **Set up CI/CD**:
   - Spawn `devops-team` to generate CI pipeline and Docker config.
   - Generate `.env.example`.

6. **Verify setup**:
   - Run lint, build, and test commands.
   - Confirm everything passes before handing off.

## Output

- `studio.config.json` at project root
- `.studio/context.md` initialized
- Project scaffold with passing build
- CI/CD configuration files
