import { cn } from '@/lib/utils'

interface MorningBackgroundProps {
  opacity?: number
  className?: string
}

/**
 * Morning background illustration (5am - 12pm)
 * Features: Sunrise gradient, warm sun, gentle hills silhouette
 */
export function MorningBackground({ opacity = 1, className }: MorningBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
      style={{ opacity }}
    >
      {/* Gradient base - warm sunrise colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-200 via-amber-100 to-sky-100" />

      {/* Soft clouds */}
      <svg
        className="absolute top-8 left-10 w-24 h-12 text-white/60"
        viewBox="0 0 100 50"
      >
        <ellipse cx="35" cy="30" rx="25" ry="15" fill="currentColor" />
        <ellipse cx="60" cy="25" rx="20" ry="12" fill="currentColor" />
        <ellipse cx="50" cy="35" rx="22" ry="13" fill="currentColor" />
      </svg>

      <svg
        className="absolute top-16 right-20 w-16 h-8 text-white/40"
        viewBox="0 0 100 50"
      >
        <ellipse cx="35" cy="25" rx="20" ry="12" fill="currentColor" />
        <ellipse cx="55" cy="22" rx="15" ry="10" fill="currentColor" />
      </svg>

      {/* Rising Sun */}
      <svg
        className="absolute -bottom-16 right-8 w-48 h-48"
        viewBox="0 0 100 100"
      >
        {/* Sun glow */}
        <circle
          cx="50"
          cy="85"
          r="40"
          fill="url(#sunGlowMorning)"
          opacity="0.4"
        />
        {/* Main sun */}
        <circle cx="50" cy="85" r="28" fill="#FBBF24" opacity="0.9" />
        {/* Sun center highlight */}
        <circle cx="45" cy="80" r="12" fill="#FCD34D" opacity="0.6" />
        <defs>
          <radialGradient id="sunGlowMorning" cx="50%" cy="85%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Hills silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-32"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        {/* Back hills - lighter */}
        <path
          d="M0,100 L0,70 Q50,40 120,55 Q200,75 280,45 Q340,25 400,50 L400,100 Z"
          fill="currentColor"
          className="text-teal-900/15"
        />
        {/* Front hills - darker */}
        <path
          d="M0,100 L0,80 Q80,50 150,65 Q230,85 310,60 Q370,40 400,55 L400,100 Z"
          fill="currentColor"
          className="text-teal-900/25"
        />
      </svg>

      {/* Light rays */}
      <div className="absolute bottom-0 right-0 w-full h-full">
        <div
          className="absolute bottom-0 right-16 w-64 h-96 opacity-20"
          style={{
            background: 'linear-gradient(to top, transparent, rgba(251, 191, 36, 0.3))',
            transform: 'rotate(-15deg) translateY(30%)',
          }}
        />
      </div>
    </div>
  )
}

export default MorningBackground
