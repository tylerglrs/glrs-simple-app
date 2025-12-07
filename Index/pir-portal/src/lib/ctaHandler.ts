/**
 * CTA Handler - Unified utility for handling AI-generated CTA clicks
 * Phase 6.4: UI Updates
 *
 * Handles all CTA button clicks from AI-generated content:
 * - navigate: Navigate to a tab/page with optional scroll
 * - modal: Open a modal dialog with data
 * - external: Open external URL/app (tel:, sms:, http:)
 * - function: Call a registered handler function
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export type CTAActionType = 'navigate' | 'modal' | 'external' | 'function'

export interface CTAAction {
  id: string
  label: string
  shortLabel?: string
  action: CTAActionType
  target?: string
  scroll?: string
  modal?: string
  modalData?: Record<string, unknown>
  handler?: string
  icon?: string
  contexts?: string[]
  priority?: 'critical' | 'high' | 'medium' | 'low'
  limit?: number
}

export interface CTAClickEvent {
  ctaId: string
  action: CTAActionType
  target?: string
  source: string
  timestamp: Date
}

// =============================================================================
// MODAL EVENT SYSTEM
// =============================================================================

/**
 * Custom event for opening modals from anywhere in the app
 * Components can listen for 'openModal' events to show modals
 */
export function dispatchOpenModal(modalName: string, data?: Record<string, unknown>) {
  const event = new CustomEvent('openModal', {
    detail: { modal: modalName, data },
    bubbles: true,
  })
  window.dispatchEvent(event)
}

/**
 * Hook to listen for openModal events
 */
export function useModalListener(callback: (modal: string, data?: Record<string, unknown>) => void) {
  const handler = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<{ modal: string; data?: Record<string, unknown> }>
      callback(customEvent.detail.modal, customEvent.detail.data)
    },
    [callback]
  )

  return { handler }
}

// =============================================================================
// NAVIGATION ROUTES
// =============================================================================

const ROUTE_MAP: Record<string, string> = {
  '/tasks': '/tasks',
  '/journey': '/journey',
  '/community': '/community',
  '/meetings': '/meetings',
  '/messages': '/messages',
  '/resources': '/resources',
  '/profile': '/profile',
  '/guides': '/resources',
}

// Scroll targets within pages
const SCROLL_TARGETS: Record<string, string> = {
  'checkin-section': 'checkin-section',
  'reflection-section': 'reflection-section',
  'habit-tracker': 'habit-tracker',
  'golden-thread': 'golden-thread',
  'ai-insights': 'ai-insights',
  'crisis-toolkit': 'crisis-toolkit',
  'calendar-heatmap': 'calendar-heatmap',
  'my-day': 'my-day',
}

// =============================================================================
// REGISTERED HANDLERS
// =============================================================================

type HandlerFunction = () => void | Promise<void>

const registeredHandlers: Record<string, HandlerFunction> = {}

/**
 * Register a handler function that can be called by CTAs
 */
export function registerCTAHandler(name: string, handler: HandlerFunction) {
  registeredHandlers[name] = handler
}

/**
 * Unregister a handler function
 */
export function unregisterCTAHandler(name: string) {
  delete registeredHandlers[name]
}

// =============================================================================
// ANALYTICS TRACKING
// =============================================================================

async function trackCTAClick(
  userId: string | undefined,
  ctaId: string,
  action: CTAActionType,
  target: string | undefined,
  source: string
) {
  if (!userId) return

  try {
    const analyticsRef = collection(db, 'users', userId, 'ctaClicks')
    await addDoc(analyticsRef, {
      ctaId,
      action,
      target,
      source,
      clickedAt: Timestamp.now(),
    })
  } catch (err) {
    console.warn('[ctaHandler] Failed to track CTA click:', err)
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export interface UseCTAHandlerOptions {
  userId?: string
  source: string
  onModalOpen?: (modal: string, data?: Record<string, unknown>) => void
  onNavigate?: (path: string) => void
}

export function useCTAHandler(options: UseCTAHandlerOptions) {
  const { userId, source, onModalOpen, onNavigate } = options
  const navigate = useNavigate()

  const handleCTA = useCallback(
    async (cta: CTAAction) => {
      // Haptic feedback
      haptics.tap()

      // Track the click
      trackCTAClick(userId, cta.id, cta.action, cta.target, source)

      switch (cta.action) {
        case 'navigate': {
          const route = cta.target ? ROUTE_MAP[cta.target] || cta.target : '/'

          // Navigate to the route
          if (onNavigate) {
            onNavigate(route)
          } else {
            navigate(route)
          }

          // Scroll to target element after navigation
          if (cta.scroll) {
            const scrollTarget = SCROLL_TARGETS[cta.scroll] || cta.scroll
            setTimeout(() => {
              const element = document.getElementById(scrollTarget)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }, 300)
          }
          break
        }

        case 'modal': {
          if (cta.modal) {
            if (onModalOpen) {
              onModalOpen(cta.modal, cta.modalData)
            } else {
              dispatchOpenModal(cta.modal, cta.modalData)
            }
          }
          break
        }

        case 'external': {
          if (cta.target) {
            // Handle different external link types
            if (cta.target.startsWith('tel:') || cta.target.startsWith('sms:')) {
              window.location.href = cta.target
            } else if (cta.target.startsWith('http')) {
              window.open(cta.target, '_blank', 'noopener,noreferrer')
            } else {
              window.location.href = cta.target
            }
          }
          break
        }

        case 'function': {
          if (cta.handler && registeredHandlers[cta.handler]) {
            await registeredHandlers[cta.handler]()
          } else {
            console.warn(`[ctaHandler] Unknown handler: ${cta.handler}`)
          }
          break
        }
      }
    },
    [userId, source, navigate, onModalOpen, onNavigate]
  )

  return { handleCTA }
}

// =============================================================================
// HELPER: CREATE CTA FROM LIBRARY
// =============================================================================

/**
 * Create a CTA action from the CTA library ID
 * This is a helper for components that receive CTA IDs from Firestore
 */
export function createCTAFromId(ctaId: string, ctaLibrary: CTAAction[]): CTAAction | null {
  return ctaLibrary.find((cta) => cta.id === ctaId) || null
}

// =============================================================================
// TECHNIQUE MODAL HELPER
// =============================================================================

/**
 * Open a technique detail modal
 */
export function openTechniqueModal(techniqueId: string) {
  dispatchOpenModal('technique-detail', { techniqueId })
}

// =============================================================================
// COMMON CTAs (Pre-defined for easy use)
// =============================================================================

export const COMMON_CTAS: Record<string, CTAAction> = {
  logCheckIn: {
    id: 'log-morning-checkin',
    label: 'Log Check-in',
    shortLabel: 'Check In',
    action: 'navigate',
    target: '/tasks',
    scroll: 'checkin-section',
    icon: 'clipboard-check',
    priority: 'high',
  },
  startReflection: {
    id: 'log-evening-reflection',
    label: 'Start Reflection',
    shortLabel: 'Reflect',
    action: 'navigate',
    target: '/tasks',
    scroll: 'reflection-section',
    icon: 'moon',
    priority: 'high',
  },
  findMeeting: {
    id: 'browse-meetings',
    label: 'Find a Meeting',
    shortLabel: 'Meetings',
    action: 'navigate',
    target: '/meetings',
    icon: 'calendar',
    priority: 'high',
  },
  messageCoach: {
    id: 'message-coach',
    label: 'Message Coach',
    shortLabel: 'Coach',
    action: 'navigate',
    target: '/messages',
    icon: 'message-circle',
    priority: 'high',
  },
  crisisToolkit: {
    id: 'open-crisis-toolkit',
    label: 'Crisis Toolkit',
    shortLabel: 'SOS',
    action: 'navigate',
    target: '/resources',
    scroll: 'crisis-toolkit',
    icon: 'alert-circle',
    priority: 'critical',
  },
  call988: {
    id: 'call-988',
    label: 'Call 988 Now',
    shortLabel: '988',
    action: 'external',
    target: 'tel:988',
    icon: 'phone',
    priority: 'critical',
  },
  textCrisisLine: {
    id: 'text-crisis-line',
    label: 'Text HOME to 741741',
    shortLabel: 'Text Help',
    action: 'external',
    target: 'sms:741741&body=HOME',
    icon: 'message-square',
    priority: 'critical',
  },
  viewJourney: {
    id: 'view-journey',
    label: 'View Your Journey',
    shortLabel: 'Journey',
    action: 'navigate',
    target: '/journey',
    icon: 'map',
    priority: 'medium',
  },
  openHabits: {
    id: 'open-habit-tracker',
    label: 'Open Habits',
    shortLabel: 'Habits',
    action: 'navigate',
    target: '/tasks',
    scroll: 'habit-tracker',
    icon: 'check-square',
    priority: 'medium',
  },
  viewGoals: {
    id: 'view-goals',
    label: 'Review Goals',
    shortLabel: 'Goals',
    action: 'navigate',
    target: '/tasks',
    scroll: 'golden-thread',
    icon: 'target',
    priority: 'medium',
  },
}

export default useCTAHandler
