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

      {/* Expanded chat section */}
      {expanded && (
        <div
          style={{
            marginTop: 'var(--gap-md)',
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--gap-md)',
            display: 'flex',
            flexDirection: 'column',
            height: 350,
          }}
        >
          {/* Chat message area — scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              paddingRight: '0.3rem',
              scrollbarGutter: 'stable',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                No activity yet
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: msg.from === 'user' ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-tertiary)',
                    borderLeft: msg.from === 'user'
                      ? '3px solid var(--accent-primary)'
                      : '3px solid var(--status-complete)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{
                    fontSize: '0.7rem',
                    color: msg.from === 'user' ? 'var(--text-accent)' : 'var(--status-active)',
                    fontWeight: 700,
                    marginBottom: '0.2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {msg.from === 'user' ? 'You' : agent.name}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>{msg.text}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input — fixed at bottom */}
          <div style={{ display: 'flex', gap: 'var(--gap-sm)', marginTop: 'var(--gap-sm)', flexShrink: 0 }}>
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
                padding: '0.5rem 0.8rem',
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
                padding: '0.5rem 1rem',
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
