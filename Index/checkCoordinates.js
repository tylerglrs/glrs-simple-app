// checkCoordinates.js
// Check if coordinates match the street address

import admin from 'firebase-admin';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function checkCoordinates() {
    console.log('🔍 Checking coordinates for Oakland meetings...\n');

    try {
        // Check specific Oakland meetings
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
                console.log(`   Address: ${data.address?.street || 'N/A'}`);
                console.log(`   Coordinates: ${data.location?.coordinates?._latitude}, ${data.location?.coordinates?._longitude}`);

                // Calculate Google Maps URL
                const lat = data.location?.coordinates?._latitude;
                const lng = data.location?.coordinates?._longitude;
                if (lat && lng) {
                    console.log(`   Maps URL: https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
                }
                console.log('');
            }
        }

        // Also check what the CORRECT coordinates should be for "3989 Howe St, Oakland, CA 94611"
        console.log('🔍 Expected coordinates for "3989 Howe St, Oakland, CA 94611, USA":');
        console.log('   Should be around: 37.8264, -122.2546 (Rockridge Fellowship)');
        console.log('   Current coordinates: 37.805306, -122.27058');
        console.log('   Difference suggests coordinates are WRONG (pointing to different location)\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkCoordinates();
