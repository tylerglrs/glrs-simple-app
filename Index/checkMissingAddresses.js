// checkMissingAddresses.js
// Find meetings without addresses in externalMeetings collection

import admin from 'firebase-admin';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function checkMissingAddresses() {
    console.log('🔍 Checking externalMeetings for missing addresses...\n');

    try {
        const snapshot = await db.collection('externalMeetings').get();

        console.log(`Total meetings: ${snapshot.size}\n`);

        let missingAddress = [];
        let missingLocation = [];
        let missingBoth = [];
        let hasData = [];

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const hasAddress = data.address && (typeof data.address === 'object' ? data.address.street : data.address);
            const hasLocation = data.location && (typeof data.location === 'object' ? (data.location.formatted || data.location.streetName) : data.location);

            if (!hasAddress && !hasLocation) {
                missingBoth.push({
                    id: doc.id,
                    name: data.name,
                    locationName: data.locationName,
                    city: data.city,
                    state: data.state
                });
            } else if (!hasAddress) {
                missingAddress.push({
                    id: doc.id,
                    name: data.name,
                    location: data.location
                });
            } else if (!hasLocation) {
                missingLocation.push({
                    id: doc.id,
                    name: data.name,
                    address: data.address
                });
            } else {
                hasData.push(doc.id);
            }
        });

        console.log('📊 STATISTICS:');
        console.log(`✅ Meetings with address data: ${hasData.length}`);
        console.log(`⚠️  Missing address only: ${missingAddress.length}`);
        console.log(`⚠️  Missing location only: ${missingLocation.length}`);
        console.log(`🔴 Missing BOTH address and location: ${missingBoth.length}`);
        console.log('');

        if (missingBoth.length > 0) {
            console.log('🔴 MEETINGS MISSING BOTH ADDRESS AND LOCATION:');
            console.log('='.repeat(80));
            missingBoth.slice(0, 10).forEach((m, i) => {
                console.log(`${i + 1}. ${m.name || 'Unnamed'}`);
                console.log(`   ID: ${m.id}`);
                console.log(`   Location Name: ${m.locationName || 'N/A'}`);
                console.log(`   City: ${m.city || 'N/A'}, State: ${m.state || 'N/A'}`);
                console.log('');
            });
            if (missingBoth.length > 10) {
                console.log(`... and ${missingBoth.length - 10} more\n`);
            }
        }

        if (missingAddress.length > 0) {
            console.log('\n⚠️  SAMPLE MEETINGS MISSING ADDRESS (have location):');
            console.log('='.repeat(80));
            missingAddress.slice(0, 5).forEach((m, i) => {
                console.log(`${i + 1}. ${m.name}`);
                console.log(`   Location: ${JSON.stringify(m.location)}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkMissingAddresses();
