const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nlp = require('compromise');
const { syncMeetings } = require('./syncMeetings');
const { syncAAMeetings } = require('./syncAAMeetings');
const { scheduledMeetingSync, manualMeetingSync } = require('./scheduledSync');
const { exchangeGoogleCalendarToken, syncMeetingToCalendar, syncCalendarSettings, manualSyncMeetings } = require('./calendarSync');

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
exports.syncMeetings = syncMeetings;
exports.syncAAMeetings = syncAAMeetings;

// ============================================================================
// SCHEDULED MEETING SYNC - Phase 3 Feature 1
// Automated sync every 6 hours with change detection and error monitoring
// ============================================================================
exports.scheduledMeetingSync = scheduledMeetingSync;
exports.manualMeetingSync = manualMeetingSync;

// ============================================================================
// GOOGLE CALENDAR INTEGRATION - Phase 1 Step 1.5
// OAuth token exchange and meeting sync
// ============================================================================
exports.exchangeGoogleCalendarToken = exchangeGoogleCalendarToken;
exports.syncMeetingToCalendar = syncMeetingToCalendar;
// Step 2.1D: Manual sync functions
exports.syncCalendarSettings = syncCalendarSettings;
exports.manualSyncMeetings = manualSyncMeetings;

// ============================================================================
// ADDRESS MIGRATION - HTTPS Callable Function
// Phase 2 Fix #2: Migrate plain text addresses to structured format
// ============================================================================

exports.migrateAddresses = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: '1GB',
    invoker: 'public'
  })
  .https.onRequest(async (req, res) => {
    console.log('========================================');
    console.log('ADDRESS MIGRATION CLOUD FUNCTION');
    console.log('Phase 2 Fix #2: Structured Address Format');
    console.log('========================================\n');

    // Mapbox API configuration
    const MAPBOX_TOKEN = functions.config().mapbox?.token || process.env.MAPBOX_TOKEN;

    if (!MAPBOX_TOKEN) {
      console.error('❌ MAPBOX_TOKEN not configured');
      return res.status(500).json({
        error: 'Mapbox token not configured. Run: firebase functions:config:set mapbox.token="YOUR_TOKEN"'
      });
    }

    const stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    try {
      // Fetch all external meetings
      console.log('📥 Fetching meetings from Firestore...');
      const snapshot = await db.collection('externalMeetings').get();

      stats.total = snapshot.size;
      console.log(`✓ Found ${stats.total} meetings\n`);

      if (stats.total === 0) {
        return res.json({ success: true, message: 'No meetings found', stats });
      }

      // Helper function to geocode address
      const geocodeAddress = async (addressString) => {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressString)}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=US`;

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Mapbox API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
          throw new Error('No geocoding results');
        }

        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const context = feature.context || [];

        return {
          formatted: feature.place_name,
          city: context.find(c => c.id.includes('place'))?.text || '',
          state: context.find(c => c.id.includes('region'))?.short_code?.replace('US-', '') || '',
          zipCode: context.find(c => c.id.includes('postcode'))?.text || '',
          country: 'US',
          coordinates: new admin.firestore.GeoPoint(lat, lng)
        };
      };

      // Process meetings in batches of 10
      const batchSize = 10;
      const meetings = snapshot.docs;

      for (let i = 0; i < meetings.length; i += batchSize) {
        const batch = meetings.slice(i, i + batchSize);
        console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(meetings.length/batchSize)}`);

        for (const meetingDoc of batch) {
          const meeting = meetingDoc.data();
          stats.processed++;

          try {
            // Skip if already migrated
            if (meeting.location && meeting.location.coordinates) {
              stats.skipped++;
              continue;
            }

            // Build address string
            const parts = [];
            if (meeting.address) parts.push(meeting.address);
            if (meeting.city) parts.push(meeting.city);
            if (meeting.state && meeting.zip) parts.push(`${meeting.state} ${meeting.zip}`);

            const fullAddress = parts.join(', ');

            if (!fullAddress) {
              stats.failed++;
              stats.errors.push({ id: meetingDoc.id, error: 'No address' });
              continue;
            }

            // Geocode
            console.log(`  Geocoding: ${fullAddress}`);
            const geocoded = await geocodeAddress(fullAddress);

            // Parse street components
            const streetMatch = (meeting.address || '').match(/^(\d+)\s+(.+)$/);

            // Build structured location
            const newLocation = {
              formatted: geocoded.formatted,
              streetNumber: streetMatch ? streetMatch[1] : '',
              streetName: streetMatch ? streetMatch[2] : meeting.address || '',
              city: geocoded.city || meeting.city || '',
              state: geocoded.state || meeting.state || '',
              zipCode: geocoded.zipCode || meeting.zip || '',
              country: geocoded.country,
              coordinates: geocoded.coordinates
            };

            // Update Firestore
            await meetingDoc.ref.update({
              location: newLocation,
              _migrated: true,
              _migratedAt: admin.firestore.FieldValue.serverTimestamp(),
              _originalAddress: meeting.address || '',
              _originalCity: meeting.city || '',
              _originalState: meeting.state || '',
              _originalZip: meeting.zip || ''
            });

            stats.successful++;
            console.log(`  ✓ ${meetingDoc.id}`);

          } catch (error) {
            stats.failed++;
            stats.errors.push({ id: meetingDoc.id, error: error.message });
            console.error(`  ✗ ${meetingDoc.id}: ${error.message}`);
          }
        }

        // Small delay between batches to avoid rate limits
        if (i + batchSize < meetings.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Final stats
      console.log('\n========================================');
      console.log('MIGRATION COMPLETE');
      console.log('========================================');
      console.log(`Total: ${stats.total}`);
      console.log(`Successful: ${stats.successful}`);
      console.log(`Skipped: ${stats.skipped}`);
      console.log(`Failed: ${stats.failed}`);
      console.log(`Success Rate: ${((stats.successful / stats.total) * 100).toFixed(1)}%`);

      return res.json({
        success: true,
        message: 'Migration complete',
        stats
      });

    } catch (error) {
      console.error('❌ Migration failed:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        stats
      });
    }
  });

// ============================================================================
// PHASE 1: DAILY REMINDER NOTIFICATIONS
// ============================================================================

// Import daily reminder functions
const {
  morningCheckInReminder,
  eveningReflectionReminder
  // dailyPledgeReminder DELETED - November 23, 2025 - See NOTIFICATION_OPTIMIZATION_REPORT.md
} = require('./notifications/types/dailyReminders');

// Missed activity alert functions DELETED - November 23, 2025
// missedCheckInAlert and missedReflectionAlert removed to reduce alarm fatigue
// See NOTIFICATION_OPTIMIZATION_REPORT.md for rationale

// Export notification functions
exports.morningCheckInReminder = morningCheckInReminder;
exports.eveningReflectionReminder = eveningReflectionReminder;
// DELETED: dailyPledgeReminder, missedCheckInAlert, missedReflectionAlert

// ============================================================================
// PHASE 2: ASSIGNMENT & MILESTONE NOTIFICATIONS
// ============================================================================

// Import assignment reminder functions
const {
  assignmentDue1DayReminder,
  assignmentDueTodayReminder,
  assignmentOverdueAlert,
  assignmentCompletedNotification,
  assignmentCreatedNotification
} = require('./notifications/types/assignmentReminders');

// Import milestone notification functions
const {
  milestoneApproachingNotification,
  milestoneReachedNotification,
  customGoalCompletedNotification
} = require('./notifications/types/milestoneNotifications');

// Export Phase 2 functions
exports.assignmentDue1DayReminder = assignmentDue1DayReminder;
exports.assignmentDueTodayReminder = assignmentDueTodayReminder;
exports.assignmentOverdueAlert = assignmentOverdueAlert;
exports.assignmentCompletedNotification = assignmentCompletedNotification;
exports.assignmentCreatedNotification = assignmentCreatedNotification;
exports.milestoneApproachingNotification = milestoneApproachingNotification;
exports.milestoneReachedNotification = milestoneReachedNotification;
exports.customGoalCompletedNotification = customGoalCompletedNotification;

// ============================================================================
// PHASE 3: MEETING & COMMUNITY NOTIFICATIONS
// ============================================================================

// Import meeting reminder functions
const {
  todaysMeetingsSummary,
  meeting24HourReminder,
  meeting1HourReminder,
  meetingStartingNow,
  meetingAddedNotification,
  meetingAttendedNotification
} = require('./notifications/types/meetingReminders');

// Import community notification functions
const {
  newCommentNotification,
  newLikeNotification,
  userMentionedNotification,
  userMentionedInCommentNotification,
  newPostInTopicRoomNotification
} = require('./notifications/types/communityNotifications');

// Export Phase 3 functions
exports.todaysMeetingsSummary = todaysMeetingsSummary;
exports.meeting24HourReminder = meeting24HourReminder;
exports.meeting1HourReminder = meeting1HourReminder;
exports.meetingStartingNow = meetingStartingNow;
exports.meetingAddedNotification = meetingAddedNotification;
exports.meetingAttendedNotification = meetingAttendedNotification;
exports.newCommentNotification = newCommentNotification;
exports.newLikeNotification = newLikeNotification;
exports.userMentionedNotification = userMentionedNotification;
exports.userMentionedInCommentNotification = userMentionedInCommentNotification;
exports.newPostInTopicRoomNotification = newPostInTopicRoomNotification;

// ============================================================================
// PHASE 4: EMAIL REPORTS & DIGESTS
// ============================================================================

// Import email report functions
const {
  dailyEmailDigest,
  weeklyEmailDigest,
  monthlyEmailDigest,
  weeklyProgressReport
} = require('./notifications/types/emailReports');

// Export Phase 4 functions
exports.dailyEmailDigest = dailyEmailDigest;
exports.weeklyEmailDigest = weeklyEmailDigest;
exports.monthlyEmailDigest = monthlyEmailDigest;
exports.weeklyProgressReport = weeklyProgressReport;

// ============================================================================
// PHASE 5: MESSAGING NOTIFICATIONS
// ============================================================================

// Import messaging notification functions
const {
  newMessageNotification,
  messageReadNotification,
  unreadMessageReminder,
  updateConversationMetadata,
  decrementUnreadCount
} = require('./notifications/types/messagingNotifications');

// Export Phase 5 functions
exports.newMessageNotification = newMessageNotification;
exports.messageReadNotification = messageReadNotification;
exports.unreadMessageReminder = unreadMessageReminder;
exports.updateConversationMetadata = updateConversationMetadata;
exports.decrementUnreadCount = decrementUnreadCount;

// ============================================================================
// PHASE 7: OPENAI AI INSIGHTS HUB
// Chat completions, TTS, Whisper, and Assistants API for Anchor tab
// ============================================================================

// Import OpenAI functions
const {
  openaiChat,
  openaiTTS,
  openaiWhisper
} = require('./openai/chat');

const {
  anchorSendMessage,
  anchorGetHistory,
  anchorClearHistory,
  anchorUpdateInstructions
} = require('./openai/assistants');

// Export Phase 7 functions - Chat (Tabs 1-5: Stateless)
exports.openaiChat = openaiChat;
exports.openaiTTS = openaiTTS;
exports.openaiWhisper = openaiWhisper;

// Export Phase 7 functions - Anchor (Assistants API: Persistent threads)
exports.anchorSendMessage = anchorSendMessage;
exports.anchorGetHistory = anchorGetHistory;
exports.anchorClearHistory = anchorClearHistory;
exports.anchorUpdateInstructions = anchorUpdateInstructions; // Phase 8B: Admin function to update safety instructions

// ============================================================================
// PHASE 8B: SAFETY & CRISIS RESPONSE SYSTEM
// Crisis detection, alerting, and response management
// ============================================================================

// Import Safety functions (Phase 8B)
const {
  detectCrisis,
  acknowledgeAlert,
  resolveAlert,
  addAlertNote,
  // Phase 8C: Notification system
  dailyCrisisDigest,
  triggerCrisisDigest,
} = require('./safety');

// Export Phase 8B functions - Crisis Detection & Response
exports.detectCrisis = detectCrisis;
exports.acknowledgeAlert = acknowledgeAlert;
exports.resolveAlert = resolveAlert;
exports.addAlertNote = addAlertNote;

// Export Phase 8C functions - Crisis Notifications
exports.dailyCrisisDigest = dailyCrisisDigest; // Scheduled: 8 PM PT daily
exports.triggerCrisisDigest = triggerCrisisDigest; // Callable: Manual trigger for admins

// ============================================================================
// PHASE 10: AI INSIGHTS SUMMARY SYSTEM
// Weekly/Monthly summaries, Check-in/Reflection insights
// ============================================================================

// Import Summary functions
const {
  onCheckInCreate: summaryOnCheckInCreate,
  onReflectionCreate: summaryOnReflectionCreate,
  generateWeeklySummaries,
  generateMonthlySummaries,
  generateWeeklySummaryManual,
  generateMonthlySummaryManual,
  migrateHistoricalSummaries,
} = require('./summaries');

// Export Phase 10 functions - Firestore Triggers
// Note: Using aliased names to avoid conflict with existing analyzeGratitude/analyzeChallenge
exports.summaryOnCheckInCreate = summaryOnCheckInCreate;
exports.summaryOnReflectionCreate = summaryOnReflectionCreate;

// Export Phase 10 functions - Scheduled Summaries
exports.generateWeeklySummaries = generateWeeklySummaries;
exports.generateMonthlySummaries = generateMonthlySummaries;

// Export Phase 10 functions - Manual Triggers (for testing)
exports.generateWeeklySummaryManual = generateWeeklySummaryManual;
exports.generateMonthlySummaryManual = generateMonthlySummaryManual;

// Export Phase 10 functions - Migration (for backfilling historical summaries)
exports.migrateHistoricalSummaries = migrateHistoricalSummaries;

// ============================================================================
// PHASE 6.2: BEACON AI - DAILY CONTENT GENERATION
// Daily AI insights, oracles, proactive cards, and technique selection
// Scheduled: 6 AM Pacific daily
// ============================================================================

// Import Beacon AI Daily functions
const {
  generateDailyContent,
  generateDailyContentManual,
} = require('./ai/generateDailyContent');

// Export Phase 6.2 functions - Beacon AI Daily Content
exports.generateDailyContent = generateDailyContent;          // Scheduled: 6 AM PT daily
exports.generateDailyContentManual = generateDailyContentManual;  // Callable: Manual trigger for testing

// ============================================================================
// PHASE 6.3: BEACON AI - WEEKLY CONTENT GENERATION
// Weekly pattern analysis, correlations, reflection themes, habit coach, goal coach
// Scheduled: Sunday 6 AM Pacific
// ============================================================================

// Import Beacon AI Weekly functions
const {
  generateWeeklyContent,
  generateWeeklyContentManual,
} = require('./ai/generateWeeklyContent');

// Export Phase 6.3 functions - Beacon AI Weekly Content
exports.generateWeeklyContent = generateWeeklyContent;          // Scheduled: Sunday 6 AM PT
exports.generateWeeklyContentManual = generateWeeklyContentManual;  // Callable: Manual trigger for testing

// ============================================================================
// PROJECT LIGHTHOUSE: AI PATTERN INSIGHTS
// GPT-generated 15 insight cards with AI-chosen actions
// Scheduled: Sunday 6 AM Pacific (alongside existing weekly content)
// ============================================================================

// Import AI Pattern Insights functions
const {
  generateAIPatternInsights,
  generateAIPatternInsightsManual,
} = require('./ai/generateAIPatternInsights');

// Export Project Lighthouse functions - AI Pattern Insights
exports.generateAIPatternInsights = generateAIPatternInsights;          // Scheduled: Sunday 6 AM PT
exports.generateAIPatternInsightsManual = generateAIPatternInsightsManual;  // Callable: Manual trigger for testing

// ============================================================================
// AI CONTEXT RECALCULATION
// Nightly recalculation of aiContext averages, trends, and patterns
// Scheduled: 8 PM Pacific daily
// ============================================================================

// Import AI Context Recalculation functions
const {
  recalculateAIContextNightly,
  recalculateAIContextManual,
} = require('./scheduled/recalculateAIContext');

// Export AI Context Recalculation functions
exports.recalculateAIContextNightly = recalculateAIContextNightly;      // Scheduled: 8 PM PT daily
exports.recalculateAIContextManual = recalculateAIContextManual;        // Callable: Manual trigger for testing

// ============================================================================
// PHASE 2: WEEKLY INSIGHTS - Reflection, Habit, Goal Coaches
// Write to weeklyInsights subcollection for frontend hooks to read
// Scheduled: Monday 6 AM Pacific
// ============================================================================

// Import Weekly Insight functions
const {
  generateWeeklyReflectionInsights,
  generateReflectionInsightsManual,
} = require('./ai/generateAIReflectionInsights');

const {
  generateWeeklyHabitInsights,
  generateHabitInsightsManual,
} = require('./ai/generateAIHabitInsights');

const {
  generateWeeklyGoalInsights,
  generateGoalInsightsManual,
} = require('./ai/generateAIGoalInsights');

// Export Reflection Insights
exports.generateWeeklyReflectionInsights = generateWeeklyReflectionInsights;  // Scheduled: Monday 6 AM PT
exports.generateReflectionInsightsManual = generateReflectionInsightsManual;  // Callable: Manual trigger

// Export Habit Insights
exports.generateWeeklyHabitInsights = generateWeeklyHabitInsights;            // Scheduled: Monday 6 AM PT
exports.generateHabitInsightsManual = generateHabitInsightsManual;            // Callable: Manual trigger

// Export Goal Insights
exports.generateWeeklyGoalInsights = generateWeeklyGoalInsights;              // Scheduled: Monday 6 AM PT
exports.generateGoalInsightsManual = generateGoalInsightsManual;              // Callable: Manual trigger
