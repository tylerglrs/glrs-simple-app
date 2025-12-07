/**
 * useAlerts Hook
 * Phase 8E: Admin Crisis Dashboard
 *
 * Real-time listener for crisis alerts with filtering,
 * statistics calculation, and audio notifications.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore'
import { db, CURRENT_TENANT, logAudit } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type {
  CrisisAlert,
  AlertFilters,
  AlertStats,
  UseAlertsOptions,
  ResponseLogEntry,
} from '../types'
import { DEFAULT_FILTERS } from '../types'

// ============================================================================
// AUDIO NOTIFICATION
// ============================================================================

let audioElement: HTMLAudioElement | null = null

function playAlertSound() {
  try {
    // Create audio element if it doesn't exist
    if (!audioElement) {
      audioElement = new Audio('/assets/sounds/urgent_alert.wav')
      audioElement.volume = 0.5
    }

    // Play the sound
    audioElement.currentTime = 0
    audioElement.play().catch((err) => {
      // Audio play was blocked - user hasn't interacted yet
      console.warn('[useAlerts] Audio play blocked:', err.message)
    })
  } catch (e) {
    console.warn('[useAlerts] Could not play alert sound:', e)
  }
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

interface UseAlertsReturn {
  /** Filtered alerts based on current filters */
  alerts: CrisisAlert[]
  /** All alerts (unfiltered) */
  allAlerts: CrisisAlert[]
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Current filter state */
  filters: AlertFilters
  /** Update filters */
  setFilters: React.Dispatch<React.SetStateAction<AlertFilters>>
  /** Aggregated statistics */
  stats: AlertStats
  /** Acknowledge an alert */
  acknowledgeAlert: (alertId: string) => Promise<void>
  /** Add a response note */
  addResponseNote: (alertId: string, note: string) => Promise<void>
  /** Escalate an alert */
  escalateAlert: (alertId: string, escalatedTo: string, note?: string) => Promise<void>
  /** Resolve an alert */
  resolveAlert: (alertId: string, note?: string) => Promise<void>
  /** Refresh data (re-subscribe) */
  refresh: () => void
}

export function useAlerts(options: UseAlertsOptions): UseAlertsReturn {
  const { adminUser } = useAuth()

  // State
  const [alerts, setAlerts] = useState<CrisisAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Filters - use default from types
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS)

  // ─────────────────────────────────────────────────────────────────────────
  // Real-time Listener
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Build query
    let q = query(
      collection(db, 'crisisAlerts'),
      where('tenantId', '==', options.tenantId || CURRENT_TENANT),
      orderBy('createdAt', 'desc'),
      firestoreLimit(options.limit || 200)
    )

    // Apply coach scope if provided
    if (options.coachId) {
      q = query(
        collection(db, 'crisisAlerts'),
        where('tenantId', '==', options.tenantId || CURRENT_TENANT),
        where('coachId', '==', options.coachId),
        orderBy('createdAt', 'desc'),
        firestoreLimit(options.limit || 200)
      )
    }

    console.log('[useAlerts] Setting up real-time listener', {
      tenantId: options.tenantId || CURRENT_TENANT,
      coachId: options.coachId,
      limit: options.limit || 200,
    })

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const alertsData: CrisisAlert[] = []

        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          alertsData.push({
            id: docSnap.id,
            pirId: data.pirId || '',
            pirName: data.pirName || 'Unknown',
            coachId: data.coachId || null,
            coachName: data.coachName || null,
            tenantId: data.tenantId || CURRENT_TENANT,
            source: data.source || 'ai',
            tier: data.tier || 4,
            severity: data.severity || 'low',
            triggerKeywords: data.triggerKeywords || [],
            context: data.context || '',
            fullMessage: data.fullMessage || '',
            aiFeature: data.aiFeature,
            aiResponse: data.aiResponse,
            resourcesDisplayed: data.resourcesDisplayed ?? false,
            llmBypassed: data.llmBypassed,
            checkinId: data.checkinId,
            checkinType: data.checkinType,
            concerningScore: data.concerningScore,
            concerningFields: data.concerningFields,
            sosLocation: data.sosLocation,
            sosTriggeredFrom: data.sosTriggeredFrom,
            status: data.status || 'unread',
            acknowledgedAt: data.acknowledgedAt || null,
            acknowledgedBy: data.acknowledgedBy || null,
            respondedAt: data.respondedAt || null,
            respondedBy: data.respondedBy || null,
            escalatedAt: data.escalatedAt || null,
            escalatedTo: data.escalatedTo || null,
            resolvedAt: data.resolvedAt || null,
            resolvedBy: data.resolvedBy || null,
            responseNotes: data.responseNotes || null,
            responseLog: data.responseLog || [],
            notificationsSent: data.notificationsSent || {
              push: false,
              email: false,
              sms: false,
              inApp: false,
            },
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || Timestamp.now(),
          } as CrisisAlert)
        })

        setAlerts(alertsData)
        setLoading(false)
        setError(null)

        // Check for new critical alerts and play sound
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const alertData = change.doc.data()
            if (alertData.tier === 1 && alertData.status === 'unread') {
              console.log('[useAlerts] New critical alert detected, playing sound')
              playAlertSound()
            }
          }
        })
      },
      (err) => {
        console.error('[useAlerts] Listener error:', err)
        setError('Failed to load alerts. Please try again.')
        setLoading(false)
      }
    )

    return () => {
      console.log('[useAlerts] Unsubscribing from listener')
      unsubscribe()
    }
  }, [options.tenantId, options.coachId, options.limit, refreshKey])

  // ─────────────────────────────────────────────────────────────────────────
  // Local Filtering
  // ─────────────────────────────────────────────────────────────────────────

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Source filter
      if (filters.source !== 'all' && alert.source !== filters.source) {
        return false
      }

      // Tier filter
      if (filters.tier !== 'all' && alert.tier !== parseInt(filters.tier)) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && alert.status !== filters.status) {
        return false
      }

      // PIR filter
      if (filters.pirId && alert.pirId !== filters.pirId) {
        return false
      }

      // Coach filter
      if (filters.coachId && alert.coachId !== filters.coachId) {
        return false
      }

      // Date range filtering
      if (filters.dateRange.start) {
        const alertDate = alert.createdAt?.toDate?.() || new Date()
        if (alertDate < filters.dateRange.start) {
          return false
        }
      }
      if (filters.dateRange.end) {
        const alertDate = alert.createdAt?.toDate?.() || new Date()
        if (alertDate > filters.dateRange.end) {
          return false
        }
      }

      // Search query (PIR name, keywords)
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase()
        const pirNameMatch = alert.pirName.toLowerCase().includes(searchLower)
        const keywordsMatch = alert.triggerKeywords.some((kw) =>
          kw.toLowerCase().includes(searchLower)
        )
        const contextMatch = alert.context.toLowerCase().includes(searchLower)

        if (!pirNameMatch && !keywordsMatch && !contextMatch) {
          return false
        }
      }

      return true
    })
  }, [alerts, filters])

  // ─────────────────────────────────────────────────────────────────────────
  // Statistics Calculation
  // ─────────────────────────────────────────────────────────────────────────

  const stats = useMemo<AlertStats>(() => {
    return {
      total: alerts.length,
      unread: alerts.filter((a) => a.status === 'unread').length,
      critical: alerts.filter((a) => a.tier === 1 && a.status !== 'resolved').length,
      high: alerts.filter((a) => a.tier === 2 && a.status !== 'resolved').length,
      acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
      bySource: {
        sos: alerts.filter((a) => a.source === 'sos').length,
        ai: alerts.filter((a) => a.source === 'ai').length,
        checkin: alerts.filter((a) => a.source === 'checkin').length,
      },
      byTier: {
        1: alerts.filter((a) => a.tier === 1).length,
        2: alerts.filter((a) => a.tier === 2).length,
        3: alerts.filter((a) => a.tier === 3).length,
        4: alerts.filter((a) => a.tier === 4).length,
      },
    }
  }, [alerts])

  // ─────────────────────────────────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (!adminUser) return

    try {
      const alertRef = doc(db, 'crisisAlerts', alertId)
      const userName = adminUser.displayName || adminUser.email || 'Unknown'

      const logEntry: ResponseLogEntry = {
        action: 'acknowledged',
        userId: adminUser.uid,
        userName,
        timestamp: Timestamp.now(),
      }

      await updateDoc(alertRef, {
        status: 'acknowledged',
        acknowledgedAt: serverTimestamp(),
        acknowledgedBy: adminUser.uid,
        responseLog: arrayUnion(logEntry),
        updatedAt: serverTimestamp(),
      })

      await logAudit('alert_acknowledged', {
        resourceId: alertId,
        resource: 'crisisAlerts',
      })

      console.log('[useAlerts] Alert acknowledged:', alertId)
    } catch (err) {
      console.error('[useAlerts] Failed to acknowledge alert:', err)
      throw err
    }
  }, [adminUser])

  const addResponseNote = useCallback(async (alertId: string, note: string) => {
    if (!adminUser || !note.trim()) return

    try {
      const alertRef = doc(db, 'crisisAlerts', alertId)
      const userName = adminUser.displayName || adminUser.email || 'Unknown'

      const logEntry: ResponseLogEntry = {
        action: 'note_added',
        userId: adminUser.uid,
        userName,
        timestamp: Timestamp.now(),
        note: note.trim(),
      }

      await updateDoc(alertRef, {
        status: 'responded',
        respondedAt: serverTimestamp(),
        respondedBy: adminUser.uid,
        responseNotes: note.trim(),
        responseLog: arrayUnion(logEntry),
        updatedAt: serverTimestamp(),
      })

      await logAudit('alert_response_added', {
        resourceId: alertId,
        resource: 'crisisAlerts',
        changes: { note: note.trim() },
      })

      console.log('[useAlerts] Response note added:', alertId)
    } catch (err) {
      console.error('[useAlerts] Failed to add response note:', err)
      throw err
    }
  }, [adminUser])

  const escalateAlert = useCallback(async (alertId: string, escalatedTo: string, note?: string) => {
    if (!adminUser) return

    try {
      const alertRef = doc(db, 'crisisAlerts', alertId)
      const userName = adminUser.displayName || adminUser.email || 'Unknown'

      const logEntry: ResponseLogEntry = {
        action: 'escalated',
        userId: adminUser.uid,
        userName,
        timestamp: Timestamp.now(),
        note: note || `Escalated to ${escalatedTo}`,
      }

      await updateDoc(alertRef, {
        status: 'escalated',
        escalatedAt: serverTimestamp(),
        escalatedTo,
        responseLog: arrayUnion(logEntry),
        updatedAt: serverTimestamp(),
      })

      await logAudit('alert_escalated', {
        resourceId: alertId,
        resource: 'crisisAlerts',
        changes: { escalatedTo },
      })

      console.log('[useAlerts] Alert escalated:', alertId)
    } catch (err) {
      console.error('[useAlerts] Failed to escalate alert:', err)
      throw err
    }
  }, [adminUser])

  const resolveAlert = useCallback(async (alertId: string, note?: string) => {
    if (!adminUser) return

    try {
      const alertRef = doc(db, 'crisisAlerts', alertId)
      const userName = adminUser.displayName || adminUser.email || 'Unknown'

      const logEntry: ResponseLogEntry = {
        action: 'resolved',
        userId: adminUser.uid,
        userName,
        timestamp: Timestamp.now(),
        note: note || 'Alert resolved',
      }

      await updateDoc(alertRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: adminUser.uid,
        responseLog: arrayUnion(logEntry),
        updatedAt: serverTimestamp(),
      })

      await logAudit('alert_resolved', {
        resourceId: alertId,
        resource: 'crisisAlerts',
      })

      console.log('[useAlerts] Alert resolved:', alertId)
    } catch (err) {
      console.error('[useAlerts] Failed to resolve alert:', err)
      throw err
    }
  }, [adminUser])

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    loading,
    error,
    filters,
    setFilters,
    stats,
    acknowledgeAlert,
    addResponseNote,
    escalateAlert,
    resolveAlert,
    refresh,
  }
}

export default useAlerts
