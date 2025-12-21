# External Meetings System - End-to-End Analysis

**Document Version:** 1.0
**Created:** December 21, 2025
**Last Updated:** December 21, 2025
**Priority:** HIGH
**Estimated Implementation Time:** 30+ hours

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 1: Cloud Functions Analysis](#phase-1-cloud-functions-analysis)
3. [Phase 2: Firestore Data Structure](#phase-2-firestore-data-structure)
4. [Phase 3: PIR Portal Frontend Analysis](#phase-3-pir-portal-frontend-analysis)
5. [Phase 4: Virtual/Online/Hybrid Terminology](#phase-4-virtualonlinehybrid-terminology)
6. [Phase 5: Data Mapping & Normalization](#phase-5-data-mapping--normalization)
7. [Phase 6: Issues & Recommendations](#phase-6-issues--recommendations)
8. [Phase 7: Implementation Roadmap](#phase-7-implementation-roadmap)

---

## 1. Executive Summary

### System Overview

The GLRS External Meetings System syncs recovery meeting data from 7 different programs across the Bay Area into a unified, searchable interface. The system handles ~5,500+ meetings from various data formats (TSML, BMLT, custom APIs) and normalizes them for consistent display in the PIR Portal.

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Programs | 7 (AA, NA, CMA, MA, HA, RD, SMART) |
| Total Meetings | ~5,442+ |
| Sync Functions | 7 Cloud Functions |
| Frontend Components | 15+ meeting-related components |
| Utility Files | 4 core mapping/normalization files |
| Type Codes Supported | 100+ (TSML + BMLT + custom) |

### Primary Terminology Finding

**"Virtual" vs "Online" vs "Hybrid" Terminology:**

| Term | Definition | Usage |
|------|------------|-------|
| **Online** | Pure virtual meeting (no physical location) | Display label on cards |
| **Virtual** | Synonym for online | Data field name (`isVirtual`) |
| **Hybrid** | Both in-person AND online options | Display label + `isHybrid` field |

The system uses "Online" as the user-facing term but stores/processes using "virtual" in code. This is intentional and follows industry standards.

---

## Phase 1: Cloud Functions Analysis

### Sync Function Inventory

| Function | File | Schedule | Format | Est. Meetings |
|----------|------|----------|--------|---------------|
| `syncAAMeetings` | `/functions/syncAAMeetings.js` | Sunday 3 AM | TSML (JSON) + HTML | ~3,138 |
| `syncNAMeetings` | `/functions/syncNAMeetings.js` | Scheduled | BMLT (JSON) | ~896 |
| `syncCMAMeetings` | `/functions/syncCMAMeetings.js` | Scheduled | TSML (JSON) | ~200 |
| `syncMAMeetings` | `/functions/syncMAMeetings.js` | Scheduled | TSML (JSON) | ~150 |
| `syncHAMeetings` | `/functions/syncHAMeetings.js` | Scheduled | TSML (JSON) | ~100 |
| `syncRecoveryDharmaMeetings` | `/functions/syncRecoveryDharmaMeetings.js` | Scheduled | Custom API | ~300 |
| `syncSMARTMeetings` | `/functions/syncSMARTMeetings.js` | Scheduled | Custom API | ~200 |

### AA Meeting Sources (5 Intergroups)

```javascript
// From syncAAMeetings.js
const AA_SOURCES = [
  { name: 'SF/Marin', url: 'sheets.code4recovery.org' },     // ~893 meetings
  { name: 'East Bay', url: 'eastbayaa.org' },                 // ~896 meetings
  { name: 'Santa Clara', url: 'sheets.code4recovery.org' },   // ~719 meetings
  { name: 'Santa Cruz', url: 'aasantacruz.org' },             // ~344 meetings
  { name: 'San Mateo', url: 'aa-san-mateo.org' },             // ~286 meetings (HTML scraping)
]
```

### Data Format Differences

**TSML Format (AA, CMA, HA, RD):**
```javascript
{
  "name": "Morning Serenity",
  "day": 0,                    // 0-6 (Sunday-Saturday)
  "time": "07:00",             // HH:MM format
  "types": ["O", "D", "X"],    // Type codes as array
  "location": "St. Mary's Church",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "conference_url": "https://zoom.us/j/123",  // If virtual/hybrid
}
```

**BMLT Format (NA):**
```javascript
{
  "meeting_name": "Recovery Road",
  "weekday_tinyint": 1,        // 1-7 (Sunday-Saturday)
  "start_time": "19:00:00",    // HH:MM:SS format
  "formats": "1,5,17",         // Numeric format IDs
  "location_text": "Community Center",
  "formatted_address": "456 Oak Ave, Oakland, CA",
  "latitude": "37.8044",       // String not number
  "longitude": "-122.2712",
  "virtual_meeting_link": "https://zoom.us/j/456",
}
```

### Normalization at Sync Level

Each sync function normalizes data to a common structure before Firestore write:

```javascript
// Common normalized structure
{
  id: 'aa-sfmarin-001',
  name: 'Morning Serenity',
  type: 'AA',                  // Program type
  source: 'SF/Marin AA',       // Data source
  day: 0,                      // Normalized to 0-6
  time: '07:00',               // Normalized to HH:MM
  types: 'O, D, X',            // Comma-separated string
  locationName: "St. Mary's Church",
  city: 'San Francisco',
  state: 'CA',
  zip: '94102',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  isVirtual: false,
  isHybrid: true,              // Has both in-person and online
  conferenceUrl: 'https://zoom.us/j/123',
  attendanceOption: 'hybrid',  // 'in_person', 'online', 'hybrid'
  lastUpdated: Timestamp.now()
}
```

---

## Phase 2: Firestore Data Structure

### Collection: `externalMeetings`

**Document ID Format:** `{program}-{source}-{index}`

Examples:
- `aa-sfmarin-001`
- `na-norcal-456`
- `rd-bayarea-023`

### Schema

```typescript
interface ExternalMeeting {
  // Identity
  id: string;
  name: string;
  type: MeetingSource;        // 'AA' | 'NA' | 'CMA' | 'MA' | 'HA' | 'RD' | 'SMART'
  source: string;             // 'SF/Marin AA', 'NorCal NA', etc.

  // Schedule
  day: number;                // 0-6 (Sunday-Saturday)
  time: string;               // HH:MM format

  // Location
  locationName: string;
  city: string;
  state: string;
  zip: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    formatted: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };

  // Meeting Types
  types: string;              // Comma-separated: 'O, D, X'

  // Virtual/Hybrid
  isVirtual: boolean;
  isHybrid: boolean;
  conferenceUrl: string;
  attendanceOption: 'in_person' | 'online' | 'hybrid';

  // Metadata
  notes: string;
  lastUpdated: Timestamp;
}
```

### Indexes Required

```json
// firestore.indexes.json
{
  "collectionGroup": "externalMeetings",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "day", "order": "ASCENDING" },
    { "fieldPath": "time", "order": "ASCENDING" }
  ]
}
```

---

## Phase 3: PIR Portal Frontend Analysis

### Component Hierarchy

```
MeetingsTab.tsx
├── MeetingBrowser.tsx
│   ├── FilterChips.tsx
│   ├── FilterPanel.tsx
│   ├── SearchWithSuggestions.tsx
│   └── MeetingList.tsx
│       └── MeetingCard.tsx (×N meetings)
├── MeetingsSidebar.tsx
│   ├── SavedFavoritesModal.tsx
│   ├── WeekSelectorModal.tsx
│   └── LogMeetingModal.tsx
└── MeetingMap.tsx (optional map view)
```

### Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useExternalMeetings` | `hooks/useExternalMeetings.ts` | Fetches from Firestore `externalMeetings` |
| `useMeetings` | `hooks/useMeetings.ts` | Combines external + saved meetings |
| `useMeetingFilters` | `hooks/useMeetingFilters.ts` | Filter state management |
| `useGeolocation` | `hooks/useGeolocation.ts` | User location for distance calc |
| `useSavedMeetings` | `hooks/useSavedMeetings.ts` | User's saved/favorite meetings |
| `useSortedMeetings` | `hooks/useSortedMeetings.ts` | Circular time sorting |

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUD FUNCTIONS                              │
│  syncAAMeetings → syncNAMeetings → ... → syncSMARTMeetings      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIRESTORE                                     │
│                 externalMeetings collection                      │
│                    (~5,500 documents)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               useExternalMeetings hook                           │
│    Real-time listener → onSnapshot() → Meeting[] array           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 applyMeetingFilters()                            │
│   filterUtils.ts: search, day, time, format, distance, etc.     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 toMeetingCardData()                              │
│   Transforms raw Meeting → MeetingCardData with fallbacks       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MeetingCard.tsx                               │
│    Renders standardized MeetingCardData to UI                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: Virtual/Online/Hybrid Terminology

### Source Data Analysis

| Source | Virtual Field | Virtual Value | Hybrid Field | Conference URL Field |
|--------|--------------|---------------|--------------|---------------------|
| AA (TSML) | `types` | Contains 'ONL' | `types` contains 'HY' | `conference_url` |
| NA (BMLT) | `formats` | Contains 'VM' or 'TC' | `formats` contains 'HY' | `virtual_meeting_link` |
| CMA | `types` | Contains 'ONL' | `types` contains 'HY' | `conference_url` |
| MA | `types` | Contains 'ONL' | `types` contains 'HY' | `conference_url` |
| HA | `types` | Contains 'ONL' | `types` contains 'HY' | `conference_url` |
| RD | `attendance_option` | `'online'` | `'hybrid'` | `conference_url` |
| SMART | `meeting_type` | `'online'` | `'both'` | `meeting_url` |

### Type Code Mapping

```typescript
// From typeCodeMapping.ts
const VIRTUAL_CODES = {
  // TSML codes
  'ONL': 'Online',
  'TC': 'Temp Closed (Virtual)',

  // BMLT codes
  'VM': 'Virtual Meeting',
  '27': 'Virtual',      // BMLT numeric
  '28': 'Temp Closed',  // BMLT numeric
  '30': 'Online',       // BMLT numeric
}

const HYBRID_CODES = {
  'HY': 'Hybrid',
  '29': 'Hybrid',       // BMLT numeric
}
```

### Frontend Detection Logic

```typescript
// From toMeetingCardData.ts (lines 876-902)

// Determine if meeting is virtual
export function isVirtualMeeting(meeting: MeetingInput): boolean {
  if (meeting.isVirtual === true || meeting.is_virtual === true) return true

  // Check type codes for ONL
  const typeCodes = parseTypeCodes(meeting.types)
  return typeCodes.includes('ONL')
}

// Determine if meeting is hybrid
export function isHybridMeeting(meeting: MeetingInput): boolean {
  if (meeting.isHybrid === true) return true

  // Check type codes for HY
  const typeCodes = parseTypeCodes(meeting.types)
  return typeCodes.includes('HY')
}

// Get virtual label for display
export function getVirtualLabel(isVirtual: boolean, isHybrid: boolean): string {
  if (isHybrid) return 'Hybrid'
  if (isVirtual) return 'Online'
  return ''
}
```

### Display in MeetingCard

```tsx
// From MeetingCard.tsx (lines 180-210)

{/* Virtual/Hybrid badge */}
{cardData.isHybrid ? (
  <LocationBadge type="hybrid" size="sm" variant="filled" />
) : cardData.isVirtual ? (
  <LocationBadge type="virtual" size="sm" variant="filled" />
) : null}

{/* Join Online button (only if virtual/hybrid with URL) */}
{cardData.canJoinOnline && (
  <div className="flex items-center gap-2 mt-3 py-2 px-3 rounded-lg bg-blue-50">
    <Video className="h-4 w-4 text-blue-600" />
    <a href={cardData.conferenceUrl}>
      {cardData.virtualLabel === 'Hybrid'
        ? 'Join Online (Hybrid)'
        : 'Join Online Meeting'}
    </a>
  </div>
)}
```

### Filter Logic

```typescript
// From filterUtils.ts (lines 493-534)

// 4. Attendance mode (in-person / online / hybrid)
if (filters.attendanceMode !== 'all') {
  filtered = filtered.filter((m) => {
    const isOnline = m.isVirtual === true ||
      m.attendanceOption === 'online' ||
      m.attendanceOption === 'virtual'
    const isHybrid = m.isHybrid === true ||
      m.attendanceOption === 'hybrid'

    // Also check type codes
    const typeCodes = getTypeCodes(m)
    const hasOnlineCode = typeCodes.some(code => {
      const upperCode = code.toUpperCase()
      return upperCode === 'ONL' || upperCode === 'VM' || upperCode === 'TC'
    })
    const hasHybridCode = typeCodes.some(code => {
      const upperCode = code.toUpperCase()
      return upperCode === 'HY'
    })

    const meetingIsOnline = isOnline || hasOnlineCode
    const meetingIsHybrid = isHybrid || hasHybridCode
    const meetingIsInPerson = !meetingIsOnline && !meetingIsHybrid

    switch (filters.attendanceMode) {
      case 'online': return meetingIsOnline && !meetingIsHybrid
      case 'hybrid': return meetingIsHybrid
      case 'in_person': return meetingIsInPerson
      default: return true
    }
  })
}
```

---

## Phase 5: Data Mapping & Normalization

### Core Utility Files

| File | Lines | Purpose |
|------|-------|---------|
| `toMeetingCardData.ts` | 1,259 | Main mapper: raw Meeting → MeetingCardData |
| `meetingNormalizer.ts` | 781 | Normalizes raw API data (time, day, types) |
| `filterUtils.ts` | 675 | Applies all filter logic |
| `typeCodeMapping.ts` | 1,037 | TSML ↔ BMLT code translation |

### toMeetingCardData Fallback Chain

Every field has a fallback to ensure NO blank values in display:

```typescript
// From MeetingCardData.ts (lines 29-43)
export const FALLBACK_VALUES = {
  name: 'Unknown Meeting',
  time: 'Time TBD',
  timeDisplay: 'Time TBD',
  day: 0,              // Sunday
  dayDisplay: 'Day Unknown',
  location: 'Location TBD',
  address: 'Address Unknown',
  distance: null,
  distanceDisplay: '',
  programType: 'Meeting',
  programTypeDisplay: 'Meeting',
  typeBadges: [],
  notes: '',
}
```

### Time Normalization

```typescript
// From toMeetingCardData.ts (lines 127-171)

// Handles all formats:
// - "19:00" (24-hour)
// - "19:00:00" (BMLT with seconds)
// - "7:00 PM" (12-hour)
// - "0700" (military)

export function formatTimeDisplay(time?: string | null): string {
  if (!time) return FALLBACK_VALUES.timeDisplay

  // ... pattern matching and conversion

  return `${hours12}:${minutes} ${period}` // e.g., "7:00 PM"
}
```

### Day Normalization

```typescript
// From toMeetingCardData.ts (lines 229-247)

// Handles:
// - TSML: 0-6 (Sunday-Saturday)
// - BMLT: 1-7 (Sunday-Saturday)

export function normalizeDay(day?: number | string | null, isBMLT = false): number {
  if (day === null || day === undefined) return FALLBACK_VALUES.day

  const dayNum = typeof day === 'number' ? day : parseInt(String(day), 10)
  if (isNaN(dayNum)) return FALLBACK_VALUES.day

  // BMLT uses 1-7 (Sunday-Saturday)
  if (isBMLT) {
    const converted = dayNum - 1
    return converted >= 0 && converted <= 6 ? converted : FALLBACK_VALUES.day
  }

  // TSML uses 0-6
  return dayNum >= 0 && dayNum <= 6 ? dayNum : FALLBACK_VALUES.day
}
```

### Type Code Normalization

```typescript
// From meetingNormalizer.ts (lines 41-113)

const TYPE_CODE_ALIASES: Record<string, string> = {
  // Format aliases
  'DISCUSSION': 'D',
  'BIG BOOK': 'B',
  '12 STEPS': 'ST',

  // Virtual aliases
  'ONLINE': 'ONL',
  'VIRTUAL': 'ONL',
  'TC': 'ONL',
  'HYBRID': 'HY',

  // Demographics
  'WOMEN': 'W',
  'MEN': 'M',
  'YOUNG PEOPLE': 'Y',

  // ... 50+ more aliases
}
```

---

## Phase 6: Issues & Recommendations

### Current Issues

#### Issue 1: Inconsistent Virtual Detection Across Sources

**Problem:** Some sources use `isVirtual: true`, others use type codes, others use `attendanceOption`.

**Impact:** Some virtual meetings may not be correctly identified, missing from online filter.

**Recommendation:** Centralize virtual detection in sync functions, set ALL relevant fields:
```javascript
// In each sync function
const isVirtual = detectVirtualFromSource(rawMeeting)
const isHybrid = detectHybridFromSource(rawMeeting)

return {
  isVirtual,
  isHybrid,
  attendanceOption: isHybrid ? 'hybrid' : isVirtual ? 'online' : 'in_person',
  types: addVirtualTypeCodeIfNeeded(rawMeeting.types, isVirtual, isHybrid),
}
```

#### Issue 2: BMLT Numeric Type Codes

**Problem:** NA meetings may return numeric format IDs (1-52) instead of text codes.

**Impact:** Type badges may show "1" instead of "Basic Text".

**Current Mitigation:** `MeetingCardData.ts` includes numeric ID fallbacks (lines 439-490).

**Recommendation:** Add numeric → text conversion in `syncNAMeetings.js`.

#### Issue 3: State Name Inconsistency

**Problem:** Some sources return "California", others "CA", others "Calif".

**Impact:** Address display shows inconsistent formatting.

**Current Mitigation:** `toMeetingCardData.ts` includes state normalization (lines 312-407).

**Recommendation:** Move state normalization to sync functions for consistent storage.

#### Issue 4: Coordinate Validation

**Problem:** Some meetings have (0, 0) coordinates or string coordinates.

**Impact:** Distance calculation fails, directions button broken.

**Current Mitigation:** `isValidCoordinate()` filters out invalid coords.

**Recommendation:** Add coordinate validation in sync functions, log invalid coords for manual review.

### Performance Recommendations

| Recommendation | Impact | Effort |
|----------------|--------|--------|
| Add Firestore compound indexes | 40% query improvement | Low |
| Implement pagination (limit 50) | Reduce memory usage | Medium |
| Cache meeting data in localStorage | Faster reload | Medium |
| Use Firestore offline persistence | Works offline | Low |

---

## Phase 7: Implementation Roadmap

### Immediate Priorities (Week 1-2)

1. **Add missing Firestore indexes** for meeting queries
2. **Fix BMLT numeric ID conversion** in `syncNAMeetings.js`
3. **Add comprehensive logging** to sync functions for debugging

### Short-Term (Week 3-4)

1. **Implement coordinate validation** at sync level
2. **Add state name normalization** at sync level
3. **Create data quality dashboard** in admin portal

### Medium-Term (Month 2)

1. **Add meeting deduplication** for overlapping sources
2. **Implement user meeting suggestions** based on history
3. **Add meeting check-in tracking** via NFC/QR codes

### Long-Term (Month 3+)

1. **Add additional meeting sources** (LifeRing, Celebrate Recovery)
2. **Implement meeting host management** for GLRS-hosted meetings
3. **Build meeting analytics dashboard** for program insights

---

## Appendix A: File Reference

### Cloud Functions

| File | Purpose |
|------|---------|
| `/functions/syncAAMeetings.js` | AA meeting sync (5 sources) |
| `/functions/syncNAMeetings.js` | NA meeting sync (BMLT) |
| `/functions/syncCMAMeetings.js` | CMA meeting sync |
| `/functions/syncMAMeetings.js` | MA meeting sync |
| `/functions/syncHAMeetings.js` | HA meeting sync |
| `/functions/syncRecoveryDharmaMeetings.js` | RD meeting sync |
| `/functions/syncSMARTMeetings.js` | SMART meeting sync |

### Frontend Components

| File | Purpose |
|------|---------|
| `/src/features/meetings/components/MeetingsTab.tsx` | Main meetings tab |
| `/src/features/meetings/components/MeetingCard.tsx` | Meeting card display |
| `/src/features/meetings/components/MeetingBrowser.tsx` | Browse/search interface |
| `/src/features/meetings/components/FilterPanel.tsx` | Filter controls |
| `/src/features/meetings/components/MeetingMap.tsx` | Map view |

### Utility Files

| File | Purpose |
|------|---------|
| `/src/features/meetings/utils/toMeetingCardData.ts` | Main data mapper |
| `/src/features/meetings/utils/meetingNormalizer.ts` | Data normalization |
| `/src/features/meetings/utils/filterUtils.ts` | Filter logic |
| `/src/features/meetings/utils/typeCodeMapping.ts` | Type code translation |

### Type Definitions

| File | Purpose |
|------|---------|
| `/src/features/meetings/types/index.ts` | Meeting, MeetingSource types |
| `/src/features/meetings/types/MeetingCardData.ts` | MeetingCardData interface |

---

## Appendix B: Type Code Reference

### Access Types
| Code | Label | Category |
|------|-------|----------|
| O | Open | access |
| C | Closed | access |

### Format Types
| Code | Label | Category |
|------|-------|----------|
| D | Discussion | format |
| B | Big Book | format |
| SP | Speaker | format |
| ST | Step Study | format |
| T | Traditions | format |
| LIT | Literature | format |
| MED | Meditation | format |

### Virtual/Hybrid
| Code | Label | Category |
|------|-------|----------|
| ONL | Online | accessibility |
| VM | Virtual (BMLT) | accessibility |
| HY | Hybrid | accessibility |
| TC | Temp Closed | accessibility |

### Demographics
| Code | Label | Category |
|------|-------|----------|
| W | Women | demographic |
| M | Men | demographic |
| Y | Young People | demographic |
| LGBTQ | LGBTQ+ | demographic |
| BE | Beginners | demographic |

### Accessibility
| Code | Label | Category |
|------|-------|----------|
| X | Wheelchair | accessibility |
| ASL | ASL Interpreted | accessibility |
| BA | Babysitting | accessibility |
| CF | Child-Friendly | accessibility |

---

**Document Status:** COMPLETE
**Next Review:** January 2026
**Owner:** GLRS Engineering Team
