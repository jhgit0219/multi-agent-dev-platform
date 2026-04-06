interface TopBarProps {
  projects: Array<{ id: string; name: string }>;
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  currentPhase: string | null;
  viewMode: 'all' | 'tier' | 'department';
  onViewModeChange: (mode: 'all' | 'tier' | 'department') => void;
  wsConnected: boolean;
}

const PHASES = ['Planning', 'Build', 'Validate', 'Ship', 'Report'];

export default function TopBar({
  projects,
  selectedProject,
  onSelectProject,
  currentPhase,
  viewMode,
  onViewModeChange,
  wsConnected,
}: TopBarProps) {
  const currentIndex = currentPhase ? PHASES.findIndex(p => p.toLowerCase() === currentPhase.toLowerCase()) : -1;

  return (
    <div
      style={{
        height: 56,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--gap-lg)',
        flexShrink: 0,
      }}
    >
      {/* Left: Branding + Project Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            color: 'var(--text-accent)',
          }}
        >
          DEV STUDIO
        </span>
        <select
          value={selectedProject ?? ''}
          onChange={(e) => onSelectProject(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.3rem 0.5rem',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Center: Pipeline Phases */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
        {PHASES.map((phase, i) => {
          let color = 'var(--text-muted)';
          if (i < currentIndex) color = 'var(--status-complete)';
          else if (i === currentIndex) color = 'var(--accent-primary)';

          return (
            <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: i === currentIndex ? 700 : 500,
                  color,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                {phase}
              </span>
              {i < PHASES.length - 1 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>&#8594;</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: View Toggle + WS Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
        <div
          style={{
            display: 'flex',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          {(['all', 'tier', 'department'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              style={{
                background: viewMode === mode ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: viewMode === mode ? 600 : 400,
              }}
            >
              {mode === 'department' ? 'Dept' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: wsConnected ? 'var(--status-active)' : 'var(--status-error)',
          }}
          title={wsConnected ? 'WebSocket connected' : 'WebSocket disconnected'}
        />
      </div>
    </div>
  );
}
