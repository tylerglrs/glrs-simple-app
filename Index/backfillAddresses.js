// backfillAddresses.js
// Add address field to all externalMeetings that are missing it

import admin from 'firebase-admin';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function backfillAddresses() {
    console.log('🔄 Backfilling address field for externalMeetings...\n');

    try {
        const snapshot = await db.collection('externalMeetings').get();

        console.log(`Total meetings: ${snapshot.size}\n`);

        let batch = db.batch();
        let batchCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Skip if already has address field
            if (data.address && typeof data.address === 'object' && data.address.street) {
                skippedCount++;
                continue;
            }

            // Extract address from location data
            let street = '';
            let city = '';
            let state = 'CA';
            let zip = '';

            if (data.location && typeof data.location === 'object') {
                // Get from location object
                const loc = data.location;
                street = loc.streetNumber && loc.streetName
                    ? `${loc.streetNumber} ${loc.streetName}`.trim()
                    : loc.streetName || loc.formatted || '';
                city = loc.city || '';
                state = loc.state || 'CA';
                zip = loc.zipCode || '';
            }

            // Fallback to top-level fields
            if (!city && data.city) city = data.city;
            if (!state && data.state) state = data.state;

            // Build address object
            const address = {
                street: street ? `${street}, ${city}, ${state} ${zip}`.trim() : `${city}, ${state}`.trim(),
                city: city,
                state: state,
                zip: zip
            };

            // Add to batch
            batch.update(doc.ref, { address });
            batchCount++;
            updatedCount++;

            // Commit batch every 500 operations
            if (batchCount >= 500) {
                console.log(`💾 Committing batch (${updatedCount} updated so far)...`);
                await batch.commit();
                batch = db.batch();
                batchCount = 0;
            }
        }

        // Commit final batch
        if (batchCount > 0) {
            console.log(`💾 Committing final batch...`);
            await batch.commit();
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Backfill Complete!');
        console.log('='.repeat(60));
        console.log(`✓ Meetings updated: ${updatedCount}`);
        console.log(`⏭️  Skipped (already had address): ${skippedCount}`);
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

backfillAddresses();
