# Data Export & GDPR Compliance - Industry Research Report

**Tier 2, Topic 7**
**Research Duration:** 8-10 hours
**Date:** November 21, 2025
**Status:** Complete - Tier 2 In Progress

---

## Executive Summary

**Key Findings:**
- **GDPR "Right to Data Portability"** requires machine-readable export (JSON preferred)
- **HIPAA** (if handling health data) requires secure data access logs
- **Export formats:** JSON (developer-friendly), CSV (Excel-compatible), PDF (human-readable)
- **Processing time:** Instant for < 1MB, async for > 1MB (email link when ready)
- **React Native:** ✅ react-native-fs + react-native-share for file download/share

**Current GLRS State:**
- ❌ "Export Data" placeholder in ProfileTab
- ❌ No data export functionality
- ❌ No GDPR compliance features
- ❌ No data deletion (permanent account deletion)
- **Legal Risk:** GDPR fines up to €20M or 4% revenue (whichever higher)

**Implementation:** 18 hours (2.25 days) across 2 phases

**Recommendation:** Implement async data export (JSON + CSV), email delivery, 7-day link expiry, 30-day deletion grace period, audit log all data access.

---

## Industry Standards (Condensed)

### GDPR Requirements

**Right to Data Portability (Article 20):**
- User can request all personal data in machine-readable format
- Must include: profile data, check-ins, goals, reflections, messages, community posts
- Format: JSON or CSV
- Delivery: Download link (email) or in-app download
- Timeline: Within 30 days (sooner better)

**Right to Erasure (Article 17 - "Right to be Forgotten"):**
- User can request permanent deletion
- Grace period: 30 days (allow account recovery)
- Hard delete after grace period (remove from all databases, backups)
- Exceptions: Legal obligations (e.g., court order), legitimate interests

### Export Patterns (from Facebook, Google Takeout, Instagram)

**Google Takeout pattern:**
1. User requests export
2. Background job processes data (can take hours/days for large accounts)
3. Email sent when export ready: "Your data is ready to download"
4. Link expires in 7 days
5. Multiple downloads allowed within 7 days
6. File deleted after expiry

**Implementation:**
```javascript
// Cloud Function: generateDataExport
exports.generateDataExport = functions.https.onCall(async (data, context) => {
  const userId = context.auth.uid;

  // Create export request
  const exportDoc = await db.collection('dataExports').add({
    userId,
    status: 'pending',
    requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    format: data.format || 'json', // 'json', 'csv', 'pdf'
  });

  // Trigger background job
  await db.collection('exportQueue').add({
    exportId: exportDoc.id,
    userId,
  });

  return { exportId: exportDoc.id };
});

// Background Cloud Function: processDataExport
exports.processDataExport = functions.firestore
  .document('exportQueue/{queueId}')
  .onCreate(async (snap, context) => {
    const { exportId, userId } = snap.data();

    // Update status to 'processing'
    await db.collection('dataExports').doc(exportId).update({ status: 'processing' });

    // Gather all user data
    const userData = await gatherAllUserData(userId);

    // Generate file
    const jsonData = JSON.stringify(userData, null, 2);
    const fileName = `glrs-export-${userId}-${Date.now()}.json`;
    const filePath = `exports/${fileName}`;

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    await file.save(jsonData, { contentType: 'application/json' });

    // Generate signed URL (expires in 7 days)
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Update export doc
    await db.collection('dataExports').doc(exportId).update({
      status: 'ready',
      fileUrl: url,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Send email notification
    await sendEmail({
      to: userData.email,
      subject: 'Your GLRS data export is ready',
      html: `Your data export is ready to download: <a href="${url}">Download</a> (expires in 7 days)`,
    });

    // Delete queue item
    await snap.ref.delete();
  });
```

### Data Deletion Pattern

**30-Day Grace Period (Best Practice):**
1. User requests account deletion
2. Account marked as `status: 'deleted'`, `deletedAt: timestamp`
3. User cannot login (show "Account scheduled for deletion" message)
4. Recovery option: "Cancel deletion" button in email sent immediately
5. After 30 days: Cloud Function permanently deletes all user data
6. Includes: Firestore docs, Firebase Auth account, Storage files

**Implementation:**
```javascript
// Soft delete (immediate)
exports.deleteAccount = functions.https.onCall(async (data, context) => {
  const userId = context.auth.uid;

  await db.collection('users').doc(userId).update({
    status: 'deleted',
    deletedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send confirmation email with recovery link
  await sendEmail({
    subject: 'GLRS Account Deletion Scheduled',
    html: 'Your account will be permanently deleted in 30 days. <a href="...">Cancel deletion</a>',
  });
});

// Hard delete (after 30 days)
exports.permanentlyDeleteAccounts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('users')
      .where('status', '==', 'deleted')
      .where('deletedAt', '<=', threshold)
      .get();

    for (const doc of snapshot.docs) {
      const userId = doc.id;

      // Delete all Firestore data
      await deleteUserData(userId); // Helper function

      // Delete Firebase Auth account
      await admin.auth().deleteUser(userId);

      // Delete Storage files
      const bucket = admin.storage().bucket();
      await bucket.deleteFiles({ prefix: `users/${userId}/` });
    }
  });
```

---

## Implementation Plan (Condensed)

### Phase 1: Data Export (12 hours)
1. Create dataExports collection
2. Implement generateDataExport Cloud Function
3. Implement processDataExport background job
4. UI: "Download My Data" button in Settings
5. Export status screen: "Processing... 45% complete"
6. Email notification with download link
7. Test with large accounts (1000+ check-ins)

### Phase 2: Account Deletion (6 hours)
1. Soft delete logic (mark account as deleted)
2. 30-day grace period with recovery link
3. Hard delete Cloud Function (runs daily)
4. Delete Firestore data, Auth account, Storage files
5. UI: "Delete Account" confirmation (type "DELETE" to confirm)
6. Email confirmation with recovery instructions

**Total:** 18 hours (2.25 days)

---

**END OF TOPIC 7 - Status: Complete**
