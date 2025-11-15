// ═══════════════════════════════════════════════════════════
// TOUCH HANDLERS - Journey Tab Carousel Swipe Gestures
// Handles swipe gestures for Life, Finances, and Wellness carousels
// ═══════════════════════════════════════════════════════════

// ==========================================
// LIFE TAB TOUCH HANDLERS
// ==========================================

const createLifeTouchHandlers = (
    lifeTouchStart,
    lifeTouchEnd,
    lifeCardIndex,
    setLifeTouchStart,
    setLifeTouchEnd,
    setLifeIsDragging,
    setLifeCardIndex
) => {
    const handleLifeTouchStart = (e) => {
        setLifeTouchStart(e.targetTouches[0].clientX);
        setLifeIsDragging(true);
    };

    const handleLifeTouchMove = (e) => {
        setLifeTouchEnd(e.targetTouches[0].clientX);
    };

    const handleLifeTouchEnd = () => {
        if (!lifeTouchStart || !lifeTouchEnd) return;

        const distance = lifeTouchStart - lifeTouchEnd;
        const threshold = 50; // Minimum swipe distance

        if (distance > threshold && lifeCardIndex < 2) {
            // Swipe left - next card
            setLifeCardIndex(lifeCardIndex + 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        } else if (distance < -threshold && lifeCardIndex > 0) {
            // Swipe right - previous card
            setLifeCardIndex(lifeCardIndex - 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        }

        setLifeIsDragging(false);
        setLifeTouchStart(0);
        setLifeTouchEnd(0);
    };

    return {
        handleLifeTouchStart,
        handleLifeTouchMove,
        handleLifeTouchEnd
    };
};

// ==========================================
// FINANCES TAB TOUCH HANDLERS
// ==========================================

const createFinancesTouchHandlers = (
    financesTouchStart,
    financesTouchEnd,
    financesCardIndex,
    setFinancesTouchStart,
    setFinancesTouchEnd,
    setFinancesIsDragging,
    setFinancesCardIndex
) => {
    const handleFinancesTouchStart = (e) => {
        setFinancesTouchStart(e.targetTouches[0].clientX);
        setFinancesIsDragging(true);
    };

    const handleFinancesTouchMove = (e) => {
        setFinancesTouchEnd(e.targetTouches[0].clientX);
    };

    const handleFinancesTouchEnd = () => {
        if (!financesTouchStart || !financesTouchEnd) return;

        const distance = financesTouchStart - financesTouchEnd;
        const threshold = 50;

        if (distance > threshold && financesCardIndex < 2) {
            setFinancesCardIndex(financesCardIndex + 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        } else if (distance < -threshold && financesCardIndex > 0) {
            setFinancesCardIndex(financesCardIndex - 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        }

        setFinancesIsDragging(false);
        setFinancesTouchStart(0);
        setFinancesTouchEnd(0);
    };

    return {
        handleFinancesTouchStart,
        handleFinancesTouchMove,
        handleFinancesTouchEnd
    };
};

// ==========================================
// WELLNESS TAB TOUCH HANDLERS
// ==========================================

const createWellnessTouchHandlers = (
    wellnessTouchStart,
    wellnessTouchEnd,
    wellnessCardIndex,
    setWellnessTouchStart,
    setWellnessTouchEnd,
    setWellnessIsDragging,
    setWellnessCardIndex
) => {
    const handleWellnessTouchStart = (e) => {
        setWellnessTouchStart(e.targetTouches[0].clientX);
        setWellnessIsDragging(true);
    };

    const handleWellnessTouchMove = (e) => {
        setWellnessTouchEnd(e.targetTouches[0].clientX);
    };

    const handleWellnessTouchEnd = () => {
        if (!wellnessTouchStart || !wellnessTouchEnd) return;

        const distance = wellnessTouchStart - wellnessTouchEnd;
        const threshold = 50;

        if (distance > threshold && wellnessCardIndex < 2) {
            setWellnessCardIndex(wellnessCardIndex + 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        } else if (distance < -threshold && wellnessCardIndex > 0) {
            setWellnessCardIndex(wellnessCardIndex - 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        }

        setWellnessIsDragging(false);
        setWellnessTouchStart(0);
        setWellnessTouchEnd(0);
    };

    return {
        handleWellnessTouchStart,
        handleWellnessTouchMove,
        handleWellnessTouchEnd
    };
};

// Register handlers globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.touchHandlers = {
    createLifeTouchHandlers,
    createFinancesTouchHandlers,
    createWellnessTouchHandlers
};

console.log('✅ Touch handlers loaded');
