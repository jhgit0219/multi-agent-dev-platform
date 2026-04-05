import type { AIProvider } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';
import { TeamAgent } from './base';

export class DevTeamAgent extends TeamAgent {
  constructor(
    definition: TeamDefinition,
    private devProvider: AIProvider,
    standardsDir: string,
  ) {
    super(definition, devProvider, standardsDir);
  }

  async run(context: string): Promise<TeamReport> {
    const systemPrompt = this.buildSystemPrompt();

    const response = await this.devProvider.send([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Implement the following. Return a JSON object with "files" (array of {path, content}) and "summary" fields.\n\n${context}`,
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
