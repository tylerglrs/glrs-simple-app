/**
 * Capacitor Hook
 *
 * Handles iOS-native platform functionality including:
 * - Platform detection (native vs web)
 * - Keyboard handling
 * - Status bar configuration
 * - Back button handling
 * - App state listeners
 *
 * CRITICAL: Uses dynamic imports to avoid loading Capacitor plugins
 * before the Capacitor bridge is ready in the WebView.
 */

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseCapacitorReturn {
  /** Whether app is running as native iOS/Android */
  isNative: boolean
  /** Whether app is running on iOS specifically */
  isIOS: boolean
  /** Current keyboard height in pixels */
  keyboardHeight: number
  /** Whether keyboard is currently visible */
  keyboardVisible: boolean
  /** Hide the splash screen manually */
  hideSplash: () => Promise<void>
  /** Set status bar style */
  setStatusBarStyle: (style: 'light' | 'dark') => Promise<void>
}

/**
 * Safe check if Capacitor is available and initialized
 */
function isCapacitorReady(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.Capacitor !== undefined &&
    typeof window.Capacitor.isNativePlatform === 'function'
  )
}

export function useCapacitor(): UseCapacitorReturn {
  const [isNative, setIsNative] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const initialized = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Initialize Capacitor after component mounts
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initCapacitor = async () => {
      // Wait a tick to ensure Capacitor bridge is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!isCapacitorReady()) {
        console.log('[useCapacitor] Running in browser mode (Capacitor not available)')
        return
      }

      try {
        // Dynamic import of Capacitor core
        const { Capacitor } = await import('@capacitor/core')

        const native = Capacitor.isNativePlatform()
        const ios = Capacitor.getPlatform() === 'ios'

        setIsNative(native)
        setIsIOS(ios)

        if (!native) {
          console.log('[useCapacitor] Running in browser via Capacitor')
          return
        }

        console.log('[useCapacitor] Running as native app on', Capacitor.getPlatform())

        // Dynamic import plugins only when running natively
        const [
          { StatusBar, Style },
          { SplashScreen },
          { Keyboard },
          { App }
        ] = await Promise.all([
          import('@capacitor/status-bar'),
          import('@capacitor/splash-screen'),
          import('@capacitor/keyboard'),
          import('@capacitor/app')
        ])

        // Configure status bar for teal theme
        try {
          await StatusBar.setStyle({ style: Style.Light })
          if (ios) {
            await StatusBar.setBackgroundColor({ color: '#069494' })
          }
        } catch (e) {
          console.warn('[useCapacitor] StatusBar setup error:', e)
        }

        // Hide splash screen
        try {
          await SplashScreen.hide()
          console.log('[useCapacitor] Splash screen hidden')
        } catch (e) {
          console.warn('[useCapacitor] SplashScreen hide error:', e)
        }

        // Set up keyboard listeners
        const keyboardShowListener = await Keyboard.addListener(
          'keyboardWillShow',
          (info) => {
            setKeyboardHeight(info.keyboardHeight)
            setKeyboardVisible(true)
            document.documentElement.style.setProperty(
              '--keyboard-height',
              `${info.keyboardHeight}px`
            )
          }
        )

        const keyboardHideListener = await Keyboard.addListener(
          'keyboardWillHide',
          () => {
            setKeyboardHeight(0)
            setKeyboardVisible(false)
            document.documentElement.style.setProperty('--keyboard-height', '0px')
          }
        )

        // Handle back button
        const backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back()
          }
        })

        // Handle app state changes
        const appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
          console.log('[useCapacitor] App state changed, active:', isActive)
        })

        // Store cleanup function
        cleanupRef.current = () => {
          keyboardShowListener.remove()
          keyboardHideListener.remove()
          backButtonListener.remove()
          appStateListener.remove()
        }

      } catch (error) {
        console.warn('[useCapacitor] Initialization error:', error)
        // App continues to work in browser mode
      }
    }

    initCapacitor()

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  // Hide splash screen - uses dynamic import
  const hideSplash = useCallback(async () => {
    if (!isNative || !isCapacitorReady()) return

    try {
      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide()
    } catch (error) {
      console.warn('[useCapacitor] Failed to hide splash:', error)
    }
  }, [isNative])

  // Set status bar style - uses dynamic import
  const setStatusBarStyle = useCallback(async (style: 'light' | 'dark') => {
    if (!isNative || !isCapacitorReady()) return

    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      await StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark,
      })
    } catch (error) {
      console.warn('[useCapacitor] Failed to set status bar style:', error)
    }
  }, [isNative])

  return {
    isNative,
    isIOS,
    keyboardHeight,
    keyboardVisible,
    hideSplash,
    setStatusBarStyle,
  }
}

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean
      getPlatform: () => string
      triggerEvent?: (eventName: string, detail: unknown) => void
    }
  }
}

export default useCapacitor
