import { EventEmitter } from 'node:events';
import type { StudioConfig } from './config/schema';
import { createProvider } from './providers/base';
import type { AIProvider } from './providers/types';
import { IterationStateMachine } from './workflow/state';
import { HandoffManager } from './workflow/handoff';
import { TeamAgent } from './teams/base';
import type { TeamDefinition } from './teams/types';

export interface OrchestratorOptions {
  config: StudioConfig;
  projectRoot: string;
  standardsDir: string;
  teamDefinitions: Record<string, TeamDefinition>;
}

const PHASE_TEAM_MAP: Record<string, string> = {
  planning: 'feature',
  build: 'dev',
  validate: 'test',
  ship: 'devops',
  report: 'feature',
};

const PHASE_EVENT_MAP: Record<string, string> = {
  planning: 'proposal_approved',
  build: 'code_committed',
  validate: 'validation_passed',
  ship: 'deployed',
  report: 'report_generated',
};

export class Orchestrator extends EventEmitter {
  private stateMachine = new IterationStateMachine();
  private handoff: HandoffManager;
  private providers: Record<string, AIProvider> = {};
  private teams: Record<string, TeamAgent> = {};
  private iteration = 1;

  constructor(private options: OrchestratorOptions) {
    super();
    this.handoff = new HandoffManager(options.projectRoot);
    this.initProviders();
    this.initTeams();
  }

  private initProviders(): void {
    const { config } = this.options;
    const defaultProvider = createProvider({
      provider: config.ai.provider,
      model: config.ai.model,
      api_key_env: config.ai.api_key_env,
    });

    for (const [teamName, def] of Object.entries(this.options.teamDefinitions)) {
      const override = config.ai.team_overrides[teamName];
      if (override) {
        this.providers[teamName] = createProvider({
          provider: override.provider,
          model: override.model,
          api_key_env: override.api_key_env,
        });
      } else {
        this.providers[teamName] = defaultProvider;
      }
    }
  }

  private initTeams(): void {
    for (const [teamName, def] of Object.entries(this.options.teamDefinitions)) {
      this.teams[teamName] = new TeamAgent(
        def,
        this.providers[teamName],
        this.options.standardsDir,
      );
    }
  }

  get currentPhase() {
    return this.stateMachine.currentPhase;
  }

  async runIteration(prompt: string): Promise<void> {
    this.stateMachine.reset();
    this.emit('iteration:start', { iteration: this.iteration });

    while (
      this.stateMachine.currentPhase !== 'complete' &&
      this.stateMachine.currentPhase !== 'escalation'
    ) {
      const phase = this.stateMachine.currentPhase;
      const teamName = PHASE_TEAM_MAP[phase];

      if (!teamName || !this.teams[teamName]) {
        throw new Error(`No team mapped for phase: ${phase}`);
      }

      this.emit('phase:start', { phase, team: teamName });

      // Build context from previous handoffs
      const handoffs = this.handoff.list(this.iteration);
      const context = handoffs.length > 0
        ? `Original prompt: ${prompt}\n\nPrevious deliverables: ${handoffs.join(', ')}`
        : prompt;

      const report = await this.teams[teamName].run(context);

      this.handoff.write(
        this.iteration,
        teamName,
        `${phase}_report.json`,
        report,
      );

      this.emit('phase:complete', { phase, team: teamName, report });

      const event = PHASE_EVENT_MAP[phase];
      if (event) {
        this.stateMachine.advance(event as any);
      }
    }

    this.emit('iteration:complete', {
      iteration: this.iteration,
      finalPhase: this.stateMachine.currentPhase,
    });

    this.iteration++;
  }
}
