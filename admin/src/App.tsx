import { Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { AppLayout } from "@/components/layout"
import { Dashboard } from "@/pages/dashboard"
import { Users } from "@/pages/users"
import { Tasks } from "@/pages/tasks"
import { Guides } from "@/pages/guides"
import { Communication } from "@/pages/communication"
import { Meetings } from "@/pages/meetings"
import { Alerts } from "@/pages/alerts"
import { Logs } from "@/pages/logs"
import { Settings } from "@/pages/settings"
import { UserDetail } from "@/pages/userdetail"
import { Templates } from "@/pages/templates"
import { Login, Suspended } from "@/pages/auth"
import { Toaster } from "@/components/ui/sonner"

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-primary">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <p className="mt-4 text-white">Loading GLRS Admin...</p>
      </div>
    </div>
  )
}

function AccessDenied() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to access the admin portal.
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoutes() {
  const { firebaseUser, adminUser, loading, isCoach } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  // Not logged in - redirect to login
  if (!firebaseUser) {
    return <Navigate to="/login" replace />
  }

  // Logged in but not admin/coach - show access denied
  if (adminUser && !isCoach()) {
    return <AccessDenied />
  }

  // Authorized - render children
  return <Outlet />
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/suspended" element={<Suspended />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/communication" element={<Communication />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}
