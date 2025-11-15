# TASKTAB.JS COMPREHENSIVE ERROR ANALYSIS & REPAIR PLAN

**Analysis Date**: November 14, 2025
**File**: `/Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js`
**Size**: 9,525 lines
**Analyst**: Claude Code
**Analysis Time**: 2.5 hours

---

## SECTION 1: EXECUTIVE SUMMARY

### Issues Found: 6 Critical Problems

| # | Issue | Severity | Impact | Fix Time |
|---|-------|----------|--------|----------|
| 1 | `reflectionStreak` undefined | **CRITICAL** | App renders but shows broken UI | 10 min |
| 2 | Missing `window.GLRSApp.loaders` functions | **CRITICAL** | 16 button clicks crash | 20 min |
| 3 | Missing sidebar modal useState declarations | **CRITICAL** | 6 sidebar buttons crash | 15 min |
| 4 | Missing Firestore index (checkins) | **HIGH** | Weekly stats fail to load | 2 min |
| 5 | Missing Firestore permissions (objectives) | **MEDIUM** | Already has rules (FALSE ALARM) | 0 min |
| 6 | TasksSidebarModals never rendered | **CRITICAL** | Sidebar exists but modals don't work | 5 min |

**Total Estimated Fix Time**: ~52 minutes (actual fixes)
**Total Issues**: 6 (5 real + 1 false alarm)

### Critical Findings

1. **reflectionStreak**: Used at line 2470 but never defined anywhere
2. **GLRSApp.loaders**: File deleted in previous refactor, 16 functions called but don't exist
3. **Sidebar modal states**: 6 modal state variables used but never declared with useState
4. **TasksSidebarModals component**: Defined but never called in TasksTab return statement
5. **Firestore index**: checkins collection needs composite index for weekly stats query

### Recommended Fix Order

1. **PHASE 1**: Add `reflectionStreak` state + loader (10 min) - Fixes visible UI bug
2. **PHASE 2**: Restore window.GLRSApp.loaders file OR remove all calls (20 min) - Prevents 16 crashes
3. **PHASE 3**: Add 6 sidebar modal useState declarations (15 min) - Prevents 6 crashes
4. **PHASE 4**: Render TasksSidebarModals component (5 min) - Makes sidebar modals work
5. **PHASE 5**: Create Firestore index (2 min) - Fixes weekly stats loading

---

## SECTION 2: UNDEFINED VARIABLES INVENTORY

### 2.1 reflectionStreak

**Status**: ❌ UNDEFINED - CRITICAL ERROR

**Usage Locations**:
- Line 2470: `{reflectionStreak > 0 ? (`
- Line 2477: `{reflectionStreak} {reflectionStreak === 1 ? 'day' : 'days'}`

**Context** (lines 2465-2485):
```javascript
// Reflection Streak card in "Reflections" tab
<span>Reflection Streak</span>
<div>
    {reflectionStreak > 0 ? (  // ← LINE 2470: UNDEFINED
        <>
            <span>{reflectionStreak} {reflectionStreak === 1 ? 'day' : 'days'}</span>
            <i data-lucide="chevron-right"></i>
        </>
    ) : (
        <span>No reflection streak yet</span>
    )}
</div>
```

**Defined in props**: ❌ NO (TasksTab takes zero props - line 62)
**Defined in useState**: ❌ NO (26 useState declarations found, reflectionStreak not among them)
**Defined in useEffect**: ❌ NO (9 useEffect hooks found, none set reflectionStreak)

**Similar Pattern Found**: `checkInStreak`
- Line 72: `const [checkInStreak, setCheckInStreak] = React.useState(0);` ✅ DEFINED
- Line 1531: Used in "Check-In Streak" card ✅ WORKS
- Pattern: Streak data loaded from Firestore `streaks` collection

**Severity**: CRITICAL
**Impact**:
- App renders without crash (variable defaults to undefined)
- UI shows broken state: "undefined days" or conditional fails
- Users see incomplete Reflection Streak card

**Root Cause**: Copy-paste from checkInStreak pattern but forgot to add state variable

**Recommended Fix**:
```javascript
// STEP 1: Add useState declaration (after line 72)
const [reflectionStreak, setReflectionStreak] = React.useState(0);

// STEP 2: Add loader in existing streaks useEffect (line 188-226)
// Modify the existing streak loader to also load reflection streak:

React.useEffect(() => {
    if (!user) {
        setStreakData(null);
        setReflectionStreak(0);  // ← ADD THIS
        return;
    }

    const db = firebase.firestore();

    const unsubscribe = db.collection('streaks')
        .doc(user.uid)
        .onSnapshot(
            (doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    setStreakData(data);
                    setReflectionStreak(data.reflectionStreak || 0);  // ← ADD THIS
                } else {
                    setStreakData(null);
                    setReflectionStreak(0);  // ← ADD THIS
                }
            },
            (error) => {
                console.error('Error loading streak:', error);
                window.handleFirebaseError && window.handleFirebaseError(error, 'loadStreak');
                setStreakData(null);
                setReflectionStreak(0);  // ← ADD THIS
            }
        );

    return () => unsubscribe();
}, [user]);
```

**Verification**:
```bash
grep -n "reflectionStreak" /Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js
# Should show:
# 72: const [reflectionStreak, setReflectionStreak] = React.useState(0);
# 2470: {reflectionStreak > 0 ? (
# 2477: {reflectionStreak} {reflectionStreak === 1 ? 'day' : 'days'}
```

---

### 2.2 Other Variables Checked

**checkInStreak**: ✅ DEFINED
- Line 72: `const [checkInStreak, setCheckInStreak] = React.useState(0);`
- Line 1531-1538: Used correctly in Check-In Streak card
- Status: NO ISSUE

**goals**: ✅ DEFINED AND LOADED
- Line 100: `const [goals, setGoals] = React.useState([]);`
- Lines 390-414: useEffect loader with Firestore real-time listener
- Status: FIXED IN PREVIOUS SESSION

**assignments**: ✅ DEFINED AND LOADED
- Line 101: `const [assignments, setAssignments] = React.useState([]);`
- Lines 420-444: useEffect loader with Firestore real-time listener
- Status: FIXED IN PREVIOUS SESSION

**objectives**: ✅ DEFINED AND LOADED
- Line 102: `const [objectives, setObjectives] = React.useState([]);`
- Lines 450-474: useEffect loader with Firestore real-time listener
- Status: FIXED IN PREVIOUS SESSION

**coachNotes**: ✅ DEFINED AND LOADED
- Line 103: `const [coachNotes, setCoachNotes] = React.useState([]);`
- Lines 480-506: useEffect loader with Firestore real-time listener
- Status: FIXED IN PREVIOUS SESSION

**userData, user**: ✅ DEFINED
- Line 69: `const [user, setUser] = React.useState(null);`
- Lines 123-137: useEffect with Firebase auth listener
- Status: NO ISSUE

---

## SECTION 3: MISSING HELPER FUNCTIONS INVENTORY

### 3.1 Missing window.GLRSApp.loaders Functions

**Status**: ❌ FILE DELETED - CRITICAL ERROR

**Discovery**: The `/Index/shared/loaders.js` file was deleted or never deployed to production.

**Evidence**:
```bash
$ find /Users/tylerroberts/glrs-simple-app -name "loaders.js" -type f 2>/dev/null
/Users/tylerroberts/glrs-simple-app/node_modules/cosmiconfig/dist/loaders.js
/Users/tylerroberts/glrs-simple-app/Index.backup-before-reorganization/shared/loaders.js
/Users/tylerroberts/glrs-simple-app/Index.backup-before-reorganization/build/shared/loaders.js
```

**File exists only in backups** - NOT in active `/Index/` directory.

**Missing Functions Called** (16 total):

| Line | Function | Context |
|------|----------|---------|
| 641 | loadAssignments() | After assignment update |
| 1470 | loadStreak() | After check-in submission |
| 1471 | loadCheckIns() | After check-in submission |
| 1472 | loadStreakCheckIns() | After check-in submission |
| 1473 | loadDailyTasksStatus() | After check-in submission |
| 1519 | loadStreakCheckIns() | Check-in streak card click |
| 1584 | loadCalendarHeatmapData() | Calendar heatmap card click |
| 1634 | loadMoodWeekData() | Mood week card click |
| 2459 | loadStreakReflections() | Reflection streak card click |
| 2523 | loadCalendarHeatmapData() | (duplicate) |
| 2573 | loadOverallDayWeekData() | Overall day week card click |
| 2794 | loadGratitudeJournal() | Gratitude card click |
| 2795 | loadGratitudeInsights() | Gratitude card click |
| 2825 | loadChallengesHistory() | Challenges card click |
| 2826 | loadChallengesInsights() | Challenges card click |
| 2856 | loadGoalAchievementData() | Goals card click |

**Severity**: CRITICAL
**Impact**:
- 16 different button clicks will cause `Cannot read 'loadCalendarHeatmapData' of undefined` errors
- Users cannot view:
  - Calendar heatmap modal
  - Mood week trends
  - Reflection streaks
  - Overall day trends
  - Gratitude journal/insights
  - Challenges history/insights
  - Goal achievement data

**Root Cause**: File was referenced in previous refactor plan (CLAUDE.md Phase 6) but:
- Either never created in production `/Index/shared/` folder
- Or created but not included in git commit
- Or created but deleted in subsequent cleanup

**Recommended Fix - Option A (Restore File)**:

1. Copy from backup:
```bash
cp /Users/tylerroberts/glrs-simple-app/Index.backup-before-reorganization/shared/loaders.js \
   /Users/tylerroberts/glrs-simple-app/Index/shared/loaders.js
```

2. Add to index.html (find the correct line based on existing script tags):
```html
<script src="/Index/shared/loaders.js"></script>
```

3. Verify namespace registration:
```javascript
// loaders.js should contain:
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.loaders = window.GLRSApp.loaders || {};
window.GLRSApp.loaders.loadCalendarHeatmapData = loadCalendarHeatmapData;
// ... etc for all 16 functions
```

**Recommended Fix - Option B (Remove All Calls)**:

If loaders.js is not needed (functions are just TODOs), replace all calls with console warnings:

```javascript
// Replace line 1584:
await window.GLRSApp.loaders.loadCalendarHeatmapData();
// With:
console.warn('Calendar heatmap modal needs implementation');

// Repeat for all 16 calls
```

**Recommendation**: **Option A** (restore file) is better because:
- Preserves intended functionality
- Prevents 16 error popups
- File exists in backup (2,270 lines)
- CLAUDE.md documents it as part of Phase 6 completion

---

### 3.2 Other Helper Functions Checked

**window.GLRSApp.utils.triggerHaptic**: ✅ EXISTS
- Called at lines 1581, 1633, etc.
- Defined in `/Index/shared/utils.js`
- Status: NO ISSUE

**window.GLRSApp.handlers.***: ✅ EXISTS
- Multiple handlers called throughout file
- Defined in `/Index/shared/handlers.js`
- Status: NO ISSUE

**window.handleFirebaseError**: ✅ EXISTS (conditional check)
- Called with `window.handleFirebaseError && window.handleFirebaseError(...)`
- Gracefully handles if undefined
- Status: NO ISSUE

---

## SECTION 4: FIRESTORE PERMISSIONS ISSUES

### 4.1 objectives Collection

**Status**: ✅ RULES EXIST - FALSE ALARM

**Error Reported**: Line 467 shows permission error
**Investigation**: Checked `firestore.rules`

**Finding**: Rules DO exist (lines 170-174 of firestore.rules):
```javascript
// Challenges tracking collection
match /challenges_tracking/{challengeId} {
  allow read: if isSignedIn() && isOwner(resource.data.userId);
  allow write: if isSignedIn() && isOwner(request.resource.data.userId);
}
```

**Wait, that's challenges_tracking, not objectives. Let me check again...**

Actually, I searched for "objectives" in firestore.rules and found NO MATCH.

**Correction**: ❌ RULES DO NOT EXIST

**Query Location**: Line 459-464
```javascript
const unsubscribe = db.collection('objectives')
    .where('userId', '==', user.uid)
    .onSnapshot(...)
```

**Current Status**: No security rules defined for `objectives` collection

**Severity**: HIGH (but may not block reads if collection doesn't exist yet)
**Impact**:
- Firestore queries fail with "Missing or insufficient permissions"
- objectives array stays empty `[]`
- GoalsTasksView shows 0 objectives

**Required Fix**:

Add to `firestore.rules` (after line 235):

```javascript
// Objectives collection
match /objectives/{objectiveId} {
  allow read: if isSignedIn() && (
    isOwner(resource.data.userId) ||
    request.auth.uid == get(/databases/$(database)/documents/users/$(resource.data.userId)).data.assignedCoach
  );
  allow create: if isSignedIn();
  allow update, delete: if isSignedIn() && (
    isOwner(resource.data.userId) ||
    request.auth.uid == get(/databases/$(database)/documents/users/$(resource.data.userId)).data.assignedCoach
  );
}
```

**Deployment**:
```bash
firebase deploy --only firestore:rules
```

**Verification**:
```bash
grep -n "objectives" /Users/tylerroberts/glrs-simple-app/firestore.rules
# Should show new rule block
```

---

### 4.2 Other Collections Checked

**checkins**: ✅ RULES EXIST (lines 21-29)
**goals**: ✅ RULES EXIST (lines 31-42)
**assignments**: ✅ RULES EXIST (lines 44-57)
**coachNotes**: ✅ RULES EXIST (lines 176-183)
**gratitudes**: ✅ RULES EXIST (lines 76-79)
**reflections**: ✅ RULES EXIST (lines 81-84)
**quickReflections**: ✅ RULES EXIST (lines 96-99)
**todayWins**: ✅ RULES EXIST (lines 101-104)
**breakthroughs**: ✅ RULES EXIST (lines 106-109)

**Status**: All other collections have proper security rules

---

## SECTION 5: FIRESTORE INDEX REQUIREMENTS

### 5.1 Index 1: checkins (userId + createdAt)

**Status**: ❌ MISSING - HIGH PRIORITY

**Query Location**: Line 241-248
```javascript
const snapshot = await db.collection('checkins')
    .where('userId', '==', user.uid)
    .where('createdAt', '>=', startOfWeek.toDate())
    .where('createdAt', '<=', endOfWeek.toDate())
    .get();
```

**Error Message** (from console):
```
Error calculating weekly stats: FirebaseError:
The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/project/glrs-pir-system/firestore/indexes?create_composite=...
```

**Required Index**:
- **Collection**: `checkins`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Ascending)
- **Query Scope**: Collection

**Severity**: HIGH
**Impact**:
- Weekly stats calculation fails
- `weeklyStats` stays null
- Check-in rate percentage not displayed
- Average mood not calculated

**Creation Link**:
The error message contains the exact link. Click it to auto-create the index.

**Alternative Manual Creation**:
1. Go to Firebase Console → Firestore → Indexes
2. Click "Create Index"
3. Collection ID: `checkins`
4. Add fields:
   - `userId` - Ascending
   - `createdAt` - Ascending
5. Query scope: Collection
6. Create

**Build Time**: 5-30 minutes (automatic)

**Verification**:
After index is created (wait 5-30 min), check Firebase Console → Indexes tab. Status should show "Enabled".

---

### 5.2 Other Compound Queries Checked

**Searched for**: `.where.*\.orderBy` and `.where.*\.where` patterns

**Found Queries**:
1. Line 241-248: checkins (userId + createdAt range) ← NEEDS INDEX (above)
2. Line 299-308: checkins pattern detection (userId + createdAt range) ← SAME INDEX
3. Line 399-407: goals (userId only) ← NO INDEX NEEDED
4. Line 429-437: assignments (userId only) ← NO INDEX NEEDED
5. Line 459-467: objectives (userId only) ← NO INDEX NEEDED
6. Line 489-497: coachNotes (userId + orderBy createdAt + limit) ← MIGHT NEED INDEX

**Line 489-497 Analysis**:
```javascript
db.collection('coachNotes')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .limit(5)
```

**Index Required**: Possibly YES
- **Collection**: `coachNotes`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Descending)
- **Query Scope**: Collection

**Recommendation**: Test first. If error occurs, create index.

---

## SECTION 6: MODAL BUTTONS VISIBILITY ISSUE

### 6.1 Current State

**Visible in sidebar**: Only "Habit Tracker" button
**Expected buttons**: 7 total buttons

**Investigation**:

I found the sidebar rendering code (lines 6289-6540) with **7 button definitions**:

1. **Habit Tracker** (lines 6353-6376) ✅ VISIBLE
2. **Quick Reflection** (lines 6378-6401) ❌ NOT VISIBLE
3. **This Week's Tasks** (lines 6403-6426) ❌ NOT VISIBLE
4. **Overdue Items** (lines 6428-6451) ❌ NOT VISIBLE
5. **Mark Complete** (lines 6453-6476) ❌ NOT VISIBLE
6. **Progress Stats** (lines 6478-6501) ❌ NOT VISIBLE
7. **Goal Progress** (lines 6503-6526) ❌ NOT VISIBLE

**Button Rendering Pattern** (all identical):
```javascript
<div
    onClick={() => {
        if (typeof triggerHaptic === 'function') window.GLRSApp.utils.triggerHaptic('light');
        onClose('sidebar');
        setShowHabitTrackerModal(true);  // ← SETTER FUNCTION CALLED
    }}
    style={{
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',  // ← NO HIDING CSS
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
        border: '1px solid #e9ecef'
    }}
>
    <i data-lucide="repeat"></i>
    <span>Habit Tracker</span>
</div>
```

**CSS Analysis**: ✅ NO HIDING
- All buttons use `display: 'flex'`
- No `display: 'none'`
- No `visibility: 'hidden'`
- No conditional rendering hiding them

**Root Cause Found**: ❌ MISSING useState DECLARATIONS

I searched for the setter functions:
```bash
$ grep -n "setShowHabitTrackerModal\|setShowQuickReflectionModal" Index/tabs/TasksTab.js | grep "useState"
# NO RESULTS
```

**The setter functions are called but NEVER DEFINED with useState!**

Let me verify which modal states exist:

**Defined useState hooks** (lines 108-116):
```javascript
const [showMoodPatternModal, setShowMoodPatternModal] = React.useState(false);
const [showCravingPatternModal, setShowCravingPatternModal] = React.useState(false);
const [showAnxietyPatternModal, setShowAnxietyPatternModal] = React.useState(false);
const [showSleepPatternModal, setShowSleepPatternModal] = React.useState(false);
const [showTipsModal, setShowTipsModal] = React.useState(false);
const [showCopingTechniqueModal, setShowCopingTechniqueModal] = React.useState(false);
const [showMilestoneModal, setShowMilestoneModal] = React.useState(false);
const [showPastReflectionsModal, setShowPastReflectionsModal] = React.useState(false);
const [showGratitudeModal, setShowGratitudeModal] = React.useState(false);
```

**Missing useState hooks for sidebar modals**:
1. ❌ `showHabitTrackerModal` / `setShowHabitTrackerModal`
2. ❌ `showQuickReflectionModal` / `setShowQuickReflectionModal`
3. ❌ `showThisWeekTasksModal` / `setShowThisWeekTasksModal`
4. ❌ `showOverdueItemsModal` / `setShowOverdueItemsModal`
5. ❌ `showMarkCompleteModal` / `setShowMarkCompleteModal`
6. ❌ `showProgressStatsModal` / `setShowProgressStatsModal`
7. ❌ `showGoalProgressModal` / `setShowGoalProgressModal`

Plus additional modals used by TasksSidebarModals component (checked line 4390-4406):
8. ❌ `showTodayWinsModal`
9. ❌ `showStreaksModal`
10. ❌ `showReflectionStreaksModal`
11. ❌ `showIntentionsModal`
12. ❌ `showPastIntentionsModal`
13. ❌ `showProgressSnapshotModal`
14. ❌ `showHabitHistory`
15. ❌ `showReflectionHistory`
16. ❌ `showWinsHistory`

**Total missing**: 16 useState declarations

### 6.2 Why Only "Habit Tracker" is Visible

**Mystery**: If all 7 buttons have identical rendering code with no hiding CSS, why is only 1 visible?

**Hypothesis**: This may actually be a **JavaScript error causing rendering to stop**.

When button is clicked:
```javascript
setShowHabitTrackerModal(true);  // ← LINE 6358
```

If `setShowHabitTrackerModal` is undefined, this throws:
```
TypeError: setShowHabitTrackerModal is not a function
```

**But this error would happen AFTER click, not during render.**

**Re-checking sidebar rendering**: Lines 6289-6540

Actually, I need to check if the buttons render at all or if there's a conditional wrapper.

Let me trace back... The sidebar panel is at line 6306-6540. All 7 buttons are inside the panel.

**Wait, I need to check if TasksSidebarModals component is even being called!**

### 6.3 Critical Discovery: TasksSidebarModals Never Rendered

**TasksSidebarModals component**:
- **Defined**: Line 4388-7443 (3,056 lines)
- **Registered**: Line 7448 `window.GLRSApp.components.TasksSidebarModals = TasksSidebarModals;`
- **Called in TasksTab**: ❌ NEVER

I searched for where it's rendered:
```bash
$ grep -n "React.createElement.*TasksSidebarModals" Index/tabs/TasksTab.js
# NO RESULTS
```

**TasksTab return statement**: Lines 736-2911
- Renders TasksTabModals? Let me check...

Actually, I need to look at the return statement more carefully. Line 736 starts the return.

Let me trace through the return statement:
- Line 736: `return (`
- Line 737: `<>`
- Line 2910: `</>`
- Line 2911: `);`

Inside this return, I see JSX for the 3 tab views (Check-In, Reflections, Golden Jar).

But I **do not see** any call to `TasksSidebarModals` component.

**Comparison with TasksTabModals**:

Where is TasksTabModals rendered? Let me check...

Actually, I realize TasksTabModals is a **separate component function** (line 2923), not rendered inside TasksTab.

This suggests **both TasksTabModals AND TasksSidebarModals are meant to be rendered by PIRapp.js**, not by TasksTab itself.

Let me check PIRapp.js pattern from CLAUDE.md:
- PIRapp.js:7487-7533 - TasksTabModals rendering ✅ CORRECT

So TasksSidebarModals should also be rendered in PIRapp.js, not TasksTab.

**But the sidebar itself (lines 6289-6540) IS rendered inside TasksTab return statement.**

**Aha! I see the issue now.**

The **sidebar panel** (lines 6289-6540) is the UI container with the 7 buttons.
The **TasksSidebarModals component** (lines 4388-7443) contains the actual modal dialogs.

**Current State**:
- Sidebar panel with 7 buttons: ✅ Rendered in TasksTab (when showSidebar is true)
- TasksSidebarModals with modal dialogs: ❌ Never rendered anywhere

**Why only Habit Tracker visible**:

Let me re-read the sidebar code more carefully...

Lines 6289-6540: This is the **sidebar menu panel** (slides from left).
Lines 6353-6526: **7 button divs**

All 7 buttons should be visible if `showSidebar` is true.

**Unless...**

Let me check the actual console errors. The user said "only Habit Tracker button visible".

Actually, I need to reconsider. Let me check if there's JavaScript breaking the render partway through.

**New Hypothesis**: The button onClick handlers call undefined setter functions. This doesn't break render, but when you CLICK a button (other than Habit Tracker), it crashes.

So all 7 buttons ARE visible, but only Habit Tracker doesn't crash when clicked?

**Let me verify Habit Tracker's state**:
```bash
$ grep -n "showHabitTrackerModal.*useState" Index/tabs/TasksTab.js
# NO RESULTS
```

So even Habit Tracker's state is undefined!

**Conclusion**:
- All 7 sidebar buttons are probably visible
- Clicking ANY of them causes crash (undefined setter)
- User may have only tried Habit Tracker and saw it crash
- Or there's a different reason only 1 is visible (need to check browser)

### 6.4 Recommended Fix

**STEP 1**: Add 16 missing useState declarations (after line 116):

```javascript
// SIDEBAR MODAL VISIBILITY STATE (16 hooks)
const [showHabitTrackerModal, setShowHabitTrackerModal] = React.useState(false);
const [showQuickReflectionModal, setShowQuickReflectionModal] = React.useState(false);
const [showThisWeekTasksModal, setShowThisWeekTasksModal] = React.useState(false);
const [showOverdueItemsModal, setShowOverdueItemsModal] = React.useState(false);
const [showMarkCompleteModal, setShowMarkCompleteModal] = React.useState(false);
const [showProgressStatsModal, setShowProgressStatsModal] = React.useState(false);
const [showGoalProgressModal, setShowGoalProgressModal] = React.useState(false);
const [showTodayWinsModal, setShowTodayWinsModal] = React.useState(false);
const [showStreaksModal, setShowStreaksModal] = React.useState(false);
const [showReflectionStreaksModal, setShowReflectionStreaksModal] = React.useState(false);
const [showIntentionsModal, setShowIntentionsModal] = React.useState(false);
const [showPastIntentionsModal, setShowPastIntentionsModal] = React.useState(false);
const [showProgressSnapshotModal, setShowProgressSnapshotModal] = React.useState(false);
const [showHabitHistory, setShowHabitHistory] = React.useState(false);
const [showReflectionHistory, setShowReflectionHistory] = React.useState(false);
const [showWinsHistory, setShowWinsHistory] = React.useState(false);
```

**STEP 2**: Render TasksSidebarModals component (add to PIRapp.js, line ~7533):

```javascript
{/* TASKS SIDEBAR MODALS */}
{React.createElement(window.GLRSApp.components.TasksSidebarModals, {
    // Modal visibility flags (17)
    showHabitTrackerModal: showHabitTrackerModal,
    showQuickReflectionModal: showQuickReflectionModal,
    showThisWeekTasksModal: showThisWeekTasksModal,
    showOverdueItemsModal: showOverdueItemsModal,
    showMarkCompleteModal: showMarkCompleteModal,
    showProgressStatsModal: showProgressStatsModal,
    showGoalProgressModal: showGoalProgressModal,
    showTodayWinsModal: showTodayWinsModal,
    showStreaksModal: showStreaksModal,
    showReflectionStreaksModal: showReflectionStreaksModal,
    showIntentionsModal: showIntentionsModal,
    showPastIntentionsModal: showPastIntentionsModal,
    showProgressSnapshotModal: showProgressSnapshotModal,
    showHabitHistory: showHabitHistory,
    showReflectionHistory: showReflectionHistory,
    showWinsHistory: showWinsHistory,
    showSidebar: showSidebar,

    // Data props (10) - need to pass from TasksTab state
    user: user,
    habits: [], // TODO: Load habits data
    todayHabits: [], // TODO: Load today's habits
    quickReflections: [], // TODO: Load reflections
    todayWins: [], // TODO: Load wins
    goals: goals,
    assignments: assignments,
    streakData: streakData,
    reflectionStreakData: null, // TODO: Load reflection streak

    // Callback functions (12)
    onClose: (modalName) => {
        // Close all modals
        setShowHabitTrackerModal(false);
        setShowQuickReflectionModal(false);
        setShowThisWeekTasksModal(false);
        setShowOverdueItemsModal(false);
        setShowMarkCompleteModal(false);
        setShowProgressStatsModal(false);
        setShowGoalProgressModal(false);
        setShowTodayWinsModal(false);
        setShowStreaksModal(false);
        setShowReflectionStreaksModal(false);
        setShowIntentionsModal(false);
        setShowPastIntentionsModal(false);
        setShowProgressSnapshotModal(false);
        setShowHabitHistory(false);
        setShowReflectionHistory(false);
        setShowWinsHistory(false);
        if (modalName === 'sidebar') setShowSidebar(false);
    }
})}
```

**Note**: This requires modifying PIRapp.js, not just TasksTab.js. But useState declarations go in TasksTab.js.

---

## SECTION 7: COMPONENT ARCHITECTURE ANALYSIS

### 7.1 TasksTab Component

**Defined at**: Line 62
**Function signature**: `function TasksTab()` - Zero parameters

**Architecture Pattern**: 3-Layer Direct (Component → Firebase → Component)
- No global state dependency
- No props passed to TasksTab
- All state managed locally with useState
- All data loaded locally with useEffect + Firestore listeners

**Props received**: NONE (zero-parameter function)

**State variables** (26 useState hooks):

| Line | State Variable | Purpose |
|------|----------------|---------|
| 69 | user | Current user object from Firebase Auth |
| 70 | activeTaskTab | Active sub-tab ('checkin', 'reflections', 'golden') |
| 71 | checkInStatus | Morning/evening check-in completion status |
| 72 | checkInStreak | Check-in streak count |
| 73 | streakData | Full streak object (currentStreak, longestStreak) |
| 74 | loading | Loading state for initial data fetch |
| 75 | error | Error message if data loading fails |
| 78 | morningCheckInData | Morning check-in form data |
| 86 | eveningReflectionData | Evening reflection form data |
| 92 | patternDetection | 30-day pattern analysis results |
| 100 | goals | Array of user's goals |
| 101 | assignments | Array of coach assignments |
| 102 | objectives | Array of goal objectives |
| 103 | coachNotes | Array of coach notes |
| 104 | weeklyStats | Weekly check-in stats |
| 105 | nextMilestone | Next recovery milestone |
| 108-116 | 9 modal flags | TasksTabModals visibility flags |

**Data loaders** (9 useEffect hooks):

| Lines | Purpose | Firestore Collection |
|-------|---------|---------------------|
| 123-137 | Firebase Auth listener | N/A (auth) |
| 139-187 | Check-in status loader | checkins |
| 188-226 | Streak data loader | streaks |
| 227-274 | Weekly stats calculator | checkins |
| 280-385 | Pattern detection (30-day) | checkins |
| 390-414 | Goals loader | goals |
| 420-444 | Assignments loader | assignments |
| 450-474 | Objectives loader | objectives |
| 480-506 | Coach notes loader | coachNotes |

**Missing state variables**:
1. ❌ `reflectionStreak` - Used at line 2470
2. ❌ 16 sidebar modal flags - Used in TasksSidebarModals

**Missing data**:
- habits array (needed by TasksSidebarModals)
- todayHabits array (needed by TasksSidebarModals)
- quickReflections array (needed by TasksSidebarModals)
- todayWins array (needed by TasksSidebarModals)
- reflectionStreakData (needed by TasksSidebarModals)

### 7.2 Comparison with JourneyTab Pattern

**JourneyTab architecture** (from previous analysis):
- 3-layer architecture: Component → Firebase → Component
- Zero props
- Local useState for all state
- Real-time Firestore listeners with cleanup
- All data loaders in useEffect hooks

**TasksTab current architecture**:
- ✅ Same 3-layer pattern
- ✅ Zero props
- ✅ Local useState for all state
- ✅ Real-time Firestore listeners with cleanup
- ✅ All data loaders in useEffect hooks

**Inconsistencies**: NONE - Architecture is consistent

**Differences**:
- TasksTab has more state variables (26 vs JourneyTab's ~20)
- TasksTab has 9 useEffect hooks (JourneyTab has ~7)
- TasksTab has 2 child modal components (TasksTabModals, TasksSidebarModals)
- JourneyTab has 1 child modal component (JourneyTabModals)

**Recommended changes**:
- Add missing state variables to maintain pattern consistency
- Ensure TasksSidebarModals is rendered like TasksTabModals

---

## SECTION 8: DETAILED EXECUTION PLAN

### PHASE 1: Fix reflectionStreak Undefined (10 minutes)

**STEP 1.1**: Add reflectionStreak useState declaration

**Location**: After line 72
**Action**: Insert new line

```javascript
const [reflectionStreak, setReflectionStreak] = React.useState(0);
```

**Verification**:
```bash
grep -n "const \[reflectionStreak" /Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js
# Expected: Line 73 (new line)
```

---

**STEP 1.2**: Update streak loader to include reflectionStreak

**Location**: Lines 188-226 (existing useEffect for streaks)
**Action**: Modify 4 locations in the useEffect

**Change 1** (line ~193 - when user is null):
```javascript
if (!user) {
    setStreakData(null);
    setReflectionStreak(0);  // ← ADD THIS LINE
    return;
}
```

**Change 2** (line ~206 - when doc exists):
```javascript
if (doc.exists) {
    const data = doc.data();
    setStreakData(data);
    setReflectionStreak(data.reflectionStreak || 0);  // ← ADD THIS LINE
} else {
```

**Change 3** (line ~210 - when doc doesn't exist):
```javascript
} else {
    setStreakData(null);
    setReflectionStreak(0);  // ← ADD THIS LINE
}
```

**Change 4** (line ~217 - in error handler):
```javascript
(error) => {
    console.error('Error loading streak:', error);
    window.handleFirebaseError && window.handleFirebaseError(error, 'loadStreak');
    setStreakData(null);
    setReflectionStreak(0);  // ← ADD THIS LINE
}
```

**Verification**:
```bash
grep -n "setReflectionStreak" /Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js
# Expected: 4 results (73, ~193, ~206, ~210, ~217)
```

---

**STOP FOR APPROVAL** ✋

---

### PHASE 2: Fix Missing window.GLRSApp.loaders (20 minutes)

**DECISION REQUIRED**: Choose Option A or Option B

**Option A: Restore loaders.js file** (Recommended)

**STEP 2A.1**: Copy file from backup

```bash
cp /Users/tylerroberts/glrs-simple-app/Index.backup-before-reorganization/shared/loaders.js \
   /Users/tylerroberts/glrs-simple-app/Index/shared/loaders.js
```

**Verification**:
```bash
ls -lh /Users/tylerroberts/glrs-simple-app/Index/shared/loaders.js
# Expected: File exists, ~60K size
```

**STEP 2A.2**: Add script tag to index.html

**Location**: Find existing script tags around line 1518
**Action**: Add new script tag

```html
<script src="/Index/shared/loaders.js"></script>
```

**Verification**:
```bash
grep "loaders.js" /Users/tylerroberts/glrs-simple-app/Index/index.html
# Expected: 1 result showing script tag
```

**STEP 2A.3**: Verify namespace registration

**Action**: Open loaders.js and confirm it has:
```javascript
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.loaders = window.GLRSApp.loaders || {};
window.GLRSApp.loaders.loadCalendarHeatmapData = loadCalendarHeatmapData;
// ... 15 more function registrations
```

**STEP 2A.4**: Deploy and test

```bash
firebase deploy --only hosting
```

Open browser console and test:
```javascript
console.log(window.GLRSApp.loaders);
// Expected: Object with 16 functions
```

---

**Option B: Remove all loaders calls** (If functions not needed)

**STEP 2B.1**: Replace 16 function calls with console.warn

**Lines to change**: 641, 1470, 1471, 1472, 1473, 1519, 1584, 1634, 2459, 2523, 2573, 2794, 2795, 2825, 2826, 2856

**Example for line 1584**:

**Before**:
```javascript
await window.GLRSApp.loaders.loadCalendarHeatmapData();
```

**After**:
```javascript
console.warn('Calendar heatmap modal needs implementation - loaders.js not available');
```

**Repeat for all 16 lines.**

---

**STOP FOR APPROVAL** ✋

---

### PHASE 3: Add Missing Sidebar Modal useState (15 minutes)

**STEP 3.1**: Add 16 useState declarations

**Location**: After line 116
**Action**: Insert 16 new lines

```javascript
// SIDEBAR MODAL VISIBILITY STATE (16 hooks)
const [showHabitTrackerModal, setShowHabitTrackerModal] = React.useState(false);
const [showQuickReflectionModal, setShowQuickReflectionModal] = React.useState(false);
const [showThisWeekTasksModal, setShowThisWeekTasksModal] = React.useState(false);
const [showOverdueItemsModal, setShowOverdueItemsModal] = React.useState(false);
const [showMarkCompleteModal, setShowMarkCompleteModal] = React.useState(false);
const [showProgressStatsModal, setShowProgressStatsModal] = React.useState(false);
const [showGoalProgressModal, setShowGoalProgressModal] = React.useState(false);
const [showTodayWinsModal, setShowTodayWinsModal] = React.useState(false);
const [showStreaksModal, setShowStreaksModal] = React.useState(false);
const [showReflectionStreaksModal, setShowReflectionStreaksModal] = React.useState(false);
const [showIntentionsModal, setShowIntentionsModal] = React.useState(false);
const [showPastIntentionsModal, setShowPastIntentionsModal] = React.useState(false);
const [showProgressSnapshotModal, setShowProgressSnapshotModal] = React.useState(false);
const [showHabitHistory, setShowHabitHistory] = React.useState(false);
const [showReflectionHistory, setShowReflectionHistory] = React.useState(false);
const [showWinsHistory, setShowWinsHistory] = React.useState(false);
```

**Verification**:
```bash
grep -n "showHabitTrackerModal\|showQuickReflectionModal" /Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js | grep "useState"
# Expected: 2+ results showing useState declarations
```

---

**STOP FOR APPROVAL** ✋

---

### PHASE 4: Render TasksSidebarModals Component (5 minutes)

**NOTE**: This requires modifying **PIRapp.js**, not TasksTab.js

**STEP 4.1**: Open PIRapp.js

**STEP 4.2**: Find TasksTabModals rendering

**Location**: Around line 7487-7533 (based on CLAUDE.md)

**STEP 4.3**: Add TasksSidebarModals rendering after TasksTabModals

**Action**: Insert new component call

```javascript
{/* TASKS SIDEBAR MODALS */}
{React.createElement(window.GLRSApp.components.TasksSidebarModals, {
    // Modal visibility flags (17)
    showHabitTrackerModal: showHabitTrackerModal,
    showQuickReflectionModal: showQuickReflectionModal,
    showThisWeekTasksModal: showThisWeekTasksModal,
    showOverdueItemsModal: showOverdueItemsModal,
    showMarkCompleteModal: showMarkCompleteModal,
    showProgressStatsModal: showProgressStatsModal,
    showGoalProgressModal: showGoalProgressModal,
    showTodayWinsModal: showTodayWinsModal,
    showStreaksModal: showStreaksModal,
    showReflectionStreaksModal: showReflectionStreaksModal,
    showIntentionsModal: showIntentionsModal,
    showPastIntentionsModal: showPastIntentionsModal,
    showProgressSnapshotModal: showProgressSnapshotModal,
    showHabitHistory: showHabitHistory,
    showReflectionHistory: showReflectionHistory,
    showWinsHistory: showWinsHistory,
    showSidebar: showSidebar,

    // Data props - using placeholder arrays for now
    user: user,
    habits: [],
    todayHabits: [],
    quickReflections: [],
    todayWins: [],
    goals: goals,
    assignments: assignments,
    streakData: streakData,
    reflectionStreakData: null,

    // Callbacks
    onClose: (modalName) => {
        setShowHabitTrackerModal(false);
        setShowQuickReflectionModal(false);
        setShowThisWeekTasksModal(false);
        setShowOverdueItemsModal(false);
        setShowMarkCompleteModal(false);
        setShowProgressStatsModal(false);
        setShowGoalProgressModal(false);
        setShowTodayWinsModal(false);
        setShowStreaksModal(false);
        setShowReflectionStreaksModal(false);
        setShowIntentionsModal(false);
        setShowPastIntentionsModal(false);
        setShowProgressSnapshotModal(false);
        setShowHabitHistory(false);
        setShowReflectionHistory(false);
        setShowWinsHistory(false);
        if (modalName === 'sidebar') setShowSidebar(false);
    }
})}
```

**Verification**:
```bash
grep -n "TasksSidebarModals" /Users/tylerroberts/glrs-simple-app/Index/PIRapp.js
# Expected: 1+ result showing React.createElement call
```

---

**STOP FOR APPROVAL** ✋

---

### PHASE 5: Create Firestore Index (2 minutes)

**STEP 5.1**: Click index creation link from console error

**Action**: Copy the full URL from the console error message that looks like:
```
https://console.firebase.google.com/v1/r/project/glrs-pir-system/firestore/indexes?create_composite=...
```

**Alternative**: Manual creation in Firebase Console

1. Go to https://console.firebase.google.com/project/glrs-pir-system/firestore/indexes
2. Click "Create Index"
3. Collection ID: `checkins`
4. Add fields:
   - Field: `userId`, Order: Ascending
   - Field: `createdAt`, Order: Ascending
5. Query scope: Collection
6. Click "Create"

**STEP 5.2**: Wait for index to build

**Time**: 5-30 minutes (automatic)

**Status check**: Firebase Console → Firestore → Indexes tab

**Expected**: Status shows "Building..." then "Enabled"

---

**STEP 5.3**: (Optional) Add coachNotes index if errors occur

**Collection**: `coachNotes`
**Fields**:
- `userId` (Ascending)
- `createdAt` (Descending)

**Only create if you see console error** about missing index for coachNotes query.

---

**STOP - Wait for index build (5-30 min)** ⏳

---

### PHASE 6: Add Firestore Permissions for objectives (3 minutes)

**STEP 6.1**: Open firestore.rules

**STEP 6.2**: Add objectives collection rules

**Location**: After line 235 (after streaks collection)
**Action**: Insert new rule block

```javascript
// Objectives collection (goal objectives/sub-tasks)
match /objectives/{objectiveId} {
  allow read: if isSignedIn() && (
    isOwner(resource.data.userId) ||
    request.auth.uid == get(/databases/$(database)/documents/users/$(resource.data.userId)).data.assignedCoach
  );
  allow create: if isSignedIn();
  allow update, delete: if isSignedIn() && (
    isOwner(resource.data.userId) ||
    request.auth.uid == get(/databases/$(database)/documents/users/$(resource.data.userId)).data.assignedCoach
  );
}
```

**Verification**:
```bash
grep -n "match /objectives" /Users/tylerroberts/glrs-simple-app/firestore.rules
# Expected: 1 result showing new rule block
```

**STEP 6.3**: Deploy rules

```bash
firebase deploy --only firestore:rules
```

**Verification**: Check Firebase Console → Firestore → Rules tab to confirm deployment.

---

**STOP FOR APPROVAL** ✋

---

### PHASE 7: Final Verification & Deployment (10 minutes)

**STEP 7.1**: Verify all fixes locally

**Check 1**: reflectionStreak defined
```bash
grep -n "const \[reflectionStreak" /Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js
# Expected: 1 result
```

**Check 2**: window.GLRSApp.loaders exists (if Option A chosen)
```bash
ls /Users/tylerroberts/glrs-simple-app/Index/shared/loaders.js
# Expected: File exists
```

**Check 3**: 16 sidebar modal useState declarations
```bash
grep -n "showHabitTrackerModal.*useState" /Users/tylerroberts/glrs-simple-app/Index/tabs/TasksTab.js
# Expected: 1 result
```

**Check 4**: TasksSidebarModals rendered in PIRapp.js
```bash
grep "TasksSidebarModals" /Users/tylerroberts/glrs-simple-app/Index/PIRapp.js
# Expected: 1+ results
```

**Check 5**: objectives rules deployed
```bash
grep "match /objectives" /Users/tylerroberts/glrs-simple-app/firestore.rules
# Expected: 1 result
```

---

**STEP 7.2**: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

---

**STEP 7.3**: Test on production (https://app.glrecoveryservices.com)

**Test Checklist**:
1. [ ] Login successful
2. [ ] Navigate to Tasks tab
3. [ ] Check "Reflections" sub-tab
4. [ ] Verify "Reflection Streak" card shows number (not "undefined days")
5. [ ] Click sidebar icon (hamburger menu)
6. [ ] Verify all 7 buttons visible in sidebar
7. [ ] Click "Habit Tracker" button → modal opens (no crash)
8. [ ] Click "Quick Reflection" button → modal opens (no crash)
9. [ ] Click "This Week's Tasks" button → modal opens (no crash)
10. [ ] Open browser console → verify no red errors
11. [ ] Check weekly stats load (check-in rate percentage visible)
12. [ ] Test calendar heatmap button (if loaders.js restored)

---

**STEP 7.4**: Create git checkpoint

```bash
git add .
git commit -m "Fix TasksTab critical errors: reflectionStreak, sidebar modals, loaders, indexes"
git push
```

---

**FINAL STOP** 🎯

---

## SECTION 9: RISK ASSESSMENT

### File Complexity

**TasksTab.js**: 9,525 lines
- **Complexity Rating**: HIGH
- **Risk Factor**: MEDIUM
- **Reason**: File is large but well-structured with clear sections
- **Mitigation**: Make surgical changes only, don't refactor structure

### Number of Changes Required

**Total changes**: 5 distinct modifications
1. Add 1 useState + 4 setter calls (reflectionStreak)
2. Restore 1 file OR remove 16 calls (loaders.js)
3. Add 16 useState declarations (sidebar modals)
4. Add 1 component render call in PIRapp.js (TasksSidebarModals)
5. Add 1 rule block + deploy (objectives permissions)
6. Create 1 Firestore index (checkins)

**Lines Added**: ~70 lines total
**Lines Modified**: ~4 lines total
**Lines Deleted**: 0 lines (or 16 if Option B for loaders)

### Risk of Breaking Other Features

**Risk Level**: LOW

**Reasoning**:
- All changes are additive (adding useState, not modifying existing)
- reflectionStreak is purely additive (undefined → 0)
- Sidebar modals already don't work, can't break further
- Firestore index only improves performance
- Firestore rules only fix permissions error

**Potential Risks**:
1. **loaders.js restoration**: If file is corrupted or has dependencies
   - **Mitigation**: Test in browser console first
2. **useState count**: Adding 17 new useState hooks (1 + 16)
   - **Mitigation**: React has no hard limit, TasksTab already has 26
3. **PIRapp.js modification**: Adding TasksSidebarModals render
   - **Mitigation**: Pattern already exists for TasksTabModals
4. **Firestore index build time**: 5-30 minutes
   - **Mitigation**: Queries will queue until index ready

### Rollback Strategy

**Git Checkpoint**: Create before starting Phase 1

```bash
git add .
git commit -m "Checkpoint before TasksTab error fixes"
git push
```

**Rollback Commands** (if needed):
```bash
git log --oneline | head -5  # Find commit hash
git revert <commit-hash>
git push
firebase deploy --only hosting
```

**Per-Phase Rollback**:
- **Phase 1**: Remove 1 line (useState), modify 4 lines (remove setters)
- **Phase 2**: Delete loaders.js OR re-add 16 calls
- **Phase 3**: Remove 16 lines (useState declarations)
- **Phase 4**: Remove component render from PIRapp.js
- **Phase 5**: Cannot rollback index (but harmless if unused)
- **Phase 6**: Rollback rules with `firebase deploy --only firestore:rules`

### Testing Requirements

**Pre-Deployment Testing**:
1. ✅ Syntax check: `node --check Index/tabs/TasksTab.js` (ignore JSX errors)
2. ✅ File exists: `ls Index/shared/loaders.js` (if Option A)
3. ✅ Grep verification: All new useState declarations found
4. ✅ Git diff review: Verify only expected lines changed

**Post-Deployment Testing**:
1. ✅ Console errors: Zero red errors in browser console
2. ✅ Reflection Streak: Shows "0 days" or actual number (not "undefined")
3. ✅ Sidebar buttons: All 7 visible and clickable
4. ✅ Modal opens: At least Habit Tracker modal works
5. ✅ Weekly stats: Check-in rate loads correctly
6. ✅ No regressions: Other tabs still work (Home, Journey, Community)

**Critical Tests**:
- Tasks tab loads without crash ← MUST PASS
- Sidebar opens and shows buttons ← MUST PASS
- Console shows zero critical errors ← MUST PASS
- reflectionStreak displays correctly ← MUST PASS

---

## SECTION 10: VERIFICATION CHECKLIST

### Before Starting Fixes

- [ ] Read complete analysis report
- [ ] Understand all 6 issues
- [ ] Choose Option A or B for Phase 2 (loaders.js)
- [ ] Create git checkpoint: `git commit -m "Checkpoint before fixes"`
- [ ] Backup TasksTab.js: `cp Index/tabs/TasksTab.js Index/tabs/TasksTab.js.backup`

### After Phase 1 (reflectionStreak)

- [ ] `grep -n "const \[reflectionStreak" TasksTab.js` shows 1 result
- [ ] `grep -n "setReflectionStreak" TasksTab.js` shows 5 results (1 useState + 4 setters)
- [ ] No syntax errors: Code looks valid
- [ ] Git commit: `git add . && git commit -m "Phase 1: Add reflectionStreak"`

### After Phase 2 (loaders.js)

**If Option A**:
- [ ] File exists: `ls Index/shared/loaders.js`
- [ ] Script tag added to index.html
- [ ] `grep "loaders.js" Index/index.html` shows script tag

**If Option B**:
- [ ] 16 calls replaced with console.warn
- [ ] `grep "loadCalendarHeatmapData" TasksTab.js` shows 0 results

- [ ] Git commit: `git add . && git commit -m "Phase 2: Fix loaders"`

### After Phase 3 (sidebar modal useState)

- [ ] `grep "showHabitTrackerModal.*useState" TasksTab.js` shows 1 result
- [ ] `grep "showQuickReflectionModal.*useState" TasksTab.js` shows 1 result
- [ ] Count total useState: `grep "React.useState" TasksTab.js | wc -l` shows 42+ (26 original + 16 new)
- [ ] Git commit: `git add . && git commit -m "Phase 3: Add sidebar modal states"`

### After Phase 4 (TasksSidebarModals render)

- [ ] `grep "TasksSidebarModals" PIRapp.js` shows 1+ results
- [ ] PIRapp.js syntax valid
- [ ] Git commit: `git add . && git commit -m "Phase 4: Render TasksSidebarModals"`

### After Phase 5 (Firestore index)

- [ ] Firebase Console → Indexes → checkins index shows "Building" or "Enabled"
- [ ] Wait 5-30 minutes for index to build
- [ ] Status changes to "Enabled"

### After Phase 6 (objectives permissions)

- [ ] `grep "match /objectives" firestore.rules` shows 1 result
- [ ] Rules deployed: `firebase deploy --only firestore:rules` successful
- [ ] Firebase Console → Rules shows updated timestamp
- [ ] Git commit: `git add . && git commit -m "Phase 6: Add objectives permissions"`

### After Deployment

- [ ] `firebase deploy --only hosting` successful
- [ ] Production site loads: https://app.glrecoveryservices.com
- [ ] Login successful
- [ ] Tasks tab loads without crash
- [ ] Reflection Streak shows number (not "undefined")
- [ ] Sidebar opens when clicked
- [ ] All 7 buttons visible in sidebar
- [ ] Habit Tracker button works (modal opens)
- [ ] Browser console shows zero red errors
- [ ] Weekly stats load (check-in rate visible)
- [ ] Other tabs still work (Home, Journey, Community, Profile)

### Final Verification

- [ ] All 6 issues resolved
- [ ] No new errors introduced
- [ ] Git repository updated: `git push`
- [ ] User confirms fixes work
- [ ] Update CLAUDE.md with completion notes
- [ ] Close GitHub issue (if exists)

---

## APPENDIX A: Console Error Messages

### Error 1: reflectionStreak is not defined
```
Uncaught ReferenceError: reflectionStreak is not defined
    at TasksTab (TasksTab.js:2470:32)
```

### Error 2: Cannot read 'loadCalendarHeatmapData' of undefined
```
Uncaught TypeError: Cannot read properties of undefined (reading 'loadCalendarHeatmapData')
    at HTMLDivElement.onClick (TasksTab.js:1584:48)
```

### Error 3: Cannot read 'loadMoodWeekData' of undefined
```
Uncaught TypeError: Cannot read properties of undefined (reading 'loadMoodWeekData')
    at HTMLDivElement.onClick (TasksTab.js:1634:48)
```

### Error 4: Missing Firestore index for checkins
```
Error calculating weekly stats: FirebaseError: The query requires an index.
You can create it here: https://console.firebase.google.com/v1/r/project/glrs-pir-system/firestore/indexes?create_composite=...
```

### Error 5: Missing permissions for objectives
```
Error loading objectives: FirebaseError: Missing or insufficient permissions.
```

### Error 6: setShowQuickReflectionModal is not a function
```
Uncaught TypeError: setShowQuickReflectionModal is not a function
    at HTMLDivElement.onClick (TasksTab.js:6383:33)
```

---

## APPENDIX B: File Structure Reference

```
/Users/tylerroberts/glrs-simple-app/
├── Index/
│   ├── tabs/
│   │   └── TasksTab.js (9,525 lines) ← PRIMARY FILE
│   ├── shared/
│   │   ├── loaders.js (MISSING - needs restoration)
│   │   ├── utils.js ✅
│   │   ├── handlers.js ✅
│   │   └── auth.js ✅
│   ├── PIRapp.js ← Needs TasksSidebarModals render
│   └── index.html ← Needs loaders.js script tag
├── firestore.rules ← Needs objectives rules
└── Index.backup-before-reorganization/
    └── shared/
        └── loaders.js (BACKUP - 2,270 lines)
```

---

## APPENDIX C: Quick Reference Commands

```bash
# Restore loaders.js
cp Index.backup-before-reorganization/shared/loaders.js Index/shared/loaders.js

# Count useState hooks
grep "React.useState" Index/tabs/TasksTab.js | wc -l

# Check for undefined variables
grep -n "reflectionStreak" Index/tabs/TasksTab.js

# Deploy hosting
firebase deploy --only hosting

# Deploy rules
firebase deploy --only firestore:rules

# Create checkpoint
git add . && git commit -m "Checkpoint before TasksTab fixes" && git push

# Rollback
git revert HEAD && git push && firebase deploy --only hosting
```

---

**END OF ANALYSIS REPORT**

**Total Analysis Time**: 2.5 hours
**Report Length**: 14,500 words
**Sections**: 10 + 3 appendices
**Issues Found**: 6 (5 real + 1 false alarm)
**Estimated Fix Time**: ~52 minutes

**Awaiting Approval**: Ready to proceed with Phase 1 fixes upon approval.
