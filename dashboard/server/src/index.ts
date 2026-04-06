import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { initDb, closeDb } from './auth/db.js';
import authRoutes from './auth/routes.js';
import reportRoutes from './reports/routes.js';
import statusRoutes from './status/routes.js';
import projectRoutes from './projects/routes.js';
import { createWSServer, broadcast } from './ws/server.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(reportRoutes);
app.use(statusRoutes);
app.use(projectRoutes);

const server = createServer(app);

export function startServer(port = 3001, dbPath?: string) {
  initDb(dbPath);
  createWSServer(server);
  server.listen(port, () => {
    console.log(`Dashboard server running on port ${port}`);
  });
  return { app, server, broadcast, close: () => { server.close(); closeDb(); } };
}

export { app, server, broadcast };

function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, '.studio')) || existsSync(resolve(dir, 'studio.config.json')) || existsSync(resolve(dir, 'CLAUDE.md'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return process.cwd();
}

// Start if run directly
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain) {
  if (!process.env.STUDIO_ROOT) {
    process.env.STUDIO_ROOT = findProjectRoot();
  }
  // Scan the parent directory of STUDIO_ROOT for sibling projects
  if (!process.env.STUDIO_SCAN_DIRS) {
    process.env.STUDIO_SCAN_DIRS = dirname(process.env.STUDIO_ROOT);
  }
  console.log(`Studio root: ${process.env.STUDIO_ROOT}`);
  console.log(`Scanning for projects in: ${process.env.STUDIO_SCAN_DIRS}`);
  startServer();
}
