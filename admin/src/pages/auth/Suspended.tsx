import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone, RefreshCw, LogOut, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { auth, db, doc, getDoc } from "@/lib/firebase"

// ==========================================
// SUSPENDED PAGE
// ==========================================
// Phase 9: Final Migration - Auth Pages
// Features:
// - Clear suspension message display
// - Reason for suspension (if available)
// - Contact support information
// - "Check Status Again" button
// - Logout button
// - Mobile responsive

export function Suspended() {
  const navigate = useNavigate()
  const { firebaseUser, logout } = useAuth()

  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<"active" | "suspended" | null>(null)

  // Handle check status again
  const handleCheckStatus = async () => {
    if (!firebaseUser) {
      navigate("/login")
      return
    }

    setChecking(true)
    setCheckResult(null)

    try {
      // Re-fetch user document
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (!userDoc.exists()) {
        // User document doesn't exist, redirect to login
        await handleLogout()
        return
      }

      const userData = userDoc.data()

      // Check if status has changed
      if (userData.status !== "suspended" && userData.active !== false) {
        setCheckResult("active")
        // Wait a moment to show success, then redirect
        setTimeout(() => {
          navigate("/dashboard")
        }, 1500)
      } else {
        setCheckResult("suspended")
      }
    } catch (error) {
      console.error("Error checking status:", error)
      setCheckResult("suspended")
    } finally {
      setChecking(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      // Force sign out even on error
      await auth.signOut()
      navigate("/login")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-600 to-red-800 p-4">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Suspended Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl md:p-10">
          {/* Icon/Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 md:text-3xl">Account Suspended</h1>
            <p className="mt-2 text-muted-foreground">
              Your organization's GLRS account has been suspended.
              Access to all features has been temporarily disabled.
            </p>
          </div>

          {/* Check Status Result */}
          {checkResult === "active" && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Account Reactivated!</p>
                <p className="text-sm">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {checkResult === "suspended" && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Account Still Suspended</p>
                <p className="text-sm">Please contact support for assistance.</p>
              </div>
            </div>
          )}

          {/* What This Means */}
          <div className="mb-6 rounded-xl border-2 border-red-100 bg-red-50 p-5">
            <h3 className="mb-3 font-semibold text-red-700">What This Means:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                <span>All users in your organization cannot access the admin portal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                <span>PIR users cannot access the recovery app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                <span>All data is preserved and will be restored when account is reactivated</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                <span>No charges will be incurred during the suspension period</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="mb-6 rounded-xl border-2 border-blue-100 bg-blue-50 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
              <Mail className="h-4 w-4" />
              Contact Support
            </h3>
            <p className="mb-3 text-sm text-slate-600">
              To reactivate your account or discuss billing:
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">Email:</span>
                <a
                  href="mailto:tyler@glrecoveryservices.com"
                  className="text-primary hover:underline"
                >
                  tyler@glrecoveryservices.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium">Phone:</span>
                <a href="tel:+14159001234" className="text-primary hover:underline">
                  (415) 900-1234
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleCheckStatus}
              disabled={checking}
              variant="outline"
              className="flex-1"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status Again
                </>
              )}
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/70">
          Guiding Light Recovery Services
        </p>
      </div>
    </div>
  )
}

export default Suspended
