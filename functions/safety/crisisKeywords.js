/**
 * Crisis Keywords Database
 * Phase 8B-1: Core Safety Infrastructure
 *
 * Based on:
 * - Columbia Protocol (C-SSRS) screening questions
 * - PHQ-9 depression screening
 * - SAMHSA crisis indicators
 * - Wysa trigger keywords
 * - Clinical literature on substance abuse crisis
 *
 * Total: 169 keywords across 4 tiers
 */

// =============================================================================
// TIER 1: CRITICAL (47 keywords)
// Action: Immediate resource display, bypass LLM, coach alert
// Latency: < 2 seconds
// =============================================================================

const TIER_1_CRITICAL = {
  // Active Suicidal Ideation (17 keywords)
  suicide: [
    'kill myself',
    'end my life',
    'want to die',
    'better off dead',
    'suicide',
    'suicidal',
    'end it all',
    'no reason to live',
    'planning to kill',
    'method to die',
    'way to end it',
    'take my own life',
    'finish myself',
    'not worth living',
    'goodbye forever',
    'final note',
    'suicide note',
  ],

  // Active Self-Harm (11 keywords)
  selfHarm: [
    'cutting myself',
    'hurting myself',
    'burn myself',
    'harm myself',
    'self-harm',
    'self harm',
    'hit myself',
    'punish myself physically',
    'make myself bleed',
    'scars from cutting',
    'razor blade',
  ],

  // Immediate Danger (11 keywords)
  danger: [
    'have a gun',
    'have pills',
    'have a knife',
    'standing on ledge',
    'on the bridge',
    'about to jump',
    'overdose now',
    'taking pills now',
    'goodbye cruel world',
    'final act',
    'last message',
  ],

  // Active Substance Crisis (8 keywords)
  substanceCrisis: [
    'overdose',
    'overdosing',
    'took too much',
    'cant stop using',
    'relapsed and cant stop',
    'fentanyl',
    'heroin now',
    'shooting up now',
    'need narcan',
    'not breathing well',
  ],
};

// =============================================================================
// TIER 2: HIGH (55 keywords)
// Action: Coach notification, offer resources
// Latency: < 5 minutes
// =============================================================================

const TIER_2_HIGH = {
  // Passive Suicidal Ideation (11 keywords)
  passiveSuicidal: [
    'wish I was dead',
    'wish I wasnt here',
    'dont want to wake up',
    'everyone would be better without me',
    'disappear forever',
    'wouldnt mind dying',
    'hope I dont wake up',
    'sleep forever',
    'not afraid of death',
    'ready to die',
    'tired of living',
  ],

  // Historical Self-Harm (8 keywords)
  historicalHarm: [
    'used to cut',
    'history of self-harm',
    'urge to cut',
    'want to hurt myself',
    'thinking about cutting',
    'miss the pain',
    'considering self-harm',
    'might hurt myself',
  ],

  // Severe Hopelessness (14 keywords)
  hopelessness: [
    'no hope',
    'hopeless',
    'pointless',
    'nothing matters',
    'why bother',
    'no future',
    'no way out',
    'trapped',
    'cant go on',
    'exhausted with life',
    'completely alone',
    'no one cares',
    'no one would notice',
    'burden to everyone',
  ],

  // Relapse Crisis (13 keywords)
  relapseCrisis: [
    'about to relapse',
    'going to use',
    'cant resist',
    'found my dealers number',
    'going to buy drugs',
    'going to drink',
    'one drink wont hurt',
    'just one hit',
    'relapsed yesterday',
    'relapsed today',
    'back on drugs',
    'drinking again',
    'using again',
  ],

  // Abuse/Violence (10 keywords)
  abuseIndicators: [
    'being abused',
    'he hits me',
    'she hits me',
    'partner hurts me',
    'domestic violence',
    'afraid of my partner',
    'locked me in',
    'threatened to kill',
    'will hurt me',
    'in danger at home',
  ],
};

// =============================================================================
// TIER 3: MODERATE (43 keywords)
// Action: Daily digest to coach, logging
// Latency: 24 hours
// =============================================================================

const TIER_3_MODERATE = {
  // Concerning Mood (11 keywords)
  concerningMood: [
    'very depressed',
    'severely anxious',
    'panic attacks',
    'cant sleep for days',
    'not eating',
    'isolating',
    'avoiding everyone',
    'crying all day',
    'cant function',
    'cant get out of bed',
    'no energy to live',
  ],

  // Moderate Substance Concerns (11 keywords)
  substanceConcerns: [
    'cravings are bad',
    'strong urges',
    'thinking about using',
    'miss getting high',
    'miss drinking',
    'triggered badly',
    'people places things',
    'near a bar',
    'dealer texted me',
    'almost bought',
    'almost drank',
  ],

  // Support System Issues (10 keywords)
  supportIssues: [
    'no sponsor',
    'sponsor ghosted me',
    'no sober friends',
    'family abandoned me',
    'fired from job',
    'kicked out',
    'homeless',
    'nowhere to go',
    'no money',
    'lost everything',
  ],

  // Mental Health Concerns (9 keywords)
  mentalHealth: [
    'hearing voices',
    'seeing things',
    'paranoid',
    'manic episode',
    'bipolar spiral',
    'schizophrenia acting up',
    'off my meds',
    'stopped medications',
    'cant afford meds',
  ],
};

// =============================================================================
// TIER 4: STANDARD (24 keywords)
// Action: Logging only
// Latency: N/A
// =============================================================================

const TIER_4_STANDARD = {
  // General Recovery Challenges (13 keywords)
  generalChallenges: [
    'struggling',
    'hard day',
    'difficult',
    'frustrated',
    'angry',
    'sad',
    'lonely',
    'stressed',
    'overwhelmed',
    'tired',
    'exhausted',
    'disappointed',
    'worried',
  ],

  // Positive Recovery Indicators (10 keywords)
  positiveIndicators: [
    'sober today',
    'didnt use',
    'stayed clean',
    'went to meeting',
    'called sponsor',
    'feeling better',
    'made progress',
    'proud of myself',
    'milestone',
    'grateful',
  ],
};

// =============================================================================
// DETECTION CONFIGURATION
// =============================================================================

const CRISIS_DETECTION_CONFIG = {
  // Case-insensitive matching
  caseSensitive: false,

  // Word boundary matching to prevent false positives
  // e.g., "die" should not match "diet" or "diesel"
  useWordBoundaries: true,

  // Fuzzy matching for common misspellings
  fuzzyMatching: {
    enabled: true,
    threshold: 0.85, // Levenshtein similarity threshold
    commonMisspellings: {
      suicidal: ['suicidel', 'suicidial', 'sucidal', 'siucidal'],
      overdose: ['overdoze', 'ovrdose', 'overdos'],
      depression: ['depresion', 'deppression', 'depresssion'],
      anxiety: ['anxeity', 'anxety', 'anixety'],
      relapse: ['relaps', 'relapce', 'relpase'],
    },
    // Common abbreviations
    abbreviations: {
      od: 'overdose',
      'o.d.': 'overdose',
      si: 'suicidal ideation',
      sh: 'self-harm',
      dv: 'domestic violence',
    },
  },

  // Negation handling - don't trigger on negated phrases
  // e.g., "I am NOT thinking about suicide" should not trigger
  negation: {
    enabled: true,
    windowSize: 3, // Words to check before the trigger phrase
    negationWords: [
      'not',
      'no',
      'never',
      'dont',
      "don't",
      'havent',
      "haven't",
      'wasnt',
      "wasn't",
      'wont',
      "won't",
      'isnt',
      "isn't",
      'am not',
      'are not',
      'is not',
      'did not',
      'didnt',
      "didn't",
      'stopped',
      'quit',
      'over',
      'past',
    ],
  },

  // Context window for logging
  contextWordsBeforeAfter: 10,
};

// =============================================================================
// RESPONSE TEMPLATES
// =============================================================================

const CRISIS_RESPONSES = {
  // Immediate bypass response for Tier 1
  critical: `I'm really concerned about what you've shared. Your safety matters most right now.

Please reach out to one of these resources immediately:

- 988 Suicide & Crisis Lifeline - Call or text 988 (24/7)
- Crisis Text Line - Text HOME to 741741
- 911 - For immediate emergencies

Your coach has been notified and will reach out to you soon.

You don't have to face this alone. Help is available right now.`,

  // Modified response for Tier 2
  high: `I hear that you're going through a really difficult time right now. Thank you for trusting me with this.

Remember, you're not alone in this journey. If you ever feel overwhelmed, these resources are available 24/7:
- 988 Suicide & Crisis Lifeline (call or text)
- Crisis Text Line (text HOME to 741741)

Your coach cares about you and is here to support you. Would you like to try a grounding exercise together, or would you prefer to talk through what's happening?`,

  // Supportive response for Tier 3
  moderate: `I can tell things have been challenging lately. It's okay to have hard days - recovery isn't linear.

Have you been able to connect with your sponsor or coach recently? Sometimes talking through these feelings can really help.

What's one small thing you could do right now to take care of yourself?`,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all keywords for a specific tier
 * @param {string} tier - 'critical', 'high', 'moderate', or 'standard'
 * @returns {string[]} Array of all keywords in that tier
 */
function getKeywordsForTier(tier) {
  const tierMap = {
    critical: TIER_1_CRITICAL,
    high: TIER_2_HIGH,
    moderate: TIER_3_MODERATE,
    standard: TIER_4_STANDARD,
  };

  const tierData = tierMap[tier];
  if (!tierData) return [];

  return Object.values(tierData).flat();
}

/**
 * Get keyword count by tier
 * @returns {Object} Count of keywords per tier
 */
function getKeywordCounts() {
  return {
    critical: getKeywordsForTier('critical').length,
    high: getKeywordsForTier('high').length,
    moderate: getKeywordsForTier('moderate').length,
    standard: getKeywordsForTier('standard').length,
    total:
      getKeywordsForTier('critical').length +
      getKeywordsForTier('high').length +
      getKeywordsForTier('moderate').length +
      getKeywordsForTier('standard').length,
  };
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity ratio between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Similarity ratio (0-1)
 */
function similarityRatio(a, b) {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Check if a word matches any known abbreviation
 * @param {string} word - Word to check
 * @returns {string|null} Expanded form or null
 */
function expandAbbreviation(word) {
  const abbrevs = CRISIS_DETECTION_CONFIG.fuzzyMatching.abbreviations;
  return abbrevs[word.toLowerCase()] || null;
}

/**
 * Check if text contains negation before a position
 * @param {string} text - Full text
 * @param {number} position - Position of keyword match
 * @returns {boolean} True if negation detected
 */
function hasNegationBefore(text, position) {
  const config = CRISIS_DETECTION_CONFIG.negation;
  if (!config.enabled) return false;

  // Get words before the match position
  const textBefore = text.substring(0, position).toLowerCase();
  const wordsBefore = textBefore.split(/\s+/).slice(-config.windowSize);

  // Check if any negation word is present
  for (const negWord of config.negationWords) {
    if (wordsBefore.some((w) => w.includes(negWord))) {
      return true;
    }
  }

  return false;
}

/**
 * Create regex pattern for keyword with word boundaries
 * @param {string} keyword - Keyword to match
 * @returns {RegExp} Compiled regex pattern
 */
function createKeywordPattern(keyword) {
  // Escape special regex characters
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (CRISIS_DETECTION_CONFIG.useWordBoundaries) {
    return new RegExp(`\\b${escaped}\\b`, 'gi');
  }

  return new RegExp(escaped, 'gi');
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Tier keyword databases
  TIER_1_CRITICAL,
  TIER_2_HIGH,
  TIER_3_MODERATE,
  TIER_4_STANDARD,

  // Configuration
  CRISIS_DETECTION_CONFIG,

  // Response templates
  CRISIS_RESPONSES,

  // Helper functions
  getKeywordsForTier,
  getKeywordCounts,
  levenshteinDistance,
  similarityRatio,
  expandAbbreviation,
  hasNegationBefore,
  createKeywordPattern,
};
