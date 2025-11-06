const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nlp = require('compromise');

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// GRATITUDE ANALYSIS - Triggered on new gratitude
// ============================================================================

exports.analyzeGratitude = functions.firestore
  .document('checkIns/{checkInId}')
  .onCreate(async (snap, context) => {
    try {
      const checkIn = snap.data();
      console.log('🔍 Check-in data keys:', Object.keys(checkIn));
      console.log('🔍 Has eveningData?', !!checkIn.eveningData);
      console.log('🔍 eveningData keys:', checkIn.eveningData ? Object.keys(checkIn.eveningData) : 'N/A');

      const gratitude = checkIn.eveningData?.gratitude;
      console.log('🔍 Gratitude value:', gratitude);
      console.log('🔍 Gratitude type:', typeof gratitude);
      console.log('🔍 Gratitude length:', gratitude ? gratitude.length : 0);

      if (!gratitude || !gratitude.trim()) {
        console.log('⚠️ No gratitude found in check-in');
        return null;
      }

      const userId = checkIn.userId;
      console.log(`Analyzing gratitude for user: ${userId}`);

      // ============================================================
      // STEP 1: Extract themes using NLP
      // ============================================================
      const doc = nlp(gratitude);

      // Extract entities
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const topics = doc.topics().out('array');

      // Extract nouns (things user is grateful for)
      const nouns = doc.nouns().out('array');

      // Categorize based on keywords
      const categories = categorizeGratitude(gratitude.toLowerCase());

      // Extract meaningful words (4+ letters, not stop words)
      const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'can', 'may', 'might', 'must', 'i', 'my', 'me',
        'am', 'that', 'this', 'it', 'very', 'so', 'too', 'just', 'about',
        'been', 'being', 'they', 'them', 'their', 'what', 'which', 'when',
        'where', 'who', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
        'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same'
      ]);

      const words = gratitude.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));

      // ============================================================
      // STEP 2: Get overall day score for correlation
      // ============================================================
      const dayScore = checkIn.eveningData?.overallDay || null;

      // ============================================================
      // STEP 3: Update user insights (INCREMENTAL)
      // ============================================================
      const insightsRef = db.doc(`users/${userId}/insights/gratitude`);
      const insightsDoc = await insightsRef.get();
      const existingInsights = insightsDoc.exists ? insightsDoc.data() : {
        totalCount: 0,
        themes: {},
        categories: {},
        people: {},
        places: {},
        recentGratitudes: [],
        lastUpdated: null
      };

      // Update theme counts
      const updatedThemes = { ...existingInsights.themes };
      words.forEach(word => {
        updatedThemes[word] = (updatedThemes[word] || 0) + 1;
      });

      // Update category counts
      const updatedCategories = { ...existingInsights.categories };
      categories.forEach(cat => {
        if (!updatedCategories[cat]) {
          updatedCategories[cat] = {
            count: 0,
            dayScores: [],
            lastMentioned: null
          };
        }
        updatedCategories[cat].count++;
        if (dayScore) {
          updatedCategories[cat].dayScores.push(dayScore);
        }
        updatedCategories[cat].lastMentioned = admin.firestore.FieldValue.serverTimestamp();
      });

      // Update people mentions
      const updatedPeople = { ...existingInsights.people };
      people.forEach(person => {
        updatedPeople[person] = (updatedPeople[person] || 0) + 1;
      });

      // Update places mentions
      const updatedPlaces = { ...existingInsights.places };
      places.forEach(place => {
        updatedPlaces[place] = (updatedPlaces[place] || 0) + 1;
      });

      // Keep last 100 gratitudes for analysis
      const recentGratitudes = [
        {
          text: gratitude,
          date: checkIn.createdAt,
          dayScore: dayScore,
          themes: words,
          categories: categories
        },
        ...existingInsights.recentGratitudes
      ].slice(0, 100);

      // Save updated insights
      await insightsRef.set({
        totalCount: existingInsights.totalCount + 1,
        themes: updatedThemes,
        categories: updatedCategories,
        people: updatedPeople,
        places: updatedPlaces,
        recentGratitudes: recentGratitudes,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Gratitude analyzed for user ${userId}. Themes: ${words.join(', ')}`);
      return null;

    } catch (error) {
      console.error('Error analyzing gratitude:', error);
      return null;
    }
  });

// Helper: Categorize gratitude based on keywords
function categorizeGratitude(text) {
  const categoryKeywords = {
    family: ['family', 'mother', 'father', 'mom', 'dad', 'sister', 'brother', 'spouse', 'wife', 'husband', 'kids', 'children', 'parents', 'daughter', 'son'],
    health: ['health', 'energy', 'strong', 'exercise', 'fitness', 'body', 'wellness', 'physical', 'mental', 'healthy'],
    recovery: ['sobriety', 'recovery', 'clean', 'sober', 'program', 'meetings', 'sponsor', 'fellowship', 'twelve', 'steps'],
    relationships: ['friends', 'friendship', 'connection', 'love', 'support', 'community', 'people', 'relationship'],
    nature: ['nature', 'outdoors', 'sunshine', 'weather', 'walk', 'park', 'trees', 'sky', 'birds', 'garden'],
    work: ['work', 'job', 'career', 'project', 'accomplishment', 'success', 'achievement', 'promotion'],
    peace: ['peace', 'calm', 'quiet', 'meditation', 'mindfulness', 'stillness', 'serenity', 'tranquil'],
    growth: ['growth', 'learning', 'progress', 'improvement', 'better', 'stronger', 'development', 'change']
  };

  const categories = [];
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['general'];
}

// ============================================================================
// CHALLENGE ANALYSIS - Triggered on new challenge
// ============================================================================

exports.analyzeChallenge = functions.firestore
  .document('checkIns/{checkInId}')
  .onCreate(async (snap, context) => {
    try {
      const checkIn = snap.data();
      console.log('🔍 Check-in data keys:', Object.keys(checkIn));
      console.log('🔍 Has eveningData?', !!checkIn.eveningData);
      console.log('🔍 eveningData keys:', checkIn.eveningData ? Object.keys(checkIn.eveningData) : 'N/A');

      const challenges = checkIn.eveningData?.challenges;
      console.log('🔍 Challenges value:', challenges);
      console.log('🔍 Challenges type:', typeof challenges);
      console.log('🔍 Challenges length:', challenges ? challenges.length : 0);

      if (!challenges || !challenges.trim()) {
        console.log('⚠️ No challenges found in check-in');
        return null;
      }

      const userId = checkIn.userId;
      console.log(`Analyzing challenge for user: ${userId}`);

      // ============================================================
      // STEP 1: Detect category and severity
      // ============================================================
      const { category, severity } = detectChallengeCategory(challenges.toLowerCase());

      // ============================================================
      // STEP 2: Create challenge tracking document
      // ============================================================
      const challengeRef = db.collection('challenges_tracking').doc();
      await challengeRef.set({
        userId: userId,
        checkInId: snap.id,
        challengeText: challenges,
        detectedAt: checkIn.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        severity: severity,
        category: category,
        dayScore: checkIn.eveningData?.overallDay || null,
        checkIns: [],
        suggestedResources: [],
        lastCheckInDate: null,
        isRecurring: false,
        recurrenceCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // ============================================================
      // STEP 3: Check if this is a recurring challenge
      // ============================================================
      const recentSimilarChallenges = await db.collection('challenges_tracking')
        .where('userId', '==', userId)
        .where('category', '==', category)
        .where('detectedAt', '>', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
        .get();

      if (!recentSimilarChallenges.empty && recentSimilarChallenges.size > 1) {
        // This is recurring
        await challengeRef.update({
          isRecurring: true,
          recurrenceCount: recentSimilarChallenges.size,
          relatedChallenges: recentSimilarChallenges.docs.map(doc => doc.id)
        });
      }

      // ============================================================
      // STEP 4: Suggest resources based on category
      // ============================================================
      const suggestedResources = await suggestResourcesForCategory(category, severity);
      if (suggestedResources.length > 0) {
        await challengeRef.update({
          suggestedResources: suggestedResources
        });
      }

      // ============================================================
      // STEP 5: Update user challenge insights
      // ============================================================
      const challengeInsightsRef = db.doc(`users/${userId}/insights/challenges`);
      await challengeInsightsRef.set({
        [`categories.${category}.count`]: admin.firestore.FieldValue.increment(1),
        [`categories.${category}.lastMentioned`]: admin.firestore.FieldValue.serverTimestamp(),
        totalChallenges: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Challenge analyzed for user ${userId}. Category: ${category}, Severity: ${severity}`);
      return null;

    } catch (error) {
      console.error('Error analyzing challenge:', error);
      return null;
    }
  });

// Helper: Detect challenge category and severity
function detectChallengeCategory(text) {
  const categoryPatterns = {
    work_stress: {
      keywords: ['work', 'job', 'boss', 'deadline', 'project', 'meeting', 'coworker', 'career', 'office'],
      high: ['overwhelmed', 'unbearable', 'can\'t handle', 'breaking', 'too much'],
      medium: ['stressful', 'difficult', 'challenging', 'pressure', 'hard'],
      low: ['busy', 'hectic', 'tiring', 'long day']
    },
    cravings: {
      keywords: ['craving', 'urge', 'temptation', 'want to use', 'thinking about', 'desire'],
      high: ['intense', 'strong', 'overwhelming', 'can\'t stop', 'desperate'],
      medium: ['moderate', 'noticeable', 'persistent', 'constant'],
      low: ['slight', 'passing', 'mild', 'brief']
    },
    anxiety: {
      keywords: ['anxiety', 'anxious', 'worried', 'nervous', 'panic', 'fear', 'scared', 'stress'],
      high: ['severe', 'panic attack', 'can\'t breathe', 'unbearable', 'extreme'],
      medium: ['significant', 'concerning', 'difficult', 'hard to manage'],
      low: ['mild', 'manageable', 'occasional', 'slight']
    },
    relationship_conflict: {
      keywords: ['argument', 'fight', 'conflict', 'disagreement', 'relationship', 'family issue', 'tension'],
      high: ['major', 'serious', 'breaking point', 'can\'t talk', 'devastating'],
      medium: ['tension', 'frustration', 'upset', 'angry'],
      low: ['minor', 'small', 'brief', 'misunderstanding']
    },
    sleep_issues: {
      keywords: ['insomnia', 'can\'t sleep', 'restless', 'nightmares', 'sleep problems', 'tired'],
      high: ['severe', 'multiple nights', 'exhausted', 'no sleep'],
      medium: ['difficult', 'disrupted', 'waking up', 'poor sleep'],
      low: ['slight', 'one night', 'occasional', 'tossed']
    },
    loneliness: {
      keywords: ['lonely', 'alone', 'isolated', 'disconnected', 'no one', 'by myself'],
      high: ['desperately', 'completely', 'unbearable', 'crushing'],
      medium: ['very', 'significantly', 'really', 'deeply'],
      low: ['somewhat', 'a bit', 'occasionally', 'little']
    }
  };

  let detectedCategory = 'general';
  let maxMatches = 0;

  // Find best matching category
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    const matches = patterns.keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = category;
    }
  }

  // Determine severity
  let severity = 'low';
  if (detectedCategory !== 'general') {
    const patterns = categoryPatterns[detectedCategory];
    if (patterns.high.some(keyword => text.includes(keyword))) {
      severity = 'high';
    } else if (patterns.medium.some(keyword => text.includes(keyword))) {
      severity = 'medium';
    }
  }

  return { category: detectedCategory, severity: severity };
}

// Helper: Suggest resources based on challenge category
async function suggestResourcesForCategory(category, severity) {
  try {
    const resources = await db.collection('resources')
      .where('tags', 'array-contains-any', [category, severity, 'coping_strategies'])
      .limit(3)
      .get();

    return resources.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      type: doc.data().type
    }));
  } catch (error) {
    console.error('Error suggesting resources:', error);
    return [];
  }
}

// ============================================================================
// DAILY INSIGHTS COMPUTATION - Scheduled at 2 AM daily
// ============================================================================

exports.dailyInsightsComputation = functions.pubsub.schedule('0 2 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('Running daily insights computation...');

    try {
      // Get all users who have gratitude insights
      const usersSnapshot = await db.collection('users')
        .where('role', '==', 'pir')
        .get();

      const promises = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Process each user's insights
        promises.push(
          computeUserInsights(userId)
        );
      }

      await Promise.all(promises);
      console.log(`✅ Completed daily insights for ${promises.length} users`);

      return null;
    } catch (error) {
      console.error('Error in daily insights computation:', error);
      return null;
    }
  });

// Compute advanced insights for a user
async function computeUserInsights(userId) {
  try {
    const insightsRef = db.doc(`users/${userId}/insights/gratitude`);
    const insightsDoc = await insightsRef.get();

    if (!insightsDoc.exists) return;

    const insights = insightsDoc.data();

    // ============================================================
    // Calculate theme rankings by emotional weight
    // ============================================================
    const themeAnalysis = {};

    for (const [theme, count] of Object.entries(insights.themes || {})) {
      // Calculate percentage
      const percentage = Math.round((count / insights.totalCount) * 100);

      // Get gratitudes containing this theme
      const themeGratitudes = insights.recentGratitudes.filter(g =>
        g.themes.includes(theme)
      );

      // Calculate average day score for this theme
      const dayScores = themeGratitudes
        .map(g => g.dayScore)
        .filter(score => score !== null);

      const avgDayScore = dayScores.length > 0
        ? dayScores.reduce((a, b) => a + b, 0) / dayScores.length
        : null;

      // Get dates
      const dates = themeGratitudes.map(g => g.date.toDate()).sort((a, b) => a - b);
      const firstMention = dates[0];
      const lastMention = dates[dates.length - 1];

      // Calculate recency weight
      const daysSinceLast = Math.floor((new Date() - lastMention) / (1000 * 60 * 60 * 24));
      const recencyWeight = Math.max(0, 1 - (daysSinceLast / 90));

      // Calculate emotional weight
      const scoreWeight = avgDayScore ? avgDayScore / 10 : 0.5;
      const emotionalWeight = (recencyWeight * 0.4) + (scoreWeight * 0.6);

      themeAnalysis[theme] = {
        count: count,
        percentage: percentage,
        avgDayScore: avgDayScore ? parseFloat(avgDayScore.toFixed(1)) : null,
        daysSinceLast: daysSinceLast,
        emotionalWeight: parseFloat(emotionalWeight.toFixed(2)),
        frequency: percentage >= 50 ? 'very_high' : percentage >= 30 ? 'high' : percentage >= 15 ? 'medium' : 'low'
      };
    }

    // Sort themes by emotional weight
    const topThemes = Object.entries(themeAnalysis)
      .sort((a, b) => b[1].emotionalWeight - a[1].emotionalWeight)
      .slice(0, 10)
      .map(([theme, data]) => ({ theme, ...data }));

    // ============================================================
    // Detect gratitude gaps
    // ============================================================
    const expectedCategories = ['family', 'health', 'recovery', 'relationships', 'nature', 'work', 'growth', 'peace'];
    const gaps = [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const category of expectedCategories) {
      const catData = insights.categories?.[category];

      if (!catData) {
        gaps.push({
          category: category,
          severity: 'never_mentioned',
          daysSinceLast: Infinity
        });
      } else if (catData.lastMentioned && catData.lastMentioned.toDate() < thirtyDaysAgo) {
        const daysSinceLast = Math.floor((new Date() - catData.lastMentioned.toDate()) / (1000 * 60 * 60 * 24));
        gaps.push({
          category: category,
          severity: 'long_gap',
          daysSinceLast: daysSinceLast
        });
      }
    }

    // Save computed insights
    await insightsRef.update({
      computed: {
        topThemes: topThemes,
        gaps: gaps.slice(0, 3),
        lastComputed: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    console.log(`✅ Computed insights for user ${userId}`);

  } catch (error) {
    console.error(`Error computing insights for user ${userId}:`, error);
  }
}

// ============================================================================
// CHALLENGE CHECK-IN REMINDERS - Scheduled at 8 AM daily
// ============================================================================

exports.challengeCheckInReminders = functions.pubsub.schedule('0 8 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('Running challenge check-in reminders...');

    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Find challenges needing first check-in (3 days old)
      const needingFirstCheckIn = await db.collection('challenges_tracking')
        .where('status', 'in', ['pending', 'ongoing'])
        .where('detectedAt', '<=', threeDaysAgo)
        .where('lastCheckInDate', '==', null)
        .get();

      // Find ongoing challenges needing follow-up (7 days since last check-in)
      const needingFollowUp = await db.collection('challenges_tracking')
        .where('status', '==', 'ongoing')
        .where('lastCheckInDate', '<=', sevenDaysAgo)
        .get();

      const allChallenges = [...needingFirstCheckIn.docs, ...needingFollowUp.docs];

      console.log(`Found ${allChallenges.length} challenges needing check-in`);

      // Group by user
      const userChallenges = {};
      for (const doc of allChallenges) {
        const challenge = doc.data();
        if (!userChallenges[challenge.userId]) {
          userChallenges[challenge.userId] = [];
        }
        userChallenges[challenge.userId].push({
          id: doc.id,
          ...challenge
        });
      }

      // Create notifications for each user
      const promises = [];
      for (const [userId, challenges] of Object.entries(userChallenges)) {
        promises.push(
          db.collection('notifications').add({
            userId: userId,
            type: 'challenge_checkin',
            title: `Check-in on ${challenges.length} challenge${challenges.length > 1 ? 's' : ''}`,
            message: `How are these challenges going? Tap to update.`,
            data: {
              challengeIds: challenges.map(c => c.id)
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          })
        );
      }

      await Promise.all(promises);
      console.log(`✅ Created ${promises.length} check-in notifications`);

      return null;
    } catch (error) {
      console.error('Error in challenge check-in reminders:', error);
      return null;
    }
  });

// ============================================================================
// BREAKTHROUGH DETECTION - Scheduled daily at 3 AM
// ============================================================================

exports.detectBreakthroughs = functions.pubsub.schedule('0 3 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('Running breakthrough detection...');

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get recurring challenges from 60+ days ago
      const oldChallenges = await db.collection('challenges_tracking')
        .where('isRecurring', '==', true)
        .where('detectedAt', '<=', sixtyDaysAgo)
        .where('status', '!=', 'breakthrough')
        .get();

      const promises = [];

      for (const doc of oldChallenges.docs) {
        const challenge = doc.data();

        // Check if this category has been mentioned in last 30 days
        const recentMentions = await db.collection('challenges_tracking')
          .where('userId', '==', challenge.userId)
          .where('category', '==', challenge.category)
          .where('detectedAt', '>=', thirtyDaysAgo)
          .limit(1)
          .get();

        if (recentMentions.empty) {
          // Breakthrough detected!
          const daysSince = Math.floor((now - challenge.detectedAt.toDate()) / (1000 * 60 * 60 * 24));

          // Update challenge status
          promises.push(
            db.collection('challenges_tracking').doc(doc.id).update({
              status: 'breakthrough',
              breakthroughDetectedAt: admin.firestore.FieldValue.serverTimestamp()
            })
          );

          // Create celebration notification
          promises.push(
            db.collection('notifications').add({
              userId: challenge.userId,
              type: 'breakthrough',
              title: '🎉 Breakthrough Moment!',
              message: `You haven't faced "${challenge.category}" challenges in ${daysSince} days! This is amazing growth.`,
              data: {
                challengeId: doc.id,
                category: challenge.category,
                daysSince: daysSince
              },
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            })
          );
        }
      }

      await Promise.all(promises);
      console.log(`✅ Detected ${promises.length / 2} breakthroughs`);

      return null;
    } catch (error) {
      console.error('Error in breakthrough detection:', error);
      return null;
    }
  });
