import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  BookOpen,
  Calendar,
  FileText,
  AlertTriangle,
  ScrollText,
  Settings,
  LogOut,
  X,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface DrawerNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

// Items not shown in bottom tabs
const drawerNavItems: DrawerNavItem[] = [
  { name: "Guides", href: "/guides", icon: BookOpen, permission: "access_guides" },
  { name: "Meetings", href: "/meetings", icon: Calendar, permission: "access_meetings" },
  { name: "Templates", href: "/templates", icon: FileText, permission: "access_templates" },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle, permission: "access_alerts" },
  { name: "Logs", href: "/logs", icon: ScrollText, permission: "access_logs" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "access_settings" },
]

interface NavigationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NavigationDrawer({ open, onOpenChange }: NavigationDrawerProps) {
  const { adminUser, logout, canAccessPage } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onOpenChange(false)
    await logout()
    navigate("/login")
  }

  const handleNavClick = () => {
    onOpenChange(false)
  }

  // Filter nav items based on permissions
  const filteredNavItems = drawerNavItems.filter((item) => {
    if (!item.permission) return true
    return canAccessPage(item.permission.replace("access_", ""))
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle>More Options</SheetTitle>
            <SheetClose asChild>
              <button className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* User Info */}
        {adminUser && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {adminUser.displayName || adminUser.firstName || adminUser.email}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {adminUser.role}
              </p>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Navigation Items */}
        <nav className="space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </SheetContent>
    </Sheet>
  )
}

export default NavigationDrawer
