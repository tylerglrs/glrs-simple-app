import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  logAudit,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import {
  Shield,
  Settings2,
  Lock,
  UserCheck,
  Eye,
  Edit,
  Bell,
  Save,
} from "lucide-react"
import { getInitials } from "@/lib/utils"

const CURRENT_TENANT = "full-service"

interface AdminUser {
  id: string
  email: string
  displayName?: string
  role: string
  permissions?: Permissions
  tenantId?: string
}

interface Permissions {
  // Page Access
  access_dashboard?: boolean
  access_users?: boolean
  access_pirs?: boolean
  access_tasks?: boolean
  access_guides?: boolean
  access_communication?: boolean
  access_meetings?: boolean
  access_alerts?: boolean
  access_logs?: boolean
  access_settings?: boolean
  // Actions
  action_create_user?: boolean
  action_edit_user?: boolean
  action_delete_user?: boolean
  action_create_resource?: boolean
  action_edit_resource?: boolean
  action_delete_resource?: boolean
  action_send_message?: boolean
  action_view_reports?: boolean
  action_export_data?: boolean
  // Scope
  scope?: "all_tenants" | "all_pirs_tenant" | "assigned_pirs" | "own_data"
}

const PERMISSION_GROUPS = {
  pages: {
    label: "Page Access",
    icon: Eye,
    permissions: [
      { key: "access_dashboard", label: "Dashboard" },
      { key: "access_users", label: "Users" },
      { key: "access_pirs", label: "PIRs" },
      { key: "access_tasks", label: "Tasks" },
      { key: "access_guides", label: "Guides" },
      { key: "access_communication", label: "Communication" },
      { key: "access_meetings", label: "Meetings" },
      { key: "access_alerts", label: "Alerts" },
      { key: "access_logs", label: "Logs" },
      { key: "access_settings", label: "Settings" },
    ],
  },
  actions: {
    label: "Actions",
    icon: Edit,
    permissions: [
      { key: "action_create_user", label: "Create Users" },
      { key: "action_edit_user", label: "Edit Users" },
      { key: "action_delete_user", label: "Delete Users" },
      { key: "action_create_resource", label: "Create Resources" },
      { key: "action_edit_resource", label: "Edit Resources" },
      { key: "action_delete_resource", label: "Delete Resources" },
      { key: "action_send_message", label: "Send Messages" },
      { key: "action_view_reports", label: "View Reports" },
      { key: "action_export_data", label: "Export Data" },
    ],
  },
}

const SCOPE_OPTIONS = [
  { value: "all_tenants", label: "All Tenants", description: "SuperAdmin only" },
  { value: "all_pirs_tenant", label: "All PIRs in Tenant", description: "Full tenant access" },
  { value: "assigned_pirs", label: "Assigned PIRs Only", description: "Coach level" },
  { value: "own_data", label: "Own Data Only", description: "Personal access" },
]

const ROLE_PRESETS: Record<string, Permissions> = {
  superadmin1: {
    access_dashboard: true,
    access_users: true,
    access_pirs: true,
    access_tasks: true,
    access_guides: true,
    access_communication: true,
    access_meetings: true,
    access_alerts: true,
    access_logs: true,
    access_settings: true,
    action_create_user: true,
    action_edit_user: true,
    action_delete_user: true,
    action_create_resource: true,
    action_edit_resource: true,
    action_delete_resource: true,
    action_send_message: true,
    action_view_reports: true,
    action_export_data: true,
    scope: "all_pirs_tenant",
  },
  admin: {
    access_dashboard: true,
    access_users: true,
    access_pirs: true,
    access_tasks: true,
    access_guides: true,
    access_communication: true,
    access_meetings: true,
    access_alerts: true,
    access_logs: false,
    access_settings: false,
    action_create_user: true,
    action_edit_user: true,
    action_delete_user: false,
    action_create_resource: true,
    action_edit_resource: true,
    action_delete_resource: false,
    action_send_message: true,
    action_view_reports: true,
    action_export_data: true,
    scope: "all_pirs_tenant",
  },
  coach: {
    access_dashboard: true,
    access_users: false,
    access_pirs: true,
    access_tasks: true,
    access_guides: true,
    access_communication: true,
    access_meetings: true,
    access_alerts: true,
    access_logs: false,
    access_settings: false,
    action_create_user: false,
    action_edit_user: false,
    action_delete_user: false,
    action_create_resource: true,
    action_edit_resource: true,
    action_delete_resource: false,
    action_send_message: true,
    action_view_reports: true,
    action_export_data: false,
    scope: "assigned_pirs",
  },
}

// ==========================================
// PERMISSION EDITOR TAB
// ==========================================
function PermissionEditor() {
  const { adminUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const canEdit =
    adminUser?.role === "superadmin" || adminUser?.role === "superadmin1"

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          orderBy("displayName", "asc")
        )
      )

      const usersData: AdminUser[] = []
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data()
        // Only show admins and coaches, not PIRs
        if (data.role && data.role !== "pir") {
          usersData.push({
            id: docSnap.id,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            permissions: data.permissions,
            tenantId: data.tenantId,
          })
        }
      })
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.id === selectedUserId)
      if (user) {
        setSelectedUser(user)
        setPermissions(
          user.permissions || ROLE_PRESETS[user.role] || ROLE_PRESETS.coach
        )
        setHasChanges(false)
      }
    } else {
      setSelectedUser(null)
      setPermissions(null)
    }
  }, [selectedUserId, users])

  const togglePermission = (key: string) => {
    if (!canEdit || !permissions) return
    setPermissions((prev) => ({
      ...prev!,
      [key]: !prev![key as keyof Permissions],
    }))
    setHasChanges(true)
  }

  const updateScope = (scope: string) => {
    if (!canEdit || !permissions) return
    setPermissions((prev) => ({
      ...prev!,
      scope: scope as Permissions["scope"],
    }))
    setHasChanges(true)
  }

  const applyPreset = (preset: string) => {
    if (!canEdit) return
    const presetPerms = ROLE_PRESETS[preset]
    if (presetPerms) {
      setPermissions({ ...presetPerms })
      setHasChanges(true)
      toast.success(`Applied ${preset.toUpperCase()} preset`)
    }
  }

  const savePermissions = async () => {
    if (!canEdit || !selectedUserId || !permissions) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "users", selectedUserId), {
        permissions,
        permissionsLastModified: serverTimestamp(),
        permissionsModifiedBy: adminUser?.uid,
      })

      await logAudit("permissions_updated", {
        targetUserId: selectedUserId,
      })

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUserId ? { ...u, permissions } : u))
      )
      setHasChanges(false)
      toast.success("Permissions saved successfully")
    } catch (error) {
      console.error("Error saving permissions:", error)
      toast.error("Failed to save permissions")
    } finally {
      setSaving(false)
    }
  }

  if (!canEdit) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lock className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-lg font-semibold text-red-700">Access Restricted</h3>
          <p className="mt-2 text-center text-sm text-red-600">
            Only SuperAdmin and SuperAdmin1 can edit permissions.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mb-4 h-12" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Select User
          </CardTitle>
          <CardDescription>
            Choose a staff member to edit their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.displayName || user.email}</span>
                    <Badge variant="outline" className="ml-2 text-xs capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && permissions && (
        <>
          {/* User Info */}
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(selectedUser.displayName || selectedUser.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">
                  {selectedUser.displayName || selectedUser.email}
                </div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                {selectedUser.role}
              </Badge>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Quick Presets
              </CardTitle>
              <CardDescription>Apply a permission template</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("superadmin1")}
              >
                SuperAdmin1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("admin")}
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("coach")}
              >
                Coach
              </Button>
            </CardContent>
          </Card>

          {/* Data Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Scope
              </CardTitle>
              <CardDescription>
                What data can this user access?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={permissions.scope || "assigned_pirs"} onValueChange={updateScope}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Page Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Page Access
              </CardTitle>
              <CardDescription>
                Which pages can this user view?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {PERMISSION_GROUPS.pages.permissions.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <Label htmlFor={perm.key} className="cursor-pointer">
                      {perm.label}
                    </Label>
                    <Switch
                      id={perm.key}
                      checked={!!permissions[perm.key as keyof Permissions]}
                      onCheckedChange={() => togglePermission(perm.key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Actions
              </CardTitle>
              <CardDescription>
                What actions can this user perform?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {PERMISSION_GROUPS.actions.permissions.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <Label htmlFor={perm.key} className="cursor-pointer">
                      {perm.label}
                    </Label>
                    <Switch
                      id={perm.key}
                      checked={!!permissions[perm.key as keyof Permissions]}
                      onCheckedChange={() => togglePermission(perm.key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {hasChanges && (
            <div className="sticky bottom-4 flex justify-end">
              <Button onClick={savePermissions} disabled={saving} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ==========================================
// GENERAL SETTINGS TAB
// ==========================================
function GeneralSettings() {
  const { adminUser } = useAuth()
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailDigest: true,
    autoAssignment: false,
    darkMode: false,
    timezone: "America/Los_Angeles",
  })
  const [saving, setSaving] = useState(false)

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", adminUser?.uid || ""), {
        settings,
        settingsUpdatedAt: serverTimestamp(),
      })
      toast.success("Settings saved")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for crisis events and urgent matters
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={() => handleToggle("notificationsEnabled")}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="font-medium">Email Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily summary emails
              </p>
            </div>
            <Switch
              checked={settings.emailDigest}
              onCheckedChange={() => handleToggle("emailDigest")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Features
          </CardTitle>
          <CardDescription>Enable or disable features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="font-medium">Auto-Assignment</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign new PIRs to coaches based on capacity
              </p>
            </div>
            <Switch
              checked={settings.autoAssignment}
              onCheckedChange={() => handleToggle("autoAssignment")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Display
          </CardTitle>
          <CardDescription>Customize your view</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="font-medium">Timezone</Label>
              <p className="text-sm text-muted-foreground">
                Used for displaying dates and times
              </p>
            </div>
            <Select
              value={settings.timezone}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// MAIN SETTINGS COMPONENT
// ==========================================
export function Settings() {
  const { adminUser } = useAuth()
  const [activeTab, setActiveTab] = useState("general")

  const canAccessPermissions =
    adminUser?.role === "superadmin" || adminUser?.role === "superadmin1"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your preferences and system configuration
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="gap-2"
            disabled={!canAccessPermissions}
          >
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
