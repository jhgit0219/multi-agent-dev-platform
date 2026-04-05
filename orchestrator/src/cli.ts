import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { parseConfig } from './config/parser';
import { loadConfigFromFile } from './config/parser';
import { Orchestrator } from './orchestrator';
import { bridgeToDashboard } from './bridge';
import type { TeamDefinition } from './teams/types';

const DEFAULT_TEAMS: Record<string, TeamDefinition> = {
  feature: {
    name: 'feature',
    role: 'Feature Team',
    systemPrompt: 'You are the feature planning team. Analyze requirements, propose architecture, and create a prioritized backlog.',
    standards: ['frontend/react-typescript.md', 'backend/python-fastapi.md', 'database/query-safety.md'],
    tools: [],
    guardrails: [],
  },
  dev: {
    name: 'dev',
    role: 'Dev Team',
    systemPrompt: 'You are the development team. Implement code following standards and the backlog.',
    standards: ['frontend/react-typescript.md', 'backend/python-fastapi.md', 'backend/clean-python.md'],
    tools: ['write_file', 'run_command'],
    guardrails: ['Never delete production data', 'Always write tests for new code'],
  },
  test: {
    name: 'test',
    role: 'Test Team',
    systemPrompt: 'You are the testing team. Generate and run unit, integration, and scenario tests.',
    standards: ['testing/unit-testing.md', 'testing/integration-testing.md', 'testing/scenario-testing.md'],
    tools: ['run_command', 'read_file'],
    guardrails: [],
  },
  security: {
    name: 'security',
    role: 'Security Team',
    systemPrompt: 'You are the security audit team. Scan for vulnerabilities and verify OWASP compliance.',
    standards: ['security/owasp-checklist.md', 'security/auth-patterns.md', 'security/data-protection.md'],
    tools: [],
    guardrails: [],
  },
  devops: {
    name: 'devops',
    role: 'DevOps Team',
    systemPrompt: 'You are the DevOps team. Generate deployment configs, CI/CD pipelines, and infrastructure files.',
    standards: ['devops/docker.md', 'devops/ci-cd.md', 'devops/env-management.md'],
    tools: ['write_file'],
    guardrails: [],
  },
};

export async function run(projectRoot: string, prompt: string): Promise<void> {
  const configPath = resolve(projectRoot, 'studio.config.json');
  const config = existsSync(configPath) ? loadConfigFromFile(configPath) : parseConfig({});

  const standardsDir = resolve(projectRoot, '..', 'standards');
  const orchestrator = new Orchestrator({
    config,
    projectRoot,
    standardsDir,
    teamDefinitions: DEFAULT_TEAMS,
  });

  orchestrator.on('phase:start', ({ phase, team }) => {
    console.log(`[${phase}] Starting ${team} team...`);
  });

  orchestrator.on('phase:complete', ({ phase, team }) => {
    console.log(`[${phase}] ${team} team complete.`);
  });

  orchestrator.on('iteration:complete', ({ iteration, finalPhase }) => {
    console.log(`Iteration ${iteration} finished in ${finalPhase} phase.`);
  });

  await orchestrator.runIteration(prompt);
}
