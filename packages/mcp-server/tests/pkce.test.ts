import { describe, it, expect } from 'vitest';
import { generateCodeVerifier, generateCodeChallenge } from '../src/auth/pkce.js';

describe('PKCE', () => {
  it('generates a code verifier of valid length', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThan(30);
    // base64url characters only
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates different verifiers each time', () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });

  it('generates a valid code challenge from verifier', () => {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    expect(challenge.length).toBeGreaterThan(20);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates same challenge for same verifier', () => {
    const verifier = generateCodeVerifier();
    const c1 = generateCodeChallenge(verifier);
    const c2 = generateCodeChallenge(verifier);
    expect(c1).toBe(c2);
  });

  it('generates different challenges for different verifiers', () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(generateCodeChallenge(v1)).not.toBe(generateCodeChallenge(v2));
  });
});
