/**
 * Privacy sanitizer — forced pre-upload anonymization step.
 *
 * Runs BEFORE every record_achievement API call. This is the enforcement layer
 * that doesn't rely on AI agents following instructions.
 *
 * Config file: ~/.levelup/privacy-rules.json (user-customizable)
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { log } from "./logger.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatternRule {
  pattern: string;
  replacement: string;
  flags?: string;
  description?: string;
}

interface PrivacyRules {
  version: number;
  /** Exact strings to scrub (case-insensitive match, replaced with generic label) */
  blocklist: string[];
  /** Specific string → replacement mapping (takes precedence over blocklist) */
  replacements: Record<string, string>;
  /** Regex patterns to scrub */
  patterns: PatternRule[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PATTERNS: PatternRule[] = [
  {
    pattern: "(?:/Users/|/home/)[\\w.-]+/[^\\s,;）)]+",
    replacement: "[file-path]",
    description: "Local file paths",
  },
  {
    pattern: "\\b[\\w.-]+@[\\w.-]+\\.[a-z]{2,}\\b",
    replacement: "[email]",
    flags: "gi",
    description: "Email addresses",
  },
  {
    pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
    replacement: "[ip]",
    description: "IPv4 addresses",
  },
  {
    pattern: "https?://(?:localhost|127\\.0\\.0\\.1|[\\w.-]+\\.internal)[^\\s]*",
    replacement: "[internal-url]",
    description: "Internal/localhost URLs",
  },
  {
    pattern: "\\b(?:sk|pk|api|key|token|secret)[-_][\\w]{10,}\\b",
    replacement: "[credential]",
    flags: "gi",
    description: "API keys and secrets",
  },
  {
    pattern: "\\b(?:ghp|gho|ghu|ghs|ghr)_[\\w]{30,}\\b",
    replacement: "[github-token]",
    description: "GitHub tokens",
  },
  {
    pattern: "\\b(?:PRD|CHANGELOG|SOP|PLAN)-[\\w.-]+\\.md\\b",
    replacement: "[internal-doc]",
    description: "Internal document filenames",
  },
];

const DEFAULT_RULES: PrivacyRules = {
  version: 1,
  blocklist: [],
  replacements: {},
  patterns: DEFAULT_PATTERNS,
};

// ─── Config loader ────────────────────────────────────────────────────────────

const PRIVACY_FILE = join(homedir(), ".levelup", "privacy-rules.json");
let cachedRules: PrivacyRules | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000; // reload every 30s

function loadRules(): PrivacyRules {
  const now = Date.now();
  if (cachedRules && now - cacheTime < CACHE_TTL) {
    return cachedRules;
  }

  let userRules: Partial<PrivacyRules> = {};
  if (existsSync(PRIVACY_FILE)) {
    try {
      userRules = JSON.parse(readFileSync(PRIVACY_FILE, "utf-8"));
      log("Loaded privacy rules from", PRIVACY_FILE);
    } catch (err) {
      log("Failed to parse privacy-rules.json, using defaults");
    }
  }

  // Merge: user patterns append to (not replace) defaults
  cachedRules = {
    version: userRules.version ?? DEFAULT_RULES.version,
    blocklist: [
      ...(DEFAULT_RULES.blocklist),
      ...(userRules.blocklist ?? []),
    ],
    replacements: {
      ...DEFAULT_RULES.replacements,
      ...(userRules.replacements ?? {}),
    },
    patterns: [
      ...DEFAULT_RULES.patterns,
      ...(userRules.patterns ?? []),
    ],
  };
  cacheTime = now;
  return cachedRules;
}

// ─── Sanitizer ────────────────────────────────────────────────────────────────

function applyRules(text: string, rules: PrivacyRules): string {
  let result = text;

  // 1. Apply specific replacements first (exact match, case-insensitive)
  for (const [needle, replacement] of Object.entries(rules.replacements)) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), replacement);
  }

  // 2. Apply blocklist (anything not caught by replacements → generic "[redacted]")
  for (const term of rules.blocklist) {
    // Skip if already handled by replacements
    if (rules.replacements[term]) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "[redacted]");
  }

  // 3. Apply regex patterns
  for (const rule of rules.patterns) {
    try {
      const re = new RegExp(rule.pattern, rule.flags ?? "g");
      result = result.replace(re, rule.replacement);
    } catch {
      // Skip invalid regex
    }
  }

  return result;
}

/**
 * Forced pre-upload sanitization.
 * Called before every record_achievement API call — this is NOT optional.
 *
 * Returns sanitized title + description, plus a flag indicating if changes were made.
 */
export function sanitizeForPublic(
  title: string,
  description: string,
): { title: string; description: string; wasModified: boolean } {
  const rules = loadRules();
  const sanitizedTitle = applyRules(title, rules);
  const sanitizedDesc = applyRules(description, rules);
  const wasModified = sanitizedTitle !== title || sanitizedDesc !== description;

  if (wasModified) {
    log("Privacy sanitizer modified achievement content");
  }

  return {
    title: sanitizedTitle,
    description: sanitizedDesc,
    wasModified,
  };
}

/**
 * Force-reload rules from disk (useful after editing privacy-rules.json).
 */
export function reloadPrivacyRules(): void {
  cachedRules = null;
  cacheTime = 0;
  loadRules();
}
