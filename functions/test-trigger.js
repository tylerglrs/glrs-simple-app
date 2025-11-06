const admin = require('firebase-admin');

// Initialize with project ID
admin.initializeApp({
  projectId: 'glrs-pir-system'
});
const db = admin.firestore();

async function createTestCheckIn() {
  try {
    console.log('Creating test check-in to trigger Cloud Functions...');

    const docRef = await db.collection('checkIns').add({
      userId: 'test-user-cloud-functions',
      tenantId: 'glrs',
      type: 'evening',
      eveningData: {
        gratitude: 'I am so grateful for my family, my health, and my recovery journey today. The sunshine was beautiful and I felt peace in nature.',
        challenges: 'Feeling stressed about work deadline and having some anxiety about an upcoming meeting',
        overallDay: 8,
        mood: 7,
        cravings: 2,
        anxiety: 4,
        sleep: 7
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Test check-in created with ID:', docRef.id);
    console.log('⏳ Cloud Functions should trigger automatically in ~5 seconds...');
    console.log('');
    console.log('📊 Check results:');
    console.log('   1. Firebase Console Logs: https://console.firebase.google.com/project/glrs-pir-system/functions/logs');
    console.log('   2. Firestore gratitude insights: users/test-user-cloud-functions/insights/gratitude');
    console.log('   3. Firestore challenge tracking: challenges_tracking collection');
    console.log('');
    console.log('Waiting 10 seconds for functions to complete...');

    // Wait 10 seconds then check results
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check if gratitude insights were created
    const gratitudeInsights = await db.doc('users/test-user-cloud-functions/insights/gratitude').get();
    if (gratitudeInsights.exists) {
      console.log('✅ analyzeGratitude function worked! Found insights:');
      const data = gratitudeInsights.data();
      console.log('   - Total gratitudes:', data.totalCount);
      console.log('   - Themes detected:', Object.keys(data.themes || {}).join(', '));
      console.log('   - Categories:', Object.keys(data.categories || {}).join(', '));
    } else {
      console.log('⏳ Gratitude insights not found yet (may still be processing)');
    }

    // Check if challenge tracking was created
    const challenges = await db.collection('challenges_tracking')
      .where('userId', '==', 'test-user-cloud-functions')
      .limit(1)
      .get();

    if (!challenges.empty) {
      console.log('✅ analyzeChallenge function worked! Found challenge:');
      const data = challenges.docs[0].data();
      console.log('   - Category:', data.category);
      console.log('   - Severity:', data.severity);
      console.log('   - Status:', data.status);
    } else {
      console.log('⏳ Challenge tracking not found yet (may still be processing)');
    }

    console.log('');
    console.log('✅ Test complete! Check Firebase Console for detailed logs.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestCheckIn();
