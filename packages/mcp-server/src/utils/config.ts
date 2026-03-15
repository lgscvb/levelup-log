export const CONFIG = {
  SUPABASE_URL:
    process.env.LEVELUP_SUPABASE_URL ||
    "https://hkuvfhfwbhkjmeqvwrxy.supabase.co",
  SUPABASE_ANON_KEY:
    process.env.LEVELUP_SUPABASE_ANON_KEY ||
    "sb_publishable_RilZivOWm3FIs6ueIA67Fw_07ZKjoEY",
  AUTH_PORT: parseInt(process.env.LEVELUP_AUTH_PORT || "19876", 10),
  DEBUG: process.env.LEVELUP_DEBUG === "true",
} as const;

export const ACHIEVEMENT_CATEGORIES = [
  "code",
  "fix",
  "deploy",
  "test",
  "docs",
  "refactor",
  "review",
  "learn",
  "ops",
  "milestone",
  "life",
  "health",
  "finance",
  "social",
  "creative",
  "spiritual", // 身心靈：冥想、占卜、祈禱、儀式、能量練習
  "hobby", // 興趣娛樂：打電動、看電影、收藏、桌遊、園藝
] as const;

export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];
