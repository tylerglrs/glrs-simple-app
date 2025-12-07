/**
 * Debug script to analyze streak calculations
 * Run with: node functions/scripts/debug-streaks.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'glrs-pir-system',
  });
}

const db = admin.firestore();

// Helper functions (same as useCheckInsQuery.ts)
function getDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getCheckInDate(checkIn) {
  if (checkIn.createdAt?.toDate) {
    return checkIn.createdAt.toDate();
  }
  return new Date(checkIn.createdAt);
}

function calculateStreaks(checkIns, filterFn, label) {
  const filteredCheckIns = checkIns.filter(filterFn);
  console.log(`\n=== ${label} ===`);
  console.log(`Total filtered check-ins: ${filteredCheckIns.length}`);

  if (filteredCheckIns.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] };
  }

  // Extract unique dates
  const dateSet = new Set();
  filteredCheckIns.forEach((c) => {
    const date = getCheckInDate(c);
    const dateStr = getDateString(date);
    dateSet.add(dateStr);
  });

  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  console.log(`Unique dates (${dates.length}):`, dates.slice(0, 20).join(', ') + (dates.length > 20 ? '...' : ''));

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] };
  }

  // Calculate streaks
  const allStreaks = [];
  let longestStreakLength = 0;
  let tempStreak = { length: 0, startDate: '', endDate: '' };

  const today = new Date();
  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  console.log(`Today: ${todayStr}, Yesterday: ${yesterdayStr}`);

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

  // Determine current streak
  let currentStreakLength = 0;
  if (allStreaks.length > 0) {
    const mostRecentStreak = allStreaks[0];
    console.log(`Most recent streak: ${JSON.stringify(mostRecentStreak)}`);
    if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
      currentStreakLength = mostRecentStreak.length;
    } else {
      console.log(`Most recent streak ended on ${mostRecentStreak.endDate}, which is NOT today or yesterday`);
    }
  }

  console.log(`Current streak: ${currentStreakLength}`);
  console.log(`Longest streak: ${longestStreakLength}`);
  console.log(`All streaks (top 5):`, allStreaks.slice(0, 5));

  return {
    currentStreak: currentStreakLength,
    longestStreak: longestStreakLength,
    allStreaks: allStreaks.filter((s) => s.length >= 2).sort((a, b) => b.length - a.length),
  };
}

async function debugStreaks() {
  try {
    // First, find user "Heinz Roberts"
    console.log('Looking for user Heinz Roberts...');
    const usersSnapshot = await db.collection('users')
      .where('firstName', '==', 'Heinz')
      .limit(5)
      .get();

    if (usersSnapshot.empty) {
      // Try displayName
      const usersSnapshot2 = await db.collection('users')
        .where('displayName', '>=', 'Heinz')
        .where('displayName', '<=', 'Heinz\uf8ff')
        .limit(5)
        .get();

      if (usersSnapshot2.empty) {
        console.log('User not found. Listing all users...');
        const allUsers = await db.collection('users').limit(10).get();
        allUsers.forEach(doc => {
          const data = doc.data();
          console.log(`- ${doc.id}: ${data.firstName} ${data.lastName} (${data.email})`);
        });
        return;
      }

      usersSnapshot2.forEach(doc => {
        console.log(`Found user: ${doc.id} - ${doc.data().displayName}`);
      });
    }

    let userId = null;
    usersSnapshot.forEach(doc => {
      userId = doc.id;
      const data = doc.data();
      console.log(`Found user: ${userId} - ${data.firstName} ${data.lastName} (${data.email})`);
    });

    if (!userId) {
      // Use a known user ID if available
      console.log('\nTrying known user ID: QuxUOqnjM0VeK8M7JNnPe1vMTA82');
      userId = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';
    }

    // Query check-ins
    console.log(`\nQuerying check-ins for user: ${userId}`);
    const checkInsSnapshot = await db.collection('checkIns')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    console.log(`Found ${checkInsSnapshot.size} check-ins`);

    const checkIns = [];
    checkInsSnapshot.forEach(doc => {
      checkIns.push({ id: doc.id, ...doc.data() });
    });

    // Debug: Show first few check-ins
    console.log('\n=== First 10 Check-Ins ===');
    checkIns.slice(0, 10).forEach((c, i) => {
      const date = getCheckInDate(c);
      console.log(`${i + 1}. ${getDateString(date)} - type: ${c.type}, morning: ${!!c.morningData}, evening: ${!!c.eveningData}`);
    });

    // Calculate check-in streak (morning check-ins)
    const checkInStreakData = calculateStreaks(
      checkIns,
      (c) => c.type === 'morning' || !!c.morningData,
      'Check-In Streak (Morning)'
    );

    // Calculate reflection streak (evening reflections)
    const reflectionStreakData = calculateStreaks(
      checkIns,
      (c) => !!c.eveningData,
      'Reflection Streak (Evening)'
    );

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Check-In Current Streak: ${checkInStreakData.currentStreak} days`);
    console.log(`Check-In Longest Streak: ${checkInStreakData.longestStreak} days`);
    console.log(`Reflection Current Streak: ${reflectionStreakData.currentStreak} days`);
    console.log(`Reflection Longest Streak: ${reflectionStreakData.longestStreak} days`);

    // Check for issues
    console.log('\n=== POTENTIAL ISSUES ===');

    // Check if there are evening reflections stored differently
    const reflections = checkIns.filter(c => c.eveningData);
    console.log(`Evening reflections in checkIns: ${reflections.length}`);

    // Check if reflections might be in a separate collection
    const separateReflections = await db.collection('reflections')
      .where('userId', '==', userId)
      .limit(10)
      .get();
    console.log(`Reflections in separate 'reflections' collection: ${separateReflections.size}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

debugStreaks();
