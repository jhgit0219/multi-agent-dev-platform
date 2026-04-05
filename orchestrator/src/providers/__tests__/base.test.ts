import { describe, it, expect } from 'vitest';
import { createProvider } from '../base';

describe('createProvider', () => {
  it('throws for unknown provider', () => {
    expect(() =>
      createProvider({ provider: 'nonexistent', model: 'x', api_key_env: 'X' }),
    ).toThrow('Unknown provider: nonexistent');
  });

  it('creates a claude provider', () => {
    const provider = createProvider({
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      api_key_env: 'CLAUDE_API_KEY',
    });
    expect(provider.name).toBe('claude');
  });

  it('creates an openai provider', () => {
    const provider = createProvider({
      provider: 'openai',
      model: 'gpt-4o',
      api_key_env: 'OPENAI_API_KEY',
    });
    expect(provider.name).toBe('openai');
  });

  it('creates an ollama provider', () => {
    const provider = createProvider({
      provider: 'ollama',
      model: 'llama3',
      api_key_env: '',
    });
    expect(provider.name).toBe('ollama');
  });
});
