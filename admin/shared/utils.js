// ==========================================
// SHARED UTILITY FUNCTIONS
// ==========================================
// This file contains utility functions used across all admin pages
// Consolidates duplicate functions found throughout the codebase

// ==========================================
// DATE & TIME FORMATTING
// ==========================================

/**
 * Format date to locale string (UTC)
 * @param {Date|Firestore.Timestamp} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { timeZone: 'UTC' });
}

/**
 * Format date and time to locale string
 * @param {Date|Firestore.Timestamp} date - Date to format
 * @returns {string} Formatted date-time string
 */
function formatDateTime(date) {
    if (!date) return '-';
    const d = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString();
}

/**
 * Format date as relative time (e.g., "5 mins ago")
 * @param {Date|Firestore.Timestamp} date - Date to format
 * @returns {string} Relative time string
 */
function formatTimeAgo(date) {
    if (!date) return '-';
    const d = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '-';
    const now = new Date();
    const seconds = Math.floor((now - d) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return d.toLocaleDateString();
}

// Export to window for global access
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatTimeAgo = formatTimeAgo;

// ==========================================
// REACT HOOKS
// ==========================================

/**
 * Debounce hook - delays updating value until after delay
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
function useDebounce(value, delay) {
    const { useState, useEffect } = React;
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Connection status hook - tracks online/offline status
 * @returns {boolean} True if online, false if offline
 */
function useConnectionStatus() {
    const { useState, useEffect } = React;
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

window.useDebounce = useDebounce;
window.useConnectionStatus = useConnectionStatus;

// ==========================================
// FIRESTORE UTILITIES
// ==========================================

/**
 * Batch query utility - handles Firestore's 10-item 'in' query limit
 * @param {string} collection - Collection name
 * @param {string} field - Field to query on
 * @param {Array} values - Values to query (will be split into chunks of 10)
 * @param {Array} additionalConstraints - Additional query constraints
 * @returns {Array} Query results
 */
async function batchQuery(collection, field, values, additionalConstraints = []) {
    if (values.length === 0) return [];

    const results = [];
    const chunks = [];

    // Split into chunks of 10
    for (let i = 0; i < values.length; i += 10) {
        chunks.push(values.slice(i, i + 10));
    }

    // Query each chunk
    for (const chunk of chunks) {
        let query = window.db.collection(collection).where(field, 'in', chunk);

        // Add additional constraints
        for (const constraint of additionalConstraints) {
            query = query[constraint.method](...constraint.args);
        }

        const snapshot = await query.get();
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });
    }

    return results;
}

window.batchQuery = batchQuery;

// ==========================================
// EXPORT UTILITIES
// ==========================================

/**
 * Export data to JSON file
 * @param {Array|Object} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
function exportToJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename (without extension)
 */
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const cell = row[header];
                const value = cell === null || cell === undefined ? '' : String(cell);
                return value.includes(',') || value.includes('"') || value.includes('\n')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export data to PDF file (basic - for simple tables)
 * Note: For complex PDFs, use jsPDF directly in views
 * @param {Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 * @param {string} title - PDF title
 */
function exportToPDF(data, filename, title = 'Export') {
    if (!window.jsPDF) {
        console.error('jsPDF not loaded');
        alert('PDF library not loaded. Please refresh the page.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    if (data && data.length > 0 && doc.autoTable) {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => row[h]));

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 40
        });
    }

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

window.exportToJSON = exportToJSON;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;

// ==========================================
// STRING & NUMBER UTILITIES
// ==========================================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string}
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
function truncate(str, maxLength) {
    if (!str || str.length <= maxLength) return str || '';
    return str.substring(0, maxLength) + '...';
}

/**
 * Format number as percentage
 * @param {number} value - Value (0-100)
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
function formatPercent(value, decimals = 0) {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    return `${Math.min(100, Math.max(0, value)).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string}
 */
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return num.toLocaleString();
}

window.capitalize = capitalize;
window.truncate = truncate;
window.formatPercent = formatPercent;
window.formatNumber = formatNumber;

// ==========================================
// VALIDATION UTILITIES
// ==========================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password) return { valid: false, message: 'Password is required' };
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain an uppercase letter' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain a lowercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain a number' };
    return { valid: true, message: 'Password is strong' };
}

/**
 * Validate phone number (US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidPhone(phone) {
    if (!phone) return false;
    const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return re.test(phone);
}

window.isValidEmail = isValidEmail;
window.validatePassword = validatePassword;
window.isValidPhone = isValidPhone;

// ==========================================
// ARRAY UTILITIES
// ==========================================

/**
 * Group array of objects by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object}
 */
function groupBy(array, key) {
    if (!array || !Array.isArray(array)) return {};
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {});
}

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array}
 */
function sortBy(array, key, direction = 'asc') {
    if (!array || !Array.isArray(array)) return [];
    const sorted = [...array].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    });
    return direction === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array with possible duplicates
 * @param {string} key - Optional key for objects
 * @returns {Array}
 */
function unique(array, key = null) {
    if (!array || !Array.isArray(array)) return [];
    if (!key) return [...new Set(array)];

    const seen = new Set();
    return array.filter(item => {
        const k = item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

window.groupBy = groupBy;
window.sortBy = sortBy;
window.unique = unique;

// ==========================================
// UI UTILITIES
// ==========================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

/**
 * Show toast notification (requires toast UI to be implemented)
 * @param {string} message - Message to show
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showToast(message, type = 'info') {
    // Simple implementation - can be replaced with more sophisticated toast library
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message); // Temporary - replace with better toast UI
}

window.copyToClipboard = copyToClipboard;
window.showToast = showToast;

console.log('✅ Utility functions loaded');
