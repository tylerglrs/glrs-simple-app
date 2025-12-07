import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { ModalProvider } from '@/components/ModalProvider'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Root providers for the application
 *
 * Provider order (outermost to innermost):
 * 1. QueryClientProvider - Data caching layer (must be outside AuthProvider so auth-dependent queries work)
 * 2. AuthProvider - Authentication state
 * 3. Children (app content)
 * 4. ModalProvider - Global modal rendering
 * 5. Toaster - Toast notifications
 * 6. ReactQueryDevtools - Development tools (dev only)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ModalProvider />
        <Toaster />
      </AuthProvider>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
