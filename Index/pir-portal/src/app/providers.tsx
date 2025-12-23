import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { ModalProvider } from '@/components/ModalProvider'
import { SessionWrapper } from '@/components/SessionWrapper'
import { CoachMarkProvider } from '@/components/common/CoachMarkProvider'
import { CapacitorInit } from '@/components/CapacitorInit'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Root providers for the application
 *
 * Provider order (outermost to innermost):
 * 1. QueryClientProvider - Data caching layer (must be outside AuthProvider so auth-dependent queries work)
 * 2. AuthProvider - Authentication state
 * 3. SessionWrapper - Session management with timeout warning
 * 4. CoachMarkProvider - Progressive feature discovery coach marks
 * 5. Children (app content)
 * 6. ModalProvider - Global modal rendering
 * 7. Toaster - Toast notifications
 * 8. ReactQueryDevtools - Development tools (dev only)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Initialize Capacitor plugins (StatusBar, Keyboard, etc.) when running as native app */}
      <CapacitorInit />
      <AuthProvider>
        <SessionWrapper>
          <CoachMarkProvider>
            {children}
            <ModalProvider />
            <Toaster />
          </CoachMarkProvider>
        </SessionWrapper>
      </AuthProvider>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
