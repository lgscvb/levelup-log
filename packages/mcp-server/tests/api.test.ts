import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock auth manager — getValidToken is called internally by apiGet/apiPost
vi.mock('../src/auth/manager.js', () => ({
  getValidToken: vi.fn(async () => 'mock-access-token-123'),
}));

// Mock config
vi.mock('../src/utils/config.js', () => ({
  CONFIG: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    AUTH_PORT: 19876,
    DEBUG: false,
  },
}));

// Mock logger to suppress error output
vi.mock('../src/utils/logger.js', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

import { apiGet, apiPost } from '../src/utils/api.js';
import { getValidToken } from '../src/auth/manager.js';

// Keep a reference to the original fetch so we can restore it
const originalFetch = global.fetch;

describe('apiGet', () => {
  beforeEach(() => {
    // Reset mock call counts but keep mock implementations
    vi.clearAllMocks();
    vi.mocked(getValidToken).mockResolvedValue('mock-access-token-123');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns data on successful GET', async () => {
    const mockData = { achievements: [{ id: 1, title: 'First Code' }] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiGet('get-recent');

    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeUndefined();
  });

  it('includes correct Authorization header', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiGet('get-stats');

    expect(global.fetch).toHaveBeenCalledOnce();
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer mock-access-token-123');
    expect(options.headers.apikey).toBe('test-anon-key');
  });

  it('appends query params correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiGet('get-recent', { limit: '10', category: 'code' });

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.searchParams.get('limit')).toBe('10');
    expect(parsed.searchParams.get('category')).toBe('code');
  });

  it('returns error on HTTP error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    const result = await apiGet('get-stats');

    expect(result.status).toBe(401);
    expect(result.error).toBe('Unauthorized');
    expect(result.data).toBeUndefined();
  });

  it('returns error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await apiGet('get-stats');

    expect(result.status).toBe(0);
    expect(result.error).toBe('Network error');
    expect(result.data).toBeUndefined();
  });
});

describe('apiPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getValidToken).mockResolvedValue('mock-access-token-123');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns data on successful POST', async () => {
    const responseData = { id: 'abc', xp: 50 };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => responseData,
    });

    const result = await apiPost('record-achievement', {
      category: 'code',
      title: 'Test',
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual(responseData);
    expect(result.error).toBeUndefined();
  });

  it('sends body as JSON with correct headers', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const body = { category: 'code', title: 'Built feature', description: 'details' };
    await apiPost('record-achievement', body);

    expect(global.fetch).toHaveBeenCalledOnce();
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('https://test.supabase.co/functions/v1/record-achievement');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers.Authorization).toBe('Bearer mock-access-token-123');
    expect(JSON.parse(options.body)).toEqual(body);
  });

  it('returns error on HTTP error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limited' }),
    });

    const result = await apiPost('record-achievement', { category: 'code' });

    expect(result.status).toBe(429);
    expect(result.error).toBe('Rate limited');
    expect(result.data).toBeUndefined();
  });

  it('returns error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fetch failed'));

    const result = await apiPost('record-achievement', { category: 'code' });

    expect(result.status).toBe(0);
    expect(result.error).toBe('fetch failed');
    expect(result.data).toBeUndefined();
  });
});
