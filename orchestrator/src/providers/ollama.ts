import type {
  AIProvider,
  Message,
  ProviderConfig,
  ProviderResponse,
} from './types';

export class OllamaProvider implements AIProvider {
  name = 'ollama';

  constructor(private config: ProviderConfig) {}

  async send(
    messages: Message[],
    options?: { temperature?: number; max_tokens?: number },
  ): Promise<ProviderResponse> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: options?.temperature,
          num_predict: options?.max_tokens,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return {
      content: data.message.content,
      usage: data.eval_count
        ? {
            input_tokens: data.prompt_eval_count || 0,
            output_tokens: data.eval_count,
          }
        : undefined,
    };
  }
}
