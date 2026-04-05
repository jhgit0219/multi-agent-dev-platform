export type Phase =
  | 'planning'
  | 'build'
  | 'validate'
  | 'ship'
  | 'report'
  | 'escalation'
  | 'complete';

export type Event =
  | 'proposal_approved'
  | 'code_committed'
  | 'validation_passed'
  | 'validation_failed'
  | 'deployed'
  | 'report_generated'
  | 'human_resolved';

export interface IterationState {
  iteration: number;
  phase: Phase;
  retryCount: number;
  history: Array<{ phase: Phase; event: Event; timestamp: string }>;
}
