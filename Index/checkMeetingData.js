// checkMeetingData.js
// Verify actual meeting data structure after migration

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function checkMeetingData() {
    console.log('🔍 Fetching sample meeting data...\n');

    try {
        // Get a few sample meetings
        const snapshot = await db.collection('meetings')
            .where('recurringSource', '==', 'external')
            .limit(3)
            .get();

        console.log(`Found ${snapshot.size} meetings\n`);

        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n${'='.repeat(80)}`);
            console.log(`MEETING ${index + 1}: ${doc.id}`);
            console.log('='.repeat(80));

            console.log('\n📍 LOCATION FIELD:');
            console.log('Type:', typeof data.location);
            if (data.location) {
                console.log('Value:', JSON.stringify(data.location, null, 2));
            } else {
                console.log('Value: null');
            }

            console.log('\n📮 ADDRESS FIELD:');
            console.log('Type:', typeof data.address);
            if (data.address) {
                console.log('Value:', JSON.stringify(data.address, null, 2));
            } else {
                console.log('Value: null');
            }

            console.log('\n🗺️  COORDINATES FIELD (top-level):');
            console.log('Type:', typeof data.coordinates);
            if (data.coordinates) {
                console.log('Value:', data.coordinates);
                console.log('Latitude:', data.coordinates._latitude || data.coordinates.latitude);
                console.log('Longitude:', data.coordinates._longitude || data.coordinates.longitude);
            } else {
                console.log('Value: null');
            }

            console.log('\n📌 TOP-LEVEL FIELDS:');
            console.log('locationName:', data.locationName);
            console.log('city:', data.city);
            console.log('state:', data.state);
            console.log('zip:', data.zip);
            console.log('formatted:', data.formatted);

            console.log('\n✅ MIGRATION METADATA:');
            console.log('_migrated:', data._migrated);
            console.log('_migratedAt:', data._migratedAt?.toDate());
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkMeetingData();
