import { useState, useEffect } from 'react'
import { Heart, Activity, DollarSign, Calendar, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import JourneyLifeTab from './JourneyLifeTab'
import JourneyWellnessTab from './JourneyWellnessTab'
import JourneyFinancesTab from './JourneyFinancesTab'
import type { JourneySubTab } from '../types'

// =============================================================================
// TYPES
// =============================================================================

interface SubTabConfig {
  id: JourneySubTab
  label: string
  icon: React.ElementType
}

// =============================================================================
// SUB-TAB CONFIGURATION
// =============================================================================

const SUB_TABS: SubTabConfig[] = [
  { id: 'life', label: 'Life', icon: Heart },
  { id: 'wellness', label: 'Wellness', icon: Activity },
  { id: 'finances', label: 'Finances', icon: DollarSign },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function JourneyTab() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [activeSubTab, setActiveSubTab] = useState<JourneySubTab>('life')
  const [showSidebar, setShowSidebar] = useState(false)

  // Global navigation function for setting Journey sub-tab from other components
  useEffect(() => {
    const navigateToSubTab = (subTab: JourneySubTab) => {
      setActiveSubTab(subTab)
    }

    // Expose to window for external navigation
    ;(window as unknown as { navigateToJourneySubTab?: (subTab: JourneySubTab) => void }).navigateToJourneySubTab = navigateToSubTab

    return () => {
      delete (window as unknown as { navigateToJourneySubTab?: (subTab: JourneySubTab) => void }).navigateToJourneySubTab
    }
  }, [])

  // Render sub-tab content
  const renderContent = () => {
    switch (activeSubTab) {
      case 'life':
        return <JourneyLifeTab />
      case 'wellness':
        return <JourneyWellnessTab />
      case 'finances':
        return <JourneyFinancesTab />
      default:
        return <JourneyLifeTab />
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Journey Header */}
      <div
        className={cn(
          'fixed left-0 right-0 top-0 z-50',
          'flex h-12 items-center justify-between',
          'bg-primary px-4 shadow-md'
        )}
      >
        {/* Left side: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(true)}
            className={cn(
              'flex h-9 w-9 items-center justify-center',
              'rounded-full text-white transition-colors',
              'hover:bg-white/10'
            )}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Journey</h1>
        </div>

        {/* Right side: Calendar + Profile */}
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'flex h-9 w-9 items-center justify-center',
              'rounded-full bg-white/20 text-white transition-colors',
              'hover:bg-white/30'
            )}
            aria-label="Calendar"
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button
            className={cn(
              'flex h-9 w-9 items-center justify-center',
              'rounded-full text-white transition-colors',
              'hover:bg-white/10'
            )}
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div
        className={cn(
          'fixed left-0 right-0 z-40',
          'border-b bg-white shadow-sm',
          'top-12' // Below header
        )}
      >
        <div className={cn('flex', isMobile ? 'px-2' : 'mx-auto max-w-xl px-4')}>
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2',
                  'py-3 text-sm font-medium transition-all',
                  'border-b-2',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4', isMobile && 'h-5 w-5')} />
                {!isMobile && <span>{tab.label}</span>}
                {isMobile && <span className="text-xs">{tab.label}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-24 flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </div>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-[100] bg-black/50"
          onClick={() => setShowSidebar(false)}
        >
          <div
            className={cn(
              'absolute left-0 top-0 h-full bg-white shadow-xl',
              'w-[280px] animate-in slide-in-from-left'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="border-b bg-primary p-4">
              <h2 className="text-lg font-semibold text-white">Journey Tools</h2>
            </div>

            {/* Sidebar Content */}
            <div className="p-4">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowSidebar(false)
                    // TODO: Open calendar modal
                  }}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Check-In Calendar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowSidebar(false)
                    // TODO: Open settings
                  }}
                >
                  <Activity className="mr-3 h-5 w-5" />
                  Graph Settings
                </Button>
              </div>

              <div className="mt-6 rounded-xl bg-primary/10 p-4">
                <h3 className="mb-2 font-medium text-primary">Journey Insights</h3>
                <p className="text-xs text-muted-foreground">
                  More tools and features coming soon to help you track your recovery journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JourneyTab
