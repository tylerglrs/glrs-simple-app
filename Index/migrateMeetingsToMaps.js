// migrateMeetingsToMaps.js
// Converts existing meetings from JSON strings to map objects
// Run with: node Index/migrateMeetingsToMaps.js

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

async function migrateMeetings() {
    console.log('🚀 Starting migration: JSON strings → Map objects');
    console.log('📅 Started at:', new Date().toLocaleString());

    try {
        // Step 1: Get all meetings that need migration
        const meetingsRef = db.collection('meetings');
        const snapshot = await meetingsRef
            .where('recurringSource', '==', 'external')
            .get();

        console.log(`\n📊 Found ${snapshot.size} external meetings to check`);

        if (snapshot.size === 0) {
            console.log('✅ No meetings to migrate');
            return { success: 0, errors: 0, skipped: 0 };
        }

        // Step 2: Process in batches (Firestore limit: 500 operations per batch)
        const batchSize = 500;
        let batch = db.batch();
        let processedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        let batchOperations = 0;

        for (const docSnapshot of snapshot.docs) {
            const meetingId = docSnapshot.id;
            const data = docSnapshot.data();

            try {
                // Check if already migrated
                if (data._migrated) {
                    console.log(`  ⏭️  Skipping ${meetingId} (already migrated)`);
                    skippedCount++;
                    continue;
                }

                let needsUpdate = false;
                const updateData = {};

                // Parse location if it's a JSON string
                if (typeof data.location === 'string' && data.location.startsWith('{')) {
                    try {
                        const location = JSON.parse(data.location);
                        updateData.location = location;
                        updateData.locationName = location.name || data.locationName || '';
                        updateData.coordinates = location.coordinates || null;
                        updateData._originalLocation = data.location; // Backup
                        needsUpdate = true;
                        console.log(`  ✓ Parsed location for meeting ${meetingId}`);
                    } catch (e) {
                        console.warn(`  ⚠️  Failed to parse location for ${meetingId}: ${e.message}`);
                    }
                } else if (typeof data.location === 'object' && data.location !== null) {
                    // Already an object, preserve it
                    updateData.locationName = data.location.name || data.locationName || '';
                    updateData.coordinates = data.location.coordinates || data.coordinates || null;
                }

                // Parse address if it's a JSON string
                if (typeof data.address === 'string' && data.address.startsWith('{')) {
                    try {
                        const address = JSON.parse(data.address);
                        updateData.address = address;
                        updateData._originalAddress = data.address; // Backup
                        needsUpdate = true;
                        console.log(`  ✓ Parsed address for meeting ${meetingId}`);
                    } catch (e) {
                        console.warn(`  ⚠️  Failed to parse address for ${meetingId}: ${e.message}`);
                    }
                }

                // Extract city/state/zip if not already present
                const location = updateData.location || (typeof data.location === 'object' ? data.location : null);
                const address = updateData.address || (typeof data.address === 'object' ? data.address : null);

                if (location || address) {
                    updateData.city = location?.city || address?.city || data.city || '';
                    updateData.state = location?.state || address?.state || data.state || '';
                    updateData.zip = location?.zipCode || address?.zip || data.zip || '';
                    updateData.formatted = location?.formatted || address?.formatted || '';
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    // Add migration metadata
                    updateData._migrated = true;
                    updateData._migratedAt = admin.firestore.FieldValue.serverTimestamp();

                    // Add to batch
                    batch.update(docSnapshot.ref, updateData);
                    batchOperations++;
                    processedCount++;

                    console.log(`  ✅ Queued update for ${meetingId} (${processedCount}/${snapshot.size})`);

                    // Commit batch if limit reached
                    if (batchOperations >= batchSize) {
                        console.log(`\n  💾 Committing batch (${batchOperations} operations)...`);
                        await batch.commit();
                        console.log(`  ✓ Batch committed successfully\n`);
                        batch = db.batch(); // Start new batch
                        batchOperations = 0;
                    }
                } else {
                    console.log(`  ⏭️  Skipping ${meetingId} (no updates needed)`);
                    skippedCount++;
                }

            } catch (error) {
                console.error(`  ❌ Error processing meeting ${meetingId}:`, error);
                errorCount++;
            }
        }

        // Commit final batch
        if (batchOperations > 0) {
            console.log(`\n  💾 Committing final batch (${batchOperations} operations)...`);
            await batch.commit();
            console.log(`  ✓ Final batch committed successfully\n`);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration Complete!');
        console.log('='.repeat(60));
        console.log(`📊 Total meetings checked: ${snapshot.size}`);
        console.log(`✓ Successfully migrated: ${processedCount}`);
        console.log(`⏭️  Skipped (already migrated): ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📅 Completed at: ${new Date().toLocaleString()}`);
        console.log('='.repeat(60) + '\n');

        return { success: processedCount, errors: errorCount, skipped: skippedCount };

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
console.log('\n' + '='.repeat(60));
console.log('🔄 GLRS Meetings Migration Script');
console.log('='.repeat(60) + '\n');

migrateMeetings()
    .then((results) => {
        console.log('🎉 Migration script completed successfully\n');
        if (results.errors > 0) {
            console.warn(`⚠️  Warning: ${results.errors} error(s) occurred during migration`);
            process.exit(1);
        } else {
            process.exit(0);
        }
    })
    .catch((error) => {
        console.error('\n💥 Migration script failed:', error);
        process.exit(1);
    });
