// Regex patterns for common sensitive data (server-side safety net)
const SENSITIVE_PATTERNS = [
  /\b[\w.-]+@[\w.-]+\.\w{2,}\b/g, // email
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // credit card
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // phone (US)
  /\b09\d{2}[-]?\d{3}[-]?\d{3}\b/g, // phone (TW mobile)
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IPv4
  /\b(?:sk|pk|api|key|token|secret)[-_][\w]{10,}\b/gi, // API keys
  /\b(?:ghp|gho|ghu|ghs|ghr)_[\w]{30,}\b/g, // GitHub tokens
  /(?:\/Users\/|\/home\/)[\w.-]+\/[\w./-]+/g, // file paths
  /\b[A-Z][12]\d{8}\b/g, // TW national ID
];

export function sanitizeText(text: string): string {
  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}
