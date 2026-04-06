import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { initDb, closeDb } from '../auth/db.js';
import authRoutes from '../auth/routes.js';
import reportRoutes from '../reports/routes.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  app.use(reportRoutes);
  return app;
}

describe('Reports API', () => {
  let app: ReturnType<typeof createApp>;
  let token: string;
  let tmpDir: string;

  beforeEach(async () => {
    initDb(':memory:');
    app = createApp();

    // Register and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin@test.com', password: 'pass123' });
    token = res.body.token;

    // Create temp .studio/iterations structure
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reports-test-'));
    const iterDir = path.join(tmpDir, '.studio', 'iterations', 'iter-001');
    const teamDir = path.join(iterDir, 'backend');
    fs.mkdirSync(teamDir, { recursive: true });
    fs.writeFileSync(
      path.join(iterDir, 'summary.json'),
      JSON.stringify({ status: 'complete', phases: 3 }),
    );
    fs.writeFileSync(
      path.join(teamDir, 'report.json'),
      JSON.stringify({ tests: 5, passed: 5 }),
    );

    process.env.STUDIO_ROOT = tmpDir;
  });

  afterEach(() => {
    closeDb();
    delete process.env.STUDIO_ROOT;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns iteration list from .studio/iterations/', async () => {
    const res = await request(app)
      .get('/api/reports/iterations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.iterations).toHaveLength(1);
    expect(res.body.iterations[0].id).toBe('iter-001');
    expect(res.body.iterations[0].status).toBe('complete');
  });

  it('returns iteration detail', async () => {
    const res = await request(app)
      .get('/api/reports/iterations/iter-001')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('iter-001');
    expect(res.body.teams).toContain('backend');
  });

  it('returns team report', async () => {
    const res = await request(app)
      .get('/api/reports/iterations/iter-001/backend')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.team).toBe('backend');
    expect(res.body.report.tests).toBe(5);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/reports/iterations');
    expect(res.status).toBe(401);
  });

  it('returns 404 for missing iteration', async () => {
    const res = await request(app)
      .get('/api/reports/iterations/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
