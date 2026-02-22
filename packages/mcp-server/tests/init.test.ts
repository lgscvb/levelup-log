import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Mock os
vi.mock('os', async () => {
  const actual = await vi.importActual<typeof import('os')>('os');
  return {
    ...actual,
    homedir: vi.fn(() => '/mock/home'),
    platform: vi.fn(() => 'darwin'),
  };
});

const mockedExistsSync = vi.mocked(existsSync);
const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);
const mockedMkdirSync = vi.mocked(mkdirSync);

describe('detectTools', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockedExistsSync.mockReturnValue(false);
  });

  it('returns empty array when no tools are installed', async () => {
    const { detectTools } = await import('../src/init/detect.js');
    const tools = await detectTools();
    expect(tools).toEqual([]);
  });

  it('detects Claude Desktop when config exists', async () => {
    const claudeDesktopPath = join(
      '/mock/home',
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json'
    );
    mockedExistsSync.mockImplementation((p) => p === claudeDesktopPath);

    const { detectTools } = await import('../src/init/detect.js');
    const tools = await detectTools();

    expect(tools).toHaveLength(1);
    expect(tools[0]).toEqual({
      name: 'Claude Desktop',
      configPath: claudeDesktopPath,
      type: 'json-mcpServers',
    });
  });

  it('detects multiple tools simultaneously', async () => {
    const claudeDesktopPath = join(
      '/mock/home',
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json'
    );
    const claudeCodePath = join('/mock/home', '.claude', 'settings.json');
    const windsurfPath = join('/mock/home', '.codeium', 'windsurf', 'mcp_config.json');

    mockedExistsSync.mockImplementation(
      (p) => p === claudeDesktopPath || p === claudeCodePath || p === windsurfPath
    );

    const { detectTools } = await import('../src/init/detect.js');
    const tools = await detectTools();

    expect(tools).toHaveLength(3);
    const names = tools.map((t) => t.name);
    expect(names).toContain('Claude Desktop');
    expect(names).toContain('Claude Code');
    expect(names).toContain('Windsurf');
  });
});

describe('writeConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedMkdirSync.mockReturnValue(undefined);
  });

  const tool = {
    name: 'Claude Desktop',
    configPath: '/mock/home/config/claude_desktop_config.json',
    type: 'json-mcpServers' as const,
  };

  const mcpConfig = { command: 'npx', args: ['-y', '@levelup-log/mcp-server@latest', 'serve'] };

  it('writes config to an empty/nonexistent file', async () => {
    // readFileSync throws (file doesn't exist)
    mockedReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const { writeConfig } = await import('../src/init/write-config.js');
    const result = await writeConfig(tool, mcpConfig);

    expect(result.success).toBe(true);
    expect(mockedMkdirSync).toHaveBeenCalledWith('/mock/home/config', { recursive: true });
    expect(mockedWriteFileSync).toHaveBeenCalledOnce();

    // Verify written JSON
    const writtenContent = JSON.parse(
      (mockedWriteFileSync.mock.calls[0] as [string, string, string])[1]
    );
    expect(writtenContent.mcpServers['levelup-log']).toEqual(mcpConfig);
  });

  it('merges into existing config without overwriting other MCP servers', async () => {
    const existingConfig = {
      mcpServers: {
        'other-server': { command: 'node', args: ['other.js'] },
      },
    };
    mockedReadFileSync.mockReturnValue(JSON.stringify(existingConfig));

    const { writeConfig } = await import('../src/init/write-config.js');
    const result = await writeConfig(tool, mcpConfig);

    expect(result.success).toBe(true);
    expect(mockedWriteFileSync).toHaveBeenCalledOnce();

    const writtenContent = JSON.parse(
      (mockedWriteFileSync.mock.calls[0] as [string, string, string])[1]
    );
    expect(writtenContent.mcpServers['other-server']).toEqual({
      command: 'node',
      args: ['other.js'],
    });
    expect(writtenContent.mcpServers['levelup-log']).toEqual(mcpConfig);
  });

  it('does not overwrite when levelup-log already exists', async () => {
    const existingConfig = {
      mcpServers: {
        'levelup-log': { command: 'old-command', args: ['old'] },
      },
    };
    mockedReadFileSync.mockReturnValue(JSON.stringify(existingConfig));

    const { writeConfig } = await import('../src/init/write-config.js');
    const result = await writeConfig(tool, mcpConfig);

    expect(result.success).toBe(true);
    // Should NOT have written (already configured)
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it('creates config directory when it does not exist', async () => {
    mockedReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const deepTool = {
      name: 'Cursor',
      configPath: '/mock/home/deep/nested/dir/mcp.json',
      type: 'json-mcpServers' as const,
    };

    const { writeConfig } = await import('../src/init/write-config.js');
    const result = await writeConfig(deepTool, mcpConfig);

    expect(result.success).toBe(true);
    expect(mockedMkdirSync).toHaveBeenCalledWith('/mock/home/deep/nested/dir', {
      recursive: true,
    });
  });
});
