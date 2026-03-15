import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { DetectedRulesTarget } from './detect.js';

// ─── Rules Content ────────────────────────────────────────────────────────────
// Injected into each platform's global rules file.
// Keep short — this is appended to existing content.

const RULES_SECTION = `
## LevelUp.log Achievement Tracking

After completing any meaningful task, proactively call the \`record_achievement\` MCP tool.
**Do not wait to be asked.**

Trigger on: code written/fixed, deployment, tests, docs, ops, learning, life/health/finance tasks.
Skip: casual Q&A, simple lookups, short explanations with no tangible output.

When \`time_minutes\` is unclear, ask: "大概花了多久？"
Set \`self_reported=true\` when user narrates a past event ("I exercised this morning").
`;

const SECTION_MARKER = '## LevelUp.log Achievement Tracking';

// ─── Writer ───────────────────────────────────────────────────────────────────

export interface RulesWriteResult {
  name: string;
  success: boolean;
  action: 'written' | 'already-present' | 'created';
  error?: string;
}

export function writeRulesFile(target: DetectedRulesTarget): RulesWriteResult {
  const { name, globalRulesPath, writeMode } = target;

  try {
    // Ensure parent directory exists
    const dir = dirname(globalRulesPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Check if already written
    if (existsSync(globalRulesPath)) {
      const existing = readFileSync(globalRulesPath, 'utf-8');
      if (existing.includes(SECTION_MARKER)) {
        return { name, success: true, action: 'already-present' };
      }

      if (writeMode === 'overwrite-if-absent') {
        // File exists but no section — skip (don't want to stomp unrelated content)
        return { name, success: true, action: 'already-present' };
      }

      // append-section: add to end
      writeFileSync(globalRulesPath, existing.trimEnd() + '\n' + RULES_SECTION, 'utf-8');
      return { name, success: true, action: 'written' };
    }

    // File doesn't exist — create it
    writeFileSync(globalRulesPath, RULES_SECTION.trimStart(), 'utf-8');
    return { name, success: true, action: 'created' };

  } catch (err) {
    return { name, success: false, action: 'written', error: String(err) };
  }
}

export function writeAllRulesFiles(targets: DetectedRulesTarget[]): RulesWriteResult[] {
  return targets.map(writeRulesFile);
}
