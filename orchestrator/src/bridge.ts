import type { Orchestrator } from './orchestrator';

export type BroadcastFn = (event: { type: string; data: unknown; timestamp: string }) => void;

export function bridgeToDashboard(orchestrator: Orchestrator, broadcast: BroadcastFn): void {
  orchestrator.on('iteration:start', (data) => {
    broadcast({ type: 'iteration:start', data, timestamp: new Date().toISOString() });
  });

  orchestrator.on('iteration:complete', (data) => {
    broadcast({ type: 'iteration:complete', data, timestamp: new Date().toISOString() });
  });

  orchestrator.on('phase:start', (data) => {
    broadcast({ type: 'phase:start', data, timestamp: new Date().toISOString() });
  });

  orchestrator.on('phase:complete', (data) => {
    broadcast({ type: 'phase:complete', data, timestamp: new Date().toISOString() });
  });
}
