import type { AIProvider, ProviderConfig } from './types';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';
import { OllamaProvider } from './ollama';

const providers: Record<string, new (config: ProviderConfig) => AIProvider> = {
  claude: ClaudeProvider,
  openai: OpenAIProvider,
  ollama: OllamaProvider,
};

export function createProvider(config: ProviderConfig): AIProvider {
  const Provider = providers[config.provider];
  if (!Provider) throw new Error(`Unknown provider: ${config.provider}`);
  return new Provider(config);
}
