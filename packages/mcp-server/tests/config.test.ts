import { describe, it, expect } from 'vitest';
import { ACHIEVEMENT_CATEGORIES, CONFIG } from '../src/utils/config.js';

describe('CONFIG', () => {
  it('has all required keys', () => {
    expect(CONFIG).toHaveProperty('SUPABASE_URL');
    expect(CONFIG).toHaveProperty('SUPABASE_ANON_KEY');
    expect(CONFIG).toHaveProperty('AUTH_PORT');
    expect(CONFIG).toHaveProperty('DEBUG');
  });

  it('defaults AUTH_PORT to 19876', () => {
    // Unless overridden by env, the default is 19876
    expect(CONFIG.AUTH_PORT).toBe(19876);
  });
});

describe('ACHIEVEMENT_CATEGORIES', () => {
  it('has 15 categories', () => {
    expect(ACHIEVEMENT_CATEGORIES).toHaveLength(15);
  });

  it('contains core categories: code, life, health', () => {
    expect(ACHIEVEMENT_CATEGORIES).toContain('code');
    expect(ACHIEVEMENT_CATEGORIES).toContain('life');
    expect(ACHIEVEMENT_CATEGORIES).toContain('health');
  });

  it('contains all expected categories', () => {
    const expected = [
      'code', 'fix', 'deploy', 'test', 'docs',
      'refactor', 'review', 'learn', 'ops', 'milestone',
      'life', 'health', 'finance', 'social', 'creative',
    ];
    for (const cat of expected) {
      expect(ACHIEVEMENT_CATEGORIES).toContain(cat);
    }
  });
});
