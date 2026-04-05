import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDb, closeDb } from '../auth/db.js';
import authRoutes from '../auth/routes.js';
import { JWT_SECRET } from '../auth/middleware.js';
import jwt from 'jsonwebtoken';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  return app;
}

describe('Auth', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    initDb(':memory:');
    app = createApp();
  });

  afterEach(() => {
    closeDb();
  });

  it('first user registration creates admin', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.token).toBeDefined();
  });

  it('second user registration creates viewer', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'pass123' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'viewer@test.com', password: 'pass456' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('viewer');
  });

  it('login returns valid JWT', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'user@test.com', password: 'pass123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const decoded = jwt.verify(res.body.token, JWT_SECRET) as { email: string };
    expect(decoded.email).toBe('user@test.com');
  });

  it('invalid credentials rejected', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'user@test.com', password: 'pass123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('auth middleware rejects missing token', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.status).toBe(401);
  });

  it('auth middleware rejects invalid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('role middleware rejects unauthorized roles', async () => {
    // Register admin
    const adminRes = await request(app)
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'pass123' });
    const adminToken = adminRes.body.token;

    // Register viewer
    const viewerRes = await request(app)
      .post('/auth/register')
      .send({ email: 'viewer@test.com', password: 'pass456' });
    const viewerToken = viewerRes.body.token;

    // Viewer tries admin-only route
    const res = await request(app)
      .post('/auth/invite')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ email: 'new@test.com', password: 'pass789' });

    expect(res.status).toBe(403);

    // Admin can access
    const adminInvite = await request(app)
      .post('/auth/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'new@test.com', password: 'pass789' });

    expect(adminInvite.status).toBe(201);
  });
});
