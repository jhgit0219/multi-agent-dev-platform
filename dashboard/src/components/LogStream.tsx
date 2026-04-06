import { useEffect, useRef } from 'react';

interface LogStreamProps {
  events: Array<{ type: string; data?: any; timestamp: string }>;
  collapsed: boolean;
  onToggle: () => void;
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toTimeString().slice(0, 8);
  } catch {
    return '??:??:??';
  }
}

function getEventColor(type: string): string {
  if (type.startsWith('phase:start')) return 'var(--text-accent)';
  if (type.startsWith('phase:complete')) return 'var(--status-complete)';
  if (type.includes('error')) return 'var(--status-error)';
  if (type === 'agent:status') return 'var(--status-active)';
  if (type === 'agent:message') return 'var(--text-secondary)';
  return 'var(--text-muted)';
}

function getEventMessage(event: { type: string; data?: any }): string {
  const d = event.data;
  if (!d) return event.type;
  if (typeof d === 'string') return d;
  if (d.message) return `${d.agentId ? d.agentId + ': ' : ''}${d.message}`;
  if (d.agentId && d.status) return `${d.agentId} -> ${d.status}`;
  if (d.phase) return `phase: ${d.phase}`;
  return event.type;
}

export default function LogStream({ events, collapsed, onToggle }: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length, collapsed]);

  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: '1px solid var(--border-default)',
      }}
    >
      {/* Toggle bar */}
      <div
        onClick={onToggle}
        style={{
          height: 40,
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--gap-lg)',
          cursor: 'pointer',
          gap: 'var(--gap-md)',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          LIVE LOG
        </span>
        {collapsed && lastEvent && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              flex: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [{formatTime(lastEvent.timestamp)}] {getEventMessage(lastEvent)}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>
          {collapsed ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      {/* Expanded log area */}
      {!collapsed && (
        <div
          ref={scrollRef}
          style={{
            height: 200,
            overflowY: 'auto',
            background: 'var(--bg-primary)',
            padding: 'var(--gap-sm) var(--gap-lg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            lineHeight: 1.8,
          }}
        >
          {events.map((event, i) => (
            <div key={i} style={{ color: getEventColor(event.type) }}>
              <span style={{ color: 'var(--text-muted)' }}>[{formatTime(event.timestamp)}]</span>{' '}
              <span style={{ color: getEventColor(event.type), fontWeight: 600 }}>[{event.type}]</span>{' '}
              {getEventMessage(event)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
