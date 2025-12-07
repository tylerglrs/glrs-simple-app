/**
 * AI Insights Summary Functions
 *
 * This module exports all Cloud Functions related to AI-generated summaries:
 * - Firestore triggers for check-ins and reflections
 * - Scheduled weekly and monthly summary generation
 * - Manual triggers for testing
 *
 * Collection structure:
 * users/{userId}/
 *   ├── aiInsights/{insightId}      - Individual AI insights
 *   ├── weeklySummaries/{weekId}    - Weekly aggregated data + AI summary
 *   └── monthlySummaries/{monthId}  - Monthly aggregated data + AI summary
 */

// Firestore triggers
const { onCheckInCreate } = require('./onCheckInCreate');
const { onReflectionCreate } = require('./onReflectionCreate');

// Scheduled functions
const { generateWeeklySummaries, generateWeeklySummaryManual } = require('./weeklyScheduled');
const { generateMonthlySummaries, generateMonthlySummaryManual } = require('./monthlyScheduled');

// Migration function
const { migrateHistoricalSummaries } = require('./migrateHistorical');

// Helper modules (not exported as Cloud Functions, but available for internal use)
const aggregateWeekData = require('./aggregateWeekData');
const aggregateMonthData = require('./aggregateMonthData');
const generateAISummary = require('./generateAISummary');

module.exports = {
  // ============================================================================
  // FIRESTORE TRIGGERS
  // ============================================================================

  /**
   * Triggered on new check-in creation
   * Generates a brief AI insight comparing to recent averages
   * Writes to: users/{userId}/aiInsights
   */
  onCheckInCreate,

  /**
   * Triggered on new reflection creation
   * Generates a brief AI insight noting themes and patterns
   * Writes to: users/{userId}/aiInsights
   */
  onReflectionCreate,

  // ============================================================================
  // SCHEDULED FUNCTIONS
  // ============================================================================

  /**
   * Runs every Sunday at 11:59 PM Pacific
   * Aggregates week data and generates AI summary for all active PIRs
   * Writes to: users/{userId}/weeklySummaries/{weekId}
   *            users/{userId}/aiInsights
   */
  generateWeeklySummaries,

  /**
   * Runs on the last day of each month at 11:59 PM Pacific
   * Aggregates month data (from weekly summaries) and generates AI summary
   * Writes to: users/{userId}/monthlySummaries/{monthId}
   *            users/{userId}/aiInsights
   */
  generateMonthlySummaries,

  // ============================================================================
  // MANUAL TRIGGERS (for testing)
  // ============================================================================

  /**
   * Callable function to manually generate a weekly summary
   * Requires authentication
   * Input: { userId?: string, weekDate?: string }
   * Returns: { success, weekId, aiSummary, weekData }
   */
  generateWeeklySummaryManual,

  /**
   * Callable function to manually generate a monthly summary
   * Requires authentication
   * Input: { userId?: string, monthDate?: string }
   * Returns: { success, monthId, aiSummary, monthData }
   */
  generateMonthlySummaryManual,

  // ============================================================================
  // MIGRATION FUNCTIONS
  // ============================================================================

  /**
   * Callable function to migrate historical summaries (Sep-Nov 2025)
   * Requires authentication
   * Input: { userId?: string, migrateAll?: boolean }
   * Returns: { success, weeklySummaries, monthlySummaries, errors }
   */
  migrateHistoricalSummaries,

  // ============================================================================
  // HELPER MODULES (for internal use by other functions)
  // ============================================================================
  _helpers: {
    aggregateWeekData,
    aggregateMonthData,
    generateAISummary,
  },
};
