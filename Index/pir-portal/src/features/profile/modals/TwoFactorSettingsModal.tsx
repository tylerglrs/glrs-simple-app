/**
 * Two-Factor Authentication Settings Modal
 *
 * Allows PIR users to:
 * - Enable/disable 2FA
 * - View and manage trusted devices
 * - Understand 2FA benefits
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Smartphone,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Monitor,
  Tablet,
} from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import type { TrustedDevice } from '@/hooks/use2FA';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorSettingsModalProps {
  onClose: () => void;
}

function getDeviceIcon(userAgent: string) {
  if (/mobile|android|iphone/i.test(userAgent)) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (/ipad|tablet/i.test(userAgent)) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

export function TwoFactorSettingsModal({ onClose }: TwoFactorSettingsModalProps) {
  const open = true; // Always open when rendered by ModalProvider
  const { user } = useAuth();
  const {
    enable2FA,
    disable2FA,
    getTrustedDevices,
    revokeDevice,
    check2FAStatus,
    isLoading,
    error,
    clearError,
  } = use2FA();

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Load 2FA status on open
  useEffect(() => {
    if (open && user?.uid) {
      loadStatus();
    }
  }, [open, user?.uid]);

  const loadStatus = async () => {
    if (!user?.uid) return;

    try {
      const status = await check2FAStatus(user.uid);
      setIs2FAEnabled(status.enabled);
      setIs2FARequired(status.required);

      // Load trusted devices
      setLoadingDevices(true);
      const devices = await getTrustedDevices();
      setTrustedDevices(devices);
    } catch {
      // Error handled by hook
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    clearError();
    setSuccess(null);

    try {
      if (enabled) {
        const result = await enable2FA();
        if (result) {
          setIs2FAEnabled(true);
          setSuccess('Two-factor authentication enabled successfully');
        }
      } else {
        const result = await disable2FA();
        if (result) {
          setIs2FAEnabled(false);
          setTrustedDevices([]);
          setSuccess('Two-factor authentication disabled');
        }
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    clearError();
    setSuccess(null);

    try {
      const result = await revokeDevice(deviceId);
      if (result) {
        setTrustedDevices((prev) => prev.filter((d) => d.id !== deviceId));
        setSuccess('Device removed from trusted list');
      }
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-teal-100">
              <Shield className="h-6 w-6 text-teal-600" />
            </div>
            <DialogTitle className="text-xl">Two-Factor Authentication</DialogTitle>
          </div>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success message */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="2fa-toggle" className="font-medium">
                Enable Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code when signing in
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isLoading || is2FARequired}
            />
          </div>

          {/* Admin notice */}
          {is2FARequired && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Two-factor authentication is required for your account type and cannot be disabled.
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits */}
          {!is2FAEnabled && !is2FARequired && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Why enable 2FA?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Protect your recovery journey data from unauthorized access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Get alerts when someone tries to access your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Trust devices you use frequently for 30 days</span>
                </li>
              </ul>
            </div>
          )}

          {/* Trusted Devices */}
          {is2FAEnabled && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Trusted Devices</h4>
              {loadingDevices ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : trustedDevices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No trusted devices. Devices become trusted when you check "Trust this device" during verification.
                </p>
              ) : (
                <div className="space-y-2">
                  {trustedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-background">
                          {getDeviceIcon(device.deviceInfo?.userAgent || '')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {device.deviceInfo?.platform || 'Unknown Device'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Trusted on {formatDate(device.createdAt)} •
                            Expires {formatDate(device.expiresAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeDevice(device.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TwoFactorSettingsModal;
