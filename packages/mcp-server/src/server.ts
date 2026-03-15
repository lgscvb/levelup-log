import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ACHIEVEMENT_CATEGORIES,
  CATEGORY_DEFINITIONS,
} from "./utils/config.js";
import { checkRateLimit, recordRateEntry } from "./utils/rate-limiter.js";
import { apiGet, apiPost } from "./utils/api.js";
import { log } from "./utils/logger.js";

// ─── XP Formula ──────────────────────────────────────────────────────────────
//
// Deterministic XP calculation so all agents produce consistent scores.
// Category definitions (CATEGORY_DEFINITIONS) are the source of truth:
//   each category defines its output_unit semantics and xp_weight.
//
// Formula:
//   base     = COMPLEXITY_BASE[complexity] × time_multiplier(time_minutes)
//   bonuses  = output_bonus(output_units)       [log-diminishing, cap 60]
//            + input_bonus(input_units)          [linear, cap 15]
//            + rounds_bonus(conversation_rounds) [linear, cap 25]
//   raw_xp   = clamp(round((base + bonuses) × category.xp_weight), 5, 500)
//   xp       = self_reported ? round(raw_xp × 0.85) : raw_xp
//
// xp_weight examples: deploy=1.3 (high-stakes), hobby=0.8 (leisure)
// self_reported 15% discount: user narrates past event, AI cannot verify.
// ─────────────────────────────────────────────────────────────────────────────

type Complexity = "trivial" | "normal" | "significant" | "major" | "milestone";

const COMPLEXITY_BASE: Record<Complexity, number> = {
  trivial: 10,
  normal: 30,
  significant: 75,
  major: 150,
  milestone: 300,
};

function timeMultiplier(minutes: number): number {
  if (minutes < 15) return 0.7;
  if (minutes < 60) return 1.0;
  if (minutes < 180) return 1.3;
  return 1.6;
}

// Log-diminishing returns: 1→12, 3→19, 5→24, 10→29, 20→34, cap 60
function outputBonus(units: number): number {
  if (units <= 0) return 0;
  return Math.min(Math.round(Math.log2(units + 1) * 12), 60);
}

// Lighter signal: each input unit = 1 XP, cap 15
function inputBonus(units: number): number {
  return Math.min(Math.max(units, 0), 15);
}

// Each round = 1 XP, cap 25
function roundsBonus(rounds: number): number {
  return Math.min(Math.max(rounds, 0), 25);
}

export function calculateXp(params: {
  category: keyof typeof CATEGORY_DEFINITIONS;
  complexity: Complexity;
  time_minutes?: number;
  output_units?: number;
  input_units?: number;
  conversation_rounds?: number;
  self_reported?: boolean;
}): number {
  const catWeight = CATEGORY_DEFINITIONS[params.category]?.xp_weight ?? 1.0;

  const base =
    COMPLEXITY_BASE[params.complexity] *
    timeMultiplier(params.time_minutes ?? 30);

  const bonuses =
    outputBonus(params.output_units ?? 0) +
    inputBonus(params.input_units ?? 0) +
    roundsBonus(params.conversation_rounds ?? 0);

  const raw = Math.min(
    500,
    Math.max(5, Math.round((base + bonuses) * catWeight)),
  );
  return params.self_reported ? Math.max(5, Math.round(raw * 0.85)) : raw;
}

// Generate output_units guidance from CATEGORY_DEFINITIONS for tool description
function buildOutputUnitGuide(): string {
  return Object.entries(CATEGORY_DEFINITIONS)
    .map(([key, def]) => `    ${key.padEnd(12)} → ${def.output_unit}`)
    .join("\n");
}

// MCP server-level instructions — injected into system prompt by compliant clients
// (Claude Desktop, Cursor, Windsurf, Antigravity, etc.) on every session.
// Install once → works everywhere, no per-project setup needed.
const SERVER_INSTRUCTIONS = `LevelUp.log Achievement Tracker is active.

PROACTIVELY call record_achievement after any meaningful task — don't wait to be asked.

Call when:
• Code written, feature added, bug fixed, refactored
• Tests written, docs updated, deployment done, ops task completed
• Learning session, research, life/health/finance task done

Don't call for: casual Q&A, simple lookups, short explanations with no output.

When time_minutes is unclear, ask: "大概花了多久？"
self_reported=true when user narrates past events ("I exercised this morning").`;

export function createServer() {
  const server = new McpServer(
    { name: "levelup-log", version: "0.1.0" },
    { instructions: SERVER_INSTRUCTIONS },
  );

  // ─── Tool 1: record_achievement ───────────────────────────────
  server.registerTool(
    "record_achievement",
    {
      title: "Record Achievement",
      description: `Proactively call this when the user completes meaningful work — coding, bug fixes, features, life tasks, learning, health, creative work, or any productive activity.

WHEN TO CALL: Real effort + tangible output. Don't wait to be asked.
DO NOT CALL: simple Q&A, casual chat, trivial lookups with no output.

SET self_reported=true when user narrates a past event (e.g. "I went for a run today") vs. completing work during this conversation. Applies 15% XP discount — still worth recording.

FILL AS MANY PARAMS AS YOU CAN OBSERVE:
  complexity          — cognitive difficulty (required)
  time_minutes        — how long; ASK the user if unsure: "大概花了你多久？"
  output_units        — tangible outputs (meaning varies by category):
${buildOutputUnitGuide()}
  input_units         — resources consumed (files read, docs consulted, searches)
  conversation_rounds — message exchanges in this session

XP formula (server computes from category.xp_weight × complexity × time + bonuses):
  Each category has its own xp_weight (deploy=1.3, milestone=1.5, hobby=0.8, etc.)
  output_bonus: log-diminishing cap 60 | input_bonus: cap 15 | rounds_bonus: cap 25
  Final: clamp((base+bonuses)×xp_weight×(self_reported?0.85:1), 5, 500)

Keep descriptions abstract — no real names, client names, or source code.`,
      inputSchema: {
        category: z.enum(ACHIEVEMENT_CATEGORIES),
        title: z
          .string()
          .describe(
            'Game-style achievement title (e.g. "Bug Slayer", "Morning Warrior")',
          ),
        description: z
          .string()
          .describe("What was accomplished, in abstract terms (no PII)"),
        complexity: z
          .enum(["trivial", "normal", "significant", "major", "milestone"])
          .describe(
            "Cognitive difficulty: trivial=quick lookup/fix, normal=typical task, significant=multi-step work, major=large feature/project, milestone=exceptional achievement",
          ),
        time_minutes: z
          .number()
          .min(1)
          .optional()
          .describe(
            "Estimated minutes spent on this task. Ask the user if unsure.",
          ),
        output_units: z
          .number()
          .min(0)
          .optional()
          .describe(
            "Count of tangible outputs: files changed, tasks completed, items created, pages written, etc.",
          ),
        input_units: z
          .number()
          .min(0)
          .optional()
          .describe(
            "Count of resources consumed: files read, docs consulted, searches done, etc.",
          ),
        conversation_rounds: z
          .number()
          .min(0)
          .optional()
          .describe(
            "Number of message exchanges (user + assistant turns) in this conversation session.",
          ),
        self_reported: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "True when the user is narrating a past event without AI collaboration (e.g. 'I exercised this morning'). Applies 15% XP discount since AI cannot verify, but the achievement still counts.",
          ),
        tags: z
          .array(z.string())
          .optional()
          .describe("Optional tags for filtering"),
        is_public: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether this appears on public feed"),
      },
    },
    async ({
      category,
      title,
      description,
      complexity,
      time_minutes,
      output_units,
      input_units,
      conversation_rounds,
      self_reported,
      tags,
      is_public,
    }) => {
      // Local rate limit check (pre-flight, before hitting server)
      const rateCheck = checkRateLimit(category);
      if (!rateCheck.allowed) {
        return {
          content: [
            { type: "text", text: `Rate limited: ${rateCheck.reason}` },
          ],
          isError: true,
        };
      }

      // XP is calculated server-side — send raw params only
      const result = await apiPost("record-achievement", {
        category,
        title,
        description,
        complexity,
        time_minutes,
        output_units,
        input_units,
        conversation_rounds,
        self_reported,
        tags,
        is_public,
        source_platform: "claude-code",
      });

      if (result.error) {
        return {
          content: [
            { type: "text", text: `Failed to record: ${result.error}` },
          ],
          isError: true,
        };
      }

      recordRateEntry(category);

      const data = result.data as Record<string, unknown>;
      const serverXp =
        (data.xp as number | undefined) ??
        calculateXp({
          category,
          complexity,
          time_minutes,
          output_units,
          input_units,
          conversation_rounds,
          self_reported,
        });
      const stats = data.stats as Record<string, unknown> | undefined;
      const newTitles = data.newly_unlocked as
        | Array<{ name: string; rarity: string; icon?: string }>
        | undefined;

      log("record_achievement", { category, title, xp: serverXp });

      const lines = [
        `Achievement recorded! +${serverXp} XP`,
        stats ? `Total XP: ${stats.total_xp} | Year XP: ${stats.year_xp}` : "",
        stats?.age_level ? `Level: Lv.${stats.age_level}` : "",
        stats?.current_streak ? `Streak: ${stats.current_streak} days` : "",
        ...(newTitles?.length
          ? [
              `\n🎉 Title${newTitles.length > 1 ? "s" : ""} unlocked!`,
              ...newTitles.map(
                (t) => `  ${t.icon ?? "🏅"} ${t.name} [${t.rarity}]`,
              ),
            ]
          : []),
      ].filter(Boolean);

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    },
  );

  // ─── Tool 2: get_my_stats ─────────────────────────────────────
  server.registerTool(
    "get_my_stats",
    {
      title: "My Stats",
      description:
        "Get the user's achievement statistics including level (age), XP, streak, and title.",
      inputSchema: {},
    },
    async () => {
      const result = await apiGet("get-stats");
      if (result.error) {
        return {
          content: [{ type: "text", text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    },
  );

  // ─── Tool 3: get_recent ───────────────────────────────────────
  server.registerTool(
    "get_recent",
    {
      title: "Recent Achievements",
      description:
        "Get recent achievements. Supports filtering by category and time range.",
      inputSchema: {
        limit: z.number().min(1).max(50).optional().default(10),
        days: z.number().min(1).max(365).optional().default(7),
        category: z.enum(ACHIEVEMENT_CATEGORIES).optional(),
      },
    },
    async ({ limit, days, category }) => {
      const params: Record<string, string> = {
        limit: String(limit),
        days: String(days),
      };
      if (category) params.category = category;

      const result = await apiGet("get-recent", params);
      if (result.error) {
        return {
          content: [{ type: "text", text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    },
  );

  // ─── Tool 4: check_unlocks ────────────────────────────────────
  server.registerTool(
    "check_unlocks",
    {
      title: "Check Title Unlocks",
      description:
        "Check if the user has unlocked any new titles, and show progress toward the next ones.",
      inputSchema: {},
    },
    async () => {
      const result = await apiGet("check-unlocks");
      if (result.error) {
        return {
          content: [{ type: "text", text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    },
  );

  // ─── Tool 5: leaderboard ──────────────────────────────────────
  server.registerTool(
    "leaderboard",
    {
      title: "Leaderboard",
      description:
        "View the leaderboard. Shows top users by XP for the current season, month, or all time. Always includes the current user's rank.",
      inputSchema: {
        type: z
          .enum(["season", "month", "all_time"])
          .optional()
          .default("season"),
        limit: z.number().min(1).max(50).optional().default(10),
      },
    },
    async ({ type, limit }) => {
      const result = await apiGet("leaderboard", {
        type: type,
        limit: String(limit),
      });

      if (result.error) {
        return {
          content: [{ type: "text", text: `Error: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    },
  );

  // ─── Prompt: motivational_coach ───────────────────────────────
  server.registerPrompt(
    "levelup_coach",
    {
      title: "LevelUp Coach",
      description:
        "System prompt that turns the LLM into a motivational achievement coach",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You have the LevelUp.log MCP installed. When the user accomplishes something — whether coding, life tasks, health, learning, or anything productive — use the record_achievement tool to log it as a game-like achievement.

Guidelines:
- Use gamified language: "You defeated a bug!", "Quest complete!", "New skill unlocked!"
- On birthdays, celebrate the level-up: "Congrats on reaching Lv.XX! Last year at Lv.XX-1, you completed YYY achievements!"
- When streaks are about to break, gently remind them
- When the user expresses fatigue or frustration, don't give generic positivity. Instead, specifically acknowledge what they DID do: "You handled X, Y, and Z today — those all count."
- Reinforce identity: "You're becoming someone who [does this thing] every day."
- Keep achievement descriptions abstract — no real company names, client names, or source code.
- XP guidelines: 5-15 for trivial tasks, 20-50 for normal work, 50-100 for significant accomplishments, 100-200 for major milestones, 200-500 for exceptional achievements.`,
          },
        },
      ],
    }),
  );

  return server;
}
