import { Router } from 'express';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { discoverProjects, getProjectPath } from './scanner.js';

const router = Router();

// List all discovered projects — no auth for local dev
router.get('/api/projects', (_req, res) => {
  const projects = discoverProjects();
  res.json({ projects });
});

// Get project detail
router.get('/api/projects/:projectId', (req, res) => {
  const projectPath = getProjectPath(req.params.projectId);
  if (!projectPath) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const contextPath = join(projectPath, '.studio', 'context.md');
  const configPath = join(projectPath, 'studio.config.json');

  const detail: Record<string, unknown> = {
    id: req.params.projectId,
    path: projectPath,
  };

  if (existsSync(configPath)) {
    try {
      detail.config = JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch { /* ignore */ }
  }

  if (existsSync(contextPath)) {
    detail.context = readFileSync(contextPath, 'utf-8');
  }

  res.json(detail);
});

// List iterations for a project
router.get('/api/projects/:projectId/iterations', (req, res) => {
  const projectPath = getProjectPath(req.params.projectId);
  if (!projectPath) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const iterDir = join(projectPath, '.studio', 'iterations');
  if (!existsSync(iterDir)) {
    res.json({ iterations: [] });
    return;
  }

  const iterations = readdirSync(iterDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const summaryPath = join(iterDir, e.name, 'summary.json');
      let summary = {};
      if (existsSync(summaryPath)) {
        try { summary = JSON.parse(readFileSync(summaryPath, 'utf-8')); } catch { /* */ }
      }

      // List teams in this iteration
      const teams = readdirSync(join(iterDir, e.name), { withFileTypes: true })
        .filter((t) => t.isDirectory())
        .map((t) => t.name);

      return { id: e.name, teams, ...summary };
    });

  res.json({ iterations });
});

// Get team report for a project iteration
router.get('/api/projects/:projectId/iterations/:iterationId/:team', (req, res) => {
  const projectPath = getProjectPath(req.params.projectId);
  if (!projectPath) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const teamDir = join(projectPath, '.studio', 'iterations', req.params.iterationId, req.params.team);
  if (!existsSync(teamDir)) {
    res.status(404).json({ error: 'Team report not found' });
    return;
  }

  const files = readdirSync(teamDir);
  const reports: Record<string, unknown> = {};
  for (const file of files) {
    const filePath = join(teamDir, file);
    try {
      reports[file] = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch {
      reports[file] = readFileSync(filePath, 'utf-8');
    }
  }

  res.json({ team: req.params.team, reports });
});

export default router;
