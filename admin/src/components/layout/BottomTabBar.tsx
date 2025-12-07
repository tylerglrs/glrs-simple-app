import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, ClipboardList, MessageSquare, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const tabItems: TabItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Tasks", href: "/tasks", icon: ClipboardList },
  { name: "Messages", href: "/communication", icon: MessageSquare },
]

interface BottomTabBarProps {
  onMoreClick: () => void
}

export function BottomTabBar({ onMoreClick }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background safe-area-bottom lg:hidden">
      <div className="flex h-16 items-stretch">
        {tabItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* More Button */}
        <button
          onClick={onMoreClick}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="font-medium">More</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomTabBar
