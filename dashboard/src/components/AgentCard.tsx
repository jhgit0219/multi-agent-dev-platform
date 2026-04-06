import { useRef, useEffect } from 'react';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    model: string;
    tier: string;
    department: string;
    description: string;
    status: 'idle' | 'active' | 'error' | 'complete';
    lastMessage: string;
    lastActivity: string | null;
  };
  expanded: boolean;
  onToggleExpand: () => void;
  messages: Array<{ from: string; text: string; timestamp: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--status-active)',
  idle: 'var(--status-idle)',
  error: 'var(--status-error)',
  complete: 'var(--status-complete)',
};

const BORDER_COLORS: Record<string, string> = {
  active: 'var(--border-active)',
  error: 'var(--border-error)',
  complete: 'var(--border-success)',
};

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentCard({
  agent,
  expanded,
  onToggleExpand,
  messages,
}: AgentCardProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, expanded]);

  const borderColor = BORDER_COLORS[agent.status] ?? 'var(--border-default)';
  const isActive = agent.status === 'active';
  const isOpus = agent.model.toLowerCase().includes('opus');

  return (
    <div
      className={isActive ? 'panel-active' : undefined}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--gap-md)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row — clickable to toggle */}
      <div
        onClick={onToggleExpand}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)', marginBottom: 'var(--gap-sm)', cursor: 'pointer' }}
      >
        <div
          className={isActive ? 'status-pulse' : undefined}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: STATUS_COLORS[agent.status] ?? 'var(--status-idle)',
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1, minWidth: 0 }}>
          {agent.name}
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            padding: '0.1rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
            background: isOpus ? 'rgba(79, 70, 229, 0.3)' : 'rgba(100, 116, 139, 0.3)',
            color: isOpus ? 'var(--text-accent)' : 'var(--text-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          {isOpus ? 'opus' : 'sonnet'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      {/* Department + last activity (always visible) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {agent.department}
        </span>
        {agent.lastActivity && (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {relativeTime(agent.lastActivity)}
          </span>
        )}
      </div>

      {/* Last message preview when collapsed */}
      {!expanded && agent.lastMessage && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {agent.lastMessage}
        </div>
      )}

      {/* Expanded: activity log */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--gap-sm)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 300,
            overflowY: 'auto',
            gap: '0.3rem',
            scrollbarGutter: 'stable',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0', textAlign: 'center' }}>
              No activity yet
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  borderLeft: '3px solid var(--status-complete)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                  color: 'var(--text-primary)',
                }}
              >
                {msg.text}
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
