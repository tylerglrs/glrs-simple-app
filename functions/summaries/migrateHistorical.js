/**
 * Historical Migration for Weekly/Monthly Summaries
 * SIMPLIFIED VERSION - No indexes required, queries by userId only
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// =============================================================================
// HELPERS
// =============================================================================

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekId(date) {
  const d = new Date(date);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const year = d.getFullYear();
  const week = getISOWeekNumber(date).toString().padStart(2, '0');
  return `${year}-W${week}`;
}

function getWeekStartMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEndSunday(date) {
  const monday = getWeekStartMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function getDayName(date) {
  return DAY_NAMES[date.getDay()];
}

function parseDate(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
}

function isInRange(date, start, end) {
  if (!date) return false;
  const d = parseDate(date);
  return d >= start && d <= end;
}

function isMorning(checkIn) {
  return checkIn.type === 'morning' || checkIn.checkInType === 'morning' ||
         (checkIn.morningData && !checkIn.eveningData);
}

// =============================================================================
// WEEKLY AGGREGATION - NO INDEXES REQUIRED
// =============================================================================

async function aggregateFullWeekData(userId, weekDate) {
  const weekStart = getWeekStartMonday(weekDate);
  const weekEnd = getWeekEndSunday(weekDate);
  const weekId = getWeekId(weekDate);

  console.log(`[Migration] Week ${weekId}: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`);

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};

  // Parse sobriety date
  let sobrietyDate = new Date();
  if (userData.sobrietyDate) {
    sobrietyDate = parseDate(userData.sobrietyDate);
  } else if (userData.recoveryStartDate) {
    sobrietyDate = parseDate(userData.recoveryStartDate);
  }
  const sobrietyDaysStart = Math.floor((weekStart - sobrietyDate) / (1000 * 60 * 60 * 24));
  const sobrietyDaysEnd = Math.floor((weekEnd - sobrietyDate) / (1000 * 60 * 60 * 24));

  // ─────────────────────────────────────────────────
  // CHECK-INS - Query by userId only, filter in JS
  // ─────────────────────────────────────────────────
  const checkInDaily = {
    monday: { morning: null, evening: null },
    tuesday: { morning: null, evening: null },
    wednesday: { morning: null, evening: null },
    thursday: { morning: null, evening: null },
    friday: { morning: null, evening: null },
    saturday: { morning: null, evening: null },
    sunday: { morning: null, evening: null },
  };

  let moodSum = 0, moodCount = 0, moodHigh = 0, moodLow = 10;
  let cravingSum = 0, cravingCount = 0, cravingHigh = 0, cravingSpikes = 0;
  let anxietySum = 0, anxietyCount = 0;
  let sleepSum = 0, sleepCount = 0;
  let energySum = 0, energyCount = 0;
  let checkInCount = 0;

  try {
    // Try both collection names
    const checkInsSnap = await db.collection('checkIns').where('userId', '==', userId).get();

    checkInsSnap.docs.forEach(doc => {
      const c = doc.data();
      const createdAt = parseDate(c.createdAt || c.date || c.timestamp);
      if (!isInRange(createdAt, weekStart, weekEnd)) return;

      checkInCount++;
      const dayName = getDayName(createdAt);
      const morning = isMorning(c);
      const slot = morning ? 'morning' : 'evening';

      const mood = c.mood ?? c.morningData?.mood ?? c.eveningData?.mood ?? null;
      const craving = c.craving ?? c.morningData?.craving ?? c.eveningData?.craving ?? null;
      const anxiety = c.anxiety ?? c.morningData?.anxiety ?? c.eveningData?.anxiety ?? null;
      const sleep = c.sleep ?? c.morningData?.sleep ?? c.eveningData?.sleep ?? null;
      const energy = c.energy ?? c.morningData?.energy ?? c.eveningData?.energy ?? null;
      const notes = c.notes ?? c.morningData?.notes ?? c.eveningData?.notes ?? null;
      const overallDay = c.overallDay ?? c.eveningData?.overallDay ?? null;

      checkInDaily[dayName][slot] = {
        completed: true,
        mood, craving, anxiety,
        sleep: slot === 'morning' ? sleep : null,
        energy,
        overallDay: slot === 'evening' ? overallDay : null,
        notes,
        timestamp: createdAt.toISOString(),
      };

      if (mood != null) { moodSum += mood; moodCount++; if (mood > moodHigh) moodHigh = mood; if (mood < moodLow) moodLow = mood; }
      if (craving != null) { cravingSum += craving; cravingCount++; if (craving > cravingHigh) cravingHigh = craving; if (craving >= 7) cravingSpikes++; }
      if (anxiety != null) { anxietySum += anxiety; anxietyCount++; }
      if (sleep != null) { sleepSum += sleep; sleepCount++; }
      if (energy != null) { energySum += energy; energyCount++; }
    });
  } catch (e) {
    console.log(`[Migration] Check-ins query error: ${e.message}`);
  }

  // Fill empty slots
  Object.keys(checkInDaily).forEach(day => {
    ['morning', 'evening'].forEach(slot => {
      if (!checkInDaily[day][slot]) {
        checkInDaily[day][slot] = { completed: false, mood: null, craving: null, anxiety: null, sleep: null, energy: null, overallDay: null, notes: null, timestamp: null };
      }
    });
  });

  const checkInStats = {
    completed: checkInCount,
    total: 14,
    rate: Math.round((checkInCount / 14) * 100) / 100,
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
  // REFLECTIONS
  // ─────────────────────────────────────────────────
  const reflectionDaily = {
    monday: null, tuesday: null, wednesday: null, thursday: null,
    friday: null, saturday: null, sunday: null,
  };
  let reflectionCount = 0;
  let dayRatingSum = 0, dayRatingCount = 0;

  try {
    const reflectionsSnap = await db.collection('reflections').where('userId', '==', userId).get();

    reflectionsSnap.docs.forEach(doc => {
      const r = doc.data();
      const createdAt = parseDate(r.createdAt || r.date || r.timestamp);
      if (!isInRange(createdAt, weekStart, weekEnd)) return;

      reflectionCount++;
      const dayName = getDayName(createdAt);
      const dayRating = r.dayRating ?? r.mood ?? r.overallDay ?? null;

      reflectionDaily[dayName] = {
        completed: true,
        dayRating,
        gratitude: r.gratitude ?? r.gratitudes?.[0] ?? null,
        challenge: r.challenge ?? r.challenges?.[0] ?? null,
        tomorrowGoal: r.tomorrowGoal ?? r.goals?.[0] ?? null,
        timestamp: createdAt.toISOString(),
      };

      if (dayRating != null) { dayRatingSum += dayRating; dayRatingCount++; }
    });
  } catch (e) {
    console.log(`[Migration] Reflections query error: ${e.message}`);
  }

  Object.keys(reflectionDaily).forEach(day => {
    if (!reflectionDaily[day]) {
      reflectionDaily[day] = { completed: false, dayRating: null, gratitude: null, challenge: null, tomorrowGoal: null, timestamp: null };
    }
  });

  const reflectionStats = {
    completed: reflectionCount,
    total: 7,
    rate: Math.round((reflectionCount / 7) * 100) / 100,
    avgDayRating: dayRatingCount > 0 ? Math.round((dayRatingSum / dayRatingCount) * 10) / 10 : 0,
    daily: reflectionDaily,
  };

  // ─────────────────────────────────────────────────
  // GRATITUDES
  // ─────────────────────────────────────────────────
  const gratitudeEntries = [];
  try {
    const gratSnap = await db.collection('gratitudes').where('userId', '==', userId).get();
    gratSnap.docs.forEach(doc => {
      const g = doc.data();
      const createdAt = parseDate(g.createdAt || g.date);
      if (!isInRange(createdAt, weekStart, weekEnd)) return;
      gratitudeEntries.push({
        text: g.text || g.gratitude || '',
        category: g.category || 'general',
        date: createdAt.toISOString().split('T')[0],
      });
    });
  } catch (e) {
    console.log(`[Migration] Gratitudes query error: ${e.message}`);
  }

  // ─────────────────────────────────────────────────
  // HABITS
  // ─────────────────────────────────────────────────
  const habitBreakdown = {};
  let totalHabitCompleted = 0, totalHabitPossible = 0;

  try {
    const habitsSnap = await db.collection('habits').where('userId', '==', userId).get();
    const completionsSnap = await db.collection('habitCompletions').where('userId', '==', userId).get();

    const completions = completionsSnap.docs.map(d => d.data()).filter(c => {
      const completedAt = parseDate(c.completedAt || c.date);
      return isInRange(completedAt, weekStart, weekEnd);
    });

    habitsSnap.docs.forEach(doc => {
      const habit = { id: doc.id, ...doc.data() };
      if (habit.isActive === false) return;

      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const possible = habit.frequency === 'daily' ? 7 : 1;

      const daily = { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false };
      habitCompletions.forEach(c => {
        const completedAt = parseDate(c.completedAt || c.date);
        if (completedAt) daily[getDayName(completedAt)] = true;
      });

      habitBreakdown[habit.id] = {
        name: habit.name || 'Habit',
        frequency: habit.frequency || 'daily',
        completed: habitCompletions.length,
        total: possible,
        rate: possible > 0 ? Math.round((habitCompletions.length / possible) * 100) / 100 : 0,
        daily,
      };

      totalHabitCompleted += habitCompletions.length;
      totalHabitPossible += possible;
    });
  } catch (e) {
    console.log(`[Migration] Habits query error: ${e.message}`);
  }

  // ─────────────────────────────────────────────────
  // MEETINGS (savedMeetings collection)
  // ─────────────────────────────────────────────────
  const meetingEntries = [];
  const meetingStats = { attended: 0, byType: { AA: 0, NA: 0, GLRS: 0, other: 0 }, byFormat: { inPerson: 0, virtual: 0 } };

  try {
    const meetingsSnap = await db.collection('meetings').where('userId', '==', userId).get();
    meetingsSnap.docs.forEach(doc => {
      const m = doc.data();
      const attendedAt = parseDate(m.attendedAt || m.savedAt || m.createdAt || m.date);
      if (!isInRange(attendedAt, weekStart, weekEnd)) return;

      meetingStats.attended++;
      const type = (m.type || m.meetingType || '').toUpperCase();
      if (['AA', 'NA', 'GLRS'].includes(type)) meetingStats.byType[type]++;
      else meetingStats.byType.other++;

      const isVirtual = m.format === 'virtual' || m.isVirtual;
      meetingStats.byFormat[isVirtual ? 'virtual' : 'inPerson']++;

      meetingEntries.push({
        name: m.meetingName || m.name || 'Meeting',
        type: type || 'other',
        format: isVirtual ? 'virtual' : 'inPerson',
        day: getDayName(attendedAt),
        date: attendedAt.toISOString().split('T')[0],
        time: m.time || attendedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        location: m.location || m.address || null,
        notes: m.notes || null,
      });
    });
  } catch (e) {
    console.log(`[Migration] Meetings query error: ${e.message}`);
  }
  meetingStats.entries = meetingEntries;

  // ─────────────────────────────────────────────────
  // COMMUNITY (communityMessages)
  // ─────────────────────────────────────────────────
  const communityStats = { postsCreated: 0, posts: [] };
  try {
    const postsSnap = await db.collection('communityMessages').where('userId', '==', userId).get();
    postsSnap.docs.forEach(doc => {
      const p = doc.data();
      const createdAt = parseDate(p.createdAt || p.date);
      if (!isInRange(createdAt, weekStart, weekEnd)) return;
      communityStats.postsCreated++;
      communityStats.posts.push({
        text: (p.text || p.content || '').substring(0, 100),
        date: createdAt.toISOString().split('T')[0],
      });
    });
  } catch (e) {
    console.log(`[Migration] Community query error: ${e.message}`);
  }

  // ─────────────────────────────────────────────────
  // RESOURCES (resourceViews)
  // ─────────────────────────────────────────────────
  const resourceStats = { viewed: 0, completed: 0, entries: [] };
  try {
    const resourcesSnap = await db.collection('resourceViews').where('userId', '==', userId).get();
    resourcesSnap.docs.forEach(doc => {
      const r = doc.data();
      const viewedAt = parseDate(r.viewedAt || r.lastAccessedAt || r.createdAt);
      if (!isInRange(viewedAt, weekStart, weekEnd)) return;
      resourceStats.viewed++;
      if (r.completed) resourceStats.completed++;
      resourceStats.entries.push({
        resourceId: r.resourceId || doc.id,
        title: r.title || 'Resource',
        viewedAt: viewedAt.toISOString(),
        completed: r.completed || false,
      });
    });
  } catch (e) {
    console.log(`[Migration] Resources query error: ${e.message}`);
  }

  // ─────────────────────────────────────────────────
  // MESSAGES
  // ─────────────────────────────────────────────────
  const messageStats = { sent: 0 };
  try {
    const messagesSnap = await db.collection('messages').where('senderId', '==', userId).get();
    messagesSnap.docs.forEach(doc => {
      const m = doc.data();
      const createdAt = parseDate(m.createdAt || m.timestamp);
      if (isInRange(createdAt, weekStart, weekEnd)) messageStats.sent++;
    });
  } catch (e) {
    console.log(`[Migration] Messages query error: ${e.message}`);
  }

  // ─────────────────────────────────────────────────
  // BUILD WEEK DOCUMENT
  // ─────────────────────────────────────────────────
  console.log(`[Migration] Week ${weekId}: ${checkInCount} check-ins, ${reflectionCount} reflections, ${gratitudeEntries.length} gratitudes`);

  return {
    weekId,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    checkIns: checkInStats,
    reflections: reflectionStats,
    gratitudes: { count: gratitudeEntries.length, entries: gratitudeEntries },
    habits: { tracked: Object.keys(habitBreakdown).length, overallCompletionRate: totalHabitPossible > 0 ? Math.round((totalHabitCompleted / totalHabitPossible) * 100) / 100 : 0, breakdown: habitBreakdown },
    meetings: meetingStats,
    community: communityStats,
    resources: resourceStats,
    messages: messageStats,
    journey: { sobrietyDaysStart: Math.max(0, sobrietyDaysStart), sobrietyDaysEnd: Math.max(0, sobrietyDaysEnd) },
    aiSummary: `Week of ${weekStart.toISOString().split('T')[0]}: ${checkInCount} check-ins, ${reflectionCount} reflections.`,
  };
}

// =============================================================================
// MONTHLY AGGREGATION
// =============================================================================

async function aggregateFullMonthData(userId, monthDate, weeklyDocs) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthId = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;

  console.log(`[Migration] Month ${monthId}`);

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};

  let sobrietyDate = new Date();
  if (userData.sobrietyDate) sobrietyDate = parseDate(userData.sobrietyDate);
  else if (userData.recoveryStartDate) sobrietyDate = parseDate(userData.recoveryStartDate);

  const sobrietyDaysStart = Math.floor((monthStart - sobrietyDate) / (1000 * 60 * 60 * 24));
  const sobrietyDaysEnd = Math.floor((monthEnd - sobrietyDate) / (1000 * 60 * 60 * 24));

  // Filter weeklies for this month
  const weeklies = weeklyDocs.filter(w => {
    const start = new Date(w.startDate);
    return start >= monthStart && start <= monthEnd;
  });

  const weeksIncluded = weeklies.map(w => w.weekId);

  let totalCheckIns = 0, totalCheckInsPossible = 0;
  let moodSum = 0, cravingSum = 0, sleepSum = 0, moodCount = 0;
  let totalReflections = 0, totalReflectionsPossible = 0;
  let totalMeetings = 0, habitRateSum = 0;

  weeklies.forEach(w => {
    totalCheckIns += w.checkIns?.completed || 0;
    totalCheckInsPossible += w.checkIns?.total || 14;
    if (w.checkIns?.moodAvg) {
      moodSum += w.checkIns.moodAvg;
      cravingSum += w.checkIns.cravingAvg || 0;
      sleepSum += w.checkIns.sleepAvg || 0;
      moodCount++;
    }
    totalReflections += w.reflections?.completed || 0;
    totalReflectionsPossible += w.reflections?.total || 7;
    totalMeetings += w.meetings?.attended || 0;
    habitRateSum += w.habits?.overallCompletionRate || 0;
  });

  const weekCount = Math.max(weeklies.length, 1);

  return {
    monthId,
    startDate: monthStart.toISOString().split('T')[0],
    endDate: monthEnd.toISOString().split('T')[0],
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    weeksIncluded,
    sobrietyDaysStart: Math.max(0, sobrietyDaysStart),
    sobrietyDaysEnd: Math.max(0, sobrietyDaysEnd),
    checkIns: {
      completed: totalCheckIns,
      total: totalCheckInsPossible,
      rate: totalCheckInsPossible > 0 ? Math.round((totalCheckIns / totalCheckInsPossible) * 100) / 100 : 0,
      moodAvg: moodCount > 0 ? Math.round((moodSum / moodCount) * 10) / 10 : 0,
      cravingAvg: moodCount > 0 ? Math.round((cravingSum / moodCount) * 10) / 10 : 0,
      sleepAvg: moodCount > 0 ? Math.round((sleepSum / moodCount) * 10) / 10 : 0,
    },
    reflections: {
      completed: totalReflections,
      total: totalReflectionsPossible,
      rate: totalReflectionsPossible > 0 ? Math.round((totalReflections / totalReflectionsPossible) * 100) / 100 : 0,
    },
    meetings: {
      total: totalMeetings,
      avgPerWeek: Math.round((totalMeetings / weekCount) * 10) / 10,
    },
    habits: {
      avgCompletionRate: Math.round((habitRateSum / weekCount) * 100) / 100,
    },
    aiSummary: `${monthId}: Day ${Math.max(0, sobrietyDaysStart)} to ${Math.max(0, sobrietyDaysEnd)}. ${totalCheckIns} check-ins, ${totalReflections} reflections.`,
  };
}

// =============================================================================
// MIGRATION FUNCTION
// =============================================================================

async function migrateUserSummaries(userId) {
  console.log(`[Migration] Starting for user ${userId}`);

  const userRef = db.collection('users').doc(userId);
  const results = { weeklySummaries: [], monthlySummaries: [], errors: [] };

  // Week dates for Sep-Nov 2025
  const weekDates = [
    new Date(2025, 8, 1), new Date(2025, 8, 8), new Date(2025, 8, 15), new Date(2025, 8, 22), new Date(2025, 8, 29),
    new Date(2025, 9, 6), new Date(2025, 9, 13), new Date(2025, 9, 20), new Date(2025, 9, 27),
    new Date(2025, 10, 3), new Date(2025, 10, 10), new Date(2025, 10, 17), new Date(2025, 10, 24),
  ];

  const weeklyDocs = [];

  // Generate weekly summaries
  for (const weekDate of weekDates) {
    try {
      const weekData = await aggregateFullWeekData(userId, weekDate);
      await userRef.collection('weeklySummaries').doc(weekData.weekId).set(weekData);
      results.weeklySummaries.push(weekData.weekId);
      weeklyDocs.push(weekData);
      console.log(`[Migration] Saved: ${weekData.weekId}`);
    } catch (e) {
      console.error(`[Migration] Week error:`, e.message);
      results.errors.push({ type: 'weekly', error: e.message });
    }
  }

  // Generate monthly summaries from the weekly docs we just created
  const monthDates = [
    new Date(2025, 8, 15),  // September
    new Date(2025, 9, 15),  // October
    new Date(2025, 10, 15), // November
  ];

  for (const monthDate of monthDates) {
    try {
      const monthData = await aggregateFullMonthData(userId, monthDate, weeklyDocs);
      await userRef.collection('monthlySummaries').doc(monthData.monthId).set(monthData);
      results.monthlySummaries.push(monthData.monthId);
      console.log(`[Migration] Saved: ${monthData.monthId}`);
    } catch (e) {
      console.error(`[Migration] Month error:`, e.message);
      results.errors.push({ type: 'monthly', error: e.message });
    }
  }

  return results;
}

// =============================================================================
// CLOUD FUNCTION
// =============================================================================

exports.migrateHistoricalSummaries = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const userId = data.userId || context.auth.uid;
  const migrateAll = data.migrateAll === true;

  console.log(`[Migration] Request from ${context.auth.uid}, target: ${migrateAll ? 'ALL' : userId}`);

  if (migrateAll) {
    const usersSnap = await db.collection('users').where('role', '==', 'pir').where('status', '==', 'active').get();

    const allResults = { totalUsers: usersSnap.size, successfulUsers: 0, weeklySummaries: [], monthlySummaries: [], errors: [] };

    for (const userDoc of usersSnap.docs) {
      try {
        const results = await migrateUserSummaries(userDoc.id);
        allResults.successfulUsers++;
        allResults.weeklySummaries.push(...results.weeklySummaries);
        allResults.monthlySummaries.push(...results.monthlySummaries);
        if (results.errors.length > 0) allResults.errors.push(...results.errors);
      } catch (e) {
        allResults.errors.push({ userId: userDoc.id, error: e.message });
      }
    }

    return { success: true, ...allResults };
  } else {
    const results = await migrateUserSummaries(userId);
    return { success: true, ...results };
  }
});

module.exports = {
  migrateHistoricalSummaries: exports.migrateHistoricalSummaries,
  migrateUserSummaries,
};
