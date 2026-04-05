import type {
  AIProvider,
  Message,
  ProviderConfig,
  ProviderResponse,
} from './types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  constructor(private config: ProviderConfig) {}

  formatMessages(messages: Message[]) {
    return messages.map((m) => ({ role: m.role, content: m.content }));
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

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: options?.max_tokens || 4096,
          temperature: options?.temperature,
          messages: this.formatMessages(messages),
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
        ? {
            input_tokens: data.usage.prompt_tokens,
            output_tokens: data.usage.completion_tokens,
          }
        : undefined,
    };
  }
}
