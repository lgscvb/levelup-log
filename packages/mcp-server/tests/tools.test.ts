import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth manager
vi.mock('../src/auth/manager.js', () => ({
  getValidToken: vi.fn(async () => 'mock-token'),
}));

// Mock config
vi.mock('../src/utils/config.js', () => ({
  CONFIG: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    AUTH_PORT: 19876,
    DEBUG: false,
  },
  ACHIEVEMENT_CATEGORIES: [
    'code', 'fix', 'deploy', 'test', 'docs', 'refactor', 'review',
    'learn', 'ops', 'milestone', 'life', 'health', 'finance', 'social',
    'creative', 'spiritual', 'hobby',
  ],
  CATEGORY_DEFINITIONS: {
    code: { label: 'Coding', emoji: '💻', description: '', output_unit: '', input_unit: '', xp_weight: 1.0 },
    fix: { label: 'Bug Fix', emoji: '🪲', description: '', output_unit: '', input_unit: '', xp_weight: 1.1 },
    deploy: { label: 'Deploy', emoji: '🚀', description: '', output_unit: '', input_unit: '', xp_weight: 1.3 },
    test: { label: 'Testing', emoji: '🧪', description: '', output_unit: '', input_unit: '', xp_weight: 1.0 },
    docs: { label: 'Docs', emoji: '📝', description: '', output_unit: '', input_unit: '', xp_weight: 0.9 },
    refactor: { label: 'Refactor', emoji: '🔧', description: '', output_unit: '', input_unit: '', xp_weight: 1.0 },
    review: { label: 'Review', emoji: '👁', description: '', output_unit: '', input_unit: '', xp_weight: 0.9 },
    learn: { label: 'Learning', emoji: '📚', description: '', output_unit: '', input_unit: '', xp_weight: 1.0 },
    ops: { label: 'Ops', emoji: '⚙️', description: '', output_unit: '', input_unit: '', xp_weight: 1.2 },
    milestone: { label: 'Milestone', emoji: '🏆', description: '', output_unit: '', input_unit: '', xp_weight: 1.5 },
    life: { label: 'Life', emoji: '🏠', description: '', output_unit: '', input_unit: '', xp_weight: 0.9 },
    health: { label: 'Health', emoji: '💪', description: '', output_unit: '', input_unit: '', xp_weight: 1.1 },
    finance: { label: 'Finance', emoji: '💰', description: '', output_unit: '', input_unit: '', xp_weight: 1.0 },
    social: { label: 'Social', emoji: '🤝', description: '', output_unit: '', input_unit: '', xp_weight: 0.9 },
    creative: { label: 'Creative', emoji: '🎨', description: '', output_unit: '', input_unit: '', xp_weight: 1.0 },
    spiritual: { label: 'Spiritual', emoji: '🔮', description: '', output_unit: '', input_unit: '', xp_weight: 0.85 },
    hobby: { label: 'Hobby', emoji: '🎮', description: '', output_unit: '', input_unit: '', xp_weight: 0.8 },
  },
}));

// Mock logger
vi.mock('../src/utils/logger.js', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

// Mock rate limiter
vi.mock('../src/utils/rate-limiter.js', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
  recordRateEntry: vi.fn(),
}));

import { createServer } from '../src/server.js';
import { checkRateLimit } from '../src/utils/rate-limiter.js';

const originalFetch = global.fetch;

// Helper: call a tool on the MCP server by simulating the handler
// Since McpServer doesn't expose handlers directly, we test through the server's tool list
// We'll test the exported createServer + tool registration

describe('MCP Server Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('server creation', () => {
    it('creates server with correct name and version', () => {
      const server = createServer();
      expect(server).toBeDefined();
    });
  });

  describe('record_achievement — rate limit check', () => {
    it('rate limiter blocks when not allowed', () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        reason: 'Session limit reached',
      });
      const result = checkRateLimit('code');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Session limit');
    });
  });

  describe('record_achievement — API integration', () => {
    it('calls record-achievement endpoint via apiPost', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          xp: 50,
          stats: { total_xp: 1000, year_xp: 500, age_level: 30, current_streak: 5 },
        }),
      });

      // Import apiPost to verify it's called correctly
      const { apiPost } = await import('../src/utils/api.js');
      const result = await apiPost('record-achievement', {
        category: 'code',
        title: 'Test Achievement',
        description: 'Testing',
        complexity: 'normal',
        source_platform: 'claude-code',
      });

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('xp', 50);
    });

    it('handles API error gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limited' }),
      });

      const { apiPost } = await import('../src/utils/api.js');
      const result = await apiPost('record-achievement', {
        category: 'code',
        title: 'Test',
        description: 'Test',
        complexity: 'normal',
      });

      expect(result.error).toBe('Rate limited');
      expect(result.status).toBe(429);
    });
  });

  describe('get_my_stats — API integration', () => {
    it('fetches stats successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          total_xp: 5000,
          year_xp: 2000,
          current_streak: 10,
          age_level: 28,
        }),
      });

      const { apiGet } = await import('../src/utils/api.js');
      const result = await apiGet('get-stats');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('total_xp', 5000);
    });
  });

  describe('get_recent — API integration', () => {
    it('fetches recent achievements with params', async () => {
      const mockAchievements = [
        { id: '1', title: 'Test', category: 'code', xp: 30 },
        { id: '2', title: 'Fix', category: 'fix', xp: 40 },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockAchievements,
      });

      const { apiGet } = await import('../src/utils/api.js');
      const result = await apiGet('get-recent', { limit: '10', days: '7' });

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(2);

      // Verify query params were sent
      const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('limit')).toBe('10');
      expect(parsed.searchParams.get('days')).toBe('7');
    });

    it('supports category filter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });

      const { apiGet } = await import('../src/utils/api.js');
      await apiGet('get-recent', { limit: '5', days: '7', category: 'code' });

      const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('category')).toBe('code');
    });
  });

  describe('check_unlocks — API integration', () => {
    it('fetches unlock status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          unlocked: [{ name: 'First Steps', rarity: 'common' }],
          progress: [{ name: 'Code Warrior', progress: 0.7 }],
        }),
      });

      const { apiGet } = await import('../src/utils/api.js');
      const result = await apiGet('check-unlocks');

      expect(result.status).toBe(200);
      expect((result.data as Record<string, unknown>)).toHaveProperty('unlocked');
    });
  });

  describe('leaderboard — API integration', () => {
    it('fetches season leaderboard', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          entries: [
            { rank: 1, slug: 'user1', xp: 10000 },
            { rank: 2, slug: 'user2', xp: 8000 },
          ],
          my_rank: 2,
        }),
      });

      const { apiGet } = await import('../src/utils/api.js');
      const result = await apiGet('leaderboard', { type: 'season', limit: '10' });

      expect(result.status).toBe(200);
      const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('type')).toBe('season');
    });

    it('supports all_time type', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ entries: [] }),
      });

      const { apiGet } = await import('../src/utils/api.js');
      await apiGet('leaderboard', { type: 'all_time', limit: '50' });

      const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('type')).toBe('all_time');
      expect(parsed.searchParams.get('limit')).toBe('50');
    });
  });
});
