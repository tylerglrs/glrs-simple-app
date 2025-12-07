const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const { FieldValue } = require('firebase-admin/firestore');

// =============================================================================
// AA MEETINGS SCRAPER - JSON API + HTML SCRAPING
// =============================================================================
// Purpose: Fetch AA meetings from 5 Bay Area Intergroups (4 JSON + 1 HTML)
// Schedule: Weekly on Sundays at 3:00 AM Pacific
// Data Source: 12 Step Meeting List (TSML) JSON endpoints + HTML scraping
// Target: ~3,200-3,400 AA meetings
// =============================================================================

// -----------------------------------------------------------------------------
// CONFIGURATION - AA INTERGROUP SOURCES (JSON + HTML)
// -----------------------------------------------------------------------------
const AA_INTERGROUPS = [
  {
    name: 'SF/Marin AA',
    type: 'json',
    url: 'https://sheets.code4recovery.org/storage/aasfmarin.json',
    prefix: 'aa-sfmarin',
    estimated: 893
  },
  {
    name: 'East Bay AA',
    type: 'json',
    url: 'https://eastbayaa.org/wp-content/tsml-cache-dbc296d247.json',
    prefix: 'aa-eastbay',
    estimated: 896
  },
  {
    name: 'Santa Clara AA',
    type: 'json',
    url: 'https://sheets.code4recovery.org/storage/12Ga8uwMG4WJ8pZ_SEU7vNETp_aQZ-2yNVsYDFqIwHyE.json',
    prefix: 'aa-santaclara',
    estimated: 719
  },
  {
    name: 'Santa Cruz AA',
    type: 'json',
    url: 'https://aasantacruz.org/wp-content/tsml-cache-54034a4385.json',
    prefix: 'aa-santacruz',
    estimated: 344
  },
  {
    name: 'San Mateo AA',
    type: 'html',
    url: 'https://aa-san-mateo.org/meetings',
    prefix: 'aa-sanmateo',
    estimated: 400
  }
];

// -----------------------------------------------------------------------------
// SAFEGUARDS & RATE LIMITING
// -----------------------------------------------------------------------------
const RATE_LIMIT_DELAY = 2500; // 2.5 seconds between requests (respectful scraping)
const USER_AGENT = 'GuidingLightRecovery/1.0 (tyler@glrecoveryservices.com; helping people find AA meetings)';
const REQUEST_TIMEOUT = 30000; // 30 second timeout per request

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Sleep function for rate limiting
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch JSON data from a single AA Intergroup
 * @param {object} site - Site configuration object
 * @returns {Promise<object>} - { success: boolean, data: array, error: string }
 */
async function fetchSiteData(site) {
  console.log(`🔄 Fetching ${site.name}...`);
  console.log(`   URL: ${site.url}`);
  console.log(`   Expected: ~${site.estimated} meetings`);

  try {
    // Fetch JSON data with proper headers and timeout
    const response = await axios.get(site.url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      timeout: REQUEST_TIMEOUT
    });

    // Validate response
    if (!response.data) {
      throw new Error('Empty response data');
    }

    // Ensure response is an array
    const meetings = Array.isArray(response.data) ? response.data : [];

    if (meetings.length === 0) {
      console.warn(`⚠️  ${site.name}: Received empty meeting array`);
    } else {
      console.log(`✅ ${site.name}: Successfully fetched ${meetings.length} meetings`);

      // Log sample meeting for verification
      if (meetings.length > 0) {
        console.log(`📋 Sample meeting from ${site.name}:`);
        console.log(`   Name: ${meetings[0].name || 'N/A'}`);
        console.log(`   Day: ${meetings[0].day !== undefined ? meetings[0].day : 'N/A'}`);
        console.log(`   Time: ${meetings[0].time || 'N/A'}`);
        console.log(`   Location: ${meetings[0].location || 'N/A'}`);
        console.log(`   City: ${meetings[0].city || 'N/A'}`);
      }
    }

    return {
      success: true,
      data: meetings,
      error: null
    };

  } catch (error) {
    console.error(`❌ Failed to fetch ${site.name}:`, error.message);

    // Log additional error details for debugging
    if (error.response) {
      console.error(`   HTTP Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
    } else if (error.request) {
      console.error(`   No response received (network error or timeout)`);
    } else {
      console.error(`   Error details: ${error.message}`);
    }

    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

/**
 * Fetch and scrape HTML data from San Mateo AA (requires multi-day fetch)
 * @param {object} site - Site configuration object
 * @returns {Promise<object>} - { success: boolean, data: array, error: string }
 */
async function fetchHTMLSiteData(site) {
  console.log(`🔄 Fetching ${site.name} (HTML scraping - 7 days)...`);
  console.log(`   URL: ${site.url}`);
  console.log(`   Expected: ~${site.estimated} meetings`);

  const allMeetings = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  try {
    // Fetch all 7 days (meetings are split by day in HTML)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      console.log(`   📅 Fetching ${days[dayIndex]} (day ${dayIndex})...`);

      // Fetch HTML with day filter
      const response = await axios.get(`${site.url}?tsml-day=${dayIndex}`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html'
        },
        timeout: REQUEST_TIMEOUT
      });

      // Parse HTML with Cheerio
      const html = response.data;

      // Extract the embedded JavaScript locations object
      // Use non-greedy match to get everything until the closing };
      const match = html.match(/var locations = (\{.+?\});/s);

      if (!match) {
        console.warn(`   ⚠️  No locations data found for ${days[dayIndex]}`);
        continue;
      }

      // Parse the JSON data
      const locations = JSON.parse(match[1]);

      // Extract meetings from all locations
      for (const locationId in locations) {
        const location = locations[locationId];
        const meetings = location.meetings || [];

        for (const meeting of meetings) {
          // Parse address components from formatted_address
          const addressParts = location.formatted_address?.split(', ') || [];
          const street = addressParts[0] || '';
          const city = addressParts[1] || '';
          const stateZip = addressParts[2] || '';
          const [state, zip] = stateZip.split(' ');

          // Build structured location with GeoPoint coordinates
          const meetingLocation = {
            formatted: location.formatted_address || `${street}, ${city}, ${state} ${zip}`.trim(),
            streetNumber: '',
            streetName: street,
            city: city || '',
            state: state || 'CA',
            zipCode: zip || '',
            country: 'USA',
            coordinates: new admin.firestore.GeoPoint(
              location.latitude || 0,
              location.longitude || 0
            )
          };

          // ✅ FIX: Build address object from location data
          const meetingAddress = {
            street: street ? `${street}, ${city}, ${state || 'CA'} ${zip || ''}`.trim() : `${city}, ${state || 'CA'}`.trim(),
            city: city || '',
            state: state || 'CA',
            zip: zip || ''
          };

          // Build normalized meeting object
          allMeetings.push({
            name: meeting.name || 'Unnamed Meeting',
            day: meeting.day,
            time: meeting.time || '',
            locationName: location.name || '',
            location: meetingLocation,
            address: meetingAddress,  // ✅ NEW: Add address field
            types: meeting.types || [],
            conference_url: meeting.conference_url || null,
            notes: meeting.notes || ''
          });
        }
      }

      console.log(`   ✅ ${days[dayIndex]}: Found ${Object.keys(locations).length} locations`);

      // Rate limiting between day fetches (0.5 seconds)
      if (dayIndex < 6) {
        await sleep(500);
      }
    }

    console.log(`✅ ${site.name}: Successfully scraped ${allMeetings.length} meetings`);

    // Log sample meeting for verification
    if (allMeetings.length > 0) {
      console.log(`📋 Sample meeting from ${site.name}:`);
      console.log(`   Name: ${allMeetings[0].name || 'N/A'}`);
      console.log(`   Day: ${allMeetings[0].day !== undefined ? allMeetings[0].day : 'N/A'}`);
      console.log(`   Time: ${allMeetings[0].time || 'N/A'}`);
      console.log(`   Location: ${allMeetings[0].location || 'N/A'}`);
      console.log(`   City: ${allMeetings[0].city || 'N/A'}`);
    }

    return {
      success: true,
      data: allMeetings,
      error: null
    };

  } catch (error) {
    console.error(`❌ Failed to scrape ${site.name}:`, error.message);

    // Log additional error details for debugging
    if (error.response) {
      console.error(`   HTTP Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
    } else if (error.request) {
      console.error(`   No response received (network error or timeout)`);
    } else {
      console.error(`   Error details: ${error.message}`);
    }

    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

/**
 * Transform TSML JSON meeting data to GLRS format
 * @param {object} meeting - Raw TSML meeting object
 * @param {string} source - Source name (e.g., "SF/Marin AA")
 * @returns {object} - Normalized meeting object matching NA data structure
 */
function normalizeMeeting(meeting, source) {
  // Extract address components (handle varying structures)
  const street = meeting.address || meeting.formatted_address || '';
  const city = meeting.city || meeting.region || meeting.sub_region || '';
  const state = meeting.state || 'CA'; // Default to CA for Bay Area
  const zip = meeting.postal_code || meeting.zip || '';

  // Determine if meeting is virtual
  const isVirtual = !!(
    meeting.conference_url ||
    meeting.attendance_option === 'online' ||
    (meeting.types && meeting.types.includes('ONL'))
  );

  // Extract coordinates (handle null/undefined)
  const lat = meeting.latitude ? parseFloat(meeting.latitude) : null;
  const lon = meeting.longitude ? parseFloat(meeting.longitude) : null;

  // Format meeting types (convert array to comma-separated string)
  const types = Array.isArray(meeting.types)
    ? meeting.types.join(', ')
    : (meeting.types || '');

  // Normalize day (TSML uses 0-6, Sunday=0)
  const day = typeof meeting.day === 'number' ? meeting.day : parseInt(meeting.day) || 0;

  // Build structured location with GeoPoint coordinates
  const location = {
    formatted: `${street}, ${city}, ${state} ${zip}`.trim(),
    streetNumber: '',
    streetName: street,
    city: city,
    state: state,
    zipCode: zip,
    country: 'USA',
    coordinates: new admin.firestore.GeoPoint(lat || 0, lon || 0)
  };

  // ✅ FIX: Build address object from location data
  const address = {
    street: street ? `${street}, ${city}, ${state} ${zip}`.trim() : `${city}, ${state} ${zip}`.trim(),
    city: city,
    state: state,
    zip: zip
  };

  // Build normalized meeting object
  return {
    source: source,
    type: 'AA',
    name: meeting.name || 'Unnamed Meeting',
    day: day,
    time: meeting.time || '',
    locationName: meeting.location || (isVirtual ? 'Online' : ''),
    location: location,
    address: address,  // ✅ NEW: Add address field
    isVirtual: isVirtual,
    conferenceUrl: meeting.conference_url || null,
    notes: meeting.notes || meeting.location_notes || '',
    types: types,
    lastUpdated: FieldValue.serverTimestamp()
  };
}

/**
 * Save meetings to Firestore
 * @param {array} meetings - Array of normalized meeting objects
 * @param {string} prefix - Document ID prefix (e.g., "aa-sfmarin")
 * @returns {Promise<number>} - Number of meetings saved
 */
async function saveMeetings(meetings, prefix) {
  if (!meetings || meetings.length === 0) {
    console.log(`⚠️  No meetings to save for prefix: ${prefix}`);
    return 0;
  }

  console.log(`💾 Saving ${meetings.length} meetings to Firestore...`);

  const db = admin.firestore();
  const meetingsRef = db.collection('externalMeetings');

  // Firestore batch writes are limited to 500 operations
  const BATCH_SIZE = 500;
  let totalSaved = 0;

  try {
    // Split meetings into batches of 500
    for (let i = 0; i < meetings.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchMeetings = meetings.slice(i, i + BATCH_SIZE);

      batchMeetings.forEach((meeting, index) => {
        // Generate document ID: aa-sfmarin-001, aa-sfmarin-002, etc.
        const globalIndex = i + index;
        const docId = `${prefix}-${String(globalIndex + 1).padStart(3, '0')}`;
        const docRef = meetingsRef.doc(docId);

        batch.set(docRef, meeting, { merge: true });
      });

      await batch.commit();
      totalSaved += batchMeetings.length;

      console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Saved ${batchMeetings.length} meetings`);
    }

    console.log(`✅ Successfully saved ${totalSaved} meetings with prefix: ${prefix}`);
    return totalSaved;

  } catch (error) {
    console.error(`❌ Error saving meetings to Firestore:`, error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// MAIN SYNC FUNCTION
// -----------------------------------------------------------------------------
exports.syncAAMeetings = functions.pubsub
  .schedule('0 3 * * 0') // Every Sunday at 3:00 AM Pacific
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('🔄 STARTING AA MEETINGS SYNC');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`📍 Sites to sync: ${AA_INTERGROUPS.length}`);
    console.log(`🎯 Expected total: ~${AA_INTERGROUPS.reduce((sum, site) => sum + site.estimated, 0)} meetings`);
    console.log('─────────────────────────────────────────────────────────────');
    console.log('');

    const results = {
      totalSites: AA_INTERGROUPS.length,
      successfulSites: 0,
      failedSites: 0,
      totalMeetings: 0,
      siteResults: []
    };

    try {
      // Loop through each site sequentially (with rate limiting)
      for (let i = 0; i < AA_INTERGROUPS.length; i++) {
        const site = AA_INTERGROUPS[i];

        console.log(`\n📍 SITE ${i + 1}/${AA_INTERGROUPS.length}: ${site.name}`);
        console.log('─────────────────────────────────────────────────────────────');

        // Fetch data from this site (JSON or HTML based on type)
        const fetchResult = site.type === 'html'
          ? await fetchHTMLSiteData(site)
          : await fetchSiteData(site);

        if (fetchResult.success) {
          const meetingCount = fetchResult.data.length;
          const expectedCount = site.estimated;
          const variance = meetingCount - expectedCount;
          const variancePercent = ((variance / expectedCount) * 100).toFixed(1);

          console.log(`\n📊 ${site.name} Results:`);
          console.log(`   ✅ Status: Success`);
          console.log(`   📥 Meetings fetched: ${meetingCount}`);
          console.log(`   🎯 Expected: ${expectedCount}`);
          console.log(`   📈 Variance: ${variance > 0 ? '+' : ''}${variance} (${variancePercent > 0 ? '+' : ''}${variancePercent}%)`);

          // Normalize and save data to Firestore
          console.log(`\n🔄 Normalizing ${meetingCount} meetings...`);
          const normalizedMeetings = fetchResult.data.map(m => normalizeMeeting(m, site.name));
          console.log(`✅ Normalization complete`);

          console.log(`\n💾 Writing to Firestore...`);
          const savedCount = await saveMeetings(normalizedMeetings, site.prefix);
          console.log(`✅ Firestore write complete: ${savedCount} meetings saved`);

          results.successfulSites++;
          results.totalMeetings += savedCount;
          results.siteResults.push({
            site: site.name,
            success: true,
            count: savedCount,
            error: null
          });

        } else {
          console.error(`\n📊 ${site.name} Results:`);
          console.error(`   ❌ Status: Failed`);
          console.error(`   ⚠️  Error: ${fetchResult.error}`);

          results.failedSites++;
          results.siteResults.push({
            site: site.name,
            success: false,
            count: 0,
            error: fetchResult.error
          });
        }

        // Rate limiting: Wait 2.5 seconds before next request (unless last site)
        if (i < AA_INTERGROUPS.length - 1) {
          console.log(`⏳ Rate limiting: Waiting ${RATE_LIMIT_DELAY}ms before next site...`);
          await sleep(RATE_LIMIT_DELAY);
        }
      }

      // Final summary
      console.log('');
      console.log('═════════════════════════════════════════════════════════════');
      console.log('✅ AA MEETINGS SYNC COMPLETE');
      console.log('═════════════════════════════════════════════════════════════');
      console.log(`⏰ Completed at: ${new Date().toISOString()}`);
      console.log(`✅ Successful sites: ${results.successfulSites}/${results.totalSites}`);
      console.log(`❌ Failed sites: ${results.failedSites}/${results.totalSites}`);
      console.log(`📊 Total meetings: ${results.totalMeetings}`);
      console.log('');
      console.log('📋 SITE-BY-SITE RESULTS:');
      results.siteResults.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        const status = result.success ? `${result.count} meetings` : `Error: ${result.error}`;
        console.log(`   ${icon} ${result.site}: ${status}`);
      });
      console.log('═════════════════════════════════════════════════════════════');
      console.log('');

      return results;

    } catch (error) {
      console.error('');
      console.error('═════════════════════════════════════════════════════════════');
      console.error('❌ CRITICAL ERROR IN AA MEETINGS SYNC');
      console.error('═════════════════════════════════════════════════════════════');
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      console.error('═════════════════════════════════════════════════════════════');
      console.error('');
      throw error;
    }
  });
