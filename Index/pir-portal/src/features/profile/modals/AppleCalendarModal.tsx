import { useState, useEffect } from 'react'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db, functions } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  Calendar,
  CheckCircle,
  CalendarOff,
  Mail,
  Key,
  Eye,
  EyeOff,
  Info,
  ChevronDown,
  ChevronUp,
  XCircle,
  Link,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// =============================================================================
// TYPES
// =============================================================================

interface AppleCalendarData {
  connected?: boolean
  connectedAt?: { seconds: number }
  appleId?: string
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const appleCalendarSchema = z.object({
  appleId: z.string().email('Please enter a valid Apple ID email address'),
  appPassword: z
    .string()
    .min(1, 'App-specific password is required')
    .regex(/^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z]{4}$/, 'Password should be in format: xxxx-xxxx-xxxx-xxxx'),
})

type AppleCalendarFormValues = z.infer<typeof appleCalendarSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface AppleCalendarModalProps {
  onClose: () => void
}

export function AppleCalendarModal({ onClose }: AppleCalendarModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // Get extended user data
  const extendedUserData = userData as unknown as Record<string, unknown> | null
  const appleCalendar = extendedUserData?.appleCalendar as AppleCalendarData | undefined

  // Connection state
  const isConnected = appleCalendar?.connected || false
  const connectedAt = appleCalendar?.connectedAt
  const connectedAppleId = appleCalendar?.appleId

  // UI state
  const [connecting, setConnecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [error, setError] = useState('')

  // Form
  const form = useForm<AppleCalendarFormValues>({
    resolver: zodResolver(appleCalendarSchema),
    defaultValues: {
      appleId: connectedAppleId || '',
      appPassword: '',
    },
  })

  // Update form when userData changes
  useEffect(() => {
    if (connectedAppleId) {
      form.setValue('appleId', connectedAppleId)
    }
  }, [connectedAppleId, form])

  // Connect handler
  const handleConnect = async (values: AppleCalendarFormValues) => {
    if (!user?.uid) {
      setError('Authentication error. Please refresh the page and try again.')
      return
    }

    setConnecting(true)
    setError('')

    try {
      const connectAppleCalendar = httpsCallable(functions, 'connectAppleCalendar')
      const result = await connectAppleCalendar({
        appleId: values.appleId,
        appPassword: values.appPassword,
        userId: user.uid,
      })

      const data = result.data as { success?: boolean; error?: string }

      if (data.success) {
        toast({
          title: 'Connected',
          description: 'Apple Calendar connected successfully.',
        })
        form.reset({ appleId: values.appleId, appPassword: '' })
        onClose()
      } else {
        setError(data.error || 'Failed to connect to Apple Calendar')
      }
    } catch (err) {
      const errorMessage = (err as Error).message
      if (errorMessage.includes('invalid credentials')) {
        setError('Invalid Apple ID or app-specific password. Please check and try again.')
      } else {
        setError('Failed to connect to Apple Calendar. Please try again.')
      }
      console.error('[AppleCalendarModal] Connect failed:', err)
    } finally {
      setConnecting(false)
    }
  }

  // Disconnect handler
  const handleDisconnect = async () => {
    if (!user?.uid) {
      setError('Authentication error. Please refresh the page and try again.')
      return
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'appleCalendar.connected': false,
        'appleCalendar.connectedAt': deleteField(),
        'appleCalendar.appleId': deleteField(),
        'appleCalendar.encryptedPassword': deleteField(),
      })

      toast({
        title: 'Disconnected',
        description: 'Apple Calendar disconnected successfully.',
      })
      onClose()
    } catch (err) {
      console.error('[AppleCalendarModal] Disconnect failed:', err)
      setError('Failed to disconnect: ' + (err as Error).message)
    }
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Calendar className="h-6 w-6" />
          Apple Calendar Integration
        </DialogTitle>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-180px)]">
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Connection Status Hero */}
          {isConnected ? (
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white">Calendar Connected</div>
                  <div className="text-sm text-white/90 font-medium">
                    {connectedAppleId || 'Syncing to Apple Calendar'}
                  </div>
                  {connectedAt && (
                    <div className="text-xs text-white/75 mt-1">
                      Connected{' '}
                      {new Date(connectedAt.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Active
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-gray-500 to-gray-600 border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarOff className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white">Connect Your Calendar</div>
                  <div className="text-sm text-white/85">
                    Sync your meetings to Apple Calendar
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Form (only when not connected) */}
          {!isConnected && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleConnect)} className="space-y-4">
                {/* Apple ID */}
                <Card>
                  <CardContent className="pt-4">
                    <FormField
                      control={form.control}
                      name="appleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Mail className="h-4 w-4" />
                            Apple ID Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@icloud.com"
                              disabled={connecting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* App-Specific Password */}
                <Card>
                  <CardContent className="pt-4">
                    <FormField
                      control={form.control}
                      name="appPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Key className="h-4 w-4" />
                            App-Specific Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="xxxx-xxxx-xxxx-xxxx"
                                disabled={connecting}
                                className={cn('pr-10', !showPassword && 'font-mono tracking-widest')}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={connecting}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Instructions - Collapsible */}
                <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
                  <Card
                    className="cursor-pointer"
                    onClick={() => setShowInstructions(!showInstructions)}
                  >
                    <CardContent className="pt-4">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Info className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="text-base font-semibold">
                                How to generate app-specific password
                              </div>
                              {!showInstructions && (
                                <div className="text-xs text-muted-foreground">
                                  Click to view instructions
                                </div>
                              )}
                            </div>
                          </div>
                          {showInstructions ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="mt-4 pt-4 border-t">
                          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>
                              Go to{' '}
                              <a
                                href="https://appleid.apple.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                appleid.apple.com
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </li>
                            <li>Sign in with your Apple ID</li>
                            <li>
                              In the Security section, click &quot;Generate Password&quot; under
                              App-Specific Passwords
                            </li>
                            <li>Enter a label (e.g., &quot;GLRS Lighthouse&quot;)</li>
                            <li>Copy the generated password (format: xxxx-xxxx-xxxx-xxxx)</li>
                            <li>Paste it in the field above</li>
                          </ol>
                          <p className="mt-4 text-xs text-muted-foreground italic">
                            Note: You must have two-factor authentication enabled on your Apple ID
                            to generate app-specific passwords.
                          </p>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              </form>
            </Form>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={connecting}>
          Close
        </Button>

        {isConnected ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Apple Calendar?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your calendar events will no longer sync. You can reconnect at any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={form.handleSubmit(handleConnect)}
            disabled={connecting || !form.formState.isValid}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Connect Apple Calendar
              </>
            )}
          </Button>
        )}
      </div>
    </DialogContent>
  )
}

export default AppleCalendarModal
