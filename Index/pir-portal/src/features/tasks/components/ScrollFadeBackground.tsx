import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTimeOfDay, type TimeOfDay } from '../hooks/useTimeOfDay'
import {
  MorningBackground,
  AfternoonBackground,
  EveningBackground,
  NightBackground,
} from './illustrations'

// =============================================================================
// TYPES
// =============================================================================

interface ScrollFadeBackgroundProps {
  children: React.ReactNode
  className?: string
  fadeStart?: number // Scroll position to start fading (in pixels)
  fadeEnd?: number // Scroll position to complete fade (in pixels)
  minOpacity?: number // Minimum opacity when fully faded
}

// =============================================================================
// BACKGROUND SELECTOR
// =============================================================================

interface TimeBasedBackgroundProps {
  timeOfDay: TimeOfDay
  opacity: number
}

function TimeBasedBackground({ timeOfDay, opacity }: TimeBasedBackgroundProps) {
  switch (timeOfDay) {
    case 'morning':
      return <MorningBackground opacity={opacity} />
    case 'afternoon':
      return <AfternoonBackground opacity={opacity} />
    case 'evening':
      return <EveningBackground opacity={opacity} />
    case 'night':
      return <NightBackground opacity={opacity} />
    default:
      return <MorningBackground opacity={opacity} />
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * ScrollFadeBackground - A container with time-based background that fades on scroll.
 *
 * Features:
 * - Automatically selects background based on time of day
 * - Smoothly fades background as user scrolls down
 * - Uses Framer Motion's useScroll and useTransform for performance
 *
 * @example
 * <ScrollFadeBackground>
 *   <YourContent />
 * </ScrollFadeBackground>
 */
export function ScrollFadeBackground({
  children,
  className,
  fadeStart = 0,
  fadeEnd = 150,
  minOpacity = 0,
}: ScrollFadeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timeOfDay = useTimeOfDay()

  // Track scroll position within the container
  const { scrollY } = useScroll({
    container: containerRef,
  })

  // Calculate intermediate stops for a smoother, longer fade
  // Creates a gradient that holds longer at the start and fades gradually through the middle
  const fadeRange = fadeEnd - fadeStart
  const stop1 = fadeStart + fadeRange * 0.15  // 15% - still nearly full
  const stop2 = fadeStart + fadeRange * 0.35  // 35% - start fading
  const stop3 = fadeStart + fadeRange * 0.55  // 55% - mid fade
  const stop4 = fadeStart + fadeRange * 0.75  // 75% - mostly faded
  const stop5 = fadeStart + fadeRange * 0.90  // 90% - nearly done

  // Transform scroll position to opacity with multiple stops
  // Creates a smoother, more gradual fade through the viewport
  const backgroundOpacity = useTransform(
    scrollY,
    [fadeStart, stop1, stop2, stop3, stop4, stop5, fadeEnd],
    [1, 0.95, 0.75, 0.45, 0.25, 0.12, minOpacity]
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full overflow-auto',
        className
      )}
    >
      {/* Fixed background layer that fades with scroll */}
      <motion.div
        className="sticky top-0 left-0 right-0 h-64 pointer-events-none z-0 overflow-hidden"
        style={{ opacity: backgroundOpacity }}
      >
        <TimeBasedBackground timeOfDay={timeOfDay} opacity={1} />
      </motion.div>

      {/* Content layer - positioned above background */}
      <div className="relative z-10 -mt-64">
        {children}
      </div>
    </div>
  )
}

// =============================================================================
// SIMPLIFIED VERSION (NO SCROLL TRACKING)
// =============================================================================

interface StaticTimeBackgroundProps {
  children: React.ReactNode
  className?: string
  showBackground?: boolean
}

/**
 * StaticTimeBackground - Simpler version with just time-based background, no scroll fade.
 * Useful for smaller sections that don't scroll.
 */
export function StaticTimeBackground({
  children,
  className,
  showBackground = true,
}: StaticTimeBackgroundProps) {
  const timeOfDay = useTimeOfDay()

  return (
    <div className={cn('relative', className)}>
      {/* Background layer */}
      {showBackground && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <TimeBasedBackground timeOfDay={timeOfDay} opacity={0.6} />
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// =============================================================================
// HERO BACKGROUND VERSION
// =============================================================================

interface HeroBackgroundProps {
  className?: string
  height?: string
}

/**
 * HeroBackground - A full-width hero background for the top of the overview.
 * Shows time-based background at full opacity.
 */
export function HeroBackground({ className, height = 'h-48' }: HeroBackgroundProps) {
  const timeOfDay = useTimeOfDay()

  return (
    <div className={cn('relative overflow-hidden rounded-xl', height, className)}>
      <TimeBasedBackground timeOfDay={timeOfDay} opacity={1} />
    </div>
  )
}

export default ScrollFadeBackground
