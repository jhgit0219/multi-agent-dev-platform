import AgentCard from './AgentCard';

interface AgentInfo {
  id: string;
  name: string;
  model: string;
  tier: string;
  department: string;
  description: string;
  status: 'idle' | 'active' | 'error' | 'complete';
  lastMessage: string;
  lastActivity: string | null;
}

interface AgentGridProps {
  agents: AgentInfo[];
  viewMode: 'all' | 'tier' | 'department';
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onSendMessage: (agentId: string, message: string) => void;
  agentMessages: Record<string, Array<{ from: string; text: string; timestamp: string }>>;
}

const TIER_ORDER = ['director', 'lead', 'specialist'];
const TIER_LABELS: Record<string, string> = {
  director: 'DIRECTORS',
  lead: 'LEADS',
  specialist: 'SPECIALISTS',
};

const DEPT_ORDER = [
  'leadership', 'engineering', 'design', 'qa',
  'security', 'devops', 'data', 'documentation', 'release',
];
const DEPT_LABELS: Record<string, string> = {
  leadership: 'LEADERSHIP',
  engineering: 'ENGINEERING',
  design: 'DESIGN',
  qa: 'QA',
  security: 'SECURITY',
  devops: 'DEVOPS',
  data: 'DATA',
  documentation: 'DOCUMENTATION',
  release: 'RELEASE',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--gap-md)',
};

const sectionHeaderStyle = (isFirst: boolean): React.CSSProperties => ({
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontSize: '0.75rem',
  letterSpacing: '0.1em',
  marginBottom: '0.5rem',
  marginTop: isFirst ? 0 : '1.5rem',
  fontWeight: 600,
});

function sortActiveFirst(agents: AgentInfo[]): AgentInfo[] {
  return [...agents].sort((a, b) => {
    const order: Record<string, number> = { active: 0, error: 1, complete: 2, idle: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });
}

function renderCard(
  agent: AgentInfo,
  expandedId: string | null,
  onToggleExpand: (id: string) => void,
  onSendMessage: (agentId: string, message: string) => void,
  agentMessages: Record<string, Array<{ from: string; text: string; timestamp: string }>>,
) {
  return (
    <AgentCard
      key={agent.id}
      agent={agent}
      expanded={expandedId === agent.id}
      onToggleExpand={() => onToggleExpand(agent.id)}
      onSendMessage={onSendMessage}
      messages={agentMessages[agent.id] ?? []}
    />
  );
}

export default function AgentGrid({
  agents,
  viewMode,
  expandedId,
  onToggleExpand,
  onSendMessage,
  agentMessages,
}: AgentGridProps) {
  if (viewMode === 'all') {
    const sorted = sortActiveFirst(agents);
    return (
      <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--gap-lg)' }}>
        <div style={gridStyle}>
          {sorted.map((a) => renderCard(a, expandedId, onToggleExpand, onSendMessage, agentMessages))}
        </div>
      </div>
    );
  }

  if (viewMode === 'tier') {
    const grouped = new Map<string, AgentInfo[]>();
    for (const tier of TIER_ORDER) grouped.set(tier, []);
    for (const agent of agents) {
      const list = grouped.get(agent.tier);
      if (list) list.push(agent);
      else {
        const existing = grouped.get('specialist') ?? [];
        existing.push(agent);
        grouped.set('specialist', existing);
      }
    }

    return (
      <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--gap-lg)' }}>
        {TIER_ORDER.map((tier, idx) => {
          const group = grouped.get(tier);
          if (!group || group.length === 0) return null;
          return (
            <div key={tier}>
              <div style={sectionHeaderStyle(idx === 0)}>{TIER_LABELS[tier]}</div>
              <div style={gridStyle}>
                {sortActiveFirst(group).map((a) => renderCard(a, expandedId, onToggleExpand, onSendMessage, agentMessages))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // department view
  const grouped = new Map<string, AgentInfo[]>();
  for (const dept of DEPT_ORDER) grouped.set(dept, []);
  for (const agent of agents) {
    const key = agent.department.toLowerCase();
    const list = grouped.get(key);
    if (list) list.push(agent);
    else {
      const other = grouped.get('other') ?? [];
      other.push(agent);
      grouped.set('other', other);
    }
  }

  let isFirst = true;
  return (
    <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--gap-lg)' }}>
      {DEPT_ORDER.map((dept) => {
        const group = grouped.get(dept);
        if (!group || group.length === 0) return null;
        const first = isFirst;
        isFirst = false;
        return (
          <div key={dept}>
            <div style={sectionHeaderStyle(first)}>{DEPT_LABELS[dept] ?? dept.toUpperCase()}</div>
            <div style={gridStyle}>
              {sortActiveFirst(group).map((a) => renderCard(a, expandedId, onToggleExpand, onSendMessage, agentMessages))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
