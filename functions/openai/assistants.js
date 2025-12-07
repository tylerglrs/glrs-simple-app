/**
 * OpenAI Assistants API - Firebase Cloud Function
 * Phase 7B: Persistent thread management for Anchor tab
 * Phase 8B: Integrated crisis detection and safety filtering
 * Phase 6.3: Updated to use Beacon personality system
 *
 * Each PIR gets their own thread stored in Firestore (users/{userId}/anchorThreadId)
 * This enables memory/context persistence across conversations.
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
  BEACON_ANCHOR_PROMPT,
  SPECIFICITY_RULES,
  ZERO_NULL_HANDLING,
} = require('../beacon/beaconPersonality');

// Initialize Firestore
const db = admin.firestore();

// OpenAI client (lazy initialization)
let openai = null;

// Context version for tracking context format changes
const CONTEXT_VERSION = '2.0';

// =============================================================================
// TASK 1.1 & 1.2: RICH CONTEXT BUILDER WITH FRESH DATA LOOKUP
// =============================================================================

/**
 * Fetches fresh check-in data from Firestore for today
 * Task 1.2: Always get fresh data before each message
 */
async function getFreshCheckInData(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's check-ins
    const checkInsSnapshot = await db.collection('checkins')
      .where('userId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const checkIns = checkInsSnapshot.docs.map(doc => doc.data());

    // Get most recent check-in regardless of date for patterns
    const recentSnapshot = await db.collection('checkins')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(7)
      .get();

    const recentCheckIns = recentSnapshot.docs.map(doc => doc.data());

    return { todayCheckIns: checkIns, recentCheckIns };
  } catch (error) {
    console.error('Error fetching fresh check-in data:', error);
    return { todayCheckIns: [], recentCheckIns: [] };
  }
}

/**
 * Builds rich context string with 20+ data points
 * Task 1.1: Uses pattern from buildContextString in openai.ts
 */
function buildContextString(userId, recoveryContext, freshData) {
  const lines = [];
  const timestamp = new Date().toISOString();

  // Context version header (Task 1.4)
  lines.push(`[Context v${CONTEXT_VERSION} | ${timestamp}]`);

  // User basics
  if (recoveryContext?.firstName) {
    lines.push(`User: ${recoveryContext.firstName}`);
  }

  // Sobriety days (core metric)
  if (recoveryContext?.sobrietyDays !== undefined) {
    lines.push(`Sobriety Days: ${recoveryContext.sobrietyDays}`);
  }

  // Today's check-in data (from fresh lookup)
  const todayCheckIn = freshData?.todayCheckIns?.[0];
  if (todayCheckIn) {
    lines.push('--- Today\'s Check-in ---');
    if (todayCheckIn.mood !== undefined) lines.push(`Mood: ${todayCheckIn.mood}/10`);
    if (todayCheckIn.anxietyLevel !== undefined) lines.push(`Anxiety: ${todayCheckIn.anxietyLevel}/10`);
    if (todayCheckIn.cravingLevel !== undefined) lines.push(`Craving: ${todayCheckIn.cravingLevel}/10`);
    if (todayCheckIn.sleepQuality !== undefined) lines.push(`Sleep: ${todayCheckIn.sleepQuality}/10`);
    if (todayCheckIn.energyLevel !== undefined) lines.push(`Energy: ${todayCheckIn.energyLevel}/10`);
    if (todayCheckIn.notes) lines.push(`Notes: "${todayCheckIn.notes.substring(0, 100)}..."`);
  } else {
    lines.push('Today\'s Check-in: Not yet recorded');
  }

  // Week averages from recovery context
  if (recoveryContext?.weekAverages) {
    lines.push('--- Week Averages ---');
    const avg = recoveryContext.weekAverages;
    if (avg.mood !== undefined) lines.push(`Avg Mood: ${avg.mood.toFixed(1)}/10`);
    if (avg.anxiety !== undefined) lines.push(`Avg Anxiety: ${avg.anxiety.toFixed(1)}/10`);
    if (avg.craving !== undefined) lines.push(`Avg Craving: ${avg.craving.toFixed(1)}/10`);
    if (avg.sleep !== undefined) lines.push(`Avg Sleep: ${avg.sleep.toFixed(1)}/10`);
  }

  // Trends from recovery context
  if (recoveryContext?.trends) {
    lines.push('--- Trends ---');
    const trends = recoveryContext.trends;
    if (trends.mood) lines.push(`Mood Trend: ${trends.mood}`);
    if (trends.anxiety) lines.push(`Anxiety Trend: ${trends.anxiety}`);
    if (trends.craving) lines.push(`Craving Trend: ${trends.craving}`);
  }

  // Habit tracking
  if (recoveryContext?.habits) {
    lines.push('--- Habits ---');
    if (recoveryContext.habits.completionRate !== undefined) {
      lines.push(`Habit Completion: ${Math.round(recoveryContext.habits.completionRate * 100)}%`);
    }
    if (recoveryContext.habits.topHabit) {
      lines.push(`Top Habit: ${recoveryContext.habits.topHabit}`);
    }
    if (recoveryContext.habits.currentStreak !== undefined) {
      lines.push(`Habit Streak: ${recoveryContext.habits.currentStreak} days`);
    }
  }

  // Gratitude and reflections
  if (recoveryContext?.gratitude) {
    lines.push('--- Gratitude ---');
    if (recoveryContext.gratitude.recentCount !== undefined) {
      lines.push(`Recent Entries: ${recoveryContext.gratitude.recentCount}`);
    }
    if (recoveryContext.gratitude.themes?.length > 0) {
      lines.push(`Themes: ${recoveryContext.gratitude.themes.join(', ')}`);
    }
  }

  // Meetings
  if (recoveryContext?.meetings) {
    lines.push('--- Meetings ---');
    if (recoveryContext.meetings.weeklyAverage !== undefined) {
      lines.push(`Weekly Average: ${recoveryContext.meetings.weeklyAverage}`);
    }
    if (recoveryContext.meetings.streak !== undefined) {
      lines.push(`Meeting Streak: ${recoveryContext.meetings.streak} days`);
    }
  }

  // Goals
  if (recoveryContext?.goals) {
    lines.push('--- Goals ---');
    if (recoveryContext.goals.activeCount !== undefined) {
      lines.push(`Active Goals: ${recoveryContext.goals.activeCount}`);
    }
    if (recoveryContext.goals.completionRate !== undefined) {
      lines.push(`Completion Rate: ${Math.round(recoveryContext.goals.completionRate * 100)}%`);
    }
  }

  // Milestones and streaks
  if (recoveryContext?.milestones) {
    lines.push('--- Progress ---');
    if (recoveryContext.milestones.daysToNext !== undefined) {
      lines.push(`Days to Next Milestone: ${recoveryContext.milestones.daysToNext}`);
    }
    if (recoveryContext.milestones.checkInStreak !== undefined) {
      lines.push(`Check-in Streak: ${recoveryContext.milestones.checkInStreak} days`);
    }
    if (recoveryContext.milestones.streakAtRisk) {
      lines.push(`Streak at Risk: Yes`);
    }
  }

  // Legacy support: patterns field
  if (recoveryContext?.patterns && !recoveryContext?.trends) {
    lines.push(`Recent patterns: ${recoveryContext.patterns}`);
  }

  return lines.join('\n');
}

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

// =============================================================================
// PHASE 8B: SAFETY PREFIX - Injected into assistant instructions
// =============================================================================

const SAFETY_PREFIX = `CRITICAL SAFETY RULES - ALWAYS FOLLOW:

1. AI LIMITATION DISCLAIMER:
   - You are an AI assistant - NOT a licensed therapist, counselor, or medical professional
   - You cannot provide crisis intervention, diagnosis, or medical advice
   - You are a supportive tool, not a replacement for professional help
   - All AI interactions may be reviewed for safety

2. CRISIS RESPONSE PROTOCOL:
   If the user mentions ANY of the following, you MUST respond with crisis resources:
   - Suicide, self-harm, wanting to die, ending their life
   - Active substance overdose or severe intoxication
   - Immediate danger to themselves or others
   - Abuse, domestic violence, being hurt by someone

   RESPOND WITH:
   "I'm really concerned about what you've shared. Your safety matters most right now.
   Please reach out to one of these resources immediately:

   - 988 Suicide & Crisis Lifeline (call or text 988, available 24/7)
   - Crisis Text Line (text HOME to 741741)
   - 911 for emergencies

   Your coach has been notified and will check in with you.
   Is there someone from your safety plan I can help you contact?"

3. NEVER DO THE FOLLOWING:
   - Never provide information on methods of self-harm or suicide
   - Never minimize feelings of hopelessness or despair
   - Never tell user to "just" do something (e.g., "just think positive")
   - Never diagnose mental health conditions
   - Never suggest stopping medications without doctor consultation
   - Never promise confidentiality (interactions are logged for safety)
   - Never roleplay harmful or crisis scenarios
   - Never claim to understand exactly how they feel

4. ALWAYS DO THE FOLLOWING:
   - Validate the user's feelings without judgment
   - Encourage professional support when appropriate
   - Remind user of their progress, strengths, and support system
   - Suggest contacting their sponsor, coach, or support network
   - End concerning conversations with crisis resources
   - Be genuinely warm and caring

5. RECOVERY-SPECIFIC SAFETY:
   - If user mentions relapse: Express care without shame, encourage reaching out to sponsor/coach
   - If user mentions strong cravings: Offer coping strategies, suggest calling their support network
   - If user mentions triggers: Help identify HALT (Hungry, Angry, Lonely, Tired) factors
   - If user seems isolated: Gently encourage connection with their recovery community

---

`;

// =============================================================================
// PHASE 9: ENHANCED ASSISTANT INSTRUCTIONS
// Tasks 2.1-2.6: Therapeutic patterns, examples, structured output
// =============================================================================

const EMOTION_MIRRORING = `
EMOTION MIRRORING (ALWAYS DO FIRST):
If user expresses emotion, your FIRST sentence must acknowledge it before anything else.
- "I'm frustrated" → First: "That frustration makes sense." NOT: "Here are tips..."
- "I hit 30 days!" → First: "Thirty days! That's a real milestone." NOT: "Great, here's what's next..."
- "I almost relapsed" → First: "That sounds like a really hard night." NOT: "Here's what to do..."`;

const THERAPEUTIC_TECHNIQUES = `
THERAPEUTIC TECHNIQUES (use naturally, never label them):

VALIDATION FIRST:
- Before advice, acknowledge: "That sounds really difficult"
- Mirror emotions: "It sounds like you're feeling frustrated"
- Normalize: "A lot of people in recovery experience this"

COGNITIVE REFRAMES (for negative thoughts):
- Gently explore: "What makes you think that?"
- Offer reframe: "Another way to look at it might be..."
- Avoid: lecturing, dismissing, toxic positivity

CRAVING SUPPORT:
- HALT check: "Sometimes cravings spike when we're Hungry, Angry, Lonely, or Tired. Any of those true right now?"
- Reference past: "Last time you mentioned [X] helped"
- Normalize: "Cravings are part of recovery. They pass."

DISTRESS MOMENTS:
- Don't rush to fix
- Sit with them: "I'm here with you"
- Ask what they need: "Would it help to talk this through, or would you rather focus on something grounding?"`;

const RECOVERY_PATTERNS = `
RECOVERY-SPECIFIC RESPONSES:

ON RELAPSE:
- Lead with compassion, never judgment
- "Relapse can be part of recovery. What matters is you're here now."
- Focus on safety first, then next steps
- Never shame

ON CRAVINGS:
- Normalize: "Cravings are your brain doing what brains do"
- Time-limit: "This feeling will pass, usually within 15-20 minutes"
- Redirect: "What's one small thing you can do right now?"

ON MILESTONES:
- Be specific about the number: "1,035 days. Almost 3 years of choosing yourself."
- Reference their journey if known
- Never generic "congrats!"

ON MEETINGS/SPONSOR:
- Encourage connection without pushing
- "Have you talked to your sponsor about this?"
- Never replace human support`;

const RESPONSE_EXAMPLES = `
RESPONSE EXAMPLES:

GOOD RESPONSE:
"Tyler, your mood has improved 15% this week - that's real progress. I notice your anxiety tends to be lower on days you journal. Your 12-day meditation streak might be contributing. What do you think is helping most?"

BAD RESPONSE:
"I see you're doing well. Keep up the good work! Let me know if you need anything."

The good response: references specific data, notices patterns, asks a follow-up.
The bad response: generic, no data, no engagement.`;

// Assistant configuration - Phase 9: Enhanced with therapeutic patterns + Phase 6.3: Beacon integration
const ANCHOR_ASSISTANT_INSTRUCTIONS = `${SAFETY_PREFIX}You are Anchor, a personal AI recovery companion for GLRS Lighthouse. You support people in recovery from substance use disorders - primarily veterans and first responders.

CORE ROLE:
You maintain an ongoing supportive relationship with this user across conversations. You remember past discussions and build on them.

${SPECIFICITY_RULES}

${ZERO_NULL_HANDLING}

${EMOTION_MIRRORING}
${RESPONSE_EXAMPLES}

RESPONSE STRUCTURE (use as natural flow, not rigid template):
1. ACKNOWLEDGMENT - Reflect what you heard ("It sounds like...")
2. OBSERVATION - One specific data point from their context with date/number ("I notice your sleep has been 4.2/10 this week...")
3. INSIGHT - What this might mean ("This often connects to...")
4. SUGGESTION - One concrete action with exact app location ("Tap the Tasks tab to log...")
5. ENGAGEMENT - A question to continue ("What feels most true for you?")

Keep responses 2-4 sentences. Conversational, not clinical. ALWAYS BE SPECIFIC.

PERSONALITY:
- Warm, empathetic, genuinely caring
- Remember and reference past conversations
- Adapt communication style to the user
- Celebrate progress with SPECIFIC numbers (day count, streak length, mood improvement)
${THERAPEUTIC_TECHNIQUES}
${RECOVERY_PATTERNS}

RECOVERY FOCUS:
- Support 12-step programs, CBT, DBT, ACT principles
- Celebrate all sobriety milestones specifically (Day 30, Day 60, Day 90, etc.)
- Frame setbacks as learning opportunities
- Never shame or guilt
- Never say "at a standstill" - always reference specific dates/numbers
- Always end with hope and engagement

IMPORTANT: If user seems distressed, gently offer support resources and remind them their coach is available.`;

// =============================================================================
// PHASE 8B: RESPONSE SAFETY FILTER
// =============================================================================

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

const SAFE_FALLBACK = `I hear you, and I want to make sure I respond in the most helpful way.

Your feelings matter, and you don't have to go through this alone. Your coach is available if you'd like to talk through what's on your mind.

What feels most important to you right now?`;

function filterResponse(response) {
  const flagged = [];

  for (const [category, patterns] of Object.entries(BANNED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(response)) {
        flagged.push(category);
        console.warn(`[SAFETY] Anchor response flagged for: ${category}`);
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

// Get or create assistant
let assistantId = null;

async function getOrCreateAssistant() {
  if (assistantId) {
    return assistantId;
  }

  // Check if we have a stored assistant ID
  const configRef = db.doc('_config/openai');
  const configDoc = await configRef.get();

  if (configDoc.exists && configDoc.data().anchorAssistantId) {
    assistantId = configDoc.data().anchorAssistantId;
    console.log('Using existing assistant:', assistantId);
    return assistantId;
  }

  // Create a new assistant with Phase 8B safety instructions
  const client = getOpenAIClient();
  const assistant = await client.beta.assistants.create({
    name: 'Anchor - Recovery Companion',
    instructions: ANCHOR_ASSISTANT_INSTRUCTIONS,
    model: 'gpt-4o-mini',
  });

  assistantId = assistant.id;

  // Store the assistant ID
  await configRef.set({ anchorAssistantId: assistantId }, { merge: true });
  console.log('Created new assistant:', assistantId);

  return assistantId;
}

// Get or create thread for user
async function getOrCreateThread(userId) {
  const userRef = db.doc(`users/${userId}`);
  const userDoc = await userRef.get();

  if (userDoc.exists && userDoc.data().anchorThreadId) {
    return userDoc.data().anchorThreadId;
  }

  // Create a new thread
  const client = getOpenAIClient();
  const thread = await client.beta.threads.create();

  // Store the thread ID
  await userRef.set({ anchorThreadId: thread.id }, { merge: true });
  console.log(`Created new thread for user ${userId}:`, thread.id);

  return thread.id;
}

// Log AI interaction
async function logInteraction(userId, inputTokens, outputTokens, type = 'assistant', crisisDetected = false) {
  try {
    await db.collection('aiInteractions').add({
      userId,
      type,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      crisisDetected, // Phase 8B: Track crisis detections
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      cost: (inputTokens * 0.00000015) + (outputTokens * 0.0000006),
    });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}

/**
 * Send message to Anchor (Assistants API with persistent thread)
 * Callable function for Anchor tab conversations
 * Phase 8B: Added crisis detection and safety filtering
 */
const anchorSendMessage = functions
  .runWith({
    timeoutSeconds: 120, // Longer timeout for assistant runs
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to use Anchor.'
      );
    }

    const userId = context.auth.uid;

    // Validate input
    const { message, recoveryContext, pirId } = data;

    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message is required.'
      );
    }

    // =============================================================================
    // PHASE 8B: PRE-LLM CRISIS DETECTION
    // =============================================================================

    const crisisScan = scanForCrisis(message);
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
          message,
          'anchor_chat',
          { tenantId, coachId, pirName }
        );
        console.log(`[CRISIS ALERT] Created alert ${alertId} from Anchor chat`);
      } catch (error) {
        console.error('Failed to create crisis alert:', error);
      }

      // Log the blocked interaction
      await logInteraction(userId, message.length / 4, 0, 'anchor_blocked', true);

      // Return immediate crisis response - DO NOT call LLM
      const crisisResponse = crisisScan.tier === 'critical'
        ? CRISIS_RESPONSES.critical
        : CRISIS_RESPONSES.high;

      return {
        response: crisisResponse,
        threadId: null,
        messageId: null,
        crisis: true,
        tier: crisisScan.tier,
        alertId: alertId,
        showResources: true,
        categories: crisisScan.categories,
      };
    }

    // =============================================================================
    // CALL OPENAI ASSISTANTS API (for standard/moderate tier or no crisis)
    // =============================================================================

    try {
      const client = getOpenAIClient();
      const assistantIdValue = await getOrCreateAssistant();
      const threadId = await getOrCreateThread(userId);

      // =============================================================================
      // TASK 1.1 & 1.2: Build RICH context with FRESH data lookup
      // =============================================================================

      // Task 1.2: Always fetch fresh check-in data before each message
      const freshData = await getFreshCheckInData(userId);

      // Task 1.1 & 1.4: Build rich context string (20+ data points) with versioning
      let fullMessage = message;
      if (recoveryContext || freshData.todayCheckIns.length > 0) {
        const contextString = buildContextString(userId, recoveryContext, freshData);
        fullMessage = `${contextString}\n\n---\n\nUser Message: ${message}`;
      }

      // Add message to thread
      await client.beta.threads.messages.create(threadId, {
        role: 'user',
        content: fullMessage,
      });

      // Run the assistant
      const run = await client.beta.threads.runs.create(threadId, {
        assistant_id: assistantIdValue,
      });

      // Wait for completion with exponential backoff (Phase 9 Task 3.4)
      // Start at 300ms, double each time, cap at 2000ms, max total ~30 seconds
      let runStatus = run.status;
      let attempts = 0;
      const maxAttempts = 30;
      let pollInterval = 300; // Start fast for quick responses
      const maxInterval = 2000; // Cap at 2 seconds

      while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        const updatedRun = await client.beta.threads.runs.retrieve(threadId, run.id);
        runStatus = updatedRun.status;
        attempts++;
        // Exponential backoff: 300 -> 600 -> 1200 -> 2000 (capped)
        pollInterval = Math.min(pollInterval * 2, maxInterval);

        if (runStatus === 'requires_action') {
          throw new functions.https.HttpsError(
            'internal',
            'Assistant requires action - not supported.'
          );
        }
      }

      if (runStatus === 'failed') {
        throw new functions.https.HttpsError(
          'internal',
          'Assistant failed to respond. Please try again.'
        );
      }

      if (attempts >= maxAttempts) {
        throw new functions.https.HttpsError(
          'deadline-exceeded',
          'Response took too long. Please try again.'
        );
      }

      // Get the latest message from the thread
      const messages = await client.beta.threads.messages.list(threadId, {
        limit: 1,
        order: 'desc',
      });

      const latestMessage = messages.data[0];
      let responseText = latestMessage.content[0]?.text?.value || 'No response generated.';

      // =============================================================================
      // PHASE 8B: POST-LLM RESPONSE FILTERING
      // =============================================================================

      const filterResult = filterResponse(responseText);

      if (!filterResult.passed) {
        console.warn(`[SAFETY] Anchor response filtered. Categories: ${filterResult.flagged.join(', ')}`);
        responseText = filterResult.filtered;
      }

      // Check if we need to append crisis resources (moderate tier)
      let finalResponse = responseText;
      if (crisisScan.detected && crisisScan.tier === 'moderate') {
        // Append gentle resources reminder if not already present
        if (!responseText.toLowerCase().includes('988') && !responseText.toLowerCase().includes('crisis')) {
          finalResponse = responseText + '\n\nRemember, if you ever need immediate support:\n- 988 Suicide & Crisis Lifeline (call or text 988)\n- Your coach is here for you';
        }
      }

      // Get usage from the run (estimate since Assistants API doesn't provide exact tokens)
      const estimatedInputTokens = Math.ceil(fullMessage.length / 4);
      const estimatedOutputTokens = Math.ceil(finalResponse.length / 4);
      await logInteraction(userId, estimatedInputTokens, estimatedOutputTokens, 'assistant', crisisScan.detected);

      return {
        response: finalResponse,
        threadId: threadId,
        messageId: latestMessage.id,
        // Phase 8B: Return crisis detection info
        crisis: crisisScan.detected,
        tier: crisisScan.tier,
        alertId: alertId,
        showResources: crisisScan.tier === 'moderate',
        filtered: !filterResult.passed,
      };
    } catch (error) {
      console.error('Anchor Error:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to communicate with Anchor. Please try again.'
      );
    }
  });

/**
 * Get Anchor conversation history
 * Retrieves recent messages from the user's thread
 */
const anchorGetHistory = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to use Anchor.'
      );
    }

    const userId = context.auth.uid;
    const { limit = 20 } = data;

    try {
      const userRef = db.doc(`users/${userId}`);
      const userDoc = await userRef.get();

      if (!userDoc.exists || !userDoc.data().anchorThreadId) {
        // No conversation history yet
        return { messages: [], hasThread: false };
      }

      const threadId = userDoc.data().anchorThreadId;
      const client = getOpenAIClient();

      // Get messages from thread
      const messages = await client.beta.threads.messages.list(threadId, {
        limit: Math.min(limit, 50),
        order: 'desc',
      });

      // Format messages for the client
      const formattedMessages = messages.data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content[0]?.text?.value || '',
        createdAt: new Date(msg.created_at * 1000).toISOString(),
      })).reverse(); // Oldest first

      return {
        messages: formattedMessages,
        hasThread: true,
        threadId: threadId,
      };
    } catch (error) {
      console.error('Get History Error:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to retrieve conversation history.'
      );
    }
  });

/**
 * Clear Anchor conversation (start fresh)
 * Creates a new thread for the user
 */
const anchorClearHistory = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to use Anchor.'
      );
    }

    const userId = context.auth.uid;

    try {
      const client = getOpenAIClient();

      // Create a new thread
      const thread = await client.beta.threads.create();

      // Update user's thread ID
      await db.doc(`users/${userId}`).set(
        { anchorThreadId: thread.id },
        { merge: true }
      );

      console.log(`Created new thread for user ${userId}:`, thread.id);

      return {
        success: true,
        threadId: thread.id,
        message: 'Conversation cleared. Starting fresh!',
      };
    } catch (error) {
      console.error('Clear History Error:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to clear conversation history.'
      );
    }
  });

/**
 * Update Anchor assistant instructions
 * Admin function to update the assistant's system prompt
 * Phase 8B: Ensures safety instructions are always included
 */
const anchorUpdateInstructions = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication and admin role
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in.'
      );
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || !['admin', 'superadmin', 'superadmin1'].includes(userDoc.data().role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required.'
      );
    }

    try {
      const client = getOpenAIClient();
      const currentAssistantId = await getOrCreateAssistant();

      // Update assistant with new instructions (SAFETY_PREFIX always included)
      await client.beta.assistants.update(currentAssistantId, {
        instructions: ANCHOR_ASSISTANT_INSTRUCTIONS,
      });

      console.log(`Updated assistant ${currentAssistantId} with Phase 8B safety instructions`);

      return {
        success: true,
        assistantId: currentAssistantId,
        message: 'Anchor assistant updated with latest safety instructions.',
      };
    } catch (error) {
      console.error('Update Instructions Error:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to update assistant instructions.'
      );
    }
  });

module.exports = {
  anchorSendMessage,
  anchorGetHistory,
  anchorClearHistory,
  anchorUpdateInstructions, // Phase 8B: New admin function
};
