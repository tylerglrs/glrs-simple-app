/**
 * Cloud Function Monitoring Module
 *
 * Provides structured logging and alerting for scheduled cloud functions.
 * Logs are written to Cloud Logging with severity levels that can trigger alerts.
 *
 * Usage:
 *   const { logFunctionStart, logFunctionSuccess, logFunctionError, logFunctionSummary } = require('./monitoring/functionMonitor');
 *
 *   // At start of function
 *   logFunctionStart('generateAIPatternInsights');
 *
 *   // On success
 *   logFunctionSuccess('generateAIPatternInsights', { usersProcessed: 10, insightsGenerated: 150 });
 *
 *   // On error
 *   logFunctionError('generateAIPatternInsights', error, { userId: 'xxx', phase: 'GPT call' });
 *
 *   // At end with summary
 *   logFunctionSummary('generateAIPatternInsights', { success: 8, failed: 2, duration: 45000 });
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// =============================================================================
// CONSTANTS
// =============================================================================

const MONITORED_FUNCTIONS = [
  'generateAIPatternInsights',
  'generateWeeklyReflectionInsights',
  'generateWeeklyHabitInsights',
  'generateWeeklyGoalInsights',
  'recalculateAIContextNightly',
  'generateDailyContent',
  'generateWeeklyContent',
];

// Severity levels for Cloud Logging
const SEVERITY = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
};

// =============================================================================
// STRUCTURED LOGGING HELPERS
// =============================================================================

/**
 * Create a structured log entry for Cloud Logging
 * @param {string} functionName - Name of the cloud function
 * @param {string} severity - Log severity level
 * @param {string} message - Human-readable message
 * @param {Object} metadata - Additional structured data
 */
function structuredLog(functionName, severity, message, metadata = {}) {
  const entry = {
    severity,
    message: `[${functionName}] ${message}`,
    functionName,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  // Use console methods that map to Cloud Logging severity
  switch (severity) {
    case SEVERITY.DEBUG:
      console.debug(JSON.stringify(entry));
      break;
    case SEVERITY.INFO:
      console.info(JSON.stringify(entry));
      break;
    case SEVERITY.WARNING:
      console.warn(JSON.stringify(entry));
      break;
    case SEVERITY.ERROR:
    case SEVERITY.CRITICAL:
      console.error(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
  }

  return entry;
}

/**
 * Log function start - call at the beginning of scheduled functions
 * @param {string} functionName - Name of the cloud function
 * @param {Object} context - Optional context (e.g., triggeredBy, weekId)
 */
function logFunctionStart(functionName, context = {}) {
  return structuredLog(functionName, SEVERITY.INFO, 'Function execution started', {
    event: 'FUNCTION_START',
    ...context,
  });
}

/**
 * Log function success - call when a unit of work completes successfully
 * @param {string} functionName - Name of the cloud function
 * @param {Object} metrics - Success metrics (e.g., usersProcessed, itemsCreated)
 */
function logFunctionSuccess(functionName, metrics = {}) {
  return structuredLog(functionName, SEVERITY.INFO, 'Operation completed successfully', {
    event: 'FUNCTION_SUCCESS',
    metrics,
  });
}

/**
 * Log function error - call when an error occurs
 * Errors with severity ERROR will trigger Cloud Monitoring alerts
 * @param {string} functionName - Name of the cloud function
 * @param {Error} error - The error object
 * @param {Object} context - Context where error occurred (e.g., userId, phase)
 */
function logFunctionError(functionName, error, context = {}) {
  return structuredLog(functionName, SEVERITY.ERROR, `Error: ${error.message}`, {
    event: 'FUNCTION_ERROR',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  });
}

/**
 * Log function warning - for non-critical issues
 * @param {string} functionName - Name of the cloud function
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
function logFunctionWarning(functionName, message, context = {}) {
  return structuredLog(functionName, SEVERITY.WARNING, message, {
    event: 'FUNCTION_WARNING',
    ...context,
  });
}

/**
 * Log function completion summary - call at the end of scheduled functions
 * @param {string} functionName - Name of the cloud function
 * @param {Object} summary - Summary stats
 * @param {number} summary.total - Total items processed
 * @param {number} summary.successful - Successfully processed items
 * @param {number} summary.failed - Failed items
 * @param {number} summary.durationMs - Execution duration in ms
 * @param {Array} summary.errors - Array of error details (optional)
 */
function logFunctionSummary(functionName, summary) {
  const { total = 0, successful = 0, failed = 0, durationMs = 0, errors = [] } = summary;

  const severity = failed > 0 ? SEVERITY.WARNING : SEVERITY.INFO;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;

  const entry = structuredLog(functionName, severity,
    `Completed: ${successful}/${total} successful (${successRate}%)`, {
    event: 'FUNCTION_COMPLETE',
    summary: {
      total,
      successful,
      failed,
      successRate,
      durationMs,
      durationSec: Math.round(durationMs / 1000),
    },
    ...(errors.length > 0 && { failedItems: errors.slice(0, 10) }), // Limit to 10 errors
  });

  return entry;
}

// =============================================================================
// FIRESTORE LOGGING (Optional - for dashboard/historical analysis)
// =============================================================================

/**
 * Write function execution record to Firestore for historical tracking
 * @param {string} functionName - Name of the cloud function
 * @param {Object} record - Execution record
 */
async function writeFunctionLog(functionName, record) {
  try {
    const db = admin.firestore();
    const logRef = db.collection('_functionLogs').doc();

    await logRef.set({
      functionName,
      ...record,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return logRef.id;
  } catch (error) {
    // Don't fail the function if logging fails
    console.error(`[FunctionMonitor] Failed to write log to Firestore:`, error.message);
    return null;
  }
}

/**
 * Create a complete execution record for a scheduled function
 * Call this at the end of your function with all results
 * @param {string} functionName - Name of the cloud function
 * @param {Object} params - Execution parameters
 */
async function recordFunctionExecution(functionName, params) {
  const {
    startTime,
    endTime = new Date(),
    total = 0,
    successful = 0,
    failed = 0,
    errors = [],
    metadata = {},
  } = params;

  const durationMs = endTime.getTime() - startTime.getTime();
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;

  const record = {
    status: failed === 0 ? 'success' : (successful === 0 ? 'failed' : 'partial'),
    startTime,
    endTime,
    durationMs,
    durationSec: Math.round(durationMs / 1000),
    metrics: {
      total,
      successful,
      failed,
      successRate,
    },
    errors: errors.slice(0, 20), // Limit stored errors
    metadata,
  };

  // Log to Cloud Logging
  logFunctionSummary(functionName, {
    total,
    successful,
    failed,
    durationMs,
    errors,
  });

  // Write to Firestore (async, don't block)
  await writeFunctionLog(functionName, record);

  return record;
}

// =============================================================================
// CONVENIENCE WRAPPER FOR SCHEDULED FUNCTIONS
// =============================================================================

/**
 * Wrap a scheduled function with automatic monitoring
 * @param {string} functionName - Name of the function for logging
 * @param {Function} handler - The async function to execute
 * @returns {Function} Wrapped function with monitoring
 *
 * Usage:
 *   const generateInsights = withMonitoring('generateAIPatternInsights', async (context) => {
 *     // ... function logic ...
 *     return { total: 10, successful: 8, failed: 2, errors: [...] };
 *   });
 */
function withMonitoring(functionName, handler) {
  return async (context) => {
    const startTime = new Date();
    logFunctionStart(functionName, { triggeredAt: startTime.toISOString() });

    try {
      const result = await handler(context);

      // If handler returns monitoring data, record it
      if (result && typeof result === 'object') {
        await recordFunctionExecution(functionName, {
          startTime,
          total: result.total || 0,
          successful: result.successful || result.total || 0,
          failed: result.failed || 0,
          errors: result.errors || [],
          metadata: result.metadata || {},
        });
      } else {
        // Simple success logging
        logFunctionSuccess(functionName, { result });
      }

      return null; // Pub/Sub functions should return null
    } catch (error) {
      logFunctionError(functionName, error, { phase: 'execution' });

      await recordFunctionExecution(functionName, {
        startTime,
        total: 0,
        successful: 0,
        failed: 1,
        errors: [{ error: error.message, stack: error.stack }],
      });

      return null; // Don't throw - log the error instead
    }
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Core logging functions
  logFunctionStart,
  logFunctionSuccess,
  logFunctionError,
  logFunctionWarning,
  logFunctionSummary,

  // Firestore logging
  writeFunctionLog,
  recordFunctionExecution,

  // Convenience wrapper
  withMonitoring,

  // Constants
  MONITORED_FUNCTIONS,
  SEVERITY,
};
