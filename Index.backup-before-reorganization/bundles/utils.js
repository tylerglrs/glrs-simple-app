// ============================================================
// GLRS LIGHTHOUSE - UTILITY FUNCTIONS
// ============================================================
// Pure utility functions extracted from PIRapp.js
// Made independent for reusability
// ============================================================

// ============================================================
// SOBRIETY CALCULATIONS
// ============================================================

// Calculate sobriety days from a sobriety date string (YYYY-MM-DD)
// DST-proof calculation using UTC conversion
const calculateSobrietyDays = (sobrietyDate) => {
    if (!sobrietyDate) return 0;

    // Parse as LOCAL date
    const [year, month, day] = sobrietyDate.split('-');
    const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIXED: Convert both to UTC to avoid DST issues
    // DST causes 1-hour difference between PST and PDT which affects millisecond calculations
    const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    // Calculate difference in milliseconds (now DST-proof)
    const diffTime = todayUTC - sobrietyUTC;

    // Convert to days and add 1 (because day 1 is the sobriety date itself)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Return at least 1 if sobriety date is today or in the past
    return Math.max(1, diffDays);
};

// Generate recovery milestone objects with achievement status
// Uses calculateSobrietyDays internally
const getRecoveryMilestones = (sobrietyDate) => {
    if (!sobrietyDate) return [];

    // FIXED: Parse as LOCAL date to avoid timezone shifting
    // "2023-02-03" should be Feb 3 in user's timezone, not UTC
    const [year, month, day] = sobrietyDate.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);

    // Icon emoji mapping
    const iconEmoji = {
        'star': 'P',
        'calendar': '=Å',
        'award': '<Æ',
        'trending-up': '=È',
        'target': '<¯',
        'check-circle': '',
        'sunrise': '<',
        'zap': '¡',
        'sparkles': '(',
        'medal': '<Å',
        'gem': '=Ž',
        'flower': '<8',
        'gift': '<',
        'cake': '<‚',
        'crown': '=Q',
        'trophy': '<Æ',
        'diamond': '=Ž'
    };

    const milestones = [
        { days: 1, title: '24 Hours', icon: 'star', type: 'days' },
        { days: 7, title: '1 Week', icon: 'calendar', type: 'days' },
        { months: 1, title: '1 Month', icon: 'award', type: 'months' },
        { months: 2, title: '2 Months', icon: 'trending-up', type: 'months' },
        { months: 3, title: '3 Months', icon: 'target', type: 'months' },
        { days: 100, title: '100 Days', icon: 'check-circle', type: 'days' },
        { months: 4, title: '4 Months', icon: 'star', type: 'months' },
        { months: 5, title: '5 Months', icon: 'sunrise', type: 'months' },
        { months: 6, title: '6 Months', icon: 'zap', type: 'months' },
        { days: 200, title: '200 Days', icon: 'sparkles', type: 'days' },
        { months: 7, title: '7 Months', icon: 'star', type: 'months' },
        { months: 8, title: '8 Months', icon: 'medal', type: 'months' },
        { months: 9, title: '9 Months', icon: 'gem', type: 'months' },
        { months: 10, title: '10 Months', icon: 'flower', type: 'months' },
        { months: 11, title: '11 Months', icon: 'gift', type: 'months' },
        { years: 1, title: '1 Year', icon: 'cake', type: 'years' },
        { days: 400, title: '400 Days', icon: 'star', type: 'days' },
        { days: 500, title: '500 Days', icon: 'award', type: 'days' },
        { years: 2, title: '2 Years', icon: 'crown', type: 'years' },
        { days: 1000, title: '1000 Days', icon: 'medal', type: 'days' },
        { years: 3, title: '3 Years', icon: 'zap', type: 'years' },
        { years: 4, title: '4 Years', icon: 'star', type: 'years' },
        { years: 5, title: '5 Years', icon: 'sparkles', type: 'years' },
        { days: 2000, title: '2000 Days', icon: 'trophy', type: 'days' },
        { years: 6, title: '6 Years', icon: 'crown', type: 'years' },
        { years: 7, title: '7 Years', icon: 'star', type: 'years' },
        { years: 8, title: '8 Years', icon: 'sparkles', type: 'years' },
        { years: 9, title: '9 Years', icon: 'medal', type: 'years' },
        { years: 10, title: '10 Years', icon: 'crown', type: 'years' },
        { days: 5000, title: '5000 Days', icon: 'diamond', type: 'days' }
    ];

    // Add more yearly milestones dynamically (11-20 years)
    for (let year = 11; year <= 20; year++) {
        milestones.push({
            years: year,
            title: `${year} Years`,
            icon: 'star',
            type: 'years'
        });
    }

    // Calculate milestone dates and actual days for each milestone
    const processedMilestones = milestones.map(milestone => {
        let milestoneDate = new Date(startDate);
        let milestoneDays;

        if (milestone.type === 'years') {
            // YEARS: Use date arithmetic (handles leap years automatically)
            // Feb 3, 2023 + 3 years = Feb 3, 2026
            milestoneDate.setFullYear(startDate.getFullYear() + milestone.years);
            milestoneDate.setHours(0, 0, 0, 0);
            // Calculate day number: Feb 3, 2023 (Day 1) to Feb 3, 2026 (Day 1097)
            // We include BOTH the start date and end date in the count
            const diffTime = milestoneDate - startDate;
            const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
            milestoneDays = daysDiff + 1; // +1 because Day 1 is the start date itself
        } else if (milestone.type === 'months') {
            // MONTHS: Use date arithmetic
            // Feb 3, 2023 + 4 months = June 3, 2023
            milestoneDate.setMonth(startDate.getMonth() + milestone.months);
            milestoneDate.setHours(0, 0, 0, 0);
            // Calculate day number including both start and end date
            const diffTime = milestoneDate - startDate;
            const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
            milestoneDays = daysDiff + 1; // +1 because Day 1 is the start date itself
        } else {
            // DAYS: For pure day milestones, it's just the day number
            milestoneDays = milestone.days;
            // Calculate the actual calendar date for this day number
            const tempStart = new Date(startDate);
            tempStart.setHours(0, 0, 0, 0);
            milestoneDate = new Date(tempStart.getTime() + (milestone.days - 1) * 24 * 60 * 60 * 1000);
        }

        return {
            ...milestone,
            days: milestoneDays, // Store the calculated days
            date: milestoneDate
        };
    });

    // Sort milestones by calculated days to ensure proper order
    processedMilestones.sort((a, b) => a.days - b.days);

    // Use the correct timezone-aware calculation
    const daysSober = calculateSobrietyDays(sobrietyDate);

    return processedMilestones.map(milestone => {
        return {
            ...milestone,
            icon: iconEmoji[milestone.icon] || milestone.icon, // Convert to emoji
            achieved: daysSober >= milestone.days,
            isToday: daysSober === milestone.days,
            isTomorrow: daysSober === (milestone.days - 1),
            daysUntil: milestone.days - daysSober,
            type: 'recovery' // Mark as recovery milestone
        };
    });
};

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================

// Show a toast notification with haptic feedback
const showNotification = (message, type = 'info') => {
    // Trigger haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [10, 50, 10] : type === 'error' ? [50, 100, 50] : 10);
    }

    // Create notification container
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: var(--space-4);
        right: var(--space-4);
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-info)'};
        color: white;
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        alignItems: center;
        gap: var(--space-3);
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;

    // Add icon based on type
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info');
    icon.style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';

    // Add message text
    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'font-size: var(--font-sm); font-weight: 500;';

    notification.appendChild(icon);
    notification.appendChild(text);
    document.body.appendChild(notification);

    // Initialize icon
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// ============================================================
// GOOGLE CALENDAR TOKEN ENCRYPTION
// ============================================================

// Simple encryption for token storage
// REFACTORED: Now accepts userId as parameter instead of closure
const encryptToken = (token, userId) => {
    try {
        // Base64 encode with user-specific salt
        const salt = userId.substring(0, 8);
        const combined = salt + token + salt;
        return btoa(combined);
    } catch (error) {
        return token; // Fallback to plain if encryption fails
    }
};

// Simple decryption for token retrieval
// REFACTORED: Now accepts userId as parameter instead of closure
const decryptToken = (encryptedToken, userId) => {
    try {
        // Base64 decode and remove user-specific salt
        const decoded = atob(encryptedToken);
        const salt = userId.substring(0, 8);
        // Remove salt from beginning and end
        const token = decoded.substring(salt.length, decoded.length - salt.length);
        return token;
    } catch (error) {
        return encryptedToken; // Fallback to returning as-is if decryption fails
    }
};

// ============================================================
// HAPTIC FEEDBACK
// ============================================================

// Trigger haptic feedback on supported devices
const triggerHaptic = (intensity = 'light') => {
    if (!navigator.vibrate) return;

    switch (intensity) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(20);
            break;
        case 'heavy':
            navigator.vibrate(50);
            break;
        case 'success':
            navigator.vibrate([10, 50, 10]);
            break;
        case 'error':
            navigator.vibrate([50, 100, 50]);
            break;
        default:
            navigator.vibrate(10);
    }
};

// ============================================================
// NAMESPACE EXPOSURE
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.utils = {
    calculateSobrietyDays,
    getRecoveryMilestones,
    showNotification,
    encryptToken,
    decryptToken,
    triggerHaptic
};

console.log(' utils.js loaded - 6 utility functions available');
// ============================================================
// GLRS LIGHTHOUSE - STATE MANAGEMENT
// ============================================================
// Session and local storage utilities
// Provides state persistence across page reloads
// ============================================================

window.GLRSApp = window.GLRSApp || {};

// ============================================================
// STATE PERSISTENCE UTILITIES
// ============================================================

window.GLRSApp.state = {

    // --------------------------------------------------------
    // SESSION STORAGE (temporary - clears on browser close)
    // --------------------------------------------------------

    // Save page state to sessionStorage
    savePageState: (key, value) => {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving page state:', error);
            return false;
        }
    },

    // Restore page state from sessionStorage
    restorePageState: (key, defaultValue = null) => {
        try {
            const serialized = sessionStorage.getItem(key);
            if (serialized === null) {
                return defaultValue;
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error restoring page state:', error);
            return defaultValue;
        }
    },

    // Clear specific page state
    clearPageState: (key) => {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error clearing page state:', error);
            return false;
        }
    },

    // Clear all page state
    clearAllPageState: () => {
        try {
            sessionStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing all page state:', error);
            return false;
        }
    },

    // --------------------------------------------------------
    // LOCAL STORAGE (persistent - survives browser close)
    // --------------------------------------------------------

    // Save user preference to localStorage
    savePreference: (key, value) => {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(`glrs_${key}`, serialized);
            return true;
        } catch (error) {
            console.error('Error saving preference:', error);
            return false;
        }
    },

    // Get user preference from localStorage
    getPreference: (key, defaultValue = null) => {
        try {
            const serialized = localStorage.getItem(`glrs_${key}`);
            if (serialized === null) {
                return defaultValue;
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Error getting preference:', error);
            return defaultValue;
        }
    },

    // Clear specific preference
    clearPreference: (key) => {
        try {
            localStorage.removeItem(`glrs_${key}`);
            return true;
        } catch (error) {
            console.error('Error clearing preference:', error);
            return false;
        }
    },

    // Clear all preferences
    clearAllPreferences: () => {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('glrs_'));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Error clearing all preferences:', error);
            return false;
        }
    },

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------

    // Check if storage is available
    isStorageAvailable: (type = 'localStorage') => {
        try {
            const storage = window[type];
            const test = '__storage_test__';
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
};

console.log(' state.js loaded - State persistence utilities available');
// ============================================================
// GLRS LIGHTHOUSE - CALCULATION FUNCTIONS
// ============================================================
// Pure calculation functions extracted from PIRapp.js
// Exported to window.GLRSApp.calculations
// ============================================================

window.GLRSApp = window.GLRSApp || {};

// ============================================================
// GOAL STATISTICS
// ============================================================

const calculateGoalStats = (history) => {
    if (history.length === 0) {
        setGoalStats({
            completionRate: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalGoals: 0
        });
        return;
    }

    const completedGoals = history.filter(g => g.status === 'yes' || g.status === 'almost').length;
    const completionRate = Math.round((completedGoals / history.length) * 100);

    // Calculate current streak (consecutive successful goals)
    let currentStreak = 0;
    for (const goal of history) {
        if (goal.status === 'yes' || goal.status === 'almost') {
            currentStreak++;
        } else {
            break;
        }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    for (const goal of history) {
        if (goal.status === 'yes' || goal.status === 'almost') {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    setGoalStats({
        completionRate,
        currentStreak,
        bestStreak,
        totalGoals: history.length
    });
};

// ============================================================
// CHECK-IN STREAKS
// ============================================================

const calculateStreaks = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch ALL check-ins
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'asc')
            .get();

        // Group check-ins by date
        const checkInsByDate = {};
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

            const year = checkInUserTZ.getFullYear();
            const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
            const day = String(checkInUserTZ.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            checkInsByDate[dateKey] = true;
        });

        // Get all dates with check-ins, sorted
        const datesWithCheckIns = Object.keys(checkInsByDate).sort();

        if (datesWithCheckIns.length === 0) {
            setStreakData({ longestStreak: 0, currentStreak: 0, allStreaks: [] });
            return;
        }

        // Find all streaks
        const allStreaks = [];
        let currentStreakStart = datesWithCheckIns[0];
        let currentStreakEnd = datesWithCheckIns[0];

        for (let i = 1; i < datesWithCheckIns.length; i++) {
            const prevDate = new Date(datesWithCheckIns[i - 1]);
            const currDate = new Date(datesWithCheckIns[i]);

            // Calculate day difference
            const diffTime = currDate - prevDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                // Consecutive day - extend current streak
                currentStreakEnd = datesWithCheckIns[i];
            } else {
                // Streak broken - save current streak
                const streakStart = new Date(currentStreakStart);
                const streakEnd = new Date(currentStreakEnd);
                const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;

                allStreaks.push({
                    startDate: currentStreakStart,
                    endDate: currentStreakEnd,
                    length: streakLength
                });

                // Start new streak
                currentStreakStart = datesWithCheckIns[i];
                currentStreakEnd = datesWithCheckIns[i];
            }
        }

        // Add final streak
        const streakStart = new Date(currentStreakStart);
        const streakEnd = new Date(currentStreakEnd);
        const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;
        allStreaks.push({
            startDate: currentStreakStart,
            endDate: currentStreakEnd,
            length: streakLength
        });

        // Sort streaks by length (longest first)
        allStreaks.sort((a, b) => b.length - a.length);

        // Find current streak (last streak if it includes today)
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const lastStreak = allStreaks[allStreaks.length - 1];
        const currentStreak = lastStreak && lastStreak.endDate === todayKey ? lastStreak.length : 0;

        // Longest streak
        const longestStreak = allStreaks.length > 0 ? allStreaks[0].length : 0;

        setStreakData({
            longestStreak,
            currentStreak,
            allStreaks
        });

    } catch (error) {
    }
};

// ============================================================
// REFLECTION STREAKS
// ============================================================

const calculateReflectionStreaks = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch ALL check-ins with eveningData
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'asc')
            .get();

        // Group reflections by date (only check-ins with eveningData)
        const reflectionsByDate = {};
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            // Only count if it has eveningData (reflection)
            if (checkIn.eveningData) {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

                const year = checkInUserTZ.getFullYear();
                const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
                const day = String(checkInUserTZ.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${day}`;

                reflectionsByDate[dateKey] = true;
            }
        });

        // Get all dates with reflections, sorted
        const datesWithReflections = Object.keys(reflectionsByDate).sort();

        if (datesWithReflections.length === 0) {
            setReflectionStreakData({ longestStreak: 0, currentStreak: 0, allStreaks: [] });
            return;
        }

        // Find all streaks
        const allStreaks = [];
        let currentStreakStart = datesWithReflections[0];
        let currentStreakEnd = datesWithReflections[0];

        for (let i = 1; i < datesWithReflections.length; i++) {
            const prevDate = new Date(datesWithReflections[i - 1]);
            const currDate = new Date(datesWithReflections[i]);

            // Calculate day difference
            const diffTime = currDate - prevDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                // Consecutive day - extend current streak
                currentStreakEnd = datesWithReflections[i];
            } else {
                // Streak broken - save current streak
                const streakStart = new Date(currentStreakStart);
                const streakEnd = new Date(currentStreakEnd);
                const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;

                allStreaks.push({
                    startDate: currentStreakStart,
                    endDate: currentStreakEnd,
                    length: streakLength
                });

                // Start new streak
                currentStreakStart = datesWithReflections[i];
                currentStreakEnd = datesWithReflections[i];
            }
        }

        // Add final streak
        const streakStart = new Date(currentStreakStart);
        const streakEnd = new Date(currentStreakEnd);
        const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;
        allStreaks.push({
            startDate: currentStreakStart,
            endDate: currentStreakEnd,
            length: streakLength
        });

        // Sort streaks by length (longest first)
        allStreaks.sort((a, b) => b.length - a.length);

        // Find current streak (last streak if it includes today)
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const lastStreak = allStreaks[allStreaks.length - 1];
        const currentStreak = lastStreak && lastStreak.endDate === todayKey ? lastStreak.length : 0;

        // Longest streak
        const longestStreak = allStreaks.length > 0 ? allStreaks[0].length : 0;

        setReflectionStreakData({
            longestStreak,
            currentStreak,
            allStreaks
        });

    } catch (error) {
    }
};

// Calculate milestones

// ============================================================
// MILESTONES
// ============================================================

const calculateMilestones = () => {
    try {
        if (!user.sobrietyDate) {
            return;
        }

        // Get sobriety date
        const startDate = new Date(user.sobrietyDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        // Calculate days sober
        const daysSober = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

        // Define all milestones
        const milestoneDefinitions = [
            { days: 7, label: '1 Week', icon: 'calendar' },
            { days: 14, label: '2 Weeks', icon: 'calendar' },
            { days: 21, label: '3 Weeks', icon: 'calendar' },
            { days: 30, label: '1 Month', icon: 'award' },
            { days: 60, label: '2 Months', icon: 'award' },
            { days: 90, label: '3 Months', icon: 'star' },
            { days: 180, label: '6 Months', icon: 'star' },
            { days: 365, label: '1 Year', icon: 'trophy' },
            { days: 547, label: '18 Months', icon: 'trophy' },
            { days: 730, label: '2 Years', icon: 'medal' },
            { days: 1095, label: '3 Years', icon: 'medal' },
            { days: 1825, label: '5 Years', icon: 'crown' },
            { days: 3650, label: '10 Years', icon: 'crown' }
        ];

        // Calculate milestone status
        const milestones = milestoneDefinitions.map(m => {
            const achieved = daysSober >= m.days;
            const daysUntil = m.days - daysSober;
            const milestoneDate = new Date(startDate);
            milestoneDate.setDate(milestoneDate.getDate() + m.days);

            return {
                ...m,
                achieved,
                daysUntil,
                date: milestoneDate,
                dateString: milestoneDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            };
        });

        // Find next milestone
        const upcomingMilestones = milestones.filter(m => !m.achieved);
        const next = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;

        // Calculate progress to next milestone
        if (next) {
            const previousMilestone = milestones.filter(m => m.achieved).slice(-1)[0];
            const startDays = previousMilestone ? previousMilestone.days : 0;
            const endDays = next.days;
            const currentProgress = daysSober - startDays;
            const totalRange = endDays - startDays;
            const progressPercentage = Math.round((currentProgress / totalRange) * 100);

            setNextMilestone({
                ...next,
                progressPercentage,
                daysSober
            });
        } else {
            // All milestones achieved!
            setNextMilestone({
                days: daysSober,
                label: 'All Milestones Complete!',
                icon: 'crown',
                achieved: true,
                daysUntil: 0,
                progressPercentage: 100,
                daysSober
            });
        }

        setAllMilestones(milestones);

    } catch (error) {
    }
};

// Save gratitude entry

// ============================================================
// TOTAL CHECK-INS
// ============================================================

const calculateTotalCheckIns = async () => {
    try {
        const checkInsSnap = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .get();
        
        let totalCount = 0;
        checkInsSnap.forEach(doc => {
            const data = doc.data();
            if (data.morningData) totalCount++;
            if (data.eveningData) totalCount++;
        });
        
        return totalCount;
    } catch (error) {
        return 0;
    }
};

// Handle daily pledge

// ============================================================
// EXPORTS
// ============================================================

window.GLRSApp.calculations = {
    calculateGoalStats,
    calculateStreaks,
    calculateReflectionStreaks,
    calculateMilestones,
    calculateTotalCheckIns
};

console.log('âœ… calculations.js loaded - 5 calculation functions available');
// ============================================================
// GLRS LIGHTHOUSE - STATIC DATA
// ============================================================
// Hardcoded arrays and configuration data
// Extracted from PIRapp.js for modularity
// ============================================================

// Coping techniques (31 daily techniques covering CBT/DBT/mindfulness)
const copingTechniques = [
    { day: 1, category: 'Breathing', title: 'Box Breathing', icon: 'wind', description: '1. Breathe in slowly for 4 counts\n2. Hold your breath for 4 counts\n3. Breathe out slowly for 4 counts\n4. Hold empty lungs for 4 counts\n5. Repeat for 5 minutes\n\nUsed by Navy SEALs to stay calm under pressure.' },
    { day: 2, category: 'Grounding', title: '5-4-3-2-1 Grounding', icon: 'eye', description: 'Notice and name aloud:\n\n5 things you can SEE\n4 things you can TOUCH\n3 things you can HEAR\n2 things you can SMELL\n1 thing you can TASTE\n\nBrings you back to the present moment when feeling overwhelmed.' },
    { day: 3, category: 'CBT', title: 'Thought Record', icon: 'file-text', description: '1. Write down the triggering situation\n2. Identify the automatic negative thought\n3. Note the emotions and intensity (1-10)\n4. Find evidence FOR the thought\n5. Find evidence AGAINST the thought\n6. Create a balanced alternative thought\n\nChallenges cognitive distortions.' },
    { day: 4, category: 'DBT', title: 'TIPP Skill', icon: 'thermometer', description: 'Temperature: Hold ice or splash cold water on face\nIntense exercise: Do 60 seconds of jumping jacks\nPaced breathing: Slow exhales longer than inhales\nProgressive muscle relaxation: Tense and release muscles\n\nQuickly reduces intense emotions in crisis.' },
    { day: 5, category: 'Mindfulness', title: 'Body Scan Meditation', icon: 'scan', description: '1. Lie down or sit comfortably\n2. Close your eyes\n3. Focus attention on your toes\n4. Slowly move awareness up through:\n   - Feet, ankles, calves, knees\n   - Thighs, hips, stomach\n   - Chest, shoulders, arms\n   - Neck, face, head\n5. Notice sensations without judgment\n\n10-minute practice.' },
    { day: 6, category: 'Anger Management', title: 'Timeout Technique', icon: 'pause-circle', description: '1. Notice anger rising (physical cues)\n2. Say "I need a timeout" out loud\n3. Leave the situation for 20 minutes\n4. Do calming activity (walk, breathe, music)\n5. Return when calm enough to discuss\n\nPrevents regrettable angry outbursts.' },
    { day: 7, category: 'Anxiety', title: 'Worry Time Schedule', icon: 'clock', description: '1. Schedule 15 minutes daily for worrying\n2. When worries arise during day, write them down\n3. Tell yourself "I\'ll think about this at 3pm"\n4. During worry time, review list and problem-solve\n5. After 15 minutes, close the list\n\nContains anxiety to specific time.' },
    { day: 8, category: 'Breathing', title: '4-7-8 Breathing', icon: 'wind', description: '1. Exhale completely through mouth\n2. Close mouth, inhale through nose for 4 counts\n3. Hold breath for 7 counts\n4. Exhale completely through mouth for 8 counts\n5. Repeat 4 cycles\n\nDr. Andrew Weil\'s natural tranquilizer.' },
    { day: 9, category: 'Grounding', title: 'Physical Grounding', icon: 'anchor', description: '1. Plant both feet firmly on ground\n2. Press feet down, feel the floor\n3. Notice the weight of your body\n4. Touch something nearby (wall, chair)\n5. Feel the texture and temperature\n6. Say "I am here, I am safe"\n\nAnchors you when dissociating.' },
    { day: 10, category: 'CBT', title: 'Cognitive Reframing', icon: 'refresh-cw', description: 'OLD THOUGHT: "I\'m a total failure"\nREFRAME: "I made a mistake, and I can learn from it"\n\nOLD: "Nobody likes me"\nREFRAME: "Some people like me, I can build connections"\n\nOLD: "I can\'t handle this"\nREFRAME: "This is hard, but I\'ve handled hard things before"\n\nReplace absolutes with balanced thoughts.' },
    { day: 11, category: 'DBT', title: 'STOP Skill', icon: 'octagon', description: 'S - STOP: Freeze, don\'t react\nT - TAKE A STEP BACK: Get space from situation\nO - OBSERVE: Notice thoughts, feelings, facts\nP - PROCEED MINDFULLY: What\'s effective here?\n\nPrevents impulsive reactions.' },
    { day: 12, category: 'Mindfulness', title: 'Mindful Walking', icon: 'footprints', description: '1. Walk slowly and deliberately\n2. Notice the sensation of each foot lifting\n3. Feel your foot moving through air\n4. Notice the foot touching ground\n5. Feel weight shifting to that foot\n6. Repeat with other foot\n\nWalk for 10 minutes focusing only on steps.' },
    { day: 13, category: 'Anger Management', title: 'Anger Ladder', icon: 'bar-chart-2', description: 'Rate your anger 1-10:\n\n1-3: Annoyed (deep breath, let it go)\n4-6: Frustrated (take a break, talk it out)\n7-8: Angry (use timeout, physical activity)\n9-10: Furious (immediate safety plan, call support)\n\nKnow your number, match your response.' },
    { day: 14, category: 'Anxiety', title: 'Progressive Muscle Relaxation', icon: 'activity', description: '1. Tense fists for 5 seconds, release\n2. Tense arms for 5 seconds, release\n3. Tense shoulders for 5 seconds, release\n4. Tense face for 5 seconds, release\n5. Tense stomach for 5 seconds, release\n6. Tense legs for 5 seconds, release\n7. Tense feet for 5 seconds, release\n\nReleases physical tension from anxiety.' },
    { day: 15, category: 'Breathing', title: 'Diaphragmatic Breathing', icon: 'wind', description: '1. Place one hand on chest, one on belly\n2. Breathe in through nose for 4 counts\n3. Belly should rise, chest stays still\n4. Exhale through mouth for 6 counts\n5. Belly should fall\n6. Repeat for 5 minutes\n\nActivates parasympathetic nervous system.' },
    { day: 16, category: 'Grounding', title: 'Categories Game', icon: 'list', description: 'Choose a category and name items:\n\n- 10 US states\n- 10 animals\n- 10 foods\n- 10 movies\n- 10 song titles\n\nSay them out loud. Engages logical brain, reduces emotional overwhelm.' },
    { day: 17, category: 'CBT', title: 'Decatastrophizing', icon: 'alert-triangle', description: 'WORST CASE: What\'s the absolute worst that could happen?\nBEST CASE: What\'s the best possible outcome?\nMOST LIKELY: What will probably actually happen?\n\nReality is usually in the middle. Reduces catastrophic thinking.' },
    { day: 18, category: 'DBT', title: 'DEAR MAN', icon: 'message-square', description: 'Describe the situation\nExpress your feelings\nAssert your needs\nReinforce (why they should help)\n\nstay Mindful (don\'t get distracted)\nAppear confident\nNegotiate (be willing to compromise)\n\nEffective interpersonal communication.' },
    { day: 19, category: 'Mindfulness', title: 'Mindful Eating', icon: 'coffee', description: '1. Choose one food (raisin, chocolate, fruit)\n2. Look at it closely for 30 seconds\n3. Smell it for 30 seconds\n4. Feel the texture for 30 seconds\n5. Place in mouth without chewing (30 sec)\n6. Chew slowly, noticing flavors\n7. Swallow mindfully\n\nPractices being fully present.' },
    { day: 20, category: 'Anger Management', title: 'Opposite Action', icon: 'repeat', description: 'When anger urges you to:\n\nYELL â†’ Speak softly\nATTACK â†’ Step away\nBLAME â†’ Take responsibility\nBREAK THINGS â†’ Hold something gently\n\nDoing the opposite reduces anger\'s intensity.' },
    { day: 21, category: 'Anxiety', title: 'Exposure Ladder', icon: 'trending-up', description: '1. List feared situation (1-10 difficulty)\n2. Start with easiest (difficulty 2-3)\n3. Face that situation repeatedly\n4. When anxiety drops 50%, move to next step\n5. Gradually work up the ladder\n\nGradual exposure builds confidence.' },
    { day: 22, category: 'Breathing', title: 'Alternate Nostril Breathing', icon: 'wind', description: '1. Close right nostril with thumb\n2. Inhale through left nostril (4 counts)\n3. Close left nostril with ring finger\n4. Exhale through right nostril (4 counts)\n5. Inhale through right nostril (4 counts)\n6. Switch, exhale through left\n7. Repeat 5 minutes\n\nBalances nervous system.' },
    { day: 23, category: 'Grounding', title: 'Safe Place Visualization', icon: 'home', description: '1. Close your eyes\n2. Picture a place where you feel completely safe\n3. Notice every detail: colors, sounds, smells\n4. Feel the safety in your body\n5. Create a cue word (e.g., "beach")\n6. Practice daily\n7. Use cue word in crisis\n\nMental safe space always available.' },
    { day: 24, category: 'CBT', title: 'Cost-Benefit Analysis', icon: 'scale', description: 'For any belief or behavior:\n\nCOSTS:\n- What are the disadvantages?\n- What does it cost me?\n\nBENEFITS:\n- What are the advantages?\n- What do I gain?\n\nMakes unconscious patterns conscious.' },
    { day: 25, category: 'DBT', title: 'Radical Acceptance', icon: 'check-circle', description: 'What it is:\n- Accepting reality as it is\n- Not approving or liking it\n- Stopping the fight with reality\n\n"I can\'t change what happened, AND I can choose how I respond now."\n\nReduces suffering from non-acceptance.' },
    { day: 26, category: 'Mindfulness', title: 'Loving-Kindness Meditation', icon: 'heart', description: 'Repeat silently:\n\n"May I be safe\nMay I be healthy\nMay I be happy\nMay I live with ease"\n\nThen wish same for:\n- Someone you love\n- Someone neutral\n- Someone difficult\n- All beings\n\nBuilds self-compassion.' },
    { day: 27, category: 'Anger Management', title: 'Anger Journal', icon: 'book', description: 'After anger episode, write:\n\n1. TRIGGER: What happened right before?\n2. THOUGHTS: What was I thinking?\n3. FEELINGS: What did I feel in my body?\n4. ACTIONS: What did I do?\n5. CONSEQUENCES: What happened as a result?\n6. ALTERNATIVE: What could I do differently?\n\nIdentifies patterns over time.' },
    { day: 28, category: 'Anxiety', title: 'Thought Stopping', icon: 'x-circle', description: '1. When anxious thought starts, yell "STOP!" (or picture a stop sign)\n2. Snap a rubber band on wrist (or clap)\n3. Replace with planned positive thought\n4. Engage in physical activity\n\nInterrupts rumination cycle.' },
    { day: 29, category: 'Breathing', title: 'Resonant Breathing', icon: 'wind', description: '1. Breathe at rate of 6 breaths per minute\n2. Inhale for 5 seconds\n3. Exhale for 5 seconds\n4. Keep rhythm steady\n5. Practice for 10-20 minutes\n\nOptimizes heart rate variability, reduces stress.' },
    { day: 30, category: 'Grounding', title: 'Cold Water Grounding', icon: 'droplet', description: '1. Hold ice cube in your hand\n2. Splash cold water on your face\n3. Take a cold shower\n4. Drink ice water slowly\n\nPhysical sensation brings immediate presence. Activates dive reflex, calms nervous system.' },
    { day: 31, category: 'CBT', title: 'Evidence Gathering', icon: 'search', description: 'BELIEF: "Everyone thinks I\'m incompetent"\n\nEVIDENCE FOR:\n- (list objective facts only)\n\nEVIDENCE AGAINST:\n- (list objective facts only)\n\nNEW BALANCED BELIEF:\n- Based on all evidence\n\nTests beliefs against reality.' }
];

// Gratitude themes (12 categories)
const gratitudeThemes = [
    { id: 'relationships', label: 'Relationships', icon: 'users', color: '#FF6B6B' },
    { id: 'health', label: 'Health & Wellness', icon: 'heart', color: '#4ECDC4' },
    { id: 'nature', label: 'Nature & Environment', icon: 'sun', color: '#95E1D3' },
    { id: 'personal', label: 'Personal Growth', icon: 'trending-up', color: '#F38181' },
    { id: 'moments', label: 'Small Moments', icon: 'smile', color: '#FFD93D' },
    { id: 'opportunities', label: 'Opportunities', icon: 'target', color: '#6BCB77' },
    { id: 'comfort', label: 'Comfort & Safety', icon: 'shield', color: '#4D96FF' },
    { id: 'accomplishments', label: 'Accomplishments', icon: 'award', color: '#9D84B7' },
    { id: 'support', label: 'Support & Help', icon: 'life-buoy', color: '#FFA500' },
    { id: 'creativity', label: 'Creativity & Expression', icon: 'palette', color: '#E74C3C' },
    { id: 'simple', label: 'Simple Pleasures', icon: 'coffee', color: '#795548' },
    { id: 'other', label: 'Other', icon: 'more-horizontal', color: '#999999' }
];

// ============================================================
// NAMESPACE EXPOSURE
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.staticData = {
    copingTechniques,
    gratitudeThemes
};

console.log('âœ… staticData.js loaded - Coping techniques and gratitude themes available');
