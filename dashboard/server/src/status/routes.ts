import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { broadcast } from '../ws/server.js';
import type { WSEvent } from '../ws/events.js';

const router = Router();

function getStudioRoot(): string {
  return process.env.STUDIO_ROOT ?? process.cwd();
}

// No auth required — local dashboard use
router.get('/api/status', (_req, res) => {
  const root = getStudioRoot();
  const iterationsDir = path.join(root, '.studio', 'iterations');
  const contextPath = path.join(root, '.studio', 'context.md');

  const status: Record<string, unknown> = {
    studioRoot: root,
    hasConfig: fs.existsSync(path.join(root, 'studio.config.json')),
    hasContext: fs.existsSync(contextPath),
    iterations: 0,
    currentPhase: null,
  };

  if (fs.existsSync(contextPath)) {
    status.context = fs.readFileSync(contextPath, 'utf-8');
  }

  if (fs.existsSync(iterationsDir)) {
    const entries = fs.readdirSync(iterationsDir, { withFileTypes: true });
    status.iterations = entries.filter((e) => e.isDirectory()).length;
  }

  res.json(status);
});

// Push events from the skill via curl — no auth required for local use
router.post('/api/events', (req, res) => {
  const event = req.body as WSEvent;
  if (!event.type) {
    res.status(400).json({ error: 'Missing event type' });
    return;
  }

  // Ensure timestamp
  if (!event.timestamp) {
    event.timestamp = new Date().toISOString();
  }

  // Broadcast to all WebSocket clients
  broadcast(event);

  res.json({ ok: true });
});

// Get latest reports for an iteration without auth
router.get('/api/status/iterations/:id', (_req, res) => {
  const iterationDir = path.join(
    getStudioRoot(),
    '.studio',
    'iterations',
    _req.params.id,
  );

  if (!fs.existsSync(iterationDir)) {
    res.status(404).json({ error: 'Iteration not found' });
    return;
  }

  const teams: Record<string, unknown> = {};
  const entries = fs.readdirSync(iterationDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const teamDir = path.join(iterationDir, entry.name);
      const files = fs.readdirSync(teamDir);
      const reports: Record<string, unknown> = {};
      for (const file of files) {
        try {
          reports[file] = JSON.parse(
            fs.readFileSync(path.join(teamDir, file), 'utf-8'),
          );
        } catch {
          reports[file] = fs.readFileSync(path.join(teamDir, file), 'utf-8');
        }
      }
      teams[entry.name] = reports;
    }
  }

  res.json({ id: _req.params.id, teams });
});

export default router;
