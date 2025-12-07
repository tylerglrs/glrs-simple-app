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
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Database,
  Trash2,
  RefreshCw,
  Shield,
  Clock,
  Download,
  Info,
  AlertTriangle,
  Loader2,
  HardDrive,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useModalStore } from '@/stores/modalStore'

// =============================================================================
// TYPES
// =============================================================================

interface StorageInfo {
  localStorage: number
  sessionStorage: number
  total: number
}

// =============================================================================
// COMPONENT
// =============================================================================

interface DataManagementModalProps {
  onClose: () => void
}

export function DataManagementModal({ onClose }: DataManagementModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const { openModal } = useModalStore()

  // State
  const [isClearing, setIsClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    localStorage: 0,
    sessionStorage: 0,
    total: 0,
  })

  // Calculate storage usage
  useEffect(() => {
    const calculateStorage = () => {
      let localSize = 0
      let sessionSize = 0

      // Calculate localStorage size
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ''
          localSize += key.length + value.length
        }
      }

      // Calculate sessionStorage size
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          const value = sessionStorage.getItem(key) || ''
          sessionSize += key.length + value.length
        }
      }

      setStorageInfo({
        localStorage: localSize,
        sessionStorage: sessionSize,
        total: localSize + sessionSize,
      })
    }

    calculateStorage()
  }, [])

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Clear cache and logout
  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      // Clear localStorage
      localStorage.clear()

      // Clear sessionStorage
      sessionStorage.clear()

      // Sign out user
      await signOut(auth)

      toast({
        title: 'Cache Cleared',
        description: 'All cached data has been cleared. Redirecting to login...',
      })

      // Close modal and redirect
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('[DataManagementModal] Error clearing cache:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear cache. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsClearing(false)
      setShowClearConfirm(false)
    }
  }

  // Open export modal
  const handleOpenExport = () => {
    onClose()
    openModal('exportData')
  }

  // Get user data from extended userData
  const extendedUserData = userData as Record<string, unknown> | null
  const createdAt = extendedUserData?.createdAt as { toDate?: () => Date } | null
  const accountCreated = createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[560px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Database className="h-6 w-6" />
          Data Management
        </DialogTitle>
        <DialogDescription className="text-gray-300">
          Manage your cached data and understand how your data is stored.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-160px)]">
        <div className="p-6 space-y-6">
          {/* Storage Usage Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                Local Storage Usage
              </CardTitle>
              <CardDescription>
                Data stored in your browser for this app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">LocalStorage</span>
                  <span className="text-sm font-medium">{formatBytes(storageInfo.localStorage)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SessionStorage</span>
                  <span className="text-sm font-medium">{formatBytes(storageInfo.sessionStorage)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-bold text-teal-600">{formatBytes(storageInfo.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Check-ins</div>
                    <div className="text-xs text-muted-foreground">Retained for 3 years or until account deletion</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Messages</div>
                    <div className="text-xs text-muted-foreground">Retained for 2 years or until account deletion</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Goals & Progress</div>
                    <div className="text-xs text-muted-foreground">Retained indefinitely while account is active</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Community Posts</div>
                    <div className="text-xs text-muted-foreground">Retained for 1 year or until manually deleted</div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your data is stored securely and encrypted. You can request a full copy of your data
                  at any time using the Export feature.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Created</span>
                <span className="text-sm font-medium">{accountCreated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-xs font-mono text-muted-foreground">{user?.uid?.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email Verified</span>
                <span className={cn(
                  'text-sm font-medium',
                  user?.emailVerified ? 'text-green-600' : 'text-amber-600'
                )}>
                  {user?.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card className="border-teal-200 bg-teal-50/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Download className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download all your recovery data in JSON format. GDPR compliant.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-teal-300 hover:bg-teal-100"
                    onClick={handleOpenExport}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Open Export Tool
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clear Cache */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Clear Cache</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clear all locally cached data. This will log you out and you'll need to sign in again.
                  </p>

                  <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        disabled={isClearing}
                      >
                        {isClearing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Cache & Logout
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          Clear Cache?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will clear all locally cached data and log you out. You'll need to sign
                          in again to use the app. Your account data stored in the cloud will not be
                          affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleClearCache}
                        >
                          Clear & Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </DialogContent>
  )
}

export default DataManagementModal
