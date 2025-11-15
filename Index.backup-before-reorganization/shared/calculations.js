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

console.log('✅ calculations.js loaded - 5 calculation functions available');
