const admin = require('firebase-admin');
const serviceAccount = require('./glrs-pir-system-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRecentCheckIn() {
  try {
    const snapshot = await db.collection('checkIns')
      .where('userId', '==', 'QuxUOqnjM0VeK8M7JNnPe1vMTA82')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      console.log('No check-ins found');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('📝 Most recent check-in structure:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n🔍 Has eveningData?', !!data.eveningData);
    console.log('🔍 Has eveningData.gratitude?', !!data.eveningData?.gratitude);
    console.log('🔍 Gratitude content:', data.eveningData?.gratitude);
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkRecentCheckIn();
