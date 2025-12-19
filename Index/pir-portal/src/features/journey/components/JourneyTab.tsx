import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Heart,
  Activity,
  DollarSign,
  Calendar,
  Star,
  Users,
  BookOpen,
  GraduationCap,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAuth } from '@/contexts/AuthContext'
import { useTab } from '@/contexts/TabContext'
import { PullToRefresh, TabHeader } from '@/components/common'
import { useJourneyQuery } from '@/hooks/queries'
import { useJourneyData } from '../hooks/useJourneyData'
import JourneyLifeTab from './JourneyLifeTab'
import JourneyWellnessTab from './JourneyWellnessTab'
import JourneyFinancesTab from './JourneyFinancesTab'
import JourneyCalendarTab from './JourneyCalendarTab'
import { MilestoneCalendar } from './MilestoneCalendar'
import { CustomMilestoneModal } from '../modals/CustomMilestoneModal'
import { RecoveryMeetingsModal } from '../modals/RecoveryMeetingsModal'
import { TwelveStepsModal } from '../modals/TwelveStepsModal'
import { RecoveryDharmaModal } from '../modals/RecoveryDharmaModal'
import { SmartRecoveryModal } from '../modals/SmartRecoveryModal'
import { EducationalGoalsModal } from '../modals/EducationalGoalsModal'
// Meeting tracker modals for non-12-step programs
import { RecoveryDharmaMeetingsModal } from '../modals/RecoveryDharmaMeetingsModal'
import { SmartRecoveryMeetingsModal } from '../modals/SmartRecoveryMeetingsModal'
// New individual program modals
import { AAModal } from '../modals/AAModal'
import { NAModal } from '../modals/NAModal'
import { CMAModal } from '../modals/CMAModal'
import { MAModal } from '../modals/MAModal'
import { WomenForSobrietyModal } from '../modals/WomenForSobrietyModal'
import { RECOVERY_PROGRAMS, type RecoveryProgram } from '../types/recovery'
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
  const { userData: authUserData } = useAuth()
  const { setActiveTab } = useTab()
  const [activeSubTab, setActiveSubTab] = useState<JourneySubTab>('life')
  const [showSidebar, setShowSidebar] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCalendarView, setShowCalendarView] = useState(false)

  // Modal states for core features
  const [showCustomMilestone, setShowCustomMilestone] = useState(false)
  const [showRecoveryMeetings, setShowRecoveryMeetings] = useState(false)
  const [showEducationalGoals, setShowEducationalGoals] = useState(false)

  // Modal states for recovery programs (individual modals)
  const [showAAModal, setShowAAModal] = useState(false)
  const [showNAModal, setShowNAModal] = useState(false)
  const [showCMAModal, setShowCMAModal] = useState(false)
  const [showMAModal, setShowMAModal] = useState(false)
  const [showWomenForSobriety, setShowWomenForSobriety] = useState(false)
  const [showTwelveSteps, setShowTwelveSteps] = useState(false)
  const [showRecoveryDharma, setShowRecoveryDharma] = useState(false)
  const [showSmartRecovery, setShowSmartRecovery] = useState(false)

  // Modal states for meeting trackers (separate from program progress modals)
  const [showRecoveryDharmaMeetings, setShowRecoveryDharmaMeetings] = useState(false)
  const [showSmartRecoveryMeetings, setShowSmartRecoveryMeetings] = useState(false)

  // Get user data for sobriety date
  const { userData } = useJourneyData()

  // Use Journey query hook for pull-to-refresh
  const { refreshData } = useJourneyQuery()

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refreshData()
  }, [refreshData])

  // Get user's selected recovery programs (now an array, up to 3)
  const userRecoveryPrograms = useMemo(() => {
    const rawData = authUserData as unknown as Record<string, unknown> | null
    // Support both new array format and legacy single value
    const programs = rawData?.recoveryPrograms as string[] | undefined
    const legacyProgram = rawData?.recoveryProgram as string | undefined

    if (programs && programs.length > 0) {
      return programs as RecoveryProgram[]
    }
    if (legacyProgram) {
      return [legacyProgram] as RecoveryProgram[]
    }
    return []
  }, [authUserData])

  // Get program info for selected programs
  const selectedPrograms = useMemo(() => {
    return userRecoveryPrograms
      .map(id => RECOVERY_PROGRAMS.find(p => p.id === id))
      .filter(Boolean) as typeof RECOVERY_PROGRAMS
  }, [userRecoveryPrograms])

  // Open the appropriate recovery program modal
  const openProgramModal = (programId: RecoveryProgram) => {
    setShowSidebar(false)
    switch (programId) {
      case 'aa':
        setShowAAModal(true)
        break
      case 'na':
        setShowNAModal(true)
        break
      case 'cma':
        setShowCMAModal(true)
        break
      case 'ma':
        setShowMAModal(true)
        break
      case 'women-for-sobriety':
        setShowWomenForSobriety(true)
        break
      case 'recovery-dharma':
        setShowRecoveryDharma(true)
        break
      case 'smart-recovery':
        setShowSmartRecovery(true)
        break
      default:
        // For 'other' or 'none', show nothing
        break
    }
  }

  // Parse sobriety date (handles both string and Timestamp formats)
  const sobrietyDate = useMemo(() => {
    if (!userData?.sobrietyDate) return null
    const sd = userData.sobrietyDate
    // Handle Firestore Timestamp
    if (typeof sd === 'object' && sd !== null && 'toDate' in sd && typeof (sd as { toDate: () => Date }).toDate === 'function') {
      return (sd as { toDate: () => Date }).toDate()
    }
    // Handle string format
    if (typeof sd === 'string') {
      const [year, month, day] = sd.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return null
  }, [userData?.sobrietyDate])

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
    // If calendar view is active, show calendar instead of sub-tabs
    if (showCalendarView) {
      return <JourneyCalendarTab sobrietyDate={sobrietyDate} />
    }

    switch (activeSubTab) {
      case 'life':
        return (
          <JourneyLifeTab
            onOpenSidebar={() => setShowSidebar(true)}
            onOpenProgramModal={openProgramModal}
            onOpenEducationalGoals={() => setShowEducationalGoals(true)}
            enabledPrograms={userRecoveryPrograms}
          />
        )
      case 'wellness':
        return <JourneyWellnessTab />
      case 'finances':
        return <JourneyFinancesTab />
      default:
        return (
          <JourneyLifeTab
            onOpenSidebar={() => setShowSidebar(true)}
            onOpenProgramModal={openProgramModal}
            onOpenEducationalGoals={() => setShowEducationalGoals(true)}
            enabledPrograms={userRecoveryPrograms}
          />
        )
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Journey Header - using standardized TabHeader */}
      <TabHeader
        title="Journey"
        onMenuClick={() => setShowSidebar(true)}
        onProfileClick={() => setActiveTab('profile')}
      >
        {/* Calendar button - toggles inline calendar view */}
        <button
          onClick={() => setShowCalendarView(!showCalendarView)}
          className={cn(
            'flex h-10 w-10 items-center justify-center',
            'rounded-full transition-colors',
            showCalendarView ? 'bg-primary/20' : 'hover:bg-black/5 active:bg-black/10',
            'cursor-pointer touch-manipulation'
          )}
          aria-label="My Calendar"
        >
          <Calendar className={cn('h-5 w-5', showCalendarView ? 'text-primary' : 'text-slate-700')} />
        </button>
      </TabHeader>

      {/* Sub-Tab Navigation - scrolls with content */}
      <div>
        <div className="flex px-4 md:mx-auto md:max-w-xl md:px-6">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id)
                  setShowCalendarView(false)
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5',
                  'py-2 transition-all',
                  'border-b-2',
                  isActive && !showCalendarView
                    ? 'border-slate-700 text-slate-800 font-medium'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area with Pull-to-Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1 overflow-auto"
      >
        {renderContent()}
      </PullToRefresh>

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
            <div className="p-4 space-y-6">
              {/* Milestones Section */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Milestones
                </h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowSidebar(false)
                      if (sobrietyDate) setShowCalendar(true)
                    }}
                    disabled={!sobrietyDate}
                  >
                    <Calendar className="mr-3 h-5 w-5 text-teal-600" />
                    Milestone Calendar
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowSidebar(false)
                      setShowCustomMilestone(true)
                    }}
                  >
                    <Star className="mr-3 h-5 w-5 text-amber-500" />
                    Custom Milestones
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Recovery Program Section */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Recovery Program
                </h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowSidebar(false)
                      setShowRecoveryMeetings(true)
                    }}
                  >
                    <Users className="mr-3 h-5 w-5 text-purple-600" />
                    12 Step Meetings
                  </Button>

                  {/* Conditional Meeting Tracker buttons for non-12-step programs */}
                  {userRecoveryPrograms.includes('recovery-dharma') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowSidebar(false)
                        setShowRecoveryDharmaMeetings(true)
                      }}
                    >
                      <Users className="mr-3 h-5 w-5 text-emerald-600" />
                      Recovery Dharma Meetings
                    </Button>
                  )}
                  {userRecoveryPrograms.includes('smart-recovery') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowSidebar(false)
                        setShowSmartRecoveryMeetings(true)
                      }}
                    >
                      <Users className="mr-3 h-5 w-5 text-amber-600" />
                      SMART Recovery Meetings
                    </Button>
                  )}

                  {/* Dynamic buttons for each selected program (up to 3) */}
                  {selectedPrograms.map((program) => (
                    <Button
                      key={program.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => openProgramModal(program.id)}
                    >
                      <Compass
                        className="mr-3 h-5 w-5"
                        style={{ color: program.color }}
                      />
                      {program.shortName} Progress
                    </Button>
                  ))}
                </div>
                {selectedPrograms.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground px-2">
                    Set your recovery programs in Profile to get customized tools.
                  </p>
                )}
              </div>

              <Separator />

              {/* Education Section */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Education & Growth
                </h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowSidebar(false)
                      setShowEducationalGoals(true)
                    }}
                  >
                    <GraduationCap className="mr-3 h-5 w-5 text-emerald-600" />
                    Educational Goals
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="rounded-xl bg-primary/10 p-4">
                <h3 className="mb-2 font-medium text-primary">Journey Insights</h3>
                <p className="text-xs text-muted-foreground">
                  Track your progress across recovery, education, and personal milestones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Calendar Modal */}
      {sobrietyDate && (
        <MilestoneCalendar
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          sobrietyDate={sobrietyDate}
        />
      )}

      {/* Custom Milestone Modal */}
      <CustomMilestoneModal
        isOpen={showCustomMilestone}
        onClose={() => setShowCustomMilestone(false)}
      />

      {/* Recovery Meetings Modal */}
      <RecoveryMeetingsModal
        isOpen={showRecoveryMeetings}
        onClose={() => setShowRecoveryMeetings(false)}
      />

      {/* 12 Steps Modal */}
      <TwelveStepsModal
        isOpen={showTwelveSteps}
        onClose={() => setShowTwelveSteps(false)}
      />

      {/* Recovery Dharma Modal */}
      <RecoveryDharmaModal
        isOpen={showRecoveryDharma}
        onClose={() => setShowRecoveryDharma(false)}
      />

      {/* SMART Recovery Modal */}
      <SmartRecoveryModal
        isOpen={showSmartRecovery}
        onClose={() => setShowSmartRecovery(false)}
      />

      {/* Educational Goals Modal */}
      <EducationalGoalsModal
        isOpen={showEducationalGoals}
        onClose={() => setShowEducationalGoals(false)}
      />

      {/* === NEW INDIVIDUAL PROGRAM MODALS === */}

      {/* AA Modal */}
      <AAModal
        isOpen={showAAModal}
        onClose={() => setShowAAModal(false)}
      />

      {/* NA Modal */}
      <NAModal
        isOpen={showNAModal}
        onClose={() => setShowNAModal(false)}
      />

      {/* CMA Modal */}
      <CMAModal
        isOpen={showCMAModal}
        onClose={() => setShowCMAModal(false)}
      />

      {/* MA Modal */}
      <MAModal
        isOpen={showMAModal}
        onClose={() => setShowMAModal(false)}
      />

      {/* Women for Sobriety Modal */}
      <WomenForSobrietyModal
        isOpen={showWomenForSobriety}
        onClose={() => setShowWomenForSobriety(false)}
      />

      {/* === MEETING TRACKER MODALS (Non-12-Step Programs) === */}

      {/* Recovery Dharma Meetings Tracker */}
      <RecoveryDharmaMeetingsModal
        isOpen={showRecoveryDharmaMeetings}
        onClose={() => setShowRecoveryDharmaMeetings(false)}
      />

      {/* SMART Recovery Meetings Tracker */}
      <SmartRecoveryMeetingsModal
        isOpen={showSmartRecoveryMeetings}
        onClose={() => setShowSmartRecoveryMeetings(false)}
      />
    </div>
  )
}

export default JourneyTab
