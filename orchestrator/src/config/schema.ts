import { z } from 'zod';

export const ProjectMode = z.enum(['new', 'migration']);

export const DeploymentTarget = z.enum([
  'local',
  'render',
  'vercel',
  'aws',
  'railway',
  'custom',
]);

const AIProviderConfig = z.object({
  provider: z.string().default('claude'),
  model: z.string().default('claude-sonnet-4-6'),
  api_key_env: z.string().default('CLAUDE_API_KEY'),
});

export const AgentTier = z.enum(['director', 'lead', 'specialist']);

const AgentModelConfig = z.object({
  director: z.string().default('claude-opus-4-6'),
  lead: z.string().default('claude-sonnet-4-6'),
  specialist: z.string().default('claude-sonnet-4-6'),
});

const AgentOverride = z.object({
  model: z.string().optional(),
  provider: z.string().optional(),
  api_key_env: z.string().optional(),
});

export const StudioConfigSchema = z.object({
  project: z
    .object({
      name: z.string().default(''),
      mode: ProjectMode.default('new'),
      description: z.string().default(''),
    })
    .default({
      name: '',
      mode: 'new',
      description: '',
    }),

  stack: z
    .object({
      frontend: z.string().default('react-typescript'),
      backend: z.string().default('python-fastapi'),
      database: z.string().default('postgresql'),
      orm: z.string().default('sqlalchemy'),
    })
    .default({
      frontend: 'react-typescript',
      backend: 'python-fastapi',
      database: 'postgresql',
      orm: 'sqlalchemy',
    }),

  ai: z
    .object({
      provider: z.string().default('claude'),
      model: z.string().default('claude-sonnet-4-6'),
      api_key_env: z.string().default('CLAUDE_API_KEY'),
      team_overrides: z.record(z.string(), AIProviderConfig).default({}),
      agent_models: AgentModelConfig.default({
        director: 'claude-opus-4-6',
        lead: 'claude-sonnet-4-6',
        specialist: 'claude-sonnet-4-6',
      }),
      agent_overrides: z.record(z.string(), AgentOverride).default({}),
    })
    .default({
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
    }),

  deployment: z
    .object({
      target: DeploymentTarget.default('local'),
      environments: z
        .record(
          z.string(),
          z.object({
            auto_deploy: z.boolean().default(false),
            branch: z.string().default('main'),
          }),
        )
        .default({
          staging: { auto_deploy: true, branch: 'staging' },
          production: { auto_deploy: false, branch: 'main' },
        }),
      secrets: z
        .object({
          source: z
            .enum(['env_file', 'github_secrets', 'aws_secrets'])
            .default('env_file'),
          path: z.string().default('.env'),
        })
        .default({ source: 'env_file', path: '.env' }),
    })
    .default({
      target: 'local',
      environments: {
        staging: { auto_deploy: true, branch: 'staging' },
        production: { auto_deploy: false, branch: 'main' },
      },
      secrets: { source: 'env_file', path: '.env' },
    }),

  standards: z
    .object({
      frontend: z.string().default('radix-component-architecture'),
      backend: z.string().default('clean-python'),
      testing: z
        .object({
          min_coverage: z.number().default(80),
          required: z
            .array(z.string())
            .default(['unit', 'integration', 'scenario']),
        })
        .default({
          min_coverage: 80,
          required: ['unit', 'integration', 'scenario'],
        }),
      documentation: z.string().default('concise-human'),
    })
    .default({
      frontend: 'radix-component-architecture',
      backend: 'clean-python',
      testing: {
        min_coverage: 80,
        required: ['unit', 'integration', 'scenario'],
      },
      documentation: 'concise-human',
    }),

  workflow: z
    .object({
      iteration_style: z.string().default('agile-iterative'),
      unattended: z.boolean().default(false),
      require_human_approval: z
        .array(z.string())
        .default(['proposal', 'deployment', 'destructive_db_ops']),
    })
    .default({
      iteration_style: 'agile-iterative',
      unattended: false,
      require_human_approval: ['proposal', 'deployment', 'destructive_db_ops'],
    }),
});

export type StudioConfig = z.infer<typeof StudioConfigSchema>;
