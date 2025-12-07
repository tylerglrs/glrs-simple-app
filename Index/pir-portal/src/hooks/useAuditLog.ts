/**
 * useAuditLog Hook - Compliance Audit Logging
 * Phase 6/Task 6.4: Audit Logging for Compliance
 *
 * Logs AI interactions to Firestore for compliance review.
 * Stores in users/{userId}/anchorAuditLogs/{logId}
 *
 * Retention: 7 years (HIPAA-adjacent compliance)
 *
 * Logged data:
 * - User message
 * - AI response
 * - Crisis detection results
 * - Safety flags
 * - Disclaimer shown status
 * - Session context
 */

import { useCallback } from 'react'
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface AuditLogEntry {
  // Timestamps
  timestamp: ReturnType<typeof serverTimestamp>
  sessionId: string

  // Message content
  userMessage: string
  aiResponse: string
  messageId?: string

  // Safety checks
  crisisTierDetected: 'critical' | 'high' | 'moderate' | 'standard' | null
  crisisAlertId: string | null
  safetyFlags: string[]
  responseFiltered: boolean
  disclaimerShown: boolean
  coachNotified: boolean
  resourcesDisplayed: boolean

  // Context at time of interaction
  context: {
    checkInMood: number | null
    checkInAnxiety: number | null
    checkInCraving: number | null
    sobrietyDays: number
    sessionDurationMinutes: number
  }

  // AI metadata
  aiFeature: 'anchor' | 'daily_oracle' | 'voice_companion' | 'prompt_cards' | 'story_mode' | 'guided_checkin'
  inputTokensEstimate?: number
  outputTokensEstimate?: number
  latencyMs?: number
}

export interface UseAuditLogReturn {
  /** Log an AI interaction */
  logInteraction: (entry: Omit<AuditLogEntry, 'timestamp'>) => Promise<string | null>
  /** Update an existing log entry */
  updateLog: (logId: string, updates: Partial<AuditLogEntry>) => Promise<void>
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useAuditLog - Hook for compliance audit logging
 *
 * @returns Audit logging functions
 */
export function useAuditLog(): UseAuditLogReturn {
  const userId = auth.currentUser?.uid

  /**
   * Log an AI interaction to Firestore
   */
  const logInteraction = useCallback(
    async (entry: Omit<AuditLogEntry, 'timestamp'>): Promise<string | null> => {
      if (!userId) {
        console.warn('[AuditLog] No user ID, skipping log')
        return null
      }

      try {
        const logsRef = collection(db, 'users', userId, 'anchorAuditLogs')

        const docRef = await addDoc(logsRef, {
          ...entry,
          timestamp: serverTimestamp(),
          userId, // Include for potential cross-collection queries
        })

        console.log(`[AuditLog] Logged interaction: ${docRef.id}`)
        return docRef.id
      } catch (error) {
        console.error('[AuditLog] Failed to log interaction:', error)
        // Don't throw - audit logging should not break the main flow
        return null
      }
    },
    [userId]
  )

  /**
   * Update an existing log entry
   */
  const updateLog = useCallback(
    async (logId: string, updates: Partial<AuditLogEntry>): Promise<void> => {
      if (!userId) {
        console.warn('[AuditLog] No user ID, skipping update')
        return
      }

      try {
        const logRef = doc(db, 'users', userId, 'anchorAuditLogs', logId)
        await updateDoc(logRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        })

        console.log(`[AuditLog] Updated log: ${logId}`)
      } catch (error) {
        console.error('[AuditLog] Failed to update log:', error)
        // Don't throw - audit logging should not break the main flow
      }
    },
    [userId]
  )

  return {
    logInteraction,
    updateLog,
  }
}

// =============================================================================
// HELPER: Generate Session ID
// =============================================================================

let currentSessionId: string | null = null
let sessionStartTime: number | null = null
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Get or create a session ID for grouping related interactions
 */
export function getSessionId(): string {
  const now = Date.now()

  // If no session or session expired, create new one
  if (!currentSessionId || !sessionStartTime || now - sessionStartTime > SESSION_TIMEOUT_MS) {
    currentSessionId = `session_${now}_${Math.random().toString(36).substring(2, 9)}`
    sessionStartTime = now
    console.log(`[AuditLog] New session: ${currentSessionId}`)
  }

  return currentSessionId
}

/**
 * Reset the session (e.g., when user logs out)
 */
export function resetSession(): void {
  currentSessionId = null
  sessionStartTime = null
}

export default useAuditLog
