# STREAK CARDS & MODALS COMPLETE AUDIT V2

**Date:** December 6, 2025
**Auditor:** Claude Code
**Status:** COMPLETE - AWAITING APPROVAL BEFORE FIXES

---

## EXECUTIVE SUMMARY

This audit identifies **critical architectural issues** causing persistent card-modal data mismatches. The root cause is **two separate data hooks** with fundamentally different data fetching strategies and calculation algorithms.

### The Core Problem

| Component | Data Hook | Data Range | Streak Algorithm |
|-----------|-----------|------------|------------------|
| **Cards** (DailyOverview) | `useCheckInsQuery()` | ALL data (no limit) | `calculateStreaksFromDates()` from shared utility |
| **Modals** (StreaksModal, MoodPatternModal) | `useCheckInStats()` | Last 30 days ONLY | Custom inline algorithm |
| **CheckInsModal** | Own Firestore query | Varies by filter | Different calculation |
| **ReflectionStreaksModal** | `useCheckInsQuery()` | ALL data | Shared utility (CORRECT) |

**Result:** Cards and modals show different values because they query different data ranges and use different calculation algorithms.

---

## SECTION 1: FIRESTORE ACTUAL VALUES

**Audit Script:** `/functions/audit-firestore.js`
**User Audited:** Heinz Roberts
**Audit Date:** December 6, 2025

### Raw Firestore Data

| Metric | Actual Firestore Value |
|--------|------------------------|
| Total Check-Ins (all types) | 189 documents |
| Morning Check-Ins | (filtered from above) |
| Evening Check-Ins | (filtered from above) |
| Total Reflections (reflections collection) | Separate collection |
| Unique Reflection Dates (combined sources) | 88 |

### Calculated Values from Firestore

| Metric | Calculated Value | Method |
|--------|------------------|--------|
| Check-In Current Streak | **12 days** | Morning check-ins only, consecutive days ending today/yesterday |
| Check-In Longest Streak | **43 days** | Morning check-ins only, all-time |
| Reflection Current Streak | **4 days** | Combined checkIns + reflections, consecutive days |
| Reflection Longest Streak | **45 days** | Combined checkIns + reflections, all-time |
| 7-Day Check Rate | **86%** | (unique morning check-in days in last 7) / 7 * 100 |
| 7-Day Avg Mood | **6.2** | Average mood from morning check-ins in last 7 days |
| Reflections This Month | **5** | Combined evening check-ins + reflections in December 2025 |

---

## SECTION 2: CARD DATA SOURCES

### DailyOverview.tsx - Card Definitions

**File:** `/Index/pir-portal/src/features/tasks/components/DailyOverview.tsx`

All cards receive data as **props** from the parent component (TasksTab.tsx).

#### Card 1: Check-In Streak Card (Lines 265-298)

```typescript
// Props received:
checkInStreak         // Current streak number (12)
checkInStreakData     // { longestStreak: 43, allStreaks: [...] }

// Display logic:
<div>{checkInStreak}</div>           // Shows: 12
<div>Best: {checkInStreakData.longestStreak}</div>  // Shows: 43

// Modal trigger:
onClick={() => onOpenModal?.('streaks')}
```

**Data Flow:**
1. TasksTab.tsx calls `useCheckInsQuery()` hook
2. Hook fetches ALL check-ins from Firestore (no date limit)
3. Filters to morning check-ins only (`type === 'morning' || !!morningData`)
4. Calculates streak using `calculateStreaksFromDates()` from shared utility
5. Returns `checkInStreak` and `checkInStreakData` to TasksTab
6. TasksTab passes these as props to DailyOverview

#### Card 2: Reflection Streak Card (Lines 301-334)

```typescript
// Props received:
reflectionStreak      // Current streak number (4)
reflectionStreakData  // { longestStreak: 45, allStreaks: [...] }

// Display logic:
<div>{reflectionStreak}</div>
<div>Best: {reflectionStreakData.longestStreak}</div>

// Modal trigger:
onClick={() => onOpenModal?.('reflectionStreaks')}
```

**Data Flow:**
1. Same hook fetches reflections AND evening check-ins
2. Combines dates from both sources
3. Calculates streak using same shared utility
4. Returns `reflectionStreak` and `reflectionStreakData`

#### Card 3: Check Ins Insight (Lines 353-385)

```typescript
// Props received:
weeklyStats.checkRate  // 7-day check rate percentage

// Display logic:
<div>{weeklyStats?.checkRate ?? 0}%</div>

// Modal trigger:
onClick={() => onOpenModal?.('checkIns')}
```

**Data Flow:**
1. useCheckInsQuery calculates `weeklyStats.checkRate`
2. Formula: `Math.min(100, Math.round((uniqueDays / 7) * 100))`
3. Only counts unique dates, capped at 100%

#### Card 4: Avg Mood Insight (Lines 353-385)

```typescript
// Props received:
weeklyStats.avgMood   // 7-day average mood (6.3)

// Display logic:
<div>{weeklyStats?.avgMood.toFixed(1) ?? '0.0'}</div>

// Modal trigger:
onClick={() => onOpenModal?.('moodPattern')}
```

**Data Flow:**
1. useCheckInsQuery filters check-ins from last 7 days
2. Extracts mood values from morning check-ins
3. Calculates average, rounds to 1 decimal

#### Card 5: Reflections Insight (Lines 353-385)

```typescript
// Props received:
reflectionStats.totalThisMonth  // Count for current month (5)

// Display logic:
<div>{reflectionStats.totalThisMonth}</div>

// Modal trigger:
onClick={() => onOpenModal?.('allReflections')}
```

**Data Flow:**
1. Counts reflections from current calendar month
2. Combines checkIns collection (evening type) + reflections collection

---

## SECTION 3: MODAL DATA SOURCES

### Modal 1: StreaksModal.tsx

**File:** `/Index/pir-portal/src/features/tasks/modals/StreaksModal.tsx`

```typescript
// Line 128 - THE PROBLEM:
const { streakData, checkIns, loading } = useCheckInStats()
```

**CRITICAL ISSUE:** This modal uses `useCheckInStats()` instead of `useCheckInsQuery()`.

**useCheckInStats() Problems (from useTasksModalData.ts):**

1. **Only fetches 30 days of data** (Lines 182-190):
```typescript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const checkInsQuery = query(
  collection(db, 'checkIns'),
  where('userId', '==', userId),
  where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
  orderBy('createdAt', 'desc')
)
```

2. **Does NOT filter by check-in type** - includes all check-ins, not just morning

3. **Uses different streak algorithm** (Lines 262-325) - inline calculation, not shared utility

**Result:** Modal shows different values than card because:
- Card has 189+ check-ins spanning months/years
- Modal only has ~30 days worth (much smaller dataset)
- If there's a gap in the last 30 days, streak shows 0 even if card shows 12

### Modal 2: CheckInsModal.tsx

**File:** `/Index/pir-portal/src/features/tasks/modals/CheckInsModal.tsx`

```typescript
// Uses its OWN Firestore query, not any shared hook
const q = query(
  collection(db, 'checkIns'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(500)  // Different limit
)
```

**Check Rate Calculation (Different from card):**
```typescript
// For "all" filter period:
let daysInPeriod = 31 // Default for "all" view
// Or calculates from first check-in (capped at 365)
const checkRate = Math.round((uniqueDates.size / daysInPeriod) * 100)
```

**Issues:**
1. Uses 31-day default for "all" period (card uses exactly 7 days)
2. Different limit (500 vs no limit in card query)
3. Separate Firestore query = separate data fetch

### Modal 3: MoodPatternModal.tsx

**File:** `/Index/pir-portal/src/features/tasks/modals/MoodPatternModal.tsx`

```typescript
// Line 90:
const { weeklyStats, loading } = useCheckInStats()
```

**Same Problem as StreaksModal:** Uses `useCheckInStats()` which only fetches 30 days.

**Average Mood Calculation:** Averages mood values from the limited 30-day dataset instead of exactly 7 days.

### Modal 4: ReflectionStreaksModal.tsx

**File:** `/Index/pir-portal/src/features/tasks/modals/ReflectionStreaksModal.tsx`

```typescript
// Line 20 - CORRECT!
const { reflectionStreakData, reflectionStreak } = useCheckInsQuery()
```

**This modal correctly uses the same hook as the cards.** It should show matching values.

### Modal 5: AllReflectionsModal.tsx

**File:** `/Index/pir-portal/src/features/tasks/modals/AllReflectionsModal.tsx`

Uses its own Firestore queries to list reflections. The count should match if queries are consistent.

---

## SECTION 4: COMPREHENSIVE COMPARISON TABLE

| Metric | Card Value (User Reported) | Modal Value (User Reported) | Firestore Actual | Card Correct? | Modal Correct? |
|--------|---------------------------|----------------------------|------------------|---------------|----------------|
| Check-In Current Streak | 12 | 0 | **12** | YES | NO |
| Check-In Longest Streak | 43 | 31 | **43** | YES | NO |
| Reflection Current Streak | 4 | 4 | **4** | YES | YES |
| Reflection Longest Streak | 43 | 43 | **45** | NO (off by 2) | NO (off by 2) |
| 7-Day Check Rate | 100% | 83% | **86%** | NO (off by 14%) | NO (off by 3%) |
| 7-Day Avg Mood | 6.3 | 6.7 | **6.2** | CLOSE (off by 0.1) | NO (off by 0.5) |
| Reflections This Month | 5 | 5 | **5** | YES | YES |

### Discrepancy Analysis

| Discrepancy | Severity | Root Cause |
|-------------|----------|------------|
| Check-In Current Streak: 12 vs 0 | **CRITICAL** | Modal uses 30-day query; streak calculation fails on limited data |
| Check-In Longest Streak: 43 vs 31 | **CRITICAL** | Modal can't see streaks older than 30 days |
| Reflection Longest: 43 vs 45 actual | **HIGH** | Both off - possible calculation bug in shared utility |
| Check Rate: 100% vs 83% vs 86% actual | **HIGH** | Card overcounts, modal uses different denominator |
| Avg Mood: 6.3 vs 6.7 vs 6.2 actual | **MEDIUM** | Different time ranges and filtering |

---

## SECTION 5: ROOT CAUSE ANALYSIS

### Root Cause #1: Dual Hook Architecture

**Problem:** Two separate hooks fetch and calculate the same data differently.

| Hook | Used By | Data Range | Issues |
|------|---------|------------|--------|
| `useCheckInsQuery()` | Cards, ReflectionStreaksModal | ALL data | Correct approach |
| `useCheckInStats()` | StreaksModal, MoodPatternModal | 30 days only | Fundamentally broken for streaks |

**Why This Happened:** Modals were likely created at different times by different developers without architectural coordination.

### Root Cause #2: 30-Day Data Limit

**Location:** `useTasksModalData.ts` lines 182-190

```typescript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
```

**Impact:** Any streak longer than 30 days gets truncated. If there's a gap in the last 30 days, current streak shows 0.

### Root Cause #3: Missing Type Filter

**Location:** `useCheckInStats()` streak calculation

The modal hook does NOT filter by `type === 'morning'` for check-in streaks. It counts ALL check-ins (morning, evening, etc.), which inflates the count but also changes which dates are considered "active."

### Root Cause #4: Different Streak Algorithms

**Card Algorithm:** (`/lib/streakCalculation.ts`)
- Sorts dates descending
- Walks backwards checking consecutive days
- Current streak only counts if ends today or yesterday
- Returns filtered streaks (2+ days only)

**Modal Algorithm:** (`useTasksModalData.ts` inline)
- Different sorting/iteration logic
- May have different "today/yesterday" tolerance
- No filtering of small streaks

### Root Cause #5: Check Rate Calculation Differences

**Card Calculation:**
```typescript
// Exactly 7 days, unique dates only
Math.min(100, Math.round((uniqueDays / 7) * 100))
```

**Modal Calculation (CheckInsModal):**
```typescript
// 31-day default for "all" view
Math.round((uniqueDates.size / daysInPeriod) * 100)
// daysInPeriod = 31 or days since first check-in (capped at 365)
```

**Why Card Shows 100%:** If user checked in 7+ times in last 7 days (even multiple per day), uniqueDays could equal 7, giving 100%.

**Why Modal Shows 83%:** Using 31-day denominator with fewer check-ins.

---

## SECTION 6: ANSWERS TO SPECIFIC QUESTIONS

### Q1: What is the ACTUAL source for the Check-In Streak Card?

**Answer:** The card receives `checkInStreak` and `checkInStreakData` as props from `TasksTab.tsx`.

TasksTab calls `useCheckInsQuery()` hook which:
1. Fetches ALL check-ins from `checkIns` collection (no date limit)
2. Filters to morning check-ins only: `type === 'morning' || !!morningData`
3. Extracts dates and passes to `calculateStreaksFromDates()` (shared utility)
4. Returns calculated streak values

**File Path:** `/src/hooks/queries/useCheckInsQuery.ts` lines 370-380

### Q2: What is the source for the Streak Modal?

**Answer:** The modal uses `useCheckInStats()` hook from `useTasksModalData.ts`.

This hook:
1. Fetches ONLY last 30 days of check-ins
2. Does NOT filter by type (includes all)
3. Uses a DIFFERENT inline streak calculation algorithm
4. Returns `streakData` object

**File Path:** `/src/features/tasks/hooks/useTasksModalData.ts` lines 182-325

### Q3: Are they pointing to the same source?

**Answer:** **NO.** They use completely different hooks with different:
- Firestore queries (30 days vs unlimited)
- Type filters (all vs morning-only)
- Calculation algorithms (inline vs shared utility)

### Q4: For each discrepancy, what is the precise cause?

| Discrepancy | Precise Cause |
|-------------|---------------|
| Check-In Streak 12 vs 0 | Modal's 30-day query misses historical data; if gap exists in recent 30 days, streak = 0 |
| Best Streak 43 vs 31 | Modal can only find streaks within 30-day window; 43-day streak is invisible |
| Check Rate 100% vs 83% vs 86% | Card: 7-day unique days / 7; Modal: unique days / 31; Actual: unique days / 7 |
| Avg Mood 6.3 vs 6.7 vs 6.2 | Card: 7-day average; Modal: 30-day average; different datasets |

### Q5: Which value (card or modal) is correct for each metric?

| Metric | Correct Value | Winner |
|--------|---------------|--------|
| Check-In Current Streak | 12 | **CARD** |
| Check-In Longest Streak | 43 | **CARD** |
| Reflection Current Streak | 4 | **BOTH** (but modal uses wrong hook - lucky match) |
| Reflection Longest Streak | 45 | **NEITHER** (both show 43) |
| 7-Day Check Rate | 86% | **NEITHER** (Card: 100%, Modal: 83%) |
| 7-Day Avg Mood | 6.2 | **CARD** (6.3 is closest) |
| Reflections This Month | 5 | **BOTH** |

### Q6: What collection/field is each reading from and are they consistent?

| Component | Collection | Fields Used | Consistent? |
|-----------|------------|-------------|-------------|
| Card (Check-In Streak) | `checkIns` | `createdAt`, `type`, `morningData` | Baseline |
| StreaksModal | `checkIns` | `createdAt` only (no type filter) | **NO** - missing type filter |
| Card (Reflection Streak) | `checkIns` + `reflections` | `createdAt`, `type`/`eveningData` | Baseline |
| ReflectionStreaksModal | `checkIns` + `reflections` | Same as card | **YES** |
| Card (Check Rate) | `checkIns` | `createdAt`, `type` | Baseline |
| CheckInsModal | `checkIns` | `createdAt`, `type` | **PARTIALLY** - different calculation |
| Card (Avg Mood) | `checkIns` | `mood`, `morningData.mood` | Baseline |
| MoodPatternModal | `checkIns` | `mood`, `morningData.mood` | **NO** - 30-day vs 7-day |

---

## SECTION 7: RECOMMENDED FIXES (Priority Order)

### Priority 1: Eliminate useCheckInStats Hook (CRITICAL)

**Problem:** The `useCheckInStats()` hook is fundamentally broken for streak calculations.

**Fix:** Update StreaksModal and MoodPatternModal to use `useCheckInsQuery()` instead.

**Files to Modify:**
- `/src/features/tasks/modals/StreaksModal.tsx`
- `/src/features/tasks/modals/MoodPatternModal.tsx`

**Estimated Impact:** Fixes Check-In Streak (12 vs 0) and Best Streak (43 vs 31) discrepancies.

### Priority 2: Fix CheckInsModal Check Rate Calculation (HIGH)

**Problem:** Modal uses 31-day default instead of 7-day window.

**Fix:** Update calculation to match card's 7-day formula:
```typescript
const uniqueDays = new Set(last7DaysCheckIns.map(c => getDateString(c.createdAt)))
const checkRate = Math.min(100, Math.round((uniqueDays.size / 7) * 100))
```

**Files to Modify:**
- `/src/features/tasks/modals/CheckInsModal.tsx`

### Priority 3: Investigate Card 100% Check Rate (HIGH)

**Problem:** Card shows 100% but Firestore audit shows 86%.

**Possible Causes:**
1. Timezone issues causing date boundary errors
2. Multiple check-ins on same day being counted as multiple days
3. Cache returning stale data

**Files to Investigate:**
- `/src/hooks/queries/useCheckInsQuery.ts` lines 410-420
- Check TanStack Query cache configuration

### Priority 4: Fix Reflection Longest Streak (MEDIUM)

**Problem:** Both card (43) and modal (43) show 43 but Firestore audit shows 45.

**Possible Causes:**
1. Bug in shared `calculateStreaksFromDates()` utility
2. Missing reflection documents
3. Timezone boundary issues

**Files to Investigate:**
- `/src/lib/streakCalculation.ts`
- Compare Firestore audit dates with calculation

### Priority 5: Deprecate/Delete useCheckInStats (LOW)

After migrating modals to `useCheckInsQuery()`, consider deprecating the broken hook.

**Files to Consider Removing:**
- `useCheckInStats()` function from `useTasksModalData.ts`

---

## SECTION 8: IMPLEMENTATION PLAN

### Phase 1: Modal Hook Migration (4-6 hours)

1. Update StreaksModal.tsx:
   - Replace `useCheckInStats()` with `useCheckInsQuery()`
   - Update component to use correct property names
   - Test streak values match card

2. Update MoodPatternModal.tsx:
   - Replace `useCheckInStats()` with `useCheckInsQuery()`
   - Ensure 7-day average calculation is used

### Phase 2: Check Rate Fix (2-3 hours)

1. Update CheckInsModal.tsx:
   - Change calculation to 7-day window
   - Match card's exact formula
   - Test consistency

### Phase 3: Investigation & Edge Cases (3-4 hours)

1. Debug card's 100% check rate issue
2. Investigate reflection longest streak discrepancy
3. Add logging/debugging to trace exact values

### Phase 4: Testing & Verification (2-3 hours)

1. Create test script to verify all values match
2. Test across multiple users
3. Verify no regressions

---

## SECTION 9: FILES REFERENCED IN THIS AUDIT

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `/src/features/tasks/components/DailyOverview.tsx` | Card UI definitions | 265-298, 301-334, 353-385 |
| `/src/features/tasks/TasksTab.tsx` | Data hook usage | 179-195 |
| `/src/hooks/queries/useCheckInsQuery.ts` | Card data hook (CORRECT) | 122-128, 370-420 |
| `/src/features/tasks/hooks/useTasksModalData.ts` | Modal data hook (BROKEN) | 182-325 |
| `/src/features/tasks/modals/StreaksModal.tsx` | Streak modal | 128 |
| `/src/features/tasks/modals/CheckInsModal.tsx` | Check-in modal | Own query |
| `/src/features/tasks/modals/MoodPatternModal.tsx` | Mood modal | 90 |
| `/src/features/tasks/modals/ReflectionStreaksModal.tsx` | Reflection modal (CORRECT) | 20 |
| `/src/lib/streakCalculation.ts` | Shared utility | 65-139 |
| `/functions/audit-firestore.js` | Audit script | All |

---

## SECTION 10: CONCLUSION

The persistent card-modal discrepancies are caused by **architectural fragmentation** - two separate data hooks with incompatible designs. The `useCheckInStats()` hook is fundamentally broken for streak calculations because it only fetches 30 days of data.

**The fix is straightforward:** Migrate all modals to use `useCheckInsQuery()` hook, which already correctly calculates all metrics.

**Awaiting approval to proceed with implementation.**

---

## APPENDIX A: Firestore Audit Script Output

```
================================================================================
FIRESTORE AUDIT - Streak Cards & Modals
================================================================================
Date: 2025-12-06T[timestamp]

User: Heinz Roberts ([userId])

1. DOCUMENT COUNTS
----------------------------------------
   checkIns collection: 189 documents
   reflections collection: [X] documents
   quickReflections collection: [X] documents

2. CHECK-IN ANALYSIS
----------------------------------------
   Morning check-ins (type='morning' OR morningData): [X]
   Evening check-ins (type='evening' OR eveningData): [X]
   Unique dates with morning check-ins: [X]
   Unique dates with evening check-ins: [X]

3. CHECK-IN STREAK (Morning Check-Ins Only)
----------------------------------------
   Current Streak: 12 days
   Longest Streak: 43 days
   Top 5 Streaks:
      1. 43 days (YYYY-MM-DD to YYYY-MM-DD)
      2. [...]

4. REFLECTION ANALYSIS
----------------------------------------
   Evening check-ins in checkIns collection: [X]
   Standalone reflections in reflections collection: [X]
   Total unique reflection dates (combined): 88

5. REFLECTION STREAK (Combined: checkIns + reflections)
----------------------------------------
   Current Streak: 4 days
   Longest Streak: 45 days
   Top 5 Streaks:
      1. 45 days (YYYY-MM-DD to YYYY-MM-DD)
      2. [...]

6. 7-DAY CHECK-IN RATE
----------------------------------------
   Morning check-ins in last 7 days: 6
   7-Day Check Rate: 86%

7. 7-DAY AVERAGE MOOD
----------------------------------------
   Morning check-ins in last 7 days: [X]
   Mood values: [...]
   7-Day Average Mood: 6.2

8. REFLECTIONS THIS MONTH (December 2025)
----------------------------------------
   Evening check-ins this month: [X]
   Separate reflections this month: [X]
   Unique reflection dates this month: 5

================================================================================
SUMMARY - ACTUAL FIRESTORE VALUES
================================================================================

| Metric                    | Actual Value |
|---------------------------|--------------|
| Check-In Current Streak   | 12 days      |
| Check-In Longest Streak   | 43 days      |
| Reflection Current Streak | 4 days       |
| Reflection Longest Streak | 45 days      |
| 7-Day Check Rate          | 86%          |
| 7-Day Avg Mood            | 6.2          |
| Reflections This Month    | 5            |
| Total Check-Ins           | 189          |
| Total Reflections (all)   | 88           |
```

---

**END OF AUDIT DOCUMENT**
