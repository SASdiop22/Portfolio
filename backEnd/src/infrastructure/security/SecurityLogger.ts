export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'AUTH_LOCKOUT'
  | 'UNAUTHORIZED_ACCESS'
  | 'VALIDATION_FAILURE';

interface SecurityEvent {
  event: SecurityEventType;
  ip: string;
  userAgent: string;
  email?: string;
  path?: string;
  timestamp: string;
  details?: string;
}

export class SecurityLogger {
  static log(event: SecurityEvent): void {
    // Structured JSON log — can be ingested by any SIEM (Datadog, Splunk, ELK)
    console.log(JSON.stringify({ level: 'SECURITY', ...event }));
  }

  static authSuccess(ip: string, userAgent: string, email: string): void {
    SecurityLogger.log({ event: 'AUTH_SUCCESS', ip, userAgent, email, timestamp: new Date().toISOString() });
  }

  static authFailure(ip: string, userAgent: string, email: string, details?: string): void {
    SecurityLogger.log({ event: 'AUTH_FAILURE', ip, userAgent, email, details, timestamp: new Date().toISOString() });
  }

  static authLockout(ip: string, userAgent: string, email: string): void {
    SecurityLogger.log({ event: 'AUTH_LOCKOUT', ip, userAgent, email, timestamp: new Date().toISOString() });
  }

  static unauthorizedAccess(ip: string, userAgent: string, path: string): void {
    SecurityLogger.log({ event: 'UNAUTHORIZED_ACCESS', ip, userAgent, path, timestamp: new Date().toISOString() });
  }

  static validationFailure(ip: string, userAgent: string, path: string, details: string): void {
    SecurityLogger.log({ event: 'VALIDATION_FAILURE', ip, userAgent, path, details, timestamp: new Date().toISOString() });
  }
}