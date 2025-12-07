import { cn } from '@/lib/utils'

interface NightBackgroundProps {
  opacity?: number
  className?: string
}

/**
 * Night background illustration (9pm - 5am)
 * Features: Dark sky gradient, crescent moon, twinkling stars
 */
export function NightBackground({ opacity = 1, className }: NightBackgroundProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
      style={{ opacity }}
    >
      {/* Gradient base - deep night sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950" />

      {/* Twinkling stars - scattered throughout */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        {/* Large stars */}
        <circle cx="50" cy="40" r="2" fill="#F1F5F9" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="25" r="1.5" fill="#E2E8F0" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="50" r="2" fill="#F1F5F9" opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.35;0.85" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="320" cy="35" r="1.8" fill="#E2E8F0" opacity="0.75">
          <animate attributeName="opacity" values="0.75;0.25;0.75" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="380" cy="60" r="1.5" fill="#F1F5F9" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.8s" repeatCount="indefinite" />
        </circle>

        {/* Medium stars */}
        <circle cx="30" cy="80" r="1.2" fill="#CBD5E1" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="90" cy="70" r="1" fill="#E2E8F0" opacity="0.65">
          <animate attributeName="opacity" values="0.65;0.2;0.65" dur="2.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="90" r="1.3" fill="#F1F5F9" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.25;0.7" dur="4.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="250" cy="75" r="1" fill="#CBD5E1" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="340" cy="95" r="1.2" fill="#E2E8F0" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.9s" repeatCount="indefinite" />
        </circle>

        {/* Small stars */}
        <circle cx="70" cy="120" r="0.8" fill="#CBD5E1" opacity="0.5" />
        <circle cx="170" cy="130" r="0.8" fill="#E2E8F0" opacity="0.5" />
        <circle cx="280" cy="115" r="0.8" fill="#CBD5E1" opacity="0.5" />
        <circle cx="360" cy="140" r="0.8" fill="#E2E8F0" opacity="0.5" />
        <circle cx="40" cy="150" r="0.7" fill="#CBD5E1" opacity="0.4" />
        <circle cx="130" cy="155" r="0.7" fill="#E2E8F0" opacity="0.4" />
        <circle cx="220" cy="145" r="0.7" fill="#CBD5E1" opacity="0.4" />
        <circle cx="310" cy="160" r="0.7" fill="#E2E8F0" opacity="0.4" />
      </svg>

      {/* Crescent Moon */}
      <svg
        className="absolute top-8 right-12 w-24 h-24"
        viewBox="0 0 100 100"
      >
        {/* Moon glow */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="url(#moonGlow)"
          opacity="0.4"
        />
        {/* Main moon shape - crescent created with clipPath */}
        <defs>
          <clipPath id="crescentClip">
            <circle cx="50" cy="50" r="25" />
          </clipPath>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g clipPath="url(#crescentClip)">
          {/* Moon base */}
          <circle cx="50" cy="50" r="25" fill="#F1F5F9" opacity="0.95" />
          {/* Cutout circle to create crescent */}
          <circle cx="62" cy="45" r="20" fill="#0F172A" />
        </g>
        {/* Moon surface details */}
        <circle cx="38" cy="55" r="3" fill="#E2E8F0" opacity="0.3" />
        <circle cx="45" cy="65" r="2" fill="#E2E8F0" opacity="0.25" />
        <circle cx="35" cy="45" r="2.5" fill="#E2E8F0" opacity="0.2" />
      </svg>

      {/* Subtle aurora effect */}
      <div
        className="absolute top-0 left-0 right-0 h-48 opacity-15"
        style={{
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 30%, transparent 100%)',
        }}
      />

      {/* Hills silhouette - very dark */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-28"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        {/* Single dark silhouette */}
        <path
          d="M0,100 L0,65 Q60,35 130,52 Q200,72 270,42 Q330,20 400,48 L400,100 Z"
          fill="#0F172A"
          opacity="0.8"
        />
      </svg>

      {/* Very subtle light from moon */}
      <div
        className="absolute top-0 right-0 w-48 h-48 opacity-5"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(241, 245, 249, 0.4), transparent 60%)',
        }}
      />
    </div>
  )
}

export default NightBackground
