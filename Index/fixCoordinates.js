// fixCoordinates.js
// Fix coordinates by geocoding the correct street address

import admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp({
    projectId: "glrs-pir-system"
});

const db = admin.firestore();

// Mapbox API Configuration
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoidHlsZXJyb2JlcnRzIiwiYSI6ImNtaThlYWxmbjBiMm8yaW9naW1ycW8wdTkifQ.0GH21c9vl9gNFsrtgJqrMw';
const GEOCODE_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Rate limiting
const DELAY_BETWEEN_REQUESTS = 150; // 150ms = ~6-7 requests/second (well under 600/min limit)

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAddress(addressString) {
    const url = `${GEOCODE_BASE_URL}/${encodeURIComponent(addressString)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&country=US`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error('No geocoding results found');
        }

        const feature = data.features[0];
        const [lng, lat] = feature.center;

        return {
            latitude: lat,
            longitude: lng,
            formatted: feature.place_name
        };
    } catch (error) {
        console.error(`   ❌ Geocoding failed: ${error.message}`);
        return null;
    }
}

async function fixCoordinates() {
    console.log('========================================');
    console.log('FIX COORDINATES');
    console.log('Re-geocode using street addresses');
    console.log('========================================\n');

    try {
        // Fetch all migrated meetings
        console.log('📥 Fetching migrated meetings...');
        const snapshot = await db.collection('externalMeetings')
            .where('_formattedFixed', '==', true)
            .get();

        console.log(`✓ Found ${snapshot.size} meetings to fix\n`);

        let batch = db.batch();
        let batchCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Skip if no street address
            if (!data.address?.street) {
                skippedCount++;
                continue;
            }

            // Geocode the street address
            console.log(`🔍 ${data.name || 'Unnamed'}`);
            console.log(`   Address: ${data.address.street}`);

            const result = await geocodeAddress(data.address.street);

            if (!result) {
                console.log(`   ⏭️  Failed, skipping\n`);
                failedCount++;
                continue;
            }

            console.log(`   OLD: ${data.location?.coordinates?._latitude}, ${data.location?.coordinates?._longitude}`);
            console.log(`   NEW: ${result.latitude}, ${result.longitude}\n`);

            // Update location with new coordinates
            const updatedLocation = {
                ...data.location,
                coordinates: new admin.firestore.GeoPoint(result.latitude, result.longitude)
            };

            batch.update(doc.ref, {
                location: updatedLocation,
                _coordinatesFixed: true,
                _coordinatesFixedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            batchCount++;
            updatedCount++;

            // Commit batch every 500 operations
            if (batchCount >= 500) {
                console.log(`💾 Committing batch (${updatedCount} updated so far)...\n`);
                await batch.commit();
                batch = db.batch();
                batchCount = 0;
            }

            // Rate limiting
            await sleep(DELAY_BETWEEN_REQUESTS);
        }

        // Commit final batch
        if (batchCount > 0) {
            console.log(`💾 Committing final batch...\n`);
            await batch.commit();
        }

        console.log('========================================');
        console.log('✅ COORDINATES FIX COMPLETE');
        console.log('========================================');
        console.log(`✓ Updated: ${updatedCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log(`❌ Failed: ${failedCount}`);
        console.log(`📊 Total: ${snapshot.size}`);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixCoordinates();
