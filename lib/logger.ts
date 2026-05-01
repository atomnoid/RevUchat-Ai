// Security logging for authentication failures
// Logs failed authentication attempts without exposing sensitive data

interface AuthFailureLog {
  email: string;
  ip: string;
  timestamp: string;
  userAgent?: string;
}

// In-memory log storage (for production, use a proper logging service)
const authFailureLogs: AuthFailureLog[] = [];

// Keep only last 1000 logs to prevent memory issues
const MAX_LOGS = 1000;

export function logFailedAuth(email: string, ip: string, userAgent?: string) {
  const logEntry: AuthFailureLog = {
    email,
    ip,
    timestamp: new Date().toISOString(),
    userAgent,
  };

  authFailureLogs.push(logEntry);

  // Trim logs if exceeding limit
  if (authFailureLogs.length > MAX_LOGS) {
    authFailureLogs.shift();
  }

  // In production, send to logging service (e.g., Sentry, LogRocket, CloudWatch)
  // For now, we'll use console.error for server-side visibility
  console.error('AUTH_FAILURE:', {
    email,
    ip,
    timestamp: logEntry.timestamp,
  });
}

export function getRecentAuthFailures(count: number = 10): AuthFailureLog[] {
  return authFailureLogs.slice(-count);
}

export function getAuthFailureCountForEmail(email: string, timeWindowMinutes: number = 15): number {
  const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  return authFailureLogs.filter(
    log => log.email === email && new Date(log.timestamp) > cutoff
  ).length;
}

export function getAuthFailureCountForIP(ip: string, timeWindowMinutes: number = 15): number {
  const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  return authFailureLogs.filter(
    log => log.ip === ip && new Date(log.timestamp) > cutoff
  ).length;
}
