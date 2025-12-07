# AI Insights Tab Restructure - Analysis Document

**Date:** December 3, 2025
**Status:** Awaiting Approval
**Estimated Implementation Time:** 2-3 hours

---

## Executive Summary

Reorganizing AI Insights from **6 tabs to 5 tabs** by:
1. Renaming "Overview" → "Dashboard"
2. Renaming "Beacon" → "Patterns" (Beacon is the brand, not a feature name)
3. Merging "Habits" + "Goals" → "Progress"
4. Keeping "Reflect" and "Anchor" unchanged

---

## Part 1: Current Component Inventory

### Tab 1: Overview (`OverviewTab.tsx`)
| Component | File Location | Data Displayed |
|-----------|---------------|----------------|
| `AIInsightCard` | `components/AIInsightCard.tsx` | AI-generated daily insight based on patterns |
| `RecoveryTimeCard` | Internal to OverviewTab | Sobriety days, progress to next milestone |
| `TodayMetricsGrid` | `components/TodayMetricsGrid.tsx` | Today's mood, anxiety, craving, sleep vs averages |
| `StreakBar` | `components/StreakBar.tsx` | Check-in streak, habit streak, meeting streak |
| `QuickActions` | `components/QuickActions.tsx` | Quick action buttons |

### Tab 2: Beacon/Patterns (`PatternsTab.tsx`)
| Component | File Location | Data Displayed |
|-----------|---------------|----------------|
| `MetricSelector` | `components/MetricSelector.tsx` | Mood/Anxiety/Craving/Sleep/Energy pills |
| Pattern Summary | Internal to PatternsTab | 30-day average, trend, best day |
| `InteractiveChart` | `components/InteractiveChart.tsx` | Line/area chart with 7D/14D/30D toggle |
| `CalendarHeatmap` | `components/CalendarHeatmap.tsx` | 90-day GitHub-style activity heatmap |
| `CorrelationCards` | `components/CorrelationCards.tsx` | Sleep→Mood, Anxiety→Cravings correlations |
| `AIPatternAnalysis` | `components/AIPatternAnalysis.tsx` | AI-generated pattern insights |

### Tab 3: Habits (`HabitsTab.tsx`)
| Component | File Location | Data Displayed |
|-----------|---------------|----------------|
| `ConsistencyRadial` | `components/ConsistencyRadial.tsx` | Overall consistency % radial gauge |
| `HabitGrid` | `components/HabitGrid.tsx` | 7-day habit completion grid |
| `HabitImpactChart` | `components/HabitImpactChart.tsx` | Habit impact on mood/energy/sleep/anxiety |
| `AIHabitCoach` | `components/AIHabitCoach.tsx` | AI habit coaching insights |

### Tab 4: Reflect (`ReflectionsTab.tsx`)
| Component | File Location | Data Displayed |
|-----------|---------------|----------------|
| `AIReflectionThemes` | `components/AIReflectionThemes.tsx` | AI-identified reflection themes |
| `ReflectionTimeline` | `components/ReflectionTimeline.tsx` | Recent reflections timeline |
| `GratitudeWordCloud` | `components/GratitudeWordCloud.tsx` | Word cloud from gratitude entries |
| `WinCategories` | `components/WinCategories.tsx` | Wins organized by category |
| `BreakthroughHighlights` | `components/BreakthroughHighlights.tsx` | Breakthrough moments |

### Tab 5: Goals (`GoalsTab.tsx`)
| Component | File Location | Data Displayed |
|-----------|---------------|----------------|
| `AIGoalCoaching` | `components/AIGoalCoaching.tsx` | AI goal coaching insights |
| `GoalProgress` | `components/GoalProgress.tsx` | Goal progress bars |
| `ObjectiveRadar` | `components/ObjectiveRadar.tsx` | Goals by category radar chart |
| `MilestoneTimeline` | `components/MilestoneTimeline.tsx` | Sobriety milestone timeline |
| `AssignmentList` | `components/AssignmentList.tsx` | Coach assignments list |

### Tab 6: Anchor (`AnchorTab.tsx`)
| Component | File Location | Data Displayed |
|-----------|---------------|----------------|
| `HeroSection` | Internal to AnchorTab | Greeting, sobriety days |
| `SoftResources` | `components/SoftResources.tsx` | Soft crisis resources (inline) |
| `DailyOracle` | `anchor/DailyOracle.tsx` | Daily inspiration |
| `PromptCards` | `anchor/PromptCards.tsx` | Conversation prompt cards |
| `VoiceCompanion` | `anchor/VoiceCompanion.tsx` | Voice AI companion |
| `StoryMode` | `anchor/StoryMode.tsx` | Story mode feature |
| `GuidedCheckin` | `anchor/GuidedCheckin.tsx` | Guided check-in |
| `CrisisModal` | `components/CrisisModal.tsx` | Crisis modal (overlay) |
| `SafetyPlan` | `components/SafetyPlan.tsx` | Safety plan modal |

---

## Part 2: Migration Mapping

### New Tab Structure (5 tabs)

| # | New Tab | Old Tab | Changes |
|---|---------|---------|---------|
| 1 | **Dashboard** | Overview | Rename only - no component changes |
| 2 | **Patterns** | Beacon | Rename only - no component changes |
| 3 | **Reflect** | Reflect | No changes |
| 4 | **Progress** | Habits + Goals | NEW - Merge two tabs |
| 5 | **Anchor** | Anchor | No changes |

### Progress Tab Layout (NEW)

```
┌──────────────────────────────────────────────┐
│  PROGRESS TAB                                │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  HABITS SECTION                         │ │
│  │  ────────────────                       │ │
│  │  ConsistencyRadial                      │ │
│  │  HabitGrid                              │ │
│  │  HabitImpactChart                       │ │
│  │  AIHabitCoach                           │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  GOALS SECTION                          │ │
│  │  ─────────────                          │ │
│  │  AIGoalCoaching                         │ │
│  │  GoalProgress                           │ │
│  │  MilestoneTimeline                      │ │
│  │  AssignmentList                         │ │
│  └─────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

**Note:** `ObjectiveRadar` (radar chart) will be REMOVED from Progress tab. It's visually complex and adds little value in a merged view. The other components provide sufficient goal visibility.

---

## Part 3: Files That Need Changes

### Files to MODIFY

| File | Change Type | Description |
|------|-------------|-------------|
| `src/features/insights/AIInsightsContent.tsx` | Config | Update TAB_CONFIGS: rename Overview→Dashboard, Beacon→Patterns, remove Habits/Goals, add Progress |
| `src/features/tasks/ai-insights/types.ts` | Type | Update `AIInsightTab` type union |
| `src/features/tasks/ai-insights/tabs/index.ts` | Export | Add ProgressTabPlaceholder export, keep others |

### Files to CREATE

| File | Description |
|------|-------------|
| `src/features/tasks/ai-insights/tabs/ProgressTab.tsx` | New merged tab with Habits + Goals content |

### Files to KEEP (No Changes)

| File | Reason |
|------|--------|
| `OverviewTab.tsx` | Content unchanged, only TAB_CONFIG label changes |
| `PatternsTab.tsx` | Content unchanged, only TAB_CONFIG label changes |
| `ReflectionsTab.tsx` | No changes |
| `AnchorTab.tsx` | No changes |
| All component files | No changes to individual components |

### Files to DEPRECATE (Not Delete)

| File | Reason |
|------|--------|
| `HabitsTab.tsx` | Replaced by Progress tab - keep for reference |
| `GoalsTab.tsx` | Replaced by Progress tab - keep for reference |

---

## Part 4: Implementation Steps

### Step 1: Update Type Definition (2 min)
```typescript
// types.ts - Change from:
export type AIInsightTab = 'overview' | 'patterns' | 'habits' | 'reflections' | 'goals' | 'anchor'

// To:
export type AIInsightTab = 'dashboard' | 'patterns' | 'reflect' | 'progress' | 'anchor'
```

### Step 2: Create ProgressTab.tsx (30 min)
- Copy layout structure from HabitsTab.tsx
- Add section header "Habits"
- Import all Habits components
- Add section header "Goals"
- Import all Goals components (except ObjectiveRadar)
- Test data flow

### Step 3: Update TAB_CONFIGS (10 min)
```typescript
// AIInsightsContent.tsx
const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'AI-powered daily summary',
  },
  {
    id: 'patterns',
    label: 'Patterns',
    shortLabel: 'Patterns',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Mood, anxiety, and behavior patterns',
  },
  {
    id: 'reflect',
    label: 'Reflect',
    shortLabel: 'Reflect',
    icon: <BookHeart className="h-4 w-4" />,
    description: 'Gratitude and reflection themes',
  },
  {
    id: 'progress',
    label: 'Progress',
    shortLabel: 'Progress',
    icon: <Target className="h-4 w-4" />,
    description: 'Habits, goals, and milestones',
  },
  {
    id: 'anchor',
    label: 'Anchor',
    shortLabel: 'Anchor',
    icon: <Anchor className="h-4 w-4" />,
    description: 'AI recovery companion',
  },
]
```

### Step 4: Update renderTabContent Switch (5 min)
```typescript
const renderTabContent = () => {
  switch (activeTab) {
    case 'dashboard':
      return <OverviewTabPlaceholder data={data} />
    case 'patterns':
      return <PatternsTabPlaceholder data={data} />
    case 'reflect':
      return <ReflectionsTabPlaceholder data={data} />
    case 'progress':
      return <ProgressTabPlaceholder data={data} />
    case 'anchor':
      return <AnchorTabPlaceholder data={data} />
    default:
      return <OverviewTabPlaceholder data={data} />
  }
}
```

### Step 5: Update tabs/index.ts (2 min)
```typescript
export { OverviewTabPlaceholder } from './OverviewTab'
export { PatternsTabPlaceholder } from './PatternsTab'
export { ReflectionsTabPlaceholder } from './ReflectionsTab'
export { ProgressTabPlaceholder } from './ProgressTab'  // NEW
export { AnchorTabPlaceholder, AnchorTab } from './AnchorTab'
// Keep HabitsTab and GoalsTab exports for backward compatibility
```

### Step 6: Build & Test (15 min)
- Run `npm run build`
- Fix any TypeScript errors
- Deploy to Firebase
- Test all 5 tabs on mobile

---

## Part 5: What's NOT Changing

| Item | Status |
|------|--------|
| Individual component functionality | No changes |
| Data sources | No changes |
| Firestore queries | No changes |
| AI insight generation | No changes |
| Crisis detection | No changes |
| "Powered by Beacon" branding | Stays in footer |
| Loading screen | No changes |

---

## Part 6: Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TypeScript errors after type change | Medium | Thorough find/replace |
| Missing imports in new Progress tab | Low | Copy from existing tabs |
| Tab navigation breaks | Low | Test each tab after changes |
| Data not flowing to Progress tab | Low | Use same pattern as other tabs |

---

## Approval Checklist

- [ ] Tab rename makes sense: Overview → Dashboard, Beacon → Patterns
- [ ] Merging Habits + Goals into Progress is acceptable
- [ ] Removing ObjectiveRadar from merged view is OK
- [ ] 5-tab structure approved
- [ ] Proceed with implementation

---

## Ready for Implementation

Upon approval, implementation will proceed in the order specified above. Expected completion: 2-3 hours including testing and deployment.
