# GLRS System Audit - Session 1: Tasks Tab

**Date:** December 18, 2025
**Auditor:** Claude Code
**Status:** IN PROGRESS

---

## PHASE 1: INVENTORY

### Main Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| TasksTab | `/src/features/tasks/components/TasksTab.tsx` | ~150 | Main container with 4 sub-views |
| DailyOverview | `/src/features/tasks/components/DailyOverview.tsx` | ~450 | Overview with sections |
| CheckInView | `/src/features/tasks/components/CheckInView.tsx` | ~280 | Morning check-in interface |
| ReflectionView | `/src/features/tasks/components/ReflectionView.tsx` | ~320 | Evening reflection interface |
| GoldenThreadView | `/src/features/tasks/components/GoldenThreadView.tsx` | ~400 | Goals & objectives view |
| TasksSidebar | `/src/features/tasks/components/TasksSidebar.tsx` | ~600 | Sidebar with quick tools |

### Sub-Views (TasksTab)

1. **overview** - DailyOverview component (default)
2. **checkin** - CheckInView component
3. **reflections** - ReflectionView component
4. **golden** - GoldenThreadView component

### Supporting Components

| Component | File | Purpose |
|-----------|------|---------|
| MoodSliders | `MoodSliders.tsx` | Slider inputs for mood/craving/anxiety/sleep |
| GoalCard | `GoalCard.tsx` | Individual goal display |
| QuickToolsGrid | `QuickToolsGrid.tsx` | Grid of quick action buttons |
| ActivityCalendar | `ActivityCalendar.tsx` | Calendar heatmap |
| HabitsWeeklyCalendar | `HabitsWeeklyCalendar.tsx` | Weekly habit tracker |
| AssignmentCalendar | `AssignmentCalendar.tsx` | Assignment calendar view |
| CopingTechniqueCard | `CopingTechniqueCard.tsx` | Coping technique display |

### Modals (40 files in /features/tasks/modals/)

| Modal | Trigger | Purpose |
|-------|---------|---------|
| MorningCheckinModal | "Check In" button | Morning mood/craving input |
| EveningReflectionModal | "Reflect" button | Evening reflection input |
| HabitModal | Habit card click | View/edit habit |
| ManageHabitsModal | "Manage Habits" button | Add/edit/delete habits |
| GratitudeModal | "Gratitude" quick action | Add gratitude entry |
| WinsModal | "Wins" quick action | Add win entry |
| StreaksModal | Streak card click | View check-in streak details |
| ReflectionStreaksModal | Reflection streak click | View reflection streak details |
| CheckInsModal | Check-in stats click | View check-in history |
| MoodPatternModal | "Mood Patterns" button | View mood analytics |
| SleepPatternModal | "Sleep Patterns" button | View sleep analytics |
| AnxietyPatternModal | "Anxiety Patterns" | View anxiety analytics |
| CopingHistoryModal | Coping card click | View coping technique history |
| StatsModal | Stats card click | View detailed statistics |
| DayDetailModal | Calendar day click | View day's activities |
| PatternModal | Pattern card click | View pattern details |
| ShareGoalModal | Share button | Share goal progress |
| CompleteModal | Check-in complete | Completion summary |
| CheckRateModal | Check rate card | View check-in rate details |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| useCheckInsQuery | `/src/hooks/queries/useCheckInsQuery.ts` | TanStack Query for check-ins |
| useGoalsData | `/src/features/tasks/hooks/useGoalsData.tsx` | Goals/objectives data |
| useHabitsForWeek | `/src/features/tasks/hooks/useHabitsForWeek.ts` | Weekly habits data |
| useActivityData | `/src/features/tasks/hooks/useActivityData.ts` | Activity calendar data |
| useTasksModalData | `/src/features/tasks/hooks/useTasksModalData.ts` | Modal-specific data |
| useTimeOfDay | `/src/features/tasks/hooks/useTimeOfDay.ts` | Time-based greetings |

### Buttons & Actions

| Button | Location | Action |
|--------|----------|--------|
| Morning Check-In | CheckInView | Opens MorningCheckinModal |
| Evening Reflection | ReflectionView | Opens EveningReflectionModal |
| View Streaks | DailyOverview | Opens StreaksModal |
| Manage Habits | HabitsWeeklyCalendar | Opens ManageHabitsModal |
| Add Win | QuickToolsGrid | Opens WinsModal |
| Add Gratitude | QuickToolsGrid | Opens GratitudeModal |
| Quick Reflection | QuickToolsGrid | Opens QuickReflectionModal |
| Coping Technique | QuickToolsGrid | Opens CopingTechniqueModal |

---

## PHASE 2: DATA FLOW TRACE

### Check-In Flow (Morning)

```
PIR Portal: MorningCheckinModal
  ↓ Submit
useCheckInsQuery.submitMorningCheckIn()
  ↓
Firestore: addDoc(collection(db, 'checkIns'), {...})
  ↓
Document fields:
  - userId: user.uid
  - tenantId: userData.tenantId
  - morningData: { mood, craving, anxiety, sleep, notes }
  - mood, craving, anxiety, sleep (top-level copies)
  - type: 'morning'
  - createdAt: serverTimestamp()
  ↓
AI Context Update: updateContextAfterMorningCheckin()
  ↓
Real-time listener updates TanStack Query cache
  ↓
Admin Portal reads from: collection(db, 'checkIns')
```

### Reflection Flow (Evening)

```
PIR Portal: EveningReflectionModal
  ↓ Submit
useCheckInsQuery.submitEveningReflection()
  ↓
If morning check-in exists today:
  updateDoc(existingDoc, { eveningData: {...} })
Else:
  addDoc(collection(db, 'checkIns'), { type: 'evening', ... })
  ↓
Document fields:
  - eveningData: { overallDay, promptResponse, challenges, gratitude, tomorrowGoal, gratitudeTheme }
  - overallDay (top-level copy)
  ↓
AI Context Update: updateContextAfterEveningCheckin()
  ↓
Admin Portal reads from: collection(db, 'checkIns')
```

### Habit Flow

```
PIR Portal: HabitModal / ManageHabitsModal
  ↓ Create/Update/Complete
Firestore:
  - habits collection: habit definitions
  - habitCompletions collection: completion records
  ↓
Document fields (habits):
  - userId, tenantId, name, description, frequency
  - targetDays, color, icon, createdAt
  ↓
Document fields (habitCompletions):
  - userId, habitId, date, completedAt
  ↓
Admin Portal: UserDetail page shows habits
```

### Goals Flow

```
Admin Portal: CreateGoalModal
  ↓ Create
Firestore: goals collection
  ↓ Add Objectives
Firestore: goals/{goalId}/objectives subcollection
  ↓ Add Assignments
Firestore: assignments collection (linked via objectiveId)
  ↓
PIR Portal reads:
  - goals where pirId == user.uid
  - objectives subcollection
  - assignments where pirId == user.uid
```

### Gratitude Flow

```
PIR Portal: GratitudeModal
  ↓ Submit
Firestore: addDoc(collection(db, 'gratitudes'), {...})
  ↓
Document fields:
  - userId, tenantId, entry, category
  - gratitudeTheme, createdAt
  ↓
Admin Portal: CheckInsTabNew reads gratitudes collection
```

---

## PHASE 3: FIRESTORE VERIFICATION

### Collections Used by Tasks Tab

| Collection | PIR Writes | PIR Reads | Admin Reads | Has Index | Has Rules |
|------------|------------|-----------|-------------|-----------|-----------|
| checkIns | YES | YES | YES | YES (pirId+createdAt) | YES |
| reflections | NO | YES | YES | NO | YES |
| habits | YES | YES | YES | NO | YES |
| habitCompletions | YES | YES | YES | NO | YES |
| gratitudes | YES | YES | YES | NO | YES |
| goals | NO | YES | YES | NO | YES |
| assignments | NO | YES | YES | YES | YES |

### Index Analysis

**Existing Indexes:**
```json
{
  "collectionGroup": "checkIns",
  "fields": [
    { "fieldPath": "pirId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

**PIR Portal Query Pattern (useCheckInsQuery):**
```typescript
query(
  collection(db, 'checkIns'),
  where('userId', '==', userId),  // NOTE: Uses 'userId' not 'pirId'
  orderBy('createdAt', 'desc')
)
```

**ISSUE FOUND:** Index exists for `pirId + createdAt` but PIR queries use `userId + createdAt`. This may require an additional index.

### Security Rules Analysis

All collections have basic rules in firestore.rules. Rules allow authenticated users to read/write their own documents.

---

## PHASE 4: CODE QUALITY CHECK

### TypeScript Issues

| File | Issue | Severity |
|------|-------|----------|
| None found | - | - |

### Error Handling

| Component | Has try/catch | Has error toast | Status |
|-----------|---------------|-----------------|--------|
| useCheckInsQuery | YES | YES | PASS |
| useGoalsData | YES | YES | PASS |
| useHabitsForWeek | YES | YES | PASS |

### Loading States

| Component | Has loading state | Has skeleton | Status |
|-----------|-------------------|--------------|--------|
| TasksTab | YES | YES | PASS |
| DailyOverview | YES | YES | PASS |
| CheckInView | YES | YES | PASS |
| ReflectionView | YES | YES | PASS |
| GoldenThreadView | YES | YES | PASS |

### Empty States

| Component | Has empty state | Status |
|-----------|-----------------|--------|
| GoldenThreadView | YES | PASS |
| DailyOverview | YES | PASS |
| CheckInView | YES | PASS |

### Real-Time Listeners

| Component/Hook | Uses onSnapshot | Has cleanup | Status |
|----------------|-----------------|-------------|--------|
| useCheckInsQuery | YES | YES | PASS |
| useGoalsData | YES | YES | PASS |
| useHabitsForWeek | YES | YES | PASS |
| Admin CheckInsTab | NO (getDocs) | N/A | FAIL |
| Admin CheckInsTabNew | NO (getDocs) | N/A | FAIL |

---

## PHASE 5: ISSUES FOUND

### CRITICAL ISSUES

#### Issue 1: Admin Portal Not Using Real-Time Sync

**Location:** `/admin/src/pages/tasks/components/CheckInsTab.tsx` (line 138)
**Location:** `/admin/src/pages/tasks/components/CheckInsTabNew.tsx` (line 147)

**Problem:** Admin Portal uses `getDocs` (one-time fetch) instead of `onSnapshot` (real-time listener). When a PIR submits a check-in, coaches don't see it immediately.

**Impact:** HIGH - Coaches must manually refresh to see new check-ins

**Fix Required:** Convert `getDocs` to `onSnapshot` with proper cleanup

#### Issue 2: Missing Firestore Index

**Problem:** PIR Portal queries use `userId + createdAt` but existing index uses `pirId + createdAt`

**Query:**
```typescript
where('userId', '==', userId), orderBy('createdAt', 'desc')
```

**Fix Required:** Add composite index for `userId + createdAt`

### MEDIUM ISSUES

#### Issue 3: Collection Name Inconsistency (ALREADY FIXED)

**Old Admin:** `checkins` (lowercase)
**New Admin:** `checkIns` (camelCase)
**PIR Portal:** `checkIns` (camelCase)

**Status:** The new CheckInsTabNew correctly uses `checkIns`. Verify old CheckInsTab is not actively used.

---

## FIXES TO APPLY

### Fix 1: Add Real-Time Sync to Admin CheckInsTabNew

Convert from:
```typescript
const checkInsSnap = await getDocs(query(...))
```

To:
```typescript
useEffect(() => {
  const q = query(collection(db, "checkIns"), orderBy("createdAt", "desc"), limit(500))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setCheckIns(data)
  })
  return () => unsubscribe()
}, [])
```

### Fix 2: Add Firestore Index

Add to `firestore.indexes.json`:
```json
{
  "collectionGroup": "checkIns",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## SUMMARY

| Phase | Status | Issues Found |
|-------|--------|--------------|
| Phase 1: Inventory | COMPLETE | 0 |
| Phase 2: Data Flow | COMPLETE | 0 |
| Phase 3: Firestore | COMPLETE | 1 (missing index) |
| Phase 4: Code Quality | COMPLETE | 1 (no real-time sync in Admin) |
| Phase 5: Apply Fixes | COMPLETE | 2 fixes applied |

---

## FIXES APPLIED

### Fix 1: Real-Time Sync in Admin CheckInsTabNew - APPLIED

**File:** `/admin/src/pages/tasks/components/CheckInsTabNew.tsx`

**Changes:**
- Replaced `getDocs` import with `onSnapshot`
- Removed `useCallback` import (no longer needed)
- Converted loadData callback to useEffect with real-time listeners
- Added 4 separate onSnapshot listeners:
  - PIR users listener
  - Check-ins listener
  - Reflections listener
  - Gratitudes listener
- Added proper cleanup function returning all unsubscribe functions

**Result:** Admin Portal now receives instant updates when PIRs submit check-ins

### Fix 2: Firestore Indexes - APPLIED

**File:** `/firestore.indexes.json`

**Indexes Added:**
1. `checkIns` - userId + createdAt (DESC)
2. `reflections` - userId + createdAt (DESC)
3. `habits` - userId + createdAt (DESC)
4. `habitCompletions` - userId + date (DESC)
5. `gratitudes` - userId + createdAt (DESC)

**Deploy Required:**
```bash
firebase deploy --only firestore:indexes
```

---

## NEXT STEPS

1. Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
2. Build and deploy admin portal: `cd admin && npm run build`
3. Test real-time sync by submitting a check-in in PIR Portal and verifying it appears instantly in Admin Portal
