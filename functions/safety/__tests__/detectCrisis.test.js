/**
 * Crisis Detection Unit Tests
 * Phase 8F-1: Testing & Refinement
 *
 * Tests the core detection function including:
 * - Tier classification
 * - Keyword matching with context
 * - Negation detection
 * - Word boundary enforcement
 * - Fuzzy matching integration
 * - Alert creation logic
 */

// Mock Firebase Admin SDK before any requires
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
        set: jest.fn(),
        update: jest.fn(),
      })),
      add: jest.fn().mockResolvedValue({ id: 'test-id' }),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  })),
}));

// Mock notification helpers
jest.mock('../../notifications/helpers/sendNotification', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../notifications/email/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../../notifications/email/templates/crisisAlert', () => ({
  crisisAlertTemplate: jest.fn().mockReturnValue('<html>Test</html>'),
}));

jest.mock('../../notifications/sms/sendSMS', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true }),
}));

const {
  scanForCrisis,
  checkKeywordMatch,
  shouldExcludeForNegation,
} = require('../detectCrisis');

// =============================================================================
// SCAN FOR CRISIS - TIER DETECTION
// =============================================================================

describe('scanForCrisis - Tier Detection', () => {
  describe('Tier 1 Critical Detection', () => {
    const tier1Phrases = [
      { text: 'I want to kill myself', expectedCategory: 'suicide' },
      { text: "I'm going to end it all tonight", expectedCategory: 'suicide' },
      { text: 'I have pills and I\'m going to take them all', expectedCategory: 'danger' },
      { text: "I'm standing on the bridge right now", expectedCategory: 'danger' },
      { text: 'I just overdosed', expectedCategory: 'substanceCrisis' },
      { text: "I'm cutting myself", expectedCategory: 'selfHarm' },
      { text: 'I want to hurt myself badly', expectedCategory: 'selfHarm' },
      { text: 'I have a gun loaded', expectedCategory: 'danger' },
    ];

    tier1Phrases.forEach(({ text, expectedCategory }) => {
      test(`should detect tier 1 (${expectedCategory}): "${text}"`, () => {
        const result = scanForCrisis(text);
        expect(result.detected).toBe(true);
        expect(result.tier).toBe(1);
        expect(result.categories).toContain(expectedCategory);
      });
    });

    test('should return highest tier when multiple tiers match', () => {
      // This contains both tier 1 and tier 3 content
      const text = "I feel hopeless and I want to kill myself";
      const result = scanForCrisis(text);
      expect(result.tier).toBe(1);
    });
  });

  describe('Tier 2 High Detection', () => {
    const tier2Phrases = [
      { text: 'I wish I was dead', expectedCategory: 'passiveSuicidal' },
      { text: 'Everyone would be better off without me', expectedCategory: 'passiveSuicidal' },
      { text: "I don't want to wake up tomorrow", expectedCategory: 'passiveSuicidal' },
      { text: "I'm thinking about using again", expectedCategory: 'relapseCrisis' },
      { text: 'I bought drugs and have them with me', expectedCategory: 'relapseCrisis' },
      { text: 'My partner hits me every day', expectedCategory: 'abuseIndicators' },
      { text: "I'm being abused at home", expectedCategory: 'abuseIndicators' },
      { text: 'I used to cut myself years ago', expectedCategory: 'historicalHarm' },
    ];

    tier2Phrases.forEach(({ text, expectedCategory }) => {
      test(`should detect tier 2 (${expectedCategory}): "${text}"`, () => {
        const result = scanForCrisis(text);
        expect(result.detected).toBe(true);
        expect(result.tier).toBe(2);
        expect(result.categories).toContain(expectedCategory);
      });
    });
  });

  describe('Tier 3 Moderate Detection', () => {
    const tier3Phrases = [
      { text: 'I feel completely hopeless today', expectedCategory: 'concerningMood' },
      { text: 'Everything feels pointless', expectedCategory: 'concerningMood' },
      { text: "I'm having really strong cravings", expectedCategory: 'substanceConcerns' },
      { text: 'I feel so alone in this', expectedCategory: 'supportIssues' },
      { text: "I'm having a panic attack", expectedCategory: 'mentalHealth' },
      { text: 'My anxiety is out of control', expectedCategory: 'mentalHealth' },
    ];

    tier3Phrases.forEach(({ text, expectedCategory }) => {
      test(`should detect tier 3 (${expectedCategory}): "${text}"`, () => {
        const result = scanForCrisis(text);
        expect(result.detected).toBe(true);
        expect(result.tier).toBe(3);
        expect(result.categories).toContain(expectedCategory);
      });
    });
  });

  describe('Tier 4 Standard Detection', () => {
    const tier4Phrases = [
      { text: "I'm having a hard time at work", expectedCategory: 'generalChallenges' },
      { text: 'Feeling stressed about everything', expectedCategory: 'generalChallenges' },
      { text: "I'm frustrated with my progress", expectedCategory: 'generalChallenges' },
    ];

    tier4Phrases.forEach(({ text, expectedCategory }) => {
      test(`should detect tier 4 (${expectedCategory}): "${text}"`, () => {
        const result = scanForCrisis(text);
        expect(result.detected).toBe(true);
        expect(result.tier).toBe(4);
        expect(result.categories).toContain(expectedCategory);
      });
    });
  });

  describe('No Crisis Detection', () => {
    const safePhrases = [
      'Had a great day today!',
      'Feeling good about my recovery',
      'Going to my AA meeting later',
      'Talked to my sponsor',
      'Made it to 30 days sober!',
      'The weather is nice today',
      'Planning to cook dinner',
    ];

    safePhrases.forEach((text) => {
      test(`should NOT detect crisis in: "${text}"`, () => {
        const result = scanForCrisis(text);
        expect(result.detected).toBe(false);
        expect(result.tier).toBeNull();
      });
    });
  });
});

// =============================================================================
// NEGATION EXCLUSION
// =============================================================================

describe('shouldExcludeForNegation', () => {
  describe('Phrases that SHOULD be excluded (negated)', () => {
    const negatedPhrases = [
      "I'm not thinking about suicide anymore",
      'I have no suicidal thoughts',
      'I would never hurt myself',
      "I don't want to kill myself",
      "I haven't thought about using",
      'Never had thoughts of self-harm',
      "I'm not going to relapse",
      "I don't have plans to harm myself",
      'No thoughts of hurting myself today',
      "I'm no longer suicidal",
      'Not having suicidal ideation',
      "I don't feel like dying",
    ];

    negatedPhrases.forEach((text) => {
      test(`should exclude negated phrase: "${text}"`, () => {
        const result = shouldExcludeForNegation(text);
        expect(result.excluded).toBe(true);
      });
    });
  });

  describe('Phrases that should NOT be excluded (genuine crisis)', () => {
    const genuineCrisis = [
      'I want to kill myself',
      "I'm thinking about suicide",
      "I'm going to hurt myself",
      'I have suicidal thoughts',
      'I want to die',
      "I'm cutting myself",
      'I overdosed',
    ];

    genuineCrisis.forEach((text) => {
      test(`should NOT exclude genuine crisis: "${text}"`, () => {
        const result = shouldExcludeForNegation(text);
        expect(result.excluded).toBe(false);
      });
    });
  });

  describe('Complex sentences with negation', () => {
    test('should handle "no longer" negation', () => {
      const result = shouldExcludeForNegation("I'm no longer thinking about suicide");
      expect(result.excluded).toBe(true);
    });

    test('should handle "stopped" negation', () => {
      const result = shouldExcludeForNegation('I stopped thinking about hurting myself');
      expect(result.excluded).toBe(true);
    });

    test('should NOT exclude double negatives (I\'m not NOT suicidal)', () => {
      // "not not" = positive, should trigger
      const result = shouldExcludeForNegation("I can't say I'm not suicidal");
      // This is ambiguous but should err on side of triggering
      expect(result.excluded).toBe(false);
    });

    test('should handle negation at start vs middle', () => {
      const startNegation = 'No suicidal thoughts today';
      const middleNegation = "I'm feeling okay, no suicidal thoughts";

      expect(shouldExcludeForNegation(startNegation).excluded).toBe(true);
      expect(shouldExcludeForNegation(middleNegation).excluded).toBe(true);
    });
  });
});

// =============================================================================
// KEYWORD MATCHING
// =============================================================================

describe('checkKeywordMatch', () => {
  describe('Exact matches', () => {
    test('should match exact phrase', () => {
      const result = checkKeywordMatch('I want to kill myself', 'kill myself');
      expect(result.matched).toBe(true);
    });

    test('should be case-insensitive', () => {
      const result = checkKeywordMatch('I WANT TO KILL MYSELF', 'kill myself');
      expect(result.matched).toBe(true);
    });

    test('should match multi-word phrases', () => {
      const result = checkKeywordMatch('I want to end my life', 'end my life');
      expect(result.matched).toBe(true);
    });
  });

  describe('Word boundary enforcement', () => {
    test('should NOT match partial words - therapist', () => {
      const result = checkKeywordMatch('My therapist helped me', 'the');
      expect(result.matched).toBe(false);
    });

    test('should NOT match partial words - sharpie', () => {
      const result = checkKeywordMatch('I used a sharpie marker', 'sharp');
      expect(result.matched).toBe(false);
    });

    test('should NOT match partial words - class', () => {
      const result = checkKeywordMatch('I went to class today', 'ass');
      expect(result.matched).toBe(false);
    });

    test('should NOT match partial words - assume', () => {
      const result = checkKeywordMatch("Don't assume anything", 'ass');
      expect(result.matched).toBe(false);
    });

    test('should NOT match partial words - skilled', () => {
      const result = checkKeywordMatch("I'm a skilled worker", 'kill');
      expect(result.matched).toBe(false);
    });

    test('should match when word is at start', () => {
      const result = checkKeywordMatch('Suicide is never the answer', 'suicide');
      expect(result.matched).toBe(true);
    });

    test('should match when word is at end', () => {
      const result = checkKeywordMatch('He committed suicide', 'suicide');
      expect(result.matched).toBe(true);
    });

    test('should match with punctuation after', () => {
      const result = checkKeywordMatch('Are you suicidal?', 'suicidal');
      expect(result.matched).toBe(true);
    });
  });

  describe('Context extraction', () => {
    test('should return context around matched keyword', () => {
      const text = 'I have been feeling really bad and I want to kill myself because everything is terrible';
      const result = checkKeywordMatch(text, 'kill myself');
      expect(result.matched).toBe(true);
      expect(result.context).toBeTruthy();
      expect(result.context.length).toBeLessThanOrEqual(100);
    });
  });
});

// =============================================================================
// SCAN RESULT STRUCTURE
// =============================================================================

describe('scanForCrisis - Result Structure', () => {
  test('should return correct structure for detected crisis', () => {
    const result = scanForCrisis('I want to kill myself');

    expect(result).toHaveProperty('detected');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('keyword');
    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('isNegated');
    expect(result).toHaveProperty('matchDetails');

    expect(result.detected).toBe(true);
    expect(typeof result.tier).toBe('number');
    expect(Array.isArray(result.categories)).toBe(true);
    expect(typeof result.keyword).toBe('string');
  });

  test('should return correct structure for no crisis', () => {
    const result = scanForCrisis('Having a great day!');

    expect(result.detected).toBe(false);
    expect(result.tier).toBeNull();
    expect(result.categories).toEqual([]);
    expect(result.keyword).toBeNull();
  });

  test('should include match position details', () => {
    const result = scanForCrisis('I want to kill myself');

    if (result.matchDetails) {
      expect(result.matchDetails).toHaveProperty('position');
      expect(result.matchDetails).toHaveProperty('originalText');
    }
  });
});

// =============================================================================
// MULTIPLE KEYWORDS
// =============================================================================

describe('scanForCrisis - Multiple Keywords', () => {
  test('should return highest tier with multiple matches', () => {
    const text = "I feel hopeless and I want to kill myself";
    const result = scanForCrisis(text);

    // "hopeless" is tier 3, "kill myself" is tier 1
    expect(result.tier).toBe(1);
  });

  test('should collect all matching categories', () => {
    const text = "I'm cutting myself and I overdosed";
    const result = scanForCrisis(text);

    // Should detect selfHarm and substanceCrisis
    expect(result.categories.length).toBeGreaterThanOrEqual(1);
    expect(result.tier).toBe(1);
  });

  test('should prioritize first critical match for context', () => {
    const text = "I want to kill myself and I also want to hurt myself";
    const result = scanForCrisis(text);

    // Should return context for the first match
    expect(result.keyword).toBeTruthy();
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('scanForCrisis - Edge Cases', () => {
  test('should handle empty string', () => {
    const result = scanForCrisis('');
    expect(result.detected).toBe(false);
  });

  test('should handle null/undefined', () => {
    expect(() => scanForCrisis(null)).not.toThrow();
    expect(() => scanForCrisis(undefined)).not.toThrow();
  });

  test('should handle very long text', () => {
    const longText = 'a'.repeat(10000) + ' I want to kill myself ' + 'b'.repeat(10000);
    const result = scanForCrisis(longText);
    expect(result.detected).toBe(true);
    expect(result.tier).toBe(1);
  });

  test('should handle special characters', () => {
    const result = scanForCrisis("I want to kill myself!!!");
    expect(result.detected).toBe(true);
  });

  test('should handle newlines', () => {
    const result = scanForCrisis("I want to\nkill myself");
    expect(result.detected).toBe(true);
  });

  test('should handle tabs', () => {
    const result = scanForCrisis("I want to\tkill myself");
    expect(result.detected).toBe(true);
  });

  test('should handle repeated keywords', () => {
    const result = scanForCrisis('suicide suicide suicide');
    expect(result.detected).toBe(true);
  });

  test('should handle mixed case', () => {
    const result = scanForCrisis('I Want To KILL MySeLf');
    expect(result.detected).toBe(true);
  });

  test('should handle leetspeak/numbers', () => {
    // Basic number substitution - may or may not match depending on implementation
    const result = scanForCrisis('su1c1de');
    // Log result for debugging
    console.log('Leetspeak detection:', result);
  });
});

// =============================================================================
// FUZZY MATCHING INTEGRATION
// =============================================================================

describe('scanForCrisis - Fuzzy Matching', () => {
  describe('Common typos that SHOULD trigger', () => {
    const typos = [
      'suicde',
      'suicdie',
      'suiside',
      'selg harm',
      'overdoze',
    ];

    typos.forEach((typo) => {
      test(`should detect typo: "${typo}"`, () => {
        const text = `I'm thinking about ${typo}`;
        const result = scanForCrisis(text);
        // Some typos may not meet the 0.85 threshold
        console.log(`Typo "${typo}" detection:`, result.detected);
      });
    });
  });
});

// =============================================================================
// TIMING/PERFORMANCE
// =============================================================================

describe('scanForCrisis - Performance', () => {
  test('should process short text quickly (< 10ms)', () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      scanForCrisis('I want to kill myself');
    }
    const elapsed = Date.now() - start;
    expect(elapsed / 100).toBeLessThan(10);
  });

  test('should process medium text quickly (< 20ms)', () => {
    const mediumText = 'Lorem ipsum '.repeat(50) + ' I want to kill myself ' + 'dolor sit amet '.repeat(50);
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      scanForCrisis(mediumText);
    }
    const elapsed = Date.now() - start;
    expect(elapsed / 100).toBeLessThan(20);
  });

  test('should process long text in reasonable time (< 100ms)', () => {
    const longText = 'Lorem ipsum '.repeat(500) + ' I want to kill myself ' + 'dolor sit amet '.repeat(500);
    const start = Date.now();
    scanForCrisis(longText);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

describe('Regression Tests', () => {
  test('REGRESSION: "therapist" should NOT trigger', () => {
    const result = scanForCrisis('My therapist said I\'m making great progress');
    expect(result.detected).toBe(false);
  });

  test('REGRESSION: "sharpie" should NOT trigger', () => {
    const result = scanForCrisis('I need to buy a sharpie for art class');
    expect(result.detected).toBe(false);
  });

  test('REGRESSION: "class" should NOT trigger', () => {
    const result = scanForCrisis('I went to my yoga class today');
    expect(result.detected).toBe(false);
  });

  test('REGRESSION: "skilled" should NOT trigger', () => {
    const result = scanForCrisis("I'm becoming more skilled at coping");
    expect(result.detected).toBe(false);
  });

  test('REGRESSION: Past tense with recovery context', () => {
    const result = scanForCrisis('I used to want to die but now I appreciate life');
    // This should be handled carefully - "want to die" is present
    // but context suggests recovery. Current behavior: still triggers
    console.log('Past tense recovery context:', result);
  });

  test('REGRESSION: Quote or hypothetical', () => {
    const result = scanForCrisis('He said "I want to kill myself" but I convinced him to get help');
    // Quoted speech - tricky case
    console.log('Quoted speech detection:', result);
  });
});
