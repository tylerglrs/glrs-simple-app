/**
 * Insight Actions - Action routing for AI Pattern Insights
 * Project Lighthouse: AI Pattern Insights Redesign
 *
 * Routes insight actions to appropriate features:
 * - technique: Opens coping technique modal
 * - journal: Opens evening reflection modal
 * - meeting: Navigates to Meetings tab
 * - post: Navigates to Community tab
 */

import { useModalStore } from '@/stores/modalStore'
import type { ActionType } from '@/hooks/useAIPatternInsights'

// =============================================================================
// TYPES
// =============================================================================

export interface InsightAction {
  type: ActionType
  id: string | null
  insightId: string
}

export interface ActionResult {
  success: boolean
  message?: string
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

/**
 * Open a coping technique modal with the specified technique
 */
export function openTechniqueAction(techniqueId: string | null): ActionResult {
  const { openModal } = useModalStore.getState()

  if (!techniqueId) {
    // Open the general coping technique modal (today's technique)
    openModal('copingTechnique')
    return { success: true }
  }

  // Open with specific technique ID
  openModal('copingTechnique', { techniqueId })
  return { success: true }
}

/**
 * Open the evening reflection modal for journaling
 */
export function openJournalAction(): ActionResult {
  const { openModal } = useModalStore.getState()

  // Open evening reflection modal
  openModal('eveningReflection')
  return { success: true }
}

/**
 * Navigate to the Meetings tab
 * This uses the app's navigation system
 */
export function openMeetingAction(): ActionResult {
  // Use window event to communicate with the app shell
  window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: { tab: 'meetings' } }))
  return { success: true, message: 'Navigating to Meetings...' }
}

/**
 * Navigate to the Community tab
 */
export function openPostAction(): ActionResult {
  // Navigate to Community tab
  window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: { tab: 'community' } }))
  return { success: true, message: 'Navigating to Community...' }
}

// =============================================================================
// MAIN ACTION EXECUTOR
// =============================================================================

/**
 * Execute an insight action based on its type
 */
export function executeInsightAction(action: InsightAction): ActionResult {
  console.log('[InsightActions] Executing action:', action)

  switch (action.type) {
    case 'technique':
      return openTechniqueAction(action.id)

    case 'journal':
      return openJournalAction()

    case 'meeting':
      return openMeetingAction()

    case 'post':
      return openPostAction()

    case 'none':
      return { success: true, message: 'No action required' }

    default:
      console.warn('[InsightActions] Unknown action type:', action.type)
      return { success: false, message: 'Unknown action type' }
  }
}

// =============================================================================
// REACT HOOK FOR ACTIONS
// =============================================================================

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useInsightActions() {
  const { openModal, closeModal } = useModalStore()
  const navigate = useNavigate()

  const handleAction = useCallback((action: InsightAction) => {
    // Close the current modal first
    closeModal()

    switch (action.type) {
      case 'technique':
        // Small delay to let modal close animation complete
        setTimeout(() => {
          openModal('copingTechnique', action.id ? { techniqueId: action.id } : undefined)
        }, 200)
        break

      case 'journal':
        setTimeout(() => {
          openModal('eveningReflection')
        }, 200)
        break

      case 'meeting':
        // Navigate to meetings tab
        navigate('/meetings')
        break

      case 'post':
        // Navigate to community
        navigate('/community')
        break

      case 'none':
        // Just close the modal, no action needed
        break

      default:
        console.warn('[useInsightActions] Unknown action type:', action.type)
    }
  }, [openModal, closeModal, navigate])

  return { handleAction }
}

export default executeInsightAction
