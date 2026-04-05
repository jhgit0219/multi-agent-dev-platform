import { existsSync, readFileSync } from 'node:fs';
import type { AIProvider, Message } from '../providers/types';
import type { TeamDefinition, TeamReport } from './types';

export class TeamAgent {
  constructor(
    private definition: TeamDefinition,
    private provider: AIProvider,
    private standardsDir: string,
  ) {}

  get name() {
    return this.definition.name;
  }

  buildSystemPrompt(): string {
    const parts = [this.definition.systemPrompt];

    for (const stdPath of this.definition.standards) {
      const fullPath = `${this.standardsDir}/${stdPath}`;
      if (existsSync(fullPath)) {
        parts.push(
          `\n--- Standard: ${stdPath} ---\n${readFileSync(fullPath, 'utf-8')}`,
        );
      }
    }

    if (this.definition.guardrails.length > 0) {
      parts.push(
        `\n--- Guardrails ---\n${this.definition.guardrails.map((g) => `- ${g}`).join('\n')}`,
      );
    }

    return parts.join('\n');
  }

  async run(context: string): Promise<TeamReport> {
    const messages: Message[] = [
      { role: 'system', content: this.buildSystemPrompt() },
      { role: 'user', content: context },
    ];

    const response = await this.provider.send(messages);

    return {
      team: this.name,
      status: 'success',
      summary: response.content.slice(0, 200),
      details: response.content,
      timestamp: new Date().toISOString(),
    };
  }
}
