/**
 * Safety Module Exports
 * Phase 8B: Core Safety Infrastructure
 * Phase 8C: Notification System
 *
 * Exports all safety-related functions and utilities.
 */

// Crisis keyword database
const {
  TIER_1_CRITICAL,
  TIER_2_HIGH,
  TIER_3_MODERATE,
  TIER_4_STANDARD,
  CRISIS_DETECTION_CONFIG,
  CRISIS_RESPONSES,
  getKeywordsForTier,
  getKeywordCounts,
  levenshteinDistance,
  similarityRatio,
  expandAbbreviation,
  hasNegationBefore,
  createKeywordPattern,
} = require('./crisisKeywords');

// Crisis detection functions
const {
  detectCrisis,
  acknowledgeAlert,
  resolveAlert,
  addAlertNote,
  scanForCrisis,
  checkKeywordMatch,
  shouldExcludeForNegation,
  createCrisisAlert,
} = require('./detectCrisis');

// Crisis notification functions (Phase 8C)
const {
  sendCrisisNotifications,
  retryFailedNotifications,
  escalateUnacknowledgedAlerts,
  NOTIFICATION_MATRIX,
} = require('./sendCrisisNotifications');

// Daily crisis digest (Phase 8C)
const {
  dailyCrisisDigest,
  triggerCrisisDigest,
} = require('./dailyCrisisDigest');

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Firebase Callable Functions (Phase 8B)
  detectCrisis,
  acknowledgeAlert,
  resolveAlert,
  addAlertNote,

  // Firebase Scheduled Functions (Phase 8C)
  dailyCrisisDigest,
  triggerCrisisDigest,

  // Notification Functions (Phase 8C)
  sendCrisisNotifications,
  retryFailedNotifications,
  escalateUnacknowledgedAlerts,
  NOTIFICATION_MATRIX,

  // Keyword Database
  TIER_1_CRITICAL,
  TIER_2_HIGH,
  TIER_3_MODERATE,
  TIER_4_STANDARD,
  CRISIS_DETECTION_CONFIG,
  CRISIS_RESPONSES,

  // Helper Functions
  getKeywordsForTier,
  getKeywordCounts,
  levenshteinDistance,
  similarityRatio,
  expandAbbreviation,
  hasNegationBefore,
  createKeywordPattern,
  scanForCrisis,
  checkKeywordMatch,
  shouldExcludeForNegation,
  createCrisisAlert,
};
