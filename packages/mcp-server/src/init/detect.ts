import { existsSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';

export interface DetectedTool {
  name: string;
  configPath: string;
  type: 'json-mcpServers';
}

export interface DetectedRulesTarget {
  name: string;
  /** Global rules file path — write once, applies to all projects */
  globalRulesPath: string;
  /** How to write: 'append-section' adds a ## section, 'overwrite-if-absent' only creates if missing */
  writeMode: 'append-section' | 'overwrite-if-absent';
}

export async function detectTools(): Promise<DetectedTool[]> {
  const home = homedir();
  const os = platform();
  const tools: DetectedTool[] = [];

  // ── Claude Desktop ────────────────────────────────────────────────────────
  const claudeDesktopConfig = os === 'darwin'
    ? join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
    : os === 'win32'
    ? join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
    : join(home, '.config', 'claude', 'claude_desktop_config.json');

  if (existsSync(claudeDesktopConfig)) {
    tools.push({ name: 'Claude Desktop', configPath: claudeDesktopConfig, type: 'json-mcpServers' });
  }

  // ── Claude Code ───────────────────────────────────────────────────────────
  const claudeCodeConfig = join(home, '.claude', 'settings.json');
  const claudeCodeAlt = join(home, '.claude.json');
  if (existsSync(claudeCodeConfig)) {
    tools.push({ name: 'Claude Code', configPath: claudeCodeConfig, type: 'json-mcpServers' });
  } else if (existsSync(claudeCodeAlt)) {
    tools.push({ name: 'Claude Code', configPath: claudeCodeAlt, type: 'json-mcpServers' });
  }

  // ── Cursor ────────────────────────────────────────────────────────────────
  const cursorConfig = os === 'darwin'
    ? join(home, 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json')
    : os === 'win32'
    ? join(home, 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json')
    : join(home, '.config', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json');
  const cursorSimple = join(home, '.cursor', 'mcp.json');

  if (existsSync(cursorConfig)) {
    tools.push({ name: 'Cursor', configPath: cursorConfig, type: 'json-mcpServers' });
  } else if (existsSync(cursorSimple)) {
    tools.push({ name: 'Cursor', configPath: cursorSimple, type: 'json-mcpServers' });
  }

  // ── Windsurf / Codeium ────────────────────────────────────────────────────
  const windsurfConfig = join(home, '.codeium', 'windsurf', 'mcp_config.json');
  if (existsSync(windsurfConfig)) {
    tools.push({ name: 'Windsurf', configPath: windsurfConfig, type: 'json-mcpServers' });
  }

  // ── Antigravity ───────────────────────────────────────────────────────────
  const antigravityConfig = join(home, '.antigravity', 'mcp.json');
  const antigravityAlt = os === 'darwin'
    ? join(home, 'Library', 'Application Support', 'Antigravity', 'mcp.json')
    : join(home, '.config', 'antigravity', 'mcp.json');

  if (existsSync(antigravityConfig)) {
    tools.push({ name: 'Antigravity', configPath: antigravityConfig, type: 'json-mcpServers' });
  } else if (existsSync(antigravityAlt)) {
    tools.push({ name: 'Antigravity', configPath: antigravityAlt, type: 'json-mcpServers' });
  }

  // ── Continue (VS Code extension) ──────────────────────────────────────────
  const continueConfig = join(home, '.continue', 'config.json');
  if (existsSync(continueConfig)) {
    // Continue uses a different config format — detected but handled separately in writeConfig
    tools.push({ name: 'Continue', configPath: continueConfig, type: 'json-mcpServers' });
  }

  return tools;
}

export async function detectRulesTargets(): Promise<DetectedRulesTarget[]> {
  const home = homedir();
  const targets: DetectedRulesTarget[] = [];

  // ── Cursor: global rules (~/.cursor/rules) ────────────────────────────────
  // Applies to ALL Cursor projects automatically
  if (existsSync(join(home, '.cursor')) || existsSync(join(home, '.cursor', 'mcp.json'))) {
    targets.push({
      name: 'Cursor',
      globalRulesPath: join(home, '.cursor', 'rules'),
      writeMode: 'append-section',
    });
  }

  // ── Windsurf: global rules ────────────────────────────────────────────────
  const windsurfDir = join(home, '.codeium', 'windsurf');
  if (existsSync(windsurfDir)) {
    targets.push({
      name: 'Windsurf',
      globalRulesPath: join(windsurfDir, 'rules.md'),
      writeMode: 'append-section',
    });
  }

  // ── Claude Code: global CLAUDE.md ─────────────────────────────────────────
  const claudeDir = join(home, '.claude');
  if (existsSync(claudeDir)) {
    targets.push({
      name: 'Claude Code',
      globalRulesPath: join(claudeDir, 'CLAUDE.md'),
      writeMode: 'append-section',
    });
  }

  // ── GitHub Copilot (VS Code): global instructions ─────────────────────────
  // VS Code stores Copilot instructions in a user-level file
  const vscodeCopilot = join(home, '.vscode', 'copilot-instructions.md');
  if (existsSync(join(home, '.vscode'))) {
    targets.push({
      name: 'GitHub Copilot',
      globalRulesPath: vscodeCopilot,
      writeMode: 'append-section',
    });
  }

  // ── Antigravity ───────────────────────────────────────────────────────────
  const antigravityDir = join(home, '.antigravity');
  if (existsSync(antigravityDir)) {
    targets.push({
      name: 'Antigravity',
      globalRulesPath: join(antigravityDir, 'rules.md'),
      writeMode: 'append-section',
    });
  }

  return targets;
}
