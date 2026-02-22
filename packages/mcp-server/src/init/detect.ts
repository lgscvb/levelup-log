import { existsSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';

export interface DetectedTool {
  name: string;
  configPath: string;
  type: 'json-mcpServers';  // All use the same format
}

export async function detectTools(): Promise<DetectedTool[]> {
  const home = homedir();
  const os = platform();
  const tools: DetectedTool[] = [];

  // Claude Desktop
  const claudeDesktopConfig = os === 'darwin'
    ? join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
    : os === 'win32'
    ? join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
    : join(home, '.config', 'claude', 'claude_desktop_config.json');

  if (existsSync(claudeDesktopConfig)) {
    tools.push({ name: 'Claude Desktop', configPath: claudeDesktopConfig, type: 'json-mcpServers' });
  }

  // Claude Code (global settings)
  const claudeCodeConfig = join(home, '.claude', 'settings.json');
  // Claude Code uses ~/.claude.json or ~/.claude/settings.json
  const claudeCodeAlt = join(home, '.claude.json');
  if (existsSync(claudeCodeConfig)) {
    tools.push({ name: 'Claude Code', configPath: claudeCodeConfig, type: 'json-mcpServers' });
  } else if (existsSync(claudeCodeAlt)) {
    tools.push({ name: 'Claude Code', configPath: claudeCodeAlt, type: 'json-mcpServers' });
  }

  // Cursor
  const cursorConfig = os === 'darwin'
    ? join(home, 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json')
    : os === 'win32'
    ? join(home, 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json')
    : join(home, '.config', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json');

  // Also check simpler Cursor config path
  const cursorSimple = join(home, '.cursor', 'mcp.json');
  if (existsSync(cursorConfig)) {
    tools.push({ name: 'Cursor', configPath: cursorConfig, type: 'json-mcpServers' });
  } else if (existsSync(cursorSimple)) {
    tools.push({ name: 'Cursor', configPath: cursorSimple, type: 'json-mcpServers' });
  }

  // Windsurf / Codeium
  const windsurfConfig = join(home, '.codeium', 'windsurf', 'mcp_config.json');
  if (existsSync(windsurfConfig)) {
    tools.push({ name: 'Windsurf', configPath: windsurfConfig, type: 'json-mcpServers' });
  }

  return tools;
}
