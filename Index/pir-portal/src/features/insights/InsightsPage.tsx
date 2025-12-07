/**
 * InsightsPage Component
 *
 * Dedicated page for AI Insights with premium loading experience.
 * Shows loading screen first, then transitions to content.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { InsightsLoadingScreen } from './InsightsLoadingScreen'
import { AIInsightsContent } from './AIInsightsContent'
import { useAIInsightsData } from '@/features/tasks/ai-insights/useAIInsightsData'

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number], // Smooth deceleration (cubic-bezier)
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InsightsPage() {
  const navigate = useNavigate()
  const [showLoading, setShowLoading] = useState(true)

  // Start fetching data immediately
  const data = useAIInsightsData()
  const { loading: dataLoading } = data

  // Handle back navigation to tasks
  const handleBack = useCallback(() => {
    navigate('/#tasks')
  }, [navigate])

  // Handle loading screen completion
  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false)
  }, [])

  return (
    <div className="h-screen bg-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        {showLoading ? (
          <InsightsLoadingScreen
            key="loading"
            dataReady={!dataLoading}
            minimumDuration={2000}
            onComplete={handleLoadingComplete}
          />
        ) : (
          <motion.div
            key="content"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            <AIInsightsContent onClose={handleBack} data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InsightsPage
