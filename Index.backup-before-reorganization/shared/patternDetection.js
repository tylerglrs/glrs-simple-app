// ═══════════════════════════════════════════════════════════
// PATTERN DETECTION ALGORITHMS
// Analyzes check-in data to identify behavioral patterns
// ═══════════════════════════════════════════════════════════

// ==========================================
// ALGORITHM 1: DAY-OF-WEEK PATTERN DETECTION
// ==========================================
// Identifies which day of the week has the lowest mood, highest cravings, or highest anxiety

const detectDayOfWeekPattern = (checkInsData) => {
    if (!checkInsData || checkInsData.length < 7) return null;

    const dayGroups = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }; // Sun-Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    checkInsData.slice(0, 30).forEach(checkIn => {
        if (!checkIn.morningData) return;
        const date = checkIn.createdAt?.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
        const dayOfWeek = date.getDay();

        dayGroups[dayOfWeek].push({
            mood: checkIn.morningData.mood || 3,
            craving: checkIn.morningData.craving || 3,
            anxiety: checkIn.morningData.anxiety || 3
        });
    });

    const dayAverages = {};
    let totalMood = 0, totalCraving = 0, totalAnxiety = 0, count = 0;

    Object.keys(dayGroups).forEach(day => {
        if (dayGroups[day].length === 0) return;

        const avgMood = dayGroups[day].reduce((sum, d) => sum + d.mood, 0) / dayGroups[day].length;
        const avgCraving = dayGroups[day].reduce((sum, d) => sum + d.craving, 0) / dayGroups[day].length;
        const avgAnxiety = dayGroups[day].reduce((sum, d) => sum + d.anxiety, 0) / dayGroups[day].length;

        dayAverages[day] = { mood: avgMood, craving: avgCraving, anxiety: avgAnxiety };
        totalMood += avgMood;
        totalCraving += avgCraving;
        totalAnxiety += avgAnxiety;
        count++;
    });

    if (count === 0) return null;

    const weeklyAvg = {
        mood: totalMood / count,
        craving: totalCraving / count,
        anxiety: totalAnxiety / count
    };

    let lowestMoodDay = null, highestCravingDay = null, highestAnxietyDay = null;
    let lowestMoodValue = 5, highestCravingValue = 0, highestAnxietyValue = 0;

    Object.keys(dayAverages).forEach(day => {
        if (dayAverages[day].mood < lowestMoodValue) {
            lowestMoodValue = dayAverages[day].mood;
            lowestMoodDay = parseInt(day);
        }
        if (dayAverages[day].craving > highestCravingValue) {
            highestCravingValue = dayAverages[day].craving;
            highestCravingDay = parseInt(day);
        }
        if (dayAverages[day].anxiety > highestAnxietyValue) {
            highestAnxietyValue = dayAverages[day].anxiety;
            highestAnxietyDay = parseInt(day);
        }
    });

    if (lowestMoodDay !== null && weeklyAvg.mood - lowestMoodValue >= 1) {
        return {
            type: 'dayOfWeek',
            metric: 'mood',
            day: dayNames[lowestMoodDay],
            value: lowestMoodValue.toFixed(1),
            message: `Your mood tends to dip on ${dayNames[lowestMoodDay]}s`,
            tips: [
                `Start your ${dayNames[lowestMoodDay]} with a morning routine`,
                `Schedule something enjoyable for ${dayNames[lowestMoodDay]} mornings`,
                `Connect with your accountability partner on ${dayNames[lowestMoodDay]}`,
                `Review your ${dayNames[lowestMoodDay]} triggers from past weeks`
            ]
        };
    }

    if (highestCravingDay !== null && highestCravingValue - weeklyAvg.craving >= 1) {
        return {
            type: 'dayOfWeek',
            metric: 'craving',
            day: dayNames[highestCravingDay],
            value: highestCravingValue.toFixed(1),
            message: `Your cravings spike on ${dayNames[highestCravingDay]}s`,
            tips: [
                `Identify your ${dayNames[highestCravingDay]} triggers (stress? social plans?)`,
                `Plan alternative activities for ${dayNames[highestCravingDay]} evenings`,
                `Check in with your support group on ${dayNames[highestCravingDay]}s`,
                `Practice grounding techniques on ${dayNames[highestCravingDay]} afternoons`
            ]
        };
    }

    if (highestAnxietyDay !== null && highestAnxietyValue - weeklyAvg.anxiety >= 1) {
        return {
            type: 'dayOfWeek',
            metric: 'anxiety',
            day: dayNames[highestAnxietyDay],
            value: highestAnxietyValue.toFixed(1),
            message: `Your anxiety is higher on ${dayNames[highestAnxietyDay]}s`,
            tips: [
                `Prepare for the week ahead on ${dayNames[highestAnxietyDay - 1 >= 0 ? highestAnxietyDay - 1 : 6]} night`,
                `Practice ${dayNames[highestAnxietyDay]} evening meditation`,
                `Limit social media on ${dayNames[highestAnxietyDay]}s`,
                `Connect with supportive friends on ${dayNames[highestAnxietyDay]}`
            ]
        };
    }

    return null;
};

// ==========================================
// ALGORITHM 2: CONSECUTIVE DAYS PATTERN DETECTION
// ==========================================
// Detects extended periods of low mood or high cravings

const detectConsecutiveDaysPattern = (checkInsData) => {
    if (!checkInsData || checkInsData.length < 3) return null;

    let consecutiveLowMood = 0, consecutiveHighCraving = 0;
    let maxConsecutiveLowMood = 0, maxConsecutiveHighCraving = 0;

    checkInsData.slice(0, 14).forEach(checkIn => {
        if (!checkIn.morningData) {
            consecutiveLowMood = 0;
            consecutiveHighCraving = 0;
            return;
        }

        const mood = checkIn.morningData.mood || 3;
        const craving = checkIn.morningData.craving || 3;

        if (mood <= 2) {
            consecutiveLowMood++;
            maxConsecutiveLowMood = Math.max(maxConsecutiveLowMood, consecutiveLowMood);
        } else {
            consecutiveLowMood = 0;
        }

        if (craving >= 4) {
            consecutiveHighCraving++;
            maxConsecutiveHighCraving = Math.max(maxConsecutiveHighCraving, consecutiveHighCraving);
        } else {
            consecutiveHighCraving = 0;
        }
    });

    if (maxConsecutiveLowMood >= 3) {
        return {
            type: 'consecutive',
            metric: 'lowMood',
            days: maxConsecutiveLowMood,
            message: `You've had ${maxConsecutiveLowMood} consecutive days of low mood. Let's address this.`,
            tips: [
                'Consider reaching out to your coach today',
                'Review your coping strategies - what\'s working?',
                'Have you been completing your daily check-ins?',
                'Physical activity can help - take a walk today'
            ]
        };
    }

    if (maxConsecutiveHighCraving >= 3) {
        return {
            type: 'consecutive',
            metric: 'highCraving',
            days: maxConsecutiveHighCraving,
            message: `High cravings for ${maxConsecutiveHighCraving} days in a row. Time for extra support.`,
            tips: [
                'This is normal - cravings pass, you are strong',
                'Call your accountability partner right now',
                'Use the 5-minute rule: delay for 5 minutes, reassess',
                'Review your relapse prevention plan in Guides'
            ]
        };
    }

    return null;
};

// ==========================================
// ALGORITHM 3: TIME-OF-DAY PATTERN DETECTION
// ==========================================
// Compares morning vs. evening mood to identify daily patterns

const detectTimeOfDayPattern = (checkInsData) => {
    if (!checkInsData || checkInsData.length < 7) return null;

    let morningMoodSum = 0, eveningMoodSum = 0;
    let morningCount = 0, eveningCount = 0;

    checkInsData.slice(0, 14).forEach(checkIn => {
        if (checkIn.morningData && checkIn.morningData.mood) {
            morningMoodSum += checkIn.morningData.mood;
            morningCount++;
        }
        if (checkIn.eveningData && checkIn.eveningData.overallDay) {
            eveningMoodSum += checkIn.eveningData.overallDay;
            eveningCount++;
        }
    });

    if (morningCount < 5 || eveningCount < 5) return null;

    const avgMorningMood = morningMoodSum / morningCount;
    const avgEveningMood = eveningMoodSum / eveningCount;
    const difference = avgMorningMood - avgEveningMood;

    if (difference <= -1) {
        return {
            type: 'timeOfDay',
            metric: 'morningsHarder',
            difference: Math.abs(difference).toFixed(1),
            message: 'Your mornings tend to be more challenging',
            tips: [
                'Establish a consistent morning routine',
                'Avoid checking phone first thing in the morning',
                'Try morning meditation or stretching',
                'Plan something positive for each morning'
            ]
        };
    }

    if (difference >= 1) {
        return {
            type: 'timeOfDay',
            metric: 'eveningsHarder',
            difference: difference.toFixed(1),
            message: 'Your mood dips in the evenings',
            tips: [
                'Avoid isolation in the evenings',
                'Limit screen time after 8 PM',
                'Call a friend or family member each evening',
                'Practice evening reflection to process your day'
            ]
        };
    }

    return null;
};

// ==========================================
// MAIN PATTERN DETECTION FUNCTION
// ==========================================
// Runs all algorithms and returns first detected pattern

const detectPatterns = (checkInsData) => {
    if (!checkInsData || checkInsData.length === 0) return null;

    return detectDayOfWeekPattern(checkInsData) ||
           detectConsecutiveDaysPattern(checkInsData) ||
           detectTimeOfDayPattern(checkInsData);
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.patternDetection = {
    detectDayOfWeekPattern,
    detectConsecutiveDaysPattern,
    detectTimeOfDayPattern,
    detectPatterns
};

console.log('✅ Pattern detection algorithms loaded');
