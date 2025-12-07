// Permission types
export type Permission =
  // Page access
  | "access_dashboard"
  | "access_users"
  | "access_my_pirs"
  | "access_feedback"
  | "access_resources"
  | "access_goals"
  | "access_tasks"
  | "access_guides"
  | "access_community"
  | "access_communication"
  | "access_meetings"
  | "access_templates"
  | "access_checkins"
  | "access_alerts"
  | "access_reports"
  | "access_logs"
  | "access_settings"
  | "access_audit_logs"
  // Actions - PIR management
  | "action_create_pir"
  | "action_edit_pir"
  | "action_delete_pir"
  // Actions - Resource management
  | "action_create_resource"
  | "action_edit_resource"
  | "action_delete_resource"
  // Actions - Staff management
  | "action_create_coach"
  | "action_edit_coach"
  | "action_create_admin"
  | "action_edit_admin"
  | "action_create_superadmin1"
  // Actions - Settings & Analytics
  | "action_modify_settings"
  | "action_export_data"
  | "action_view_analytics"
  | "action_view_audit_logs"
  | "action_impersonate"
  // Actions - Communication & Community
  | "action_create_goal"
  | "action_create_assignment"
  | "action_send_message"
  | "action_send_broadcast"
  | "action_manage_community"

export type DataScope =
  | "all_tenants"
  | "all_pirs_tenant"
  | "assigned_pirs"
  | "own_data"

export type UserRole = "superadmin" | "superadmin1" | "admin" | "coach" | "pir"

// Role hierarchy - higher number = more permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 5,
  superadmin1: 4,
  admin: 3,
  coach: 2,
  pir: 1,
}

export interface UserPermissions {
  // Page access
  access_dashboard?: boolean
  access_users?: boolean
  access_my_pirs?: boolean
  access_feedback?: boolean
  access_resources?: boolean
  access_goals?: boolean
  access_tasks?: boolean
  access_guides?: boolean
  access_community?: boolean
  access_communication?: boolean
  access_meetings?: boolean
  access_templates?: boolean
  access_checkins?: boolean
  access_alerts?: boolean
  access_reports?: boolean
  access_logs?: boolean
  access_settings?: boolean
  access_audit_logs?: boolean
  // Actions - PIR management
  action_create_pir?: boolean
  action_edit_pir?: boolean
  action_delete_pir?: boolean
  // Actions - Resource management
  action_create_resource?: boolean
  action_edit_resource?: boolean
  action_delete_resource?: boolean
  // Actions - Staff management
  action_create_coach?: boolean
  action_edit_coach?: boolean
  action_create_admin?: boolean
  action_edit_admin?: boolean
  action_create_superadmin1?: boolean
  // Actions - Settings & Analytics
  action_modify_settings?: boolean
  action_export_data?: boolean
  action_view_analytics?: boolean
  action_view_audit_logs?: boolean
  action_impersonate?: boolean
  // Actions - Communication & Community
  action_create_goal?: boolean
  action_create_assignment?: boolean
  action_send_message?: boolean
  action_send_broadcast?: boolean
  action_manage_community?: boolean
  // Scope
  scope?: DataScope
}

export interface AdminUser {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: UserRole
  tenantId: string
  permissions?: UserPermissions
  assignedCoach?: string
  active?: boolean
  createdAt?: Date
  lastLogin?: Date
}

// Permission presets
export const SUPERADMIN1_PRESET: UserPermissions = {
  access_dashboard: true,
  access_users: true,
  access_my_pirs: true,
  access_feedback: true,
  access_resources: true,
  access_goals: true,
  access_community: true,
  access_communication: true,
  access_meetings: true,
  access_templates: true,
  access_checkins: true,
  access_alerts: true,
  access_reports: true,
  access_logs: true,
  access_settings: true,
  access_audit_logs: true,
  action_create_pir: true,
  action_delete_pir: true,
  action_create_resource: true,
  action_delete_resource: true,
  action_create_coach: true,
  action_create_admin: true,
  action_create_superadmin1: true,
  action_modify_settings: true,
  action_export_data: true,
  action_view_audit_logs: true,
  action_impersonate: true,
  action_create_goal: true,
  action_create_assignment: true,
  action_send_message: true,
  scope: "all_pirs_tenant",
}

export const ADMIN_PRESET: UserPermissions = {
  access_dashboard: true,
  access_users: true,
  access_my_pirs: true,
  access_feedback: true,
  access_resources: true,
  access_goals: true,
  access_community: true,
  access_communication: true,
  access_meetings: true,
  access_templates: true,
  access_checkins: true,
  access_alerts: true,
  access_reports: true,
  access_logs: true,
  access_settings: false,
  access_audit_logs: false,
  action_create_pir: true,
  action_delete_pir: true,
  action_create_resource: true,
  action_delete_resource: true,
  action_create_coach: true,
  action_create_admin: false,
  action_create_superadmin1: false,
  action_modify_settings: false,
  action_export_data: true,
  action_view_audit_logs: false,
  action_impersonate: true,
  action_create_goal: true,
  action_create_assignment: true,
  action_send_message: true,
  scope: "all_pirs_tenant",
}

export const COACH_PRESET: UserPermissions = {
  access_dashboard: true,
  access_users: false,
  access_my_pirs: true,
  access_feedback: false,
  access_resources: false,
  access_goals: true,
  access_community: true,
  access_communication: true,
  access_meetings: true,
  access_templates: true,
  access_checkins: true,
  access_alerts: true,
  access_reports: true,
  access_logs: true,
  access_settings: false,
  access_audit_logs: false,
  action_create_pir: false,
  action_delete_pir: false,
  action_create_resource: false,
  action_delete_resource: false,
  action_create_coach: false,
  action_create_admin: false,
  action_create_superadmin1: false,
  action_modify_settings: false,
  action_export_data: false,
  action_view_audit_logs: false,
  action_impersonate: false,
  action_create_goal: true,
  action_create_assignment: true,
  action_send_message: true,
  scope: "assigned_pirs",
}

// Helper functions
export function isSuperAdmin(user: AdminUser | null): boolean {
  return user?.role === "superadmin"
}

export function isSuperAdmin1(user: AdminUser | null): boolean {
  return user?.role === "superadmin1"
}

export function getDefaultPermissions(role: UserRole): UserPermissions {
  if (role === "superadmin1") return SUPERADMIN1_PRESET
  if (role === "admin") return ADMIN_PRESET
  if (role === "coach") return COACH_PRESET

  // Most restrictive for PIR or unknown
  return {
    access_dashboard: false,
    access_users: false,
    access_my_pirs: false,
    scope: "own_data",
  }
}

export function hasPermission(user: AdminUser | null, permission: Permission): boolean {
  if (!user) return false

  // SuperAdmin bypass
  if (isSuperAdmin(user) || isSuperAdmin1(user)) {
    return true
  }

  // Check permissions object
  if (user.permissions) {
    return user.permissions[permission as keyof UserPermissions] === true
  }

  // Fallback to role preset
  const defaultPerms = getDefaultPermissions(user.role)
  return defaultPerms[permission as keyof UserPermissions] === true
}

export function canAccessPage(user: AdminUser | null, pageName: string): boolean {
  return hasPermission(user, `access_${pageName}` as Permission)
}

export function canPerformAction(user: AdminUser | null, actionName: string): boolean {
  return hasPermission(user, `action_${actionName}` as Permission)
}

export function getDataScope(user: AdminUser | null): DataScope {
  if (!user) return "own_data"

  if (isSuperAdmin(user)) return "all_tenants"
  if (isSuperAdmin1(user)) return "all_pirs_tenant"

  if (user.permissions?.scope) return user.permissions.scope

  // Fallback based on role
  if (user.role === "admin") return "all_pirs_tenant"
  if (user.role === "coach") return "assigned_pirs"

  return "own_data"
}
