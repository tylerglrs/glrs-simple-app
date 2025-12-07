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
    const [showSidebar, setShowSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Calendar modal state
    const [activeModal, setActiveModal] = useState(null);
    const [checkIns, setCheckIns] = useState([]);
    const [reflections, setReflections] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [coachNotes, setCoachNotes] = useState([]);
    const [startDate, setStartDate] = useState(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return thirtyDaysAgo.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Calendar view state
    const [calendarFilter, setCalendarFilter] = useState('week'); // 'week' | 'month' | 'all'
    const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - day);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDateDetail, setShowDateDetail] = useState(false);

    // Global navigation function for setting Journey sub-tab from other components
    React.useEffect(() => {
        window.navigateToJourneySubTab = (subTab) => {
            setActiveJourneyTab(subTab);
        };
        return () => {
            delete window.navigateToJourneySubTab;
        };
    }, []);

    // Responsive resize listener
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabButtonStyles = (isActive) => ({
        flex: '1',
        padding: isMobile ? '10px 12px' : '12px 20px',
        fontSize: isMobile ? '13px' : '14px',
        fontWeight: '600',
        color: isActive ? '#ffffff' : '#5A9FD4',
        backgroundColor: isActive ? '#5A9FD4' : 'transparent',
        border: 'none',
        borderRadius: isMobile ? '6px' : '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: isMobile ? '0.3px' : '0.5px',
        minHeight: isMobile ? '44px' : 'auto'
    });

    // Get current user for profile avatar
    const [currentUser, setCurrentUser] = React.useState(null);

    React.useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            setCurrentUser(user);

            // Load calendar data when user authenticates
            if (user) {
                loadCalendarData(user.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    // Load calendar data (check-ins, reflections, assignments, coach notes)
    const loadCalendarData = async (userId) => {
        try {
            const db = firebase.firestore();

            // Load last 90 days of check-ins
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const checkInsSnap = await db.collection('checkIns')
                .where('userId', '==', userId)
                .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(ninetyDaysAgo))
                .orderBy('createdAt', 'desc')
                .get();

            const checkInsData = checkInsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ensure timestamp field exists for calendar compatibility
                    timestamp: data.timestamp || data.createdAt
                };
            });
            setCheckIns(checkInsData);

            // Load reflections
            const reflectionsSnap = await db.collection('reflections')
                .where('userId', '==', userId)
                .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(ninetyDaysAgo))
                .orderBy('createdAt', 'desc')
                .get();

            const reflectionsData = reflectionsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ensure timestamp field exists for calendar compatibility
                    timestamp: data.timestamp || data.createdAt
                };
            });
            setReflections(reflectionsData);

            // Load assignments
            const assignmentsSnap = await db.collection('assignments')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            const assignmentsData = assignmentsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAssignments(assignmentsData);

            // Load coach notes
            const coachNotesSnap = await db.collection('coachNotes')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            const coachNotesData = coachNotesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCoachNotes(coachNotesData);

        } catch (error) {
            console.error('Error loading calendar data:', error);
        }
    };

    // Navigation functions
    const goToPreviousWeek = () => {
        const newWeekStart = new Date(selectedWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() - 7);
        setSelectedWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(selectedWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + 7);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Only allow if new week starts before or on today
        if (newWeekStart <= today) {
            setSelectedWeekStart(newWeekStart);
        }
    };

    const goToPreviousMonth = () => {
        const newMonth = new Date(selectedMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setSelectedMonth(newMonth);
    };

    const goToNextMonth = () => {
        const newMonth = new Date(selectedMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);
        const today = new Date();
        // Only allow if new month is not in the future
        if (newMonth.getFullYear() < today.getFullYear() ||
            (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() <= today.getMonth())) {
            setSelectedMonth(newMonth);
        }
    };

    const isCurrentWeek = () => {
        const today = new Date();
        const day = today.getDay();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - day);
        currentWeekStart.setHours(0, 0, 0, 0);
        return selectedWeekStart.getTime() === currentWeekStart.getTime();
    };

    const isCurrentMonth = () => {
        const today = new Date();
        return selectedMonth.getFullYear() === today.getFullYear() &&
               selectedMonth.getMonth() === today.getMonth();
    };

    // Initialize Lucide icons when modals open
    React.useEffect(() => {
        if (activeModal && typeof lucide !== 'undefined' && lucide.createIcons) {
            setTimeout(() => {
                lucide.createIcons();
            }, 150);
        }
    }, [activeModal]);

    // Initialize Lucide icons when sidebar opens
    React.useEffect(() => {
        if (showSidebar && typeof lucide !== 'undefined' && lucide.createIcons) {
            setTimeout(() => {
                lucide.createIcons();
            }, 150);
        }
    }, [showSidebar]);

    return React.createElement(
        'div',
        { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },

        // Journey Tab Header
        React.createElement(
            'div',
            {
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '48px',
                    background: '#058585',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    zIndex: 100,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
            },

            // Left side: Hamburger + Title
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '12px' } },

                // Hamburger Menu Button
                React.createElement(
                    'button',
                    {
                        onClick: () => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('medium');
                            }
                            setShowSidebar(true);
                        },
                        style: {
                            background: 'none',
                            border: 'none',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        title: "Journey Tools"
                    },
                    React.createElement('i', { 'data-lucide': 'menu', style: { width: '24px', height: '24px' } })
                ),

                // Title
                React.createElement(
                    'h1',
                    { style: { margin: 0, color: 'white', fontSize: '18px', fontWeight: 'bold' } },
                    'Journey'
                )
            ),

            // Right side icons container
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '12px' } },

                // Calendar Icon
                React.createElement(
                    'div',
                    {
                        onClick: () => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('light');
                            }
                            setActiveModal('journeyCalendar');
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; },
                        onMouseLeave: (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; },
                        title: 'Calendar & Insights',
                        style: {
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }
                    },
                    React.createElement('i', {
                        'data-lucide': 'calendar',
                        style: { width: '20px', height: '20px' }
                    })
                ),

                // Profile Icon
                React.createElement(
                    'button',
                    {
                        onClick: () => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('light');
                            }
                            // Dispatch custom event to navigate to profile tab
                            window.dispatchEvent(new CustomEvent('glrs-navigate', {
                                detail: { view: 'profile' }
                            }));
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; },
                        onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent'; },
                        title: 'Profile',
                        style: {
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: '8px',
                            transition: 'background 0.2s'
                        }
                    },
                    React.createElement('i', {
                        'data-lucide': 'user',
                        style: { width: '20px', height: '20px', color: '#FFFFFF' }
                    })
                )
            )
        ),

        // Tab Navigation
        React.createElement(
            'div',
            { style: {
                display: 'flex',
                gap: isMobile ? '6px' : '8px',
                padding: isMobile ? '12px' : '16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e0e0e0',
                position: 'fixed',
                top: '48px',
                left: 0,
                right: 0,
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
            { style: { flex: '1', overflow: 'auto', paddingTop: '120px', paddingBottom: '80px' } },
            activeJourneyTab === 'life' && React.createElement(window.GLRSApp.components.JourneyLifeTab),
            activeJourneyTab === 'wellness' && React.createElement(window.GLRSApp.components.JourneyWellnessTab),
            activeJourneyTab === 'finances' && React.createElement(window.GLRSApp.components.JourneyFinancesTab)
        ),

        // ========== CALENDAR & INSIGHTS MODALS ==========

        // JOURNEY CALENDAR MODAL (Entry Menu)
        activeModal === 'journeyCalendar' && (() => {
            return React.createElement(
                'div',
                {
                    onClick: () => {
                        setActiveModal(null);
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                    },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            backgroundColor: 'white',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '20px' : '24px',
                            maxWidth: isMobile ? '95%' : '400px',
                            width: '100%',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                        }
                    },
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                        React.createElement('h2', { style: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' } }, 'Journey Calendar'),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal(null);
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '0',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                            '×'
                        )
                    ),

                    // Menu Options
                    React.createElement(
                        'div',
                        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },

                        // Check-In Calendar Button
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal('calendarHeatmap');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    padding: '16px',
                                    backgroundColor: '#5A9FD4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'background 0.2s'
                                },
                                onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#4a8fc4'; },
                                onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#5A9FD4'; }
                            },
                            React.createElement('i', { 'data-lucide': 'calendar', style: { width: '20px', height: '20px' } }),
                            'Check-In Calendar'
                        ),

                        // Graph Settings Button
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal('graphSettings');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    padding: '16px',
                                    backgroundColor: '#5A9FD4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'background 0.2s'
                                },
                                onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#4a8fc4'; },
                                onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#5A9FD4'; }
                            },
                            React.createElement('i', { 'data-lucide': 'settings', style: { width: '20px', height: '20px' } }),
                            'Graph Settings'
                        )
                    )
                )
            );
        })(),

        // CALENDAR HEATMAP MODAL (NEW IMPROVED VERSION)
        activeModal === 'calendarHeatmap' && (() => {
            // Helper functions
            const getDateData = (date) => {
                const dateCheckIns = checkIns.filter(ci => {
                    const ciDate = ci.timestamp?.toDate?.() || new Date(ci.timestamp);
                    ciDate.setHours(0, 0, 0, 0);
                    return ciDate.getTime() === date.getTime();
                });

                const dateReflections = reflections.filter(r => {
                    const rDate = r.timestamp?.toDate?.() || new Date(r.timestamp);
                    rDate.setHours(0, 0, 0, 0);
                    return rDate.getTime() === date.getTime();
                });

                let color = '#e0e0e0'; // gray
                const checkInCount = dateCheckIns.length;
                if (checkInCount >= 2) color = '#34d399'; // green
                else if (checkInCount === 1) color = '#86efac'; // light green

                return { checkIns: dateCheckIns, reflections: dateReflections, color, checkInCount };
            };

            // Calculate totals based on filter
            let totalCheckIns = 0;
            let totalReflections = 0;
            let displayDates = [];

            if (calendarFilter === 'week') {
                // Week view - single row of 7 days
                for (let i = 0; i < 7; i++) {
                    const date = new Date(selectedWeekStart);
                    date.setDate(date.getDate() + i);
                    date.setHours(0, 0, 0, 0);
                    const data = getDateData(date);
                    totalCheckIns += data.checkInCount;
                    // Count evening check-ins as reflections
                    const eveningCount = data.checkIns.filter(ci =>
                        ci.type === 'evening' || ci.checkInType === 'evening' || ci.timeOfDay === 'evening' || (ci.eveningData && Object.keys(ci.eveningData).length > 0)
                    ).length;
                    totalReflections += eveningCount;
                    displayDates.push({ date, ...data });
                }
            } else if (calendarFilter === 'month') {
                // Month view - full calendar grid
                const year = selectedMonth.getFullYear();
                const month = selectedMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDay = firstDay.getDay();

                // Add empty cells for days before month starts
                for (let i = 0; i < startDay; i++) {
                    displayDates.push(null);
                }

                // Add all days in month
                for (let day = 1; day <= lastDay.getDate(); day++) {
                    const date = new Date(year, month, day);
                    date.setHours(0, 0, 0, 0);
                    const data = getDateData(date);
                    totalCheckIns += data.checkInCount;
                    // Count evening check-ins as reflections
                    const eveningCount = data.checkIns.filter(ci =>
                        ci.type === 'evening' || ci.checkInType === 'evening' || ci.timeOfDay === 'evening' || (ci.eveningData && Object.keys(ci.eveningData).length > 0)
                    ).length;
                    totalReflections += eveningCount;
                    displayDates.push({ date, ...data });
                }
            } else {
                // All time view - calculate totals for all data
                totalCheckIns = checkIns.length;
                // Count evening check-ins as reflections
                totalReflections = checkIns.filter(ci =>
                    ci.type === 'evening' || ci.checkInType === 'evening' || ci.timeOfDay === 'evening' || (ci.eveningData && Object.keys(ci.eveningData).length > 0)
                ).length;
            }

            // Render week navigation
            const renderWeekNav = () => {
                const weekEnd = new Date(selectedWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                return React.createElement(
                    'div',
                    { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                    React.createElement(
                        'button',
                        {
                            onClick: () => {
                                goToPreviousWeek();
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                            },
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#5A9FD4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }
                        },
                        '← Previous'
                    ),
                    React.createElement(
                        'div',
                        { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' } },
                        `${selectedWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    ),
                    React.createElement(
                        'button',
                        {
                            onClick: () => {
                                goToNextWeek();
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                            },
                            disabled: isCurrentWeek(),
                            style: {
                                padding: '8px 16px',
                                backgroundColor: isCurrentWeek() ? '#cbd5e1' : '#5A9FD4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: isCurrentWeek() ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                opacity: isCurrentWeek() ? 0.5 : 1
                            }
                        },
                        'Next →'
                    )
                );
            };

            // Render month navigation
            const renderMonthNav = () => {
                return React.createElement(
                    'div',
                    { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                    React.createElement(
                        'button',
                        {
                            onClick: () => {
                                goToPreviousMonth();
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                            },
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#5A9FD4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }
                        },
                        '← Previous'
                    ),
                    React.createElement(
                        'div',
                        { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' } },
                        selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    ),
                    React.createElement(
                        'button',
                        {
                            onClick: () => {
                                goToNextMonth();
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                            },
                            disabled: isCurrentMonth(),
                            style: {
                                padding: '8px 16px',
                                backgroundColor: isCurrentMonth() ? '#cbd5e1' : '#5A9FD4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: isCurrentMonth() ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                opacity: isCurrentMonth() ? 0.5 : 1
                            }
                        },
                        'Next →'
                    )
                );
            };

            // Render week calendar (single row)
            const renderWeekCalendar = () => {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return React.createElement(
                    'div',
                    null,
                    // Day names header
                    React.createElement(
                        'div',
                        { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' } },
                        dayNames.map((name, i) => React.createElement(
                            'div',
                            { key: i, style: { textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', padding: '4px' } },
                            name
                        ))
                    ),
                    // Week dates
                    React.createElement(
                        'div',
                        { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' } },
                        displayDates.map((dayData, i) => {
                            const isToday = dayData.date.toDateString() === new Date().toDateString();
                            return React.createElement(
                                'div',
                                {
                                    key: i,
                                    onClick: () => {
                                        setSelectedDate(dayData);
                                        setShowDateDetail(true);
                                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                        }
                                    },
                                    style: {
                                        aspectRatio: '1',
                                        backgroundColor: dayData.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: isToday ? '2px solid #5A9FD4' : 'none',
                                        position: 'relative',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                },
                                React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' } }, dayData.date.getDate())
                            );
                        })
                    )
                );
            };

            // Render month calendar (grid)
            const renderMonthCalendar = () => {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return React.createElement(
                    'div',
                    null,
                    // Day names header
                    React.createElement(
                        'div',
                        { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' } },
                        dayNames.map((name, i) => React.createElement(
                            'div',
                            { key: i, style: { textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', padding: '4px' } },
                            name
                        ))
                    ),
                    // Month dates grid
                    React.createElement(
                        'div',
                        { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' } },
                        displayDates.map((dayData, i) => {
                            if (!dayData) {
                                return React.createElement('div', { key: i, style: { aspectRatio: '1' } });
                            }
                            const isToday = dayData.date.toDateString() === new Date().toDateString();
                            return React.createElement(
                                'div',
                                {
                                    key: i,
                                    onClick: () => {
                                        setSelectedDate(dayData);
                                        setShowDateDetail(true);
                                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                        }
                                    },
                                    style: {
                                        aspectRatio: '1',
                                        backgroundColor: dayData.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: isToday ? '2px solid #5A9FD4' : 'none',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                },
                                React.createElement('div', { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' } }, dayData.date.getDate())
                            );
                        })
                    )
                );
            };

            // Render all time view (scrollable list of months)
            const renderAllTimeView = () => {
                // Generate last 12 months
                const months = [];
                const today = new Date();
                for (let i = 11; i >= 0; i--) {
                    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    months.push(monthDate);
                }

                return React.createElement(
                    'div',
                    { style: { maxHeight: '60vh', overflowY: 'auto' } },
                    months.map((monthDate, monthIndex) => {
                        const year = monthDate.getFullYear();
                        const month = monthDate.getMonth();
                        const firstDay = new Date(year, month, 1);
                        const lastDay = new Date(year, month + 1, 0);
                        const startDay = firstDay.getDay();
                        const monthDates = [];

                        // Empty cells before month
                        for (let i = 0; i < startDay; i++) {
                            monthDates.push(null);
                        }

                        // Days in month
                        for (let day = 1; day <= lastDay.getDate(); day++) {
                            const date = new Date(year, month, day);
                            date.setHours(0, 0, 0, 0);
                            monthDates.push({ date, ...getDateData(date) });
                        }

                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                        return React.createElement(
                            'div',
                            { key: monthIndex, style: { marginBottom: '32px' } },
                            React.createElement(
                                'h3',
                                { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } },
                                monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            ),
                            // Day names
                            React.createElement(
                                'div',
                                { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' } },
                                dayNames.map((name, i) => React.createElement(
                                    'div',
                                    { key: i, style: { textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#64748b', padding: '2px' } },
                                    name
                                ))
                            ),
                            // Month grid
                            React.createElement(
                                'div',
                                { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' } },
                                monthDates.map((dayData, i) => {
                                    if (!dayData) {
                                        return React.createElement('div', { key: i, style: { aspectRatio: '1' } });
                                    }
                                    const isToday = dayData.date.toDateString() === new Date().toDateString();
                                    return React.createElement(
                                        'div',
                                        {
                                            key: i,
                                            onClick: () => {
                                                setSelectedDate(dayData);
                                                setShowDateDetail(true);
                                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                                    window.GLRSApp.utils.triggerHaptic('light');
                                                }
                                            },
                                            style: {
                                                aspectRatio: '1',
                                                backgroundColor: dayData.color,
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                border: isToday ? '2px solid #5A9FD4' : 'none',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                color: '#2c3e50'
                                            }
                                        },
                                        dayData.date.getDate()
                                    );
                                })
                            )
                        );
                    })
                );
            };

            return React.createElement(
                'div',
                {
                    onClick: () => {
                        setActiveModal('journeyCalendar');
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                    },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            backgroundColor: 'white',
                            borderRadius: isMobile ? '12px' : '16px',
                            padding: isMobile ? '20px' : '24px',
                            maxWidth: isMobile ? '95%' : '700px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }
                    },

                    // Header with back button
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
                        React.createElement('h2', { style: { margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#2c3e50' } }, 'Check-In Calendar'),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal('journeyCalendar');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '4px 8px'
                                }
                            },
                            '←'
                        )
                    ),

                    // Filter tabs
                    React.createElement(
                        'div',
                        { style: { display: 'flex', gap: '8px', marginBottom: '24px' } },
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setCalendarFilter('week');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: calendarFilter === 'week' ? '#5A9FD4' : '#f1f5f9',
                                    color: calendarFilter === 'week' ? 'white' : '#64748b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }
                            },
                            'This Week'
                        ),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setCalendarFilter('month');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: calendarFilter === 'month' ? '#5A9FD4' : '#f1f5f9',
                                    color: calendarFilter === 'month' ? 'white' : '#64748b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }
                            },
                            'Month'
                        ),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setCalendarFilter('all');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: calendarFilter === 'all' ? '#5A9FD4' : '#f1f5f9',
                                    color: calendarFilter === 'all' ? 'white' : '#64748b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }
                            },
                            'All Time'
                        )
                    ),

                    // Totals header
                    React.createElement(
                        'div',
                        { style: { display: 'flex', gap: '16px', marginBottom: '24px' } },
                        React.createElement(
                            'div',
                            { style: { flex: 1, padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '10px' } },
                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' } }, 'Total Check-Ins'),
                            React.createElement('div', { style: { fontSize: '28px', fontWeight: 'bold', color: '#5A9FD4' } }, totalCheckIns)
                        ),
                        React.createElement(
                            'div',
                            { style: { flex: 1, padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '10px' } },
                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' } }, 'Total Reflections'),
                            React.createElement('div', { style: { fontSize: '28px', fontWeight: 'bold', color: '#34d399' } }, totalReflections)
                        )
                    ),

                    // Legend
                    React.createElement(
                        'div',
                        { style: { display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '12px', color: '#64748b', justifyContent: 'center' } },
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                            React.createElement('div', { style: { width: '14px', height: '14px', backgroundColor: '#34d399', borderRadius: '3px' } }),
                            'Both Check-Ins'
                        ),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                            React.createElement('div', { style: { width: '14px', height: '14px', backgroundColor: '#86efac', borderRadius: '3px' } }),
                            'One Check-In'
                        ),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                            React.createElement('div', { style: { width: '14px', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '3px' } }),
                            'No Check-Ins'
                        )
                    ),

                    // Navigation (week or month)
                    calendarFilter === 'week' && renderWeekNav(),
                    calendarFilter === 'month' && renderMonthNav(),

                    // Calendar view
                    calendarFilter === 'week' && renderWeekCalendar(),
                    calendarFilter === 'month' && renderMonthCalendar(),
                    calendarFilter === 'all' && renderAllTimeView()
                )
            );
        })(),

        // DATE DETAIL MODAL (SLIDE IN FROM RIGHT)
        showDateDetail && selectedDate && (() => {
            // Try multiple field names and check for morningData/eveningData objects
            const morningCheckIn = selectedDate.checkIns.find(ci =>
                ci.type === 'morning' ||
                ci.checkInType === 'morning' ||
                ci.timeOfDay === 'morning' ||
                (ci.morningData && Object.keys(ci.morningData).length > 0)
            );
            const eveningCheckIn = selectedDate.checkIns.find(ci =>
                ci.type === 'evening' ||
                ci.checkInType === 'evening' ||
                ci.timeOfDay === 'evening' ||
                (ci.eveningData && Object.keys(ci.eveningData).length > 0)
            );
            const reflection = selectedDate.reflections[0];

            return React.createElement(
                'div',
                {
                    onClick: () => setShowDateDetail(false),
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 11000,
                        animation: 'fadeIn 0.2s ease-out'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: isMobile ? '95%' : '90%',
                            maxWidth: isMobile ? '100%' : '500px',
                            height: '100%',
                            backgroundColor: 'white',
                            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.2)',
                            overflowY: 'auto',
                            animation: 'slideInRight 0.3s ease-out',
                            padding: isMobile ? '20px' : '24px'
                        }
                    },

                    // Header
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' } },
                        React.createElement(
                            'h2',
                            { style: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' } },
                            selectedDate.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        ),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setShowDateDetail(false);
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '0',
                                    width: '32px',
                                    height: '32px'
                                }
                            },
                            '×'
                        )
                    ),

                    // Completion status
                    React.createElement(
                        'div',
                        { style: { marginBottom: '24px' } },
                        React.createElement('h3', { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } }, 'Completed'),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                            React.createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: morningCheckIn ? '#dcfce7' : '#fee2e2', borderRadius: '8px', border: `2px solid ${morningCheckIn ? '#22c55e' : '#ef4444'}` } },
                                React.createElement('div', { style: { fontSize: '20px', fontWeight: 'bold', color: morningCheckIn ? '#22c55e' : '#ef4444' } }, morningCheckIn ? '✓' : '✗'),
                                React.createElement('div', { style: { color: '#2c3e50', fontWeight: '600' } }, 'Morning Check-In')
                            ),
                            React.createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: eveningCheckIn ? '#dcfce7' : '#fee2e2', borderRadius: '8px', border: `2px solid ${eveningCheckIn ? '#22c55e' : '#ef4444'}` } },
                                React.createElement('div', { style: { fontSize: '20px', fontWeight: 'bold', color: eveningCheckIn ? '#22c55e' : '#ef4444' } }, eveningCheckIn ? '✓' : '✗'),
                                React.createElement('div', { style: { color: '#2c3e50', fontWeight: '600' } }, 'Evening Check-In (Reflection)')
                            )
                        )
                    ),

                    // Morning check-in details
                    morningCheckIn && (() => {
                        // Get data from either top level or morningData object
                        const data = morningCheckIn.morningData || morningCheckIn;

                        // Helper to format field names
                        const formatFieldName = (key) => {
                            return key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())
                                .trim();
                        };

                        // Fields to skip (metadata, not user-entered data)
                        const skipFields = ['id', 'userId', 'createdAt', 'timestamp', 'type', 'checkInType', 'timeOfDay', 'morningData', 'eveningData', 'hasMorningData', 'hasEveningData'];

                        // Get all non-empty fields (skip objects like Firestore Timestamps)
                        const fields = Object.keys(data).filter(key => {
                            const value = data[key];
                            return !skipFields.includes(key) &&
                                value !== null &&
                                value !== undefined &&
                                value !== '' &&
                                typeof value !== 'object'; // Skip objects (Firestore Timestamps, etc.)
                        });

                        return React.createElement(
                            'div',
                            { style: { marginBottom: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '10px' } },
                            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } }, '🌅 Morning Check-In'),
                            ...fields.map(key => {
                                const value = data[key];
                                const isNumeric = typeof value === 'number';
                                const isLongText = typeof value === 'string' && value.length > 50;

                                return React.createElement(
                                    'div',
                                    {
                                        key,
                                        style: { marginBottom: isLongText ? '12px' : '8px', marginTop: isLongText ? '12px' : '0' }
                                    },
                                    React.createElement('span', { style: { fontSize: '14px', color: '#64748b', fontWeight: '600' } }, `${formatFieldName(key)}: `),
                                    isNumeric
                                        ? React.createElement('span', { style: { fontSize: '16px', color: '#5A9FD4', fontWeight: 'bold' } }, `${value}/10`)
                                        : isLongText
                                            ? React.createElement('div', { style: { fontSize: '14px', color: '#2c3e50', marginTop: '4px', fontStyle: value.includes('"') ? 'italic' : 'normal' } }, value)
                                            : React.createElement('span', { style: { fontSize: '14px', color: '#2c3e50' } }, value)
                                );
                            })
                        );
                    })(),

                    // Evening check-in details (includes reflection)
                    eveningCheckIn && (() => {
                        // Get data from either top level or eveningData object
                        const data = eveningCheckIn.eveningData || eveningCheckIn;

                        // Helper to format field names
                        const formatFieldName = (key) => {
                            return key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())
                                .trim();
                        };

                        // Fields to skip (metadata, not user-entered data)
                        const skipFields = ['id', 'userId', 'createdAt', 'timestamp', 'type', 'checkInType', 'timeOfDay', 'morningData', 'eveningData', 'hasMorningData', 'hasEveningData'];

                        // Get all non-empty fields (skip objects like Firestore Timestamps)
                        const fields = Object.keys(data).filter(key => {
                            const value = data[key];
                            return !skipFields.includes(key) &&
                                value !== null &&
                                value !== undefined &&
                                value !== '' &&
                                typeof value !== 'object'; // Skip objects (Firestore Timestamps, etc.)
                        });

                        return React.createElement(
                            'div',
                            { style: { marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px' } },
                            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } }, '🌙 Evening Check-In (Reflection)'),
                            ...fields.map(key => {
                                const value = data[key];
                                const isNumeric = typeof value === 'number';
                                const isLongText = typeof value === 'string' && value.length > 50;

                                return React.createElement(
                                    'div',
                                    {
                                        key,
                                        style: { marginBottom: isLongText ? '12px' : '8px', marginTop: isLongText ? '12px' : '0' }
                                    },
                                    React.createElement('span', { style: { fontSize: '14px', color: '#64748b', fontWeight: '600' } }, `${formatFieldName(key)}: `),
                                    isNumeric
                                        ? React.createElement('span', { style: { fontSize: '16px', color: '#f59e0b', fontWeight: 'bold' } }, `${value}/10`)
                                        : isLongText
                                            ? React.createElement('div', { style: { fontSize: '14px', color: '#2c3e50', marginTop: '4px', fontStyle: value.includes('"') ? 'italic' : 'normal' } }, value)
                                            : React.createElement('span', { style: { fontSize: '14px', color: '#2c3e50' } }, value)
                                );
                            })
                        );
                    })(),

                    // No data message
                    !morningCheckIn && !eveningCheckIn && React.createElement(
                        'div',
                        { style: { textAlign: 'center', padding: '32px', color: '#94a3b8' } },
                        React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '📅'),
                        React.createElement('div', { style: { fontSize: '16px', fontWeight: '500' } }, 'No check-ins or reflections for this day')
                    )
                )
            );
        })(),

        // GRAPH SETTINGS MODAL
        activeModal === 'graphSettings' && (() => {
            const handleExportPDF = () => {
                if (typeof window.GLRSApp?.utils?.showNotification === 'function') {
                    window.GLRSApp.utils.showNotification('PDF export feature coming soon!', 'info');
                }
            };

            return React.createElement(
                'div',
                {
                    onClick: () => {
                        setActiveModal('journeyCalendar');
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                    },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            backgroundColor: 'white',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '20px' : '24px',
                            maxWidth: isMobile ? '95%' : '400px',
                            width: '100%',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                        }
                    },

                    // Header
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                        React.createElement('h2', { style: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' } }, 'Graph Settings'),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal('journeyCalendar');
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '0',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                            '←'
                        )
                    ),

                    // Date Range Inputs
                    React.createElement(
                        'div',
                        { style: { marginBottom: '20px' } },
                        React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2c3e50' } }, 'Start Date'),
                        React.createElement('input', {
                            type: 'date',
                            value: startDate,
                            onChange: (e) => setStartDate(e.target.value),
                            style: {
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }
                        })
                    ),

                    React.createElement(
                        'div',
                        { style: { marginBottom: '24px' } },
                        React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#2c3e50' } }, 'End Date'),
                        React.createElement('input', {
                            type: 'date',
                            value: endDate,
                            onChange: (e) => setEndDate(e.target.value),
                            style: {
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }
                        })
                    ),

                    // Export PDF Button
                    React.createElement(
                        'button',
                        {
                            onClick: handleExportPDF,
                            style: {
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#5A9FD4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.2s'
                            },
                            onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#4a8fc4'; },
                            onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#5A9FD4'; }
                        },
                        React.createElement('i', { 'data-lucide': 'download', style: { width: '20px', height: '20px' } }),
                        'Export as PDF'
                    )
                )
            );
        })(),

        // WEEKLY REPORT MODAL
        activeModal === 'weeklyReport' && (() => {
            // Calculate weekly stats
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const weekCheckIns = checkIns.filter(ci => {
                const ciDate = ci.timestamp?.toDate?.() || new Date(ci.timestamp);
                return ciDate >= sevenDaysAgo;
            });

            const weekReflections = reflections.filter(r => {
                const rDate = r.timestamp?.toDate?.() || new Date(r.timestamp);
                return rDate >= sevenDaysAgo;
            });

            const weekAssignments = assignments.filter(a => {
                const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
                return aDate >= sevenDaysAgo;
            });

            const completedAssignments = weekAssignments.filter(a => a.status === 'completed');

            // Calculate average mood
            const moodScores = weekCheckIns.map(ci => ci.moodScore || 0).filter(score => score > 0);
            const avgMood = moodScores.length > 0
                ? (moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length).toFixed(1)
                : 'N/A';

            return React.createElement(
                'div',
                {
                    onClick: () => {
                        setActiveModal(null);
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                    },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            backgroundColor: 'white',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '20px' : '24px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                        }
                    },

                    // Header
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                        React.createElement('h2', { style: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' } }, 'Weekly Report'),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal(null);
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '0',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                            '×'
                        )
                    ),

                    // Stats Grid
                    React.createElement(
                        'div',
                        { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' } },

                        // Check-Ins
                        React.createElement(
                            'div',
                            { style: { padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' } },
                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, 'Check-Ins'),
                            React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#5A9FD4' } }, weekCheckIns.length)
                        ),

                        // Reflections
                        React.createElement(
                            'div',
                            { style: { padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' } },
                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, 'Reflections'),
                            React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#34d399' } }, weekReflections.length)
                        ),

                        // Assignments Completed
                        React.createElement(
                            'div',
                            { style: { padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' } },
                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, 'Assignments'),
                            React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' } }, `${completedAssignments.length}/${weekAssignments.length}`)
                        ),

                        // Average Mood
                        React.createElement(
                            'div',
                            { style: { padding: '16px', backgroundColor: '#fce7f3', borderRadius: '8px' } },
                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, 'Avg Mood'),
                            React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#ec4899' } }, avgMood)
                        )
                    ),

                    // Coach Notes Section
                    coachNotes.length > 0 && React.createElement(
                        'div',
                        { style: { marginTop: '20px' } },
                        React.createElement('h3', { style: { fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } }, 'Recent Coach Notes'),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                            coachNotes.slice(0, 3).map(note => {
                                const noteDate = note.createdAt?.toDate?.() || new Date(note.createdAt);
                                return React.createElement(
                                    'div',
                                    {
                                        key: note.id,
                                        style: {
                                            padding: '12px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '6px',
                                            borderLeft: '3px solid #5A9FD4'
                                        }
                                    },
                                    React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, noteDate.toLocaleDateString()),
                                    React.createElement('div', { style: { fontSize: '14px', color: '#2c3e50' } }, note.content || note.note || 'No content')
                                );
                            })
                        )
                    )
                )
            );
        })(),

        // MOOD INSIGHTS MODAL
        activeModal === 'moodInsights' && (() => {
            // Calculate 7-day mood trend
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const moodData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const dayCheckIns = checkIns.filter(ci => {
                    const ciDate = ci.timestamp?.toDate?.() || new Date(ci.timestamp);
                    ciDate.setHours(0, 0, 0, 0);
                    return ciDate.getTime() === date.getTime();
                });

                const moodScores = dayCheckIns.map(ci => ci.moodScore || 0).filter(score => score > 0);
                const avgMood = moodScores.length > 0
                    ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length
                    : 0;

                moodData.push({
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    mood: avgMood,
                    height: avgMood > 0 ? `${(avgMood / 10) * 100}%` : '5%'
                });
            }

            const overallAvg = moodData.filter(d => d.mood > 0).length > 0
                ? (moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.filter(d => d.mood > 0).length).toFixed(1)
                : 'N/A';

            return React.createElement(
                'div',
                {
                    onClick: () => {
                        setActiveModal(null);
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                    },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            backgroundColor: 'white',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '20px' : '24px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                        }
                    },

                    // Header
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                        React.createElement('h2', { style: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' } }, 'Mood Insights'),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal(null);
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '0',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                            '×'
                        )
                    ),

                    // Average Mood
                    React.createElement(
                        'div',
                        { style: { padding: '16px', backgroundColor: '#fce7f3', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' } },
                        React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, '7-Day Average Mood'),
                        React.createElement('div', { style: { fontSize: '32px', fontWeight: 'bold', color: '#ec4899' } }, overallAvg)
                    ),

                    // Bar Chart
                    React.createElement(
                        'div',
                        { style: { marginBottom: '20px' } },
                        React.createElement('h3', { style: { fontSize: '14px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } }, 'Daily Mood Trend'),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '8px' } },
                            moodData.map((day, index) => {
                                return React.createElement(
                                    'div',
                                    {
                                        key: index,
                                        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }
                                    },
                                    React.createElement(
                                        'div',
                                        {
                                            title: `${day.date}: ${day.mood.toFixed(1)}`,
                                            style: {
                                                width: '100%',
                                                height: day.height,
                                                backgroundColor: '#ec4899',
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.3s ease',
                                                minHeight: '5%'
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        'div',
                                        { style: { marginTop: '8px', fontSize: '12px', color: '#64748b' } },
                                        day.date
                                    )
                                );
                            })
                        )
                    ),

                    // Mood Scale Reference
                    React.createElement(
                        'div',
                        { style: { fontSize: '12px', color: '#64748b', textAlign: 'center' } },
                        'Scale: 1 (Low) - 10 (High)'
                    )
                )
            );
        })(),

        // OVERALL DAY INSIGHTS MODAL
        activeModal === 'overallDayInsights' && (() => {
            // Calculate 7-day overall day score trend
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const overallData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const dayCheckIns = checkIns.filter(ci => {
                    const ciDate = ci.timestamp?.toDate?.() || new Date(ci.timestamp);
                    ciDate.setHours(0, 0, 0, 0);
                    return ciDate.getTime() === date.getTime();
                });

                const overallScores = dayCheckIns.map(ci => ci.overallDayScore || 0).filter(score => score > 0);
                const avgOverall = overallScores.length > 0
                    ? overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length
                    : 0;

                overallData.push({
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    score: avgOverall,
                    height: avgOverall > 0 ? `${(avgOverall / 10) * 100}%` : '5%'
                });
            }

            const overallAvg = overallData.filter(d => d.score > 0).length > 0
                ? (overallData.reduce((sum, d) => sum + d.score, 0) / overallData.filter(d => d.score > 0).length).toFixed(1)
                : 'N/A';

            return React.createElement(
                'div',
                {
                    onClick: () => {
                        setActiveModal(null);
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                    },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }
                },
                React.createElement(
                    'div',
                    {
                        onClick: (e) => e.stopPropagation(),
                        style: {
                            backgroundColor: 'white',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '20px' : '24px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                        }
                    },

                    // Header
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
                        React.createElement('h2', { style: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' } }, 'Overall Day Insights'),
                        React.createElement(
                            'button',
                            {
                                onClick: () => {
                                    setActiveModal(null);
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                },
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#95a5a6',
                                    padding: '0',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            },
                            '×'
                        )
                    ),

                    // Average Score
                    React.createElement(
                        'div',
                        { style: { padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' } },
                        React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '4px' } }, '7-Day Average Score'),
                        React.createElement('div', { style: { fontSize: '32px', fontWeight: 'bold', color: '#5A9FD4' } }, overallAvg)
                    ),

                    // Bar Chart
                    React.createElement(
                        'div',
                        { style: { marginBottom: '20px' } },
                        React.createElement('h3', { style: { fontSize: '14px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '12px' } }, 'Daily Score Trend'),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '8px' } },
                            overallData.map((day, index) => {
                                return React.createElement(
                                    'div',
                                    {
                                        key: index,
                                        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }
                                    },
                                    React.createElement(
                                        'div',
                                        {
                                            title: `${day.date}: ${day.score.toFixed(1)}`,
                                            style: {
                                                width: '100%',
                                                height: day.height,
                                                backgroundColor: '#5A9FD4',
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.3s ease',
                                                minHeight: '5%'
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        'div',
                                        { style: { marginTop: '8px', fontSize: '12px', color: '#64748b' } },
                                        day.date
                                    )
                                );
                            })
                        )
                    ),

                    // Score Scale Reference
                    React.createElement(
                        'div',
                        { style: { fontSize: '12px', color: '#64748b', textAlign: 'center' } },
                        'Scale: 1 (Poor) - 10 (Excellent)'
                    )
                )
            );
        })(),

        // ========== SIDEBAR ==========
        showSidebar && React.createElement(
            React.Fragment,
            null,
            // Backdrop
            React.createElement('div', {
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999,
                    transition: 'opacity 0.3s ease'
                },
                onClick: () => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    setShowSidebar(false);
                }
            }),

            // Sidebar Panel
            React.createElement(
                'div',
                {
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: isMobile ? '85%' : '280px',
                        maxWidth: isMobile ? '320px' : 'none',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease',
                        transform: 'translateX(0)'
                    }
                },

                // Sidebar Header
                React.createElement(
                    'div',
                    {
                        style: {
                            padding: isMobile ? '16px' : '20px',
                            borderBottom: '1px solid #E5E5E5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #5A9FD4 0%, #4A8FC7 100%)'
                        }
                    },
                    React.createElement(
                        'h2',
                        {
                            style: {
                                margin: 0,
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: 'bold',
                                color: '#FFFFFF'
                            }
                        },
                        '🚀 Journey Tools'
                    ),
                    React.createElement(
                        'button',
                        {
                            onClick: () => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                setShowSidebar(false);
                            },
                            style: {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }
                        },
                        React.createElement('i', {
                            'data-lucide': 'x',
                            style: { width: '20px', height: '20px', color: '#FFFFFF' }
                        })
                    )
                ),

                // Sidebar Content
                React.createElement(
                    'div',
                    {
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: isMobile ? '16px' : '20px'
                        }
                    },

                    // In Progress Message
                    React.createElement(
                        'div',
                        {
                            style: {
                                background: 'linear-gradient(135deg, rgba(90, 159, 212, 0.1) 0%, rgba(74, 143, 199, 0.05) 100%)',
                                borderRadius: isMobile ? '8px' : '12px',
                                padding: isMobile ? '20px' : '24px',
                                border: '2px solid rgba(90, 159, 212, 0.3)',
                                textAlign: 'center'
                            }
                        },
                        React.createElement('i', {
                            'data-lucide': 'construction',
                            style: {
                                width: isMobile ? '40px' : '48px',
                                height: isMobile ? '40px' : '48px',
                                color: '#5A9FD4',
                                marginBottom: isMobile ? '12px' : '16px',
                                strokeWidth: 2
                            }
                        }),
                        React.createElement(
                            'h3',
                            {
                                style: {
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: '#2c3e50',
                                    marginBottom: isMobile ? '8px' : '12px',
                                    fontWeight: '700'
                                }
                            },
                            'Journey Tools In Progress'
                        ),
                        React.createElement(
                            'p',
                            {
                                style: {
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#666',
                                    lineHeight: '1.6',
                                    margin: 0
                                }
                            },
                            'We\'re currently developing additional tools and features to enhance your recovery journey. Check back soon for updates!'
                        )
                    )
                )
            )
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

    // Custom goals state for "Coming Soon" section
    const [customGoalItems, setCustomGoalItems] = useState([]);

    // Touch swipe state
    const [lifeTouchStart, setLifeTouchStart] = useState(0);
    const [lifeTouchEnd, setLifeTouchEnd] = useState(0);
    const [lifeIsDragging, setLifeIsDragging] = useState(false);

    // Ref for touch swipe functionality
    const lifeCardsRef = useRef(null);

    // MODAL STATE (replaces external component pattern)
    const [activeModal, setActiveModal] = useState(null);
    // activeModal values: 'gratitudeThemes' | 'gratitudeJournal' | 'challenges' |
    //                     'breakthrough' | 'streak' | 'reflectionStreak' |
    //                     'streaks' | 'reflectionStreaks' | 'addCountdown' | null

    // Add Countdown Modal State
    const [countdownName, setCountdownName] = useState('');
    const [countdownTargetDate, setCountdownTargetDate] = useState('');
    const [countdownIcon, setCountdownIcon] = useState('🎉');
    const [countdownDescription, setCountdownDescription] = useState('');

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ✅ PHASE 4, PART 2, STEP 2: Local utility functions (no global state)

    // Calculate sobriety days from sobriety date (DST-proof, timezone-aware)
    // Use centralized timezone-aware sobriety calculation from utils.js
    const calculateSobrietyDays = (sobrietyDate) => {
        return window.GLRSApp?.utils?.calculateSobrietyDays(sobrietyDate) || 0;
    };

    // Generate recovery milestone objects with achievement status
    // Use centralized timezone-aware milestone calculation from utils.js
    const getRecoveryMilestones = (sobrietyDate) => {
        return window.GLRSApp?.utils?.getRecoveryMilestones(sobrietyDate) || [];
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

    // Load custom countdown goals from Firebase
    const loadCustomGoals = async (uid) => {
        try {
            const db = firebase.firestore();
            const goalsSnap = await db.collection('customCountdownGoals')
                .where('userId', '==', uid)
                .orderBy('createdAt', 'desc')
                .get();
            const goals = goalsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCustomGoalItems(goals);
        } catch (error) {
            console.error('Error loading custom goals:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'JourneyLifeTab.loadCustomGoals');
            setCustomGoalItems([]);
        }
    };

    // Firebase auth listener - loads data when user authenticated
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                loadUserData(authUser.uid);
                loadDailyQuotes();
                loadCustomGoals(authUser.uid);
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array - run once on mount

    // Initialize Lucide icons on component mount (for always-visible icons)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ JourneyLifeTab: Initial Lucide icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Re-initialize Lucide icons when modals open
    useEffect(() => {
        if (activeModal) {
            // Small delay to ensure DOM has updated
            const timer = setTimeout(() => {
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                    console.log('✅ JourneyLifeTab: Lucide icons initialized for modal');
                } else {
                    console.warn('⚠️ JourneyLifeTab: Lucide library not available');
                }
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [activeModal]);

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
                padding: isMobile ? '0 4%' : '0 5%',
                maxWidth: isMobile ? '100%' : '600px',
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

            {/* COMING SOON - REVERSE COUNTDOWN */}
            {(() => {
                // Calculate sortedCountdown from custom goals
                const dailyCost = userData?.dailyCost || 0;
                const totalDays = calculateSobrietyDays(userData?.sobrietyDate || '');
                const totalSaved = totalDays * dailyCost;

                // Create countdown items from custom goals
                const sortedCountdown = customGoalItems
                    .map(item => {
                        const cost = item.amount || item.cost || 0;
                        const daysAway = dailyCost > 0 ? Math.max(0, Math.ceil((cost - totalSaved) / dailyCost)) : 999;
                        const progress = cost > 0 ? Math.min(100, (totalSaved / cost) * 100) : 0;
                        return { ...item, cost, daysAway, progress };
                    })
                    .sort((a, b) => a.daysAway - b.daysAway);

                return (
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
                                        ${(item.cost || 0).toLocaleString()}
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
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveModal('addCountdown');
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
                );
            })()}
            {/* END COMING SOON */}

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

            {/* GRATITUDE THEMES MODAL - Inline (source: JourneyDataModals lines 4576-4763) */}
            {activeModal === 'gratitudeThemes' && (
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
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '15px',
                        maxWidth: isMobile ? '95%' : '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                                    onClick={() => setActiveModal(null)}
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
                                    setActiveModal(null);
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
            )}

            {/* GRATITUDE JOURNAL MODAL - Inline (source: JourneyDataModals lines 4957-5238) */}
            {activeModal === 'gratitudeJournal' && (
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
                    setActiveModal(null);
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '20px',
                        maxWidth: isMobile ? '95%' : '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                                    setActiveModal(null);
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
                                    setActiveModal(null);
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
            )}

            {/* CHALLENGES HISTORY MODAL - Inline (source: JourneyDataModals lines 5526-5809) */}
            {activeModal === 'challenges' && (
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
                    setActiveModal(null);
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '20px',
                        maxWidth: isMobile ? '95%' : '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                                    setActiveModal(null);
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
                                    setActiveModal(null);
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
            )}

            {/* BREAKTHROUGH MODAL - Inline (source: JourneyDataModals lines 6099-6281) */}
            {activeModal === 'breakthrough' && breakthroughData && (
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
                    setActiveModal(null);
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                        borderRadius: isMobile ? '16px' : '24px',
                        maxWidth: isMobile ? '95%' : '500px',
                        width: '100%',
                        padding: isMobile ? '30px 20px' : '40px 30px',
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
                                setActiveModal(null);
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
            )}

            {/* STREAK MODAL - Inline (source: JourneyStreaksModals lines 8130-8284) */}
            {activeModal === 'streak' && (
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
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '15px',
                        maxWidth: isMobile ? '95%' : '400px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                                    onClick={() => setActiveModal(null)}
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
            )}

            {/* REFLECTION STREAK MODAL - Inline (source: JourneyStreaksModals lines 8445-8594) */}
            {activeModal === 'reflectionStreak' && (
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
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '15px',
                        maxWidth: isMobile ? '95%' : '400px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                                    onClick={() => setActiveModal(null)}
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
            )}

            {/* STREAKS MODAL - Inline (source: JourneyStreaksModals lines 8750-8797) */}
            {activeModal === 'streaks' && (
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
                onClick={() => setActiveModal(null)}>
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
                            <button className="btn-primary" onClick={() => setActiveModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* REFLECTION STREAKS MODAL - Inline (source: JourneyStreaksModals lines 8851-8898) */}
            {activeModal === 'reflectionStreaks' && (
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
                onClick={() => setActiveModal(null)}>
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
                            <button className="btn-primary" onClick={() => setActiveModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD COUNTDOWN MODAL */}
            {activeModal === 'addCountdown' && (() => {
                // Calculate days until target date
                const calculateDaysUntil = () => {
                    if (!countdownTargetDate) return null;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const target = new Date(countdownTargetDate);
                    target.setHours(0, 0, 0, 0);
                    const diffTime = target - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays;
                };

                const daysUntil = calculateDaysUntil();

                const handleAddCountdown = async () => {
                    if (!countdownName || !countdownTargetDate) {
                        window.GLRSApp.utils.showNotification('Please enter a name and target date', 'error');
                        return;
                    }

                    if (daysUntil < 0) {
                        window.GLRSApp.utils.showNotification('Target date must be in the future', 'error');
                        return;
                    }

                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        const userId = window.firebase.auth().currentUser.uid;

                        await window.db.collection('customCountdownGoals').add({
                            userId: userId,
                            name: countdownName,
                            targetDate: countdownTargetDate,
                            icon: countdownIcon || '🎯',
                            description: countdownDescription || null,
                            cost: 0, // Default cost for display in countdown
                            amount: 0, // Alias for cost
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp.utils.showNotification('Goal created!', 'success');
                        setActiveModal(null);

                        // Reload custom goals
                        loadCustomGoals(userId);
                    } catch (error) {
                        console.error('Error creating countdown:', error);
                        window.GLRSApp.utils.showNotification('Failed to create goal. Please try again.', 'error');
                    }
                };

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
                    onClick={() => setActiveModal(null)}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '20px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            padding: isMobile ? '20px' : '24px'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                }}>
                                    ⏳ Add Custom Goal
                                </h2>
                                <button
                                    onClick={() => setActiveModal(null)}
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

                            <p style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '24px'
                            }}>
                                Create a custom goal to celebrate upcoming recovery milestones
                            </p>

                            {/* Goal Details */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Goal Name *
                                </label>
                                <input
                                    type="text"
                                    value={countdownName}
                                    onChange={(e) => setCountdownName(e.target.value)}
                                    placeholder="e.g., 6 Months Sober, First Year Anniversary"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Target Date *
                                </label>
                                <input
                                    type="date"
                                    value={countdownTargetDate}
                                    onChange={(e) => setCountdownTargetDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Icon/Emoji (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={countdownIcon}
                                    onChange={(e) => setCountdownIcon(e.target.value)}
                                    placeholder="🎉"
                                    maxLength={2}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '24px',
                                        fontFamily: 'inherit',
                                        textAlign: 'center'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={countdownDescription}
                                    onChange={(e) => setCountdownDescription(e.target.value)}
                                    placeholder="What you're looking forward to..."
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

                            {/* Preview */}
                            {countdownName && countdownTargetDate && daysUntil !== null && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    marginBottom: '24px',
                                    color: '#FFFFFF',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        opacity: 0.9
                                    }}>
                                        Preview
                                    </h3>
                                    <div style={{
                                        fontSize: '64px',
                                        marginBottom: '8px',
                                        lineHeight: 1
                                    }}>
                                        {countdownIcon || '🎯'}
                                    </div>
                                    <div style={{
                                        fontSize: '48px',
                                        fontWeight: 'bold',
                                        marginBottom: '8px'
                                    }}>
                                        {daysUntil}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        opacity: 0.9,
                                        marginBottom: '4px'
                                    }}>
                                        {daysUntil === 1 ? 'day' : 'days'}
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        until {countdownName}
                                    </div>
                                    {countdownDescription && (
                                        <div style={{
                                            fontSize: '13px',
                                            opacity: 0.8,
                                            marginTop: '12px',
                                            fontStyle: 'italic'
                                        }}>
                                            "{countdownDescription}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <button
                                    onClick={handleAddCountdown}
                                    disabled={!countdownName || !countdownTargetDate}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: countdownName && countdownTargetDate ? '#058585' : '#CCCCCC',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: countdownName && countdownTargetDate ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Add Goal
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#F5F5F5',
                                        color: '#333333',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
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

    // MODAL STATE (replaces external component pattern)
    const [activeModal, setActiveModal] = useState(null);
    // activeModal values: 'calendarHeatmap' | 'journeyCalendar' | 'weeklyReport' |
    //                     'moodInsights' | 'overallDayInsights' | 'graphSettings' | null

    // Refs for touch swipe functionality
    const wellnessCardsRef = useRef(null);

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ✅ PHASE 4, PART 4, STEP 3: Local utility functions (no global state)

    // Calculate missed check-ins for a specific metric in the last 31 days
    const calculateMissedCheckIns = (checkIns, metricPath) => {
        if (!checkIns || checkIns.length === 0) return null; // Return null to indicate no data

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyOneDaysAgo = new Date(today);
        thirtyOneDaysAgo.setDate(today.getDate() - 31);

        // Track unique days with this metric using a Set
        const uniqueDaysWithMetric = new Set();

        checkIns.forEach(checkIn => {
            if (!checkIn.createdAt) return;

            const checkInDate = checkIn.createdAt.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            checkInDate.setHours(0, 0, 0, 0);

            if (checkInDate < thirtyOneDaysAgo || checkInDate > today) return;

            // Navigate to nested metric (e.g., 'morningData.mood')
            const pathParts = metricPath.split('.');
            let value = checkIn;
            for (const part of pathParts) {
                value = value?.[part];
            }

            // If metric exists, add this date to the set (automatically handles duplicates)
            if (value !== undefined && value !== null) {
                uniqueDaysWithMetric.add(checkInDate.toDateString());
            }
        });

        // Missed = 31 days - unique days with metric
        return Math.max(0, 31 - uniqueDaysWithMetric.size);
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

    // Calculate 7-day average for a specific metric
    const calculate7DayAverage = (checkIns, metricPath) => {
        if (!checkIns || checkIns.length === 0) return '0.0';

        const checkInsInRange = getCheckInsInDateRange(checkIns, 7);
        const values = [];

        checkInsInRange.forEach(checkIn => {
            // Navigate to nested metric (e.g., 'morningData.mood')
            const pathParts = metricPath.split('.');
            let value = checkIn;
            for (const part of pathParts) {
                value = value?.[part];
            }
            if (value !== undefined && value !== null) {
                values.push(value);
            }
        });

        if (values.length === 0) return '0.0';

        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(1);
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

            const snapshot = await window.db.collection('checkIns')
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

    // Initialize Lucide icons on component mount (for always-visible icons)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ JourneyWellnessTab: Initial Lucide icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Re-initialize Lucide icons when modals open
    useEffect(() => {
        if (activeModal) {
            // Small delay to ensure DOM has updated
            const timer = setTimeout(() => {
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                    console.log('✅ JourneyWellnessTab: Lucide icons initialized for modal');
                } else {
                    console.warn('⚠️ JourneyWellnessTab: Lucide library not available');
                }
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [activeModal]);

    // Render charts when data changes
    useEffect(() => {
        if (!checkIns || checkIns.length === 0 || !window.Chart) return;

        // Destroy existing charts before creating new ones
        const destroyChart = (canvasId) => {
            const canvas = document.getElementById(canvasId);
            if (canvas && canvas.chart) {
                canvas.chart.destroy();
            }
        };

        // Helper function to prepare chart data for a metric
        const prepareChartData = (metricPath, days) => {
            const checkInsInRange = getCheckInsInDateRange(checkIns, days);
            const labels = [];
            const data = [];

            // Get last N days dates
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

                // Find check-in for this date
                const checkIn = checkInsInRange.find(c => {
                    const checkInDate = c.createdAt?.toDate?.() || new Date(c.createdAt);
                    return checkInDate.toDateString() === date.toDateString();
                });

                // Navigate to nested metric (e.g., 'morningData.mood')
                const pathParts = metricPath.split('.');
                let value = checkIn;
                for (const part of pathParts) {
                    value = value?.[part];
                }
                data.push(value || null);
            }

            // Calculate average (excluding null values)
            const validValues = data.filter(v => v !== null);
            const average = validValues.length > 0
                ? (validValues.reduce((sum, v) => sum + v, 0) / validValues.length).toFixed(1)
                : '0.0';

            return { labels, data, average };
        };

        // Render Mood Chart
        destroyChart('journeyMoodChart');
        destroyChart('journeyMoodSparkline');
        const moodData31 = prepareChartData('morningData.mood', 31); // 31 days for expanded
        const moodData7 = prepareChartData('morningData.mood', 7);   // 7 days for sparkline
        const moodCanvas = document.getElementById('journeyMoodChart');
        const moodSparkline = document.getElementById('journeyMoodSparkline');

        if (moodCanvas) {
            moodCanvas.chart = new Chart(moodCanvas, {
                type: 'line',
                data: {
                    labels: moodData31.labels,
                    datasets: [{
                        label: 'Mood',
                        data: moodData31.data,
                        borderColor: '#069494',
                        backgroundColor: 'rgba(6, 148, 148, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 0, max: 10, ticks: { stepSize: 2 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (moodSparkline) {
            moodSparkline.chart = new Chart(moodSparkline, {
                type: 'line',
                data: {
                    labels: moodData7.labels,
                    datasets: [{
                        label: 'Mood',
                        data: moodData7.data,
                        borderColor: '#069494',
                        backgroundColor: 'rgba(6, 148, 148, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            ticks: { font: { size: 9 } }
                        },
                        y: {
                            display: true,
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 2, font: { size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Render Craving Chart
        destroyChart('journeyCravingsChart');
        destroyChart('journeyCravingsSparkline');
        const cravingData31 = prepareChartData('morningData.craving', 31);
        const cravingData7 = prepareChartData('morningData.craving', 7);
        const cravingCanvas = document.getElementById('journeyCravingsChart');
        const cravingSparkline = document.getElementById('journeyCravingsSparkline');

        if (cravingCanvas) {
            cravingCanvas.chart = new Chart(cravingCanvas, {
                type: 'line',
                data: {
                    labels: cravingData31.labels,
                    datasets: [{
                        label: 'Craving',
                        data: cravingData31.data,
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 0, max: 10, ticks: { stepSize: 2 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (cravingSparkline) {
            cravingSparkline.chart = new Chart(cravingSparkline, {
                type: 'line',
                data: {
                    labels: cravingData7.labels,
                    datasets: [{
                        label: 'Craving',
                        data: cravingData7.data,
                        borderColor: '#FF6B35',
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            ticks: { font: { size: 9 } }
                        },
                        y: {
                            display: true,
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 2, font: { size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Render Anxiety Chart
        destroyChart('journeyAnxietyChart');
        destroyChart('journeyAnxietySparkline');
        const anxietyData31 = prepareChartData('morningData.anxiety', 31);
        const anxietyData7 = prepareChartData('morningData.anxiety', 7);
        const anxietyCanvas = document.getElementById('journeyAnxietyChart');
        const anxietySparkline = document.getElementById('journeyAnxietySparkline');

        if (anxietyCanvas) {
            anxietyCanvas.chart = new Chart(anxietyCanvas, {
                type: 'line',
                data: {
                    labels: anxietyData31.labels,
                    datasets: [{
                        label: 'Anxiety',
                        data: anxietyData31.data,
                        borderColor: '#FFA500',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 0, max: 10, ticks: { stepSize: 2 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (anxietySparkline) {
            anxietySparkline.chart = new Chart(anxietySparkline, {
                type: 'line',
                data: {
                    labels: anxietyData7.labels,
                    datasets: [{
                        label: 'Anxiety',
                        data: anxietyData7.data,
                        borderColor: '#9333EA',
                        backgroundColor: 'rgba(147, 51, 234, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            ticks: { font: { size: 9 } }
                        },
                        y: {
                            display: true,
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 2, font: { size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Render Sleep Chart
        destroyChart('journeySleepChart');
        destroyChart('journeySleepSparkline');
        const sleepData31 = prepareChartData('morningData.sleep', 31);
        const sleepData7 = prepareChartData('morningData.sleep', 7);
        const sleepCanvas = document.getElementById('journeySleepChart');
        const sleepSparkline = document.getElementById('journeySleepSparkline');

        if (sleepCanvas) {
            sleepCanvas.chart = new Chart(sleepCanvas, {
                type: 'line',
                data: {
                    labels: sleepData31.labels,
                    datasets: [{
                        label: 'Sleep',
                        data: sleepData31.data,
                        borderColor: '#9B59B6',
                        backgroundColor: 'rgba(155, 89, 182, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 0, max: 10, ticks: { stepSize: 2 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (sleepSparkline) {
            sleepSparkline.chart = new Chart(sleepSparkline, {
                type: 'line',
                data: {
                    labels: sleepData7.labels,
                    datasets: [{
                        label: 'Sleep',
                        data: sleepData7.data,
                        borderColor: '#0EA5E9',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            ticks: { font: { size: 9 } }
                        },
                        y: {
                            display: true,
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 2, font: { size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Render Overall Day Chart
        destroyChart('journeyOverallChart');
        destroyChart('journeyOverallSparkline');
        const overallData31 = prepareChartData('eveningData.overallDay', 31);
        const overallData7 = prepareChartData('eveningData.overallDay', 7);
        const overallCanvas = document.getElementById('journeyOverallChart');
        const overallSparkline = document.getElementById('journeyOverallSparkline');

        if (overallCanvas) {
            overallCanvas.chart = new Chart(overallCanvas, {
                type: 'line',
                data: {
                    labels: overallData31.labels,
                    datasets: [{
                        label: 'Overall Day',
                        data: overallData31.data,
                        borderColor: '#3498DB',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 0, max: 10, ticks: { stepSize: 2 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (overallSparkline) {
            overallSparkline.chart = new Chart(overallSparkline, {
                type: 'line',
                data: {
                    labels: overallData7.labels,
                    datasets: [{
                        label: 'Overall Day',
                        data: overallData7.data,
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            display: true,
                            ticks: { font: { size: 9 } }
                        },
                        y: {
                            display: true,
                            min: 0,
                            max: 10,
                            ticks: { stepSize: 2, font: { size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        console.log('✅ Charts rendered successfully');

    }, [checkIns, expandedGraph]); // Re-render when data or expanded state changes

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
                padding: isMobile ? '0 12px' : '0 16px',
                maxWidth: isMobile ? '100%' : '600px',
                margin: '0 auto'
            }}>

            {/* Week-Over-Week Progress */}
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
                    ? thisWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.mood || 0), 0) / thisWeekCheckIns.length
                    : 0;
                const thisWeekCravings = thisWeekCheckIns.length > 0
                    ? thisWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.craving || 0), 0) / thisWeekCheckIns.length
                    : 0;
                const thisWeekAnxiety = thisWeekCheckIns.length > 0
                    ? thisWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.anxiety || 0), 0) / thisWeekCheckIns.length
                    : 0;
                const thisWeekSleep = thisWeekCheckIns.length > 0
                    ? thisWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.sleep || 0), 0) / thisWeekCheckIns.length
                    : 0;

                // Calculate averages for last week
                const lastWeekMood = lastWeekCheckIns.length > 0
                    ? lastWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.mood || 0), 0) / lastWeekCheckIns.length
                    : 0;
                const lastWeekCravings = lastWeekCheckIns.length > 0
                    ? lastWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.craving || 0), 0) / lastWeekCheckIns.length
                    : 0;
                const lastWeekAnxiety = lastWeekCheckIns.length > 0
                    ? lastWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.anxiety || 0), 0) / lastWeekCheckIns.length
                    : 0;
                const lastWeekSleep = lastWeekCheckIns.length > 0
                    ? lastWeekCheckIns.reduce((sum, c) => sum + (c.morningData?.sleep || 0), 0) / lastWeekCheckIns.length
                    : 0;

                // Calculate improvements
                const moodChange = thisWeekMood - lastWeekMood;
                const cravingsChange = lastWeekCravings - thisWeekCravings; // Lower is better
                const anxietyChange = lastWeekAnxiety - thisWeekAnxiety; // Lower is better
                const sleepChange = thisWeekSleep - lastWeekSleep;

                // Count improvements
                const improvements = [moodChange, cravingsChange, anxietyChange, sleepChange].filter(c => c > 0).length;
                const totalMetrics = 4;

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

                            {/* Cravings */}
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

                            {/* Anxiety */}
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

                            {/* Sleep */}
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
                        padding: expandedGraph === 'mood' ? '16px' : '12px 16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: expandedGraph === 'mood' ? '12px' : '6px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="smile" style={{width: '16px', height: '16px', color: '#069494', strokeWidth: 2}}></i>
                            <span style={{fontSize: '13px', fontWeight: '600', color: '#333'}}>
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
                        <div>
                            <div style={{height: '110px', marginBottom: '6px'}}>
                                <canvas id="journeyMoodSparkline" style={{maxHeight: '110px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
                                7-day avg: <strong style={{color: '#069494', fontSize: '13px'}}>{calculate7DayAverage(checkIns, 'morningData.mood')}</strong> / 10
                            </div>
                        </div>
                    )}
                </div>

                {/* Cravings Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'cravings' ? null : 'cravings')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: expandedGraph === 'cravings' ? '16px' : '12px 16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: expandedGraph === 'cravings' ? '12px' : '6px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="flame" style={{width: '16px', height: '16px', color: '#FF6B35', strokeWidth: 2}}></i>
                            <span style={{fontSize: '13px', fontWeight: '600', color: '#333'}}>
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
                        <div>
                            <div style={{height: '110px', marginBottom: '6px'}}>
                                <canvas id="journeyCravingsSparkline" style={{maxHeight: '110px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
                                7-day avg: <strong style={{color: '#FF6B35', fontSize: '13px'}}>{calculate7DayAverage(checkIns, 'morningData.craving')}</strong> / 10
                            </div>
                        </div>
                    )}
                </div>

                {/* Anxiety Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'anxiety' ? null : 'anxiety')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: expandedGraph === 'anxiety' ? '16px' : '12px 16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: expandedGraph === 'anxiety' ? '12px' : '6px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="alert-circle" style={{width: '16px', height: '16px', color: '#9333EA', strokeWidth: 2}}></i>
                            <span style={{fontSize: '13px', fontWeight: '600', color: '#333'}}>
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
                        <div>
                            <div style={{height: '110px', marginBottom: '6px'}}>
                                <canvas id="journeyAnxietySparkline" style={{maxHeight: '110px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
                                7-day avg: <strong style={{color: '#9333EA', fontSize: '13px'}}>{calculate7DayAverage(checkIns, 'morningData.anxiety')}</strong> / 10
                            </div>
                        </div>
                    )}
                </div>

                {/* Sleep Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'sleep' ? null : 'sleep')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: expandedGraph === 'sleep' ? '16px' : '12px 16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: expandedGraph === 'sleep' ? '12px' : '6px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="moon" style={{width: '16px', height: '16px', color: '#0EA5E9', strokeWidth: 2}}></i>
                            <span style={{fontSize: '13px', fontWeight: '600', color: '#333'}}>
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
                        <div>
                            <div style={{height: '110px', marginBottom: '6px'}}>
                                <canvas id="journeySleepSparkline" style={{maxHeight: '110px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
                                7-day avg: <strong style={{color: '#0EA5E9', fontSize: '13px'}}>{calculate7DayAverage(checkIns, 'morningData.sleep')}</strong> / 10
                            </div>
                        </div>
                    )}
                </div>

                {/* Overall Day Rating Graph */}
                <div
                    onClick={() => setExpandedGraph(expandedGraph === 'overall' ? null : 'overall')}
                    style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: expandedGraph === 'overall' ? '16px' : '12px 16px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: expandedGraph === 'overall' ? '12px' : '6px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="star" style={{width: '16px', height: '16px', color: '#F59E0B', strokeWidth: 2}}></i>
                            <span style={{fontSize: '13px', fontWeight: '600', color: '#333'}}>
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
                        <div>
                            <div style={{height: '110px', marginBottom: '6px'}}>
                                <canvas id="journeyOverallSparkline" style={{maxHeight: '110px'}}></canvas>
                            </div>
                            <div style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
                                7-day avg: <strong style={{color: '#F59E0B', fontSize: '13px'}}>{calculate7DayAverage(checkIns, 'eveningData.overallDay')}</strong> / 10
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* CALENDAR HEATMAP MODAL - Inline (source: JourneyCalendarModals lines 5035-5717) */}
            {activeModal === 'calendarHeatmap' && (() => {
                // Local state for calendar modal (moved from props to local state for inline pattern)
                const [calendarViewMode, setCalendarViewMode] = useState('month');
                const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
                const [calendarCurrentMonth, setCalendarCurrentMonth] = useState(new Date());
                const [calendarCurrentWeek, setCalendarCurrentWeek] = useState(new Date());
                const [calendarHeatmapData, setCalendarHeatmapData] = useState([]);

                // Build calendar heatmap data from check-ins
                useEffect(() => {
                    if (!checkIns) return;

                    const heatmapData = [];
                    const dateMap = {};

                    checkIns.forEach(checkIn => {
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
                }, [checkIns]);

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
                        setActiveModal(null);
                        setSelectedCalendarDay(null);
                    }}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '15px',
                            maxWidth: isMobile ? '95%' : '600px',
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
                                            setActiveModal(null);
                                            setSelectedCalendarDay(null);
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
                                                setCalendarViewMode(mode);
                                                setSelectedCalendarDay(null);
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
                                                    setSelectedCalendarDay(null);
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
                                                    setSelectedCalendarDay(null);
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
                                        setSelectedCalendarDay(null);
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
                                        // Month view rendering
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
                                                                                setSelectedCalendarDay(day);
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

                                                {/* Selected Day Details */}
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
                                                                onClick={() => setSelectedCalendarDay(null)}
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
                                        // Week view - simplified placeholder
                                        return <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>Week view coming soon</div>;
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* JOURNEY CALENDAR MODAL - Inline (source: JourneyCalendarModals lines 6410-6551) */}
            {activeModal === 'journeyCalendar' && (
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
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '15px',
                        maxWidth: isMobile ? '95%' : '400px',
                        width: '100%'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                            {/* Option 1: Calendar Heatmap */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('medium');
                                    setActiveModal('calendarHeatmap');
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
                                    <i data-lucide="calendar" style={{ width: '24px', height: '24px' }}></i>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Check-In Calendar</div>
                                        <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                                            View check-in heatmap & history
                                        </div>
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '20px', height: '20px' }}></i>
                            </button>

                            {/* Option 2: Graph Settings */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('medium');
                                    setActiveModal('graphSettings');
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
                                    setActiveModal(null);
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
            )}

            {/* WEEKLY REPORT MODAL - Inline (source: JourneyInsightsModals lines 8152-8643) */}
            {activeModal === 'weeklyReport' && (() => {
                // Calculate week-specific stats
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                weekAgo.setHours(0, 0, 0, 0);

                // Check-in stats for the week
                const thisWeekCheckIns = checkIns?.filter(c => {
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

                // Reflection stats for the week (using empty array if reflections not available)
                const thisWeekReflections = reflections?.filter(r => {
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

                // Assignment progress for the week (using empty array if assignments not available)
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

                // Coach notes for the week (using empty array if coachNotes not available)
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
                    onClick={() => setActiveModal(null)}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '15px',
                            maxWidth: isMobile ? '95%' : '600px',
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
                                        onClick={() => setActiveModal(null)}
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
            })()}

        {/* MOOD INSIGHTS MODAL - Inline (source: JourneyInsightsModals lines 9143-9311) */}
        {activeModal === 'moodInsights' && (
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
            onClick={() => setActiveModal(null)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: isMobile ? '12px' : '15px',
                    maxWidth: isMobile ? '95%' : '500px',
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
                                onClick={() => setActiveModal(null)}
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
                                setActiveModal(null);
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
        )}

        {/* OVERALL DAY INSIGHTS MODAL - Inline (source: JourneyInsightsModals lines 9486-9662) */}
        {activeModal === 'overallDayInsights' && (
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
            onClick={() => setActiveModal(null)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: isMobile ? '12px' : '15px',
                    maxWidth: isMobile ? '95%' : '500px',
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
                                onClick={() => setActiveModal(null)}
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
                                setActiveModal(null);
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
        )}

        {/* GRAPH SETTINGS MODAL - Inline with IIFE (source: JourneyInsightsModals lines 9845-10150) */}
        {activeModal === 'graphSettings' && (() => {
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
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: isMobile ? '12px' : '15px',
                        maxWidth: isMobile ? '95%' : '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
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
                                    onClick={() => setActiveModal(null)}
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
                                    setActiveModal(null);
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
        })()}
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

    // MODAL STATE (replaces external component pattern)
    const [activeModal, setActiveModal] = useState(null);
    // activeModal values: 'setGoal' | 'jar' | 'addCountdown' | 'manageGoal' | 'createGoal' | 'addMilestones' | null
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Set Goal Modal State
    const [goalType, setGoalType] = useState('custom');
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [goalNotes, setGoalNotes] = useState('');


    // JAR Modal State
    const [newAmount, setNewAmount] = useState('0');
    const [updateNote, setUpdateNote] = useState('');
    const [savingsHistory, setSavingsHistory] = useState([]);
    const [jarLoading, setJarLoading] = useState(false);

    // Add Countdown Modal State
    const [countdownName, setCountdownName] = useState('');
    const [countdownTargetDate, setCountdownTargetDate] = useState('');
    const [countdownIcon, setCountdownIcon] = useState('🎉');
    const [countdownDescription, setCountdownDescription] = useState('');

    // Manage Goal Modal State
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionNote, setTransactionNote] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [goalTransactions, setGoalTransactions] = useState([]);

    // Touch tracking state
    const [financesTouchStart, setFinancesTouchStart] = useState(0);
    const [financesTouchEnd, setFinancesTouchEnd] = useState(0);
    const [financesIsDragging, setFinancesIsDragging] = useState(false);
    const [savingsCarouselTouchStart, setSavingsCarouselTouchStart] = useState(0);

    // Refs for touch swipe functionality
    const financesCardsRef = useRef(null);
    const savingsCarouselRef = useRef(null);

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ✅ PHASE 4, PART 3, STEP 3: Local utility functions (no global state)

    // Calculate sobriety days from sobriety date (DST-proof, timezone-aware)
    // Use centralized timezone-aware sobriety calculation from utils.js
    const calculateSobrietyDays = (sobrietyDate) => {
        return window.GLRSApp?.utils?.calculateSobrietyDays(sobrietyDate) || 0;
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
    const loadSavingsItems = async (uid) => {
        try {
            const snapshot = await window.db.collection('savingsItems')
                .where('userId', '==', uid)
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
    const loadSavingsGoals = async (uid) => {
        try {
            const snapshot = await window.db.collection('savingsGoals')
                .where('userId', '==', uid)
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
                    loadSavingsItems(user.uid),
                    loadSavingsGoals(user.uid),
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

    // Initialize Lucide icons on component mount (for always-visible icons)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ JourneyFinancesTab: Initial Lucide icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Re-initialize Lucide icons when modals open
    useEffect(() => {
        if (activeModal) {
            // Small delay to ensure DOM has updated
            const timer = setTimeout(() => {
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                    console.log('✅ JourneyFinancesTab: Lucide icons initialized for modal');
                } else {
                    console.warn('⚠️ JourneyFinancesTab: Lucide library not available');
                }
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [activeModal]);

    // useEffect: Reset setGoal modal form when opened
    useEffect(() => {
        if (activeModal === 'setGoal') {
            setGoalType('custom');
            setGoalName('');
            setTargetAmount('');
            setTargetDate('');
            setGoalNotes('');
        }
    }, [activeModal]);

    // useEffect: Initialize jar modal when opened
    useEffect(() => {
        if (activeModal === 'jar') {
            setNewAmount(String(actualMoneySaved || 0));
            setJarLoading(true);

            // Load savings history
            const loadSavingsHistory = async () => {
                try {
                    const userId = window.firebase.auth().currentUser.uid;
                    const historySnapshot = await window.db.collection('savingsUpdates')
                        .where('userId', '==', userId)
                        .orderBy('timestamp', 'desc')
                        .limit(10)
                        .get();

                    setSavingsHistory(historySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })));
                } catch (error) {
                    console.error('Error loading savings history:', error);
                } finally {
                    setJarLoading(false);
                }
            };

            loadSavingsHistory();
        }
    }, [activeModal, actualMoneySaved]);

    // useEffect: Reset addCountdown modal form when opened
    useEffect(() => {
        if (activeModal === 'addCountdown') {
            setCountdownName('');
            setCountdownTargetDate('');
            setCountdownIcon('🎉');
            setCountdownDescription('');
        }
    }, [activeModal]);


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
                padding: isMobile ? '0 4%' : '0 5%',
                maxWidth: isMobile ? '100%' : '600px',
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
                                                const minCost = item.minCost || 0;
                                                const progress = minCost > 0 ? Math.min(100, (totalSaved / minCost) * 100) : 0;
                                                const canAfford = totalSaved >= minCost;
                                                const daysAway = canAfford ? 0 : Math.ceil((minCost - totalSaved) / dailyCost);

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
                                                                    ${(item.minCost || 0).toLocaleString()} - ${(item.maxCost || 0).toLocaleString()}
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

                            {/* ========== OPTION 2: FINANCIAL MILESTONE TIMELINE ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{color: '#058585', fontSize: '18px', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide="milestone" style={{width: '20px', height: '20px', strokeWidth: 2}}></i>
                                    Financial Milestone Timeline
                                </h3>

                                {savingsGoals.length > 0 && savingsGoals[0] ? ((() => {
                                    const primaryGoal = savingsGoals[0]; // Use first goal as primary
                                    const actualSaved = totalSaved; // sobrietyDays × dailyCost
                                    const hasMilestones = primaryGoal.milestones && primaryGoal.milestones.length > 0;

                                    // Auto-detect milestone achievements
                                    const milestonesWithStatus = hasMilestones ? primaryGoal.milestones.map(m => ({
                                        ...m,
                                        achieved: actualSaved >= (m.amount || 0),
                                        progress: m.amount > 0 ? Math.min(100, (actualSaved / m.amount) * 100) : 0
                                    })) : [];

                                    const nextMilestone = milestonesWithStatus.find(m => !m.achieved);
                                    const achievedCount = milestonesWithStatus.filter(m => m.achieved).length;
                                    const totalMilestones = milestonesWithStatus.length;
                                    const goalProgress = primaryGoal.targetAmount > 0 ? Math.min(100, (actualSaved / primaryGoal.targetAmount) * 100) : 0;

                                    return React.createElement('div', null,
                                        // Goal Stats Card
                                        React.createElement('div', {
                                            style: {
                                                background: goalProgress >= 100
                                                    ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                    : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                                borderRadius: '12px',
                                                padding: '24px',
                                                border: goalProgress >= 100 ? '2px solid #00A86B' : '2px solid rgba(5, 133, 133, 0.2)',
                                                marginBottom: '24px'
                                            }
                                        },
                                            // Goal Header
                                            React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' } },
                                                React.createElement('i', { 'data-lucide': 'piggy-bank', style: {width: '36px', height: '36px', strokeWidth: 2, color: '#058585', marginBottom: '8px'} }),
                                                React.createElement('div', { style: { fontSize: '14px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' } },
                                                    `Goal: ${primaryGoal.name || 'Savings Goal'}`
                                                ),
                                                React.createElement('div', { style: { fontSize: '24px', fontWeight: '700', color: '#058585', marginBottom: '4px' } },
                                                    `$${actualSaved.toLocaleString()} / $${(primaryGoal.targetAmount || 0).toLocaleString()}`
                                                ),
                                                hasMilestones && React.createElement('div', { style: { fontSize: '13px', color: '#666', marginTop: '8px' } },
                                                    `${achievedCount} of ${totalMilestones} milestones achieved`
                                                )
                                            ),

                                            // Progress Bar
                                            React.createElement('div', {
                                                style: {
                                                    width: '100%',
                                                    height: '12px',
                                                    background: 'rgba(0,0,0,0.1)',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    marginBottom: '16px'
                                                }
                                            },
                                                React.createElement('div', {
                                                    style: {
                                                        width: `${goalProgress}%`,
                                                        height: '100%',
                                                        background: goalProgress >= 100
                                                            ? '#00A86B'
                                                            : 'linear-gradient(90deg, #058585 0%, #069494 100%)',
                                                        borderRadius: '6px',
                                                        transition: 'width 0.3s ease'
                                                    }
                                                })
                                            ),

                                            // Stats Row
                                            React.createElement('div', { style: { fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '16px' } },
                                                goalProgress >= 100
                                                    ? '✅ GOAL ACHIEVED! 🎉'
                                                    : `${Math.round(goalProgress)}% complete • $${((primaryGoal.targetAmount || 0) - actualSaved).toLocaleString()} remaining`
                                            ),

                                            // Action Buttons
                                            React.createElement('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center' } },
                                                !hasMilestones && React.createElement('button', {
                                                    onClick: () => {
                                                        window.GLRSApp.utils.triggerHaptic('light');
                                                        setSelectedGoal(primaryGoal);
                                                        setActiveModal('addMilestones');
                                                    },
                                                    style: {
                                                        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
                                                        color: '#fff',
                                                        padding: '10px 20px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }
                                                },
                                                    React.createElement('i', { 'data-lucide': 'plus', style: {width: '16px', height: '16px'} }),
                                                    'Add Milestones'
                                                ),
                                                React.createElement('button', {
                                                    onClick: () => {
                                                        window.GLRSApp.utils.triggerHaptic('light');
                                                        setSelectedGoal(primaryGoal);
                                                        setActiveModal('viewGoalDetails');
                                                    },
                                                    style: {
                                                        background: 'white',
                                                        color: '#058585',
                                                        padding: '10px 20px',
                                                        borderRadius: '8px',
                                                        border: '2px solid #058585',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }
                                                },
                                                    'View Details'
                                                )
                                            )
                                        ),

                                        // Milestone Timeline (if milestones exist)
                                        hasMilestones && React.createElement('div', {
                                            style: {
                                                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                border: '2px solid rgba(5, 133, 133, 0.2)',
                                                overflowX: 'auto',
                                                overflowY: 'hidden',
                                                marginBottom: '24px'
                                            }
                                        },
                                            React.createElement('div', { style: { fontSize: '14px', fontWeight: '600', color: '#058585', marginBottom: '16px' } },
                                                'Your Milestones'
                                            ),
                                            React.createElement('div', {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '40px',
                                                    minWidth: 'max-content',
                                                    paddingBottom: '10px'
                                                }
                                            },
                                                milestonesWithStatus.map((milestone, index) =>
                                                    React.createElement('div', {
                                                        key: index,
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            minWidth: '100px',
                                                            position: 'relative'
                                                        }
                                                    },
                                                        // Connecting Line
                                                        index > 0 && React.createElement('div', {
                                                            style: {
                                                                position: 'absolute',
                                                                left: '-40px',
                                                                top: '24px',
                                                                width: '40px',
                                                                height: '2px',
                                                                background: milestone.achieved ? '#00A86B' : 'rgba(5, 133, 133, 0.3)'
                                                            }
                                                        }),

                                                        // Milestone Circle
                                                        React.createElement('div', {
                                                            style: {
                                                                width: '48px',
                                                                height: '48px',
                                                                borderRadius: '50%',
                                                                background: milestone.achieved ? '#00A86B' : '#FFFFFF',
                                                                border: `3px solid ${milestone.achieved ? '#00A86B' : 'rgba(5, 133, 133, 0.3)'}`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '20px',
                                                                marginBottom: '8px',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: milestone.achieved ? '0 2px 8px rgba(0, 168, 107, 0.4)' : 'none'
                                                            }
                                                        },
                                                            milestone.achieved ? '✓' : (milestone.icon || '💰')
                                                        ),

                                                        // Milestone Label
                                                        React.createElement('div', {
                                                            style: {
                                                                fontSize: '13px',
                                                                fontWeight: milestone.achieved ? '600' : '400',
                                                                color: milestone.achieved ? '#00A86B' : '#333',
                                                                textAlign: 'center',
                                                                marginBottom: '4px'
                                                            }
                                                        },
                                                            milestone.label || `Milestone ${index + 1}`
                                                        ),

                                                        // Amount
                                                        React.createElement('div', {
                                                            style: {
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                color: milestone.achieved ? '#00A86B' : '#666'
                                                            }
                                                        },
                                                            `$${(milestone.amount || 0).toLocaleString()}`
                                                        ),

                                                        // Progress indicator for current milestone
                                                        !milestone.achieved && milestone.progress > 0 && React.createElement('div', {
                                                            style: {
                                                                fontSize: '10px',
                                                                color: '#058585',
                                                                marginTop: '4px',
                                                                fontWeight: '600'
                                                            }
                                                        },
                                                            `${Math.round(milestone.progress)}%`
                                                        )
                                                    )
                                                )
                                            )
                                        ),

                                        // Next Milestone Card (if exists)
                                        nextMilestone && React.createElement('div', {
                                            style: {
                                                background: 'white',
                                                border: '2px solid #5A9FD4',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                textAlign: 'center'
                                            }
                                        },
                                            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' } },
                                                'Next Milestone'
                                            ),
                                            React.createElement('div', { style: { fontSize: '20px', marginBottom: '8px' } },
                                                nextMilestone.icon || '🎯'
                                            ),
                                            React.createElement('div', { style: { fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' } },
                                                nextMilestone.label || 'Upcoming'
                                            ),
                                            React.createElement('div', { style: { fontSize: '20px', fontWeight: 'bold', color: '#5A9FD4', marginBottom: '8px' } },
                                                `$${(nextMilestone.amount || 0).toLocaleString()}`
                                            ),
                                            React.createElement('div', { style: { fontSize: '13px', color: '#666' } },
                                                `$${((nextMilestone.amount || 0) - actualSaved).toLocaleString()} to go • ${Math.round(nextMilestone.progress)}% there`
                                            )
                                        )
                                    );
                                })()) : (
                                    // EMPTY STATE: No goals created yet
                                    React.createElement('div', {
                                        style: {
                                            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                            borderRadius: '12px',
                                            padding: '48px 32px',
                                            border: '2px solid rgba(5, 133, 133, 0.2)',
                                            textAlign: 'center'
                                        }
                                    },
                                        React.createElement('i', {
                                            'data-lucide': 'piggy-bank',
                                            style: {width: '64px', height: '64px', color: '#058585', marginBottom: '24px', strokeWidth: 2}
                                        }),
                                        React.createElement('div', {
                                            style: { fontSize: '20px', color: '#333', marginBottom: '12px', fontWeight: '600' }
                                        }, 'Start Your Financial Journey'),
                                        React.createElement('div', {
                                            style: { fontSize: isMobile ? '14px' : '16px', color: '#333', marginTop: isMobile ? '12px' : '16px', lineHeight: '1.6', maxWidth: isMobile ? '100%' : '500px', margin: isMobile ? '12px auto 0' : '16px auto 0' }
                                        }, `Every day of sobriety is a step toward financial stability. You're saving $${dailyCost.toLocaleString()} per day - that's $${(totalSaved || 0).toLocaleString()} saved so far! Keep going, you're doing amazing! 💪`)
                                    )
                                )}
                            </div>

                            {/* ========== FINANCES TAB - UNDER CONSTRUCTION ========== */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                    borderRadius: '16px',
                                    padding: '48px 32px',
                                    border: '2px solid rgba(5, 133, 133, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    <i data-lucide="construction" style={{width: '72px', height: '72px', color: '#058585', marginBottom: '24px', strokeWidth: 2}}></i>
                                    <h3 style={{fontSize: '24px', color: '#058585', marginBottom: '16px', fontWeight: '700'}}>
                                        Finance Tools Under Development
                                    </h3>
                                    <p style={{fontSize: isMobile ? '14px' : '16px', color: '#333', lineHeight: '1.6', maxWidth: isMobile ? '100%' : '600px', margin: isMobile ? '0 auto 20px' : '0 auto 24px'}}>
                                        We're currently gathering feedback through surveys to better understand how we can best support your financial recovery journey. Your input will help us build tools that truly serve your needs.
                                    </p>
                                    <div style={{
                                        background: 'rgba(5, 133, 133, 0.1)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        marginTop: '24px',
                                        border: '1px solid rgba(5, 133, 133, 0.2)'
                                    }}>
                                        <p style={{fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5'}}>
                                            In the meantime, you're saving <strong style={{color: '#058585'}}>${dailyCost.toLocaleString()}</strong> per day - that's <strong style={{color: '#058585'}}>${(totalSaved || 0).toLocaleString()}</strong> saved through your sobriety! Keep up the amazing work!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>
            {/* ========== MODAL COMPONENTS ========== */}

            {/* TOMORROW GOALS MODAL - Inline with IIFE (source: JourneyDataModals lines 8851-9252) */}
            {activeModal === 'tomorrowGoals' && (() => {
                // TODO: Load yesterday's goal from Firestore
                const yesterdayGoal = null; // Placeholder - should load from Firestore
                const [goalStatus, setGoalStatus] = useState(null);
                const [goalNotes, setGoalNotes] = useState('');

                // TODO: Load goal stats from Firestore
                const goalStats = null; // Placeholder - should calculate from Firestore
                const goalHistory = []; // Placeholder - should load from Firestore

                const handleSubmitGoalStatus = async () => {
                    // TODO: Save goal status to Firestore
                    console.log('TODO: Save goal status', { goalStatus, goalNotes });
                    setActiveModal(null);
                };

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
                        setActiveModal(null);
                    }}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '20px',
                            maxWidth: isMobile ? '95%' : '600px',
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
                                        setActiveModal(null);
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
                                                            setGoalStatus(status.value);
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
                                                onChange={(e) => setGoalNotes(e.target.value)}
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
                                                handleSubmitGoalStatus();
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
                                                setActiveModal(null);
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
            })()}

            {/* SET GOAL MODAL - Created for Finances Tab */}
            {activeModal === 'setGoal' && (() => {
                const handleGoalTypeSelect = (type) => {
                    setGoalType(type);
                    switch(type) {
                        case 'emergency':
                            setGoalName('Emergency Fund');
                            setTargetAmount('1000');
                            break;
                        case '3months':
                            setGoalName('3 Months Expenses');
                            // Calculate based on user's daily cost
                            setTargetAmount(String(userData?.dailyCost ? userData.dailyCost * 90 : 5000));
                            break;
                        case '6months':
                            setGoalName('6 Months Expenses');
                            setTargetAmount(String(userData?.dailyCost ? userData.dailyCost * 180 : 10000));
                            break;
                        case 'custom':
                            setGoalName('');
                            setTargetAmount('');
                            break;
                    }
                };

                const handleSaveGoal = async () => {
                    if (!goalName || !targetAmount) {
                        window.GLRSApp.utils.showNotification('Please enter a goal name and target amount', 'error');
                        return;
                    }

                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        const goalData = {
                            userId: window.firebase.auth().currentUser.uid,
                            name: goalName,
                            targetAmount: parseFloat(targetAmount),
                            currentAmount: 0,
                            targetDate: targetDate || null,
                            notes: goalNotes,
                            status: 'active',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        };

                        await window.db.collection('savingsGoals').add(goalData);

                        // Reload savings goals FIRST
                        const goalsSnapshot = await window.db.collection('savingsGoals')
                            .where('userId', '==', window.firebase.auth().currentUser.uid)
                            .where('status', '==', 'active')
                            .orderBy('createdAt', 'desc')
                            .get();
                        setSavingsGoals(goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                        // THEN close modal and show success (after data is loaded)
                        window.GLRSApp.utils.showNotification('Savings goal created successfully!', 'success');
                        setActiveModal(null);
                    } catch (error) {
                        console.error('Error saving goal:', error);
                        window.GLRSApp.utils.showNotification('Failed to save goal. Please try again.', 'error');
                    }
                };

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
                    onClick={() => setActiveModal(null)}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '20px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            padding: isMobile ? '20px' : '24px'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                }}>
                                    🎯 Set Your Savings Goal
                                </h2>
                                <button
                                    onClick={() => setActiveModal(null)}
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

                            {/* Goal Type Selection */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '12px'
                                }}>
                                    Choose a Goal Type
                                </h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    <button
                                        onClick={() => handleGoalTypeSelect('emergency')}
                                        style={{
                                            padding: '16px',
                                            background: goalType === 'emergency' ? '#058585' : '#F5F5F5',
                                            color: goalType === 'emergency' ? '#FFFFFF' : '#333333',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div>Emergency Fund</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>$1,000</div>
                                    </button>

                                    <button
                                        onClick={() => handleGoalTypeSelect('3months')}
                                        style={{
                                            padding: '16px',
                                            background: goalType === '3months' ? '#058585' : '#F5F5F5',
                                            color: goalType === '3months' ? '#FFFFFF' : '#333333',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div>3 Months Expenses</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                                            ${userData?.dailyCost ? (userData.dailyCost * 90).toLocaleString() : '5,000'}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleGoalTypeSelect('6months')}
                                        style={{
                                            padding: '16px',
                                            background: goalType === '6months' ? '#058585' : '#F5F5F5',
                                            color: goalType === '6months' ? '#FFFFFF' : '#333333',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div>6 Months Expenses</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                                            ${userData?.dailyCost ? (userData.dailyCost * 180).toLocaleString() : '10,000'}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleGoalTypeSelect('custom')}
                                        style={{
                                            padding: '16px',
                                            background: goalType === 'custom' ? '#058585' : '#F5F5F5',
                                            color: goalType === 'custom' ? '#FFFFFF' : '#333333',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div>Custom Amount</div>
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Set your own goal</div>
                                    </button>
                                </div>
                            </div>

                            {/* Goal Details */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Goal Name *
                                </label>
                                <input
                                    type="text"
                                    value={goalName}
                                    onChange={(e) => setGoalName(e.target.value)}
                                    placeholder="e.g., New Car Down Payment"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Target Amount *
                                </label>
                                <input
                                    type="number"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    placeholder="$5,000"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Target Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={goalNotes}
                                    onChange={(e) => setGoalNotes(e.target.value)}
                                    placeholder="Why this goal matters to you..."
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

                            {/* Actions */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <button
                                    onClick={handleSaveGoal}
                                    disabled={!goalName || !targetAmount}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: goalName && targetAmount ? '#058585' : '#CCCCCC',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: goalName && targetAmount ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Save Goal
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#F5F5F5',
                                        color: '#333333',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* MANAGE GOAL MODAL - Comprehensive goal management */}
            {activeModal === 'manageGoal' && selectedGoal && (() => {
                const progress = selectedGoal.currentAmount && selectedGoal.targetAmount
                    ? (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100
                    : 0;
                const isComplete = progress >= 100;
                const remainingAmount = Math.max(0, selectedGoal.targetAmount - (selectedGoal.currentAmount || 0));

                // Calculate budget recommendation
                const calculateBudgetRecommendation = () => {
                    if (!selectedGoal.targetDate) return null;

                    const now = new Date();
                    const targetDate = new Date(selectedGoal.targetDate);
                    const daysRemaining = Math.max(1, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
                    const dailySavings = remainingAmount / daysRemaining;
                    const weeklySavings = dailySavings * 7;
                    const monthlySavings = dailySavings * 30;

                    return {
                        daysRemaining,
                        dailySavings,
                        weeklySavings,
                        monthlySavings
                    };
                };

                const budget = calculateBudgetRecommendation();

                const handleAddMoney = async () => {
                    const amount = parseFloat(transactionAmount);
                    if (isNaN(amount) || amount <= 0) {
                        window.GLRSApp.utils.showNotification('Please enter a valid amount', 'error');
                        return;
                    }

                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        const newCurrentAmount = (selectedGoal.currentAmount || 0) + amount;

                        // Update goal in Firestore
                        await window.db.collection('savingsGoals').doc(selectedGoal.id).update({
                            currentAmount: newCurrentAmount,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Log transaction
                        await window.db.collection('savingsTransactions').add({
                            userId: window.firebase.auth().currentUser.uid,
                            goalId: selectedGoal.id,
                            goalName: selectedGoal.name,
                            type: 'deposit',
                            amount: amount,
                            note: transactionNote || null,
                            previousAmount: selectedGoal.currentAmount || 0,
                            newAmount: newCurrentAmount,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Update local state
                        const updatedGoal = { ...selectedGoal, currentAmount: newCurrentAmount };
                        setSelectedGoal(updatedGoal);
                        setSavingsGoals(savingsGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));

                        setTransactionAmount('');
                        setTransactionNote('');
                        window.GLRSApp.utils.showNotification(`Added $${amount.toFixed(2)} to ${selectedGoal.name}!`, 'success');

                        // Load transaction history
                        loadTransactionHistory();
                    } catch (error) {
                        console.error('Error adding money:', error);
                        window.GLRSApp.utils.showNotification('Failed to add money. Please try again.', 'error');
                    }
                };

                const handleWithdrawMoney = async () => {
                    const amount = parseFloat(transactionAmount);
                    if (isNaN(amount) || amount <= 0) {
                        window.GLRSApp.utils.showNotification('Please enter a valid amount', 'error');
                        return;
                    }

                    if (amount > (selectedGoal.currentAmount || 0)) {
                        window.GLRSApp.utils.showNotification('Cannot withdraw more than current amount', 'error');
                        return;
                    }

                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        const newCurrentAmount = (selectedGoal.currentAmount || 0) - amount;

                        // Update goal in Firestore
                        await window.db.collection('savingsGoals').doc(selectedGoal.id).update({
                            currentAmount: newCurrentAmount,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Log transaction
                        await window.db.collection('savingsTransactions').add({
                            userId: window.firebase.auth().currentUser.uid,
                            goalId: selectedGoal.id,
                            goalName: selectedGoal.name,
                            type: 'withdrawal',
                            amount: amount,
                            note: transactionNote || null,
                            previousAmount: selectedGoal.currentAmount || 0,
                            newAmount: newCurrentAmount,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Update local state
                        const updatedGoal = { ...selectedGoal, currentAmount: newCurrentAmount };
                        setSelectedGoal(updatedGoal);
                        setSavingsGoals(savingsGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));

                        setTransactionAmount('');
                        setTransactionNote('');
                        window.GLRSApp.utils.showNotification(`Withdrew $${amount.toFixed(2)} from ${selectedGoal.name}`, 'success');

                        // Load transaction history
                        loadTransactionHistory();
                    } catch (error) {
                        console.error('Error withdrawing money:', error);
                        window.GLRSApp.utils.showNotification('Failed to withdraw money. Please try again.', 'error');
                    }
                };

                const handleMarkComplete = async () => {
                    try {
                        window.GLRSApp.utils.triggerHaptic('success');
                        await window.db.collection('savingsGoals').doc(selectedGoal.id).update({
                            status: 'completed',
                            completedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp.utils.showNotification(`🎉 Congratulations! You completed ${selectedGoal.name}!`, 'success');
                        setActiveModal(null);
                        setSelectedGoal(null);

                        // Reload goals
                        const goalsSnapshot = await window.db.collection('savingsGoals')
                            .where('userId', '==', window.firebase.auth().currentUser.uid)
                            .where('status', '==', 'active')
                            .orderBy('createdAt', 'desc')
                            .get();
                        setSavingsGoals(goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    } catch (error) {
                        console.error('Error marking goal complete:', error);
                        window.GLRSApp.utils.showNotification('Failed to mark goal as complete. Please try again.', 'error');
                    }
                };

                const handleDeleteGoal = async () => {
                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        await window.db.collection('savingsGoals').doc(selectedGoal.id).update({
                            status: 'deleted',
                            deletedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp.utils.showNotification(`Deleted ${selectedGoal.name}`, 'success');
                        setActiveModal(null);
                        setSelectedGoal(null);
                        setShowDeleteConfirm(false);

                        // Reload goals
                        const goalsSnapshot = await window.db.collection('savingsGoals')
                            .where('userId', '==', window.firebase.auth().currentUser.uid)
                            .where('status', '==', 'active')
                            .orderBy('createdAt', 'desc')
                            .get();
                        setSavingsGoals(goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    } catch (error) {
                        console.error('Error deleting goal:', error);
                        window.GLRSApp.utils.showNotification('Failed to delete goal. Please try again.', 'error');
                    }
                };

                const loadTransactionHistory = async () => {
                    try {
                        const transactionsSnapshot = await window.db.collection('savingsTransactions')
                            .where('goalId', '==', selectedGoal.id)
                            .orderBy('timestamp', 'desc')
                            .limit(10)
                            .get();
                        setGoalTransactions(transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    } catch (error) {
                        console.error('Error loading transactions:', error);
                    }
                };

                // Load transaction history on modal open
                React.useEffect(() => {
                    if (activeModal === 'manageGoal' && selectedGoal) {
                        loadTransactionHistory();
                    }
                }, [activeModal, selectedGoal?.id]);

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
                        setActiveModal(null);
                        setSelectedGoal(null);
                        setShowDeleteConfirm(false);
                    }}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '24px'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {selectedGoal.name}
                                    {isComplete && <span style={{ fontSize: '24px' }}>✅</span>}
                                </h2>
                                <button
                                    onClick={() => {
                                        setActiveModal(null);
                                        setSelectedGoal(null);
                                        setShowDeleteConfirm(false);
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

                            {/* Visual Jar Representation */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {/* SVG Jar */}
                                <svg width="120" height="140" viewBox="0 0 120 140" style={{ margin: '0 auto 16px' }}>
                                    {/* Jar outline */}
                                    <path
                                        d="M 30 20 L 30 10 L 90 10 L 90 20 L 100 25 L 100 130 Q 100 135 95 135 L 25 135 Q 20 135 20 130 L 20 25 Z"
                                        fill="none"
                                        stroke="#058585"
                                        strokeWidth="3"
                                    />
                                    {/* Jar lid */}
                                    <rect x="28" y="8" width="64" height="4" fill="#058585" />
                                    <ellipse cx="60" cy="10" rx="32" ry="3" fill="#058585" />

                                    {/* Water fill (based on progress) */}
                                    <defs>
                                        <clipPath id="jarClip">
                                            <path d="M 30 20 L 90 20 L 100 25 L 100 130 Q 100 135 95 135 L 25 135 Q 20 135 20 130 L 20 25 Z" />
                                        </clipPath>
                                    </defs>
                                    <rect
                                        x="20"
                                        y={25 + (110 * (1 - Math.min(progress, 100) / 100))}
                                        width="80"
                                        height={110 * Math.min(progress, 100) / 100}
                                        fill={isComplete ? '#00A86B' : '#058585'}
                                        opacity="0.6"
                                        clipPath="url(#jarClip)"
                                    />

                                    {/* Coins/money symbols */}
                                    {progress > 20 && (
                                        <>
                                            <circle cx="40" cy="115" r="6" fill="#FFD700" opacity="0.8" />
                                            <text x="40" y="118" fontSize="8" textAnchor="middle" fill="#333">$</text>
                                        </>
                                    )}
                                    {progress > 50 && (
                                        <>
                                            <circle cx="60" cy="100" r="6" fill="#FFD700" opacity="0.8" />
                                            <text x="60" y="103" fontSize="8" textAnchor="middle" fill="#333">$</text>
                                        </>
                                    )}
                                    {progress > 75 && (
                                        <>
                                            <circle cx="80" cy="85" r="6" fill="#FFD700" opacity="0.8" />
                                            <text x="80" y="88" fontSize="8" textAnchor="middle" fill="#333">$</text>
                                        </>
                                    )}
                                </svg>

                                {/* Progress Text */}
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: isComplete ? '#00A86B' : '#058585', marginBottom: '8px' }}>
                                    {Math.round(progress)}%
                                </div>
                                <div style={{ fontSize: '18px', color: '#333', marginBottom: '4px' }}>
                                    ${(selectedGoal.currentAmount || 0).toLocaleString()} / ${(selectedGoal.targetAmount || 0).toLocaleString()}
                                </div>
                                {remainingAmount > 0 && (
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        ${remainingAmount.toLocaleString()} remaining
                                    </div>
                                )}
                            </div>

                            {/* Budget Recommendation */}
                            {budget && remainingAmount > 0 && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    border: '2px solid rgba(255, 193, 7, 0.3)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <i data-lucide="lightbulb" style={{ width: '20px', height: '20px', color: '#FFC107' }}></i>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                            Budget Recommendation
                                        </h3>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                        {budget.daysRemaining} days until target date
                                    </div>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#666' }}>Daily:</span>
                                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                                ${budget.dailySavings.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#666' }}>Weekly:</span>
                                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                                ${budget.weeklySavings.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#666' }}>Monthly:</span>
                                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                                ${budget.monthlySavings.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add/Withdraw Money Section */}
                            {!isComplete && (
                                <div style={{
                                    background: '#F9F9F9',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                        Manage Funds
                                    </h3>
                                    <div style={{ marginBottom: '12px' }}>
                                        <input
                                            type="number"
                                            value={transactionAmount}
                                            onChange={(e) => setTransactionAmount(e.target.value)}
                                            placeholder="Amount"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                fontSize: '16px',
                                                fontFamily: 'inherit',
                                                marginBottom: '8px'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={transactionNote}
                                            onChange={(e) => setTransactionNote(e.target.value)}
                                            placeholder="Note (optional)"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                fontSize: '14px',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <button
                                            onClick={handleAddMoney}
                                            disabled={!transactionAmount || parseFloat(transactionAmount) <= 0}
                                            style={{
                                                padding: '12px',
                                                background: transactionAmount && parseFloat(transactionAmount) > 0 ? '#00A86B' : '#CCCCCC',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: transactionAmount && parseFloat(transactionAmount) > 0 ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <i data-lucide="plus" style={{ width: '16px', height: '16px' }}></i>
                                            Add Money
                                        </button>
                                        <button
                                            onClick={handleWithdrawMoney}
                                            disabled={!transactionAmount || parseFloat(transactionAmount) <= 0 || parseFloat(transactionAmount) > (selectedGoal.currentAmount || 0)}
                                            style={{
                                                padding: '12px',
                                                background: transactionAmount && parseFloat(transactionAmount) > 0 && parseFloat(transactionAmount) <= (selectedGoal.currentAmount || 0) ? '#FF6B6B' : '#CCCCCC',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: transactionAmount && parseFloat(transactionAmount) > 0 && parseFloat(transactionAmount) <= (selectedGoal.currentAmount || 0) ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <i data-lucide="minus" style={{ width: '16px', height: '16px' }}></i>
                                            Withdraw
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Transaction History */}
                            {goalTransactions.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                                        Recent Transactions
                                    </h3>
                                    <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflow: 'auto' }}>
                                        {goalTransactions.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                style={{
                                                    background: '#F9F9F9',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                                                        {transaction.type === 'deposit' ? '💰 Deposit' : '💸 Withdrawal'}
                                                    </div>
                                                    {transaction.note && (
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {transaction.note}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                        {transaction.timestamp?.toDate?.().toLocaleDateString() || 'Just now'}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    color: transaction.type === 'deposit' ? '#00A86B' : '#FF6B6B'
                                                }}>
                                                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {!isComplete && progress >= 100 && (
                                    <button
                                        onClick={handleMarkComplete}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i data-lucide="check-circle" style={{ width: '20px', height: '20px' }}></i>
                                        Mark as Complete
                                    </button>
                                )}

                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: '#F5F5F5',
                                            color: '#FF6B6B',
                                            border: '1px solid #FF6B6B',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i data-lucide="trash-2" style={{ width: '16px', height: '16px' }}></i>
                                        Delete Goal
                                    </button>
                                ) : (
                                    <div style={{
                                        background: '#FFF3F3',
                                        border: '2px solid #FF6B6B',
                                        borderRadius: '8px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#333', marginBottom: '12px', textAlign: 'center' }}>
                                            Are you sure you want to delete this goal?
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                style={{
                                                    padding: '10px',
                                                    background: '#F5F5F5',
                                                    color: '#333',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteGoal}
                                                style={{
                                                    padding: '10px',
                                                    background: '#FF6B6B',
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* JAR MODAL - Created for Finances Tab */}
            {activeModal === 'jar' && (() => {
                const handleUpdateSavings = async () => {
                    const amount = parseFloat(newAmount);
                    if (isNaN(amount) || amount < 0) {
                        window.GLRSApp.utils.showNotification('Please enter a valid amount', 'error');
                        return;
                    }

                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        const userId = window.firebase.auth().currentUser.uid;

                        // Update current total in user document
                        await window.db.collection('users').doc(userId).update({
                            'financials.savedAmount': amount,
                            'financials.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Log the update
                        await window.db.collection('savingsUpdates').add({
                            userId: userId,
                            amount: amount,
                            previousAmount: actualMoneySaved,
                            note: updateNote || null,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp.utils.showNotification('Savings amount updated!', 'success');
                        setActualMoneySaved(amount);
                        setActiveModal(null);
                    } catch (error) {
                        console.error('Error updating savings:', error);
                        window.GLRSApp.utils.showNotification('Failed to update savings. Please try again.', 'error');
                    }
                };

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
                    onClick={() => setActiveModal(null)}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '20px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            padding: isMobile ? '20px' : '24px'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                }}>
                                    💰 Your Virtual Savings Jar
                                </h2>
                                <button
                                    onClick={() => setActiveModal(null)}
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

                            {/* Current Balance Display */}
                            <div style={{
                                textAlign: 'center',
                                padding: '32px 20px',
                                background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                borderRadius: '16px',
                                marginBottom: '24px',
                                color: '#FFFFFF'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    opacity: 0.9,
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    Current Balance
                                </div>
                                <div style={{
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px'
                                }}>
                                    ${actualMoneySaved.toLocaleString()}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    opacity: 0.8
                                }}>
                                    Actual money saved
                                </div>
                            </div>

                            {/* Update Amount Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Update Your Savings Amount
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    marginBottom: '16px'
                                }}>
                                    How much have you actually saved so far?
                                </p>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '8px'
                                    }}>
                                        New Amount *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#058585'
                                        }}>
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={newAmount}
                                            onChange={(e) => setNewAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 28px',
                                                borderRadius: '8px',
                                                border: '2px solid #058585',
                                                fontSize: '16px',
                                                fontFamily: 'inherit',
                                                fontWeight: '600'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '8px'
                                    }}>
                                        Note (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={updateNote}
                                        onChange={(e) => setUpdateNote(e.target.value)}
                                        placeholder="e.g., Added $500 from paycheck"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Savings History */}
                            {!loading && savingsHistory.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '12px'
                                    }}>
                                        Recent Updates
                                    </h3>
                                    <div style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        border: '1px solid #E5E5E5',
                                        borderRadius: '8px'
                                    }}>
                                        {savingsHistory.map(entry => (
                                            <div key={entry.id} style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #F5F5F5',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#333',
                                                        marginBottom: '2px'
                                                    }}>
                                                        ${entry.amount.toLocaleString()}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#666'
                                                    }}>
                                                        {entry.timestamp && new Date(entry.timestamp.toDate()).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                    {entry.note && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#999',
                                                            fontStyle: 'italic',
                                                            marginTop: '4px'
                                                        }}>
                                                            {entry.note}
                                                        </div>
                                                    )}
                                                </div>
                                                {entry.previousAmount !== undefined && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: entry.amount > entry.previousAmount ? '#00A86B' : '#DC143C',
                                                        fontWeight: '600'
                                                    }}>
                                                        {entry.amount > entry.previousAmount ? '+' : ''}{(entry.amount - entry.previousAmount).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <button
                                    onClick={handleUpdateSavings}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#058585',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Update Savings
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#F5F5F5',
                                        color: '#333333',
                                        border: 'none',
                                        borderRadius: '8px',
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
            })()}

            {/* ADD COUNTDOWN MODAL - Created for Finances Tab */}
            {activeModal === 'addCountdown' && (() => {
                // Calculate days until target date
                const calculateDaysUntil = () => {
                    if (!countdownTargetDate) return null;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const target = new Date(countdownTargetDate);
                    target.setHours(0, 0, 0, 0);
                    const diffTime = target - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays;
                };

                const daysUntil = calculateDaysUntil();

                const handleAddCountdown = async () => {
                    if (!countdownName || !countdownTargetDate) {
                        window.GLRSApp.utils.showNotification('Please enter a name and target date', 'error');
                        return;
                    }

                    if (daysUntil < 0) {
                        window.GLRSApp.utils.showNotification('Target date must be in the future', 'error');
                        return;
                    }

                    try {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        const userId = window.firebase.auth().currentUser.uid;

                        await window.db.collection('countdowns').add({
                            userId: userId,
                            name: countdownName,
                            targetDate: countdownTargetDate,
                            icon: countdownIcon || '🎯',
                            description: countdownDescription || null,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp.utils.showNotification('Countdown created!', 'success');
                        setActiveModal(null);
                    } catch (error) {
                        console.error('Error creating countdown:', error);
                        window.GLRSApp.utils.showNotification('Failed to create countdown. Please try again.', 'error');
                    }
                };

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
                    onClick={() => setActiveModal(null)}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '12px' : '20px',
                            maxWidth: isMobile ? '95%' : '500px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            padding: isMobile ? '20px' : '24px'
                        }}
                        onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                }}>
                                    ⏳ Add Custom Countdown
                                </h2>
                                <button
                                    onClick={() => setActiveModal(null)}
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

                            <p style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '24px'
                            }}>
                                Create a countdown to celebrate upcoming recovery milestones
                            </p>

                            {/* Countdown Details */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Countdown Name *
                                </label>
                                <input
                                    type="text"
                                    value={countdownName}
                                    onChange={(e) => setCountdownName(e.target.value)}
                                    placeholder="e.g., 6 Months Sober, First Year Anniversary"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Target Date *
                                </label>
                                <input
                                    type="date"
                                    value={countdownTargetDate}
                                    onChange={(e) => setCountdownTargetDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Icon/Emoji (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={countdownIcon}
                                    onChange={(e) => setCountdownIcon(e.target.value)}
                                    placeholder="🎉"
                                    maxLength={2}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '24px',
                                        fontFamily: 'inherit',
                                        textAlign: 'center'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={countdownDescription}
                                    onChange={(e) => setCountdownDescription(e.target.value)}
                                    placeholder="What you're looking forward to..."
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

                            {/* Preview */}
                            {countdownName && countdownTargetDate && daysUntil !== null && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    marginBottom: '24px',
                                    color: '#FFFFFF',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        opacity: 0.9
                                    }}>
                                        Preview
                                    </h3>
                                    <div style={{
                                        fontSize: '64px',
                                        marginBottom: '8px',
                                        lineHeight: 1
                                    }}>
                                        {countdownIcon || '🎯'}
                                    </div>
                                    <div style={{
                                        fontSize: '48px',
                                        fontWeight: 'bold',
                                        marginBottom: '8px'
                                    }}>
                                        {daysUntil}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        opacity: 0.9,
                                        marginBottom: '4px'
                                    }}>
                                        {daysUntil === 1 ? 'day' : 'days'}
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}>
                                        until {countdownName}
                                    </div>
                                    {countdownDescription && (
                                        <div style={{
                                            fontSize: '13px',
                                            opacity: 0.8,
                                            marginTop: '12px',
                                            fontStyle: 'italic'
                                        }}>
                                            "{countdownDescription}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <button
                                    onClick={handleAddCountdown}
                                    disabled={!countdownName || !countdownTargetDate}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: countdownName && countdownTargetDate ? '#058585' : '#CCCCCC',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: countdownName && countdownTargetDate ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Add Countdown
                                </button>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: '#F5F5F5',
                                        color: '#333333',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}


        </>
    );
}

// Register component globally
window.GLRSApp.components.JourneyFinancesTab = JourneyFinancesTab;

console.log('✅ PHASE 4, PART 3 COMPLETE: JourneyFinancesTab refactored to 3-layer architecture - NO global state');

// ═══════════════════════════════════════════════════════════
// PHASE 2 COMPLETE: All Journey modals integrated inline
// ═══════════════════════════════════════════════════════════
// External modal components deleted (JourneyCalendarModals,
// JourneyDataModals, JourneyInsightsModals, JourneyStreaksModals)
// All modals now rendered inline within their respective tab components
// ═══════════════════════════════════════════════════════════
