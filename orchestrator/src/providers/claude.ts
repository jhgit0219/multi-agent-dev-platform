import type {
  AIProvider,
  Message,
  ProviderConfig,
  ProviderResponse,
} from './types';

export class ClaudeProvider implements AIProvider {
  name = 'claude';

  constructor(private config: ProviderConfig) {}

  formatMessages(messages: Message[]) {
    const system = messages.find((m) => m.role === 'system')?.content || '';
    const rest = messages.filter((m) => m.role !== 'system');
    return { system, messages: rest };
  }

  async send(
    messages: Message[],
    options?: { temperature?: number; max_tokens?: number },
  ): Promise<ProviderResponse> {
    const apiKey = process.env[this.config.api_key_env];
    if (!apiKey)
      throw new Error(
        `API key env var ${this.config.api_key_env} not set`,
      );

    const { system, messages: formatted } = this.formatMessages(messages);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature,
        system,
        messages: formatted,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Claude API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage
        ? {
            input_tokens: data.usage.input_tokens,
            output_tokens: data.usage.output_tokens,
          }
        : undefined,
    };
  }
}
