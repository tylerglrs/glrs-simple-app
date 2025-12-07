const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getUserLocalTime, getTodayString, calculateDaysBetween } = require('../helpers/timezoneHelpers');

// Email templates
const assignmentDueTemplate = require('../email/templates/assignmentDueReminder');
const assignmentOverdueTemplate = require('../email/templates/assignmentOverdueAlert');
const assignmentCompletedTemplate = require('../email/templates/assignmentCompleted');
const newAssignmentTemplate = require('../email/templates/newAssignment');

// Phase 7: Assignment batching - 15-second debounce window for multiple assignment creations
const pendingAssignmentNotifications = new Map(); // userId → { assignments: [], timeoutId }

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
 * Assignment Due in 1 Day Reminder - EMAIL VERSION (Phase 9)
 * Runs daily at 9 AM user's local time
 * Notifies PIR about assignments due tomorrow via EMAIL
 */
exports.assignmentDue1DayReminder = functions.pubsub
    .schedule('*/15 * * * *') // Every 15 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running assignment due 1 day reminder function (EMAIL)');

        const db = admin.firestore();
        const now = new Date();

        try {
            const usersSnapshot = await db.collection('users')
                .where('notifications.enabled', '==', true)
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
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowString = tomorrow.toLocaleDateString('en-CA', {
                        timeZone: timezone,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });

                    const assignmentsSnapshot = await db.collection('assignments')
                        .where('userId', '==', userId)
                        .where('status', '!=', 'completed')
                        .where('dueDate', '==', tomorrowString)
                        .get();

                    if (assignmentsSnapshot.empty) continue;

                    for (const assignmentDoc of assignmentsSnapshot.docs) {
                        const assignment = assignmentDoc.data();

                        const emailHtml = renderTemplate(assignmentDueTemplate, {
                            userName: userData.firstName || 'there',
                            assignmentTitle: assignment.title,
                            dueText: 'Due Tomorrow',
                            taskUrl: 'https://app.glrecoveryservices.com?tab=tasks',
                            unsubscribeLink: getUnsubscribeLink(userId, 'assignmentReminders')
                        });

                        emailPromises.push(
                            db.collection('mail').add({
                                to: [userData.email],
                                message: {
                                    subject: `Reminder: "${assignment.title}" is due tomorrow`,
                                    html: emailHtml,
                                    text: htmlToPlainText(emailHtml)
                                },
                                tenantId: 'glrs'
                            }).catch(err => console.error(`Failed to queue 1-day email for ${userId}:`, err))
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} assignment 1-day reminder emails`);

        } catch (error) {
            console.error('Error in assignmentDue1DayReminder:', error);
            throw error;
        }
    });

/**
 * Assignment Due Today Reminder - EMAIL VERSION (Phase 9)
 * Runs daily at 9 AM user's local time
 * Notifies PIR about assignments due today via EMAIL
 */
exports.assignmentDueTodayReminder = functions.pubsub
    .schedule('*/15 * * * *') // Every 15 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running assignment due today reminder function (EMAIL)');

        const db = admin.firestore();
        const now = new Date();

        try {
            const usersSnapshot = await db.collection('users')
                .where('notifications.enabled', '==', true)
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const timezone = userData.timezone || 'America/Los_Angeles';

                if (!userData.email) continue;

                const localTime = getUserLocalTime(now, timezone);

                if (localTime.hour === 9 && localTime.minute < 15) {
                    const todayString = getTodayString(timezone);

                    const assignmentsSnapshot = await db.collection('assignments')
                        .where('userId', '==', userId)
                        .where('status', '!=', 'completed')
                        .where('dueDate', '==', todayString)
                        .get();

                    if (assignmentsSnapshot.empty) continue;

                    for (const assignmentDoc of assignmentsSnapshot.docs) {
                        const assignment = assignmentDoc.data();

                        const emailHtml = renderTemplate(assignmentDueTemplate, {
                            userName: userData.firstName || 'there',
                            assignmentTitle: assignment.title,
                            dueText: 'Due Today',
                            taskUrl: 'https://app.glrecoveryservices.com?tab=tasks',
                            unsubscribeLink: getUnsubscribeLink(userId, 'assignmentReminders')
                        });

                        emailPromises.push(
                            db.collection('mail').add({
                                to: [userData.email],
                                message: {
                                    subject: `Due Today: "${assignment.title}"`,
                                    html: emailHtml,
                                    text: htmlToPlainText(emailHtml)
                                },
                                tenantId: 'glrs'
                            }).catch(err => console.error(`Failed to queue today email for ${userId}:`, err))
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} assignment due today emails`);

        } catch (error) {
            console.error('Error in assignmentDueTodayReminder:', error);
            throw error;
        }
    });

/**
 * Assignment Overdue Alert - EMAIL VERSION (Phase 9)
 * Runs daily at 9 AM user's local time
 * Notifies PIR about overdue assignments via EMAIL
 */
exports.assignmentOverdueAlert = functions.pubsub
    .schedule('*/15 * * * *') // Every 15 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running assignment overdue alert function (EMAIL)');

        const db = admin.firestore();
        const now = new Date();

        try {
            const usersSnapshot = await db.collection('users')
                .where('notifications.enabled', '==', true)
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const timezone = userData.timezone || 'America/Los_Angeles';

                if (!userData.email) continue;

                const localTime = getUserLocalTime(now, timezone);

                if (localTime.hour === 9 && localTime.minute < 15) {
                    const todayString = getTodayString(timezone);
                    const today = new Date(todayString);

                    const assignmentsSnapshot = await db.collection('assignments')
                        .where('userId', '==', userId)
                        .where('status', '!=', 'completed')
                        .get();

                    for (const assignmentDoc of assignmentsSnapshot.docs) {
                        const assignment = assignmentDoc.data();

                        if (assignment.dueDate) {
                            const dueDate = new Date(assignment.dueDate);
                            if (dueDate < today) {
                                const daysOverdue = calculateDaysBetween(dueDate, today);

                                const emailHtml = renderTemplate(assignmentOverdueTemplate, {
                                    userName: userData.firstName || 'there',
                                    assignmentTitle: assignment.title,
                                    daysOverdue: daysOverdue.toString(),
                                    taskUrl: 'https://app.glrecoveryservices.com?tab=tasks',
                                    unsubscribeLink: getUnsubscribeLink(userId, 'assignmentReminders')
                                });

                                emailPromises.push(
                                    db.collection('mail').add({
                                        to: [userData.email],
                                        message: {
                                            subject: `Overdue: "${assignment.title}" - ${daysOverdue} days past due`,
                                            html: emailHtml,
                                            text: htmlToPlainText(emailHtml)
                                        },
                                        tenantId: 'glrs'
                                    }).catch(err => console.error(`Failed to queue overdue email for ${userId}:`, err))
                                );
                            }
                        }
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} assignment overdue emails`);

        } catch (error) {
            console.error('Error in assignmentOverdueAlert:', error);
            throw error;
        }
    });

/**
 * Assignment Completed Notification - EMAIL VERSION (Phase 9)
 * Firestore trigger when assignment is marked as completed
 * Sends EMAIL to PIR and optionally to coach
 */
exports.assignmentCompletedNotification = functions.firestore
    .document('assignments/{assignmentId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        if (before.status !== 'completed' && after.status === 'completed') {
            const assignmentId = context.params.assignmentId;
            const userId = after.userId;

            console.log(`Assignment ${assignmentId} completed by user ${userId}`);

            const db = admin.firestore();

            try {
                const userDoc = await db.collection('users').doc(userId).get();

                if (!userDoc.exists) {
                    console.warn(`User ${userId} not found`);
                    return;
                }

                const userData = userDoc.data();

                // Send email to PIR
                if (userData.email && userData.notifications?.assignmentCompleted !== false) {
                    const emailHtml = renderTemplate(assignmentCompletedTemplate, {
                        userName: userData.firstName || 'there',
                        assignmentTitle: after.title,
                        journeyUrl: 'https://app.glrecoveryservices.com?tab=journey',
                        unsubscribeLink: getUnsubscribeLink(userId, 'assignmentCompleted')
                    });

                    await db.collection('mail').add({
                        to: [userData.email],
                        message: {
                            subject: `Great job completing "${after.title}"!`,
                            html: emailHtml,
                            text: htmlToPlainText(emailHtml)
                        },
                        tenantId: 'glrs'
                    });
                }

                // Send email to coach
                if (userData.assignedCoach && userData.firstName) {
                    const coachDoc = await db.collection('users').doc(userData.assignedCoach).get();

                    if (coachDoc.exists && coachDoc.data().email) {
                        const coachData = coachDoc.data();
                        const pirName = `${userData.firstName} ${userData.lastName || ''}`.trim();

                        await db.collection('mail').add({
                            to: [coachData.email],
                            message: {
                                subject: `${pirName} completed "${after.title}"`,
                                html: `<p>Hi ${coachData.firstName || 'Coach'},</p><p><strong>${pirName}</strong> has completed their assignment: <strong>"${after.title}"</strong>.</p><p><a href="https://app.glrecoveryservices.com/coach/pirs/${userId}">View PIR Profile</a></p><p>- Guiding Light Recovery Services</p>`,
                                text: `${pirName} completed "${after.title}". View their profile at https://app.glrecoveryservices.com/coach/pirs/${userId}`
                            },
                            tenantId: 'glrs'
                        });

                        console.log(`Notified coach ${userData.assignedCoach} about completed assignment`);
                    }
                }

            } catch (error) {
                console.error('Error in assignmentCompletedNotification:', error);
                throw error;
            }
        }
    });

/**
 * Assignment Created Notification - EMAIL VERSION (Phase 9)
 * Firestore onCreate trigger when new assignment is created
 * Collects multiple assignments within 15-second window
 * Sends single batched EMAIL to PIR
 */
exports.assignmentCreatedNotification = functions.firestore
    .document('assignments/{assignmentId}')
    .onCreate(async (snap, context) => {
        const assignment = snap.data();
        const userId = assignment.userId;
        const assignmentId = context.params.assignmentId;

        console.log(`Assignment ${assignmentId} created for user ${userId}`);

        if (!userId || !assignment.title) {
            console.error(`Assignment ${assignmentId} missing required fields`);
            return null;
        }

        // Add to pending batch
        if (!pendingAssignmentNotifications.has(userId)) {
            pendingAssignmentNotifications.set(userId, {
                assignments: [],
                timeoutId: null
            });
        }

        const userBatch = pendingAssignmentNotifications.get(userId);
        userBatch.assignments.push({
            id: assignmentId,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate
        });

        if (userBatch.timeoutId) {
            clearTimeout(userBatch.timeoutId);
        }

        // 15-second debounce
        userBatch.timeoutId = setTimeout(async () => {
            const assignments = userBatch.assignments;
            pendingAssignmentNotifications.delete(userId);

            if (assignments.length === 0) return;

            const db = admin.firestore();

            try {
                const userDoc = await db.collection('users').doc(userId).get();
                if (!userDoc.exists || !userDoc.data().email) {
                    console.log(`User ${userId} not found or no email`);
                    return;
                }

                const userData = userDoc.data();

                let assignmentSummary, assignmentDetails;

                if (assignments.length === 1) {
                    assignmentSummary = `Your coach has assigned you a new task:`;
                    assignmentDetails = `<h3 style="margin: 0; color: #047272; font-size: 18px;">${assignments[0].title}</h3>`;
                    if (assignments[0].dueDate) {
                        assignmentDetails += `<p style="margin: 8px 0 0; color: #058585; font-size: 14px;">Due: ${assignments[0].dueDate}</p>`;
                    }
                } else {
                    assignmentSummary = `Your coach has assigned you ${assignments.length} new tasks:`;
                    assignmentDetails = assignments.map(a =>
                        `<div style="margin-bottom: 12px;"><strong style="color: #047272;">${a.title}</strong>${a.dueDate ? `<br><span style="color: #6b7280; font-size: 13px;">Due: ${a.dueDate}</span>` : ''}</div>`
                    ).join('');
                }

                const emailHtml = renderTemplate(newAssignmentTemplate, {
                    userName: userData.firstName || 'there',
                    assignmentSummary,
                    assignmentDetails,
                    taskUrl: 'https://app.glrecoveryservices.com?tab=tasks',
                    unsubscribeLink: getUnsubscribeLink(userId, 'newAssignment')
                });

                const subject = assignments.length === 1
                    ? `New Assignment: "${assignments[0].title}"`
                    : `${assignments.length} New Assignments from your coach`;

                await db.collection('mail').add({
                    to: [userData.email],
                    message: {
                        subject,
                        html: emailHtml,
                        text: htmlToPlainText(emailHtml)
                    },
                    tenantId: 'glrs'
                });

                console.log(`Sent batched assignment email to ${userId} for ${assignments.length} assignments`);

            } catch (error) {
                console.error(`Failed to send assignment email to ${userId}:`, error);
            }
        }, 15000);

        return null;
    });
