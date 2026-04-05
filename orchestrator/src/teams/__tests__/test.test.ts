import { describe, it, expect, vi } from 'vitest';
import { TestTeamAgent } from '../test';
import type { AIProvider } from '../../providers/types';
import type { TeamDefinition } from '../types';

describe('TestTeamAgent', () => {
  const definition: TeamDefinition = {
    name: 'test',
    role: 'Test Team',
    systemPrompt: 'You are the testing team.',
    standards: [],
    tools: ['run_command'],
    guardrails: [],
  };

  it('requests test generation with coverage format', async () => {
    const send = vi.fn().mockResolvedValue({
      content: '{"testFiles": [], "coverage": 85, "results": [{"name": "auth test", "status": "pass"}]}',
    });

    const mockProvider: AIProvider = { name: 'mock', send };
    const agent = new TestTeamAgent(definition, mockProvider, '/tmp');

    const report = await agent.run('Test the auth module');

    expect(send).toHaveBeenCalledTimes(1);
    expect(report.team).toBe('test');
    expect(report.status).toBe('success');
  });
});
