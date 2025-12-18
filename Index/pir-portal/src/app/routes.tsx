/**
 * Application Routes
 *
 * Simplified routing structure that uses state-based tab navigation
 * for the main app tabs, with React Router only for:
 * - Login page (public route)
 * - Onboarding flow (new users)
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

// Lazy loaded routes
const UserProfileView = lazy(
  () => import('@/features/profile/components/UserProfileView')
)

const InsightsPage = lazy(
  () => import('@/features/insights/InsightsPage')
)

const OnboardingFlow = lazy(
  () => import('@/features/onboarding/OnboardingFlow')
)

// =============================================================================
// ROUTE GUARDS
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

/**
 * Protected route guard
 * Redirects to login if user is not authenticated
 * Redirects to onboarding if onboarding is not complete (unless requireOnboarding=false)
 */
function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if onboarding is required and not completed
  // Only redirect if we have userData loaded and onboardingComplete is explicitly false or undefined
  if (requireOnboarding && userData && userData.onboardingComplete !== true) {
    return <Navigate to="/onboarding" replace />
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

/**
 * Onboarding route guard
 * Only accessible if authenticated AND onboarding not complete
 * Redirects to main app if onboarding is already complete
 */
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If onboarding is already complete, redirect to main app
  if (userData?.onboardingComplete === true) {
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
 * - /onboarding - Onboarding flow for new users
 * - / - Main app with TabContainer (state-based tab navigation)
 * - /profile/:userId - External user profile view (React Router)
 * - /insights - AI Insights premium experience
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

      {/* Onboarding route - for new users */}
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
              <OnboardingFlow />
            </Suspense>
          </OnboardingRoute>
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
