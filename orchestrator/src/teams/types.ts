export interface TeamDefinition {
  name: string;
  role: string;
  systemPrompt: string;
  standards: string[];
  tools: string[];
  guardrails: string[];
}

export interface TeamReport {
  team: string;
  status: 'success' | 'failure' | 'blocked';
  summary: string;
  details: unknown;
  timestamp: string;
}
