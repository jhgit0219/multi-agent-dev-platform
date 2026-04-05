import type { Phase, Event } from './types';

const MAX_RETRIES = 3;

const transitions: Record<Phase, Partial<Record<Event, Phase>>> = {
  planning: { proposal_approved: 'build' },
  build: { code_committed: 'validate' },
  validate: { validation_passed: 'ship', validation_failed: 'build' },
  ship: { deployed: 'report' },
  report: { report_generated: 'complete' },
  escalation: { human_resolved: 'build' },
  complete: {},
};

export class IterationStateMachine {
  currentPhase: Phase = 'planning';
  retryCount = 0;
  history: Array<{ phase: Phase; event: Event; timestamp: string }> = [];

  advance(event: Event): void {
    const nextPhase = transitions[this.currentPhase]?.[event];
    if (!nextPhase)
      throw new Error(
        `Invalid transition: ${this.currentPhase} + ${event}`,
      );

    this.history.push({
      phase: this.currentPhase,
      event,
      timestamp: new Date().toISOString(),
    });

    if (event === 'validation_failed') {
      this.retryCount++;
      if (this.retryCount > MAX_RETRIES) {
        this.currentPhase = 'escalation';
        return;
      }
    }

    if (event === 'validation_passed') {
      this.retryCount = 0;
    }

    this.currentPhase = nextPhase;
  }

  reset(): void {
    this.currentPhase = 'planning';
    this.retryCount = 0;
    this.history = [];
  }
}
