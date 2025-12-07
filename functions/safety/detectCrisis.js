/**
 * Crisis Detection Function
 * Phase 8B-2: Core Safety Infrastructure
 *
 * Scans user input for crisis indicators and triggers appropriate responses.
 * Uses tiered keyword matching with negation detection.
 *
 * CRITICAL: This function is the first line of defense for user safety.
 * All AI interactions MUST pass through this before reaching the LLM.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Import keyword database
const {
  TIER_1_CRITICAL,
  TIER_2_HIGH,
  TIER_3_MODERATE,
  TIER_4_STANDARD,
  CRISIS_DETECTION_CONFIG,
  CRISIS_RESPONSES,
  getKeywordsForTier,
  similarityRatio,
  expandAbbreviation,
  hasNegationBefore,
  createKeywordPattern,
} = require('./crisisKeywords');

// Import notification system (Phase 8C)
const { sendCrisisNotifications } = require('./sendCrisisNotifications');

// Initialize Firestore (admin should already be initialized in index.js)
const db = admin.firestore();

// =============================================================================
// CORE DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if a message contains a keyword match
 * @param {string} message - User message to check
 * @param {string} keyword - Keyword to look for
 * @returns {{ matched: boolean, position: number, matchedText: string }}
 */
function checkKeywordMatch(message, keyword) {
  const normalizedMessage = message.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();

  // First try exact match with word boundaries
  const pattern = createKeywordPattern(normalizedKeyword);
  const match = pattern.exec(normalizedMessage);

  if (match) {
    return {
      matched: true,
      position: match.index,
      matchedText: match[0],
    };
  }

  // Try fuzzy matching if enabled
  if (CRISIS_DETECTION_CONFIG.fuzzyMatching.enabled) {
    const words = normalizedMessage.split(/\s+/);
    const keywordWords = normalizedKeyword.split(/\s+/);

    // For single-word keywords, check each word
    if (keywordWords.length === 1) {
      for (let i = 0; i < words.length; i++) {
        const similarity = similarityRatio(words[i], normalizedKeyword);
        if (similarity >= CRISIS_DETECTION_CONFIG.fuzzyMatching.threshold) {
          // Calculate approximate position
          const position = normalizedMessage.indexOf(words[i]);
          return {
            matched: true,
            position,
            matchedText: words[i],
            fuzzyMatch: true,
            similarity,
          };
        }
      }
    }

    // Check abbreviations
    for (let i = 0; i < words.length; i++) {
      const expanded = expandAbbreviation(words[i]);
      if (expanded && expanded.toLowerCase().includes(normalizedKeyword)) {
        const position = normalizedMessage.indexOf(words[i]);
        return {
          matched: true,
          position,
          matchedText: words[i],
          abbreviationMatch: true,
          expandedTo: expanded,
        };
      }
    }
  }

  return { matched: false, position: -1, matchedText: '' };
}

/**
 * Check if match should be excluded due to negation
 * @param {string} message - Full message
 * @param {number} position - Position of the match
 * @returns {boolean} True if should be excluded (negation found)
 */
function shouldExcludeForNegation(message, position) {
  if (!CRISIS_DETECTION_CONFIG.negation.enabled) {
    return false;
  }

  return hasNegationBefore(message, position);
}

/**
 * Extract context around a match for logging
 * @param {string} message - Full message
 * @param {number} position - Position of match
 * @param {number} matchLength - Length of matched text
 * @returns {string} Context string
 */
function extractContext(message, position, matchLength) {
  const windowSize = CRISIS_DETECTION_CONFIG.contextWordsBeforeAfter;
  const words = message.split(/\s+/);

  // Find which word the position falls into
  let wordIndex = 0;
  let charCount = 0;
  for (let i = 0; i < words.length; i++) {
    charCount += words[i].length + 1; // +1 for space
    if (charCount > position) {
      wordIndex = i;
      break;
    }
  }

  // Get context window
  const startIndex = Math.max(0, wordIndex - windowSize);
  const endIndex = Math.min(words.length, wordIndex + windowSize + 1);

  return words.slice(startIndex, endIndex).join(' ');
}

/**
 * Scan message for crisis indicators across all tiers
 * @param {string} message - User message
 * @returns {{ tier: string|null, keyword: string|null, category: string|null, context: string, isNegated: boolean, matchDetails: Object }}
 */
function scanForCrisis(message) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      tier: null,
      keyword: null,
      category: null,
      context: '',
      isNegated: false,
      matchDetails: null,
    };
  }

  const normalizedMessage = message.toLowerCase();

  // Tier 1: CRITICAL - Check first (highest priority)
  for (const [category, keywords] of Object.entries(TIER_1_CRITICAL)) {
    for (const keyword of keywords) {
      const match = checkKeywordMatch(normalizedMessage, keyword);
      if (match.matched) {
        const isNegated = shouldExcludeForNegation(message, match.position);
        if (!isNegated) {
          return {
            tier: 'critical',
            keyword,
            category,
            context: extractContext(message, match.position, match.matchedText.length),
            isNegated: false,
            matchDetails: match,
          };
        }
      }
    }
  }

  // Tier 2: HIGH
  for (const [category, keywords] of Object.entries(TIER_2_HIGH)) {
    for (const keyword of keywords) {
      const match = checkKeywordMatch(normalizedMessage, keyword);
      if (match.matched) {
        const isNegated = shouldExcludeForNegation(message, match.position);
        if (!isNegated) {
          return {
            tier: 'high',
            keyword,
            category,
            context: extractContext(message, match.position, match.matchedText.length),
            isNegated: false,
            matchDetails: match,
          };
        }
      }
    }
  }

  // Tier 3: MODERATE
  for (const [category, keywords] of Object.entries(TIER_3_MODERATE)) {
    for (const keyword of keywords) {
      const match = checkKeywordMatch(normalizedMessage, keyword);
      if (match.matched) {
        const isNegated = shouldExcludeForNegation(message, match.position);
        if (!isNegated) {
          return {
            tier: 'moderate',
            keyword,
            category,
            context: extractContext(message, match.position, match.matchedText.length),
            isNegated: false,
            matchDetails: match,
          };
        }
      }
    }
  }

  // Tier 4: STANDARD (logging only, but we still detect it)
  for (const [category, keywords] of Object.entries(TIER_4_STANDARD)) {
    for (const keyword of keywords) {
      const match = checkKeywordMatch(normalizedMessage, keyword);
      if (match.matched) {
        const isNegated = shouldExcludeForNegation(message, match.position);
        if (!isNegated) {
          return {
            tier: 'standard',
            keyword,
            category,
            context: extractContext(message, match.position, match.matchedText.length),
            isNegated: false,
            matchDetails: match,
          };
        }
      }
    }
  }

  // No crisis indicators found
  return {
    tier: null,
    keyword: null,
    category: null,
    context: '',
    isNegated: false,
    matchDetails: null,
  };
}

// =============================================================================
// FIRESTORE ALERT CREATION
// =============================================================================

/**
 * Create a crisis alert in Firestore
 * @param {string} pirId - User ID of the PIR
 * @param {string} tier - Crisis tier (critical, high, moderate, standard)
 * @param {string} keyword - Matched keyword
 * @param {string} fullMessage - Full user message
 * @param {string} source - Source of the crisis (ai_crisis, sos, check_in)
 * @param {string} aiFeature - Which AI feature detected it (anchor, daily_oracle, etc.)
 * @returns {Promise<{alertId: string|null, pirName: string, coachId: string|null}>} Alert info
 */
async function createCrisisAlert(pirId, tier, keyword, fullMessage, source = 'ai_crisis', aiFeature = null) {
  try {
    // Get PIR info
    const pirDoc = await db.collection('users').doc(pirId).get();
    const pirData = pirDoc.exists ? pirDoc.data() : {};
    const pirName = `${pirData.firstName || ''} ${pirData.lastName || ''}`.trim() || 'Unknown User';

    // Get coach info if assigned
    let coachId = pirData.assignedCoach || pirData.coachId || null;
    let coachName = null;

    if (coachId) {
      const coachDoc = await db.collection('users').doc(coachId).get();
      if (coachDoc.exists) {
        const coachData = coachDoc.data();
        coachName = `${coachData.firstName || ''} ${coachData.lastName || ''}`.trim() || null;
      }
    }

    // Extract context
    const scanResult = scanForCrisis(fullMessage);

    // Create the alert document
    const alertData = {
      // Source tracking
      source, // 'sos' | 'ai_crisis' | 'check_in' | 'coach_escalation'
      aiFeature, // 'anchor' | 'daily_oracle' | 'voice_companion' | 'prompt_cards' | 'story_mode' | null

      // PIR & Coach
      pirId,
      pirName,
      pirEmail: pirData.email || null,
      coachId,
      coachName,

      // Crisis details
      tier,
      triggerKeywords: [keyword],
      category: scanResult.category || 'unknown',
      context: scanResult.context || '',
      fullMessage,
      flaggedContent: fullMessage, // Alias for notification system
      triggeredBy: `Keyword: "${keyword}" (${scanResult.category || 'unknown'})`,
      aiResponse: null, // Will be set after AI responds (or bypassed)
      resourcesDisplayed: tier === 'critical' || tier === 'high',

      // Status tracking
      status: 'active',
      acknowledgedAt: null,
      acknowledgedBy: null,
      responseLog: [],

      // Notifications (will be updated by sendCrisisNotifications)
      notificationsSent: {
        push: false,
        pushAt: null,
        email: false,
        emailAt: null,
        sms: false,
        smsAt: null,
        inApp: false,
        inAppAt: null,
        digest: false,
        digestAt: null,
      },

      // For daily digest
      digestedAt: null,

      // Audit
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      tenantId: pirData.tenantId || 'default',
    };

    // Write to crisisAlerts collection
    const alertRef = await db.collection('crisisAlerts').add(alertData);

    console.log(`[CRISIS ALERT] Created alert ${alertRef.id} for PIR ${pirId} - Tier: ${tier}, Keyword: "${keyword}"`);

    return {
      alertId: alertRef.id,
      pirName,
      coachId,
    };
  } catch (error) {
    console.error('[CRISIS ALERT] Error creating alert:', error);
    // Don't throw - we don't want alert creation failure to break the main flow
    // But we should still log it for monitoring
    return { alertId: null, pirName: 'Unknown User', coachId: null };
  }
}

/**
 * Log crisis detection for analytics (even for lower tiers)
 * @param {string} pirId - User ID
 * @param {Object} scanResult - Result from scanForCrisis
 * @param {string} source - Source of detection
 */
async function logCrisisDetection(pirId, scanResult, source = 'ai_crisis') {
  try {
    await db.collection('crisisDetectionLogs').add({
      pirId,
      tier: scanResult.tier,
      keyword: scanResult.keyword,
      category: scanResult.category,
      context: scanResult.context,
      source,
      isNegated: scanResult.isNegated,
      matchDetails: scanResult.matchDetails,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('[CRISIS LOG] Error logging detection:', error);
  }
}

// =============================================================================
// FIREBASE CALLABLE FUNCTION
// =============================================================================

/**
 * Detect Crisis - Firebase Callable Function
 *
 * Called BEFORE sending user message to LLM to check for crisis content.
 *
 * @param {Object} data - { message: string, userId: string, source?: string, aiFeature?: string }
 * @returns {Object} - { tier, detected, keyword, action, showResources, alertId, crisisResponse }
 */
const detectCrisis = functions
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to use AI features.');
    }

    const { message, userId, source = 'ai_crisis', aiFeature = null } = data;

    // Use authenticated user ID if not provided
    const pirId = userId || context.auth.uid;

    // Validate input
    if (!message || typeof message !== 'string') {
      return {
        tier: null,
        detected: false,
        keyword: null,
        action: 'proceed',
        showResources: false,
        alertId: null,
        crisisResponse: null,
      };
    }

    try {
      // Scan for crisis indicators
      const scanResult = scanForCrisis(message);

      // No crisis detected
      if (!scanResult.tier) {
        return {
          tier: null,
          detected: false,
          keyword: null,
          action: 'proceed',
          showResources: false,
          alertId: null,
          crisisResponse: null,
        };
      }

      console.log(`[CRISIS DETECTION] Tier ${scanResult.tier} detected for user ${pirId}: "${scanResult.keyword}"`);

      // Handle based on tier
      let alertId = null;
      let action = 'proceed';
      let showResources = false;
      let crisisResponse = null;

      switch (scanResult.tier) {
        case 'critical': {
          // CRITICAL: Bypass LLM, show crisis resources immediately
          const criticalResult = await createCrisisAlert(pirId, 'critical', scanResult.keyword, message, source, aiFeature);
          alertId = criticalResult.alertId;
          action = 'bypass_llm';
          showResources = true;
          crisisResponse = CRISIS_RESPONSES.critical;

          // Send notifications (Push + Email + SMS) - don't await to avoid blocking response
          if (alertId) {
            sendCrisisNotifications({
              alertId,
              pirId,
              pirName: criticalResult.pirName,
              tier: 'critical',
              source: aiFeature || source,
              triggeredBy: `Keyword: "${scanResult.keyword}" (${scanResult.category})`,
              flaggedContent: message,
              coachId: criticalResult.coachId,
            }).catch(err => console.error('[CRISIS] Notification error:', err));
          }
          break;
        }

        case 'high': {
          // HIGH: Notify coach, modify AI response, show resources
          const highResult = await createCrisisAlert(pirId, 'high', scanResult.keyword, message, source, aiFeature);
          alertId = highResult.alertId;
          action = 'modify_response';
          showResources = true;
          crisisResponse = CRISIS_RESPONSES.high;

          // Send notifications (Push + Email only) - don't await to avoid blocking response
          if (alertId) {
            sendCrisisNotifications({
              alertId,
              pirId,
              pirName: highResult.pirName,
              tier: 'high',
              source: aiFeature || source,
              triggeredBy: `Keyword: "${scanResult.keyword}" (${scanResult.category})`,
              flaggedContent: message,
              coachId: highResult.coachId,
            }).catch(err => console.error('[CRISIS] Notification error:', err));
          }
          break;
        }

        case 'moderate': {
          // MODERATE: Create alert for daily digest, log for analytics, proceed with AI
          const moderateResult = await createCrisisAlert(pirId, 'moderate', scanResult.keyword, message, source, aiFeature);
          alertId = moderateResult.alertId;
          await logCrisisDetection(pirId, scanResult, source);
          action = 'log_only';
          showResources = false;
          // Note: Notifications handled by dailyCrisisDigest scheduled function
          break;
        }

        case 'standard':
          // STANDARD: Log only, no action needed
          await logCrisisDetection(pirId, scanResult, source);
          action = 'log_only';
          showResources = false;
          break;
      }

      return {
        tier: scanResult.tier,
        detected: true,
        keyword: scanResult.keyword,
        category: scanResult.category,
        action,
        showResources,
        alertId,
        crisisResponse,
        context: scanResult.context,
      };
    } catch (error) {
      console.error('[CRISIS DETECTION] Error:', error);

      // Don't fail the request - allow AI to proceed
      // But log the error for monitoring
      return {
        tier: null,
        detected: false,
        keyword: null,
        action: 'proceed',
        showResources: false,
        alertId: null,
        crisisResponse: null,
        error: 'Detection error - proceeding with caution',
      };
    }
  });

/**
 * Acknowledge Alert - Firebase Callable Function
 *
 * Called by coach/admin to acknowledge a crisis alert.
 *
 * @param {Object} data - { alertId: string, note?: string }
 * @returns {Object} - { success: boolean }
 */
const acknowledgeAlert = functions
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
    }

    const { alertId, note = '' } = data;

    if (!alertId) {
      throw new functions.https.HttpsError('invalid-argument', 'Alert ID is required.');
    }

    try {
      // Get user info for logging
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown';

      // Update the alert
      const alertRef = db.collection('crisisAlerts').doc(alertId);
      const alertDoc = await alertRef.get();

      if (!alertDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Alert not found.');
      }

      const currentData = alertDoc.data();

      await alertRef.update({
        status: 'acknowledged',
        acknowledgedAt: admin.firestore.FieldValue.serverTimestamp(),
        acknowledgedBy: context.auth.uid,
        responseLog: [
          ...currentData.responseLog,
          {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            action: 'acknowledged',
            note,
            by: userName,
            byId: context.auth.uid,
          },
        ],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[CRISIS ALERT] Alert ${alertId} acknowledged by ${userName}`);

      return { success: true };
    } catch (error) {
      console.error('[CRISIS ALERT] Error acknowledging:', error);
      throw new functions.https.HttpsError('internal', 'Failed to acknowledge alert.');
    }
  });

/**
 * Resolve Alert - Firebase Callable Function
 *
 * Called by coach/admin to mark an alert as resolved.
 *
 * @param {Object} data - { alertId: string, note: string }
 * @returns {Object} - { success: boolean }
 */
const resolveAlert = functions
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
    }

    const { alertId, note = '' } = data;

    if (!alertId) {
      throw new functions.https.HttpsError('invalid-argument', 'Alert ID is required.');
    }

    try {
      // Get user info for logging
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown';

      // Update the alert
      const alertRef = db.collection('crisisAlerts').doc(alertId);
      const alertDoc = await alertRef.get();

      if (!alertDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Alert not found.');
      }

      const currentData = alertDoc.data();

      await alertRef.update({
        status: 'resolved',
        resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        resolvedBy: context.auth.uid,
        responseLog: [
          ...currentData.responseLog,
          {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            action: 'resolved',
            note,
            by: userName,
            byId: context.auth.uid,
          },
        ],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[CRISIS ALERT] Alert ${alertId} resolved by ${userName}`);

      return { success: true };
    } catch (error) {
      console.error('[CRISIS ALERT] Error resolving:', error);
      throw new functions.https.HttpsError('internal', 'Failed to resolve alert.');
    }
  });

/**
 * Add Response Note - Firebase Callable Function
 *
 * Called by coach/admin to add a follow-up note to an alert.
 *
 * @param {Object} data - { alertId: string, note: string, action?: string }
 * @returns {Object} - { success: boolean }
 */
const addAlertNote = functions
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
    }

    const { alertId, note, action = 'note_added' } = data;

    if (!alertId || !note) {
      throw new functions.https.HttpsError('invalid-argument', 'Alert ID and note are required.');
    }

    try {
      // Get user info for logging
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown';

      // Update the alert
      const alertRef = db.collection('crisisAlerts').doc(alertId);
      const alertDoc = await alertRef.get();

      if (!alertDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Alert not found.');
      }

      const currentData = alertDoc.data();

      // If status is 'unread', change to 'responded'
      const newStatus = currentData.status === 'unread' ? 'responded' : currentData.status;

      await alertRef.update({
        status: newStatus,
        responseLog: [
          ...currentData.responseLog,
          {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            action,
            note,
            by: userName,
            byId: context.auth.uid,
          },
        ],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[CRISIS ALERT] Note added to alert ${alertId} by ${userName}`);

      return { success: true };
    } catch (error) {
      console.error('[CRISIS ALERT] Error adding note:', error);
      throw new functions.https.HttpsError('internal', 'Failed to add note.');
    }
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Core functions
  detectCrisis,
  acknowledgeAlert,
  resolveAlert,
  addAlertNote,

  // Helper functions for testing
  scanForCrisis,
  checkKeywordMatch,
  shouldExcludeForNegation,
  createCrisisAlert,
};
