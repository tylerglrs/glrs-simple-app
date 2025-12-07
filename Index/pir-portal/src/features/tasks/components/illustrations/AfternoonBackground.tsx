import { cn } from '@/lib/utils'

interface AfternoonBackgroundProps {
  opacity?: number
  className?: string
}

/**
 * Afternoon background illustration (12pm - 5pm)
 * Features: Clear sky gradient, bright sun, gentle clouds
 */
export function AfternoonBackground({ opacity = 1, className }: AfternoonBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
      style={{ opacity }}
    >
      {/* Gradient base - clear sky blue */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-cyan-100" />

      {/* Floating clouds */}
      <svg
        className="absolute top-6 left-8 w-32 h-16 text-white/70"
        viewBox="0 0 120 60"
      >
        <ellipse cx="40" cy="35" rx="30" ry="18" fill="currentColor" />
        <ellipse cx="70" cy="28" rx="25" ry="15" fill="currentColor" />
        <ellipse cx="55" cy="40" rx="28" ry="16" fill="currentColor" />
      </svg>

      <svg
        className="absolute top-20 right-12 w-24 h-12 text-white/60"
        viewBox="0 0 100 50"
      >
        <ellipse cx="30" cy="28" rx="22" ry="14" fill="currentColor" />
        <ellipse cx="55" cy="24" rx="18" ry="12" fill="currentColor" />
        <ellipse cx="45" cy="32" rx="20" ry="13" fill="currentColor" />
      </svg>

      <svg
        className="absolute top-32 left-1/3 w-20 h-10 text-white/50"
        viewBox="0 0 100 50"
      >
        <ellipse cx="35" cy="25" rx="18" ry="12" fill="currentColor" />
        <ellipse cx="58" cy="22" rx="15" ry="10" fill="currentColor" />
      </svg>

      {/* Bright Sun - high position */}
      <svg
        className="absolute top-4 right-12 w-32 h-32"
        viewBox="0 0 100 100"
      >
        {/* Outer glow */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#sunGlowAfternoon)"
          opacity="0.3"
        />
        {/* Middle glow */}
        <circle cx="50" cy="50" r="32" fill="#FDE68A" opacity="0.4" />
        {/* Main sun */}
        <circle cx="50" cy="50" r="22" fill="#FBBF24" opacity="0.95" />
        {/* Sun center highlight */}
        <circle cx="44" cy="44" r="10" fill="#FEF3C7" opacity="0.6" />
        <defs>
          <radialGradient id="sunGlowAfternoon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Distant mountains/hills silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-28"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        {/* Back range - lighter */}
        <path
          d="M0,100 L0,65 Q60,35 130,50 Q200,70 270,40 Q330,20 400,45 L400,100 Z"
          fill="currentColor"
          className="text-sky-900/10"
        />
        {/* Front range - slightly darker */}
        <path
          d="M0,100 L0,75 Q70,45 140,60 Q220,80 300,55 Q360,35 400,50 L400,100 Z"
          fill="currentColor"
          className="text-teal-900/15"
        />
      </svg>

      {/* Subtle light rays */}
      <div
        className="absolute top-0 right-8 w-64 h-80 opacity-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.4), transparent)',
          transform: 'rotate(-10deg)',
        }}
      />
    </div>
  )
}

export default AfternoonBackground
