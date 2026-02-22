const CATEGORY_COOLDOWN_MS = 60_000;
const SESSION_MAX_ACHIEVEMENTS = 30;

interface RateEntry {
  category: string;
  timestamp: number;
}

const recentAchievements: RateEntry[] = [];

export function checkRateLimit(category: string): { allowed: boolean; reason?: string } {
  const now = Date.now();

  // Check session limit
  if (recentAchievements.length >= SESSION_MAX_ACHIEVEMENTS) {
    return {
      allowed: false,
      reason: `Session limit reached (${SESSION_MAX_ACHIEVEMENTS} achievements). Start a new session to continue.`,
    };
  }

  // Check category cooldown
  const lastSameCategory = recentAchievements
    .filter((e) => e.category === category)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  if (lastSameCategory && now - lastSameCategory.timestamp < CATEGORY_COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (CATEGORY_COOLDOWN_MS - (now - lastSameCategory.timestamp)) / 1000
    );
    return {
      allowed: false,
      reason: `Same category cooldown: wait ${waitSeconds}s before recording another "${category}" achievement.`,
    };
  }

  return { allowed: true };
}

export function recordRateEntry(category: string): void {
  recentAchievements.push({ category, timestamp: Date.now() });
}

export function resetRateLimiter(): void {
  recentAchievements.length = 0;
}
