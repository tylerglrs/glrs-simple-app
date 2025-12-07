# STREAK CARDS & MODALS COMPLETE AUDIT

**Generated:** December 6, 2025
**Analyst:** Claude Code
**Status:** COMPLETE - READY FOR IMPLEMENTATION APPROVAL

---

## EXECUTIVE SUMMARY

**CRITICAL: 8 major discrepancies found between cards, modals, and Firestore data.**

The streak and insight cards in the Daily Overview are NOT in sync with their associated modals. Data is calculated differently, pulled from different collections, and in some cases modals don't even exist.

### Severity Ratings

| Issue | Severity | Impact |
|-------|----------|--------|
| `streakHistory` modal doesn't exist | **CRITICAL** | Card click does nothing |
| `reflectionStreaks` modal is placeholder | **CRITICAL** | Card click shows placeholder |
| Check-In % label mismatch | **HIGH** | Says "31-day" but shows 7-day data |
| Collection name mismatch (`checkins` vs `checkIns`) | **CRITICAL** | Modal queries wrong collection |
| Reflections count from wrong collection | **HIGH** | Modal shows `quickReflections`, card shows `checkIns`+`reflections` |
| Streak calculation inconsistencies | **MEDIUM** | Displayed vs actual differ by 2-18 days |
| "Best" streak values inaccurate | **MEDIUM** | Shows 43 when actual is 25 |
| This month reflections count off | **LOW** | Shows 5 when actual is 7 |

---

## PART 1: CARD IDENTIFICATION

### Location
**File:** `/Index/pir-portal/src/features/tasks/components/DailyOverview.tsx`

### Streaks Section (Lines 229-337)

| Card | Display | Component | Lines |
|------|---------|-----------|-------|
| Check-In Streak | `{checkInStreak}` + "Best: {checkInStreakData.longestStreak} days" | StreakSection | 265-298 |
| Reflection Streak | `{reflectionStreak}` + "Best: {reflectionStreakData.longestStreak} days" | StreakSection | 301-334 |

### Insights Section (Lines 344-454)

| Card | Display | Source | Description Label |
|------|---------|--------|-------------------|
| Check Ins | `{weeklyStats.checkRate}%` | weeklyStats prop | "31-day" |
| Avg Mood | `{weeklyStats.avgMood}` | weeklyStats prop | "7-day" |
| Reflections | `{reflectionStats.totalThisMonth}` | reflectionStats prop | "This month" |

### Data Flow to Cards

```
useCheckInsQuery.ts (TanStack Query hook)
    ├── Queries: checkIns collection + reflections collection
    ├── Computes: checkInStreakData, reflectionStreakData
    ├── Computes: weeklyStats (7-day!), reflectionStats
    └── Returns all to TasksTab.tsx
            └── Passes to DailyOverview.tsx as props
                    └── Renders in StreakSection + InsightsSection
```

---

## PART 2: MODAL IDENTIFICATION

### Card → Modal Mapping

| Card | Clicks Opens | Modal Name | Status |
|------|--------------|------------|--------|
| Check-In Streak | `onOpenModal('streakHistory')` | `streakHistory` | **DOES NOT EXIST** |
| Reflection Streak | `onOpenModal('reflectionStreaks')` | `reflectionStreaks` | **PLACEHOLDER ONLY** |
| Check Ins | `onOpenModal('checkIns')` | `checkIns` | Implemented |
| Avg Mood | `onOpenModal('moodPattern')` | `moodPattern` | Implemented |
| Reflections | `onOpenModal('allReflections')` | `allReflections` | Implemented |

### Modal Registry Status

**File:** `/Index/pir-portal/src/components/ModalProvider.tsx`

| Modal Name | Implementation | Lines |
|------------|----------------|-------|
| `streakHistory` | **NOT IN REGISTRY** | N/A |
| `reflectionStreaks` | `createPlaceholder('reflectionStreaks')` | 148 |
| `checkIns` | `CheckInsModal` | 237-240 |
| `moodPattern` | `PatternModal` with initialTab="mood" | 301-304 |
| `allReflections` | `AllReflectionsModal` | 248-251 |
| `streaks` | `StreaksModal` (exists but not used by cards) | 143-146 |

### Modal Data Sources

| Modal | Hook Used | Collection Queried |
|-------|-----------|-------------------|
| StreaksModal | `useCheckInStats()` | `checkins` (LOWERCASE!) |
| CheckInsModal | Direct Firestore query | `checkIns` (camelCase) |
| AllReflectionsModal | `useReflections()` | `quickReflections` |
| PatternModal | `useCheckInStats()` | `checkins` (LOWERCASE!) |

---

## PART 3: DATA SOURCE TRACING

### Primary Data Flow (Cards)

**Source:** `/Index/pir-portal/src/hooks/queries/useCheckInsQuery.ts`

```
fetchAllCheckIns() → collection('checkIns') → ALL user check-ins
fetchAllReflections() → collection('reflections') → ALL user reflections

computedData = useMemo(() => {
  // Check-in streak: from checkIns where type='morning' OR morningData
  checkInStreakData = calculateStreaks(checkIns, c => c.type === 'morning' || c.morningData)

  // Reflection streak: COMBINED from checkIns (evening) + reflections collection
  reflectionStreakData = calculateStreaksFromDates([...checkInDates, ...reflectionDates])

  // Weekly stats (ACTUALLY 7-DAY, not 31-day!)
  weeklyStats = {
    checkRate: Math.min(100, Math.round((uniqueDays / 7) * 100)),  // 7-day!
    avgMood: calculated from 7-day morning check-ins
  }

  // Reflection stats
  reflectionStats = {
    totalThisMonth: unique dates from checkIns + reflections this month
  }
})
```

### Secondary Data Flow (Modals)

**Source:** `/Index/pir-portal/src/features/tasks/hooks/useTasksModalData.ts`

```
useCheckInStats():
  Query: collection('checkins') ← WRONG COLLECTION NAME!
  Where: userId == currentUser, last 30 days
  Returns: streakData, weeklyStats, patterns

useReflections():
  Query: collection('quickReflections') ← DIFFERENT COLLECTION!
  Returns: reflections array
```

---

## PART 4: FIRESTORE DATA AUDIT (User: Heinz Roberts)

### Raw Collection Counts

| Collection | Documents |
|------------|-----------|
| `checkIns` (camelCase) | 189 total |
| - Morning check-ins | 112 |
| - Evening check-ins | 91 |
| `checkins` (lowercase) | **0** (empty/doesn't exist) |
| `reflections` | 85 |
| `quickReflections` | **0** (empty) |

### Calculated vs Displayed Values

| Metric | Displayed | Calculated | Match? |
|--------|-----------|------------|--------|
| Check-In Streak | 12 | 10 | NO (-2) |
| Check-In Best | 43 | 25 | **NO (-18)** |
| Reflection Streak | 4 | 0* | **NO** |
| Reflection Best | 45 | 44 | Close (-1) |
| Check Ins % | 100% | 100% | YES |
| Avg Mood | 6.3 | 6.3 | YES |
| Reflections (This month) | 5 | 7 | NO (+2) |

*Note: Reflection streak calculation may have timezone issues (future date detected: 2025-12-07)

### Raw Date Analysis

**Most Recent Check-In Dates:**
```
2025-12-06, 2025-12-05, 2025-12-04, 2025-12-03, 2025-12-02,
2025-12-01, 2025-11-30, 2025-11-29, 2025-11-28, 2025-11-27
```
(10 consecutive days = current streak should be 10)

**Most Recent Reflection Dates:**
```
2025-12-07, 2025-12-06, 2025-12-05, 2025-12-04, 2025-12-03,
2025-12-02, 2025-12-01, 2025-11-30, 2025-11-29, 2025-11-28
```
(Future date 2025-12-07 indicates timezone/timestamp issue)

---

## PART 5: DISCREPANCY ANALYSIS

### Issue #1: `streakHistory` Modal Does Not Exist

**Severity:** CRITICAL
**Location:** DailyOverview.tsx:268
**Symptom:** Clicking Check-In Streak card does nothing (no console error, just fails silently)

```typescript
// Current code
onClick={() => onOpenModal?.('streakHistory')}

// Modal registry has 'streaks' but not 'streakHistory'
```

**Root Cause:** Card opens wrong modal name. `StreaksModal` exists at modal name `streaks` or `streak`, but card opens `streakHistory`.

---

### Issue #2: `reflectionStreaks` Modal is Placeholder

**Severity:** CRITICAL
**Location:** DailyOverview.tsx:304, ModalProvider.tsx:148
**Symptom:** Clicking Reflection Streak card shows generic placeholder

```typescript
// ModalProvider.tsx:148
reflectionStreaks: createPlaceholder('reflectionStreaks'),
```

**Root Cause:** Modal was never implemented. Only placeholder exists.

---

### Issue #3: Check-In % Label Mismatch

**Severity:** HIGH
**Location:** DailyOverview.tsx:359, useCheckInsQuery.ts:499
**Symptom:** Card says "31-day" but calculation uses 7-day period

```typescript
// DailyOverview.tsx:359 - Says 31-day
description: '31-day',

// useCheckInsQuery.ts:499 - Calculates 7-day
checkRate: Math.min(100, Math.round((uniqueDays / 7) * 100)),
```

**Root Cause:** Label doesn't match calculation. Either change label to "7-day" or change calculation to 31-day.

---

### Issue #4: Collection Name Mismatch

**Severity:** CRITICAL
**Location:** useTasksModalData.ts:186
**Symptom:** StreaksModal shows 0 data when opened via `streaks` modal

```typescript
// useTasksModalData.ts:186 - WRONG
collection(db, 'checkins'),  // lowercase

// useCheckInsQuery.ts:124 - CORRECT
collection(db, 'checkIns'),  // camelCase
```

**Firestore Data:**
- `checkIns` collection: 189 documents
- `checkins` collection: 0 documents (doesn't exist)

**Root Cause:** useTasksModalData.ts uses wrong collection name.

---

### Issue #5: Reflections Modal Uses Wrong Collection

**Severity:** HIGH
**Location:** useTasksModalData.ts:580
**Symptom:** AllReflectionsModal shows 0 reflections when user has 85+91

```typescript
// useTasksModalData.ts:580 - Queries quickReflections
collection(db, 'quickReflections'),

// User has:
// - 91 evening reflections in checkIns collection
// - 85 reflections in reflections collection
// - 0 in quickReflections collection
```

**Root Cause:** Modal queries `quickReflections` (empty) instead of `checkIns` + `reflections` (176 total).

---

### Issue #6: Streak Calculation Differences

**Severity:** MEDIUM
**Location:** useCheckInsQuery.ts:177-260, useTasksModalData.ts:263-325

**Two different streak algorithms exist:**

**useCheckInsQuery.ts (Card data):**
- Iterates dates newest→oldest
- Tracks streak periods with start/end dates
- Current streak = most recent period if ends today/yesterday

**useTasksModalData.ts (Modal data):**
- Iterates dates oldest→newest
- Different streak boundary logic
- Different "current" streak detection

**Root Cause:** Two hooks calculate streaks differently, leading to inconsistent values.

---

### Issue #7: "Best" Streak Values Inaccurate

**Severity:** MEDIUM
**Displayed:** Best: 43 days
**Calculated:** 25 days (from actual consecutive dates)

**Root Cause:** Unknown. Either:
1. Old cached data from before check-ins were deleted
2. Bug in longest streak calculation
3. Data includes test/duplicate entries

---

### Issue #8: This Month Reflections Count Off

**Severity:** LOW
**Displayed:** 5 reflections
**Calculated:** 7 unique dates with reflections

**Root Cause:** Possibly counting documents instead of unique dates, or timezone issues.

---

## PART 6: IMPLEMENTATION PLAN

### Phase 1: Fix Critical Modal Issues (2-3 hours)

#### 1.1 Fix Check-In Streak Card Modal

**File:** `/Index/pir-portal/src/features/tasks/components/DailyOverview.tsx`

```typescript
// Line 268: Change 'streakHistory' to 'streaks'
onClick={() => onOpenModal?.('streaks')}
```

#### 1.2 Create Reflection Streaks Modal

**New File:** `/Index/pir-portal/src/features/tasks/modals/ReflectionStreaksModal.tsx`

- Copy StreaksModal.tsx structure
- Modify to show reflection streak data instead of check-in data
- Update ModalProvider.tsx to register new modal

```typescript
// ModalProvider.tsx - Replace placeholder
reflectionStreaks: lazy(() =>
  Promise.resolve({
    default: ({ onClose }: { onClose: () => void }) => <ReflectionStreaksModal onClose={onClose} />,
  })
),
```

### Phase 2: Fix Collection Name Issues (1 hour)

#### 2.1 Fix useTasksModalData.ts

**File:** `/Index/pir-portal/src/features/tasks/hooks/useTasksModalData.ts`

```typescript
// Line 186: Change 'checkins' to 'checkIns'
collection(db, 'checkIns'),

// Line 580: Change to use combined collections
// Replace useReflections to query checkIns (evening) + reflections
```

### Phase 3: Fix Label Mismatch (30 mins)

**Option A:** Change label to match calculation (7-day)
```typescript
// DailyOverview.tsx:359
description: '7-day',  // Matches useCheckInsQuery calculation
```

**Option B:** Change calculation to match label (31-day)
```typescript
// useCheckInsQuery.ts - Change weekly stats to 31-day
const thirtyOneDaysAgo = new Date(today)
thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

// Filter by 31 days instead of 7
const thirtyOneDayCheckIns = checkIns.filter(c => getCheckInDate(c) >= thirtyOneDaysAgo)
```

**Recommendation:** Option A (simpler, less risky)

### Phase 4: Unify Streak Calculation (2-3 hours)

#### 4.1 Create shared streak utility

**New File:** `/Index/pir-portal/src/lib/streakCalculation.ts`

```typescript
export interface StreakData {
  currentStreak: number
  longestStreak: number
  allStreaks: StreakPeriod[]
}

export function calculateStreaksFromDates(dateStrings: string[]): StreakData {
  // Single source of truth for streak calculation
  // Use the algorithm from useCheckInsQuery.ts (more robust)
}
```

#### 4.2 Update both hooks to use shared utility

- `useCheckInsQuery.ts` - import and use shared function
- `useTasksModalData.ts` - import and use shared function

### Phase 5: Fix AllReflectionsModal Data Source (1-2 hours)

**File:** `/Index/pir-portal/src/features/tasks/modals/AllReflectionsModal.tsx`

Current: Uses `useReflections()` which queries `quickReflections` (empty)

Fix Options:
1. Create new hook `useCombinedReflections()` that queries `checkIns` + `reflections`
2. Modify `useReflections()` to combine sources
3. Use `useCheckInsQuery()` and filter to evening data

**Recommendation:** Option 3 (reuse existing hook, no new queries)

```typescript
// AllReflectionsModal.tsx
import { useCheckInsQuery } from '@/hooks/queries'

export function AllReflectionsModal({ onClose }: AllReflectionsModalProps) {
  const { allReflections, loading } = useCheckInsQuery()
  // allReflections is already computed from checkIns evening data
}
```

### Phase 6: Verify and Test (2 hours)

1. Test each card click opens correct modal
2. Verify modal data matches card data
3. Check streak calculations match between card and modal
4. Validate against actual Firestore data
5. Test timezone edge cases

---

## ESTIMATED EFFORT

| Phase | Task | Effort |
|-------|------|--------|
| 1 | Fix critical modal issues | 2-3 hours |
| 2 | Fix collection name issues | 1 hour |
| 3 | Fix label mismatch | 30 mins |
| 4 | Unify streak calculation | 2-3 hours |
| 5 | Fix AllReflectionsModal | 1-2 hours |
| 6 | Verify and test | 2 hours |
| **TOTAL** | | **8.5-11.5 hours** |

---

## PRIORITY ORDER

1. **CRITICAL:** Fix `streakHistory` → `streaks` modal mapping (5 mins)
2. **CRITICAL:** Create ReflectionStreaksModal (2 hours)
3. **CRITICAL:** Fix `checkins` → `checkIns` collection name (15 mins)
4. **HIGH:** Fix AllReflectionsModal data source (1 hour)
5. **HIGH:** Fix "31-day" label → "7-day" (5 mins)
6. **MEDIUM:** Unify streak calculations (3 hours)
7. **LOW:** Investigate "Best" streak discrepancy (1 hour)

---

## FILES TO MODIFY

| File | Changes Needed |
|------|----------------|
| `DailyOverview.tsx` | Change modal names, fix label |
| `ModalProvider.tsx` | Register ReflectionStreaksModal |
| `useTasksModalData.ts` | Fix collection name `checkins` → `checkIns` |
| `AllReflectionsModal.tsx` | Use correct data source |

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `ReflectionStreaksModal.tsx` | New modal for reflection streaks |
| `streakCalculation.ts` | Shared streak calculation utility |

---

## APPENDIX: Code References

### Card Click Handlers

```typescript
// DailyOverview.tsx:268 - Check-In Streak
onClick={() => onOpenModal?.('streakHistory')}  // BUG: should be 'streaks'

// DailyOverview.tsx:304 - Reflection Streak
onClick={() => onOpenModal?.('reflectionStreaks')}  // BUG: placeholder only

// DailyOverview.tsx:360 - Check Ins
modal: 'checkIns',  // WORKS

// DailyOverview.tsx:371 - Avg Mood
modal: 'moodPattern',  // WORKS

// DailyOverview.tsx:381 - Reflections
modal: 'allReflections',  // BUG: wrong data source
```

### Collection References

```typescript
// CORRECT - useCheckInsQuery.ts
collection(db, 'checkIns')
collection(db, 'reflections')

// WRONG - useTasksModalData.ts
collection(db, 'checkins')      // Should be 'checkIns'
collection(db, 'quickReflections')  // Should query 'checkIns' + 'reflections'
```

---

**END OF AUDIT REPORT**

*Awaiting approval to proceed with implementation.*
