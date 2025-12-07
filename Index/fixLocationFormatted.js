// fixLocationFormatted.js
// Fix location.formatted to use address.street instead of Mapbox's generic place_name

import admin from 'firebase-admin';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function fixLocationFormatted() {
    console.log('========================================');
    console.log('FIX LOCATION.FORMATTED FIELD');
    console.log('Replace Mapbox place_name with actual street address');
    console.log('========================================\n');

    try {
        // Fetch all external meetings with coordinates (migrated meetings)
        console.log('📥 Fetching migrated meetings from Firestore...');
        const snapshot = await db.collection('externalMeetings')
            .where('_migrated', '==', true)
            .get();

        console.log(`✓ Found ${snapshot.size} migrated meetings\n`);

        let batch = db.batch();
        let batchCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Skip if location.formatted already has the street address
            if (data.location?.formatted &&
                data.address?.street &&
                data.location.formatted.includes(data.address.street.split(',')[0])) {
                skippedCount++;
                continue;
            }

            // Build new formatted string from address.street
            const newFormatted = data.address?.street || data.location?.formatted || '';

            if (!newFormatted || newFormatted === data.location?.formatted) {
                skippedCount++;
                continue;
            }

            // Update location.formatted
            const updatedLocation = {
                ...data.location,
                formatted: newFormatted
            };

            batch.update(doc.ref, {
                location: updatedLocation,
                _formattedFixed: true,
                _formattedFixedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            batchCount++;
            updatedCount++;

            console.log(`✓ ${data.name || 'Unnamed'}`);
            console.log(`  OLD: ${data.location?.formatted || 'N/A'}`);
            console.log(`  NEW: ${newFormatted}\n`);

            // Commit batch every 500 operations
            if (batchCount >= 500) {
                console.log(`💾 Committing batch (${updatedCount} updated so far)...\n`);
                await batch.commit();
                batch = db.batch();
                batchCount = 0;
            }
        }

        // Commit final batch
        if (batchCount > 0) {
            console.log(`💾 Committing final batch...\n`);
            await batch.commit();
        }

        console.log('========================================');
        console.log('✅ FIX COMPLETE');
        console.log('========================================');
        console.log(`✓ Meetings updated: ${updatedCount}`);
        console.log(`⏭️  Skipped (already correct): ${skippedCount}`);
        console.log(`📊 Total processed: ${snapshot.size}`);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixLocationFormatted();
