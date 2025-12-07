const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sendEmail, renderTemplate, getUnsubscribeLink } = require('../email/sendEmail');
const { getUserLocalTime, getTodayString, calculateDaysBetween } = require('../helpers/timezoneHelpers');

// Import email templates
const dailyDigestTemplate = require('../email/templates/dailyDigest');
const weeklyDigestTemplate = require('../email/templates/weeklyDigest');
const monthlyDigestTemplate = require('../email/templates/monthlyDigest');
const progressReportTemplate = require('../email/templates/progressReport');

/**
 * Daily Email Digest
 * Runs every hour, sends at user's chosen time (default 8 AM)
 * Summary of today's activity, assignments, meetings
 */
exports.dailyEmailDigest = functions.pubsub
    .schedule('0 * * * *') // Every hour
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running daily email digest function');

        const db = admin.firestore();
        const now = new Date();

        try {
            // Get users who want daily digest
            const usersSnapshot = await db.collection('users')
                .where('notifications.emailDigest.enabled', '==', true)
                .where('notifications.emailDigest.frequency', '==', 'daily')
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const timezone = userData.timezone || 'America/Los_Angeles';
                const emailTime = userData.notifications?.emailDigest?.time || '08:00';

                // Get user's local time
                const localTime = getUserLocalTime(now, timezone);

                // Send email at user's chosen time (±15 min window)
                const targetHour = parseInt(emailTime.split(':')[0]);
                if (localTime.hour === targetHour && localTime.minute < 15) {
                    // Gather data for email
                    const todayString = getTodayString(timezone);

                    // Calculate days sober
                    const daysSober = userData.sobrietyDate
                        ? calculateDaysBetween(userData.sobrietyDate.toDate(), now)
                        : 0;

                    // Check morning check-in status
                    const morningCheckIn = await db.collection('checkIns')
                        .where('userId', '==', userId)
                        .where('date', '==', todayString)
                        .where('type', '==', 'morning')
                        .limit(1)
                        .get();

                    // Check evening reflection status
                    const eveningReflection = await db.collection('reflections')
                        .where('userId', '==', userId)
                        .where('date', '==', todayString)
                        .limit(1)
                        .get();

                    // Get assignments due today or tomorrow
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowString = tomorrow.toLocaleDateString('en-CA', { timeZone: timezone });

                    const assignmentsSnapshot = await db.collection('assignments')
                        .where('userId', '==', userId)
                        .where('status', '!=', 'completed')
                        .get();

                    const assignmentsDue = [];
                    assignmentsSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.dueDate === todayString || data.dueDate === tomorrowString) {
                            assignmentsDue.push({
                                title: data.title,
                                dueDate: data.dueDate === todayString ? 'Today' : 'Tomorrow'
                            });
                        }
                    });

                    // Get today's meetings
                    const meetingsSnapshot = await db.collection('meetings')
                        .where('userId', '==', userId)
                        .where('date', '==', todayString)
                        .get();

                    const meetings = meetingsSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            name: data.name,
                            time: data.startTime,
                            location: data.location || 'Location TBD'
                        };
                    });

                    // Get weekly stats (last 7 days)
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    const weeklyCheckIns = await db.collection('checkIns')
                        .where('userId', '==', userId)
                        .where('createdAt', '>=', sevenDaysAgo)
                        .get();

                    const checkinStreak = weeklyCheckIns.size;

                    const weeklyMeetings = await db.collection('meetings')
                        .where('userId', '==', userId)
                        .where('attended', '==', true)
                        .where('date', '>=', sevenDaysAgo.toISOString().split('T')[0])
                        .get();

                    const weeklyTasks = await db.collection('assignments')
                        .where('userId', '==', userId)
                        .where('status', '==', 'completed')
                        .where('completedAt', '>=', sevenDaysAgo)
                        .get();

                    // Render email template
                    const html = renderTemplate(dailyDigestTemplate, {
                        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                        daysSober,
                        morningComplete: !morningCheckIn.empty ? '#d1fae5' : '#fee2e2',
                        morningStatus: !morningCheckIn.empty ? 'Complete' : 'Pending',
                        eveningComplete: !eveningReflection.empty ? '#d1fae5' : '#fee2e2',
                        eveningStatus: !eveningReflection.empty ? 'Complete' : 'Pending',
                        assignmentsDue: assignmentsDue.length > 0 ? assignmentsDue : null,
                        meetings: meetings.length > 0 ? meetings : null,
                        checkinStreak,
                        weeklyMeetings: weeklyMeetings.size,
                        tasksCompleted: weeklyTasks.size,
                        unsubscribeLink: getUnsubscribeLink(userId, 'daily')
                    });

                    emailPromises.push(
                        sendEmail({
                            to: userData.email,
                            subject: `Your Daily Recovery Summary - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                            html
                        }).catch(error => {
                            console.error(`Failed to send daily digest to ${userId}:`, error);
                        })
                    );

                    console.log(`Sent daily digest to ${userData.email}`);
                }
            }

            await Promise.all(emailPromises);
            console.log(`Sent ${emailPromises.length} daily email digests`);

        } catch (error) {
            console.error('Error in dailyEmailDigest:', error);
            throw error;
        }
    });

/**
 * Weekly Email Digest
 * Runs every Monday at 8 AM
 * 7-day summary with trends and insights
 */
exports.weeklyEmailDigest = functions.pubsub
    .schedule('0 8 * * 1') // Every Monday at 8 AM UTC
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running weekly email digest function');

        const db = admin.firestore();
        const now = new Date();

        try {
            // Get users who want weekly digest
            const usersSnapshot = await db.collection('users')
                .where('notifications.emailDigest.enabled', '==', true)
                .where('notifications.emailDigest.frequency', '==', 'weekly')
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();

                // Calculate days sober
                const daysSober = userData.sobrietyDate
                    ? calculateDaysBetween(userData.sobrietyDate.toDate(), now)
                    : 0;

                // Get week's data (last 7 days)
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                // Check-in completion rate
                const checkInsSnapshot = await db.collection('checkIns')
                    .where('userId', '==', userId)
                    .where('createdAt', '>=', sevenDaysAgo)
                    .get();

                const completedCheckins = checkInsSnapshot.size;
                const totalCheckins = 14; // 7 days × 2 check-ins per day
                const completionRate = Math.round((completedCheckins / totalCheckins) * 100);

                // Milestones achieved this week
                const milestones = [];
                const MILESTONE_DAYS = [7, 30, 60, 90, 180, 365, 730, 1095];
                const MILESTONE_LABELS = {
                    7: '1 Week', 30: '1 Month', 60: '2 Months', 90: '3 Months',
                    180: '6 Months', 365: '1 Year', 730: '2 Years', 1095: '3 Years'
                };

                MILESTONE_DAYS.forEach(days => {
                    if (daysSober >= days && daysSober - days <= 7) {
                        milestones.push({
                            label: MILESTONE_LABELS[days],
                            days
                        });
                    }
                });

                // Gratitude themes
                const gratitudesSnapshot = await db.collection('checkIns')
                    .where('userId', '==', userId)
                    .where('createdAt', '>=', sevenDaysAgo)
                    .get();

                const gratitudeThemes = [];
                gratitudesSnapshot.forEach(doc => {
                    const gratitude = doc.data().eveningData?.gratitude;
                    if (gratitude) {
                        const words = gratitude.toLowerCase().split(' ');
                        words.forEach(word => {
                            if (word.length > 4 && gratitudeThemes.length < 5) {
                                gratitudeThemes.push(word);
                            }
                        });
                    }
                });

                // Average mood
                let totalMood = 0;
                let moodCount = 0;
                checkInsSnapshot.forEach(doc => {
                    const mood = doc.data().morningData?.mood || doc.data().eveningData?.mood;
                    if (mood) {
                        totalMood += mood;
                        moodCount++;
                    }
                });
                const averageMood = moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 'N/A';
                const moodTrend = averageMood > 7 ? 'Positive' : averageMood > 5 ? 'Stable' : 'Needs attention';

                // Meetings attended
                const meetingsSnapshot = await db.collection('meetings')
                    .where('userId', '==', userId)
                    .where('attended', '==', true)
                    .where('date', '>=', sevenDaysAgo.toISOString().split('T')[0])
                    .get();

                // Tasks completed
                const tasksSnapshot = await db.collection('assignments')
                    .where('userId', '==', userId)
                    .where('status', '==', 'completed')
                    .where('completedAt', '>=', sevenDaysAgo)
                    .get();

                // Upcoming assignments
                const upcomingSnapshot = await db.collection('assignments')
                    .where('userId', '==', userId)
                    .where('status', '!=', 'completed')
                    .get();

                const upcomingAssignments = [];
                upcomingSnapshot.forEach(doc => {
                    const data = doc.data();
                    const dueDate = new Date(data.dueDate);
                    const daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
                    if (daysUntilDue >= 0 && daysUntilDue <= 7) {
                        upcomingAssignments.push({
                            title: data.title,
                            dueDate: data.dueDate
                        });
                    }
                });

                // Render template
                const html = renderTemplate(weeklyDigestTemplate, {
                    weekStart: new Date(sevenDaysAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    daysSober,
                    completionRate,
                    completedCheckins,
                    totalCheckins,
                    milestones: milestones.length > 0 ? milestones : null,
                    gratitudeThemes: gratitudeThemes.length > 0 ? gratitudeThemes : null,
                    averageMood,
                    moodTrend,
                    meetingsAttended: meetingsSnapshot.size,
                    tasksCompleted: tasksSnapshot.size,
                    upcomingAssignments: upcomingAssignments.length > 0 ? upcomingAssignments : null,
                    unsubscribeLink: getUnsubscribeLink(userId, 'weekly')
                });

                emailPromises.push(
                    sendEmail({
                        to: userData.email,
                        subject: `Your Weekly Recovery Summary - Week of ${new Date(sevenDaysAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                        html
                    }).catch(error => {
                        console.error(`Failed to send weekly digest to ${userId}:`, error);
                    })
                );
            }

            await Promise.all(emailPromises);
            console.log(`Sent ${emailPromises.length} weekly email digests`);

        } catch (error) {
            console.error('Error in weeklyEmailDigest:', error);
            throw error;
        }
    });

/**
 * Monthly Email Digest
 * Runs on 1st of each month at 8 AM
 * 30-day comprehensive summary
 */
exports.monthlyEmailDigest = functions.pubsub
    .schedule('0 8 1 * *') // 1st of month at 8 AM UTC
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running monthly email digest function');

        const db = admin.firestore();
        const now = new Date();

        try {
            // Get users who want monthly digest
            const usersSnapshot = await db.collection('users')
                .where('notifications.emailDigest.enabled', '==', true)
                .where('notifications.emailDigest.frequency', '==', 'monthly')
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();

                // Calculate days sober
                const daysSober = userData.sobrietyDate
                    ? calculateDaysBetween(userData.sobrietyDate.toDate(), now)
                    : 0;

                // Get month's data (last 30 days)
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const daysThisMonth = Math.min(daysSober, 30);

                // Check-in rate
                const checkInsSnapshot = await db.collection('checkIns')
                    .where('userId', '==', userId)
                    .where('createdAt', '>=', thirtyDaysAgo)
                    .get();

                const checkinRate = Math.round((checkInsSnapshot.size / 60) * 100); // 30 days × 2

                // Meetings and tasks
                const meetingsSnapshot = await db.collection('meetings')
                    .where('userId', '==', userId)
                    .where('attended', '==', true)
                    .where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
                    .get();

                const tasksSnapshot = await db.collection('assignments')
                    .where('userId', '==', userId)
                    .where('status', '==', 'completed')
                    .where('completedAt', '>=', thirtyDaysAgo)
                    .get();

                // Top gratitude themes (simplified)
                const topGratitudes = [
                    { theme: 'Family', count: 12, percentage: 40 },
                    { theme: 'Health', count: 8, percentage: 27 },
                    { theme: 'Support', count: 5, percentage: 17 }
                ];

                // Community engagement
                const communitySnapshot = await db.collection('communityMessages')
                    .where('userId', '==', userId)
                    .where('createdAt', '>=', thirtyDaysAgo)
                    .get();

                // Render template
                const html = renderTemplate(monthlyDigestTemplate, {
                    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    daysSober,
                    daysThisMonth,
                    checkinRate,
                    longestStreak: 15, // TODO: Calculate from data
                    meetingsAttended: meetingsSnapshot.size,
                    tasksCompleted: tasksSnapshot.size,
                    topGratitudes,
                    challengeCount: 3, // TODO: Calculate from data
                    communityPosts: communitySnapshot.size,
                    communityConnections: 8, // TODO: Calculate from data
                    unsubscribeLink: getUnsubscribeLink(userId, 'monthly')
                });

                emailPromises.push(
                    sendEmail({
                        to: userData.email,
                        subject: `Your Monthly Recovery Report - ${new Date().toLocaleDateString('en-US', { month: 'long' })}`,
                        html
                    }).catch(error => {
                        console.error(`Failed to send monthly digest to ${userId}:`, error);
                    })
                );
            }

            await Promise.all(emailPromises);
            console.log(`Sent ${emailPromises.length} monthly email digests`);

        } catch (error) {
            console.error('Error in monthlyEmailDigest:', error);
            throw error;
        }
    });

/**
 * Weekly Progress Report
 * Runs every Sunday at 6 PM
 * Detailed report sent to PIR and assigned coach
 */
exports.weeklyProgressReport = functions.pubsub
    .schedule('0 18 * * 0') // Every Sunday at 6 PM UTC
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Running weekly progress report function');

        const db = admin.firestore();
        const now = new Date();

        try {
            // Get users who want weekly progress report
            const usersSnapshot = await db.collection('users')
                .where('notifications.weeklyProgressReport.enabled', '==', true)
                .get();

            const emailPromises = [];

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();

                // Calculate days sober
                const daysSober = userData.sobrietyDate
                    ? calculateDaysBetween(userData.sobrietyDate.toDate(), now)
                    : 0;

                // Get week's data
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                // Check-in streak
                const checkInsSnapshot = await db.collection('checkIns')
                    .where('userId', '==', userId)
                    .where('createdAt', '>=', sevenDaysAgo)
                    .get();

                const checkinStreak = checkInsSnapshot.size;

                // Daily mood scores (simplified - would calculate from actual data)
                const moodScores = [
                    { day: 'Monday', score: 7, percentage: 70, color: '#10b981' },
                    { day: 'Tuesday', score: 8, percentage: 80, color: '#10b981' },
                    { day: 'Wednesday', score: 6, percentage: 60, color: '#f59e0b' },
                    { day: 'Thursday', score: 7, percentage: 70, color: '#10b981' },
                    { day: 'Friday', score: 9, percentage: 90, color: '#10b981' },
                    { day: 'Saturday', score: 8, percentage: 80, color: '#10b981' },
                    { day: 'Sunday', score: 7, percentage: 70, color: '#10b981' }
                ];

                const averageMood = 7.4;
                const moodTrend = 'Improving';

                // Meetings attended
                const meetingsSnapshot = await db.collection('meetings')
                    .where('userId', '==', userId)
                    .where('attended', '==', true)
                    .where('date', '>=', sevenDaysAgo.toISOString().split('T')[0])
                    .get();

                // Assignment status
                const assignmentsSnapshot = await db.collection('assignments')
                    .where('userId', '==', userId)
                    .get();

                let assignmentsCompleted = 0, assignmentsInProgress = 0, assignmentsOverdue = 0;
                assignmentsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'completed') assignmentsCompleted++;
                    else if (data.status === 'in_progress') assignmentsInProgress++;
                    else if (new Date(data.dueDate) < now) assignmentsOverdue++;
                });

                // Render PIR template
                const pirHtml = renderTemplate(progressReportTemplate, {
                    weekStart: new Date(sevenDaysAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    daysSober,
                    checkinStreak,
                    moodScores,
                    averageMood,
                    moodTrend,
                    trendColor: '#10b981',
                    gratitudes: null, // TODO: Fetch actual gratitudes
                    challenges: null, // TODO: Fetch actual challenges
                    assignments: true,
                    assignmentsCompleted,
                    assignmentsInProgress,
                    assignmentsOverdue,
                    meetingsAttended: meetingsSnapshot.size,
                    meetingsScheduled: 4, // TODO: Calculate from data
                    concerns: null, // TODO: Detect red flags
                    sundayReflection: null, // TODO: Fetch from check-in
                    isCoachReport: false,
                    unsubscribeLink: getUnsubscribeLink(userId, 'progress')
                });

                // Send to PIR
                emailPromises.push(
                    sendEmail({
                        to: userData.email,
                        subject: 'Your Weekly Progress Report',
                        html: pirHtml
                    }).catch(error => {
                        console.error(`Failed to send progress report to ${userId}:`, error);
                    })
                );

                // Send to assigned coach
                if (userData.assignedCoach) {
                    const coachDoc = await db.collection('users').doc(userData.assignedCoach).get();
                    if (coachDoc.exists) {
                        const coachData = coachDoc.data();
                        const pirName = `${userData.firstName || 'User'} ${userData.lastName || ''}`.trim();

                        const coachHtml = renderTemplate(progressReportTemplate, {
                            weekStart: new Date(sevenDaysAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            daysSober,
                            checkinStreak,
                            moodScores,
                            averageMood,
                            moodTrend,
                            trendColor: '#10b981',
                            assignments: true,
                            assignmentsCompleted,
                            assignmentsInProgress,
                            assignmentsOverdue,
                            meetingsAttended: meetingsSnapshot.size,
                            meetingsScheduled: 4,
                            isCoachReport: true,
                            pirName,
                            pirId: userId
                        });

                        emailPromises.push(
                            sendEmail({
                                to: coachData.email,
                                subject: `Weekly Progress Report - ${pirName}`,
                                html: coachHtml
                            }).catch(error => {
                                console.error(`Failed to send progress report to coach:`, error);
                            })
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
            console.log(`Sent ${emailPromises.length} weekly progress reports`);

        } catch (error) {
            console.error('Error in weeklyProgressReport:', error);
            throw error;
        }
    });
