import { describe, it, expect, afterEach } from 'vitest';
import { createServer } from 'node:http';
import express from 'express';
import { WebSocket } from 'ws';
import { createWSServer, broadcast } from '../ws/server.js';
import type { WSEvent } from '../ws/events.js';

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
}

function waitForMessage(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    ws.on('message', (data) => resolve(data.toString()));
    ws.on('error', reject);
  });
}

describe('WebSocket Server', () => {
  let server: ReturnType<typeof createServer>;
  let clients: WebSocket[] = [];

  function startServer(): Promise<number> {
    const app = express();
    server = createServer(app);
    createWSServer(server);
    return new Promise((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          resolve(addr.port);
        }
      });
    });
  }

  afterEach(async () => {
    for (const c of clients) {
      c.close();
    }
    clients = [];
    await new Promise<void>((resolve) => {
      if (server) server.close(() => resolve());
      else resolve();
    });
  });

  it('client connects and receives events', async () => {
    const port = await startServer();
    const ws = new WebSocket(`ws://localhost:${port}`);
    clients.push(ws);
    await waitForOpen(ws);

    const msgPromise = waitForMessage(ws);

    const event: WSEvent = {
      type: 'iteration:start',
      data: { iteration: 1 },
      timestamp: new Date().toISOString(),
    };
    broadcast(event);

    const received = await msgPromise;
    const parsed = JSON.parse(received);
    expect(parsed.type).toBe('iteration:start');
    expect(parsed.data).toEqual({ iteration: 1 });
  });

  it('broadcast sends to all connected clients', async () => {
    const port = await startServer();

    const ws1 = new WebSocket(`ws://localhost:${port}`);
    const ws2 = new WebSocket(`ws://localhost:${port}`);
    clients.push(ws1, ws2);

    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);

    const msg1 = waitForMessage(ws1);
    const msg2 = waitForMessage(ws2);

    const event: WSEvent = {
      type: 'phase:complete',
      data: { phase: 'build' },
      timestamp: new Date().toISOString(),
    };
    broadcast(event);

    const [r1, r2] = await Promise.all([msg1, msg2]);
    expect(JSON.parse(r1).type).toBe('phase:complete');
    expect(JSON.parse(r2).type).toBe('phase:complete');
  });
});
