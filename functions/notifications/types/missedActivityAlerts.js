const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendNotification } = require('../helpers/sendNotification');
const { getUserLocalTime, isTimeMatch, addHours, getTodayString } = require('../helpers/timezoneHelpers');

/**
 * DELETED - November 23, 2025
 *
 * Both functions in this file were deleted to reduce alarm fatigue:
 * - missedCheckInAlert
 * - missedReflectionAlert
 *
 * See NOTIFICATION_OPTIMIZATION_REPORT.md for rationale.
 * File kept for reference but exports no functions.
 */
