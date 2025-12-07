import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type User,
} from '@/lib/firebase'
import type { UserData } from '@/types/firebase'

interface AuthContextType {
  // Auth state
  user: User | null
  userData: UserData | null
  loading: boolean
  error: string | null

  // Auth methods
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>

  // Helper methods
  isAuthenticated: boolean
  isPIR: boolean
  isCoach: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserData({
              id: userDoc.id,
              ...data,
            } as UserData)

            // Update last activity
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastActivity: serverTimestamp(),
            }).catch(console.error)
          } else {
            // User exists in Auth but not in Firestore
            console.warn('User document not found in Firestore')
            setUserData(null)
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
          setUserData(null)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }

      // Map Firebase error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
      }

      const errorMessage =
        errorMessages[firebaseError.code || ''] ||
        firebaseError.message ||
        'An error occurred during sign in.'

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const logOut = async () => {
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
      setUserData(null)
    } catch (err: unknown) {
      const firebaseError = err as { message?: string }
      setError(firebaseError.message || 'Failed to sign out.')
      throw err
    }
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }

      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/invalid-email': 'Please enter a valid email address.',
      }

      const errorMessage =
        errorMessages[firebaseError.code || ''] ||
        firebaseError.message ||
        'Failed to send password reset email.'

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Computed values
  const isAuthenticated = !!user && !!userData
  const isPIR = userData?.role === 'pir'
  const isCoach = userData?.role === 'coach'
  const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin'

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signIn,
    logOut,
    resetPassword,
    isAuthenticated,
    isPIR,
    isCoach,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// Export types
export type { AuthContextType }
