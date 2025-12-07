# Keyword Maintenance Guide

## GLRS Lighthouse - Crisis Detection Keyword Database

**Version:** 1.0
**Last Updated:** December 2025
**File Location:** `/functions/safety/crisisKeywords.js`

---

## Table of Contents

1. [Overview](#overview)
2. [Keyword Structure](#keyword-structure)
3. [Adding Keywords](#adding-keywords)
4. [Removing Keywords](#removing-keywords)
5. [Tuning Keywords](#tuning-keywords)
6. [Testing Changes](#testing-changes)
7. [Deployment Process](#deployment-process)
8. [False Positive Management](#false-positive-management)
9. [Review Schedule](#review-schedule)

---

## Overview

The crisis detection system uses a keyword database to identify concerning content in user messages. This document provides guidelines for maintaining and updating the keyword database.

### Current Statistics

| Tier | Keywords | Categories |
|------|----------|------------|
| Tier 1 (Critical) | 47 | 4 |
| Tier 2 (High) | 55 | 5 |
| Tier 3 (Moderate) | 43 | 4 |
| Tier 4 (Standard) | 24 | 2 |
| **Total** | **169** | **15** |

### File Location

```
/functions/safety/crisisKeywords.js
```

### Configuration Options

```javascript
const CRISIS_DETECTION_CONFIG = {
  caseSensitive: false,          // Matching is case-insensitive
  useWordBoundaries: true,       // Prevents partial matches
  fuzzyMatching: {
    enabled: true,               // Allows typo tolerance
    threshold: 0.85,             // 85% similarity required
  },
  negation: {
    enabled: true,               // Detects "not suicidal" etc.
    windowSize: 3,               // Looks 3 words before keyword
    negationWords: ['not', 'no', 'never', "don't", ...],
  },
};
```

---

## Keyword Structure

### Tier Organization

Keywords are organized by tier and category:

```javascript
const TIER_1_CRITICAL = {
  suicide: [
    'kill myself',
    'end my life',
    'want to die',
    // ... more keywords
  ],
  selfHarm: [...],
  danger: [...],
  substanceCrisis: [...],
};
```

### Keyword Format

Keywords can be:

1. **Single words:** `'suicide'`, `'overdose'`
2. **Phrases:** `'kill myself'`, `'want to die'`
3. **Partial phrases:** `'going to relapse'`

### Category Guidelines

| Category | Tier | Description |
|----------|------|-------------|
| suicide | 1 | Active suicidal statements |
| selfHarm | 1 | Active self-harm references |
| danger | 1 | Access to lethal means |
| substanceCrisis | 1 | Active overdose/intoxication |
| passiveSuicidal | 2 | Passive death wishes |
| historicalHarm | 2 | Past self-harm mentions |
| hopelessness | 2 | Severe hopelessness |
| relapseCrisis | 2 | Imminent relapse |
| abuseIndicators | 2 | Domestic/interpersonal abuse |
| concerningMood | 3 | Persistent negative mood |
| substanceConcerns | 3 | Cravings, triggers |
| supportIssues | 3 | Isolation, lack of support |
| mentalHealth | 3 | Anxiety, panic, depression |
| generalChallenges | 4 | Normal stress |
| positiveIndicators | 4 | Recovery progress |

---

## Adding Keywords

### When to Add

- New crisis language identified in user messages
- Clinical literature recommends new indicators
- False negative analysis reveals gaps
- Emerging slang or terminology

### Process

1. **Identify the keyword/phrase**
   ```
   Example: "I give up on life"
   ```

2. **Determine appropriate tier**
   - Is this immediate danger? → Tier 1
   - Is this high risk? → Tier 2
   - Is this concerning? → Tier 3
   - Is this notable but low risk? → Tier 4

3. **Select appropriate category**
   - Which existing category fits?
   - Does it need a new category?

4. **Check for conflicts**
   - Does it match safe phrases?
   - Will word boundaries work correctly?

5. **Add to the file**
   ```javascript
   // In TIER_1_CRITICAL.suicide or appropriate location
   'give up on life',
   ```

6. **Add tests**
   ```javascript
   test('should detect: "I give up on life"', () => {
     const result = scanForCrisis('I give up on life');
     expect(result.detected).toBe(true);
     expect(result.tier).toBe(1);
   });
   ```

7. **Test for false positives**
   - Run existing false positive tests
   - Add any new edge cases

### Example Addition

```javascript
// Adding "give up on life" to Tier 1 suicide category

// 1. Update crisisKeywords.js
const TIER_1_CRITICAL = {
  suicide: [
    'kill myself',
    'end my life',
    'want to die',
    'give up on life',  // NEW
    // ... existing keywords
  ],
  // ...
};

// 2. Add test in crisisKeywords.test.js
test('should detect: "I give up on life"', () => {
  const result = scanForCrisis('I give up on life');
  expect(result.detected).toBe(true);
  expect(result.tier).toBe(1);
  expect(result.categories).toContain('suicide');
});

// 3. Add false positive check
test('should NOT trigger for: "I give up on life-long habits"', () => {
  const result = scanForCrisis('I give up on life-long habits');
  // This might be a false positive - needs review
});
```

---

## Removing Keywords

### When to Remove

- Consistently causing false positives
- No longer clinically relevant
- Superseded by better phrasing
- Word boundary issues cannot be resolved

### Process

1. **Document the issue**
   - What false positives is it causing?
   - How often?
   - What tier is affected?

2. **Review with Safety Team**
   - Is removal the best solution?
   - Can it be tuned instead?

3. **Remove from database**
   ```javascript
   // Remove from array
   // Add comment explaining removal
   // Example: Removed 'sharp' - too many false positives with 'sharpie'
   ```

4. **Update tests**
   - Remove any tests for the keyword
   - Add regression test to confirm removal

5. **Deploy and monitor**
   - Watch for any increase in false negatives

---

## Tuning Keywords

### Word Boundary Adjustments

If a keyword causes partial matches:

```javascript
// Problem: "the" matches "therapist"
// Solution: Word boundaries are automatic, verify they're working

// If still having issues, make keyword more specific:
'the crisis' instead of 'the'
```

### Threshold Adjustments

For fuzzy matching issues:

```javascript
// Current threshold: 0.85 (85% match)
// To make matching stricter, increase threshold
fuzzyMatching: {
  enabled: true,
  threshold: 0.90,  // More strict
},
```

### Negation Window

If negation detection is too aggressive or missing cases:

```javascript
// Current: looks 3 words before keyword
// To be more conservative (catch more negations):
negation: {
  enabled: true,
  windowSize: 5,  // Increased from 3
},
```

---

## Testing Changes

### Required Tests Before Deployment

1. **Run unit tests**
   ```bash
   cd /functions
   npm test -- --testPathPattern=safety
   ```

2. **Verify keyword count**
   ```javascript
   // crisisKeywords.test.js
   test('total Tier 1 keywords should be 47', () => {
     const total = Object.values(TIER_1_CRITICAL).flat().length;
     expect(total).toBe(47);  // Update this number
   });
   ```

3. **Run false positive tests**
   ```bash
   npm test -- --testPathPattern=falsePositives
   ```

4. **Run adversarial tests**
   ```bash
   npm test -- --testPathPattern=adversarial
   ```

5. **Run performance tests**
   ```bash
   npm test -- --testPathPattern=load
   ```

### Test Coverage Requirements

- New keyword must have at least 2 trigger tests
- New keyword must have at least 1 false positive check
- All existing tests must pass

---

## Deployment Process

### Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Keyword count updated in documentation
- [ ] Change documented in changelog
- [ ] Safety Team has approved
- [ ] Backup of current keywords.js

### Deployment Steps

1. **Commit changes**
   ```bash
   git add functions/safety/crisisKeywords.js
   git add functions/safety/__tests__/*.js
   git commit -m "safety: add/update crisis keywords - [description]"
   ```

2. **Deploy to staging** (if available)
   ```bash
   firebase deploy --only functions -P staging
   ```

3. **Test in staging**
   - Send test messages
   - Verify alerts are created
   - Check false positive rate

4. **Deploy to production**
   ```bash
   firebase deploy --only functions
   ```

5. **Monitor**
   - Watch error logs for 24 hours
   - Check alert creation rate
   - Monitor false positive reports

---

## False Positive Management

### Tracking False Positives

Maintain a spreadsheet with:

| Date | Keyword | Text | Category | Action Taken |
|------|---------|------|----------|--------------|
| 2025-12-01 | "therapist" | "My therapist helped" | None (word boundary) | No action |
| 2025-12-02 | "dying" | "dying to try that recipe" | colloquial | Monitor |

### Response Priority

1. **Tier 1 False Positive:** Address immediately
2. **Tier 2 False Positive:** Address within 1 week
3. **Tier 3/4 False Positive:** Address in next review cycle

### Common False Positive Patterns

| Pattern | Example | Solution |
|---------|---------|----------|
| Word boundary | "skilled" matching "kill" | Verify boundaries |
| Colloquial | "dying to know" | Consider context detection |
| Quoted speech | "He said 'kill'" | May need to accept |
| Past tense + recovery | "I used to want to die" | Negation detection |
| Educational | "Suicide prevention" | May need to accept |

---

## Review Schedule

### Monthly Review

- Review all false positive reports
- Analyze detection rates by tier
- Check for emerging language patterns
- Update documentation if needed

### Quarterly Review

- Full keyword audit
- Benchmark against clinical guidelines
- Update based on SAMHSA recommendations
- Review with Safety Team

### Annual Review

- Complete revalidation of all keywords
- External clinical review
- Update training materials
- Major version release

---

## Changelog

### Version 1.0 (December 2025)

- Initial keyword database: 169 keywords
- 4 tiers, 15 categories
- Fuzzy matching enabled (0.85 threshold)
- Negation detection enabled (3-word window)

### Future Updates

Document all changes here:

```
[Date] - [Change Description] - [Author]
```

---

## Contact

For keyword changes or concerns:

- **Safety Team:** safety@glrecoveryservices.com
- **Tech Lead:** [Name]
- **Clinical Advisor:** [Name]

---

**Document Control:**
- Owner: Safety Team
- Review Frequency: Monthly (keywords), Quarterly (process)
- Last Review: December 2025
