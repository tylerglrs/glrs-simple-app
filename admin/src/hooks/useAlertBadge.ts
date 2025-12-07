/**
 * useAlertBadge Hook
 * Phase 8E: Admin Crisis Dashboard
 *
 * Real-time listener for unread alert count to display in sidebar.
 * Provides badge count and pulse animation trigger for critical alerts.
 */

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db, CURRENT_TENANT } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

interface UseAlertBadgeReturn {
  /** Number of unread alerts */
  unreadCount: number
  /** Number of critical (tier 1) unread alerts */
  criticalCount: number
  /** Whether there are any critical alerts (for pulse animation) */
  hasCritical: boolean
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
}

interface UseAlertBadgeOptions {
  /** Tenant ID to filter by (defaults to CURRENT_TENANT) */
  tenantId?: string
  /** Coach ID for coach-scoped views (optional) */
  coachId?: string
}

export function useAlertBadge(options: UseAlertBadgeOptions = {}): UseAlertBadgeReturn {
  const { adminUser, getDataScope } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [criticalCount, setCriticalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminUser) {
      setLoading(false)
      return
    }

    const tenantId = options.tenantId || CURRENT_TENANT
    const scope = getDataScope()

    // Build query based on user's data scope
    let q = query(
      collection(db, 'crisisAlerts'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'unread')
    )

    // Apply coach scope if user is a coach
    if (scope === 'assigned_pirs' || options.coachId) {
      const coachId = options.coachId || adminUser.uid
      q = query(
        collection(db, 'crisisAlerts'),
        where('tenantId', '==', tenantId),
        where('coachId', '==', coachId),
        where('status', '==', 'unread')
      )
    }

    console.log('[useAlertBadge] Setting up real-time listener', {
      tenantId,
      scope,
      coachId: options.coachId || (scope === 'assigned_pirs' ? adminUser.uid : null),
    })

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const total = snapshot.size
        setUnreadCount(total)

        // Count critical alerts (tier 1)
        let criticals = 0
        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.tier === 1) {
            criticals++
          }
        })
        setCriticalCount(criticals)

        setLoading(false)
        setError(null)

        console.log('[useAlertBadge] Updated counts', {
          unread: total,
          critical: criticals,
        })
      },
      (err) => {
        console.error('[useAlertBadge] Listener error:', err)
        setError('Failed to load alert counts')
        setLoading(false)
      }
    )

    return () => {
      console.log('[useAlertBadge] Unsubscribing from listener')
      unsubscribe()
    }
  }, [adminUser, getDataScope, options.tenantId, options.coachId])

  return {
    unreadCount,
    criticalCount,
    hasCritical: criticalCount > 0,
    loading,
    error,
  }
}

export default useAlertBadge
