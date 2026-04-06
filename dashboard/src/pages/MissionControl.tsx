import { useState, useEffect, useCallback } from 'react';
import TopBar from '../components/TopBar';
import AgentGrid from '../components/AgentGrid';
import LogStream from '../components/LogStream';
import { useWebSocket } from '../hooks/useWebSocket';
import { authFetch } from '../api/auth';

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

interface Message {
  from: string;
  text: string;
  timestamp: string;
}

interface Project {
  id: string;
  name: string;
}

const PHASES = ['planning', 'build', 'validate', 'ship', 'report'];

export default function MissionControl() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'tier' | 'department'>('all');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [agentMessages, setAgentMessages] = useState<Record<string, Message[]>>({});
  const [logCollapsed, setLogCollapsed] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  const { events, connected } = useWebSocket();

  // Fetch projects on mount
  useEffect(() => {
    authFetch('/api/projects')
      .then((res) => res.json())
      .then((data: { projects?: Project[] }) => {
        const list = data.projects ?? [];
        setProjects(list);
        if (list.length > 0 && !selectedProject) {
          setSelectedProject(list[0].id);
        }
      })
      .catch(() => {
        // Projects endpoint may not exist yet, use fallback
        setProjects([{ id: 'default', name: 'Default Project' }]);
        if (!selectedProject) setSelectedProject('default');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch agents on mount
  useEffect(() => {
    authFetch('/api/agents')
      .then((res) => res.json())
      .then((data: { agents?: AgentInfo[] }) => {
        if (data.agents) setAgents(data.agents);
      })
      .catch(() => {});
  }, []);

  // Load agent history when project changes
  useEffect(() => {
    if (!selectedProject) return;
    authFetch(`/api/projects/${selectedProject}/agents/history`)
      .then((res) => res.json())
      .then((data: { history?: Record<string, Message[]> }) => {
        if (data.history) {
          setAgentMessages(data.history);
          // Update agent statuses based on whether they have history
          setAgents((prev) =>
            prev.map((a) => {
              const msgs = data.history?.[a.id];
              if (msgs && msgs.length > 0) {
                return { ...a, status: 'complete' as const, lastMessage: msgs[msgs.length - 1].text.slice(0, 100), lastActivity: msgs[msgs.length - 1].timestamp };
              }
              return a;
            }),
          );
        }
      })
      .catch(() => {});
  }, [selectedProject]);

  // Handle WebSocket events
  useEffect(() => {
    if (events.length === 0) return;
    const latest = events[events.length - 1];

    if (latest.type === 'agent:status') {
      const d = latest.data as { agentId?: string; status?: string; message?: string } | undefined;
      if (d?.agentId) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === d.agentId
              ? {
                  ...a,
                  status: (d.status as AgentInfo['status']) ?? a.status,
                  lastMessage: d.message ?? a.lastMessage,
                  lastActivity: latest.timestamp,
                }
              : a,
          ),
        );
      }
    }

    if (latest.type === 'phase:start') {
      const d = latest.data as { phase?: string } | undefined;
      if (d?.phase) setCurrentPhase(d.phase);
    }

    if (latest.type === 'phase:complete') {
      const d = latest.data as { phase?: string } | undefined;
      if (d?.phase) {
        const idx = PHASES.indexOf(d.phase.toLowerCase());
        if (idx >= 0 && idx < PHASES.length - 1) {
          setCurrentPhase(PHASES[idx + 1]);
        }
      }
    }

    if (latest.type === 'agent:message') {
      const d = latest.data as { agentId?: string; message?: string; from?: string } | undefined;
      if (d?.agentId) {
        const msg: Message = {
          from: d.from ?? 'agent',
          text: d.message ?? '',
          timestamp: latest.timestamp,
        };
        setAgentMessages((prev) => ({
          ...prev,
          [d.agentId!]: [...(prev[d.agentId!] ?? []), msg],
        }));
      }
    }
  }, [events.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedAgent((prev) => (prev === id ? null : id));
  }, []);

  const handleSendMessage = useCallback(
    async (agentId: string, message: string) => {
      // Optimistically add to local state
      const msg: Message = {
        from: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      };
      setAgentMessages((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] ?? []), msg],
      }));

      try {
        await authFetch(`/api/agents/${agentId}/message`, {
          method: 'POST',
          body: JSON.stringify({ message }),
        });
      } catch {
        // Message send failed silently
      }
    },
    [],
  );

  // Map WsEvents to LogStream format
  const logEvents = events.map((e) => ({
    type: e.type,
    data: e as Record<string, unknown>,
    timestamp: e.timestamp,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        currentPhase={currentPhase}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        wsConnected={connected}
      />
      <AgentGrid
        agents={agents}
        viewMode={viewMode}
        expandedId={expandedAgent}
        onToggleExpand={handleToggleExpand}
        onSendMessage={handleSendMessage}
        agentMessages={agentMessages}
      />
      <LogStream
        events={logEvents}
        collapsed={logCollapsed}
        onToggle={() => setLogCollapsed((prev) => !prev)}
      />
    </div>
  );
}
