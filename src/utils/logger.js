/**
 * Professional logging utility
 * Replace console.log/error/warn with this for better control and production safety
 */

const isDevelopment = import.meta.env.DEV;

class Logger {
  /**
   * Log info messages (only in development)
   */
  info(...args) {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Log error messages (always, but can be enhanced with error tracking service)
   */
  error(...args) {
    console.error('[ERROR]', ...args);
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
  }

  /**
   * Log warning messages (only in development)
   */
  warn(...args) {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args) {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }
}

export const logger = new Logger();
export default logger;
