/**
 * Monthly Data Aggregation from Weekly Summaries
 *
 * Aggregates all weekly summaries into a monthly summary.
 * Updated Phase 6: Consistent schema with weekly summaries.
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Get month ID string (e.g., "2025-12")
 * @param {Date} date
 * @returns {string}
 */
function getMonthId(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get start of month
 * @param {Date} date
 * @returns {Date}
 */
function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Get end of month
 * @param {Date} date
 * @returns {Date}
 */
function getMonthEnd(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Aggregate month data from weekly summaries
 * @param {string} userId
 * @param {Date} monthDate - Any date within the target month
 * @returns {Promise<Object>}
 */
async function aggregateMonthData(userId, monthDate = new Date()) {
  const monthStart = getMonthStart(monthDate);
  const monthEnd = getMonthEnd(monthDate);
  const monthId = getMonthId(monthDate);

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : {};

  // Calculate sobriety days
  const sobrietyDate = userData.sobrietyDate?.toDate() || userData.recoveryStartDate?.toDate() || new Date();
  const sobrietyDaysStart = Math.floor((monthStart - sobrietyDate) / (1000 * 60 * 60 * 24));
  const sobrietyDaysEnd = Math.floor((monthEnd - sobrietyDate) / (1000 * 60 * 60 * 24));

  // Fetch weekly summaries for this month
  // We look for weeks that START within this month
  const weekliesSnap = await userRef.collection('weeklySummaries')
    .where('startDate', '>=', monthStart.toISOString().split('T')[0])
    .where('startDate', '<=', monthEnd.toISOString().split('T')[0])
    .get();

  const weeklies = weekliesSnap.docs.map(d => ({ weekId: d.id, ...d.data() }));
  const weeksIncluded = weeklies.map(w => w.weekId).sort();

  // Aggregate from weeklies
  let totalCheckIns = 0, totalCheckInsPossible = 0;
  let moodSum = 0, cravingSum = 0, sleepSum = 0, energySum = 0, anxietySum = 0;
  let moodCount = 0;
  let totalReflections = 0, totalReflectionsPossible = 0;
  let totalMeetings = 0;
  let habitRateSum = 0;
  let resourcesViewed = 0, resourcesCompleted = 0;
  let communityPosts = 0, communityComments = 0;
  let messagesSent = 0;
  let totalGratitudes = 0;

  weeklies.forEach(w => {
    // Check-ins
    totalCheckIns += w.checkIns?.completed || 0;
    totalCheckInsPossible += w.checkIns?.total || 14;

    if (w.checkIns?.moodAvg) {
      moodSum += w.checkIns.moodAvg;
      cravingSum += w.checkIns.cravingAvg || 0;
      sleepSum += w.checkIns.sleepAvg || 0;
      energySum += w.checkIns.energyAvg || 0;
      anxietySum += w.checkIns.anxietyAvg || 0;
      moodCount++;
    }

    // Reflections
    totalReflections += w.reflections?.completed || 0;
    totalReflectionsPossible += w.reflections?.total || 7;

    // Gratitudes
    totalGratitudes += w.gratitudes?.count || 0;

    // Meetings
    totalMeetings += w.meetings?.attended || 0;

    // Habits
    habitRateSum += w.habits?.overallCompletionRate || 0;

    // Resources
    resourcesViewed += w.resources?.viewed || 0;
    resourcesCompleted += w.resources?.completed || 0;

    // Community
    communityPosts += w.community?.postsCreated || 0;
    communityComments += w.community?.commentsGiven || 0;

    // Messages
    messagesSent += w.messages?.sent || 0;
  });

  const weekCount = Math.max(weeklies.length, 1);

  // Get prior month for trends
  const priorMonthDate = new Date(monthDate);
  priorMonthDate.setMonth(priorMonthDate.getMonth() - 1);
  const priorMonthId = getMonthId(priorMonthDate);

  const priorMonthSnap = await userRef.collection('monthlySummaries').doc(priorMonthId).get();
  const priorMonth = priorMonthSnap.exists ? priorMonthSnap.data() : null;

  const moodAvg = moodCount > 0 ? Math.round((moodSum / moodCount) * 10) / 10 : 0;
  const cravingAvg = moodCount > 0 ? Math.round((cravingSum / moodCount) * 10) / 10 : 0;
  const sleepAvg = moodCount > 0 ? Math.round((sleepSum / moodCount) * 10) / 10 : 0;
  const energyAvg = moodCount > 0 ? Math.round((energySum / moodCount) * 10) / 10 : 0;
  const anxietyAvg = moodCount > 0 ? Math.round((anxietySum / moodCount) * 10) / 10 : 0;

  // Check for milestones achieved this month
  const milestones = [];
  const milestoneMarkers = [
    { days: 1, label: 'Day 1' },
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '30 Days' },
    { days: 60, label: '60 Days' },
    { days: 90, label: '90 Days' },
    { days: 180, label: '6 Months' },
    { days: 365, label: '1 Year' },
    { days: 730, label: '2 Years' },
    { days: 1095, label: '3 Years' },
  ];

  milestoneMarkers.forEach(({ days, label }) => {
    if (sobrietyDaysStart < days && sobrietyDaysEnd >= days) {
      milestones.push(label);
    }
  });

  return {
    monthId,
    startDate: monthStart.toISOString().split('T')[0],
    endDate: monthEnd.toISOString().split('T')[0],
    weeksIncluded,
    sobrietyDaysStart: Math.max(0, sobrietyDaysStart),
    sobrietyDaysEnd: Math.max(0, sobrietyDaysEnd),
    checkIns: {
      completed: totalCheckIns,
      total: totalCheckInsPossible,
      rate: totalCheckInsPossible > 0 ? Math.round((totalCheckIns / totalCheckInsPossible) * 100) / 100 : 0,
      moodAvg,
      moodTrend: priorMonth ? Math.round((moodAvg - (priorMonth.checkIns?.moodAvg || 0)) * 10) / 10 : 0,
      cravingAvg,
      cravingTrend: priorMonth ? Math.round((cravingAvg - (priorMonth.checkIns?.cravingAvg || 0)) * 10) / 10 : 0,
      sleepAvg,
      sleepTrend: priorMonth ? Math.round((sleepAvg - (priorMonth.checkIns?.sleepAvg || 0)) * 10) / 10 : 0,
      energyAvg,
      anxietyAvg,
    },
    reflections: {
      completed: totalReflections,
      total: totalReflectionsPossible,
      rate: totalReflectionsPossible > 0 ? Math.round((totalReflections / totalReflectionsPossible) * 100) / 100 : 0,
    },
    gratitudes: {
      total: totalGratitudes,
      avgPerWeek: Math.round((totalGratitudes / weekCount) * 10) / 10,
    },
    meetings: {
      total: totalMeetings,
      avgPerWeek: Math.round((totalMeetings / weekCount) * 10) / 10,
      trend: priorMonth ? totalMeetings - (priorMonth.meetings?.total || 0) : 0,
    },
    habits: {
      avgCompletionRate: Math.round((habitRateSum / weekCount) * 100) / 100,
    },
    resources: {
      viewed: resourcesViewed,
      completed: resourcesCompleted,
    },
    community: {
      posts: communityPosts,
      comments: communityComments,
    },
    messages: {
      sent: messagesSent,
    },
    milestones: {
      achieved: milestones,
    },
  };
}

module.exports = {
  aggregateMonthData,
  getMonthId,
  getMonthStart,
  getMonthEnd,
};
