import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { requireAuth } from '../auth/middleware.js';

const router = Router();

function getStudioRoot(): string {
  return process.env.STUDIO_ROOT ?? process.cwd();
}

router.get('/api/reports/iterations', requireAuth, (req, res) => {
  const iterationsDir = path.join(getStudioRoot(), '.studio', 'iterations');
  if (!fs.existsSync(iterationsDir)) {
    res.json({ iterations: [] });
    return;
  }

  const entries = fs.readdirSync(iterationsDir, { withFileTypes: true });
  const iterations = entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const summaryPath = path.join(iterationsDir, e.name, 'summary.json');
      let summary = {};
      if (fs.existsSync(summaryPath)) {
        try {
          summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
        } catch {
          // ignore parse errors
        }
      }
      return { id: e.name, ...summary };
    });

  res.json({ iterations });
});

router.get('/api/reports/iterations/:id', requireAuth, (req, res) => {
  const iterationDir = path.join(getStudioRoot(), '.studio', 'iterations', req.params.id);
  if (!fs.existsSync(iterationDir)) {
    res.status(404).json({ error: 'Iteration not found' });
    return;
  }

  const summaryPath = path.join(iterationDir, 'summary.json');
  let summary = {};
  if (fs.existsSync(summaryPath)) {
    try {
      summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    } catch {
      // ignore
    }
  }

  const entries = fs.readdirSync(iterationDir, { withFileTypes: true });
  const teams = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  res.json({ id: req.params.id, ...summary, teams });
});

router.get('/api/reports/iterations/:id/:team', requireAuth, (req, res) => {
  const teamDir = path.join(
    getStudioRoot(),
    '.studio',
    'iterations',
    req.params.id,
    req.params.team,
  );
  if (!fs.existsSync(teamDir)) {
    res.status(404).json({ error: 'Team report not found' });
    return;
  }

  const reportPath = path.join(teamDir, 'report.json');
  if (!fs.existsSync(reportPath)) {
    res.json({ team: req.params.team, report: null });
    return;
  }

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    res.json({ team: req.params.team, report });
  } catch {
    res.status(500).json({ error: 'Failed to parse report' });
  }
});

export default router;
