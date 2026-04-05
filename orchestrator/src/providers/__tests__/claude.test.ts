import { describe, it, expect } from 'vitest';
import { ClaudeProvider } from '../claude';

describe('ClaudeProvider', () => {
  it('formats messages for Anthropic API', () => {
    const provider = new ClaudeProvider({
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      api_key_env: 'CLAUDE_API_KEY',
    });
    const formatted = provider.formatMessages([
      { role: 'system', content: 'You are a dev.' },
      { role: 'user', content: 'Write code.' },
    ]);
    expect(formatted.system).toBe('You are a dev.');
    expect(formatted.messages).toEqual([
      { role: 'user', content: 'Write code.' },
    ]);
  });

  it('throws if API key env var is not set', async () => {
    const provider = new ClaudeProvider({
      provider: 'claude',
      model: 'claude-sonnet-4-6',
      api_key_env: 'NONEXISTENT_KEY',
    });
    await expect(
      provider.send([{ role: 'user', content: 'hi' }]),
    ).rejects.toThrow('not set');
  });
});
