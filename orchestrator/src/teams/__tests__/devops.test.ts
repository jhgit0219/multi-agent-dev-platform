import { describe, it, expect, vi } from 'vitest';
import { DevOpsTeamAgent } from '../devops';
import type { AIProvider } from '../../providers/types';
import type { TeamDefinition } from '../types';

describe('DevOpsTeamAgent', () => {
  const definition: TeamDefinition = {
    name: 'devops',
    role: 'DevOps Team',
    systemPrompt: 'You are the DevOps team.',
    standards: [],
    tools: [],
    guardrails: [],
  };

  it('requests deployment config generation', async () => {
    const send = vi.fn().mockResolvedValue({
      content: '{"files": [{"path": "Dockerfile", "content": "FROM node:22"}], "deploymentSteps": ["build", "push", "deploy"]}',
    });

    const mockProvider: AIProvider = { name: 'mock', send };
    const agent = new DevOpsTeamAgent(definition, mockProvider, '/tmp');

    const report = await agent.run('Deploy to render');

    expect(send).toHaveBeenCalledTimes(1);
    expect(report.team).toBe('devops');
    expect(report.status).toBe('success');
  });
});
