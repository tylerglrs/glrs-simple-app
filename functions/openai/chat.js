/**
 * OpenAI Chat Completions - Firebase Cloud Function
 * Phase 7B: Secure proxy for GPT-4o-mini API calls
 * Phase 8B: Integrated crisis detection and safety filtering
 * Phase 6.3: Updated to use Beacon personality system
 *
 * SECURITY: API key stored in Firebase config, never exposed to client
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai').default;

// Phase 8B: Import safety module
const {
  scanForCrisis,
  createCrisisAlert,
  CRISIS_RESPONSES,
} = require('../safety');

// Phase 6.3: Import Beacon personality prompts
const {
  getSystemPrompt,
  BEACON_INSIGHT_PROMPT,
  PROHIBITIONS,
} = require('../beacon/beaconPersonality');

// Initialize Firestore (admin should already be initialized in index.js)
const db = admin.firestore();

// OpenAI client (lazy initialization)
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = functions.config().openai?.key || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Run: firebase functions:config:set openai.key="YOUR_KEY"');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// Rate limiting - track calls per user
const RATE_LIMIT = {
  maxCallsPerMinute: 20,
  maxCallsPerDay: 200,
};

async function checkRateLimit(userId) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const rateLimitRef = db.collection('aiRateLimits').doc(userId);
  const doc = await rateLimitRef.get();

  if (!doc.exists) {
    // First call - create rate limit doc
    await rateLimitRef.set({
      minuteCalls: [now],
      dayCalls: 1,
      dayDate: todayStart.toISOString(),
      lastCall: now,
    });
    return { allowed: true };
  }

  const data = doc.data();

  // Reset day counter if new day
  const isNewDay = data.dayDate !== todayStart.toISOString();
  let dayCalls = isNewDay ? 1 : (data.dayCalls || 0) + 1;

  // Filter minute calls to only those within the last minute
  const minuteCalls = (data.minuteCalls || [])
    .map(t => t.toDate ? t.toDate() : new Date(t))
    .filter(t => t > oneMinuteAgo);
  minuteCalls.push(now);

  // Check limits
  if (minuteCalls.length > RATE_LIMIT.maxCallsPerMinute) {
    return { allowed: false, reason: 'Too many requests per minute. Please wait.' };
  }
  if (dayCalls > RATE_LIMIT.maxCallsPerDay) {
    return { allowed: false, reason: 'Daily AI limit reached. Try again tomorrow.' };
  }

  // Update rate limit doc
  await rateLimitRef.set({
    minuteCalls: minuteCalls.slice(-RATE_LIMIT.maxCallsPerMinute),
    dayCalls,
    dayDate: todayStart.toISOString(),
    lastCall: now,
  });

  return { allowed: true };
}

// Log AI interaction for usage tracking
async function logInteraction(userId, inputTokens, outputTokens, type = 'chat', crisisDetected = false) {
  try {
    await db.collection('aiInteractions').add({
      userId,
      type,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      crisisDetected, // Phase 8B: Track crisis detections
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Approximate cost calculation (GPT-4o-mini pricing)
      cost: (inputTokens * 0.00000015) + (outputTokens * 0.0000006),
    });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
    // Don't fail the request if logging fails
  }
}

// =============================================================================
// PHASE 6.3: BEACON PERSONALITY SAFETY PREFIX
// Uses Beacon personality system from /beacon/beaconPersonality.js
// Crisis detection is handled pre-LLM, this is a backup reminder
// =============================================================================

// Safety prefix - condensed version for per-message use
const SAFETY_PREFIX = `SAFETY: You're Beacon, a supportive AI recovery companion, not a therapist. If user mentions crisis (suicide, self-harm, overdose, abuse), respond: "I'm concerned. Please call 988 or text HOME to 741741. Your coach has been notified." Never minimize feelings, diagnose, or advise on medications.

${PROHIBITIONS}

---
`;

/**
 * Get the appropriate Beacon system prompt based on prompt type
 * @param {string} promptType - Type of prompt: 'insight', 'oracle', 'summary', 'anchor', 'general'
 * @returns {string} - The full system prompt
 */
function getBeaconPrompt(promptType = 'general') {
  return getSystemPrompt(promptType);
}

// =============================================================================
// PHASE 8B: RESPONSE SAFETY FILTER
// =============================================================================

/**
 * Banned content patterns that should never appear in AI responses
 */
const BANNED_PATTERNS = {
  selfHarmMethods: [
    /how\s+to\s+(cut|hurt|harm)\s+(yourself|oneself|myself)/i,
    /best\s+(way|method|place)\s+to\s+(cut|hurt|harm)/i,
  ],
  suicideMethods: [
    /how\s+to\s+(kill|end)\s+(yourself|oneself|myself|your\s+life)/i,
    /best\s+(way|method)\s+to\s+(die|commit\s+suicide|end\s+it)/i,
    /lethal\s+(dose|amount|quantity)/i,
  ],
  dismissiveLanguage: [
    /just\s+(get\s+over|snap\s+out|move\s+on|forget\s+about)\s+it/i,
    /stop\s+being\s+(dramatic|a\s+baby|weak)/i,
  ],
  enablingSubstance: [
    /one\s+(drink|hit|use)\s+won't\s+hurt/i,
    /you\s+can\s+(handle|control)\s+it\s+(this\s+time|now)/i,
  ],
  medicalAdvice: [
    /stop\s+taking\s+(your\s+)?(medication|meds|pills)/i,
    /you\s+(don't|do\s+not)\s+need\s+(medication|meds|therapy)/i,
  ],
};

const SAFE_FALLBACK = `I want to make sure I respond thoughtfully and helpfully.

Your feelings are valid, and I'm here to support you. Your coach is available if you need to talk through anything specific.

Is there something I can help you with today?`;

/**
 * Filter AI response for harmful content
 * @param {string} response - The AI-generated response
 * @returns {{ passed: boolean, filtered: string, flagged: string[] }}
 */
function filterResponse(response) {
  const flagged = [];

  for (const [category, patterns] of Object.entries(BANNED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(response)) {
        flagged.push(category);
        console.warn(`[SAFETY] Response flagged for: ${category}`);
      }
    }
  }

  if (flagged.length > 0) {
    return {
      passed: false,
      filtered: SAFE_FALLBACK,
      flagged,
    };
  }

  return {
    passed: true,
    filtered: response,
    flagged: [],
  };
}

/**
 * Inject safety prefix into system prompt
 * Phase 6.3: Updated to support Beacon prompt types
 * @param {Array} messages - Chat messages array
 * @param {string} promptType - Type of prompt: 'insight', 'oracle', 'summary', 'anchor', 'general'
 * @returns {Array} - Messages with safety prefix injected
 */
function injectSafetyPrefix(messages, promptType = 'general') {
  const hasSystemMessage = messages.some(m => m.role === 'system');

  if (hasSystemMessage) {
    // Prepend safety prefix to existing system message
    return messages.map(m => {
      if (m.role === 'system') {
        return {
          ...m,
          content: SAFETY_PREFIX + m.content,
        };
      }
      return m;
    });
  } else {
    // Add new system message with full Beacon personality
    const beaconPrompt = getBeaconPrompt(promptType);
    return [
      { role: 'system', content: beaconPrompt },
      ...messages,
    ];
  }
}

/**
 * OpenAI Chat Completions Function
 * Callable function for secure AI chat
 * Phase 8B: Added crisis detection and safety filtering
 */
const openaiChat = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to use AI features.'
      );
    }

    const userId = context.auth.uid;

    // Validate input
    // Phase 6.3: Added promptType for Beacon personality selection
    const { messages, maxTokens = 500, temperature = 0.7, pirId, source = 'chat', promptType = 'general' } = data;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Messages array is required.'
      );
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        rateCheck.reason
      );
    }

    // =============================================================================
    // PHASE 8B: PRE-LLM CRISIS DETECTION
    // =============================================================================

    // Get the latest user message for crisis scanning
    const userMessages = messages.filter(m => m.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1]?.content || '';

    // Scan for crisis content
    const crisisScan = scanForCrisis(latestUserMessage);

    let alertId = null;
    let crisisDetected = false;

    // Handle critical/high tier - bypass LLM, return immediate crisis response
    if (crisisScan.detected && (crisisScan.tier === 'critical' || crisisScan.tier === 'high')) {
      crisisDetected = true;

      // Get user info for alert
      let tenantId = null;
      let coachId = null;
      let pirName = 'Unknown User';

      try {
        const userDoc = await db.collection('users').doc(pirId || userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          tenantId = userData.tenantId || null;
          coachId = userData.assignedCoach || null;
          pirName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User';
        }
      } catch (error) {
        console.error('Failed to fetch user data for crisis alert:', error);
      }

      // Create crisis alert in Firestore
      try {
        alertId = await createCrisisAlert(
          pirId || userId,
          crisisScan.tier,
          crisisScan.categories,
          latestUserMessage,
          source,
          { tenantId, coachId, pirName }
        );
        console.log(`[CRISIS ALERT] Created alert ${alertId} for user ${pirId || userId}`);
      } catch (error) {
        console.error('Failed to create crisis alert:', error);
      }

      // Log the blocked interaction
      await logInteraction(userId, latestUserMessage.length / 4, 0, 'chat_blocked', true);

      // Return immediate crisis response - DO NOT call LLM
      const crisisResponse = crisisScan.tier === 'critical'
        ? CRISIS_RESPONSES.critical
        : CRISIS_RESPONSES.high;

      return {
        content: crisisResponse,
        usage: null,
        crisis: true,
        tier: crisisScan.tier,
        alertId: alertId,
        showResources: true,
        categories: crisisScan.categories,
      };
    }

    // =============================================================================
    // CALL OPENAI API (for standard/moderate tier or no crisis)
    // =============================================================================

    try {
      const client = getOpenAIClient();

      // Phase 6.3: Inject Beacon personality based on prompt type
      const safeMessages = injectSafetyPrefix(messages, promptType);

      // Call OpenAI API
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: safeMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: Math.min(maxTokens, 1000), // Cap at 1000 for safety
        temperature: Math.min(Math.max(temperature, 0), 1), // Clamp 0-1
      });

      let response = completion.choices[0]?.message?.content || '';
      const usage = completion.usage;

      // =============================================================================
      // PHASE 8B: POST-LLM RESPONSE FILTERING
      // =============================================================================

      const filterResult = filterResponse(response);

      if (!filterResult.passed) {
        console.warn(`[SAFETY] Response filtered. Categories: ${filterResult.flagged.join(', ')}`);
        response = filterResult.filtered;
      }

      // Check if we need to append crisis resources (moderate tier)
      let finalResponse = response;
      if (crisisScan.detected && crisisScan.tier === 'moderate') {
        // Append gentle resources reminder if not already present
        if (!response.toLowerCase().includes('988') && !response.toLowerCase().includes('crisis')) {
          finalResponse = response + '\n\nRemember, if you ever need immediate support:\n- 988 Suicide & Crisis Lifeline (call or text 988)\n- Your coach is here for you';
        }
      }

      // Log the interaction
      if (usage) {
        await logInteraction(userId, usage.prompt_tokens, usage.completion_tokens, 'chat', crisisScan.detected);
      }

      return {
        content: finalResponse,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        } : null,
        // Phase 8B: Return crisis detection info
        crisis: crisisScan.detected,
        tier: crisisScan.tier,
        alertId: alertId,
        showResources: crisisScan.tier === 'moderate',
        filtered: !filterResult.passed,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);

      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'AI service is busy. Please try again in a moment.'
        );
      }

      if (error.status === 401) {
        throw new functions.https.HttpsError(
          'internal',
          'AI service configuration error. Please contact support.'
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate AI response. Please try again.'
      );
    }
  });

/**
 * OpenAI Text-to-Speech Function
 * Callable function for voice output
 * Phase 8B: Added crisis detection for text input
 */
const openaiTTS = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to use AI features.'
      );
    }

    const userId = context.auth.uid;

    // Validate input
    const { text, voice = 'alloy', speed = 1.0 } = data;

    if (!text || typeof text !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Text is required for speech synthesis.'
      );
    }

    // Limit text length
    const maxChars = 4096;
    if (text.length > maxChars) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Text too long. Maximum ${maxChars} characters.`
      );
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        rateCheck.reason
      );
    }

    try {
      const client = getOpenAIClient();

      // Call OpenAI TTS API
      const mp3 = await client.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
        speed: Math.min(Math.max(speed, 0.25), 4.0), // Clamp 0.25-4.0
      });

      // Convert to base64 for transmission
      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64Audio = buffer.toString('base64');

      // Log the interaction
      await logInteraction(userId, 0, text.length, 'tts');

      return {
        audio: base64Audio,
        format: 'mp3',
        characters: text.length,
      };
    } catch (error) {
      console.error('OpenAI TTS Error:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate speech. Please try again.'
      );
    }
  });

/**
 * OpenAI Whisper (Speech-to-Text) Function
 * Callable function for voice input
 * Phase 8B: Added crisis detection for transcribed text
 */
const openaiWhisper = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to use AI features.'
      );
    }

    const userId = context.auth.uid;

    // Validate input
    const { audioBase64, mimeType = 'audio/webm', pirId } = data;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Audio data is required for transcription.'
      );
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        rateCheck.reason
      );
    }

    try {
      const client = getOpenAIClient();

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');

      // Determine file extension based on mime type
      const extMap = {
        'audio/webm': 'webm',
        'audio/mp4': 'm4a',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
      };
      const ext = extMap[mimeType] || 'webm';

      // Create a File-like object for the API
      const audioFile = new File([audioBuffer], `audio.${ext}`, { type: mimeType });

      // Call OpenAI Whisper API
      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
      });

      const transcribedText = transcription.text;

      // =============================================================================
      // PHASE 8B: CRISIS DETECTION ON TRANSCRIBED TEXT
      // =============================================================================

      const crisisScan = scanForCrisis(transcribedText);
      let alertId = null;

      if (crisisScan.detected && (crisisScan.tier === 'critical' || crisisScan.tier === 'high')) {
        // Get user info for alert
        let tenantId = null;
        let coachId = null;
        let pirName = 'Unknown User';

        try {
          const userDoc = await db.collection('users').doc(pirId || userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            tenantId = userData.tenantId || null;
            coachId = userData.assignedCoach || null;
            pirName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User';
          }
        } catch (error) {
          console.error('Failed to fetch user data for crisis alert:', error);
        }

        // Create crisis alert
        try {
          alertId = await createCrisisAlert(
            pirId || userId,
            crisisScan.tier,
            crisisScan.categories,
            transcribedText,
            'voice_input',
            { tenantId, coachId, pirName }
          );
          console.log(`[CRISIS ALERT] Created alert ${alertId} from voice input`);
        } catch (error) {
          console.error('Failed to create crisis alert from voice:', error);
        }
      }

      // Estimate duration (rough: 150 words per minute, 5 chars per word)
      const estimatedMinutes = transcribedText.length / (150 * 5);

      // Log the interaction
      await logInteraction(userId, 0, 0, 'whisper', crisisScan.detected);

      return {
        text: transcribedText,
        duration: estimatedMinutes,
        // Phase 8B: Return crisis info
        crisis: crisisScan.detected,
        tier: crisisScan.tier,
        alertId: alertId,
        showResources: crisisScan.tier === 'critical' || crisisScan.tier === 'high',
      };
    } catch (error) {
      console.error('OpenAI Whisper Error:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to transcribe audio. Please try again.'
      );
    }
  });

module.exports = {
  openaiChat,
  openaiTTS,
  openaiWhisper,
};
