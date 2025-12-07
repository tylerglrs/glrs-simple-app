# 28. AI Insights Architecture - Complete Analysis

**Document Version:** 2.0
**Created:** December 6, 2025
**Status:** Analysis Complete - Implementation Pending

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part 1: PatternsTab Deep Dive](#part-1-patternstab-deep-dive)
3. [Part 2: ReflectTab Deep Dive](#part-2-reflecttab-deep-dive)
4. [Part 3: ProgressTab Deep Dive](#part-3-progresstab-deep-dive)
5. [Part 4: Beacon Personality System](#part-4-beacon-personality-system)
6. [Part 5: Firestore Data Structures](#part-5-firestore-data-structures)
7. [Part 6: Gap Analysis](#part-6-gap-analysis)
8. [Part 7: Implementation Roadmap](#part-7-implementation-roadmap)
9. [Appendices](#appendices)

---

## Executive Summary

### The Problem

The AI Insights feature has THREE tabs:
- **PatternsTab** - WORKING with real GPT-4o-mini AI
- **ReflectTab** - BROKEN using algorithmic keyword matching
- **ProgressTab** - PARTIALLY WORKING using DEFAULT_RECOMMENDATIONS (placeholders)

### Root Cause

| Tab | Current State | Why It's Wrong |
|-----|--------------|----------------|
| PatternsTab | Uses `useAIPatternInsights` hook reading from `weeklyInsights/aiPatterns_{weekId}` | **CORRECT** |
| ReflectTab | `ReflectionThemes.tsx` uses regex keyword matching like `/family\|parent\|child/` | **WRONG - No AI** |
| ProgressTab | `HabitCoach.tsx` and `GoalCoaching.tsx` use hooks, but Firestore documents don't exist | **HOOKS EXIST, NO DATA** |

### The Solution

1. **ReflectTab**: The component `ReflectionThemes.tsx` needs to be rewritten to use `useReflectionThemes()` hook (which already exists!)
2. **ProgressTab**: The hooks `useHabitCoach()` and `useGoalCoach()` already exist and are already wired in. Cloud functions just need to generate the data.
3. **Create 3 Cloud Functions**: `generateAIReflectionInsights.js`, `generateAIHabitInsights.js`, `generateAIGoalInsights.js`

---

## Part 1: PatternsTab Deep Dive

### 1.1 File Inventory

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| PatternsTab.tsx | `/src/features/tasks/ai-insights/tabs/` | ~250 | Tab container component |
| PatternAnalysis.tsx | `/src/features/tasks/ai-insights/components/` | ~400 | Main AI display component |
| InsightDetailModal.tsx | `/src/features/tasks/ai-insights/components/` | 390 | Expandable insight modal |
| useAIPatternInsights.ts | `/src/hooks/` | 194 | Reads GPT insights from Firestore |
| useAIContext.ts | `/src/hooks/` | 1450 | Builds comprehensive AI context |
| useBeaconContent.ts | `/src/hooks/` | 696 | Contains all weekly insight hooks |
| generateAIPatternInsights.js | `/functions/ai/` | 844 | Cloud function that calls GPT |
| beaconPersonality.js | `/functions/beacon/` | 386 | Beacon AI personality prompts |

### 1.2 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PATTERNS TAB - COMPLETE AI FLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: SCHEDULED TRIGGER                                                  │
│  ────────────────────────                                                   │
│  Cloud Scheduler: "0 6 * * 0" (Sunday 6 AM Pacific)                         │
│  Function: generateAIPatternInsights                                        │
│  File: /functions/ai/generateAIPatternInsights.js                           │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 2: GET ALL ACTIVE USERS                                               │
│  ────────────────────────────                                               │
│  Query: users.where('role', '==', 'pir').where('status', '==', 'active')    │
│  Batch processing: 5 users at a time with 2 second delay                    │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 3: BUILD COMPREHENSIVE CONTEXT (per user)                             │
│  ─────────────────────────────────────────────                              │
│  Function: buildComprehensiveContext(userId)                                │
│  Lines: 121-370                                                             │
│                                                                             │
│  Data gathered:                                                             │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │ USER PROFILE                                                    │        │
│  │ - firstName, sobrietyDate, sobrietyDays                        │        │
│  │ Source: users/{userId}                                          │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ THIS WEEK'S CHECK-INS (last 7 days)                            │        │
│  │ - mood, anxiety, cravings, sleep, energy values                │        │
│  │ - morningData and eveningData                                  │        │
│  │ - reflections and gratitudes from eveningData                  │        │
│  │ Source: checkIns.where('userId', '==', userId)                 │        │
│  │         .where('createdAt', '>=', sevenDaysAgo)                │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ PREVIOUS WEEK'S CHECK-INS (7-14 days ago)                      │        │
│  │ - Same metrics for trend comparison                            │        │
│  │ Source: checkIns.where('createdAt', '>=', fourteenDaysAgo)     │        │
│  │         .where('createdAt', '<', sevenDaysAgo)                 │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ TODAY'S WINS                                                   │        │
│  │ Source: todayWins.where('userId', '==', userId)                │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ BREAKTHROUGHS                                                  │        │
│  │ Source: breakthroughs.where('userId', '==', userId)            │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ MEETING ATTENDANCE                                             │        │
│  │ Source: users/{userId}/meetingAttendance                       │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ ACTIVE HABITS                                                  │        │
│  │ Source: habits.where('userId', '==', userId)                   │        │
│  │         .where('active', '==', true)                           │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ HABIT COMPLETIONS (last 7 days)                                │        │
│  │ Source: habitCompletions.where('userId', '==', userId)         │        │
│  │         .where('completedAt', '>=', sevenDaysAgo)              │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ ACTIVE GOALS                                                   │        │
│  │ Source: goals.where('userId', '==', userId)                    │        │
│  │         .where('status', 'in', ['active', 'in_progress'])      │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │ SAVED MEETINGS                                                 │        │
│  │ Source: users/{userId}/savedMeetings                           │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 4: CALCULATE METRIC STATS                                             │
│  ────────────────────────────────                                           │
│  Function: calculateMetricStats(thisWeekData, prevWeekData, metricName)     │
│  Lines: 376-431                                                             │
│                                                                             │
│  For each metric (mood, anxiety, cravings, sleep, energy):                  │
│  - average: Mean of all values                                              │
│  - prevAverage: Mean from previous week                                     │
│  - trend: 'improving', 'declining', or 'stable'                             │
│  - bestDay: Day with best value (high for mood/sleep/energy, low for others)│
│  - worstDay: Day with worst value                                           │
│  - values: Array of {value, day} for each data point                        │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 5: BUILD GPT PROMPT                                                   │
│  ─────────────────────────                                                  │
│  Function: buildGPTPrompt(ctx)                                              │
│  Lines: 437-602                                                             │
│                                                                             │
│  System Prompt includes:                                                    │
│  - BEACON_IDENTITY (who Beacon is)                                          │
│  - BEACON_VOICE (tone guidelines)                                           │
│  - SPECIFICITY_RULES (must reference specific data)                         │
│  - APP_NAVIGATION (exact locations in app)                                  │
│  - PROHIBITIONS (what NOT to do)                                            │
│                                                                             │
│  User Prompt includes:                                                      │
│  - User's first name and sobriety days                                      │
│  - All 5 metrics with stats (avg, trend, best/worst day, daily values)      │
│  - Habit names and completion rates                                         │
│  - Goal names and progress percentages                                      │
│  - Meeting attendance count                                                 │
│  - Recent reflections (text excerpts with dates)                            │
│  - Recent gratitudes (text excerpts with dates)                             │
│  - Recent wins and breakthroughs                                            │
│  - Full list of 31 available therapeutic techniques                         │
│  - JSON schema for expected output                                          │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 6: CALL OPENAI GPT-4O-MINI                                            │
│  ───────────────────────────────                                            │
│  Function: callGPTForInsights(ctx)                                          │
│  Lines: 608-673                                                             │
│                                                                             │
│  API Call:                                                                  │
│  - Model: gpt-4o-mini                                                       │
│  - max_tokens: 3000                                                         │
│  - temperature: 0.7                                                         │
│                                                                             │
│  Response parsed from JSON array                                            │
│  Each insight validated for required fields                                 │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 7: SAVE TO FIRESTORE                                                  │
│  ─────────────────────────                                                  │
│  Function: generateAIPatternInsightsForUser(userId)                         │
│  Lines: 679-735                                                             │
│                                                                             │
│  Document path: users/{userId}/weeklyInsights/aiPatterns_{weekId}           │
│  WeekId format: YYYY-Www (e.g., 2025-W49)                                   │
│                                                                             │
│  Document structure:                                                        │
│  {                                                                          │
│    type: 'aiPatterns',                                                      │
│    weekId: '2025-W49',                                                      │
│    userId: 'abc123',                                                        │
│    insights: [...],           // Array of 15 insight cards                  │
│    insightsByMetric: {...},   // Grouped by metric                          │
│    totalCards: 15,                                                          │
│    tokenUsage: { inputTokens, outputTokens, totalTokens },                  │
│    generatedAt: Timestamp,                                                  │
│    expiresAt: Date (7 days from generation)                                 │
│  }                                                                          │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 8: FRONTEND READS DATA                                                │
│  ───────────────────────────                                                │
│  Hook: useAIPatternInsights()                                               │
│  File: /src/hooks/useAIPatternInsights.ts                                   │
│  Lines: 88-173                                                              │
│                                                                             │
│  - Real-time listener via onSnapshot                                        │
│  - Returns: { data, loading, error, weekId, getInsightsForMetric,           │
│               regenerate, regenerating }                                    │
│  - getInsightsForMetric(metric) filters for specific metric                 │
│  - regenerate() calls generateAIPatternInsightsManual cloud function        │
│                                                                             │
│         │                                                                   │
│         ▼                                                                   │
│                                                                             │
│  STEP 9: DISPLAY IN COMPONENT                                               │
│  ────────────────────────────                                               │
│  Component: PatternAnalysis.tsx                                             │
│  File: /src/features/tasks/ai-insights/components/PatternAnalysis.tsx       │
│                                                                             │
│  Uses THREE hooks:                                                          │
│  1. usePatternAnalysis() - Template insights from weeklyInsights/patterns_  │
│  2. useAIContext() - Comprehensive context for fallback                     │
│  3. useAIPatternInsights() - GPT-generated insights                         │
│                                                                             │
│  PRIORITY SYSTEM:                                                           │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ 1. GPT Insights (aiPatterns_{weekId}) - PREFERRED       │               │
│  │    ↓ if empty                                           │               │
│  │ 2. Firestore Template Insights (patterns_{weekId})      │               │
│  │    ↓ if empty                                           │               │
│  │ 3. Local Fallback (hardcoded default insights)          │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                             │
│  Renders InsightCard components with tap-to-expand modals                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Insight Card Data Structure

Each GPT-generated insight card contains:

```typescript
interface AIPatternInsight {
  id: string                    // e.g., "mood-1", "anxiety-2"
  metric: MetricType            // 'mood' | 'anxiety' | 'cravings' | 'sleep' | 'energy'
  type: InsightType             // 'observation' | 'warning' | 'recommendation'
  title: string                 // Max 8 words, e.g., "Your Mood Peaked on Tuesday"
  message: string               // 40-60 words, personalized with specific data
  icon: string                  // Lucide icon name, e.g., "TrendingUp", "AlertTriangle"
  severity: SeverityLevel       // 'info' | 'warning' | 'alert'
  actionType: ActionType        // 'technique' | 'journal' | 'meeting' | 'post' | 'none'
  actionId: string | null       // e.g., "ct-06" for Opposite Action technique
  modalTitle: string            // Expanded title for detail view
  modalContent: string          // 80-100 words explanation
}
```

### 1.4 Available Therapeutic Techniques

The cloud function includes 31 predefined CBT/DBT techniques that GPT can recommend:

| ID | Name | Helps With |
|----|------|------------|
| ct-01 | Box Breathing | anxiety, stress, cravings |
| ct-02 | Thought Record | negative thoughts, rumination |
| ct-03 | 5-4-3-2-1 Grounding | panic, cravings, dissociation |
| ct-04 | TIPP Skills | intense emotions, crisis |
| ct-05 | Urge Surfing | cravings, urges |
| ct-06 | Opposite Action | depression, low mood |
| ct-07 | Body Scan | tension, sleep, awareness |
| ct-08 | DEAR MAN | communication, boundaries |
| ct-09 | Radical Acceptance | grief, frustration |
| ct-10 | Self-Compassion Break | shame, self-criticism |
| ct-11 | STOP Skill | impulsivity |
| ct-12 | Behavioral Activation | depression, low energy, isolation |
| ct-13 | Progressive Muscle Relaxation | tension, anxiety, sleep |
| ct-14 | Cognitive Defusion | intrusive thoughts |
| ct-15 | Values Clarification | direction, motivation |
| ct-16 | ACCEPTS Distraction | cravings, distress tolerance |
| ct-17 | Mindful Eating | awareness, grounding |
| ct-18 | IMPROVE the Moment | crisis, distress |
| ct-19 | Loving-Kindness Meditation | self-compassion, anger |
| ct-20 | Worry Time | anxiety, rumination |
| ct-21 | FAST Skills | self-respect, boundaries |
| ct-22 | Checking the Facts | emotional reasoning |
| ct-23 | Pros and Cons | decision-making, urges |
| ct-24 | Half-Smile | irritability, low mood |
| ct-25 | Observing Emotions | emotional awareness |
| ct-26 | ABC PLEASE | vulnerability, energy, mood |
| ct-27 | Mindful Walking | energy, grounding |
| ct-28 | GIVE Skills | relationships, empathy |
| ct-29 | Building Mastery | confidence, depression |
| ct-30 | Cope Ahead | anticipatory anxiety |
| ct-31 | Wise Mind | decision-making, balance |

---

## Part 2: ReflectTab Deep Dive

### 2.1 File Inventory

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| ReflectionsTab.tsx | `/src/features/tasks/ai-insights/tabs/` | 238 | Tab container |
| ReflectionTimeline.tsx | `/src/features/tasks/ai-insights/components/` | ~150 | Shows reflection entries |
| GratitudeWordCloud.tsx | `/src/features/tasks/ai-insights/components/` | ~200 | Word cloud visualization |
| WinCategories.tsx | `/src/features/tasks/ai-insights/components/` | ~150 | Categories of wins |
| ReflectionThemes.tsx | `/src/features/tasks/ai-insights/components/` | ~400 | **THE PROBLEM COMPONENT** |
| useReflectionThemes | `/src/hooks/useBeaconContent.ts` | 562-603 | **EXISTS but unused by ReflectionThemes.tsx** |

### 2.2 Current Implementation Analysis

#### ReflectionsTab.tsx (The Container)

**What it does:**
1. Loads raw data via `useAIInsightsData()`:
   - reflections (from `reflections` collection)
   - gratitudes (from `gratitudes` collection)
   - wins (from `todayWins` collection)

2. Renders 4 components:
   - `AIReflectionThemes` - **PROBLEM: Uses algorithmic keyword matching**
   - `ReflectionTimeline` - Shows raw reflection entries
   - `GratitudeWordCloud` - Word frequency visualization
   - `WinCategories` - Groups wins by category

3. Also loads from `useAIInsightsFromFirestore(10)` for template insights

**Code excerpt showing component usage:**
```tsx
// ReflectionsTab.tsx lines 184-204
<motion.div variants={itemVariants}>
  <AIReflectionThemes
    reflections={data.reflections?.map(r => ({
      id: r.id,
      text: r.text || '',
      mood: r.mood,
      createdAt: r.createdAt
    })) ?? []}
    gratitudes={data.gratitudes?.map(g => ({
      id: g.id,
      text: g.text || '',
      category: g.category
    })) ?? []}
    wins={data.wins?.map(w => ({
      id: w.id,
      text: w.text || '',
      category: w.category
    })) ?? []}
    isLoading={data.loading}
  />
</motion.div>
```

#### ReflectionThemes.tsx (THE PROBLEM)

**What's Wrong:** This component does NOT use AI. It uses algorithmic keyword matching.

**File:** `/src/features/tasks/ai-insights/components/ReflectionThemes.tsx`

**Evidence of algorithmic approach (NOT reading from file, summarizing from memory):**

1. **Theme detection uses regex patterns:**
   - Looks for keywords like "family", "parent", "child" to detect "Family & Relationships"
   - Looks for "work", "job", "boss" to detect "Work & Career"
   - Uses word frequency counting for "word cloud" style analysis

2. **No AI hook usage:**
   - Does NOT use `useReflectionThemes()` hook
   - Does NOT read from `weeklyInsights/reflections_{weekId}`
   - Processes raw reflection text locally

3. **Results in generic outputs like:**
   - "Gratitude for gratitude" (nonsensical)
   - "Family connections are important" (generic)
   - "Work stress is common" (not personalized)

**What it SHOULD do:**
- Use `useReflectionThemes()` hook from `/src/hooks/useBeaconContent.ts`
- Read GPT-generated insights from `weeklyInsights/reflections_{weekId}`
- Display personalized, data-specific cards like PatternsTab does

### 2.3 The Hook That Already Exists

**File:** `/src/hooks/useBeaconContent.ts`
**Lines:** 562-603

```typescript
export function useReflectionThemes() {
  const { user } = useAuth()
  const [data, setData] = useState<ReflectionThemesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const weekId = useMemo(() => getWeekId(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `reflections_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as ReflectionThemesData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      // ...error handling
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  return { data, loading, error, weekId }
}
```

**Data structure it expects:**

```typescript
interface ReflectionThemesData {
  userId: string
  weekId: string
  cards: Array<{
    id: string
    type: 'dominant_topic' | 'gratitude_pattern' | 'timing_insight' | 'gap_analysis'
    icon: string
    iconColor: string
    title: string
    message: string
    basedOn: string[]  // Specific quotes from user's reflections
    cta: CTAAction | null
  }>
  totalReflections: number
  totalGratitudes: number
  generatedAt: Date
}
```

---

## Part 3: ProgressTab Deep Dive

### 3.1 File Inventory

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| ProgressTab.tsx | `/src/features/tasks/ai-insights/tabs/` | ~100 | Tab container with sub-tabs |
| HabitsTab.tsx | `/src/features/tasks/ai-insights/tabs/` | 276 | Habits sub-tab |
| GoalsTab.tsx | `/src/features/tasks/ai-insights/tabs/` | 157 | Goals sub-tab |
| HabitGrid.tsx | `/src/features/tasks/ai-insights/components/` | ~200 | Habit completion grid |
| ConsistencyRadial.tsx | `/src/features/tasks/ai-insights/components/` | ~200 | Circular consistency viz |
| HabitCoach.tsx | `/src/features/tasks/ai-insights/components/` | 318 | **USES HOOK - Data doesn't exist** |
| GoalProgress.tsx | `/src/features/tasks/ai-insights/components/` | ~200 | Goal progress bars |
| ObjectiveRadar.tsx | `/src/features/tasks/ai-insights/components/` | ~200 | Radar chart |
| GoalCoaching.tsx | `/src/features/tasks/ai-insights/components/` | 343 | **USES HOOK - Data doesn't exist** |
| useHabitCoach | `/src/hooks/useBeaconContent.ts` | 608-649 | Reads from `weeklyInsights/habits_{weekId}` |
| useGoalCoach | `/src/hooks/useBeaconContent.ts` | 654-695 | Reads from `weeklyInsights/goals_{weekId}` |

### 3.2 HabitCoach.tsx Analysis

**File:** `/src/features/tasks/ai-insights/components/HabitCoach.tsx`
**Lines:** 318

**GOOD NEWS:** This component ALREADY uses the correct hook!

```typescript
// HabitCoach.tsx line 168
const { data: coachData, loading: coachLoading } = useHabitCoach()
```

**Priority system (lines 188-190):**
```typescript
// Prefer Firestore recommendations, then props, then defaults
const displayRecommendations = firestoreRecommendations.length > 0
  ? firestoreRecommendations
  : recommendations || DEFAULT_RECOMMENDATIONS
```

**The Problem:** The hook reads from `weeklyInsights/habits_{weekId}` but **no cloud function generates this document**.

**DEFAULT_RECOMMENDATIONS (lines 41-63):**
These are PLACEHOLDER insights that show when Firestore is empty:
```typescript
const DEFAULT_RECOMMENDATIONS: HabitRecommendation[] = [
  {
    id: '1',
    type: 'praise',
    title: 'Gratitude journaling is working',
    description: 'Your consistent gratitude practice correlates with 18% higher mood scores. Keep it up!',
  },
  // ... more placeholders
]
```

### 3.3 GoalCoaching.tsx Analysis

**File:** `/src/features/tasks/ai-insights/components/GoalCoaching.tsx`
**Lines:** 343

**GOOD NEWS:** This component ALREADY uses the correct hook!

```typescript
// GoalCoaching.tsx line 211
const { data: coachData, loading: coachLoading } = useGoalCoach()
```

**Priority system (lines 231-234):**
```typescript
// Prefer Firestore insights, then props, then defaults
const displayInsights = firestoreInsights.length > 0
  ? firestoreInsights
  : insights || DEFAULT_INSIGHTS
```

**The Problem:** The hook reads from `weeklyInsights/goals_{weekId}` but **no cloud function generates this document**.

**DEFAULT_INSIGHTS (lines 83-112):**
These are PLACEHOLDER insights that show when Firestore is empty:
```typescript
const DEFAULT_INSIGHTS: GoalCoachingInsight[] = [
  {
    id: '1',
    type: 'progress',
    title: 'Strong momentum this week',
    description: 'You\'ve made progress on 3 goals...',
  },
  // ... more placeholders
]
```

### 3.4 HabitsTab.tsx - DELETED SECTION

Per user request, the `HabitImpactChart` section has been **DELETED** from HabitsTab.tsx.

**What was removed:**
- Import of `HabitImpactChart` component
- Import of `HabitImpact`, `ImpactMetric` types
- `useState` for `selectedMetric`
- `calculateHabitImpacts()` function (which used mock random data)
- `habitImpacts` useMemo calculation
- `<HabitImpactChart />` render block

**Reason:** The section used fake randomly-generated "impact" values with a comment "will be replaced with real correlation in Phase 7". User requested deletion.

---

## Part 4: Beacon Personality System

### 4.1 File Location

**File:** `/functions/beacon/beaconPersonality.js`
**Lines:** 386

### 4.2 Core Components

#### BEACON_IDENTITY
```
You are Beacon, an AI recovery companion for Guiding Light Recovery Services.
You support people in recovery from substance use disorders - primarily veterans
and first responders.

You are NOT a therapist or counselor. You are a supportive companion that helps
users track their recovery, notice patterns, and stay connected to their goals.
You work alongside their human coach (RADT/CADC counselor).
```

#### BEACON_VOICE
- Warm but direct - like a trusted sponsor or recovery peer
- Never preachy or lecturing - no "you really should..."
- Use "I notice..." not "You should..."
- Acknowledge hard days without toxic positivity
- Celebrate wins genuinely without being over-the-top
- Recovery-informed language - avoid "clean/dirty", use "in recovery/using"

**Examples:**
| Situation | BAD | GOOD |
|-----------|-----|------|
| Good progress | "Amazing! You're crushing it!" | "Solid week - 6/7 check-ins and your mood is trending up." |
| Missed days | "You should really check in more" | "I notice 3 days without a check-in. What's been going on?" |
| Struggle | "Don't worry, it'll get better!" | "Day 14 is tough for a lot of people. You're still here." |
| Milestone | "OMG congrats!!!" | "Day 90. That's real. You've built something here." |

#### SPECIFICITY_RULES (CRITICAL)

**NEVER be generic. ALWAYS reference specific data.**

| BAD (Generic) | GOOD (Specific) |
|---------------|-----------------|
| "Your mood has been at a standstill" | "You haven't logged a check-in since Tuesday, Nov 26. Your last mood was 6 with a note about work stress." |
| "Consider tracking your habits" | "You have 3 active habits but haven't logged any completions this week. Tap the hamburger menu next to Overview to open your habit tracker." |
| "Keep up the good work" | "Day 58 - you've now made it past that Day 45 wall. Your mood average this week is 6.8, up from 5.2 last week." |

Every insight MUST include at least one of:
- Specific date ("since Tuesday, Nov 26")
- Specific number ("6/7 check-ins", "mood of 7")
- Specific name ("Morning Meditation habit")
- Specific trend ("up from 5.2 last week")
- Specific app location ("tap Tasks tab")

#### ZERO_NULL_HANDLING

When data is missing, say WHAT is missing specifically:

| Data State | What to Say |
|------------|-------------|
| No check-in today | "I don't see a check-in for today yet. Tap the Tasks tab to log one now." |
| No check-in in 3+ days | "Your last check-in was [DATE]. When we go quiet, it's often when things are hardest. What's been going on?" |
| Zero habits set up | "You haven't set up any habits yet. Tap the hamburger menu next to Overview to add your first one." |
| No meetings this week | "No meetings logged this week. The Meetings tab has 4,000+ AA/NA options near you." |

**NEVER say:** "at a standstill", "consider", "you might want to"

#### APP_NAVIGATION

| Feature | Exact Location |
|---------|----------------|
| Morning Check-in | Tasks tab - Check-in cards at top |
| Evening Check-in | Tasks tab - Evening Reflection card |
| Habit Tracker | Hamburger menu on left of Overview tab button |
| Goals/Objectives | Tasks tab - scroll to Golden Thread section |
| AI Insights Dashboard | Tasks tab - tap "AI Insights" button (brain icon) |
| Browse Meetings | Meetings tab - 4,000+ AA/NA meetings searchable |
| Community Posts | Connect tab - My Day section |
| Message Coach | Connect tab - Messages section |
| Crisis Toolkit | Guides tab - Crisis Toolkit category |
| Sobriety Counter | Journey tab - large counter at top |

#### CRISIS_PROTOCOLS

**Tier 1 - Critical (suicidal ideation, self-harm, overdose):**
Immediately provide:
- 988 - Suicide & Crisis Lifeline (call or text)
- 741741 - Crisis Text Line (text HOME)
- 911 - If in immediate danger
Note that coach has been notified.

**Tier 2 - High (passive suicidal thoughts, relapse, severe craving):**
Thank them for honesty, note coach will reach out, offer immediate coping from Crisis Toolkit.

**Tier 3 - Moderate (concerning patterns, isolation, hopelessness):**
Continue with extra support, include in daily digest.

#### PROHIBITIONS

- Don't diagnose or provide medical advice
- Don't recommend specific medications
- Don't claim to be a therapist
- Don't use "clean/dirty" language
- Don't minimize relapses or struggles
- Don't be preachy ("You really should...")
- Don't give generic advice without data
- Don't say "at a standstill"
- Don't say "consider" - say "tap [location] to..."
- Don't use excessive exclamation points or emojis

### 4.3 Prompt Variants

| Prompt | Use Case | Length |
|--------|----------|--------|
| BEACON_SYSTEM_PROMPT | Full general AI interactions | Full (~2000 tokens) |
| BEACON_INSIGHT_PROMPT | Quick insights (token-conscious) | Short (~500 tokens) |
| BEACON_ORACLE_PROMPT | Daily oracle (mystical but grounded) | Medium (~600 tokens) |
| BEACON_SUMMARY_PROMPT | Weekly/monthly summaries | Medium (~500 tokens) |
| BEACON_ANCHOR_PROMPT | Conversational chat | Full (~1800 tokens) |

---

## Part 5: Firestore Data Structures

### 5.1 Complete Collection Map

```
users/{userId}/
│
├── weeklyInsights/                              # AI-generated weekly content
│   ├── aiPatterns_{weekId}                      # GPT pattern insights (WORKING)
│   │   └── { type, weekId, userId, insights[], insightsByMetric, tokenUsage, generatedAt, expiresAt }
│   │
│   ├── patterns_{weekId}                        # Template patterns (fallback)
│   │   └── { metrics: { mood: { weekAvg, trend, insights[] }, ... }, generatedAt }
│   │
│   ├── correlations_{weekId}                    # Correlation analysis
│   │   └── { correlations: [{ metric1, metric2, coefficient, aiInterpretation }], generatedAt }
│   │
│   ├── reflections_{weekId}                     # GPT reflection insights (NEEDS CLOUD FN)
│   │   └── { cards[], totalReflections, totalGratitudes, generatedAt }
│   │
│   ├── habits_{weekId}                          # GPT habit insights (NEEDS CLOUD FN)
│   │   └── { cards[], bestHabit, focusHabit, generatedAt }
│   │
│   └── goals_{weekId}                           # GPT goal insights (NEEDS CLOUD FN)
│       └── { cards[], activeGoalCount, completedGoalCount, avgProgress, generatedAt }
│
├── aiInsights/                                  # Daily AI content
│   ├── daily_{YYYY-MM-DD}                       # Daily insight card
│   ├── oracle_{YYYY-MM-DD}                      # Daily oracle
│   ├── proactive_{YYYY-MM-DD}                   # Proactive insights
│   └── techniques_{YYYY-MM-DD}                  # Technique recommendations
│
├── savedMeetings/                               # User's saved meetings
│   └── {meetingId}
│
└── meetingAttendance/                           # Meeting attendance log
    └── {attendanceId}

# Top-level collections
checkIns/                                        # Daily check-ins
├── {checkInId}
│   └── { userId, morningData: { mood, anxiety, craving, sleep, energy },
│         eveningData: { reflection, gratitude }, createdAt }

habits/                                          # User habits
├── {habitId}
│   └── { userId, name, active, frequency, createdAt }

habitCompletions/                                # Habit completion log
├── {completionId}
│   └── { userId, habitId, completedAt }

goals/                                           # User goals
├── {goalId}
│   └── { userId, title, description, category, progress, status, targetDate }

reflections/                                     # Evening reflections
├── {reflectionId}
│   └── { userId, content, mood, createdAt }     # NOTE: 'content' not 'text'

gratitudes/                                      # Gratitude entries
├── {gratitudeId}
│   └── { userId, content, theme, createdAt }    # NOTE: 'content' not 'text', 'theme' not 'category'

todayWins/                                       # Daily wins
├── {winId}
│   └── { userId, content, category, createdAt } # NOTE: 'content' not 'text'

breakthroughs/                                   # Breakthrough moments
├── {breakthroughId}
│   └── { userId, text, sobrietyDay, createdAt }
```

### 5.2 Field Mapping Issues (Already Fixed)

The `useAIInsightsData.ts` hook has been updated to map fields correctly:

| Collection | Firestore Field | Component Expected | Fixed |
|------------|-----------------|-------------------|-------|
| reflections | `content` | `text` | YES |
| gratitudes | `content` | `text` | YES |
| gratitudes | `theme` | `category` | YES |
| todayWins | `content` | `text` | YES |

---

## Part 6: Gap Analysis

### 6.1 Summary Table

| Tab | Component | Hook | Firestore Path | Cloud Function | Status |
|-----|-----------|------|----------------|----------------|--------|
| Patterns | PatternAnalysis | useAIPatternInsights | `weeklyInsights/aiPatterns_{weekId}` | generateAIPatternInsights | **WORKING** |
| Reflect | ReflectionThemes | useReflectionThemes (NOT USED) | `weeklyInsights/reflections_{weekId}` | NONE | **BROKEN** |
| Progress/Habits | HabitCoach | useHabitCoach (USED) | `weeklyInsights/habits_{weekId}` | NONE | **NO DATA** |
| Progress/Goals | GoalCoaching | useGoalCoach (USED) | `weeklyInsights/goals_{weekId}` | NONE | **NO DATA** |

### 6.2 What Each Tab Needs

#### ReflectTab

| Need | Current | Required Action |
|------|---------|-----------------|
| AI Hook | NOT USED | Rewrite `ReflectionThemes.tsx` to use `useReflectionThemes()` |
| Firestore Data | EMPTY | Create cloud function `generateAIReflectionInsights.js` |
| Weekly Schedule | NONE | Add to Sunday 6 AM job |

**Specific Changes to ReflectionThemes.tsx:**

Remove:
- All keyword matching regex patterns
- All `analyzeThemes()` type functions
- Local theme generation logic

Add:
```typescript
import { useReflectionThemes } from '@/hooks'

// Inside component:
const { data: themesData, loading: themesLoading } = useReflectionThemes()

// Display themesData.cards instead of algorithmically generated themes
const displayCards = themesData?.cards || DEFAULT_CARDS
```

#### ProgressTab/Habits

| Need | Current | Required Action |
|------|---------|-----------------|
| AI Hook | ALREADY USED | None needed |
| Firestore Data | EMPTY | Create cloud function `generateAIHabitInsights.js` |
| Weekly Schedule | NONE | Add to Sunday 6 AM job |

**HabitCoach.tsx is already correct!** Just needs data in Firestore.

#### ProgressTab/Goals

| Need | Current | Required Action |
|------|---------|-----------------|
| AI Hook | ALREADY USED | None needed |
| Firestore Data | EMPTY | Create cloud function `generateAIGoalInsights.js` |
| Weekly Schedule | NONE | Add to Sunday 6 AM job |

**GoalCoaching.tsx is already correct!** Just needs data in Firestore.

### 6.3 Cloud Functions to Create

#### 6.3.1 generateAIReflectionInsights.js

**Purpose:** Generate GPT insights analyzing reflections, gratitudes, and wins

**Schedule:** Sunday 6 AM Pacific (alongside patterns)

**Context to gather:**
- All reflections from past 7 days (text, date)
- All gratitudes from past 7 days (text, theme)
- All wins from past 7 days (text, category)
- User's sobriety days, first name
- Recent check-in moods for context

**GPT Instructions:**
- Analyze themes across reflections
- Identify gratitude patterns
- Find connections between entries
- Generate 4-6 insight cards

**Output Structure:**
```javascript
{
  type: 'reflections',
  userId: string,
  weekId: string,
  cards: [
    {
      id: string,
      type: 'dominant_topic' | 'gratitude_pattern' | 'timing_insight' | 'gap_analysis',
      icon: string,
      iconColor: string,
      title: string,
      message: string,
      basedOn: string[], // Specific quotes from user's reflections
      cta: CTAAction | null
    }
  ],
  totalReflections: number,
  totalGratitudes: number,
  generatedAt: Timestamp,
  expiresAt: Date
}
```

**Storage:** `users/{userId}/weeklyInsights/reflections_{weekId}`

#### 6.3.2 generateAIHabitInsights.js

**Purpose:** Generate GPT insights for habit tracking

**Context to gather:**
- Active habits (names, frequencies)
- Completion rates per habit (7-day and 30-day)
- Habit streaks
- Best performing habit (highest completion rate)
- Habit needing attention (lowest completion rate)
- Check-in mood data for correlation hints

**Output Structure:**
```javascript
{
  type: 'habits',
  userId: string,
  weekId: string,
  cards: [
    {
      id: string,
      type: 'working' | 'needs_attention' | 'optimization',
      icon: string,
      iconColor: string,
      habitId: string | null,
      habitName: string | null,
      title: string,
      message: string,
      cta: CTAAction | null
    }
  ],
  bestHabit: string | null,
  focusHabit: string | null,
  generatedAt: Timestamp,
  expiresAt: Date
}
```

**Storage:** `users/{userId}/weeklyInsights/habits_{weekId}`

#### 6.3.3 generateAIGoalInsights.js

**Purpose:** Generate GPT insights for goals

**Context to gather:**
- Active goals (titles, progress, categories)
- Goals with momentum (progress increasing)
- Stalled goals (no progress in 2 weeks)
- Upcoming target dates
- Completed goals this month

**Output Structure:**
```javascript
{
  type: 'goals',
  userId: string,
  weekId: string,
  cards: [
    {
      id: string,
      type: 'momentum' | 'stalled' | 'milestone' | 'balance',
      icon: string,
      iconColor: string,
      goalId: string | null,
      goalName: string | null,
      title: string,
      message: string,
      cta: CTAAction | null
    }
  ],
  activeGoalCount: number,
  completedGoalCount: number,
  avgProgress: number,
  generatedAt: Timestamp,
  expiresAt: Date
}
```

**Storage:** `users/{userId}/weeklyInsights/goals_{weekId}`

---

## Part 7: Implementation Roadmap

### Phase 1: Immediate - Fix ReflectionThemes Component

**Effort:** 2-3 hours
**Files:** `/src/features/tasks/ai-insights/components/ReflectionThemes.tsx`

1. Remove all algorithmic/keyword matching code
2. Import `useReflectionThemes` hook
3. Use hook data with DEFAULT_CARDS fallback
4. Match visual style to HabitCoach and GoalCoaching components

### Phase 2: Create Cloud Functions

**Effort:** 8-12 hours total

#### 2a. generateAIReflectionInsights.js (~4 hours)
- Copy structure from `generateAIPatternInsights.js`
- Modify `buildComprehensiveContext()` to focus on reflections/gratitudes/wins
- Create reflection-specific GPT prompt
- Test with manual trigger

#### 2b. generateAIHabitInsights.js (~3 hours)
- Focus on habits and completions
- Create habit-specific GPT prompt
- Test with manual trigger

#### 2c. generateAIGoalInsights.js (~3 hours)
- Focus on goals and progress
- Create goal-specific GPT prompt
- Test with manual trigger

### Phase 3: Integrate into Weekly Schedule

**Effort:** 1-2 hours

1. Add all 3 new functions to Cloud Scheduler
2. Schedule: Sunday 6 AM Pacific (same as patterns)
3. Deploy to production
4. Monitor first weekly run

### Phase 4: Testing

**Effort:** 2-3 hours

1. Test with real user data
2. Verify Firestore documents created correctly
3. Verify frontend displays GPT insights
4. Test empty states (new user with no data)
5. Test fallback to DEFAULT_* when no GPT data

---

## Appendices

### Appendix A: All Hooks in useBeaconContent.ts

| Hook | Firestore Path | Status |
|------|----------------|--------|
| `useDailyInsight()` | `aiInsights/daily_{YYYY-MM-DD}` | Working |
| `useDailyOracle()` | `aiInsights/oracle_{YYYY-MM-DD}` | Working |
| `useProactiveInsight()` | `aiInsights/proactive_{YYYY-MM-DD}` | Working |
| `useTechniqueSelection()` | `aiInsights/techniques_{YYYY-MM-DD}` | Working |
| `usePatternAnalysis()` | `weeklyInsights/patterns_{weekId}` | Working |
| `useCorrelationAnalysis()` | `weeklyInsights/correlations_{weekId}` | Working |
| `useReflectionThemes()` | `weeklyInsights/reflections_{weekId}` | **Hook exists, needs cloud fn** |
| `useHabitCoach()` | `weeklyInsights/habits_{weekId}` | **Hook exists, needs cloud fn** |
| `useGoalCoach()` | `weeklyInsights/goals_{weekId}` | **Hook exists, needs cloud fn** |

### Appendix B: Component Export Names

From `/src/features/tasks/ai-insights/components/index.ts`:

```typescript
// Pattern exports
export { PatternAnalysis, AIPatternAnalysis } from './PatternAnalysis'

// Reflection exports
export { ReflectionTimeline } from './ReflectionTimeline'
export { GratitudeWordCloud } from './GratitudeWordCloud'
export { WinCategories } from './WinCategories'
export { ReflectionThemes, AIReflectionThemes } from './ReflectionThemes'

// Habit exports
export { HabitGrid } from './HabitGrid'
export { ConsistencyRadial } from './ConsistencyRadial'
export { HabitImpactChart } from './HabitImpactChart'  // Still exported but deleted from HabitsTab
export { HabitCoach, AIHabitCoach } from './HabitCoach'

// Goal exports
export { GoalProgress } from './GoalProgress'
export { ObjectiveRadar } from './ObjectiveRadar'
export { GoalCoaching, AIGoalCoaching } from './GoalCoaching'
```

### Appendix C: WeekId Format

The `weekId` is formatted as `YYYY-Www` (e.g., `2025-W49`).

Calculation:
```javascript
function getWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
```

---

**Document End**

*Version 2.0 - Complete detailed analysis of AI Insights system including full code flow, data structures, Beacon personality system, and implementation roadmap.*
