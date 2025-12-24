/**
 * Session Management Modal
 *
 * Allows users to view and manage their active sessions.
 * - View all active sessions with device info and location
 * - Log out individual sessions
 * - Log out all other devices
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  LogOut,
  Loader2,
  RefreshCw,
  Shield,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useSession, type ActiveSession } from '@/hooks/useSession';
import { formatDistanceToNow } from 'date-fns';

interface SessionManagementModalProps {
  onClose: () => void;
}

export function SessionManagementModal({
  onClose,
}: SessionManagementModalProps) {
  const open = true; // Always open when rendered by ModalProvider
  const { getActiveSessions, logoutSession, logoutAllDevices } = useSession();

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logoutAllConfirmOpen, setLogoutAllConfirmOpen] = useState(false);
  const [logoutSessionId, setLogoutSessionId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const activeSessions = await getActiveSessions();
      setSessions(activeSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [getActiveSessions]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      loadSessions().finally(() => setIsLoading(false));
    }
  }, [open, loadSessions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSessions();
    setIsRefreshing(false);
  };

  const handleLogoutSession = async () => {
    if (!logoutSessionId) return;

    setActionInProgress(true);
    const success = await logoutSession(logoutSessionId);
    setActionInProgress(false);
    setLogoutSessionId(null);

    if (success) {
      setSessions(sessions.filter((s) => s.id !== logoutSessionId));
    }
  };

  const handleLogoutAllDevices = async () => {
    setActionInProgress(true);
    const count = await logoutAllDevices();
    setActionInProgress(false);
    setLogoutAllConfirmOpen(false);

    if (count > 0) {
      setSessions(sessions.filter((s) => s.isCurrent));
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes('iphone') || info.includes('android') || info.includes('mobile')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (info.includes('ipad') || info.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </DialogTitle>
            <DialogDescription>
              Manage your active sessions across devices. You can log out from other devices for security.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {otherSessions.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setLogoutAllConfirmOpen(true)}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Log Out All
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Globe className="h-12 w-12 mb-2" />
                <p>No active sessions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border ${
                      session.isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getDeviceIcon(session.deviceInfo)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {session.deviceInfo}
                            </span>
                            {session.isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {session.location ? (
                              `${session.location.city}, ${session.location.region}, ${session.location.country}`
                            ) : (
                              'Location unavailable'
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Last active{' '}
                            {session.lastActiveAt
                              ? formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })
                              : 'recently'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            IP: {session.ip || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setLogoutSessionId(session.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>
              If you see unfamiliar sessions, log them out immediately and change your password.
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm logout single session */}
      <AlertDialog
        open={!!logoutSessionId}
        onOpenChange={(open) => !open && setLogoutSessionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately end the session on that device. They will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutSession}
              disabled={actionInProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionInProgress ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm logout all devices */}
      <AlertDialog open={logoutAllConfirmOpen} onOpenChange={setLogoutAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out all other devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately end {otherSessions.length} session{otherSessions.length !== 1 ? 's' : ''} on other devices.
              You will remain logged in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutAllDevices}
              disabled={actionInProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionInProgress ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Log Out All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SessionManagementModal;
