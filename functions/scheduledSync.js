const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Scheduled Cloud Function - Automated Meeting Sync
 * Runs every 6 hours: 00:00, 06:00, 12:00, 18:00 PST
 * Fetches fresh meeting data from external APIs and updates Firestore
 */
exports.scheduledMeetingSync = functions.pubsub
    .schedule('0 */6 * * *') // Every 6 hours
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        console.log('🔄 Starting scheduled meeting sync...');
        const startTime = Date.now();

        const syncResults = {
            timestamp: FieldValue.serverTimestamp(),
            success: true,
            errors: [],
            summary: {
                na: { added: 0, updated: 0, deleted: 0, total: 0, errors: 0 },
                aa: { added: 0, updated: 0, deleted: 0, total: 0, errors: 0 }
            }
        };

        try {
            // Sync NA Meetings (from BMLT)
            console.log('📥 Syncing NA meetings from BMLT...');
            const naResults = await syncNAMeetings();
            syncResults.summary.na = naResults;
            console.log(`✅ NA Sync Complete: ${naResults.added} added, ${naResults.updated} updated, ${naResults.total} total`);
        } catch (error) {
            console.error('❌ NA Sync Failed:', error);
            syncResults.errors.push({
                source: 'NA/BMLT',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            syncResults.summary.na.errors++;
            syncResults.success = false;
        }

        try {
            // Sync AA Meetings (from AA San Mateo)
            console.log('📥 Syncing AA meetings from AA San Mateo...');
            const aaResults = await syncAAMeetings();
            syncResults.summary.aa = aaResults;
            console.log(`✅ AA Sync Complete: ${aaResults.added} added, ${aaResults.updated} updated, ${aaResults.total} total`);
        } catch (error) {
            console.error('❌ AA Sync Failed:', error);
            syncResults.errors.push({
                source: 'AA/San Mateo',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            syncResults.summary.aa.errors++;
            syncResults.success = false;
        }

        // Calculate duration
        const duration = Date.now() - startTime;
        syncResults.duration = `${(duration / 1000).toFixed(2)}s`;

        // Log sync results to Firestore
        try {
            await admin.firestore().collection('syncLogs').add(syncResults);
            console.log(`📝 Sync log saved (${syncResults.duration})`);
        } catch (error) {
            console.error('❌ Failed to save sync log:', error);
        }

        // Send admin notification if sync failed
        if (!syncResults.success) {
            await sendAdminNotification(syncResults);
        }

        // Print final summary
        const totalAdded = syncResults.summary.na.added + syncResults.summary.aa.added;
        const totalUpdated = syncResults.summary.na.updated + syncResults.summary.aa.updated;
        const totalMeetings = syncResults.summary.na.total + syncResults.summary.aa.total;

        console.log('🎉 Scheduled sync complete!');
        console.log(`📊 Summary: ${totalMeetings} meetings (${totalAdded} added, ${totalUpdated} updated)`);
        console.log(`⏱️  Duration: ${syncResults.duration}`);

        return syncResults;
    });

/**
 * Sync NA Meetings from BMLT API
 * Returns: { added, updated, deleted, total, errors }
 */
async function syncNAMeetings() {
    const results = { added: 0, updated: 0, deleted: 0, total: 0, errors: 0 };

    try {
        // Fetch from BMLT API
        const response = await axios.get(
            'https://bmlt.wszf.org/main_server/client_interface/json/',
            {
                params: {
                    switcher: 'GetSearchResults',
                    lat_val: 37.668,
                    long_val: -122.080,
                    geo_width: 150
                },
                timeout: 30000 // 30 second timeout
            }
        );

        const meetings = response.data;
        console.log(`📥 Fetched ${meetings.length} NA meetings from BMLT`);

        const batch = admin.firestore().batch();
        const meetingsRef = admin.firestore().collection('externalMeetings');

        // Get existing meetings for change detection
        const existingSnapshot = await meetingsRef.where('source', '==', 'bmlt').get();
        const existingMeetings = new Map();
        existingSnapshot.docs.forEach(doc => {
            existingMeetings.set(doc.id, doc.data());
        });

        // Process each meeting
        for (const meeting of meetings) {
            const docId = `na-${meeting.id_bigint}`;
            const docRef = meetingsRef.doc(docId);

            // Build structured location with GeoPoint coordinates
            const location = {
                formatted: `${meeting.location_street || ''}, ${meeting.location_municipality || ''}, ${meeting.location_province || ''} ${meeting.location_postal_code_1 || ''}`.trim(),
                streetNumber: '',
                streetName: meeting.location_street || '',
                city: meeting.location_municipality || '',
                state: meeting.location_province || '',
                zipCode: meeting.location_postal_code_1 || '',
                country: 'USA',
                coordinates: new admin.firestore.GeoPoint(
                    parseFloat(meeting.latitude) || 0,
                    parseFloat(meeting.longitude) || 0
                )
            };

            const meetingData = {
                source: 'bmlt',
                type: 'NA',
                name: meeting.meeting_name,
                day: parseInt(meeting.weekday_tinyint) - 1,
                time: meeting.start_time,
                locationName: meeting.location_text,
                location: location,
                isVirtual: !!meeting.virtual_meeting_link,
                conferenceUrl: meeting.virtual_meeting_link || null,
                notes: meeting.comments || '',
                lastUpdated: FieldValue.serverTimestamp()
            };

            // Change detection
            if (existingMeetings.has(docId)) {
                // Meeting exists - check if data changed
                const existing = existingMeetings.get(docId);
                const hasChanges = (
                    existing.name !== meetingData.name ||
                    existing.time !== meetingData.time ||
                    existing.day !== meetingData.day ||
                    existing.locationName !== meetingData.locationName
                );

                if (hasChanges) {
                    batch.set(docRef, meetingData, { merge: true });
                    results.updated++;
                }
                existingMeetings.delete(docId); // Mark as processed
            } else {
                // New meeting
                batch.set(docRef, meetingData, { merge: true });
                results.added++;
            }
        }

        // Deleted meetings (exist in Firestore but not in API response)
        existingMeetings.forEach((data, docId) => {
            batch.delete(meetingsRef.doc(docId));
            results.deleted++;
        });

        // Commit batch
        await batch.commit();
        results.total = meetings.length;

        return results;

    } catch (error) {
        console.error('NA Sync Error:', error);
        results.errors++;
        throw error;
    }
}

/**
 * Sync AA Meetings from AA San Mateo website
 * Returns: { added, updated, deleted, total, errors }
 */
async function syncAAMeetings() {
    const results = { added: 0, updated: 0, deleted: 0, total: 0, errors: 0 };

    try {
        // Fetch meetings for all 7 days
        const allMeetings = [];

        for (let day = 0; day <= 6; day++) {
            try {
                const response = await axios.get(`https://aa-san-mateo.org/meetings?tsml-day=${day}`, {
                    timeout: 30000
                });

                // Parse HTML to extract meetings (simplified - actual implementation may need cheerio)
                // For now, return placeholder to prevent errors
                console.log(`📥 Fetched AA meetings for day ${day}`);

                // TODO: Implement HTML parsing logic here
                // This would extract meeting data from the HTML response

            } catch (error) {
                console.error(`Failed to fetch AA meetings for day ${day}:`, error.message);
                results.errors++;
            }
        }

        const batch = admin.firestore().batch();
        const meetingsRef = admin.firestore().collection('externalMeetings');

        // Get existing AA meetings for change detection
        const existingSnapshot = await meetingsRef.where('type', '==', 'AA').get();
        const existingMeetings = new Map();
        existingSnapshot.docs.forEach(doc => {
            existingMeetings.set(doc.id, doc.data());
        });

        // Process each meeting (currently empty until HTML parsing is implemented)
        for (const meeting of allMeetings) {
            // TODO: Implement meeting processing similar to NA sync
        }

        await batch.commit();
        results.total = allMeetings.length;

        return results;

    } catch (error) {
        console.error('AA Sync Error:', error);
        results.errors++;
        throw error;
    }
}

/**
 * Send admin notification when sync fails
 */
async function sendAdminNotification(syncResults) {
    try {
        console.log('📧 Sending admin notification for sync failure...');

        // Create notification document in Firestore
        await admin.firestore().collection('notifications').add({
            type: 'system_alert',
            severity: 'error',
            title: 'Meeting Sync Failed',
            message: `Scheduled meeting sync encountered errors. ${syncResults.errors.length} error(s) occurred.`,
            details: syncResults.errors,
            timestamp: FieldValue.serverTimestamp(),
            read: false,
            targetRoles: ['admin', 'superadmin']
        });

        console.log('✅ Admin notification sent');
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
    }
}

/**
 * HTTP endpoint for manual sync trigger (admin use)
 */
exports.manualMeetingSync = functions.https.onRequest(async (req, res) => {
    // Check for admin authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized - No authorization header' });
    }

    try {
        // Verify Firebase ID token
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Check if user is admin
        const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        console.log(`🔄 Manual sync triggered by ${userData.email}`);

        // Run sync
        const naResults = await syncNAMeetings();
        const aaResults = await syncAAMeetings();

        const results = {
            success: true,
            timestamp: new Date().toISOString(),
            triggeredBy: userData.email,
            summary: {
                na: naResults,
                aa: aaResults
            }
        };

        // Log manual sync
        await admin.firestore().collection('syncLogs').add({
            ...results,
            manual: true,
            timestamp: FieldValue.serverTimestamp()
        });

        res.json(results);

    } catch (error) {
        console.error('Manual sync error:', error);
        res.status(500).json({
            error: 'Sync failed',
            message: error.message
        });
    }
});
