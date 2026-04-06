# Dashboard Mission Control Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current multi-page dashboard with a single-page dark-themed mission control that shows all 30 agents as live panels in a 3-column grid with real-time WebSocket status, per-agent chat, and view toggles.

**Architecture:** Single-page React app. Dark theme via CSS variables. WebSocket for real-time agent status and message relay. Backend gets a message queue endpoint and agent registry. Frontend is one page with a top bar, agent grid, and collapsible log stream. No React Router needed (except login/register).

**Tech Stack:** React 19, TypeScript, Vite, CSS variables (no UI library), WebSocket, Express backend

**Design Doc:** Brainstormed in conversation on 2026-04-06. Dark mission control, 3-column grid, all 30 agents visible, grouped by tier/department with view toggle, per-agent chat via WebSocket relay.

---

## Phase 1: Backend — Agent Registry + Message Queue

### Task 1.1: Agent Registry Endpoint

**Files:**
- Create: `dashboard/server/src/agents/registry.ts`
- Create: `dashboard/server/src/agents/routes.ts`
- Modify: `dashboard/server/src/index.ts`

**Step 1: Create agent registry that reads .claude/agents/ directory**

```typescript
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
```

**Step 2: Create agents API routes**

```typescript
// dashboard/server/src/agents/routes.ts
import { Router } from 'express';
import { discoverAgents, updateAgentState } from './registry.js';
import { broadcast } from '../ws/server.js';

const router = Router();

function getProjectRoot(): string {
  return process.env.STUDIO_ROOT ?? process.cwd();
}

// List all agents with current state
router.get('/api/agents', (_req, res) => {
  const agents = discoverAgents(getProjectRoot());
  res.json({ agents });
});

// Update agent state (called by orchestrator skill via curl)
router.post('/api/agents/:id/status', (req, res) => {
  const { status, message } = req.body;
  updateAgentState(req.params.id, {
    status: status ?? 'active',
    lastMessage: message ?? '',
  });

  // Broadcast state change to all WebSocket clients
  broadcast({
    type: 'agent:status',
    data: { agentId: req.params.id, status, message },
    timestamp: new Date().toISOString(),
  });

  res.json({ ok: true });
});

// Send message to agent (queued for orchestrator to relay)
router.post('/api/agents/:id/message', (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message required' });
    return;
  }

  // Broadcast as a pending message — orchestrator picks it up
  broadcast({
    type: 'agent:message',
    data: { agentId: req.params.id, message, from: 'user' },
    timestamp: new Date().toISOString(),
  });

  res.json({ ok: true, queued: true });
});

export default router;
```

**Step 3: Mount in server index.ts**

Add `import agentRoutes from './agents/routes.js';` and `app.use(agentRoutes);` to `dashboard/server/src/index.ts`.

**Step 4: Verify server starts without errors**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd dashboard/server && npx tsx src/index.ts
# Should print: Studio root: ... Dashboard server running on port 3001
# Then curl http://localhost:3001/api/agents should return all 30 agents
```

**Step 5: Commit**

```bash
git add dashboard/server/src/agents/ dashboard/server/src/index.ts
git commit -m "feat: add agent registry and message queue endpoints"
```

---

## Phase 2: Frontend — Dark Theme + CSS Variables

### Task 2.1: Global Theme

**Files:**
- Create: `dashboard/src/theme.css`
- Modify: `dashboard/src/main.tsx` (import theme.css)

**Step 1: Create CSS variables file**

```css
/* dashboard/src/theme.css */
:root {
  /* Backgrounds */
  --bg-primary: #0a0a1a;
  --bg-secondary: #12122a;
  --bg-tertiary: #1a1a3a;
  --bg-card: #12122a;
  --bg-card-hover: #1a1a3a;
  --bg-input: #0e0e20;

  /* Borders */
  --border-default: #1e1e3a;
  --border-active: #4f46e5;
  --border-success: #22c55e;
  --border-error: #ef4444;
  --border-warning: #eab308;

  /* Text */
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-accent: #818cf8;

  /* Status colors */
  --status-active: #22c55e;
  --status-idle: #64748b;
  --status-error: #ef4444;
  --status-complete: #4f46e5;
  --status-warning: #eab308;

  /* Accents */
  --accent-primary: #4f46e5;
  --accent-hover: #6366f1;

  /* Spacing */
  --gap-sm: 0.5rem;
  --gap-md: 1rem;
  --gap-lg: 1.5rem;

  /* Fonts */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  height: 100vh;
}

#root {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Pulsing animation for active agents */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Glow effect for active panels */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.3); }
  50% { box-shadow: 0 0 15px rgba(79, 70, 229, 0.6); }
}

.panel-active {
  animation: glow 3s ease-in-out infinite;
}
```

**Step 2: Import in main.tsx**

Add `import './theme.css';` at the top of `dashboard/src/main.tsx`.

**Step 3: Commit**

```bash
git add dashboard/src/theme.css dashboard/src/main.tsx
git commit -m "feat: add dark mission control theme with CSS variables"
```

---

## Phase 3: Frontend — Mission Control Layout

### Task 3.1: Top Bar Component

**Files:**
- Create: `dashboard/src/components/TopBar.tsx`

**Step 1: Create top bar with project selector, iteration counter, pipeline phases, view toggle**

The top bar has:
- Left: "DEV STUDIO" branding + project selector dropdown (fetches from `/api/projects`)
- Center: pipeline phase indicators (Planning → Build → Validate → Ship → Report) with current phase highlighted
- Right: view toggle buttons (All / Tier / Department) + WebSocket connection indicator

```typescript
interface TopBarProps {
  projects: Array<{ id: string; name: string }>;
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  currentPhase: string | null;
  viewMode: 'all' | 'tier' | 'department';
  onViewModeChange: (mode: 'all' | 'tier' | 'department') => void;
  wsConnected: boolean;
}
```

Style: fixed top, height 56px, `var(--bg-secondary)` background, bottom border `var(--border-default)`.

**Step 2: Commit**

```bash
git add dashboard/src/components/TopBar.tsx
git commit -m "feat: add mission control top bar with project selector and view toggle"
```

---

### Task 3.2: Agent Card Component

**Files:**
- Create: `dashboard/src/components/AgentCard.tsx`

**Step 1: Create the agent card**

Two visual states:

**Compact (default):**
- Agent name (bold), model badge (opus/sonnet chip), department tag
- Status dot (pulsing if active)
- One-line latest message (truncated)
- Elapsed time since last activity

**Expanded (click to toggle):**
- Everything above, plus:
- Message history (scrollable, max-height 300px)
- Chat input at the bottom (text input + send button)
- File outputs list if available

```typescript
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
```

Style:
- Background: `var(--bg-card)`
- Border: `var(--border-default)`, changes to `var(--border-active)` when active
- Active cards get `panel-active` class for glow animation
- Status dot: 8px circle, color from `--status-*` vars, `status-pulse` class when active
- Model badge: small chip, indigo for opus, gray for sonnet
- Chat input: `var(--bg-input)` background, appears only when expanded

**Step 2: Commit**

```bash
git add dashboard/src/components/AgentCard.tsx
git commit -m "feat: add agent card with compact/expanded states and chat input"
```

---

### Task 3.3: Agent Grid Component

**Files:**
- Create: `dashboard/src/components/AgentGrid.tsx`

**Step 1: Create the grid that displays all agent cards**

Takes `viewMode` prop and organizes agents accordingly:

- **all**: 3-column CSS grid, active agents sorted to top
- **tier**: 3 sections (Directors, Leads, Specialists) each with 3-column grid
- **department**: sections per department (Leadership, Engineering, Design, QA, Security, DevOps, Data, Documentation, Release) each with 3-column grid

```typescript
interface AgentGridProps {
  agents: AgentInfo[];
  viewMode: 'all' | 'tier' | 'department';
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onSendMessage: (agentId: string, message: string) => void;
  agentMessages: Record<string, Array<{ from: string; text: string; timestamp: string }>>;
}
```

Style: scrollable area filling available height between top bar and log stream. Grid gap `var(--gap-md)`. Section headers in `var(--text-muted)` with uppercase.

**Step 2: Commit**

```bash
git add dashboard/src/components/AgentGrid.tsx
git commit -m "feat: add agent grid with all/tier/department view modes"
```

---

### Task 3.4: Log Stream Component

**Files:**
- Create: `dashboard/src/components/LogStream.tsx`

**Step 1: Create collapsible log stream**

Fixed to bottom of screen. Collapsed: 40px bar showing "LIVE LOG" + last message + toggle button. Expanded: 200px tall scrollable log with team-colored entries.

Each log entry: `[timestamp] [agent-name] message` with agent name colored by department.

```typescript
interface LogStreamProps {
  events: WsEvent[];
  collapsed: boolean;
  onToggle: () => void;
}
```

Auto-scrolls to bottom on new messages.

**Step 2: Commit**

```bash
git add dashboard/src/components/LogStream.tsx
git commit -m "feat: add collapsible live log stream"
```

---

### Task 3.5: Mission Control Page

**Files:**
- Create: `dashboard/src/pages/MissionControl.tsx`
- Modify: `dashboard/src/router.tsx`
- Modify: `dashboard/src/App.tsx`

**Step 1: Create the main mission control page**

This is the primary page. It:
1. Fetches projects from `/api/projects`
2. Fetches agents from `/api/agents`
3. Connects WebSocket for live updates
4. Updates agent states from WebSocket events
5. Renders TopBar + AgentGrid + LogStream

State management:
- `projects` — fetched once on mount
- `selectedProject` — current project ID
- `agents` — array of AgentInfo, updated from WebSocket events
- `viewMode` — 'all' | 'tier' | 'department'
- `expandedAgent` — which agent card is expanded (null or ID)
- `agentMessages` — Record<string, Message[]> for chat history
- `logCollapsed` — boolean

WebSocket event handling:
- `agent:status` → update agent status/lastMessage in state
- `phase:start` / `phase:complete` → update pipeline indicator
- `agent:message` → append to agentMessages
- All events → append to log stream

```typescript
// No props — this is the root page
export default function MissionControl() { ... }
```

**Step 2: Update router — remove old multi-page routes, make MissionControl the default**

```typescript
// dashboard/src/router.tsx
export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <AuthGuard />,  // check auth, redirect to /login if needed
    children: [
      { index: true, element: <MissionControl /> },
    ],
  },
]);
```

**Step 3: Create AuthGuard wrapper**

Simple component that checks `useAuth()` and either renders `<Outlet />` or redirects to `/login`. Replaces the old Layout component's auth check.

**Step 4: Verify build**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd dashboard && npx vite build
```

**Step 5: Commit**

```bash
git add dashboard/src/
git commit -m "feat: add mission control page replacing multi-page layout"
```

---

## Phase 4: Frontend — Agent Chat Integration

### Task 4.1: Message Send Flow

**Files:**
- Modify: `dashboard/src/pages/MissionControl.tsx`
- Modify: `dashboard/src/components/AgentCard.tsx`

**Step 1: Implement send message**

When user types in an agent's chat input and hits Enter/Send:
1. POST to `/api/agents/{id}/message` with `{ message }`
2. Optimistically add to local `agentMessages` state
3. Backend broadcasts `agent:message` event via WebSocket
4. All connected dashboard clients see it

**Step 2: Display incoming agent messages**

When WebSocket receives `agent:message` events with `from: 'agent'`:
1. Append to `agentMessages[agentId]`
2. Update agent's `lastMessage`
3. Flash the agent card briefly

**Step 3: Commit**

```bash
git add dashboard/src/
git commit -m "feat: add agent chat messaging via WebSocket relay"
```

---

## Phase 5: Cleanup — Remove Old Pages

### Task 5.1: Remove Dead Code

**Files:**
- Delete: `dashboard/src/pages/IterationTimeline.tsx`
- Delete: `dashboard/src/pages/TeamPanels.tsx`
- Delete: `dashboard/src/pages/LogStream.tsx`
- Delete: `dashboard/src/pages/ReportsArchive.tsx`
- Delete: `dashboard/src/pages/UserManagement.tsx`
- Delete: `dashboard/src/pages/ProjectOverview.tsx`
- Delete: `dashboard/src/components/Layout.tsx`
- Delete: `dashboard/src/components/TimelineEntry.tsx`
- Delete: `dashboard/src/components/TeamPanel.tsx`
- Delete: `dashboard/src/components/ReportCard.tsx`
- Delete: `dashboard/src/components/ConfigSummary.tsx`
- Delete: `dashboard/src/components/CodeSnippet.tsx`
- Delete: `dashboard/src/components/LogEntry.tsx`
- Keep: `dashboard/src/components/StatusBadge.tsx` (still useful)
- Keep: `dashboard/src/pages/Login.tsx` and `Register.tsx`

**Step 1: Delete old files**

```bash
rm dashboard/src/pages/IterationTimeline.tsx
rm dashboard/src/pages/TeamPanels.tsx
rm dashboard/src/pages/LogStream.tsx
rm dashboard/src/pages/ReportsArchive.tsx
rm dashboard/src/pages/UserManagement.tsx
rm dashboard/src/pages/ProjectOverview.tsx
rm dashboard/src/components/Layout.tsx
rm dashboard/src/components/TimelineEntry.tsx
rm dashboard/src/components/TeamPanel.tsx
rm dashboard/src/components/ReportCard.tsx
rm dashboard/src/components/ConfigSummary.tsx
rm dashboard/src/components/CodeSnippet.tsx
rm dashboard/src/components/LogEntry.tsx
```

**Step 2: Update Login/Register pages to use dark theme**

Change background from `#f4f4f8` to `var(--bg-primary)`, form background to `var(--bg-card)`, text to `var(--text-primary)`, inputs to `var(--bg-input)` with `var(--border-default)` border, button to `var(--accent-primary)`.

**Step 3: Verify build**

```bash
cd dashboard && npx vite build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove old multi-page dashboard, keep mission control"
```

---

## Phase 6: Update Dev Studio Skill

### Task 6.1: Push Agent Status Events

**Files:**
- Modify: `.claude/skills/dev-studio/SKILL.md`

**Step 1: Update the skill to push agent-specific status events**

In addition to the existing `phase:start`/`phase:complete` events, the skill should push `agent:status` events when spawning agents:

Before spawning each agent:
```bash
curl -s -X POST http://localhost:3001/api/agents/{agent-id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"active","message":"Starting {task description}..."}'
```

After agent returns:
```bash
curl -s -X POST http://localhost:3001/api/agents/{agent-id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"complete","message":"Finished {task description}"}'
```

Map the phase agents to their IDs:
- Phase 1: `creative-director`
- Phase 2: `backend-engineer`, `frontend-engineer`, `database-engineer`, then `lead-engineer`
- Phase 3+4: `qa-lead`, `security-lead`, `performance-analyst`
- Phase 5: `devops-lead`

**Step 2: Commit**

```bash
git add .claude/skills/dev-studio/SKILL.md
git commit -m "feat: push per-agent status events from dev-studio skill"
```

---

## Execution Order Summary

| Phase | What | Depends On |
| ----- | ---- | ---------- |
| 1 | Backend agent registry + message API | Nothing |
| 2 | Dark theme CSS | Nothing |
| 3 | Frontend components (TopBar, AgentCard, Grid, LogStream, MissionControl) | Phases 1-2 |
| 4 | Chat messaging integration | Phase 3 |
| 5 | Cleanup old pages | Phase 3 |
| 6 | Skill update for agent status events | Phase 1 |

Phases 1 and 2 can run in parallel. Phase 6 can run in parallel with 3-5.
