/**
 * Application Routes
 *
 * Simplified routing structure that uses state-based tab navigation
 * for the main app tabs, with React Router only for:
 * - Login page (public route)
 * - External profile view (/profile/:userId)
 *
 * The main app uses TabContainer which keeps all tabs mounted and
 * toggles visibility, enabling instant tab switching.
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { LoginPage } from '@/features/auth/components/LoginPage'

// External profile view - still uses React Router for deep linking
const UserProfileView = lazy(
  () => import('@/features/profile/components/UserProfileView')
)

// AI Insights page - dedicated route for premium AI insights experience
const InsightsPage = lazy(
  () => import('@/features/insights/InsightsPage')
)

// =============================================================================
// ROUTE GUARDS
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Protected route guard
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

interface PublicRouteProps {
  children: React.ReactNode
}

/**
 * Public route guard
 * Redirects to main app if user is already authenticated
 */
function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  // If user is already logged in, redirect to main app
  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// =============================================================================
// APP ROUTES
// =============================================================================

/**
 * Main application routes
 *
 * Route structure:
 * - /login - Public login page
 * - / - Main app with TabContainer (state-based tab navigation)
 * - /profile/:userId - External user profile view (React Router)
 * - /* - Catch-all redirect to main app
 *
 * Tab navigation within the main app uses hash-based URLs:
 * - /#tasks, /#journey, /#community, etc.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* External profile view - uses React Router for :userId param */}
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <MainLayout showTabs={false}>
              <Suspense fallback={<LoadingSpinner text="Loading profile..." />}>
                <UserProfileView />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* AI Insights page - dedicated premium insights experience */}
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading insights..." />}>
              <InsightsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Main app - single route with TabContainer */}
      {/* Tab switching is handled by TabContext, not routing */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />

      {/* Legacy route redirects - redirect old paths to hash-based */}
      <Route path="/tasks/*" element={<Navigate to="/#tasks" replace />} />
      <Route path="/journey/*" element={<Navigate to="/#journey" replace />} />
      <Route path="/meetings/*" element={<Navigate to="/#meetings" replace />} />
      <Route
        path="/community/*"
        element={<Navigate to="/#community" replace />}
      />
      <Route
        path="/resources/*"
        element={<Navigate to="/#resources" replace />}
      />
      <Route path="/messages/*" element={<Navigate to="/#messages" replace />} />
      <Route path="/profile" element={<Navigate to="/#profile" replace />} />

      {/* Catch-all redirect to main app */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
