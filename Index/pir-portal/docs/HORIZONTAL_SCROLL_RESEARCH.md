# Horizontal Scrolling Research for Mobile Charts & Cards

**Date:** December 3, 2025
**Purpose:** Research how industry-standard apps handle horizontal scrolling for charts and cards on mobile devices

---

## Executive Summary

After researching Robinhood, Coinbase, Apple Health, Fitbit, and various UX patterns, the recommended approach for GLRS is:

1. **Charts**: Fit to viewport with time-period controls (no horizontal scroll)
2. **Card Carousels**: CSS scroll-snap with peek effect and fade indicator
3. **Info Cards**: Full text display with natural wrapping (no truncation)

---

## Part 1: Mobile Chart Patterns

### Robinhood
**Source:** [Robinhood UI Secrets](https://itexus.com/robinhood-ui-secrets-how-to-design-a-sky-rocket-trading-app/)

**Approach:**
- Drag along the graph to see specific points in time
- Pinch-to-zoom for detail
- Interval options (5min, 1hr, 1d, 1w, etc.)
- Full-width charts that fit the viewport
- Color-coded (green/red) for quick understanding

**Key Takeaway:** Charts are NOT horizontally scrollable - they adapt data density to fit viewport.

### Apple Health / iOS
**Source:** [Apple WWDC22 - Design app experiences with charts](https://developer.apple.com/videos/play/wwdc2022/110342/)

**Approach:**
- `chartScrollableAxes` modifier enables scrolling
- `chartXVisibleDomain` sets visible window (e.g., 30 days)
- `chartScrollPosition` tracks current position
- Snap behavior aligns to meaningful intervals (first day of month)
- Rotating iPhone shows expanded interactive view

**Key Takeaway:** Apple allows scroll BUT with controlled visible domains and snap points.

### Fitbit (2022-2024 Redesign)
**Source:** [Fitbit Chart Redesign - 9to5Google](https://9to5google.com/2022/07/21/fitbit-chart-redesign/)

**Approach:**
- **Removed carousel of charts** - replaced with labeled buttons/chips
- Top tabs for time periods: Week, Month, 3-Month, Year
- Left/right arrows for navigation between periods
- Hold-and-drag on timeline for sleep data
- White background for readability

**Key Takeaway:** Fitbit moved AWAY from horizontal scroll toward explicit time-period controls.

### Coinbase
**Source:** [Coinbase UX Redesign - Medium](https://jpux.medium.com/case-study-coinbase-ux-redesign-9fa4038f5d52)

**Approach:**
- Non-scrollable dashboard showing essentials at-a-glance
- Trade button adapts position on scroll
- Charts fit viewport width

**Key Takeaway:** Prioritize at-a-glance information over scrolling.

---

## Part 2: Recharts-Specific Solutions

### ResponsiveContainer Issues
**Source:** [Recharts GitHub Issue #1364](https://github.com/recharts/recharts/issues/1364)

**Problem:** ResponsiveContainer doesn't play nicely with Grid/Flexbox.

**Solutions:**
1. Set width to 99% with aspect ratio
2. Use `minWidth` prop: `<ResponsiveContainer minWidth={350} height={200}>`
3. Calculate width dynamically: `numberOfItems * 100` if items > threshold

### Horizontal Scroll Pattern
**Source:** [Stack Overflow - Recharts Horizontal Scroll](https://stackoverflow.com/questions/69477462/how-can-i-create-a-horizontal-scrolling-chart-in-react-using-rechartjs)

```jsx
// Wrapper approach
<div style={{ overflowX: 'scroll' }}>
  <div style={{ width: dataLength > 10 ? dataLength * 50 : '100%' }}>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>...</LineChart>
    </ResponsiveContainer>
  </div>
</div>
```

### Sticky Y-Axis (Advanced)
**Source:** [Medium - Scrollable Graph with Sticky Y-Axis](https://medium.com/@SwathiMahadevarajan/scrollable-graph-sticky-y-axis-in-recharts-without-using-brush-3733f60b1717)

```javascript
// Transform-based solution
onScroll={(e) => {
  const axis = document.querySelector(".recharts-yAxis");
  axis.style = `transform: translateX(${e.target.scrollLeft}px);`;
}}
```

**Note:** This is complex and may not be worth the effort for our use case.

---

## Part 3: Card Carousel Patterns

### Peek Effect (Strongest Affordance)
**Source:** [NN/g - Carousels on Mobile Devices](https://www.nngroup.com/articles/mobile-carousels/)

> "Half images and incomplete words signaled users that there was more content to the right or left. The illusion of continuity is a strong carousel cue."

**Implementation:**
- Show ~20px of next card at right edge
- Use `scroll-padding-right: 20px` or margin offset

### Fade Effect
**Source:** [Smashing Magazine - Designing Better Carousel UX](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/)

> "Applying a fade effect at the ends of the carousel creates a 'partially hidden' aesthetic and mitigates abrupt cutoffs."

**Implementation:**
```css
.carousel-container::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, rgba(15, 23, 42, 0.8));
  pointer-events: none;
}
```

### CSS Scroll-Snap
**Source:** [UX Patterns - Carousel](https://uxpatterns.dev/patterns/content-management/carousel)

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 12px;
  padding-right: 40px; /* Space for peek */
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carousel-card {
  flex-shrink: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always; /* Prevent skipping on fast swipe */
}
```

### Embla Carousel (Professional Solution)
**Source:** [Embla Carousel React](https://www.embla-carousel.com/get-started/react/)

- Lightweight with smooth touch gestures
- Built-in momentum scrolling
- `useEmblaCarousel` hook for React
- Supports wheel gestures plugin

**When to use:** Complex carousels requiring precise control, loop behavior, or autoplay.

### Scroll Indicators
**Source:** [Smashing Magazine](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/)

> "Dots are generally weak signifiers: because they are small, people often don't notice them."

**Better alternatives:**
1. Peek effect (show partial card)
2. Fade gradient on edges
3. "Swipe →" text hint
4. Horizontal progress bar

---

## Part 4: Recommendations for GLRS

### InteractiveChart (Mood Trend)

**Recommended Approach: Fit to Viewport**

Following Fitbit and Coinbase patterns:
- Keep chart at 100% container width
- Time period selector (7D, 14D, 30D) controls data density
- No horizontal scroll - data adapts to viewport
- ResponsiveContainer handles sizing

**Why:**
- Simpler implementation
- Consistent with modern app patterns
- Avoids sticky Y-axis complexity
- Better touch experience

**Code Changes:**
```jsx
// Remove fixed width wrapper, let ResponsiveContainer handle it
<ResponsiveContainer width="100%" height={160}>
  <ComposedChart data={filteredData} margin={{ top: 5, right: 25, left: 5, bottom: 5 }}>
    ...
  </ComposedChart>
</ResponsiveContainer>
```

### CalendarHeatmap

**Recommended Approach: Internal Scroll for Grid Only**

- Header stays fixed at top (no scroll)
- Only the heatmap grid scrolls horizontally
- Add fade gradient on right edge

### CorrelationCards

**Recommended Approach: CSS Scroll-Snap with Peek + Fade**

```jsx
// Container with scroll-snap and fade
<div className="relative">
  <div className="flex gap-3 overflow-x-auto scroll-snap-x-mandatory scrollbar-hide pr-10">
    {cards.map(card => (
      <div className="flex-shrink-0 w-[220px] scroll-snap-align-start">
        {/* Card content - NO line-clamp */}
      </div>
    ))}
  </div>
  {/* Fade gradient indicator */}
  <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-slate-900 pointer-events-none" />
</div>
```

### AIPatternAnalysis Cards

**Recommended Approach: Full Text Display**

- No horizontal scroll (these are informational, not browsable)
- Remove ALL truncation classes
- Allow cards to grow vertically
- `leading-relaxed` for readable line spacing

---

## Part 5: Implementation Checklist

### Charts
- [ ] Remove 450px fixed-width wrappers ✅ (already done)
- [ ] Remove `overflow-hidden` from outer containers ✅ (already done)
- [ ] Ensure time period selector (7D/14D/30D) is fully visible
- [ ] Increase right margin on chart for date labels
- [ ] Test at 375px viewport width

### Card Carousel (CorrelationCards)
- [ ] Add `scroll-snap-type: x mandatory` to container
- [ ] Add `scroll-snap-align: start` to cards
- [ ] Add `flex-shrink-0` to prevent card compression
- [ ] Add right padding for peek effect
- [ ] Add fade gradient overlay on right edge
- [ ] Remove all `line-clamp` classes
- [ ] Add "Swipe →" hint text

### Info Cards (AIPatternAnalysis)
- [ ] Remove any truncation classes
- [ ] Use `break-words` class
- [ ] Use `leading-relaxed` for spacing
- [ ] Allow natural height growth

### Heatmap
- [ ] Keep header outside scroll area
- [ ] Only grid scrolls horizontally
- [ ] Add fade gradient on right edge

---

## Sources

1. [Robinhood Legend Charts on Mobile](https://robinhood.com/us/en/newsroom/introducing-robinhood-legend-charts-on-mobile/)
2. [Robinhood UI Secrets - Itexus](https://itexus.com/robinhood-ui-secrets-how-to-design-a-sky-rocket-trading-app/)
3. [Apple WWDC22 - Design app experiences with charts](https://developer.apple.com/videos/play/wwdc2022/110342/)
4. [Fitbit Chart Redesign - 9to5Google](https://9to5google.com/2022/07/21/fitbit-chart-redesign/)
5. [Coinbase UX Redesign - Medium](https://jpux.medium.com/case-study-coinbase-ux-redesign-9fa4038f5d52)
6. [Recharts GitHub Issue #1364](https://github.com/recharts/recharts/issues/1364)
7. [NN/g - Carousels on Mobile Devices](https://www.nngroup.com/articles/mobile-carousels/)
8. [Smashing Magazine - Designing Better Carousel UX](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/)
9. [Embla Carousel React](https://www.embla-carousel.com/get-started/react/)
10. [Medium - Scrollable Graph with Sticky Y-Axis](https://medium.com/@SwathiMahadevarajan/scrollable-graph-sticky-y-axis-in-recharts-without-using-brush-3733f60b1717)
