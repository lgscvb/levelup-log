import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, recordRateEntry, resetRateLimiter } from '../src/utils/rate-limiter.js';

describe('rate-limiter', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('allows first achievement', () => {
    const result = checkRateLimit('code');
    expect(result.allowed).toBe(true);
  });

  it('blocks same category within 60s', () => {
    recordRateEntry('code');
    const result = checkRateLimit('code');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('cooldown');
  });

  it('allows different category immediately', () => {
    recordRateEntry('code');
    const result = checkRateLimit('fix');
    expect(result.allowed).toBe(true);
  });

  it('blocks after session limit', () => {
    // Record 30 achievements with different categories to avoid cooldown
    for (let i = 0; i < 30; i++) {
      recordRateEntry(`cat-${i}`);
    }
    const result = checkRateLimit('new-category');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Session limit');
  });

  it('resets properly', () => {
    recordRateEntry('code');
    resetRateLimiter();
    const result = checkRateLimit('code');
    expect(result.allowed).toBe(true);
  });
});
