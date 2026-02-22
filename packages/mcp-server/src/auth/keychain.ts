import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { log, logError } from '../utils/logger.js';

const CREDENTIALS_DIR = join(homedir(), '.levelup');
const CREDENTIALS_FILE = join(CREDENTIALS_DIR, 'credentials.json');

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export function loadTokens(): StoredTokens | null {
  try {
    if (!existsSync(CREDENTIALS_FILE)) return null;
    const data = readFileSync(CREDENTIALS_FILE, 'utf-8');
    const tokens = JSON.parse(data) as StoredTokens;
    log('Loaded tokens from', CREDENTIALS_FILE);
    return tokens;
  } catch (error) {
    logError('Failed to load tokens:', error);
    return null;
  }
}

export function saveTokens(tokens: StoredTokens): void {
  try {
    if (!existsSync(CREDENTIALS_DIR)) {
      mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
    }
    writeFileSync(CREDENTIALS_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
    log('Saved tokens to', CREDENTIALS_FILE);
  } catch (error) {
    logError('Failed to save tokens:', error);
  }
}

export function clearTokens(): void {
  try {
    if (existsSync(CREDENTIALS_FILE)) {
      writeFileSync(CREDENTIALS_FILE, '{}', { mode: 0o600 });
      log('Cleared tokens');
    }
  } catch (error) {
    logError('Failed to clear tokens:', error);
  }
}
