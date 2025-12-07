/**
 * PHASE 2 FIX #2: ADDRESS MIGRATION SCRIPT
 *
 * Purpose: Migrate 4,106 external meetings from plain text addresses to structured format
 *
 * Current Structure:
 *   address: "123 Main St, San Francisco, CA 94102"
 *   city: "San Francisco"
 *   state: "CA"
 *   zip: "94102"
 *
 * Target Structure:
 *   location: {
 *     formatted: "123 Main St, San Francisco, CA 94102, USA",
 *     streetNumber: "123",
 *     streetName: "Main St",
 *     city: "San Francisco",
 *     state: "CA",
 *     zipCode: "94102",
 *     country: "USA",
 *     coordinates: GeoPoint(37.7749, -122.4194)
 *   }
 *
 * API: Mapbox Geocoding (100K free requests/month = 3,333/day)
 * Rate Limit: 600 requests/minute (safe: 500/minute)
 *
 * Estimated Time: 4,106 meetings / 500 per minute = ~9 minutes
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'glrs-pir-system'
    });
}

const db = admin.firestore();

// ✅ Mapbox API Configuration
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';
const GEOCODE_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// ✅ Rate limiting configuration
const REQUESTS_PER_MINUTE = 500; // Conservative (Mapbox limit: 600)
const DELAY_BETWEEN_BATCHES = 60000; // 1 minute in milliseconds
const BATCH_SIZE = 50; // Process 50 meetings per batch

// ✅ Statistics tracking
const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
};

/**
 * Parse existing address string into components
 * Handles various formats:
 * - "123 Main St, San Francisco, CA 94102"
 * - "Main St, San Francisco, CA"
 * - "San Francisco, CA 94102"
 */
function parseAddress(addressString, city, state, zip) {
    const result = {
        streetNumber: '',
        streetName: '',
        city: city || '',
        state: state || '',
        zipCode: zip || '',
        country: 'USA'
    };

    if (!addressString || typeof addressString !== 'string') {
        return result;
    }

    // Remove city, state, zip from address string if present
    let street = addressString;
    if (city) street = street.replace(new RegExp(`,?\\s*${city}`, 'gi'), '');
    if (state) street = street.replace(new RegExp(`,?\\s*${state}`, 'gi'), '');
    if (zip) street = street.replace(new RegExp(`,?\\s*${zip}`, 'gi'), '');

    street = street.trim().replace(/^,+|,+$/g, '');

    // Try to extract street number and name
    const streetMatch = street.match(/^(\d+)\s+(.+)$/);
    if (streetMatch) {
        result.streetNumber = streetMatch[1];
        result.streetName = streetMatch[2];
    } else {
        result.streetName = street;
    }

    return result;
}

/**
 * Geocode address using Mapbox API
 * Returns structured location object with coordinates
 */
async function geocodeAddress(addressString) {
    if (!addressString) {
        throw new Error('Address string is required');
    }

    const url = `${GEOCODE_BASE_URL}/${encodeURIComponent(addressString)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&country=US`;

    try {
        const fetch = (await import('node-fetch')).default;
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

        // Extract components from context
        const context = feature.context || [];

        const placeContext = context.find(c => c.id.includes('place'));
        const regionContext = context.find(c => c.id.includes('region'));
        const postcodeContext = context.find(c => c.id.includes('postcode'));
        const countryContext = context.find(c => c.id.includes('country'));

        return {
            formatted: feature.place_name,
            city: placeContext?.text || '',
            state: regionContext?.short_code?.replace('US-', '') || '',
            zipCode: postcodeContext?.text || '',
            country: countryContext?.short_code || 'US',
            coordinates: new admin.firestore.GeoPoint(lat, lng),
            mapboxFeature: feature // Store full feature for debugging
        };
    } catch (error) {
        console.error(`Geocoding failed for "${addressString}":`, error.message);
        throw error;
    }
}

/**
 * Build full address string from components
 */
function buildAddressString(address, city, state, zip) {
    const parts = [];

    if (address) parts.push(address);
    if (city) parts.push(city);
    if (state && zip) {
        parts.push(`${state} ${zip}`);
    } else if (state) {
        parts.push(state);
    } else if (zip) {
        parts.push(zip);
    }

    return parts.join(', ');
}

/**
 * Migrate a single meeting document
 */
async function migrateMeeting(meetingDoc) {
    const meeting = meetingDoc.data();
    const meetingId = meetingDoc.id;

    try {
        // Skip if already migrated (has location.coordinates)
        if (meeting.location && meeting.location.coordinates) {
            console.log(`✓ Skipped (already migrated): ${meetingId}`);
            stats.skipped++;
            return;
        }

        // Extract current address data
        const currentAddress = meeting.address || '';
        const currentCity = meeting.city || '';
        const currentState = meeting.state || '';
        const currentZip = meeting.zip || '';

        // Build full address for geocoding
        const fullAddress = buildAddressString(
            currentAddress,
            currentCity,
            currentState,
            currentZip
        );

        if (!fullAddress) {
            console.error(`✗ Failed (no address): ${meetingId}`);
            stats.failed++;
            stats.errors.push({ id: meetingId, error: 'No address data' });
            return;
        }

        // Parse address components
        const parsed = parseAddress(currentAddress, currentCity, currentState, currentZip);

        // Geocode to get coordinates
        console.log(`  Geocoding: ${fullAddress}`);
        const geocoded = await geocodeAddress(fullAddress);

        // Build new location object
        const newLocation = {
            formatted: geocoded.formatted,
            streetNumber: parsed.streetNumber,
            streetName: parsed.streetName,
            city: geocoded.city || parsed.city,
            state: geocoded.state || parsed.state,
            zipCode: geocoded.zipCode || parsed.zipCode,
            country: geocoded.country,
            coordinates: geocoded.coordinates
        };

        // Update Firestore document
        await meetingDoc.ref.update({
            location: newLocation,
            // Keep original fields for rollback safety
            _migrated: true,
            _migratedAt: admin.firestore.FieldValue.serverTimestamp(),
            _originalAddress: currentAddress,
            _originalCity: currentCity,
            _originalState: currentState,
            _originalZip: currentZip
        });

        console.log(`✓ Success: ${meetingId} - ${newLocation.city}, ${newLocation.state}`);
        stats.successful++;

    } catch (error) {
        console.error(`✗ Failed: ${meetingId} - ${error.message}`);
        stats.failed++;
        stats.errors.push({ id: meetingId, error: error.message });
    }
}

/**
 * Process meetings in batches with rate limiting
 */
async function processBatch(meetings, batchNumber, totalBatches) {
    console.log(`\n========================================`);
    console.log(`Processing Batch ${batchNumber}/${totalBatches}`);
    console.log(`Meetings: ${meetings.length}`);
    console.log(`========================================\n`);

    for (const meeting of meetings) {
        await migrateMeeting(meeting);
        stats.processed++;

        // Progress update every 10 meetings
        if (stats.processed % 10 === 0) {
            const progress = ((stats.processed / stats.total) * 100).toFixed(1);
            console.log(`\n--- Progress: ${stats.processed}/${stats.total} (${progress}%) ---`);
            console.log(`Success: ${stats.successful} | Failed: ${stats.failed} | Skipped: ${stats.skipped}\n`);
        }
    }

    // Rate limiting: Wait before next batch (except for last batch)
    if (batchNumber < totalBatches) {
        console.log(`\n⏸️  Rate limit pause: Waiting 60 seconds before next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
}

/**
 * Main migration function
 */
async function migrateAllMeetings() {
    console.log('========================================');
    console.log('ADDRESS MIGRATION SCRIPT');
    console.log('Phase 2 Fix #2: Structured Address Format');
    console.log('========================================\n');

    try {
        // Fetch all external meetings
        console.log('📥 Fetching meetings from Firestore...');
        const snapshot = await db.collection('externalMeetings').get();

        stats.total = snapshot.size;
        console.log(`✓ Found ${stats.total} meetings\n`);

        if (stats.total === 0) {
            console.log('⚠️  No meetings found. Exiting.');
            return;
        }

        // Split into batches
        const allMeetings = snapshot.docs;
        const batches = [];

        for (let i = 0; i < allMeetings.length; i += BATCH_SIZE) {
            batches.push(allMeetings.slice(i, i + BATCH_SIZE));
        }

        console.log(`📦 Split into ${batches.length} batches of ${BATCH_SIZE} meetings each\n`);
        console.log(`⏱️  Estimated time: ${Math.ceil(batches.length)} minutes\n`);
        console.log(`🚀 Starting migration...\n`);

        // Process each batch
        for (let i = 0; i < batches.length; i++) {
            await processBatch(batches[i], i + 1, batches.length);
        }

        // Final statistics
        console.log('\n========================================');
        console.log('MIGRATION COMPLETE');
        console.log('========================================\n');
        console.log(`Total Meetings: ${stats.total}`);
        console.log(`Processed: ${stats.processed}`);
        console.log(`✓ Successful: ${stats.successful}`);
        console.log(`⊘ Skipped: ${stats.skipped}`);
        console.log(`✗ Failed: ${stats.failed}`);
        console.log(`\nSuccess Rate: ${((stats.successful / stats.total) * 100).toFixed(1)}%`);

        if (stats.errors.length > 0) {
            console.log(`\n⚠️  ${stats.errors.length} Errors:`);
            stats.errors.slice(0, 10).forEach(err => {
                console.log(`  - ${err.id}: ${err.error}`);
            });
            if (stats.errors.length > 10) {
                console.log(`  ... and ${stats.errors.length - 10} more errors`);
            }
        }

        console.log('\n========================================\n');

    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error);
        throw error;
    }
}

/**
 * Rollback function (if needed)
 * Restores original address fields from _original* fields
 */
async function rollbackMigration() {
    console.log('========================================');
    console.log('ADDRESS MIGRATION ROLLBACK');
    console.log('========================================\n');

    try {
        const snapshot = await db.collection('externalMeetings')
            .where('_migrated', '==', true)
            .get();

        console.log(`Found ${snapshot.size} migrated meetings\n`);

        let rolled = 0;
        for (const doc of snapshot.docs) {
            const meeting = doc.data();

            await doc.ref.update({
                address: meeting._originalAddress || '',
                city: meeting._originalCity || '',
                state: meeting._originalState || '',
                zip: meeting._originalZip || '',
                location: admin.firestore.FieldValue.delete(),
                _migrated: admin.firestore.FieldValue.delete(),
                _migratedAt: admin.firestore.FieldValue.delete(),
                _originalAddress: admin.firestore.FieldValue.delete(),
                _originalCity: admin.firestore.FieldValue.delete(),
                _originalState: admin.firestore.FieldValue.delete(),
                _originalZip: admin.firestore.FieldValue.delete()
            });

            rolled++;
            if (rolled % 100 === 0) {
                console.log(`Rolled back ${rolled}/${snapshot.size} meetings...`);
            }
        }

        console.log(`\n✓ Rollback complete: ${rolled} meetings restored\n`);

    } catch (error) {
        console.error('❌ ROLLBACK FAILED:', error);
        throw error;
    }
}

// Export functions for use as Cloud Function or standalone script
module.exports = {
    migrateAllMeetings,
    rollbackMigration,
    geocodeAddress,
    parseAddress
};

// Run migration if executed directly
if (require.main === module) {
    const command = process.argv[2];

    if (command === 'rollback') {
        rollbackMigration()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } else {
        migrateAllMeetings()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    }
}
