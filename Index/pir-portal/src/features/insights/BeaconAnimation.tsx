/**
 * BeaconAnimation Component
 *
 * Polished, minimal lighthouse beacon with clean lines and smooth glow.
 * Apple-level design - simple geometry, refined proportions.
 */

import { motion } from 'framer-motion'

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const lighthousePulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const beaconGlowVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const lightBeamVariants = {
  initial: { opacity: 0.3, scaleX: 1 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scaleX: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const pulseRingVariants = {
  initial: { scale: 1, opacity: 0 },
  animate: {
    scale: [1, 2.5, 3],
    opacity: [0.5, 0.2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeOut' as const,
    },
  },
}

// =============================================================================
// POLISHED LIGHTHOUSE SVG
// =============================================================================

function LighthouseSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient definitions */}
      <defs>
        {/* Tower gradient - clean slate tones */}
        <linearGradient id="towerGradient" x1="24" y1="28" x2="40" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Beacon glass gradient - violet to cyan */}
        <linearGradient id="beaconGradient" x1="26" y1="18" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Roof gradient */}
        <linearGradient id="roofGradient" x1="22" y1="10" x2="42" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Base gradient */}
        <linearGradient id="baseGradient" x1="18" y1="72" x2="46" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Beacon glow filter */}
        <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lighthouse tower - clean trapezoid shape */}
      <path
        d="M26 28 L24 72 L40 72 L38 28 Z"
        fill="url(#towerGradient)"
        stroke="rgba(148, 163, 184, 0.3)"
        strokeWidth="0.5"
      />

      {/* Tower stripe 1 */}
      <path
        d="M25.2 42 L38.8 42 L38.5 48 L25.5 48 Z"
        fill="rgba(30, 41, 59, 0.4)"
      />

      {/* Tower stripe 2 */}
      <path
        d="M24.6 56 L39.4 56 L39.1 62 L24.9 62 Z"
        fill="rgba(30, 41, 59, 0.4)"
      />

      {/* Beacon housing - clean rectangle */}
      <rect
        x="26"
        y="20"
        width="12"
        height="8"
        rx="1"
        fill="url(#towerGradient)"
        stroke="rgba(148, 163, 184, 0.4)"
        strokeWidth="0.5"
      />

      {/* Beacon glass - the glowing part */}
      <rect
        x="28"
        y="22"
        width="8"
        height="4"
        rx="0.5"
        fill="url(#beaconGradient)"
        filter="url(#beaconGlow)"
      />

      {/* Roof - clean triangle */}
      <path
        d="M24 20 L32 10 L40 20 Z"
        fill="url(#roofGradient)"
        stroke="rgba(99, 102, 241, 0.3)"
        strokeWidth="0.5"
      />

      {/* Roof cap */}
      <circle
        cx="32"
        cy="10"
        r="2"
        fill="#818cf8"
      />

      {/* Base platform */}
      <rect
        x="20"
        y="72"
        width="24"
        height="4"
        rx="1"
        fill="url(#baseGradient)"
      />

      {/* Window details on tower */}
      <rect x="30" y="34" width="4" height="5" rx="0.5" fill="rgba(6, 182, 212, 0.3)" />
      <rect x="30" y="50" width="4" height="5" rx="0.5" fill="rgba(6, 182, 212, 0.2)" />
    </svg>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface BeaconAnimationProps {
  /** Size of the beacon in pixels */
  size?: number
  /** Whether to show light rays */
  showRays?: boolean
}

export function BeaconAnimation({ size = 120, showRays = true }: BeaconAnimationProps) {
  const beaconLightSize = size * 0.15

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />

      {/* Pulse rings emanating from beacon */}
      <motion.div
        variants={pulseRingVariants}
        initial="initial"
        animate="animate"
        className="absolute rounded-full border border-violet-400/20"
        style={{
          width: beaconLightSize,
          height: beaconLightSize,
          top: '18%',
        }}
      />
      <motion.div
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: [1, 2.5, 3],
          opacity: [0.5, 0.2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeOut' as const,
          delay: 1.5,
        }}
        className="absolute rounded-full border border-cyan-400/15"
        style={{
          width: beaconLightSize,
          height: beaconLightSize,
          top: '18%',
        }}
      />

      {/* Light beam effect - left */}
      {showRays && (
        <>
          <motion.div
            variants={lightBeamVariants}
            initial="initial"
            animate="animate"
            className="absolute origin-right"
            style={{
              width: size * 0.35,
              height: 3,
              top: '22%',
              right: '58%',
              background: 'linear-gradient(to left, rgba(139, 92, 246, 0.5) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 100%)',
              borderRadius: 2,
              filter: 'blur(1px)',
            }}
          />
          {/* Light beam effect - right */}
          <motion.div
            variants={lightBeamVariants}
            initial="initial"
            animate="animate"
            className="absolute origin-left"
            style={{
              width: size * 0.35,
              height: 3,
              top: '22%',
              left: '58%',
              background: 'linear-gradient(to right, rgba(139, 92, 246, 0.5) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 100%)',
              borderRadius: 2,
              filter: 'blur(1px)',
            }}
          />
        </>
      )}

      {/* Beacon light glow */}
      <motion.div
        variants={beaconGlowVariants}
        initial="initial"
        animate="animate"
        className="absolute rounded-full"
        style={{
          width: beaconLightSize,
          height: beaconLightSize * 0.5,
          top: '20%',
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.8) 0%, rgba(6, 182, 212, 0.4) 50%, transparent 100%)',
          boxShadow: `
            0 0 15px rgba(139, 92, 246, 0.6),
            0 0 30px rgba(139, 92, 246, 0.4),
            0 0 45px rgba(6, 182, 212, 0.3)
          `,
          filter: 'blur(2px)',
        }}
      />

      {/* Lighthouse SVG */}
      <motion.div
        variants={lighthousePulseVariants}
        initial="initial"
        animate="animate"
        className="relative"
        style={{
          width: size * 0.6,
          height: size * 0.75,
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
        }}
      >
        <LighthouseSVG className="w-full h-full" />
      </motion.div>
    </div>
  )
}

export default BeaconAnimation
