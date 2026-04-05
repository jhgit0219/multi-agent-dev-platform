import { describe, it, expect } from 'vitest';
import { OllamaProvider } from '../ollama';

describe('OllamaProvider', () => {
  it('does not require an API key', () => {
    // Should construct without error even with empty api_key_env
    const provider = new OllamaProvider({
      provider: 'ollama',
      model: 'llama3',
      api_key_env: '',
    });
    expect(provider.name).toBe('ollama');
  });
});
