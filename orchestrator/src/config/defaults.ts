import type { StudioConfig } from './schema';

export const DEFAULT_CONFIG: StudioConfig = {
  project: { name: '', mode: 'new', description: '' },
  stack: {
    frontend: 'react-typescript',
    backend: 'python-fastapi',
    database: 'postgresql',
    orm: 'sqlalchemy',
  },
  ai: {
    provider: 'claude',
    model: 'claude-sonnet-4-6',
    api_key_env: 'CLAUDE_API_KEY',
    team_overrides: {},
    agent_models: {
      director: 'claude-opus-4-6',
      lead: 'claude-sonnet-4-6',
      specialist: 'claude-sonnet-4-6',
    },
    agent_overrides: {},
  },
  deployment: {
    target: 'local',
    environments: {
      staging: { auto_deploy: true, branch: 'staging' },
      production: { auto_deploy: false, branch: 'main' },
    },
    secrets: { source: 'env_file', path: '.env' },
  },
  standards: {
    frontend: 'radix-component-architecture',
    backend: 'clean-python',
    testing: {
      min_coverage: 80,
      required: ['unit', 'integration', 'scenario'],
    },
    documentation: 'concise-human',
  },
  workflow: {
    iteration_style: 'agile-iterative',
    unattended: false,
    require_human_approval: ['proposal', 'deployment', 'destructive_db_ops'],
  },
};
