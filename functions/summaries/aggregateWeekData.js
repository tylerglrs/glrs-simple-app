/**
 * Weekly Data Aggregation with FULL Daily Breakdowns
 *
 * Week period: Monday 12:00 AM → Sunday 11:59 PM (ISO 8601)
 * Updated Phase 6: Includes daily breakdown for check-ins, reflections, habits
 */

const admin = require('firebase-admin');
const db = admin.firestore();

// =============================================================================
// WEEK HELPERS (Monday → Sunday - ISO 8601)
// =============================================================================

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Get ISO week number (ISO 8601: weeks start Monday)
 * @param {Date} date
 * @returns {number}
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get week ID string (e.g., "2025-W49")
 * @param {Date} date
 * @returns {string}
 */
function getWeekId(date) {
  const d = new Date(date);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const year = d.getFullYear();
  const week = getWeekNumber(date).toString().padStart(2, '0');
  return `${year}-W${week}`;
}

/**
 * Get start of week (Monday) - ISO 8601
 * @param {Date} date
 * @returns {Date}
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1, Sunday = 0 (becomes -6)
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of week (Sunday) - ISO 8601
 * @param {Date} date
 * @returns {Date}
 */
function getWeekEnd(date) {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Get day name from date
 * @param {Date} date
 * @returns {string}
 */
function getDayName(date) {
  return DAY_NAMES[date.getDay()];
}

/**
 * Check if check-in is morning type
 * @param {Object} checkIn
 * @returns {boolean}
 */
function isMorningCheckIn(checkIn) {
  return checkIn.type === 'morning' ||
         checkIn.checkInType === 'morning' ||
         (checkIn.morningData && !checkIn.eveningData);
}

// =============================================================================
// MAIN AGGREGATION FUNCTION
// =============================================================================

/**
 * Aggregate all week data for a user with FULL daily breakdowns
 * @param {string} userId
 * @param {Date} weekDate - Any date within the target week
 * @returns {Promise<Object>}
 */
async function aggregateWeekData(userId, weekDate = new Date()) {
  const weekStart = getWeekStart(weekDate);
  const weekEnd = getWeekEnd(weekDate);
  const weekId = getWeekId(weekDate);

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};

  // Calculate sobriety days
  const sobrietyDate = userData.sobrietyDate?.toDate() || userData.recoveryStartDate?.toDate() || new Date();
  const sobrietyDaysStart = Math.floor((weekStart - sobrietyDate) / (1000 * 60 * 60 * 24));
  const sobrietyDaysEnd = Math.floor((weekEnd - sobrietyDate) / (1000 * 60 * 60 * 24));

  // ─────────────────────────────────────────────────
  // FETCH ALL CHECK-INS
  // ─────────────────────────────────────────────────
  const checkInsSnap = await db.collection('checkIns')
    .where('userId', '==', userId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
    .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
    .get();

  const checkIns = checkInsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Build daily breakdown for check-ins
  const checkInDaily = {
    monday: { morning: null, evening: null },
    tuesday: { morning: null, evening: null },
    wednesday: { morning: null, evening: null },
    thursday: { morning: null, evening: null },
    friday: { morning: null, evening: null },
    saturday: { morning: null, evening: null },
    sunday: { morning: null, evening: null },
  };

  // Stats accumulators
  let moodSum = 0, moodCount = 0, moodHigh = 0, moodLow = 10;
  let cravingSum = 0, cravingCount = 0, cravingHigh = 0, cravingSpikes = 0;
  let anxietySum = 0, anxietyCount = 0;
  let sleepSum = 0, sleepCount = 0;
  let energySum = 0, energyCount = 0;

  checkIns.forEach(c => {
    const createdAt = c.createdAt?.toDate() || new Date(c.createdAt);
    const dayName = getDayName(createdAt);
    const isMorning = isMorningCheckIn(c);
    const slot = isMorning ? 'morning' : 'evening';

    // Extract values (handle both flat and nested structures)
    const mood = c.mood ?? c.morningData?.mood ?? c.eveningData?.mood ?? null;
    const craving = c.craving ?? c.morningData?.craving ?? c.eveningData?.craving ?? null;
    const anxiety = c.anxiety ?? c.morningData?.anxiety ?? c.eveningData?.anxiety ?? null;
    const sleep = c.sleep ?? c.morningData?.sleep ?? c.eveningData?.sleep ?? null;
    const energy = c.energy ?? c.morningData?.energy ?? c.eveningData?.energy ?? null;
    const overallDay = c.overallDay ?? c.eveningData?.overallDay ?? null;
    const notes = c.notes ?? c.morningData?.notes ?? c.eveningData?.notes ?? null;

    // Store in daily breakdown
    checkInDaily[dayName][slot] = {
      completed: true,
      mood,
      craving,
      anxiety,
      sleep: slot === 'morning' ? sleep : null,
      energy,
      overallDay: slot === 'evening' ? overallDay : null,
      notes,
      timestamp: createdAt.toISOString(),
    };

    // Accumulate stats
    if (mood !== null && mood !== undefined) {
      moodSum += mood;
      moodCount++;
      if (mood > moodHigh) moodHigh = mood;
      if (mood < moodLow) moodLow = mood;
    }
    if (craving !== null && craving !== undefined) {
      cravingSum += craving;
      cravingCount++;
      if (craving > cravingHigh) cravingHigh = craving;
      if (craving >= 7) cravingSpikes++;
    }
    if (anxiety !== null && anxiety !== undefined) {
      anxietySum += anxiety;
      anxietyCount++;
    }
    if (sleep !== null && sleep !== undefined) {
      sleepSum += sleep;
      sleepCount++;
    }
    if (energy !== null && energy !== undefined) {
      energySum += energy;
      energyCount++;
    }
  });

  // Fill in missing slots with completed: false
  Object.keys(checkInDaily).forEach(day => {
    ['morning', 'evening'].forEach(slot => {
      if (!checkInDaily[day][slot]) {
        checkInDaily[day][slot] = {
          completed: false,
          mood: null,
          craving: null,
          anxiety: null,
          sleep: null,
          energy: null,
          overallDay: null,
          notes: null,
          timestamp: null,
        };
      }
    });
  });

  const checkInStats = {
    completed: checkIns.length,
    total: 14,
    rate: checkIns.length / 14,
    moodAvg: moodCount > 0 ? Math.round((moodSum / moodCount) * 10) / 10 : 0,
    moodHigh: moodCount > 0 ? moodHigh : 0,
    moodLow: moodCount > 0 ? moodLow : 0,
    cravingAvg: cravingCount > 0 ? Math.round((cravingSum / cravingCount) * 10) / 10 : 0,
    cravingHigh: cravingCount > 0 ? cravingHigh : 0,
    cravingSpikes,
    anxietyAvg: anxietyCount > 0 ? Math.round((anxietySum / anxietyCount) * 10) / 10 : 0,
    sleepAvg: sleepCount > 0 ? Math.round((sleepSum / sleepCount) * 10) / 10 : 0,
    energyAvg: energyCount > 0 ? Math.round((energySum / energyCount) * 10) / 10 : 0,
    daily: checkInDaily,
  };

  // ─────────────────────────────────────────────────
  // FETCH ALL REFLECTIONS
  // ─────────────────────────────────────────────────
  const reflectionsSnap = await db.collection('reflections')
    .where('userId', '==', userId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
    .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
    .get();

  const reflections = reflectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Build daily breakdown for reflections
  const reflectionDaily = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  };

  let dayRatingSum = 0, dayRatingCount = 0;
  let gratitudeCount = 0, challengesCount = 0;

  reflections.forEach(r => {
    const createdAt = r.createdAt?.toDate() || new Date(r.createdAt);
    const dayName = getDayName(createdAt);

    const dayRating = r.dayRating ?? r.mood ?? r.overallDay ?? null;
    const gratitude = r.gratitude ?? r.gratitudes?.[0] ?? null;
    const challenge = r.challenge ?? r.challenges?.[0] ?? null;
    const tomorrowGoal = r.tomorrowGoal ?? r.goals?.[0] ?? null;

    reflectionDaily[dayName] = {
      completed: true,
      dayRating,
      gratitude,
      challenge,
      tomorrowGoal,
      timestamp: createdAt.toISOString(),
    };

    if (dayRating !== null && dayRating !== undefined) {
      dayRatingSum += dayRating;
      dayRatingCount++;
    }
    if (gratitude) gratitudeCount++;
    if (challenge) challengesCount++;
  });

  // Fill in missing days
  Object.keys(reflectionDaily).forEach(day => {
    if (!reflectionDaily[day]) {
      reflectionDaily[day] = {
        completed: false,
        dayRating: null,
        gratitude: null,
        challenge: null,
        tomorrowGoal: null,
        timestamp: null,
      };
    }
  });

  const reflectionStats = {
    completed: reflections.length,
    total: 7,
    rate: reflections.length / 7,
    avgDayRating: dayRatingCount > 0 ? Math.round((dayRatingSum / dayRatingCount) * 10) / 10 : 0,
    gratitudeCount,
    challengesCount,
    daily: reflectionDaily,
  };

  // ─────────────────────────────────────────────────
  // FETCH ALL GRATITUDES
  // ─────────────────────────────────────────────────
  const gratitudesSnap = await db.collection('gratitudes')
    .where('userId', '==', userId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
    .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
    .get();

  const gratitudeEntries = gratitudesSnap.docs.map(d => {
    const data = d.data();
    const createdAt = data.createdAt?.toDate() || new Date(data.createdAt);
    return {
      text: data.text || data.gratitude || '',
      category: data.category || 'general',
      date: createdAt.toISOString().split('T')[0],
      timestamp: createdAt.toISOString(),
    };
  });

  const gratitudesData = {
    count: gratitudeEntries.length,
    entries: gratitudeEntries,
  };

  // ─────────────────────────────────────────────────
  // FETCH HABITS + COMPLETIONS
  // ─────────────────────────────────────────────────
  const habitsSnap = await db.collection('habits')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();

  const habitCompletionsSnap = await db.collection('habitCompletions')
    .where('userId', '==', userId)
    .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
    .where('completedAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
    .get();

  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const completions = habitCompletionsSnap.docs.map(d => d.data());

  const habitBreakdown = {};
  let totalHabitCompleted = 0;
  let totalHabitPossible = 0;

  habits.forEach(habit => {
    const habitCompletions = completions.filter(c => c.habitId === habit.id);
    const possible = habit.frequency === 'daily' ? 7 : 1;

    // Build daily grid
    const daily = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };

    habitCompletions.forEach(c => {
      const completedAt = c.completedAt?.toDate() || new Date(c.completedAt);
      const dayName = getDayName(completedAt);
      daily[dayName] = true;
    });

    habitBreakdown[habit.id] = {
      name: habit.name || 'Unnamed Habit',
      frequency: habit.frequency || 'daily',
      completed: habitCompletions.length,
      total: possible,
      rate: possible > 0 ? habitCompletions.length / possible : 0,
      daily,
    };

    totalHabitCompleted += habitCompletions.length;
    totalHabitPossible += possible;
  });

  const habitStats = {
    tracked: habits.length,
    overallCompletionRate: totalHabitPossible > 0 ? totalHabitCompleted / totalHabitPossible : 0,
    breakdown: habitBreakdown,
  };

  // ─────────────────────────────────────────────────
  // FETCH MEETING ATTENDANCE
  // ─────────────────────────────────────────────────
  const meetingsSnap = await db.collection('meetingAttendance')
    .where('userId', '==', userId)
    .where('attendedAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
    .where('attendedAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
    .get();

  const meetingEntries = [];
  const meetingStats = {
    attended: 0,
    scheduled: 0,
    attendanceRate: 1,
    byType: { AA: 0, NA: 0, GLRS: 0, other: 0 },
    byFormat: { inPerson: 0, virtual: 0 },
  };

  meetingsSnap.docs.forEach(d => {
    const m = d.data();
    const attendedAt = m.attendedAt?.toDate() || new Date(m.attendedAt);

    const type = (m.type || m.meetingType || '').toUpperCase();
    const isVirtual = m.format === 'virtual' || m.isVirtual;

    meetingStats.attended++;
    meetingStats.scheduled++;

    if (['AA', 'NA', 'GLRS'].includes(type)) {
      meetingStats.byType[type]++;
    } else {
      meetingStats.byType.other++;
    }

    meetingStats.byFormat[isVirtual ? 'virtual' : 'inPerson']++;

    meetingEntries.push({
      meetingId: d.id,
      name: m.meetingName || m.name || 'Meeting',
      type: type || 'other',
      format: isVirtual ? 'virtual' : 'inPerson',
      day: getDayName(attendedAt),
      date: attendedAt.toISOString().split('T')[0],
      time: m.time || attendedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: m.location || null,
      attended: true,
      notes: m.notes || null,
    });
  });

  meetingStats.entries = meetingEntries;

  // ─────────────────────────────────────────────────
  // FETCH COMMUNITY ACTIVITY
  // ─────────────────────────────────────────────────
  const communityStats = {
    postsCreated: 0,
    commentsGiven: 0,
    reactionsReceived: 0,
    reactionsGiven: 0,
    posts: [],
    comments: [],
  };

  try {
    const postsSnap = await db.collection('communityMessages')
      .where('userId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
      .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
      .get();

    postsSnap.docs.forEach(d => {
      const p = d.data();
      const createdAt = p.createdAt?.toDate() || new Date(p.createdAt);

      communityStats.postsCreated++;
      communityStats.posts.push({
        postId: d.id,
        type: p.type || 'post',
        text: (p.text || p.content || '').substring(0, 200),
        date: createdAt.toISOString().split('T')[0],
        timestamp: createdAt.toISOString(),
        reactions: p.reactions || p.likes || 0,
      });
    });
  } catch (e) {
    console.log('Community messages query skipped:', e.message);
  }

  // ─────────────────────────────────────────────────
  // FETCH RESOURCES PROGRESS
  // ─────────────────────────────────────────────────
  const resourceStats = {
    viewed: 0,
    completed: 0,
    entries: [],
  };

  try {
    const resourcesSnap = await db.collection('resourceProgress')
      .where('userId', '==', userId)
      .where('lastAccessedAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
      .where('lastAccessedAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
      .get();

    resourcesSnap.docs.forEach(d => {
      const r = d.data();
      const viewedAt = r.lastAccessedAt?.toDate() || new Date(r.lastAccessedAt);

      resourceStats.viewed++;
      if (r.completed) resourceStats.completed++;

      resourceStats.entries.push({
        resourceId: d.id,
        title: r.title || 'Resource',
        category: r.category || 'general',
        viewedAt: viewedAt.toISOString(),
        completed: r.completed || false,
        completedAt: r.completedAt?.toDate()?.toISOString() || null,
      });
    });
  } catch (e) {
    console.log('Resource progress query skipped:', e.message);
  }

  // ─────────────────────────────────────────────────
  // FETCH MESSAGES
  // ─────────────────────────────────────────────────
  const messageStats = {
    sent: 0,
    received: 0,
    entries: [],
  };

  try {
    const sentSnap = await db.collection('messages')
      .where('senderId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
      .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(weekEnd))
      .get();

    messageStats.sent = sentSnap.size;

    sentSnap.docs.forEach(d => {
      const m = d.data();
      const createdAt = m.createdAt?.toDate() || new Date(m.createdAt);

      messageStats.entries.push({
        messageId: d.id,
        direction: 'sent',
        text: (m.text || m.content || '').substring(0, 100),
        timestamp: createdAt.toISOString(),
      });
    });
  } catch (e) {
    console.log('Messages query skipped:', e.message);
  }

  // ─────────────────────────────────────────────────
  // BUILD FINAL WEEK DOCUMENT
  // ─────────────────────────────────────────────────
  return {
    weekId,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
    checkIns: checkInStats,
    reflections: reflectionStats,
    gratitudes: gratitudesData,
    habits: habitStats,
    meetings: meetingStats,
    community: communityStats,
    resources: resourceStats,
    messages: messageStats,
    journey: {
      sobrietyDaysStart: Math.max(0, sobrietyDaysStart),
      sobrietyDaysEnd: Math.max(0, sobrietyDaysEnd),
    },
  };
}

/**
 * Get recent averages for a user (last 7 days)
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getRecentAverages(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const checkInsSnap = await db.collection('checkIns')
    .where('userId', '==', userId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekAgo))
    .orderBy('createdAt', 'desc')
    .limit(14)
    .get();

  const checkIns = checkInsSnap.docs.map(d => d.data());

  if (checkIns.length === 0) return null;

  let moodSum = 0, cravingSum = 0, anxietySum = 0, sleepSum = 0;
  let moodCount = 0, cravingCount = 0, anxietyCount = 0, sleepCount = 0;

  checkIns.forEach(c => {
    const mood = c.mood ?? c.morningData?.mood ?? c.eveningData?.mood;
    const craving = c.craving ?? c.morningData?.craving ?? c.eveningData?.craving;
    const anxiety = c.anxiety ?? c.morningData?.anxiety ?? c.eveningData?.anxiety;
    const sleep = c.sleep ?? c.morningData?.sleep ?? c.eveningData?.sleep;

    if (mood !== undefined && mood !== null) { moodSum += mood; moodCount++; }
    if (craving !== undefined && craving !== null) { cravingSum += craving; cravingCount++; }
    if (anxiety !== undefined && anxiety !== null) { anxietySum += anxiety; anxietyCount++; }
    if (sleep !== undefined && sleep !== null) { sleepSum += sleep; sleepCount++; }
  });

  return {
    moodAvg: moodCount > 0 ? moodSum / moodCount : 0,
    cravingAvg: cravingCount > 0 ? cravingSum / cravingCount : 0,
    anxietyAvg: anxietyCount > 0 ? anxietySum / anxietyCount : 0,
    sleepAvg: sleepCount > 0 ? sleepSum / sleepCount : 0,
  };
}

module.exports = {
  aggregateWeekData,
  getRecentAverages,
  getWeekId,
  getWeekStart,
  getWeekEnd,
  getWeekNumber,
  getDayName,
};
