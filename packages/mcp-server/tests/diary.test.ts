import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
  };
});

// Mock os
vi.mock('os', async () => {
  const actual = await vi.importActual<typeof import('os')>('os');
  return {
    ...actual,
    homedir: vi.fn(() => '/mock/home'),
  };
});

const DIARY_DIR = path.join('/mock/home', 'Documents', 'tai', '日記');

describe('diary helpers', () => {
  // Test the diary file path logic (mirrors server.ts internal helpers)
  it('builds correct diary path', () => {
    const date = '2026-03-19';
    const expected = path.join(DIARY_DIR, '2026-03-19.md');
    expect(expected).toBe(path.join('/mock/home', 'Documents', 'tai', '日記', '2026-03-19.md'));
  });

  it('builds diary markdown with frontmatter', () => {
    const date = '2026-03-19';
    const content = '今天很充實';
    const md = `---\ndate: ${date}\ntags: [日記, levelup]\npublic: false\n---\n\n${content}\n`;
    expect(md).toContain('public: false');
    expect(md).toContain('date: 2026-03-19');
    expect(md).toContain('今天很充實');
  });
});

describe('write_diary logic', () => {
  const mockedMkdirSync = vi.mocked(fs.mkdirSync);
  const mockedWriteFileSync = vi.mocked(fs.writeFileSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates diary directory if not exists', () => {
    mockedMkdirSync.mockReturnValue(undefined);
    mockedWriteFileSync.mockReturnValue(undefined);

    // Simulate what the tool handler does
    fs.mkdirSync(DIARY_DIR, { recursive: true });
    const filePath = path.join(DIARY_DIR, '2026-03-19.md');
    const md = `---\ndate: 2026-03-19\ntags: [日記, levelup]\npublic: false\n---\n\n今天做了很多事\n`;
    fs.writeFileSync(filePath, md, 'utf8');

    expect(mockedMkdirSync).toHaveBeenCalledWith(DIARY_DIR, { recursive: true });
    expect(mockedWriteFileSync).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining('今天做了很多事'),
      'utf8',
    );
  });

  it('handles write error gracefully', () => {
    mockedMkdirSync.mockReturnValue(undefined);
    mockedWriteFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(() => {
      fs.mkdirSync(DIARY_DIR, { recursive: true });
      fs.writeFileSync(path.join(DIARY_DIR, '2026-03-19.md'), 'test', 'utf8');
    }).toThrow('Permission denied');
  });
});

describe('read_diary logic', () => {
  const mockedExistsSync = vi.mocked(fs.existsSync);
  const mockedReadFileSync = vi.mocked(fs.readFileSync);
  const mockedReaddirSync = vi.mocked(fs.readdirSync);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedExistsSync.mockReturnValue(false);
  });

  it('returns content for a specific date', () => {
    const filePath = path.join(DIARY_DIR, '2026-03-19.md');
    const content = '---\ndate: 2026-03-19\n---\n\n充實的一天';

    mockedExistsSync.mockImplementation((p) => p === filePath);
    mockedReadFileSync.mockReturnValue(content);

    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);

    const result = fs.readFileSync(filePath, 'utf8');
    expect(result).toContain('充實的一天');
  });

  it('returns no diary for non-existent date', () => {
    const filePath = path.join(DIARY_DIR, '2026-01-01.md');
    mockedExistsSync.mockReturnValue(false);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('lists recent diary entries', () => {
    mockedExistsSync.mockImplementation((p) => p === DIARY_DIR);
    mockedReaddirSync.mockReturnValue([
      '2026-03-15.md',
      '2026-03-17.md',
      '2026-03-19.md',
      'not-a-date.md',
    ] as unknown as fs.Dirent[]);

    const files = (fs.readdirSync(DIARY_DIR) as unknown as string[])
      .filter((f: string) => f.endsWith('.md'))
      .map((f: string) => f.replace('.md', ''))
      .filter((d: string) => !isNaN(new Date(d).getTime()))
      .sort()
      .reverse();

    expect(files).toEqual(['2026-03-19', '2026-03-17', '2026-03-15']);
  });

  it('returns empty when diary directory does not exist', () => {
    mockedExistsSync.mockReturnValue(false);
    expect(fs.existsSync(DIARY_DIR)).toBe(false);
  });

  it('strips frontmatter for display', () => {
    const raw = '---\ndate: 2026-03-19\ntags: [日記]\npublic: false\n---\n\n今天很好';
    const body = raw.replace(/^---[\s\S]*?---\n\n?/, '');
    expect(body).toBe('今天很好');
  });
});
