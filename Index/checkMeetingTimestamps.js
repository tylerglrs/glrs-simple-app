// checkMeetingTimestamps.js
// Check when Oakland meetings were last updated

import admin from 'firebase-admin';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function checkMeetingTimestamps() {
    console.log('🔍 Checking meeting timestamps...\n');

    try {
        const meetingNames = [
            'Formal Friday',
            'Weekenders',
            'Fathers in Recovery - East Bay'
        ];

        for (const name of meetingNames) {
            const snapshot = await db.collection('externalMeetings')
                .where('name', '==', name)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();

                console.log(`📋 ${name}`);
                console.log(`   Document ID: ${doc.id}`);
                console.log(`   lastUpdated: ${data.lastUpdated ? data.lastUpdated.toDate().toISOString() : 'N/A'}`);
                console.log(`   _migratedAt: ${data._migratedAt ? data._migratedAt.toDate().toISOString() : 'N/A'}`);
                console.log('');
            }
        }

        // Also check a Hayward meeting for comparison
        console.log('🔍 Checking Hayward meeting for comparison...\n');
        const haywardSnapshot = await db.collection('externalMeetings')
            .where('source', '==', 'East Bay AA')
            .where('city', '==', 'Hayward')
            .limit(1)
            .get();

        if (!haywardSnapshot.empty) {
            const doc = haywardSnapshot.docs[0];
            const data = doc.data();

            console.log(`📋 ${data.name || 'Unnamed'} (Hayward)`);
            console.log(`   Document ID: ${doc.id}`);
            console.log(`   lastUpdated: ${data.lastUpdated ? data.lastUpdated.toDate().toISOString() : 'N/A'}`);
            console.log(`   address.street: ${data.address?.street || 'N/A'}`);
            console.log(`   location.formatted: ${data.location?.formatted || 'N/A'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkMeetingTimestamps();
