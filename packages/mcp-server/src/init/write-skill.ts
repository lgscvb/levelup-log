import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ─── Skill Content ────────────────────────────────────────────────────────────
// Agent Skills open standard: directory + SKILL.md with YAML frontmatter.
// Compatible with Claude Code, Cursor, Gemini CLI, Codex CLI, Antigravity.
//
// Installed to ~/.claude/skills/levelup/SKILL.md
// Invoked with: /levelup

const SKILL_CONTENT = `---
name: LevelUp Achievement Coach
description: Show your LevelUp.log stats dashboard (level, XP, streak, recent achievements, title progress) and activate full achievement coaching mode. Also proactively records achievements after any meaningful task during this session. Use at the start of a session or anytime you want a progress check.
---

## When activated, you should:

1. **Call \`get_my_stats\`** — show level, XP, streak, active title
2. **Call \`get_recent\`** — show last 7 days of achievements
3. **Call \`check_unlocks\`** — show progress toward next titles
4. Present this as a game dashboard, not a dry report

Example output format:
\`\`\`
⚔️ Lv.29 · Expert
⚡ Total XP: 12,350  |  Year XP: 4,520
🔥 Streak: 15 days  |  🏆 8 titles unlocked

Recent achievements (7 days):
  🪲 Bug Slayer  +82 XP  (fix)
  🚀 Ship It     +130 XP (deploy)
  📝 Doc Wizard  +45 XP  (docs)

Next title: Iron Body (health × 150) — you're at 87/150 💪
\`\`\`

## Achievement tracking (always on)

Throughout this session, **proactively call \`record_achievement\`** after any meaningful task.
Don't wait to be asked. Don't ask for permission.

| Trigger | Category | Example |
|---------|----------|---------|
| Code written / feature added | code | "Built auth module" |
| Bug fixed | fix | "Fixed race condition" |
| Deployed / published | deploy | "Shipped v2.1.0 to prod" |
| Tests written | test | "Added 23 unit tests" |
| Docs / README written | docs | "Updated API docs" |
| Refactored code | refactor | "Extracted shared utilities" |
| DevOps / CI done | ops | "Set up GitHub Actions" |
| Learned something | learn | "Studied Supabase RLS" |
| Life task done | life | "Took kids to school" |
| Health activity | health | "30min run" |
| Finance task | finance | "Filed quarterly taxes" |

## Parameter guide

\`\`\`
complexity:
  trivial    → quick fix, single-line change
  normal     → typical task, 30-60 min
  significant → multi-step, 1-3 hours
  major      → large feature, half day+
  milestone  → exceptional, major release

time_minutes: ask "大概花了多久？" if unclear
output_units: files changed / tests added / docs pages / tasks done
input_units:  files read / docs consulted / searches done
conversation_rounds: count of back-and-forth in this session
self_reported: true if user narrates past event ("I went for a run today")
\`\`\`

## Coaching behavior

- Use game language: "Quest complete!", "You defeated a bug!", "New skill unlocked!"
- When streak is active: mention it, encourage keeping it going
- When user is frustrated/tired: acknowledge WHAT they did, not just "you're doing great"
  → "You shipped X, fixed Y, and learned Z today — those all count."
- Identity reinforcement: "You're becoming someone who ships every day."
- On birthday (if known): celebrate level-up with last year's stats
`;

// ─── Installer ────────────────────────────────────────────────────────────────

export interface SkillInstallResult {
  success: boolean;
  action: 'installed' | 'already-installed' | 'updated';
  path: string;
  error?: string;
}

export function installSkill(): SkillInstallResult {
  // New format: directory-based skill (~/.claude/skills/levelup/SKILL.md)
  const skillDir = join(homedir(), '.claude', 'skills', 'levelup');
  const skillPath = join(skillDir, 'SKILL.md');

  // Migrate old flat file if it exists
  const legacyPath = join(homedir(), '.claude', 'skills', 'levelup.md');

  try {
    mkdirSync(skillDir, { recursive: true });

    // Remove legacy flat file if present
    if (existsSync(legacyPath)) {
      import('fs').then(({ unlinkSync }) => {
        try { unlinkSync(legacyPath); } catch { /* ignore */ }
      });
    }

    if (existsSync(skillPath)) {
      const existing = readFileSync(skillPath, 'utf-8');
      if (existing === SKILL_CONTENT) {
        return { success: true, action: 'already-installed', path: skillPath };
      }
      writeFileSync(skillPath, SKILL_CONTENT, 'utf-8');
      return { success: true, action: 'updated', path: skillPath };
    }

    writeFileSync(skillPath, SKILL_CONTENT, 'utf-8');
    return { success: true, action: 'installed', path: skillPath };

  } catch (err) {
    return { success: false, action: 'installed', path: skillPath, error: String(err) };
  }
}
