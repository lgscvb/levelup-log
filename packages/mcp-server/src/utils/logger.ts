import { CONFIG } from './config.js';

export function log(...args: unknown[]): void {
  if (CONFIG.DEBUG) {
    console.error('[levelup]', ...args);
  }
}

export function logError(...args: unknown[]): void {
  console.error('[levelup:error]', ...args);
}
