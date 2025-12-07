import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sun,
  Moon,
  Sparkles,
  Menu,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInsQuery } from '@/hooks/queries'
import { useModalStore, type ModalName } from '@/stores/modalStore'
import { CheckInView } from './CheckInView'
import { ReflectionView } from './ReflectionView'
import { DailyOverview } from './DailyOverview'
import { TasksSidebar } from './TasksSidebar'
import { GoldenThreadView } from './GoldenThreadView'

// =============================================================================
// TYPES
// =============================================================================

export type TasksView = 'overview' | 'checkin' | 'reflections' | 'golden'

export interface TasksTabProps {
  initialView?: TasksView
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get suggested view based on time of day and completion status
 */
function getSuggestedView(
  morningComplete: boolean,
  eveningComplete: boolean
): TasksView {
  const hour = new Date().getHours()

  // Morning (5 AM - 12 PM): Suggest check-in if not complete
  if (hour >= 5 && hour < 12) {
    return morningComplete ? 'overview' : 'checkin'
  }

  // Afternoon (12 PM - 5 PM): Show overview or check-in if missed
  if (hour >= 12 && hour < 17) {
    if (!morningComplete) return 'checkin'
    return 'overview'
  }

  // Evening (5 PM - 11 PM): Suggest reflection if not complete
  if (hour >= 17 && hour < 23) {
    if (!morningComplete) return 'checkin'
    return eveningComplete ? 'overview' : 'reflections'
  }

  // Night (11 PM - 5 AM): Show overview
  return 'overview'
}

// =============================================================================
// TAB HEADER
// =============================================================================

interface TabHeaderProps {
  activeView: TasksView
  onViewChange: (view: TasksView) => void
  onOpenSidebar: () => void
  checkInStatus: { morning: boolean; evening: boolean }
}

function TabHeader({
  activeView,
  onViewChange,
  onOpenSidebar,
  checkInStatus,
}: TabHeaderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const tabs = [
    {
      id: 'overview' as TasksView,
      label: 'Overview',
      icon: LayoutDashboard,
      shortLabel: 'Overview',
    },
    {
      id: 'checkin' as TasksView,
      label: 'Check-In',
      icon: Sun,
      shortLabel: 'Check-In',
      badge: !checkInStatus.morning,
    },
    {
      id: 'reflections' as TasksView,
      label: 'Reflections',
      icon: Moon,
      shortLabel: 'Reflections',
      badge: !checkInStatus.evening,
    },
    {
      id: 'golden' as TasksView,
      label: 'Golden Thread',
      icon: Sparkles,
      shortLabel: 'Golden Thread',
    },
  ]

  return (
    <div
      className={cn(
        'sticky top-0 z-10 bg-background border-b',
        isMobile ? 'px-2 py-2' : 'px-4 py-3'
      )}
    >
      <div className="flex items-center gap-2 max-w-[800px] mx-auto">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn('shrink-0', isMobile ? 'h-9 w-9' : 'h-10 w-10')}
          onClick={onOpenSidebar}
        >
          <Menu className={cn(isMobile ? 'h-5 w-5' : 'h-6 w-6')} />
        </Button>

        {/* Tab Navigation */}
        <Tabs
          value={activeView}
          onValueChange={(value) => onViewChange(value as TasksView)}
          className="flex-1"
        >
          <TabsList
            className={cn(
              'w-full grid',
              isMobile ? 'grid-cols-4 h-9' : 'grid-cols-4 h-10'
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'relative flex items-center justify-center gap-1',
                    isMobile ? 'text-xs px-1' : 'text-sm px-2'
                  )}
                >
                  <Icon className={cn(isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                  <span className={cn(isMobile && 'hidden sm:inline')}>
                    {isMobile ? tab.shortLabel : tab.label}
                  </span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TasksTab({ initialView }: TasksTabProps) {
  // Check-in data hook - now uses TanStack Query for caching
  // Data is prefetched by useAppDataPrefetch in MainLayout for instant loading
  // Hook internally uses useAuth to get current user
  const {
    loading,
    checkInStatus,
    checkInStreak,
    reflectionStreak,
    checkInStreakData,
    reflectionStreakData,
    weeklyStats,
    reflectionStats,
    yesterdayGoal,
    lastSubmittedCheckIn,
    lastSubmittedReflection,
    yesterdayCheckInData,
    submitMorningCheckIn,
    submitEveningReflection,
    markYesterdayGoalComplete,
  } = useCheckInsQuery()

  // View state
  const [activeView, setActiveView] = useState<TasksView>(() => {
    if (initialView) return initialView
    return getSuggestedView(checkInStatus.morning, checkInStatus.evening)
  })

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Global modal store
  const { openModal } = useModalStore()

  // Update suggested view when check-in status changes (only on initial load)
  useEffect(() => {
    if (!initialView && !loading) {
      const suggested = getSuggestedView(checkInStatus.morning, checkInStatus.evening)
      setActiveView(suggested)
    }
  }, [checkInStatus.morning, checkInStatus.evening, initialView, loading])

  // Handle view change
  const handleViewChange = useCallback((view: TasksView) => {
    setActiveView(view)
  }, [])

  // Handle sidebar open
  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true)
  }, [])

  // Handle modal open - uses global modal store
  const handleOpenModal = useCallback((modal: string) => {
    openModal(modal as ModalName)
  }, [openModal])

  // Render content based on active view
  const content = useMemo(() => {
    switch (activeView) {
      case 'overview':
        return (
          <DailyOverview
            checkInStatus={checkInStatus}
            checkInStreak={checkInStreak}
            reflectionStreak={reflectionStreak}
            checkInStreakData={checkInStreakData}
            reflectionStreakData={reflectionStreakData}
            weeklyStats={weeklyStats}
            reflectionStats={reflectionStats}
            onNavigate={handleViewChange}
            onOpenModal={handleOpenModal}
          />
        )

      case 'checkin':
        return (
          <CheckInView
            checkInStatus={checkInStatus}
            checkInStreak={checkInStreak}
            checkInStreakData={checkInStreakData}
            weeklyStats={weeklyStats}
            onSubmit={submitMorningCheckIn}
            loading={loading}
            onOpenModal={handleOpenModal}
            onNavigate={handleViewChange}
            lastSubmittedData={lastSubmittedCheckIn}
            yesterdayCheckInData={yesterdayCheckInData}
          />
        )

      case 'reflections':
        return (
          <ReflectionView
            checkInStatus={checkInStatus}
            reflectionStreak={reflectionStreak}
            reflectionStreakData={reflectionStreakData}
            reflectionStats={reflectionStats}
            yesterdayGoal={yesterdayGoal}
            onSubmit={submitEveningReflection}
            onMarkGoalComplete={markYesterdayGoalComplete}
            loading={loading}
            onOpenModal={handleOpenModal}
            lastSubmittedReflection={lastSubmittedReflection}
          />
        )

      case 'golden':
        return <GoldenThreadView onOpenModal={handleOpenModal} />

      default:
        return null
    }
  }, [
    activeView,
    checkInStatus,
    checkInStreak,
    reflectionStreak,
    checkInStreakData,
    reflectionStreakData,
    weeklyStats,
    reflectionStats,
    yesterdayGoal,
    lastSubmittedCheckIn,
    lastSubmittedReflection,
    yesterdayCheckInData,
    loading,
    handleViewChange,
    handleOpenModal,
    submitMorningCheckIn,
    submitEveningReflection,
    markYesterdayGoalComplete,
  ])

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <TabHeader
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenSidebar={handleOpenSidebar}
        checkInStatus={checkInStatus}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{content}</div>

      {/* Sidebar */}
      <TasksSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenModal={handleOpenModal}
      />
      {/* Modals are rendered by ModalProvider at app root */}
    </div>
  )
}

export default TasksTab
