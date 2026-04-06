import { useState, useRef, useEffect } from 'react';

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
  onSendMessage: (agentId: string, message: string) => void;
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
  onSendMessage,
  messages,
}: AgentCardProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, expanded]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(agent.id, trimmed);
    setInput('');
  };

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
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onClick={(e) => {
        // Don't toggle if clicking input or button
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
        onToggleExpand();
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)', marginBottom: 'var(--gap-sm)' }}>
        {/* Status dot */}
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
        {/* Agent name */}
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1, minWidth: 0 }}>
          {agent.name}
        </span>
        {/* Model badge */}
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
      </div>

      {/* Department tag */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--gap-sm)' }}>
        {agent.department}
      </div>

      {/* Last message (truncated) */}
      {agent.lastMessage && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 'var(--gap-sm)',
          }}
        >
          {agent.lastMessage}
        </div>
      )}

      {/* Relative time */}
      {agent.lastActivity && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {relativeTime(agent.lastActivity)}
        </div>
      )}

      {/* Expanded section */}
      {expanded && (
        <div style={{ marginTop: 'var(--gap-md)', borderTop: '1px solid var(--border-default)', paddingTop: 'var(--gap-md)' }}>
          {/* Description */}
          {agent.description && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--gap-sm)' }}>
              {agent.description}
            </div>
          )}

          {/* Message history */}
          <div
            style={{
              maxHeight: 300,
              overflowY: 'auto',
              marginBottom: 'var(--gap-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            {messages.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No messages yet
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.8rem',
                  color: msg.from === 'user' ? 'var(--text-accent)' : 'var(--text-primary)',
                  padding: '0.3rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: msg.from === 'user' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <span style={{ fontWeight: 600, marginRight: '0.3rem' }}>{msg.from}:</span>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ display: 'flex', gap: 'var(--gap-sm)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Send a message..."
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.6rem',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleSend(); }}
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
