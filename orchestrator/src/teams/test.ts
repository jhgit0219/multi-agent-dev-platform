import type { AIProvider } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';
import { TeamAgent } from './base';

export class TestTeamAgent extends TeamAgent {
  constructor(
    definition: TeamDefinition,
    private testProvider: AIProvider,
    standardsDir: string,
  ) {
    super(definition, testProvider, standardsDir);
  }

  async run(context: string): Promise<TeamReport> {
    const systemPrompt = this.buildSystemPrompt();

    const response = await this.testProvider.send([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate tests for the following code. Return a JSON object with "testFiles" (array of {path, content}), "coverage" (number 0-100), and "results" (array of {name, status: pass|fail, reason?}).\n\n${context}`,
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
