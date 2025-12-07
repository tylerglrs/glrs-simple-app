import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, User, LogOut, Settings, Compass, Menu } from 'lucide-react'
import { useState } from 'react'
import { AppSidebar } from './AppSidebar'

const pageTitle: Record<string, string> = {
  '/': 'Home',
  '/home': 'Home',
  '/tasks': 'Tasks',
  '/journey': 'Journey',
  '/community': 'Connect',
  '/resources': 'Guides',
  '/messages': 'Messages',
  '/profile': 'Profile',
  '/meetings': 'Meetings',
  '/notifications': 'Notifications',
}

export function HeaderBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userData, logOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getPageTitle = () => {
    // Match exact path or path prefix
    for (const [path, title] of Object.entries(pageTitle)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title
      }
    }
    return 'GLRS'
  }

  const handleLogOut = async () => {
    try {
      await logOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = userData?.displayName ||
    `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() ||
    userData?.email?.split('@')[0] ||
    'User'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Hamburger & Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Compass className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">{getPageTitle()}</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge - TODO: Add actual count */}
            {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs font-medium text-destructive-foreground flex items-center justify-center">
              3
            </span> */}
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.profilePhoto} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{displayName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {userData?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* App Sidebar */}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  )
}
