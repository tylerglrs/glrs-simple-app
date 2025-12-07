/**
 * TEST SCRIPT FOR SAN MATEO HTML SCRAPER
 *
 * Purpose: Test HTML scraping logic for San Mateo AA before deployment
 * Usage: node test-sanmateo-scraper.js
 */

const axios = require('axios');

const USER_AGENT = 'GuidingLightRecovery/1.0 (tyler@glrecoveryservices.com; helping people find AA meetings)';
const REQUEST_TIMEOUT = 30000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHTMLSiteData(site) {
  console.log(`🔄 Fetching ${site.name} (HTML scraping - 7 days)...`);
  console.log(`   URL: ${site.url}`);
  console.log(`   Expected: ~${site.estimated} meetings`);

  const allMeetings = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  try {
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      console.log(`   📅 Fetching ${days[dayIndex]} (day ${dayIndex})...`);

      const response = await axios.get(`${site.url}?tsml-day=${dayIndex}`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html'
        },
        timeout: REQUEST_TIMEOUT
      });

      const html = response.data;
      const match = html.match(/var locations = (\{.+?\});/s);

      if (!match) {
        console.warn(`   ⚠️  No locations data found for ${days[dayIndex]}`);
        continue;
      }

      const locations = JSON.parse(match[1]);
      let dayMeetingCount = 0;

      for (const locationId in locations) {
        const location = locations[locationId];
        const meetings = location.meetings || [];
        dayMeetingCount += meetings.length;

        for (const meeting of meetings) {
          const addressParts = location.formatted_address?.split(', ') || [];
          const street = addressParts[0] || '';
          const city = addressParts[1] || '';
          const stateZip = addressParts[2] || '';
          const parts = stateZip.split(' ');
          const state = parts[0] || 'CA';
          const zip = parts[1] || '';

          allMeetings.push({
            name: meeting.name || 'Unnamed Meeting',
            day: meeting.day,
            time: meeting.time || '',
            location: location.name || '',
            address: street,
            city: city || '',
            state: state,
            zip: zip,
            latitude: location.latitude || null,
            longitude: location.longitude || null,
            types: meeting.types || [],
            conference_url: meeting.conference_url || null,
            notes: meeting.notes || ''
          });
        }
      }

      const locationCount = Object.keys(locations).length;
      console.log(`   ✅ ${days[dayIndex]}: ${locationCount} locations, ${dayMeetingCount} meetings`);

      if (dayIndex < 6) {
        await sleep(500);
      }
    }

    console.log(`\n✅ ${site.name}: Successfully scraped ${allMeetings.length} meetings`);

    if (allMeetings.length > 0) {
      console.log(`\n📋 Sample meeting from ${site.name}:`);
      console.log(`   Name: ${allMeetings[0].name}`);
      console.log(`   Day: ${allMeetings[0].day}`);
      console.log(`   Time: ${allMeetings[0].time}`);
      console.log(`   Location: ${allMeetings[0].location}`);
      console.log(`   City: ${allMeetings[0].city}`);
      console.log(`   Types: ${allMeetings[0].types.join(', ')}`);
    }

    return {
      success: true,
      data: allMeetings,
      error: null
    };

  } catch (error) {
    console.error(`❌ Failed to scrape ${site.name}:`, error.message);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

// Test San Mateo scraper
const site = {
  name: 'San Mateo AA',
  type: 'html',
  url: 'https://aa-san-mateo.org/meetings',
  prefix: 'aa-sanmateo',
  estimated: 400
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TESTING SAN MATEO AA HTML SCRAPER');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`⏰ Started at: ${new Date().toISOString()}`);
console.log('─────────────────────────────────────────────────────────────');
console.log('');

fetchHTMLSiteData(site)
  .then(result => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    if (result.success) {
      console.log('✅ TEST PASSED - San Mateo scraper working correctly');
      console.log(`📊 Total meetings: ${result.data.length}`);
      console.log(`🎯 Expected: ~${site.estimated}`);
      const variance = result.data.length - site.estimated;
      const variancePercent = ((variance / site.estimated) * 100).toFixed(1);
      console.log(`📈 Variance: ${variance > 0 ? '+' : ''}${variance} (${variancePercent > 0 ? '+' : ''}${variancePercent}%)`);
      console.log('═══════════════════════════════════════════════════════════════');
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED');
      console.log(`Error: ${result.error}`);
      console.log('═══════════════════════════════════════════════════════════════');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('❌ CRITICAL ERROR IN TEST');
    console.error(`Error: ${error.message}`);
    console.error('═══════════════════════════════════════════════════════════════');
    process.exit(1);
  });
