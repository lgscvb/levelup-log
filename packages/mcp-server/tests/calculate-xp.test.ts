import { describe, it, expect } from 'vitest';
import { calculateXp } from '../src/server.js';

describe('calculateXp', () => {
  it('returns minimum 5 XP for trivial short tasks', () => {
    const xp = calculateXp({ category: 'code', complexity: 'trivial', time_minutes: 1 });
    expect(xp).toBeGreaterThanOrEqual(5);
  });

  it('returns maximum 500 XP cap', () => {
    const xp = calculateXp({
      category: 'milestone',
      complexity: 'milestone',
      time_minutes: 300,
      output_units: 100,
      input_units: 100,
      conversation_rounds: 100,
    });
    expect(xp).toBeLessThanOrEqual(500);
  });

  it('scales with complexity', () => {
    const trivial = calculateXp({ category: 'code', complexity: 'trivial', time_minutes: 30 });
    const normal = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30 });
    const significant = calculateXp({ category: 'code', complexity: 'significant', time_minutes: 30 });
    const major = calculateXp({ category: 'code', complexity: 'major', time_minutes: 30 });
    const milestone = calculateXp({ category: 'code', complexity: 'milestone', time_minutes: 30 });

    expect(trivial).toBeLessThan(normal);
    expect(normal).toBeLessThan(significant);
    expect(significant).toBeLessThan(major);
    expect(major).toBeLessThan(milestone);
  });

  it('applies time multiplier', () => {
    const short = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 5 });
    const medium = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30 });
    const long = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 120 });
    const veryLong = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 200 });

    expect(short).toBeLessThan(medium);
    expect(medium).toBeLessThan(long);
    expect(long).toBeLessThan(veryLong);
  });

  it('applies category xp_weight', () => {
    // deploy has xp_weight 1.3, docs has 0.9
    const deploy = calculateXp({ category: 'deploy', complexity: 'normal', time_minutes: 30 });
    const docs = calculateXp({ category: 'docs', complexity: 'normal', time_minutes: 30 });
    expect(deploy).toBeGreaterThan(docs);
  });

  it('applies self_reported 15% discount', () => {
    const params = { category: 'code' as const, complexity: 'normal' as const, time_minutes: 30 };
    const normal = calculateXp({ ...params, self_reported: false });
    const selfReported = calculateXp({ ...params, self_reported: true });
    expect(selfReported).toBeLessThan(normal);
    // 15% discount: selfReported ≈ normal * 0.85
    expect(selfReported).toBe(Math.max(5, Math.round(normal * 0.85)));
  });

  it('adds output bonus with diminishing returns', () => {
    const noOutput = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, output_units: 0 });
    const someOutput = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, output_units: 5 });
    const lotsOutput = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, output_units: 50 });
    expect(someOutput).toBeGreaterThan(noOutput);
    expect(lotsOutput).toBeGreaterThan(someOutput);
    // Diminishing returns: the gap should be smaller
    expect(lotsOutput - someOutput).toBeLessThan((someOutput - noOutput) * 5);
  });

  it('adds input bonus capped at 15', () => {
    const base = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, input_units: 0 });
    const withInput = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, input_units: 10 });
    const maxInput = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, input_units: 100 });
    expect(withInput).toBeGreaterThan(base);
    // 100 input units should give same as 15 (capped)
    expect(maxInput - base).toBeLessThanOrEqual(15);
  });

  it('adds rounds bonus capped at 25', () => {
    const base = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, conversation_rounds: 0 });
    const withRounds = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30, conversation_rounds: 100 });
    expect(withRounds - base).toBeLessThanOrEqual(25);
  });

  it('defaults to 30 minutes when time_minutes is undefined', () => {
    const withDefault = calculateXp({ category: 'code', complexity: 'normal' });
    const explicit30 = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30 });
    expect(withDefault).toBe(explicit30);
  });

  it('handles hobby category with lower xp_weight', () => {
    const code = calculateXp({ category: 'code', complexity: 'normal', time_minutes: 30 });
    const hobby = calculateXp({ category: 'hobby', complexity: 'normal', time_minutes: 30 });
    expect(hobby).toBeLessThan(code); // hobby xp_weight=0.8 vs code=1.0
  });
});
