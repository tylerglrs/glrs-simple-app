const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const { FieldValue } = require('firebase-admin/firestore');

exports.syncMeetings = functions.pubsub
  .schedule('0 */12 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('🔄 Starting meeting sync...');
    
   try {
  const response = await axios.get(
    'https://bmlt.wszf.org/main_server/client_interface/json/',
    {
      params: {
        switcher: 'GetSearchResults',
        lat_val: 37.668,
        long_val: -122.080,
        geo_width: 150
      }
    }
  );
      
      const meetings = response.data;
      console.log(`📥 Found ${meetings.length} meetings`);
      
      const batch = admin.firestore().batch();
      const meetingsRef = admin.firestore().collection('externalMeetings');
      
      meetings.forEach(meeting => {
        const docRef = meetingsRef.doc(`na-${meeting.id_bigint}`);

        // Build structured location with GeoPoint coordinates
        const location = {
          formatted: `${meeting.location_street || ''}, ${meeting.location_municipality || ''}, ${meeting.location_province || ''} ${meeting.location_postal_code_1 || ''}`.trim(),
          streetNumber: '',
          streetName: meeting.location_street || '',
          city: meeting.location_municipality || '',
          state: meeting.location_province || '',
          zipCode: meeting.location_postal_code_1 || '',
          country: 'USA',
          coordinates: new admin.firestore.GeoPoint(
            parseFloat(meeting.latitude) || 0,
            parseFloat(meeting.longitude) || 0
          )
        };

        batch.set(docRef, {
          source: 'bmlt',
          type: 'NA',
          name: meeting.meeting_name,
          day: parseInt(meeting.weekday_tinyint) - 1,
          time: meeting.start_time,
          locationName: meeting.location_text,
          location: location,
          isVirtual: !!meeting.virtual_meeting_link,
          conferenceUrl: meeting.virtual_meeting_link || null,
          notes: meeting.comments || '',
          lastUpdated: FieldValue.serverTimestamp()
        }, { merge: true });
      });
      
      await batch.commit();
      console.log(`✅ Synced ${meetings.length} meetings successfully`);
      
    } catch (error) {
      console.error('❌ Error syncing meetings:', error);
      throw error;
    }
  });