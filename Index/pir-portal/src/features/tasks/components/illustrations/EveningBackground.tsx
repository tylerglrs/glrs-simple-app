import { cn } from '@/lib/utils'

interface EveningBackgroundProps {
  opacity?: number
  className?: string
}

/**
 * Evening background illustration (5pm - 9pm)
 * Features: Sunset gradient, warm orange-purple sky, setting sun
 */
export function EveningBackground({ opacity = 1, className }: EveningBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
      style={{ opacity }}
    >
      {/* Gradient base - sunset colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-rose-300 to-purple-300" />

      {/* Dramatic clouds with sunset colors */}
      <svg
        className="absolute top-8 left-6 w-36 h-18"
        viewBox="0 0 140 70"
      >
        <ellipse cx="45" cy="40" rx="35" ry="20" fill="#FED7AA" opacity="0.8" />
        <ellipse cx="80" cy="32" rx="28" ry="16" fill="#FDBA74" opacity="0.7" />
        <ellipse cx="65" cy="48" rx="32" ry="18" fill="#FB923C" opacity="0.5" />
      </svg>

      <svg
        className="absolute top-20 right-8 w-28 h-14"
        viewBox="0 0 120 60"
      >
        <ellipse cx="40" cy="32" rx="28" ry="16" fill="#FCA5A5" opacity="0.7" />
        <ellipse cx="70" cy="28" rx="22" ry="14" fill="#FDA4AF" opacity="0.6" />
        <ellipse cx="55" cy="38" rx="25" ry="15" fill="#F9A8D4" opacity="0.5" />
      </svg>

      {/* Small accent cloud */}
      <svg
        className="absolute top-36 left-1/4 w-16 h-8"
        viewBox="0 0 80 40"
      >
        <ellipse cx="28" cy="22" rx="18" ry="12" fill="#FECACA" opacity="0.5" />
        <ellipse cx="48" cy="18" rx="14" ry="10" fill="#FED7AA" opacity="0.4" />
      </svg>

      {/* Setting Sun - partially visible on horizon */}
      <svg
        className="absolute -bottom-20 left-1/4 w-56 h-56"
        viewBox="0 0 100 100"
      >
        {/* Outer glow - large and soft */}
        <circle
          cx="50"
          cy="90"
          r="50"
          fill="url(#sunGlowEvening)"
          opacity="0.5"
        />
        {/* Inner glow */}
        <circle cx="50" cy="90" r="35" fill="#F97316" opacity="0.4" />
        {/* Main sun */}
        <circle cx="50" cy="90" r="25" fill="#EA580C" opacity="0.9" />
        {/* Sun highlight */}
        <circle cx="42" cy="82" r="10" fill="#FB923C" opacity="0.7" />
        <defs>
          <radialGradient id="sunGlowEvening" cx="50%" cy="90%" r="60%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Hills silhouette - darker for evening */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-36"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        {/* Back hills */}
        <path
          d="M0,100 L0,60 Q50,30 120,48 Q200,68 280,38 Q340,15 400,40 L400,100 Z"
          fill="currentColor"
          className="text-purple-900/30"
        />
        {/* Front hills - darkest */}
        <path
          d="M0,100 L0,72 Q80,42 150,58 Q230,78 310,52 Q370,30 400,48 L400,100 Z"
          fill="currentColor"
          className="text-purple-950/45"
        />
      </svg>

      {/* Warm light rays from sun */}
      <div
        className="absolute bottom-0 left-1/4 w-80 h-full opacity-15"
        style={{
          background: 'linear-gradient(to top, rgba(251, 146, 60, 0.6), transparent 70%)',
        }}
      />
    </div>
  )
}

export default EveningBackground
