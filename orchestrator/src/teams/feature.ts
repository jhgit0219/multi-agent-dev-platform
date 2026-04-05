import type { AIProvider, Message } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';
import { TeamAgent } from './base';

export interface FeatureProposal {
  architecture: string;
  dataModels: string;
  api: string;
  unknowns: string;
}

export interface BacklogStory {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  team: string;
}

export class FeatureTeamAgent extends TeamAgent {
  constructor(
    definition: TeamDefinition,
    private featureProvider: AIProvider,
    standardsDir: string,
  ) {
    super(definition, featureProvider, standardsDir);
  }

  async run(context: string): Promise<TeamReport> {
    const systemPrompt = this.buildSystemPrompt();

    // Step 1: Proposer
    const proposalResponse = await this.featureProvider.send([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Given the following project requirements, propose an architecture. Include sections for: architecture, data models, API design, and unknowns.\n\n${context}`,
      },
    ]);

    // Step 2: Challenger
    const challengeResponse = await this.featureProvider.send([
      { role: 'system', content: `${systemPrompt}\n\nYou are the challenger. Find weaknesses, risks, and missing pieces in proposals.` },
      {
        role: 'user',
        content: `Review this proposal and identify weaknesses, risks, and gaps:\n\n${proposalResponse.content}`,
      },
    ]);

    // Step 3: Refiner
    const refinedResponse = await this.featureProvider.send([
      { role: 'system', content: `${systemPrompt}\n\nYou are the refiner. Produce the final proposal and backlog incorporating feedback.` },
      {
        role: 'user',
        content: `Original proposal:\n${proposalResponse.content}\n\nCritique:\n${challengeResponse.content}\n\nProduce a final refined proposal and a prioritized backlog of stories as JSON.`,
      },
    ]);

    return {
      team: this.name,
      status: 'success',
      summary: refinedResponse.content.slice(0, 200),
      details: {
        proposal: proposalResponse.content,
        critique: challengeResponse.content,
        refined: refinedResponse.content,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
