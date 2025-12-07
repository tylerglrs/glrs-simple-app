const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getUserLocalTime, calculateDaysBetween } = require('../helpers/timezoneHelpers');

// Email templates
const milestoneApproachingTemplate = require('../email/templates/milestoneApproaching');
const milestoneReachedTemplate = require('../email/templates/milestoneReached');
const goalCompletedTemplate = require('../email/templates/goalCompleted');

// Standard sobriety milestones in days
const MILESTONE_DAYS = [7, 30, 60, 90, 180, 365, 730, 1095, 1825, 2555, 3650];

// Milestone labels for user-friendly display
const MILESTONE_LABELS = {
    7: '1 Week',
    30: '1 Month',
    60: '2 Months',
    90: '3 Months',
    180: '6 Months',
    365: '1 Year',
    730: '2 Years',
    1095: '3 Years',
    1825: '5 Years',
    2555: '7 Years',
    3650: '10 Years'
};

/**
 * Simple template renderer - replaces {{variable}} with values
 */
function renderTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
}

/**
 * Strip HTML tags for plain text version
 */
function htmlToPlainText(html) {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Generate unsubscribe link
 */
function getUnsubscribeLink(userId, type) {
    return `https://app.glrecoveryservices.com?tab=profile&action=unsubscribe&type=${type}&uid=${userId}`;
}

/**
 * Milestone Approaching Notification - EMAIL VERSION (Phase 9)
 * Runs daily at 9 AM user's local time
 * Notifies PIR 3 days before reaching a milestone via EMAIL
 */
exports.milestoneApproachingNotification = functions.pubsub
    .schedule('*/15 * * * *') // Every 15 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running milestone approaching notification function (EMAIL)');

        const db = admin.firestore();
        const now = new Date();

        try {
            const usersSnapshot = await db.collection('users')
                .where('notifications.enabled', '==', true)
                .where('sobrietyDate', '!=', null)
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const timezone = userData.timezone || 'America/Los_Angeles';

                // Skip if no email
                if (!userData.email) continue;

                const localTime = getUserLocalTime(now, timezone);

                // Send at 9:00 AM user's local time
                if (localTime.hour === 9 && localTime.minute < 15) {
                    const sobrietyDate = userData.sobrietyDate.toDate();
                    const daysSober = calculateDaysBetween(sobrietyDate, now);

                    // Check if user is 3 days away from any milestone
                    for (const milestone of MILESTONE_DAYS) {
                        if (daysSober === milestone - 3) {
                            const milestoneLabel = MILESTONE_LABELS[milestone] || `${milestone} days`;

                            const emailHtml = renderTemplate(milestoneApproachingTemplate, {
                                userName: userData.firstName || 'there',
                                milestoneLabel,
                                daysUntil: '3',
                                journeyUrl: 'https://app.glrecoveryservices.com?tab=journey',
                                unsubscribeLink: getUnsubscribeLink(userId, 'milestoneAlerts')
                            });

                            emailPromises.push(
                                db.collection('mail').add({
                                    to: [userData.email],
                                    message: {
                                        subject: `3 days until your ${milestoneLabel} milestone!`,
                                        html: emailHtml,
                                        text: htmlToPlainText(emailHtml)
                                    },
                                    tenantId: 'glrs'
                                }).catch(err => console.error(`Failed to queue approaching milestone email for ${userId}:`, err))
                            );

                            console.log(`User ${userId} is 3 days from ${milestoneLabel} milestone`);
                        }
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} milestone approaching emails`);

        } catch (error) {
            console.error('Error in milestoneApproachingNotification:', error);
            throw error;
        }
    });

/**
 * Milestone Reached Notification - EMAIL VERSION (Phase 9)
 * Firestore onCreate trigger - fires when user completes check-in
 * Celebrates IMMEDIATELY when PIR reaches milestone day via EMAIL
 */
exports.milestoneReachedNotification = functions.firestore
    .document('checkIns/{checkInId}')
    .onCreate(async (snap, context) => {
        const checkIn = snap.data();
        const userId = checkIn.userId;
        const checkInId = context.params.checkInId;

        console.log(`Check-in ${checkInId} completed by user ${userId}`);

        const db = admin.firestore();

        try {
            const userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists || !userDoc.data().sobrietyDate) {
                return null;
            }

            const userData = userDoc.data();

            // Skip if no email
            if (!userData.email) {
                console.log(`User ${userId} has no email, skipping milestone notification`);
                return null;
            }

            const sobrietyDate = userData.sobrietyDate.toDate();
            const now = new Date();
            const daysSober = calculateDaysBetween(sobrietyDate, now);

            // Check if today is a milestone day
            if (MILESTONE_DAYS.includes(daysSober)) {
                const milestoneLabel = MILESTONE_LABELS[daysSober] || `${daysSober} days`;

                // Send email to PIR
                const emailHtml = renderTemplate(milestoneReachedTemplate, {
                    userName: userData.firstName || 'there',
                    milestoneLabel,
                    daysSober: daysSober.toString(),
                    journeyUrl: 'https://app.glrecoveryservices.com?tab=journey',
                    unsubscribeLink: getUnsubscribeLink(userId, 'milestoneAlerts')
                });

                await db.collection('mail').add({
                    to: [userData.email],
                    message: {
                        subject: `Congratulations on ${milestoneLabel} of sobriety!`,
                        html: emailHtml,
                        text: htmlToPlainText(emailHtml)
                    },
                    tenantId: 'glrs'
                });

                console.log(`User ${userId} reached ${milestoneLabel} milestone - email sent`);

                // Also notify assigned coach
                if (userData.assignedCoach && userData.firstName) {
                    const coachDoc = await db.collection('users').doc(userData.assignedCoach).get();

                    if (coachDoc.exists && coachDoc.data().email) {
                        const coachData = coachDoc.data();
                        const pirName = `${userData.firstName} ${userData.lastName || ''}`.trim();

                        await db.collection('mail').add({
                            to: [coachData.email],
                            message: {
                                subject: `${pirName} reached ${milestoneLabel} of sobriety!`,
                                html: `<p>Hi ${coachData.firstName || 'Coach'},</p><p>Great news! <strong>${pirName}</strong> has reached <strong>${milestoneLabel}</strong> of sobriety today!</p><p>This is a significant milestone worth celebrating.</p><p><a href="https://app.glrecoveryservices.com/coach/pirs/${userId}">View PIR Profile</a></p><p>- Guiding Light Recovery Services</p>`,
                                text: `${pirName} reached ${milestoneLabel} of sobriety! View their profile at https://app.glrecoveryservices.com/coach/pirs/${userId}`
                            },
                            tenantId: 'glrs'
                        });

                        console.log(`Notified coach ${userData.assignedCoach} about milestone`);
                    }
                }
            }

            return null;

        } catch (error) {
            console.error('Error in milestoneReachedNotification:', error);
            throw error;
        }
    });

/**
 * Custom Goal Completed Notification - EMAIL VERSION (Phase 9)
 * Firestore trigger when goal progress reaches 100%
 * Celebrates custom goal completion via EMAIL
 */
exports.customGoalCompletedNotification = functions.firestore
    .document('goals/{goalId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        const beforeProgress = before.progress || 0;
        const afterProgress = after.progress || 0;

        if (beforeProgress < 100 && afterProgress >= 100) {
            const goalId = context.params.goalId;
            const userId = after.userId;

            console.log(`Goal ${goalId} completed by user ${userId}`);

            const db = admin.firestore();

            try {
                const userDoc = await db.collection('users').doc(userId).get();

                if (!userDoc.exists) {
                    console.warn(`User ${userId} not found`);
                    return;
                }

                const userData = userDoc.data();

                // Skip if no email
                if (!userData.email) {
                    console.log(`User ${userId} has no email, skipping goal notification`);
                    return;
                }

                // Send email to PIR
                const emailHtml = renderTemplate(goalCompletedTemplate, {
                    userName: userData.firstName || 'there',
                    goalTitle: after.title,
                    goalCategory: after.category || 'Personal',
                    journeyUrl: 'https://app.glrecoveryservices.com?tab=journey',
                    unsubscribeLink: getUnsubscribeLink(userId, 'milestoneAlerts')
                });

                await db.collection('mail').add({
                    to: [userData.email],
                    message: {
                        subject: `Goal Achieved: "${after.title}"`,
                        html: emailHtml,
                        text: htmlToPlainText(emailHtml)
                    },
                    tenantId: 'glrs'
                });

                // Notify assigned coach
                if (userData.assignedCoach && userData.firstName) {
                    const coachDoc = await db.collection('users').doc(userData.assignedCoach).get();

                    if (coachDoc.exists && coachDoc.data().email) {
                        const coachData = coachDoc.data();
                        const pirName = `${userData.firstName} ${userData.lastName || ''}`.trim();

                        await db.collection('mail').add({
                            to: [coachData.email],
                            message: {
                                subject: `${pirName} completed goal: "${after.title}"`,
                                html: `<p>Hi ${coachData.firstName || 'Coach'},</p><p><strong>${pirName}</strong> has completed their goal: <strong>"${after.title}"</strong>.</p><p>Category: ${after.category || 'Personal'}</p><p><a href="https://app.glrecoveryservices.com/coach/pirs/${userId}">View PIR Profile</a></p><p>- Guiding Light Recovery Services</p>`,
                                text: `${pirName} completed goal "${after.title}". View their profile at https://app.glrecoveryservices.com/coach/pirs/${userId}`
                            },
                            tenantId: 'glrs'
                        });

                        console.log(`Notified coach ${userData.assignedCoach} about completed goal`);
                    }
                }

            } catch (error) {
                console.error('Error in customGoalCompletedNotification:', error);
                throw error;
            }
        }
    });
