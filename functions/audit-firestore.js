// Firestore Audit Script
// Run with: node audit-firestore.js

const admin = require('firebase-admin');

// Use application default credentials
admin.initializeApp({
  projectId: 'glrs-pir-system'
});

const db = admin.firestore();

// Helper functions
function getDateString(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calculateStreaksFromDates(dateStrings) {
  if (dateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] };
  }

  // Extract unique dates and sort descending (most recent first)
  const dates = [...new Set(dateStrings)].sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] };
  }

  const allStreaks = [];
  let longestStreakLength = 0;
  let tempStreak = { length: 0, startDate: '', endDate: '' };

  const today = new Date();
  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  for (let i = 0; i < dates.length; i++) {
    const currentDate = dates[i];

    if (tempStreak.length === 0) {
      tempStreak = { length: 1, startDate: currentDate, endDate: currentDate };
    } else {
      const current = new Date(currentDate);
      const previous = new Date(tempStreak.startDate);
      const diffTime = previous.getTime() - current.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak.length++;
        tempStreak.startDate = currentDate;
      } else {
        allStreaks.push({ ...tempStreak });
        if (tempStreak.length > longestStreakLength) {
          longestStreakLength = tempStreak.length;
        }
        tempStreak = { length: 1, startDate: currentDate, endDate: currentDate };
      }
    }

    if (i === dates.length - 1) {
      allStreaks.push({ ...tempStreak });
      if (tempStreak.length > longestStreakLength) {
        longestStreakLength = tempStreak.length;
      }
    }
  }

  let currentStreakLength = 0;
  if (allStreaks.length > 0) {
    const mostRecentStreak = allStreaks[0];
    if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
      currentStreakLength = mostRecentStreak.length;
    }
  }

  return {
    currentStreak: currentStreakLength,
    longestStreak: longestStreakLength,
    allStreaks: allStreaks.filter(s => s.length >= 2).sort((a, b) => b.length - a.length)
  };
}

async function auditUser() {
  console.log('='.repeat(80));
  console.log('FIRESTORE AUDIT - Streak Cards & Modals');
  console.log('='.repeat(80));
  console.log('Date:', new Date().toISOString());
  console.log('');

  // Find user "Heinz Roberts" or first user with check-ins
  const usersSnapshot = await db.collection('users').get();
  let targetUserId = null;
  let targetUserName = null;

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    if (userData.firstName === 'Heinz' && userData.lastName === 'Roberts') {
      targetUserId = doc.id;
      targetUserName = `${userData.firstName} ${userData.lastName}`;
      break;
    }
  }

  if (!targetUserId) {
    console.log('User "Heinz Roberts" not found. Looking for first user with check-ins...');
    const checkInsSnapshot = await db.collection('checkIns').limit(1).get();
    if (!checkInsSnapshot.empty) {
      targetUserId = checkInsSnapshot.docs[0].data().userId;
      const userDoc = await db.collection('users').doc(targetUserId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        targetUserName = `${userData.firstName || 'Unknown'} ${userData.lastName || 'User'}`;
      }
    }
  }

  if (!targetUserId) {
    console.log('No users with check-ins found!');
    process.exit(1);
  }

  console.log(`User: ${targetUserName} (${targetUserId})`);
  console.log('');

  // ============================================================
  // 1. COUNT ALL DOCUMENTS
  // ============================================================
  console.log('1. DOCUMENT COUNTS');
  console.log('-'.repeat(40));

  const checkInsSnapshot = await db.collection('checkIns')
    .where('userId', '==', targetUserId)
    .get();
  console.log(`   checkIns collection: ${checkInsSnapshot.size} documents`);

  const reflectionsSnapshot = await db.collection('reflections')
    .where('userId', '==', targetUserId)
    .get();
  console.log(`   reflections collection: ${reflectionsSnapshot.size} documents`);

  const quickReflectionsSnapshot = await db.collection('quickReflections')
    .where('userId', '==', targetUserId)
    .get();
  console.log(`   quickReflections collection: ${quickReflectionsSnapshot.size} documents`);

  console.log('');

  // ============================================================
  // 2. ANALYZE CHECK-INS
  // ============================================================
  console.log('2. CHECK-IN ANALYSIS');
  console.log('-'.repeat(40));

  const checkIns = checkInsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const morningCheckIns = checkIns.filter(c => c.type === 'morning' || c.morningData);
  const eveningCheckIns = checkIns.filter(c => c.type === 'evening' || c.eveningData);

  console.log(`   Morning check-ins (type='morning' OR morningData): ${morningCheckIns.length}`);
  console.log(`   Evening check-ins (type='evening' OR eveningData): ${eveningCheckIns.length}`);

  // Unique dates with morning check-ins
  const morningDates = [...new Set(morningCheckIns.map(c => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return getDateString(date);
  }))];
  console.log(`   Unique dates with morning check-ins: ${morningDates.length}`);

  // Unique dates with evening check-ins
  const eveningDates = [...new Set(eveningCheckIns.map(c => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return getDateString(date);
  }))];
  console.log(`   Unique dates with evening check-ins: ${eveningDates.length}`);

  console.log('');

  // ============================================================
  // 3. CALCULATE CHECK-IN STREAK (Morning only)
  // ============================================================
  console.log('3. CHECK-IN STREAK (Morning Check-Ins Only)');
  console.log('-'.repeat(40));

  const checkInStreakData = calculateStreaksFromDates(morningDates);
  console.log(`   Current Streak: ${checkInStreakData.currentStreak} days`);
  console.log(`   Longest Streak: ${checkInStreakData.longestStreak} days`);
  console.log(`   Top 5 Streaks:`);
  checkInStreakData.allStreaks.slice(0, 5).forEach((s, i) => {
    console.log(`      ${i + 1}. ${s.length} days (${s.startDate} to ${s.endDate})`);
  });

  console.log('');

  // ============================================================
  // 4. ANALYZE REFLECTIONS
  // ============================================================
  console.log('4. REFLECTION ANALYSIS');
  console.log('-'.repeat(40));

  const reflections = reflectionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get all reflection dates (from both collections)
  const checkInReflectionDates = eveningCheckIns.map(c => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return getDateString(date);
  });

  const separateReflectionDates = reflections.map(r => {
    const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
    return getDateString(date);
  });

  const allReflectionDates = [...checkInReflectionDates, ...separateReflectionDates];
  const uniqueReflectionDates = [...new Set(allReflectionDates)];

  console.log(`   Evening check-ins in checkIns collection: ${eveningCheckIns.length}`);
  console.log(`   Standalone reflections in reflections collection: ${reflections.length}`);
  console.log(`   Total unique reflection dates (combined): ${uniqueReflectionDates.length}`);

  console.log('');

  // ============================================================
  // 5. CALCULATE REFLECTION STREAK (Combined sources)
  // ============================================================
  console.log('5. REFLECTION STREAK (Combined: checkIns + reflections)');
  console.log('-'.repeat(40));

  const reflectionStreakData = calculateStreaksFromDates(allReflectionDates);
  console.log(`   Current Streak: ${reflectionStreakData.currentStreak} days`);
  console.log(`   Longest Streak: ${reflectionStreakData.longestStreak} days`);
  console.log(`   Top 5 Streaks:`);
  reflectionStreakData.allStreaks.slice(0, 5).forEach((s, i) => {
    console.log(`      ${i + 1}. ${s.length} days (${s.startDate} to ${s.endDate})`);
  });

  console.log('');

  // ============================================================
  // 6. CALCULATE 7-DAY CHECK-IN RATE
  // ============================================================
  console.log('6. 7-DAY CHECK-IN RATE');
  console.log('-'.repeat(40));

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysMorningDates = morningDates.filter(dateStr => {
    const date = new Date(dateStr);
    return date >= sevenDaysAgo;
  });

  const checkRate = Math.min(100, Math.round((last7DaysMorningDates.length / 7) * 100));
  console.log(`   Morning check-ins in last 7 days: ${last7DaysMorningDates.length}`);
  console.log(`   7-Day Check Rate: ${checkRate}%`);

  console.log('');

  // ============================================================
  // 7. CALCULATE 7-DAY AVERAGE MOOD
  // ============================================================
  console.log('7. 7-DAY AVERAGE MOOD');
  console.log('-'.repeat(40));

  const last7DaysMorningCheckIns = morningCheckIns.filter(c => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return date >= sevenDaysAgo;
  });

  const moodValues = last7DaysMorningCheckIns
    .map(c => c.mood || c.morningData?.mood)
    .filter(v => v !== undefined && v !== null);

  const avgMood = moodValues.length > 0
    ? Math.round((moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length) * 10) / 10
    : 0;

  console.log(`   Morning check-ins in last 7 days: ${last7DaysMorningCheckIns.length}`);
  console.log(`   Mood values: ${moodValues.join(', ')}`);
  console.log(`   7-Day Average Mood: ${avgMood}`);

  console.log('');

  // ============================================================
  // 8. REFLECTIONS THIS MONTH
  // ============================================================
  console.log('8. REFLECTIONS THIS MONTH (December 2025)');
  console.log('-'.repeat(40));

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const thisMonthCheckInReflections = eveningCheckIns.filter(c => {
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return date >= firstDayOfMonth;
  });

  const thisMonthSeparateReflections = reflections.filter(r => {
    const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
    return date >= firstDayOfMonth;
  });

  const thisMonthDates = new Set([
    ...thisMonthCheckInReflections.map(c => {
      const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      return getDateString(date);
    }),
    ...thisMonthSeparateReflections.map(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      return getDateString(date);
    })
  ]);

  console.log(`   Evening check-ins this month: ${thisMonthCheckInReflections.length}`);
  console.log(`   Separate reflections this month: ${thisMonthSeparateReflections.length}`);
  console.log(`   Unique reflection dates this month: ${thisMonthDates.size}`);

  console.log('');

  // ============================================================
  // 9. SUMMARY COMPARISON
  // ============================================================
  console.log('='.repeat(80));
  console.log('SUMMARY - ACTUAL FIRESTORE VALUES');
  console.log('='.repeat(80));
  console.log('');
  console.log('| Metric                    | Actual Value |');
  console.log('|---------------------------|--------------|');
  console.log(`| Check-In Current Streak   | ${checkInStreakData.currentStreak} days      |`);
  console.log(`| Check-In Longest Streak   | ${checkInStreakData.longestStreak} days      |`);
  console.log(`| Reflection Current Streak | ${reflectionStreakData.currentStreak} days      |`);
  console.log(`| Reflection Longest Streak | ${reflectionStreakData.longestStreak} days      |`);
  console.log(`| 7-Day Check Rate          | ${checkRate}%          |`);
  console.log(`| 7-Day Avg Mood            | ${avgMood}          |`);
  console.log(`| Reflections This Month    | ${thisMonthDates.size}            |`);
  console.log(`| Total Check-Ins           | ${checkIns.length}           |`);
  console.log(`| Total Reflections (all)   | ${uniqueReflectionDates.length}           |`);
  console.log('');

  process.exit(0);
}

auditUser().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
