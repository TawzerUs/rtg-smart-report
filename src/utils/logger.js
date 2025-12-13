/**
 * Development-only Logger Utility
 * 
 * Logs are only shown in development mode (import.meta.env.DEV)
 * In production builds, these become no-ops for better performance
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Debug log - development only
     */
    debug: (...args) => {
        if (isDev) {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Info log - development only  
     */
    info: (...args) => {
        if (isDev) {
            console.log('[INFO]', ...args);
        }
    },

    /**
     * Warning log - always shown
     */
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error log - always shown
     */
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },

    /**
     * Auth-specific logging
     */
    auth: (...args) => {
        if (isDev) {
            console.log('[AUTH]', ...args);
        }
    },

    /**
     * Database-specific logging
     */
    db: (...args) => {
        if (isDev) {
            console.log('[DB]', ...args);
        }
    }
};

export default logger;

