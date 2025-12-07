import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useAlertBadge } from "@/hooks/useAlertBadge"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Calendar,
  FileText,
  AlertTriangle,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  /** Key to match for badge rendering */
  badgeKey?: string
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "access_dashboard" },
  { name: "Users", href: "/users", icon: Users, permission: "access_users" },
  { name: "Guides", href: "/guides", icon: BookOpen, permission: "access_guides" },
  { name: "Tasks", href: "/tasks", icon: ClipboardList, permission: "access_tasks" },
  { name: "Communication", href: "/communication", icon: MessageSquare, permission: "access_communication" },
  { name: "Meetings", href: "/meetings", icon: Calendar, permission: "access_meetings" },
  { name: "Templates", href: "/templates", icon: FileText, permission: "access_templates" },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle, permission: "access_alerts", badgeKey: "alerts" },
  { name: "Logs", href: "/logs", icon: ScrollText, permission: "access_logs" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "access_settings" },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const { adminUser, logout, canAccessPage } = useAuth()
  const { unreadCount, hasCritical } = useAlertBadge()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true
    return canAccessPage(item.permission.replace("access_", ""))
  })

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-gradient-primary transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <span className="text-xl font-bold text-white">G</span>
            </div>
            <span className="text-lg font-semibold text-white">GLRS Admin</span>
          </div>
        )}
        <button
          onClick={handleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredNavItems.map((item) => {
          // Check if this item should show a badge
          const showBadge = item.badgeKey === 'alerts' && unreadCount > 0
          const badgeValue = item.badgeKey === 'alerts' ? unreadCount : 0
          const shouldPulse = item.badgeKey === 'alerts' && hasCritical

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                  isCollapsed && "justify-center px-2"
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1">{item.name}</span>}
              {showBadge && (
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    shouldPulse
                      ? "animate-pulse bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {badgeValue > 99 ? '99+' : badgeValue}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-3">
        {!isCollapsed && adminUser && (
          <div className="mb-3 rounded-lg bg-white/10 p-3">
            <p className="truncate text-sm font-medium text-white">
              {adminUser.displayName || adminUser.firstName || adminUser.email}
            </p>
            <p className="truncate text-xs text-white/60">{adminUser.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
