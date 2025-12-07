import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Activity,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  Shield,
  AlertTriangle,
  Loader2,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

interface LoginActivity {
  id: string
  timestamp: Date
  device: string
  browser: string
  location: string
  ipAddress?: string
  success: boolean
  sessionId?: string
}

interface ActiveSession {
  id: string
  device: string
  browser: string
  location: string
  lastActive: Date
  isCurrent: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

// Get device icon
const getDeviceIcon = (device: string) => {
  if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
    return Smartphone
  }
  return Monitor
}

// Parse user agent (simplified)
const parseUserAgent = (ua?: string): { device: string; browser: string } => {
  if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' }

  let device = 'Desktop'
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    if (/iphone/i.test(ua)) device = 'iPhone'
    else if (/ipad/i.test(ua)) device = 'iPad'
    else if (/android/i.test(ua)) device = 'Android'
    else device = 'Mobile'
  } else if (/macintosh|mac os/i.test(ua)) {
    device = 'Mac'
  } else if (/windows/i.test(ua)) {
    device = 'Windows'
  } else if (/linux/i.test(ua)) {
    device = 'Linux'
  }

  let browser = 'Unknown'
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/edg/i.test(ua)) browser = 'Edge'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'

  return { device, browser }
}

// =============================================================================
// COMPONENT
// =============================================================================

interface AccountActivityModalProps {
  onClose: () => void
}

export function AccountActivityModal({ onClose }: AccountActivityModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [loginHistory, setLoginHistory] = useState<LoginActivity[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [sessionToEnd, setSessionToEnd] = useState<string | null>(null)

  // Get extended user data
  const extendedUserData = userData as Record<string, unknown> | null
  const lastLogin = extendedUserData?.lastLoginAt as { toDate?: () => Date } | null

  // Load activity data
  useEffect(() => {
    const loadActivityData = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        // Load login history from activityLogs collection
        const logsQuery = query(
          collection(db, 'activityLogs'),
          where('userId', '==', user.uid),
          where('type', '==', 'login'),
          orderBy('timestamp', 'desc'),
          limit(20)
        )

        const logsSnap = await getDocs(logsQuery)
        const history: LoginActivity[] = []

        logsSnap.forEach((doc) => {
          const data = doc.data()
          const { device, browser } = parseUserAgent(data.userAgent)
          history.push({
            id: doc.id,
            timestamp: data.timestamp?.toDate() || new Date(),
            device,
            browser,
            location: data.location || 'Unknown',
            ipAddress: data.ipAddress,
            success: data.success !== false,
            sessionId: data.sessionId,
          })
        })

        setLoginHistory(history)

        // Load active sessions
        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('userId', '==', user.uid),
          where('active', '==', true),
          orderBy('lastActive', 'desc')
        )

        const sessionsSnap = await getDocs(sessionsQuery)
        const sessions: ActiveSession[] = []

        // Get current session ID from storage
        const currentSessionId = sessionStorage.getItem('sessionId')

        sessionsSnap.forEach((doc) => {
          const data = doc.data()
          const { device, browser } = parseUserAgent(data.userAgent)
          sessions.push({
            id: doc.id,
            device,
            browser,
            location: data.location || 'Unknown',
            lastActive: data.lastActive?.toDate() || new Date(),
            isCurrent: doc.id === currentSessionId,
          })
        })

        setActiveSessions(sessions)
      } catch (error) {
        console.error('[AccountActivityModal] Error loading activity:', error)
        // If collections don't exist, that's okay - show empty state
      } finally {
        setIsLoading(false)
      }
    }

    loadActivityData()
  }, [user?.uid])

  // End a specific session
  const handleEndSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId))
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId))
      setSessionToEnd(null)

      toast({
        title: 'Session Ended',
        description: 'The session has been terminated.',
      })
    } catch (error) {
      console.error('[AccountActivityModal] Error ending session:', error)
      toast({
        title: 'Error',
        description: 'Failed to end session. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Sign out all other sessions
  const handleSignOutAll = async () => {
    setIsSigningOut(true)
    try {
      const currentSessionId = sessionStorage.getItem('sessionId')

      // Delete all sessions except current
      const promises = activeSessions
        .filter((s) => !s.isCurrent && s.id !== currentSessionId)
        .map((s) => deleteDoc(doc(db, 'sessions', s.id)))

      await Promise.all(promises)

      setActiveSessions((prev) => prev.filter((s) => s.isCurrent))

      toast({
        title: 'Sessions Terminated',
        description: 'All other sessions have been signed out.',
      })
    } catch (error) {
      console.error('[AccountActivityModal] Error signing out sessions:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign out other sessions.',
        variant: 'destructive',
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Activity className="h-6 w-6" />
          Account Activity
        </DialogTitle>
        <DialogDescription className="text-amber-100">
          View your login history and manage active sessions.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-160px)]">
        <div className="p-6 space-y-6">
          {/* Current Session Info */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Current Session</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last login: {lastLogin?.toDate?.()?.toLocaleString() || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {navigator.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Monitor className="h-3.5 w-3.5" />
                      {parseUserAgent(navigator.userAgent).device}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Devices currently signed in to your account
                  </CardDescription>
                </div>
                {activeSessions.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-1" />
                            Sign Out All
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out All Other Sessions?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign out all other devices. You'll remain signed in on this device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleSignOutAll}
                        >
                          Sign Out All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active sessions found. You're signed in on this device only.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.device)
                    return (
                      <div
                        key={session.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border',
                          session.isCurrent && 'bg-green-50 border-green-200'
                        )}
                      >
                        <div className={cn(
                          'p-2 rounded-lg',
                          session.isCurrent ? 'bg-green-100' : 'bg-muted'
                        )}>
                          <DeviceIcon className={cn(
                            'h-5 w-5',
                            session.isCurrent ? 'text-green-600' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{session.device}</span>
                            <span className="text-sm text-muted-foreground">- {session.browser}</span>
                            {session.isCurrent && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(session.lastActive)}
                            </span>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <AlertDialog
                            open={sessionToEnd === session.id}
                            onOpenChange={(open) => !open && setSessionToEnd(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setSessionToEnd(session.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>End This Session?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will sign out the {session.device} device. They'll need to sign in again to access the account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleEndSession(session.id)}
                                >
                                  End Session
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Login History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Login History
              </CardTitle>
              <CardDescription>
                Recent sign-in activity on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="text-center py-6">
                  <History className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No login history available yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your login activity will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {loginHistory.map((login, index) => {
                    const DeviceIcon = getDeviceIcon(login.device)
                    return (
                      <div
                        key={login.id}
                        className={cn(
                          'flex items-center gap-3 py-3',
                          index < loginHistory.length - 1 && 'border-b'
                        )}
                      >
                        <div className={cn(
                          'p-1.5 rounded-full',
                          login.success ? 'bg-green-100' : 'bg-red-100'
                        )}>
                          {login.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{login.device}</span>
                            <span className="text-sm text-muted-foreground">- {login.browser}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>{login.timestamp.toLocaleString()}</span>
                            {login.location && login.location !== 'Unknown' && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {login.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={login.success ? 'secondary' : 'destructive'}
                          className={cn(
                            'text-xs',
                            login.success && 'bg-green-100 text-green-700'
                          )}
                        >
                          {login.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-amber-50/50 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-amber-800">Security Tip</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    If you see any unfamiliar devices or locations, sign out those sessions immediately
                    and change your password. Contact support if you suspect unauthorized access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </DialogContent>
  )
}

export default AccountActivityModal
