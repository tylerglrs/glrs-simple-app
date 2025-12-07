/**
 * Google Calendar Integration Cloud Functions
 *
 * Functions:
 * 1. exchangeGoogleCalendarToken - Exchange OAuth code for access/refresh tokens
 * 2. syncMeetingToCalendar - Sync GLRS meetings to user's Google Calendar
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Get Firestore instance (admin.initializeApp() is called in index.js)
const getDb = () => admin.firestore();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = functions.config().google?.oauth_client_id || '';
const GOOGLE_CLIENT_SECRET = functions.config().google?.oauth_client_secret || '';

/**
 * Helper: Format location for Google Calendar
 * Handles structured location objects and plain text addresses
 */
function formatMeetingLocation(meeting) {
    // Check for new structured location format
    if (meeting.location && typeof meeting.location === 'object' && meeting.location.coordinates) {
        const loc = meeting.location;

        // Build formatted address
        if (loc.formatted) {
            return loc.formatted;
        }

        const parts = [];
        if (loc.streetNumber && loc.streetName) {
            parts.push(`${loc.streetNumber} ${loc.streetName}`);
        }
        if (loc.city || loc.state || loc.zipCode) {
            const cityState = [loc.city, loc.state, loc.zipCode].filter(Boolean).join(', ');
            if (cityState) parts.push(cityState);
        }

        return parts.join(', ') || 'Location TBD';
    }

    // Handle old format: plain text address
    if (meeting.address) {
        if (typeof meeting.address === 'object' && meeting.address.street) {
            const parts = [meeting.address.street];
            const cityState = [meeting.address.city, meeting.address.state, meeting.address.zip].filter(Boolean).join(', ');
            if (cityState) parts.push(cityState);
            return parts.join(', ');
        } else if (typeof meeting.address === 'string') {
            try {
                const parsed = JSON.parse(meeting.address);
                if (parsed.street) {
                    const parts = [parsed.street];
                    const cityState = [parsed.city, parsed.state, parsed.zip].filter(Boolean).join(', ');
                    if (cityState) parts.push(cityState);
                    return parts.join(', ');
                }
            } catch (e) {
                // Not JSON, just use as-is
                return meeting.address;
            }
        }
    }

    // Fallback: build from city, state, zip
    if (meeting.city || meeting.state || meeting.zip) {
        return [meeting.city, meeting.state, meeting.zip].filter(Boolean).join(', ');
    }

    // Last resort
    if (typeof meeting.location === 'string') {
        return meeting.location;
    }

    return 'Virtual Meeting';
}

/**
 * Helper: Build rich description for calendar event
 * Includes all meeting details in a professional format
 */
function buildMeetingDescription(meeting, type) {
    const lines = [];

    // Meeting Type Header
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`${type} RECOVERY MEETING`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Meeting Name
    const meetingName = meeting.meetingTitle || meeting.name || 'Recovery Meeting';
    lines.push(`📍 ${meetingName}\n`);

    // Meeting Type Details (for AA/NA meetings)
    if (meeting.meetingType) {
        lines.push(`Type: ${meeting.meetingType}`);
    }

    // Location Name
    if (meeting.locationName) {
        lines.push(`Location: ${meeting.locationName}`);
    } else if (meeting.location && typeof meeting.location === 'object' && meeting.location.name) {
        lines.push(`Location: ${meeting.location.name}`);
    }

    // Full Address
    const fullAddress = formatMeetingLocation(meeting);
    if (fullAddress && fullAddress !== 'Virtual Meeting') {
        lines.push(`Address: ${fullAddress}`);
    }

    // Meeting Notes/Description
    if (meeting.notes) {
        lines.push(`\nℹ️ MEETING DETAILS:`);
        lines.push(meeting.notes);
    } else if (meeting.description) {
        lines.push(`\nℹ️ MEETING DETAILS:`);
        lines.push(meeting.description);
    }

    // Meeting Formats (for AA/NA)
    if (meeting.formats && Array.isArray(meeting.formats) && meeting.formats.length > 0) {
        lines.push(`\n🏷️ FORMATS:`);
        lines.push(meeting.formats.join(', '));
    }

    // Contact Info
    if (meeting.contactPhone || meeting.contactEmail) {
        lines.push(`\n📞 CONTACT:`);
        if (meeting.contactPhone) lines.push(`Phone: ${meeting.contactPhone}`);
        if (meeting.contactEmail) lines.push(`Email: ${meeting.contactEmail}`);
    }

    // Map Link (if we have coordinates)
    if (meeting.location && typeof meeting.location === 'object' && meeting.location.coordinates) {
        const lat = meeting.location.coordinates.latitude || meeting.location.coordinates._latitude;
        const lng = meeting.location.coordinates.longitude || meeting.location.coordinates._longitude;
        if (lat && lng) {
            lines.push(`\n🗺️ DIRECTIONS:`);
            lines.push(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
        }
    }

    // Footer
    lines.push(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Synced from GLRS Recovery Compass`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return lines.join('\n');
}

/**
 * Exchange OAuth authorization code for access/refresh tokens
 * Called from oauth-callback.html after user grants consent
 */
exports.exchangeGoogleCalendarToken = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { code, redirectUri } = data;
    const userId = context.auth.uid;
    const db = getDb();

    if (!code || !redirectUri) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }

    try {
        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            throw new Error('Failed to retrieve tokens');
        }

        // Set credentials to fetch user info
        oauth2Client.setCredentials(tokens);

        // Fetch the user's Gmail email address
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const googleEmail = userInfo.data.email;

        // Calculate token expiry timestamp
        const expiresAt = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + (tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600 * 1000))
        );

        // Save tokens to Firestore (encrypted in production - consider using Secret Manager)
        await db.collection('users').doc(userId).update({
            'googleCalendar.connected': true,
            'googleCalendar.connectedAt': admin.firestore.FieldValue.serverTimestamp(),
            'googleCalendar.email': googleEmail,
            'googleCalendar.accessToken': tokens.access_token,
            'googleCalendar.refreshToken': tokens.refresh_token,
            'googleCalendar.expiresAt': expiresAt,
            'googleCalendar.scope': tokens.scope || 'calendar.events'
        });

        console.log(`Calendar connected for user ${userId}`);

        return { success: true, message: 'Calendar connected successfully' };
    } catch (error) {
        console.error('Token exchange error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to exchange token: ' + error.message);
    }
});

/**
 * Sync GLRS meeting to Google Calendar
 * Triggered when a meeting document is created/updated/deleted in Firestore
 */
exports.syncMeetingToCalendar = functions.firestore
    .document('meetings/{meetingId}')
    .onWrite(async (change, context) => {
        const meetingId = context.params.meetingId;
        const db = getDb();

        // Meeting deleted - remove from calendar
        if (!change.after.exists) {
            const beforeData = change.before.data();
            if (beforeData?.calendarEventId && beforeData?.userId) {
                await deleteCalendarEvent(beforeData.userId, beforeData.calendarEventId);
            }
            return;
        }

        const meetingData = change.after.data();
        const { userId, title, scheduledTime, endTime, location, description, status, type } = meetingData;

        // Only sync active meetings
        if (status !== 'scheduled') {
            return;
        }

        if (!userId || !title || !scheduledTime) {
            console.warn('Missing required meeting fields:', meetingId);
            return;
        }

        try {
            // Get user's calendar connection
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();

            if (!userData?.googleCalendar?.connected || !userData?.googleCalendar?.refreshToken) {
                console.log(`User ${userId} does not have calendar connected`);
                return;
            }

            // Determine meeting type and check sync preferences
            const meetingType = type || 'GLRS';

            // Check if this meeting type should be synced
            if (meetingType === 'GLRS' && userData.syncMeetings === false) {
                console.log(`GLRS meetings sync disabled for user ${userId}`);
                return;
            }
            if (meetingType === 'AA' && userData.syncAAMeetings === false) {
                console.log(`AA meetings sync disabled for user ${userId}`);
                return;
            }
            if (meetingType === 'NA' && userData.syncNAMeetings === false) {
                console.log(`NA meetings sync disabled for user ${userId}`);
                return;
            }

            // Get OAuth2 client with refresh token
            const oauth2Client = await getOAuth2Client(userData.googleCalendar);
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            // Get user's timezone (from Step 1.1)
            const timezone = userData.timezone || 'America/Los_Angeles';

            // Convert Firestore timestamps to Date objects
            const start = scheduledTime.toDate();
            const end = endTime ? endTime.toDate() : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

            // Set color based on meeting type
            const colorId = meetingType === 'GLRS' ? '9' : meetingType === 'AA' ? '7' : '11'; // Blue for GLRS, Cyan for AA, Red for NA

            const event = {
                summary: `${meetingType}: ${title}`,
                description: description || `${meetingType} meeting`,
                location: location || 'Virtual',
                start: {
                    dateTime: start.toISOString(),
                    timeZone: timezone
                },
                end: {
                    dateTime: end.toISOString(),
                    timeZone: timezone
                },
                colorId: colorId, // Color based on meeting type (blue=GLRS, cyan=AA, red=NA)
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 30 },
                        { method: 'email', minutes: 60 }
                    ]
                }
            };

            let eventId = meetingData.calendarEventId;

            // Update existing event or create new one
            if (eventId) {
                // Update existing event
                await calendar.events.update({
                    calendarId: 'primary',
                    eventId: eventId,
                    requestBody: event
                });
                console.log(`Updated calendar event ${eventId} for meeting ${meetingId}`);
            } else {
                // Create new event
                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event
                });
                eventId = response.data.id;

                // Save event ID to Firestore
                await change.after.ref.update({ calendarEventId: eventId });
                console.log(`Created calendar event ${eventId} for meeting ${meetingId}`);
            }
        } catch (error) {
            console.error('Failed to sync meeting to calendar:', error);
        }
    });

/**
 * Delete a calendar event
 */
async function deleteCalendarEvent(userId, eventId) {
    const db = getDb();
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.googleCalendar?.connected || !userData?.googleCalendar?.refreshToken) {
            return;
        }

        const oauth2Client = await getOAuth2Client(userData.googleCalendar);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId
        });

        console.log(`Deleted calendar event ${eventId} for user ${userId}`);
    } catch (error) {
        console.error(`Failed to delete calendar event ${eventId}:`, error);
    }
}

/**
 * Sync Calendar Settings - Called when user saves settings
 * Triggers immediate sync of all enabled calendar items
 */
exports.syncCalendarSettings = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId || context.auth.uid;
    const db = getDb();

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.googleCalendar?.connected) {
            return { success: false, message: 'Calendar not connected' };
        }

        const oauth2Client = await getOAuth2Client(userData.googleCalendar);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const timezone = userData.timezone || 'America/Los_Angeles';

        let synced = 0;

        // Sync meetings if enabled
        if (userData.syncMeetings || userData.syncAAMeetings || userData.syncNAMeetings) {
            const meetingsSnap = await db.collection('meetings')
                .where('userId', '==', userId)
                .where('status', '==', 'scheduled')
                .get();

            for (const doc of meetingsSnap.docs) {
                const meeting = doc.data();
                const type = meeting.type || 'GLRS';

                // Check sync preferences
                if ((type === 'GLRS' && userData.syncMeetings === false) ||
                    (type === 'AA' && userData.syncAAMeetings === false) ||
                    (type === 'NA' && userData.syncNAMeetings === false)) {
                    continue;
                }

                try {
                    const start = meeting.scheduledTime?.toDate() || new Date();
                    const end = meeting.endTime?.toDate() || new Date(start.getTime() + 60 * 60 * 1000);
                    const colorId = type === 'GLRS' ? '9' : type === 'AA' ? '7' : '11';

                    // Build professional event with full details
                    const meetingName = meeting.meetingTitle || meeting.name || meeting.title || 'Recovery Meeting';

                    const event = {
                        summary: `${type}: ${meetingName}`,
                        description: buildMeetingDescription(meeting, type),
                        location: formatMeetingLocation(meeting),
                        start: { dateTime: start.toISOString(), timeZone: timezone },
                        end: { dateTime: end.toISOString(), timeZone: timezone },
                        colorId: colorId,
                        reminders: {
                            useDefault: false,
                            overrides: [
                                { method: 'popup', minutes: 30 },
                                { method: 'email', minutes: 60 }
                            ]
                        }
                    };

                    if (meeting.calendarEventId) {
                        await calendar.events.update({
                            calendarId: 'primary',
                            eventId: meeting.calendarEventId,
                            requestBody: event
                        });
                    } else {
                        const response = await calendar.events.insert({
                            calendarId: 'primary',
                            requestBody: event
                        });
                        await doc.ref.update({ calendarEventId: response.data.id });
                    }

                    synced++;
                } catch (error) {
                    console.error(`Failed to sync meeting ${doc.id}:`, error);
                }
            }
        }

        return { success: true, count: synced };
    } catch (error) {
        console.error('Sync calendar settings error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Manual Sync: All Meetings
 */
exports.manualSyncMeetings = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId || context.auth.uid;
    const db = getDb();

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.googleCalendar?.connected) {
            throw new functions.https.HttpsError('failed-precondition', 'Calendar not connected');
        }

        const oauth2Client = await getOAuth2Client(userData.googleCalendar);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const timezone = userData.timezone || 'America/Los_Angeles';

        const meetingsSnap = await db.collection('meetings')
            .where('userId', '==', userId)
            .where('status', '==', 'scheduled')
            .get();

        let synced = 0;

        for (const doc of meetingsSnap.docs) {
            const meeting = doc.data();
            const type = meeting.type || 'GLRS';

            // Check sync preferences
            if ((type === 'GLRS' && userData.syncMeetings === false) ||
                (type === 'AA' && userData.syncAAMeetings === false) ||
                (type === 'NA' && userData.syncNAMeetings === false)) {
                continue;
            }

            try {
                const start = meeting.scheduledTime?.toDate() || new Date();
                const end = meeting.endTime?.toDate() || new Date(start.getTime() + 60 * 60 * 1000);
                const colorId = type === 'GLRS' ? '9' : type === 'AA' ? '7' : '11';

                // Build professional event with full details
                const meetingName = meeting.meetingTitle || meeting.name || meeting.title || 'Recovery Meeting';

                const event = {
                    summary: `${type}: ${meetingName}`,
                    description: buildMeetingDescription(meeting, type),
                    location: formatMeetingLocation(meeting),
                    start: { dateTime: start.toISOString(), timeZone: timezone },
                    end: { dateTime: end.toISOString(), timeZone: timezone },
                    colorId: colorId,
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 30 },
                            { method: 'email', minutes: 60 }
                        ]
                    }
                };

                if (meeting.calendarEventId) {
                    await calendar.events.update({
                        calendarId: 'primary',
                        eventId: meeting.calendarEventId,
                        requestBody: event
                    });
                } else {
                    const response = await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: event
                    });
                    await doc.ref.update({ calendarEventId: response.data.id });
                }

                synced++;
            } catch (error) {
                console.error(`Failed to sync meeting ${doc.id}:`, error);
            }
        }

        return { success: true, count: synced };
    } catch (error) {
        console.error('Manual sync meetings error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Get OAuth2 client with automatic token refresh
 */
async function getOAuth2Client(calendarData) {
    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET
    );

    // Set credentials
    oauth2Client.setCredentials({
        access_token: calendarData.accessToken,
        refresh_token: calendarData.refreshToken,
        expiry_date: calendarData.expiresAt ? calendarData.expiresAt.toMillis() : null
    });

    // Automatically refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            console.log('New refresh token received');
        }
        if (tokens.access_token) {
            console.log('Access token refreshed');
        }
    });

    return oauth2Client;
}
