import { motion } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useJourneyData } from '../hooks/useJourneyData'
import { SobrietyTimer } from './SobrietyTimer'
import { MilestoneBadges } from './MilestoneBadges'
import {
  MeetingGoalsSection,
  MeetingMilestonesSection,
  RecoveryProgramProgressSection,
  EducationalGoalsSection,
} from './LifeTabSections'
import type { RecoveryProgram } from '../types/recovery'

// =============================================================================
// TYPES
// =============================================================================

interface JourneyLifeTabProps {
  /** Function to open the sidebar for meeting goals */
  onOpenSidebar?: () => void
  /** Function to open a specific recovery program modal */
  onOpenProgramModal?: (programId: RecoveryProgram) => void
  /** Function to open the educational goals modal */
  onOpenEducationalGoals?: () => void
  /** User's enabled recovery programs */
  enabledPrograms?: RecoveryProgram[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export function JourneyLifeTab({
  onOpenSidebar,
  onOpenProgramModal,
  onOpenEducationalGoals,
  enabledPrograms = [],
}: JourneyLifeTabProps) {
  // Hooks
  const { userData, daysSober, loading, error } = useJourneyData()

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 pt-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Journey...</p>
        </div>
      )
    }

    // Error state
    if (error) {
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 p-5 pt-32">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-center text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )
    }

    // No sobriety date set
    if (!userData?.sobrietyDate) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center pt-32">
          <div className="mb-4 text-6xl">&#x1F331;</div>
          <h3 className="text-lg font-semibold text-slate-700">Set Your Sobriety Date</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Go to your Profile to set your sobriety date and start tracking your journey.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.hash = '#profile'
            }}
          >
            Go to Profile
          </Button>
        </div>
      )
    }

    // Normal content with sobriety data
    return (
      <div className="flex flex-col">
        {/* Spacer for background visibility at top - matches Tasks tab */}
        <div className="h-8" />

        {/* Timer Section - sits on top of illustration */}
        <div className="px-4">
          <SobrietyTimer
            sobrietyDate={userData.sobrietyDate}
            onSettingsClick={() => {
              window.location.hash = '#profile'
            }}
            showShare={true}
            showSettings={true}
          />
        </div>

        {/* Spacer to push content below illustration - matches Tasks tab */}
        <div className="h-16" />

        {/* Content below - scrolls into illustration area */}
        <div className="mx-auto w-full px-4 md:max-w-xl md:px-5">
          {/* Recovery Milestones - 30+ badges with PNG icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4"
          >
            <h4 className="mb-3 text-base font-semibold text-foreground">Recovery Milestones</h4>
            <MilestoneBadges sobrietyDays={daysSober} />
          </motion.div>

          {/* Meeting Goals Section */}
          {onOpenSidebar && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <MeetingGoalsSection onOpenSidebar={onOpenSidebar} />
            </motion.div>
          )}

          {/* Meeting Milestones Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <MeetingMilestonesSection />
          </motion.div>

          {/* Recovery Program Progress Section */}
          {enabledPrograms.length > 0 && onOpenProgramModal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <RecoveryProgramProgressSection
                enabledPrograms={enabledPrograms}
                onOpenProgramModal={onOpenProgramModal}
              />
            </motion.div>
          )}

          {/* Educational Goals Section */}
          {onOpenEducationalGoals && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EducationalGoalsSection onOpenModal={onOpenEducationalGoals} />
            </motion.div>
          )}

          {/* Bottom Spacing */}
          <div className="h-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  )
}

export default JourneyLifeTab
