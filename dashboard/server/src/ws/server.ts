import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';
import type { WSEvent } from './events.js';

let wss: WebSocketServer | null = null;

export function createWSServer(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server });
  return wss;
}

export function broadcast(event: WSEvent): void {
  if (!wss) return;
  const message = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function getConnectedCount(): number {
  if (!wss) return 0;
  let count = 0;
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      count++;
    }
  }
  return count;
}

export function getWSS(): WebSocketServer | null {
  return wss;
}
