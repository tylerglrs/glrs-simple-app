/**
 * Debug script to check reflections collection (without compound index)
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'glrs-pir-system' });
}

const db = admin.firestore();

function getDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateStreaks(dates, label) {
  console.log(`\n=== ${label} ===`);
  console.log(`Unique dates (${dates.length}):`, dates.slice(0, 20).join(', ') + (dates.length > 20 ? '...' : ''));

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort descending
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));

  const allStreaks = [];
  let longestStreakLength = 0;
  let tempStreak = { length: 0, startDate: '', endDate: '' };

  const today = new Date();
  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  console.log(`Today: ${todayStr}, Yesterday: ${yesterdayStr}`);

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];

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

    if (i === sortedDates.length - 1) {
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
      console.log(`Most recent streak ended on ${mostRecentStreak.endDate}, NOT today or yesterday`);
    }
  }

  console.log(`Current streak: ${currentStreakLength}`);
  console.log(`Longest streak: ${longestStreakLength}`);

  return { currentStreak: currentStreakLength, longestStreak: longestStreakLength };
}

async function debugReflections() {
  const userId = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';

  console.log('=== REFLECTIONS COLLECTION ===');
  // Query by userId only (no compound index needed)
  const reflections = await db.collection('reflections')
    .where('userId', '==', userId)
    .get();

  console.log(`Found ${reflections.size} reflections`);

  const reflectionDates = [];
  const reflectionDetails = [];

  reflections.forEach(doc => {
    const data = doc.data();
    let date;
    if (data.createdAt?.toDate) {
      date = data.createdAt.toDate();
    } else if (data.createdAt?._seconds) {
      date = new Date(data.createdAt._seconds * 1000);
    } else {
      date = new Date();
    }
    const dateStr = getDateString(date);
    reflectionDates.push(dateStr);
    reflectionDetails.push({
      date: dateStr,
      type: data.type,
      overallDay: data.overallDay,
      hasGratitude: !!data.gratitude,
      hasChallenges: !!data.challenges,
    });
  });

  // Sort and show
  reflectionDetails.sort((a, b) => b.date.localeCompare(a.date));
  console.log('\nReflection details (sorted by date):');
  reflectionDetails.forEach((r, i) => {
    console.log(`${i + 1}. ${r.date} - type: ${r.type}, overallDay: ${r.overallDay}, gratitude: ${r.hasGratitude}, challenges: ${r.hasChallenges}`);
  });

  // Calculate streak from reflections collection
  const uniqueDates = [...new Set(reflectionDates)];
  calculateStreaks(uniqueDates, 'Reflection Streak (from reflections collection)');

  console.log('\n=== CHECK-INS WITH morningData ===');
  const checkIns = await db.collection('checkIns')
    .where('userId', '==', userId)
    .get();

  const morningDates = [];
  const eveningDates = [];

  checkIns.forEach(doc => {
    const data = doc.data();
    let date;
    if (data.createdAt?.toDate) {
      date = data.createdAt.toDate();
    } else if (data.createdAt?._seconds) {
      date = new Date(data.createdAt._seconds * 1000);
    } else {
      date = new Date();
    }
    const dateStr = getDateString(date);

    // Check for morning data
    if (data.type === 'morning' || data.morningData) {
      morningDates.push(dateStr);
    }

    // Check for evening data (from checkIns)
    if (data.type === 'evening' || data.eveningData) {
      eveningDates.push(dateStr);
    }
  });

  console.log(`Check-ins with morning data: ${morningDates.length}`);
  console.log(`Check-ins with evening data: ${eveningDates.length}`);

  const uniqueMorningDates = [...new Set(morningDates)];
  const uniqueEveningDates = [...new Set(eveningDates)];

  calculateStreaks(uniqueMorningDates, 'Morning Check-In Streak (from checkIns)');
  calculateStreaks(uniqueEveningDates, 'Evening Reflection Streak (from checkIns.eveningData)');

  console.log('\n=== COMBINED REFLECTION STREAK ===');
  // Combine both sources
  const allReflectionDates = [...new Set([...reflectionDates, ...eveningDates])];
  calculateStreaks(allReflectionDates, 'Combined Reflection Streak (reflections + checkIns.eveningData)');

  process.exit(0);
}

debugReflections();
