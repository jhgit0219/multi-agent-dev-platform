import { describe, it, expect } from 'vitest';
import { IterationStateMachine } from '../state';

describe('IterationStateMachine', () => {
  it('starts in planning phase', () => {
    const sm = new IterationStateMachine();
    expect(sm.currentPhase).toBe('planning');
  });

  it('transitions planning -> build', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    expect(sm.currentPhase).toBe('build');
  });

  it('transitions build -> validate', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    expect(sm.currentPhase).toBe('validate');
  });

  it('loops validate -> build on failure', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    sm.advance('validation_failed');
    expect(sm.currentPhase).toBe('build');
    expect(sm.retryCount).toBe(1);
  });

  it('escalates after 3 retries', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    for (let i = 0; i < 3; i++) {
      sm.advance('code_committed');
      sm.advance('validation_failed');
    }
    sm.advance('code_committed');
    sm.advance('validation_failed');
    expect(sm.currentPhase).toBe('escalation');
  });

  it('transitions validate -> ship on success', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    sm.advance('validation_passed');
    expect(sm.currentPhase).toBe('ship');
  });

  it('transitions ship -> report', () => {
    const sm = new IterationStateMachine();
    sm.advance('proposal_approved');
    sm.advance('code_committed');
    sm.advance('validation_passed');
    sm.advance('deployed');
    expect(sm.currentPhase).toBe('report');
  });
});
