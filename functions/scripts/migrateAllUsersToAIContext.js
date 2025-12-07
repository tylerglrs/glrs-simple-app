/**
 * migrateAllUsersToAIContext.js
 *
 * Migration script to populate aiContext documents for ALL users.
 * Runs the single-user migration for each user in the database.
 *
 * Usage:
 *   node scripts/migrateAllUsersToAIContext.js
 *
 * Options:
 *   --dry-run    Show which users would be migrated without actually migrating
 *   --limit=N    Only migrate first N users (useful for testing)
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, '../../.test-credentials.json');
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[migrateAll] Firebase Admin initialized');
  } catch (error) {
    console.error('[migrateAll] Error loading service account:', error.message);
    console.log('[migrateAll] Attempting default credentials...');
    admin.initializeApp();
  }
}

const db = admin.firestore();

// Import the single-user migration function
const { migrateUserToAIContext } = require('./migrateToAIContext-lib');

// =============================================================================
// PARSE CLI ARGS
// =============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

// =============================================================================
// MAIN MIGRATION
// =============================================================================

async function migrateAllUsers() {
  console.log('\n' + '='.repeat(60));
  console.log('[migrateAll] Starting bulk migration');
  console.log('='.repeat(60));
  console.log(`[migrateAll] Dry run: ${dryRun}`);
  console.log(`[migrateAll] Limit: ${limit || 'none'}`);
  console.log('');

  // Fetch all users
  console.log('[migrateAll] Fetching all users...');
  let usersQuery = db.collection('users');

  if (limit) {
    usersQuery = usersQuery.limit(limit);
  }

  const usersSnapshot = await usersQuery.get();
  const users = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log(`[migrateAll] Found ${users.length} users to migrate\n`);

  if (dryRun) {
    console.log('[migrateAll] DRY RUN - Users that would be migrated:');
    users.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.id} (${user.displayName || user.firstName || 'Unknown'})`);
    });
    console.log('\n[migrateAll] Run without --dry-run to perform actual migration');
    return;
  }

  // Track results
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  // Migrate each user
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const progress = `[${i + 1}/${users.length}]`;

    try {
      // Check if user already has aiContext
      const existingContext = await db
        .collection('users')
        .doc(user.id)
        .collection('aiContext')
        .doc('current')
        .get();

      if (existingContext.exists) {
        console.log(`${progress} SKIPPING ${user.id} - aiContext already exists`);
        results.skipped.push({ id: user.id, reason: 'already exists' });
        continue;
      }

      console.log(`\n${progress} Migrating ${user.id}...`);
      await migrateUserToAIContext(user.id);
      results.success.push(user.id);
      console.log(`${progress} SUCCESS: ${user.id}`);

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`${progress} FAILED: ${user.id} - ${error.message}`);
      results.failed.push({ id: user.id, error: error.message });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('[migrateAll] MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Total users: ${users.length}`);
  console.log(`  Successful:  ${results.success.length}`);
  console.log(`  Skipped:     ${results.skipped.length}`);
  console.log(`  Failed:      ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n[migrateAll] Failed migrations:');
    results.failed.forEach((f) => {
      console.log(`  - ${f.id}: ${f.error}`);
    });
  }

  console.log('');
}

// Run
migrateAllUsers()
  .then(() => {
    console.log('[migrateAll] Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[migrateAll] Script failed:', error);
    process.exit(1);
  });
