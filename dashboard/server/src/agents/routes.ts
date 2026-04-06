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
