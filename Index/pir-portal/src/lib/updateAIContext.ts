// =============================================================================
// UPDATE AI CONTEXT HELPER
// Reusable function to update users/{userId}/aiContext/current
// =============================================================================

import {
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  AIContextDocument,
  AIContextUpdateAction,
  createEmptyAIContext,
} from '@/types/aiContext'

// =============================================================================
// CONSTANTS
// =============================================================================

const AI_CONTEXT_COLLECTION = 'aiContext'
const AI_CONTEXT_DOC = 'current'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the path to the aiContext document for a user
 */
function getContextDocRef(userId: string) {
  return doc(db, 'users', userId, AI_CONTEXT_COLLECTION, AI_CONTEXT_DOC)
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if today field needs reset (new day)
 */
async function checkAndResetTodayIfNeeded(
  userId: string,
  contextDoc: AIContextDocument | null
): Promise<boolean> {
  const today = getTodayDateString()

  if (!contextDoc || contextDoc.today.date !== today) {
    // Reset today's fields for new day
    const resetFields: Partial<Record<string, unknown>> = {
      'today.date': today,
      'today.morningCheckIn.completed': false,
      'today.morningCheckIn.completedAt': null,
      'today.morningCheckIn.mood': null,
      'today.morningCheckIn.craving': null,
      'today.morningCheckIn.anxiety': null,
      'today.morningCheckIn.sleep': null,
      'today.morningCheckIn.energy': null,
      'today.eveningCheckIn.completed': false,
      'today.eveningCheckIn.completedAt': null,
      'today.eveningCheckIn.overallDay': null,
      'today.eveningCheckIn.gratitude': null,
      'today.eveningCheckIn.tomorrowGoal': null,
      'today.habitsCompleted': [],
      'today.reflectionsCount': 0,
      'today.gratitudesCount': 0,
      'today.winsCount': 0,
      'today.meetingsAttended': 0,
      'today.assignmentsCompleted': 0,
      'context.isWeekend': [0, 6].includes(new Date().getDay()),
      'context.engagedToday': false,
      lastUpdated: serverTimestamp(),
    }

    await updateDoc(getContextDocRef(userId), resetFields)
    return true
  }

  return false
}

// =============================================================================
// MAIN UPDATE FUNCTION
// =============================================================================

/**
 * Update the aiContext document with new data
 *
 * @param userId - The user's ID
 * @param action - The type of action being performed
 * @param data - The data to update
 *
 * @example
 * // After morning check-in
 * await updateAIContext(userId, 'morning_checkin', {
 *   mood: 7,
 *   craving: 2,
 *   anxiety: 3,
 *   sleep: 8,
 *   energy: 6
 * })
 *
 * @example
 * // After completing a habit
 * await updateAIContext(userId, 'habit_complete', {
 *   habitId: 'habit123'
 * })
 */
export async function updateAIContext(
  userId: string,
  action: AIContextUpdateAction,
  data: Record<string, unknown>
): Promise<void> {
  if (!userId) {
    console.warn('[updateAIContext] No userId provided, skipping update')
    return
  }

  try {
    const contextRef = getContextDocRef(userId)
    const contextSnap = await getDoc(contextRef)

    // If document doesn't exist, create it first
    if (!contextSnap.exists()) {
      console.log('[updateAIContext] Creating new aiContext document for user:', userId)
      const { createEmptyAIContext } = await import('@/types/aiContext')
      const emptyContext = createEmptyAIContext(userId)
      await setDoc(contextRef, {
        ...emptyContext,
        lastUpdated: serverTimestamp(),
      })
    }

    const contextDoc = contextSnap.exists()
      ? (contextSnap.data() as AIContextDocument)
      : null

    // Check if we need to reset today's fields (new day)
    await checkAndResetTodayIfNeeded(userId, contextDoc)

    // Build update payload based on action
    const updatePayload = buildUpdatePayload(action, data, contextDoc)

    // Perform update
    await updateDoc(contextRef, updatePayload)

    console.log(`[updateAIContext] Updated context for action: ${action}`)
  } catch (error) {
    console.error('[updateAIContext] Error updating context:', error)
    // Don't throw - we don't want to break the main operation
  }
}

// =============================================================================
// UPDATE PAYLOAD BUILDERS
// =============================================================================

/**
 * Build the update payload based on the action type
 */
function buildUpdatePayload(
  action: AIContextUpdateAction,
  data: Record<string, unknown>,
  currentContext: AIContextDocument | null
): Record<string, unknown> {
  const basePayload: Record<string, unknown> = {
    'context.engagedToday': true,
    lastUpdated: serverTimestamp(),
  }

  switch (action) {
    case 'morning_checkin':
      return {
        ...basePayload,
        'today.morningCheckIn.completed': true,
        'today.morningCheckIn.completedAt': Timestamp.now(),
        'today.morningCheckIn.mood': data.mood ?? null,
        'today.morningCheckIn.craving': data.craving ?? null,
        'today.morningCheckIn.anxiety': data.anxiety ?? null,
        'today.morningCheckIn.sleep': data.sleep ?? null,
        'today.morningCheckIn.energy': data.energy ?? null,
      }

    case 'evening_checkin':
      return {
        ...basePayload,
        'today.eveningCheckIn.completed': true,
        'today.eveningCheckIn.completedAt': Timestamp.now(),
        'today.eveningCheckIn.overallDay': data.overallDay ?? null,
        'today.eveningCheckIn.gratitude': data.gratitude ?? null,
        'today.eveningCheckIn.tomorrowGoal': data.tomorrowGoal ?? null,
      }

    case 'habit_complete':
      return {
        ...basePayload,
        'today.habitsCompleted': arrayUnion(data.habitId),
      }

    case 'habit_add':
      return {
        ...basePayload,
        'habits.activeCount': increment(1),
      }

    case 'reflection_add':
      return {
        ...basePayload,
        'today.reflectionsCount': increment(1),
        'reflections.count30Day': increment(1),
      }

    case 'gratitude_add':
      return {
        ...basePayload,
        'today.gratitudesCount': increment(1),
        'gratitudes.count30Day': increment(1),
      }

    case 'win_add':
      return {
        ...basePayload,
        'today.winsCount': increment(1),
        'wins.count30Day': increment(1),
      }

    case 'goal_add':
      return {
        ...basePayload,
        'goals.activeCount': increment(1),
      }

    case 'goal_update':
      return {
        ...basePayload,
        // Just mark engaged, full recalc happens in scheduled function
      }

    case 'goal_complete':
      return {
        ...basePayload,
        'goals.activeCount': increment(-1),
        'goals.completedCount': increment(1),
      }

    case 'assignment_complete':
      return {
        ...basePayload,
        'today.assignmentsCompleted': increment(1),
        'assignments.pendingCount': increment(-1),
        'assignments.completedThisWeek': increment(1),
      }

    case 'meeting_attend':
      return {
        ...basePayload,
        'today.meetingsAttended': increment(1),
        'meetings.attendedThisWeek': increment(1),
        'meetings.attendedThisMonth': increment(1),
        'meetings.lastAttendedDate': Timestamp.now(),
      }

    case 'meeting_save':
      return {
        ...basePayload,
        'meetings.savedCount': data.savedCount ?? 0,
      }

    case 'breakthrough_add':
      return {
        ...basePayload,
        'breakthroughs.totalCount': increment(1),
        'breakthroughs.mostRecentDate': Timestamp.now(),
        'breakthroughs.hadRecentBreakthrough': true,
      }

    case 'savings_update':
      return {
        ...basePayload,
        'journey.totalSaved': data.totalSaved ?? currentContext?.journey.totalSaved ?? 0,
        'journey.savingsGoalProgress': data.progress ?? null,
      }

    case 'profile_update':
      return {
        ...basePayload,
        'user.firstName': data.firstName ?? currentContext?.user.firstName ?? '',
        'user.primarySubstance':
          data.primarySubstance ?? currentContext?.user.primarySubstance ?? null,
        'user.isVeteran': data.isVeteran ?? currentContext?.user.isVeteran ?? false,
      }

    case 'countdown_goal_add':
      return {
        ...basePayload,
        'journey.countdownGoalsActive': increment(1),
      }

    case 'countdown_goal_update':
      return {
        ...basePayload,
        // Just mark engaged, specific progress is in the goal document
      }

    case 'countdown_goal_complete':
      return {
        ...basePayload,
        'journey.countdownGoalsActive': increment(-1),
        'goals.completedCount': increment(1),
      }

    case 'money_map_update':
      return {
        ...basePayload,
        'journey.moneyMapProgress': data.progress ?? null,
      }

    case 'technique_complete':
      return {
        ...basePayload,
        'today.techniquesCompleted': increment(1),
      }

    case 'intention_add':
      return {
        ...basePayload,
        'today.intentionsCount': increment(1),
      }

    case 'safety_plan_update':
      return {
        ...basePayload,
        // Just mark engaged for safety plan updates
      }

    default:
      return basePayload
  }
}

// =============================================================================
// CONVENIENCE WRAPPERS
// =============================================================================

/**
 * Update context after morning check-in
 */
export async function updateContextAfterMorningCheckin(
  userId: string,
  data: {
    mood?: number
    craving?: number
    anxiety?: number
    sleep?: number
    energy?: number
  }
): Promise<void> {
  await updateAIContext(userId, 'morning_checkin', data)
}

/**
 * Update context after evening check-in
 */
export async function updateContextAfterEveningCheckin(
  userId: string,
  data: {
    overallDay?: number
    gratitude?: string
    tomorrowGoal?: string
  }
): Promise<void> {
  await updateAIContext(userId, 'evening_checkin', data)
}

/**
 * Update context after completing a habit
 */
export async function updateContextAfterHabitComplete(
  userId: string,
  habitId: string
): Promise<void> {
  await updateAIContext(userId, 'habit_complete', { habitId })
}

/**
 * Update context after adding a habit
 */
export async function updateContextAfterHabitAdd(userId: string): Promise<void> {
  await updateAIContext(userId, 'habit_add', {})
}

/**
 * Update context after adding a reflection
 */
export async function updateContextAfterReflection(userId: string): Promise<void> {
  await updateAIContext(userId, 'reflection_add', {})
}

/**
 * Update context after adding a gratitude
 */
export async function updateContextAfterGratitude(userId: string): Promise<void> {
  await updateAIContext(userId, 'gratitude_add', {})
}

/**
 * Update context after adding a win
 */
export async function updateContextAfterWin(userId: string): Promise<void> {
  await updateAIContext(userId, 'win_add', {})
}

/**
 * Update context after adding a goal
 */
export async function updateContextAfterGoalAdd(userId: string): Promise<void> {
  await updateAIContext(userId, 'goal_add', {})
}

/**
 * Update context after updating a goal
 */
export async function updateContextAfterGoalUpdate(userId: string): Promise<void> {
  await updateAIContext(userId, 'goal_update', {})
}

/**
 * Update context after completing a goal
 */
export async function updateContextAfterGoalComplete(userId: string): Promise<void> {
  await updateAIContext(userId, 'goal_complete', {})
}

/**
 * Update context after completing an assignment
 */
export async function updateContextAfterAssignmentComplete(
  userId: string
): Promise<void> {
  await updateAIContext(userId, 'assignment_complete', {})
}

/**
 * Update context after attending a meeting
 */
export async function updateContextAfterMeetingAttend(userId: string): Promise<void> {
  await updateAIContext(userId, 'meeting_attend', {})
}

/**
 * Update context after saving/unsaving a meeting
 * Queries the favorites subcollection to get the current count
 */
export async function updateContextAfterMeetingSave(userId: string): Promise<void> {
  const { collection, getDocs } = await import('firebase/firestore')
  const { db } = await import('@/lib/firebase')

  try {
    // Query favorites collection to get current count
    const favoritesRef = collection(db, 'users', userId, 'favorites')
    const snapshot = await getDocs(favoritesRef)
    const savedCount = snapshot.size

    await updateAIContext(userId, 'meeting_save', {
      savedCount,
    })
  } catch (error) {
    console.error('[updateContextAfterMeetingSave] Error:', error)
  }
}

/**
 * Update context after logging a breakthrough
 */
export async function updateContextAfterBreakthrough(userId: string): Promise<void> {
  await updateAIContext(userId, 'breakthrough_add', {})
}

/**
 * Update context after updating savings
 * Queries current savings totals from Firestore
 */
export async function updateContextAfterSavingsUpdate(
  userId: string
): Promise<void> {
  // Query savings goals to calculate totals
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const { db } = await import('@/lib/firebase')

  try {
    const goalsQuery = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(goalsQuery)

    let totalSaved = 0
    let totalTarget = 0

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      totalSaved += data.currentAmount || 0
      totalTarget += data.targetAmount || 0
    })

    const progress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

    await updateAIContext(userId, 'savings_update', { totalSaved, progress })
  } catch (error) {
    console.error('[updateContextAfterSavingsUpdate] Error:', error)
  }
}

/**
 * Update context after adding a countdown goal
 */
export async function updateContextAfterCountdownGoalAdd(userId: string): Promise<void> {
  await updateAIContext(userId, 'countdown_goal_add', {})
}

/**
 * Update context after updating a countdown goal
 */
export async function updateContextAfterCountdownGoalUpdate(userId: string): Promise<void> {
  await updateAIContext(userId, 'countdown_goal_update', {})
}

/**
 * Update context after completing a countdown goal
 */
export async function updateContextAfterCountdownGoalComplete(userId: string): Promise<void> {
  await updateAIContext(userId, 'countdown_goal_complete', {})
}

/**
 * Update context after money map update
 */
export async function updateContextAfterMoneyMapUpdate(
  userId: string,
  progress?: number
): Promise<void> {
  await updateAIContext(userId, 'money_map_update', { progress })
}

/**
 * Update context after completing a coping technique
 */
export async function updateContextAfterTechniqueComplete(userId: string): Promise<void> {
  await updateAIContext(userId, 'technique_complete', {})
}

/**
 * Update context after adding an intention
 */
export async function updateContextAfterIntention(userId: string): Promise<void> {
  await updateAIContext(userId, 'intention_add', {})
}

/**
 * Update context after updating safety plan
 */
export async function updateContextAfterSafetyPlanUpdate(userId: string): Promise<void> {
  await updateAIContext(userId, 'safety_plan_update', {})
}

/**
 * Update context after profile update
 */
export async function updateContextAfterProfileUpdate(
  userId: string,
  data: {
    displayName?: string
    firstName?: string
    primarySubstance?: string
    isVeteran?: boolean
  }
): Promise<void> {
  await updateAIContext(userId, 'profile_update', data)
}

export default updateAIContext
