const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getUserLocalTime, isTimeMatch, getTodayString } = require('../helpers/timezoneHelpers');
const { isInQuietHours } = require('../helpers/sendNotification');
const morningCheckinTemplate = require('../email/templates/morningCheckinReminder');
const eveningReflectionTemplate = require('../email/templates/eveningReflectionReminder');

/**
 * Simple template renderer - replaces {{variable}} with values
 * @param {string} template - HTML template with {{placeholders}}
 * @param {Object} data - Key-value pairs for replacement
 * @returns {string} Rendered HTML
 */
function renderTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
}

/**
 * Generate unsubscribe link for email preferences
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @returns {string} Unsubscribe URL
 */
function getUnsubscribeLink(userId, type) {
    return `https://app.glrecoveryservices.com?tab=profile&action=unsubscribe&type=${type}&uid=${userId}`;
}

/**
 * Calculate days sober from recovery start date
 * @param {string|Object} recoveryStartDate - ISO string or Firestore Timestamp
 * @returns {number} Number of days sober
 */
function calculateDaysSober(recoveryStartDate) {
    if (!recoveryStartDate) return 0;

    let startDate;
    if (recoveryStartDate.toDate) {
        // Firestore Timestamp
        startDate = recoveryStartDate.toDate();
    } else if (typeof recoveryStartDate === 'string') {
        startDate = new Date(recoveryStartDate);
    } else {
        return 0;
    }

    const now = new Date();
    const diffTime = now - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

/**
 * Strip HTML tags for plain text version
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
function htmlToPlainText(html) {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Morning Check-in Reminder - EMAIL VERSION (Phase 8 - Firebase Extension)
 * Runs every hour, checks all users whose local time matches their morningCheckInTime preference
 * CHANGED: Now writes to Firestore `mail` collection for Firebase Email Extension
 * Only sends if user hasn't completed check-in today
 */
exports.morningCheckInReminder = functions.pubsub
    .schedule('0 * * * *') // Every hour
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running morning check-in reminder function (EMAIL via Firestore)');

        const db = admin.firestore();
        const now = new Date();

        try {
            // Get all users with notifications enabled
            const usersSnapshot = await db.collection('users')
                .where('notifications.enabled', '==', true)
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const notifications = userData.notifications || {};

                // Skip if morning check-in time not set or explicitly disabled
                if (!notifications.morningCheckInTime && !notifications.morningCheckIn) {
                    continue;
                }

                // Skip if user has no email
                if (!userData.email) {
                    console.log(`User ${userId} has no email, skipping`);
                    continue;
                }

                // Get user's local time
                const timezone = userData.timezone || 'America/Los_Angeles';
                const localTime = getUserLocalTime(now, timezone);
                const morningTime = notifications.morningCheckInTime || notifications.morningCheckIn || '08:00';

                // Check if current time matches user's morning check-in time (within 30-minute window for hourly run)
                if (isTimeMatch(localTime.formatted, morningTime, 30)) {
                    // Check quiet hours
                    const quietHours = notifications.quietHours || {};
                    if (quietHours.enabled && isInQuietHours(timezone, quietHours)) {
                        console.log(`User ${userId} in quiet hours, skipping email`);
                        continue;
                    }

                    // Check if user already completed check-in today
                    const todayString = getTodayString(timezone);
                    const checkInSnapshot = await db.collection('checkIns')
                        .where('userId', '==', userId)
                        .where('date', '==', todayString)
                        .where('type', '==', 'morning')
                        .limit(1)
                        .get();

                    if (!checkInSnapshot.empty) {
                        console.log(`User ${userId} already completed morning check-in today`);
                        continue;
                    }

                    // Calculate days sober
                    const daysSober = calculateDaysSober(userData.recoveryStartDate);

                    // Render email template
                    const emailHtml = renderTemplate(morningCheckinTemplate, {
                        userName: userData.firstName || 'there',
                        daysSober: daysSober || '0',
                        checkinUrl: 'https://app.glrecoveryservices.com?tab=tasks&subtab=checkin',
                        unsubscribeLink: getUnsubscribeLink(userId, 'morningCheckin')
                    });

                    const subject = `Good Morning, ${userData.firstName || 'there'}! Time for your check-in`;

                    // Write to Firestore mail collection (Firebase Email Extension)
                    emailPromises.push(
                        db.collection('mail').add({
                            to: [userData.email],
                            message: {
                                subject: subject,
                                html: emailHtml,
                                text: htmlToPlainText(emailHtml)
                            },
                            tenantId: 'glrs'
                        }).then(() => {
                            console.log(`Queued morning email for ${userId}`);
                        }).catch(error => {
                            console.error(`Failed to queue morning email for ${userId}:`, error);
                        })
                    );
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} morning check-in reminder emails`);

        } catch (error) {
            console.error('Error in morningCheckInReminder:', error);
            throw error;
        }
    });

/**
 * Evening Reflection Reminder - EMAIL VERSION (Phase 8 - Firebase Extension)
 * Runs every hour, checks all users whose local time matches their eveningReflectionTime preference
 * CHANGED: Now writes to Firestore `mail` collection for Firebase Email Extension
 * Only sends if user hasn't completed reflection today
 */
exports.eveningReflectionReminder = functions.pubsub
    .schedule('0 * * * *') // Every hour (Phase 2 optimization - Nov 23, 2025)
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running evening reflection reminder function (EMAIL via Firestore)');

        const db = admin.firestore();
        const now = new Date();

        try {
            // Get all users with notifications enabled
            const usersSnapshot = await db.collection('users')
                .where('notifications.enabled', '==', true)
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const notifications = userData.notifications || {};

                // Skip if evening reflection time not set
                if (!notifications.eveningReflectionTime) {
                    continue;
                }

                // Skip if user has no email
                if (!userData.email) {
                    console.log(`User ${userId} has no email, skipping`);
                    continue;
                }

                // Get user's local time
                const timezone = userData.timezone || 'America/Los_Angeles';
                const localTime = getUserLocalTime(now, timezone);

                // Check if current time matches user's evening reflection time (within 30-minute window for hourly run)
                if (isTimeMatch(localTime.formatted, notifications.eveningReflectionTime, 30)) {
                    // Check quiet hours
                    const quietHours = notifications.quietHours || {};
                    if (quietHours.enabled && isInQuietHours(timezone, quietHours)) {
                        console.log(`User ${userId} in quiet hours, skipping email`);
                        continue;
                    }

                    // Check if user already completed reflection today
                    const todayString = getTodayString(timezone);
                    const reflectionSnapshot = await db.collection('reflections')
                        .where('userId', '==', userId)
                        .where('date', '==', todayString)
                        .limit(1)
                        .get();

                    if (!reflectionSnapshot.empty) {
                        console.log(`User ${userId} already completed evening reflection today`);
                        continue;
                    }

                    // Calculate days sober
                    const daysSober = calculateDaysSober(userData.recoveryStartDate);

                    // Render email template
                    const emailHtml = renderTemplate(eveningReflectionTemplate, {
                        userName: userData.firstName || 'there',
                        daysSober: daysSober || '0',
                        reflectionUrl: 'https://app.glrecoveryservices.com?tab=tasks&subtab=reflection',
                        unsubscribeLink: getUnsubscribeLink(userId, 'eveningReflection')
                    });

                    const subject = `Evening Reflection - How was your day, ${userData.firstName || 'there'}?`;

                    // Write to Firestore mail collection (Firebase Email Extension)
                    emailPromises.push(
                        db.collection('mail').add({
                            to: [userData.email],
                            message: {
                                subject: subject,
                                html: emailHtml,
                                text: htmlToPlainText(emailHtml)
                            },
                            tenantId: 'glrs'
                        }).then(() => {
                            console.log(`Queued evening email for ${userId}`);
                        }).catch(error => {
                            console.error(`Failed to queue evening email for ${userId}:`, error);
                        })
                    );
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} evening reflection reminder emails`);

        } catch (error) {
            console.error('Error in eveningReflectionReminder:', error);
            throw error;
        }
    });

/**
 * DELETED - November 23, 2025
 * dailyPledgeReminder was removed to reduce notification fatigue.
 * Daily pledge feature adds noise without clear value proposition.
 * See NOTIFICATION_OPTIMIZATION_REPORT.md for rationale.
 */
