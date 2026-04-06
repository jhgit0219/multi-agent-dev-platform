// dashboard/server/src/agents/routes.ts
import { Router } from 'express';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { discoverAgents, updateAgentState } from './registry.js';
import { getProjectPath } from '../projects/scanner.js';
import { broadcast } from '../ws/server.js';

const router = Router();

function getProjectRoot(): string {
  return process.env.STUDIO_ROOT ?? process.cwd();
}

// Map iteration team dirs to agent IDs
const TEAM_TO_AGENT: Record<string, string> = {
  feature: 'creative-director',
  dev: 'lead-engineer',
  test: 'qa-lead',
  security: 'security-lead',
  devops: 'devops-lead',
};

// Load reports from .studio/iterations/ and convert to conversation-style messages per agent
function loadAgentHistory(projectPath: string): Record<string, Array<{ from: string; text: string; timestamp: string }>> {
  const history: Record<string, Array<{ from: string; text: string; timestamp: string }>> = {};
  const iterDir = join(projectPath, '.studio', 'iterations');
  if (!existsSync(iterDir)) return history;

  const iterations = readdirSync(iterDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const iter of iterations) {
    const iterPath = join(iterDir, iter.name);
    const teams = readdirSync(iterPath, { withFileTypes: true }).filter(e => e.isDirectory());

    for (const team of teams) {
      const agentId = TEAM_TO_AGENT[team.name] ?? team.name;
      if (!history[agentId]) history[agentId] = [];

      const teamDir = join(iterPath, team.name);
      const files = readdirSync(teamDir);

      for (const file of files) {
        const filePath = join(teamDir, file);
        const content = readFileSync(filePath, 'utf-8');

        if (file.endsWith('.json')) {
          try {
            const data = JSON.parse(content);
            // Create a summary message from the JSON report
            const summary = summarizeReport(team.name, file, data);
            history[agentId].push({
              from: agentId,
              text: summary,
              timestamp: new Date().toISOString(),
            });
          } catch { /* skip malformed JSON */ }
        } else if (file.endsWith('.md')) {
          // Truncate markdown to first 500 chars for preview
          const preview = content.length > 500 ? content.slice(0, 500) + '...' : content;
          history[agentId].push({
            from: agentId,
            text: `**${file}**\n${preview}`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  return history;
}

function summarizeReport(team: string, file: string, data: unknown): string {
  if (!data || typeof data !== 'object') return `${file}: (empty report)`;
  const d = data as Record<string, unknown>;

  if (file === 'dev_report.json') {
    const completed = Array.isArray(d.stories_completed) ? d.stories_completed.length : 0;
    const files = Array.isArray(d.files_created) ? d.files_created.length : 0;
    return `Development complete. ${completed} stories implemented, ${files} files created.`;
  }

  if (file === 'test_report.json') {
    const fe = d.frontend as Record<string, unknown> | undefined;
    const be = d.backend as Record<string, unknown> | undefined;
    const parts: string[] = [];
    if (fe) parts.push(`Frontend: ${fe.passed}/${fe.total} passed`);
    if (be) parts.push(`Backend: ${be.passed}/${be.total} passed`);
    const recs = Array.isArray(d.recommendations) ? d.recommendations.length : 0;
    return `Testing complete. ${parts.join('. ')}. ${recs} recommendations.`;
  }

  if (file === 'security_audit.json') {
    const findings = Array.isArray(d.findings) ? d.findings.length : 0;
    const risk = d.overall_risk_level ?? d.overallRisk ?? 'unknown';
    return `Security audit complete. ${findings} findings. Overall risk: ${risk}.`;
  }

  if (file === 'deploy_report.json') {
    const files = Array.isArray(d.files_created) ? d.files_created.length : 0;
    return `DevOps complete. ${files} infrastructure files generated.`;
  }

  if (file === 'backlog.json' && Array.isArray(data)) {
    return `Backlog created with ${(data as unknown[]).length} stories.`;
  }

  // Generic fallback
  const keys = Object.keys(d);
  return `${file}: ${keys.length} fields (${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''})`;
}

// List all agents with current state
router.get('/api/agents', (_req, res) => {
  const agents = discoverAgents(getProjectRoot());
  res.json({ agents });
});

// Get agent history for a specific project
router.get('/api/projects/:projectId/agents/history', (req, res) => {
  const projectPath = getProjectPath(req.params.projectId);
  if (!projectPath) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const history = loadAgentHistory(projectPath);
  res.json({ history });
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
