import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
import { auth, db, doc, getDoc, onAuthStateChanged, User } from "@/lib/firebase"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { AdminUser, UserRole, ROLE_HIERARCHY, DataScope, Permission } from "@/lib/permissions"
import { TwoFactorModal } from "@/components/TwoFactorModal"
import { clearTrustToken } from "@/hooks/use2FA"
import { useAdminSession } from "@/hooks/useSession"

// =============================================================================
// FEATURE FLAGS
// =============================================================================
// Temporarily disable 2FA until user base grows
// Set to true to re-enable 2FA enforcement
const FEATURES = {
  twoFactorAuth: false, // DISABLED - Will re-enable when user base grows
}

interface AuthContextType {
  // State
  firebaseUser: User | null
  adminUser: AdminUser | null
  loading: boolean
  error: string | null
  needs2FA: boolean
  verified2FA: boolean

  // Auth actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>

  // Permission helpers
  hasRole: (minRole: UserRole) => boolean
  hasPermission: (permission: Permission) => boolean
  isSuperAdmin: () => boolean
  isSuperAdmin1: () => boolean
  isAdmin: () => boolean
  isCoach: () => boolean
  canAccessPage: (page: string) => boolean
  canPerformAction: (action: string) => boolean
  getDataScope: () => DataScope
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin roles that require 2FA
const ADMIN_ROLES: UserRole[] = ["coach", "admin", "superadmin1", "superadmin"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needs2FA, setNeeds2FA] = useState(false)
  const [verified2FA, setVerified2FA] = useState(false)
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null)

  // Session management
  const { startSession, endSession } = useAdminSession()
  const sessionStartedRef = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      setError(null)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const userRole = userData.role || "pir"

            const userObj: AdminUser = {
              id: userDoc.id,
              uid: user.uid,
              email: user.email || "",
              displayName: userData.displayName,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userRole,
              tenantId: userData.tenantId || "full-service",
              permissions: userData.permissions,
              assignedCoach: userData.assignedCoach,
              active: userData.active,
            }

            // Check if this is an admin role that requires 2FA
            // FEATURE FLAG: Skip 2FA when disabled
            if (FEATURES.twoFactorAuth && ADMIN_ROLES.includes(userRole)) {
              // Store user in pending state until 2FA verified
              setPendingUser(userObj)
              setNeeds2FA(true)
              setVerified2FA(false)
              setAdminUser(null) // Don't set admin user until 2FA verified
            } else {
              // 2FA disabled OR non-admin user - skip 2FA
              setAdminUser(userObj)
              setNeeds2FA(false)
              setVerified2FA(true)

              // Start session immediately when 2FA is disabled
              if (!sessionStartedRef.current && firebaseUser) {
                sessionStartedRef.current = true
                startSession(firebaseUser.uid, userRole).catch(err => {
                  console.error("[Admin Auth] Failed to start session:", err)
                })
              }
            }
          } else {
            setError("User profile not found")
            setAdminUser(null)
            setPendingUser(null)
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
          setError("Failed to load user profile")
          setAdminUser(null)
          setPendingUser(null)
        }
      } else {
        setAdminUser(null)
        setPendingUser(null)
        setNeeds2FA(false)
        setVerified2FA(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error("Login error:", err)
      setError("Invalid email or password")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // End the session tracking
      await endSession()
      sessionStartedRef.current = false
      // Clear 2FA trust token on logout
      clearTrustToken()
      // Reset 2FA state
      setNeeds2FA(false)
      setVerified2FA(false)
      setPendingUser(null)
      await signOut(auth)
      console.log("[Admin Auth] User logged out successfully")
    } catch (err) {
      console.error("Logout error:", err)
      setError("Failed to sign out")
      throw err
    }
  }

  // Handle successful 2FA verification
  const handle2FASuccess = async () => {
    if (pendingUser && firebaseUser) {
      setAdminUser(pendingUser)
      setPendingUser(null)
      setNeeds2FA(false)
      setVerified2FA(true)
      console.log("[Admin Auth] 2FA verified successfully for:", pendingUser.email)

      // Start session tracking after successful 2FA
      if (!sessionStartedRef.current) {
        sessionStartedRef.current = true
        try {
          await startSession(firebaseUser.uid, pendingUser.role)
          console.log("[Admin Auth] Session started for:", pendingUser.email)
        } catch (err) {
          console.error("[Admin Auth] Failed to start session:", err)
        }
      }
    }
  }

  // Role hierarchy check - returns true if user has at least the minimum role level
  const hasRole = (minRole: UserRole): boolean => {
    if (!adminUser) return false
    const userLevel = ROLE_HIERARCHY[adminUser.role] || 0
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0
    return userLevel >= requiredLevel
  }

  // Specific role checks
  const isSuperAdmin = () => adminUser?.role === "superadmin"
  const isSuperAdmin1 = () => hasRole("superadmin1")
  const isAdmin = () => hasRole("admin")
  const isCoach = () => hasRole("coach")

  // Permission check with fallback to role-based defaults
  const hasPermission = (permission: Permission): boolean => {
    if (!adminUser) return false

    // Superadmin has all permissions
    if (adminUser.role === "superadmin") return true

    // Check explicit permissions first
    if (adminUser.permissions) {
      const value = adminUser.permissions[permission]
      if (typeof value === "boolean") return value
    }

    // Fall back to role-based defaults
    return getDefaultPermissionForRole(adminUser.role, permission)
  }

  // Page access check
  const canAccessPage = (page: string): boolean => {
    const permission = `access_${page}` as Permission
    return hasPermission(permission)
  }

  // Action permission check
  const canPerformAction = (action: string): boolean => {
    const permission = `action_${action}` as Permission
    return hasPermission(permission)
  }

  // Get user's data scope
  const getDataScope = (): DataScope => {
    if (!adminUser) return "own_data"

    if (adminUser.role === "superadmin") return "all_tenants"
    if (adminUser.role === "superadmin1") return "all_pirs_tenant"
    if (adminUser.role === "admin") return "all_pirs_tenant"
    if (adminUser.role === "coach") return "assigned_pirs"
    return "own_data"
  }

  const value: AuthContextType = {
    firebaseUser,
    adminUser,
    loading,
    error,
    needs2FA,
    verified2FA,
    login,
    logout,
    hasRole,
    hasPermission,
    isSuperAdmin,
    isSuperAdmin1,
    isAdmin,
    isCoach,
    canAccessPage,
    canPerformAction,
    getDataScope,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Mandatory 2FA Modal for Admin Users */}
      {needs2FA && pendingUser && firebaseUser && (
        <TwoFactorModal
          open={needs2FA}
          onSuccess={handle2FASuccess}
          userId={firebaseUser.uid}
          email={firebaseUser.email || ""}
          role={pendingUser.role}
        />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Default permissions based on role
function getDefaultPermissionForRole(role: UserRole, permission: Permission): boolean {
  const defaults: Record<UserRole, Permission[]> = {
    superadmin: [], // Has all permissions via explicit check
    superadmin1: [
      "access_dashboard",
      "access_users",
      "access_tasks",
      "access_guides",
      "access_communication",
      "access_meetings",
      "access_templates",
      "access_alerts",
      "access_logs",
      "access_settings",
      "action_create_pir",
      "action_edit_pir",
      "action_delete_pir",
      "action_create_coach",
      "action_edit_coach",
      "action_create_admin",
      "action_edit_admin",
      "action_create_resource",
      "action_edit_resource",
      "action_delete_resource",
      "action_view_analytics",
      "action_export_data",
      "action_manage_community",
      "action_send_broadcast",
    ],
    admin: [
      "access_dashboard",
      "access_users",
      "access_tasks",
      "access_guides",
      "access_communication",
      "access_meetings",
      "access_templates",
      "access_alerts",
      "action_create_pir",
      "action_edit_pir",
      "action_create_resource",
      "action_edit_resource",
      "action_view_analytics",
      "action_manage_community",
    ],
    coach: [
      "access_dashboard",
      "access_users",
      "access_tasks",
      "access_guides",
      "access_communication",
      "access_meetings",
      "action_edit_pir",
      "action_view_analytics",
    ],
    pir: [],
  }

  return defaults[role]?.includes(permission) || false
}

// Hook for protected routes
export function useRequireAuth(minRole?: UserRole) {
  const { adminUser, loading } = useAuth()

  const isAuthorized =
    !loading &&
    adminUser &&
    (minRole ? ROLE_HIERARCHY[adminUser.role] >= ROLE_HIERARCHY[minRole] : true)

  return {
    isAuthorized,
    loading,
    adminUser,
  }
}
