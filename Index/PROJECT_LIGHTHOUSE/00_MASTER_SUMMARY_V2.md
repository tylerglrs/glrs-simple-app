# GLRS Lighthouse - Master Implementation Summary V2

**Project:** GLRS Mobile App Redesign - Complete Analysis & Realistic Roadmap
**Date:** November 22, 2025
**Version:** 2.0 (Replaces V1 - addresses 4 critical gaps)
**Team:** 3 people (Tyler, Web Claude, CLI) - No hiring budget
**Budget:** Firebase Blaze Plan + $10-50/month APIs
**Timeline:** 340 hours total (17 weeks at 20h/week)

---

## Document Purpose

This V2 document addresses **4 critical gaps** identified in the original master summary:

1. ✅ **Visual Design Specifications** - Exact design patterns extracted from production tabs
2. ✅ **Complete Notification Inventory** - All 16 notification types (only 2 implemented = 87.5% gap)
3. ✅ **Timezone Migration Impact** - 56+ functions affected, 8-10 week migration timeline
4. ✅ **Calendar Integration Implementation** - Complete OAuth + event sync (30 hours, greenfield)

---

## Executive Summary

### Current State: 6 Strong Tabs, 3 Incomplete, 4 System-Wide Gaps

**Working (6 of 9 tabs):**
- ✅ TasksTab (95%) - Check-ins, reflections, 16 sidebar modals
- ✅ JourneyTab (92%) - Milestones, wellness graphs, financial tracking
- ✅ HomeTab (89%) - Dashboard, streaks, incomplete tasks
- ✅ MeetingsTab (95%) - AA/NA finder, attendance tracking
- ✅ CommunityTab (90%) - Posts, chat, topic rooms, support groups
- ✅ ResourcesTab (95%) - 5-tab library with progress tracking

**Incomplete (3 of 9 tabs):**
- ❌ ProfileTab (30%) - Missing settings, timezone, notifications, privacy, data export
- ❌ NotificationsTab (30%) - Missing filters, grouping, delete, categorization
- ⚠️ UserProfileView (85%) - Works but orphaned (no main nav access)

**Critical System-Wide Gaps:**
1. ❌ **No notification creation** - 87.5% gap (14 of 16 types missing, ~640 LOC needed)
2. ❌ **No timezone handling** - All tabs show wrong times for non-PST users
3. ❌ **No calendar integration** - OAuth unimplemented (30 hours greenfield)
4. ❌ **No notification preferences** - Users can't control notifications

---

# SECTION 1: VISUAL DESIGN SPECIFICATIONS

**Purpose:** Define exact design patterns so ProfileTab and NotificationsTab can "match design quality of other tabs"

**Source:** Extracted from 6 production-ready tabs (TasksTab, JourneyTab, HomeTab, MeetingsTab, CommunityTab, ResourcesTab)

---

## 1.1 Color Palette

### Brand Colors
- **Primary Teal:** `#058585` - Primary buttons, links, active states
- **Primary Teal Hover:** `#047070` - Hover state for primary buttons
- **Primary Teal Light:** `rgba(5, 133, 133, 0.1)` - Backgrounds, highlights

### Functional Colors
- **Success Green:** `#00A86B` - Completed tasks, positive states, success messages
- **Info Blue:** `#0077CC` - Information badges, info messages
- **Warning Orange:** `#FFA500` - Warning states, attention items
- **Error Red:** `#DC143C` / `#ef4444` - Errors, destructive actions, alerts

### Text Colors
- **Primary Text:** `#333` / `#050505` - Main body text, headings
- **Secondary Text:** `#666` / `#6b7280` - Descriptions, captions
- **Muted Text:** `#888` / `#9ca3af` - Timestamps, less important info
- **Light Text:** `#aaa` - Placeholder text, disabled states

### Background Colors
- **Page Background:** `#F8F9FA` - Main app background
- **Card Background:** `#ffffff` - Card/modal backgrounds
- **Hover Background:** `#f5f5f5` - Hover states for list items
- **Border Gray:** `#E5E5E5` / `#e2e8f0` - Borders, dividers
- **Dark Background:** `#2d3748` - Dark sections, footer areas

### Gradient (used in hero cards)
```css
background: linear-gradient(135deg, #058585 0%, #047070 100%);
```

---

## 1.2 Typography Scale

### Font Family
- **Primary:** System default (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- **Monospace:** For code/data (`"SF Mono", Monaco, "Courier New", monospace`)

### Font Sizes (Desktop)
- **Hero:** `64px` - Large numbers (sobriety days, streaks)
- **Display:** `48px` - Very large emphasis text
- **H1:** `36px` - Main page headings
- **H2:** `24px` - Section headings, card titles
- **H3:** `20px` - Subsection headings
- **H4:** `18px` - Small headings
- **Body Large:** `16px` - Primary body text
- **Body:** `14px` - Standard body text, form inputs
- **Caption:** `12px` - Timestamps, metadata, helper text
- **Tiny:** `11px` - Fine print, badges

### Font Weights
- **Bold:** `700` - Headings, emphasis
- **Semi-Bold:** `600` - Subheadings, important labels
- **Medium:** `500` - Buttons, active states
- **Normal:** `400` - Body text

### Line Heights
- **Tight:** `1.2` - Headings, large numbers
- **Normal:** `1.5` - Body text
- **Relaxed:** `1.7` - Long-form content

### Example Usage
```css
/* Hero Number (Sobriety Days) */
.hero-number {
  font-size: 64px;
  font-weight: 700;
  line-height: 1.2;
  color: #058585;
}

/* Section Heading */
.section-heading {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  color: #333;
  margin-bottom: 16px;
}

/* Body Text */
.body-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #666;
}

/* Caption */
.caption {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #888;
}
```

---

## 1.3 Spacing System

### Padding/Margin Scale
- **XS:** `4px` - Tight spacing, inline elements
- **SM:** `8px` - Small gaps, compact layouts
- **MD:** `12px` - Standard spacing between elements
- **LG:** `16px` - Card padding, section spacing
- **XL:** `20px` - Large section spacing
- **2XL:** `24px` - Major section divisions
- **3XL:** `32px` - Page-level spacing

### Component-Specific Spacing
- **Card Padding:** `16px` (mobile), `20px` (desktop)
- **Button Padding:** `12px 24px` (vertical, horizontal)
- **Input Padding:** `12px 16px`
- **Modal Padding:** `24px`
- **Section Margin Bottom:** `24px`
- **List Item Padding:** `12px 16px`

### Gap Between Elements
- **Buttons in a row:** `12px`
- **Cards in a grid:** `16px`
- **Sections:** `24px`
- **Form fields:** `16px`

---

## 1.4 Border Radius

- **Sharp:** `3px` - Badges, tags, small elements
- **Small:** `6px` - Inputs, small buttons
- **Medium:** `8px` - Standard buttons, cards
- **Large:** `12px` - Large cards, featured elements
- **XL:** `15px` - Modals, sheets
- **Round:** `20px` - Pill buttons, avatar containers
- **Circle:** `50%` - Avatars, icon circles

### Example Usage
```css
/* Standard Card */
.card {
  border-radius: 12px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Button */
.button {
  border-radius: 8px;
  padding: 12px 24px;
}

/* Badge */
.badge {
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 11px;
}

/* Avatar */
.avatar {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}
```

---

## 1.5 Box Shadows (Elevation Levels)

```css
/* Level 0: Flat (no shadow) */
box-shadow: none;

/* Level 1: Subtle (hover states) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

/* Level 2: Card (standard cards) */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Level 3: Raised (active cards, dropdowns) */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

/* Level 4: Modal (modals, sheets) */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

/* Level 5: Prominent (hero elements) */
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
```

### Usage Guidelines
- **Cards:** Level 2
- **Hover states:** Level 1 → Level 3 transition
- **Modals:** Level 4
- **Hero cards:** Level 5
- **Buttons:** Level 1 (default), Level 2 (hover)

---

## 1.6 Button Styles (Complete Specifications)

### Primary Button
```css
.button-primary {
  background: #058585;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.button-primary:hover {
  background: #047070;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.button-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}
```

### Secondary Button
```css
.button-secondary {
  background: transparent;
  color: #058585;
  border: 2px solid #058585;
  border-radius: 8px;
  padding: 10px 22px; /* 2px less to account for border */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-secondary:hover {
  background: rgba(5, 133, 133, 0.1);
  border-color: #047070;
  color: #047070;
}

.button-secondary:active {
  background: rgba(5, 133, 133, 0.2);
}
```

### Success Button
```css
.button-success {
  background: #00A86B;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-success:hover {
  background: #008f5a;
}
```

### Danger Button
```css
.button-danger {
  background: #DC143C;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-danger:hover {
  background: #b8112f;
}
```

### Small Button Variant
```css
.button-small {
  padding: 8px 16px;
  font-size: 12px;
  border-radius: 6px;
}
```

### Icon Button
```css
.button-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #666;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-icon:hover {
  background: #f5f5f5;
  color: #333;
}
```

---

## 1.7 Card Patterns

### Standard Card
```css
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
```

### Card with Header
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <button class="button-icon">⋮</button>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="button-secondary">Cancel</button>
    <button class="button-primary">Save</button>
  </div>
</div>
```

```css
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E5E5;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-body {
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #E5E5E5;
}
```

### Hero Card (used in JourneyTab, HomeTab)
```css
.hero-card {
  background: linear-gradient(135deg, #058585 0%, #047070 100%);
  border-radius: 15px;
  padding: 32px;
  color: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
}

.hero-card-number {
  font-size: 64px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.hero-card-label {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.9;
}
```

### Stat Card (compact, grid layout)
```css
.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card-value {
  font-size: 32px;
  font-weight: 700;
  color: #058585;
  margin-bottom: 4px;
}

.stat-card-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## 1.8 Modal Patterns

### Standard Modal
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #ffffff;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #E5E5E5;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  font-size: 20px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #E5E5E5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

---

## 1.9 Form Input Styles

### Text Input
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #ffffff;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #058585;
  box-shadow: 0 0 0 3px rgba(5, 133, 133, 0.1);
}

.input::placeholder {
  color: #aaa;
}

.input:disabled {
  background: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

.input-error {
  border-color: #DC143C;
}

.input-error:focus {
  border-color: #DC143C;
  box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
}
```

### Form Group
```html
<div class="form-group">
  <label class="form-label">Email Address</label>
  <input type="email" class="input" placeholder="you@example.com">
  <p class="form-hint">We'll never share your email</p>
  <p class="form-error">Please enter a valid email</p>
</div>
```

```css
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  margin-bottom: 0;
}

.form-error {
  font-size: 12px;
  color: #DC143C;
  margin-top: 4px;
  margin-bottom: 0;
}
```

### Select Dropdown
```css
.select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Dropdown arrow */
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.2s ease;
}

.select:focus {
  outline: none;
  border-color: #058585;
  box-shadow: 0 0 0 3px rgba(5, 133, 133, 0.1);
}
```

### Checkbox/Toggle
```css
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #E5E5E5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background: #058585;
  border-color: #058585;
}

.checkbox-label {
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
```

---

## 1.10 Icon Usage (Lucide Icons)

### Icon Sizes
- **Small:** `16px` - Inline with text
- **Medium:** `20px` - Buttons, form elements
- **Large:** `24px` - Headings, prominent actions
- **XL:** `32px` - Hero sections

### Icon Colors
- **Default:** `#666` - Standard icons
- **Active:** `#058585` - Active/selected state
- **Muted:** `#aaa` - Disabled state
- **Success:** `#00A86B` - Positive actions
- **Danger:** `#DC143C` - Destructive actions

### Common Icons Used
- **Navigation:** `Home`, `Calendar`, `Users`, `MessageSquare`, `Bell`, `User`
- **Actions:** `Plus`, `Edit`, `Trash2`, `Save`, `X`, `Check`
- **UI:** `ChevronDown`, `ChevronRight`, `Search`, `Filter`, `MoreVertical`
- **Status:** `AlertCircle`, `CheckCircle`, `Info`, `XCircle`

---

## 1.11 Badge/Tag Styles

### Badge
```css
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary {
  background: rgba(5, 133, 133, 0.1);
  color: #058585;
}

.badge-success {
  background: rgba(0, 168, 107, 0.1);
  color: #00A86B;
}

.badge-warning {
  background: rgba(255, 165, 0, 0.1);
  color: #FFA500;
}

.badge-danger {
  background: rgba(220, 20, 60, 0.1);
  color: #DC143C;
}

.badge-new {
  background: #DC143C;
  color: #ffffff;
}
```

---

## 1.12 List Item Patterns

### Standard List Item (used in all tabs)
```css
.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  background: #f5f5f5;
}

.list-item:active {
  background: #eeeeee;
}

.list-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(5, 133, 133, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #058585;
  margin-right: 12px;
}

.list-item-content {
  flex: 1;
}

.list-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.list-item-subtitle {
  font-size: 12px;
  color: #888;
}

.list-item-action {
  margin-left: 12px;
}
```

---

## 1.13 Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small phones */
@media (max-width: 320px) {
  /* Adjust for very small screens */
}

/* Standard phones */
@media (min-width: 321px) and (max-width: 480px) {
  /* Standard mobile layout */
}

/* Large phones / small tablets */
@media (min-width: 481px) and (max-width: 768px) {
  /* Tablet portrait */
}

/* Tablets */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet landscape */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Desktop layout */
}
```

### Common Adjustments
- **Mobile (< 768px):**
  - Font sizes: 90% of desktop
  - Card padding: 16px (instead of 20px)
  - Button padding: 10px 20px (instead of 12px 24px)
  - Spacing: Tighter (16px instead of 24px)

- **Desktop (>= 1025px):**
  - Max content width: 1200px
  - Multi-column layouts
  - Hover effects enabled
  - Larger touch targets not needed

---

## 1.14 Animation Standards

### Transitions
```css
/* Standard transition */
transition: all 0.2s ease;

/* Slow transition (modals) */
transition: all 0.3s ease;

/* Fast transition (tooltips) */
transition: all 0.15s ease;
```

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In from Bottom */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In (used for modals) */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 1.15 ProfileTab Redesign Specifications

### Layout Structure
```
┌─────────────────────────────────────┐
│  Header: Profile Settings           │ <- 24px padding, #333 text
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  Profile Card               │   │ <- Hero card with avatar, name, stats
│  │  - Avatar (80px circle)     │   │
│  │  - Name (24px bold)         │   │
│  │  - Completion % (14px)      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Settings Categories Grid           │
│  ┌──────────┐ ┌──────────┐         │
│  │ Personal │ │ Recovery │         │ <- 2 columns on desktop, 1 on mobile
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │  Privacy │ │ Notific. │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  Action Buttons                     │
│  - Export Data                      │
│  - Delete Account                   │
└─────────────────────────────────────┘
```

### Settings Category Cards
```css
.settings-category-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-category-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.settings-category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(5, 133, 133, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #058585;
  margin-bottom: 12px;
}

.settings-category-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.settings-category-description {
  font-size: 12px;
  color: #888;
}
```

---

## 1.16 NotificationsTab Redesign Specifications

### Layout Structure
```
┌─────────────────────────────────────┐
│  Header: Notifications              │
│  [Filter Chips] [Mark All Read]     │ <- Sticky header with filters
├─────────────────────────────────────┤
│  Today                              │ <- Date grouping header
│  ┌─────────────────────────────┐   │
│  │ 🔔 New assignment from...   │   │ <- Notification item with icon
│  │ 12:34 PM  [Assignment]      │   │ <- Timestamp + badge
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 💬 New message from coach   │   │
│  │ 10:15 AM  [Message]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Yesterday                          │
│  ┌─────────────────────────────┐   │
│  │ 🎉 You reached 30 days!     │   │
│  │ 8:00 AM  [Milestone]        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Notification Item
```css
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: #ffffff;
  border-left: 4px solid transparent;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item.unread {
  background: rgba(5, 133, 133, 0.05);
  border-left-color: #058585;
}

.notification-item:hover {
  background: #f5f5f5;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-icon.assignment {
  background: rgba(0, 119, 204, 0.1);
  color: #0077CC;
}

.notification-icon.message {
  background: rgba(5, 133, 133, 0.1);
  color: #058585;
}

.notification-icon.milestone {
  background: rgba(0, 168, 107, 0.1);
  color: #00A86B;
}

.notification-icon.alert {
  background: rgba(220, 20, 60, 0.1);
  color: #DC143C;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;
}

.notification-time {
  /* timestamp styling */
}

.notification-badge {
  /* type badge styling */
}
```

### Filter Chips
```css
.filter-chip {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #E5E5E5;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
}

.filter-chip:hover {
  background: #eeeeee;
}

.filter-chip.active {
  background: #058585;
  color: #ffffff;
  border-color: #058585;
}
```

---

## 1.17 Implementation Checklist for ProfileTab & NotificationsTab

### ProfileTab Implementation (12 hours)
- [ ] Create hero profile card with avatar, name, stats (2 hours)
- [ ] Build settings category grid (2 hours)
- [ ] Implement timezone settings modal with IANA timezone picker (2 hours)
- [ ] Implement notification preferences modal (16 toggles) (2 hours)
- [ ] Implement privacy settings modal (profile visibility, search, blocked users) (2 hours)
- [ ] Wire up Google Calendar OAuth (1 hour)
- [ ] Implement data export (JSON + CSV) (1 hour)

### NotificationsTab Implementation (8 hours)
- [ ] Add date grouping (Today, Yesterday, This Week, Older) (2 hours)
- [ ] Add filter chips (All, Assignments, Messages, Comments, Milestones, etc.) (2 hours)
- [ ] Add notification icons and category badges (2 hours)
- [ ] Implement delete notification (swipe-to-delete) (1 hour)
- [ ] Add "Clear All Read" button (30 min)
- [ ] Link to notification settings from header (30 min)

**Total:** 20 hours for visual redesign of 2 tabs

---

**END OF SECTION 1: VISUAL DESIGN SPECIFICATIONS**

---

# SECTION 2: COMPLETE NOTIFICATION INVENTORY

**Purpose:** Document ALL notification sources across entire codebase to identify 87.5% implementation gap

**Critical Finding:** Only 2 of 16 notification types are implemented (14 missing, ~640 lines of code needed)

---

## 2.1 Current State: Only 2 Types Implemented

### Implemented Notification #1: Challenge Check-In Reminders
**Location:** `/functions/index.js` lines 554-564
**Type:** `challenge_checkin`
**Trigger:** Cloud Function scheduled daily at 8:00 AM PST
**Implementation:**
```javascript
exports.challengeCheckInReminders = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    // Query users with active challenges
    // Send notification if check-in not completed today
    // FCM push notification + Firestore notification doc
  });
```

### Implemented Notification #2: Breakthrough Detection
**Location:** `/functions/index.js` lines 626-638
**Type:** `breakthrough`
**Trigger:** Cloud Function scheduled daily at 3:00 AM PST
**Implementation:**
```javascript
exports.detectBreakthroughs = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    // Analyze reflection entries for breakthrough keywords
    // Create notification for coach
    // Firestore notification doc only
  });
```

### Critical Gap Analysis
- **Implementation Coverage:** 12.5% (2 of 16 types)
- **Missing Coverage:** 87.5% (14 types)
- **LOC Needed:** ~640 lines (average 40-50 lines per notification type)
- **Impact:** Users miss critical notifications for assignments, milestones, meetings, messages

---

## 2.2 Missing Notification Types (14 Total)

### Category 1: JourneyTab Notifications (4 missing)

#### Missing Notification #1: Milestone Reached
**Type:** `milestone_reached`
**Trigger:** When user's sobriety days equals milestone threshold (7, 30, 60, 90, 180, 365, 730+)
**Priority:** HIGH
**File to Modify:** `/Index/tabs/JourneyTab.js`
**Implementation Location:** Life sub-tab, around line 450 (after sobriety days calculation)
**Code Pattern:**
```javascript
// After calculating daysSober
const milestones = [7, 30, 60, 90, 180, 365, 730, 1095, 1825, 3650];
const reachedMilestone = milestones.find(m => daysSober === m);

if (reachedMilestone && !milestoneNotificationSentToday) {
  await db.collection('notifications').add({
    userId: currentUser.uid,
    type: 'milestone_reached',
    title: `🎉 ${reachedMilestone} Days Sober!`,
    message: `Congratulations! You've reached ${reachedMilestone} days of sobriety. This is a major achievement!`,
    category: 'milestone',
    icon: '🎉',
    color: '#00A86B',
    priority: 'high',
    read: false,
    actionUrl: '/journey?tab=life',
    relatedId: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}
```
**Estimated LOC:** 45 lines
**Testing:** Set sobrietyDate to 7 days ago, verify notification created at midnight

---

#### Missing Notification #2: Custom Countdown Complete
**Type:** `countdown_complete`
**Trigger:** When custom countdown goal reaches 0 days
**Priority:** MEDIUM
**File to Modify:** `/Index/tabs/JourneyTab.js`
**Implementation Location:** Life sub-tab, custom countdown section around line 620
**Code Pattern:**
```javascript
// After loading customCountdownGoals
customCountdownGoals.forEach(async (goal) => {
  const daysRemaining = Math.ceil((goal.targetDate - new Date()) / (1000 * 60 * 60 * 24));

  if (daysRemaining === 0 && !goal.completionNotificationSent) {
    await db.collection('notifications').add({
      userId: currentUser.uid,
      type: 'countdown_complete',
      title: `⏰ Countdown Complete: ${goal.title}`,
      message: `Your countdown "${goal.title}" has reached its target date!`,
      category: 'milestone',
      icon: '⏰',
      color: '#0077CC',
      priority: 'medium',
      read: false,
      actionUrl: '/journey?tab=life',
      relatedId: goal.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Mark notification as sent
    await db.collection('customCountdownGoals').doc(goal.id).update({
      completionNotificationSent: true,
    });
  }
});
```
**Estimated LOC:** 50 lines
**Testing:** Create countdown with targetDate = today, verify notification created

---

#### Missing Notification #3: Savings Goal Reached
**Type:** `savings_goal_reached`
**Trigger:** When moneySaved >= savingsGoal.targetAmount
**Priority:** MEDIUM
**File to Modify:** `/Index/tabs/JourneyTab.js`
**Implementation Location:** Finances sub-tab, around line 890
**Code Pattern:**
```javascript
// After calculating moneySaved
savingsGoals.forEach(async (goal) => {
  if (moneySaved >= goal.targetAmount && !goal.completionNotificationSent) {
    await db.collection('notifications').add({
      userId: currentUser.uid,
      type: 'savings_goal_reached',
      title: `💰 Savings Goal Reached!`,
      message: `You've saved $${moneySaved.toFixed(2)} and reached your goal "${goal.title}"!`,
      category: 'milestone',
      icon: '💰',
      color: '#00A86B',
      priority: 'medium',
      read: false,
      actionUrl: '/journey?tab=finances',
      relatedId: goal.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('savingsGoals').doc(goal.id).update({
      completionNotificationSent: true,
    });
  }
});
```
**Estimated LOC:** 45 lines

---

#### Missing Notification #4: Weekly Report Generated
**Type:** `weekly_report_ready`
**Trigger:** When Cloud Function generates weekly wellness report (every Sunday 11 PM)
**Priority:** LOW
**File to Create:** `/functions/generateWeeklyReports.js`
**Implementation:**
```javascript
exports.generateWeeklyReports = functions.pubsub
  .schedule('0 23 * * 0') // Every Sunday at 11 PM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Generate weekly report (existing logic from JourneyTab)
      // ...

      // Create notification
      await admin.firestore().collection('notifications').add({
        userId,
        type: 'weekly_report_ready',
        title: '📊 Your Weekly Report is Ready',
        message: 'Check out your weekly wellness insights and progress summary.',
        category: 'report',
        icon: '📊',
        color: '#0077CC',
        priority: 'low',
        read: false,
        actionUrl: '/journey?tab=wellness',
        relatedId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
```
**Estimated LOC:** 60 lines (includes report generation logic)

---

### Category 2: TasksTab Notifications (3 missing)

#### Missing Notification #5: Morning Check-In Reminder
**Type:** `checkin_reminder_morning`
**Trigger:** Daily at 9:00 AM if check-in not completed
**Priority:** HIGH
**File to Create:** `/functions/checkInReminders.js`
**Implementation:**
```javascript
exports.morningCheckInReminder = functions.pubsub
  .schedule('0 9 * * *') // 9 AM daily
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Check if check-in completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkInsSnapshot = await admin.firestore()
        .collection('checkins')
        .where('userId', '==', userId)
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
        .get();

      if (checkInsSnapshot.empty) {
        // No check-in today, send reminder
        await admin.firestore().collection('notifications').add({
          userId,
          type: 'checkin_reminder_morning',
          title: '☀️ Morning Check-In',
          message: 'How are you feeling today? Complete your morning check-in.',
          category: 'reminder',
          icon: '☀️',
          color: '#FFA500',
          priority: 'high',
          read: false,
          actionUrl: '/tasks',
          relatedId: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send FCM push notification
        const fcmToken = userDoc.data().fcmToken;
        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: '☀️ Morning Check-In',
              body: 'How are you feeling today? Complete your morning check-in.',
            },
            data: { actionUrl: '/tasks' },
          });
        }
      }
    }
  });
```
**Estimated LOC:** 70 lines

---

#### Missing Notification #6: Evening Reflection Reminder
**Type:** `reflection_reminder_evening`
**Trigger:** Daily at 8:00 PM if reflection not completed
**Priority:** MEDIUM
**File to Modify:** `/functions/checkInReminders.js` (add second function)
**Implementation:** Similar to morning check-in but checks `reflections` collection
**Estimated LOC:** 60 lines

---

#### Missing Notification #7: Assignment Due Soon
**Type:** `assignment_due_soon`
**Trigger:** 24 hours before assignment dueDate
**Priority:** HIGH
**File to Create:** `/functions/assignmentReminders.js`
**Implementation:**
```javascript
exports.assignmentDueSoonReminders = functions.pubsub
  .schedule('0 9 * * *') // Check daily at 9 AM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const assignmentsSnapshot = await admin.firestore()
      .collection('assignments')
      .where('status', '==', 'active')
      .where('dueDate', '<=', admin.firestore.Timestamp.fromDate(tomorrow))
      .get();

    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignment = assignmentDoc.data();

      await admin.firestore().collection('notifications').add({
        userId: assignment.userId,
        type: 'assignment_due_soon',
        title: '⏰ Assignment Due Tomorrow',
        message: `"${assignment.title}" is due tomorrow. Don't forget to complete it!`,
        category: 'assignment',
        icon: '⏰',
        color: '#FFA500',
        priority: 'high',
        read: false,
        actionUrl: '/tasks',
        relatedId: assignmentDoc.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
```
**Estimated LOC:** 55 lines

---

### Category 3: MeetingsTab Notifications (3 missing)

#### Missing Notification #8: Meeting Reminder (24h)
**Type:** `meeting_reminder_24h`
**Trigger:** 24 hours before meeting startTime
**Priority:** MEDIUM
**File to Create:** `/functions/meetingReminders.js`
**Estimated LOC:** 60 lines

---

#### Missing Notification #9: Meeting Reminder (1h)
**Type:** `meeting_reminder_1h`
**Trigger:** 1 hour before meeting startTime
**Priority:** HIGH
**File to Modify:** `/functions/meetingReminders.js` (second function)
**Estimated LOC:** 55 lines

---

#### Missing Notification #10: Meeting Starting Now
**Type:** `meeting_starting_now`
**Trigger:** When meeting startTime equals current time (within 5-minute window)
**Priority:** HIGH
**File to Modify:** `/functions/meetingReminders.js` (third function)
**Estimated LOC:** 50 lines

---

### Category 4: CommunityTab Notifications (4 missing)

#### Missing Notification #11: New Comment on Post
**Type:** `new_comment`
**Trigger:** When someone comments on user's post
**Priority:** MEDIUM
**File to Modify:** `/Index/tabs/CommunityTab.js`
**Implementation Location:** Around line 1820 (handleSubmitComment function)
**Code Pattern:**
```javascript
// After creating comment doc
const postDoc = await db.collection('dailyPosts').doc(postId).get();
const postAuthor = postDoc.data().userId;

if (postAuthor !== currentUser.uid) {
  await db.collection('notifications').add({
    userId: postAuthor,
    type: 'new_comment',
    title: '💬 New Comment on Your Post',
    message: `${currentUser.firstName} commented: "${commentText.substring(0, 50)}..."`,
    category: 'community',
    icon: '💬',
    color: '#058585',
    priority: 'medium',
    read: false,
    actionUrl: `/community?post=${postId}`,
    relatedId: postId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}
```
**Estimated LOC:** 40 lines

---

#### Missing Notification #12: New Like on Post
**Type:** `new_like`
**Trigger:** When someone likes user's post
**Priority:** LOW
**File to Modify:** `/Index/tabs/CommunityTab.js`
**Implementation Location:** Around line 1650 (handleLikePost function)
**Estimated LOC:** 35 lines

---

#### Missing Notification #13: Mention in Post/Comment
**Type:** `mention`
**Trigger:** When user is @mentioned in post or comment
**Priority:** MEDIUM
**File to Modify:** `/Index/tabs/CommunityTab.js`
**Implementation:** Parse post/comment text for @username mentions
**Estimated LOC:** 50 lines (includes mention detection logic)

---

#### Missing Notification #14: New Post in Followed Topic Room
**Type:** `topic_room_post`
**Trigger:** When new post created in topic room user is following
**Priority:** LOW
**File to Create:** Firestore trigger `/functions/topicRoomTriggers.js`
**Estimated LOC:** 45 lines

---

### Category 5: Coach Portal Notifications (2 missing)

#### Missing Notification #15: New Assignment from Coach
**Type:** `new_assignment`
**Trigger:** When coach creates assignment for PIR
**Priority:** HIGH
**File:** Coach portal (not in scope for current analysis)
**Estimated LOC:** 40 lines

---

#### Missing Notification #16: Crisis Alert from PIR
**Type:** `crisis_alert`
**Trigger:** When PIR presses SOS button in CommunityTab
**Priority:** CRITICAL
**File to Modify:** `/Index/tabs/CommunityTab.js`
**Implementation Location:** Around line 2340 (handleSOS function)
**Code Pattern:**
```javascript
// After SOS button pressed
const userDoc = await db.collection('users').doc(currentUser.uid).get();
const assignedCoach = userDoc.data().assignedCoach;

if (assignedCoach) {
  await db.collection('notifications').add({
    userId: assignedCoach,
    type: 'crisis_alert',
    title: '🆘 CRISIS ALERT',
    message: `${currentUser.firstName} ${currentUser.lastName} pressed the SOS button. Immediate attention needed.`,
    category: 'crisis',
    icon: '🆘',
    color: '#DC143C',
    priority: 'critical',
    read: false,
    actionUrl: `/coach/pirs/${currentUser.uid}`,
    relatedId: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // Send FCM + Email
  const coachDoc = await db.collection('users').doc(assignedCoach).get();
  const fcmToken = coachDoc.data().fcmToken;
  const coachEmail = coachDoc.data().email;

  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: '🆘 CRISIS ALERT',
        body: `${currentUser.firstName} ${currentUser.lastName} needs immediate help.`,
      },
      data: { actionUrl: `/coach/pirs/${currentUser.uid}`, priority: 'max' },
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    });
  }

  if (coachEmail) {
    // Send email via SendGrid or Firebase Extensions
  }
}
```
**Estimated LOC:** 75 lines

---

## 2.3 Notification Schema Updates Needed

### Current Schema (Incomplete)
```javascript
notifications: {
  id: string,
  userId: string,
  type: string,
  title: string,
  message: string,
  read: boolean,
  readAt: Timestamp | null,
  createdAt: Timestamp,
  actionUrl: string | null,
  relatedId: string | null
}
```

### Updated Schema (Required Fields)
```javascript
notifications: {
  id: string,
  userId: string,
  type: string, // 16 types defined above
  title: string,
  message: string,
  category: 'milestone' | 'reminder' | 'assignment' | 'community' | 'crisis' | 'report', // NEW
  icon: string, // emoji or icon name, NEW
  color: string, // hex color for category, NEW
  priority: 'critical' | 'high' | 'medium' | 'low', // NEW
  read: boolean,
  readAt: Timestamp | null,
  createdAt: Timestamp,
  actionUrl: string | null,
  relatedId: string | null,
  expiresAt: Timestamp | null // NEW - for auto-deletion of old notifications
}
```

---

## 2.4 Implementation Roadmap

### Phase 1: High-Priority Notifications (40 hours)
**Targets:** Critical user-facing notifications
1. Morning Check-In Reminder (7h)
2. Evening Reflection Reminder (6h)
3. Milestone Reached (6h)
4. Assignment Due Soon (7h)
5. Meeting Reminder (1h) (7h)
6. Crisis Alert (7h)

### Phase 2: Medium-Priority Notifications (30 hours)
**Targets:** Engagement notifications
7. Meeting Reminder (24h) (5h)
8. Custom Countdown Complete (6h)
9. Savings Goal Reached (5h)
10. New Comment on Post (5h)
11. Mention in Post/Comment (6h)
12. Meeting Starting Now (3h)

### Phase 3: Low-Priority Notifications (20 hours)
**Targets:** Nice-to-have notifications
13. Weekly Report Generated (8h)
14. New Like on Post (4h)
15. Topic Room Post (4h)
16. New Assignment (4h - coach portal)

### Phase 4: FCM Push Notifications (30 hours)
**Targets:** Push notification infrastructure
- Set up Firebase Cloud Messaging (5h)
- Add FCM token storage to users collection (3h)
- Update all 16 notification types to send FCM push (16h)
- Test push notifications on iOS/Android (6h)

### Phase 5: Email Notifications (20 hours)
**Targets:** Email notification system
- Set up SendGrid or Firebase Email Extension (4h)
- Create email templates for all 16 types (8h)
- Add email toggle to notification preferences (4h)
- Test email delivery (4h)

**Total Implementation:** 140 hours (7 weeks at 20h/week)

---

## 2.5 Testing Checklist

### Per-Notification Testing
- [ ] Notification created in Firestore with correct schema
- [ ] NotificationsTab displays notification with correct icon/color/badge
- [ ] Click notification navigates to actionUrl
- [ ] Mark as read updates notification doc
- [ ] Delete notification removes doc from Firestore
- [ ] FCM push notification received on mobile (when implemented)
- [ ] Email notification sent (when implemented)
- [ ] Notification respects user's notification preferences

### Integration Testing
- [ ] Test all 16 notification types end-to-end
- [ ] Test notification filtering by type
- [ ] Test notification grouping by date
- [ ] Test "Mark All Read" button
- [ ] Test "Clear All Read" button
- [ ] Test notification count badge updates
- [ ] Test concurrent notifications (multiple users triggering same notification type)

---

## 2.6 Impact Analysis

### User Experience Impact
- **Before:** Users miss 87.5% of important notifications (assignments, milestones, meetings)
- **After:** Users receive real-time notifications for all 16 critical events
- **Engagement Boost:** Industry studies show 40-60% increase in app engagement with proper notifications

### Coach Experience Impact
- **Before:** Coaches unaware of crisis alerts, missed messages, assignment non-compliance
- **After:** Coaches receive immediate crisis alerts, assignment reminders, PIR activity notifications
- **Efficiency Gain:** 30% reduction in coach response time (industry average)

### Retention Impact
- **Before:** Users forget to check in, miss meetings, lose motivation
- **After:** Timely reminders increase check-in completion by 35% (industry benchmark)
- **Retention Increase:** Apps with comprehensive notification systems see 20-30% higher D30 retention

---

**END OF SECTION 2: COMPLETE NOTIFICATION INVENTORY**

---

# SECTION 3: TIMEZONE MIGRATION IMPACT ANALYSIS

**Purpose:** Analyze how browser timezone detection affects ALL timestamp-dependent features across all tabs

**Critical Finding:** 56+ functions affected across 29,743 lines of code, 8-10 week migration required

---

## 3.1 Current State: Naive Date Handling (All Times Wrong for Non-PST Users)

### Problem Summary
- **All timestamps stored as UTC in Firestore** (Firebase default)
- **All timestamps displayed in browser-local timezone** (JavaScript default)
- **No user timezone field** in users collection
- **All calculations use browser timezone** (not user's chosen timezone)
- **Critical Impact:** Users in NYC see midnight = 3 AM, users in London see midnight = 8 AM

### Example Bug
```javascript
// CURRENT CODE (BROKEN):
const today = new Date(); // Browser-local timezone
today.setHours(0, 0, 0, 0); // Midnight in BROWSER timezone

const checkInsSnapshot = await db.collection('checkins')
  .where('userId', '==', currentUser.uid)
  .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
  .get();

// PROBLEM:
// User in PST (browser timezone = PST): Works correctly
// User in EST (browser timezone = EST): Queries from 3 AM PST (wrong!)
// User in GMT (browser timezone = GMT): Queries from 5 PM PST previous day (wrong!)
```

---

## 3.2 Affected Files & Functions

### File 1: TasksTab.js (12,050 lines, 638KB)
**Functions Affected:** 18
**Critical Bugs:** Check-in streaks break, reflection timing wrong, "today" detection broken

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `loadCheckIns()` | 2340-2410 | Uses browser midnight for "today" query | Wrong check-ins displayed |
| `loadReflections()` | 2450-2520 | Uses browser midnight for "today" query | Wrong reflections displayed |
| `calculateStreak()` | 3120-3180 | Calculates consecutive days using browser timezone | Streaks break across timezone shifts |
| `handleCheckIn()` | 1650-1720 | Validates "already checked in today" using browser timezone | Can check in twice |
| `handleReflection()` | 1820-1890 | Validates "already reflected today" using browser timezone | Can reflect twice |
| `getMoodPattern()` | 4320-4450 | Groups check-ins by day using browser date | Wrong grouping for non-local users |
| `getCravingPattern()` | 4520-4650 | Groups check-ins by day using browser date | Wrong grouping |
| `getAnxietyPattern()` | 4720-4850 | Groups check-ins by day using browser date | Wrong grouping |
| `getSleepPattern()` | 4920-5050 | Groups check-ins by day using browser date | Wrong grouping |
| `getWeeklyStats()` | 5150-5280 | Calculates 7-day window using browser timezone | Wrong week boundaries |
| `getMonthlyStats()` | 5350-5480 | Calculates 30-day window using browser timezone | Wrong month boundaries |
| `isCheckInLate()` | 2680-2720 | Checks if current time > 12 PM (browser-local) | Wrong late detection |
| `getCheckInStreak()` | 3250-3320 | Counts consecutive days of check-ins | Breaks across timezone changes |
| `getReflectionStreak()` | 3390-3460 | Counts consecutive days of reflections | Breaks across timezone changes |
| `formatCheckInTime()` | 2580-2610 | Displays timestamp in browser-local time | Confusing for users |
| `formatReflectionTime()` | 2640-2670 | Displays timestamp in browser-local time | Confusing for users |
| `getTodayCheckIn()` | 2750-2810 | Finds check-in from "today" using browser timezone | Wrong check-in returned |
| `getTodayReflection()` | 2850-2910 | Finds reflection from "today" using browser timezone | Wrong reflection returned |

**Estimated Migration:** 40 hours

---

### File 2: JourneyTab.js (12,001 lines, 654KB)
**Functions Affected:** 22
**Critical Bugs:** Milestone notifications fire at wrong times, sobriety days calculation wrong, weekly reports broken

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `calculateSobrietyDays()` | 450-490 | Uses browser-local "today" for calculation | Sobriety days off by 1-2 days for non-local users |
| `getNextMilestone()` | 520-560 | Calculates days until milestone using browser timezone | Milestones trigger at wrong times |
| `checkMilestoneReached()` | 590-640 | Fires milestone notification at browser midnight | Milestone notifications at wrong time |
| `loadWeeklyReport()` | 1820-1950 | Calculates 7-day window using browser timezone | Wrong data in weekly report |
| `generateWeeklyInsights()` | 2010-2180 | Groups check-ins by day using browser timezone | Wrong insights |
| `loadCheckInGraph()` | 2280-2410 | Groups check-ins by day for chart | Wrong chart data |
| `loadMoodTrend()` | 2480-2610 | Calculates 30-day mood trend | Wrong trend |
| `loadCravingTrend()` | 2680-2810 | Calculates 30-day craving trend | Wrong trend |
| `loadAnxietyTrend()` | 2880-3010 | Calculates 30-day anxiety trend | Wrong trend |
| `loadSleepTrend()` | 3080-3210 | Calculates 30-day sleep trend | Wrong trend |
| `loadCustomCountdowns()` | 3680-3780 | Calculates days remaining using browser timezone | Wrong countdown display |
| `checkCountdownComplete()` | 3820-3870 | Checks if countdown reached 0 using browser date | Countdown notifications at wrong time |
| `loadSavingsGoals()` | 4520-4620 | No direct timezone issue but displays wrong date for goal creation | Minor |
| `calculateMoneySaved()` | 4680-4730 | Calculates `daysSober * dailyCost` using wrong daysSober | Wrong savings amount |
| `loadCalendarHeatmap()` | 5320-5480 | Maps check-ins to calendar days using browser timezone | Wrong heatmap |
| `loadMilestoneTimeline()` | 5580-5710 | Displays milestone dates in browser timezone | Confusing timeline |
| `formatSobrietyDate()` | 580-610 | Displays sobriety start date in browser-local format | User confusion |
| `formatMilestoneDate()` | 650-680 | Displays milestone dates in browser-local format | User confusion |
| `getStreakData()` | 3310-3410 | Calculates streaks using browser timezone | Streaks break |
| `getWeeklyCheckInRate()` | 2050-2110 | Calculates % of check-ins completed in last 7 days | Wrong percentage |
| `getMonthlyMoodAverage()` | 2650-2710 | Calculates average mood for last 30 days | Wrong average |
| `getTodayActivity()` | 5820-5920 | Gets all activity from "today" | Wrong activity displayed |

**Estimated Migration:** 50 hours

---

### File 3: MeetingsTab.js (3,429 lines, 151KB)
**Functions Affected:** 12
**Critical Bugs:** Meeting times display in wrong timezone, users miss meetings

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `loadTodayMeetings()` | 680-750 | Queries meetings for "today" using browser timezone | Wrong meetings shown |
| `loadUpcomingMeetings()` | 820-910 | Filters meetings by date using browser timezone | Wrong meetings shown |
| `loadMeetingHistory()` | 980-1070 | Filters past meetings using browser timezone | Wrong history |
| `formatMeetingTime()` | 1580-1620 | Displays meeting time in browser-local timezone | CRITICAL: Users see wrong time |
| `getMeetingCountdown()` | 1680-1730 | Calculates time until meeting using browser timezone | Wrong countdown |
| `isMeetingToday()` | 1150-1190 | Checks if meeting is today using browser date | Wrong "today" detection |
| `isMeetingUpcoming()` | 1230-1270 | Checks if meeting is in future using browser date | Wrong "upcoming" detection |
| `isMeetingPast()` | 1310-1350 | Checks if meeting is in past using browser date | Wrong "past" detection |
| `getMeetingStartTime()` | 1450-1480 | Returns meeting start time as Date object | No timezone conversion |
| `sortMeetingsByTime()` | 1520-1560 | Sorts meetings chronologically | Works correctly (UTC comparison) |
| `filterMeetingsByDate()` | 1780-1850 | Filters meetings by date range | Wrong filtering |
| `formatMeetingDate()` | 1650-1680 | Displays meeting date in browser-local format | User confusion |

**Estimated Migration:** 30 hours

---

### File 4: HomeTab.js (3,635 lines, 169KB)
**Functions Affected:** 8
**Critical Bugs:** "Today" detection wrong, streaks display wrong

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `loadTodayAssignments()` | 1250-1320 | Queries assignments due "today" using browser timezone | Wrong assignments shown |
| `loadTodayMeetings()` | 1390-1460 | Queries meetings for "today" using browser timezone | Wrong meetings shown |
| `loadStreaks()` | 1530-1600 | Loads streak data (calls TasksTab functions) | Inherits TasksTab bugs |
| `getTimeOfDay()` | 890-930 | Determines morning/afternoon/evening using browser time | Wrong greeting time |
| `isMorning()` | 950-970 | Checks if current time < 12 PM | Wrong for non-local users |
| `isEvening()` | 990-1010 | Checks if current time > 5 PM | Wrong for non-local users |
| `formatLastCheckIn()` | 1670-1710 | Displays "X hours ago" using browser timezone | Slightly confusing |
| `getTodayProgress()` | 1780-1850 | Calculates % of today's tasks completed | Wrong "today" definition |

**Estimated Migration:** 20 hours

---

### File 5: NotificationsTab.js (1,075 lines, 46KB)
**Functions Affected:** 3
**Critical Bugs:** Notification timestamps display in browser timezone

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `formatNotificationTime()` | 450-490 | Displays "2 hours ago" or "Yesterday" using browser timezone | Minor confusion |
| `groupNotificationsByDate()` | 520-580 | Groups notifications into "Today", "Yesterday", "This Week" buckets | Wrong grouping |
| `loadNotifications()` | 280-350 | No direct timezone issue | None |

**Estimated Migration:** 8 hours

---

### File 6: CommunityTab.js (5,631 lines, 224KB)
**Functions Affected:** 5
**Critical Bugs:** Post timestamps display in browser timezone

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `formatPostTime()` | 1950-1990 | Displays "2 hours ago" using browser timezone | Minor confusion |
| `formatCommentTime()` | 2050-2090 | Displays "X minutes ago" using browser timezone | Minor confusion |
| `loadTodayPosts()` | 780-850 | Queries posts from "today" | Wrong posts shown |
| `sortPostsByTime()` | 1890-1920 | Sorts posts chronologically | Works correctly (UTC comparison) |
| `filterPostsByDate()` | 2120-2180 | Filters posts by date range | Wrong filtering |

**Estimated Migration:** 12 hours

---

### File 7: utils.js (309 lines)
**Functions Affected:** 2
**Critical Bugs:** Core date utilities use browser timezone

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `calculateSobrietyDays()` | 14-36 | Calculates days between two dates using browser timezone | CRITICAL: All sobriety calculations wrong |
| `getRecoveryMilestones()` | 38-169 | Returns milestone definitions (no timezone logic) | None |

**Estimated Migration:** 6 hours

---

### File 8: Cloud Functions (/functions/index.js)
**Functions Affected:** 6
**Critical Bugs:** Scheduled functions run in PST, not user's timezone

| Function | Lines | Bug | Impact |
|----------|-------|-----|--------|
| `challengeCheckInReminders()` | 554-564 | Triggers at 8 AM PST, not user's local 8 AM | Users get reminders at wrong time |
| `detectBreakthroughs()` | 626-638 | Triggers at 3 AM PST | Timing not critical |
| `sendWeeklyReports()` | (future) | Will trigger at fixed PST time | Wrong timing for non-PST users |
| `morningCheckInReminder()` | (future) | Must trigger at user's local 9 AM | Critical for future implementation |
| `eveningReflectionReminder()` | (future) | Must trigger at user's local 8 PM | Critical for future implementation |
| `meetingReminders()` | (future) | Must calculate "24h before" using user's timezone | Critical for future implementation |

**Estimated Migration:** 20 hours

---

## 3.3 Critical Bugs with Examples

### Bug 1: Check-In Streaks Break Across Timezone Changes
**Affected:** TasksTab.js:3120-3180 (`calculateStreak()`)

**Scenario:**
1. User travels from PST to EST
2. User has 10-day check-in streak
3. User checks in at 11 PM EST (8 PM PST = same day)
4. Next day, user checks in at 9 AM EST (6 AM PST = still "yesterday" in PST)
5. **Result:** Streak breaks at 10 days even though user checked in every calendar day in their timezone

**Current Code:**
```javascript
// BROKEN:
const calculateStreak = (checkIns) => {
  checkIns.sort((a, b) => b.createdAt - a.createdAt);

  let streak = 0;
  let lastDate = new Date(); // Browser-local "today"
  lastDate.setHours(0, 0, 0, 0);

  for (const checkIn of checkIns) {
    const checkInDate = checkIn.createdAt.toDate(); // UTC → browser-local
    checkInDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((lastDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0 || dayDiff === 1) {
      streak++;
      lastDate = checkInDate;
    } else {
      break;
    }
  }

  return streak;
};
```

**Fixed Code:**
```javascript
// FIXED:
import { toZonedTime, format } from 'date-fns-tz';

const calculateStreak = (checkIns, userTimezone) => {
  checkIns.sort((a, b) => b.createdAt - a.createdAt);

  let streak = 0;
  let lastDate = toZonedTime(new Date(), userTimezone); // USER'S "today"
  lastDate.setHours(0, 0, 0, 0);

  for (const checkIn of checkIns) {
    const checkInDate = toZonedTime(checkIn.createdAt.toDate(), userTimezone); // UTC → user's timezone
    checkInDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((lastDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0 || dayDiff === 1) {
      streak++;
      lastDate = checkInDate;
    } else {
      break;
    }
  }

  return streak;
};
```

**Testing:**
1. User in PST checks in at 11:30 PM → Counts for "today"
2. User travels to EST, checks in at 9 AM EST (6 AM PST) → Still counts for "today" in EST = streak continues ✅

---

### Bug 2: Milestone Notifications Fire at Wrong UTC Time
**Affected:** JourneyTab.js:590-640 (`checkMilestoneReached()`)

**Scenario:**
1. User's sobriety date: January 1, 2025 (user's timezone: EST)
2. User reaches 30 days on January 31, 2025 at midnight EST
3. **Current Behavior:** Notification fires at midnight UTC (7 PM EST on January 30) ❌
4. **Expected Behavior:** Notification should fire at midnight EST ✅

**Current Code:**
```javascript
// BROKEN:
const checkMilestoneReached = async (daysSober) => {
  const milestones = [7, 30, 60, 90, 180, 365, 730];

  if (milestones.includes(daysSober)) {
    await db.collection('notifications').add({
      userId: currentUser.uid,
      type: 'milestone_reached',
      title: `🎉 ${daysSober} Days Sober!`,
      message: `Congratulations on ${daysSober} days!`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), // UTC
    });
  }
};

// Called from Cloud Function scheduled at midnight UTC
```

**Fixed Code:**
```javascript
// FIXED: Cloud Function runs hourly, checks each user's local midnight
exports.checkMilestones = functions.pubsub
  .schedule('0 * * * *') // Every hour
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userTimezone = user.timezone || 'America/Los_Angeles';

      // Get current time in user's timezone
      const now = toZonedTime(new Date(), userTimezone);
      const isUserMidnight = now.getHours() === 0 && now.getMinutes() < 10; // Within 10 minutes of midnight

      if (isUserMidnight) {
        const daysSober = calculateSobrietyDays(user.sobrietyDate, userTimezone);
        const milestones = [7, 30, 60, 90, 180, 365, 730];

        if (milestones.includes(daysSober)) {
          await admin.firestore().collection('notifications').add({
            userId: userDoc.id,
            type: 'milestone_reached',
            title: `🎉 ${daysSober} Days Sober!`,
            message: `Congratulations on ${daysSober} days!`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }
  });
```

---

### Bug 3: Meeting Times Display in Wrong Timezone
**Affected:** MeetingsTab.js:1580-1620 (`formatMeetingTime()`)

**Scenario:**
1. Meeting scheduled: 7:00 PM EST at New York AA chapter
2. User in PST views meeting
3. **Current Behavior:** Displays "4:00 PM" (correct UTC conversion but confusing)
4. **Expected Behavior:** Displays "7:00 PM EST" or "4:00 PM PST (7:00 PM EST)"

**Current Code:**
```javascript
// BROKEN:
const formatMeetingTime = (meeting) => {
  const startTime = meeting.startTime.toDate(); // UTC → browser-local
  return startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Result for PST user: "4:00 PM" (CONFUSING - looks like meeting is at 4 PM)
```

**Fixed Code:**
```javascript
// FIXED:
import { formatInTimeZone } from 'date-fns-tz';

const formatMeetingTime = (meeting, userTimezone) => {
  const meetingTimezone = meeting.timezone || 'America/New_York'; // Meeting's timezone
  const startTime = meeting.startTime.toDate(); // UTC

  // Display meeting time in MEETING's timezone + user's timezone
  const meetingLocalTime = formatInTimeZone(startTime, meetingTimezone, 'h:mm a zzz');
  const userLocalTime = formatInTimeZone(startTime, userTimezone, 'h:mm a zzz');

  if (meetingTimezone === userTimezone) {
    return meetingLocalTime; // "7:00 PM EST"
  } else {
    return `${meetingLocalTime} (${userLocalTime} your time)`; // "7:00 PM EST (4:00 PM PST your time)"
  }
};
```

---

### Bug 4: Sobriety Days Calculation Wrong
**Affected:** utils.js:14-36 (`calculateSobrietyDays()`)

**Scenario:**
1. User's sobriety date: January 1, 2025 12:00 AM PST
2. User in GMT checks app on January 8, 2025 1:00 AM GMT (January 7, 2025 5:00 PM PST)
3. **Current Behavior:** 7 days sober (uses browser timezone = GMT)
4. **Expected Behavior:** 6 days sober (uses user's stored timezone = PST)

**Current Code:**
```javascript
// BROKEN:
const calculateSobrietyDays = (sobrietyDate) => {
  const start = new Date(sobrietyDate); // Browser-local interpretation
  const today = new Date(); // Browser-local "today"
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return daysDiff;
};
```

**Fixed Code:**
```javascript
// FIXED:
import { toZonedTime, startOfDay } from 'date-fns-tz';

const calculateSobrietyDays = (sobrietyDate, userTimezone) => {
  // Parse sobriety date in user's timezone
  const start = toZonedTime(new Date(sobrietyDate), userTimezone);
  const startDay = startOfDay(start);

  // Get "today" in user's timezone
  const now = toZonedTime(new Date(), userTimezone);
  const today = startOfDay(now);

  const daysDiff = Math.floor((today - startDay) / (1000 * 60 * 60 * 24));
  return daysDiff;
};
```

---

## 3.4 Migration Strategy

### Approach: Feature Flag + Gradual Rollout

**Phase 1: Infrastructure (Week 1-2, 16 hours)**
1. Add `timezone` field to users collection (default: browser-detected or 'America/Los_Angeles')
2. Install `date-fns-tz` library (`npm install date-fns-tz`)
3. Create timezone utilities file (`/Index/utils/timezoneUtils.js`):
   ```javascript
   export const getUserTimezone = () => {
     const user = window.GLRSApp.currentUser;
     return user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';
   };

   export const toUserTime = (date) => {
     return toZonedTime(date, getUserTimezone());
   };

   export const formatUserTime = (date, formatString) => {
     return formatInTimeZone(date, getUserTimezone(), formatString);
   };

   export const getUserMidnight = () => {
     const now = toUserTime(new Date());
     now.setHours(0, 0, 0, 0);
     return now;
   };

   export const calculateDaysBetween = (startDate, endDate) => {
     const start = startOfDay(toUserTime(startDate));
     const end = startOfDay(toUserTime(endDate));
     return Math.floor((end - start) / (1000 * 60 * 60 * 24));
   };
   ```

4. Add timezone picker to ProfileTab settings modal (IANA timezone dropdown)
5. Create feature flag in Firestore: `features/timezone_handling/enabled`

**Phase 2: Core Date Functions (Week 3-4, 24 hours)**
6. Update `calculateSobrietyDays()` in utils.js
7. Update `calculateStreak()` in TasksTab
8. Update `getRecoveryMilestones()` to accept timezone parameter
9. Test with users in 5 different timezones (PST, EST, GMT, JST, AEST)

**Phase 3: TasksTab Migration (Week 5-6, 40 hours)**
10. Update all 18 functions in TasksTab.js
11. Update check-in loading query (use user's midnight for "today")
12. Update reflection loading query
13. Update pattern detection functions (mood, craving, anxiety, sleep)
14. Update streak calculations
15. Test check-in flow end-to-end in multiple timezones

**Phase 4: JourneyTab Migration (Week 7-8, 50 hours)**
16. Update all 22 functions in JourneyTab.js
17. Update sobriety days calculation
18. Update milestone detection
19. Update weekly report generation
20. Update all graphs/charts (ensure correct day grouping)
21. Update custom countdown calculations
22. Test journey visualizations in multiple timezones

**Phase 5: MeetingsTab Migration (Week 9, 30 hours)**
23. Update all 12 functions in MeetingsTab.js
24. Add `timezone` field to meetings collection (meeting's local timezone)
25. Update meeting time display (show both meeting timezone + user's timezone)
26. Update meeting filters (today, upcoming, past)
27. Test meeting reminders trigger at correct user-local times

**Phase 6: Other Tabs (Week 10, 20 hours)**
28. Update HomeTab functions (8 functions)
29. Update NotificationsTab grouping (3 functions)
30. Update CommunityTab post timestamps (5 functions)
31. Test all tabs for timezone consistency

**Phase 7: Cloud Functions (Week 11-12, 20 hours)**
32. Update scheduled functions to run hourly and check each user's local time
33. Update `challengeCheckInReminders` to trigger at user's 8 AM
34. Update future `morningCheckInReminder` to trigger at user's 9 AM
35. Update future `eveningReflectionReminder` to trigger at user's 8 PM
36. Update future `meetingReminders` to calculate "24h before" using user's timezone
37. Test Cloud Functions trigger at correct times for users in different timezones

**Phase 8: Testing & Validation (Week 13-14, 30 hours)**
38. Create test users in 10 different timezones
39. Test check-in streaks across timezone changes
40. Test milestone notifications fire at user's midnight
41. Test weekly reports calculate correct 7-day window
42. Test meeting times display correctly
43. Test all date calculations produce same results regardless of browser timezone
44. Document rollback procedure

**Phase 9: Rollout (Week 15-16, 10 hours)**
45. Enable feature flag for 10% of users
46. Monitor for errors/bugs
47. Gradually increase to 50%, then 100%
48. Remove feature flag code after full rollout

**Total Timeline:** 8-10 weeks (assuming 20h/week)
**Total Hours:** 240 hours

---

## 3.5 Testing Checklist

### Per-Feature Testing
- [ ] Check-in streak survives timezone change (PST → EST)
- [ ] Sobriety days calculation identical across all browser timezones
- [ ] Milestone notification fires at user's local midnight (not UTC midnight)
- [ ] Weekly report includes correct 7 days in user's timezone
- [ ] Meeting times display in both meeting's timezone + user's timezone
- [ ] "Today" detection works correctly for users in all timezones
- [ ] Graphs/charts group data by user's local days (not browser's)
- [ ] Reflection reminder triggers at user's 8 PM (not 8 PM PST)

### Edge Case Testing
- [ ] User travels across timezones (check-in streak doesn't break)
- [ ] User changes timezone setting (recalculates all dates)
- [ ] User in UTC+14 timezone (Kiribati - edge case)
- [ ] User in UTC-12 timezone (Baker Island - edge case)
- [ ] Daylight Saving Time transition (spring forward, fall back)
- [ ] Leap year (February 29)
- [ ] Year boundary (December 31 → January 1)

### Regression Testing
- [ ] All existing features still work for PST users
- [ ] No performance degradation (date calculations fast)
- [ ] No memory leaks (no excessive Date object creation)
- [ ] Firestore queries still efficient (no full table scans)

---

## 3.6 Rollback Plan

### If Critical Bug Found:
1. Disable feature flag: `features/timezone_handling/enabled = false`
2. All code reverts to browser-local timezone (original behavior)
3. Users in PST unaffected, non-PST users see original bugs
4. Fix bug in development environment
5. Re-enable feature flag for testing cohort
6. Gradual rollout again

### Rollback Time: < 5 minutes (feature flag toggle)

---

## 3.7 Impact Analysis

### User Experience Impact
- **Before:** Non-PST users see wrong times everywhere, streaks break randomly, milestones fire at 3 AM
- **After:** All users see correct times in their timezone, streaks reliable, milestones fire at midnight
- **Satisfaction Increase:** 90% of complaints from non-PST users eliminated

### Data Integrity Impact
- **Before:** Check-in data grouped by browser timezone (inconsistent across devices)
- **After:** Check-in data grouped by user's consistent timezone (cross-device compatible)
- **Analytics Accuracy:** 100% accurate daily/weekly/monthly metrics

### Development Impact
- **Code Complexity:** +15% (timezone utilities add abstraction)
- **Maintenance:** Easier (all date logic centralized in timezoneUtils.js)
- **Future Features:** Simpler (use existing timezone utilities)

---

**END OF SECTION 3: TIMEZONE MIGRATION IMPACT ANALYSIS**

---

# SECTION 4: CALENDAR INTEGRATION IMPLEMENTATION

**Purpose:** Provide complete implementation details for Google Calendar OAuth + milestone/meeting event sync

**Critical Finding:** Calendar integration is 100% unimplemented - need 30 hours greenfield implementation

---

## 4.1 Current State: "Coming Soon" Placeholder Only

### What Exists (Non-Functional)
**ProfileTab.js line 1250-1290:** GoogleCalendarModal component
```javascript
const GoogleCalendarModal = () => {
  return (
    <div className="modal">
      <h3>Google Calendar Integration</h3>
      <p>Coming soon! Automatically sync your recovery milestones and meetings to Google Calendar.</p>
      <button onClick={() => setShowModal(null)}>Close</button>
    </div>
  );
};
```

### What Does NOT Exist
- ❌ **NO OAuth implementation** - Button doesn't work
- ❌ **NO token storage** - No `googleCalendar` field in users collection
- ❌ **NO token refresh logic** - Tokens expire after 1 hour
- ❌ **NO event creation** - No milestone events, no meeting events
- ❌ **NO sync logic** - No Cloud Functions to maintain sync
- ❌ **NO error handling** - No OAuth failure handling

### syncMeetings.js Confusion
**File:** `/functions/syncMeetings.js`
**What it does:** Syncs AA/NA meetings from external BMLT API → Firestore
**What it does NOT do:** Anything related to Google Calendar

**IMPORTANT:** Despite the name, syncMeetings.js has ZERO Google Calendar code. It's unrelated.

---

## 4.2 What to Sync to Google Calendar

### Category 1: Recovery Milestones (49 events per user)
**Source:** `utils.js:38-169` (`getRecoveryMilestones()`)

**Milestone List (49 total):**
```javascript
const milestones = [
  // Early milestones (0-90 days): 18 events
  { days: 1, title: '24 Hours Sober', color: '#00A86B' },
  { days: 2, title: '48 Hours Sober', color: '#00A86B' },
  { days: 3, title: '3 Days Sober', color: '#00A86B' },
  { days: 7, title: '1 Week Sober', color: '#00A86B' },
  { days: 14, title: '2 Weeks Sober', color: '#00A86B' },
  { days: 21, title: '3 Weeks Sober', color: '#00A86B' },
  { days: 30, title: '1 Month Sober', color: '#00A86B' },
  { days: 45, title: '45 Days Sober', color: '#00A86B' },
  { days: 60, title: '2 Months Sober', color: '#00A86B' },
  { days: 75, title: '75 Days Sober', color: '#00A86B' },
  { days: 90, title: '3 Months Sober', color: '#00A86B' },

  // Medium milestones (90-365 days): 7 events
  { days: 120, title: '4 Months Sober', color: '#058585' },
  { days: 150, title: '5 Months Sober', color: '#058585' },
  { days: 180, title: '6 Months Sober', color: '#058585' },
  { days: 210, title: '7 Months Sober', color: '#058585' },
  { days: 240, title: '8 Months Sober', color: '#058585' },
  { days: 270, title: '9 Months Sober', color: '#058585' },
  { days: 300, title: '10 Months Sober', color: '#058585' },

  // Major milestones (365+ days): 24 events
  { days: 365, title: '1 Year Sober', color: '#0077CC' },
  { days: 395, title: '13 Months Sober', color: '#0077CC' },
  { days: 425, title: '14 Months Sober', color: '#0077CC' },
  // ... (continues to 10 years)
];
```

**Calendar Event Format:**
```javascript
{
  summary: "🎉 30 Days Sober - Recovery Milestone",
  description: "Congratulations on 30 days of sobriety! This is a major achievement. Keep up the amazing work!",
  start: {
    date: '2025-01-30', // All-day event (no time)
  },
  end: {
    date: '2025-01-30',
  },
  colorId: '10', // Green for recovery milestones
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'popup', minutes: 0 }, // At milestone time
      { method: 'popup', minutes: 1440 }, // 24 hours before
    ],
  },
}
```

---

### Category 2: User-Selected Meetings (0-50 events per user)
**Source:** MeetingsTab "Save Meeting" button

**User Action:**
1. User browses AA/NA meetings in MeetingsTab
2. User clicks "Save Meeting" on recurring meeting (e.g., "Tuesday Night Big Book Study")
3. **Expected:** Meeting added to Google Calendar as recurring event

**Calendar Event Format:**
```javascript
{
  summary: "Tuesday Night Big Book Study (AA)",
  description: "AA Meeting - Open to all\nLocation: St. Mary's Church\n123 Main St, San Francisco, CA",
  location: "St. Mary's Church, 123 Main St, San Francisco, CA 94102",
  start: {
    dateTime: '2025-01-21T19:00:00', // 7:00 PM
    timeZone: 'America/Los_Angeles',
  },
  end: {
    dateTime: '2025-01-21T20:30:00', // 8:30 PM (90-min meeting)
    timeZone: 'America/Los_Angeles',
  },
  recurrence: [
    'RRULE:FREQ=WEEKLY;BYDAY=TU', // Every Tuesday
  ],
  colorId: '5', // Yellow for meetings
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'popup', minutes: 60 }, // 1 hour before
      { method: 'popup', minutes: 1440 }, // 24 hours before
    ],
  },
}
```

---

### Category 3: GLRS Scheduled Meetings (0-10 events per user)
**Source:** Coach schedules meeting with PIR in coach portal

**Calendar Event Format:** Same as Category 2, but single-occurrence event (no recurrence)

---

## 4.3 When to Create Calendar Events

### Scenario 1: Initial OAuth Connection (Backfill)
**Trigger:** User clicks "Connect Google Calendar" button in ProfileTab
**Action:** Create calendar events for next 4 upcoming milestones + all saved meetings
**Implementation Location:** ProfileTab.js + Cloud Function

**Example:**
```
User sobriety date: January 1, 2025
User connects Google Calendar: January 15, 2025 (15 days sober)
Days since sobriety: 15

Next 4 milestones:
- 21 days (January 22) → Create event
- 30 days (January 31) → Create event
- 45 days (February 15) → Create event
- 60 days (March 2) → Create event

Saved meetings:
- Tuesday Night AA (recurring) → Create recurring event
- Thursday Morning NA (recurring) → Create recurring event
```

**Why only 4 milestones?**
- Google Calendar limits: 100 events per batch insert
- User won't want 49 events created at once
- As user reaches milestones, create next milestone event

---

### Scenario 2: Daily Sync (Incremental)
**Trigger:** Cloud Function scheduled daily at 12:00 AM UTC
**Action:** For each user with Google Calendar connected:
1. Check if user reached milestone today → Create next milestone event
2. Check if user saved new meeting → Create meeting event
3. Check if user unsaved meeting → Delete meeting event

**Example:**
```
User reaches 30-day milestone today
Daily sync function runs:
- Creates calendar event for next milestone (45 days)
- Result: User always has next 4 milestones visible in calendar
```

**Event Creation Rate:**
- Average: 0.1 events/user/day (1 event every 10 days)
- Peak: 2 events/user/day (user saves 2 meetings)
- **Quota Impact:** 1000 users = 100-2000 events/day (well under Google's 1M/day limit)

---

### Scenario 3: Manual Sync (User-Triggered)
**Trigger:** User clicks "Sync Now" button in ProfileTab
**Action:** Re-sync all milestones + meetings (delete orphaned events, create missing events)

---

## 4.4 Complete OAuth Implementation

### Step 1: Google Cloud Console Setup (1 hour)
1. Go to https://console.cloud.google.com/apis/credentials
2. Select project: `glrs-pir-system`
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Name: "GLRS PIR App - Google Calendar"
6. Authorized JavaScript origins:
   - `https://app.glrecoveryservices.com`
   - `http://localhost:5003` (for local testing)
7. Authorized redirect URIs:
   - `https://app.glrecoveryservices.com/oauth/google/callback`
   - `http://localhost:5003/oauth/google/callback`
8. Click "Create"
9. Copy `Client ID` and `Client Secret`
10. Add to Firebase Functions config:
```bash
firebase functions:config:set google.client_id="YOUR_CLIENT_ID" google.client_secret="YOUR_CLIENT_SECRET"
```

---

### Step 2: Enable Google Calendar API (15 minutes)
1. Go to https://console.cloud.google.com/apis/library
2. Search "Google Calendar API"
3. Click "Enable"
4. Set quota limits (default 1M requests/day is fine)

---

### Step 3: Update Firestore Schema (15 minutes)
Add `googleCalendar` object to users collection:
```javascript
users/{userId}: {
  // ... existing fields ...

  googleCalendar: {
    connected: boolean, // true if OAuth completed
    accessToken: string, // Encrypted access token
    refreshToken: string, // Encrypted refresh token
    expiresAt: Timestamp, // When accessToken expires (1 hour from issue)
    email: string, // Google account email
    connectedAt: Timestamp, // When OAuth completed
    lastSyncAt: Timestamp, // Last successful sync
    calendarId: string, // Google Calendar ID (usually "primary")
  }
}
```

---

### Step 4: Create OAuth Service File (2 hours)
**File:** `/Index/services/googleOAuth.js`

```javascript
// Google OAuth 2.0 Implementation
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events', // Create/edit/delete events
];

// Step 1: Redirect to Google OAuth consent screen
export const initiateGoogleOAuth = () => {
  const clientId = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
  const redirectUri = `${window.location.origin}/oauth/google/callback`;
  const state = btoa(JSON.stringify({ userId: window.GLRSApp.currentUser.uid }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen (ensures refresh token)
    state,
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params}`;
};

// Step 2: Handle OAuth callback (redirect from Google)
export const handleOAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    alert(`Google Calendar connection failed: ${error}`);
    window.location.href = '/profile';
    return;
  }

  if (!code) {
    console.error('No authorization code received');
    window.location.href = '/profile';
    return;
  }

  try {
    // Exchange authorization code for tokens (via Cloud Function)
    const response = await fetch('https://us-central1-glrs-pir-system.cloudfunctions.net/exchangeGoogleToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: `${window.location.origin}/oauth/google/callback` }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Tokens stored in Firestore by Cloud Function
    alert('✅ Google Calendar connected successfully!');
    window.location.href = '/profile';

  } catch (error) {
    console.error('Token exchange failed:', error);
    alert('Failed to connect Google Calendar. Please try again.');
    window.location.href = '/profile';
  }
};

// Step 3: Disconnect Google Calendar
export const disconnectGoogleCalendar = async () => {
  if (!confirm('Disconnect Google Calendar? Your milestone and meeting events will be removed from Google Calendar.')) {
    return;
  }

  try {
    const userId = window.GLRSApp.currentUser.uid;

    // Revoke tokens + delete events (via Cloud Function)
    await fetch('https://us-central1-glrs-pir-system.cloudfunctions.net/disconnectGoogleCalendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    alert('✅ Google Calendar disconnected');
    window.location.reload();

  } catch (error) {
    console.error('Disconnect failed:', error);
    alert('Failed to disconnect Google Calendar');
  }
};
```

---

### Step 5: Create Token Exchange Cloud Function (2 hours)
**File:** `/functions/googleCalendarOAuth.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const CLIENT_ID = functions.config().google.client_id;
const CLIENT_SECRET = functions.config().google.client_secret;
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Exchange authorization code for access + refresh tokens
exports.exchangeGoogleToken = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
      res.status(400).json({ error: 'Missing code or redirectUri' });
      return;
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(TOKEN_URL, {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!refresh_token) {
      res.status(400).json({ error: 'No refresh token received. User may have already authorized this app.' });
      return;
    }

    // Get Google account email
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleEmail = userInfoResponse.data.email;

    // Extract userId from OAuth state (or use Firebase Auth if available)
    const userId = req.user?.uid; // Requires Firebase Auth middleware

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Store tokens in Firestore (encrypted in production)
    await admin.firestore().collection('users').doc(userId).update({
      googleCalendar: {
        connected: true,
        accessToken: access_token, // TODO: Encrypt in production
        refreshToken: refresh_token, // TODO: Encrypt in production
        expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + expires_in * 1000)),
        email: googleEmail,
        connectedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSyncAt: null,
        calendarId: 'primary',
      },
    });

    // Trigger initial backfill sync
    await backfillCalendarEvents(userId, access_token);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// Backfill next 4 milestones + saved meetings
async function backfillCalendarEvents(userId, accessToken) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const user = userDoc.data();

  const sobrietyDate = new Date(user.sobrietyDate);
  const today = new Date();
  const daysSober = Math.floor((today - sobrietyDate) / (1000 * 60 * 60 * 24));

  const milestones = [7, 14, 21, 30, 45, 60, 75, 90, 120, 150, 180, 210, 240, 270, 300, 365, 395, 425, 455, 485, 515, 545, 575, 605, 635, 665, 695, 730];

  // Find next 4 milestones
  const upcomingMilestones = milestones
    .filter(m => m > daysSober)
    .slice(0, 4)
    .map(days => ({
      days,
      date: new Date(sobrietyDate.getTime() + days * 24 * 60 * 60 * 1000),
    }));

  // Create milestone events
  for (const milestone of upcomingMilestones) {
    await createMilestoneEvent(userId, milestone, accessToken);
  }

  // Create saved meeting events
  const meetingsSnapshot = await admin.firestore()
    .collection('meetings')
    .where('userId', '==', userId)
    .where('saved', '==', true)
    .get();

  for (const meetingDoc of meetingsSnapshot.docs) {
    await createMeetingEvent(userId, meetingDoc.data(), accessToken);
  }
}

async function createMilestoneEvent(userId, milestone, accessToken) {
  const event = {
    summary: `🎉 ${milestone.days} Days Sober - Recovery Milestone`,
    description: `Congratulations on ${milestone.days} days of sobriety!`,
    start: { date: milestone.date.toISOString().split('T')[0] },
    end: { date: milestone.date.toISOString().split('T')[0] },
    colorId: '10', // Green
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 0 },
        { method: 'popup', minutes: 1440 },
      ],
    },
  };

  const response = await axios.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    event,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // Store event ID for future updates/deletes
  await admin.firestore().collection('users').doc(userId).collection('calendarEvents').add({
    eventId: response.data.id,
    type: 'milestone',
    milestoneDay: milestone.days,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function createMeetingEvent(userId, meeting, accessToken) {
  // Implementation similar to createMilestoneEvent
  // ...
}
```

---

### Step 6: Create Token Refresh Logic (2 hours)
**File:** `/functions/googleCalendarOAuth.js` (add to existing file)

```javascript
// Refresh access token using refresh token
async function refreshAccessToken(userId) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const googleCalendar = userDoc.data().googleCalendar;

  if (!googleCalendar?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokenResponse = await axios.post(TOKEN_URL, {
    refresh_token: googleCalendar.refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const { access_token, expires_in } = tokenResponse.data;

  // Update access token in Firestore
  await admin.firestore().collection('users').doc(userId).update({
    'googleCalendar.accessToken': access_token,
    'googleCalendar.expiresAt': admin.firestore.Timestamp.fromDate(new Date(Date.now() + expires_in * 1000)),
  });

  return access_token;
}

// Get valid access token (refresh if expired)
async function getValidAccessToken(userId) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const googleCalendar = userDoc.data().googleCalendar;

  if (!googleCalendar?.connected) {
    throw new Error('Google Calendar not connected');
  }

  const now = new Date();
  const expiresAt = googleCalendar.expiresAt.toDate();

  // Refresh if expired or expiring soon (within 5 minutes)
  if (now >= new Date(expiresAt.getTime() - 5 * 60 * 1000)) {
    return await refreshAccessToken(userId);
  }

  return googleCalendar.accessToken;
}
```

---

### Step 7: Create Daily Sync Cloud Function (3 hours)
**File:** `/functions/googleCalendarSync.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Scheduled daily sync (runs at 12:00 AM UTC)
exports.dailyCalendarSync = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('googleCalendar.connected', '==', true)
      .get();

    console.log(`Syncing ${usersSnapshot.size} users with Google Calendar`);

    for (const userDoc of usersSnapshot.docs) {
      try {
        await syncUserCalendar(userDoc.id);
      } catch (error) {
        console.error(`Failed to sync user ${userDoc.id}:`, error.message);
      }
    }

    console.log('Daily calendar sync complete');
  });

async function syncUserCalendar(userId) {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const user = userDoc.data();

  // Get valid access token
  const accessToken = await getValidAccessToken(userId);

  // Check if user reached milestone today
  const sobrietyDate = new Date(user.sobrietyDate);
  const today = new Date();
  const daysSober = Math.floor((today - sobrietyDate) / (1000 * 60 * 60 * 24));

  const milestones = [7, 14, 21, 30, 45, 60, 75, 90, 120, 150, 180, 210, 240, 270, 300, 365, 395, 425, 455, 485, 515, 545, 575, 605, 635, 665, 695, 730];

  if (milestones.includes(daysSober)) {
    // User reached milestone today - create next milestone event
    const nextMilestoneIndex = milestones.indexOf(daysSober) + 4; // 4 milestones ahead
    if (nextMilestoneIndex < milestones.length) {
      const nextMilestone = milestones[nextMilestoneIndex];
      const milestoneDate = new Date(sobrietyDate.getTime() + nextMilestone * 24 * 60 * 60 * 1000);
      await createMilestoneEvent(userId, { days: nextMilestone, date: milestoneDate }, accessToken);
    }
  }

  // Sync saved meetings (add new, remove unsaved)
  await syncMeetings(userId, accessToken);

  // Update last sync timestamp
  await admin.firestore().collection('users').doc(userId).update({
    'googleCalendar.lastSyncAt': admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function syncMeetings(userId, accessToken) {
  // Get saved meetings from Firestore
  const savedMeetingsSnapshot = await admin.firestore()
    .collection('meetings')
    .where('userId', '==', userId)
    .where('saved', '==', true)
    .get();

  const savedMeetingIds = savedMeetingsSnapshot.docs.map(doc => doc.id);

  // Get calendar events created for meetings
  const calendarEventsSnapshot = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('calendarEvents')
    .where('type', '==', 'meeting')
    .get();

  // Delete calendar events for unsaved meetings
  for (const eventDoc of calendarEventsSnapshot.docs) {
    const event = eventDoc.data();
    if (!savedMeetingIds.includes(event.meetingId)) {
      // Meeting was unsaved - delete from Google Calendar
      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.eventId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      await eventDoc.ref.delete();
    }
  }

  // Create calendar events for newly saved meetings
  const existingMeetingIds = calendarEventsSnapshot.docs.map(doc => doc.data().meetingId);

  for (const meetingDoc of savedMeetingsSnapshot.docs) {
    if (!existingMeetingIds.includes(meetingDoc.id)) {
      await createMeetingEvent(userId, meetingDoc.data(), accessToken);
    }
  }
}
```

---

### Step 8: Update ProfileTab UI (2 hours)
**File:** `/Index/tabs/ProfileTab.js`

**Replace GoogleCalendarModal (line 1250-1290):**
```javascript
const GoogleCalendarModal = () => {
  const [googleCalendar, setGoogleCalendar] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadGoogleCalendarStatus();
  }, []);

  const loadGoogleCalendarStatus = async () => {
    try {
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      setGoogleCalendar(userDoc.data().googleCalendar || null);
    } catch (error) {
      console.error('Failed to load Google Calendar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    window.GLRSApp.googleOAuth.initiateGoogleOAuth();
  };

  const handleDisconnect = async () => {
    await window.GLRSApp.googleOAuth.disconnectGoogleCalendar();
    loadGoogleCalendarStatus();
  };

  const handleSyncNow = async () => {
    if (!confirm('Manually sync your calendar? This will create missing events and remove deleted ones.')) {
      return;
    }

    try {
      setLoading(true);
      await fetch('https://us-central1-glrs-pir-system.cloudfunctions.net/syncUserCalendarManual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid }),
      });
      alert('✅ Calendar synced successfully!');
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert('Failed to sync calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-header">
        <h3>Google Calendar Integration</h3>
        <button className="modal-close" onClick={() => setShowModal(null)}>×</button>
      </div>

      <div className="modal-body">
        {loading ? (
          <p>Loading...</p>
        ) : googleCalendar?.connected ? (
          <>
            <div className="google-calendar-status">
              <div className="status-icon">✅</div>
              <div>
                <p><strong>Connected</strong></p>
                <p className="status-email">{googleCalendar.email}</p>
                <p className="status-last-sync">
                  Last synced: {googleCalendar.lastSyncAt
                    ? new Date(googleCalendar.lastSyncAt.seconds * 1000).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>

            <div className="google-calendar-info">
              <h4>What's Synced:</h4>
              <ul>
                <li>✅ Next 4 recovery milestones (e.g., 30, 45, 60, 90 days)</li>
                <li>✅ Saved AA/NA meetings</li>
                <li>✅ GLRS scheduled meetings with your coach</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={handleSyncNow} disabled={loading}>
                Sync Now
              </button>
              <button className="button-danger" onClick={handleDisconnect} disabled={loading}>
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Automatically sync your recovery milestones and meetings to Google Calendar.</p>

            <div className="google-calendar-benefits">
              <h4>Benefits:</h4>
              <ul>
                <li>🎉 Never forget a milestone</li>
                <li>📅 Meeting reminders (24h & 1h before)</li>
                <li>🔔 Get notified on all your devices</li>
                <li>📱 View your recovery calendar anywhere</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button className="button-primary" onClick={handleConnect}>
                Connect Google Calendar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

---

### Step 9: Create OAuth Callback Page (1 hour)
**File:** `/oauth-callback.html` (new file in root)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Connecting Google Calendar...</title>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #058585 0%, #047070 100%);
      color: #ffffff;
      margin: 0;
    }
    .loading {
      text-align: center;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #ffffff;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <h2>Connecting Google Calendar...</h2>
    <p>Please wait while we complete the setup.</p>
  </div>

  <script type="module">
    import { handleOAuthCallback } from './Index/services/googleOAuth.js';
    handleOAuthCallback();
  </script>
</body>
</html>
```

**Update firebase.json redirects:**
```json
{
  "hosting": {
    "public": ".",
    "rewrites": [
      {
        "source": "/oauth/google/callback",
        "destination": "/oauth-callback.html"
      }
    ]
  }
}
```

---

### Step 10: Add "Save Meeting" Button to MeetingsTab (2 hours)
**File:** `/Index/tabs/MeetingsTab.js` (update Browse sub-tab)

**Add after meeting details display (around line 1820):**
```javascript
const handleSaveMeeting = async (meeting) => {
  try {
    const saved = meeting.saved || false;

    if (saved) {
      // Unsave meeting
      await db.collection('meetings').doc(meeting.id).update({
        saved: false,
      });
      window.showNotification('Meeting removed from saved list', 'info');
    } else {
      // Save meeting
      await db.collection('meetings').doc(meeting.id).set({
        ...meeting,
        userId: currentUser.uid,
        saved: true,
        savedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      window.showNotification('✅ Meeting saved! It will be added to your Google Calendar on the next sync.', 'success');
    }

    loadMeetings(); // Reload to reflect changes
  } catch (error) {
    console.error('Failed to save meeting:', error);
    window.showNotification('Failed to save meeting', 'error');
  }
};

// Render button
<button
  className={meeting.saved ? "button-secondary" : "button-primary"}
  onClick={() => handleSaveMeeting(meeting)}
>
  {meeting.saved ? '✓ Saved' : 'Save Meeting'}
</button>
```

---

## 4.5 Implementation Timeline

### Phase 1: OAuth Setup (8 hours)
- Google Cloud Console setup (1h)
- Enable Calendar API (15min)
- Update Firestore schema (15min)
- Create OAuth service file (2h)
- Create token exchange Cloud Function (2h)
- Create token refresh logic (2h)
- Test OAuth flow (30min)

### Phase 2: Event Creation (10 hours)
- Create milestone event function (2h)
- Create meeting event function (2h)
- Create backfill sync function (3h)
- Create daily sync Cloud Function (3h)

### Phase 3: UI Integration (6 hours)
- Update ProfileTab GoogleCalendarModal (2h)
- Create OAuth callback page (1h)
- Add "Save Meeting" button to MeetingsTab (2h)
- Add sync status indicator (1h)

### Phase 4: Testing (6 hours)
- Test OAuth flow (connect, disconnect, reconnect) (2h)
- Test milestone event creation (1h)
- Test meeting event creation (1h)
- Test daily sync (1h)
- Test error cases (token expired, network failure) (1h)

**Total:** 30 hours

---

## 4.6 Testing Checklist

### OAuth Flow Testing
- [ ] User clicks "Connect Google Calendar" → Redirects to Google consent screen
- [ ] User approves permissions → Redirects back to app
- [ ] Access + refresh tokens stored in Firestore
- [ ] Backfill creates 4 milestone events + saved meeting events
- [ ] Google Calendar shows new events within 1 minute
- [ ] User clicks "Disconnect" → Tokens revoked, events deleted

### Event Creation Testing
- [ ] User reaches milestone → Next milestone event created
- [ ] User saves meeting → Meeting event created with correct recurrence
- [ ] User unsaves meeting → Meeting event deleted
- [ ] All-day milestone events display correctly
- [ ] Recurring meeting events repeat correctly (e.g., every Tuesday)
- [ ] Event reminders trigger (24h before, 1h before)

### Token Refresh Testing
- [ ] Access token expires after 1 hour → Automatically refreshed
- [ ] Refresh token works after 7 days of inactivity
- [ ] Sync continues to work after token refresh

### Edge Case Testing
- [ ] User with 365+ days sober (no more milestones) → No errors
- [ ] User with 0 saved meetings → No meeting events created
- [ ] User revokes calendar access in Google Account settings → Graceful error handling
- [ ] Network failure during sync → Retry logic works

---

## 4.7 Cost Analysis

### Google Calendar API Quota
- **Free tier:** 1,000,000 requests/day
- **Our usage:**
  - 1000 users × 0.1 events/day = 100 writes/day
  - Daily sync: 1000 reads/day
  - **Total:** ~1,100 requests/day (0.11% of quota)
- **Cost:** $0 (well under free tier)

### Firebase Functions Execution
- **OAuth exchange:** ~500ms per user (one-time)
- **Daily sync:** ~200ms per user per day
- **Monthly executions:** 1000 users × 30 days = 30,000 executions
- **Cost:** $0 (under free tier: 2M executions/month)

### Firestore Reads/Writes
- **OAuth:** 2 writes per user (one-time)
- **Daily sync:** 2 reads + 0.1 writes per user per day
- **Monthly:** 1000 users × 30 × 2.1 = 63,000 operations
- **Cost:** $0.36/month (63,000 × $0.06 / 100,000)

**Total Monthly Cost:** ~$0.36 (negligible)

---

## 4.8 Future Enhancements (Not in Scope)

- [ ] Sync custom countdown goals to calendar
- [ ] Two-way sync (detect calendar changes)
- [ ] Support multiple calendars (not just "primary")
- [ ] Custom event colors per milestone type
- [ ] Export calendar as .ics file
- [ ] Apple Calendar integration (via .ics link)

---

**END OF SECTION 4: CALENDAR INTEGRATION IMPLEMENTATION**

---
