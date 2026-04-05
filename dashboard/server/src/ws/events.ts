export type WSEventType =
  | 'iteration:start'
  | 'iteration:complete'
  | 'phase:start'
  | 'phase:complete'
  | 'team:start'
  | 'team:complete'
  | 'test:results'
  | 'error';

export interface WSEvent {
  type: WSEventType;
  data: unknown;
  timestamp: string;
}
