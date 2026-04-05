import { describe, it, expect, vi } from 'vitest';
import { FeatureTeamAgent } from '../feature';
import type { AIProvider } from '../../providers/types';
import type { TeamDefinition } from '../types';

describe('FeatureTeamAgent', () => {
  const definition: TeamDefinition = {
    name: 'feature',
    role: 'Feature Team',
    systemPrompt: 'You are the feature planning team.',
    standards: [],
    tools: [],
    guardrails: [],
  };

  it('makes 3 provider calls (proposer, challenger, refiner)', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({ content: 'Architecture: microservices\nData Models: User, Post\nAPI: REST\nUnknowns: scale' })
      .mockResolvedValueOnce({ content: 'Weakness: no caching strategy. Risk: single DB bottleneck.' })
      .mockResolvedValueOnce({ content: 'Final proposal with caching layer and read replicas. Backlog: [...]' });

    const mockProvider: AIProvider = { name: 'mock', send };
    const agent = new FeatureTeamAgent(definition, mockProvider, '/tmp');

    const report = await agent.run('Build a social media app');

    expect(send).toHaveBeenCalledTimes(3);
    expect(report.team).toBe('feature');
    expect(report.status).toBe('success');
  });

  it('includes proposal, critique, and refined output in details', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({ content: 'proposal-content' })
      .mockResolvedValueOnce({ content: 'critique-content' })
      .mockResolvedValueOnce({ content: 'refined-content' });

    const mockProvider: AIProvider = { name: 'mock', send };
    const agent = new FeatureTeamAgent(definition, mockProvider, '/tmp');

    const report = await agent.run('Build an app');
    const details = report.details as { proposal: string; critique: string; refined: string };

    expect(details.proposal).toBe('proposal-content');
    expect(details.critique).toBe('critique-content');
    expect(details.refined).toBe('refined-content');
  });
});
