import { describe, it, expect, vi } from 'vitest';
import { DevTeamAgent } from '../dev';
import type { AIProvider } from '../../providers/types';
import type { TeamDefinition } from '../types';

describe('DevTeamAgent', () => {
  const definition: TeamDefinition = {
    name: 'dev',
    role: 'Dev Team',
    systemPrompt: 'You are the development team.',
    standards: [],
    tools: ['write_file', 'run_command'],
    guardrails: ['Never delete production data'],
  };

  it('sends context to provider and returns code report', async () => {
    const send = vi.fn().mockResolvedValue({
      content: '{"files": [{"path": "src/auth.ts", "content": "..."}], "summary": "Implemented auth"}',
    });

    const mockProvider: AIProvider = { name: 'mock', send };
    const agent = new DevTeamAgent(definition, mockProvider, '/tmp');

    const report = await agent.run('Implement user authentication');

    expect(send).toHaveBeenCalledTimes(1);
    expect(report.team).toBe('dev');
    expect(report.status).toBe('success');
  });
});
