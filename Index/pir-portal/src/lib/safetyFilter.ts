/**
 * Safety Filter - Post-Processing for AI Responses
 * Phase 8B: Client-side response filtering
 *
 * Filters AI responses for harmful content that might slip through
 * prompt-level safety rules. This is a defense-in-depth measure.
 *
 * Based on:
 * - SAMHSA guidelines for digital mental health tools
 * - Columbia Protocol for suicide risk assessment
 * - Industry best practices (Woebot, Wysa, Replika)
 */

// =============================================================================
// BANNED CONTENT PATTERNS
// =============================================================================

/**
 * Patterns that should NEVER appear in AI responses
 * These indicate the AI is providing harmful information
 */
export const BANNED_CONTENT = {
  // Self-harm methods - CRITICAL (any mention is banned)
  selfHarmMethods: [
    /how\s+to\s+(cut|hurt|harm)\s+(yourself|oneself|myself)/i,
    /best\s+(way|method|place)\s+to\s+(cut|hurt|harm)/i,
    /(razor|blade|knife)\s+(technique|method|way)/i,
    /where\s+to\s+(cut|hurt|harm)/i,
    /cutting\s+(technique|method|guide|tips)/i,
  ],

  // Suicide methods - CRITICAL
  suicideMethods: [
    /how\s+to\s+(kill|end)\s+(yourself|oneself|myself|your\s+life)/i,
    /best\s+(way|method)\s+to\s+(die|commit\s+suicide|end\s+it)/i,
    /lethal\s+(dose|amount|quantity)/i,
    /suicide\s+(method|technique|guide|plan)/i,
    /(hanging|overdose|jumping)\s+(method|technique|instructions)/i,
    /pills?\s+to\s+(die|kill\s+yourself|overdose)/i,
    /how\s+(many|much)\s+.+\s+to\s+(die|overdose)/i,
  ],

  // Drug acquisition/synthesis - HIGH
  drugInstructions: [
    /how\s+to\s+(get|obtain|buy|make|cook|synthesize)\s+(drugs|meth|heroin|fentanyl|cocaine)/i,
    /where\s+to\s+(buy|get|find)\s+(drugs|pills|substances)/i,
    /(recipe|instructions|guide)\s+for\s+(making|cooking|synthesizing)/i,
    /drug\s+(dealer|supplier|source|connect)/i,
  ],

  // Dismissive language - MODERATE (but still banned in recovery context)
  dismissiveLanguage: [
    /just\s+(get\s+over|snap\s+out|move\s+on|forget\s+about)\s+it/i,
    /stop\s+being\s+(dramatic|a\s+baby|weak|such\s+a)/i,
    /it('s|\s+is)\s+not\s+that\s+(bad|serious|big\s+a\s+deal)/i,
    /you('re|\s+are)\s+(overreacting|being\s+dramatic|exaggerating)/i,
    /man\s+up|grow\s+up|toughen\s+up/i,
    /everyone\s+(feels|goes\s+through)\s+(this|that)/i,
  ],

  // Inappropriate medical advice - HIGH
  medicalAdvice: [
    /stop\s+taking\s+(your\s+)?(medication|meds|pills)/i,
    /you\s+(don't|do\s+not)\s+need\s+(medication|meds|therapy)/i,
    /(increase|decrease|change)\s+your\s+(dose|dosage|medication)/i,
    /medication\s+is\s+(bad|harmful|unnecessary|poison)/i,
    /quit\s+(cold\s+turkey|without\s+telling)/i,
  ],

  // Harmful beliefs reinforcement
  harmfulBeliefs: [
    /you('re|\s+are)\s+(worthless|hopeless|a\s+burden|better\s+off\s+dead)/i,
    /no\s+one\s+(cares|would\s+miss\s+you|loves\s+you)/i,
    /you\s+(deserve|should)\s+(to\s+suffer|feel\s+this\s+way)/i,
    /things\s+will\s+never\s+get\s+better/i,
    /there('s|\s+is)\s+no\s+(hope|point|way\s+out)/i,
  ],

  // Enabling substance use
  enablingSubstance: [
    /one\s+(drink|hit|use)\s+won't\s+hurt/i,
    /you\s+can\s+(handle|control)\s+it\s+(this\s+time|now)/i,
    /maybe\s+moderation\s+(is|would\s+be)\s+(okay|fine|possible)/i,
    /your\s+sobriety\s+(doesn't|does\s+not)\s+matter/i,
    /(drinking|using)\s+(sometimes|occasionally)\s+is\s+(fine|okay)/i,
  ],

  // Confidentiality promises (AI can't promise this)
  confidentialityPromises: [
    /I\s+won't\s+tell\s+(anyone|your\s+coach)/i,
    /this\s+stays\s+between\s+us/i,
    /I\s+(promise|guarantee)\s+(confidentiality|secrecy)/i,
    /no\s+one\s+will\s+(know|find\s+out)/i,
  ],

  // AI claiming to be human/therapist
  identityConfusion: [
    /I('m|\s+am)\s+(a|your)\s+(therapist|counselor|doctor|psychiatrist)/i,
    /as\s+(your|a)\s+(licensed|certified)\s+(professional|therapist)/i,
    /I\s+can\s+(diagnose|prescribe|treat)/i,
    /my\s+clinical\s+(opinion|judgment|assessment)\s+is/i,
  ],
}

// =============================================================================
// SENSITIVE TOPIC PATTERNS (Require careful handling, not banned)
// =============================================================================

export const SENSITIVE_TOPICS = {
  // Topics that need crisis resources mentioned
  crisisTopics: [
    /feeling\s+(suicidal|like\s+ending\s+it|hopeless)/i,
    /thoughts?\s+of\s+(suicide|self-harm|hurting\s+myself)/i,
    /(want|wish)\s+to\s+(die|disappear|not\s+exist)/i,
    /can't\s+(go\s+on|take\s+it\s+anymore|continue)/i,
  ],

  // Topics that need sponsor/coach recommendation
  recoveryTopics: [
    /(strong|intense)\s+cravings?/i,
    /thinking\s+about\s+(using|drinking|relapsing)/i,
    /almost\s+(used|drank|relapsed)/i,
    /triggered\s+by/i,
  ],

  // Topics that need professional referral
  professionalTopics: [
    /hearing\s+voices/i,
    /seeing\s+things\s+(that\s+aren't\s+there)?/i,
    /paranoid\s+(thoughts?|feelings?)/i,
    /losing\s+(touch\s+with\s+reality|my\s+mind)/i,
  ],
}

// =============================================================================
// SAFE FALLBACK RESPONSES
// =============================================================================

export const SAFE_FALLBACKS = {
  // When harmful content detected
  harmful: `I want to make sure I'm being helpful in the right way. What you're asking touches on something I'm not equipped to address properly.

Your safety matters most. Here are some resources:
- 988 Suicide & Crisis Lifeline (call or text 988, available 24/7)
- Crisis Text Line (text HOME to 741741)
- Your coach is also here for you

Is there something else I can help you with today?`,

  // When crisis content detected
  crisis: `I'm really concerned about what you've shared. Your safety matters most right now.

Please reach out to one of these resources immediately:
- 988 Suicide & Crisis Lifeline (call or text 988, available 24/7)
- Crisis Text Line (text HOME to 741741)
- 911 for emergencies

Your coach has been notified and will check in with you. You don't have to go through this alone.`,

  // When dismissive language detected
  dismissive: `I hear you. Whatever you're feeling right now is valid, and I'm glad you're sharing it with me.

Recovery has ups and downs, and every day you show up is a victory. Your coach is here if you want to talk through what you're experiencing.

What would feel most helpful right now?`,

  // When medical advice detected
  medical: `I want to make sure you get the right guidance on this. Questions about medication or medical treatment are best discussed with your doctor or healthcare provider.

Your coach can help connect you with the right professional resources. Would you like me to remind you to bring this up with your coach?`,

  // When enabling content detected
  enabling: `Recovery is a journey, and I'm here to support you on that path. Your sobriety matters, and so does your commitment to it.

If you're having thoughts about using, that's something worth talking through with your sponsor or coach. They understand these moments and can help.

What's going on that brought up these thoughts?`,

  // General error fallback
  error: `I want to make sure I respond thoughtfully. Let me try that again in a different way.

How are you feeling right now? I'm here to listen and support you.`,
}

// =============================================================================
// FILTER RESPONSE INTERFACE
// =============================================================================

export interface FilterResult {
  passed: boolean
  flaggedContent: FlaggedContent[]
  modifiedResponse: string
  originalResponse: string
  requiresCrisisResources: boolean
  requiresCoachNotification: boolean
  tier: 'critical' | 'high' | 'moderate' | 'standard' | 'clean'
}

export interface FlaggedContent {
  category: string
  subcategory: string
  matchedText: string
  pattern: string
  severity: 'critical' | 'high' | 'moderate' | 'low'
  position: { start: number; end: number }
}

// =============================================================================
// CORE FILTER FUNCTION
// =============================================================================

/**
 * Filters an AI response for harmful content
 * @param response - The AI-generated response text
 * @returns FilterResult with pass/fail status and modifications
 */
export function filterResponse(response: string): FilterResult {
  const flaggedContent: FlaggedContent[] = []
  let highestTier: FilterResult['tier'] = 'clean'
  let requiresCrisisResources = false
  let requiresCoachNotification = false

  // Check all banned content categories
  for (const [category, patterns] of Object.entries(BANNED_CONTENT)) {
    for (const pattern of patterns) {
      const match = response.match(pattern)
      if (match) {
        const severity = getSeverityForCategory(category)
        flaggedContent.push({
          category: 'banned',
          subcategory: category,
          matchedText: match[0],
          pattern: pattern.source,
          severity,
          position: {
            start: match.index || 0,
            end: (match.index || 0) + match[0].length,
          },
        })

        // Update highest tier based on severity
        highestTier = getHigherTier(highestTier, severityToTier(severity))

        // Set flags based on category
        if (
          category === 'selfHarmMethods' ||
          category === 'suicideMethods' ||
          category === 'harmfulBeliefs'
        ) {
          requiresCrisisResources = true
          requiresCoachNotification = true
        }
      }
    }
  }

  // Check sensitive topics (don't ban, but flag for resources)
  for (const [category, patterns] of Object.entries(SENSITIVE_TOPICS)) {
    for (const pattern of patterns) {
      const match = response.match(pattern)
      if (match) {
        flaggedContent.push({
          category: 'sensitive',
          subcategory: category,
          matchedText: match[0],
          pattern: pattern.source,
          severity: 'moderate',
          position: {
            start: match.index || 0,
            end: (match.index || 0) + match[0].length,
          },
        })

        if (category === 'crisisTopics') {
          requiresCrisisResources = true
        }
      }
    }
  }

  // Determine if response passes or needs modification
  const hasBannedContent = flaggedContent.some((f) => f.category === 'banned')
  const passed = !hasBannedContent

  // Generate modified response if needed
  let modifiedResponse = response
  if (!passed) {
    modifiedResponse = getReplacementResponse(flaggedContent)
  } else if (requiresCrisisResources) {
    // Append crisis resources if not already present
    if (!response.includes('988') && !response.includes('crisis')) {
      modifiedResponse = appendCrisisResources(response)
    }
  }

  return {
    passed,
    flaggedContent,
    modifiedResponse,
    originalResponse: response,
    requiresCrisisResources,
    requiresCoachNotification,
    tier: highestTier,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSeverityForCategory(
  category: string
): 'critical' | 'high' | 'moderate' | 'low' {
  const severityMap: Record<string, 'critical' | 'high' | 'moderate' | 'low'> = {
    selfHarmMethods: 'critical',
    suicideMethods: 'critical',
    harmfulBeliefs: 'critical',
    drugInstructions: 'high',
    medicalAdvice: 'high',
    enablingSubstance: 'high',
    confidentialityPromises: 'moderate',
    identityConfusion: 'moderate',
    dismissiveLanguage: 'moderate',
  }
  return severityMap[category] || 'low'
}

function severityToTier(
  severity: 'critical' | 'high' | 'moderate' | 'low'
): FilterResult['tier'] {
  const tierMap: Record<string, FilterResult['tier']> = {
    critical: 'critical',
    high: 'high',
    moderate: 'moderate',
    low: 'standard',
  }
  return tierMap[severity] || 'standard'
}

function getHigherTier(
  current: FilterResult['tier'],
  compare: FilterResult['tier']
): FilterResult['tier'] {
  const tierOrder: FilterResult['tier'][] = [
    'clean',
    'standard',
    'moderate',
    'high',
    'critical',
  ]
  const currentIndex = tierOrder.indexOf(current)
  const compareIndex = tierOrder.indexOf(compare)
  return compareIndex > currentIndex ? compare : current
}

function getReplacementResponse(flaggedContent: FlaggedContent[]): string {
  // Find the most severe category
  const hasCritical = flaggedContent.some((f) => f.severity === 'critical')
  const hasHigh = flaggedContent.some((f) => f.severity === 'high')

  if (hasCritical) {
    // Check specific categories for targeted response
    const categories = flaggedContent.map((f) => f.subcategory)
    if (
      categories.includes('selfHarmMethods') ||
      categories.includes('suicideMethods') ||
      categories.includes('harmfulBeliefs')
    ) {
      return SAFE_FALLBACKS.crisis
    }
    return SAFE_FALLBACKS.harmful
  }

  if (hasHigh) {
    const categories = flaggedContent.map((f) => f.subcategory)
    if (categories.includes('medicalAdvice')) {
      return SAFE_FALLBACKS.medical
    }
    if (categories.includes('enablingSubstance')) {
      return SAFE_FALLBACKS.enabling
    }
    return SAFE_FALLBACKS.harmful
  }

  // Moderate severity
  const categories = flaggedContent.map((f) => f.subcategory)
  if (categories.includes('dismissiveLanguage')) {
    return SAFE_FALLBACKS.dismissive
  }

  return SAFE_FALLBACKS.error
}

function appendCrisisResources(response: string): string {
  const resourcesAddendum = `

If you're struggling right now, remember these resources are always available:
- 988 Suicide & Crisis Lifeline (call or text 988)
- Crisis Text Line (text HOME to 741741)
- Your coach is here for you`

  return response + resourcesAddendum
}

// =============================================================================
// QUICK SCAN FUNCTION (for pre-send validation)
// =============================================================================

/**
 * Quick check if response contains any obviously harmful content
 * Faster than full filterResponse, for use in streaming scenarios
 */
export function quickScan(response: string): {
  safe: boolean
  category?: string
} {
  // Check critical patterns only (fastest check)
  const criticalPatterns = [
    ...BANNED_CONTENT.selfHarmMethods,
    ...BANNED_CONTENT.suicideMethods,
    ...BANNED_CONTENT.harmfulBeliefs,
  ]

  for (const pattern of criticalPatterns) {
    if (pattern.test(response)) {
      return { safe: false, category: 'critical' }
    }
  }

  return { safe: true }
}

// =============================================================================
// CONTENT SANITIZER (for logging/storage)
// =============================================================================

/**
 * Sanitizes content before logging to remove PII
 * Used for crisisDetectionLogs to protect user privacy
 */
export function sanitizeForLogging(content: string): string {
  // Remove potential PII patterns
  let sanitized = content

  // Email addresses
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  )

  // Phone numbers
  sanitized = sanitized.replace(
    /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[PHONE]'
  )

  // SSN patterns
  sanitized = sanitized.replace(/\d{3}[-.\s]?\d{2}[-.\s]?\d{4}/g, '[SSN]')

  // Street addresses (basic pattern)
  sanitized = sanitized.replace(
    /\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
    '[ADDRESS]'
  )

  // Credit card patterns
  sanitized = sanitized.replace(
    /\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}/g,
    '[CARD]'
  )

  return sanitized
}

// =============================================================================
// EXPORTS FOR CRISIS RESPONSE TEMPLATES
// =============================================================================

export { SAFE_FALLBACKS as CrisisResponses }
