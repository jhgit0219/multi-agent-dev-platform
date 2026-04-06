import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  hasConfig: boolean;
  hasContext: boolean;
  iterations: number;
  config?: Record<string, unknown>;
}

function getScanDirs(): string[] {
  if (process.env.STUDIO_SCAN_DIRS) {
    return process.env.STUDIO_SCAN_DIRS.split(';').filter(Boolean);
  }
  if (process.env.STUDIO_ROOT) {
    return [join(process.env.STUDIO_ROOT, '..')];
  }
  return [process.cwd()];
}

export function discoverProjects(): ProjectInfo[] {
  const projects: ProjectInfo[] = [];
  const scanDirs = getScanDirs();

  for (const scanDir of scanDirs) {
    if (!existsSync(scanDir)) continue;

    const entries = readdirSync(scanDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const projectPath = join(scanDir, entry.name);
      const studioDir = join(projectPath, '.studio');
      const configPath = join(projectPath, 'studio.config.json');

      if (!existsSync(studioDir) && !existsSync(configPath)) continue;

      let config: Record<string, unknown> | undefined;
      if (existsSync(configPath)) {
        try {
          config = JSON.parse(readFileSync(configPath, 'utf-8'));
        } catch { /* ignore */ }
      }

      let iterations = 0;
      const iterDir = join(studioDir, 'iterations');
      if (existsSync(iterDir)) {
        iterations = readdirSync(iterDir, { withFileTypes: true })
          .filter((e) => e.isDirectory()).length;
      }

      const projectName = (config as { project?: { name?: string } })?.project?.name
        || basename(projectPath);

      projects.push({
        id: basename(projectPath),
        name: projectName,
        path: projectPath,
        hasConfig: existsSync(configPath),
        hasContext: existsSync(join(studioDir, 'context.md')),
        iterations,
        config,
      });
    }
  }

  return projects;
}

export function getProjectPath(projectId: string): string | null {
  const projects = discoverProjects();
  const project = projects.find((p) => p.id === projectId);
  return project?.path ?? null;
}
