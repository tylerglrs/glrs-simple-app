/**
 * Timezone and time-matching helpers for notification scheduling
 * Handles timezone-aware notification delivery
 */

/**
 * Get user's current local time based on their timezone
 *
 * @param {Date} utcTime - UTC time to convert
 * @param {string} timezone - User's timezone (e.g., 'America/Los_Angeles')
 * @returns {Object} Object with hour, minute, and formatted time string
 */
function getUserLocalTime(utcTime, timezone = 'America/Los_Angeles') {
    const timeString = utcTime.toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const parts = timeString.split(':');
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);

    return {
        hour,
        minute,
        formatted: `${parts[0]}:${parts[1]}` // "HH:MM"
    };
}

/**
 * Check if current time matches target time within a window
 *
 * @param {string} currentTime - Current time in "HH:MM" format
 * @param {string} targetTime - Target time in "HH:MM" format (e.g., "08:00")
 * @param {number} windowMinutes - Time window in minutes (default: 5)
 * @returns {boolean} True if current time is within window of target time
 */
function isTimeMatch(currentTime, targetTime, windowMinutes = 5) {
    if (!currentTime || !targetTime) {
        return false;
    }

    const current = timeToMinutes(currentTime);
    const target = timeToMinutes(targetTime);

    // Check if current time is within the window
    // Example: If target is 08:00 and window is 5 minutes
    // Match times between 08:00 and 08:04
    return current >= target && current < target + windowMinutes;
}

/**
 * Convert "HH:MM" time string to total minutes since midnight
 *
 * @param {string} timeString - Time in "HH:MM" format
 * @returns {number} Total minutes since midnight
 */
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Add hours to a time string
 *
 * @param {string} timeString - Time in "HH:MM" format
 * @param {number} hours - Hours to add
 * @returns {string} New time in "HH:MM" format
 */
function addHours(timeString, hours) {
    const totalMinutes = timeToMinutes(timeString) + (hours * 60);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

/**
 * Get today's date string in YYYY-MM-DD format for a given timezone
 *
 * @param {string} timezone - User's timezone
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getTodayString(timezone = 'America/Los_Angeles') {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return dateString; // "YYYY-MM-DD"
}

/**
 * Get yesterday's date string in YYYY-MM-DD format for a given timezone
 *
 * @param {string} timezone - User's timezone
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getYesterdayString(timezone = 'America/Los_Angeles') {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateString = yesterday.toLocaleDateString('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return dateString; // "YYYY-MM-DD"
}

/**
 * Calculate days between two dates
 *
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days between dates
 */
function calculateDaysBetween(startDate, endDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

module.exports = {
    getUserLocalTime,
    isTimeMatch,
    timeToMinutes,
    addHours,
    getTodayString,
    getYesterdayString,
    calculateDaysBetween
};
