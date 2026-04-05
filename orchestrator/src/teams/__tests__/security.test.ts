import { describe, it, expect, vi } from 'vitest';
import { SecurityTeamAgent } from '../security';
import type { AIProvider } from '../../providers/types';
import type { TeamDefinition } from '../types';

describe('SecurityTeamAgent', () => {
  const definition: TeamDefinition = {
    name: 'security',
    role: 'Security Team',
    systemPrompt: 'You are the security audit team.',
    standards: [],
    tools: [],
    guardrails: [],
  };

  it('requests security audit with findings format', async () => {
    const send = vi.fn().mockResolvedValue({
      content: '{"findings": [{"severity": "high", "category": "injection", "description": "SQL injection", "location": "auth.ts:42", "recommendation": "Use parameterized queries"}], "overallRisk": "high"}',
    });

    const mockProvider: AIProvider = { name: 'mock', send };
    const agent = new SecurityTeamAgent(definition, mockProvider, '/tmp');

    const report = await agent.run('Audit the auth module');

    expect(send).toHaveBeenCalledTimes(1);
    expect(report.team).toBe('security');
    expect(report.status).toBe('success');
  });
});
