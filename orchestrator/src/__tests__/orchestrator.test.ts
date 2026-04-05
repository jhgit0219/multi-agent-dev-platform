import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Orchestrator } from '../orchestrator';
import { parseConfig } from '../config/parser';
import type { TeamDefinition } from '../teams/types';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Mock fetch globally so provider.send() works
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    content: [{ text: 'AI response' }],
    usage: { input_tokens: 10, output_tokens: 20 },
  }),
}));

describe('Orchestrator', () => {
  let projectRoot: string;
  let standardsDir: string;

  const teamDefs: Record<string, TeamDefinition> = {
    feature: {
      name: 'feature',
      role: 'Feature Team',
      systemPrompt: 'Plan features.',
      standards: [],
      tools: [],
      guardrails: [],
    },
    dev: {
      name: 'dev',
      role: 'Dev Team',
      systemPrompt: 'Write code.',
      standards: [],
      tools: ['write_file'],
      guardrails: [],
    },
    test: {
      name: 'test',
      role: 'Test Team',
      systemPrompt: 'Write tests.',
      standards: [],
      tools: ['run_command'],
      guardrails: [],
    },
    devops: {
      name: 'devops',
      role: 'DevOps Team',
      systemPrompt: 'Deploy.',
      standards: [],
      tools: [],
      guardrails: [],
    },
  };

  beforeEach(() => {
    projectRoot = join(tmpdir(), `orch-test-${Date.now()}`);
    standardsDir = join(projectRoot, 'standards');
    mkdirSync(standardsDir, { recursive: true });
    process.env.CLAUDE_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (existsSync(projectRoot)) {
      rmSync(projectRoot, { recursive: true });
    }
    delete process.env.CLAUDE_API_KEY;
  });

  it('creates providers respecting team overrides', () => {
    const config = parseConfig({
      ai: {
        provider: 'claude',
        model: 'claude-sonnet-4-6',
        api_key_env: 'CLAUDE_API_KEY',
        team_overrides: {
          test: { provider: 'openai', model: 'gpt-4o', api_key_env: 'CLAUDE_API_KEY' },
        },
      },
    });

    const orch = new Orchestrator({
      config,
      projectRoot,
      standardsDir,
      teamDefinitions: teamDefs,
    });

    // Should construct without error
    expect(orch.currentPhase).toBe('planning');
  });

  it('runs through a full iteration', async () => {
    const config = parseConfig({});
    const orch = new Orchestrator({
      config,
      projectRoot,
      standardsDir,
      teamDefinitions: teamDefs,
    });

    const events: string[] = [];
    orch.on('phase:start', ({ phase }) => events.push(`start:${phase}`));
    orch.on('phase:complete', ({ phase }) => events.push(`complete:${phase}`));
    orch.on('iteration:complete', () => events.push('iteration:done'));

    await orch.runIteration('Build a todo app');

    expect(events).toEqual([
      'start:planning',
      'complete:planning',
      'start:build',
      'complete:build',
      'start:validate',
      'complete:validate',
      'start:ship',
      'complete:ship',
      'start:report',
      'complete:report',
      'iteration:done',
    ]);
  });

  it('writes handoff documents at each phase', async () => {
    const config = parseConfig({});
    const orch = new Orchestrator({
      config,
      projectRoot,
      standardsDir,
      teamDefinitions: teamDefs,
    });

    await orch.runIteration('Build a todo app');

    const { HandoffManager } = await import('../workflow/handoff');
    const handoff = new HandoffManager(projectRoot);
    const files = handoff.list(1);
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain('feature/planning_report.json');
    expect(files).toContain('dev/build_report.json');
  });
});
