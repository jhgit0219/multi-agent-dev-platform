import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { initDb, closeDb } from './auth/db.js';
import authRoutes from './auth/routes.js';
import reportRoutes from './reports/routes.js';
import statusRoutes from './status/routes.js';
import { createWSServer, broadcast } from './ws/server.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(reportRoutes);
app.use(statusRoutes);

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

// Start if run directly
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain) {
  startServer();
}
