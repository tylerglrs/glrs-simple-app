/**
 * AIInsightsContent Component
 *
 * Page-ready version of AIInsightsHub without dialog wrapper.
 * Contains all the same functionality but rendered as page content.
 * Includes "Back to Tasks" navigation button.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Using native scroll instead of ScrollArea for better mobile touch scrolling
import {
  ArrowLeft,
  Sparkles,
  BarChart3,
  BookHeart,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics } from '@/lib/animations'
import type { BeaconTab } from '@/features/tasks/ai-insights/types'
import type { AIInsightsData } from '@/features/tasks/ai-insights'

// Import tab components (2 tabs: Patterns, Reflect)
import {
  PatternsTabPlaceholder,
  ReflectionsTabPlaceholder,
} from '@/features/tasks/ai-insights/tabs'

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const tabContentVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
}

const pulseVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const glowVariants = {
  initial: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
  animate: {
    boxShadow: [
      '0 0 20px rgba(139, 92, 246, 0.3)',
      '0 0 40px rgba(139, 92, 246, 0.5)',
      '0 0 20px rgba(139, 92, 246, 0.3)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

// =============================================================================
// TAB CONFIGURATION
// =============================================================================

interface TabConfig {
  id: BeaconTab
  label: string
  shortLabel: string
  icon: React.ReactNode
  description: string
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'patterns',
    label: 'Patterns',
    shortLabel: 'Patterns',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Mood, anxiety, and behavior patterns',
  },
  {
    id: 'reflect',
    label: 'Reflect',
    shortLabel: 'Reflect',
    icon: <BookHeart className="h-4 w-4" />,
    description: 'Gratitude and reflection themes',
  },
]

// =============================================================================
// SKELETON LOADERS
// =============================================================================

function TabContentSkeleton() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 p-4"
    >
      {/* Hero skeleton */}
      <motion.div
        variants={itemVariants}
        className="h-40 rounded-2xl bg-slate-800/50 animate-pulse"
      />

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="h-24 rounded-xl bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>

      {/* Insight skeleton */}
      <motion.div
        variants={itemVariants}
        className="h-32 rounded-xl bg-slate-800/50 animate-pulse"
      />
    </motion.div>
  )
}

// =============================================================================
// AI INDICATOR COMPONENT
// =============================================================================

function AIIndicator({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="relative flex items-center gap-2">
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        className="relative"
      >
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 rounded-full"
        />
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-white" />
          )}
        </div>
      </motion.div>
      <div>
        <span className="text-xs font-medium text-violet-300">
          {isGenerating ? 'Analyzing...' : 'Beacon'}
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// TAB NAVIGATION COMPONENT
// =============================================================================

interface TabNavigationProps {
  activeTab: BeaconTab
  onTabChange: (tab: BeaconTab) => void
  isMobile: boolean
}

function TabNavigation({ activeTab, onTabChange, isMobile }: TabNavigationProps) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Tab buttons container - scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 min-w-max">
          {TAB_CONFIGS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.tap()
                  onTabChange(tab.id)
                }}
                className={cn(
                  'relative flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200',
                  'text-xs font-medium min-h-touch whitespace-nowrap',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                )}
              >
                {/* Active background indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPage"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600/80 to-cyan-600/80 backdrop-blur-sm"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">
                  {isMobile ? tab.shortLabel : tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface AIInsightsContentProps {
  /** Handler for back navigation */
  onClose: () => void
  /** Pre-fetched data from parent component */
  data: AIInsightsData
  /** Initial tab to display */
  initialTab?: BeaconTab
}

export function AIInsightsContent({
  onClose,
  data,
  initialTab = 'patterns',
}: AIInsightsContentProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [activeTab, setActiveTab] = useState<BeaconTab>(initialTab)
  const { loading, refreshing, refresh, lastUpdated } = data

  const handleRefresh = () => {
    haptics.tap()
    refresh()
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return <TabContentSkeleton />
    }

    switch (activeTab) {
      case 'patterns':
        return <PatternsTabPlaceholder data={data} />
      case 'reflect':
        return <ReflectionsTabPlaceholder data={data} />
      default:
        return <PatternsTabPlaceholder data={data} />
    }
  }

  return (
    <div className="relative h-full flex flex-col bg-slate-900">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-slate-900 to-cyan-900/20 pointer-events-none" />

      {/* Animated glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/30 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Back to Tasks button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 border-b border-slate-700/50"
        >
          {/* Left side: Back button + AI Indicator */}
          <div className="flex items-center gap-3">
            {/* Back to Tasks button */}
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptics.tap()
                onClose()
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Back to Tasks</span>
            </motion.button>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-700/50 hidden sm:block" />

            <AIIndicator isGenerating={refreshing} />
          </div>

          {/* Right side: Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'text-slate-400 hover:text-white hover:bg-slate-800/50',
              refreshing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-3 pt-3 md:px-4 md:pt-4"
        >
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMobile={isMobile}
          />
        </motion.div>

        {/* Tab Content - Native scroll for better mobile touch scrolling */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-3 py-2 md:px-4 md:py-3 border-t border-slate-700/50 flex items-center justify-between"
        >
          <span className="text-xs text-slate-500">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString()}`
              : 'Loading...'}
          </span>
          <span className="text-xs text-slate-500">Beacon</span>
        </motion.div>
      </div>
    </div>
  )
}

export default AIInsightsContent
