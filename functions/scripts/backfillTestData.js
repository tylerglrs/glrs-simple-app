/**
 * Backfill Test Data Script
 *
 * Generates 90 days of realistic historical data for testing AI features.
 * Run with: node scripts/backfillTestData.js <userId>
 *
 * Collections populated:
 * - checkIns (morning + evening)
 * - reflections
 * - gratitudes
 * - habitCompletions
 * - meetings (logged attendance)
 * - wins (daily wins)
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'glrs-pir-system'
});

const db = admin.firestore();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  daysToGenerate: 90,
  checkInRate: 0.85, // 85% completion rate
  habitWeekdayRate: 0.70, // 70% completion on weekdays
  habitWeekendRate: 0.50, // 50% completion on weekends
  meetingsPerWeek: 2.5, // Average 2-3 meetings per week
  cravingSpikeCycle: 14, // Days between craving spikes
  gratitudesPerDay: { min: 1, max: 3 },
  winsPerDay: { min: 0, max: 2 },
};

// =============================================================================
// TEMPLATE DATA
// =============================================================================

const GRATITUDE_TEMPLATES = [
  // Support System
  "Grateful for my sponsor checking in on me today",
  "Thankful for the recovery community support",
  "Grateful my coach believed in me",
  "Thankful for the meeting tonight - exactly what I needed",
  "Grateful for honest conversations with my therapist",
  "Thankful for accountability partners who get it",
  "Grateful for the online recovery group",

  // Family & Relationships
  "Good conversation with my sister today",
  "Thankful my parents are still in my corner",
  "Grateful for a peaceful dinner with family",
  "Thankful my kids gave me hugs this morning",
  "Grateful for quality time with my spouse",
  "Thankful for a friend who listened without judgment",
  "Grateful my brother called to check on me",
  "Thankful for family movie night",

  // Personal Growth
  "Grateful I woke up sober another day",
  "Thankful for progress, not perfection",
  "Grateful I handled that trigger without using",
  "Thankful for the clarity I have now",
  "Grateful for the energy to exercise today",
  "Thankful I'm learning to feel my feelings",
  "Grateful for another chance to do better",
  "Thankful I recognized the warning signs early",

  // Simple Pleasures
  "Grateful for a good cup of coffee this morning",
  "Thankful for the sunshine today",
  "Grateful for a solid night's sleep",
  "Thankful for the peace of early morning",
  "Grateful for a home-cooked meal",
  "Thankful for my comfortable bed",
  "Grateful for quiet moments of reflection",

  // Health & Wellness
  "Grateful my body is healing",
  "Thankful for improved sleep quality",
  "Grateful for the ability to exercise again",
  "Thankful for clearer thinking",
  "Grateful for stable emotions today",
  "Thankful for healthy appetite returning",
  "Grateful for increased energy levels",

  // Work & Purpose
  "Grateful I showed up to work on time",
  "Thankful for productive focus today",
  "Grateful my boss noticed my improvement",
  "Thankful for job security",
  "Grateful I'm rebuilding my reputation",
  "Thankful for the ability to be present at work",
  "Grateful for coworkers who are supportive",

  // Recovery Milestones
  "Grateful for another day of sobriety",
  "Thankful I made it through another week",
  "Grateful for reaching this milestone",
  "Thankful for how far I've come",
  "Grateful the cravings are getting easier",
  "Thankful I chose recovery again today",
];

const CHALLENGE_TEMPLATES = [
  // Stress & Triggers
  "Work stress made me irritable today",
  "Had a difficult conversation that triggered old patterns",
  "Financial stress was heavy on my mind",
  "Traffic and small frustrations piled up",
  "Deadline pressure at work",
  "Argument with family member",
  "Unexpected bad news",

  // Craving-Related
  "Strong craving hit around 5pm",
  "Saw old drinking buddy, felt the pull",
  "Passed by my old hangout spot",
  "Stressful day made cravings spike",
  "Boredom led to thinking about using",
  "Social event without substances was hard",

  // Emotional
  "Feeling isolated and lonely today",
  "Old shame came back up",
  "Anger was hard to control",
  "Felt overwhelmed by everything",
  "Anxiety was high all day",
  "Struggled with negative self-talk",
  "Grief hit unexpectedly",

  // Sleep & Energy
  "Couldn't sleep well - racing thoughts",
  "Exhausted but couldn't rest",
  "Low energy made everything harder",
  "Nightmares disrupted sleep",

  // Recovery-Specific
  "Missed my morning routine",
  "Skipped my meeting - made excuses",
  "Didn't call my sponsor when I should have",
  "Isolated instead of reaching out",
  "Let resentment build up",
];

const REFLECTION_TEMPLATES = [
  // Victories
  "Today I practiced patience when I would have lost my temper before. This is growth.",
  "I sat with uncomfortable feelings instead of numbing them. Hard but worth it.",
  "Used the breathing technique when triggered - it actually helped.",
  "Called my sponsor before things got bad. Learning to ask for help.",

  // Insights
  "Noticing how much sleep affects my mood the next day.",
  "I realize I've been isolating - need to reach out more.",
  "The connection between my stress and cravings is so clear now.",
  "Understanding that HALT (Hungry, Angry, Lonely, Tired) is real.",

  // Gratitude-focused
  "Despite the hard moments, I'm grateful I'm here doing this work.",
  "Looking back at where I was, I've come so far.",
  "Small wins are adding up. Staying hopeful.",

  // Challenges
  "Today was hard. Didn't handle things perfectly but I stayed sober.",
  "Struggled with comparison - need to focus on my own journey.",
  "Some days the weight of what I've lost hits me hard.",
  "Working through guilt about the past is exhausting but necessary.",

  // Planning
  "Need to be more intentional about my recovery activities.",
  "Tomorrow I'll try to hit a meeting - I've been avoiding them.",
  "Going to reach out to at least one person tomorrow.",
  "Setting boundaries is still hard but getting easier.",
];

const WIN_TEMPLATES = [
  // Daily Victories
  "Made it through a tough moment without using",
  "Exercised for 20 minutes",
  "Ate three healthy meals",
  "Got to bed on time",
  "Helped someone else today",
  "Made it to my meeting",
  "Called my sponsor",
  "Practiced gratitude journaling",
  "Did my breathing exercises",
  "Took my medications on time",

  // Social Wins
  "Had a meaningful conversation",
  "Reached out when I was struggling",
  "Set a healthy boundary",
  "Apologized for past behavior",
  "Made amends to someone",

  // Work/Life Wins
  "Completed a work project",
  "Stayed focused all day",
  "Handled conflict maturely",
  "Kept my commitments",
  "Was fully present with family",
];

const DEFAULT_HABITS = [
  { id: 'morning_meditation', name: 'Morning Meditation' },
  { id: 'gratitude_journal', name: 'Gratitude Journal' },
  { id: 'exercise', name: 'Exercise' },
  { id: 'attend_meeting', name: 'Attend Meeting' },
  { id: 'call_sponsor', name: 'Call Sponsor' },
  { id: 'read_recovery', name: 'Recovery Reading' },
  { id: 'evening_reflection', name: 'Evening Reflection' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Generate mood based on patterns
function generateMood(date, daysSinceCravingSpike, previousDayMood, sleepQuality) {
  let baseMood = 6; // Average baseline

  // Weekend boost
  if (isWeekend(date)) {
    baseMood += 0.5;
  }

  // Mid-week dip (Tuesday-Thursday)
  const dayOfWeek = date.getDay();
  if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    baseMood -= 0.5;
  }

  // Craving spike impact
  if (daysSinceCravingSpike < 3) {
    baseMood -= (3 - daysSinceCravingSpike) * 0.5;
  }

  // Sleep impact (poor sleep = lower mood next day)
  if (sleepQuality && sleepQuality < 5) {
    baseMood -= (5 - sleepQuality) * 0.3;
  }

  // Slight regression toward mean from previous day
  if (previousDayMood) {
    baseMood = baseMood * 0.7 + previousDayMood * 0.3;
  }

  // Add randomness
  baseMood += randomFloat(-1, 1);

  return Math.max(1, Math.min(10, Math.round(baseMood)));
}

// Generate craving with spike pattern
function generateCraving(date, dayInCycle) {
  let baseCraving = 3; // Default low craving

  // Spike every ~14 days
  if (dayInCycle % CONFIG.cravingSpikeCycle < 2) {
    baseCraving = randomInt(6, 9); // High craving spike
  } else if (dayInCycle % CONFIG.cravingSpikeCycle < 4) {
    baseCraving = randomInt(4, 6); // Elevated but recovering
  }

  // Weekends can trigger
  if (isWeekend(date) && Math.random() < 0.3) {
    baseCraving += randomInt(1, 2);
  }

  // Add randomness
  baseCraving += randomInt(-1, 1);

  return Math.max(1, Math.min(10, baseCraving));
}

// Generate anxiety with correlation to cravings
function generateAnxiety(craving, mood) {
  // Anxiety correlates with high craving and low mood
  let baseAnxiety = 4;

  if (craving >= 7) {
    baseAnxiety += (craving - 4) * 0.5;
  }

  if (mood <= 4) {
    baseAnxiety += (6 - mood) * 0.3;
  }

  // Add randomness
  baseAnxiety += randomFloat(-1.5, 1.5);

  return Math.max(1, Math.min(10, Math.round(baseAnxiety)));
}

// Generate sleep quality
function generateSleep() {
  // Most nights are 5-7, occasional very good or bad
  const roll = Math.random();
  if (roll < 0.1) return randomInt(2, 4); // Bad night
  if (roll > 0.9) return randomInt(8, 9); // Great night
  return randomInt(5, 7); // Normal night
}

// Generate energy with correlation to sleep
function generateEnergy(sleepQuality) {
  let baseEnergy = sleepQuality; // Strongly tied to sleep

  // Add some randomness
  baseEnergy += randomFloat(-1, 1);

  return Math.max(1, Math.min(10, Math.round(baseEnergy)));
}

// Generate notes based on metrics
function generateNote(mood, craving, anxiety, date) {
  const notes = [];

  if (craving >= 7) {
    notes.push(randomElement([
      "Strong urge today, used breathing techniques.",
      "Craving hit hard this afternoon.",
      "Called my sponsor about the craving.",
      "Went to a meeting to get through it.",
    ]));
  }

  if (mood <= 4) {
    notes.push(randomElement([
      "Tough day emotionally.",
      "Feeling down, but pushing through.",
      "Struggling but staying sober.",
    ]));
  }

  if (anxiety >= 7) {
    notes.push(randomElement([
      "High anxiety - used grounding exercises.",
      "Anxious thoughts were hard to quiet.",
      "Practiced 4-7-8 breathing for anxiety.",
    ]));
  }

  if (notes.length === 0) {
    notes.push(randomElement([
      "Steady day overall.",
      "Feeling okay today.",
      "Making progress.",
      "One day at a time.",
    ]));
  }

  return notes.join(' ');
}

// =============================================================================
// DATA GENERATORS
// =============================================================================

async function generateCheckIn(userId, date, type, metrics) {
  const checkInRef = db.collection('checkIns').doc();

  const checkInData = {
    userId,
    type, // 'morning' or 'evening'
    date: admin.firestore.Timestamp.fromDate(date),
    createdAt: admin.firestore.Timestamp.fromDate(date),
    mood: metrics.mood,
    craving: metrics.craving,
    anxiety: metrics.anxiety,
    sleep: metrics.sleep,
    energy: metrics.energy,
    note: metrics.note || '',
  };

  if (type === 'evening') {
    checkInData.highlight = randomElement([
      "Stayed sober",
      "Made it to a meeting",
      "Connected with someone",
      "Practiced self-care",
      "Kept my commitments",
    ]);

    checkInData.challenge = randomElement(CHALLENGE_TEMPLATES);
  }

  await checkInRef.set(checkInData);
  return checkInData;
}

async function generateReflection(userId, date, mood) {
  const reflectionRef = db.collection('reflections').doc();

  let template;
  if (mood >= 7) {
    // Positive reflections
    template = randomElement(REFLECTION_TEMPLATES.filter(t =>
      t.includes('growth') || t.includes('grateful') || t.includes('worth') || t.includes('helped')
    ));
  } else if (mood <= 4) {
    // Struggling reflections
    template = randomElement(REFLECTION_TEMPLATES.filter(t =>
      t.includes('hard') || t.includes('struggle') || t.includes('guilt') || t.includes('weight')
    ));
  } else {
    template = randomElement(REFLECTION_TEMPLATES);
  }

  const reflectionData = {
    userId,
    content: template,
    date: admin.firestore.Timestamp.fromDate(date),
    createdAt: admin.firestore.Timestamp.fromDate(date),
    mood: mood,
    type: 'evening',
  };

  await reflectionRef.set(reflectionData);
  return reflectionData;
}

async function generateGratitudes(userId, date, count) {
  const gratitudes = [];
  const templates = randomElements(GRATITUDE_TEMPLATES, count);

  for (const template of templates) {
    const gratitudeRef = db.collection('gratitudes').doc();
    const gratitudeData = {
      userId,
      content: template,
      date: admin.firestore.Timestamp.fromDate(date),
      createdAt: admin.firestore.Timestamp.fromDate(date),
    };
    await gratitudeRef.set(gratitudeData);
    gratitudes.push(gratitudeData);
  }

  return gratitudes;
}

async function generateWins(userId, date, count) {
  const wins = [];
  const templates = randomElements(WIN_TEMPLATES, count);

  for (const template of templates) {
    const winRef = db.collection('wins').doc();
    const winData = {
      userId,
      content: template,
      date: admin.firestore.Timestamp.fromDate(date),
      createdAt: admin.firestore.Timestamp.fromDate(date),
    };
    await winRef.set(winData);
    wins.push(winData);
  }

  return wins;
}

async function generateHabitCompletions(userId, date, habits, isWeekendDay) {
  const completions = [];
  const completionRate = isWeekendDay ? CONFIG.habitWeekendRate : CONFIG.habitWeekdayRate;

  for (const habit of habits) {
    if (Math.random() < completionRate) {
      const completionRef = db.collection('habitCompletions').doc();
      const completionData = {
        userId,
        habitId: habit.id,
        habitName: habit.name,
        date: admin.firestore.Timestamp.fromDate(date),
        completedAt: admin.firestore.Timestamp.fromDate(date),
        completed: true,
      };
      await completionRef.set(completionData);
      completions.push(completionData);
    }
  }

  return completions;
}

async function generateMeetingAttendance(userId, date) {
  const meetingRef = db.collection('meetings').doc();

  const meetingTypes = [
    { name: 'AA Meeting - Daily Reflections', type: 'AA' },
    { name: 'NA Meeting - Living Clean', type: 'NA' },
    { name: 'AA Speaker Meeting', type: 'AA' },
    { name: 'SMART Recovery', type: 'SMART' },
    { name: 'Refuge Recovery', type: 'Refuge' },
    { name: 'Online Recovery Meeting', type: 'Online' },
  ];

  const meeting = randomElement(meetingTypes);

  const meetingData = {
    userId,
    meetingName: meeting.name,
    meetingType: meeting.type,
    date: admin.firestore.Timestamp.fromDate(date),
    attendedAt: admin.firestore.Timestamp.fromDate(date),
    notes: randomElement([
      "Good share about gratitude",
      "Identified with the speaker",
      "Picked up my chip",
      "Connected with someone new",
      "Felt supported",
      "",
    ]),
  };

  await meetingRef.set(meetingData);
  return meetingData;
}

// =============================================================================
// MAIN BACKFILL FUNCTION
// =============================================================================

async function backfillData(userId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Starting backfill for user: ${userId}`);
  console.log(`Generating ${CONFIG.daysToGenerate} days of data...`);
  console.log(`${'='.repeat(60)}\n`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = addDays(today, -CONFIG.daysToGenerate);

  let stats = {
    morningCheckIns: 0,
    eveningCheckIns: 0,
    reflections: 0,
    gratitudes: 0,
    wins: 0,
    habitCompletions: 0,
    meetings: 0,
  };

  let previousDayMood = 6;
  let previousDaySleep = 6;
  let daysSinceMeeting = 0;
  let meetingsThisWeek = 0;
  let dayOfWeekCount = 0;

  // Get or create user's habits
  const habitsSnapshot = await db.collection('habits')
    .where('userId', '==', userId)
    .get();

  let userHabits;
  if (habitsSnapshot.empty) {
    console.log('No habits found, creating default habits...');
    userHabits = DEFAULT_HABITS.slice(0, randomInt(3, 5));

    for (const habit of userHabits) {
      await db.collection('habits').doc().set({
        userId,
        ...habit,
        createdAt: admin.firestore.Timestamp.fromDate(startDate),
        active: true,
      });
    }
  } else {
    userHabits = habitsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || doc.data().habitName,
    }));
  }

  console.log(`Using ${userHabits.length} habits for completions\n`);

  for (let dayOffset = 0; dayOffset < CONFIG.daysToGenerate; dayOffset++) {
    const currentDate = addDays(startDate, dayOffset);
    const dateKey = getDateKey(currentDate);
    const isWeekendDay = isWeekend(currentDate);
    const dayOfWeek = currentDate.getDay();

    // Reset weekly meeting counter on Sunday
    if (dayOfWeek === 0) {
      meetingsThisWeek = 0;
    }
    dayOfWeekCount++;

    // Generate metrics
    const sleep = generateSleep();
    const craving = generateCraving(currentDate, dayOffset);
    const mood = generateMood(currentDate, dayOffset % CONFIG.cravingSpikeCycle, previousDayMood, previousDaySleep);
    const anxiety = generateAnxiety(craving, mood);
    const energy = generateEnergy(sleep);
    const note = generateNote(mood, craving, anxiety, currentDate);

    const metrics = { mood, craving, anxiety, sleep, energy, note };

    // Decide if we check in today (85% rate)
    const doesCheckIn = Math.random() < CONFIG.checkInRate;

    if (doesCheckIn) {
      // Morning check-in
      const morningDate = new Date(currentDate);
      morningDate.setHours(7 + randomInt(0, 3), randomInt(0, 59), 0, 0);

      await generateCheckIn(userId, morningDate, 'morning', metrics);
      stats.morningCheckIns++;

      // Evening check-in (95% if morning happened)
      if (Math.random() < 0.95) {
        const eveningDate = new Date(currentDate);
        eveningDate.setHours(18 + randomInt(0, 4), randomInt(0, 59), 0, 0);

        await generateCheckIn(userId, eveningDate, 'evening', metrics);
        stats.eveningCheckIns++;

        // Reflection with evening check-in (80%)
        if (Math.random() < 0.8) {
          await generateReflection(userId, eveningDate, mood);
          stats.reflections++;
        }
      }

      // Gratitudes (1-3 per day when checking in)
      const gratitudeCount = randomInt(CONFIG.gratitudesPerDay.min, CONFIG.gratitudesPerDay.max);
      await generateGratitudes(userId, currentDate, gratitudeCount);
      stats.gratitudes += gratitudeCount;

      // Wins (0-2 per day, 60% chance)
      if (Math.random() < 0.6) {
        const winCount = randomInt(CONFIG.winsPerDay.min, CONFIG.winsPerDay.max);
        if (winCount > 0) {
          await generateWins(userId, currentDate, winCount);
          stats.wins += winCount;
        }
      }

      // Habit completions
      const completions = await generateHabitCompletions(userId, currentDate, userHabits, isWeekendDay);
      stats.habitCompletions += completions.length;
    }

    // Meeting attendance (~2.5 per week)
    daysSinceMeeting++;
    const meetingProbability = (daysSinceMeeting / 7) * (CONFIG.meetingsPerWeek / 3.5);

    if (Math.random() < meetingProbability && meetingsThisWeek < 4) {
      await generateMeetingAttendance(userId, currentDate);
      stats.meetings++;
      daysSinceMeeting = 0;
      meetingsThisWeek++;
    }

    // Update for next day
    previousDayMood = mood;
    previousDaySleep = sleep;

    // Progress logging every 10 days
    if ((dayOffset + 1) % 10 === 0) {
      console.log(`  Processed ${dayOffset + 1}/${CONFIG.daysToGenerate} days...`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('BACKFILL COMPLETE');
  console.log(`${'='.repeat(60)}`);
  console.log(`\nStats for ${CONFIG.daysToGenerate} days:`);
  console.log(`  Morning Check-ins:  ${stats.morningCheckIns}`);
  console.log(`  Evening Check-ins:  ${stats.eveningCheckIns}`);
  console.log(`  Reflections:        ${stats.reflections}`);
  console.log(`  Gratitudes:         ${stats.gratitudes}`);
  console.log(`  Wins:               ${stats.wins}`);
  console.log(`  Habit Completions:  ${stats.habitCompletions}`);
  console.log(`  Meetings:           ${stats.meetings}`);
  console.log(`\nTotal documents created: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/backfillTestData.js <userId>');
  console.error('\nExample: node scripts/backfillTestData.js abc123xyz');
  process.exit(1);
}

backfillData(userId)
  .then(() => {
    console.log('\nBackfill completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nBackfill failed:', error);
    process.exit(1);
  });
