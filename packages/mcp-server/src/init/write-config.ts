import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { DetectedTool } from './detect.js';

interface WriteResult {
  success: boolean;
  error?: string;
}

export async function writeConfig(
  tool: DetectedTool,
  mcpConfig: { command: string; args: string[] }
): Promise<WriteResult> {
  try {
    // Ensure directory exists
    mkdirSync(dirname(tool.configPath), { recursive: true });

    // Read existing config or start fresh
    let config: Record<string, any> = {};
    try {
      const raw = readFileSync(tool.configPath, 'utf-8');
      config = JSON.parse(raw);
    } catch {
      // File doesn't exist or invalid JSON — start fresh
    }

    // Ensure mcpServers key exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Don't overwrite existing levelup-log config
    if (config.mcpServers['levelup-log']) {
      return { success: true }; // Already configured
    }

    // Add levelup-log
    config.mcpServers['levelup-log'] = mcpConfig;

    // Write back
    writeFileSync(tool.configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
