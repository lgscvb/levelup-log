import { describe, it, expect } from 'vitest';

// Import the same logic used in Edge Functions (duplicated for unit test)
const SENSITIVE_PATTERNS = [
  /\b[\w.-]+@[\w.-]+\.\w{2,}\b/g,
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  /\b09\d{2}[-]?\d{3}[-]?\d{3}\b/g,
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  /\b(?:sk|pk|api|key|token|secret)[-_][\w]{10,}\b/gi,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[\w]{30,}\b/g,
];

function sanitizeText(text: string): string {
  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

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
