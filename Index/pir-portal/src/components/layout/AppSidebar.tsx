import { useNavigate, useLocation } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GlassSidebar,
  SidebarHeader,
  SidebarNavItem,
  SidebarSection,
  SidebarDivider,
  SidebarItemsContainer,
  SidebarFooter,
} from '@/components/ui/glass-sidebar'
import {
  ClipboardList,
  Map,
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
import { haptics } from '@/lib/animations'
import { useModalStore } from '@/stores/modalStore'

// =============================================================================
// TYPES
// =============================================================================

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

// =============================================================================
// NAVIGATION DATA
// =============================================================================

const mainNavItems = [
  { path: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { path: '/journey', icon: Map, label: 'Journey' },
  { path: '/meetings', icon: Calendar, label: 'Meetings' },
  { path: '/resources', icon: Book, label: 'Guides' },
  { path: '/messages', icon: MessageSquare, label: 'Messages' },
]

const quickActions = [
  { path: '/tasks?view=checkin', icon: Heart, label: 'Morning Check-In' },
  { path: '/tasks?view=reflections', icon: TrendingUp, label: 'Evening Reflection' },
  { path: '/journey?view=goals', icon: Target, label: 'My Goals' },
]

const bottomNavItems = [
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/profile/settings', icon: Settings, label: 'Settings' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logOut } = useAuth()
  const openModal = useModalStore((state) => state.openModal)

  const handleNavigation = (path: string) => {
    haptics.tap()
    navigate(path)
    onClose()
  }

  const handleLogOut = async () => {
    haptics.tap()
    try {
      await logOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => {
    // Handle paths with query params
    const basePath = path.split('?')[0]
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/')
  }

  return (
    <GlassSidebar
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      side="left"
      size="md"
      variant="navigation"
    >
      <SidebarHeader
        variant="gradient"
        title="Recovery Compass"
        subtitle="Your recovery companion"
        logoSrc="./assets/glrs-logo.png"
        onClose={onClose}
        showCloseButton
      />

      <ScrollArea className="flex-1">
        <div className="p-3">
          <SidebarItemsContainer>
            {/* Main Navigation */}
            <SidebarSection>
              {mainNavItems.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleNavigation(item.path)}
                  active={isActive(item.path)}
                />
              ))}
            </SidebarSection>

            <SidebarDivider />

            {/* Quick Actions */}
            <SidebarSection title="Quick Actions" gradient="from-teal-500 to-emerald-500">
              {quickActions.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </SidebarSection>

            <SidebarDivider />

            {/* Bottom Items */}
            <SidebarSection>
              {bottomNavItems.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleNavigation(item.path)}
                  active={isActive(item.path)}
                />
              ))}
              <SidebarNavItem
                icon={LogOut}
                label="Log Out"
                onClick={handleLogOut}
                destructive
              />
            </SidebarSection>
          </SidebarItemsContainer>
        </div>
      </ScrollArea>

      <SidebarFooter>
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground flex-wrap">
            <button
              type="button"
              onClick={() => {
                haptics.tap()
                openModal('privacyPolicy')
                onClose()
              }}
              className="hover:text-primary transition-colors"
            >
              Privacy
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => {
                haptics.tap()
                openModal('termsConditions')
                onClose()
              }}
              className="hover:text-primary transition-colors"
            >
              Terms
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => {
                haptics.tap()
                openModal('healthDisclaimer')
                onClose()
              }}
              className="hover:text-primary transition-colors"
            >
              Health
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => {
                haptics.tap()
                navigate('/crisis-resources')
                onClose()
              }}
              className="hover:text-primary transition-colors"
            >
              Crisis Help
            </button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/60">
            Recovery Compass v2.0
          </p>
        </div>
      </SidebarFooter>
    </GlassSidebar>
  )
}

export default AppSidebar
