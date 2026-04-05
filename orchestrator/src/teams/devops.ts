import type { AIProvider } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';
import { TeamAgent } from './base';

export class DevOpsTeamAgent extends TeamAgent {
  constructor(
    definition: TeamDefinition,
    private devopsProvider: AIProvider,
    standardsDir: string,
  ) {
    super(definition, devopsProvider, standardsDir);
  }

  async run(context: string): Promise<TeamReport> {
    const systemPrompt = this.buildSystemPrompt();

    const response = await this.devopsProvider.send([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate deployment configuration for the following project. Return a JSON object with "files" (array of {path, content} for Dockerfile, CI/CD config, etc.) and "deploymentSteps" (array of strings).\n\n${context}`,
      },
    ]);

    return {
      team: this.name,
      status: 'success',
      summary: response.content.slice(0, 200),
      details: response.content,
      timestamp: new Date().toISOString(),
    };
  }
}
