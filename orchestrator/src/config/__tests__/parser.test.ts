import { describe, it, expect } from 'vitest';
import { parseConfig } from '../parser';

describe('parseConfig', () => {
  it('returns defaults when given empty object', () => {
    const config = parseConfig({});
    expect(config.stack.frontend).toBe('react-typescript');
    expect(config.stack.backend).toBe('python-fastapi');
    expect(config.stack.database).toBe('postgresql');
  });

  it('overrides defaults with provided values', () => {
    const config = parseConfig({
      project: { name: 'test-app', mode: 'new', description: 'A test' },
      stack: { database: 'mongodb' },
    });
    expect(config.project.name).toBe('test-app');
    expect(config.stack.database).toBe('mongodb');
    expect(config.stack.frontend).toBe('react-typescript');
  });

  it('rejects invalid mode', () => {
    expect(() =>
      parseConfig({
        project: { mode: 'invalid' },
      }),
    ).toThrow();
  });

  it('validates deployment target', () => {
    const config = parseConfig({
      deployment: { target: 'render' },
    });
    expect(config.deployment.target).toBe('render');
  });

  it('rejects unknown deployment target', () => {
    expect(() =>
      parseConfig({
        deployment: { target: 'nonexistent' },
      }),
    ).toThrow();
  });

  it('allows team-level AI overrides', () => {
    const config = parseConfig({
      ai: {
        provider: 'claude',
        team_overrides: {
          security: {
            provider: 'openai',
            model: 'gpt-4o',
            api_key_env: 'OPENAI_KEY',
          },
        },
      },
    });
    expect(config.ai.team_overrides.security?.provider).toBe('openai');
  });
});
