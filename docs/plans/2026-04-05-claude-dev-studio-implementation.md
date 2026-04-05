# Claude Dev Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-agent AI development platform that orchestrates five specialized teams to produce production-ready applications from a prompt.

**Architecture:** Provider-agnostic orchestrator manages team agents through structured handoff documents. React TypeScript dashboard shows real-time progress. Standards Engine injects coding rules into agent prompts. Everything configurable via `studio.config.json`.

**Tech Stack:** TypeScript (orchestrator + dashboard), React + Vite (dashboard frontend), Express (dashboard backend), SQLite (dashboard auth), WebSocket (real-time), Zod (config validation), Vitest (testing)

**Design Doc:** `docs/plans/2026-04-05-claude-dev-studio-design.md`

---

## Phase 1: Repo Scaffolding + Config System

Sets up the standalone repo, monorepo structure, and the config parser that everything else depends on.

### Task 1.1: Initialize Repo

**Files:**
- Create: `multi-agent-dev-platform/package.json`
- Create: `multi-agent-dev-platform/.gitignore`
- Create: `multi-agent-dev-platform/tsconfig.json`
- Create: `multi-agent-dev-platform/README.md`
- Create: `multi-agent-dev-platform/CLAUDE.md`

**Step 1: Create repo directory and initialize**

```bash
mkdir -p d:/Projects/Portfolio/claude-dev-studio
cd d:/Projects/Portfolio/claude-dev-studio
git init
npm init -y
```

**Step 2: Create root package.json with workspaces**

```json
{
  "name": "claude-dev-studio",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "orchestrator",
    "dashboard",
    "dashboard/server"
  ]
}
```

**Step 3: Create tsconfig.json base**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true,
    "resolveJsonModule": true
  }
}
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
.env
.env.*
*.db
```

**Step 5: Create CLAUDE.md**

```markdown
# Claude Dev Studio

Read `.studio/context.md` for project context and structure.

Config: `studio.config.json` at any generated project's root.
Orchestrator: `orchestrator/src/`
Dashboard: `dashboard/src/` (frontend), `dashboard/server/` (backend)
Standards: `standards/`
Skills: `skills/`
```

**Step 6: Create README.md**

Short description, install instructions, usage. No fluff.

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize repo with monorepo structure"
```

---

### Task 1.2: Config Schema and Parser

**Files:**
- Create: `orchestrator/package.json`
- Create: `orchestrator/tsconfig.json`
- Create: `orchestrator/src/config/schema.ts`
- Create: `orchestrator/src/config/parser.ts`
- Create: `orchestrator/src/config/defaults.ts`
- Test: `orchestrator/src/config/__tests__/parser.test.ts`

**Step 1: Initialize orchestrator package**

```bash
cd orchestrator
npm init -y
npm install zod
npm install -D typescript vitest @types/node
```

**Step 2: Write failing test for config parser**

```typescript
// orchestrator/src/config/__tests__/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseConfig } from '../parser';
import { DEFAULT_CONFIG } from '../defaults';

describe('parseConfig', () => {
  it('returns defaults when given empty object', () => {
    const config = parseConfig({});
    expect(config.stack.frontend).toBe('react-typescript');
    expect(config.stack.backend).toBe('python-fastapi');
    expect(config.stack.database).toBe('postgresql');
  });

  it('overrides defaults with provided values', () => {
    const config = parseConfig({
      project: { name: 'test-app', mode: 'new', description: 'A test' },
      stack: { database: 'mongodb' }
    });
    expect(config.project.name).toBe('test-app');
    expect(config.stack.database).toBe('mongodb');
    expect(config.stack.frontend).toBe('react-typescript');
  });

  it('rejects invalid mode', () => {
    expect(() => parseConfig({
      project: { mode: 'invalid' }
    })).toThrow();
  });

  it('validates deployment target', () => {
    const config = parseConfig({
      deployment: { target: 'render' }
    });
    expect(config.deployment.target).toBe('render');
  });

  it('rejects unknown deployment target', () => {
    expect(() => parseConfig({
      deployment: { target: 'nonexistent' }
    })).toThrow();
  });

  it('allows team-level AI overrides', () => {
    const config = parseConfig({
      ai: {
        provider: 'claude',
        team_overrides: {
          security: { provider: 'openai', model: 'gpt-4o', api_key_env: 'OPENAI_KEY' }
        }
      }
    });
    expect(config.ai.team_overrides.security?.provider).toBe('openai');
  });
});
```

**Step 3: Run test to verify it fails**

```bash
npx vitest run src/config/__tests__/parser.test.ts
```

Expected: FAIL - modules not found.

**Step 4: Write config schema with Zod**

```typescript
// orchestrator/src/config/schema.ts
import { z } from 'zod';

export const ProjectMode = z.enum(['new', 'migration']);

export const DeploymentTarget = z.enum([
  'local', 'render', 'vercel', 'aws', 'railway', 'custom'
]);

const AIProviderConfig = z.object({
  provider: z.string().default('claude'),
  model: z.string().default('claude-sonnet-4-6'),
  api_key_env: z.string().default('CLAUDE_API_KEY'),
});

export const StudioConfigSchema = z.object({
  project: z.object({
    name: z.string().default(''),
    mode: ProjectMode.default('new'),
    description: z.string().default(''),
  }).default({}),

  stack: z.object({
    frontend: z.string().default('react-typescript'),
    backend: z.string().default('python-fastapi'),
    database: z.string().default('postgresql'),
    orm: z.string().default('sqlalchemy'),
  }).default({}),

  ai: z.object({
    provider: z.string().default('claude'),
    model: z.string().default('claude-sonnet-4-6'),
    api_key_env: z.string().default('CLAUDE_API_KEY'),
    team_overrides: z.record(z.string(), AIProviderConfig).default({}),
  }).default({}),

  deployment: z.object({
    target: DeploymentTarget.default('local'),
    environments: z.record(z.string(), z.object({
      auto_deploy: z.boolean().default(false),
      branch: z.string().default('main'),
    })).default({
      staging: { auto_deploy: true, branch: 'staging' },
      production: { auto_deploy: false, branch: 'main' },
    }),
    secrets: z.object({
      source: z.enum(['env_file', 'github_secrets', 'aws_secrets']).default('env_file'),
      path: z.string().default('.env'),
    }).default({}),
  }).default({}),

  standards: z.object({
    frontend: z.string().default('radix-component-architecture'),
    backend: z.string().default('clean-python'),
    testing: z.object({
      min_coverage: z.number().default(80),
      required: z.array(z.string()).default(['unit', 'integration', 'scenario']),
    }).default({}),
    documentation: z.string().default('concise-human'),
  }).default({}),

  workflow: z.object({
    iteration_style: z.string().default('agile-iterative'),
    require_human_approval: z.array(z.string()).default([
      'proposal', 'deployment', 'destructive_db_ops'
    ]),
  }).default({}),
});

export type StudioConfig = z.infer<typeof StudioConfigSchema>;
```

**Step 5: Write defaults and parser**

```typescript
// orchestrator/src/config/defaults.ts
import type { StudioConfig } from './schema';

export const DEFAULT_CONFIG: StudioConfig = {
  project: { name: '', mode: 'new', description: '' },
  stack: { frontend: 'react-typescript', backend: 'python-fastapi', database: 'postgresql', orm: 'sqlalchemy' },
  ai: { provider: 'claude', model: 'claude-sonnet-4-6', api_key_env: 'CLAUDE_API_KEY', team_overrides: {} },
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
    testing: { min_coverage: 80, required: ['unit', 'integration', 'scenario'] },
    documentation: 'concise-human',
  },
  workflow: {
    iteration_style: 'agile-iterative',
    require_human_approval: ['proposal', 'deployment', 'destructive_db_ops'],
  },
};
```

```typescript
// orchestrator/src/config/parser.ts
import { StudioConfigSchema, type StudioConfig } from './schema';

export function parseConfig(raw: unknown): StudioConfig {
  return StudioConfigSchema.parse(raw);
}

export function loadConfigFromFile(path: string): StudioConfig {
  const fs = require('fs');
  const content = fs.readFileSync(path, 'utf-8');
  return parseConfig(JSON.parse(content));
}
```

**Step 6: Run tests**

```bash
npx vitest run src/config/__tests__/parser.test.ts
```

Expected: PASS

**Step 7: Commit**

```bash
git add orchestrator/
git commit -m "feat: add config schema and parser with Zod validation"
```

---

## Phase 2: Provider Abstraction Layer

Defines the interface for AI providers so the orchestrator doesn't care whether it's talking to Claude, OpenAI, or Ollama.

### Task 2.1: Provider Interface

**Files:**
- Create: `orchestrator/src/providers/types.ts`
- Create: `orchestrator/src/providers/base.ts`
- Test: `orchestrator/src/providers/__tests__/base.test.ts`

**Step 1: Write failing test**

```typescript
// orchestrator/src/providers/__tests__/base.test.ts
import { describe, it, expect } from 'vitest';
import { createProvider } from '../base';

describe('createProvider', () => {
  it('throws for unknown provider', () => {
    expect(() => createProvider({ provider: 'nonexistent', model: 'x', api_key_env: 'X' }))
      .toThrow('Unknown provider: nonexistent');
  });

  it('creates a claude provider', () => {
    const provider = createProvider({ provider: 'claude', model: 'claude-sonnet-4-6', api_key_env: 'CLAUDE_API_KEY' });
    expect(provider.name).toBe('claude');
  });

  it('creates an openai provider', () => {
    const provider = createProvider({ provider: 'openai', model: 'gpt-4o', api_key_env: 'OPENAI_API_KEY' });
    expect(provider.name).toBe('openai');
  });

  it('creates an ollama provider', () => {
    const provider = createProvider({ provider: 'ollama', model: 'llama3', api_key_env: '' });
    expect(provider.name).toBe('ollama');
  });
});
```

**Step 2: Run test, verify fail**

```bash
npx vitest run src/providers/__tests__/base.test.ts
```

**Step 3: Write provider types**

```typescript
// orchestrator/src/providers/types.ts
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  content: string;
  usage?: { input_tokens: number; output_tokens: number };
}

export interface AIProvider {
  name: string;
  send(messages: Message[], options?: { temperature?: number; max_tokens?: number }): Promise<ProviderResponse>;
}

export interface ProviderConfig {
  provider: string;
  model: string;
  api_key_env: string;
}
```

**Step 4: Write provider factory**

```typescript
// orchestrator/src/providers/base.ts
import type { AIProvider, ProviderConfig } from './types';

// Stub implementations -- real API calls added per-provider in Tasks 2.2-2.4
class ClaudeProvider implements AIProvider {
  name = 'claude';
  constructor(private config: ProviderConfig) {}
  async send() { throw new Error('Not implemented'); }
}

class OpenAIProvider implements AIProvider {
  name = 'openai';
  constructor(private config: ProviderConfig) {}
  async send() { throw new Error('Not implemented'); }
}

class OllamaProvider implements AIProvider {
  name = 'ollama';
  constructor(private config: ProviderConfig) {}
  async send() { throw new Error('Not implemented'); }
}

const providers: Record<string, new (config: ProviderConfig) => AIProvider> = {
  claude: ClaudeProvider,
  openai: OpenAIProvider,
  ollama: OllamaProvider,
};

export function createProvider(config: ProviderConfig): AIProvider {
  const Provider = providers[config.provider];
  if (!Provider) throw new Error(`Unknown provider: ${config.provider}`);
  return new Provider(config);
}
```

**Step 5: Run tests, verify pass**

```bash
npx vitest run src/providers/__tests__/base.test.ts
```

**Step 6: Commit**

```bash
git add orchestrator/src/providers/
git commit -m "feat: add provider abstraction layer with factory"
```

---

### Task 2.2: Claude Provider Implementation

**Files:**
- Create: `orchestrator/src/providers/claude.ts`
- Test: `orchestrator/src/providers/__tests__/claude.test.ts`

**Step 1: Write failing test**

```typescript
// orchestrator/src/providers/__tests__/claude.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ClaudeProvider } from '../claude';

describe('ClaudeProvider', () => {
  it('formats messages for Anthropic API', () => {
    const provider = new ClaudeProvider({
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      api_key_env: 'CLAUDE_API_KEY',
    });
    // Test that the provider extracts system message and formats correctly
    const formatted = provider.formatMessages([
      { role: 'system', content: 'You are a dev.' },
      { role: 'user', content: 'Write code.' },
    ]);
    expect(formatted.system).toBe('You are a dev.');
    expect(formatted.messages).toEqual([{ role: 'user', content: 'Write code.' }]);
  });

  it('throws if API key env var is not set', async () => {
    const provider = new ClaudeProvider({
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      api_key_env: 'NONEXISTENT_KEY',
    });
    await expect(provider.send([{ role: 'user', content: 'hi' }]))
      .rejects.toThrow('not set');
  });
});
```

**Step 2: Run test, verify fail**

**Step 3: Implement Claude provider**

```typescript
// orchestrator/src/providers/claude.ts
import type { AIProvider, Message, ProviderConfig, ProviderResponse } from './types';

export class ClaudeProvider implements AIProvider {
  name = 'claude';

  constructor(private config: ProviderConfig) {}

  formatMessages(messages: Message[]) {
    const system = messages.find(m => m.role === 'system')?.content || '';
    const rest = messages.filter(m => m.role !== 'system');
    return { system, messages: rest };
  }

  async send(
    messages: Message[],
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<ProviderResponse> {
    const apiKey = process.env[this.config.api_key_env];
    if (!apiKey) throw new Error(`API key env var ${this.config.api_key_env} not set`);

    const { system, messages: formatted } = this.formatMessages(messages);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature,
        system,
        messages: formatted,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Claude API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage ? {
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
      } : undefined,
    };
  }
}
```

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git commit -m "feat: implement Claude provider with Anthropic API"
```

---

### Task 2.3: OpenAI Provider Implementation

Same pattern as 2.2 but for OpenAI's chat completions endpoint. Test message formatting and API key validation.

**Files:**
- Create: `orchestrator/src/providers/openai.ts`
- Test: `orchestrator/src/providers/__tests__/openai.test.ts`

Follow same test/implement/commit pattern as Task 2.2.

---

### Task 2.4: Ollama Provider Implementation

Same pattern for local Ollama models. No API key needed, hits `http://localhost:11434/api/chat`.

**Files:**
- Create: `orchestrator/src/providers/ollama.ts`
- Test: `orchestrator/src/providers/__tests__/ollama.test.ts`

Follow same test/implement/commit pattern as Task 2.2.

---

### Task 2.5: Update Provider Factory

**Files:**
- Modify: `orchestrator/src/providers/base.ts` (replace stubs with real imports)
- Create: `orchestrator/src/providers/index.ts` (barrel export)

**Step 1: Replace stub classes with imports from real implementations**

**Step 2: Run all provider tests**

```bash
npx vitest run src/providers/
```

**Step 3: Commit**

```bash
git commit -m "feat: wire up all provider implementations in factory"
```

---

## Phase 3: Orchestrator Core

The iteration state machine, team routing, and handoff document management.

### Task 3.1: Iteration State Machine

**Files:**
- Create: `orchestrator/src/workflow/state.ts`
- Create: `orchestrator/src/workflow/types.ts`
- Test: `orchestrator/src/workflow/__tests__/state.test.ts`

**Step 1: Write failing tests**

```typescript
// orchestrator/src/workflow/__tests__/state.test.ts
import { describe, it, expect } from 'vitest';
import { IterationStateMachine } from '../state';

describe('IterationStateMachine', () => {
  it('starts in planning phase', () => {
    const sm = new IterationStateMachine();
    expect(sm.currentPhase).toBe('planning');
  });

  it('transitions planning -> build', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    expect(sm.currentPhase).toBe('build');
  });

  it('transitions build -> validate', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    expect(sm.currentPhase).toBe('validate');
  });

  it('loops validate -> build on failure', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    sm.advance('validation_failed');
    expect(sm.currentPhase).toBe('build');
    expect(sm.retryCount).toBe(1);
  });

  it('escalates after 3 retries', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    for (let i = 0; i < 3; i++) {
      sm.advance('code_committed');
      sm.advance('validation_failed');
    }
    sm.advance('code_committed');
    sm.advance('validation_failed');
    expect(sm.currentPhase).toBe('escalation');
  });

  it('transitions validate -> ship on success', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    sm.advance('validation_passed');
    expect(sm.currentPhase).toBe('ship');
  });

  it('transitions ship -> report', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    sm.advance('validation_passed');
    sm.advance('deployed');
    expect(sm.currentPhase).toBe('report');
  });
});
```

**Step 2: Run tests, verify fail**

**Step 3: Implement state machine**

```typescript
// orchestrator/src/workflow/types.ts
export type Phase = 'planning' | 'build' | 'validate' | 'ship' | 'report' | 'escalation' | 'complete';

export type Event =
  | 'proposal_approved'
  | 'code_committed'
  | 'validation_passed'
  | 'validation_failed'
  | 'deployed'
  | 'report_generated'
  | 'human_resolved';

export interface IterationState {
  iteration: number;
  phase: Phase;
  retryCount: number;
  history: Array<{ phase: Phase; event: Event; timestamp: string }>;
}
```

```typescript
// orchestrator/src/workflow/state.ts
import type { Phase, Event } from './types';

const MAX_RETRIES = 3;

const transitions: Record<Phase, Partial<Record<Event, Phase>>> = {
  planning:   { proposal_approved: 'build' },
  build:      { code_committed: 'validate' },
  validate:   { validation_passed: 'ship', validation_failed: 'build' },
  ship:       { deployed: 'report' },
  report:     { report_generated: 'complete' },
  escalation: { human_resolved: 'build' },
  complete:   {},
};

export class IterationStateMachine {
  currentPhase: Phase = 'planning';
  retryCount = 0;
  history: Array<{ phase: Phase; event: Event; timestamp: string }> = [];

  advance(event: Event): void {
    const nextPhase = transitions[this.currentPhase]?.[event];
    if (!nextPhase) throw new Error(`Invalid transition: ${this.currentPhase} + ${event}`);

    this.history.push({
      phase: this.currentPhase,
      event,
      timestamp: new Date().toISOString(),
    });

    if (event === 'validation_failed') {
      this.retryCount++;
      if (this.retryCount > MAX_RETRIES) {
        this.currentPhase = 'escalation';
        return;
      }
    }

    if (event === 'validation_passed') {
      this.retryCount = 0;
    }

    this.currentPhase = nextPhase;
  }

  reset(): void {
    this.currentPhase = 'planning';
    this.retryCount = 0;
    this.history = [];
  }
}
```

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git commit -m "feat: add iteration state machine with retry and escalation"
```

---

### Task 3.2: Handoff Document Manager

**Files:**
- Create: `orchestrator/src/workflow/handoff.ts`
- Test: `orchestrator/src/workflow/__tests__/handoff.test.ts`

Manages reading/writing handoff documents to `.studio/iterations/<n>/`. Each team's output is a JSON file written to this directory. The next team reads from it.

**Step 1: Write failing tests**

Test that it creates the iteration directory, writes a JSON report, reads it back, and lists all reports for an iteration.

**Step 2: Implement**

```typescript
// orchestrator/src/workflow/handoff.ts
import fs from 'fs';
import path from 'path';

export class HandoffManager {
  constructor(private projectRoot: string) {}

  private iterationDir(iteration: number): string {
    return path.join(this.projectRoot, '.studio', 'iterations', String(iteration));
  }

  write(iteration: number, team: string, filename: string, data: unknown): void {
    const dir = path.join(this.iterationDir(iteration), team);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
  }

  read<T = unknown>(iteration: number, team: string, filename: string): T {
    const filepath = path.join(this.iterationDir(iteration), team, filename);
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }

  list(iteration: number): string[] {
    const dir = this.iterationDir(iteration);
    if (!fs.existsSync(dir)) return [];
    const result: string[] = [];
    for (const team of fs.readdirSync(dir)) {
      const teamDir = path.join(dir, team);
      if (fs.statSync(teamDir).isDirectory()) {
        for (const file of fs.readdirSync(teamDir)) {
          result.push(`${team}/${file}`);
        }
      }
    }
    return result;
  }
}
```

**Step 3: Run tests, verify pass**

**Step 4: Commit**

```bash
git commit -m "feat: add handoff document manager for team communication"
```

---

### Task 3.3: Team Agent Base Class

**Files:**
- Create: `orchestrator/src/teams/base.ts`
- Create: `orchestrator/src/teams/types.ts`
- Test: `orchestrator/src/teams/__tests__/base.test.ts`

**Step 1: Write failing tests**

Test that a team agent builds its system prompt from role definition + standards content, sends messages through its provider, and produces structured output.

**Step 2: Implement**

```typescript
// orchestrator/src/teams/types.ts
export interface TeamDefinition {
  name: string;
  role: string;
  systemPrompt: string;
  standards: string[];  // paths to standards files to inject
  tools: string[];      // which tools this team can use
  guardrails: string[]; // things this team must never do
}

export interface TeamReport {
  team: string;
  status: 'success' | 'failure' | 'blocked';
  summary: string;
  details: unknown;
  timestamp: string;
}
```

```typescript
// orchestrator/src/teams/base.ts
import type { AIProvider, Message } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';
import fs from 'fs';

export class TeamAgent {
  constructor(
    private definition: TeamDefinition,
    private provider: AIProvider,
    private standardsDir: string,
  ) {}

  get name() { return this.definition.name; }

  buildSystemPrompt(): string {
    const parts = [this.definition.systemPrompt];

    for (const stdPath of this.definition.standards) {
      const fullPath = `${this.standardsDir}/${stdPath}`;
      if (fs.existsSync(fullPath)) {
        parts.push(`\n--- Standard: ${stdPath} ---\n${fs.readFileSync(fullPath, 'utf-8')}`);
      }
    }

    if (this.definition.guardrails.length > 0) {
      parts.push(`\n--- Guardrails ---\n${this.definition.guardrails.map(g => `- ${g}`).join('\n')}`);
    }

    return parts.join('\n');
  }

  async run(context: string): Promise<TeamReport> {
    const messages: Message[] = [
      { role: 'system', content: this.buildSystemPrompt() },
      { role: 'user', content: context },
    ];

    const response = await this.provider.send(messages);

    return {
      team: this.name,
      status: 'success',
      summary: response.content.slice(0, 200),
      details: response.content,
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Step 3: Run tests, verify pass**

**Step 4: Commit**

```bash
git commit -m "feat: add team agent base class with standards injection"
```

---

### Task 3.4: Orchestrator Main Loop

**Files:**
- Create: `orchestrator/src/orchestrator.ts`
- Create: `orchestrator/src/index.ts`
- Test: `orchestrator/src/orchestrator/__tests__/orchestrator.test.ts`

The main loop that ties config, state machine, providers, teams, and handoffs together. For now, it runs one iteration end-to-end.

**Step 1: Write failing tests**

Test that the orchestrator:
- Loads config
- Creates providers for each team (respecting overrides)
- Runs through planning -> build -> validate -> ship -> report
- Writes handoff docs at each step
- Emits events (for the dashboard WebSocket)

**Step 2: Implement orchestrator**

Key method: `runIteration()` that steps through the state machine, invoking the appropriate team at each phase. Uses an event emitter for the dashboard.

**Step 3: Run tests, verify pass**

**Step 4: Commit**

```bash
git commit -m "feat: add orchestrator main loop with team routing"
```

---

## Phase 4: Team Agent Implementations

One task per team. Each defines the system prompt, standards refs, and output format.

### Task 4.1: Feature Team Agent

**Files:**
- Create: `orchestrator/src/teams/feature.ts`
- Test: `orchestrator/src/teams/__tests__/feature.test.ts`

The Feature team has a multi-agent discussion pattern: proposer, challenger, refiner. Implemented as three sequential calls within one team run. Output: `proposal.md` and `backlog.json`.

**Step 1: Write failing tests**

Test that the Feature team:
- Produces a proposal with required sections (architecture, data models, API, unknowns)
- Produces a backlog as an array of stories with priority
- Handles the internal discussion (3-step prompt chain)

**Step 2: Implement**

The `run()` override makes 3 provider calls:
1. Proposer: "Given this prompt and stack, propose an architecture."
2. Challenger: "Given this proposal, find weaknesses and risks."
3. Refiner: "Given the proposal and critique, produce the final proposal and backlog."

**Step 3: Run tests, verify pass**

**Step 4: Commit**

```bash
git commit -m "feat: implement feature team with proposer/challenger/refiner pattern"
```

---

### Task 4.2: Dev Team Agent

**Files:**
- Create: `orchestrator/src/teams/dev.ts`
- Test: `orchestrator/src/teams/__tests__/dev.test.ts`

Takes a story from the backlog, generates code following standards. Output: code files and `dev_report.json`.

---

### Task 4.3: Test Team Agent

**Files:**
- Create: `orchestrator/src/teams/test.ts`
- Test: `orchestrator/src/teams/__tests__/test.test.ts`

Takes dev output, generates and runs tests. Output: `test_report.json` with pass/fail, coverage, failures.

---

### Task 4.4: Security Team Agent

**Files:**
- Create: `orchestrator/src/teams/security.ts`
- Test: `orchestrator/src/teams/__tests__/security.test.ts`

Scans code for vulnerabilities, checks query safety rules. Output: `security_audit.json` with findings and severity.

---

### Task 4.5: DevOps Team Agent

**Files:**
- Create: `orchestrator/src/teams/devops.ts`
- Test: `orchestrator/src/teams/__tests__/devops.test.ts`

Generates CI/CD, Docker, deployment configs based on `studio.config.json` deployment target. Output: infra files and `deploy_report.json`.

---

## Phase 5: Standards Engine

### Task 5.1: Core Standards Documents

**Files:**
- Create all files under `standards/` as listed in the design doc

Write concise, actionable reference docs for each standard. These are not tutorials; they're checklists and rules that get injected into agent prompts.

Start with the most critical ones:
1. `database/query-safety.md`
2. `frontend/react-typescript.md`
3. `backend/python-fastapi.md`
4. `documentation/writing-style.md`
5. `testing/unit-testing.md`

**Step 1: Write query-safety.md**

Encode the rules discussed: scoped deletes, no accidental side-effect deletes, bulk ops need backup, reversible migrations.

**Step 2: Write react-typescript.md**

Radix-style component architecture, file naming, hook patterns, state management rules.

**Step 3: Write python-fastapi.md**

Route structure, service layer, error handling, module organization.

**Step 4: Write writing-style.md**

Concise, human tone. No AI fluff, no emdashes, no emojis. Short comments only where needed.

**Step 5: Write unit-testing.md**

What to test, file structure, naming, assertion patterns, when to mock vs use real dependencies.

**Step 6: Commit**

```bash
git commit -m "feat: add core standards engine documents"
```

---

### Task 5.2: Remaining Standards Documents

Write the rest: `radix-components.md`, `state-management.md`, `clean-python.md`, `postgresql.md`, `mongodb.md`, `integration-testing.md`, `scenario-testing.md`, `owasp-checklist.md`, `auth-patterns.md`, `data-protection.md`, `code-comments.md`, `api-docs.md`, `docker.md`, `ci-cd.md`, `env-management.md`.

---

## Phase 6: Dashboard Backend

### Task 6.1: Express Server + SQLite Auth

**Files:**
- Create: `dashboard/server/package.json`
- Create: `dashboard/server/src/index.ts`
- Create: `dashboard/server/src/auth/db.ts`
- Create: `dashboard/server/src/auth/routes.ts`
- Create: `dashboard/server/src/auth/middleware.ts`
- Test: `dashboard/server/src/__tests__/auth.test.ts`

**Step 1: Write failing tests**

Test registration (first user = admin), login, JWT validation, invite flow, role checks.

**Step 2: Implement auth**

SQLite with `better-sqlite3`. bcrypt for passwords. JWT for sessions. Middleware that checks role on protected routes.

**Step 3: Run tests, verify pass**

**Step 4: Commit**

```bash
git commit -m "feat: add dashboard auth with SQLite, JWT, and roles"
```

---

### Task 6.2: WebSocket Server

**Files:**
- Create: `dashboard/server/src/ws/server.ts`
- Create: `dashboard/server/src/ws/events.ts`
- Test: `dashboard/server/src/__tests__/ws.test.ts`

WebSocket server that the orchestrator pushes events to. Dashboard clients connect and receive real-time updates. Events: `iteration_started`, `phase_changed`, `team_started`, `team_completed`, `test_results`, `error`.

---

### Task 6.3: Reports API

**Files:**
- Create: `dashboard/server/src/reports/routes.ts`
- Test: `dashboard/server/src/__tests__/reports.test.ts`

REST endpoints that read from `.studio/iterations/` and return iteration summaries, team reports, and handoff docs. All protected by auth middleware.

---

## Phase 7: Dashboard Frontend

### Task 7.1: Vite + React + Router Setup

**Files:**
- Create: `dashboard/package.json`
- Create: `dashboard/vite.config.ts`
- Create: `dashboard/src/main.tsx`
- Create: `dashboard/src/App.tsx`
- Create: `dashboard/src/router.tsx`
- Create: `dashboard/index.html`

Scaffold the React app with Vite. Set up React Router with routes for each view. Add a layout component with sidebar navigation.

---

### Task 7.2: Auth Pages

**Files:**
- Create: `dashboard/src/pages/Login.tsx`
- Create: `dashboard/src/pages/Register.tsx`
- Create: `dashboard/src/hooks/useAuth.ts`
- Create: `dashboard/src/api/auth.ts`

Login form, register form (first user flow), JWT storage, auth context, protected route wrapper.

---

### Task 7.3: Project Overview Page

**Files:**
- Create: `dashboard/src/pages/ProjectOverview.tsx`
- Create: `dashboard/src/api/projects.ts`
- Create: `dashboard/src/components/ConfigSummary.tsx`
- Create: `dashboard/src/components/StatusBadge.tsx`

Shows current project name, config summary, iteration count, overall status.

---

### Task 7.4: Iteration Timeline Page

**Files:**
- Create: `dashboard/src/pages/IterationTimeline.tsx`
- Create: `dashboard/src/components/TimelineEntry.tsx`

Vertical timeline of iteration cycles. Each entry expandable. Color-coded status.

---

### Task 7.5: Team Panels Page

**Files:**
- Create: `dashboard/src/pages/TeamPanels.tsx`
- Create: `dashboard/src/components/TeamPanel.tsx`
- Create: `dashboard/src/components/CodeSnippet.tsx`

One panel per team showing status, latest report, key output.

---

### Task 7.6: Log Stream Page

**Files:**
- Create: `dashboard/src/pages/LogStream.tsx`
- Create: `dashboard/src/hooks/useWebSocket.ts`
- Create: `dashboard/src/components/LogEntry.tsx`

Real-time scrolling log via WebSocket. Filterable by team. Expandable entries.

---

### Task 7.7: Reports Archive Page

**Files:**
- Create: `dashboard/src/pages/ReportsArchive.tsx`
- Create: `dashboard/src/components/ReportCard.tsx`

Browse past iteration reports. Summary, code snippets, test results, GitHub links.

---

### Task 7.8: User Management Page

**Files:**
- Create: `dashboard/src/pages/UserManagement.tsx`
- Create: `dashboard/src/api/users.ts`

Admin-only. Invite users, assign roles, revoke access.

---

## Phase 8: Claude Code Skills

### Task 8.1: Orchestrator Skill

**Files:**
- Create: `skills/dev-studio.md`

The main entry point skill. When invoked, it:
1. Reads `studio.config.json` from the current project
2. Starts or resumes the orchestrator
3. Handles conversation with the user
4. Spawns sub-agents for teams

---

### Task 8.2: Individual Team Skills

**Files:**
- Create: `skills/feature-team.md`
- Create: `skills/dev-team.md`
- Create: `skills/test-team.md`
- Create: `skills/security-team.md`
- Create: `skills/devops-team.md`

Each skill defines the team's system prompt, tool access, and standards references. These are invoked by the orchestrator skill, not directly by the user.

---

## Phase 9: Integration + End-to-End

### Task 9.1: Wire Orchestrator to Dashboard

Connect the orchestrator's event emitter to the WebSocket server. When running via CLI, the dashboard server starts alongside the orchestrator.

---

### Task 9.2: End-to-End Smoke Test

Create a minimal test project prompt (e.g., "build a todo API"). Run the full pipeline: Feature team proposes, Dev builds, Test validates, Security scans, DevOps generates configs. Verify all handoff docs are produced and the dashboard shows the results.

---

### Task 9.3: Documentation

- README with install, config, and usage instructions
- `.studio/context.md` template for generated projects
- Brief contributor guide

---

## Execution Order Summary

| Phase | What | Depends On |
|-------|------|-----------|
| 1 | Repo + Config | Nothing |
| 2 | Provider Layer | Phase 1 |
| 3 | Orchestrator Core | Phases 1-2 |
| 4 | Team Agents | Phase 3 |
| 5 | Standards Engine | Nothing (can parallel with 2-4) |
| 6 | Dashboard Backend | Phase 3 (needs event types) |
| 7 | Dashboard Frontend | Phase 6 |
| 8 | Claude Skills | Phase 4 |
| 9 | Integration | All above |

Phases 5 can run in parallel with 2-4. Phase 6 can start once Phase 3 defines event types.
