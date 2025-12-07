# AI Insights Page Migration Report

**Document Version:** 2.0 (Revised Scope)
**Analysis Date:** December 3, 2025
**Status:** AWAITING APPROVAL

---

## Summary

Migrate AI Insights from bottom-sheet modal to dedicated page route. **No design changes** - existing components, layout, tabs, and cards remain exactly as-is. Focus is on routing + animation polish only.

---

## 1. Current State

### 1.1 File Locations

```
/Index/pir-portal/src/features/tasks/ai-insights/
├── AIInsightsHub.tsx          (475 lines) - Main component ← REUSE AS-IS
├── useAIInsightsData.ts       (650 lines) - Data hook ← REUSE AS-IS
├── types.ts                   (267 lines) - Types ← REUSE AS-IS
├── components/                (18 files) ← REUSE AS-IS
├── tabs/                      (6 files) ← REUSE AS-IS
└── anchor/                    (5 files) ← REUSE AS-IS
```

### 1.2 Current Modal Trigger

```typescript
// stores/modalStore.ts (line 73)
| 'aiInsightsHub'

// ModalProvider.tsx (line 379-385)
aiInsightsHub: lazy(() =>
  Promise.resolve({
    default: ({ onClose, ...props }) => (
      <AIInsightsHub onClose={onClose} initialTab={props.initialTab} />
    ),
  })
),

// SELF_MANAGED_MODALS set (line 617)
'aiInsightsHub',  // Uses EnhancedDialog internally
```

### 1.3 Current Sizing

```typescript
// AIInsightsHub.tsx (line 343-354)
isMobile
  ? 'w-screen max-w-none h-[90vh] m-0 rounded-none'
  : 'max-w-2xl w-full h-[90vh] max-h-[900px]'
```

### 1.4 What Stays The Same

- All 6 tabs (Overview, Beacon, Habits, Reflections, Goals, Anchor)
- All card components and layouts
- All data fetching logic
- All existing animations within tabs
- Dark theme with violet/cyan accents
- AI indicator component
- Tab navigation component

---

## 2. Animation Library Recommendation

### Recommendation: **Keep Framer Motion** (already installed)

**Why:**
- Already used throughout AIInsightsHub.tsx (lines 39-110)
- Team familiar with the API
- No additional bundle size
- Already configured variants for tabs, items, pulse effects

**Current Framer Motion usage in AIInsightsHub:**
```typescript
import { motion, AnimatePresence } from 'framer-motion'

// Already defined:
const containerVariants = { ... }  // Staggered children
const itemVariants = { ... }       // Spring-based fade+slide
const tabContentVariants = { ... } // Tab switch animation
const pulseVariants = { ... }      // AI indicator pulse
const glowVariants = { ... }       // Premium glow effect
```

**No installation needed** - just wrap the page component with additional variants.

---

## 3. Proposed Animations

### 3.1 Page Entry Animation

Add a wrapper around the existing AIInsightsHub content:

```typescript
// New: InsightsPage.tsx (or wrap in AIInsightsHub)
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0], // Smooth deceleration
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 }
  }
}

// Usage:
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  className="h-full"
>
  {/* Existing AIInsightsHub content */}
</motion.div>
```

### 3.2 Tab Transition Animation (Already Exists)

Current implementation is solid - keep as-is:

```typescript
// Already in AIInsightsHub.tsx (line 63-81)
const tabContentVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
}
```

### 3.3 Card Hover Effects

Add subtle hover interaction to insight cards:

```typescript
// Wrap existing cards with motion.div
<motion.div
  whileHover={{
    y: -2,
    transition: { duration: 0.2 }
  }}
  whileTap={{ scale: 0.98 }}
>
  <AIInsightCard {...props} />
</motion.div>
```

Or update AIInsightCard.tsx directly:

```typescript
// AIInsightCard.tsx (line 161) - add whileHover
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15)' }}
  transition={{ delay: 0.2 }}
  className={cn(...)}
>
```

### 3.4 AI Loading State Animation (Already Exists)

Current implementation is already polished:

```typescript
// Already in AIInsightsHub.tsx (line 83-110)
const pulseVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const glowVariants = {
  initial: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
  animate: {
    boxShadow: [
      '0 0 20px rgba(139, 92, 246, 0.3)',
      '0 0 40px rgba(139, 92, 246, 0.5)',
      '0 0 20px rgba(139, 92, 246, 0.3)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}
```

### 3.5 Back Navigation Animation

Simple fade for back button:

```typescript
// Header back button
<motion.button
  whileHover={{ x: -2 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleBack}
  className="p-2 rounded-lg text-slate-400 hover:text-white"
>
  <ArrowLeft className="h-5 w-5" />
</motion.button>
```

---

## 4. Migration Steps

### Step 1: Create Route (30 min)

```typescript
// routes.tsx - add to authenticated routes
{
  path: 'insights',
  element: <InsightsPage />,
}
```

### Step 2: Create InsightsPage Wrapper (1 hour)

```typescript
// /features/insights/InsightsPage.tsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AIInsightsHub } from '@/features/tasks/ai-insights'

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
}

export function InsightsPage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1) // or navigate('/#tasks')
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-screen bg-slate-900"
    >
      {/* Reuse existing AIInsightsHub, but as page content not modal */}
      <AIInsightsHub onClose={handleBack} />
    </motion.div>
  )
}
```

### Step 3: Modify AIInsightsHub (1 hour)

Remove modal wrapper, keep content:

```typescript
// AIInsightsHub.tsx - change from:
return (
  <EnhancedDialog open onOpenChange={onClose}>
    <EnhancedDialogContent className="...">
      {/* content */}
    </EnhancedDialogContent>
  </EnhancedDialog>
)

// To:
return (
  <div className="h-full flex flex-col bg-slate-900">
    {/* Same content, no dialog wrapper */}
  </div>
)
```

Or create a separate `AIInsightsContent` component that both modal and page can use.

### Step 4: Update Navigation Trigger (30 min)

```typescript
// In Tasks tab or wherever the button is:
// Change from:
openModal('aiInsightsHub')

// To:
navigate('/insights')
```

### Step 5: Add Card Hover Effects (1 hour)

Update AIInsightCard and other interactive cards with `whileHover` props.

### Step 6: Test & Polish (2 hours)

- Test page entry animation
- Test back navigation
- Test tab switching
- Test on mobile
- Verify no visual regressions

---

## 5. Estimated Time

| Task | Time |
|------|------|
| Create route | 30 min |
| Create InsightsPage wrapper | 1 hour |
| Modify AIInsightsHub (remove modal wrapper) | 1 hour |
| Update navigation trigger | 30 min |
| Add card hover effects | 1 hour |
| Testing & polish | 2 hours |
| **Total** | **6 hours** |

---

## 6. Files Changed

| File | Change |
|------|--------|
| `routes.tsx` | Add `/insights` route |
| `features/insights/InsightsPage.tsx` | NEW - Page wrapper with animation |
| `features/insights/index.tsx` | NEW - Barrel export |
| `features/tasks/ai-insights/AIInsightsHub.tsx` | Remove EnhancedDialog wrapper |
| `features/tasks/ai-insights/components/AIInsightCard.tsx` | Add whileHover |
| Tasks tab trigger location | Change `openModal()` to `navigate()` |
| `stores/modalStore.ts` | Remove `aiInsightsHub` type (cleanup) |
| `components/ModalProvider.tsx` | Remove `aiInsightsHub` registration (cleanup) |

---

## 7. Open Questions

1. **Route path:** `/insights` or `/tasks/insights`?

2. **Back navigation:** Browser back, or explicit "Back to Tasks" button?

3. **Tab deep linking:** Should `/insights/beacon` be a separate route, or keep URL as `/insights`?

---

**Document Status:** Ready for approval.

**Next Steps Upon Approval:**
1. Confirm route path
2. Create feature branch: `feature/insights-page`
3. Begin Step 1: Create route

---

*Report generated by Claude Code - December 3, 2025*
