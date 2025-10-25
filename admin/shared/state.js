// ==========================================
// SHARED STATE PERSISTENCE
// ==========================================
// State persistence for admin portal
// Handles filters, pagination, UI state across page transitions

/**
 * State Persistence System
 *
 * Uses sessionStorage for temporary state (cleared on browser close)
 * Uses localStorage for preferences (persisted across sessions)
 *
 * State Structure:
 * {
 *   tenantId: string,
 *   page: string,
 *   timestamp: number,
 *   data: {
 *     filters: {},
 *     pagination: {},
 *     ui: {},
 *     preferences: {}
 *   }
 * }
 */

// Get current tenant ID (uses window.CURRENT_TENANT or calculates)
const getStateT

enantId = () => {
    if (window.CURRENT_TENANT) return window.CURRENT_TENANT;
    if (window.getTenantId) return window.getTenantId();

    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return 'glrs';
    }
    const parts = hostname.split('.');
    if (parts.length >= 3) {
        const subdomain = parts[0];
        if (subdomain !== 'www' && subdomain !== 'app') {
            return subdomain;
        }
    }
    return 'glrs';
};

/**
 * Save page state to sessionStorage
 *
 * @param {string} pageName - Page identifier (e.g., 'dashboard', 'users')
 * @param {object} state - State object to save
 * @param {object} state.filters - Filter values
 * @param {object} state.pagination - Pagination state (page, limit)
 * @param {object} state.ui - UI state (collapsed panels, selected tabs)
 *
 * @example
 * savePageState('users', {
 *   filters: { role: 'pir', active: true },
 *   pagination: { page: 2, limit: 50 },
 *   ui: { sidebarCollapsed: false }
 * });
 */
window.savePageState = function(pageName, state) {
    try {
        const tenantId = getStateTenantId();
        const key = `glrs_state_${tenantId}_${pageName}`;

        const stateData = {
            tenantId,
            page: pageName,
            timestamp: Date.now(),
            data: state
        };

        sessionStorage.setItem(key, JSON.stringify(stateData));
        console.log(`✅ State saved for ${pageName}:`, state);
    } catch (error) {
        console.error('Error saving page state:', error);
        // Fail silently - state persistence is not critical
    }
};

/**
 * Restore page state from sessionStorage
 *
 * @param {string} pageName - Page identifier
 * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
 * @returns {object|null} - Restored state or null if not found/expired
 *
 * @example
 * const savedState = restorePageState('users');
 * if (savedState) {
 *   setFilters(savedState.filters);
 *   setPage(savedState.pagination.page);
 * }
 */
window.restorePageState = function(pageName, maxAge = 3600000) {
    try {
        const tenantId = getStateTenantId();
        const key = `glrs_state_${tenantId}_${pageName}`;

        const saved = sessionStorage.getItem(key);
        if (!saved) {
            console.log(`ℹ️ No saved state for ${pageName}`);
            return null;
        }

        const stateData = JSON.parse(saved);

        // Check if state is too old
        const age = Date.now() - stateData.timestamp;
        if (age > maxAge) {
            console.log(`⚠️ Saved state for ${pageName} is too old (${Math.round(age/1000)}s), ignoring`);
            sessionStorage.removeItem(key);
            return null;
        }

        // Verify tenant match (security)
        if (stateData.tenantId !== tenantId) {
            console.warn(`⚠️ Tenant mismatch in saved state for ${pageName}, clearing`);
            sessionStorage.removeItem(key);
            return null;
        }

        console.log(`✅ State restored for ${pageName}:`, stateData.data);
        return stateData.data;
    } catch (error) {
        console.error('Error restoring page state:', error);
        return null;
    }
};

/**
 * Clear page state
 *
 * @param {string} pageName - Page identifier, or 'all' to clear all
 *
 * @example
 * clearPageState('users');      // Clear users page state
 * clearPageState('all');        // Clear all page states
 */
window.clearPageState = function(pageName) {
    try {
        const tenantId = getStateTenantId();

        if (pageName === 'all') {
            // Clear all states for current tenant
            const keys = Object.keys(sessionStorage);
            const prefix = `glrs_state_${tenantId}_`;
            keys.forEach(key => {
                if (key.startsWith(prefix)) {
                    sessionStorage.removeItem(key);
                }
            });
            console.log(`✅ All page states cleared for tenant ${tenantId}`);
        } else {
            const key = `glrs_state_${tenantId}_${pageName}`;
            sessionStorage.removeItem(key);
            console.log(`✅ State cleared for ${pageName}`);
        }
    } catch (error) {
        console.error('Error clearing page state:', error);
    }
};

/**
 * Save user preference to localStorage (persists across sessions)
 *
 * @param {string} prefName - Preference name
 * @param {any} value - Preference value
 *
 * @example
 * savePreference('theme', 'dark');
 * savePreference('rowsPerPage', 50);
 */
window.savePreference = function(prefName, value) {
    try {
        const tenantId = getStateTenantId();
        const userId = window.auth?.currentUser?.uid || 'anonymous';
        const key = `glrs_pref_${tenantId}_${userId}_${prefName}`;

        localStorage.setItem(key, JSON.stringify({
            value,
            timestamp: Date.now()
        }));

        console.log(`✅ Preference saved: ${prefName} = ${value}`);
    } catch (error) {
        console.error('Error saving preference:', error);
    }
};

/**
 * Get user preference from localStorage
 *
 * @param {string} prefName - Preference name
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Preference value or default
 *
 * @example
 * const theme = getPreference('theme', 'light');
 * const rowsPerPage = getPreference('rowsPerPage', 25);
 */
window.getPreference = function(prefName, defaultValue = null) {
    try {
        const tenantId = getStateTenantId();
        const userId = window.auth?.currentUser?.uid || 'anonymous';
        const key = `glrs_pref_${tenantId}_${userId}_${prefName}`;

        const saved = localStorage.getItem(key);
        if (!saved) return defaultValue;

        const { value } = JSON.parse(saved);
        return value;
    } catch (error) {
        console.error('Error getting preference:', error);
        return defaultValue;
    }
};

/**
 * Clean up old state data (call on app init)
 * Removes state older than 24 hours
 */
window.cleanupOldState = function() {
    try {
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();
        const tenantId = getStateTenantId();
        const prefix = `glrs_state_${tenantId}_`;

        let cleaned = 0;
        const keys = Object.keys(sessionStorage);

        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                try {
                    const data = JSON.parse(sessionStorage.getItem(key));
                    if (data.timestamp && (now - data.timestamp > maxAge)) {
                        sessionStorage.removeItem(key);
                        cleaned++;
                    }
                } catch (e) {
                    // Invalid data, remove it
                    sessionStorage.removeItem(key);
                    cleaned++;
                }
            }
        });

        if (cleaned > 0) {
            console.log(`✅ Cleaned up ${cleaned} old state entries`);
        }
    } catch (error) {
        console.error('Error cleaning up old state:', error);
    }
};

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.cleanupOldState();
    });
}

console.log('✅ State persistence system loaded');
