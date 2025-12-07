import { useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  Compass,
  Users,
  Calendar,
  Book,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Heart,
  Target,
  TrendingUp,
  Bell,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Separator } from '@/components/ui/separator'

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

const mainNavItems = [
  { path: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { path: '/journey', icon: Compass, label: 'Journey' },
  { path: '/community', icon: Users, label: 'Connect' },
  { path: '/meetings', icon: Calendar, label: 'Meetings' },
  { path: '/resources', icon: Book, label: 'Guides' },
  { path: '/messages', icon: MessageSquare, label: 'Messages' },
]

const quickActions = [
  { path: '/tasks?view=checkin', icon: Heart, label: 'Morning Check-In' },
  { path: '/tasks?view=reflections', icon: TrendingUp, label: 'Evening Reflection' },
  { path: '/journey?view=goals', icon: Target, label: 'My Goals' },
]

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const navigate = useNavigate()
  const { logOut } = useAuth()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleLogOut = async () => {
    try {
      await logOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-left">
            <Compass className="h-6 w-6 text-primary" />
            GLRS Lighthouse
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Main Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Quick Actions
              </p>
              {quickActions.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sm"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10"
              onClick={() => handleNavigation('/profile')}
            >
              <User className="h-5 w-5" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10"
              onClick={() => handleNavigation('/profile/settings')}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10"
              onClick={() => handleNavigation('/notifications')}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Button>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive"
              onClick={handleLogOut}
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AppSidebar
