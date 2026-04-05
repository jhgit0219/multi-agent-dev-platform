export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  content: string;
  usage?: { input_tokens: number; output_tokens: number };
}

export interface AIProvider {
  name: string;
  send(
    messages: Message[],
    options?: { temperature?: number; max_tokens?: number },
  ): Promise<ProviderResponse>;
}

export interface ProviderConfig {
  provider: string;
  model: string;
  api_key_env: string;
}
