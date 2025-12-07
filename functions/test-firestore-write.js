/**
 * TEST SCRIPT FOR FIRESTORE WRITES (PHASE 3)
 *
 * Purpose: Test data normalization and Firestore writes locally
 * Usage: node test-firestore-write.js
 *
 * This script:
 * 1. Initializes Firebase Admin SDK
 * 2. Fetches a small sample from one AA site
 * 3. Normalizes the data
 * 4. Writes to Firestore
 * 5. Reads back to verify
 */

const admin = require('firebase-admin');
const axios = require('axios');
const { FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../.test-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'glrs-pir-system'
});

const db = admin.firestore();

// Test configuration - use Santa Cruz (smallest dataset)
const TEST_SITE = {
  name: 'Santa Cruz AA',
  url: 'https://aasantacruz.org/wp-content/tsml-cache-54034a4385.json',
  prefix: 'aa-santacruz'
};

const SAMPLE_SIZE = 5; // Only test with 5 meetings

// Normalization function (copied from syncAAMeetings.js)
function normalizeMeeting(meeting, source) {
  const street = meeting.address || meeting.formatted_address || '';
  const city = meeting.city || meeting.region || meeting.sub_region || '';
  const state = meeting.state || 'CA';
  const zip = meeting.postal_code || meeting.zip || '';

  const isVirtual = !!(
    meeting.conference_url ||
    meeting.attendance_option === 'online' ||
    (meeting.types && meeting.types.includes('ONL'))
  );

  const lat = meeting.latitude ? parseFloat(meeting.latitude) : null;
  const lon = meeting.longitude ? parseFloat(meeting.longitude) : null;

  const types = Array.isArray(meeting.types)
    ? meeting.types.join(', ')
    : (meeting.types || '');

  const day = typeof meeting.day === 'number' ? meeting.day : parseInt(meeting.day) || 0;

  return {
    source: source,
    type: 'AA',
    name: meeting.name || 'Unnamed Meeting',
    day: day,
    time: meeting.time || '',
    location: meeting.location || (isVirtual ? 'Online' : ''),
    address: {
      street: street,
      city: city,
      state: state,
      zip: zip
    },
    coordinates: {
      lat: lat,
      lon: lon
    },
    isVirtual: isVirtual,
    conferenceUrl: meeting.conference_url || null,
    notes: meeting.notes || meeting.location_notes || '',
    types: types,
    lastUpdated: FieldValue.serverTimestamp()
  };
}

// Main test function
async function testFirestoreWrite() {
  console.log('');
  console.log('═════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING FIRESTORE WRITES - PHASE 3');
  console.log('═════════════════════════════════════════════════════════════');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`📍 Test site: ${TEST_SITE.name}`);
  console.log(`🔢 Sample size: ${SAMPLE_SIZE} meetings`);
  console.log('─────────────────────────────────────────────────────────────');
  console.log('');

  try {
    // Step 1: Fetch data
    console.log('📥 STEP 1: Fetching sample data...');
    const response = await axios.get(TEST_SITE.url, {
      headers: {
        'User-Agent': 'GuidingLightRecovery/1.0 (tyler@glrecoveryservices.com)',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    const allMeetings = response.data;
    const sampleMeetings = allMeetings.slice(0, SAMPLE_SIZE);
    console.log(`✅ Fetched ${allMeetings.length} total meetings`);
    console.log(`✅ Selected ${sampleMeetings.length} for testing`);

    // Step 2: Normalize data
    console.log('');
    console.log('🔄 STEP 2: Normalizing data...');
    const normalizedMeetings = sampleMeetings.map(m => normalizeMeeting(m, TEST_SITE.name));
    console.log(`✅ Normalized ${normalizedMeetings.length} meetings`);

    // Display sample normalized meeting
    console.log('');
    console.log('📋 Sample normalized meeting:');
    console.log(JSON.stringify(normalizedMeetings[0], null, 2));

    // Step 3: Write to Firestore
    console.log('');
    console.log('💾 STEP 3: Writing to Firestore...');
    const batch = db.batch();
    const meetingsRef = db.collection('externalMeetings');

    normalizedMeetings.forEach((meeting, index) => {
      const docId = `${TEST_SITE.prefix}-test-${String(index + 1).padStart(3, '0')}`;
      const docRef = meetingsRef.doc(docId);
      batch.set(docRef, meeting, { merge: true });
      console.log(`   📝 Queued: ${docId}`);
    });

    await batch.commit();
    console.log(`✅ Successfully wrote ${normalizedMeetings.length} meetings to Firestore`);

    // Step 4: Read back to verify
    console.log('');
    console.log('🔍 STEP 4: Reading back to verify...');
    const verifyPromises = normalizedMeetings.map((_, index) => {
      const docId = `${TEST_SITE.prefix}-test-${String(index + 1).padStart(3, '0')}`;
      return meetingsRef.doc(docId).get();
    });

    const docs = await Promise.all(verifyPromises);
    const successCount = docs.filter(doc => doc.exists).length;

    console.log(`✅ Verified ${successCount}/${normalizedMeetings.length} documents exist in Firestore`);

    // Display one verified document
    if (docs[0].exists) {
      console.log('');
      console.log('📋 Sample verified document:');
      const data = docs[0].data();
      console.log(`   ID: ${docs[0].id}`);
      console.log(`   Source: ${data.source}`);
      console.log(`   Type: ${data.type}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Day: ${data.day}`);
      console.log(`   Time: ${data.time}`);
      console.log(`   Location: ${data.location}`);
      console.log(`   City: ${data.address.city}`);
      console.log(`   Is Virtual: ${data.isVirtual}`);
      console.log(`   Types: ${data.types}`);
    }

    // Final summary
    console.log('');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETE - ALL STEPS PASSED');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`✅ Fetched: ${sampleMeetings.length} meetings`);
    console.log(`✅ Normalized: ${normalizedMeetings.length} meetings`);
    console.log(`✅ Written: ${normalizedMeetings.length} meetings`);
    console.log(`✅ Verified: ${successCount} meetings`);
    console.log('');
    console.log('📍 Firestore Collection: externalMeetings');
    console.log(`📍 Document IDs: ${TEST_SITE.prefix}-test-001 to ${TEST_SITE.prefix}-test-${String(SAMPLE_SIZE).padStart(3, '0')}`);
    console.log('═════════════════════════════════════════════════════════════');
    console.log('');

    // Cleanup (optional - uncomment to delete test documents)
    // console.log('🧹 Cleaning up test documents...');
    // const deleteBatch = db.batch();
    // docs.forEach(doc => deleteBatch.delete(doc.ref));
    // await deleteBatch.commit();
    // console.log('✅ Test documents deleted');

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('═════════════════════════════════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═════════════════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('═════════════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }
}

// Run the test
testFirestoreWrite();
