/**
 * TEST SCRIPT FOR AA MEETINGS SYNC (PHASE 2)
 *
 * Purpose: Test JSON fetching logic without deploying to Firebase
 * Usage: node test-aa-sync.js
 *
 * This script simulates the fetchSiteData function to verify:
 * - JSON endpoints are accessible
 * - Data structure is correct
 * - Rate limiting works
 * - Error handling is robust
 */

const axios = require('axios');

// Configuration (copied from syncAAMeetings.js)
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
  }
];

const RATE_LIMIT_DELAY = 2500;
const USER_AGENT = 'GuidingLightRecovery/1.0 (tyler@glrecoveryservices.com; helping people find AA meetings)';
const REQUEST_TIMEOUT = 30000;

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch function (same as syncAAMeetings.js)
async function fetchSiteData(site) {
  console.log(`🔄 Fetching ${site.name}...`);
  console.log(`   URL: ${site.url}`);
  console.log(`   Expected: ~${site.estimated} meetings`);

  try {
    const response = await axios.get(site.url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      timeout: REQUEST_TIMEOUT
    });

    if (!response.data) {
      throw new Error('Empty response data');
    }

    const meetings = Array.isArray(response.data) ? response.data : [];

    if (meetings.length === 0) {
      console.warn(`⚠️  ${site.name}: Received empty meeting array`);
    } else {
      console.log(`✅ ${site.name}: Successfully fetched ${meetings.length} meetings`);

      // Log sample meeting
      if (meetings.length > 0) {
        console.log(`📋 Sample meeting from ${site.name}:`);
        console.log(`   Name: ${meetings[0].name || 'N/A'}`);
        console.log(`   Day: ${meetings[0].day !== undefined ? meetings[0].day : 'N/A'}`);
        console.log(`   Time: ${meetings[0].time || 'N/A'}`);
        console.log(`   Location: ${meetings[0].location || 'N/A'}`);
        console.log(`   City: ${meetings[0].city || 'N/A'}`);
        console.log(`   Types: ${meetings[0].types ? meetings[0].types.join(', ') : 'N/A'}`);
      }
    }

    return {
      success: true,
      data: meetings,
      error: null
    };

  } catch (error) {
    console.error(`❌ Failed to fetch ${site.name}:`, error.message);

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

// Main test function
async function testSync() {
  console.log('');
  console.log('═════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING AA MEETINGS SYNC - PHASE 2');
  console.log('═════════════════════════════════════════════════════════════');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`📍 Sites to test: ${AA_INTERGROUPS.length}`);
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
    for (let i = 0; i < AA_INTERGROUPS.length; i++) {
      const site = AA_INTERGROUPS[i];

      console.log(`\n📍 SITE ${i + 1}/${AA_INTERGROUPS.length}: ${site.name}`);
      console.log('─────────────────────────────────────────────────────────────');

      const fetchResult = await fetchSiteData(site);

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

        results.successfulSites++;
        results.totalMeetings += fetchResult.data.length;
        results.siteResults.push({
          site: site.name,
          success: true,
          count: fetchResult.data.length,
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

      // Rate limiting
      if (i < AA_INTERGROUPS.length - 1) {
        console.log(`⏳ Rate limiting: Waiting ${RATE_LIMIT_DELAY}ms before next site...`);
        await sleep(RATE_LIMIT_DELAY);
      }
    }

    // Final summary
    console.log('');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETE');
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
    console.error('❌ CRITICAL ERROR IN TEST');
    console.error('═════════════════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('═════════════════════════════════════════════════════════════');
    console.error('');
    throw error;
  }
}

// Run the test
testSync()
  .then(results => {
    process.exit(results.failedSites > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
