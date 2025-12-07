/**
 * Debug script to check reflections collection
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'glrs-pir-system' });
}

const db = admin.firestore();

function getDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function debugReflections() {
  const userId = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';

  console.log('=== SEPARATE REFLECTIONS COLLECTION ===');
  const reflections = await db.collection('reflections')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  console.log(`Found ${reflections.size} reflections in 'reflections' collection:`);
  reflections.forEach((doc, i) => {
    const data = doc.data();
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    console.log(`${i + 1}. ${getDateString(date)} - ${data.type || 'no type'} - overallDay: ${data.overallDay}, gratitude: ${data.gratitude?.substring(0, 30) || 'none'}...`);
  });

  console.log('\n=== CHECK-INS WITH type=evening ===');
  const eveningCheckIns = await db.collection('checkIns')
    .where('userId', '==', userId)
    .where('type', '==', 'evening')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  console.log(`Found ${eveningCheckIns.size} evening check-ins:`);
  eveningCheckIns.forEach((doc, i) => {
    const data = doc.data();
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    console.log(`${i + 1}. ${getDateString(date)} - eveningData: ${!!data.eveningData}, overallDay: ${data.overallDay || data.eveningData?.overallDay || 'none'}`);
    if (data.eveningData) {
      console.log(`    eveningData keys: ${Object.keys(data.eveningData).join(', ')}`);
    } else {
      console.log(`    Top-level keys: ${Object.keys(data).filter(k => !['userId', 'tenantId', 'createdAt', 'type', 'id'].includes(k)).join(', ')}`);
    }
  });

  console.log('\n=== CHECK-INS WITH eveningData field ===');
  // This query might fail if eveningData doesn't exist on all docs
  try {
    const checkInsWithEvening = await db.collection('checkIns')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const withEveningData = [];
    checkInsWithEvening.forEach(doc => {
      const data = doc.data();
      if (data.eveningData && Object.keys(data.eveningData).length > 0) {
        const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        withEveningData.push({ date: getDateString(date), ...data.eveningData });
      }
    });

    console.log(`Found ${withEveningData.length} check-ins with eveningData object:`);
    withEveningData.forEach((d, i) => {
      console.log(`${i + 1}. ${d.date} - overallDay: ${d.overallDay}, gratitude: ${d.gratitude?.substring(0, 30) || 'none'}...`);
    });
  } catch (e) {
    console.log('Error querying eveningData:', e.message);
  }

  process.exit(0);
}

debugReflections();
