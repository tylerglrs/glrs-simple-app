// ============================================================
// GLRS LIGHTHOUSE - HELPER UTILITIES
// ============================================================
// Shared utility functions used across the app
// Part of modular architecture - provides common utilities
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.utils = window.GLRSApp.utils || {};

// ============================================================
// SOBRIETY DATE CALCULATIONS
// ============================================================

// Calculate sobriety days from a sobriety date string (YYYY-MM-DD)
// DST-proof calculation using UTC conversion
window.GLRSApp.utils.getSobrietyDays = (sobrietyDate) => {
    if (!sobrietyDate) return 0;

    // Parse as LOCAL date
    const [year, month, day] = sobrietyDate.split('-');
    const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIXED: Convert both to UTC to avoid DST issues
    const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    // Calculate difference in milliseconds (now DST-proof)
    const diffTime = todayUTC - sobrietyUTC;

    // Convert to days and add 1 (sobriety date counts as day 1)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Return at least 1 if sobriety date is today or in the past
    return Math.max(1, diffDays);
};

// ============================================================
// HAPTIC FEEDBACK
// ============================================================

// Trigger haptic feedback on supported devices
window.GLRSApp.utils.triggerHaptic = (type = 'light') => {
    if (!navigator.vibrate) return;

    switch (type) {
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
// NOTIFICATION SYSTEM
// ============================================================

// Show a toast notification with haptic feedback
window.GLRSApp.utils.showNotification = (message, type = 'info') => {
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
        align-items: center;
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
// BACKWARD COMPATIBILITY
// ============================================================

// Maintain global references for backward compatibility
window.getSobrietyDays = window.GLRSApp.utils.getSobrietyDays;
window.triggerHaptic = window.GLRSApp.utils.triggerHaptic;
window.showNotification = window.GLRSApp.utils.showNotification;

console.log('✅ helpers.js loaded - Utility functions available');
