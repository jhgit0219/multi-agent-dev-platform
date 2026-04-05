import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TeamAgent } from '../base';
import type { AIProvider } from '../../providers/types';
import type { TeamDefinition } from '../types';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('TeamAgent', () => {
  let standardsDir: string;
  const mockProvider: AIProvider = {
    name: 'mock',
    send: vi.fn().mockResolvedValue({ content: 'Generated response content here' }),
  };

  const definition: TeamDefinition = {
    name: 'dev',
    role: 'Developer',
    systemPrompt: 'You are a developer.',
    standards: ['backend/python-fastapi.md'],
    tools: ['write_file', 'run_command'],
    guardrails: ['Never delete production data', 'Always write tests'],
  };

  beforeEach(() => {
    standardsDir = join(tmpdir(), `standards-test-${Date.now()}`);
    mkdirSync(join(standardsDir, 'backend'), { recursive: true });
    writeFileSync(
      join(standardsDir, 'backend', 'python-fastapi.md'),
      '# FastAPI Rules\n- Use service layer\n- Handle errors explicitly',
    );
  });

  afterEach(() => {
    if (existsSync(standardsDir)) {
      rmSync(standardsDir, { recursive: true });
    }
  });

  it('builds system prompt with standards and guardrails', () => {
    const agent = new TeamAgent(definition, mockProvider, standardsDir);
    const prompt = agent.buildSystemPrompt();
    expect(prompt).toContain('You are a developer.');
    expect(prompt).toContain('FastAPI Rules');
    expect(prompt).toContain('Never delete production data');
    expect(prompt).toContain('Always write tests');
  });

  it('skips missing standards files gracefully', () => {
    const defWithMissing: TeamDefinition = {
      ...definition,
      standards: ['nonexistent/file.md'],
    };
    const agent = new TeamAgent(defWithMissing, mockProvider, standardsDir);
    const prompt = agent.buildSystemPrompt();
    expect(prompt).toContain('You are a developer.');
    expect(prompt).not.toContain('nonexistent');
  });

  it('sends messages through provider and returns report', async () => {
    const agent = new TeamAgent(definition, mockProvider, standardsDir);
    const report = await agent.run('Build the user auth module');
    expect(report.team).toBe('dev');
    expect(report.status).toBe('success');
    expect(report.summary).toBe('Generated response content here');
    expect(mockProvider.send).toHaveBeenCalledWith([
      { role: 'system', content: expect.stringContaining('You are a developer.') },
      { role: 'user', content: 'Build the user auth module' },
    ]);
  });
});
