import { readFileSync } from 'node:fs';
import { StudioConfigSchema, type StudioConfig } from './schema';

export function parseConfig(raw: unknown): StudioConfig {
  return StudioConfigSchema.parse(raw);
}

export function loadConfigFromFile(path: string): StudioConfig {
  const content = readFileSync(path, 'utf-8');
  return parseConfig(JSON.parse(content));
}
