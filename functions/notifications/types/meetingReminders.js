const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getUserLocalTime, getTodayString, isTimeMatch } = require('../helpers/timezoneHelpers');

// Email templates
const meetingReminderTemplate = require('../email/templates/meetingReminder');
const todaysMeetingsTemplate = require('../email/templates/todaysMeetings');
const meetingAddedTemplate = require('../email/templates/meetingAdded');
const meetingAttendedTemplate = require('../email/templates/meetingAttended');

// Phase 4: Meeting batching - 30-second debounce window for multiple meeting additions
const pendingMeetingNotifications = new Map(); // userId → { meetings: [], timeoutId }

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
 * Today's Meetings Summary - EMAIL VERSION (Phase 10)
 * Runs daily at 7 AM user's local time
 * Sends single EMAIL listing all meetings scheduled for today
 */
exports.todaysMeetingsSummary = functions.pubsub
    .schedule('0 7 * * *') // Daily at 7 AM UTC
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running today\'s meetings summary function (EMAIL)');

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

                // Send if user's local time is in the 7 AM hour
                if (localTime.hour === 7) {
                    const todayString = getTodayString(timezone);

                    const meetingsSnapshot = await db.collection('meetings')
                        .where('userId', '==', userId)
                        .where('date', '==', todayString)
                        .orderBy('startTime', 'asc')
                        .get();

                    if (meetingsSnapshot.empty) continue;

                    const meetings = meetingsSnapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            if (!data.name || !data.startTime) return null;
                            return {
                                name: data.name,
                                type: data.type || 'personal',
                                startTime: data.startTime,
                                location: data.location || 'TBD'
                            };
                        })
                        .filter(m => m !== null);

                    if (meetings.length === 0) continue;

                    // Build meetings list HTML
                    const meetingsList = meetings.map(m => `
                        <div style="background: #f0fdfa; border-left: 4px solid #058585; padding: 15px; margin-bottom: 10px; border-radius: 0 8px 8px 0;">
                            <h4 style="margin: 0; color: #047272; font-size: 16px;">${m.name}</h4>
                            <p style="margin: 5px 0 0; color: #058585; font-size: 14px;">${m.startTime} - ${m.location}</p>
                        </div>
                    `).join('');

                    const emailHtml = renderTemplate(todaysMeetingsTemplate, {
                        userName: userData.firstName || 'there',
                        meetingCount: meetings.length.toString(),
                        meetingsList,
                        meetingsUrl: 'https://app.glrecoveryservices.com?tab=meetings',
                        unsubscribeLink: getUnsubscribeLink(userId, 'meetingsSummary')
                    });

                    emailPromises.push(
                        db.collection('mail').add({
                            to: [userData.email],
                            message: {
                                subject: `Today's Meetings: ${meetings.length} scheduled`,
                                html: emailHtml,
                                text: htmlToPlainText(emailHtml)
                            },
                            tenantId: 'glrs'
                        }).catch(err => console.error(`Failed to queue meetings summary for ${userId}:`, err))
                    );
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} meeting summary emails`);

        } catch (error) {
            console.error('Error in todaysMeetingsSummary:', error);
            throw error;
        }
    });

/**
 * Meeting Reminder - 24 Hours Before - EMAIL VERSION (Phase 10)
 * Runs every 15 minutes
 * Sends EMAIL 24 hours before meeting starts
 */
exports.meeting24HourReminder = functions.pubsub
    .schedule('*/15 * * * *') // Every 15 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running 24-hour meeting reminder function (EMAIL)');

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

                const tomorrow = new Date(now);
                tomorrow.setHours(tomorrow.getHours() + 24);

                const tomorrowString = tomorrow.toLocaleDateString('en-CA', {
                    timeZone: timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

                const localTime = getUserLocalTime(now, timezone);
                const currentTimeString = localTime.formatted;

                const meetingsSnapshot = await db.collection('meetings')
                    .where('userId', '==', userId)
                    .where('date', '==', tomorrowString)
                    .get();

                for (const meetingDoc of meetingsSnapshot.docs) {
                    const meeting = meetingDoc.data();

                    if (!meeting.name || !meeting.startTime) continue;

                    if (isTimeMatch(currentTimeString, meeting.startTime, 15)) {
                        const emailHtml = renderTemplate(meetingReminderTemplate, {
                            userName: userData.firstName || 'there',
                            meetingName: meeting.name,
                            meetingDate: tomorrowString,
                            meetingTime: meeting.startTime,
                            reminderText: 'Tomorrow',
                            meetingLocation: meeting.location || 'TBD',
                            meetingsUrl: 'https://app.glrecoveryservices.com?tab=meetings',
                            unsubscribeLink: getUnsubscribeLink(userId, 'meetingReminders')
                        });

                        emailPromises.push(
                            db.collection('mail').add({
                                to: [userData.email],
                                message: {
                                    subject: `Meeting Tomorrow: "${meeting.name}" at ${meeting.startTime}`,
                                    html: emailHtml,
                                    text: htmlToPlainText(emailHtml)
                                },
                                tenantId: 'glrs'
                            }).catch(err => console.error(`Failed to queue 24h reminder for ${userId}:`, err))
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} 24-hour meeting reminder emails`);

        } catch (error) {
            console.error('Error in meeting24HourReminder:', error);
            throw error;
        }
    });

/**
 * Meeting Reminder - 1 Hour Before - EMAIL VERSION (Phase 10)
 * Runs every 5 minutes
 * Sends EMAIL 1 hour before meeting starts
 */
exports.meeting1HourReminder = functions.pubsub
    .schedule('*/5 * * * *') // Every 5 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running 1-hour meeting reminder function (EMAIL)');

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

                const todayString = getTodayString(timezone);

                const oneHourFromNow = new Date(now);
                oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

                const oneHourTime = getUserLocalTime(oneHourFromNow, timezone);
                const oneHourTimeString = oneHourTime.formatted;

                const meetingsSnapshot = await db.collection('meetings')
                    .where('userId', '==', userId)
                    .where('date', '==', todayString)
                    .get();

                for (const meetingDoc of meetingsSnapshot.docs) {
                    const meeting = meetingDoc.data();

                    if (!meeting.name || !meeting.startTime) continue;

                    if (isTimeMatch(oneHourTimeString, meeting.startTime, 5)) {
                        const emailHtml = renderTemplate(meetingReminderTemplate, {
                            userName: userData.firstName || 'there',
                            meetingName: meeting.name,
                            meetingDate: todayString,
                            meetingTime: meeting.startTime,
                            reminderText: 'Starting in 1 hour',
                            meetingLocation: meeting.location || 'TBD',
                            meetingsUrl: 'https://app.glrecoveryservices.com?tab=meetings',
                            unsubscribeLink: getUnsubscribeLink(userId, 'meetingReminders')
                        });

                        emailPromises.push(
                            db.collection('mail').add({
                                to: [userData.email],
                                message: {
                                    subject: `Meeting in 1 Hour: "${meeting.name}"`,
                                    html: emailHtml,
                                    text: htmlToPlainText(emailHtml)
                                },
                                tenantId: 'glrs'
                            }).catch(err => console.error(`Failed to queue 1h reminder for ${userId}:`, err))
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} 1-hour meeting reminder emails`);

        } catch (error) {
            console.error('Error in meeting1HourReminder:', error);
            throw error;
        }
    });

/**
 * Meeting Starting Now - EMAIL VERSION (Phase 10)
 * Runs every 5 minutes
 * Sends EMAIL when meeting is starting (within 5-minute window)
 */
exports.meetingStartingNow = functions.pubsub
    .schedule('*/5 * * * *') // Every 5 minutes
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running meeting starting now function (EMAIL)');

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
                const currentTimeString = localTime.formatted;
                const todayString = getTodayString(timezone);

                const meetingsSnapshot = await db.collection('meetings')
                    .where('userId', '==', userId)
                    .where('date', '==', todayString)
                    .get();

                for (const meetingDoc of meetingsSnapshot.docs) {
                    const meeting = meetingDoc.data();

                    if (!meeting.name || !meeting.startTime) continue;

                    if (isTimeMatch(currentTimeString, meeting.startTime, 5)) {
                        const emailHtml = renderTemplate(meetingReminderTemplate, {
                            userName: userData.firstName || 'there',
                            meetingName: meeting.name,
                            meetingDate: todayString,
                            meetingTime: meeting.startTime,
                            reminderText: 'Starting Now!',
                            meetingLocation: meeting.location || 'TBD',
                            meetingsUrl: 'https://app.glrecoveryservices.com?tab=meetings',
                            unsubscribeLink: getUnsubscribeLink(userId, 'meetingReminders')
                        });

                        emailPromises.push(
                            db.collection('mail').add({
                                to: [userData.email],
                                message: {
                                    subject: `Meeting Starting Now: "${meeting.name}"`,
                                    html: emailHtml,
                                    text: htmlToPlainText(emailHtml)
                                },
                                tenantId: 'glrs'
                            }).catch(err => console.error(`Failed to queue starting now email for ${userId}:`, err))
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Queued ${emailPromises.length} meeting starting now emails`);

        } catch (error) {
            console.error('Error in meetingStartingNow:', error);
            throw error;
        }
    });

/**
 * Meeting Added Notification - EMAIL VERSION (Phase 10)
 * Firestore onCreate trigger - fires when meeting added
 * Collects multiple meeting additions within 30-second window
 * Sends single batched EMAIL to reduce spam
 */
exports.meetingAddedNotification = functions.firestore
    .document('meetings/{meetingId}')
    .onCreate(async (snap, context) => {
        const meeting = snap.data();
        const userId = meeting.userId;
        const meetingId = context.params.meetingId;

        if (!userId || !meeting.name || !meeting.date || !meeting.startTime) {
            console.error(`Meeting ${meetingId} missing required fields`);
            return null;
        }

        // Add to pending batch
        if (!pendingMeetingNotifications.has(userId)) {
            pendingMeetingNotifications.set(userId, {
                meetings: [],
                timeoutId: null
            });
        }

        const userBatch = pendingMeetingNotifications.get(userId);
        userBatch.meetings.push({
            id: meetingId,
            name: meeting.name,
            date: meeting.date,
            startTime: meeting.startTime,
            location: meeting.location || 'TBD',
            type: meeting.type
        });

        if (userBatch.timeoutId) {
            clearTimeout(userBatch.timeoutId);
        }

        // 30-second debounce
        userBatch.timeoutId = setTimeout(async () => {
            const meetings = userBatch.meetings;
            pendingMeetingNotifications.delete(userId);

            if (meetings.length === 0) return;

            const db = admin.firestore();

            try {
                const userDoc = await db.collection('users').doc(userId).get();
                if (!userDoc.exists || !userDoc.data().email) return;

                const userData = userDoc.data();

                let meetingSummary, meetingDetails;

                if (meetings.length === 1) {
                    meetingSummary = 'A new meeting has been added to your calendar:';
                    meetingDetails = `
                        <h3 style="margin: 0; color: #1e40af; font-size: 18px;">${meetings[0].name}</h3>
                        <p style="margin: 8px 0 0; color: #1d4ed8; font-size: 14px;"><strong>Date:</strong> ${meetings[0].date}</p>
                        <p style="margin: 4px 0 0; color: #1d4ed8; font-size: 14px;"><strong>Time:</strong> ${meetings[0].startTime}</p>
                        <p style="margin: 4px 0 0; color: #1d4ed8; font-size: 14px;"><strong>Location:</strong> ${meetings[0].location}</p>
                    `;
                } else {
                    meetingSummary = `${meetings.length} meetings have been added to your calendar:`;
                    meetingDetails = meetings.map(m => `
                        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #dbeafe;">
                            <strong style="color: #1e40af;">${m.name}</strong><br>
                            <span style="color: #1d4ed8; font-size: 14px;">${m.date} at ${m.startTime} - ${m.location}</span>
                        </div>
                    `).join('');
                }

                const emailHtml = renderTemplate(meetingAddedTemplate, {
                    userName: userData.firstName || 'there',
                    meetingSummary,
                    meetingDetails,
                    meetingsUrl: 'https://app.glrecoveryservices.com?tab=meetings',
                    unsubscribeLink: getUnsubscribeLink(userId, 'meetingAdded')
                });

                const subject = meetings.length === 1
                    ? `Meeting Added: "${meetings[0].name}" on ${meetings[0].date}`
                    : `${meetings.length} Meetings Added to Your Calendar`;

                await db.collection('mail').add({
                    to: [userData.email],
                    message: {
                        subject,
                        html: emailHtml,
                        text: htmlToPlainText(emailHtml)
                    },
                    tenantId: 'glrs'
                });

                console.log(`Sent batched meeting email to ${userId} for ${meetings.length} meetings`);

            } catch (error) {
                console.error(`Failed to send meeting email to ${userId}:`, error);
            }
        }, 30000);

        return null;
    });

/**
 * Meeting Attended Notification - EMAIL VERSION (Phase 10)
 * Firestore onUpdate trigger - fires when meeting is marked as attended
 * Sends EMAIL when user checks in to a meeting
 */
exports.meetingAttendedNotification = functions.firestore
    .document('meetings/{meetingId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const meetingId = context.params.meetingId;

        if (before.attended === true || after.attended !== true) {
            return null;
        }

        const userId = after.userId;

        if (!userId || !after.name) {
            console.error(`Meeting ${meetingId} missing required fields`);
            return null;
        }

        const db = admin.firestore();

        try {
            const userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists || !userDoc.data().email) {
                console.log(`User ${userId} not found or no email`);
                return null;
            }

            const userData = userDoc.data();

            const emailHtml = renderTemplate(meetingAttendedTemplate, {
                userName: userData.firstName || 'there',
                meetingName: after.name,
                meetingDate: after.date || 'Today',
                journeyUrl: 'https://app.glrecoveryservices.com?tab=journey',
                unsubscribeLink: getUnsubscribeLink(userId, 'meetingAttended')
            });

            await db.collection('mail').add({
                to: [userData.email],
                message: {
                    subject: `Great job attending "${after.name}"!`,
                    html: emailHtml,
                    text: htmlToPlainText(emailHtml)
                },
                tenantId: 'glrs'
            });

            console.log(`Sent meeting attended email to ${userId} for meeting ${meetingId}`);
            return null;

        } catch (error) {
            console.error('Error in meetingAttendedNotification:', error);
            throw error;
        }
    });
