/**
 * useStatusBarColor Hook
 *
 * Dynamically changes the iOS status bar background color to match modal headers.
 * Automatically restores to default teal (#069494) when modal closes.
 *
 * Features:
 * - Smart text color detection (light text on dark backgrounds, dark on light)
 * - Safe Capacitor platform detection
 * - Dynamic imports to avoid loading before Capacitor bridge is ready
 * - Automatic cleanup on unmount/close
 *
 * Usage:
 * ```tsx
 * function MyModal({ isOpen, onClose }) {
 *   useStatusBarColor('#058585', isOpen) // Teal header
 *   return <ResponsiveModal open={isOpen}>...</ResponsiveModal>
 * }
 * ```
 */

import { useEffect, useCallback, useRef } from 'react'

// Default status bar color (matches capacitor.config.ts)
const DEFAULT_STATUS_BAR_COLOR = '#069494'

/**
 * Safe check if Capacitor is available and initialized
 */
function isCapacitorReady(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.Capacitor !== undefined &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform()
  )
}

/**
 * Determines if a color is "dark" (needs light/white text) or "light" (needs dark text)
 * Uses relative luminance formula from WCAG 2.0
 */
function isColorDark(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Parse RGB values
  let r: number, g: number, b: number

  if (hex.length === 3) {
    // Short form #RGB
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    // Full form #RRGGBB
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  } else {
    // Invalid format, assume dark
    return true
  }

  // Calculate relative luminance
  // Formula: L = 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // If luminance < 0.5, color is dark and needs light text
  // If luminance >= 0.5, color is light and needs dark text
  return luminance < 0.5
}

/**
 * Sets the iOS status bar color and text style
 */
async function setStatusBarColor(hexColor: string): Promise<void> {
  if (!isCapacitorReady()) return

  try {
    // Dynamic import to avoid loading before Capacitor bridge is ready
    const { StatusBar, Style } = await import('@capacitor/status-bar')

    // Determine text style based on background brightness
    const isDark = isColorDark(hexColor)

    // Set background color
    await StatusBar.setBackgroundColor({ color: hexColor })

    // Set text style (Light = white text, Dark = black text)
    await StatusBar.setStyle({
      style: isDark ? Style.Light : Style.Dark,
    })
  } catch (error) {
    // Silently fail - app continues working in browser mode
    console.warn('[useStatusBarColor] Failed to set status bar color:', error)
  }
}

/**
 * Hook to manage status bar color for modals
 *
 * @param color - Hex color to set when modal is open (e.g., '#058585')
 * @param isOpen - Whether the modal is currently open
 */
export function useStatusBarColor(color: string | undefined, isOpen: boolean = true): void {
  // Track if we've set a custom color (for cleanup)
  const hasSetColor = useRef(false)

  // Restore default color function
  const restoreDefault = useCallback(async () => {
    if (hasSetColor.current) {
      await setStatusBarColor(DEFAULT_STATUS_BAR_COLOR)
      hasSetColor.current = false
    }
  }, [])

  useEffect(() => {
    // Only proceed if we have a color and modal is open
    if (!color || !isOpen) {
      // If modal closed and we had set a color, restore default
      if (hasSetColor.current) {
        restoreDefault()
      }
      return
    }

    // Set the custom color
    const applyColor = async () => {
      await setStatusBarColor(color)
      hasSetColor.current = true
    }

    applyColor()

    // Cleanup: restore default when modal closes or component unmounts
    return () => {
      restoreDefault()
    }
  }, [color, isOpen, restoreDefault])
}

/**
 * Utility to get default status bar color
 */
export function getDefaultStatusBarColor(): string {
  return DEFAULT_STATUS_BAR_COLOR
}

/**
 * Utility to manually set status bar color (for edge cases)
 */
export async function setStatusBar(color: string): Promise<void> {
  await setStatusBarColor(color)
}

/**
 * Utility to reset status bar to default
 */
export async function resetStatusBar(): Promise<void> {
  await setStatusBarColor(DEFAULT_STATUS_BAR_COLOR)
}

export default useStatusBarColor
