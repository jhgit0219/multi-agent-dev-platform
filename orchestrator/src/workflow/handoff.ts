import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export class HandoffManager {
  constructor(private projectRoot: string) {}

  private iterationDir(iteration: number): string {
    return join(this.projectRoot, '.studio', 'iterations', String(iteration));
  }

  write(iteration: number, team: string, filename: string, data: unknown): void {
    const dir = join(this.iterationDir(iteration), team);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), JSON.stringify(data, null, 2));
  }

  read<T = unknown>(iteration: number, team: string, filename: string): T {
    const filepath = join(this.iterationDir(iteration), team, filename);
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  }

  list(iteration: number): string[] {
    const dir = this.iterationDir(iteration);
    if (!existsSync(dir)) return [];
    const result: string[] = [];
    for (const team of readdirSync(dir)) {
      const teamDir = join(dir, team);
      if (statSync(teamDir).isDirectory()) {
        for (const file of readdirSync(teamDir)) {
          result.push(`${team}/${file}`);
        }
      }
    }
    return result;
  }
}
