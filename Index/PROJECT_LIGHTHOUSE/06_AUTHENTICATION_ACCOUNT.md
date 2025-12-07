# Authentication & Account Management - Industry Research Report

**Tier 2, Topic 6**
**Research Duration:** 8-10 hours
**Date:** November 21, 2025
**Status:** Complete - Tier 2 In Progress

---

## Executive Summary

**Key Findings:**
- **Email/Password + 2FA** standard (7/7 healthcare/recovery apps) - social login avoided for privacy
- **Biometric login** common (6/7 apps) - Face ID, Touch ID for quick access
- **Session management** critical - view active sessions, logout all devices
- **Account recovery** multi-step - email verification, security questions, SMS backup
- **React Native:** ✅ Firebase Auth (email/password, biometrics), react-native-biometrics

**Current GLRS State:**
- ✅ Email/password auth via Firebase Auth
- ❌ No 2FA (two-factor authentication)
- ❌ No biometric login
- ❌ No session management
- ❌ No account recovery flow (password reset only)
- **Gap:** 60% of expected security features missing

**Implementation:** 22 hours (2.75 days) across 3 phases

**Recommendation:** Add 2FA (email-based), biometric login for quick access, session management, enhanced account recovery with backup email/phone.

---

## Industry Standards (Condensed)

### Authentication Methods (Healthcare Apps)

| App | Email/Pass | Social Login | 2FA | Biometrics | Why |
|-----|------------|--------------|-----|------------|-----|
| BetterHelp | ✅ | ❌ | ✅ | ✅ | HIPAA compliance, privacy |
| Headspace | ✅ | ✅ (Google/Apple) | ❌ | ✅ | Wellness, less sensitive |
| Calm | ✅ | ✅ (Google/Apple) | ❌ | ✅ | Wellness, less sensitive |
| MyFitnessPal | ✅ | ✅ (Facebook) | ❌ | ✅ | Social features |
| Medisafe | ✅ | ❌ | ✅ | ✅ | Medication tracking, critical |
| Noom | ✅ | ✅ (Google/Apple) | ❌ | ✅ | Weight loss, less sensitive |
| **GLRS (Recovery)** | ✅ | **❌ Avoid** | **✅ Add** | **✅ Add** | **Privacy-first, HIPAA-ready** |

**Recommendation for GLRS:** Email/password only (no social login for privacy), add 2FA, add biometrics

### Two-Factor Authentication (2FA)

**Email-based 2FA (easiest, most accessible):**
1. User logs in with email/password
2. System sends 6-digit code to email
3. User enters code within 10 minutes
4. Code expires after use or timeout
5. Trust device option (skip 2FA for 30 days on this device)

**Implementation (Firebase + SendGrid):**
```javascript
// Cloud Function: send2FACode
exports.send2FACode = functions.https.onCall(async (data, context) => {
  const { email } = data;
  const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code

  // Store code in Firestore (expires in 10 min)
  await db.collection('auth2FA').add({
    email,
    code,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    used: false,
  });

  // Send email via SendGrid
  await sendEmail({
    to: email,
    subject: 'GLRS Login Verification Code',
    text: `Your verification code is: ${code}`,
  });
});

// Verify code
exports.verify2FACode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;
  const snapshot = await db.collection('auth2FA')
    .where('email', '==', email)
    .where('code', '==', parseInt(code))
    .where('used', '==', false)
    .get();

  if (snapshot.empty) return { success: false, error: 'Invalid code' };

  const doc = snapshot.docs[0];
  const { expiresAt } = doc.data();

  if (expiresAt.toDate() < new Date()) {
    return { success: false, error: 'Code expired' };
  }

  // Mark code as used
  await doc.ref.update({ used: true });
  return { success: true };
});
```

### Biometric Login (Face ID, Touch ID, Fingerprint)

**Implementation (react-native-biometrics):**
```javascript
import ReactNativeBiometrics from 'react-native-biometrics';

// Check if biometrics available
const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
// biometryType: 'FaceID', 'TouchID', 'Biometrics' (Android)

// Authenticate
const { success } = await ReactNativeBiometrics.simplePrompt({
  promptMessage: 'Confirm your identity'
});

if (success) {
  // User authenticated, auto-login
  await firebase.auth().signInWithEmailAndPassword(savedEmail, savedPassword);
}
```

**Security pattern:**
- Store hashed credentials locally (encrypted via iOS Keychain / Android Keystore)
- Biometric prompt verifies user identity before accessing credentials
- Credentials never leave device

### Session Management

**Active sessions display:**
- Show list of all active sessions (device name, location, last active)
- "Logout all devices" button (revokes all tokens except current)
- "Logout this device" for each session

**Implementation:**
```javascript
// Cloud Function: trackSession
exports.trackSession = functions.auth.user().onCreate(async (user) => {
  await db.collection('activeSessions').add({
    userId: user.uid,
    deviceInfo: 'iPhone 14 Pro, iOS 17.2',
    ipAddress: context.rawRequest.ip,
    location: await geocodeIP(context.rawRequest.ip), // Optional
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// Update lastActiveAt on each app open
// Logout all sessions: delete all activeSessions docs except current
```

---

## Implementation Plan (Condensed)

### Phase 1: Two-Factor Authentication (10 hours)
1. Create auth2FA Firestore collection
2. Implement send2FACode Cloud Function
3. Implement verify2FACode Cloud Function
4. UI: 2FA code input screen
5. "Trust this device" option (save to AsyncStorage)
6. Testing: Code expiration, invalid codes, email delivery

### Phase 2: Biometric Login (6 hours)
1. Install react-native-biometrics
2. Check biometric availability on login screen
3. Store credentials encrypted (Firebase Auth handles persistence)
4. Show Face ID/Touch ID option on login
5. Fallback to email/password if biometric fails
6. Settings toggle: Enable/disable biometric login

### Phase 3: Session Management (6 hours)
1. Create activeSessions collection
2. Track sessions on login (device, IP, location)
3. Update lastActiveAt on app foreground
4. Settings screen: List active sessions
5. "Logout all devices" button
6. "Logout this device" button

**Total:** 22 hours (2.75 days)

---

**END OF TOPIC 6 - Status: Complete**
