import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HandoffManager } from '../handoff';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('HandoffManager', () => {
  let testDir: string;
  let manager: HandoffManager;

  beforeEach(() => {
    testDir = join(tmpdir(), `handoff-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    manager = new HandoffManager(testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it('creates iteration directory and writes a report', () => {
    manager.write(1, 'feature', 'proposal.json', { title: 'Test' });
    const data = manager.read(1, 'feature', 'proposal.json');
    expect(data).toEqual({ title: 'Test' });
  });

  it('reads back written data with correct types', () => {
    const report = { status: 'success', items: [1, 2, 3] };
    manager.write(1, 'dev', 'report.json', report);
    const result = manager.read<typeof report>(1, 'dev', 'report.json');
    expect(result.status).toBe('success');
    expect(result.items).toEqual([1, 2, 3]);
  });

  it('lists all reports for an iteration', () => {
    manager.write(1, 'feature', 'proposal.json', {});
    manager.write(1, 'dev', 'code_report.json', {});
    manager.write(1, 'test', 'test_report.json', {});
    const files = manager.list(1);
    expect(files).toContain('feature/proposal.json');
    expect(files).toContain('dev/code_report.json');
    expect(files).toContain('test/test_report.json');
  });

  it('returns empty array for nonexistent iteration', () => {
    expect(manager.list(999)).toEqual([]);
  });
});
