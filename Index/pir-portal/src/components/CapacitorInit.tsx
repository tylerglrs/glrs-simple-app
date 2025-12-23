/**
 * CapacitorInit Component
 *
 * Initializes Capacitor plugins when running as a native iOS app.
 * This component must be rendered at the app root level.
 *
 * Handles:
 * - StatusBar configuration (light style for teal backgrounds)
 * - Splash screen hiding
 * - Keyboard event listeners
 * - Back button handling
 * - App state change listeners
 */

import { useCapacitor } from '@/hooks/useCapacitor'

export function CapacitorInit() {
  // Initialize all Capacitor plugins and listeners
  useCapacitor()

  // This component renders nothing - it just runs the hook
  return null
}

export default CapacitorInit
