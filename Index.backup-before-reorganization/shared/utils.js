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
