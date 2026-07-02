const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface IpRecord {
  failures: number;
  lockedUntil: number | null;
}

// In-memory store — sufficient for single-instance deployments
// For multi-instance, replace with Redis (e.g. ioredis)
const store = new Map<string, IpRecord>();

export class BruteForceProtection {
  static isLocked(ip: string): boolean {
    const record = store.get(ip);
    if (!record || record.lockedUntil === null) return false;
    if (Date.now() > record.lockedUntil) {
      store.delete(ip);
      return false;
    }
    return true;
  }

  static getRemainingLockMs(ip: string): number {
    const record = store.get(ip);
    if (!record?.lockedUntil) return 0;
    return Math.max(0, record.lockedUntil - Date.now());
  }

  static recordFailure(ip: string): void {
    const record = store.get(ip) ?? { failures: 0, lockedUntil: null };
    record.failures += 1;

    if (record.failures >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    store.set(ip, record);
  }

  static recordSuccess(ip: string): void {
    store.delete(ip);
  }

  static getAttemptCount(ip: string): number {
    return store.get(ip)?.failures ?? 0;
  }
}