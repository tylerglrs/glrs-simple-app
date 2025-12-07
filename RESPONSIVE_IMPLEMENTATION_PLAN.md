# RESPONSIVE IMPLEMENTATION PLAN - PIR Portal Mobile Overhaul

**Version:** 1.0
**Created:** December 2, 2025
**Based On:** MOBILE_RESEARCH.md + MOBILE_AUDIT_REPORT.md

---

## OVERVIEW

This document outlines the phased implementation plan to bring the PIR Portal to full mobile responsiveness. The plan prioritizes critical user flows and addresses the most impactful issues first.

### Goals
1. Zero horizontal overflow on any mobile device (320px minimum)
2. All touch targets minimum 44x44px
3. Text minimum 12px (prefer 14px for body)
4. Consistent responsive patterns across all components
5. Performance maintained (no excessive re-renders)

### Success Metrics
- 0 horizontal scrollbars on mobile (except intentional carousels)
- 100% of interactive elements pass 44px touch target test
- 0 text under 12px that conveys important information
- Mobile Lighthouse score > 90

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation & Critical Fixes
**Priority:** P0
**Estimated Effort:** 8-12 hours
**Files Modified:** ~15

#### 1.1 Extend Tailwind Configuration
Add responsive utilities to `tailwind.config.ts`:

```typescript
// Add to theme.extend
screens: {
  'xs': '375px',       // Small phones (iPhone SE)
  // sm: 640px (default)
  // md: 768px (default)
  // lg: 1024px (default)
  'touch': { 'raw': '(hover: none)' },  // Touch devices
},
fontSize: {
  'xxs': ['11px', '14px'],  // Minimum readable (use sparingly)
  // xs: 12px (default) - use as minimum
},
minHeight: {
  'touch': '44px',
},
minWidth: {
  'touch': '44px',
},
```

#### 1.2 Create Shared Responsive Hooks
Create `/src/hooks/useResponsive.ts`:

```typescript
// Unified responsive hook with common breakpoints
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 639px)')      // < sm
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)')  // sm-lg
  const isDesktop = useMediaQuery('(min-width: 1024px)')    // >= lg
  const isTouch = useMediaQuery('(hover: none)')            // Touch devices

  return { isMobile, isTablet, isDesktop, isTouch }
}
```

#### 1.3 Fix Critical Overflow Issues

**File 1: HabitGrid.tsx**
```typescript
// Current (BROKEN):
<div className="w-8 h-8 rounded-lg" />

// Fixed:
<div className={cn(
  'rounded-lg flex items-center justify-center',
  'w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8'
)} />
```

**File 2: CorrelationCards.tsx**
```typescript
// Current (BROKEN):
<motion.div className="flex-shrink-0 w-64 rounded-xl p-4" />

// Fixed:
<motion.div className={cn(
  'flex-shrink-0 rounded-xl',
  'w-[85vw] max-w-[280px] xs:w-64 sm:w-72',
  'p-3 xs:p-4'
)} />
```

**File 3: CalendarHeatmap.tsx**
```typescript
// Current (BROKEN):
<div className="w-3 h-3" />

// Fixed:
<div className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
```

#### 1.4 Fix Text Size Issues
Global search and replace in AI Insights components:

| Find | Replace With |
|------|--------------|
| `text-[10px]` | `text-[11px] xs:text-xs` |
| `text-[11px]` | `text-xs` |

**Files to update:**
- All 20+ files in `/features/tasks/ai-insights/components/`

---

### Phase 2: AI Insights Component Overhaul
**Priority:** P1
**Estimated Effort:** 12-16 hours
**Files Modified:** ~30

#### 2.1 TodayMetricsGrid.tsx
```typescript
// Add responsive grid
<motion.div className={cn(
  'grid gap-2 xs:gap-3',
  'grid-cols-2',  // Always 2 columns but with responsive sizing
  className
)}>
  {metrics.map((metric) => (
    <MetricCard key={metric.label} {...metric} />
  ))}
</motion.div>

// Update MetricCard padding
<div className="relative z-10 p-2 xs:p-3">
```

#### 2.2 InteractiveChart.tsx
```typescript
// Add responsive container
<div className="w-full overflow-hidden">
  <ResponsiveContainer
    width="100%"
    height={isMobile ? 180 : 250}
  >
    {/* chart content */}
  </ResponsiveContainer>
</div>
```

#### 2.3 GratitudeWordCloud.tsx
```typescript
// Scale font sizes responsively
const getFontSize = (weight: number) => {
  const baseSize = isMobile ? 12 : 16
  const maxSize = isMobile ? 24 : 36
  return Math.min(baseSize + weight * 2, maxSize)
}
```

#### 2.4 MilestoneTimeline.tsx
```typescript
// Collapse to vertical on mobile
<div className={cn(
  'flex gap-4',
  isMobile ? 'flex-col' : 'flex-row items-center'
)}>
```

#### 2.5 ObjectiveRadar.tsx & ConsistencyRadial.tsx
```typescript
// Use container queries for chart sizing
<div className="@container w-full">
  <div className="h-[200px] @xs:h-[250px] @sm:h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      {/* radar/radial content */}
    </ResponsiveContainer>
  </div>
</div>
```

---

### Phase 3: Dense Grids & Layouts
**Priority:** P1
**Estimated Effort:** 8-10 hours
**Files Modified:** ~15

#### 3.1 CategoryGrid.tsx (Resources)
```typescript
// Current: grid-cols-4 (always)
// Fixed:
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
```

#### 3.2 QuickActionButtons.tsx
```typescript
// Current: grid-cols-4 or grid-cols-6
// Fixed:
<div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
```

#### 3.3 DailyOverview.tsx
```typescript
// Complex grid needs mobile-first approach
<div className={cn(
  'grid gap-2',
  'grid-cols-2',           // Mobile: 2 columns
  'sm:grid-cols-3',        // Tablet: 3 columns
  'lg:grid-cols-4'         // Desktop: 4 columns
)}>
```

#### 3.4 PatternsTab.tsx
```typescript
// Pattern cards need stacking on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

---

### Phase 4: Modal Standardization
**Priority:** P2
**Estimated Effort:** 6-8 hours
**Files Modified:** ~30 modals

#### 4.1 Create Modal Size Constants
Create `/src/components/ui/modal-sizes.ts`:

```typescript
export const MODAL_SIZES = {
  sm: 'sm:max-w-[400px] max-w-[95vw]',
  md: 'sm:max-w-[500px] max-w-[95vw]',
  lg: 'sm:max-w-[600px] max-w-[95vw]',
  xl: 'sm:max-w-[800px] max-w-[95vw]',
  full: 'sm:max-w-[90vw] max-w-[95vw]',
}
```

#### 4.2 Update All Modals to Use Constants
```typescript
// Before (inconsistent):
className="sm:max-w-[500px]"

// After (standardized):
import { MODAL_SIZES } from '@/components/ui/modal-sizes'
className={MODAL_SIZES.md}
```

#### 4.3 Modal Content Padding
```typescript
// Standardize all DialogContent padding
<DialogContent className={cn(
  MODAL_SIZES.md,
  'p-4 xs:p-5 sm:p-6'  // Responsive padding
)}>
```

---

### Phase 5: Chart Responsiveness
**Priority:** P2
**Estimated Effort:** 8-10 hours
**Files Modified:** ~15

#### 5.1 AccordionChart.tsx
```typescript
// Add aspect ratio container
<div className="aspect-[16/9] sm:aspect-[2/1] w-full">
  <ResponsiveContainer width="100%" height="100%">
    {/* chart */}
  </ResponsiveContainer>
</div>
```

#### 5.2 HabitImpactChart.tsx
```typescript
// Reduce bar thickness on mobile
const barSize = isMobile ? 16 : 24
```

#### 5.3 All Recharts Components
Create `/src/components/common/ResponsiveChart.tsx`:

```typescript
interface ResponsiveChartProps {
  children: React.ReactNode
  mobileHeight?: number
  desktopHeight?: number
  aspectRatio?: string
}

export function ResponsiveChart({
  children,
  mobileHeight = 200,
  desktopHeight = 300,
  aspectRatio
}: ResponsiveChartProps) {
  const { isMobile } = useResponsive()

  if (aspectRatio) {
    return (
      <div className={cn('w-full', aspectRatio)}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={isMobile ? mobileHeight : desktopHeight}
    >
      {children}
    </ResponsiveContainer>
  )
}
```

---

### Phase 6: Forms & Inputs
**Priority:** P2
**Estimated Effort:** 4-6 hours
**Files Modified:** ~15

#### 6.1 Form Field Stacking
```typescript
// Ensure all form fields stack on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField name="firstName" />
  <FormField name="lastName" />
</div>
```

#### 6.2 Select Components
```typescript
// Increase touch target for selects
<SelectTrigger className="min-h-touch">
```

#### 6.3 Input Sizes
```typescript
// Standard input height
<Input className="h-11" />  // 44px for touch
```

---

### Phase 7: Navigation & Layout Polish
**Priority:** P3
**Estimated Effort:** 4-6 hours
**Files Modified:** ~10

#### 7.1 Bottom Navigation Touch Targets
```typescript
// Ensure icons and labels are well-spaced
<button className={cn(
  'flex-1 flex flex-col items-center justify-center gap-1',
  'min-h-[64px] tap-target',
  'active:bg-gray-100 transition-colors'
)}>
```

#### 7.2 Header Bar Responsive
```typescript
// Collapse header items on mobile
<div className="flex items-center gap-2 sm:gap-4">
  {!isMobile && <SearchBar />}
  <NotificationBell />
  <ProfileButton />
</div>
```

#### 7.3 Safe Area Handling
```typescript
// Apply safe areas consistently
<main className="pb-safe-bottom pt-safe-top">
```

---

## TESTING STRATEGY

### Automated Testing
1. **Viewport Tests**: Run Playwright tests at 320px, 375px, 768px, 1024px
2. **Touch Target Audit**: Script to check all buttons/links for 44px minimum
3. **Overflow Detection**: Script to detect horizontal scrollbars

### Manual Testing Checklist

#### Per Component
- [ ] No horizontal overflow at 320px
- [ ] Text readable (no squinting)
- [ ] Touch targets adequate
- [ ] Spacing comfortable
- [ ] No overlapping elements

#### Full Flow Testing
- [ ] Login flow (mobile)
- [ ] Morning check-in (mobile)
- [ ] Browse AI Insights (mobile)
- [ ] Evening reflection (mobile)
- [ ] View meetings (mobile)
- [ ] Send message (mobile)
- [ ] View profile/settings (mobile)

### Device Testing
| Device | Viewport | Priority |
|--------|----------|----------|
| iPhone SE | 375x667 | P0 |
| iPhone 14 | 390x844 | P0 |
| iPhone 14 Pro Max | 430x932 | P1 |
| iPad Mini | 768x1024 | P1 |
| iPad Pro 11" | 834x1194 | P2 |
| Galaxy S21 | 360x800 | P0 |
| Pixel 7 | 412x915 | P1 |

---

## ROLLOUT STRATEGY

### Phase 1 Deployment (Foundation)
1. Deploy Tailwind config changes
2. Deploy shared hooks
3. Deploy critical overflow fixes
4. Test on production with limited user group

### Phase 2 Deployment (AI Insights)
1. Deploy in batches of 5-10 files
2. Monitor for console errors
3. Gather user feedback

### Phase 3-7 Deployment
1. Continue incremental deployments
2. Each phase is independently deployable
3. Rollback plan: Git revert to previous commit

---

## RISK MITIGATION

### Risk 1: Breaking Desktop Experience
**Mitigation:** All changes use mobile-first with desktop overrides, so desktop should remain unchanged unless explicitly modified.

### Risk 2: Performance Degradation
**Mitigation:** Prefer CSS breakpoints over JavaScript useMediaQuery where possible. useMediaQuery causes re-renders.

### Risk 3: Inconsistent Testing
**Mitigation:** Create visual regression tests with screenshots at each breakpoint.

### Risk 4: Scope Creep
**Mitigation:** This plan is specifically for responsive issues. Feature changes should be separate PRs.

---

## FILE CHANGE SUMMARY

| Phase | Files Modified | New Files | Deleted Files |
|-------|----------------|-----------|---------------|
| 1 | 15 | 2 | 0 |
| 2 | 30 | 0 | 0 |
| 3 | 15 | 0 | 0 |
| 4 | 30 | 1 | 0 |
| 5 | 15 | 1 | 0 |
| 6 | 15 | 0 | 0 |
| 7 | 10 | 0 | 0 |
| **Total** | **~130** | **4** | **0** |

---

## APPENDIX: Quick Reference

### Breakpoint Cheat Sheet
```
xs:   375px   (small phones)
sm:   640px   (large phones, small tablets)
md:   768px   (tablets)
lg:   1024px  (small laptops)
xl:   1280px  (desktops)
2xl:  1536px  (large desktops)
```

### Common Patterns
```typescript
// Grid collapse
"grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

// Text scaling
"text-sm sm:text-base"

// Padding scaling
"p-3 sm:p-4 lg:p-6"

// Gap scaling
"gap-2 sm:gap-3 lg:gap-4"

// Flex direction
"flex-col sm:flex-row"

// Hide on mobile
"hidden sm:block"

// Show only on mobile
"sm:hidden"
```

### Touch Target Pattern
```typescript
<button className="min-h-touch min-w-touch p-2">
  <Icon className="h-5 w-5" />
</button>
```

---

**Document Status:** READY FOR REVIEW
**Next Step:** Stakeholder approval required before implementation begins
