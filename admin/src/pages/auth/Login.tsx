import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Loader2, Mail, Lock, AlertTriangle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { auth, db, doc, getDoc } from "@/lib/firebase"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { FirebaseError } from "firebase/app"

// ==========================================
// LOGIN PAGE
// ==========================================
// Phase 9: Final Migration - Auth Pages
// Features:
// - Email/password login with show/hide toggle
// - Firebase Auth error handling for all error types
// - Password reset modal
// - Google Sign-In button (prepared, can be disabled)
// - Post-login flow checking user status
// - Mobile responsive

export function Login() {
  const navigate = useNavigate()
  const { firebaseUser, loading: authLoading } = useAuth()

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Password reset state
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState("")

  // If already logged in, redirect to dashboard
  if (!authLoading && firebaseUser) {
    return <Navigate to="/dashboard" replace />
  }

  // Map Firebase error codes to user-friendly messages
  const getErrorMessage = (error: FirebaseError): string => {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email"
      case "auth/wrong-password":
        return "Incorrect password"
      case "auth/invalid-email":
        return "Invalid email address"
      case "auth/user-disabled":
        return "This account has been disabled"
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later"
      case "auth/network-request-failed":
        return "Network error. Check your connection"
      case "auth/invalid-credential":
        return "Invalid email or password"
      default:
        return error.message || "An error occurred during login"
    }
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check user document in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        setError("User profile not found. Please contact support.")
        await auth.signOut()
        setLoading(false)
        return
      }

      const userData = userDoc.data()

      // Check user status
      if (userData.status === "suspended") {
        // Redirect to suspended page
        navigate("/suspended")
        return
      }

      if (userData.active === false) {
        setError("Your account is inactive. Please contact support.")
        await auth.signOut()
        setLoading(false)
        return
      }

      // Check if user has admin/coach role
      const allowedRoles = ["superadmin", "superadmin1", "admin", "coach"]
      if (!allowedRoles.includes(userData.role)) {
        setError("You do not have admin access. Please contact your administrator.")
        await auth.signOut()
        setLoading(false)
        return
      }

      // Success - navigate to dashboard
      navigate("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
      if (err instanceof FirebaseError) {
        // Check for disabled account - redirect to suspended
        if (err.code === "auth/user-disabled") {
          navigate("/suspended")
          return
        }
        setError(getErrorMessage(err))
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetLoading(true)

    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setResetSuccess(true)
    } catch (err) {
      console.error("Password reset error:", err)
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setResetError("No account found with this email")
            break
          case "auth/invalid-email":
            setResetError("Invalid email address")
            break
          default:
            setResetError("Failed to send reset email. Please try again.")
        }
      } else {
        setResetError("An unexpected error occurred")
      }
    } finally {
      setResetLoading(false)
    }
  }

  // Close reset modal and reset state
  const closeResetModal = () => {
    setResetModalOpen(false)
    setResetEmail("")
    setResetSuccess(false)
    setResetError("")
  }

  // Handle Google Sign-In (prepared for future)
  const handleGoogleSignIn = () => {
    // TODO: Enable when Google Sign-In is verified
    // const provider = new GoogleAuthProvider()
    // await signInWithPopup(auth, provider)
    alert("Google Sign-In coming soon")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-teal-600 p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl md:p-10">
          {/* Logo/Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-600">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              GLRS Administration Portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email)
                  setResetModalOpen(true)
                }}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-4 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Google Sign-In Button (disabled until verified) */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={true} // Enable when Google OAuth is configured
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Back to Main App
            </a>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Dialog open={resetModalOpen} onOpenChange={closeResetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          {resetSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent password reset instructions to <strong>{resetEmail}</strong>
              </p>
              <Button onClick={closeResetModal} className="mt-6">
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <div className="space-y-4 py-4">
                {resetError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={resetLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeResetModal}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Login
