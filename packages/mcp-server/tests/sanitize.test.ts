import { describe, it, expect } from 'vitest';
import { sanitizeText } from '../src/utils/sanitize.js';

describe('sanitizeText', () => {
  it('redacts email addresses', () => {
    expect(sanitizeText('Contact me at user@example.com')).toBe('Contact me at [REDACTED]');
  });

  it('redacts IP addresses', () => {
    expect(sanitizeText('Server at 192.168.1.1')).toBe('Server at [REDACTED]');
  });

  it('redacts API keys', () => {
    expect(sanitizeText('Use key sk_live_abcdefghij1234567890')).toBe('Use key [REDACTED]');
  });

  it('redacts TW mobile numbers', () => {
    expect(sanitizeText('Call 0912-345-678')).toBe('Call [REDACTED]');
  });

  it('leaves clean text unchanged', () => {
    const text = 'Fixed a bug in the authentication module';
    expect(sanitizeText(text)).toBe(text);
  });

  it('redacts GitHub tokens', () => {
    expect(sanitizeText('ghp_' + 'a'.repeat(36))).toBe('[REDACTED]');
  });
});
