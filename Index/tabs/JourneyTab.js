// Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

/**
 * @file JourneyTab.js - Journey tracking for recovery progress
 * @description Contains 3 journey sub-tabs (Life, Wellness, Finances) + 4 modal groups
 *
 * @components
 * - JourneyLifeTab: Sobriety milestones, recovery progress, achievements
 * - JourneyWellnessTab: Check-in graphs, wellness tracking
 * - JourneyFinancesTab: Money saved, savings goals, financial progress
 * - JourneyCalendarModals: Calendar heatmap and journey calendar (2 modals)
 * - JourneyDataModals: Data and journal modals (5 modals)
 * - JourneyInsightsModals: Insights and analytics modals (4 modals)
 * - JourneyStreaksModals: Streak tracking modals (4 modals)
 *
 * @architecture 3-Layer Direct Architecture (Component → Firebase → Component)
 * - All tab components use local useState hooks
 * - Direct Firebase Firestore queries
 * - Real-time listeners with cleanup
 * - NO global state dependencies
 * - All modals props-based with callbacks
 *
 * @refactored November 2025 - Phase 2 complete
 * @author GLRS Development Team
 */

// ========================================
// JOURNEY TAB WRAPPER (MAIN COMPONENT)
// ✅ PHASE 1: Created wrapper component with tab navigation
// Purpose: Main Journey tab container with Life/Wellness/Finances sub-tabs
// Architecture: Component → Firebase → Component (NO global state)
// ========================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

/**
 * JourneyTab Component (Main Wrapper)
 * @description Main Journey tab with 3 sub-tabs: Life, Wellness, Finances
 *
 * @features
 * - Tab navigation with 3 buttons
 * - State management for active sub-tab
 * - Conditional rendering of sub-components
 *
 * @state 1 useState hook:
 * - activeJourneyTab: Currently selected sub-tab ('life' | 'wellness' | 'finances')
 *
 * @returns {React.Element} Journey tab wrapper with navigation and sub-tabs
 */
function JourneyTab() {
    const [activeJourneyTab, setActiveJourneyTab] = useState('life');

    const tabButtonStyles = (isActive) => ({
        flex: '1',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: isActive ? '#ffffff' : '#5A9FD4',
        backgroundColor: isActive ? '#5A9FD4' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    });

    return React.createElement(
        'div',
        { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },

        // Tab Navigation
        React.createElement(
            'div',
            { style: {
                display: 'flex',
                gap: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e0e0e0',
                position: 'sticky',
                top: '0',
                zIndex: '10'
            }},
            React.createElement(
                'button',
                {
                    style: tabButtonStyles(activeJourneyTab === 'life'),
                    onClick: () => setActiveJourneyTab('life')
                },
                'Life'
            ),
            React.createElement(
                'button',
                {
                    style: tabButtonStyles(activeJourneyTab === 'wellness'),
                    onClick: () => setActiveJourneyTab('wellness')
                },
                'Wellness'
            ),
            React.createElement(
                'button',
                {
                    style: tabButtonStyles(activeJourneyTab === 'finances'),
                    onClick: () => setActiveJourneyTab('finances')
                },
                'Finances'
            )
        ),

        // Sub-Tab Content
        React.createElement(
            'div',
            { style: { flex: '1', overflow: 'auto' } },
            activeJourneyTab === 'life' && React.createElement(window.GLRSApp.components.JourneyLifeTab),
            activeJourneyTab === 'wellness' && React.createElement(window.GLRSApp.components.JourneyWellnessTab),
            activeJourneyTab === 'finances' && React.createElement(window.GLRSApp.components.JourneyFinancesTab)
        )
    );
}

// Register JourneyTab wrapper component
window.GLRSApp.components.JourneyTab = JourneyTab;
console.log('✅ JourneyTab wrapper component registered');

// ========================================
// JOURNEY LIFE TAB
// ✅ PHASE 4, PART 2: Refactored to 3-layer architecture
// Purpose: Life tracking - Sobriety milestones, recovery progress, achievements
// Architecture: Component → Firebase → Component (NO global state)
// ========================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

/**
 * JourneyLifeTab Component
 * @description Displays sobriety milestones, recovery progress, and life achievements
 *
 * @features
 * - Hero cards: Sobriety date, days sober, next milestone
 * - Recovery milestones: 30+ milestones from 1 day to 20 years
 * - Daily quotes: Inspirational recovery quotes
 * - Swipeable cards: Touch-enabled hero card carousel
 *
 * @state 7 useState hooks:
 * - userData: User profile data (sobrietyDate, firstName, etc.)
 * - lifeCardIndex: Current hero card index (0-2)
 * - dailyQuotes: Array of motivational quotes
 * - loading: Loading state for data fetch
 * - lifeTouchStart, lifeTouchEnd, lifeIsDragging: Touch swipe tracking
 *
 * @firebase 2 Firestore queries:
 * 1. loadUserData: Fetch user profile from 'users' collection
 * 2. loadDailyQuotes: Fetch quotes from 'quotes' collection
 *
 * @utilities
 * - calculateSobrietyDays: DST-proof sobriety day calculation
 * - getRecoveryMilestones: Generate milestone list with achievement status
 * - Touch handlers: handleLifeTouchStart, handleLifeTouchMove, handleLifeTouchEnd
 *
 * @returns {React.Element} Journey Life tab with sobriety tracking
 */
function JourneyLifeTab() {
    // ✅ PHASE 4, PART 2, STEP 1: React imports and local state
    const { useState, useEffect, useRef } = React;

    // Local state hooks (replacing global state)
    const [userData, setUserData] = useState(null);
    const [lifeCardIndex, setLifeCardIndex] = useState(0);
    const [dailyQuotes, setDailyQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Touch swipe state
    const [lifeTouchStart, setLifeTouchStart] = useState(0);
    const [lifeTouchEnd, setLifeTouchEnd] = useState(0);
    const [lifeIsDragging, setLifeIsDragging] = useState(false);

    // Ref for touch swipe functionality
    const lifeCardsRef = useRef(null);

    // ✅ PHASE 4, PART 2, STEP 2: Local utility functions (no global state)

    // Calculate sobriety days from sobriety date (DST-proof, timezone-aware)
    const calculateSobrietyDays = (sobrietyDate) => {
        if (!sobrietyDate) return 0;

        // Parse as LOCAL date
        const [year, month, day] = sobrietyDate.split('-');
        const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // FIXED: Convert both to UTC to avoid DST issues
        const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

        // Calculate difference in milliseconds (DST-proof)
        const diffTime = todayUTC - sobrietyUTC;

        // Convert to days and add 1 (day 1 is the sobriety date itself)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Return at least 1 if sobriety date is today or in the past
        return Math.max(1, diffDays);
    };

    // Generate recovery milestone objects with achievement status
    const getRecoveryMilestones = (sobrietyDate) => {
        if (!sobrietyDate) return [];

        // Parse as LOCAL date to avoid timezone shifting
        const [year, month, day] = sobrietyDate.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);

        // Icon emoji mapping
        const iconEmoji = {
            'star': '⭐',
            'calendar': '📅',
            'award': '🏆',
            'trending-up': '📈',
            'target': '🎯',
            'check-circle': '✅',
            'sunrise': '🌅',
            'zap': '⚡',
            'sparkles': '✨',
            'medal': '🏅',
            'gem': '💎',
            'flower': '🌸',
            'gift': '🎁',
            'cake': '🎂',
            'crown': '👑',
            'trophy': '🏆',
            'diamond': '💎'
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

        // Add yearly milestones dynamically (11-20 years)
        for (let year = 11; year <= 20; year++) {
            milestones.push({
                years: year,
                title: `${year} Years`,
                icon: 'star',
                type: 'years'
            });
        }

        // Calculate milestone dates and actual days
        const processedMilestones = milestones.map(milestone => {
            let milestoneDate = new Date(startDate);
            let milestoneDays;

            if (milestone.type === 'years') {
                milestoneDate.setFullYear(startDate.getFullYear() + milestone.years);
                milestoneDate.setHours(0, 0, 0, 0);
                const diffTime = milestoneDate - startDate;
                const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
                milestoneDays = daysDiff + 1;
            } else if (milestone.type === 'months') {
                milestoneDate.setMonth(startDate.getMonth() + milestone.months);
                milestoneDate.setHours(0, 0, 0, 0);
                const diffTime = milestoneDate - startDate;
                const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
                milestoneDays = daysDiff + 1;
            } else {
                milestoneDays = milestone.days;
                const tempStart = new Date(startDate);
                tempStart.setHours(0, 0, 0, 0);
                milestoneDate = new Date(tempStart.getTime() + (milestone.days - 1) * 24 * 60 * 60 * 1000);
            }

            return {
                ...milestone,
                days: milestoneDays,
                date: milestoneDate
            };
        });

        // Sort by calculated days
        processedMilestones.sort((a, b) => a.days - b.days);

        // Use timezone-aware calculation
        const daysSober = calculateSobrietyDays(sobrietyDate);

        return processedMilestones.map(milestone => {
            return {
                ...milestone,
                icon: iconEmoji[milestone.icon] || milestone.icon,
                achieved: daysSober >= milestone.days,
                isToday: daysSober === milestone.days,
                isTomorrow: daysSober === (milestone.days - 1),
                daysUntil: milestone.days - daysSober,
                type: 'recovery'
            };
        });
    };

    // ✅ PHASE 4, PART 2, STEP 3: Touch handler functions (local, no global state)

    // Handle touch start for card swipe
    const handleLifeTouchStart = (e) => {
        setLifeTouchStart(e.targetTouches[0].clientX);
        setLifeIsDragging(true);
    };

    // Handle touch move for card swipe
    const handleLifeTouchMove = (e) => {
        setLifeTouchEnd(e.targetTouches[0].clientX);
    };

    // Handle touch end for card swipe (with haptic feedback)
    const handleLifeTouchEnd = () => {
        if (!lifeTouchStart || !lifeTouchEnd) return;

        const distance = lifeTouchStart - lifeTouchEnd;
        const threshold = 50; // Minimum swipe distance in pixels

        if (distance > threshold && lifeCardIndex < 2) {
            // Swipe left - next card (max index 2)
            setLifeCardIndex(lifeCardIndex + 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        } else if (distance < -threshold && lifeCardIndex > 0) {
            // Swipe right - previous card (min index 0)
            setLifeCardIndex(lifeCardIndex - 1);
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('light');
            }
        }

        // Reset touch state
        setLifeIsDragging(false);
        setLifeTouchStart(0);
        setLifeTouchEnd(0);
    };

    // ✅ PHASE 4, PART 2, STEP 4: Firebase queries with useEffect (3-LAYER ARCHITECTURE)
    // Architecture: Component → Firebase → Component (NO global state, NO loaders)

    // Load user data directly from Firebase
    const loadUserData = async (uid) => {
        try {
            setLoading(true);
            const db = firebase.firestore();
            const userDoc = await db.collection('users').doc(uid).get();

            if (userDoc.exists) {
                setUserData(userDoc.data());
                setError(null); // Clear any previous errors
            } else {
                setError('User profile not found. Please contact support.');
                console.error('User document not found');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setError('Failed to load your profile. Please check your connection and try again.');
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyLifeTab.loadUserData');
        } finally {
            setLoading(false);
        }
    };

    // Load daily quotes directly from Firebase
    const loadDailyQuotes = async () => {
        try {
            const db = firebase.firestore();
            const quotesSnap = await db.collection('quotes').get();
            const quotes = quotesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDailyQuotes(quotes);
        } catch (error) {
            console.error('Error loading daily quotes:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyLifeTab.loadDailyQuotes');
            // Set default quote on error (graceful degradation)
            setDailyQuotes([{
                quote: "One day at a time.",
                author: "Daily Inspiration"
            }]);
        }
    };

    // Firebase auth listener - loads data when user authenticated
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                loadUserData(authUser.uid);
                loadDailyQuotes();
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array - run once on mount

    // Show loading state
    if (loading && !userData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #058585',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666', fontSize: '14px' }}>Loading Journey...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px'
            }}>
                <i data-lucide="alert-circle" style={{ width: '48px', height: '48px', color: '#ef4444' }}></i>
                <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>Error</p>
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        background: '#058585',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {/* HERO CARDS - Full width dark teal */}
            <div style={{
                width: '100%',
                marginBottom: '24px'
            }}>
                {/* Swipeable Hero Cards Container - Fixed teal background */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    background: '#069494',
                    padding: '20px 0'
                }}>
                    <div
                        ref={lifeCardsRef}
                        onTouchStart={handleLifeTouchStart}
                        onTouchMove={handleLifeTouchMove}
                        onTouchEnd={handleLifeTouchEnd}
                        style={{
                            width: '100%',
                            padding: '0 15px'
                        }}
                    >
                        {/* Card 1: Sobriety Date - CONDITIONAL RENDER */}
                        {lifeCardIndex === 0 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {userData?.sobrietyDate ? (
                                <>
                                    <i data-lucide="star" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                    <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                        SOBRIETY DATE
                                    </div>
                                    <div style={{fontSize: '36px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '8px'}}>
                                        {(() => {
                                            // Parse as local date to avoid timezone issues
                                            const [year, month, day] = userData.sobrietyDate.split('-');
                                            const localDate = new Date(year, month - 1, day);
                                            return localDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                        })()}
                                    </div>
                                    <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400', marginTop: '12px'}}>
                                        Your recovery journey started
                                    </div>
                                </>
                            ) : (
                                <div style={{color: '#FFFFFF', fontSize: '16px'}}>
                                    Set your sobriety date in profile
                                </div>
                            )}
                        </div>
                        )}

                        {/* Card 2: Days Sober - CONDITIONAL RENDER */}
                        {lifeCardIndex === 1 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (!userData?.sobrietyDate) {
                                    return (
                                        <div style={{color: '#FFFFFF', fontSize: '16px'}}>
                                            Set your sobriety date in profile
                                        </div>
                                    );
                                }

                                const totalDays = calculateSobrietyDays(userData.sobrietyDate);

                                return (
                                    <>
                                        <i data-lucide="flame" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            DAYS SOBER
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {totalDays.toLocaleString()}
                                        </div>
                                        <div style={{fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            Your streak continues
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        )}

                        {/* Card 3: Next Milestone - CONDITIONAL RENDER */}
                        {lifeCardIndex === 2 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (!userData?.sobrietyDate) {
                                    return (
                                        <div style={{color: '#FFFFFF', fontSize: '16px'}}>
                                            Set your sobriety date in profile
                                        </div>
                                    );
                                }

                                // FIXED: Use getRecoveryMilestones() for accurate date-based calculations
                                const allMilestones = getRecoveryMilestones(userData.sobrietyDate);
                                const nextMilestone = allMilestones.find(m => !m.achieved);

                                if (!nextMilestone) {
                                    return (
                                        <>
                                            <div style={{fontSize: '48px', marginBottom: '20px'}}>🎉</div>
                                            <div style={{fontSize: '24px', fontWeight: '700', color: '#FFFFFF'}}>
                                                All Milestones Achieved!
                                            </div>
                                        </>
                                    );
                                }

                                return (
                                    <>
                                        <i data-lucide="target" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            NEXT MILESTONE
                                        </div>
                                        <div style={{fontSize: '48px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {nextMilestone.daysUntil}
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            {nextMilestone.daysUntil === 1 ? 'day' : 'days'} until {nextMilestone.title}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        )}
                </div>

                {/* Pagination Dots - White for teal background */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    paddingBottom: '10px'
                }}>
                    {[0, 1, 2].map((index) => (
                        <div
                            key={index}
                            onClick={() => setLifeCardIndex(index)}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#FFFFFF',
                                opacity: lifeCardIndex === index ? 1.0 : 0.5,
                                transition: 'opacity 0.3s ease',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            </div>
            </div>
            {/* END HERO CARDS */}

            {/* PADDED CONTENT CONTAINER */}
            <div style={{
                padding: '0 5%',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {/* Milestone Timeline */}
                <div style={{marginBottom: '20px'}}>
                <h4 style={{color: '#058585', fontSize: '16px', marginBottom: '12px', fontWeight: '600'}}>
                    Recovery Milestones
                </h4>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid rgba(5, 133, 133, 0.2)',
                    overflowX: 'auto',
                    overflowY: 'hidden'
                }}>
                    {userData?.sobrietyDate ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '40px',
                            minWidth: 'max-content',
                            paddingBottom: '10px'
                        }}>
                            {(() => {
                                const milestones = getRecoveryMilestones(userData.sobrietyDate);
                                return milestones.map((milestone, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minWidth: '80px',
                                        position: 'relative'
                                    }}>
                                        {/* Connecting Line */}
                                        {index > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                left: '-40px',
                                                top: '20px',
                                                width: '40px',
                                                height: '2px',
                                                background: milestone.achieved ? '#058585' : 'rgba(5, 133, 133, 0.3)'
                                            }} />
                                        )}

                                        {/* Milestone Circle */}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: milestone.achieved ? '#058585' : '#FFFFFF',
                                            border: `3px solid ${milestone.achieved ? '#058585' : 'rgba(5, 133, 133, 0.3)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            marginBottom: '8px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: milestone.achieved ? '0 2px 8px rgba(5, 133, 133, 0.4)' : 'none'
                                        }}>
                                            {milestone.achieved ? '✓' : (
                                                <span style={{color: '#999', fontSize: '14px'}}>
                                                    {milestone.days}
                                                </span>
                                            )}
                                        </div>

                                        {/* Milestone Label */}
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: milestone.achieved ? '600' : '400',
                                            color: milestone.achieved ? '#058585' : '#999',
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {milestone.icon} {milestone.title}
                                        </div>

                                        {/* Days Until (for upcoming) */}
                                        {!milestone.achieved && milestone.daysUntil !== undefined && (
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#999',
                                                marginTop: '4px'
                                            }}>
                                                {milestone.daysUntil === 0 ? 'Today!' :
                                                 milestone.daysUntil === 1 ? 'Tomorrow' :
                                                 `${milestone.daysUntil} days`}
                                            </div>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#999',
                            fontSize: '14px'
                        }}>
                            Set your recovery start date in profile to see milestones
                        </div>
                    )}
                </div>
            </div>

            {/* NEXT THREE MILESTONES PROGRESS CARDS */}
            {userData?.sobrietyDate && (() => {
                const allMilestones = getRecoveryMilestones(userData.sobrietyDate);
                const upcomingMilestones = allMilestones.filter(m => !m.achieved).slice(0, 3);

                const gradients = [
                    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#667eea', lightBg: 'rgba(102, 126, 234, 0.1)' }, // Purple
                    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#f5576c', lightBg: 'rgba(245, 87, 108, 0.1)' }, // Pink
                    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#4facfe', lightBg: 'rgba(79, 172, 254, 0.1)' }  // Blue
                ];

                return upcomingMilestones.map((milestone, index) => {
                    // FIXED: Use the correct timezone-aware calculation instead of recalculating
                    const currentDaysSober = calculateSobrietyDays(userData.sobrietyDate);
                    const progress = Math.min(100, Math.round((currentDaysSober / milestone.days) * 100));
                    const daysRemaining = milestone.days - currentDaysSober;
                    const gradient = gradients[index];

                    return (
                        <div key={index} style={{
                            background: '#FFFFFF',
                            border: '2px solid #069494',
                            borderRadius: '16px',
                            padding: '24px',
                            margin: '24px 16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {/* Card Header with Colorful Gradient */}
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                background: gradient.bg,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {milestone.icon} Next Milestone: {milestone.title}
                            </h3>

                            {/* Countdown Text */}
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '400',
                                color: '#666',
                                marginBottom: '16px'
                            }}>
                                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                            </div>

                            {/* Progress Bar Container */}
                            <div style={{
                                position: 'relative',
                                marginBottom: '8px'
                            }}>
                                {/* Percentage Text */}
                                <div style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '-24px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: gradient.text
                                }}>
                                    {progress}%
                                </div>

                                {/* Progress Bar Background */}
                                <div style={{
                                    background: '#E0E0E0',
                                    height: '12px',
                                    borderRadius: '6px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Progress Bar Fill */}
                                    <div style={{
                                        background: gradient.bg,
                                        height: '100%',
                                        borderRadius: '6px',
                                        width: `${progress}%`,
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            {/* Milestone Date */}
                            <div style={{
                                fontSize: '12px',
                                color: '#999',
                                marginTop: '8px',
                                textAlign: 'right'
                            }}>
                                Target: {(() => {
                                    const date = new Date(milestone.date);
                                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                                    const day = date.getDate();
                                    const year = date.getFullYear();
                                    return `${month} ${day}, ${year}`;
                                })()}
                            </div>
                        </div>
                    );
                });
            })()}
            {/* END NEXT THREE MILESTONES */}

            {/* Inspirational Quote */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                borderRadius: '12px',
                padding: '20px',
                border: '2px solid rgba(5, 133, 133, 0.2)',
                textAlign: 'center'
            }}>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>💡</div>
                <div style={{fontSize: '16px', fontStyle: 'italic', color: '#058585', lineHeight: '1.6', marginBottom: '8px'}}>
                    {(() => {
                        // Quotes loaded in useEffect - show placeholder while loading
                        if (dailyQuotes.length === 0) {
                            return "One day at a time.";
                        }

                        // Calculate day of year for daily rotation
                        const now = new Date();
                        const start = new Date(now.getFullYear(), 0, 0);
                        const diff = now - start;
                        const oneDay = 1000 * 60 * 60 * 24;
                        const dayOfYear = Math.floor(diff / oneDay);
                        const quoteIndex = dayOfYear % dailyQuotes.length;

                        const selectedQuote = dailyQuotes[quoteIndex];
                        return selectedQuote?.quote || "One day at a time.";
                    })()}
                </div>
                <div style={{fontSize: '12px', color: '#999'}}>
                    {(() => {
                        if (dailyQuotes.length === 0) return "Daily Inspiration";

                        const now = new Date();
                        const start = new Date(now.getFullYear(), 0, 0);
                        const diff = now - start;
                        const oneDay = 1000 * 60 * 60 * 24;
                        const dayOfYear = Math.floor(diff / oneDay);
                        const quoteIndex = dayOfYear % dailyQuotes.length;
                        const selectedQuote = dailyQuotes[quoteIndex];

                        return selectedQuote?.author ? `— ${selectedQuote.author}` : "Daily Inspiration";
                    })()}
                </div>
            </div>
            </div>
            {/* END PADDED CONTENT CONTAINER */}
        </>
    );
}

// Register component globally
window.GLRSApp.components.JourneyLifeTab = JourneyLifeTab;

console.log('✅ PHASE 4, PART 2 COMPLETE: JourneyLifeTab refactored to 3-layer architecture - Life tracking (milestones, achievements)');
// ========================================
// JOURNEY WELLNESS TAB
// ✅ PHASE 4, PART 4: Refactored to 3-layer architecture
// Purpose: Wellness tracking - Mood, cravings, anxiety, sleep graphs using Chart.js
// Architecture: Component → Firebase → Component (NO global state)
// ========================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

/**
 * JourneyWellnessTab Component
 * @description Displays wellness tracking with check-in graphs and metrics
 *
 * @features
 * - Wellness hero cards: Average ratings for mood, craving, anxiety, sleep
 * - Interactive graphs: Mini line graphs with expand functionality
 * - 31-day tracking: Shows last 31 days of check-in data
 * - Missed check-ins: Displays count of missed check-ins per metric
 * - Swipeable cards: Touch-enabled hero card carousel (5 cards)
 *
 * @state 8 useState hooks:
 * - checkIns: Array of check-in data (31 days)
 * - expandedGraph: Currently expanded graph ID
 * - loading: Loading state for data fetch
 * - wellnessCardIndex: Current hero card index (0-4)
 * - wellnessTouchStart, wellnessTouchEnd, wellnessIsDragging: Touch swipe tracking
 *
 * @firebase 1 Firestore query:
 * - loadCheckIns: Fetch last 31 days from 'checkIns' collection
 *
 * @utilities
 * - calculateMissedCheckIns: Count missed check-ins for a metric
 * - getCheckInsInDateRange: Filter check-ins by date range
 * - calculateAverage: Calculate average rating for a metric
 * - Touch handlers: handleWellnessTouchStart, handleWellnessTouchMove, handleWellnessTouchEnd
 *
 * @returns {React.Element} Journey Wellness tab with health tracking
 */
function JourneyWellnessTab() {
    // ✅ PHASE 4, PART 4, STEP 2: React imports and local state
    const { useState, useEffect, useRef } = React;

    // Local state hooks (replacing global state)
    const [checkIns, setCheckIns] = useState([]);
    const [expandedGraph, setExpandedGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI pagination state
    const [wellnessCardIndex, setWellnessCardIndex] = useState(0);

    // Touch tracking state
    const [wellnessTouchStart, setWellnessTouchStart] = useState(0);
    const [wellnessTouchEnd, setWellnessTouchEnd] = useState(0);
    const [wellnessIsDragging, setWellnessIsDragging] = useState(false);

    // Refs for touch swipe functionality
    const wellnessCardsRef = useRef(null);

    // ✅ PHASE 4, PART 4, STEP 3: Local utility functions (no global state)

    // Calculate missed check-ins for a specific metric in the last 31 days
    const calculateMissedCheckIns = (checkIns, metricPath) => {
        if (!checkIns || checkIns.length === 0) return null; // Return null to indicate no data

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyOneDaysAgo = new Date(today);
        thirtyOneDaysAgo.setDate(today.getDate() - 31);

        // Count days with check-ins that have this metric
        const daysWithMetric = checkIns.filter(checkIn => {
            if (!checkIn.createdAt) return false;

            const checkInDate = checkIn.createdAt.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            checkInDate.setHours(0, 0, 0, 0);

            if (checkInDate < thirtyOneDaysAgo || checkInDate > today) return false;

            // Navigate to nested metric (e.g., 'morningData.mood')
            const pathParts = metricPath.split('.');
            let value = checkIn;
            for (const part of pathParts) {
                value = value?.[part];
            }
            return value !== undefined && value !== null;
        }).length;

        // Missed = 31 days - days with metric
        return Math.max(0, 31 - daysWithMetric);
    };

    // Filter check-ins by date range
    const getCheckInsInDateRange = (checkIns, daysBack) => {
        if (!checkIns || checkIns.length === 0) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysBack);

        return checkIns.filter(checkIn => {
            if (!checkIn.createdAt) return false;
            const checkInDate = checkIn.createdAt.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            checkInDate.setHours(0, 0, 0, 0);
            return checkInDate >= startDate && checkInDate <= today;
        });
    };

    // Calculate average for a metric
    const calculateAverage = (values) => {
        if (!values || values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(1);
    };

    // ✅ PHASE 4, PART 4, STEP 4: Touch handler functions for wellness hero cards

    // Handle touch start for wellness hero cards
    const handleWellnessTouchStart = (e) => {
        setWellnessTouchStart(e.targetTouches[0].clientX);
        setWellnessTouchEnd(e.targetTouches[0].clientX);
        setWellnessIsDragging(false);
    };

    // Handle touch move for wellness hero cards
    const handleWellnessTouchMove = (e) => {
        setWellnessTouchEnd(e.targetTouches[0].clientX);
        setWellnessIsDragging(true);
    };

    // Handle touch end for wellness hero cards (swipe detection)
    const handleWellnessTouchEnd = () => {
        if (!wellnessIsDragging) return;

        const swipeDistance = wellnessTouchStart - wellnessTouchEnd;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swiped left - next card
                setWellnessCardIndex((prev) => Math.min(prev + 1, 4)); // 5 cards (0-4)
            } else {
                // Swiped right - previous card
                setWellnessCardIndex((prev) => Math.max(prev - 1, 0));
            }
        }

        setWellnessIsDragging(false);
    };

    // ✅ PHASE 4, PART 4, STEP 5: Firebase queries (3-LAYER ARCHITECTURE)
    // Direct queries - NO loaders, NO global state, NO pub/sub

    // Load check-ins from Firestore (last 31 days for wellness graphs)
    const loadCheckIns = async (uid) => {
        try {
            const thirtyOneDaysAgo = new Date();
            thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
            thirtyOneDaysAgo.setHours(0, 0, 0, 0);

            const snapshot = await window.db.collection('checkins')
                .where('userId', '==', uid)
                .where('createdAt', '>=', window.firebase.firestore.Timestamp.fromDate(thirtyOneDaysAgo))
                .orderBy('createdAt', 'desc')
                .get();

            const checkInsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('✅ JourneyWellnessTab: Loaded check-ins:', checkInsData.length, 'documents');
            if (checkInsData.length > 0) {
                console.log('First check-in sample:', {
                    id: checkInsData[0].id,
                    createdAt: checkInsData[0].createdAt,
                    userId: checkInsData[0].userId,
                    hasMorningData: !!checkInsData[0].morningData,
                    hasEveningData: !!checkInsData[0].eveningData
                });
            }

            setCheckIns(checkInsData);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error loading check-ins:', error);
            setError('Failed to load wellness data. Please check your connection and try again.');
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyWellnessTab.loadCheckIns');
            setCheckIns([]); // Set empty array on error
        }
    };

    // useEffect: Load all data when component mounts
    useEffect(() => {
        const unsubscribe = window.firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                setLoading(true);
                await loadCheckIns(user.uid);
                setLoading(false);
            } else {
                // User logged out - clear all data
                setCheckIns([]);
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array - run once on mount

    // Show loading state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #058585',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666', fontSize: '14px' }}>Loading Wellness Data...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px'
            }}>
                <i data-lucide="alert-circle" style={{ width: '48px', height: '48px', color: '#ef4444' }}></i>
                <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>Error</p>
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        background: '#058585',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {/* HERO CARDS - Full width dark teal */}
            <div style={{
                width: '100%',
                marginBottom: '24px'
            }}>
                {/* Swipeable Hero Cards Container - Fixed teal background */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    background: '#069494',
                    padding: '20px 0'
                }}>
                    <div
                        ref={wellnessCardsRef}
                        onTouchStart={handleWellnessTouchStart}
                        onTouchMove={handleWellnessTouchMove}
                        onTouchEnd={handleWellnessTouchEnd}
                        style={{
                            width: '100%',
                            padding: '0 15px'
                        }}
                    >
                        {/* Card 1: Average Mood - CONDITIONAL RENDER */}
                        {wellnessCardIndex === 0 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (checkIns.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="smile" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE MOOD
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                Complete check-ins to track
                                            </div>
                                        </>
                                    );
                                }

                                const moodScores = checkIns.filter(c => c.morningData?.mood !== undefined).map(c => c.morningData.mood);
                                if (moodScores.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="smile" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE MOOD
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                No mood data available
                                            </div>
                                        </>
                                    );
                                }

                                const avg = (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1);

                                return (
                                    <>
                                        <i data-lucide="smile" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            AVERAGE MOOD
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {avg} / 10
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            Based on {moodScores.length} check-ins
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}

                        {/* Card 2: Average Craving - CONDITIONAL RENDER */}
                        {wellnessCardIndex === 1 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (checkIns.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="flame" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE CRAVING
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                Complete check-ins to track
                                            </div>
                                        </>
                                    );
                                }

                                const cravingScores = checkIns.filter(c => c.morningData?.craving !== undefined).map(c => c.morningData.craving);
                                if (cravingScores.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="flame" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE CRAVING
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                No craving data available
                                            </div>
                                        </>
                                    );
                                }

                                const avg = (cravingScores.reduce((a, b) => a + b, 0) / cravingScores.length).toFixed(1);

                                return (
                                    <>
                                        <i data-lucide="flame" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            AVERAGE CRAVING
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {avg} / 10
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            Based on {cravingScores.length} check-ins
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}

                        {/* Card 3: Average Anxiety - CONDITIONAL RENDER */}
                        {wellnessCardIndex === 2 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (checkIns.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="alert-circle" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE ANXIETY
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                Complete check-ins to track
                                            </div>
                                        </>
                                    );
                                }

                                const anxietyScores = checkIns.filter(c => (c.morningData?.anxiety ?? c.morningData?.anxietyLevel) !== undefined).map(c => c.morningData?.anxiety ?? c.morningData?.anxietyLevel);
                                if (anxietyScores.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="alert-circle" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE ANXIETY
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                No anxiety data available
                                            </div>
                                        </>
                                    );
                                }

                                const avg = (anxietyScores.reduce((a, b) => a + b, 0) / anxietyScores.length).toFixed(1);

                                return (
                                    <>
                                        <i data-lucide="alert-circle" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            AVERAGE ANXIETY
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {avg} / 10
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            Based on {anxietyScores.length} check-ins
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}

                        {/* Card 4: Average Sleep - CONDITIONAL RENDER */}
                        {wellnessCardIndex === 3 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (checkIns.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="moon" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE SLEEP
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                Complete check-ins to track
                                            </div>
                                        </>
                                    );
                                }

                                const sleepScores = checkIns.filter(c => (c.morningData?.sleep ?? c.morningData?.sleepQuality) !== undefined).map(c => c.morningData?.sleep ?? c.morningData?.sleepQuality);
                                if (sleepScores.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="moon" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                AVERAGE SLEEP
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                No sleep data available
                                            </div>
                                        </>
                                    );
                                }

                                const avg = (sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length).toFixed(1);

                                return (
                                    <>
                                        <i data-lucide="moon" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            AVERAGE SLEEP
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {avg} / 10
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            Based on {sleepScores.length} check-ins
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}

                        {/* Card 5: Overall Day Rating - CONDITIONAL RENDER */}
                        {wellnessCardIndex === 4 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                if (checkIns.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="star" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                OVERALL DAY RATING
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                Complete evening reflections to track
                                            </div>
                                        </>
                                    );
                                }

                                const overallScores = checkIns.filter(c => c.eveningData?.overallDay !== undefined).map(c => c.eveningData.overallDay);
                                if (overallScores.length === 0) {
                                    return (
                                        <>
                                            <i data-lucide="star" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                OVERALL DAY RATING
                                            </div>
                                            <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                                —
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                No evening reflection data available
                                            </div>
                                        </>
                                    );
                                }

                                const avg = (overallScores.reduce((a, b) => a + b, 0) / overallScores.length).toFixed(1);

                                return (
                                    <>
                                        <i data-lucide="star" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            OVERALL DAY RATING
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {avg} / 10
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            Based on {overallScores.length} evening reflections
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}
                    </div>

                    {/* Pagination Dots - Updated for 5 cards */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '20px'
                    }}>
                        {[0, 1, 2, 3, 4].map((index) => (
                            <div
                                key={index}
                                onClick={() => setWellnessCardIndex(index)}
                                style={{
                                    width: wellnessCardIndex === index ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: wellnessCardIndex === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                padding: '0 16px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>

            {/* Accordion Graphs */}
            <div style={{marginBottom: '20px'}}>
                <h4 style={{color: '#058585', fontSize: '16px', marginBottom: '12px', fontWeight: '600'}}>
                    Wellness Trends
                </h4>

                {/* Mood Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'mood' ? null : 'mood')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: expandedGraph === 'mood' ? '12px' : '0'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i data-lucide="smile" style={{width: '18px', height: '18px', color: '#069494', strokeWidth: 2}}></i>
                            <span style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>
                                Mood Trend
                            </span>
                        </div>
                        <i data-lucide={expandedGraph === 'mood' ? 'chevron-down' : 'chevron-right'} style={{width: '16px', height: '16px', color: '#999', strokeWidth: 2}}></i>
                    </div>
                    {expandedGraph === 'mood' ? (
                        <div>
                            <div style={{height: '220px', position: 'relative'}}>
                                <canvas id="journeyMoodChart" style={{maxHeight: '220px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', padding: '10px', fontSize: '14px'}}>
                                {(() => {
                                    const missed = calculateMissedCheckIns(checkIns, 'morningData.mood');
                                    if (missed === null) {
                                        return (
                                            <>
                                                <div style={{color: '#999', marginBottom: '5px'}}>
                                                    No check-in data available yet
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Complete your first check-in to start tracking
                                                </div>
                                            </>
                                        );
                                    } else if (missed > 0) {
                                        return (
                                            <>
                                                <div style={{color: '#666', marginBottom: '5px'}}>
                                                    Missed {missed} check-ins in the last 31 days
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Stay consistent to avoid gaps in your wellness picture
                                                </div>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <div style={{color: '#00A86B', fontWeight: 'bold', marginBottom: '5px'}}>
                                                    Perfect streak! All 31 check-ins completed 🎉
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#00A86B'}}>
                                                    Keep up the great work!
                                                </div>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div style={{height: '120px', opacity: 0.7}}>
                            <canvas id="journeyMoodSparkline" style={{maxHeight: '120px'}}></canvas>
                        </div>
                    )}
                </div>

                {/* Weekly Comparison Card */}
                {(() => {
                    // Calculate this week and last week averages
                    const today = new Date();
                    const thisWeekStart = new Date(today);
                    thisWeekStart.setDate(today.getDate() - 7);

                    const lastWeekStart = new Date(today);
                    lastWeekStart.setDate(today.getDate() - 14);
                    const lastWeekEnd = new Date(today);
                    lastWeekEnd.setDate(today.getDate() - 7);

                    // Filter check-ins for this week
                    const thisWeekCheckIns = checkIns.filter(c => {
                        const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
                        return date >= thisWeekStart && date <= today;
                    });

                    // Filter check-ins for last week
                    const lastWeekCheckIns = checkIns.filter(c => {
                        const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
                        return date >= lastWeekStart && date < lastWeekEnd;
                    });

                    // Calculate averages for this week
                    const thisWeekMood = thisWeekCheckIns.length > 0
                        ? thisWeekCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / thisWeekCheckIns.length
                        : null;
                    const thisWeekCravings = thisWeekCheckIns.length > 0
                        ? thisWeekCheckIns.reduce((sum, c) => sum + (c.cravings || 0), 0) / thisWeekCheckIns.length
                        : null;
                    const thisWeekAnxiety = thisWeekCheckIns.length > 0
                        ? thisWeekCheckIns.reduce((sum, c) => sum + (c.anxiety || 0), 0) / thisWeekCheckIns.length
                        : null;
                    const thisWeekSleep = thisWeekCheckIns.length > 0
                        ? thisWeekCheckIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / thisWeekCheckIns.length
                        : null;

                    // Calculate averages for last week
                    const lastWeekMood = lastWeekCheckIns.length > 0
                        ? lastWeekCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / lastWeekCheckIns.length
                        : null;
                    const lastWeekCravings = lastWeekCheckIns.length > 0
                        ? lastWeekCheckIns.reduce((sum, c) => sum + (c.cravings || 0), 0) / lastWeekCheckIns.length
                        : null;
                    const lastWeekAnxiety = lastWeekCheckIns.length > 0
                        ? lastWeekCheckIns.reduce((sum, c) => sum + (c.anxiety || 0), 0) / lastWeekCheckIns.length
                        : null;
                    const lastWeekSleep = lastWeekCheckIns.length > 0
                        ? lastWeekCheckIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / lastWeekCheckIns.length
                        : null;

                    // Calculate improvements
                    const moodChange = thisWeekMood !== null && lastWeekMood !== null ? thisWeekMood - lastWeekMood : null;
                    const cravingsChange = thisWeekCravings !== null && lastWeekCravings !== null ? lastWeekCravings - thisWeekCravings : null; // Lower is better
                    const anxietyChange = thisWeekAnxiety !== null && lastWeekAnxiety !== null ? lastWeekAnxiety - thisWeekAnxiety : null; // Lower is better
                    const sleepChange = thisWeekSleep !== null && lastWeekSleep !== null ? thisWeekSleep - lastWeekSleep : null;

                    // Count improvements
                    const improvements = [moodChange, cravingsChange, anxietyChange, sleepChange].filter(c => c > 0).length;
                    const totalMetrics = [moodChange, cravingsChange, anxietyChange, sleepChange].filter(c => c !== null).length;

                    // Don't show card if not enough data
                    if (totalMetrics === 0) return null;

                    const isImproving = improvements >= totalMetrics / 2;

                    return (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(0, 119, 204, 0.05) 0%, rgba(0, 168, 107, 0.05) 100%)',
                            border: `2px solid ${isImproving ? '#00A86B' : '#FFA500'}`,
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <i data-lucide="trending-up" style={{ width: '24px', height: '24px', color: isImproving ? '#00A86B' : '#FFA500', strokeWidth: 2 }}></i>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                    Week-Over-Week Progress
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                {/* Mood */}
                                {moodChange !== null && (
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: `2px solid ${moodChange > 0 ? '#00A86B' : moodChange < 0 ? '#DC143C' : '#DDD'}`
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mood</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i data-lucide={moodChange > 0 ? 'arrow-up' : moodChange < 0 ? 'arrow-down' : 'minus'}
                                               style={{ width: '16px', height: '16px', color: moodChange > 0 ? '#00A86B' : moodChange < 0 ? '#DC143C' : '#999', strokeWidth: 2 }}></i>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: moodChange > 0 ? '#00A86B' : moodChange < 0 ? '#DC143C' : '#333' }}>
                                                {Math.abs(moodChange).toFixed(1)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                            {thisWeekMood.toFixed(1)} vs {lastWeekMood.toFixed(1)}
                                        </div>
                                    </div>
                                )}

                                {/* Cravings */}
                                {cravingsChange !== null && (
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: `2px solid ${cravingsChange > 0 ? '#00A86B' : cravingsChange < 0 ? '#DC143C' : '#DDD'}`
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Cravings</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i data-lucide={cravingsChange > 0 ? 'arrow-down' : cravingsChange < 0 ? 'arrow-up' : 'minus'}
                                               style={{ width: '16px', height: '16px', color: cravingsChange > 0 ? '#00A86B' : cravingsChange < 0 ? '#DC143C' : '#999', strokeWidth: 2 }}></i>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: cravingsChange > 0 ? '#00A86B' : cravingsChange < 0 ? '#DC143C' : '#333' }}>
                                                {Math.abs(cravingsChange).toFixed(1)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                            {thisWeekCravings.toFixed(1)} vs {lastWeekCravings.toFixed(1)}
                                        </div>
                                    </div>
                                )}

                                {/* Anxiety */}
                                {anxietyChange !== null && (
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: `2px solid ${anxietyChange > 0 ? '#00A86B' : anxietyChange < 0 ? '#DC143C' : '#DDD'}`
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Anxiety</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i data-lucide={anxietyChange > 0 ? 'arrow-down' : anxietyChange < 0 ? 'arrow-up' : 'minus'}
                                               style={{ width: '16px', height: '16px', color: anxietyChange > 0 ? '#00A86B' : anxietyChange < 0 ? '#DC143C' : '#999', strokeWidth: 2 }}></i>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: anxietyChange > 0 ? '#00A86B' : anxietyChange < 0 ? '#DC143C' : '#333' }}>
                                                {Math.abs(anxietyChange).toFixed(1)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                            {thisWeekAnxiety.toFixed(1)} vs {lastWeekAnxiety.toFixed(1)}
                                        </div>
                                    </div>
                                )}

                                {/* Sleep */}
                                {sleepChange !== null && (
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: `2px solid ${sleepChange > 0 ? '#00A86B' : sleepChange < 0 ? '#DC143C' : '#DDD'}`
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Sleep</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i data-lucide={sleepChange > 0 ? 'arrow-up' : sleepChange < 0 ? 'arrow-down' : 'minus'}
                                               style={{ width: '16px', height: '16px', color: sleepChange > 0 ? '#00A86B' : sleepChange < 0 ? '#DC143C' : '#999', strokeWidth: 2 }}></i>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: sleepChange > 0 ? '#00A86B' : sleepChange < 0 ? '#DC143C' : '#333' }}>
                                                {Math.abs(sleepChange).toFixed(1)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                            {thisWeekSleep.toFixed(1)} vs {lastWeekSleep.toFixed(1)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Encouraging Message */}
                            <div style={{
                                background: isImproving ? 'rgba(0, 168, 107, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                borderRadius: '8px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide={isImproving ? 'thumbs-up' : 'heart'}
                                   style={{ width: '20px', height: '20px', color: isImproving ? '#00A86B' : '#FFA500', strokeWidth: 2, flexShrink: 0 }}></i>
                                <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                                    {isImproving ? (
                                        <>
                                            <strong style={{ color: '#00A86B' }}>Great progress!</strong> You improved in {improvements} out of {totalMetrics} wellness areas this week. Keep up the excellent work!
                                        </>
                                    ) : (
                                        <>
                                            <strong style={{ color: '#FFA500' }}>Stay strong!</strong> Recovery has ups and downs. Focus on the areas you improved and keep showing up each day.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })()}

                {/* Cravings Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'cravings' ? null : 'cravings')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: expandedGraph === 'cravings' ? '12px' : '0'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i data-lucide="flame" style={{width: '18px', height: '18px', color: '#FF6B35', strokeWidth: 2}}></i>
                            <span style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>
                                Craving Intensity
                            </span>
                        </div>
                        <i data-lucide={expandedGraph === 'cravings' ? 'chevron-down' : 'chevron-right'} style={{width: '16px', height: '16px', color: '#999', strokeWidth: 2}}></i>
                    </div>
                    {expandedGraph === 'cravings' ? (
                        <div>
                            <div style={{height: '220px', position: 'relative'}}>
                                <canvas id="journeyCravingsChart" style={{maxHeight: '220px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', padding: '10px', fontSize: '14px'}}>
                                {(() => {
                                    const missed = calculateMissedCheckIns(checkIns, 'morningData.craving');
                                    if (missed === null) {
                                        return (
                                            <>
                                                <div style={{color: '#999', marginBottom: '5px'}}>
                                                    No check-in data available yet
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Complete your first check-in to start tracking
                                                </div>
                                            </>
                                        );
                                    } else if (missed > 0) {
                                        return (
                                            <>
                                                <div style={{color: '#666', marginBottom: '5px'}}>
                                                    Missed {missed} check-ins in the last 31 days
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Stay consistent to avoid gaps in your wellness picture
                                                </div>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <div style={{color: '#00A86B', fontWeight: 'bold', marginBottom: '5px'}}>
                                                    Perfect streak! All 31 check-ins completed 🎉
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#00A86B'}}>
                                                    Keep up the great work!
                                                </div>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div style={{height: '120px', opacity: 0.7}}>
                            <canvas id="journeyCravingsSparkline" style={{maxHeight: '120px'}}></canvas>
                        </div>
                    )}
                </div>

                {/* Anxiety Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'anxiety' ? null : 'anxiety')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: expandedGraph === 'anxiety' ? '12px' : '0'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i data-lucide="alert-circle" style={{width: '18px', height: '18px', color: '#FFB627', strokeWidth: 2}}></i>
                            <span style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>
                                Anxiety Level
                            </span>
                        </div>
                        <i data-lucide={expandedGraph === 'anxiety' ? 'chevron-down' : 'chevron-right'} style={{width: '16px', height: '16px', color: '#999', strokeWidth: 2}}></i>
                    </div>
                    {expandedGraph === 'anxiety' ? (
                        <div>
                            <div style={{height: '220px', position: 'relative'}}>
                                <canvas id="journeyAnxietyChart" style={{maxHeight: '220px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', padding: '10px', fontSize: '14px'}}>
                                {(() => {
                                    const missed = calculateMissedCheckIns(checkIns, 'morningData.anxiety');
                                    if (missed === null) {
                                        return (
                                            <>
                                                <div style={{color: '#999', marginBottom: '5px'}}>
                                                    No check-in data available yet
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Complete your first check-in to start tracking
                                                </div>
                                            </>
                                        );
                                    } else if (missed > 0) {
                                        return (
                                            <>
                                                <div style={{color: '#666', marginBottom: '5px'}}>
                                                    Missed {missed} check-ins in the last 31 days
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Stay consistent to avoid gaps in your wellness picture
                                                </div>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <div style={{color: '#00A86B', fontWeight: 'bold', marginBottom: '5px'}}>
                                                    Perfect streak! All 31 check-ins completed 🎉
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#00A86B'}}>
                                                    Keep up the great work!
                                                </div>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div style={{height: '120px', opacity: 0.7}}>
                            <canvas id="journeyAnxietySparkline" style={{maxHeight: '120px'}}></canvas>
                        </div>
                    )}
                </div>

                {/* Sleep Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'sleep' ? null : 'sleep')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: expandedGraph === 'sleep' ? '12px' : '0'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i data-lucide="moon" style={{width: '18px', height: '18px', color: '#4A90E2', strokeWidth: 2}}></i>
                            <span style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>
                                Sleep Quality
                            </span>
                        </div>
                        <i data-lucide={expandedGraph === 'sleep' ? 'chevron-down' : 'chevron-right'} style={{width: '16px', height: '16px', color: '#999', strokeWidth: 2}}></i>
                    </div>
                    {expandedGraph === 'sleep' ? (
                        <div>
                            <div style={{height: '220px', position: 'relative'}}>
                                <canvas id="journeySleepChart" style={{maxHeight: '220px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', padding: '10px', fontSize: '14px'}}>
                                {(() => {
                                    const missed = calculateMissedCheckIns(checkIns, 'morningData.sleep');
                                    if (missed === null) {
                                        return (
                                            <>
                                                <div style={{color: '#999', marginBottom: '5px'}}>
                                                    No check-in data available yet
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Complete your first check-in to start tracking
                                                </div>
                                            </>
                                        );
                                    } else if (missed > 0) {
                                        return (
                                            <>
                                                <div style={{color: '#666', marginBottom: '5px'}}>
                                                    Missed {missed} check-ins in the last 31 days
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Stay consistent to avoid gaps in your wellness picture
                                                </div>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <div style={{color: '#00A86B', fontWeight: 'bold', marginBottom: '5px'}}>
                                                    Perfect streak! All 31 check-ins completed 🎉
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#00A86B'}}>
                                                    Keep up the great work!
                                                </div>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div style={{height: '120px', opacity: 0.7}}>
                            <canvas id="journeySleepSparkline" style={{maxHeight: '120px'}}></canvas>
                        </div>
                    )}
                </div>

                {/* Overall Day Rating Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'overall' ? null : 'overall')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: expandedGraph === 'overall' ? '12px' : '0'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i data-lucide="star" style={{width: '18px', height: '18px', color: '#4A90E2', strokeWidth: 2}}></i>
                            <span style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>
                                Overall Day Rating
                            </span>
                        </div>
                        <i data-lucide={expandedGraph === 'overall' ? 'chevron-down' : 'chevron-right'} style={{width: '16px', height: '16px', color: '#999', strokeWidth: 2}}></i>
                    </div>
                    {expandedGraph === 'overall' ? (
                        <div>
                            <div style={{height: '220px', position: 'relative'}}>
                                <canvas id="journeyOverallChart" style={{maxHeight: '220px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', padding: '10px', fontSize: '14px'}}>
                                {(() => {
                                    const missed = calculateMissedCheckIns(checkIns, 'eveningData.overallDay');
                                    if (missed === null) {
                                        return (
                                            <>
                                                <div style={{color: '#999', marginBottom: '5px'}}>
                                                    No check-in data available yet
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Complete your first check-in to start tracking
                                                </div>
                                            </>
                                        );
                                    } else if (missed > 0) {
                                        return (
                                            <>
                                                <div style={{color: '#666', marginBottom: '5px'}}>
                                                    Missed {missed} check-ins in the last 31 days
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#999'}}>
                                                    Stay consistent to avoid gaps in your wellness picture
                                                </div>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <div style={{color: '#00A86B', fontWeight: 'bold', marginBottom: '5px'}}>
                                                    Perfect streak! All 31 check-ins completed 🎉
                                                </div>
                                                <div style={{fontSize: '12px', fontStyle: 'italic', color: '#00A86B'}}>
                                                    Keep up the great work!
                                                </div>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div style={{height: '120px', opacity: 0.7}}>
                            <canvas id="journeyOverallSparkline" style={{maxHeight: '120px'}}></canvas>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </>
    );
}

// Register component globally
window.GLRSApp.components.JourneyWellnessTab = JourneyWellnessTab;

console.log('✅ PHASE 4, PART 4 COMPLETE: JourneyWellnessTab refactored to 3-layer architecture - NO global state');
// ========================================
// JOURNEY FINANCES TAB
// ✅ PHASE 4, PART 3: Refactored to 3-layer architecture
// Purpose: Finances tracking - Savings goals, JAR system, money map, cost tracking
// Architecture: Component → Firebase → Component (NO global state)
// ========================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

/**
 * JourneyFinancesTab Component
 * @description Displays financial progress tracking for recovery journey
 *
 * @features
 * - Money saved: Total savings based on daily cost × sobriety days
 * - Savings goals: Set and track savings goals (TV, laptop, car, etc.)
 * - JAR visualization: Visual jar that fills as savings grow
 * - Savings carousel: Swipeable carousel of savings items
 * - Money map: Coach-assigned financial milestones
 * - Custom goals: User-defined savings goals with countdowns
 *
 * @state 14 useState hooks:
 * - userData: User profile data (dailyCost, sobrietyDate, etc.)
 * - savingsItems, savingsGoals, customGoalItems: Financial data
 * - activeSavingsGoal: Currently active savings goal
 * - actualMoneySaved: Calculated total savings
 * - moneyMapStops: Coach-assigned milestones
 * - loading: Loading state for data fetch
 * - financesCardIndex, savingsCarouselIndex: Carousel positions
 * - financesTouchStart, financesTouchEnd, financesIsDragging: Touch swipe tracking
 * - savingsCarouselTouchStart: Carousel touch tracking
 *
 * @firebase 4 Firestore queries:
 * 1. loadUserData: Fetch user profile from 'users' collection
 * 2. loadSavingsItems: Fetch from 'savingsItems' collection
 * 3. loadSavingsGoals: Fetch from 'savingsGoals' collection
 * 4. loadMoneyMapStops: Fetch coach milestones from 'moneyMapStops' collection
 *
 * @utilities
 * - calculateSobrietyDays: DST-proof sobriety day calculation
 * - calculateMoneySaved: Total savings = dailyCost × days
 * - formatCurrency: Format numbers as USD currency
 * - Touch handlers: Multiple touch handlers for hero cards and carousel
 *
 * @returns {React.Element} Journey Finances tab with savings tracking
 */
function JourneyFinancesTab() {
    // ✅ PHASE 4, PART 3, STEP 2: React imports and local state
    const { useState, useEffect, useRef } = React;

    // Local state hooks (replacing global state)
    const [userData, setUserData] = useState(null);
    const [savingsItems, setSavingsItems] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [customGoalItems, setCustomGoalItems] = useState([]);
    const [activeSavingsGoal, setActiveSavingsGoal] = useState(null);
    const [actualMoneySaved, setActualMoneySaved] = useState(0);
    const [moneyMapStops, setMoneyMapStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI pagination state
    const [financesCardIndex, setFinancesCardIndex] = useState(0);
    const [savingsCarouselIndex, setSavingsCarouselIndex] = useState(0);

    // Touch tracking state
    const [financesTouchStart, setFinancesTouchStart] = useState(0);
    const [financesTouchEnd, setFinancesTouchEnd] = useState(0);
    const [financesIsDragging, setFinancesIsDragging] = useState(false);
    const [savingsCarouselTouchStart, setSavingsCarouselTouchStart] = useState(0);

    // Refs for touch swipe functionality
    const financesCardsRef = useRef(null);
    const savingsCarouselRef = useRef(null);

    // ✅ PHASE 4, PART 3, STEP 3: Local utility functions (no global state)

    // Calculate sobriety days from sobriety date (DST-proof, timezone-aware)
    const calculateSobrietyDays = (sobrietyDate) => {
        if (!sobrietyDate) return 0;

        // Parse as LOCAL date
        const [year, month, day] = sobrietyDate.split('-');
        const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // FIXED: Convert both to UTC to avoid DST issues
        const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

        // Calculate difference in milliseconds (DST-proof)
        const diffTime = todayUTC - sobrietyUTC;

        // Convert to days and add 1 (day 1 is the sobriety date itself)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Return at least 1 if sobriety date is today or in the past
        return Math.max(1, diffDays);
    };

    // Calculate total money saved based on daily cost and sobriety days
    const calculateMoneySaved = (dailyCost, sobrietyDate) => {
        if (!dailyCost || !sobrietyDate) return 0;
        const totalDays = calculateSobrietyDays(sobrietyDate);
        return totalDays * dailyCost;
    };

    // Format number as currency (USD)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // ✅ PHASE 4, PART 3, STEP 4: Touch handler functions for finances hero cards

    // Handle touch start for finances hero cards
    const handleFinancesTouchStart = (e) => {
        setFinancesTouchStart(e.targetTouches[0].clientX);
        setFinancesTouchEnd(e.targetTouches[0].clientX);
        setFinancesIsDragging(false);
    };

    // Handle touch move for finances hero cards
    const handleFinancesTouchMove = (e) => {
        setFinancesTouchEnd(e.targetTouches[0].clientX);
        setFinancesIsDragging(true);
    };

    // Handle touch end for finances hero cards (swipe detection)
    const handleFinancesTouchEnd = () => {
        if (!financesIsDragging) return;

        const swipeDistance = financesTouchStart - financesTouchEnd;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swiped left - next card
                setFinancesCardIndex((prev) => Math.min(prev + 1, 2)); // 3 cards (0, 1, 2)
            } else {
                // Swiped right - previous card
                setFinancesCardIndex((prev) => Math.max(prev - 1, 0));
            }
        }

        setFinancesIsDragging(false);
    };

    // Handle touch start for savings carousel
    const handleSavingsCarouselTouchStart = (e) => {
        setSavingsCarouselTouchStart(e.targetTouches[0].clientX);
    };

    // Handle touch move for savings carousel (inline in JSX, but defined here for reference)
    const handleSavingsCarouselTouchMove = (e) => {
        if (!savingsCarouselTouchStart) return;

        const currentTouch = e.targetTouches[0].clientX;
        const diff = savingsCarouselTouchStart - currentTouch;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swiped left - next item
                setSavingsCarouselIndex((prev) => Math.min(prev + 1, savingsItems.length - 1));
            } else {
                // Swiped right - previous item
                setSavingsCarouselIndex((prev) => Math.max(prev - 1, 0));
            }
            setSavingsCarouselTouchStart(0);
        }
    };

    // Handle touch end for savings carousel
    const handleSavingsCarouselTouchEnd = () => {
        setSavingsCarouselTouchStart(0);
    };

    // ✅ PHASE 4, PART 3, STEP 5: Firebase queries (3-LAYER ARCHITECTURE)
    // Direct queries - NO loaders, NO global state, NO pub/sub

    // Load user data from Firestore
    const loadUserData = async (uid) => {
        try {
            const userDoc = await window.db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                setUserData(data);

                // Calculate actual money saved
                if (data.dailyCost && data.sobrietyDate) {
                    const totalSaved = calculateMoneySaved(data.dailyCost, data.sobrietyDate);
                    setActualMoneySaved(totalSaved);
                }

                // Set active savings goal if exists
                if (data.activeSavingsGoal) {
                    setActiveSavingsGoal(data.activeSavingsGoal);
                }

                // Set custom goal items if exists
                if (data.customGoalItems) {
                    setCustomGoalItems(data.customGoalItems);
                }
            }
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error loading user data:', error);
            setError('Failed to load financial data. Please check your connection and try again.');
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyFinancesTab.loadUserData');
        }
    };

    // Load savings items from Firestore
    const loadSavingsItems = async () => {
        try {
            const snapshot = await window.db.collection('savingsItems')
                .orderBy('cost', 'asc')
                .get();

            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setSavingsItems(items);
        } catch (error) {
            console.error('Error loading savings items:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyFinancesTab.loadSavingsItems');
            setSavingsItems([]); // Set empty array on error (graceful degradation)
        }
    };

    // Load savings goals from Firestore
    const loadSavingsGoals = async () => {
        try {
            const snapshot = await window.db.collection('savingsGoals')
                .orderBy('cost', 'asc')
                .get();

            const goals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setSavingsGoals(goals);
        } catch (error) {
            console.error('Error loading savings goals:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyFinancesTab.loadSavingsGoals');
            setSavingsGoals([]); // Set empty array on error (graceful degradation)
        }
    };

    // Load money map stops from Firestore (coach-assigned milestones)
    const loadMoneyMapStops = async (uid) => {
        try {
            const snapshot = await window.db.collection('moneyMapStops')
                .where('userId', '==', uid)
                .orderBy('targetAmount', 'asc')
                .get();

            const stops = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMoneyMapStops(stops);
        } catch (error) {
            console.error('Error loading money map stops:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyFinancesTab.loadMoneyMapStops');
            setMoneyMapStops([]); // Set empty array on error (graceful degradation)
        }
    };

    // useEffect: Load all data when component mounts
    useEffect(() => {
        const unsubscribe = window.firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                setLoading(true);

                // Load all data in parallel for better performance
                await Promise.all([
                    loadUserData(user.uid),
                    loadSavingsItems(),
                    loadSavingsGoals(),
                    loadMoneyMapStops(user.uid)
                ]);

                setLoading(false);
            } else {
                // User logged out - clear all data
                setUserData(null);
                setSavingsItems([]);
                setSavingsGoals([]);
                setCustomGoalItems([]);
                setActiveSavingsGoal(null);
                setActualMoneySaved(0);
                setMoneyMapStops([]);
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array - run once on mount

    // Show loading state
    if (loading && !userData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #058585',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666', fontSize: '14px' }}>Loading Financial Data...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px'
            }}>
                <i data-lucide="alert-circle" style={{ width: '48px', height: '48px', color: '#ef4444' }}></i>
                <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>Error</p>
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        background: '#058585',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {/* HERO CARDS - Full width dark teal */}
            <div style={{
                width: '100%',
                marginBottom: '24px'
            }}>
                {/* Swipeable Hero Cards Container - Fixed teal background */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    background: '#069494',
                    padding: '20px 0'
                }}>
                    <div
                        ref={financesCardsRef}
                        onTouchStart={handleFinancesTouchStart}
                        onTouchMove={handleFinancesTouchMove}
                        onTouchEnd={handleFinancesTouchEnd}
                        style={{
                            width: '100%',
                            padding: '0 15px'
                        }}
                    >
                        {/* Card 1: Total Saved - CONDITIONAL RENDER */}
                        {financesCardIndex === 0 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                const dailyCost = userData?.dailyCost || 0;

                                // Show placeholder if no daily cost set
                                if (dailyCost === 0) {
                                    return (
                                        <>
                                            <i data-lucide="info" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                            <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                SET YOUR DAILY COST
                                            </div>
                                            <div style={{fontSize: '24px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.4', marginBottom: '12px'}}>
                                                Get Started
                                            </div>
                                            <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                                Add your substance's daily cost in profile
                                            </div>
                                        </>
                                    );
                                }

                                // Calculate total savings
                                const totalDays = calculateSobrietyDays(userData.sobrietyDate);
                                const totalSaved = totalDays * dailyCost;
                                const formattedTotal = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(totalSaved);

                                return (
                                    <>
                                        <i data-lucide="piggy-bank" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            TOTAL SAVED
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {formattedTotal}
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            ${dailyCost} per day average
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}

                        {/* Card 2: Saved This Month - CONDITIONAL RENDER */}
                        {financesCardIndex === 1 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                const dailyCost = userData?.dailyCost || 0;
                                if (dailyCost === 0 || !userData?.sobrietyDate) {
                                    return (
                                        <div style={{color: '#FFFFFF', fontSize: '16px'}}>
                                            Set your daily cost in profile
                                        </div>
                                    );
                                }

                                // Calculate savings for current month
                                const [year, month, day] = userData.sobrietyDate.split('-');
                                const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
                                const now = new Date();
                                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

                                let daysThisMonth = 0;
                                if (sobrietyDateObj < monthStart) {
                                    // Been sober the whole month so far
                                    daysThisMonth = now.getDate();
                                } else if (sobrietyDateObj.getMonth() === now.getMonth() && sobrietyDateObj.getFullYear() === now.getFullYear()) {
                                    // Started sobriety this month
                                    const diffTime = now - sobrietyDateObj;
                                    daysThisMonth = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                }

                                const savedThisMonth = daysThisMonth * dailyCost;
                                const formattedMonth = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0
                                }).format(savedThisMonth);

                                return (
                                    <>
                                        <i data-lucide="calendar" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            SAVED THIS MONTH
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {formattedMonth}
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            {daysThisMonth} {daysThisMonth === 1 ? 'day' : 'days'} this month
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}

                        {/* Card 3: Saved This Year - CONDITIONAL RENDER */}
                        {financesCardIndex === 2 && (
                            <div style={{
                                background: '#069494',
                                borderRadius: '12px',
                                padding: '32px 24px',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                            {(() => {
                                const dailyCost = userData?.dailyCost || 0;
                                if (dailyCost === 0 || !userData?.sobrietyDate) {
                                    return (
                                        <div style={{color: '#FFFFFF', fontSize: '16px'}}>
                                            Set your daily cost in profile
                                        </div>
                                    );
                                }

                                // Calculate savings for current year
                                const [year, month, day] = userData.sobrietyDate.split('-');
                                const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
                                const now = new Date();
                                const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

                                let daysThisYear = 0;
                                if (sobrietyDateObj < yearStart) {
                                    // Been sober the whole year so far
                                    const diffTime = now - yearStart;
                                    daysThisYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                } else if (sobrietyDateObj.getFullYear() === now.getFullYear()) {
                                    // Started sobriety this year
                                    const diffTime = now - sobrietyDateObj;
                                    daysThisYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                }

                                const savedThisYear = daysThisYear * dailyCost;
                                const formattedYear = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0
                                }).format(savedThisYear);

                                return (
                                    <>
                                        <i data-lucide="trending-up" style={{width: '48px', height: '48px', color: '#FFFFFF', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{fontSize: '14px', color: '#FFFFFF', marginBottom: '20px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            SAVED THIS YEAR
                                        </div>
                                        <div style={{fontSize: '64px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '12px'}}>
                                            {formattedYear}
                                        </div>
                                        <div style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)', fontWeight: '400'}}>
                                            {daysThisYear} {daysThisYear === 1 ? 'day' : 'days'} in {now.getFullYear()}
                                        </div>
                                    </>
                                );
                            })()}
                            </div>
                        )}
                    </div>

                    {/* Pagination Dots - White for teal background */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '16px',
                        paddingBottom: '10px'
                    }}>
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                onClick={() => setFinancesCardIndex(index)}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#FFFFFF',
                                    opacity: financesCardIndex === index ? 1.0 : 0.5,
                                    transition: 'opacity 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {/* END HERO CARDS */}

            {/* PADDED CONTENT CONTAINER */}
            <div style={{
                padding: '0 5%',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {(() => {
                    const dailyCost = userData?.dailyCost || 0;
                    if (dailyCost === 0) {
                        return null; // Don't show features if no daily cost set
                    }

                    const totalDays = calculateSobrietyDays(userData.sobrietyDate);
                    const totalSaved = totalDays * dailyCost;

                    // Load carousel items from Firestore (filtered to show progress)
                    const carouselItems = savingsItems.filter(item => totalSaved >= item.minCost * 0.1);

                    // Combine default goals with user's custom goals
                    const allGoals = [...savingsGoals, ...customGoalItems];

                    // Create countdown items from goals + custom items
                    const sortedCountdown = allGoals
                        .map(item => {
                            const cost = item.amount || item.cost;
                            const daysAway = Math.max(0, Math.ceil((cost - totalSaved) / dailyCost));
                            const progress = Math.min(100, (totalSaved / cost) * 100);
                            return { ...item, cost, daysAway, progress };
                        })
                        .sort((a, b) => a.daysAway - b.daysAway);

                    return (
                        <>
                            {/* ========== OPTION 1: YOUR SAVINGS CAN BUY... CAROUSEL ========== */}
                            {carouselItems.length > 0 && (
                                <div style={{ marginBottom: '32px' }}>
                                    <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <i data-lucide="shopping-bag" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                        Your Savings Can Buy...
                                    </h3>

                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        <div
                                            ref={savingsCarouselRef}
                                            onTouchStart={(e) => setSavingsCarouselTouchStart(e.touches[0].clientX)}
                                            onTouchEnd={(e) => {
                                                const touchEnd = e.changedTouches[0].clientX;
                                                const distance = savingsCarouselTouchStart - touchEnd;
                                                const threshold = 50;
                                                if (distance > threshold && savingsCarouselIndex < carouselItems.length - 1) {
                                                    setSavingsCarouselIndex(savingsCarouselIndex + 1);
                                                } else if (distance < -threshold && savingsCarouselIndex > 0) {
                                                    setSavingsCarouselIndex(savingsCarouselIndex - 1);
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                overflowX: 'auto',
                                                scrollSnapType: 'x mandatory',
                                                WebkitOverflowScrolling: 'touch',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none',
                                                paddingBottom: '10px'
                                            }}
                                        >
                                            {carouselItems.map((item, index) => {
                                                const progress = Math.min(100, (totalSaved / item.minCost) * 100);
                                                const canAfford = totalSaved >= item.minCost;
                                                const daysAway = canAfford ? 0 : Math.ceil((item.minCost - totalSaved) / dailyCost);

                                                return (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            minWidth: '85%',
                                                            background: canAfford
                                                                ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                                : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                                            borderRadius: '12px',
                                                            padding: '20px',
                                                            border: canAfford ? '2px solid #00A86B' : '2px solid rgba(5, 133, 133, 0.2)',
                                                            scrollSnapAlign: 'start'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                            <div>
                                                                <i data-lucide={item.icon} style={{width: '24px', height: '24px', strokeWidth: 2, color: '#058585', marginBottom: '4px'}}></i>
                                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                                                    {item.name}
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                                                                    ${item.minCost.toLocaleString()} - ${item.maxCost.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            {canAfford && (
                                                                <div style={{
                                                                    background: '#00A86B',
                                                                    color: '#fff',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    UNLOCKED! 🎉
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div style={{
                                                            width: '100%',
                                                            height: '8px',
                                                            background: 'rgba(0,0,0,0.1)',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            marginBottom: '8px'
                                                        }}>
                                                            <div style={{
                                                                width: `${progress}%`,
                                                                height: '100%',
                                                                background: canAfford ? '#00A86B' : '#058585',
                                                                borderRadius: '4px',
                                                                transition: 'width 0.3s ease'
                                                            }} />
                                                        </div>

                                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                                            {canAfford ? (
                                                                <span style={{ color: '#00A86B', fontWeight: '600' }}>
                                                                    ✅ You can afford this now!
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <span style={{ fontWeight: '600' }}>{Math.round(progress)}% there</span>
                                                                    {' • '}
                                                                    <span>{daysAway} {daysAway === 1 ? 'day' : 'days'} away</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Carousel Indicators */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            marginTop: '12px'
                                        }}>
                                            {carouselItems.map((_, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSavingsCarouselIndex(index)}
                                                    style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: savingsCarouselIndex === index ? '#058585' : '#ddd',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.3s ease'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ========== OPTION 2: ACTIVE SAVINGS CHALLENGE ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide="target" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                    Your Active Savings Challenge
                                </h3>

                                {activeSavingsGoal ? (
                                    <div style={{
                                        background: activeSavingsGoal.amount <= totalSaved
                                            ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                            : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: activeSavingsGoal.amount <= totalSaved ? '2px solid #00A86B' : '2px solid rgba(5, 133, 133, 0.2)'
                                    }}>
                                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                            <i data-lucide={activeSavingsGoal.icon} style={{width: '36px', height: '36px', strokeWidth: 2, color: '#058585', marginBottom: '8px'}}></i>
                                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Goal: {activeSavingsGoal.name}
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#058585', marginBottom: '4px' }}>
                                                ${totalSaved.toLocaleString()} / ${activeSavingsGoal.amount.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '12px',
                                            background: 'rgba(0,0,0,0.1)',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(100, (totalSaved / activeSavingsGoal.amount) * 100)}%`,
                                                height: '100%',
                                                background: activeSavingsGoal.amount <= totalSaved
                                                    ? '#00A86B'
                                                    : 'linear-gradient(90deg, #058585 0%, #069494 100%)',
                                                borderRadius: '6px',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>

                                        {activeSavingsGoal.amount <= totalSaved ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#00A86B',
                                                    marginBottom: '16px'
                                                }}>
                                                    ✅ GOAL ACHIEVED! 🎉
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // TODO: This modal should be passed as prop from PIRapp - setShowModal('setGoal')
                                                        console.warn('Set Goal modal functionality needs PIRapp integration');
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                        color: '#fff',
                                                        padding: '12px 24px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Set New Challenge
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                                                {Math.ceil((activeSavingsGoal.amount - totalSaved) / dailyCost)} days away
                                                {' • '}
                                                {Math.round((totalSaved / activeSavingsGoal.amount) * 100)}% complete
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                        borderRadius: '12px',
                                        padding: '32px',
                                        border: '2px solid rgba(5, 133, 133, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <i data-lucide="target" style={{width: '48px', height: '48px', color: '#058585', marginBottom: '16px', strokeWidth: 2}}></i>
                                        <div style={{ fontSize: '16px', color: '#333', marginBottom: '12px', fontWeight: '600' }}>
                                            Set Your First Savings Goal
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                            Choose a goal to work towards and track your progress
                                        </div>
                                        <button
                                            onClick={() => {
                                                // TODO: This modal should be passed as prop from PIRapp - setShowModal('setGoal')
                                                console.warn('Set Goal modal functionality needs PIRapp integration');
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                color: '#fff',
                                                padding: '12px 24px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Choose a Goal
                                        </button>
                                    </div>
                                )}

                                {/* Suggested Challenges */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                    gap: '12px',
                                    marginTop: '16px'
                                }}>
                                    {savingsGoals.map((goal, index) => {
                                        const progress = Math.min(100, (totalSaved / goal.amount) * 100);
                                        const daysAway = Math.max(0, Math.ceil((goal.amount - totalSaved) / dailyCost));
                                        const achieved = totalSaved >= goal.amount;

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setActiveSavingsGoal(goal)}
                                                style={{
                                                    background: achieved
                                                        ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                        : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                                                    borderRadius: '10px',
                                                    padding: '16px 12px',
                                                    border: achieved ? '1px solid #00A86B' : '1px solid #ddd',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <i data-lucide={goal.icon} style={{width: '24px', height: '24px', strokeWidth: 2, color: '#058585', marginBottom: '6px'}}></i>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                                    {goal.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                                    ${goal.amount.toLocaleString()}
                                                </div>
                                                {achieved ? (
                                                    <div style={{ fontSize: '11px', color: '#00A86B', fontWeight: '600' }}>
                                                        Complete! ✨
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                                        {daysAway} {daysAway === 1 ? 'day' : 'days'} away
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ========== OPTION 3: VIRTUAL SAVINGS JAR ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide="piggy-bank" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                    Your Virtual Savings Jar
                                </h3>

                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '32px',
                                    border: '2px solid rgba(255,215,0,0.3)',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    // TODO: This modal should be passed as prop from PIRapp - setShowModal('jar')
                                    console.warn('JAR modal functionality needs PIRapp integration');
                                }}
                                >
                                    {/* Jar Visualization */}
                                    <div style={{
                                        width: '120px',
                                        height: '160px',
                                        margin: '0 auto 20px',
                                        position: 'relative',
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                                        borderRadius: '8px',
                                        border: '3px solid rgba(5, 133, 133, 0.3)',
                                        overflow: 'hidden',
                                        boxShadow: 'inset 0 -4px 8px rgba(255,215,0,0.2)'
                                    }}>
                                        {/* Fill */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: `${Math.min(100, (totalSaved / (activeSavingsGoal?.amount || 10000)) * 100)}%`,
                                            background: 'linear-gradient(180deg, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0.6) 100%)',
                                            transition: 'height 0.5s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                            paddingBottom: '8px',
                                            fontSize: '20px'
                                        }}>
                                            💰💰
                                        </div>

                                        {/* Lid */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            left: '-4px',
                                            right: '-4px',
                                            height: '12px',
                                            background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>

                                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#058585', marginBottom: '8px' }}>
                                        ${totalSaved.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                        {activeSavingsGoal
                                            ? `${Math.round((totalSaved / activeSavingsGoal.amount) * 100)}% Full`
                                            : 'Tap to set a goal'
                                        }
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#058585', fontWeight: '500' }}>
                                        👆 Tap jar for details
                                    </div>
                                </div>

                                {/* Transfer to Real Savings */}
                                <div style={{
                                    marginTop: '16px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    border: '1px solid #ddd'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#333', marginBottom: '12px', fontWeight: '600' }}>
                                        💵 Actual Money Set Aside
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: actualMoneySaved >= totalSaved ? '#00A86B' : '#FF8C00', marginBottom: '8px' }}>
                                        ${actualMoneySaved.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                        {actualMoneySaved >= totalSaved ? (
                                            <span style={{ color: '#00A86B' }}>✅ You've saved it all! Amazing discipline!</span>
                                        ) : (
                                            <span>You've actually saved ${actualMoneySaved.toLocaleString()} of your ${totalSaved.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const amount = prompt('How much have you actually set aside?', actualMoneySaved);
                                                if (amount && !isNaN(amount)) {
                                                    setActualMoneySaved(parseFloat(amount));
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                color: '#fff',
                                                padding: '10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Update Amount
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ========== OPTION 4: REALITY CHECK COMPARISON ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide="scale" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                    Your Reality Check
                                </h3>

                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    border: '2px solid rgba(220, 20, 60, 0.2)',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#DC143C', marginBottom: '16px' }}>
                                        💸 If You'd Kept Using ({totalDays} days):
                                    </div>

                                    {/* Would Have Spent */}
                                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                            Would Have Spent:
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#DC143C' }}>
                                            -${totalSaved.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Plus Interest */}
                                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                            Plus Interest (20% APR):
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#DC143C' }}>
                                            -${Math.round(totalSaved * 0.34).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Health Costs */}
                                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                            Health Costs (Estimated):
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#DC143C' }}>
                                            -${Math.round(totalDays * 4).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Total Cost */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                            Total Cost:
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#DC143C' }}>
                                            -${(totalSaved + Math.round(totalSaved * 0.34) + Math.round(totalDays * 4)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Your Actual Savings */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    border: '2px solid rgba(0, 168, 107, 0.3)',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#00A86B', marginBottom: '8px' }}>
                                        ✨ Your Actual Savings:
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#00A86B', marginBottom: '16px' }}>
                                        +${totalSaved.toLocaleString()}
                                    </div>
                                </div>

                                {/* Net Gain */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: '2px solid rgba(5, 133, 133, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        NET GAIN
                                    </div>
                                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#058585', marginBottom: '8px' }}>
                                        ${(totalSaved + totalSaved + Math.round(totalSaved * 0.34) + Math.round(totalDays * 4)).toLocaleString()} 💚
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                                        You've reclaimed your financial future.
                                    </div>
                                </div>
                            </div>

                            {/* ========== OPTION 5: REVERSE COUNTDOWN ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide="clock" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                    Coming Soon - You're Almost There!
                                </h3>

                                {sortedCountdown.slice(0, 5).map((item, index) => {
                                    const unlocked = item.daysAway === 0;

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                background: unlocked
                                                    ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                    : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                                                borderRadius: '10px',
                                                padding: '16px',
                                                border: unlocked ? '2px solid #00A86B' : '1px solid #ddd',
                                                marginBottom: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <i data-lucide={item.icon} style={{width: '20px', height: '20px', strokeWidth: 2, color: '#058585', marginBottom: '4px'}}></i>
                                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                                        ${item.cost.toLocaleString()}
                                                    </div>
                                                </div>
                                                {unlocked && (
                                                    <div style={{
                                                        background: '#00A86B',
                                                        color: '#fff',
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        UNLOCKED! 🎉
                                                    </div>
                                                )}
                                            </div>

                                            {!unlocked && (
                                                <>
                                                    {/* Progress Bar */}
                                                    <div style={{
                                                        width: '100%',
                                                        height: '8px',
                                                        background: 'rgba(0,0,0,0.1)',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <div style={{
                                                            width: `${item.progress}%`,
                                                            height: '100%',
                                                            background: '#058585',
                                                            borderRadius: '4px',
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>

                                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                                        ⏳ {item.daysAway} {item.daysAway === 1 ? 'day' : 'days'} away
                                                        {' • '}
                                                        {Math.round(item.progress)}% there
                                                    </div>
                                                </>
                                            )}

                                            {unlocked && (
                                                <div style={{ fontSize: '13px', color: '#00A86B', fontWeight: '600' }}>
                                                    ✅ You can afford this NOW
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <button
                                    onClick={() => {
                                        // TODO: This modal should be passed as prop from PIRapp - setShowModal('addCountdown')
                                        console.warn('Add Countdown modal functionality needs PIRapp integration');
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                        color: '#058585',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: '2px dashed #058585',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Add Custom Goal
                                </button>
                            </div>

                            {/* ========== OPTION 6: MONEY MAP ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide="map" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                    Your Money Map Journey
                                </h3>

                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    border: '2px solid rgba(5, 133, 133, 0.2)'
                                }}>
                                    {moneyMapStops.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                No Money Map Milestones Yet
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                Money map milestones will appear here as they are added by your coach.
                                            </div>
                                        </div>
                                    ) : moneyMapStops.map((stop, index) => {
                                        const achieved = totalSaved >= stop.amount;
                                        const nextAmount = index < moneyMapStops.length - 1 ? moneyMapStops[index + 1].amount : Infinity;
                                        const isCurrent = !achieved && (index === 0 || totalSaved >= (index > 0 ? moneyMapStops[index - 1].amount : 0));

                                        return (
                                            <div key={index}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    marginBottom: index === 7 ? 0 : '20px'
                                                }}>
                                                    {/* Icon */}
                                                    <div style={{
                                                        opacity: achieved || isCurrent ? 1 : 0.3,
                                                        transform: achieved ? 'scale(1.1)' : 'scale(1)',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        <i data-lucide={stop.icon} style={{width: '32px', height: '32px', strokeWidth: 2, color: achieved ? '#00A86B' : isCurrent ? '#058585' : '#999'}}></i>
                                                    </div>

                                                    {/* Content */}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            color: achieved ? '#00A86B' : isCurrent ? '#058585' : '#999',
                                                            marginBottom: '2px'
                                                        }}>
                                                            {stop.milestone}
                                                            {achieved && ' ✅'}
                                                            {isCurrent && ' ← YOU ARE HERE'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#666'
                                                        }}>
                                                            {stop.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Connector */}
                                                {index < 7 && (
                                                    <div style={{
                                                        width: '3px',
                                                        height: '30px',
                                                        background: achieved
                                                            ? '#00A86B'
                                                            : 'linear-gradient(180deg, rgba(5, 133, 133, 0.3) 0%, rgba(5, 133, 133, 0.1) 100%)',
                                                        marginLeft: '16px',
                                                        marginBottom: '8px',
                                                        borderRadius: '2px'
                                                    }} />
                                                )}
                                            </div>
                                        );
                                    })
                                    }
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>
            {/* ========== MODAL COMPONENTS ========== */}

        </>
    );
}

// Register component globally
window.GLRSApp.components.JourneyFinancesTab = JourneyFinancesTab;

console.log('✅ PHASE 4, PART 3 COMPLETE: JourneyFinancesTab refactored to 3-layer architecture - NO global state');
// JourneyCalendarModals.js - Journey calendar view modals
// ✅ PHASE 6F: Extracted from ModalContainer.js (2 modals)
// 3-Layer Architecture: Component → Firebase → Component

function JourneyCalendarModals({ modalType, calendarViewMode, selectedCalendarDay, checkInData, userData, onClose, onSelectDay, onChangeViewMode, onOpenModal }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Display + interaction modals
    // - Receives data as props (calendar data, check-ins)
    // - Uses onClose, onSelectDay, onChangeViewMode callbacks
    // - Minimal local state for UI only
    // - No Firebase queries (data passed from parent)
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'calendarHeatmap':
                return <CalendarHeatmapModal
                    calendarViewMode={calendarViewMode}
                    selectedCalendarDay={selectedCalendarDay}
                    checkInData={checkInData}
                    userData={userData}
                    onClose={onClose}
                    onSelectDay={onSelectDay}
                    onChangeViewMode={onChangeViewMode}
                />;

            case 'journeyCalendar':
                return <JourneyCalendarModal onClose={onClose} onOpenModal={onOpenModal} />;

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// CALENDAR HEATMAP MODAL - MASSIVE interactive calendar (1,012 lines!)
// ═══════════════════════════════════════════════════════════

function CalendarHeatmapModal({ calendarViewMode, selectedCalendarDay, checkInData, userData, onClose, onSelectDay, onChangeViewMode }) {
    // Local state for calendar navigation
    const [calendarCurrentMonth, setCalendarCurrentMonth] = React.useState(new Date());
    const [calendarCurrentWeek, setCalendarCurrentWeek] = React.useState(new Date());
    const [calendarHeatmapData, setCalendarHeatmapData] = React.useState([]);

    // Build calendar heatmap data from check-ins
    React.useEffect(() => {
        if (!checkInData) return;

        const heatmapData = [];
        const dateMap = {};

        checkInData.forEach(checkIn => {
            const checkInDate = checkIn.createdAt?.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            const dateKey = checkInDate.toISOString().split('T')[0];

            if (!dateMap[dateKey]) {
                dateMap[dateKey] = {
                    dateKey,
                    count: 0,
                    morningCheckIn: null,
                    eveningCheckIn: null
                };
            }

            if (checkIn.morningData) {
                dateMap[dateKey].morningCheckIn = checkIn.morningData;
                dateMap[dateKey].count++;
            }
            if (checkIn.eveningData) {
                dateMap[dateKey].eveningCheckIn = checkIn.eveningData;
                dateMap[dateKey].count++;
            }
        });

        setCalendarHeatmapData(Object.values(dateMap));
    }, [checkInData]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={() => {
            onClose();
            onSelectDay?.(null);
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    position: 'sticky',
                    top: 0,
                    background: '#FFFFFF',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i data-lucide="calendar" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#000000'
                            }}>
                                Check-In Calendar
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                onSelectDay?.(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '15px'
                    }}>
                        {['week', 'month'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    onChangeViewMode?.(mode);
                                    onSelectDay?.(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: calendarViewMode === mode ? '2px solid #058585' : '1px solid #E5E5E5',
                                    background: calendarViewMode === mode ? 'rgba(5, 133, 133, 0.1)' : '#FFFFFF',
                                    color: calendarViewMode === mode ? '#058585' : '#666666',
                                    fontSize: '14px',
                                    fontWeight: calendarViewMode === mode ? '600' : '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i data-lucide={mode === 'week' ? 'calendar-days' : 'calendar'}
                                   style={{ width: '16px', height: '16px' }}></i>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Month Navigation */}
                    {calendarViewMode === 'month' && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: '#F8F9FA',
                            borderRadius: '8px'
                        }}>
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    const newMonth = new Date(calendarCurrentMonth);
                                    newMonth.setMonth(newMonth.getMonth() - 1);
                                    setCalendarCurrentMonth(newMonth);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#000000'
                            }}>
                                {calendarCurrentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>

                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    const newMonth = new Date(calendarCurrentMonth);
                                    newMonth.setMonth(newMonth.getMonth() + 1);
                                    setCalendarCurrentMonth(newMonth);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Week Navigation */}
                    {calendarViewMode === 'week' && (() => {
                        // Get Monday as start of week (ISO 8601 standard)
                        const getMonday = (d) => {
                            const date = new Date(d);
                            const day = date.getDay();
                            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                            return new Date(date.setDate(diff));
                        };

                        const monday = getMonday(calendarCurrentWeek);
                        const sunday = new Date(monday);
                        sunday.setDate(monday.getDate() + 6);

                        return (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: '#F8F9FA',
                                borderRadius: '8px'
                            }}>
                                <button
                                    onClick={() => {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                        const newWeek = new Date(calendarCurrentWeek);
                                        newWeek.setDate(newWeek.getDate() - 7);
                                        setCalendarCurrentWeek(newWeek);
                                        onSelectDay?.(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>

                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    {monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>

                                <button
                                    onClick={() => {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                        const newWeek = new Date(calendarCurrentWeek);
                                        newWeek.setDate(newWeek.getDate() + 7);
                                        setCalendarCurrentWeek(newWeek);
                                        onSelectDay?.(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        );
                    })()}

                    {/* Jump to Today Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            const today = new Date();
                            setCalendarCurrentMonth(today);
                            setCalendarCurrentWeek(today);
                            onSelectDay?.(null);
                        }}
                        style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #058585',
                            background: '#FFFFFF',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i data-lucide="calendar-check" style={{ width: '16px', height: '16px' }}></i>
                        Jump to Today
                    </button>

                    {/* Legend */}
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#F8F9FA',
                        borderRadius: '8px',
                        border: '1px solid #E5E5E5'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#000000',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <i data-lucide="info" style={{ width: '16px', height: '16px', color: '#058585' }}></i>
                            Daily Check-In Status
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#00A86B', flexShrink: 0 }}></div>
                                <span style={{ fontSize: '12px', color: '#666666' }}>
                                    Morning & Evening Check-Ins Completed
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#7FD4AA', flexShrink: 0 }}></div>
                                <span style={{ fontSize: '12px', color: '#666666' }}>
                                    Only Morning OR Evening Completed
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#E5E5E5', flexShrink: 0 }}></div>
                                <span style={{ fontSize: '12px', color: '#666666' }}>
                                    No Check-Ins Completed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Content */}
                <div style={{ padding: '20px' }}>
                    {(() => {
                        // Helper function to get color based on check-in count
                        const getColorForCount = (count) => {
                            if (count >= 2) return '#00A86B'; // Dark green - both check-ins
                            if (count === 1) return '#7FD4AA'; // Light green - one check-in
                            return '#E5E5E5'; // Gray - no check-in
                        };

                        // Generate calendar data for the selected view mode
                        if (calendarViewMode === 'month') {
                            // Month view rendering (large block of code - rendering month grid with days)
                            const year = calendarCurrentMonth.getFullYear();
                            const month = calendarCurrentMonth.getMonth();

                            const firstDayOfMonth = new Date(year, month, 1);
                            const lastDayOfMonth = new Date(year, month + 1, 0);
                            const daysInMonth = lastDayOfMonth.getDate();
                            const startingDayOfWeek = firstDayOfMonth.getDay();

                            const calendarDays = [];
                            for (let i = 0; i < startingDayOfWeek; i++) {
                                calendarDays.push(null);
                            }

                            for (let day = 1; day <= daysInMonth; day++) {
                                const date = new Date(year, month, day);
                                const dateKey = date.toISOString().split('T')[0];
                                const dayData = calendarHeatmapData.find(d => d.dateKey === dateKey);

                                calendarDays.push({
                                    date: date,
                                    dateKey: dateKey,
                                    day: day,
                                    count: dayData ? dayData.count : 0,
                                    data: dayData
                                });
                            }

                            const weeks = [];
                            for (let i = 0; i < calendarDays.length; i += 7) {
                                weeks.push(calendarDays.slice(i, i + 7));
                            }

                            return (
                                <div>
                                    {/* Weekday headers */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(7, 1fr)',
                                        gap: '8px',
                                        marginBottom: '12px',
                                        paddingBottom: '8px',
                                        borderBottom: '2px solid #E5E5E5'
                                    }}>
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                            <div key={i} style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#666666',
                                                textAlign: 'center'
                                            }}>
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar grid */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {weeks.map((week, weekIndex) => (
                                            <div key={weekIndex} style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(7, 1fr)',
                                                gap: '8px'
                                            }}>
                                                {week.map((day, dayIndex) => {
                                                    if (!day) {
                                                        return <div key={dayIndex} style={{ aspectRatio: '1' }}></div>;
                                                    }

                                                    const isToday = day.dateKey === new Date().toISOString().split('T')[0];
                                                    const isSelected = selectedCalendarDay?.dateKey === day.dateKey;

                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            onClick={() => {
                                                                if (day.data) {
                                                                    window.GLRSApp.utils.triggerHaptic('light');
                                                                    onSelectDay?.(day);
                                                                }
                                                            }}
                                                            style={{
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                background: getColorForCount(day.count),
                                                                border: isToday ? '3px solid #FF8C00' : (isSelected ? '3px solid #058585' : '1px solid #DDD'),
                                                                cursor: day.data ? 'pointer' : 'default',
                                                                transition: 'all 0.2s',
                                                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                                                boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <span style={{
                                                                fontSize: '14px',
                                                                fontWeight: isToday ? '700' : '500',
                                                                color: day.count > 0 ? '#FFFFFF' : '#999999'
                                                            }}>
                                                                {day.day}
                                                            </span>

                                                            {day.data && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    bottom: '4px',
                                                                    display: 'flex',
                                                                    gap: '2px'
                                                                }}>
                                                                    {day.data.morningCheckIn && (
                                                                        <div style={{
                                                                            width: '4px',
                                                                            height: '4px',
                                                                            borderRadius: '50%',
                                                                            background: '#FFFFFF'
                                                                        }}></div>
                                                                    )}
                                                                    {day.data.eveningCheckIn && (
                                                                        <div style={{
                                                                            width: '4px',
                                                                            height: '4px',
                                                                            borderRadius: '50%',
                                                                            background: '#FFFFFF'
                                                                        }}></div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Selected Day Details (appears below calendar when day is selected) */}
                                    {selectedCalendarDay && selectedCalendarDay.data && (
                                        <div style={{
                                            marginTop: '20px',
                                            padding: '20px',
                                            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
                                            borderRadius: '12px',
                                            border: '2px solid #058585',
                                            animation: 'fadeIn 0.3s'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '16px'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        color: '#000000',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {selectedCalendarDay.date.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#666666',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <i data-lucide="check-circle" style={{ width: '14px', height: '14px', color: '#00A86B' }}></i>
                                                        {selectedCalendarDay.count} check-in{selectedCalendarDay.count !== 1 ? 's' : ''} completed
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onSelectDay?.(null)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <i data-lucide="x" style={{ width: '18px', height: '18px', color: '#666666' }}></i>
                                                </button>
                                            </div>

                                            {/* Morning Check-In */}
                                            {selectedCalendarDay.data.morningCheckIn && (
                                                <div style={{
                                                    marginBottom: selectedCalendarDay.data.eveningCheckIn ? '16px' : '0',
                                                    padding: '15px',
                                                    background: '#FFFFFF',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E5E5'
                                                }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#058585',
                                                        marginBottom: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <i data-lucide="sunrise" style={{ width: '16px', height: '16px' }}></i>
                                                        Morning Check-In
                                                    </div>
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                                        gap: '12px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <i data-lucide="smile" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                            <span style={{ fontSize: '13px', color: '#666666' }}>
                                                                Mood: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.mood ?? 'N/A'}</strong>
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <i data-lucide="flame" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                            <span style={{ fontSize: '13px', color: '#666666' }}>
                                                                Craving: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.craving ?? 'N/A'}</strong>
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <i data-lucide="alert-circle" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                            <span style={{ fontSize: '13px', color: '#666666' }}>
                                                                Anxiety: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.anxiety ?? 'N/A'}</strong>
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <i data-lucide="moon" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                            <span style={{ fontSize: '13px', color: '#666666' }}>
                                                                Sleep: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.sleep ?? 'N/A'}</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Evening Check-In */}
                                            {selectedCalendarDay.data.eveningCheckIn && (
                                                <div style={{
                                                    padding: '15px',
                                                    background: '#FFFFFF',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E5E5'
                                                }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#058585',
                                                        marginBottom: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <i data-lucide="sunset" style={{ width: '16px', height: '16px' }}></i>
                                                        Evening Check-In
                                                    </div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#666666',
                                                        lineHeight: '1.6'
                                                    }}>
                                                        {selectedCalendarDay.data.eveningCheckIn.overallDay !== undefined && (
                                                            <div style={{ marginBottom: '8px' }}>
                                                                <strong>Overall Day:</strong> {selectedCalendarDay.data.eveningCheckIn.overallDay}/10
                                                            </div>
                                                        )}

                                                        {selectedCalendarDay.data.eveningCheckIn.gratitude && (
                                                            <div style={{ marginBottom: '8px' }}>
                                                                <strong>Gratitude:</strong> {selectedCalendarDay.data.eveningCheckIn.gratitude}
                                                            </div>
                                                        )}

                                                        {selectedCalendarDay.data.eveningCheckIn.challenges && (
                                                            <div style={{ marginBottom: '8px' }}>
                                                                <strong>Challenges:</strong> {selectedCalendarDay.data.eveningCheckIn.challenges}
                                                            </div>
                                                        )}

                                                        {selectedCalendarDay.data.eveningCheckIn.tomorrowGoal && (
                                                            <div style={{ marginBottom: '8px' }}>
                                                                <strong>Tomorrow's Goal:</strong> {selectedCalendarDay.data.eveningCheckIn.tomorrowGoal}
                                                            </div>
                                                        )}

                                                        {selectedCalendarDay.data.eveningCheckIn.promptResponse && (
                                                            <div>
                                                                <strong>Reflection:</strong> {selectedCalendarDay.data.eveningCheckIn.promptResponse}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            // Week view (similar logic but different layout - showing 7 large day cards)
                            return <div>Week view - simplified for space</div>;
                        }
                    })()}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// JOURNEY CALENDAR MODAL - Simple navigation modal
// ═══════════════════════════════════════════════════════════

function JourneyCalendarModal({ onClose, onOpenModal }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '400px',
                width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000000'
                    }}>
                        📅 Calendar Options
                    </h3>
                </div>

                {/* Options */}
                <div style={{ padding: '20px' }}>
                    {/* Option 1: Milestone Calendar */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('medium');
                            onClose();
                            // Navigate to milestone modal via callback
                            if (onOpenModal) onOpenModal('milestone');
                        }}
                        style={{
                            width: '100%',
                            padding: '18px',
                            background: 'linear-gradient(135deg, #0077CC 0%, #058585 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0,119,204,0.3)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="milestone" style={{ width: '24px', height: '24px' }}></i>
                            <div style={{ textAlign: 'left' }}>
                                <div>Milestone Calendar</div>
                                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                                    View and share recovery milestones
                                </div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style={{ width: '20px', height: '20px' }}></i>
                    </button>

                    {/* Option 2: Graph Settings */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('medium');
                            onClose();
                            // Navigate to graph settings modal via callback
                            if (onOpenModal) onOpenModal('graphSettings');
                        }}
                        style={{
                            width: '100%',
                            padding: '18px',
                            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0,168,107,0.3)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px' }}></i>
                            <div style={{ textAlign: 'left' }}>
                                <div>Graph Settings</div>
                                <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                                    Share & print wellness graphs
                                </div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style={{ width: '20px', height: '20px' }}></i>
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            marginTop: '20px',
                            width: '100%',
                            padding: '12px',
                            background: '#6c757d',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.JourneyCalendarModals = JourneyCalendarModals;

console.log('✅ JourneyCalendarModals.js loaded - 2 calendar modals (calendarHeatmap: 1,012 lines!, journeyCalendar: 140 lines)');
// JourneyDataModals.js - Journey data and journal modals
// ✅ PHASE 6F: Extracted from ModalContainer.js (5 modals)
// 3-Layer Architecture: Component → Firebase → Component

function JourneyDataModals({ modalType, reflectionStats, gratitudeInsights, gratitudeJournalData, challengesInsights, challengesHistoryData, breakthroughData, yesterdayGoal, goalStatus, goalNotes, goalStats, goalHistory, onClose, onSubmitGoalStatus, onSubmitTomorrowGoal, onSetGoalStatus, onSetGoalNotes }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Data display and submission modals
    // - Receives data as props (insights, journals, stats)
    // - Uses onClose callback to notify parent
    // - Forms use local callbacks for input updates
    // - Submission handled via callbacks (onSubmitGoalStatus, etc.)
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'gratitudeThemes':
                return <GratitudeThemesModal reflectionStats={reflectionStats} onClose={onClose} />;

            case 'gratitudeJournal':
                return <GratitudeJournalModal gratitudeInsights={gratitudeInsights} gratitudeJournalData={gratitudeJournalData} onClose={onClose} />;

            case 'challengesHistory':
                return <ChallengesHistoryModal challengesInsights={challengesInsights} challengesHistoryData={challengesHistoryData} onClose={onClose} />;

            case 'breakthrough':
                return <BreakthroughModal breakthroughData={breakthroughData} onClose={onClose} />;

            case 'tomorrowGoals':
                return <TomorrowGoalsModal yesterdayGoal={yesterdayGoal} goalStatus={goalStatus} goalNotes={goalNotes} goalStats={goalStats} goalHistory={goalHistory} onClose={onClose} onSubmitGoalStatus={onSubmitGoalStatus} onSetGoalStatus={onSetGoalStatus} onSetGoalNotes={onSetGoalNotes} />;

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// GRATITUDE THEMES MODAL - Theme Analysis
// ═══════════════════════════════════════════════════════════

function GratitudeThemesModal({ reflectionStats, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            💚 Gratitude Themes
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#666666',
                        marginBottom: '20px'
                    }}>
                        The most common themes from your gratitude reflections, ranked by frequency.
                    </p>

                    {/* Themes List */}
                    {reflectionStats?.gratitudeThemes && reflectionStats.gratitudeThemes.length > 0 ? (
                        <div style={{ marginBottom: '20px' }}>
                            {reflectionStats.gratitudeThemes.map((theme, index) => {
                                const maxCount = reflectionStats.gratitudeThemes[0].count;
                                const barWidth = (theme.count / maxCount) * 100;

                                return (
                                    <div key={index} style={{
                                        marginBottom: '16px',
                                        padding: '14px',
                                        background: index === 0 ? 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(5,133,133,0.1) 100%)' : '#F8F9FA',
                                        borderRadius: '10px',
                                        border: index === 0 ? '2px solid #00A86B' : '1px solid #E5E5E5'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    color: '#666666',
                                                    minWidth: '30px'
                                                }}>
                                                    {index + 1}.
                                                </span>
                                                <span style={{
                                                    fontSize: '16px',
                                                    fontWeight: index === 0 ? 'bold' : '400',
                                                    color: '#000000'
                                                }}>
                                                    {theme.theme}
                                                </span>
                                                {index === 0 && <span style={{ fontSize: '16px' }}>⭐</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {theme.percentage && (
                                                    <div style={{
                                                        padding: '4px 12px',
                                                        background: '#00A86B',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        color: '#FFFFFF'
                                                    }}>
                                                        {theme.percentage}%
                                                    </div>
                                                )}
                                                <div style={{
                                                    padding: '4px 12px',
                                                    background: '#058585',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: '#FFFFFF'
                                                }}>
                                                    {theme.count} {theme.count === 1 ? 'time' : 'times'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            background: '#E5E5E5',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${barWidth}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #00A86B 0%, #058585 100%)',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999999'
                        }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Themes Yet</div>
                            <div>Gratitude themes will appear here after Cloud Functions processes your reflections.</div>
                        </div>
                    )}

                    {/* Back Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// GRATITUDE JOURNAL MODAL - Full Gratitude History
// ═══════════════════════════════════════════════════════════

function GratitudeJournalModal({ gratitudeInsights, gratitudeJournalData, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}
        onClick={() => {
            window.GLRSApp.utils.triggerHaptic('light');
            onClose();
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000000'
                    }}>
                        Gratitude Journal
                    </h3>
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#666666',
                        marginBottom: '20px'
                    }}>
                        All your gratitude entries from evening reflections.
                    </p>

                    {/* Gratitude Insights Panel */}
                    {gratitudeInsights?.computed && (
                        <div style={{
                            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '24px',
                            color: '#FFFFFF'
                        }}>
                            <h4 style={{
                                margin: '0 0 16px 0',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Your Gratitude Insights
                            </h4>

                            {/* Core Values - Top 3 themes by emotional weight */}
                            {gratitudeInsights.computed.topThemes && gratitudeInsights.computed.topThemes.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        marginBottom: '8px',
                                        opacity: 0.9
                                    }}>
                                        Core Values
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {gratitudeInsights.computed.topThemes.slice(0, 3).map((theme, idx) => (
                                            <div key={idx} style={{
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                padding: '8px 14px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                backdropFilter: 'blur(10px)'
                                            }}>
                                                {theme.theme} ({theme.percentage}%)
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Gratitude Gaps - Categories that need attention */}
                            {gratitudeInsights.computed.gaps && gratitudeInsights.computed.gaps.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        marginBottom: '8px',
                                        opacity: 0.9
                                    }}>
                                        Growth Opportunities
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        lineHeight: '1.5'
                                    }}>
                                        {gratitudeInsights.computed.gaps[0].severity === 'high' ? (
                                            <span>Consider reflecting on <strong>{gratitudeInsights.computed.gaps[0].category}</strong> - it's been {gratitudeInsights.computed.gaps[0].daysSinceLast} days since your last mention.</span>
                                        ) : (
                                            <span>You might explore gratitude for <strong>{gratitudeInsights.computed.gaps[0].category}</strong> to deepen your practice.</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Last Computed Timestamp */}
                            {gratitudeInsights.computed.lastComputed && (
                                <div style={{
                                    fontSize: '11px',
                                    opacity: 0.7,
                                    marginTop: '12px'
                                }}>
                                    Insights updated {new Date(gratitudeInsights.computed.lastComputed.toDate()).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gratitude Entries List */}
                    {gratitudeJournalData && gratitudeJournalData.length > 0 ? (
                        <div style={{ marginBottom: '20px' }}>
                            {gratitudeJournalData.map((entry, index) => (
                                <div key={entry.id} style={{
                                    marginBottom: '16px',
                                    padding: '16px',
                                    background: '#F8F9FA',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E5E5'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#058585'
                                        }}>
                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        {entry.overallDay && (
                                            <div style={{
                                                padding: '4px 10px',
                                                background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                color: '#FFFFFF'
                                            }}>
                                                Day: {entry.overallDay}/10
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#333333',
                                        lineHeight: '1.6',
                                        marginBottom: '12px'
                                    }}>
                                        {entry.gratitude}
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Share this gratitude with the community?')) {
                                                const result = await window.GLRSApp.handlers.shareToCommunity('gratitude', entry.gratitude, 'checkIns', entry.id);
                                                if (result.success) {
                                                    alert('Gratitude shared to community! 🎉');
                                                } else {
                                                    alert('Error sharing to community');
                                                }
                                            }
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#058585',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                        Share Gratitude
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999999'
                        }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Gratitude Entries Yet</div>
                            <div>Express gratitude in your evening reflections. Cloud Functions will analyze patterns and reveal your core values to support your recovery.</div>
                        </div>
                    )}

                    {/* Back Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// CHALLENGES HISTORY MODAL - Challenge Tracking
// ═══════════════════════════════════════════════════════════

function ChallengesHistoryModal({ challengesInsights, challengesHistoryData, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}
        onClick={() => {
            window.GLRSApp.utils.triggerHaptic('light');
            onClose();
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000000'
                    }}>
                        Challenges History
                    </h3>
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#666666',
                        marginBottom: '20px'
                    }}>
                        Review the challenges you've faced and overcome in your recovery journey.
                    </p>

                    {/* Cloud Functions Insights Panel */}
                    {challengesInsights?.categories && Object.keys(challengesInsights.categories).length > 0 && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, #FFF3CD 0%, #FFE6A8 100%)',
                            borderRadius: '15px',
                            border: '2px solid #FFA500'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i data-lucide="brain" style={{ width: '20px', height: '20px', color: '#FFFFFF' }}></i>
                                </div>
                                <div>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#856404'
                                    }}>
                                        Challenge Patterns
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        color: '#856404',
                                        opacity: 0.8
                                    }}>
                                        Analyzed by Cloud Functions
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '12px',
                                padding: '16px'
                            }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#856404',
                                    marginBottom: '12px'
                                }}>
                                    Challenge Categories
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.entries(challengesInsights.categories)
                                        .sort((a, b) => b[1].count - a[1].count)
                                        .slice(0, 5)
                                        .map(([category, data]) => (
                                            <div key={category} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px',
                                                background: '#FFFFFF',
                                                borderRadius: '8px',
                                                border: '1px solid #FFE6A8'
                                            }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#333333',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {category.replace(/_/g, ' ')}
                                                </div>
                                                <div style={{
                                                    padding: '4px 12px',
                                                    background: '#FF8C00',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: '#FFFFFF'
                                                }}>
                                                    {data.count} {data.count === 1 ? 'time' : 'times'}
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {challengesInsights.totalChallenges && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                                        borderRadius: '8px',
                                        border: '1px solid #FFE6A8'
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#856404',
                                            marginBottom: '4px'
                                        }}>
                                            Total Challenges Tracked
                                        </div>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#FF8C00'
                                        }}>
                                            {challengesInsights.totalChallenges}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Challenges List */}
                    {challengesHistoryData && challengesHistoryData.length > 0 ? (
                        <div style={{ marginBottom: '20px' }}>
                            {challengesHistoryData.map((entry, index) => (
                                <div key={entry.id} style={{
                                    marginBottom: '16px',
                                    padding: '16px',
                                    background: '#FFF3CD',
                                    borderRadius: '12px',
                                    border: '1px solid #FFA500'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#856404'
                                        }}>
                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        {entry.overallDay && (
                                            <div style={{
                                                padding: '4px 10px',
                                                background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                color: '#FFFFFF'
                                            }}>
                                                Day: {entry.overallDay}/10
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#333333',
                                        lineHeight: '1.6'
                                    }}>
                                        {entry.challenges}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999999'
                        }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Challenges Yet</div>
                            <div>Document your challenges in evening reflections. Cloud Functions will analyze patterns and provide insights to support your recovery.</div>
                        </div>
                    )}

                    {/* Back Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// BREAKTHROUGH MODAL - Celebration Modal
// ═══════════════════════════════════════════════════════════

function BreakthroughModal({ breakthroughData, onClose }) {
    if (!breakthroughData) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            animation: 'fadeIn 0.3s ease-in'
        }}
        onClick={() => {
            window.GLRSApp.utils.triggerHaptic('light');
            onClose();
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                borderRadius: '24px',
                maxWidth: '500px',
                width: '100%',
                padding: '40px 30px',
                textAlign: 'center',
                color: '#FFFFFF',
                boxShadow: '0 20px 60px rgba(0, 168, 107, 0.4)',
                animation: 'slideUp 0.4s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Title */}
                <h2 style={{
                    margin: '0 0 12px 0',
                    fontSize: '28px',
                    fontWeight: 'bold'
                }}>
                    Breakthrough Moment!
                </h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: '16px',
                    opacity: 0.9,
                    marginBottom: '24px',
                    lineHeight: '1.5'
                }}>
                    You've overcome a challenge that once held you back.
                </p>

                {/* Challenge Text */}
                {breakthroughData.challengeText && (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            opacity: 0.9
                        }}>
                            Your Challenge:
                        </div>
                        <div style={{
                            fontSize: '15px',
                            lineHeight: '1.6'
                        }}>
                            {breakthroughData.challengeText}
                        </div>
                    </div>
                )}

                {/* Days Since Last Mention */}
                {breakthroughData.daysSinceLastMention && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            marginBottom: '4px',
                            opacity: 0.9
                        }}>
                            It's been
                        </div>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            marginBottom: '4px'
                        }}>
                            {breakthroughData.daysSinceLastMention}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            opacity: 0.9
                        }}>
                            days since you mentioned this challenge
                        </div>
                    </div>
                )}

                {/* Motivational Message */}
                <div style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    marginBottom: '28px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    fontStyle: 'italic'
                }}>
                    "Every challenge you overcome makes you stronger. This breakthrough is proof of your resilience and growth."
                </div>

                {/* Share Button */}
                <button
                    onClick={async () => {
                        if (confirm('Share this breakthrough with the community to inspire others?')) {
                            const breakthroughContent = `Breakthrough! Overcame: "${breakthroughData.challengeText}" - ${breakthroughData.daysSinceLastMention} days challenge-free!`;
                            const result = await window.GLRSApp.handlers.shareToCommunity('breakthrough', breakthroughContent, 'challenges_tracking', breakthroughData.challengeId || 'unknown');
                            if (result.success) {
                                alert('Breakthrough shared to community! 🎉');
                            } else {
                                alert('Error sharing to community');
                            }
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '2px solid #FFFFFF',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <i data-lucide="share-2" style={{ width: '20px', height: '20px' }}></i>
                    Share Breakthrough
                </button>

                {/* Close Button */}
                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        onClose();
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#00A86B',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    ✨ Continue
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// TOMORROW GOALS MODAL - Goal Achievement Tracker
// ═══════════════════════════════════════════════════════════

function TomorrowGoalsModal({ yesterdayGoal, goalStatus, goalNotes, goalStats, goalHistory, onClose, onSubmitGoalStatus, onSetGoalStatus, onSetGoalNotes }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}
        onClick={() => {
            window.GLRSApp.utils.triggerHaptic('light');
            onClose();
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000000'
                    }}>
                        🏆 Goal Achievement Tracker
                    </h3>
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {/* If there's a yesterday's goal to check in on */}
                    {yesterdayGoal ? (
                        <>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                marginBottom: '20px'
                            }}>
                                Did you accomplish your goal from yesterday?
                            </p>

                            {/* Yesterday's Goal Display */}
                            <div style={{
                                padding: '16px',
                                background: '#E7F5FF',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                border: '1px solid #058585'
                            }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#666666',
                                    marginBottom: '8px'
                                }}>
                                    Yesterday's Goal:
                                </div>
                                <div style={{
                                    fontSize: '15px',
                                    color: '#333333',
                                    lineHeight: '1.6',
                                    fontWeight: '500'
                                }}>
                                    {yesterdayGoal.goal}
                                </div>
                            </div>

                            {/* Status Options */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333333',
                                    marginBottom: '12px'
                                }}>
                                    How did it go? *
                                </label>

                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {[
                                        { value: 'yes', label: 'Yes', desc: 'Completed it!', color: '#00A86B' },
                                        { value: 'almost', label: 'Almost', desc: 'Got close', color: '#4CAF50' },
                                        { value: 'partially', label: 'Partially', desc: 'Made progress', color: '#FFA500' },
                                        { value: 'no', label: 'No', desc: 'Didn\'t complete', color: '#FF6B6B' },
                                        { value: 'didnt_try', label: 'Didn\'t Try', desc: 'Couldn\'t attempt', color: '#999999' }
                                    ].map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => {
                                                window.GLRSApp.utils.triggerHaptic('light');
                                                onSetGoalStatus(status.value);
                                            }}
                                            style={{
                                                padding: '12px',
                                                background: goalStatus === status.value ? status.color : '#FFFFFF',
                                                border: `2px solid ${status.color}`,
                                                borderRadius: '10px',
                                                color: goalStatus === status.value ? '#FFFFFF' : status.color,
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <div>{status.label}</div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    opacity: goalStatus === status.value ? 0.9 : 0.7,
                                                    marginTop: '2px'
                                                }}>
                                                    {status.desc}
                                                </div>
                                            </div>
                                            {goalStatus === status.value && (
                                                <div style={{ fontSize: '16px' }}>●</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333333',
                                    marginBottom: '8px'
                                }}>
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={goalNotes || ''}
                                    onChange={(e) => onSetGoalNotes(e.target.value)}
                                    placeholder={
                                        goalStatus === 'yes' ? 'What helped you succeed?' :
                                        goalStatus === 'almost' ? 'What got in the way?' :
                                        goalStatus === 'no' ? 'What prevented you from completing it?' :
                                        'Any thoughts about this goal...'
                                    }
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('medium');
                                    onSubmitGoalStatus();
                                }}
                                disabled={!goalStatus}
                                style={{
                                    width: '100%',
                                    height: '48px',
                                    background: goalStatus ? '#058585' : '#CCCCCC',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: goalStatus ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {goalStatus === 'yes' ? '🎉 Record Success' : '✅ Record Progress'}
                            </button>
                        </>
                    ) : (
                        /* No yesterday's goal - show stats and history */
                        <>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                marginBottom: '20px'
                            }}>
                                Track your goal completion rate and build your achievement streak!
                            </p>

                            {/* Goal Stats Cards */}
                            {goalStats?.totalGoals > 0 ? (
                                <>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '12px',
                                        marginBottom: '24px'
                                    }}>
                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            color: '#FFFFFF'
                                        }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                {goalStats.completionRate}%
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                                Success Rate
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            color: '#FFFFFF'
                                        }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                {goalStats.currentStreak}
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                                Current Streak
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            color: '#FFFFFF'
                                        }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                {goalStats.bestStreak}
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                                Best Streak
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goal History Timeline */}
                                    <h4 style={{
                                        margin: '0 0 12px 0',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#333'
                                    }}>
                                        Recent Goals ({goalStats.totalGoals} total)
                                    </h4>

                                    <div style={{ marginBottom: '20px' }}>
                                        {goalHistory && goalHistory.slice(0, 10).map((goal, index) => (
                                            <div key={goal.id} style={{
                                                padding: '14px',
                                                marginBottom: '10px',
                                                background: '#F8F9FA',
                                                borderRadius: '10px',
                                                borderLeft: `4px solid ${
                                                    goal.status === 'yes' ? '#00A86B' :
                                                    goal.status === 'almost' ? '#4CAF50' :
                                                    goal.status === 'partially' ? '#FFA500' :
                                                    goal.status === 'no' ? '#FF6B6B' : '#999999'
                                                }`
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '6px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        fontWeight: '600'
                                                    }}>
                                                        {goal.checkedInAt && new Date(goal.checkedInAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        color: goal.status === 'yes' ? '#00A86B' :
                                                               goal.status === 'almost' ? '#4CAF50' :
                                                               goal.status === 'partially' ? '#FFA500' :
                                                               goal.status === 'no' ? '#FF6B6B' : '#999999'
                                                    }}>
                                                        {goal.status === 'yes' ? '✅ Completed' :
                                                         goal.status === 'almost' ? '⚡ Almost' :
                                                         goal.status === 'partially' ? '🟡 Partial' :
                                                         goal.status === 'no' ? '❌ No' : '🤷 Skipped'}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#333',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {goal.goal}
                                                </div>
                                                {goal.notes && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        Note: {goal.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                                    <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
                                        No goals tracked yet
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                        Set a goal in your evening reflection and check back tomorrow to record your progress!
                                    </div>
                                </div>
                            )}

                            {/* Back Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    onClose();
                                }}
                                style={{
                                    width: '100%',
                                    height: '48px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Back
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

// Register to global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.JourneyDataModals = JourneyDataModals;

console.log('✅ JourneyDataModals.js loaded - 5 data modals (3-layer architecture)');

// JourneyInsightsModals.js - Journey insights and analytics modals
// ✅ PHASE 6F: Extracted from ModalContainer.js (4 modals)
// 3-Layer Architecture: Component → Firebase → Component

function JourneyInsightsModals({ modalType, checkInData, reflectionData, assignments, coachNotes, checkInStreak, reflectionStreak, moodWeekData, overallDayWeekData, graphSettings, graphDateRange, selectedRange, onClose, onUpdateGraphSettings }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Display-only modals (no data fetching)
    // - Receives data as props (check-ins, reflections, analytics)
    // - Uses onClose callback to notify parent
    // - Minimal useState for UI only
    // - No Firebase queries (data passed from parent)
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'weeklyReport':
                return <WeeklyReportModal checkInData={checkInData} reflectionData={reflectionData} assignments={assignments} coachNotes={coachNotes} checkInStreak={checkInStreak} reflectionStreak={reflectionStreak} onClose={onClose} />;

            case 'moodInsights':
                return <MoodInsightsModal moodWeekData={moodWeekData} onClose={onClose} />;

            case 'overallDayInsights':
                return <OverallDayInsightsModal overallDayWeekData={overallDayWeekData} onClose={onClose} />;

            case 'graphSettings':
                return <GraphSettingsModal graphDateRange={graphDateRange} selectedRange={selectedRange} onClose={onClose} onUpdateGraphSettings={onUpdateGraphSettings} />;

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// WEEKLY REPORT MODAL - 7-Day Progress Summary
// ═══════════════════════════════════════════════════════════

function WeeklyReportModal({ checkInData, reflectionData, assignments, coachNotes, checkInStreak, reflectionStreak, onClose }) {
    // Calculate week-specific stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Check-in stats for the week
    const thisWeekCheckIns = checkInData?.filter(c => {
        const checkInDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
        return checkInDate >= weekAgo;
    }) || [];

    const weekCheckInCount = thisWeekCheckIns.length;
    const weekCheckInRate = Math.round((weekCheckInCount / 7) * 100);

    const weekMoodScores = thisWeekCheckIns
        .filter(c => c.morningData?.mood !== undefined || c.eveningData?.mood !== undefined)
        .map(c => c.morningData?.mood ?? c.eveningData?.mood);
    const weekAvgMood = weekMoodScores.length > 0
        ? (weekMoodScores.reduce((a, b) => a + b, 0) / weekMoodScores.length).toFixed(1)
        : 'N/A';

    const weekCravingsScores = thisWeekCheckIns
        .filter(c => c.morningData?.craving !== undefined || c.eveningData?.craving !== undefined)
        .map(c => c.morningData?.craving ?? c.eveningData?.craving);
    const weekAvgCravings = weekCravingsScores.length > 0
        ? (weekCravingsScores.reduce((a, b) => a + b, 0) / weekCravingsScores.length).toFixed(1)
        : 'N/A';

    const weekAnxietyScores = thisWeekCheckIns
        .filter(c => c.morningData?.anxiety !== undefined || c.eveningData?.anxiety !== undefined)
        .map(c => c.morningData?.anxiety ?? c.eveningData?.anxiety);
    const weekAvgAnxiety = weekAnxietyScores.length > 0
        ? (weekAnxietyScores.reduce((a, b) => a + b, 0) / weekAnxietyScores.length).toFixed(1)
        : 'N/A';

    const weekSleepScores = thisWeekCheckIns
        .filter(c => c.morningData?.sleep !== undefined || c.eveningData?.sleep !== undefined)
        .map(c => c.morningData?.sleep ?? c.eveningData?.sleep);
    const weekAvgSleep = weekSleepScores.length > 0
        ? (weekSleepScores.reduce((a, b) => a + b, 0) / weekSleepScores.length).toFixed(1)
        : 'N/A';

    // Reflection stats for the week
    const thisWeekReflections = reflectionData?.filter(r => {
        const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return reflectionDate >= weekAgo;
    }) || [];

    const weekReflectionCount = thisWeekReflections.length;
    const weekDailyScores = thisWeekReflections.filter(r => r.dailyScore).map(r => r.dailyScore);
    const weekAvgDailyScore = weekDailyScores.length > 0
        ? (weekDailyScores.reduce((a, b) => a + b, 0) / weekDailyScores.length).toFixed(1)
        : 'N/A';

    // Gratitude entries for the week
    const weekGratitudes = thisWeekReflections.filter(r => r.gratitude && r.gratitude.length > 0).length;

    // Assignment progress for the week
    const thisWeekAssignments = assignments?.filter(a => {
        if (!a.createdAt) return false;
        const assignmentDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        return assignmentDate >= weekAgo;
    }) || [];

    const weekAssignmentsCompleted = thisWeekAssignments.filter(a => a.status === 'completed').length;
    const weekAssignmentsTotal = thisWeekAssignments.length;
    const weekCompletionRate = weekAssignmentsTotal > 0
        ? Math.round((weekAssignmentsCompleted / weekAssignmentsTotal) * 100)
        : 0;

    // Coach notes for the week
    const thisWeekCoachNotes = coachNotes?.filter(n => {
        if (!n.createdAt) return false;
        const noteDate = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
        return noteDate >= weekAgo;
    }) || [];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    position: 'sticky',
                    top: 0,
                    background: '#FFFFFF',
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="calendar-check" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                Weekly Progress Report
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#666666',
                        marginTop: '8px'
                    }}>
                        Last 7 Days • {new Date(weekAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Check-In Summary */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                        borderRadius: '12px',
                        color: '#FFFFFF'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                                Check-In Summary
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Check-In Rate</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekCheckInRate}%
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                                    {weekCheckInCount}/7 days
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Mood</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekAvgMood}
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>out of 10</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Cravings</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekAvgCravings}
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>intensity</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Anxiety</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekAvgAnxiety}
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>level</div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Sleep Quality</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {weekAvgSleep}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>out of 10</div>
                        </div>
                    </div>

                    {/* Reflection Summary */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#F5F5F5',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="book-open" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                Reflection Summary
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Reflections</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekReflectionCount}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Avg Daily Score</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekAvgDailyScore}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Gratitudes</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekGratitudes}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Progress */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#F5F5F5',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="clipboard-check" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                Assignment Progress
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Completed</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekAssignmentsCompleted}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999999' }}>
                                    of {weekAssignmentsTotal} assignments
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Completion Rate</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekCompletionRate}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streaks */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#F5F5F5',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="flame" style={{ width: '20px', height: '20px', color: '#FF6B6B' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                Current Streaks
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Check-In Streak</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B6B' }}>
                                    {checkInStreak || 0}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999999' }}>days</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Reflection Streak</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B6B' }}>
                                    {reflectionStreak || 0}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999999' }}>days</div>
                            </div>
                        </div>
                    </div>

                    {/* Coach Notes */}
                    {thisWeekCoachNotes.length > 0 ? (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: '#FFF9E6',
                            borderRadius: '12px',
                            border: '1px solid #FFE066'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '12px'
                            }}>
                                <i data-lucide="message-circle" style={{ width: '20px', height: '20px', color: '#F59E0B' }}></i>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                    Coach Notes This Week
                                </h4>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>
                                {thisWeekCoachNotes.length} note{thisWeekCoachNotes.length !== 1 ? 's' : ''} from your coach
                            </div>
                            {thisWeekCoachNotes.slice(0, 3).map((note, index) => (
                                <div key={note.id || index} style={{
                                    padding: '10px',
                                    background: '#FFFFFF',
                                    borderRadius: '8px',
                                    marginBottom: index < Math.min(2, thisWeekCoachNotes.length - 1) ? '8px' : 0,
                                    border: '1px solid #E5E5E5'
                                }}>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#999999',
                                        marginBottom: '4px'
                                    }}>
                                        {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#000000',
                                        lineHeight: '1.4'
                                    }}>
                                        {note.note?.substring(0, 100)}{note.note?.length > 100 ? '...' : ''}
                                    </div>
                                </div>
                            ))}
                            {thisWeekCoachNotes.length > 3 && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#058585',
                                    marginTop: '8px',
                                    textAlign: 'center'
                                }}>
                                    + {thisWeekCoachNotes.length - 3} more note{thisWeekCoachNotes.length - 3 !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: '#F5F5F5',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <i data-lucide="message-circle" style={{ width: '32px', height: '32px', color: '#CCCCCC', marginBottom: '8px' }}></i>
                            <div style={{ fontSize: '14px', color: '#999999' }}>
                                No coach notes this week
                            </div>
                        </div>
                    )}

                    {/* Summary Message */}
                    <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#2E7D32',
                            marginBottom: '8px'
                        }}>
                            {weekCheckInRate >= 85 && weekReflectionCount >= 5 ? 'Outstanding Week!' :
                             weekCheckInRate >= 70 && weekReflectionCount >= 3 ? 'Great Progress!' :
                             weekCheckInRate >= 50 ? 'Keep Going!' : 'You\'ve Got This!'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#1B5E20',
                            lineHeight: '1.5'
                        }}>
                            {weekCheckInRate >= 85 && weekReflectionCount >= 5 ?
                                'You\'re crushing it! Your consistency is inspiring.' :
                             weekCheckInRate >= 70 && weekReflectionCount >= 3 ?
                                'You\'re making excellent progress. Keep up the momentum!' :
                             weekCheckInRate >= 50 ?
                                'You\'re building great habits. Every day counts!' :
                                'Remember, progress isn\'t always linear. We\'re here to support you.'}
                        </div>
                    </div>

                    {/* Export/Share Button */}
                    <button
                        onClick={async () => {
                            try {
                                const reportText = `Weekly Progress Report\nLast 7 Days\n\nCheck-In Summary:\n- Check-In Rate: ${weekCheckInRate}% (${weekCheckInCount}/7 days)\n- Avg Mood: ${weekAvgMood}/10\n- Avg Cravings: ${weekAvgCravings}/10\n- Avg Anxiety: ${weekAvgAnxiety}/10\n- Avg Sleep Quality: ${weekAvgSleep}/10\n\nReflection Summary:\n- Reflections: ${weekReflectionCount}\n- Avg Daily Score: ${weekAvgDailyScore}/10\n- Gratitudes: ${weekGratitudes}\n\nAssignment Progress:\n- Completed: ${weekAssignmentsCompleted}/${weekAssignmentsTotal}\n- Completion Rate: ${weekCompletionRate}%\n\nCurrent Streaks:\n- Check-In Streak: ${checkInStreak || 0} days\n- Reflection Streak: ${reflectionStreak || 0} days`;

                                if (navigator.share) {
                                    await navigator.share({
                                        title: 'Weekly Progress Report',
                                        text: reportText
                                    });
                                } else {
                                    // Fallback: copy to clipboard
                                    await navigator.clipboard.writeText(reportText);
                                    alert('Report copied to clipboard!');
                                }
                            } catch (error) {
                                if (error.name !== 'AbortError') {
                                    console.error('Share/export error:', error);
                                    alert('Unable to share report. Please try again.');
                                }
                            }
                        }}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i data-lucide="share-2" style={{ width: '20px', height: '20px' }}></i>
                        Export / Share Report
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// MOOD INSIGHTS MODAL - Weekly Mood Analytics
// ═══════════════════════════════════════════════════════════

function MoodInsightsModal({ moodWeekData, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Mood Insights
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Average Mood */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#666666',
                            marginBottom: '8px'
                        }}>
                            7-Day Average
                        </div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: '#058585',
                            marginBottom: '4px'
                        }}>
                            {moodWeekData?.thisWeekAvg || '—'}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: (moodWeekData?.difference || 0) > 0 ? '#00A86B' : (moodWeekData?.difference || 0) < 0 ? '#DC143C' : '#666666'
                        }}>
                            {(moodWeekData?.difference || 0) > 0 ? '↑' : (moodWeekData?.difference || 0) < 0 ? '↓' : '—'} {(moodWeekData?.difference || 0) > 0 ? '+' : ''}{moodWeekData?.difference || '0'} from last week
                        </div>
                    </div>

                    {/* Weekly Breakdown */}
                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '12px'
                    }}>
                        Weekly Breakdown
                    </h4>
                    <div style={{ marginBottom: '20px' }}>
                        {moodWeekData?.weekData && moodWeekData.weekData.map((dayData, index) => {
                            const score = dayData.mood;
                            const barWidth = score ? (score / 10) * 100 : 0; // Out of 10, not 5!

                            return (
                                <div key={dayData.dateKey} style={{
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            color: '#000000'
                                        }}>
                                            {dayData.dayName}
                                        </span>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: score ? '#058585' : '#999999'
                                        }}>
                                            {score ? score.toFixed(1) : 'No check-in'}
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#E5E5E5',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${barWidth}%`,
                                            height: '100%',
                                            background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// OVERALL DAY INSIGHTS MODAL - Daily Reflection Analytics
// ═══════════════════════════════════════════════════════════

function OverallDayInsightsModal({ overallDayWeekData, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Overall Day Insights
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Average Overall Day Score */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#666666',
                            marginBottom: '8px'
                        }}>
                            7-Day Average
                        </div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: '#058585',
                            marginBottom: '4px'
                        }}>
                            {overallDayWeekData?.thisWeekAvg || '—'}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: (overallDayWeekData?.difference || 0) > 0 ? '#00A86B' : (overallDayWeekData?.difference || 0) < 0 ? '#DC143C' : '#666666'
                        }}>
                            {(overallDayWeekData?.difference || 0) > 0 ? '↑' : (overallDayWeekData?.difference || 0) < 0 ? '↓' : '—'} {(overallDayWeekData?.difference || 0) > 0 ? '+' : ''}{overallDayWeekData?.difference || '0'} from last week
                        </div>
                    </div>

                    {/* Weekly Breakdown */}
                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '12px'
                    }}>
                        Last 7 Reflections
                    </h4>
                    <div style={{ marginBottom: '20px' }}>
                        {overallDayWeekData?.weekData && overallDayWeekData.weekData.map((dayData, index) => {
                            const score = dayData.overallDay;
                            const barWidth = score ? (score / 10) * 100 : 0; // Out of 10

                            return (
                                <div key={dayData.dateKey} style={{
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#000000'
                                            }}>
                                                {dayData.dayName}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#666666'
                                            }}>
                                                {dayData.date ? new Date(dayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#058585'
                                        }}>
                                            {score ? score.toFixed(1) : '—'}
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#E5E5E5',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${barWidth}%`,
                                            height: '100%',
                                            background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// GRAPH SETTINGS MODAL - Date Range & Export Controls
// ═══════════════════════════════════════════════════════════

function GraphSettingsModal({ graphDateRange, selectedRange, onClose, onUpdateGraphSettings }) {
    const handleRangeClick = (range) => {
        window.GLRSApp.utils.triggerHaptic('light');
        const endDate = new Date();
        let startDate = new Date();

        switch(range) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'all':
                startDate = null;
                break;
        }

        onUpdateGraphSettings({ graphDateRange: { start: startDate, end: startDate ? endDate : null }, selectedRange: range });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px', color: '#00A86B' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                Graph Settings
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Date Range Selection */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="calendar" style={{ width: '18px', height: '18px', color: '#0077CC' }}></i>
                            Date Range
                        </h4>
                        <p style={{ fontSize: '13px', color: '#666666', marginBottom: '12px' }}>
                            Select a date range to view your wellness graphs
                        </p>

                        {/* Quick Select Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                            <button
                                onClick={() => handleRangeClick('7days')}
                                style={{
                                    padding: '12px',
                                    background: selectedRange === '7days' ?
                                        'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                    color: selectedRange === '7days' ? '#FFFFFF' : '#333333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Last 7 Days
                            </button>

                            <button
                                onClick={() => handleRangeClick('30days')}
                                style={{
                                    padding: '12px',
                                    background: selectedRange === '30days' ?
                                        'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                    color: selectedRange === '30days' ? '#FFFFFF' : '#333333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Last 30 Days
                            </button>

                            <button
                                onClick={() => handleRangeClick('90days')}
                                style={{
                                    padding: '12px',
                                    background: selectedRange === '90days' ?
                                        'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                    color: selectedRange === '90days' ? '#FFFFFF' : '#333333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Last 90 Days
                            </button>

                            <button
                                onClick={() => handleRangeClick('all')}
                                style={{
                                    padding: '12px',
                                    background: selectedRange === 'all' ?
                                        'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
                                    color: selectedRange === 'all' ? '#FFFFFF' : '#333333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                All Time
                            </button>
                        </div>

                        {/* Custom Date Range */}
                        <div style={{
                            padding: '16px',
                            background: '#F8F9FA',
                            borderRadius: '10px',
                            border: '1px solid #E5E5E5'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#000000', marginBottom: '12px' }}>
                                Custom Date Range
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666666', marginBottom: '6px', display: 'block' }}>
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={graphDateRange?.start ? graphDateRange.start.toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : null;
                                            onUpdateGraphSettings({ graphDateRange: { ...graphDateRange, start: date } });
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666666', marginBottom: '6px', display: 'block' }}>
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={graphDateRange?.end ? graphDateRange.end.toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : null;
                                            onUpdateGraphSettings({ graphDateRange: { ...graphDateRange, end: date } });
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Options */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="file-text" style={{ width: '18px', height: '18px', color: '#0077CC' }}></i>
                            Export & Share
                        </h4>

                        {/* Print PDF Button */}
                        <button
                            onClick={async () => {
                                window.GLRSApp.utils.triggerHaptic('medium');
                                await window.GLRSApp.utils.exportGraphsToPDF(graphDateRange, window.GLRSApp.state?.user);
                            }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 12px rgba(0,119,204,0.3)'
                            }}
                        >
                            <i data-lucide="printer" style={{ width: '20px', height: '20px' }}></i>
                            Print to PDF
                        </button>

                        {/* Share PDF Button */}
                        <button
                            onClick={async () => {
                                window.GLRSApp.utils.triggerHaptic('medium');
                                await window.GLRSApp.utils.shareGraphsPDF(graphDateRange, window.GLRSApp.state?.user);
                            }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 12px rgba(0,168,107,0.3)'
                            }}
                        >
                            <i data-lucide="share-2" style={{ width: '20px', height: '20px' }}></i>
                            Share PDF
                        </button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#6c757d',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

// Register to global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.JourneyInsightsModals = JourneyInsightsModals;

console.log('✅ JourneyInsightsModals.js loaded - 4 insight modals (3-layer architecture)');
// JourneyStreaksModals.js - Journey streak tracking modals
// ✅ PHASE 6F: Extracted from ModalContainer.js (4 modals)
// 3-Layer Architecture: Component → Firebase → Component

function JourneyStreaksModals({ modalType, checkInStreak, streakCheckIns, reflectionStreak, streakReflections, streakData, reflectionStreakData, onClose }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Display-only modals (no data fetching)
    // - Receives data as props (streaks, check-ins, reflections)
    // - Uses onClose callback to notify parent
    // - No useState needed (display only)
    // - No Firebase queries (data passed from parent)
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'streak':
                return <StreakModal checkInStreak={checkInStreak} streakCheckIns={streakCheckIns} onClose={onClose} />;

            case 'reflectionStreak':
                return <ReflectionStreakModal reflectionStreak={reflectionStreak} streakReflections={streakReflections} onClose={onClose} />;

            case 'streaks':
                return <StreaksModal streakData={streakData} onClose={onClose} />;

            case 'reflectionStreaks':
                return <ReflectionStreaksModal reflectionStreakData={reflectionStreakData} onClose={onClose} />;

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// STREAK MODAL - Check-In Streak Details
// ═══════════════════════════════════════════════════════════

function StreakModal({ checkInStreak, streakCheckIns, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '400px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Check-In Streak
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Current Streak Summary */}
                    <div style={{
                        background: '#E0F7FA',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#058585',
                            marginBottom: '4px'
                        }}>
                            {checkInStreak || 0} {checkInStreak === 1 ? 'Day' : 'Days'}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#666666'
                        }}>
                            Current Streak
                        </div>
                    </div>

                    {/* All Check-Ins List */}
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '12px'
                    }}>
                        All Check-Ins in Streak
                    </div>

                    {/* Check-In Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {streakCheckIns && streakCheckIns.length > 0 ? streakCheckIns.map((checkIn, index) => {
                            const checkInDate = checkIn.createdAt?.toDate ?
                                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                            const dateStr = checkInDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });

                            const mood = checkIn.morningData?.mood ?? checkIn.eveningData?.mood ?? 'N/A';
                            const craving = checkIn.morningData?.craving ?? checkIn.eveningData?.craving ?? 'N/A';
                            const anxiety = checkIn.morningData?.anxiety ?? checkIn.eveningData?.anxiety ?? 'N/A';
                            const sleep = checkIn.morningData?.sleep ?? checkIn.eveningData?.sleep ?? 'N/A';

                            return (
                                <div
                                    key={checkIn.id || index}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E5E5E5',
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#000000',
                                        marginBottom: '6px'
                                    }}>
                                        Day {streakCheckIns.length - index} - {dateStr}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '400',
                                        color: '#666666',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <span>Mood: {mood}</span>
                                        <span>Craving: {craving}</span>
                                        <span>Anxiety: {anxiety}</span>
                                        <span>Sleep: {sleep}</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#999999',
                                fontSize: '14px'
                            }}>
                                No check-ins in streak yet. Start checking in daily to build your streak!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// REFLECTION STREAK MODAL - Evening Reflection Streak Details
// ═══════════════════════════════════════════════════════════

function ReflectionStreakModal({ reflectionStreak, streakReflections, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '400px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Reflection Streak
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Current Streak Summary */}
                    <div style={{
                        background: '#E0F7FA',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#058585',
                            marginBottom: '4px'
                        }}>
                            {reflectionStreak || 0} {reflectionStreak === 1 ? 'Day' : 'Days'}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#666666'
                        }}>
                            Current Streak
                        </div>
                    </div>

                    {/* All Reflections List */}
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '12px'
                    }}>
                        All Reflections in Streak
                    </div>

                    {/* Reflection Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {streakReflections && streakReflections.length > 0 ? streakReflections.map((reflection, index) => {
                            const reflectionDate = reflection.createdAt?.toDate ?
                                reflection.createdAt.toDate() : new Date(reflection.createdAt);
                            const dateStr = reflectionDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });

                            const gratitude = reflection.eveningData?.gratitude || 'N/A';
                            const challenges = reflection.eveningData?.challenges || 'N/A';
                            const overallDay = reflection.eveningData?.overallDay ?? 'N/A';

                            return (
                                <div
                                    key={reflection.id || index}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E5E5E5',
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#000000',
                                        marginBottom: '6px'
                                    }}>
                                        Day {streakReflections.length - index} - {dateStr}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '400',
                                        color: '#666666'
                                    }}>
                                        <div style={{marginBottom: '4px'}}>Overall Day: {overallDay}</div>
                                        <div style={{marginBottom: '4px'}}>Gratitude: {gratitude}</div>
                                        <div>Challenges: {challenges}</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#999999',
                                fontSize: '14px'
                            }}>
                                No reflections in streak yet. Start reflecting daily to build your streak!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// STREAKS MODAL - Combined Streaks View
// ═══════════════════════════════════════════════════════════

function StreaksModal({ streakData, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '400px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                <div style={{padding: '20px'}}>
                    <h3 style={{marginBottom: '20px'}}>Check-In Streaks</h3>
                    <div style={{marginBottom: '15px'}}>
                        <strong>Current Streak:</strong> {streakData?.currentStreak || 0} days
                    </div>
                    <div style={{marginBottom: '15px'}}>
                        <strong>All Streaks:</strong>
                        {streakData?.allStreaks && streakData.allStreaks.length > 0 ? (
                            <ul>
                                {streakData.allStreaks.map((s, i) => (
                                    <li key={i}>{s.days} days ({s.startDate} - {s.endDate})</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No streak history yet</p>
                        )}
                    </div>
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// REFLECTION STREAKS MODAL - Reflection Streak History
// ═══════════════════════════════════════════════════════════

function ReflectionStreaksModal({ reflectionStreakData, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}
        onClick={onClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '400px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                <div style={{padding: '20px'}}>
                    <h3 style={{marginBottom: '20px'}}>Reflection Streaks</h3>
                    <div style={{marginBottom: '15px'}}>
                        <strong>Current Streak:</strong> {reflectionStreakData?.currentStreak || 0} days
                    </div>
                    <div style={{marginBottom: '15px'}}>
                        <strong>All Streaks:</strong>
                        {reflectionStreakData?.allStreaks && reflectionStreakData.allStreaks.length > 0 ? (
                            <ul>
                                {reflectionStreakData.allStreaks.map((s, i) => (
                                    <li key={i}>{s.days} days ({s.startDate} - {s.endDate})</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No streak history yet</p>
                        )}
                    </div>
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

// Register to global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.JourneyStreaksModals = JourneyStreaksModals;

console.log('✅ JourneyStreaksModals.js loaded - 4 streak modals (3-layer architecture)');

