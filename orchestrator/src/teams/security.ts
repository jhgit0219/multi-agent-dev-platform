import type { AIProvider } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';
import { TeamAgent } from './base';

export interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  location: string;
  recommendation: string;
}

export class SecurityTeamAgent extends TeamAgent {
  constructor(
    definition: TeamDefinition,
    private securityProvider: AIProvider,
    standardsDir: string,
  ) {
    super(definition, securityProvider, standardsDir);
  }

  async run(context: string): Promise<TeamReport> {
    const systemPrompt = this.buildSystemPrompt();

    const response = await this.securityProvider.send([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Perform a security audit on the following. Return a JSON object with "findings" (array of {severity, category, description, location, recommendation}) and "overallRisk" (critical|high|medium|low).\n\n${context}`,
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
