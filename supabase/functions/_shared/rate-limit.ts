// Simple in-memory rate limiter for Edge Functions
// In production, this resets per cold start — acceptable for MVP
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 20;

const counters = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = counters.get(userId);

  if (!entry || now > entry.resetAt) {
    counters.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_PER_WINDOW - entry.count };
}
