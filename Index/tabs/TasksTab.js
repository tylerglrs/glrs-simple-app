// Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

// Helper function for timezone-aware timestamp formatting
const formatDate = (date, format = 'date') => {
    if (!date) return '';
    // Convert Date objects to Firestore Timestamp format for formatTimestamp
    const timestamp = date.toDate ? date : { toDate: () => date };
    return window.GLRSApp?.utils?.formatTimestamp(timestamp, null, format) ||
           (date.toDate ? date.toDate() : date).toLocaleDateString();
};

/**
 * @file TasksTab.js
 * @description Tasks tab component for GLRS PIR Portal - Daily check-ins, reflections, and recovery tasks
 *
 * @architecture 3-Layer Direct Architecture (Component → Firebase → Component)
 * - NO global state dependencies
 * - Direct Firebase Firestore queries
 * - Local useState hooks for component state
 * - Real-time listeners with proper cleanup
 *
 * @features
 * - Morning check-ins (mood, craving, anxiety, sleep ratings)
 * - Evening reflections (overall day, reflection text)
 * - Pattern detection (30-day trend analysis with insights)
 * - Check-in streak tracking (real-time Firestore listener)
 * - Assignment and goal management
 * - 9 modal views (mood, craving, anxiety, sleep patterns, coping techniques, etc.)
 *
 * @state 23 useState hooks:
 * - Core: user, activeTaskTab, checkInStatus, checkInStreak, loading, error
 * - Data: morningCheckInData, eveningReflectionData, patternDetection, goals, assignments, weeklyStats, nextMilestone
 * - Modals: 9 visibility flags (showMoodPatternModal, showCravingPatternModal, etc.)
 *
 * @firebase 4 Firestore queries:
 * 1. Auth listener (onAuthStateChanged)
 * 2. Check-in status query (today's check-ins)
 * 3. Streak data listener (real-time updates)
 * 4. Pattern detection (30-day historical analysis)
 *
 * @handlers 4 async functions:
 * - handleMorningCheckIn: Submit morning check-in data
 * - handleEveningReflection: Submit evening reflection data
 * - handleAssignmentComplete: Mark assignment as complete
 * - handleReflectionSave: Save reflection to assignment
 *
 * @components Embedded components:
 * - TasksTabModals: 9 modal components for pattern viewing
 * - Inline Modals: 16 sidebar modals (habit, reflection, tasks, stats, etc.)
 * - CheckInModals: Check-in submission modals
 *
 * @dependencies
 * - Firebase Auth & Firestore
 * - window.GLRSApp.utils (showNotification, triggerHaptic)
 * - window.GLRSApp.loaders (loadAssignments)
 * - window.handleFirebaseError (global error handler)
 *
 * @refactored November 2025 - Migrated from 6-layer global state to 3-layer architecture
 * @author GLRS Development Team
 */

// Index/TasksTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

/**
 * TasksTab Component
 * @returns {React.Element} Tasks tab with check-ins, reflections, and recovery tasks
 */
function TasksTab() {
    // ═══════════════════════════════════════════════════════════
    // STEP 1 COMPLETE: Global state hook removed
    // STEP 2 COMPLETE: 3-layer architecture useState hooks added
    // ═══════════════════════════════════════════════════════════

    // CORE STATE (6 hooks)
    const [user, setUser] = React.useState(null);
    const [activeTaskTab, setActiveTaskTab] = React.useState('checkin'); // 'checkin' | 'reflections' | 'golden'
    const [checkInStatus, setCheckInStatus] = React.useState({ morning: false, evening: false });
    const [checkInStreak, setCheckInStreak] = React.useState(0);
    const [reflectionStreak, setReflectionStreak] = React.useState(0);
    const [streakData, setStreakData] = React.useState(null); // Full streak object with currentStreak, longestStreak, etc.
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // MORNING CHECK-IN STATE (1 hook)
    const [morningCheckInData, setMorningCheckInData] = React.useState({
        mood: null,      // 0-10
        craving: null,   // 0-10
        anxiety: null,   // 0-10
        sleep: null      // 0-10
    });

    // EVENING REFLECTION STATE (1 hook)
    const [eveningReflectionData, setEveningReflectionData] = React.useState({
        overallDay: null,  // 1-10
        reflection: ''
    });

    // PATTERN DETECTION STATE (1 hook)
    const [patternDetection, setPatternDetection] = React.useState({
        moodPattern: { average: 0, trend: 'stable', insights: [] },
        cravingPattern: { average: 0, trend: 'stable', insights: [] },
        anxietyPattern: { average: 0, trend: 'stable', insights: [] },
        sleepPattern: { average: 0, trend: 'stable', insights: [] }
    });

    // OPTIONAL STATE (8 hooks) - For full feature parity
    const [goals, setGoals] = React.useState([]);
    const [assignments, setAssignments] = React.useState([]);
    const [objectives, setObjectives] = React.useState([]);
    const [checkins, setCheckins] = React.useState([]);
    const [reflections, setReflections] = React.useState([]);
    const [coachNotes, setCoachNotes] = React.useState([]);
    const [weeklyStats, setWeeklyStats] = React.useState(null);
    const [nextMilestone, setNextMilestone] = React.useState(null);

    // MODAL VISIBILITY STATE (9 hooks) - For TasksTabModals integration
    const [showMoodPatternModal, setShowMoodPatternModal] = React.useState(false);
    const [showCravingPatternModal, setShowCravingPatternModal] = React.useState(false);
    const [showAnxietyPatternModal, setShowAnxietyPatternModal] = React.useState(false);
    const [showSleepPatternModal, setShowSleepPatternModal] = React.useState(false);
    const [showTipsModal, setShowTipsModal] = React.useState(false);
    const [showCopingTechniqueModal, setShowCopingTechniqueModal] = React.useState(false);
    const [showMilestoneModal, setShowMilestoneModal] = React.useState(false);
    const [showPastReflectionsModal, setShowPastReflectionsModal] = React.useState(false);
    const [showGratitudeModal, setShowGratitudeModal] = React.useState(false);

    // SIDEBAR AND MODAL STATE (2 hooks - replaces 17 hooks!)
    const [showSidebar, setShowSidebar] = React.useState(false);
    const [activeModal, setActiveModal] = React.useState(null);
    // activeModal values: 'habit' | 'reflection' | 'thisWeek' | 'overdue' | 'complete' |
    //                     'stats' | 'goalProgress' | 'wins' | 'streaks' | 'reflectionStreaks' |
    //                     'intentions' | 'pastIntentions' | 'snapshot' | 'habitHistory' |
    //                     'reflectionHistory' | 'winsHistory' | null

    // MODAL FORM STATE (local state for modal inputs)
    const [newHabitName, setNewHabitName] = React.useState('');
    const [newReflection, setNewReflection] = React.useState('');
    const [newWin, setNewWin] = React.useState('');
    const [newIntention, setNewIntention] = React.useState('');

    // TASKSTABMODALS STATE (for pattern modals)
    const [reflectionFilter, setReflectionFilter] = React.useState('all'); // 'all' | 'week' | 'month'
    const [selectedReflection, setSelectedReflection] = React.useState(null);
    const [gratitudeTheme, setGratitudeTheme] = React.useState('');
    const [gratitudeText, setGratitudeText] = React.useState('');

    // CHECKINMODALS STATE (for check-in modals)
    const [checkInModalType, setCheckInModalType] = React.useState(null); // 'checkIn' | 'reflection' | 'profilePrompt' | 'challengeCheckIn' | null
    const [selectedChallenge, setSelectedChallenge] = React.useState(null);
    const [challengeCheckInStatus, setChallengeCheckInStatus] = React.useState('');
    const [challengeCheckInNotes, setChallengeCheckInNotes] = React.useState('');

    // MOBILE RESPONSIVENESS STATE (1 hook)
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    // REFLECTION STATS STATE (1 hook)
    const [reflectionStats, setReflectionStats] = React.useState({
        totalAllTime: 0,
        totalThisMonth: 0,
        avgDailyScore: 0,
        topGratitudeThemes: [], // Top 3 themes with counts and dates
        gratitudeThemes: []
    });
    const [allReflections, setAllReflections] = React.useState([]);
    const [gratitudeJournalStats, setGratitudeJournalStats] = React.useState({
        allTime: 0,
        thisWeek: 0,
        thisMonth: 0
    });
    const [challengesHistoryStats, setChallengesHistoryStats] = React.useState({
        allTime: 0,
        thisWeek: 0,
        thisMonth: 0
    });
    const [gratitudeJournalPeriod, setGratitudeJournalPeriod] = React.useState(null); // 'allTime', 'thisWeek', 'thisMonth'
    const [challengesHistoryPeriod, setChallengesHistoryPeriod] = React.useState(null); // 'allTime', 'thisWeek', 'thisMonth'
    const [tomorrowGoals, setTomorrowGoals] = React.useState([]); // Array of { goal, date, completed, completedDate }
    const [yesterdayGoal, setYesterdayGoal] = React.useState(null); // Yesterday's goal to show in today's reflection
    const [shareGoalData, setShareGoalData] = React.useState(null); // { goal, date } for sharing to community
    const [shareComment, setShareComment] = React.useState(''); // Comment for community share

    // REFLECTION STREAK DATA STATE (1 hook)
    const [reflectionStreakData, setReflectionStreakData] = React.useState({
        currentStreak: 0,
        longestStreak: 0,
        allStreaks: []
    });

    // ═══════════════════════════════════════════════════════════
    // STEP 3 COMPLETE: Firebase authentication listener
    // ═══════════════════════════════════════════════════════════

    // Load current user from Firebase auth
    React.useEffect(() => {
        const unsubscribeAuth = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Initialize Lucide icons on component mount (for always-visible icons like hamburger menu)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ TasksTab: Initial Lucide icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Mobile responsiveness resize listener
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ═══════════════════════════════════════════════════════════
    // STEP 4a COMPLETE: Load check-in status (morning/evening completion)
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const loadCheckInStatus = async () => {
            try {
                setLoading(true);
                const db = firebase.firestore();

                // Get today's date at midnight for comparison
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Query today's check-in
                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    const checkInData = snapshot.docs[0].data();
                    setCheckInStatus({
                        morning: !!checkInData.morningData || !!checkInData.mood,
                        evening: !!checkInData.eveningData || !!checkInData.overallDay
                    });
                } else {
                    setCheckInStatus({ morning: false, evening: false });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error loading check-in status:', error);
                window.handleFirebaseError && window.handleFirebaseError(error, 'loadCheckInStatus');
                setCheckInStatus({ morning: false, evening: false });
                setLoading(false);
            }
        };

        loadCheckInStatus();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4b COMPLETE: Real-time listener for streak data
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setCheckInStreak(0);
            setReflectionStreak(0);
            setStreakData(null);
            return;
        }

        const db = firebase.firestore();

        // Real-time listener for streak document
        const unsubscribe = db.collection('streaks')
            .doc(user.uid)
            .onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        setStreakData(data); // Store full streak object
                        setCheckInStreak(data.currentStreak || 0); // Keep for backward compatibility
                        setReflectionStreak(data.reflectionStreak || 0);
                    } else {
                        setStreakData(null);
                        setCheckInStreak(0);
                        setReflectionStreak(0);
                    }
                },
                (error) => {
                    console.error('Error loading streak data:', error);
                    window.handleFirebaseError && window.handleFirebaseError(error, 'loadStreakData');
                    setStreakData(null);
                    setCheckInStreak(0);
                    setReflectionStreak(0);
                }
            );

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4b-1.5: Calculate streaks from check-ins and update Firestore
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) return;

        const calculateAndUpdateStreaks = async () => {
            try {
                const db = firebase.firestore();

                // Get ALL check-ins for this user, sorted by date
                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .get();

                if (snapshot.empty) {
                    // No check-ins yet, create empty streak document
                    await db.collection('streaks').doc(user.uid).set({
                        currentStreak: 0,
                        longestStreak: 0,
                        reflectionStreak: 0,
                        allStreaks: [],
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return;
                }

                // Convert check-ins to date strings (YYYY-MM-DD)
                const checkInDates = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.createdAt) {
                        const date = data.createdAt.toDate();
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        if (!checkInDates.includes(dateStr)) {
                            checkInDates.push(dateStr);
                        }
                    }
                });

                // Sort dates (newest first)
                checkInDates.sort((a, b) => b.localeCompare(a));

                // Calculate streaks
                const allStreaks = [];
                let currentStreakLength = 0;
                let longestStreakLength = 0;
                let tempStreak = {
                    length: 0,
                    startDate: null,
                    endDate: null
                };

                // Get today's date string
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                // Get yesterday's date string
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

                // Process dates to find streaks
                for (let i = 0; i < checkInDates.length; i++) {
                    const currentDate = checkInDates[i];
                    const nextDate = checkInDates[i + 1];

                    if (tempStreak.length === 0) {
                        // Start a new streak
                        tempStreak = {
                            length: 1,
                            startDate: currentDate,
                            endDate: currentDate
                        };
                    } else {
                        // Check if this date is consecutive with the previous one
                        const current = new Date(currentDate);
                        const previous = new Date(tempStreak.startDate);
                        const diffTime = previous - current;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            // Consecutive day, extend streak
                            tempStreak.length++;
                            tempStreak.startDate = currentDate;
                        } else {
                            // Gap found, save current streak and start new one
                            allStreaks.push({ ...tempStreak });
                            if (tempStreak.length > longestStreakLength) {
                                longestStreakLength = tempStreak.length;
                            }
                            tempStreak = {
                                length: 1,
                                startDate: currentDate,
                                endDate: currentDate
                            };
                        }
                    }

                    // If this is the last date, save the streak
                    if (i === checkInDates.length - 1) {
                        allStreaks.push({ ...tempStreak });
                        if (tempStreak.length > longestStreakLength) {
                            longestStreakLength = tempStreak.length;
                        }
                    }
                }

                // Determine current streak (must include today or yesterday)
                if (allStreaks.length > 0) {
                    const mostRecentStreak = allStreaks[0];
                    if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
                        currentStreakLength = mostRecentStreak.length;
                    }
                }

                // Calculate reflection streak (check for eveningData)
                let reflectionStreakLength = 0;
                const reflectionDates = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.eveningData && data.createdAt) {
                        const date = data.createdAt.toDate();
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        if (!reflectionDates.includes(dateStr)) {
                            reflectionDates.push(dateStr);
                        }
                    }
                });

                // Sort reflection dates
                reflectionDates.sort((a, b) => b.localeCompare(a));

                // Calculate current reflection streak
                if (reflectionDates.length > 0) {
                    const latestReflection = reflectionDates[0];
                    if (latestReflection === todayStr || latestReflection === yesterdayStr) {
                        reflectionStreakLength = 1;
                        for (let i = 1; i < reflectionDates.length; i++) {
                            const current = new Date(reflectionDates[i]);
                            const previous = new Date(reflectionDates[i - 1]);
                            const diffTime = previous - current;
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays === 1) {
                                reflectionStreakLength++;
                            } else {
                                break;
                            }
                        }
                    }
                }

                // Update Firestore streaks document
                await db.collection('streaks').doc(user.uid).set({
                    currentStreak: currentStreakLength,
                    longestStreak: longestStreakLength,
                    reflectionStreak: reflectionStreakLength,
                    allStreaks: allStreaks,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log('✅ Streaks calculated and updated:', {
                    current: currentStreakLength,
                    longest: longestStreakLength,
                    reflection: reflectionStreakLength,
                    totalStreaks: allStreaks.length
                });

            } catch (error) {
                console.error('Error calculating streaks:', error);
            }
        };

        // Calculate streaks on mount
        calculateAndUpdateStreaks();

        // Set up listener to recalculate when check-ins change
        const db = firebase.firestore();
        const unsubscribe = db.collection('checkIns')
            .where('userId', '==', user.uid)
            .onSnapshot(() => {
                calculateAndUpdateStreaks();
            });

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4a-2: Reflection streak calculation (separate from check-in streak)
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) return;

        const calculateReflectionStreaks = async () => {
            try {
                const db = firebase.firestore();

                // Get ALL check-ins with eveningData for this user
                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .get();

                // Extract dates that have reflections (eveningData)
                const reflectionDates = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.eveningData && data.createdAt) {
                        const date = data.createdAt.toDate();
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        if (!reflectionDates.includes(dateStr)) {
                            reflectionDates.push(dateStr);
                        }
                    }
                });

                if (reflectionDates.length === 0) {
                    setReflectionStreakData({
                        currentStreak: 0,
                        longestStreak: 0,
                        allStreaks: []
                    });
                    setReflectionStreak(0);
                    return;
                }

                // Sort dates (newest first)
                reflectionDates.sort((a, b) => b.localeCompare(a));

                // Calculate streaks
                const allStreaks = [];
                let currentStreakLength = 0;
                let longestStreakLength = 0;
                let tempStreak = {
                    length: 0,
                    startDate: null,
                    endDate: null
                };

                // Get today's and yesterday's date strings
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

                // Process dates to find streaks
                for (let i = 0; i < reflectionDates.length; i++) {
                    const currentDate = reflectionDates[i];

                    if (tempStreak.length === 0) {
                        tempStreak = {
                            length: 1,
                            startDate: currentDate,
                            endDate: currentDate
                        };
                    } else {
                        const current = new Date(currentDate);
                        const previous = new Date(tempStreak.startDate);
                        const diffTime = previous - current;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            tempStreak.length++;
                            tempStreak.startDate = currentDate;
                        } else {
                            allStreaks.push({ ...tempStreak });
                            if (tempStreak.length > longestStreakLength) {
                                longestStreakLength = tempStreak.length;
                            }
                            tempStreak = {
                                length: 1,
                                startDate: currentDate,
                                endDate: currentDate
                            };
                        }
                    }

                    if (i === reflectionDates.length - 1) {
                        allStreaks.push({ ...tempStreak });
                        if (tempStreak.length > longestStreakLength) {
                            longestStreakLength = tempStreak.length;
                        }
                    }
                }

                // Determine current streak (must include today or yesterday)
                if (allStreaks.length > 0) {
                    const mostRecentStreak = allStreaks[0];
                    if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
                        currentStreakLength = mostRecentStreak.length;
                    }
                }

                // Filter streaks to show only 2+ days
                const filteredStreaks = allStreaks
                    .filter(s => s.length >= 2)
                    .sort((a, b) => b.length - a.length);

                setReflectionStreakData({
                    currentStreak: currentStreakLength,
                    longestStreak: longestStreakLength,
                    allStreaks: filteredStreaks
                });
                setReflectionStreak(currentStreakLength);

                console.log('✅ Reflection streaks calculated:', {
                    current: currentStreakLength,
                    longest: longestStreakLength,
                    totalStreaks: filteredStreaks.length
                });

            } catch (error) {
                console.error('Error calculating reflection streaks:', error);
            }
        };

        // Calculate on mount
        calculateReflectionStreaks();

        // Set up listener to recalculate when check-ins change
        const db = firebase.firestore();
        const unsubscribe = db.collection('checkIns')
            .where('userId', '==', user.uid)
            .onSnapshot(() => {
                calculateReflectionStreaks();
            });

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4b-2: Weekly stats calculation (7-day check-in rate and avg mood)
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setWeeklyStats(null);
            return;
        }

        const calculateWeeklyStats = async () => {
            try {
                const db = firebase.firestore();

                // Get last 7 days of check-ins
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(sevenDaysAgo))
                    .get();

                if (snapshot.empty) {
                    setWeeklyStats({ checkRate: 0, avgMood: 0 });
                    return;
                }

                const checkIns = snapshot.docs.map(doc => doc.data());

                // Calculate check rate (percentage of days with check-ins in last 7 days)
                const checkRate = Math.round((checkIns.length / 7) * 100);

                // Calculate average mood from morningData.mood field
                const moodRatings = checkIns
                    .map(c => c.mood || c.morningData?.mood)
                    .filter(v => v != null);
                const avgMood = moodRatings.length > 0
                    ? Math.round((moodRatings.reduce((sum, val) => sum + val, 0) / moodRatings.length) * 10) / 10
                    : 0;

                setWeeklyStats({ checkRate, avgMood });

            } catch (error) {
                console.error('Error calculating weekly stats:', error);
                window.handleFirebaseError && window.handleFirebaseError(error, 'calculateWeeklyStats');
                setWeeklyStats({ checkRate: 0, avgMood: 0 });
            }
        };

        calculateWeeklyStats();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4b-3: Reflection stats calculation (ALL-TIME reflections from checkIns)
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setReflectionStats({
                totalAllTime: 0,
                totalThisMonth: 0,
                avgDailyScore: 0,
                topGratitudeThemes: [],
                gratitudeThemes: []
            });
            setAllReflections([]);
            setGratitudeJournalStats({ allTime: 0, thisWeek: 0, thisMonth: 0 });
            setChallengesHistoryStats({ allTime: 0, thisWeek: 0, thisMonth: 0 });
            return;
        }

        const calculateReflectionStats = async () => {
            try {
                const db = firebase.firestore();
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                firstDayOfMonth.setHours(0, 0, 0, 0);

                // Get ALL reflections from checkIns collection
                const allSnapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .get();

                // Filter for documents with eveningData (reflections) and store all
                const allReflectionsArray = [];
                const thisMonthReflections = [];

                allSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.eveningData) {
                        const reflectionData = {
                            id: doc.id,
                            date: data.createdAt.toDate(),
                            ...data.eveningData
                        };
                        allReflectionsArray.push(reflectionData);

                        // Check if this reflection is from this month
                        if (data.createdAt.toDate() >= firstDayOfMonth) {
                            thisMonthReflections.push(data.eveningData);
                        }
                    }
                });

                const totalAllTime = allReflectionsArray.length;
                const totalThisMonth = thisMonthReflections.length;

                // Calculate average daily score from this month's reflections
                let avgDailyScore = 0;
                if (totalThisMonth > 0) {
                    const totalScore = thisMonthReflections.reduce((sum, r) => sum + (r.overallDay || 0), 0);
                    avgDailyScore = Math.round((totalScore / totalThisMonth) * 10) / 10;
                }

                // Analyze gratitude themes from all reflections
                const themeData = {}; // { themeName: { count: 0, dates: [] } }

                allReflectionsArray.forEach(r => {
                    // Check if reflection has a gratitude theme
                    if (r.gratitudeTheme && r.gratitudeTheme.trim()) {
                        const theme = r.gratitudeTheme;
                        if (!themeData[theme]) {
                            themeData[theme] = {
                                name: theme,
                                count: 0,
                                dates: []
                            };
                        }
                        themeData[theme].count++;
                        themeData[theme].dates.push(r.date);
                    }
                });

                // Get top 3 themes sorted by count
                const topGratitudeThemes = Object.values(themeData)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3)
                    .map(theme => ({
                        name: theme.name,
                        count: theme.count,
                        lastDate: theme.dates[0], // Most recent date (already sorted desc)
                        dates: theme.dates.slice(0, 5) // Keep up to 5 most recent dates
                    }));

                // Calculate gratitude journal stats (reflections with gratitude entries)
                const gratitudeAllTime = allReflectionsArray.filter(r => r.gratitude && r.gratitude.trim()).length;
                const gratitudeThisWeek = allReflectionsArray.filter(r => {
                    if (!r.gratitude || !r.gratitude.trim()) return false;
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return r.date >= weekAgo;
                }).length;
                const gratitudeThisMonth = allReflectionsArray.filter(r => {
                    if (!r.gratitude || !r.gratitude.trim()) return false;
                    return r.date >= firstDayOfMonth;
                }).length;

                // Calculate challenges history stats (reflections with challenges entries)
                const challengesAllTime = allReflectionsArray.filter(r => r.challenges && r.challenges.trim()).length;
                const challengesThisWeek = allReflectionsArray.filter(r => {
                    if (!r.challenges || !r.challenges.trim()) return false;
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return r.date >= weekAgo;
                }).length;
                const challengesThisMonth = allReflectionsArray.filter(r => {
                    if (!r.challenges || !r.challenges.trim()) return false;
                    return r.date >= firstDayOfMonth;
                }).length;

                setReflectionStats({
                    totalAllTime,
                    totalThisMonth,
                    avgDailyScore,
                    topGratitudeThemes,
                    gratitudeThemes: Object.keys(themeData)
                });
                setAllReflections(allReflectionsArray);
                setGratitudeJournalStats({
                    allTime: gratitudeAllTime,
                    thisWeek: gratitudeThisWeek,
                    thisMonth: gratitudeThisMonth
                });
                setChallengesHistoryStats({
                    allTime: challengesAllTime,
                    thisWeek: challengesThisWeek,
                    thisMonth: challengesThisMonth
                });

                console.log('✅ Reflection stats loaded:', {
                    totalAllTime,
                    totalThisMonth,
                    avgDailyScore,
                    topGratitudeThemes,
                    gratitudeJournal: { gratitudeAllTime, gratitudeThisWeek, gratitudeThisMonth },
                    challengesHistory: { challengesAllTime, challengesThisWeek, challengesThisMonth }
                });

            } catch (error) {
                console.error('Error calculating reflection stats:', error);
                window.handleFirebaseError && window.handleFirebaseError(error, 'calculateReflectionStats');
            }
        };

        calculateReflectionStats();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4b-4: Tomorrow's Goals tracking (from evening reflections)
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setTomorrowGoals([]);
            setYesterdayGoal(null);
            return;
        }

        const loadTomorrowGoals = async () => {
            try {
                const db = firebase.firestore();

                // Get all check-ins with eveningData
                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .orderBy('createdAt', 'desc')
                    .get();

                const goals = [];
                let foundYesterdayGoal = null;

                // Get yesterday's date
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const yesterdayEnd = new Date(yesterday);
                yesterdayEnd.setHours(23, 59, 59, 999);

                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.eveningData && data.eveningData.tomorrowGoal) {
                        const date = data.createdAt.toDate();

                        // Check if this is yesterday's goal
                        if (date >= yesterday && date <= yesterdayEnd && !foundYesterdayGoal) {
                            foundYesterdayGoal = {
                                goal: data.eveningData.tomorrowGoal,
                                date: date,
                                docId: doc.id,
                                completed: data.eveningData.goalCompleted || false
                            };
                        }

                        goals.push({
                            id: doc.id,
                            goal: data.eveningData.tomorrowGoal,
                            date: date,
                            completed: data.eveningData.goalCompleted || false,
                            completedDate: data.eveningData.goalCompletedDate || null
                        });
                    }
                });

                setTomorrowGoals(goals);
                setYesterdayGoal(foundYesterdayGoal);

                console.log('✅ Tomorrow goals loaded:', { totalGoals: goals.length, yesterdayGoal: foundYesterdayGoal });

            } catch (error) {
                console.error('Error loading tomorrow goals:', error);
            }
        };

        loadTomorrowGoals();

        // Set up real-time listener
        const db = firebase.firestore();
        const unsubscribe = db.collection('checkIns')
            .where('userId', '==', user.uid)
            .onSnapshot(() => {
                loadTomorrowGoals();
            });

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4c COMPLETE: Pattern detection (30-day historical analysis)
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setPatternDetection({
                moodPattern: { average: 0, trend: 'stable', insights: [] },
                cravingPattern: { average: 0, trend: 'stable', insights: [] },
                anxietyPattern: { average: 0, trend: 'stable', insights: [] },
                sleepPattern: { average: 0, trend: 'stable', insights: [] }
            });
            return;
        }

        const loadPatternDetection = async () => {
            try {
                const db = firebase.firestore();

                // Get last 30 days of check-ins
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', user.uid)
                    .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
                    .orderBy('createdAt', 'desc')
                    .get();

                if (snapshot.empty) {
                    // No check-ins in last 30 days
                    setPatternDetection({
                        moodPattern: { average: 0, trend: 'stable', insights: [] },
                        cravingPattern: { average: 0, trend: 'stable', insights: [] },
                        anxietyPattern: { average: 0, trend: 'stable', insights: [] },
                        sleepPattern: { average: 0, trend: 'stable', insights: [] }
                    });
                    return;
                }

                // Extract all ratings
                const checkIns = snapshot.docs.map(doc => doc.data());
                const moodRatings = checkIns.map(c => c.mood || c.morningData?.mood).filter(v => v != null);
                const cravingRatings = checkIns.map(c => c.craving || c.morningData?.craving).filter(v => v != null);
                const anxietyRatings = checkIns.map(c => c.anxiety || c.morningData?.anxiety).filter(v => v != null);
                const sleepRatings = checkIns.map(c => c.sleep || c.morningData?.sleep).filter(v => v != null);

                // Calculate patterns
                const calculatePattern = (ratings) => {
                    if (ratings.length === 0) {
                        return { average: 0, trend: 'stable', insights: [] };
                    }

                    const average = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;

                    // Calculate trend (compare first half vs second half)
                    const midpoint = Math.floor(ratings.length / 2);
                    const firstHalf = ratings.slice(0, midpoint);
                    const secondHalf = ratings.slice(midpoint);

                    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length : average;
                    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length : average;

                    let trend = 'stable';
                    if (secondAvg > firstAvg + 1) trend = 'improving';
                    if (secondAvg < firstAvg - 1) trend = 'declining';

                    // Generate insights
                    const insights = [];
                    const lowCount = ratings.filter(r => r <= 3).length;
                    const highCount = ratings.filter(r => r >= 8).length;

                    if (lowCount > ratings.length * 0.3) {
                        insights.push(`${Math.round((lowCount / ratings.length) * 100)}% of ratings were low (≤3)`);
                    }
                    if (highCount > ratings.length * 0.3) {
                        insights.push(`${Math.round((highCount / ratings.length) * 100)}% of ratings were high (≥8)`);
                    }
                    if (trend === 'improving') {
                        insights.push('Showing improvement over time');
                    }
                    if (trend === 'declining') {
                        insights.push('Showing decline over time');
                    }

                    return { average: Math.round(average * 10) / 10, trend, insights };
                };

                setPatternDetection({
                    moodPattern: calculatePattern(moodRatings),
                    cravingPattern: calculatePattern(cravingRatings),
                    anxietyPattern: calculatePattern(anxietyRatings),
                    sleepPattern: calculatePattern(sleepRatings)
                });

            } catch (error) {
                console.error('Error loading pattern detection:', error);
                window.handleFirebaseError && window.handleFirebaseError(error, 'loadPatternDetection');
                setPatternDetection({
                    moodPattern: { average: 0, trend: 'stable', insights: [] },
                    cravingPattern: { average: 0, trend: 'stable', insights: [] },
                    anxietyPattern: { average: 0, trend: 'stable', insights: [] },
                    sleepPattern: { average: 0, trend: 'stable', insights: [] }
                });
            }
        };

        loadPatternDetection();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4d: Load goals from Firestore
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setGoals([]);
            return;
        }

        const db = firebase.firestore();

        // Real-time listener for goals
        const unsubscribe = db.collection('goals')
            .where('userId', '==', user.uid)
            .onSnapshot(
                (snapshot) => {
                    const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setGoals(goalsData);
                },
                (error) => {
                    console.error('Error loading goals:', error);
                    window.handleFirebaseError && window.handleFirebaseError(error, 'loadGoals');
                    setGoals([]);
                }
            );

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4e: Load assignments from Firestore
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setAssignments([]);
            return;
        }

        const db = firebase.firestore();

        // Real-time listener for assignments
        const unsubscribe = db.collection('assignments')
            .where('userId', '==', user.uid)
            .onSnapshot(
                (snapshot) => {
                    const assignmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setAssignments(assignmentsData);
                },
                (error) => {
                    console.error('Error loading assignments:', error);
                    window.handleFirebaseError && window.handleFirebaseError(error, 'loadAssignments');
                    setAssignments([]);
                }
            );

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4f: Load objectives from Firestore
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setObjectives([]);
            return;
        }

        const db = firebase.firestore();

        // Real-time listener for objectives
        const unsubscribe = db.collection('objectives')
            .where('userId', '==', user.uid)
            .onSnapshot(
                (snapshot) => {
                    const objectivesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setObjectives(objectivesData);
                },
                (error) => {
                    console.error('Error loading objectives:', error);
                    window.handleFirebaseError && window.handleFirebaseError(error, 'loadObjectives');
                    setObjectives([]);
                }
            );

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4g: Load coach notes from Firestore
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (!user) {
            setCoachNotes([]);
            return;
        }

        const db = firebase.firestore();

        // Real-time listener for coach notes
        const unsubscribe = db.collection('coachNotes')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .onSnapshot(
                (snapshot) => {
                    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCoachNotes(notes);
                },
                (error) => {
                    console.error('Error loading coach notes:', error);
                    window.handleFirebaseError && window.handleFirebaseError(error, 'loadCoachNotes');
                    setCoachNotes([]);
                }
            );

        return () => unsubscribe();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // STEP 4h: Initialize Lucide icons when sidebar or modals open
    // ═══════════════════════════════════════════════════════════

    React.useEffect(() => {
        if (showSidebar || activeModal || activeTaskTab) {
            // Small delay to ensure DOM has updated
            const timer = setTimeout(() => {
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                    console.log('✅ TasksTab: Lucide icons initialized for sidebar/modals/tabs');
                } else {
                    console.warn('⚠️ TasksTab: Lucide library not available');
                }
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [showSidebar, activeModal, activeTaskTab]);

    // ═══════════════════════════════════════════════════════════
    // FIREBASE QUERIES COMPLETE - Now have user, check-in status, streak, patterns, goals, assignments, objectives, coachNotes
    // ═══════════════════════════════════════════════════════════

    /**
     * Handle morning check-in submission
     * @param {Object} checkInData - Morning check-in data (mood, craving, anxiety, sleep)
     */
    const handleMorningCheckIn = async (checkInData) => {
        if (!user) {
            console.error('No user logged in');
            setError('You must be logged in to submit a check-in');
            return;
        }

        try {
            setLoading(true);
            const db = firebase.firestore();

            // Create or update today's check-in
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const checkInRef = db.collection('checkIns').doc();
            await checkInRef.set({
                userId: user.uid,
                morningData: checkInData,
                mood: checkInData.mood,
                craving: checkInData.craving,
                anxiety: checkInData.anxiety,
                sleep: checkInData.sleep,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'morning'
            });

            // Update check-in status
            setCheckInStatus(prev => ({ ...prev, morning: true }));

            // Show success notification
            window.GLRSApp?.utils?.showNotification &&
                window.GLRSApp.utils.showNotification('Morning check-in submitted successfully!', 'success');

            setLoading(false);
        } catch (error) {
            console.error('Error submitting morning check-in:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'handleMorningCheckIn');
            setError('Failed to submit morning check-in. Please try again.');
            setLoading(false);
        }
    };

    /**
     * Handle evening reflection submission
     * @param {Object} reflectionData - Evening reflection data (overallDay, reflection)
     */
    const handleEveningReflection = async (reflectionData) => {
        if (!user) {
            console.error('No user logged in');
            setError('You must be logged in to submit a reflection');
            return;
        }

        try {
            setLoading(true);
            const db = firebase.firestore();

            // Find today's check-in or create new one
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const snapshot = await db.collection('checkIns')
                .where('userId', '==', user.uid)
                .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
                .limit(1)
                .get();

            if (!snapshot.empty) {
                // Update existing check-in
                const docRef = snapshot.docs[0].ref;
                await docRef.update({
                    eveningData: reflectionData,
                    overallDay: reflectionData.overallDay,
                    reflection: reflectionData.reflection,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new check-in
                const checkInRef = db.collection('checkIns').doc();
                await checkInRef.set({
                    userId: user.uid,
                    eveningData: reflectionData,
                    overallDay: reflectionData.overallDay,
                    reflection: reflectionData.reflection,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    type: 'evening'
                });
            }

            // Update check-in status
            setCheckInStatus(prev => ({ ...prev, evening: true }));

            // Show success notification
            window.GLRSApp?.utils?.showNotification &&
                window.GLRSApp.utils.showNotification('Evening reflection submitted successfully!', 'success');

            setLoading(false);
        } catch (error) {
            console.error('Error submitting evening reflection:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'handleEveningReflection');
            setError('Failed to submit evening reflection. Please try again.');
            setLoading(false);
        }
    };

    /**
     * Handle assignment completion
     * @param {string} assignmentId - Assignment ID to mark complete
     */
    const handleAssignmentComplete = async (assignmentId) => {
        if (!user) {
            console.error('No user logged in');
            return;
        }

        try {
            const db = firebase.firestore();
            await db.collection('assignments').doc(assignmentId).update({
                status: 'completed',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Real-time listener will automatically update assignments array
            console.log('Assignment completed - real-time listener will update state');

            window.GLRSApp?.utils?.showNotification &&
                window.GLRSApp.utils.showNotification('Assignment completed!', 'success');
        } catch (error) {
            console.error('Error completing assignment:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'handleAssignmentComplete');
        }
    };

    /**
     * Handle reflection save from assignment
     * @param {string} assignmentId - Assignment ID
     * @param {string} reflection - Reflection text
     */
    const handleReflectionSave = async (assignmentId, reflection) => {
        if (!user) {
            console.error('No user logged in');
            return;
        }

        try {
            const db = firebase.firestore();
            await db.collection('assignments').doc(assignmentId).update({
                reflection: reflection,
                reflectionSavedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            window.GLRSApp?.utils?.showNotification &&
                window.GLRSApp.utils.showNotification('Reflection saved!', 'success');
        } catch (error) {
            console.error('Error saving reflection:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'handleReflectionSave');
        }
    };

    // Show loading state
    if (loading && !user) {
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
                <p style={{ color: '#666', fontSize: '14px' }}>Loading Tasks...</p>
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
            {/* TASKS TAB HEADER */}
            <div style={{
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
            }}>
                {/* Left: Hamburger Menu + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('medium');
                            }
                            setShowSidebar(true);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Quick Tools"
                    >
                        <i data-lucide="menu" style={{ width: '24px', height: '24px' }}></i>
                    </button>

                    <h1 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: 'bold'
                    }}>
                        Tasks
                    </h1>
                </div>

                {/* Right: Profile Icon */}
                <button
                    onClick={() => {
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                        // Dispatch custom event to navigate to profile tab
                        window.dispatchEvent(new CustomEvent('glrs-navigate', {
                            detail: { view: 'profile' }
                        }));
                    }}
                    style={{
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
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    title="Profile"
                >
                    <i data-lucide="user" style={{ width: '20px', height: '20px', color: '#FFFFFF' }}></i>
                </button>
            </div>

            {/* TASKS SUB-NAVIGATION */}
            <div style={{
                background: '#058585',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: '48px',
                position: 'fixed',
                top: '48px',
                left: 0,
                right: 0,
                zIndex: 99,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveTaskTab('checkin');
                    }}
                    style={{
                        flex: 1,
                        height: '100%',
                        background: 'none',
                        border: 'none',
                        color: activeTaskTab === 'checkin' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: activeTaskTab === 'checkin' ? 'bold' : '400',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    Check-In
                    {activeTaskTab === 'checkin' && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '2px',
                            background: '#FFFFFF'
                        }} />
                    )}
                </button>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveTaskTab('reflections');
                    }}
                    style={{
                        flex: 1,
                        height: '100%',
                        background: 'none',
                        border: 'none',
                        color: activeTaskTab === 'reflections' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: activeTaskTab === 'reflections' ? 'bold' : '400',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    Reflections
                    {activeTaskTab === 'reflections' && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '2px',
                            background: '#FFFFFF'
                        }} />
                    )}
                </button>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveTaskTab('golden');
                    }}
                    style={{
                        flex: 1,
                        height: '100%',
                        background: 'none',
                        border: 'none',
                        color: activeTaskTab === 'golden' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: activeTaskTab === 'golden' ? 'bold' : '400',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    The Golden Thread
                    {activeTaskTab === 'golden' && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '2px',
                            background: '#FFFFFF'
                        }} />
                    )}
                </button>
            </div>

            {/* WHITE CONTAINER FOR ALL TAB CONTENT */}
            <div style={{
                background: '#FFFFFF',
                minHeight: '100vh',
                paddingBottom: '80px',
                paddingTop: '96px'
            }}>
                {/* CHECK-IN TAB */}
                {activeTaskTab === 'checkin' && (
                <div style={{
                    padding: '16px 5%',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    {/* Morning Check-In Section */}
                    <h3 style={{
                        fontSize: isMobile ? '15px' : '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: isMobile ? '8px' : '10px'
                    }}>
                        Morning Check-In
                    </h3>

                    {/* Check if morning check-in is already complete */}
                    {(() => {
                        return checkInStatus.morning;
                    })() ? (
                        // COMPLETE STATE - Show completion message
                        <div style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                            borderRadius: '12px',
                            padding: isMobile ? '20px 15px' : '30px 20px',
                            marginBottom: isMobile ? '15px' : '20px',
                            textAlign: 'center',
                            border: '2px solid rgba(5, 133, 133, 0.2)'
                        }}>
                            <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: isMobile ? '10px' : '15px' }}>✅</div>
                            <h3 style={{
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: 'bold',
                                color: '#058585',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                Morning Check-In Complete!
                            </h3>
                            <p style={{
                                fontSize: isMobile ? '13px' : '14px',
                                color: '#666',
                                margin: 0
                            }}>
                                Great job! Your morning check-in has been recorded. Come back tomorrow for your next check-in.
                            </p>
                        </div>
                    ) : (
                        // PENDING STATE - Show form
                        <>
                    {/* Mood Card */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: isMobile ? '10px' : '12px',
                        marginBottom: isMobile ? '6px' : '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: isMobile ? '6px' : '8px'
                        }}>
                            Mood
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: isMobile ? '60px' : '70px',
                            overflow: 'hidden'
                        }}>
                            {/* Highlight Box Behind Selected Number */}
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '60px' : '70px',
                                height: isMobile ? '50px' : '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />

                            {/* Left Vertical Divider */}
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% - 35px)' : 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />

                            {/* Right Vertical Divider */}
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% + 35px)' : 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />

                            {/* Left Gradient Fade */}
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />

                            {/* Right Gradient Fade */}
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />

                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '15px' : '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: isMobile ? '0 calc(50% - 25px)' : '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = (isMobile ? 50 : 60) + (isMobile ? 15 : 20); // width + gap
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.mood && centerIndex >= 0 && centerIndex <= 10) {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, mood: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, mood: rating }));
                                        }}
                                        style={{
                                            minWidth: isMobile ? '50px' : '60px',
                                            height: isMobile ? '50px' : '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.mood === rating ? (isMobile ? '28px' : '32px') : (isMobile ? '18px' : '20px'),
                                            fontWeight: morningCheckInData.mood === rating ? 'bold' : '400',
                                            color: morningCheckInData.mood === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.mood === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Craving Card - Same structure as Mood */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: isMobile ? '10px' : '12px',
                        marginBottom: isMobile ? '6px' : '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: isMobile ? '6px' : '8px'
                        }}>
                            Craving
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: isMobile ? '60px' : '70px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '60px' : '70px',
                                height: isMobile ? '50px' : '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% - 35px)' : 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% + 35px)' : 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '15px' : '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: isMobile ? '0 calc(50% - 25px)' : '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = (isMobile ? 50 : 60) + (isMobile ? 15 : 20);
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.craving && centerIndex >= 0 && centerIndex <= 10) {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, craving: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, craving: rating }));
                                        }}
                                        style={{
                                            minWidth: isMobile ? '50px' : '60px',
                                            height: isMobile ? '50px' : '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.craving === rating ? (isMobile ? '28px' : '32px') : (isMobile ? '18px' : '20px'),
                                            fontWeight: morningCheckInData.craving === rating ? 'bold' : '400',
                                            color: morningCheckInData.craving === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.craving === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Anxiety Card - Same structure */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: isMobile ? '10px' : '12px',
                        marginBottom: isMobile ? '6px' : '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: isMobile ? '6px' : '8px'
                        }}>
                            Anxiety
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: isMobile ? '60px' : '70px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '60px' : '70px',
                                height: isMobile ? '50px' : '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% - 35px)' : 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% + 35px)' : 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '15px' : '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: isMobile ? '0 calc(50% - 25px)' : '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = (isMobile ? 50 : 60) + (isMobile ? 15 : 20);
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.anxiety && centerIndex >= 0 && centerIndex <= 10) {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, anxiety: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, anxiety: rating }));
                                        }}
                                        style={{
                                            minWidth: isMobile ? '50px' : '60px',
                                            height: isMobile ? '50px' : '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.anxiety === rating ? (isMobile ? '28px' : '32px') : (isMobile ? '18px' : '20px'),
                                            fontWeight: morningCheckInData.anxiety === rating ? 'bold' : '400',
                                            color: morningCheckInData.anxiety === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.anxiety === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sleep Card - Same structure */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: isMobile ? '10px' : '12px',
                        marginBottom: isMobile ? '10px' : '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: isMobile ? '6px' : '8px'
                        }}>
                            Sleep
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: isMobile ? '60px' : '70px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: isMobile ? '60px' : '70px',
                                height: isMobile ? '50px' : '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% - 35px)' : 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: isMobile ? '40px' : '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: isMobile ? 'calc(50% + 35px)' : 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '15px' : '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: isMobile ? '0 calc(50% - 25px)' : '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = (isMobile ? 50 : 60) + (isMobile ? 15 : 20);
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.sleep && centerIndex >= 0 && centerIndex <= 10) {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, sleep: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, sleep: rating }));
                                        }}
                                        style={{
                                            minWidth: isMobile ? '50px' : '60px',
                                            height: isMobile ? '50px' : '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.sleep === rating ? (isMobile ? '28px' : '32px') : (isMobile ? '18px' : '20px'),
                                            fontWeight: morningCheckInData.sleep === rating ? 'bold' : '400',
                                            color: morningCheckInData.sleep === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.sleep === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '15px' : '20px' }}>
                        <button
                            onClick={async () => {
                                triggerHaptic('success');

                                try {
                                    await handleMorningCheckIn(morningCheckInData);
                                    await new Promise(resolve => setTimeout(resolve, 200));
                                    // Real-time listeners will update streak, check-ins, and status
                                    alert('Check-in submitted! ✅');
                                    setMorningCheckInData({
                                        mood: null,
                                        craving: null,
                                        anxiety: null,
                                        sleep: null
                                    });
                                } catch (error) {
                                    alert('Failed to submit check-in. Please try again.');
                                }
                            }}
                            disabled={morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null}
                            style={{
                                width: isMobile ? '110px' : '120px',
                                minHeight: isMobile ? '44px' : '40px',
                                background: (morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null) ? '#cccccc' : '#058585',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                cursor: (morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Submit
                        </button>
                    </div>
                    </>
                    )}

                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={async () => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        // TODO: This modal should be passed as prop from PIRapp - setShowModal('streak')
                        console.warn('Streak modal functionality needs PIRapp integration');
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Check-In Streak
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {checkInStreak > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#058585'
                                    }}>
                                        {checkInStreak} {checkInStreak === 1 ? 'day' : 'days'}
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    Start checking in daily!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Header */}
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '10px',
                        marginTop: '20px'
                    }}>
                        Quick Stats
                    </h3>

                    {/* Check Rate Stat Card - Clickable */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveModal('checkRate');
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Check Rate
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {weeklyStats && weeklyStats.checkRate > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        {weeklyStats.checkRate}%
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    No data yet
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Avg Mood Stat Card */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveModal('avgMood');
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Avg Mood
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {weeklyStats && weeklyStats.avgMood > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        {weeklyStats.avgMood}
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    No data yet
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Longest Streak Stat Card */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveModal('streaks');
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Longest Streak
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {streakData && typeof streakData.longestStreak === 'number' ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        🔥 {streakData.longestStreak} {streakData.longestStreak === 1 ? 'day' : 'days'}
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    Calculating...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* View Check-In Trends Button */}
                    <button style={{
                        width: '100%',
                        height: '48px',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid #058585',
                        color: '#058585',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        if (window.navigateToTab) {
                            window.navigateToTab('progress'); // Navigate to Journey tab
                        }
                    }}>
                        <i data-lucide="bar-chart-3" style={{ width: '20px', height: '20px' }}></i>
                        View Check-In Trends
                    </button>

                    {/* Coach Notes Card */}
                    {coachNotes.length > 0 && (
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            alert(coachNotes[0].note || 'Coach note available');
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <i data-lucide="message-square" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                Coach Notes
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                color: '#666666'
                            }}>
                                "{coachNotes[0].note || 'New note from your coach'}"
                            </div>
                        </div>
                    )}

                    {/* Bottom Features Section */}
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '12px',
                        marginTop: '24px'
                    }}>
                        Quick Tools
                    </h3>

                    {/* 1. Emergency SOS Button */}
                    <div style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #DC143C 0%, #B01030 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '8px',
                        boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
                        cursor: 'pointer',
                        border: '2px solid #DC143C'
                    }}
                    onClick={() => {
                        triggerHaptic('medium');
                        alert('Crisis resources:\n\n988 Suicide & Crisis Lifeline\nCall or Text 988\n\nCrisis Text Line\nText HOME to 741741\n\nSAMHSA National Helpline\n1-800-662-4357');
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i data-lucide="alert-octagon" style={{ width: '28px', height: '28px', color: '#FFFFFF' }}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#FFFFFF',
                                    marginBottom: '4px'
                                }}>
                                    Emergency Support
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: 'rgba(255,255,255,0.9)'
                                }}>
                                    24/7 crisis resources and helplines
                                </div>
                            </div>
                            <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)' }}></i>
                        </div>
                    </div>

                    {/* 2. Weekly Progress Summary */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        setActiveModal('stats');
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <i data-lucide="calendar-check" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000'
                                }}>
                                    Weekly Progress Report
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    View detailed analytics and insights
                                </div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                    </div>

                    {/* 3. Share Progress */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                    onClick={async () => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        const shareText = checkInStreak > 0
                            ? `${checkInStreak} ${checkInStreak === 1 ? 'day' : 'days'} check-in streak! 🔥\n\nProud of my progress in recovery.${weeklyStats && weeklyStats.checkRate ? `\n\n📊 ${weeklyStats.checkRate}% check-in rate this week` : ''}${weeklyStats && weeklyStats.avgMood > 0 ? `\n😊 Average mood: ${weeklyStats.avgMood}/10` : ''}\n\n#RecoveryJourney #Progress #GLRecovery`
                            : 'Starting my recovery journey! 💪\n\nFollowing my daily check-ins and reflections.\n\n#RecoveryJourney #GLRecovery';

                        // Try native share API (works on Chrome, Safari, Edge, mobile browsers)
                        if (navigator.share) {
                            console.log('✅ Native share API available - opening share sheet...');
                            try {
                                await navigator.share({
                                    title: 'My Recovery Progress',
                                    text: shareText
                                });
                                console.log('✅ Share completed successfully');
                                return;
                            } catch (error) {
                                if (error.name === 'AbortError') {
                                    console.log('ℹ️ User cancelled share');
                                    return;
                                }
                                console.error('❌ Share API error:', error.name, error.message);
                                // Fall through to clipboard fallback
                            }
                        } else {
                            console.log('ℹ️ Share API not supported in this browser/context');
                        }

                        // Fallback: copy to clipboard
                        console.log('Using clipboard fallback...');
                        try {
                            await navigator.clipboard.writeText(shareText);
                            alert('✅ Progress message copied to clipboard!\n\nYou can now paste it anywhere to share.');
                        } catch (clipboardError) {
                            console.error('❌ Clipboard error:', clipboardError);
                            // Last resort: show text in prompt
                            prompt('Copy this text to share:', shareText);
                        }
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <i data-lucide="share-2" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000'
                                }}>
                                    Share Your Progress
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    Celebrate milestones with supporters
                                </div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                    </div>

                    {/* 4. Daily Coping Technique */}
                    {(() => {
                        const dayOfMonth = new Date().getDate();
                        const technique = copingTechniques.find(t => t.day === dayOfMonth) || copingTechniques[0];

                        return (
                            <div style={{
                                width: '100%',
                                background: '#FFFFFF',
                                borderRadius: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onClick={() => {
                                window.GLRSApp.utils.triggerHaptic('light');
                                setShowCopingTechniqueModal(true);
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <i data-lucide={technique.icon} style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            color: '#000000'
                                        }}>
                                            {technique.title}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '400',
                                            color: '#666666'
                                        }}>
                                            Today's coping technique • {technique.category}
                                        </div>
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                            </div>
                        );
                    })()}

                    {/* 5. Recovery Milestones */}
                    {nextMilestone && (
                        <div style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                            boxShadow: '0 4px 12px rgba(5, 133, 133, 0.3)',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setShowMilestoneModal(true);
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i data-lucide={nextMilestone.icon} style={{ width: '28px', height: '28px', color: '#FFFFFF' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#FFFFFF',
                                        marginBottom: '4px'
                                    }}>
                                        {nextMilestone.achieved ?
                                            'All Milestones Complete!' :
                                            `Next: ${nextMilestone.label}`
                                        }
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '400',
                                        color: 'rgba(255,255,255,0.9)'
                                    }}>
                                        {nextMilestone.achieved ?
                                            `${sobrietyDays} days sober - Amazing!` :
                                            `${nextMilestone.daysUntil} ${nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go • ${nextMilestone.progressPercentage}% there`
                                        }
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)' }}></i>
                            </div>
                        </div>
                    )}
                </div>
            )}
{/* REFLECTIONS TAB */}
                {activeTaskTab === 'reflections' && (
                    <div style={{
                        padding: '16px 5%',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {/* Evening Reflections Section */}
                        <h3 style={{
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: isMobile ? '8px' : '10px'
                        }}>
                            Evening Reflections
                        </h3>

                        {/* Check if evening reflection is already complete */}
                        {checkInStatus.evening ? (
                            // COMPLETE STATE - Show completion message
                            <div style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                borderRadius: '12px',
                                padding: isMobile ? '20px 15px' : '30px 20px',
                                marginBottom: isMobile ? '15px' : '20px',
                                textAlign: 'center',
                                border: '2px solid rgba(5, 133, 133, 0.2)'
                            }}>
                                <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: isMobile ? '10px' : '15px' }}>✅</div>
                                <h3 style={{
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 'bold',
                                    color: '#058585',
                                    marginBottom: isMobile ? '6px' : '8px'
                                }}>
                                    Evening Reflection Complete!
                                </h3>
                                <p style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: '#666',
                                    margin: 0
                                }}>
                                    Great job! Your evening reflection has been recorded. Come back tomorrow for your next reflection.
                                </p>
                            </div>
                        ) : (
                            // PENDING STATE - Show form
                            <>
                        {/* Daily Reflection Prompt */}
                        <div style={{
                            width: '100%',
                            background: '#E3F2FD',
                            borderRadius: '12px',
                            padding: isMobile ? '12px' : '16px',
                            marginBottom: isMobile ? '10px' : '12px',
                            border: '1px solid #90CAF9'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: 'bold',
                                color: '#000000',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                Today's Reflection Prompt
                            </div>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#666666',
                                fontStyle: 'italic'
                            }}>
                                "What challenged you today, and what did you learn from it?"
                            </div>
                        </div>

                        {/* Prompt Response Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '6px' : '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                Your Response
                            </div>
                            <textarea
                                value={eveningReflectionData.promptResponse}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, promptResponse: e.target.value }))}
                                placeholder="Reflect on today's prompt..."
                                style={{
                                    width: '100%',
                                    minHeight: isMobile ? '70px' : '80px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: isMobile ? '8px' : '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Overall Day Card - Scrolling Picker */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '6px' : '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                Overall Day
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                height: isMobile ? '60px' : '70px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    width: isMobile ? '60px' : '70px',
                                    height: isMobile ? '50px' : '60px',
                                    background: 'rgba(5, 133, 133, 0.12)',
                                    borderRadius: '12px',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '1px',
                                    height: isMobile ? '40px' : '50px',
                                    background: 'rgba(5, 133, 133, 0.3)',
                                    left: isMobile ? 'calc(50% - 35px)' : 'calc(50% - 40px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '1px',
                                    height: isMobile ? '40px' : '50px',
                                    background: 'rgba(5, 133, 133, 0.3)',
                                    left: isMobile ? 'calc(50% + 35px)' : 'calc(50% + 40px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '60px',
                                    height: '100%',
                                    background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                    left: 0,
                                    top: 0,
                                    pointerEvents: 'none',
                                    zIndex: 3
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '60px',
                                    height: '100%',
                                    background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                    right: 0,
                                    top: 0,
                                    pointerEvents: 'none',
                                    zIndex: 3
                                }} />
                                <div
                                    className="swipeable-picker-container"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: isMobile ? '15px' : '20px',
                                        overflowX: 'auto',
                                        overflowY: 'hidden',
                                        scrollSnapType: 'x mandatory',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        padding: isMobile ? '0 calc(50% - 25px)' : '0 calc(50% - 30px)',
                                        width: '100%',
                                        touchAction: 'pan-x'
                                    }}
                                    onScroll={(e) => {
                                        const container = e.target;
                                        const scrollLeft = container.scrollLeft;
                                        const itemWidth = (isMobile ? 50 : 60) + (isMobile ? 15 : 20);
                                        const centerIndex = Math.round(scrollLeft / itemWidth);
                                        setEveningReflectionData(prev => ({ ...prev, overallDay: centerIndex }));
                                    }}
                                >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <div
                                            key={num}
                                            style={{
                                                minWidth: isMobile ? '50px' : '60px',
                                                height: isMobile ? '50px' : '60px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: eveningReflectionData.overallDay === num ? (isMobile ? '28px' : '36px') : (isMobile ? '18px' : '24px'),
                                                fontWeight: eveningReflectionData.overallDay === num ? 'bold' : '400',
                                                color: eveningReflectionData.overallDay === num ? '#058585' : '#CCCCCC',
                                                transition: 'all 0.2s',
                                                scrollSnapAlign: 'center',
                                                cursor: 'pointer',
                                                userSelect: 'none'
                                            }}
                                            onClick={(e) => {
                                                window.GLRSApp.utils.triggerHaptic('light');
                                                setEveningReflectionData(prev => ({ ...prev, overallDay: num }));
                                                const container = e.target.closest('.swipeable-picker-container');
                                                if (container) {
                                                    const itemWidth = (isMobile ? 50 : 60) + (isMobile ? 15 : 20);
                                                    container.scrollLeft = num * itemWidth;
                                                }
                                            }}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Challenges Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '6px' : '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                Today's Challenges
                            </div>
                            <textarea
                                value={eveningReflectionData.challenges}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, challenges: e.target.value }))}
                                placeholder="What challenges did you face today?"
                                style={{
                                    width: '100%',
                                    minHeight: isMobile ? '55px' : '60px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: isMobile ? '8px' : '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Gratitude Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '6px' : '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                What I'm Grateful For
                            </div>
                            <textarea
                                value={eveningReflectionData.gratitude}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, gratitude: e.target.value }))}
                                placeholder="What are you grateful for today?"
                                style={{
                                    width: '100%',
                                    minHeight: isMobile ? '55px' : '60px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: isMobile ? '8px' : '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Tomorrow's Goal Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '12px' : '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: isMobile ? '6px' : '8px'
                            }}>
                                Tomorrow's Goal
                            </div>
                            <textarea
                                value={eveningReflectionData.tomorrowGoal}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, tomorrowGoal: e.target.value }))}
                                placeholder="What's your goal for tomorrow?"
                                style={{
                                    width: '100%',
                                    minHeight: isMobile ? '55px' : '60px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: isMobile ? '8px' : '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Yesterday's Goal - Mark as Complete */}
                        {yesterdayGoal && (
                            <div style={{
                                width: '100%',
                                background: yesterdayGoal.completed ? '#E8F5E9' : '#FFF9E6',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px',
                                border: `2px solid ${yesterdayGoal.completed ? '#4CAF50' : '#FFA500'}`
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <i data-lucide="target" style={{ width: '18px', height: '18px', color: yesterdayGoal.completed ? '#4CAF50' : '#FFA500' }}></i>
                                    Yesterday's Goal
                                </div>

                                <div style={{
                                    fontSize: '14px',
                                    color: '#000',
                                    padding: '12px',
                                    background: '#FFFFFF',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    fontStyle: 'italic'
                                }}>
                                    "{yesterdayGoal.goal}"
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '8px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={yesterdayGoal.completed}
                                        onChange={async (e) => {
                                            const completed = e.target.checked;
                                            try {
                                                const db = firebase.firestore();
                                                await db.collection('checkIns').doc(yesterdayGoal.docId).update({
                                                    'eveningData.goalCompleted': completed,
                                                    'eveningData.goalCompletedDate': completed ? firebase.firestore.FieldValue.serverTimestamp() : null
                                                });
                                                window.GLRSApp?.utils?.showNotification &&
                                                    window.GLRSApp.utils.showNotification(
                                                        completed ? '✅ Goal marked complete!' : 'Goal unmarked',
                                                        'success'
                                                    );
                                            } catch (error) {
                                                console.error('Error updating goal status:', error);
                                            }
                                        }}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <label style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: yesterdayGoal.completed ? '#4CAF50' : '#666',
                                        cursor: 'pointer'
                                    }}>
                                        {yesterdayGoal.completed ? '✅ Completed!' : 'Mark as completed'}
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                            <button
                                onClick={async () => {
                                    triggerHaptic('success');
                                    await handleEveningReflection(eveningReflectionData);
                                }}
                                disabled={eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal}
                                style={{
                                    width: isMobile ? '110px' : '120px',
                                    minHeight: isMobile ? '44px' : '40px',
                                    background: (eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal) ? '#cccccc' : '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '400',
                                    cursor: (eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Submit
                            </button>
                        </div>
                            </>
                        )}

                        {/* Reflection Streak Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '10px' : '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            minHeight: isMobile ? '44px' : 'auto'
                        }}
                        onClick={async () => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('reflectionStreaks');
                        }}>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Reflection Streak
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
                                {reflectionStreak > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: 'bold',
                                            color: '#058585'
                                        }}>
                                            {reflectionStreak} {reflectionStreak === 1 ? 'day' : 'days'}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        Start reflecting daily!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Header */}
                        <h3 style={{
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: isMobile ? '8px' : '10px',
                            marginTop: isMobile ? '16px' : '20px'
                        }}>
                            Reflection Stats
                        </h3>

                        {/* Total Reflections (All-Time) Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '6px' : '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minHeight: isMobile ? '44px' : 'auto'
                        }}
                        onClick={async () => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('allReflections');
                        }}>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Total Reflections
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
                                {reflectionStats.totalAllTime > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: 'bold',
                                            color: '#000000'
                                        }}>
                                            {reflectionStats.totalAllTime}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        0
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Avg Daily Score Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '6px' : '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minHeight: isMobile ? '44px' : 'auto'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            // Navigate to Journey tab, Wellness section
                            if (window.navigateToTab) {
                                window.navigateToTab('journey');
                                // Set Journey sub-tab to Wellness after a brief delay to ensure Journey tab is mounted
                                setTimeout(() => {
                                    if (window.navigateToJourneySubTab) {
                                        window.navigateToJourneySubTab('wellness');
                                    }
                                }, 100);
                            }
                        }}>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Avg Daily Score
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
                                {reflectionStats.avgDailyScore > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: 'bold',
                                            color: '#000000'
                                        }}>
                                            {reflectionStats.avgDailyScore}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        No data
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Top Gratitude Themes Section */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '12px' : '16px',
                            marginBottom: isMobile ? '12px' : '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minHeight: isMobile ? '44px' : 'auto'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('gratitudeThemes');
                        }}>
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '600',
                                color: '#000000',
                                marginBottom: isMobile ? '10px' : '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>Top Gratitude Themes</span>
                                <i data-lucide="chevron-right" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#666666' }}></i>
                            </div>

                            {reflectionStats.topGratitudeThemes && reflectionStats.topGratitudeThemes.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {reflectionStats.topGratitudeThemes.map((theme, index) => {
                                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                                        const bgColor = index === 0 ? '#FFF9E6' : index === 1 ? '#F5F5F5' : '#F8F9FA';
                                        const borderColor = index === 0 ? '#FFA500' : '#E5E5E5';

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '12px',
                                                    background: bgColor,
                                                    borderRadius: '8px',
                                                    border: `1px solid ${borderColor}`,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '20px' }}>{medal}</span>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                                                            {theme.name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                            Last: {theme.lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '4px 10px',
                                                    background: '#058585',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: '#FFFFFF'
                                                }}>
                                                    {theme.count}×
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: '#999',
                                    fontSize: '14px',
                                    fontStyle: 'italic'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💭</div>
                                    Start adding gratitudes to see your themes!
                                </div>
                            )}
                        </div>

                        {/* Longest Streak Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '12px' : '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minHeight: isMobile ? '44px' : 'auto'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('reflectionStreaks');
                        }}>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Longest Streak
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
                                {reflectionStreakData.longestStreak > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: 'bold',
                                            color: '#000000'
                                        }}>
                                            🔥 {reflectionStreakData.longestStreak} {reflectionStreakData.longestStreak === 1 ? 'day' : 'days'}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        No data yet
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* View Past Reflections Button */}
                        <button style={{
                            width: '100%',
                            minHeight: isMobile ? '44px' : '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '10px' : '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setShowPastReflectionsModal(true);
                        }}>
                            View Past Reflections
                        </button>

                        {/* Quick Tools Section */}
                        <h3 style={{
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: 'bold',
                            color: '#000000',
                            marginTop: isMobile ? '20px' : '24px',
                            marginBottom: isMobile ? '10px' : '12px'
                        }}>
                            Quick Tools
                        </h3>

                        {/* Gratitude Entry Button */}
                        <button style={{
                            width: '100%',
                            minHeight: isMobile ? '44px' : '48px',
                            background: '#058585',
                            borderRadius: '12px',
                            padding: isMobile ? '10px' : '12px',
                            marginBottom: isMobile ? '10px' : '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setShowGratitudeModal(true);
                        }}>
                            <i data-lucide="heart" style={{ width: '16px', height: '16px' }}></i>
                            Gratitude Entry
                        </button>

                        {/* Gratitude Journal Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('gratitudeJournal');
                        }}>
                            <i data-lucide="book-heart" style={{ width: '16px', height: '16px' }}></i>
                            Gratitude Journal
                        </button>

                        {/* Challenges History Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('challengesHistory');
                        }}>
                            <i data-lucide="alert-triangle" style={{ width: '16px', height: '16px' }}></i>
                            Challenges History
                        </button>

                        {/* Goal Achievement Tracker Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            setActiveModal('goalProgress');
                        }}>
                            <i data-lucide="trophy" style={{ width: '16px', height: '16px' }}></i>
                            Goal Tracker
                        </button>

                        {/* Share Reflections Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            try {
                                window.GLRSApp.utils.triggerHaptic('light');
                                const shareText = reflectionStreak > 0
                                    ? `${reflectionStreak} ${reflectionStreak === 1 ? 'day' : 'days'} reflection streak! Building self-awareness in recovery.${reflectionStats.totalThisMonth > 0 ? ` ${reflectionStats.totalThisMonth} reflections this month.` : ''}`
                                    : 'Starting my reflection practice! Taking time for gratitude and self-reflection each day.';

                                if (navigator.share) {
                                    await navigator.share({
                                        title: 'My Reflection Progress',
                                        text: shareText,
                                    });
                                } else {
                                    alert(`Share your reflections:\n\n${shareText}`);
                                }
                            } catch (error) {
                                if (error.name !== 'AbortError') {
                                    console.error('Share error:', error);
                                    alert('Unable to share. Please try again.');
                                }
                            }
                        }}>
                            <i data-lucide="share-2" style={{ width: '16px', height: '16px' }}></i>
                            Share Reflections
                        </button>
                    </div>
                )}

                {/* THE GOLDEN THREAD TAB */}
                {activeTaskTab === 'golden' && (
                    <div style={{ padding: '16px 5%' }}>
                        {React.createElement(window.GLRSApp.components.GoalsTasksView, {
                            user: user,
                            goals: goals,
                            assignments: assignments,
                            objectives: objectives,
                            onAssignmentComplete: handleAssignmentComplete,
                            onReflectionSave: handleReflectionSave,
                            onShowGratitudeModal: () => setShowGratitudeModal(true),
                            // TODO: dueToday is global state - needs PIRapp integration or local state
                            onDueTodayChange: (value) => console.warn('dueToday functionality needs state integration')
                        })}
                    </div>
                )}
            </div>

            {/* SIDEBAR AND MODALS NOW RENDERED INLINE BELOW */}

            {/* TASKS SIDEBAR - Slides from LEFT */}
            {showSidebar && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowSidebar(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9998
                        }}
                    />

                    {/* Sidebar Panel */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '280px',
                        background: '#FFFFFF',
                        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 9999,
                        padding: '20px',
                        overflowY: 'auto',
                        animation: 'slideInLeft 0.3s ease-out'
                    }}>
                        {/* Close Button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '25px',
                            paddingBottom: '15px',
                            borderBottom: '2px solid #f0f0f0'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#058585'
                            }}>
                                Quick Tools
                            </h2>
                            <div
                                onClick={() => setShowSidebar(false)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Habit Tracker */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('habit');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="repeat" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Habit Tracker
                                </span>
                            </div>

                            {/* Quick Reflection */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('reflection');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="message-circle" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Quick Reflection
                                </span>
                            </div>

                            {/* This Week's Tasks */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('thisWeek');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="calendar-days" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    This Week's Tasks
                                </span>
                            </div>

                            {/* Overdue Items */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('overdue');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#DC143C' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Overdue Items
                                </span>
                            </div>

                            {/* Mark Complete */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('complete');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#00A86B' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Mark Complete
                                </span>
                            </div>

                            {/* Progress Stats */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('stats');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="trending-up" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Progress Stats
                                </span>
                            </div>

                            {/* Goal Progress */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('goalProgress');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="target" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Goal Progress
                                </span>
                            </div>

                            {/* Today's Wins */}
                            <div
                                onClick={() => {
                                    if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
                                    setShowSidebar(false);
                                    setActiveModal('wins');
                                }}
                                style={{
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <i data-lucide="star" style={{ width: '20px', height: '20px', color: '#FFA500' }}></i>
                                <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                    Today's Wins
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ============================================ */}
            {/* INLINE MODALS - Admin Pattern              */}
            {/* ============================================ */}

            {/* HABIT TRACKER MODAL */}
            {activeModal === 'habit' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#058585',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="repeat" style={{ width: '24px', height: '24px' }}></i>
                                Habit Tracker
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Add New Habit */}
                            <div style={{
                                marginBottom: '20px',
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '12px'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333333',
                                    marginBottom: '8px'
                                }}>
                                    Add New Habit
                                </label>
                                <input
                                    type="text"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                    placeholder="e.g., Drink 8 glasses of water"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '15px',
                                        marginBottom: '10px'
                                    }}
                                    onKeyPress={async (e) => {
                                        if (e.key === 'Enter' && newHabitName.trim()) {
                                            try {
                                                // TODO: Save habit to Firestore
                                                console.log('TODO: Save habit to Firestore:', { name: newHabitName.trim() });
                                                setNewHabitName('');
                                            } catch (error) {
                                                alert('Error adding habit');
                                            }
                                        }
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={async () => {
                                            if (newHabitName.trim()) {
                                                try {
                                                    // TODO: Save habit to Firestore
                                                    console.log('TODO: Save habit to Firestore:', { name: newHabitName.trim() });
                                                    setNewHabitName('');
                                                    alert('Habit added! 🎯');
                                                } catch (error) {
                                                    alert('Error adding habit');
                                                }
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            background: '#058585',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (newHabitName.trim()) {
                                                try {
                                                    // TODO: Save and share habit to community
                                                    console.log('TODO: Save and share habit:', { name: newHabitName.trim() });
                                                    setNewHabitName('');
                                                    alert('Habit added and commitment shared to community! 🎯');
                                                } catch (error) {
                                                    alert('Error adding habit');
                                                }
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                        Add & Share
                                    </button>
                                </div>
                            </div>

                            {/* Today's Habits */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                        Today's Habits
                                    </h3>
                                    <button
                                        onClick={() => setActiveModal('habitHistory')}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#f8f9fa',
                                            color: '#058585',
                                            border: '1px solid #058585',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View History
                                    </button>
                                </div>

                                {/* TODO: Load habits from Firestore - using empty array for now */}
                                {[].length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '30px 20px',
                                        color: '#999999',
                                        fontSize: '14px'
                                    }}>
                                        No habits yet. Add your first habit above!
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Habits will be mapped here once loaded from Firestore */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK REFLECTION MODAL */}
            {activeModal === 'reflection' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#058585',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="message-circle" style={{ width: '24px', height: '24px' }}></i>
                                Quick Reflection
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Add New Reflection */}
                            <div style={{
                                marginBottom: '20px'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333333',
                                    marginBottom: '8px'
                                }}>
                                    What's on your mind?
                                </label>
                                <textarea
                                    value={newReflection}
                                    onChange={(e) => setNewReflection(e.target.value)}
                                    placeholder="Share a quick thought, feeling, or reflection..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '15px',
                                        minHeight: '120px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    marginTop: '10px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px'
                                    }}>
                                        <button
                                            onClick={async () => {
                                                if (newReflection.trim()) {
                                                    try {
                                                        // TODO: Save reflection to Firestore
                                                        console.log('TODO: Save reflection to Firestore:', newReflection.trim());
                                                        setNewReflection('');
                                                        alert('Reflection saved!');
                                                    } catch (error) {
                                                        alert('Error saving reflection');
                                                    }
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px 24px',
                                                background: '#058585',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (newReflection.trim()) {
                                                    try {
                                                        // TODO: Save and share reflection to community
                                                        console.log('TODO: Save and share reflection:', { reflection: newReflection.trim() });
                                                        setNewReflection('');
                                                        alert('Reflection saved and shared to community! 🎉');
                                                    } catch (error) {
                                                        alert('Error saving reflection');
                                                    }
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px 24px',
                                                background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <i data-lucide="share-2" style={{ width: '16px', height: '16px' }}></i>
                                            Save & Share
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setActiveModal('reflectionHistory')}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#f8f9fa',
                                            color: '#058585',
                                            border: '1px solid #058585',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Past Reflections
                                    </button>
                                </div>
                            </div>

                            {/* Recent Reflections */}
                            <div>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333333'
                                }}>
                                    Recent Reflections
                                </h3>
                                {/* TODO: Load reflections from Firestore - using empty array for now */}
                                {[].length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '30px 20px',
                                        color: '#999999',
                                        fontSize: '14px'
                                    }}>
                                        No reflections yet. Share your first thought above!
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* Reflections will be mapped here once loaded from Firestore */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* THIS WEEK'S TASKS MODAL */}
            {activeModal === 'thisWeek' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#058585',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="calendar-days" style={{ width: '24px', height: '24px' }}></i>
                                This Week's Tasks
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {(() => {
                                const today = new Date();
                                const startOfWeek = new Date(today);
                                startOfWeek.setDate(today.getDate() - today.getDay());
                                startOfWeek.setHours(0, 0, 0, 0);

                                const endOfWeek = new Date(startOfWeek);
                                endOfWeek.setDate(startOfWeek.getDate() + 7);

                                const thisWeekAssignments = assignments.filter(assignment => {
                                    if (!assignment.dueDate) return false;
                                    const dueDate = assignment.dueDate.toDate();
                                    return dueDate >= startOfWeek && dueDate < endOfWeek;
                                });

                                if (thisWeekAssignments.length === 0) {
                                    return (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#666666'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                                No Tasks This Week
                                            </div>
                                            <div style={{ fontSize: '14px' }}>
                                                You don't have any tasks due this week
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        <div style={{ fontSize: '14px', color: '#666666', marginBottom: '15px' }}>
                                            {thisWeekAssignments.length} task{thisWeekAssignments.length !== 1 ? 's' : ''} due this week
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {thisWeekAssignments.map(assignment => {
                                                const dueDate = assignment.dueDate.toDate();
                                                const isOverdue = dueDate < today;
                                                const isToday = dueDate.toDateString() === today.toDateString();

                                                return (
                                                    <div
                                                        key={assignment.id}
                                                        style={{
                                                            padding: '12px 15px',
                                                            background: assignment.status === 'completed'
                                                                ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                                : isOverdue
                                                                ? 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)'
                                                                : isToday
                                                                ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)'
                                                                : '#f8f9fa',
                                                            borderRadius: '10px',
                                                            border: assignment.status === 'completed'
                                                                ? '2px solid rgba(0, 168, 107, 0.3)'
                                                                : isOverdue
                                                                ? '2px solid rgba(220, 20, 60, 0.3)'
                                                                : isToday
                                                                ? '2px solid rgba(255, 165, 0, 0.3)'
                                                                : '1px solid #e9ecef'
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'start',
                                                            gap: '10px'
                                                        }}>
                                                            {assignment.status === 'completed' ? (
                                                                <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#00A86B', marginTop: '2px' }}></i>
                                                            ) : isOverdue ? (
                                                                <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#DC143C', marginTop: '2px' }}></i>
                                                            ) : (
                                                                <i data-lucide="circle" style={{ width: '20px', height: '20px', color: '#058585', marginTop: '2px' }}></i>
                                                            )}
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{
                                                                    fontSize: '15px',
                                                                    fontWeight: '600',
                                                                    color: '#333333',
                                                                    marginBottom: '4px',
                                                                    textDecoration: assignment.status === 'completed' ? 'line-through' : 'none'
                                                                }}>
                                                                    {assignment.title}
                                                                </div>
                                                                <div style={{ fontSize: '13px', color: '#666666' }}>
                                                                    Due: {dueDate.toLocaleDateString()}
                                                                    {isToday && ' (Today)'}
                                                                    {isOverdue && assignment.status !== 'completed' && ' (Overdue)'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* OVERDUE ITEMS MODAL */}
            {activeModal === 'overdue' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#DC143C',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="alert-circle" style={{ width: '24px', height: '24px' }}></i>
                                Overdue Items
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const overdueAssignments = assignments.filter(assignment => {
                                    if (!assignment.dueDate || assignment.status === 'completed') return false;
                                    const dueDate = assignment.dueDate.toDate();
                                    return dueDate < today;
                                });

                                if (overdueAssignments.length === 0) {
                                    return (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#666666'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                                No Overdue Items!
                                            </div>
                                            <div style={{ fontSize: '14px' }}>
                                                You're all caught up. Great work!
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#DC143C',
                                            marginBottom: '15px',
                                            fontWeight: '600'
                                        }}>
                                            {overdueAssignments.length} overdue item{overdueAssignments.length !== 1 ? 's' : ''}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {overdueAssignments.map(assignment => {
                                                const dueDate = assignment.dueDate.toDate();
                                                const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

                                                return (
                                                    <div
                                                        key={assignment.id}
                                                        style={{
                                                            padding: '12px 15px',
                                                            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)',
                                                            borderRadius: '10px',
                                                            border: '2px solid rgba(220, 20, 60, 0.3)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'start',
                                                            gap: '10px'
                                                        }}>
                                                            <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#DC143C', marginTop: '2px' }}></i>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{
                                                                    fontSize: '15px',
                                                                    fontWeight: '600',
                                                                    color: '#333333',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    {assignment.title}
                                                                </div>
                                                                <div style={{ fontSize: '13px', color: '#DC143C', fontWeight: '600' }}>
                                                                    {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue (Due: {dueDate.toLocaleDateString()})
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* MARK COMPLETE MODAL */}
            {activeModal === 'complete' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#00A86B',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="check-circle" style={{ width: '24px', height: '24px' }}></i>
                                Mark Complete
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {(() => {
                                const incompleteAssignments = assignments.filter(a => a.status !== 'completed');

                                if (incompleteAssignments.length === 0) {
                                    return (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#666666'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                                All Done!
                                            </div>
                                            <div style={{ fontSize: '14px' }}>
                                                You have no incomplete tasks
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        <div style={{ fontSize: '14px', color: '#666666', marginBottom: '15px' }}>
                                            {incompleteAssignments.length} incomplete task{incompleteAssignments.length !== 1 ? 's' : ''}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {incompleteAssignments.map(assignment => (
                                                <div
                                                    key={assignment.id}
                                                    style={{
                                                        padding: '12px 15px',
                                                        background: '#f8f9fa',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e9ecef',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={false}
                                                        onChange={async () => {
                                                            if (confirm(`Mark "${assignment.title}" as complete?`)) {
                                                                try {
                                                                    await handleAssignmentComplete(assignment.id, true);
                                                                } catch (error) {
                                                                    alert('Error marking task complete');
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            color: '#333333',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {assignment.title}
                                                        </div>
                                                        {assignment.dueDate && (
                                                            <div style={{ fontSize: '13px', color: '#666666' }}>
                                                                Due: {assignment.dueDate.toDate().toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* WEEKLY PROGRESS REPORT MODAL */}
            {activeModal === 'stats' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }}
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '15px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '85vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            borderRadius: '15px 15px 0 0',
                            zIndex: 1
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#000',
                                textAlign: 'center'
                            }}>
                                📊 Weekly Progress Report
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {(() => {
                                const totalAssignments = assignments.length;
                                const completedAssignments = assignments.filter(a => a.status === 'completed').length;
                                const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

                                const totalGoals = goals.length;
                                const activeGoals = goals.filter(g => g.status === 'active').length;

                                // Include check-in stats
                                const checkRate = weeklyStats?.checkRate || 0;
                                const avgMood = weeklyStats?.avgMood || 0;
                                const currentStreak = checkInStreak || 0;

                                // TODO: Load habits from Firestore
                                const habits = [];
                                const todayHabits = [];

                                // Generate shareable text
                                const generateReportText = () => {
                                    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                    return `📊 My Weekly Recovery Progress - ${date}

🎯 Overall Performance
✓ ${completionRate}% completion rate (${completedAssignments}/${totalAssignments} tasks)
✓ ${checkRate}% check-in rate
✓ ${currentStreak} day check-in streak

😊 Wellness
• Average mood: ${avgMood}/10
${avgMood >= 7 ? '• Feeling great!' : avgMood >= 4 ? '• Staying steady' : '• Working through challenges'}

📋 Tasks & Goals
• ${totalAssignments} total tasks (${completedAssignments} completed)
• ${totalGoals} goals (${activeGoals} active)

Keep up the great work in recovery! 💪

#RecoveryJourney #Progress #GLRecovery`;
                                };

                                return (
                                    <>
                                        {/* Completion Rate Hero */}
                                        <div style={{
                                            padding: '20px',
                                            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            marginBottom: '20px'
                                        }}>
                                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                                Overall Completion Rate
                                            </div>
                                            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#058585', marginBottom: '8px' }}>
                                                {completionRate}%
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                {completedAssignments} of {totalAssignments} tasks completed
                                            </div>
                                        </div>

                                        {/* Check-In Stats */}
                                        {(checkRate > 0 || currentStreak > 0) && (
                                            <div style={{
                                                padding: '16px',
                                                background: '#F8F9FA',
                                                borderRadius: '10px',
                                                marginBottom: '16px'
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '12px' }}>
                                                    📅 Check-In Performance
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span style={{ color: '#666' }}>Check-In Rate:</span>
                                                        <span style={{ fontWeight: '600', color: '#058585' }}>{checkRate}%</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                        <span style={{ color: '#666' }}>Current Streak:</span>
                                                        <span style={{ fontWeight: '600', color: '#058585' }}>{currentStreak} days</span>
                                                    </div>
                                                    {avgMood > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <span style={{ color: '#666' }}>Average Mood:</span>
                                                            <span style={{ fontWeight: '600', color: avgMood >= 7 ? '#00A86B' : avgMood >= 4 ? '#FF9800' : '#F44336' }}>{avgMood}/10</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tasks Stats */}
                                        <div style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            borderRadius: '10px',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '12px' }}>
                                                ✅ Tasks Overview
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                    <span style={{ color: '#666' }}>Total Tasks:</span>
                                                    <span style={{ fontWeight: '600', color: '#333' }}>{totalAssignments}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                    <span style={{ color: '#666' }}>Completed:</span>
                                                    <span style={{ fontWeight: '600', color: '#00A86B' }}>{completedAssignments}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                    <span style={{ color: '#666' }}>In Progress:</span>
                                                    <span style={{ fontWeight: '600', color: '#FFA500' }}>{totalAssignments - completedAssignments}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Goals Stats */}
                                        <div style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            borderRadius: '10px',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '12px' }}>
                                                🎯 Goals Overview
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                    <span style={{ color: '#666' }}>Total Goals:</span>
                                                    <span style={{ fontWeight: '600', color: '#333' }}>{totalGoals}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                    <span style={{ color: '#666' }}>Active:</span>
                                                    <span style={{ fontWeight: '600', color: '#058585' }}>{activeGoals}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                            {/* Share Button */}
                                            <button
                                                onClick={async () => {
                                                    window.GLRSApp.utils.triggerHaptic('light');
                                                    const reportText = generateReportText();

                                                    // Try native share API (works on iOS Safari, Android Chrome, Desktop Chrome/Edge)
                                                    if (navigator.share) {
                                                        console.log('✅ Native share API available - opening share sheet...');
                                                        try {
                                                            await navigator.share({
                                                                title: 'My Weekly Recovery Progress',
                                                                text: reportText
                                                            });
                                                            console.log('✅ Share completed successfully');
                                                            return;
                                                        } catch (error) {
                                                            if (error.name === 'AbortError') {
                                                                console.log('ℹ️ User cancelled share');
                                                                return;
                                                            }
                                                            console.error('❌ Share API error:', error.name, error.message);
                                                            // Fall through to clipboard fallback
                                                        }
                                                    } else {
                                                        console.log('ℹ️ Share API not supported in this browser/context');
                                                    }

                                                    // Fallback: copy to clipboard
                                                    console.log('Using clipboard fallback...');
                                                    try {
                                                        await navigator.clipboard.writeText(reportText);
                                                        alert('✅ Progress report copied to clipboard!\n\nYou can now paste it anywhere to share.');
                                                    } catch (clipboardError) {
                                                        console.error('❌ Clipboard error:', clipboardError);
                                                        // Last resort: show text in prompt
                                                        prompt('Copy this text to share:', reportText);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    height: '48px',
                                                    background: '#FFFFFF',
                                                    border: '2px solid #058585',
                                                    borderRadius: '8px',
                                                    color: '#058585',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <i data-lucide="share-2" style={{ width: '18px', height: '18px' }}></i>
                                                Share
                                            </button>

                                            {/* Save Button */}
                                            <button
                                                onClick={() => {
                                                    try {
                                                        window.GLRSApp.utils.triggerHaptic('light');
                                                        const reportText = generateReportText();
                                                        const blob = new Blob([reportText], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `Weekly-Progress-${new Date().toISOString().split('T')[0]}.txt`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);

                                                        window.GLRSApp?.utils?.showNotification?.('Report saved successfully!', 'success');
                                                    } catch (error) {
                                                        console.error('Save error:', error);
                                                        alert('Unable to save report. Please try again.');
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    height: '48px',
                                                    background: '#058585',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#FFFFFF',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <i data-lucide="download" style={{ width: '18px', height: '18px' }}></i>
                                                Save
                                            </button>
                                        </div>

                                        {/* Close Button */}
                                        <button
                                            onClick={() => setActiveModal(null)}
                                            style={{
                                                marginTop: '12px',
                                                width: '100%',
                                                height: '48px',
                                                background: '#F8F9FA',
                                                border: '1px solid #E5E5E5',
                                                borderRadius: '8px',
                                                color: '#666',
                                                fontSize: '14px',
                                                fontWeight: '400',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Close
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* GOAL PROGRESS MODAL */}
            {activeModal === 'goalProgress' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#058585',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="target" style={{ width: '24px', height: '24px' }}></i>
                                Goal Progress
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {goals.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#666666'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                        No Goals Yet
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                        Start adding goals to track your progress
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {goals.map(goal => {
                                        const progress = goal.progress || 0;

                                        return (
                                            <div
                                                key={goal.id}
                                                style={{
                                                    padding: '15px',
                                                    background: '#f8f9fa',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e9ecef'
                                                }}
                                            >
                                                <div style={{
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    color: '#333333',
                                                    marginBottom: '10px'
                                                }}>
                                                    {goal.goalName || goal.name}
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: '#e9ecef',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    marginBottom: '8px'
                                                }}>
                                                    <div style={{
                                                        width: `${progress}%`,
                                                        height: '100%',
                                                        background: progress === 100
                                                            ? 'linear-gradient(90deg, #00A86B 0%, #008554 100%)'
                                                            : 'linear-gradient(90deg, #058585 0%, #044c4c 100%)',
                                                        transition: 'width 0.3s ease'
                                                    }}></div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{ fontSize: '13px', color: '#666666' }}>
                                                        {goal.assignments?.filter(a => a.status === 'completed').length || 0} / {goal.assignments?.length || 0} tasks completed
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        color: progress === 100 ? '#00A86B' : '#058585'
                                                    }}>
                                                        {progress}%
                                                    </div>
                                                </div>

                                                {progress === 100 && (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Share this goal completion with the community?')) {
                                                                const result = await window.GLRSApp.handlers.shareToCommunity('goal', `Completed goal: ${goal.goalName || goal.name}`, 'goals', goal.id);
                                                                if (result.success) {
                                                                    alert('Goal completion shared to community! 🎉');
                                                                } else {
                                                                    alert('Error sharing to community');
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            marginTop: '12px',
                                                            padding: '8px 16px',
                                                            background: '#00A86B',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <i data-lucide="share-2" style={{ width: '16px', height: '16px' }}></i>
                                                        Share Goal Completion
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TODAY'S WINS MODAL */}
            {activeModal === 'wins' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#FFA500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <i data-lucide="star" style={{ width: '24px', height: '24px' }}></i>
                                Today's Wins
                            </h2>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Add New Win */}
                            <div style={{
                                marginBottom: '20px'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333333',
                                    marginBottom: '8px'
                                }}>
                                    Add a win for today
                                </label>
                                <input
                                    type="text"
                                    value={newWin}
                                    onChange={(e) => setNewWin(e.target.value)}
                                    placeholder="e.g., Completed morning workout"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '15px',
                                        marginBottom: '10px'
                                    }}
                                    onKeyPress={async (e) => {
                                        if (e.key === 'Enter' && newWin.trim()) {
                                            try {
                                                // TODO: Save win to Firestore
                                                console.log('TODO: Save win to Firestore:', newWin.trim());
                                                setNewWin('');
                                            } catch (error) {
                                                alert('Error adding win');
                                            }
                                        }
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={async () => {
                                            if (newWin.trim()) {
                                                try {
                                                    // TODO: Save win to Firestore
                                                    console.log('TODO: Save win to Firestore:', newWin.trim());
                                                    setNewWin('');
                                                    alert('Win added! 🎉');
                                                } catch (error) {
                                                    alert('Error adding win');
                                                }
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            background: '#FFA500',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (newWin.trim()) {
                                                try {
                                                    // TODO: Save and share win to community
                                                    console.log('TODO: Save and share win:', { win: newWin.trim() });
                                                    setNewWin('');
                                                    alert('Win added and shared to community! 🎉');
                                                } catch (error) {
                                                    alert('Error adding win');
                                                }
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                        Add & Share
                                    </button>
                                </div>
                            </div>

                            {/* Today's Wins List */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                    Today's Wins (0)
                                </h3>
                                <button
                                    onClick={() => setActiveModal('winsHistory')}
                                    style={{
                                        padding: '6px 12px',
                                        background: '#f8f9fa',
                                        color: '#FFA500',
                                        border: '1px solid #FFA500',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    View History
                                </button>
                            </div>

                            {/* TODO: Load wins from Firestore - using empty array for now */}
                            <div style={{
                                textAlign: 'center',
                                padding: '30px 20px',
                                color: '#999999',
                                fontSize: '14px'
                            }}>
                                No wins yet today. Add your first win above!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STREAKS MODAL */}
            {activeModal === 'streaks' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                🔥 Your Check-In Streaks
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {/* Current Streak */}
                            {streakData && streakData.currentStreak > 0 && (
                                <div style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    border: '2px solid #058585'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                        Current Streak
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#058585' }}>
                                        🔥 {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                        Keep it up! Check in today to extend your streak.
                                    </div>
                                </div>
                            )}

                            {/* All Streaks List */}
                            <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000' }}>
                                All Streaks (2+ days)
                            </div>

                            {streakData && streakData.allStreaks && streakData.allStreaks.filter(s => s.length >= 2).length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {streakData.allStreaks.filter(s => s.length >= 2).map((streak, index) => {
                                        const startDate = new Date(streak.startDate);
                                        const endDate = new Date(streak.endDate);
                                        const isLongest = streak.length === streakData.longestStreak;
                                        const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '14px',
                                                    background: isLongest ? '#FFF9E6' : '#F8F9FA',
                                                    borderRadius: '10px',
                                                    border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                                                            {streak.length} {streak.length === 1 ? 'day' : 'days'}
                                                            {isLongest && <span style={{ marginLeft: '8px', fontSize: '14px' }}>⭐ Longest</span>}
                                                            {isCurrent && <span style={{ marginLeft: '8px', fontSize: '14px' }}>← Current</span>}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {' - '}
                                                            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '24px' }}>
                                                        🔥
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
                                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>No streaks of 2+ days yet</div>
                                    <div style={{ fontSize: '13px', color: '#BBB' }}>Keep checking in daily to build longer streaks!</div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setActiveModal(null)}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    height: '48px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHECK RATE MODAL */}
            {activeModal === 'checkRate' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }}
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '15px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '85vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            borderRadius: '15px 15px 0 0',
                            zIndex: 1
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#000',
                                textAlign: 'center'
                            }}>
                                📊 Check-In Rate
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {/* Current Rate */}
                            {weeklyStats && weeklyStats.checkRate > 0 ? (
                                <>
                                    <div style={{
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                            7-Day Check-In Rate
                                        </div>
                                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#058585', marginBottom: '8px' }}>
                                            {weeklyStats.checkRate}%
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                            {weeklyStats.checkRate >= 85 ? '🎉 Excellent consistency!' :
                                             weeklyStats.checkRate >= 70 ? '👍 Great job staying on track!' :
                                             weeklyStats.checkRate >= 50 ? '💪 Keep building that habit!' :
                                             '📈 Every check-in counts!'}
                                        </div>
                                    </div>

                                    {/* Insights */}
                                    <div style={{
                                        padding: '16px',
                                        background: '#F8F9FA',
                                        borderRadius: '10px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
                                            💡 Why This Matters
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                            Regular check-ins help you track your mood patterns, identify triggers, and celebrate progress.
                                            Consistency is key to recovery success!
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div style={{
                                        padding: '16px',
                                        background: '#FFF9E6',
                                        borderRadius: '10px',
                                        border: '1px solid #FFE5A3'
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
                                            💪 Keep It Up
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                                            <li>Set daily reminders for morning & evening check-ins</li>
                                            <li>Check in at the same time each day to build routine</li>
                                            <li>Use check-ins to reflect on your recovery journey</li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                                    <div style={{ fontSize: '16px', marginBottom: '8px', color: '#000' }}>No Data Yet</div>
                                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        Complete your morning and evening check-ins to start tracking your consistency!
                                    </div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setActiveModal(null)}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    height: '48px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AVG MOOD MODAL */}
            {activeModal === 'avgMood' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }}
                onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '15px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '85vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            borderRadius: '15px 15px 0 0',
                            zIndex: 1
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#000',
                                textAlign: 'center'
                            }}>
                                😊 Average Mood
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {/* Current Mood */}
                            {weeklyStats && weeklyStats.avgMood > 0 ? (
                                <>
                                    <div style={{
                                        padding: '20px',
                                        background: weeklyStats.avgMood >= 7 ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(5, 133, 133, 0.1) 100%)' :
                                                    weeklyStats.avgMood >= 4 ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)' :
                                                    'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                            7-Day Average Mood
                                        </div>
                                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: weeklyStats.avgMood >= 7 ? '#00A86B' : weeklyStats.avgMood >= 4 ? '#FF9800' : '#F44336', marginBottom: '8px' }}>
                                            {weeklyStats.avgMood}/10
                                        </div>
                                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                                            {weeklyStats.avgMood >= 9 ? '😄 Excellent' :
                                             weeklyStats.avgMood >= 7 ? '😊 Good' :
                                             weeklyStats.avgMood >= 5 ? '😐 Moderate' :
                                             weeklyStats.avgMood >= 3 ? '😔 Low' :
                                             '😢 Very Low'}
                                        </div>
                                    </div>

                                    {/* Interpretation */}
                                    <div style={{
                                        padding: '16px',
                                        background: '#F8F9FA',
                                        borderRadius: '10px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
                                            💭 What This Means
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                            {weeklyStats.avgMood >= 7 ?
                                                'Your mood has been consistently positive! Keep up the great work with your recovery practices.' :
                                             weeklyStats.avgMood >= 4 ?
                                                'Your mood has been moderate. This is normal - recovery has ups and downs. Keep using your coping techniques and reach out for support when needed.' :
                                                'Your mood has been lower recently. Please consider reaching out to your coach or using the Emergency Support resources. You don\'t have to go through this alone.'}
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div style={{
                                        padding: '16px',
                                        background: weeklyStats.avgMood >= 7 ? '#E8F5E9' : weeklyStats.avgMood >= 4 ? '#FFF9E6' : '#FFEBEE',
                                        borderRadius: '10px',
                                        border: `1px solid ${weeklyStats.avgMood >= 7 ? '#A5D6A7' : weeklyStats.avgMood >= 4 ? '#FFE5A3' : '#FFCDD2'}`
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
                                            {weeklyStats.avgMood >= 7 ? '🌟 Keep Thriving' : weeklyStats.avgMood >= 4 ? '💪 Stay Strong' : '🆘 Get Support'}
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                                            {weeklyStats.avgMood >= 7 ? (
                                                <>
                                                    <li>Share your success with your support network</li>
                                                    <li>Document what's working in your reflections</li>
                                                    <li>Help others by sharing your story</li>
                                                </>
                                            ) : weeklyStats.avgMood >= 4 ? (
                                                <>
                                                    <li>Review your coping techniques regularly</li>
                                                    <li>Connect with your support group</li>
                                                    <li>Practice self-care daily</li>
                                                </>
                                            ) : (
                                                <>
                                                    <li>Contact your coach or counselor today</li>
                                                    <li>Use the SOS button for immediate support</li>
                                                    <li>Reach out to a trusted friend or family member</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>😊</div>
                                    <div style={{ fontSize: '16px', marginBottom: '8px', color: '#000' }}>No Data Yet</div>
                                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        Complete your morning check-ins to start tracking your mood patterns!
                                    </div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setActiveModal(null)}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    height: '48px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REFLECTION STREAKS MODAL */}
            {activeModal === 'reflectionStreaks' && reflectionStreakData && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                🌙 Your Reflection Streaks
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {/* Current Streak */}
                            {reflectionStreakData.currentStreak > 0 && (
                                <div style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    border: '2px solid #058585'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                        Current Streak
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#058585' }}>
                                        🔥 {reflectionStreakData.currentStreak} {reflectionStreakData.currentStreak === 1 ? 'day' : 'days'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                        Keep it up! Reflect tonight to extend your streak.
                                    </div>
                                </div>
                            )}

                            {/* All Streaks List */}
                            <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000' }}>
                                All Streaks
                            </div>

                            {reflectionStreakData.allStreaks.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {reflectionStreakData.allStreaks.map((streak, index) => {
                                        const startDate = new Date(streak.startDate);
                                        const endDate = new Date(streak.endDate);
                                        const isLongest = index === 0; // First in sorted array is longest
                                        const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '14px',
                                                    background: isLongest ? '#FFF9E6' : '#F8F9FA',
                                                    borderRadius: '10px',
                                                    border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                                                            {streak.length} {streak.length === 1 ? 'day' : 'days'}
                                                            {isLongest && <span style={{ marginLeft: '8px', fontSize: '14px' }}>⭐ Longest</span>}
                                                            {isCurrent && <span style={{ marginLeft: '8px', fontSize: '14px' }}>← Current</span>}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {' - '}
                                                            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '24px' }}>
                                                        🔥
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</div>
                                    <div>Start reflecting daily to build your first streak!</div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setActiveModal(null);
                                }}
                                style={{
                                    marginTop: '20px',
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

            {/* ALL REFLECTIONS MODAL */}
            {activeModal === 'allReflections' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                🌙 All Reflections
                            </h3>
                            <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                Your lifetime reflection journey ({reflectionStats.totalAllTime} total)
                            </p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {allReflections.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {allReflections.map((reflection, index) => (
                                        <div
                                            key={reflection.id || index}
                                            style={{
                                                padding: '16px',
                                                background: '#F8F9FA',
                                                borderRadius: '12px',
                                                border: '1px solid #E5E5E5'
                                            }}
                                        >
                                            {/* Date */}
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#058585',
                                                marginBottom: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <i data-lucide="calendar" style={{ width: '16px', height: '16px' }}></i>
                                                {formatDate(reflection.date, 'full')}
                                            </div>

                                            {/* Overall Day Score */}
                                            {reflection.overallDay !== undefined && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                                        Overall Day
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <div style={{
                                                            width: '100%',
                                                            height: '8px',
                                                            background: '#E5E5E5',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${(reflection.overallDay / 10) * 100}%`,
                                                                height: '100%',
                                                                background: reflection.overallDay >= 7 ? '#00A86B' :
                                                                           reflection.overallDay >= 4 ? '#FFA500' : '#FF6B6B',
                                                                transition: 'width 0.3s'
                                                            }}></div>
                                                        </div>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            color: '#000'
                                                        }}>
                                                            {reflection.overallDay}/10
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Gratitude */}
                                            {reflection.gratitude && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        marginBottom: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <i data-lucide="heart" style={{ width: '14px', height: '14px' }}></i>
                                                        Gratitude
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#000',
                                                        fontStyle: 'italic',
                                                        padding: '8px 12px',
                                                        background: '#FFFFFF',
                                                        borderRadius: '8px',
                                                        border: '1px solid #E5E5E5'
                                                    }}>
                                                        "{reflection.gratitude}"
                                                    </div>
                                                </div>
                                            )}

                                            {/* Wins */}
                                            {reflection.wins && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        marginBottom: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <i data-lucide="trophy" style={{ width: '14px', height: '14px' }}></i>
                                                        Today's Win
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#000',
                                                        padding: '8px 12px',
                                                        background: '#FFFFFF',
                                                        borderRadius: '8px',
                                                        border: '1px solid #E5E5E5'
                                                    }}>
                                                        {reflection.wins}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Learnings */}
                                            {reflection.learnings && (
                                                <div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        marginBottom: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <i data-lucide="lightbulb" style={{ width: '14px', height: '14px' }}></i>
                                                        What I Learned
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#000',
                                                        padding: '8px 12px',
                                                        background: '#FFFFFF',
                                                        borderRadius: '8px',
                                                        border: '1px solid #E5E5E5'
                                                    }}>
                                                        {reflection.learnings}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</div>
                                    <div>No reflections yet. Start your evening reflection today!</div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setActiveModal(null);
                                }}
                                style={{
                                    marginTop: '20px',
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GRATITUDE THEMES MODAL */}
            {activeModal === 'gratitudeThemes' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                🙏 Your Gratitude Journey
                            </h3>
                            <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                Patterns in what brings you gratitude
                            </p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {reflectionStats.topGratitudeThemes && reflectionStats.topGratitudeThemes.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {reflectionStats.topGratitudeThemes.map((theme, index) => {
                                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                                        const rankLabel = index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place';
                                        const bgGradient = index === 0
                                            ? 'linear-gradient(135deg, #FFF9E6 0%, #FFE4B3 100%)'
                                            : index === 1
                                            ? 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)'
                                            : 'linear-gradient(135deg, #FFE9D6 0%, #FFD6B3 100%)';

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '20px',
                                                    background: bgGradient,
                                                    borderRadius: '12px',
                                                    border: index === 0 ? '2px solid #FFA500' : '1px solid #E5E5E5'
                                                }}
                                            >
                                                {/* Rank Badge */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{ fontSize: '28px' }}>{medal}</span>
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            {rankLabel}
                                                        </div>
                                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                                                            {theme.name}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Count */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px',
                                                    padding: '8px 12px',
                                                    background: 'rgba(255, 255, 255, 0.7)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <i data-lucide="heart" style={{ width: '16px', height: '16px', color: '#FF6B6B' }}></i>
                                                    <span style={{ fontSize: '14px', color: '#000' }}>
                                                        <strong>{theme.count}</strong> {theme.count === 1 ? 'time' : 'times'} grateful for this
                                                    </span>
                                                </div>

                                                {/* Recent Dates */}
                                                <div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        marginBottom: '8px',
                                                        fontWeight: '600'
                                                    }}>
                                                        Recent Moments:
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {theme.dates.slice(0, 5).map((date, dateIndex) => (
                                                            <div
                                                                key={dateIndex}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '13px',
                                                                    color: '#000',
                                                                    padding: '6px 10px',
                                                                    background: 'rgba(255, 255, 255, 0.5)',
                                                                    borderRadius: '6px'
                                                                }}
                                                            >
                                                                <i data-lucide="calendar" style={{ width: '14px', height: '14px', color: '#058585' }}></i>
                                                                {date.toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Insight Message */}
                                    <div style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(5, 133, 133, 0.3)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px'
                                        }}>
                                            <i data-lucide="lightbulb" style={{ width: '20px', height: '20px', color: '#058585', marginTop: '2px' }}></i>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>
                                                    💡 Insight
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.5' }}>
                                                    Recognizing patterns in your gratitude helps strengthen positive thinking and shows what truly matters to you in recovery.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💭</div>
                                    <div>No gratitude themes yet. Start your evening reflections to track what you're grateful for!</div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setActiveModal(null);
                                }}
                                style={{
                                    marginTop: '20px',
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GRATITUDE JOURNAL MODAL */}
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => {
                    setActiveModal(null);
                    setGratitudeJournalPeriod(null);
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                📖 Gratitude Journal
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {!gratitudeJournalPeriod ? (
                                /* Period Selection */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button
                                        onClick={() => setGratitudeJournalPeriod('allTime')}
                                        style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#000',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>All Time</span>
                                        <span style={{ fontSize: '14px', color: '#058585', fontWeight: 'bold' }}>
                                            {gratitudeJournalStats.allTime}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setGratitudeJournalPeriod('thisMonth')}
                                        style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#000',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>This Month</span>
                                        <span style={{ fontSize: '14px', color: '#FFA500', fontWeight: 'bold' }}>
                                            {gratitudeJournalStats.thisMonth}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setGratitudeJournalPeriod('thisWeek')}
                                        style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#000',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>This Week</span>
                                        <span style={{ fontSize: '14px', color: '#00A86B', fontWeight: 'bold' }}>
                                            {gratitudeJournalStats.thisWeek}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                /* Show Gratitude Entries */
                                <div>
                                    {/* Back Button */}
                                    <button
                                        onClick={() => setGratitudeJournalPeriod(null)}
                                        style={{
                                            marginBottom: '16px',
                                            padding: '8px 16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: '#000',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i data-lucide="arrow-left" style={{ width: '16px', height: '16px' }}></i>
                                        Back
                                    </button>

                                    {/* Entries List */}
                                    {(() => {
                                        const now = new Date();
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                                        const filteredEntries = allReflections.filter(r => {
                                            if (!r.gratitude || !r.gratitude.trim()) return false;
                                            if (gratitudeJournalPeriod === 'allTime') return true;
                                            if (gratitudeJournalPeriod === 'thisWeek') return r.date >= weekAgo;
                                            if (gratitudeJournalPeriod === 'thisMonth') return r.date >= firstDayOfMonth;
                                            return false;
                                        });

                                        return filteredEntries.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {filteredEntries.map((entry, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            padding: '16px',
                                                            background: '#F8F9FA',
                                                            borderRadius: '12px',
                                                            border: '1px solid #E5E5E5'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: '#058585',
                                                            marginBottom: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            <i data-lucide="calendar" style={{ width: '16px', height: '16px' }}></i>
                                                            {entry.date.toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>

                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#000',
                                                            fontStyle: 'italic',
                                                            padding: '12px',
                                                            background: '#FFFFFF',
                                                            borderRadius: '8px',
                                                            border: '1px solid #E5E5E5'
                                                        }}>
                                                            "{entry.gratitude}"
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px 20px',
                                                color: '#999'
                                            }}>
                                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📖</div>
                                                <div>No gratitude entries for this period</div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setActiveModal(null);
                                    setGratitudeJournalPeriod(null);
                                }}
                                style={{
                                    marginTop: '20px',
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHALLENGES HISTORY MODAL */}
            {activeModal === 'challengesHistory' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => {
                    setActiveModal(null);
                    setChallengesHistoryPeriod(null);
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                ⚠️ Challenges History
                            </h3>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {!challengesHistoryPeriod ? (
                                /* Period Selection */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button
                                        onClick={() => setChallengesHistoryPeriod('allTime')}
                                        style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#000',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>All Time</span>
                                        <span style={{ fontSize: '14px', color: '#058585', fontWeight: 'bold' }}>
                                            {challengesHistoryStats.allTime}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setChallengesHistoryPeriod('thisMonth')}
                                        style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#000',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>This Month</span>
                                        <span style={{ fontSize: '14px', color: '#FFA500', fontWeight: 'bold' }}>
                                            {challengesHistoryStats.thisMonth}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setChallengesHistoryPeriod('thisWeek')}
                                        style={{
                                            padding: '16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#000',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span>This Week</span>
                                        <span style={{ fontSize: '14px', color: '#00A86B', fontWeight: 'bold' }}>
                                            {challengesHistoryStats.thisWeek}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                /* Show Challenge Entries */
                                <div>
                                    {/* Back Button */}
                                    <button
                                        onClick={() => setChallengesHistoryPeriod(null)}
                                        style={{
                                            marginBottom: '16px',
                                            padding: '8px 16px',
                                            background: '#F8F9FA',
                                            border: '1px solid #E5E5E5',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: '#000',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i data-lucide="arrow-left" style={{ width: '16px', height: '16px' }}></i>
                                        Back
                                    </button>

                                    {/* Entries List */}
                                    {(() => {
                                        const now = new Date();
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                                        const filteredEntries = allReflections.filter(r => {
                                            if (!r.challenges || !r.challenges.trim()) return false;
                                            if (challengesHistoryPeriod === 'allTime') return true;
                                            if (challengesHistoryPeriod === 'thisWeek') return r.date >= weekAgo;
                                            if (challengesHistoryPeriod === 'thisMonth') return r.date >= firstDayOfMonth;
                                            return false;
                                        });

                                        return filteredEntries.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {filteredEntries.map((entry, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            padding: '16px',
                                                            background: '#FFF5F5',
                                                            borderRadius: '12px',
                                                            border: '1px solid #FFE4E4'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: '#FF6B6B',
                                                            marginBottom: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            <i data-lucide="calendar" style={{ width: '16px', height: '16px' }}></i>
                                                            {entry.date.toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>

                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#000',
                                                            padding: '12px',
                                                            background: '#FFFFFF',
                                                            borderRadius: '8px',
                                                            border: '1px solid #FFE4E4'
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
                                                color: '#999'
                                            }}>
                                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                                                <div>No challenges recorded for this period</div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setActiveModal(null);
                                    setChallengesHistoryPeriod(null);
                                }}
                                style={{
                                    marginTop: '20px',
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GOAL TRACKER MODAL */}
            {activeModal === 'goalProgress' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            position: 'sticky',
                            top: 0,
                            background: '#FFFFFF',
                            zIndex: 10
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                🎯 Tomorrow's Goals
                            </h3>
                            <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                Goals you set from evening reflections
                            </p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {tomorrowGoals.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {tomorrowGoals.map((goalItem, index) => (
                                        <div
                                            key={goalItem.id}
                                            style={{
                                                padding: '16px',
                                                background: goalItem.completed ? '#E8F5E9' : '#F8F9FA',
                                                borderRadius: '12px',
                                                border: `2px solid ${goalItem.completed ? '#4CAF50' : '#E5E5E5'}`
                                            }}
                                        >
                                            {/* Date */}
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#666',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <i data-lucide="calendar" style={{ width: '14px', height: '14px' }}></i>
                                                Set on: {goalItem.date.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>

                                            {/* Goal */}
                                            <div style={{
                                                fontSize: '15px',
                                                color: '#000',
                                                padding: '12px',
                                                background: '#FFFFFF',
                                                borderRadius: '8px',
                                                marginBottom: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {goalItem.goal}
                                            </div>

                                            {/* Checkbox & Share */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}>
                                                {/* Checkbox to mark complete */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px',
                                                    background: goalItem.completed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                                    borderRadius: '8px',
                                                    flex: 1
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={goalItem.completed}
                                                        onChange={async (e) => {
                                                            const completed = e.target.checked;
                                                            try {
                                                                const db = firebase.firestore();
                                                                await db.collection('checkIns').doc(goalItem.id).update({
                                                                    'eveningData.goalCompleted': completed,
                                                                    'eveningData.goalCompletedDate': completed ? firebase.firestore.FieldValue.serverTimestamp() : null
                                                                });
                                                                window.GLRSApp?.utils?.showNotification &&
                                                                    window.GLRSApp.utils.showNotification(
                                                                        completed ? '✅ Goal marked complete!' : 'Goal unmarked',
                                                                        'success'
                                                                    );
                                                            } catch (error) {
                                                                console.error('Error updating goal status:', error);
                                                                window.GLRSApp?.utils?.showNotification &&
                                                                    window.GLRSApp.utils.showNotification(
                                                                        'Error updating goal status',
                                                                        'error'
                                                                    );
                                                            }
                                                        }}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    <label style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: goalItem.completed ? '#4CAF50' : '#666',
                                                        cursor: 'pointer'
                                                    }}>
                                                        {goalItem.completed ? '✅ Completed' : 'Mark as completed'}
                                                    </label>
                                                </div>

                                                {/* Share button (appears when completed) */}
                                                {goalItem.completed && (
                                                    <button
                                                        onClick={() => {
                                                            setShareGoalData(goalItem);
                                                            setShareComment('');
                                                            setActiveModal('shareGoal');
                                                        }}
                                                        style={{
                                                            padding: '10px 16px',
                                                            background: '#058585',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            color: '#FFFFFF',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                                        Share
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#999'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                                    <div>No goals set yet. Set your first "Tomorrow's Goal" in your evening reflection!</div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    setActiveModal(null);
                                }}
                                style={{
                                    marginTop: '20px',
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SHARE GOAL TO COMMUNITY MODAL */}
            {activeModal === 'shareGoal' && shareGoalData && (
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
                    zIndex: 10001,
                    padding: '20px'
                }} onClick={() => {
                    setActiveModal('goalProgress');
                    setShareGoalData(null);
                    setShareComment('');
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            background: 'linear-gradient(135deg, #058585 0%, #047070 100%)',
                            borderRadius: '12px 12px 0 0'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <i data-lucide="share-2" style={{ width: '24px', height: '24px' }}></i>
                                Share Your Achievement
                            </h3>
                            <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.9)'
                            }}>
                                Share your completed goal with the community
                            </p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            {/* Goal Preview */}
                            <div style={{
                                padding: '16px',
                                background: '#E8F5E9',
                                borderRadius: '12px',
                                border: '2px solid #4CAF50',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#666',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i data-lucide="trophy" style={{ width: '14px', height: '14px', color: '#4CAF50' }}></i>
                                    Goal Achieved on {new Date(shareGoalData.completedDate?.seconds * 1000 || Date.now()).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <div style={{
                                    fontSize: '15px',
                                    color: '#000',
                                    padding: '12px',
                                    background: '#FFFFFF',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    fontStyle: 'italic'
                                }}>
                                    "{shareGoalData.goal}"
                                </div>
                            </div>

                            {/* Comment Textarea */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#000',
                                    marginBottom: '8px'
                                }}>
                                    Add a message (optional)
                                </label>
                                <textarea
                                    value={shareComment}
                                    onChange={(e) => setShareComment(e.target.value)}
                                    placeholder="Share your thoughts, feelings, or what helped you achieve this goal..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '12px',
                                        fontSize: '14px',
                                        border: '1px solid #E5E5E5',
                                        borderRadius: '8px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px'
                            }}>
                                <button
                                    onClick={() => {
                                        setActiveModal('goalProgress');
                                        setShareGoalData(null);
                                        setShareComment('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#F5F5F5',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#666',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const db = firebase.firestore();

                                            // Create community message
                                            await db.collection('communityMessages').add({
                                                userId: user.uid,
                                                userName: user.displayName || user.email,
                                                type: 'goalAchievement',
                                                goal: shareGoalData.goal,
                                                goalSetDate: shareGoalData.date,
                                                completedDate: shareGoalData.completedDate || firebase.firestore.FieldValue.serverTimestamp(),
                                                message: shareComment.trim() || '',
                                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                                likes: 0,
                                                comments: []
                                            });

                                            window.GLRSApp?.utils?.showNotification &&
                                                window.GLRSApp.utils.showNotification(
                                                    '🎉 Goal achievement shared with community!',
                                                    'success'
                                                );

                                            // Close modal and reset
                                            setActiveModal('goalProgress');
                                            setShareGoalData(null);
                                            setShareComment('');
                                        } catch (error) {
                                            console.error('Error sharing goal:', error);
                                            window.GLRSApp?.utils?.showNotification &&
                                                window.GLRSApp.utils.showNotification(
                                                    'Error sharing goal. Please try again.',
                                                    'error'
                                                );
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #058585 0%, #047070 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <i data-lucide="send" style={{ width: '16px', height: '16px' }}></i>
                                    Share to Community
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SET TODAY'S INTENTIONS MODAL */}
            {activeModal === 'intentions' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #E9ECEF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i data-lucide="compass" style={{ width: '24px', height: '24px', color: '#0077CC' }}></i>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#000000'
                                }}>
                                    Set Today's Intentions
                                </h2>
                            </div>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{
                                    width: '24px',
                                    height: '24px',
                                    color: '#666666'
                                }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(5,133,133,0.1) 100%)',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: '1px solid rgba(0,119,204,0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <i data-lucide="lightbulb" style={{ width: '20px', height: '20px', color: '#0077CC', flexShrink: 0, marginTop: '2px' }}></i>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#000000',
                                        lineHeight: '1.5'
                                    }}>
                                        Setting daily intentions helps you stay focused on what matters most in your recovery journey. Take a moment to define your purpose for today.
                                    </p>
                                </div>
                            </div>

                            <textarea
                                placeholder="What are your intentions for today? (e.g., 'Stay present and grateful', 'Reach out to my support network', 'Practice self-care')"
                                value={newIntention}
                                onChange={(e) => setNewIntention(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '1px solid #CED4DA',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    marginBottom: '16px'
                                }}
                            />

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <button
                                    onClick={async () => {
                                        if (!newIntention.trim()) {
                                            alert('Please write your intentions for today');
                                            return;
                                        }

                                        try {
                                            // TODO: Implement Firestore save
                                            console.log('Save intention:', newIntention);
                                            alert('✨ Your intentions have been set for today!');
                                            setNewIntention('');
                                            setActiveModal(null);
                                        } catch (error) {
                                            alert('Error saving your intentions. Please try again.');
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px 24px',
                                        background: 'linear-gradient(135deg, #0077CC 0%, #058585 100%)',
                                        color: '#FFFFFF',
                                        border: 'none',
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
                                    <i data-lucide="check" style={{ width: '18px', height: '18px' }}></i>
                                    Set Intentions
                                </button>
                            </div>

                            {/* View Past Intentions */}
                            <button
                                data-action="past-intentions"
                                onClick={async () => {
                                    try {
                                        // TODO: Load past intentions data
                                        console.log('Load past intentions');
                                        setActiveModal('pastIntentions');
                                    } catch (error) {
                                        alert('Error loading past intentions');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#F8F9FA',
                                    color: '#0077CC',
                                    border: '1px solid #E9ECEF',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i data-lucide="history" style={{ width: '18px', height: '18px' }}></i>
                                View Past Intentions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PAST INTENTIONS MODAL */}
            {activeModal === 'pastIntentions' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #E9ECEF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i data-lucide="history" style={{ width: '24px', height: '24px', color: '#0077CC' }}></i>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#000000'
                                }}>
                                    Past Intentions
                                </h2>
                            </div>
                            <div
                                onClick={() => setActiveModal(null)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{
                                    width: '24px',
                                    height: '24px',
                                    color: '#666666'
                                }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            {pastIntentions.length === 0 ? (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    border: '2px dashed #0077CC'
                                }}>
                                    <i data-lucide="compass" style={{
                                        width: '48px',
                                        height: '48px',
                                        color: '#0077CC',
                                        marginBottom: '12px'
                                    }}></i>
                                    <h3 style={{
                                        color: '#000000',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        margin: '0 0 8px 0'
                                    }}>
                                        No Intentions Yet
                                    </h3>
                                    <p style={{
                                        color: '#666666',
                                        fontSize: '14px',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>
                                        Start setting your daily intentions to build momentum in your recovery journey.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {pastIntentions.map((intention, index) => {
                                        const date = intention.createdAt?.toDate();
                                        const dateStr = date ? date.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        }) : 'Unknown date';
                                        const timeStr = date ? date.toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : '';

                                        return (
                                            <div key={intention.id} style={{
                                                background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                border: '1px solid rgba(0,119,204,0.2)'
                                            }}>
                                                {/* Date Header */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px',
                                                    paddingBottom: '12px',
                                                    borderBottom: '1px solid rgba(0,119,204,0.1)'
                                                }}>
                                                    <i data-lucide="calendar" style={{ width: '16px', height: '16px', color: '#0077CC' }}></i>
                                                    <span style={{
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        color: '#0077CC'
                                                    }}>
                                                        {dateStr}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#666666',
                                                        marginLeft: 'auto'
                                                    }}>
                                                        {timeStr}
                                                    </span>
                                                </div>

                                                {/* Intention Content */}
                                                <div style={{ marginBottom: '8px' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: '#666666',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        marginBottom: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <i data-lucide="target" style={{ width: '14px', height: '14px' }}></i>
                                                        Intentions
                                                    </div>
                                                    {intention.intention && intention.intention.trim() !== '' ? (
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '14px',
                                                            color: '#000000',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {intention.intention}
                                                        </p>
                                                    ) : (
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '13px',
                                                            color: '#999999',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            Daily pledge made (no text provided)
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PROGRESS SNAPSHOT MODAL */}
            {activeModal === 'snapshot' && (() => {
                // Calculate variables for snapshot
                const activeGoals = goals.filter(g => g.status !== 'completed').length;
                const totalAssignments = assignments.length;
                const completedAssignments = assignments.filter(a => a.status === 'completed').length;
                const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }} onClick={() => setActiveModal(null)}>
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }} onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #E9ECEF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px', color: '#0077CC' }}></i>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        color: '#000000'
                                    }}>
                                        Progress Snapshot
                                    </h2>
                                </div>
                                <div
                                    onClick={() => setActiveModal(null)}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    <i data-lucide="x" style={{
                                        width: '24px',
                                        height: '24px',
                                        color: '#666666'
                                    }}></i>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '24px' }}>
                                {/* Overview Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '12px',
                                    marginBottom: '24px'
                                }}>
                                    {/* Active Goals */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(0,119,204,0.05) 100%)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,119,204,0.2)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i data-lucide="target" style={{ width: '20px', height: '20px', color: '#0077CC' }}></i>
                                            <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Active Goals</span>
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0077CC' }}>
                                            {activeGoals}
                                        </div>
                                    </div>

                                    {/* Active Objectives */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(5,133,133,0.1) 0%, rgba(5,133,133,0.05) 100%)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(5,133,133,0.2)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i data-lucide="list-checks" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                            <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Objectives</span>
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#058585' }}>
                                            {goals.reduce((count, goal) => count + (goal.objectives?.length || 0), 0)}
                                        </div>
                                    </div>

                                    {/* Active Tasks */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(0,168,107,0.05) 100%)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,168,107,0.2)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i data-lucide="clipboard-list" style={{ width: '20px', height: '20px', color: '#00A86B' }}></i>
                                            <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Active Tasks</span>
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00A86B' }}>
                                            {assignments.filter(a => a.status !== 'completed').length}
                                        </div>
                                    </div>

                                    {/* Completion Rate */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(255,140,0,0.1) 0%, rgba(255,140,0,0.05) 100%)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,140,0,0.2)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <i data-lucide="trending-up" style={{ width: '20px', height: '20px', color: '#FF8C00' }}></i>
                                            <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Completion</span>
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF8C00' }}>
                                            {completionRate}%
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Details */}
                                <div style={{
                                    background: '#F8F9FA',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#000000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <i data-lucide="activity" style={{ width: '18px', height: '18px', color: '#0077CC' }}></i>
                                        Overall Progress
                                    </h3>

                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '13px', color: '#666666' }}>Completed Tasks</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#000000' }}>
                                                {completedAssignments} / {totalAssignments}
                                            </span>
                                        </div>
                                        <div style={{
                                            background: '#E9ECEF',
                                            borderRadius: '8px',
                                            height: '8px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                background: 'linear-gradient(90deg, #0077CC 0%, #00A86B 100%)',
                                                height: '100%',
                                                width: `${completionRate}%`,
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '12px',
                                        marginTop: '16px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#999999', marginBottom: '4px' }}>Goals</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>
                                                {goals.length} Total
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#999999', marginBottom: '4px' }}>Objectives</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>
                                                {goals.reduce((count, goal) => count + (goal.objectives?.length || 0), 0)} Total
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivational Message */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(5,133,133,0.1) 100%)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0,119,204,0.2)',
                                    textAlign: 'center'
                                }}>
                                    <i data-lucide="trophy" style={{ width: '32px', height: '32px', color: '#0077CC', marginBottom: '8px' }}></i>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        color: '#000000',
                                        fontWeight: '500'
                                    }}>
                                        {completionRate >= 75 ? '🌟 Outstanding progress! Keep up the amazing work!' :
                                         completionRate >= 50 ? '💪 You\'re doing great! Stay focused on your goals!' :
                                         completionRate >= 25 ? '🎯 Good start! Keep building momentum!' :
                                         '🚀 Every journey begins with a single step. You\'ve got this!'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* HABIT HISTORY MODAL */}
            {activeModal === 'habitHistory' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal('habit')}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                📊 Habit History
                            </h3>
                            <button
                                onClick={() => setActiveModal('habit')}
                                style={{
                                    padding: '6px 12px',
                                    background: '#058585',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Tracker
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#999'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
                                <div style={{ fontSize: '14px' }}>Habit history will show your past completions and streaks.</div>
                                <div style={{ fontSize: '13px', marginTop: '8px', color: '#BBB' }}>
                                    TODO: Load historical habit data from Firestore
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REFLECTION HISTORY MODAL */}
            {activeModal === 'reflectionHistory' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal('reflection')}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                💭 Reflection History
                            </h3>
                            <button
                                onClick={() => setActiveModal('reflection')}
                                style={{
                                    padding: '6px 12px',
                                    background: '#058585',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Reflection
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#999'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                                <div style={{ fontSize: '14px' }}>Reflection history will show your past daily reflections.</div>
                                <div style={{ fontSize: '13px', marginTop: '8px', color: '#BBB' }}>
                                    TODO: Load historical reflection data from Firestore
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* WINS HISTORY MODAL */}
            {activeModal === 'winsHistory' && (
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
                    zIndex: 10000,
                    padding: '20px'
                }} onClick={() => setActiveModal('wins')}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E5E5E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#FFA500'
                            }}>
                                ⭐ Wins History
                            </h3>
                            <button
                                onClick={() => setActiveModal('wins')}
                                style={{
                                    padding: '6px 12px',
                                    background: '#FFA500',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Wins
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '20px' }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#999'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                                <div style={{ fontSize: '14px' }}>Wins history will show your past daily victories.</div>
                                <div style={{ fontSize: '13px', marginTop: '8px', color: '#BBB' }}>
                                    TODO: Load historical wins data from Firestore
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* TASKSTABMODALS - Pattern Detection Modals  */}
            {/* ============================================ */}
            {React.createElement(window.GLRSApp.components.TasksTabModals, {
                // Modal visibility props (9)
                showMoodPatternModal: showMoodPatternModal,
                showCravingPatternModal: showCravingPatternModal,
                showAnxietyPatternModal: showAnxietyPatternModal,
                showSleepPatternModal: showSleepPatternModal,
                showTipsModal: showTipsModal,
                showCopingTechniqueModal: showCopingTechniqueModal,
                showMilestoneModal: showMilestoneModal,
                showPastReflectionsModal: showPastReflectionsModal,
                showGratitudeModal: showGratitudeModal,

                // Data props (11)
                user: user,
                patternDetection: {}, // TODO: Implement pattern detection data loading
                copingTechniques: window.GLRSApp?.staticData?.copingTechniques || [],
                reflectionData: reflections || [],
                reflectionFilter: reflectionFilter,
                selectedReflection: selectedReflection,
                gratitudeThemes: window.GLRSApp?.staticData?.gratitudeThemes || [],
                gratitudeTheme: gratitudeTheme,
                gratitudeText: gratitudeText,
                nextMilestone: nextMilestone,
                allMilestones: user?.sobrietyDate ?
                    window.GLRSApp?.utils?.getRecoveryMilestones?.(user.sobrietyDate) || [] : [],

                // Callback props (7)
                onClose: (modalName) => {
                    if (modalName === 'moodPattern') setShowMoodPatternModal(false);
                    else if (modalName === 'cravingPattern') setShowCravingPatternModal(false);
                    else if (modalName === 'anxietyPattern') setShowAnxietyPatternModal(false);
                    else if (modalName === 'sleepPattern') setShowSleepPatternModal(false);
                    else if (modalName === 'tips') setShowTipsModal(false);
                    else if (modalName === 'copingTechnique') setShowCopingTechniqueModal(false);
                    else if (modalName === 'milestone') setShowMilestoneModal(false);
                    else if (modalName === 'pastReflections') setShowPastReflectionsModal(false);
                    else if (modalName === 'gratitude') setShowGratitudeModal(false);
                },
                onNavigate: (tab) => {
                    // Handle navigation to other tabs if needed
                    console.log('Navigate to:', tab);
                },
                onSetReflectionFilter: (filter) => {
                    setReflectionFilter(filter);
                },
                onSelectReflection: (reflection) => {
                    setSelectedReflection(reflection);
                },
                onSetGratitudeTheme: (theme) => {
                    setGratitudeTheme(theme);
                },
                onSetGratitudeText: (text) => {
                    setGratitudeText(text);
                },
                onSaveGratitude: async () => {
                    if (!gratitudeTheme || !gratitudeText.trim()) {
                        window.GLRSApp?.utils?.showNotification?.('Please select a theme and enter your gratitude', 'error');
                        return;
                    }

                    try {
                        const db = window.firebase.firestore();
                        await db.collection('gratitudes').add({
                            userId: user.uid,
                            theme: gratitudeTheme,
                            text: gratitudeText,
                            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp?.utils?.showNotification?.('Gratitude saved successfully!', 'success');
                        setGratitudeTheme('');
                        setGratitudeText('');
                        setShowGratitudeModal(false);
                    } catch (error) {
                        console.error('Error saving gratitude:', error);
                        window.GLRSApp?.utils?.showNotification?.('Failed to save gratitude', 'error');
                    }
                }
            })}

            {/* ============================================ */}
            {/* CHECKINMODALS - Check-in & Reflection Modals */}
            {/* ============================================ */}
            {checkInModalType && React.createElement(window.GLRSApp.components.CheckInModals, {
                modalType: checkInModalType,
                userData: user,
                selectedChallenge: selectedChallenge,
                challengeCheckInStatus: challengeCheckInStatus,
                challengeCheckInNotes: challengeCheckInNotes,

                onClose: () => {
                    setCheckInModalType(null);
                    setSelectedChallenge(null);
                    setChallengeCheckInStatus('');
                    setChallengeCheckInNotes('');
                },

                onSubmitCheckIn: async (morningData) => {
                    try {
                        const db = window.firebase.firestore();
                        await db.collection('checkIns').add({
                            userId: user.uid,
                            type: 'morning',
                            mood: morningData.mood,
                            craving: morningData.craving,
                            sleepQuality: morningData.sleepQuality,
                            anxietyLevel: morningData.anxietyLevel,
                            notes: morningData.notes,
                            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp?.utils?.showNotification?.('Check-in submitted successfully!', 'success');
                        setCheckInModalType(null);

                        // Reload check-ins
                        if (typeof window.GLRSApp?.loaders?.loadCheckins === 'function') {
                            const updatedCheckins = await window.GLRSApp.loaders.loadCheckins(user.uid);
                            setCheckins(updatedCheckins);
                        }
                    } catch (error) {
                        console.error('Error submitting check-in:', error);
                        window.GLRSApp?.utils?.showNotification?.('Failed to submit check-in', 'error');
                    }
                },

                onSubmitReflection: async (eveningData) => {
                    try {
                        const db = window.firebase.firestore();
                        await db.collection('checkIns').add({
                            userId: user.uid,
                            gratitude: eveningData.gratitude,
                            challenges: eveningData.challenges,
                            tomorrowGoal: eveningData.tomorrowGoal,
                            overallDay: eveningData.overallDay,
                            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp?.utils?.showNotification?.('Reflection submitted successfully!', 'success');
                        setCheckInModalType(null);

                        // Reload reflections
                        if (typeof window.GLRSApp?.loaders?.loadReflections === 'function') {
                            const updatedReflections = await window.GLRSApp.loaders.loadReflections(user.uid);
                            setReflections(updatedReflections);
                        }
                    } catch (error) {
                        console.error('Error submitting reflection:', error);
                        window.GLRSApp?.utils?.showNotification?.('Failed to submit reflection', 'error');
                    }
                },

                onOpenAccountModal: () => {
                    setCheckInModalType(null);
                    // TODO: Open account/profile modal
                    console.log('Open account modal');
                },

                onUpdateChallengeStatus: (status) => {
                    setChallengeCheckInStatus(status);
                },

                onUpdateChallengeNotes: (notes) => {
                    setChallengeCheckInNotes(notes);
                },

                onSubmitChallenge: async () => {
                    if (!selectedChallenge || !challengeCheckInStatus || !challengeCheckInNotes.trim()) {
                        window.GLRSApp?.utils?.showNotification?.('Please complete all fields', 'error');
                        return;
                    }

                    try {
                        const db = window.firebase.firestore();
                        await db.collection('challengeCheckIns').add({
                            userId: user.uid,
                            challengeId: selectedChallenge.id,
                            challengeText: selectedChallenge.challengeText,
                            status: challengeCheckInStatus,
                            notes: challengeCheckInNotes,
                            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                        });

                        window.GLRSApp?.utils?.showNotification?.('Challenge check-in submitted!', 'success');
                        setCheckInModalType(null);
                        setSelectedChallenge(null);
                        setChallengeCheckInStatus('');
                        setChallengeCheckInNotes('');
                    } catch (error) {
                        console.error('Error submitting challenge check-in:', error);
                        window.GLRSApp?.utils?.showNotification?.('Failed to submit challenge check-in', 'error');
                    }
                }
            })}
        </>
    );
}

window.GLRSApp.components.TasksTab = TasksTab;
// ================================================================
// TASKS TAB MODALS - Extracted from ModalContainer.js
// Lines 8350-9909 (1,560 lines)
// Date: Current session
// ================================================================

// TasksTabModals Component
// Renders 9 pattern-related modals for Tasks tab functionality
function TasksTabModals({
    // Modal visibility props
    showMoodPatternModal,
    showCravingPatternModal,
    showAnxietyPatternModal,
    showSleepPatternModal,
    showTipsModal,
    showCopingTechniqueModal,
    showMilestoneModal,
    showPastReflectionsModal,
    showGratitudeModal,

    // Data props
    user,
    patternDetection,
    copingTechniques,
    reflectionData,
    reflectionFilter,
    selectedReflection,
    gratitudeThemes,
    gratitudeTheme,
    gratitudeText,
    nextMilestone,
    allMilestones,

    // Callback props
    onClose,
    onNavigate,
    onSetReflectionFilter,
    onSelectReflection,
    onSetGratitudeTheme,
    onSetGratitudeText,
    onSaveGratitude
}) {  // ✅ PHASE 3: Refactored to props-based modals
    // Local state for gratitude text (if not provided via props)
    const [localGratitudeText, setLocalGratitudeText] = useState('');
    const gratitudeTextValue = gratitudeText !== undefined ? gratitudeText : localGratitudeText;
    const setGratitudeTextValue = onSetGratitudeText || setLocalGratitudeText;

    return (
        <>
{/* Tasks Tab Modals */}
{/* 1. Mood Pattern Modal */}
{showMoodPatternModal && (
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
    onClick={() => { if (onClose) onClose('moodPattern'); }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
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
                        Mood Improvement Tips
                    </h3>
                    <button
                        onClick={() => { if (onClose) onClose('moodPattern'); }}
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

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Practice 5 minutes of deep breathing when you wake up',
                        'Get 15-30 minutes of sunlight exposure daily',
                        'Maintain a consistent sleep schedule',
                        'Limit caffeine intake after 2pm',
                        'Exercise for at least 20 minutes per day',
                        'Connect with a friend or family member',
                        'Write down three things you are grateful for'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        if (onClose) onClose('moodPattern');
                        if (onNavigate) onNavigate('guides');
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
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 2. Craving Pattern Modal */}
{showCravingPatternModal && (
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
    onClick={() => { if (onClose) onClose('cravingPattern'); }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
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
                        Craving Management Tips
                    </h3>
                    <button
                        onClick={() => { if (onClose) onClose('cravingPattern'); }}
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

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Use the 5-4-3-2-1 grounding technique when cravings hit',
                        'Call your sponsor or accountability partner immediately',
                        'Remove yourself from triggering environments',
                        'Engage in physical activity to redirect energy',
                        'Practice HALT: Check if you are Hungry, Angry, Lonely, or Tired',
                        'Keep a craving journal to identify patterns and triggers'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        if (onClose) onClose('cravingPattern');
                        if (onNavigate) onNavigate('guides');
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
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 3. Anxiety Pattern Modal */}
{showAnxietyPatternModal && (
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
    onClick={() => { if (onClose) onClose('anxietyPattern'); }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
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
                        Anxiety Reduction Tips
                    </h3>
                    <button
                        onClick={() => { if (onClose) onClose('anxietyPattern'); }}
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

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Practice box breathing: inhale 4 counts, hold 4, exhale 4, hold 4',
                        'Limit news and social media consumption',
                        'Establish a calming bedtime routine',
                        'Challenge anxious thoughts with evidence-based thinking',
                        'Engage in progressive muscle relaxation',
                        'Avoid excessive caffeine and sugar',
                        'Connect with nature through outdoor walks'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        if (onClose) onClose('anxietyPattern');
                        if (onNavigate) onNavigate('guides');
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
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 4. Sleep Pattern Modal */}
{showSleepPatternModal && (
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
    onClick={() => { if (onClose) onClose('sleepPattern'); }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
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
                        Sleep Quality Tips
                    </h3>
                    <button
                        onClick={() => { if (onClose) onClose('sleepPattern'); }}
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

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Maintain a consistent sleep schedule, even on weekends',
                        'Avoid screens 1 hour before bedtime',
                        'Keep your bedroom cool, dark, and quiet',
                        'Avoid large meals and alcohol before bed',
                        'Create a relaxing bedtime routine',
                        'Exercise regularly, but not within 3 hours of bedtime',
                        'Consider melatonin or magnesium supplements after consulting your doctor'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('light');
                        if (onClose) onClose('sleepPattern');
                        if (onNavigate) onNavigate('guides');
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
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 6. Coping Technique Modal */}
{showCopingTechniqueModal && (() => {
    const dayOfMonth = new Date().getDate();
    const technique = copingTechniques.find(t => t.day === dayOfMonth) || copingTechniques[0];

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
        onClick={() => { if (onClose) onClose('copingTechnique'); }}>
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
                            <i data-lucide={technique.icon} style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '400',
                                    color: '#000000'
                                }}>
                                    {technique.title}
                                </h3>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666',
                                    marginTop: '4px'
                                }}>
                                    {technique.category} • Day {technique.day}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => { if (onClose) onClose('copingTechnique'); }}
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
                    {/* Large Icon Display */}
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        marginBottom: '20px',
                        background: technique.category === 'Breathing' ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' :
                                    technique.category === 'Mindfulness' ? 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' :
                                    technique.category === 'Physical' ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' :
                                    technique.category === 'Cognitive' ? 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)' :
                                    'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
                        borderRadius: '12px'
                    }}>
                        <i data-lucide={technique.icon} style={{
                            width: '64px',
                            height: '64px',
                            color: technique.category === 'Breathing' ? '#1976D2' :
                                   technique.category === 'Mindfulness' ? '#7B1FA2' :
                                   technique.category === 'Physical' ? '#388E3C' :
                                   technique.category === 'Cognitive' ? '#F57F17' :
                                   '#E64A19',
                            marginBottom: '12px'
                        }}></i>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#666666',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {technique.category} Technique
                        </div>
                    </div>

                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000000',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i data-lucide="list-checks" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                        How to Practice
                    </h4>

                    {/* Description with proper line breaks and enhanced styling */}
                    <div style={{
                        background: '#F5F5F5',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px',
                        border: '1px solid #E0E0E0'
                    }}>
                        {technique.description.split('\n').map((line, index) => {
                            const isNumbered = /^\d+\./.test(line.trim());
                            const isBold = line.includes('Optimizes') || line.includes('Reduces') || line.includes('Improves');

                            return (
                                <div key={index} style={{
                                    fontSize: '14px',
                                    fontWeight: isBold ? 'bold' : '400',
                                    color: isBold ? '#058585' : '#000000',
                                    lineHeight: '1.6',
                                    marginBottom: line.trim() === '' ? '12px' : '6px',
                                    paddingLeft: isNumbered ? '0' : '0',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                }}>
                                    {isNumbered && <span style={{ color: '#058585', fontWeight: 'bold', minWidth: '20px' }}>{line.match(/^\d+\./)?.[0]}</span>}
                                    <span>{isNumbered ? line.replace(/^\d+\.\s*/, '') : (line.trim() || '\u00A0')}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Benefits Badge */}
                    <div style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i data-lucide="heart-pulse" style={{ width: '20px', height: '20px', color: '#2E7D32' }}></i>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#2E7D32'
                        }}>
                            Evidence-Based Technique
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            window.GLRSApp.utils.triggerHaptic('light');
                            if (onClose) onClose('copingTechnique');;
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
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
})()}

{/* 7. Milestone Modal */}
{showMilestoneModal && (
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
    onClick={() => { if (onClose) onClose('milestone'); }}>
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
                        <i data-lucide="trophy" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Recovery Milestones
                        </h3>
                    </div>
                    <button
                        onClick={() => { if (onClose) onClose('milestone'); }}
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
                {!user?.sobrietyDate ? (
                    /* No sobriety date set */
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <i data-lucide="calendar-x" style={{ width: '64px', height: '64px', color: '#058585', marginBottom: '20px' }}></i>
                        <h4 style={{ fontSize: '18px', fontWeight: '400', color: '#000000', marginBottom: '12px' }}>
                            Set Your Sobriety Date
                        </h4>
                        <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px', lineHeight: '1.6' }}>
                            To track your recovery milestones, please set your sobriety date in your profile settings.
                        </p>
                        <button
                            onClick={() => {
                                window.GLRSApp.utils.triggerHaptic('medium');
                                if (onClose) onClose('milestone');;
                                if (onNavigate) onNavigate('profile');;
                            }}
                            style={{
                                padding: '12px 24px',
                                background: '#058585',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: '400',
                                cursor: 'pointer'
                            }}
                        >
                            Go to Profile
                        </button>
                    </div>
                ) : allMilestones.length === 0 ? (
                    /* Milestones not loaded yet */
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <i data-lucide="loader" style={{ width: '48px', height: '48px', color: '#058585', marginBottom: '20px', animation: 'spin 1s linear infinite' }}></i>
                        <p style={{ fontSize: '14px', color: '#666666' }}>Loading milestones...</p>
                    </div>
                ) : (
                    /* Milestones loaded - show content */
                    <>
                        {nextMilestone && (
                            /* Progress Card */
                            <div style={{
                                background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px',
                                color: '#FFFFFF'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <i data-lucide={nextMilestone.icon} style={{ width: '32px', height: '32px' }}></i>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            {nextMilestone.achieved ?
                                                'All Milestones Complete!' :
                                                `Next: ${nextMilestone.label}`
                                            }
                                        </div>
                                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                            {nextMilestone.achieved ?
                                                `${nextMilestone.daysSober} days sober` :
                                                `${nextMilestone.daysUntil} ${nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go`
                                            }
                                        </div>
                                    </div>
                                </div>
                                {!nextMilestone.achieved && (
                                    <>
                                        {/* Progress Bar */}
                                        <div style={{
                                            background: 'rgba(255,255,255,0.3)',
                                            borderRadius: '10px',
                                            height: '8px',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                background: '#FFFFFF',
                                                height: '100%',
                                                width: `${nextMilestone.progressPercentage}%`,
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                        <div style={{ fontSize: '12px', textAlign: 'right', opacity: 0.9 }}>
                                            {nextMilestone.progressPercentage}% complete
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* All Milestones List */}
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '12px'
                        }}>
                            All Milestones
                        </h4>
                        <div style={{ marginBottom: '20px' }}>
                            {allMilestones.map((milestone, index) => (
                                <div key={index} style={{
                                    background: milestone.achieved ? '#E8F5E9' : '#F5F5F5',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    border: milestone.achieved ? '1px solid #4CAF50' : '1px solid #E0E0E0'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: milestone.achieved ?
                                            'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' :
                                            '#E0E0E0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <i data-lucide={milestone.achieved ? 'check' : milestone.icon}
                                           style={{
                                               width: '20px',
                                               height: '20px',
                                               color: milestone.achieved ? '#FFFFFF' : '#999999'
                                           }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            color: '#000000',
                                            marginBottom: '2px'
                                        }}>
                                            {milestone.label} ({milestone.days} days)
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '400',
                                            color: '#666666'
                                        }}>
                                            {milestone.achieved ?
                                                `Achieved on ${milestone.dateString}` :
                                                `Target: ${milestone.dateString}`
                                            }
                                        </div>
                                    </div>
                                    {milestone.achieved && (
                                        <div style={{
                                            fontSize: '20px'
                                        }}>
                                            🎉
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                window.GLRSApp.utils.triggerHaptic('light');
                                if (onClose) onClose('milestone');;
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
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
)}

{/* 8. Past Reflections Modal */}
{showPastReflectionsModal && (() => {
    // Filter reflections based on selected filter
    const getFilteredReflections = () => {
        if (reflectionFilter === 'all') {
            return allReflections;
        } else if (reflectionFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return allReflections.filter(r => {
                const reflectionDate = r.date || new Date(r.createdAt);
                return reflectionDate >= weekAgo;
            });
        } else if (reflectionFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            return allReflections.filter(r => {
                const reflectionDate = r.date || new Date(r.createdAt);
                return reflectionDate >= monthAgo;
            });
        }
        return allReflections;
    };

    const filteredReflections = getFilteredReflections();

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
            if (onClose) onClose('pastReflections');;
            if (onSelectReflection) onSelectReflection(null);;
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
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
                            <i data-lucide="book-open" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Past Reflections
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                if (onClose) onClose('pastReflections');;
                                if (onSelectReflection) onSelectReflection(null);;
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

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px'
                    }}>
                        {['all', 'week', 'month'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    if (onSetReflectionFilter) onSetReflectionFilter(filter);;
                                    if (onSelectReflection) onSelectReflection(null);;
                                }}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: reflectionFilter === filter ? '#058585' : '#F5F5F5',
                                    color: reflectionFilter === filter ? '#FFFFFF' : '#666666',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
                    {filteredReflections.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999999'
                        }}>
                            <i data-lucide="book-open" style={{ width: '48px', height: '48px', color: '#E0E0E0', marginBottom: '12px' }}></i>
                            <div style={{ fontSize: '14px', fontWeight: '400' }}>
                                No reflections found
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredReflections.map((reflection, index) => {
                                const reflectionDate = reflection.date instanceof Date ?
                                    reflection.date : new Date(reflection.date || reflection.createdAt);
                                const isExpanded = selectedReflection?.id === reflection.id;

                                return (
                                    <div key={reflection.id || index} style={{
                                        background: '#F8F9FA',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: isExpanded ? '2px solid #058585' : '1px solid #E5E5E5',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                        if (onSelectReflection) onSelectReflection(isExpanded ? null : reflection);;
                                    }}>
                                        {/* Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: isExpanded ? '16px' : '0'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#000000',
                                                    marginBottom: '4px'
                                                }}>
                                                    {reflectionDate.toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                {reflection.overallDay && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '400',
                                                        color: '#666666'
                                                    }}>
                                                        Daily Score: {reflection.overallDay}/10
                                                    </div>
                                                )}
                                            </div>
                                            <i data-lucide={isExpanded ? 'chevron-up' : 'chevron-down'}
                                               style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px'
                                            }}>
                                                {/* Prompt Response */}
                                                {reflection.promptResponse && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Prompt Response
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.promptResponse}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Challenges */}
                                                {reflection.challenges && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Challenges
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.challenges}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Gratitude */}
                                                {reflection.gratitude && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Gratitude
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.gratitude}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tomorrow's Goal */}
                                                {reflection.tomorrowGoal && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Tomorrow's Goal
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.tomorrowGoal}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
})()}

{/* 9. Quick Gratitude Modal */}
{showGratitudeModal && (
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
        if (onClose) onClose('gratitude');;
        if (onSetGratitudeTheme) onSetGratitudeTheme('');;
        if (onSetGratitudeText) onSetGratitudeText('');
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '85vh',
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
                        <i data-lucide="heart" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Gratitude Entry
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            if (onClose) onClose('gratitude');;
                            if (onSetGratitudeTheme) onSetGratitudeTheme('');;
                            setGratitudeText('');
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
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Theme Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#000000',
                        marginBottom: '12px'
                    }}>
                        Select a Theme
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '8px'
                    }}>
                        {gratitudeThemes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                    if (onSetGratitudeTheme) onSetGratitudeTheme(theme.id);;
                                }}
                                style={{
                                    padding: '12px',
                                    background: gratitudeTheme === theme.id ? theme.color : '#F5F5F5',
                                    color: gratitudeTheme === theme.id ? '#FFFFFF' : '#000000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i data-lucide={theme.icon}
                                   style={{
                                       width: '20px',
                                       height: '20px',
                                       color: gratitudeTheme === theme.id ? '#FFFFFF' : theme.color
                                   }}></i>
                                <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
                                    {theme.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gratitude Text */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#000000',
                        marginBottom: '8px'
                    }}>
                        What are you grateful for?
                    </h4>
                    <textarea
                        value={gratitudeTextValue}
                        onChange={(e) => setGratitudeTextValue(e.target.value)}
                        placeholder="Express your gratitude..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            border: '1px solid #E5E5E5',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={() => {
                        window.GLRSApp.utils.triggerHaptic('medium');
                        if (onSaveGratitude) onSaveGratitude();;
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
                    Save Gratitude
                </button>
            </div>
        </div>
    </div>
)}
        </>
    );
}

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.TasksTabModals = TasksTabModals;

// ✅ PHASE 3: Refactored to props-based modals - All 9 modals converted
console.log('✅ PHASE 3: TasksTabModals refactored - Props-based pattern, no global state dependencies');

// ================================================================
// TASKS SIDEBAR MODALS - DELETED (Converted to Inline Pattern)
// Original External Component: Lines 7273-10344 (3,072 lines) - REMOVED
// Replaced with Inline Modals: Lines 2950-5804 (2,855 lines)
// Date: November 14, 2025 - Step 1.17 Complete
// All 16 modals now rendered inline within TasksTab component
// State: 17 boolean hooks → 2 hooks (showSidebar + activeModal)
// ================================================================

// CheckInModals.js - Check-in and reflection modals
// ✅ PHASE 6D: Extracted from ModalContainer.js (4 modals)
// 3-Layer Architecture: Component → Firebase → Component

function CheckInModals({ modalType, userData, selectedChallenge, challengeCheckInStatus, challengeCheckInNotes, onClose, onSubmitCheckIn, onSubmitReflection, onOpenAccountModal, onUpdateChallengeStatus, onUpdateChallengeNotes, onSubmitChallenge }) {
    const renderModalContent = () => {
        switch(modalType) {
            case 'checkIn':
                return <CheckInModal onClose={onClose} onSubmit={onSubmitCheckIn} />;
            case 'reflection':
                return <ReflectionModal onClose={onClose} onSubmit={onSubmitReflection} />;
            case 'profilePrompt':
                return <ProfilePromptModal onClose={onClose} onOpenAccount={onOpenAccountModal} />;
            case 'challengeCheckIn':
                return <ChallengeCheckInModal
                    selectedChallenge={selectedChallenge}
                    status={challengeCheckInStatus}
                    notes={challengeCheckInNotes}
                    onClose={onClose}
                    onUpdateStatus={onUpdateChallengeStatus}
                    onUpdateNotes={onUpdateChallengeNotes}
                    onSubmit={onSubmitChallenge}
                />;
            default:
                return null;
        }
    };
    return renderModalContent();
}

// ═══════════════════════════════════════════════════════
// CHECK-IN MODAL - Morning check-in form
// ═══════════════════════════════════════════════════════
function CheckInModal({ onClose, onSubmit }) {
    const [morningData, setMorningData] = React.useState({
        mood: 5,
        craving: 0,
        sleepQuality: 5,
        anxietyLevel: 0,
        notes: ''
    });

    const handleSubmit = async () => {
        await onSubmit(morningData);
        onClose();
    };

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Morning Check-in</h3>
            <div className="slider-group">
                <div className="slider-label">
                    <span>Overall Mood</span>
                    <span className="slider-value">{morningData.mood}</span>
                </div>
                <input
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.mood}
                    onChange={(e) => setMorningData({...morningData, mood: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Worst)</span>
                    <span>5 (Neutral)</span>
                    <span>10 (Best)</span>
                </div>
            </div>

            <div className="slider-group">
                <div className="slider-label">
                    <span>Craving Intensity</span>
                    <span className="slider-value">{morningData.craving}</span>
                </div>
                <input
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.craving}
                    onChange={(e) => setMorningData({...morningData, craving: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (None)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Intense)</span>
                </div>
            </div>

            <div className="slider-group">
                <div className="slider-label">
                    <span>Sleep Quality</span>
                    <span className="slider-value">{morningData.sleepQuality}</span>
                </div>
                <input
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.sleepQuality}
                    onChange={(e) => setMorningData({...morningData, sleepQuality: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Terrible)</span>
                    <span>5 (Fair)</span>
                    <span>10 (Excellent)</span>
                </div>
            </div>

            <div className="slider-group">
                <div className="slider-label">
                    <span>Anxiety Level</span>
                    <span className="slider-value">{morningData.anxietyLevel}</span>
                </div>
                <input
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.anxietyLevel}
                    onChange={(e) => setMorningData({...morningData, anxietyLevel: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Calm)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Severe)</span>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                    className="textarea"
                    placeholder="Any thoughts or feelings you'd like to share?"
                    value={morningData.notes}
                    onChange={(e) => setMorningData({...morningData, notes: e.target.value})}
                />
            </div>

            <button
                className="btn-primary"
                onClick={handleSubmit}
            >
                Submit Check-in
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// REFLECTION MODAL - Evening reflection form
// ═══════════════════════════════════════════════════════
function ReflectionModal({ onClose, onSubmit }) {
    const [eveningData, setEveningData] = React.useState({
        gratitude: '',
        challenges: '',
        tomorrowGoal: '',
        overallDay: 5
    });

    const handleSubmit = async () => {
        await onSubmit(eveningData);
        onClose();
    };

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Evening Reflection</h3>
            <div className="form-group">
                <label className="form-label">What are you grateful for today?</label>
                <textarea
                    className="textarea"
                    placeholder="List 3 things you're grateful for..."
                    value={eveningData.gratitude}
                    onChange={(e) => setEveningData({...eveningData, gratitude: e.target.value})}
                />
            </div>

            <div className="form-group">
                <label className="form-label">What challenges did you face?</label>
                <textarea
                    className="textarea"
                    placeholder="Describe any difficulties..."
                    value={eveningData.challenges}
                    onChange={(e) => setEveningData({...eveningData, challenges: e.target.value})}
                />
            </div>

            <div className="form-group">
                <label className="form-label">What's one goal for tomorrow?</label>
                <textarea
                    className="textarea"
                    placeholder="Set an intention..."
                    value={eveningData.tomorrowGoal}
                    onChange={(e) => setEveningData({...eveningData, tomorrowGoal: e.target.value})}
                />
            </div>

            <div className="slider-group">
                <div className="slider-label">
                    <span>Overall Day Rating</span>
                    <span className="slider-value">{eveningData.overallDay}</span>
                </div>
                <input
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={eveningData.overallDay}
                    onChange={(e) => setEveningData({...eveningData, overallDay: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Terrible)</span>
                    <span>5 (OK)</span>
                    <span>10 (Excellent)</span>
                </div>
            </div>

            <button
                className="btn-primary"
                onClick={handleSubmit}
            >
                Submit Reflection
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// PROFILE PROMPT MODAL - Reflection prompt selector
// ═══════════════════════════════════════════════════════
function ProfilePromptModal({ onClose, onOpenAccount }) {
    const handleCompleteProfile = () => {
        onClose();
        setTimeout(() => onOpenAccount(), 100);
    };

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Complete Your Profile</h3>
            <p style={{marginBottom: '20px', opacity: 0.9}}>
                Help us personalize your recovery journey by completing your profile.
            </p>
            <button
                className="btn-primary"
                onClick={handleCompleteProfile}
            >
                Complete Profile
            </button>
            <button
                style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '10px',
                    width: '100%',
                    marginTop: '10px',
                    cursor: 'pointer'
                }}
                onClick={onClose}
            >
                Remind Me Later
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// CHALLENGE CHECK-IN MODAL - Challenge check-in form
// ═══════════════════════════════════════════════════════
function ChallengeCheckInModal({ selectedChallenge, status, notes, onClose, onUpdateStatus, onUpdateNotes, onSubmit }) {
    if (!selectedChallenge) return null;

    const handleClose = () => {
        window.GLRSApp.utils.triggerHaptic('light');
        onClose();
    };

    const handleStatusChange = (statusValue) => {
        window.GLRSApp.utils.triggerHaptic('light');
        onUpdateStatus(statusValue);
    };

    const handleSubmit = () => {
        window.GLRSApp.utils.triggerHaptic('medium');
        onSubmit();
    };

    const statusOptions = [
        { value: 'resolved', label: 'Resolved', color: '#00A86B', desc: 'I overcame this challenge!' },
        { value: 'better', label: 'Getting Better', color: '#4CAF50', desc: 'Making progress' },
        { value: 'same', label: 'About the Same', color: '#FFA500', desc: 'No change yet' },
        { value: 'worse', label: 'Gotten Worse', color: '#FF6B6B', desc: 'Struggling more' },
        { value: 'help', label: 'Need Help', color: '#DC143C', desc: 'I need support' }
    ];

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
        onClick={handleClose}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '500px',
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
                        Challenge Check-In
                    </h3>
                    <button
                        onClick={handleClose}
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
                    {/* Challenge Text */}
                    <div style={{
                        padding: '16px',
                        background: '#FFF3CD',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: '1px solid #FFA500'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#856404',
                            marginBottom: '8px'
                        }}>
                            Your Challenge:
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#333333',
                            lineHeight: '1.6'
                        }}>
                            {selectedChallenge.challengeText}
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333333',
                            marginBottom: '12px'
                        }}>
                            How are things going? *
                        </label>

                        <div style={{
                            display: 'grid',
                            gap: '10px'
                        }}>
                            {statusOptions.map(statusOption => (
                                <button
                                    key={statusOption.value}
                                    onClick={() => handleStatusChange(statusOption.value)}
                                    style={{
                                        padding: '14px',
                                        background: status === statusOption.value ? statusOption.color : '#FFFFFF',
                                        border: `2px solid ${statusOption.color}`,
                                        borderRadius: '12px',
                                        color: status === statusOption.value ? '#FFFFFF' : statusOption.color,
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
                                        <div>{statusOption.label}</div>
                                        <div style={{
                                            fontSize: '11px',
                                            opacity: status === statusOption.value ? 0.9 : 0.7,
                                            marginTop: '2px'
                                        }}>
                                            {statusOption.desc}
                                        </div>
                                    </div>
                                    {status === statusOption.value && (
                                        <div style={{ fontSize: '18px' }}>●</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333333',
                            marginBottom: '8px'
                        }}>
                            Notes about your progress *
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => onUpdateNotes(e.target.value)}
                            placeholder={
                                status === 'resolved' ? 'What helped you overcome this challenge?' :
                                status === 'better' ? 'What strategies are working for you?' :
                                status === 'worse' ? 'What is making this harder right now?' :
                                status === 'help' ? 'What kind of support do you need?' :
                                'Share your thoughts on how you are handling this challenge...'
                            }
                            style={{
                                width: '100%',
                                minHeight: '100px',
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
                        onClick={handleSubmit}
                        disabled={!status || !notes.trim()}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: status && notes.trim() ? '#058585' : '#CCCCCC',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: status && notes.trim() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                        }}
                    >
                        {status === 'resolved' ? '🎉 Mark as Resolved' : '✅ Save Check-In'}
                    </button>

                    {/* Cancel Button */}
                    <button
                        onClick={handleClose}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: 'transparent',
                            border: 'none',
                            color: '#666666',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Register globally
window.GLRSApp.components.CheckInModals = CheckInModals;
console.log('✅ CheckInModals.js loaded - 4 modals (3-layer architecture)');
  // Goals and Tasks View Component with Popup Details and Reflections - UPDATED
// ✅ PHASE 7: Refactored to true 3-layer architecture (receives all data via props)
function GoalsTasksView({ user, goals = [], assignments = [], objectives = [], onDueTodayChange }) {
    const [expandedGoals, setExpandedGoals] = useState({});
    const [expandedObjectives, setExpandedObjectives] = useState({});
    const [expandedAssignments, setExpandedAssignments] = useState({});
    const [reflections, setReflections] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showReflectionForm, setShowReflectionForm] = useState(false);
    const [currentReflection, setCurrentReflection] = useState('');
    const [pastIntentions, setPastIntentions] = useState([]);

    // ✅ PHASE 7: Objectives now received via props, no loading needed

    // Reinitialize Lucide icons when modals open
    useEffect(() => {
        if (showModal || showReflectionForm) {
            setTimeout(() => {
                if (typeof lucide !== 'undefined' && lucide.createIcons) {
                    lucide.createIcons();
                }
            }, 100);
        }
    }, [showModal, showReflectionForm]);

    // Reinitialize icons when goals or objectives change
    useEffect(() => {
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }, 100);
    }, [goals, objectives, expandedGoals, expandedObjectives, pastIntentions]);

    // ✅ PHASE 7: loadObjectives function removed - parent handles data loading
    
    const toggleGoal = (goalId) => {
        setExpandedGoals(prev => ({
            ...prev,
            [goalId]: !prev[goalId]
        }));
    };

    const toggleObjective = (objectiveId) => {
        setExpandedObjectives(prev => ({
            ...prev,
            [objectiveId]: !prev[objectiveId]
        }));
    };
    
    const openItemModal = (item, type) => {
        setSelectedItem({ ...item, type });
        setShowModal(true);
        setShowReflectionForm(false);
        setCurrentReflection('');
    };
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setShowReflectionForm(false);
        setCurrentReflection('');
    };
    
    const calculateGoalProgress = (goalId) => {
        const goalAssignments = assignments.filter(a => a.goalId === goalId);
        if (goalAssignments.length === 0) return 0;
        
        const completed = goalAssignments.filter(a => a.status === 'completed').length;
        return Math.round((completed / goalAssignments.length) * 100);
    };
    
    const formatDate = (date) => {
        if (!date) return 'Not set';
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    const getDueDateStatus = (date, isCompleted) => {
        if (isCompleted) return { text: 'Completed', color: '#4CAF50' };
        if (!date) return { text: 'No due date', color: 'rgba(255,255,255,0.5)' };
        
        const dueDate = date.toDate ? date.toDate() : new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: 'Overdue', color: '#ff453a' };
        if (diffDays === 0) return { text: 'Due Today', color: '#ff9500' };
        if (diffDays === 1) return { text: 'Due Tomorrow', color: '#ff9500' };
        if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: '#ffd60a' };
        return { text: formatDate(date), color: 'rgba(255,255,255,0.7)' };
    };
    
    const makeLinksClickable = (text) => {
        if (!text) return null;
        
        // Regex to detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        
        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a 
                        key={index}
                        href={part} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            color: '#4fc3f7',
                            textDecoration: 'underline'
                        }}
                    >
                        {part}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };
    
    // Modal Component with Reflection Support
    const ItemModal = () => {
        if (!selectedItem || !showModal) return null;
        
        const isCompleted = selectedItem.status === 'completed';
        const typeColors = {
            objective: 'linear-gradient(135deg, #058585 0%, #046B6B 100%)',
            assignment: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)'
        };
        
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px'
            }}>
                <div style={{
                    background: '#1a1a1a',
                    borderRadius: '15px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: typeColors[selectedItem.type]
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    color: 'white'
                                }}>
                                    {selectedItem.type.toUpperCase()}
                                </span>
                                {isCompleted && (
                                    <i data-lucide="check-circle" style={{
                                        width: '18px',
                                        height: '18px',
                                        color: 'white'
                                    }}></i>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <h3 style={{
                            color: 'white',
                            margin: '10px 0 0 0',
                            fontSize: '20px',
                            textDecoration: isCompleted ? 'line-through' : 'none'
                        }}>
                            {selectedItem.title}
                        </h3>
                    </div>
                    
                    {/* Body */}
                    <div style={{ padding: '20px' }}>
                        {/* Description */}
                        {selectedItem.description && (
                            <div style={{
                                marginBottom: '20px'
                            }}>
                                <h4 style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '12px',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Description
                                </h4>
                                <div style={{
                                    color: 'white',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}>
                                    {makeLinksClickable(selectedItem.description)}
                                </div>
                            </div>
                        )}
                        
                        {/* Dates */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '13px'
                            }}>
                                <i data-lucide="calendar" style={{width: '14px', height: '14px'}}></i>
                                <span>Created:</span>
                                <span style={{ color: 'white' }}>
                                    {formatDate(selectedItem.createdAt)}
                                </span>
                            </div>
                            
                            {selectedItem.dueDate && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '13px'
                                }}>
                                    <i data-lucide="clock" style={{width: '14px', height: '14px'}}></i>
                                    <span>Due:</span>
                                    <span style={{
                                        color: getDueDateStatus(selectedItem.dueDate, isCompleted).color === '#4CAF50' ? '#0077CC' : getDueDateStatus(selectedItem.dueDate, isCompleted).color
                                    }}>
                                        {formatDate(selectedItem.dueDate)}
                                    </span>
                                </div>
                            )}

                            {selectedItem.completedAt && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#0077CC',
                                    fontSize: '13px'
                                }}>
                                    <i data-lucide="check-circle" style={{width: '14px', height: '14px'}}></i>
                                    <span>Completed:</span>
                                    <span>{formatDate(selectedItem.completedAt)}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Status */}
                        <div style={{
                            padding: '10px',
                            background: isCompleted ?
                                'rgba(0,119,204,0.1)' :
                                'rgba(255,152,0,0.1)',
                            borderRadius: '8px',
                            border: `1px solid ${isCompleted ?
                                'rgba(0,119,204,0.3)' :
                                'rgba(255,152,0,0.3)'}`,
                            marginBottom: '20px'
                        }}>
                            <span style={{
                                color: isCompleted ? '#0077CC' : '#ff9800',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                Status: {isCompleted ? 'Completed' : 'Active'}
                            </span>
                        </div>

                        {/* Existing Reflection */}
                        {selectedItem.reflection && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                background: 'rgba(0,119,204,0.1)',
                                borderRadius: '8px',
                                borderLeft: '3px solid #0077CC'
                            }}>
                                <h4 style={{
                                    color: '#0077CC',
                                    fontSize: '12px',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Your Reflection
                                </h4>
                                <p style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: '13px',
                                    margin: 0,
                                    lineHeight: '1.6'
                                }}>
                                    {selectedItem.reflection}
                                </p>
                            </div>
                        )}
                        
                        {/* Reflection Form for Incomplete Assignments */}
                        {selectedItem.type === 'assignment' && !isCompleted && showReflectionForm && (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <label style={{
                                    color: 'white',
                                    fontSize: '14px',
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '500'
                                }}>
                                    Add your reflection:
                                </label>
                                <textarea 
                                    value={currentReflection}
                                    onChange={(e) => setCurrentReflection(e.target.value)}
                                    placeholder="What did you learn? How did this help your recovery?"
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '10px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '6px',
                                        color: 'white',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                    autoFocus
                                />
                                <div style={{
                                    marginTop: '12px',
                                    display: 'flex',
                                    gap: '10px'
                                }}>
                                    <button
                                        onClick={() => {
                                            window.GLRSApp.handlers.handleReflectionSave(selectedItem.id, currentReflection);
                                            closeModal();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Submit Reflection & Complete
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowReflectionForm(false);
                                            setCurrentReflection('');
                                        }}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Action buttons for assignments */}
                        {selectedItem.type === 'assignment' && !isCompleted && (
                            <div style={{
                                marginTop: '20px',
                                display: 'flex',
                                gap: '10px'
                            }}>
                                {!showReflectionForm && (
                                    <>
                                        <button
                                            onClick={() => setShowReflectionForm(true)}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Complete with Reflection
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.GLRSApp.handlers.handleAssignmentComplete(selectedItem.id, true);
                                                closeModal();
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Mark Complete Only
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    if (goals.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.6)',
                padding: '40px'
            }}>
                <div style={{marginBottom: 'var(--space-4)'}}>
                    <i data-lucide="target" style={{width: '48px', height: '48px', color: 'var(--color-primary)'}}></i>
                </div>
                <p>No goals assigned yet.</p>
                <p style={{fontSize: '14px', marginTop: '10px'}}>
                    Your coach will create goals for your recovery journey.
                </p>
            </div>
        );
    }
    
    // Calculate summary stats
    const activeGoals = goals.filter(g => g.status !== 'completed').length;
    const activeObjectives = objectives.filter(o => o.status !== 'completed').length;
    const activeAssignments = assignments.filter(a => a.status !== 'completed').length;
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Separate active and completed goals
    const activeGoalsData = goals.filter(g => g.status !== 'completed');
    const completedGoalsData = goals.filter(g => g.status === 'completed');

    // Calculate assignments due today
    const calculateDueToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let count = 0;

        // TODO: Add check-ins and reflections when user data is passed
        // For now, count only assignments and objectives

        // Count assignments due today
        const assignmentsDueToday = assignments.filter(a => {
            if (a.status === 'completed') return false;
            if (!a.dueDate) return false;
            const dueDate = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        }).length;

        count += assignmentsDueToday;

        // Count objectives due today
        const objectivesDueToday = objectives.filter(o => {
            if (o.status === 'completed') return false;
            if (!o.dueDate) return false;
            const dueDate = o.dueDate.toDate ? o.dueDate.toDate() : new Date(o.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        }).length;

        count += objectivesDueToday;

        return count;
    };

    const dueToday = calculateDueToday();

    // Update parent component with due today count
    useEffect(() => {
        if (onDueTodayChange) {
            onDueTodayChange(dueToday);
        }
    }, [dueToday, onDueTodayChange]);

    return (
        <>
        <div style={{padding: '0 20px', paddingBottom: '12px'}}>
                <h2 style={{
                    color: '#000000',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: '16px 0 12px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <i data-lucide="target" style={{width: '20px', height: '20px', color: '#0077CC'}}></i>
                    Active Goals ({activeGoalsData.length})
                </h2>

                {activeGoalsData.length === 0 ? (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        border: '2px dashed #0077CC'
                    }}>
                        <i data-lucide="target" style={{
                            width: '56px',
                            height: '56px',
                            color: '#0077CC',
                            marginBottom: '16px'
                        }}></i>
                        <h3 style={{
                            color: '#000000',
                            fontSize: '16px',
                            fontWeight: '600',
                            margin: '0 0 8px 0'
                        }}>
                            Your Goal Journey Awaits
                        </h3>
                        <p style={{
                            color: '#666666',
                            fontSize: '14px',
                            margin: '0 0 16px 0',
                            lineHeight: '1.5'
                        }}>
                            Your coach will create personalized goals tailored to your recovery journey. Check back soon to see your customized roadmap to success.
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#0077CC',
                            fontSize: '13px',
                            fontWeight: '500'
                        }}>
                            <i data-lucide="sparkles" style={{
                                width: '16px',
                                height: '16px'
                            }}></i>
                            <span>Goals will appear here once assigned</span>
                        </div>
                    </div>
                ) : (
                    activeGoalsData.map(goal => {
                        const goalObjectives = objectives.filter(o => o.goalId === goal.id);
                        const goalProgress = calculateGoalProgress(goal.id);
                        const isExpanded = expandedGoals[goal.id];
                        const isGoalCompleted = goal.status === 'completed';
                        const dueDateStatus = getDueDateStatus(goal.dueDate, isGoalCompleted);

                        return (
                        <div key={goal.id} style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            borderLeft: `3px solid ${isGoalCompleted ? '#0077CC' : '#0077CC'}`
                        }}>
                            {/* Goal Header */}
                            <div
                                onClick={() => toggleGoal(goal.id)}
                                style={{
                                    padding: '16px',
                                    cursor: 'pointer',
                                    borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.08)' : 'none'
                                }}
                            >
                                {/* Type Label and Title */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <i data-lucide="chevron-right" style={{
                                        width: '20px',
                                        height: '20px',
                                        color: '#666666',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}></i>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '6px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span style={{
                                                background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                color: '#FFFFFF'
                                            }}>
                                                GOAL
                                            </span>
                                            {isGoalCompleted && (
                                                <i data-lucide="check-circle" style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    color: '#0077CC'
                                                }}></i>
                                            )}
                                        </div>
                                        <h3 style={{
                                            color: '#000000',
                                            margin: 0,
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            textDecoration: isGoalCompleted ? 'line-through' : 'none',
                                            opacity: isGoalCompleted ? 0.6 : 1
                                        }}>
                                            {goal.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Goal Description */}
                                {goal.description && (
                                    <div style={{
                                        color: '#666666',
                                        fontSize: '13px',
                                        marginBottom: '12px',
                                        paddingLeft: '32px',
                                        lineHeight: '1.5'
                                    }}>
                                        {makeLinksClickable(goal.description)}
                                    </div>
                                )}

                                {/* Date Information */}
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    marginBottom: '12px',
                                    paddingLeft: '32px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        color: '#999999',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <i data-lucide="calendar" style={{width: '12px', height: '12px'}}></i>
                                        {formatDate(goal.createdAt)}
                                    </span>
                                    {goal.dueDate && (
                                        <span style={{
                                            color: dueDateStatus.color === '#4CAF50' ? '#0077CC' : dueDateStatus.color,
                                            fontSize: '11px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontWeight: '500'
                                        }}>
                                            <i data-lucide="clock" style={{width: '12px', height: '12px'}}></i>
                                            {dueDateStatus.text}
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div style={{
                                    paddingLeft: '32px'
                                }}>
                                    <div style={{
                                        background: '#E9ECEF',
                                        borderRadius: '4px',
                                        height: '6px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(90deg, #0077CC 0%, #005A9C 100%)',
                                            width: `${goalProgress}%`,
                                            height: '100%',
                                            transition: 'width 0.3s ease'
                                        }}/>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '6px'
                                    }}>
                                        <span style={{
                                            color: '#666666',
                                            fontSize: '11px',
                                            fontWeight: '500'
                                        }}>
                                            {goalProgress}% Complete
                                        </span>
                                        <span style={{
                                            color: '#999999',
                                            fontSize: '11px'
                                        }}>
                                            {goalObjectives.length} Objectives • {assignments.filter(a => a.goalId === goal.id).length} Tasks
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Objectives and Assignments */}
                            {isExpanded && (
                                <div style={{padding: '0 16px 16px 16px'}}>
                                    {goalObjectives.length === 0 ? (
                                        <p style={{
                                            color: '#999999',
                                            fontSize: '13px',
                                            paddingLeft: '32px',
                                            margin: '12px 0'
                                        }}>
                                            No objectives created yet.
                                        </p>
                                    ) : (
                                        goalObjectives.map(objective => {
                                            const objectiveAssignments = assignments.filter(a => a.objectiveId === objective.id);
                                            const isObjectiveCompleted = objective.status === 'completed';
                                            const isObjectiveExpanded = expandedObjectives[objective.id];

                                            return (
                                                <div key={objective.id} style={{
                                                    marginTop: '12px',
                                                    marginLeft: '20px',
                                                    paddingLeft: '16px',
                                                    borderLeft: '2px solid #058585'
                                                }}>
                                                    {/* Objective - Accordion Header */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleObjective(objective.id);
                                                        }}
                                                        style={{
                                                            background: '#F8F9FA',
                                                            borderRadius: '8px',
                                                            padding: '12px',
                                                            marginBottom: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                            border: '1px solid #E9ECEF'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#E9ECEF';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#F8F9FA';
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            <i data-lucide="chevron-right" style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                color: '#666666',
                                                                transform: isObjectiveExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.3s ease',
                                                                flexShrink: 0
                                                            }}></i>
                                                            <span style={{
                                                                background: 'linear-gradient(135deg, #058585 0%, #046B6B 100%)',
                                                                padding: '2px 6px',
                                                                borderRadius: '3px',
                                                                fontSize: '9px',
                                                                fontWeight: 'bold',
                                                                color: '#FFFFFF',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                OBJECTIVE
                                                            </span>
                                                            {isObjectiveCompleted && (
                                                                <i data-lucide="check-circle" style={{
                                                                    width: '14px',
                                                                    height: '14px',
                                                                    color: '#058585'
                                                                }}></i>
                                                            )}
                                                            <span style={{
                                                                color: '#000000',
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                textDecoration: isObjectiveCompleted ? 'line-through' : 'none',
                                                                opacity: isObjectiveCompleted ? 0.6 : 1,
                                                                flex: 1
                                                            }}>
                                                                {objective.title}
                                                            </span>
                                                            <span style={{
                                                                color: '#999999',
                                                                fontSize: '11px'
                                                            }}>
                                                                {objectiveAssignments.length} tasks
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Assignments under this objective - Only shown when expanded */}
                                                    {isObjectiveExpanded && objectiveAssignments.map(assignment => {
                                                        const isAssignmentCompleted = assignment.status === 'completed';

                                                        return (
                                                            <div key={assignment.id} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                marginLeft: '20px',
                                                                marginBottom: '8px',
                                                                paddingLeft: '16px',
                                                                borderLeft: '1px solid #CED4DA'
                                                            }}>
                                                                {/* Checkbox for completion - One-way only */}
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isAssignmentCompleted}
                                                                    disabled={isAssignmentCompleted}
                                                                    onChange={(e) => {
                                                                        if (!isAssignmentCompleted && e.target.checked) {
                                                                            window.GLRSApp.handlers.handleAssignmentComplete(assignment.id, true);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        cursor: isAssignmentCompleted ? 'not-allowed' : 'pointer',
                                                                        accentColor: '#00A86B',
                                                                        flexShrink: 0
                                                                    }}
                                                                />

                                                                {/* Assignment - Clickable */}
                                                                <div
                                                                    onClick={() => openItemModal(assignment, 'assignment')}
                                                                    style={{
                                                                        flex: 1,
                                                                        background: '#FFFFFF',
                                                                        borderRadius: '6px',
                                                                        padding: '10px',
                                                                        border: '1px solid #E9ECEF',
                                                                        cursor: 'pointer',
                                                                        transition: 'background 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#F8F9FA';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = '#FFFFFF';
                                                                    }}
                                                                >
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px'
                                                                    }}>
                                                                        <span style={{
                                                                            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '3px',
                                                                            fontSize: '8px',
                                                                            fontWeight: 'bold',
                                                                            color: '#FFFFFF',
                                                                            letterSpacing: '0.5px'
                                                                        }}>
                                                                            TASK
                                                                        </span>
                                                                        {isAssignmentCompleted && (
                                                                            <i data-lucide="check-circle" style={{
                                                                                width: '12px',
                                                                                height: '12px',
                                                                                color: '#00A86B'
                                                                            }}></i>
                                                                        )}
                                                                        <span style={{
                                                                            color: '#000000',
                                                                            fontSize: '12px',
                                                                            textDecoration: isAssignmentCompleted ? 'line-through' : 'none',
                                                                            opacity: isAssignmentCompleted ? 0.5 : 1,
                                                                            flex: 1
                                                                        }}>
                                                                            {assignment.title}
                                                                        </span>
                                                                        <i data-lucide="arrow-right" style={{
                                                                            width: '12px',
                                                                            height: '12px',
                                                                            color: '#CCCCCC'
                                                                        }}></i>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                        );
                    })
                )}
            </div>

            {completedGoalsData.length > 0 && (
                <div style={{padding: '0 20px', paddingBottom: '20px'}}>
                    <h2 style={{
                        color: '#000000',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        margin: '16px 0 12px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i data-lucide="check-circle" style={{width: '20px', height: '20px', color: '#0077CC'}}></i>
                        Completed Goals ({completedGoalsData.length})
                    </h2>
                    {completedGoalsData.map(goal => {
                    const goalObjectives = objectives.filter(o => o.goalId === goal.id);
                    const goalProgress = calculateGoalProgress(goal.id);
                    const isExpanded = expandedGoals[goal.id];
                    const isGoalCompleted = goal.status === 'completed';
                    const dueDateStatus = getDueDateStatus(goal.dueDate, isGoalCompleted);

                    return (
                        <div key={goal.id} style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            borderLeft: `3px solid ${isGoalCompleted ? '#0077CC' : '#0077CC'}`
                        }}>
                            {/* Goal Header */}
                            <div
                                onClick={() => toggleGoal(goal.id)}
                                style={{
                                    padding: '16px',
                                    cursor: 'pointer',
                                    borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.08)' : 'none'
                                }}
                            >
                                {/* Type Label and Title */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <i data-lucide="chevron-right" style={{
                                        width: '20px',
                                        height: '20px',
                                        color: '#666666',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}></i>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '6px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span style={{
                                                background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                color: '#FFFFFF'
                                            }}>
                                                GOAL
                                            </span>
                                            {isGoalCompleted && (
                                                <i data-lucide="check-circle" style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    color: '#0077CC'
                                                }}></i>
                                            )}
                                        </div>
                                        <h3 style={{
                                            color: '#000000',
                                            margin: 0,
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            textDecoration: isGoalCompleted ? 'line-through' : 'none',
                                            opacity: isGoalCompleted ? 0.6 : 1
                                        }}>
                                            {goal.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Goal Description */}
                                {goal.description && (
                                    <div style={{
                                        color: '#666666',
                                        fontSize: '13px',
                                        marginBottom: '12px',
                                        paddingLeft: '32px',
                                        lineHeight: '1.5'
                                    }}>
                                        {makeLinksClickable(goal.description)}
                                    </div>
                                )}

                                {/* Date Information */}
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    marginBottom: '12px',
                                    paddingLeft: '32px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        color: '#999999',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <i data-lucide="calendar" style={{width: '12px', height: '12px'}}></i>
                                        {formatDate(goal.createdAt)}
                                    </span>
                                    {goal.completedAt && (
                                        <span style={{
                                            color: '#0077CC',
                                            fontSize: '11px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontWeight: '500'
                                        }}>
                                            <i data-lucide="check-circle" style={{width: '12px', height: '12px'}}></i>
                                            Completed {formatDate(goal.completedAt)}
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div style={{
                                    paddingLeft: '32px'
                                }}>
                                    <div style={{
                                        background: '#E9ECEF',
                                        borderRadius: '4px',
                                        height: '6px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(90deg, #0077CC 0%, #005A9C 100%)',
                                            width: `${goalProgress}%`,
                                            height: '100%',
                                            transition: 'width 0.3s ease'
                                        }}/>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '6px'
                                    }}>
                                        <span style={{
                                            color: '#666666',
                                            fontSize: '11px',
                                            fontWeight: '500'
                                        }}>
                                            {goalProgress}% Complete
                                        </span>
                                        <span style={{
                                            color: '#999999',
                                            fontSize: '11px'
                                        }}>
                                            {goalObjectives.length} Objectives • {assignments.filter(a => a.goalId === goal.id).length} Tasks
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Objectives and Assignments */}
                            {isExpanded && (
                                <div style={{padding: '0 16px 16px 16px'}}>
                                    {goalObjectives.length === 0 ? (
                                        <p style={{
                                            color: '#999999',
                                            fontSize: '13px',
                                            paddingLeft: '32px',
                                            margin: '12px 0'
                                        }}>
                                            No objectives created yet.
                                        </p>
                                    ) : (
                                        goalObjectives.map(objective => {
                                            const objectiveAssignments = assignments.filter(a => a.objectiveId === objective.id);
                                            const isObjectiveCompleted = objective.status === 'completed';
                                            const isObjectiveExpanded = expandedObjectives[objective.id];

                                            return (
                                                <div key={objective.id} style={{
                                                    marginTop: '12px',
                                                    marginLeft: '20px',
                                                    paddingLeft: '16px',
                                                    borderLeft: '2px solid #058585'
                                                }}>
                                                    {/* Objective - Accordion Header */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleObjective(objective.id);
                                                        }}
                                                        style={{
                                                            background: '#F8F9FA',
                                                            borderRadius: '8px',
                                                            padding: '12px',
                                                            marginBottom: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                            border: '1px solid #E9ECEF'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#E9ECEF';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#F8F9FA';
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            <i data-lucide="chevron-right" style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                color: '#666666',
                                                                transform: isObjectiveExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.3s ease',
                                                                flexShrink: 0
                                                            }}></i>
                                                            <span style={{
                                                                background: 'linear-gradient(135deg, #058585 0%, #046B6B 100%)',
                                                                padding: '2px 6px',
                                                                borderRadius: '3px',
                                                                fontSize: '9px',
                                                                fontWeight: 'bold',
                                                                color: '#FFFFFF',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                OBJECTIVE
                                                            </span>
                                                            {isObjectiveCompleted && (
                                                                <i data-lucide="check-circle" style={{
                                                                    width: '14px',
                                                                    height: '14px',
                                                                    color: '#058585'
                                                                }}></i>
                                                            )}
                                                            <span style={{
                                                                color: '#000000',
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                textDecoration: isObjectiveCompleted ? 'line-through' : 'none',
                                                                opacity: isObjectiveCompleted ? 0.6 : 1,
                                                                flex: 1
                                                            }}>
                                                                {objective.title}
                                                            </span>
                                                            <span style={{
                                                                color: '#999999',
                                                                fontSize: '11px'
                                                            }}>
                                                                {objectiveAssignments.length} tasks
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Assignments under this objective - Only shown when expanded */}
                                                    {isObjectiveExpanded && objectiveAssignments.map(assignment => {
                                                        const isAssignmentCompleted = assignment.status === 'completed';

                                                        return (
                                                            <div key={assignment.id} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                marginLeft: '20px',
                                                                marginBottom: '8px',
                                                                paddingLeft: '16px',
                                                                borderLeft: '1px solid #CED4DA'
                                                            }}>
                                                                {/* Checkbox for completion - One-way only */}
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isAssignmentCompleted}
                                                                    disabled={isAssignmentCompleted}
                                                                    onChange={(e) => {
                                                                        if (!isAssignmentCompleted && e.target.checked) {
                                                                            window.GLRSApp.handlers.handleAssignmentComplete(assignment.id, true);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        cursor: isAssignmentCompleted ? 'not-allowed' : 'pointer',
                                                                        accentColor: '#00A86B',
                                                                        flexShrink: 0
                                                                    }}
                                                                />

                                                                {/* Assignment - Clickable */}
                                                                <div
                                                                    onClick={() => openItemModal(assignment, 'assignment')}
                                                                    style={{
                                                                        flex: 1,
                                                                        background: '#FFFFFF',
                                                                        borderRadius: '6px',
                                                                        padding: '10px',
                                                                        border: '1px solid #E9ECEF',
                                                                        cursor: 'pointer',
                                                                        transition: 'background 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#F8F9FA';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = '#FFFFFF';
                                                                    }}
                                                                >
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px'
                                                                    }}>
                                                                        <span style={{
                                                                            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '3px',
                                                                            fontSize: '8px',
                                                                            fontWeight: 'bold',
                                                                            color: '#FFFFFF',
                                                                            letterSpacing: '0.5px'
                                                                        }}>
                                                                            TASK
                                                                        </span>
                                                                        {isAssignmentCompleted && (
                                                                            <i data-lucide="check-circle" style={{
                                                                                width: '12px',
                                                                                height: '12px',
                                                                                color: '#00A86B'
                                                                            }}></i>
                                                                        )}
                                                                        <span style={{
                                                                            color: '#000000',
                                                                            fontSize: '12px',
                                                                            textDecoration: isAssignmentCompleted ? 'line-through' : 'none',
                                                                            opacity: isAssignmentCompleted ? 0.5 : 1,
                                                                            flex: 1
                                                                        }}>
                                                                            {assignment.title}
                                                                        </span>
                                                                        <i data-lucide="arrow-right" style={{
                                                                            width: '12px',
                                                                            height: '12px',
                                                                            color: '#CCCCCC'
                                                                        }}></i>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            )}
        </>
    );
}

// Expose to global namespace
window.GLRSApp.components.GoalsTasksView = GoalsTasksView;


                  