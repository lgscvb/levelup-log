import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to control CONFIG.DEBUG, so mock the config module
vi.mock('../src/utils/config.js', () => ({
  CONFIG: {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    AUTH_PORT: 19876,
    DEBUG: false,
  },
}));

import { log, logError } from '../src/utils/logger.js';
import { CONFIG } from '../src/utils/config.js';

describe('logger', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('logError always outputs to stderr', () => {
    logError('something went wrong');
    expect(stderrSpy).toHaveBeenCalledWith('[levelup:error]', 'something went wrong');
  });

  it('log does not output when DEBUG is false', () => {
    // CONFIG.DEBUG is false by default in our mock
    log('debug message');
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('log outputs to stderr when DEBUG is true', () => {
    // Temporarily enable DEBUG
    const mutableConfig = CONFIG as { DEBUG: boolean };
    mutableConfig.DEBUG = true;

    log('debug info');
    expect(stderrSpy).toHaveBeenCalledWith('[levelup]', 'debug info');

    // Restore
    mutableConfig.DEBUG = false;
  });
});
