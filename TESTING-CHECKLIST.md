# GLRS Lighthouse - Complete Testing Checklist
## Phases 0-5 Integration Testing

---

## PHASE 1: Foundation - Portal Architecture

### Portal Type Detection
- [ ] Navigate to index.html → Verify portal = "full-service"
- [ ] Navigate to consumer.html → Verify portal = "consumer"
- [ ] Navigate to alumni.html → Verify portal = "alumni"
- [ ] Check browser console for correct portal detection

### Admin UI Terminology
- [ ] Login to admin dashboard → Verify "Portal" labels (not "Tenant")
- [ ] Check navigation sidebar → All labels say "Portal"
- [ ] Open settings page → Dropdown says "All Portals (SuperAdmin only)"
- [ ] View audit logs → Column header says "Portal" not "Tenant"
- [ ] Check 15+ updated admin files for UI consistency

### Firestore Queries
- [ ] Create user with tenantId='consumer' → Verify saves correctly
- [ ] Query users by portal → Verify filtering works
- [ ] Switch portal in admin → Verify data updates

---

## PHASE 2: App Store Compliance

### Legal Modals - ALL 3 PORTALS

**Full-Service Portal (index.html)**
- [ ] First launch → DisclaimerModal appears
- [ ] Try to dismiss without checkbox → Alert appears
- [ ] Check checkbox and click Continue → Modal closes
- [ ] Refresh page → Modal does NOT reappear (localStorage check)
- [ ] Click Terms link in footer → LegalModal opens with Terms
- [ ] Click Privacy link → LegalModal opens with Privacy Policy
- [ ] Click Data Handling link → LegalModal opens with data handling
- [ ] Scroll through each document → Verify complete text displays
- [ ] Close modal with X → Modal closes correctly
- [ ] Close modal with button → Modal closes correctly

**Consumer Portal (consumer.html)**
- [ ] Repeat all above tests
- [ ] Verify localStorage key is same across portals

**Alumni Portal (alumni.html)**
- [ ] Repeat all above tests
- [ ] Verify consistent behavior

### Crisis Resources Modal

**All 3 Portals:**
- [ ] Click floating 🆘 button (bottom-right) → CrisisModal opens
- [ ] Verify 5 resources display:
  - [ ] 988 Suicide & Crisis Lifeline
  - [ ] Crisis Text Line (741741)
  - [ ] SAMHSA National Helpline
  - [ ] Veterans Crisis Line
  - [ ] 911 Emergency Services
- [ ] Click 988 button → Verify tel: link opens
- [ ] Click Crisis Text button → Verify sms: link opens
- [ ] Test on mobile device → Verify click-to-call works
- [ ] Close modal → Verify closes correctly
- [ ] Button appears on all views (home, tasks, progress, etc.)

### Legal Footer

**All 3 Portals:**
- [ ] Scroll to bottom → Legal footer visible
- [ ] Links properly styled and clickable
- [ ] Copyright notice displays "© 2025 Guiding Light Recovery Services"
- [ ] Footer appears above bottom navigation (70px margin)

---

## PHASE 3: Portal Development

### CONSUMER PORTAL - Subscription Tier System

#### Home View
- [ ] **Free Tier User:**
  - [ ] Subscription card shows "Free" plan
  - [ ] Usage stats show: X / 10 resources, X / 3 check-ins
  - [ ] "⬆️ Upgrade" button visible
  - [ ] Click Upgrade → SubscriptionManagement modal opens
  - [ ] Coach info card NOT visible
  - [ ] Book Session button NOT visible

- [ ] **Basic Tier User ($15/mo):**
  - [ ] Subscription card shows "Basic" plan
  - [ ] Usage stats show unlimited resources & check-ins
  - [ ] "⚙️ Manage" button visible
  - [ ] Coach info card NOT visible
  - [ ] Book Session button NOT visible

- [ ] **Pro Tier User ($30/mo):**
  - [ ] Subscription card shows "Pro" plan
  - [ ] Usage stats show sessions remaining: X / 2
  - [ ] "📅 Book Coach Session" button visible
  - [ ] Click Book Session → SessionBooking modal opens
  - [ ] Coach info card visible (if assigned)

- [ ] **Premium Tier User ($50/mo):**
  - [ ] Subscription card shows "Premium" plan
  - [ ] Sessions remaining: X / 4
  - [ ] All Pro features + Google Calendar integration

#### Subscription Management Modal
- [ ] Open modal → 4 tiers display (Free, Basic, Pro, Premium)
- [ ] Each tier shows price, features list
- [ ] Current tier highlighted with "Current Plan"
- [ ] Click upgrade/downgrade → Alert confirms (placeholder)
- [ ] Usage stats section shows current usage
- [ ] Close modal with X → Closes correctly

#### Session Booking Modal (Pro/Premium only)
- [ ] **Free/Basic attempting access:**
  - [ ] Alert: "Session booking only for Pro/Premium"

- [ ] **Pro/Premium with sessions available:**
  - [ ] Select date picker → Future dates selectable
  - [ ] Select time slot → Highlights selection
  - [ ] Choose video/phone type → Toggles correctly
  - [ ] Click Book → Session added to list
  - [ ] Upcoming sessions list displays
  - [ ] Sessions remaining counter decrements

- [ ] **Monthly limit reached:**
  - [ ] Alert: "Reached monthly session limit"
  - [ ] Shows reset date (1st of next month)

#### Tasks View
- [ ] **All tiers:**
  - [ ] Blue info banner displays consumer portal message
  - [ ] "Create your own goals" text visible
  - [ ] Daily check-ins accessible

- [ ] **Free/Basic:**
  - [ ] Upgrade prompt for "coach-assigned goals"
  - [ ] "View Plans" link opens subscription modal

- [ ] **Pro/Premium:**
  - [ ] Message: "Your coach can review goals during sessions"

#### Progress View
- [ ] **Free Tier:**
  - [ ] Yellow warning banner displays
  - [ ] Message: "Viewing last 7 days only"
  - [ ] "Upgrade Now" link works
  - [ ] Charts show limited data

- [ ] **Basic+:**
  - [ ] No warning banner
  - [ ] Full history available
  - [ ] Export data button works

#### Connect View (Community)
- [ ] **Free Tier:**
  - [ ] Orange notice: "Read-only access"
  - [ ] Cannot post messages (disabled)
  - [ ] Can view messages
  - [ ] "Upgrade Now" link works

- [ ] **Basic+:**
  - [ ] No restriction notice
  - [ ] Can post messages
  - [ ] Full community features

#### Resources View
- [ ] **Free Tier:**
  - [ ] Blue banner shows: "X resource views remaining (10 total)"
  - [ ] Counter decrements on view
  - [ ] At 10 views: blocked with upgrade prompt

- [ ] **Basic+:**
  - [ ] No usage banner
  - [ ] Unlimited views
  - [ ] No counter

### ALUMNI PORTAL - Expiration & Re-enrollment

#### Expiration Banner (Top of Portal)
- [ ] **90+ days remaining:**
  - [ ] Green banner displays
  - [ ] Message: "You have X days of complimentary alumni access"
  - [ ] "View Options" button visible

- [ ] **30-89 days:**
  - [ ] Yellow banner
  - [ ] Message: "X days remaining on your free alumni access"

- [ ] **7-29 days:**
  - [ ] Orange banner
  - [ ] Warning message

- [ ] **< 7 days:**
  - [ ] Red banner with PULSING animation
  - [ ] Urgent message: "Only X days left!"

- [ ] **Day 0:**
  - [ ] Critical red banner
  - [ ] "Your alumni access expires TODAY!"

- [ ] **Negative days (expired):**
  - [ ] Redirect to alumni-expired.html (if implemented)
  - [ ] OR show re-enrollment-only view

#### Home View
- [ ] Alumni welcome card displays (purple gradient)
- [ ] Icon: 🎓
- [ ] Heading: "Alumni Portal - Congratulations on Your Journey!"
- [ ] Description explains optional check-ins
- [ ] Days remaining widget shows countdown
- [ ] "View Options" button opens ReEnrollModal
- [ ] NO coach info card (removed)
- [ ] Daily check-ins marked as OPTIONAL

#### Re-Enrollment Modal
- [ ] Modal opens on "View Options" click
- [ ] Header: gradient background
- [ ] 5 enrollment pathways display:
  - [ ] Full-Service Program ($650-1000/mo)
  - [ ] Consumer Premium ($50/mo)
  - [ ] Consumer Pro ($30/mo)
  - [ ] Consumer Basic ($15/mo)
  - [ ] Alumni Extension ($5/mo)
- [ ] Each option shows:
  - [ ] Icon, name, price
  - [ ] Feature list with checkmarks
  - [ ] "Enroll Now" / "Extend Access" button
- [ ] Hover effect: card lifts with shadow
- [ ] Click option → Alert confirms (placeholder)
- [ ] Contact info at bottom
- [ ] Close button works

#### Alumni Features Retained
- [ ] Sobriety counter continues tracking
- [ ] Optional check-ins work (not required)
- [ ] Community access (alumni rooms)
- [ ] Resource library full access
- [ ] Progress history read-only
- [ ] Support groups visible
- [ ] Milestone tracking continues

---

## PHASE 4: Admin Dashboard

### Consumer Admin Pages

#### consumer-dashboard.html
- [ ] Navigate to /admin/consumer-dashboard.html
- [ ] Login required → Redirects if not authenticated
- [ ] Dashboard loads successfully
- [ ] Stats cards display:
  - [ ] Total Users
  - [ ] Free Tier count
  - [ ] Basic Tier count
  - [ ] Pro Tier count
  - [ ] Premium Tier count
  - [ ] Monthly Revenue (calculated)
- [ ] Tier distribution bar chart displays
- [ ] Recent users table shows 10 users
- [ ] Tier badges color-coded correctly
- [ ] Quick action links work:
  - [ ] Manage Subscriptions
  - [ ] View Sessions
  - [ ] View Analytics
  - [ ] All Users

#### consumer-subscriptions.html
- [ ] Page loads successfully
- [ ] Filters users by tenantId='consumer'
- [ ] User list displays with subscription info
- [ ] Can view/edit user tier (TODO: full CRUD)

#### consumer-sessions.html
- [ ] Page loads successfully
- [ ] Shows booked sessions for Pro/Premium users
- [ ] Calendar view (TODO: full implementation)

#### consumer-analytics.html
- [ ] Page loads successfully
- [ ] Shows usage metrics
- [ ] Conversion funnel data (TODO: charts)

### Alumni Admin Pages

#### alumni-dashboard.html
- [ ] Navigate to /admin/alumni-dashboard.html
- [ ] Dashboard loads successfully
- [ ] Shows alumni count by expiration status:
  - [ ] Expired
  - [ ] < 7 days
  - [ ] 7-30 days
  - [ ] 30-90 days
  - [ ] 90+ days

#### alumni-management.html
- [ ] Page loads successfully
- [ ] Alumni list with expiration dates
- [ ] Can extend access (TODO: implementation)
- [ ] Can manually expire access

#### alumni-re-enrollment.html
- [ ] Page loads successfully
- [ ] Shows re-enrollment conversions
- [ ] Tracks which pathway chosen
- [ ] Revenue from re-enrollments

### Navigation Integration
- [ ] Portal switcher shows consumer pages when on consumer portal
- [ ] Portal switcher shows alumni pages when on alumni portal
- [ ] Pages hidden for unauthorized roles
- [ ] Breadcrumbs show correct portal context

---

## PHASE 5: Encryption System

### Setup & Initialization

#### Browser Compatibility
- [ ] Check `window.crypto.subtle` exists
- [ ] Test on Chrome (37+)
- [ ] Test on Firefox (34+)
- [ ] Test on Safari (11+)
- [ ] Test on mobile browsers
- [ ] Fallback message if unsupported

#### Library Loading
- [ ] Add `<script src="/encryption.js"></script>` to portal HTML
- [ ] Verify console message: "✅ GLRS Encryption System Loaded"
- [ ] `window.GLRSEncryption` available
- [ ] `window.EncryptedFieldManager` available

### Signup Flow with Encryption

- [ ] **Create new account:**
  - [ ] Enter strong password (12+ chars, mixed case, numbers, symbols)
  - [ ] System derives encryption key (PBKDF2, 100k iterations)
  - [ ] Takes ~100-200ms (acceptable delay)
  - [ ] Sensitive fields encrypted before save
  - [ ] `_encryptedFields` array saved to Firestore
  - [ ] `_encryptionVersion: 1` saved
  - [ ] `_encryptedAt` timestamp saved

- [ ] **Recovery key generation:**
  - [ ] Modal displays 24-word recovery key
  - [ ] Words displayed in grid format
  - [ ] Checkboxes: "I have written down" + "I understand"
  - [ ] Cannot proceed without both checkboxes
  - [ ] Recovery key hash saved to database
  - [ ] Plaintext recovery key NOT saved (only hash)

- [ ] **Encrypted field storage:**
  - [ ] Check Firestore document
  - [ ] Encrypted fields look like: `{ciphertext: "base64", iv: "base64"}`
  - [ ] No plaintext visible in database
  - [ ] Different users have different ciphertexts (unique IVs)

### Login Flow with Decryption

- [ ] **Login with password:**
  - [ ] Enter correct password
  - [ ] System derives same encryption key
  - [ ] Takes ~100-200ms
  - [ ] Fetches encrypted data from Firestore
  - [ ] Decrypts all `_encryptedFields`
  - [ ] Takes ~50-100ms for full profile
  - [ ] Plaintext displayed in UI
  - [ ] Total login delay ~150-300ms (acceptable)

- [ ] **Wrong password:**
  - [ ] Decryption fails gracefully
  - [ ] Error message: "Decryption failed - wrong password?"
  - [ ] Data not corrupted
  - [ ] Can retry with correct password

### Field-Level Encryption

#### Priority 1 Fields (Always Encrypted)
- [ ] emergencyContactName → encrypted
- [ ] emergencyContactPhone → encrypted
- [ ] emergencyContactRelation → encrypted
- [ ] substanceHistory → encrypted
- [ ] medicalConditions → encrypted
- [ ] medications → encrypted
- [ ] therapistName → encrypted
- [ ] therapistContact → encrypted

#### Priority 2 Fields (Encrypted by Default)
- [ ] address → encrypted
- [ ] phoneNumber → encrypted
- [ ] dateOfBirth → encrypted
- [ ] ssn → encrypted
- [ ] insuranceInfo → encrypted
- [ ] employmentInfo → encrypted
- [ ] familyHistory → encrypted

#### Priority 3 Fields (User Preference)
- [ ] journalEntries → encrypted (if enabled)
- [ ] progressNotes → encrypted (if enabled)
- [ ] goalDetails → encrypted (if enabled)
- [ ] checkInNotes → encrypted (if enabled)
- [ ] messageContent → encrypted (if enabled)
- [ ] communityPosts → encrypted (if enabled)

### Data Updates with Encryption

- [ ] **Update encrypted field:**
  - [ ] Edit emergency contact
  - [ ] System encrypts new value
  - [ ] Generates NEW unique IV
  - [ ] Saves to Firestore
  - [ ] Old ciphertext replaced
  - [ ] Can decrypt new value

- [ ] **Update non-encrypted field:**
  - [ ] Edit non-sensitive field (e.g., displayName)
  - [ ] Saves as plaintext (no encryption overhead)

### Recovery Key System

#### Recovery Key Display
- [ ] Modal shows 24 words
- [ ] Words from BIP39-compatible wordlist
- [ ] Unique per user
- [ ] Can regenerate if first attempt lost (only during signup)

#### Password Reset with Recovery Key
- [ ] Click "Forgot Password"
- [ ] Enter recovery key (24 words)
- [ ] System validates recovery key hash
- [ ] **Valid key:**
  - [ ] Prompts for new password
  - [ ] Decrypts data with recovery key
  - [ ] Re-encrypts with new password-derived key
  - [ ] Saves re-encrypted data
  - [ ] Login with new password works

- [ ] **Invalid key:**
  - [ ] Error: "Invalid recovery key"
  - [ ] Data remains encrypted
  - [ ] No decryption attempted

#### Lost Recovery Key & Password
- [ ] User has neither password nor recovery key
- [ ] Data is UNRECOVERABLE (expected behavior)
- [ ] Warning displayed during signup
- [ ] Account can be deleted, but data cannot be decrypted

### Security Tests

#### Ciphertext Uniqueness
- [ ] Encrypt same plaintext twice → different ciphertexts
- [ ] Reason: unique IV each time
- [ ] Prevents pattern analysis

#### Server-Side Verification
- [ ] Inspect Firestore database
- [ ] NO plaintext visible for encrypted fields
- [ ] Only ciphertext + IV stored
- [ ] Even admin cannot decrypt without user password

#### Key Leakage Prevention
- [ ] Check browser console → No keys logged
- [ ] Check network tab → Keys not transmitted
- [ ] Check localStorage → Keys not stored
- [ ] Keys only in memory during session
- [ ] Keys cleared on logout

#### Concurrent Encryption
- [ ] Open 2 tabs with same user
- [ ] Update encrypted field in tab 1
- [ ] Refresh tab 2 → New data loads
- [ ] No key conflicts

### Performance Tests

#### Login Performance
- [ ] Measure login time without encryption
- [ ] Measure login time with encryption
- [ ] Overhead: ~150-300ms (acceptable)

#### Profile Update Performance
- [ ] Update single encrypted field → ~5-10ms
- [ ] Update multiple encrypted fields → ~50-100ms
- [ ] User experience: no noticeable delay

#### Large Dataset
- [ ] Test with 100+ encrypted fields
- [ ] Measure encryption time
- [ ] Measure decryption time
- [ ] Should complete in <1 second

#### Mobile Performance
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Slower crypto operations expected
- [ ] Still <500ms acceptable

### Edge Cases

#### Session Timeout
- [ ] User inactive for 30 min
- [ ] Session expires
- [ ] Key cleared from memory
- [ ] Must re-login to decrypt

#### Browser Crash
- [ ] Simulate crash (close tab suddenly)
- [ ] Reopen portal
- [ ] Data still encrypted in Firestore
- [ ] Login required to decrypt

#### Corrupted Ciphertext
- [ ] Manually corrupt ciphertext in Firestore
- [ ] Attempt to decrypt
- [ ] Error handled gracefully
- [ ] User notified of corruption
- [ ] Other fields still decryptable

#### Migration from Unencrypted
- [ ] Existing user with plaintext data
- [ ] Enable encryption
- [ ] System encrypts existing data
- [ ] Generate recovery key
- [ ] Verify all data encrypted
- [ ] Can still decrypt and use

---

## CROSS-PHASE INTEGRATION TESTS

### Portal Switching
- [ ] **Admin switches from Full-Service to Consumer:**
  - [ ] Navigation updates
  - [ ] Consumer admin pages visible
  - [ ] Data filtered correctly
  - [ ] Tier badges display

- [ ] **Admin switches to Alumni:**
  - [ ] Alumni admin pages visible
  - [ ] Expiration dates display
  - [ ] Re-enrollment tracking visible

### User Journey: Full-Service → Alumni → Consumer

- [ ] **Start as Full-Service PIR:**
  - [ ] index.html portal
  - [ ] Assigned coach visible
  - [ ] All features enabled
  - [ ] Daily check-ins required

- [ ] **Graduate to Alumni:**
  - [ ] Admin changes role to alumni
  - [ ] User redirected to alumni.html
  - [ ] Expiration banner appears
  - [ ] Check-ins become optional
  - [ ] Coach card removed

- [ ] **Re-enroll as Consumer Pro:**
  - [ ] Click re-enrollment option
  - [ ] Select Consumer Pro ($30/mo)
  - [ ] Redirected to consumer.html
  - [ ] Tier = pro
  - [ ] 2 sessions available
  - [ ] Book session feature enabled

### End-to-End with Encryption

- [ ] **Signup with encryption:**
  - [ ] Create account
  - [ ] Enable encryption
  - [ ] Save recovery key

- [ ] **Use portal normally:**
  - [ ] Complete check-ins (encrypted notes)
  - [ ] Update profile (encrypted PII)
  - [ ] Post in community (encrypted if enabled)

- [ ] **Logout and login:**
  - [ ] Logout clears keys
  - [ ] Login re-derives key
  - [ ] All data decrypts correctly

- [ ] **Simulate password forgotten:**
  - [ ] Use recovery key to reset
  - [ ] Set new password
  - [ ] Login with new password
  - [ ] All data still accessible

### Compliance Checks

#### HIPAA Compliance
- [ ] Data encrypted at rest (AES-256)
- [ ] Data encrypted in transit (HTTPS)
- [ ] Access controls via authentication
- [ ] Audit logging of sensitive data access
- [ ] BAA with Firebase/cloud provider

#### GDPR Compliance
- [ ] User can export all data
- [ ] User can delete all data
- [ ] Privacy policy displayed
- [ ] Data handling transparency
- [ ] Right to erasure implemented

#### App Store Requirements
- [ ] Legal disclaimers present
- [ ] Crisis resources accessible
- [ ] Privacy policy linked
- [ ] Terms of service linked
- [ ] Age verification (if needed)

---

## REGRESSION TESTING

After all phases complete, re-test core features:

### Basic Portal Functions
- [ ] User signup works
- [ ] User login works
- [ ] User logout works
- [ ] Profile editing works
- [ ] Check-ins work
- [ ] Goals/tasks work
- [ ] Community chat works
- [ ] Resources work
- [ ] Notifications work

### Admin Portal Functions
- [ ] Admin login works
- [ ] User management works
- [ ] Dashboard displays
- [ ] Reports generate
- [ ] Settings save
- [ ] Audit logs visible

### Mobile Responsiveness
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] All portals responsive
- [ ] Modals display correctly
- [ ] Navigation usable

---

## AUTOMATED TESTING (Recommended)

### Unit Tests
```javascript
// Example test structure
describe('GLRSEncryption', () => {
  test('encrypts and decrypts data', async () => {
    const crypto = new GLRSEncryption();
    const key = await crypto.generateKey('password', 'salt');
    const encrypted = await crypto.encrypt('sensitive data', key);
    const decrypted = await crypto.decrypt(encrypted, key);
    expect(decrypted).toBe('sensitive data');
  });
});
```

### Integration Tests
- [ ] Cypress tests for user flows
- [ ] Jest tests for React components
- [ ] Firebase emulator tests
- [ ] End-to-end portal switching

### Performance Tests
- [ ] Lighthouse scores for all portals
- [ ] Load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Encryption overhead < 500ms

---

## TESTING TOOLS NEEDED

- [ ] Firebase Emulator Suite (local testing)
- [ ] Chrome DevTools (debugging)
- [ ] React DevTools (component inspection)
- [ ] Network Inspector (API monitoring)
- [ ] Browser Console (error checking)
- [ ] Mobile device simulators
- [ ] Real mobile devices (iOS + Android)
- [ ] Postman (API testing)
- [ ] Firestore Console (data verification)

---

## TESTING SIGN-OFF

| Phase | Tested By | Date | Status | Notes |
|-------|-----------|------|--------|-------|
| Phase 1: Foundation | | | ⏳ | |
| Phase 2: Compliance | | | ⏳ | |
| Phase 3: Portals | | | ⏳ | |
| Phase 4: Admin | | | ⏳ | |
| Phase 5: Encryption | | | ⏳ | |

**Test Coverage:** ____%  
**Critical Issues:** ___  
**Medium Issues:** ___  
**Minor Issues:** ___  

**Ready for Production:** ☐ Yes ☐ No

---

*Testing Checklist Version: 1.0*  
*Last Updated: 2025*  
*Total Test Cases: 200+*
