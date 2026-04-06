// dashboard/server/src/agents/registry.ts
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

export interface AgentInfo {
  id: string;
  name: string;
  model: string;
  tier: 'director' | 'lead' | 'specialist';
  department: string;
  description: string;
  status: 'idle' | 'active' | 'error' | 'complete';
  lastMessage: string;
  lastActivity: string | null;
}

const TIER_MAP: Record<string, 'director' | 'lead' | 'specialist'> = {
  'creative-director': 'director',
  'technical-director': 'director',
  'producer': 'director',
  'lead-engineer': 'lead',
  'design-lead': 'lead',
  'qa-lead': 'lead',
  'security-lead': 'lead',
  'devops-lead': 'lead',
  'data-lead': 'lead',
  'release-manager': 'lead',
  'documentation-lead': 'lead',
};

const DEPT_MAP: Record<string, string> = {
  'creative-director': 'leadership',
  'technical-director': 'leadership',
  'producer': 'leadership',
  'lead-engineer': 'engineering',
  'frontend-engineer': 'engineering',
  'backend-engineer': 'engineering',
  'api-engineer': 'engineering',
  'infrastructure-engineer': 'engineering',
  'tools-engineer': 'engineering',
  'ui-engineer': 'design',
  'design-lead': 'design',
  'ux-designer': 'design',
  'accessibility-specialist': 'design',
  'qa-lead': 'qa',
  'qa-tester': 'qa',
  'performance-analyst': 'qa',
  'e2e-tester': 'qa',
  'security-lead': 'security',
  'security-engineer': 'security',
  'penetration-tester': 'security',
  'devops-lead': 'devops',
  'devops-engineer': 'devops',
  'site-reliability-engineer': 'devops',
  'data-lead': 'data',
  'database-engineer': 'data',
  'analytics-engineer': 'data',
  'ml-engineer': 'data',
  'release-manager': 'release',
  'documentation-lead': 'documentation',
  'technical-writer': 'documentation',
};

// In-memory agent state (updated via WebSocket events)
const agentStates = new Map<string, Partial<AgentInfo>>();

export function discoverAgents(projectRoot: string): AgentInfo[] {
  const agentsDir = join(projectRoot, '.claude', 'agents');
  const files = readdirSync(agentsDir).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const id = basename(file, '.md');
    const content = readFileSync(join(agentsDir, file), 'utf-8');

    // Parse YAML frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let model = 'sonnet';
    let description = '';
    if (fmMatch) {
      const fm = fmMatch[1];
      const modelMatch = fm.match(/model:\s*(.+)/);
      const descMatch = fm.match(/description:\s*(.+)/);
      if (modelMatch) model = modelMatch[1].trim();
      if (descMatch) description = descMatch[1].trim();
    }

    const tier = TIER_MAP[id] ?? 'specialist';
    const department = DEPT_MAP[id] ?? 'other';
    const state = agentStates.get(id) ?? {};

    return {
      id,
      name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      model,
      tier,
      department,
      description,
      status: state.status ?? 'idle',
      lastMessage: state.lastMessage ?? '',
      lastActivity: state.lastActivity ?? null,
    };
  });
}

export function updateAgentState(agentId: string, update: Partial<AgentInfo>): void {
  const current = agentStates.get(agentId) ?? {};
  agentStates.set(agentId, { ...current, ...update, lastActivity: new Date().toISOString() });
}

export function getAgentState(agentId: string): Partial<AgentInfo> {
  return agentStates.get(agentId) ?? {};
}
