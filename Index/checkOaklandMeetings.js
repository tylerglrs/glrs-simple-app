// checkOaklandMeetings.js
// Check what's actually stored in Firestore for Oakland meetings

import admin from 'firebase-admin';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function checkOaklandMeetings() {
    console.log('🔍 Checking Oakland meetings in Firestore...\n');

    try {
        const meetingNames = [
            'Formal Friday',
            'Weekenders',
            'Fathers in Recovery - East Bay'
        ];

        for (const name of meetingNames) {
            console.log('='.repeat(80));
            console.log(`📋 Meeting: "${name}"`);
            console.log('='.repeat(80));

            const snapshot = await db.collection('externalMeetings')
                .where('name', '==', name)
                .limit(1)
                .get();

            if (snapshot.empty) {
                console.log(`❌ Not found in externalMeetings collection\n`);
                continue;
            }

            const doc = snapshot.docs[0];
            const data = doc.data();

            console.log(`✅ Found! Document ID: ${doc.id}`);
            console.log('\n📊 ADDRESS DATA:');
            console.log('   address:', JSON.stringify(data.address, null, 2));
            console.log('\n📍 LOCATION DATA:');
            console.log('   location:', JSON.stringify(data.location, null, 2));
            console.log('   locationName:', data.locationName);
            console.log('\n🗺️  OTHER FIELDS:');
            console.log('   city:', data.city);
            console.log('   state:', data.state);
            console.log('   zip:', data.zip);
            console.log('   source:', data.source);
            console.log('');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkOaklandMeetings();
