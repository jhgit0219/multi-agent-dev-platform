import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Orchestrator } from '../orchestrator';
import { bridgeToDashboard } from '../bridge';
import { parseConfig } from '../config/parser';
import type { TeamDefinition } from '../teams/types';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    content: [{ text: 'AI response' }],
    usage: { input_tokens: 10, output_tokens: 20 },
  }),
}));

describe('bridgeToDashboard', () => {
  let projectRoot: string;

  const teamDefs: Record<string, TeamDefinition> = {
    feature: { name: 'feature', role: 'Feature', systemPrompt: 'Plan.', standards: [], tools: [], guardrails: [] },
    dev: { name: 'dev', role: 'Dev', systemPrompt: 'Code.', standards: [], tools: [], guardrails: [] },
    test: { name: 'test', role: 'Test', systemPrompt: 'Test.', standards: [], tools: [], guardrails: [] },
    devops: { name: 'devops', role: 'DevOps', systemPrompt: 'Deploy.', standards: [], tools: [], guardrails: [] },
  };

  beforeEach(() => {
    projectRoot = join(tmpdir(), `bridge-test-${Date.now()}`);
    mkdirSync(join(projectRoot, 'standards'), { recursive: true });
    process.env.CLAUDE_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (existsSync(projectRoot)) rmSync(projectRoot, { recursive: true });
    delete process.env.CLAUDE_API_KEY;
  });

  it('forwards orchestrator events to broadcast function', async () => {
    const config = parseConfig({});
    const orch = new Orchestrator({ config, projectRoot, standardsDir: join(projectRoot, 'standards'), teamDefinitions: teamDefs });
    const broadcast = vi.fn();

    bridgeToDashboard(orch, broadcast);
    await orch.runIteration('Build a test app');

    const eventTypes = broadcast.mock.calls.map((c) => c[0].type);
    expect(eventTypes).toContain('iteration:start');
    expect(eventTypes).toContain('phase:start');
    expect(eventTypes).toContain('phase:complete');
    expect(eventTypes).toContain('iteration:complete');
  });
});
