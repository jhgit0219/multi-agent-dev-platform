import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from './db.js';
import { requireAuth, requireRole, JWT_SECRET, type AuthRequest } from './middleware.js';

const router = Router();

router.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = createUser(email, hashed);
  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

router.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.post('/api/auth/invite', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const existing = findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = createUser(email, hashed);

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
  });
});

export default router;
