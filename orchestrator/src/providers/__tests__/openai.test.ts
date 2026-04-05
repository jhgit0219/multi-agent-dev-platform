import { describe, it, expect } from 'vitest';
import { OpenAIProvider } from '../openai';

describe('OpenAIProvider', () => {
  it('formats messages preserving all roles', () => {
    const provider = new OpenAIProvider({
      provider: 'openai',
      model: 'gpt-4o',
      api_key_env: 'OPENAI_API_KEY',
    });
    const formatted = provider.formatMessages([
      { role: 'system', content: 'You are a dev.' },
      { role: 'user', content: 'Write code.' },
    ]);
    expect(formatted).toEqual([
      { role: 'system', content: 'You are a dev.' },
      { role: 'user', content: 'Write code.' },
    ]);
  });

  it('throws if API key env var is not set', async () => {
    const provider = new OpenAIProvider({
      provider: 'openai',
      model: 'gpt-4o',
      api_key_env: 'NONEXISTENT_KEY',
    });
    await expect(
      provider.send([{ role: 'user', content: 'hi' }]),
    ).rejects.toThrow('not set');
  });
});
