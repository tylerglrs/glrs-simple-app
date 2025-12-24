import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Video,
  MapPin,
  Wifi,
  Accessibility,
  Ear,
  Hand,
  Users,
  Lock,
  MessageSquare,
  Mic,
  BookOpen,
  ListOrdered
} from 'lucide-react'

// ============================================================
// PROGRAM TYPE COLORS - WCAG AA COMPLIANT (4.5:1 minimum)
// ============================================================

export const PROGRAM_COLORS = {
  aa: {
    bg: '#1D4ED8',      // Darker Blue (from #3B82F6) - 5.74:1 contrast
    text: '#FFFFFF',
    label: 'AA',
    fullName: 'Alcoholics Anonymous'
  },
  na: {
    bg: '#15803D',      // Darker Green (from #22C55E) - 4.52:1 contrast
    text: '#FFFFFF',
    label: 'NA',
    fullName: 'Narcotics Anonymous'
  },
  cma: {
    bg: '#7E22CE',      // Darker Purple (from #A855F7) - 6.25:1 contrast
    text: '#FFFFFF',
    label: 'CMA',
    fullName: 'Crystal Meth Anonymous'
  },
  ma: {
    bg: '#6D28D9',      // Darker Violet (from #8B5CF6) - 6.77:1 contrast
    text: '#FFFFFF',
    label: 'MA',
    fullName: 'Marijuana Anonymous'
  },
  ha: {
    bg: '#C2410C',      // Darker Orange (from #F97316) - 4.80:1 contrast
    text: '#FFFFFF',
    label: 'HA',
    fullName: 'Heroin Anonymous'
  },
  rd: {
    bg: '#0F766E',      // Darker Teal (from #14B8A6) - 4.67:1 contrast
    text: '#FFFFFF',
    label: 'RD',
    fullName: 'Recovery Dharma'
  },
  smart: {
    bg: '#854D0E',      // Darker Yellow/Amber (from #CA8A04) - 5.49:1 contrast
    text: '#FFFFFF',
    label: 'SMART',
    fullName: 'SMART Recovery'
  },
  lr: {
    bg: '#4338CA',      // Darker Indigo (from #6366F1) - 7.05:1 contrast
    text: '#FFFFFF',
    label: 'LR',
    fullName: 'LifeRing'
  },
  cr: {
    bg: '#B91C1C',      // Darker Red (from #EF4444) - 5.91:1 contrast
    text: '#FFFFFF',
    label: 'CR',
    fullName: 'Celebrate Recovery'
  }
} as const

// ============================================================
// FORMAT TYPE COLORS
// ============================================================

export const FORMAT_COLORS = {
  open: {
    bg: '#10B981',      // Emerald
    text: '#FFFFFF',
    label: 'Open',
    icon: Users,
    description: 'Open to all'
  },
  closed: {
    bg: '#6B7280',      // Gray
    text: '#FFFFFF',
    label: 'Closed',
    icon: Lock,
    description: 'Members only'
  },
  discussion: {
    bg: '#8B5CF6',      // Violet
    text: '#FFFFFF',
    label: 'Discussion',
    icon: MessageSquare,
    description: 'Discussion format'
  },
  speaker: {
    bg: '#EC4899',      // Pink
    text: '#FFFFFF',
    label: 'Speaker',
    icon: Mic,
    description: 'Speaker meeting'
  },
  stepStudy: {
    bg: '#F59E0B',      // Amber
    text: '#1F2937',    // Dark gray for contrast
    label: 'Step Study',
    icon: ListOrdered,
    description: 'Step study format'
  },
  bigBook: {
    bg: '#0EA5E9',      // Sky blue
    text: '#FFFFFF',
    label: 'Big Book',
    icon: BookOpen,
    description: 'Big Book study'
  }
} as const

// ============================================================
// ACCESSIBILITY COLORS
// ============================================================

export const ACCESSIBILITY_COLORS = {
  wheelchair: {
    bg: '#2563EB',      // Blue
    text: '#FFFFFF',
    label: 'Wheelchair',
    icon: Accessibility,
    description: 'Wheelchair accessible'
  },
  asl: {
    bg: '#7C3AED',      // Violet
    text: '#FFFFFF',
    label: 'ASL',
    icon: Hand,
    description: 'ASL interpretation'
  },
  hearingLoop: {
    bg: '#0891B2',      // Cyan
    text: '#FFFFFF',
    label: 'Hearing Loop',
    icon: Ear,
    description: 'Hearing loop available'
  }
} as const

// ============================================================
// LOCATION TYPE COLORS
// ============================================================

export const LOCATION_COLORS = {
  virtual: {
    bg: '#8B5CF6',      // Violet
    text: '#FFFFFF',
    label: 'Virtual',
    icon: Video,
    description: 'Virtual meeting'
  },
  hybrid: {
    bg: '#06B6D4',      // Cyan
    text: '#FFFFFF',
    label: 'Hybrid',
    icon: Wifi,
    description: 'In-person + virtual'
  },
  inPerson: {
    bg: '#10B981',      // Emerald
    text: '#FFFFFF',
    label: 'In-Person',
    icon: MapPin,
    description: 'Physical location'
  }
} as const

// ============================================================
// TYPES
// ============================================================

export type ProgramType = keyof typeof PROGRAM_COLORS
export type FormatType = keyof typeof FORMAT_COLORS
export type AccessibilityType = keyof typeof ACCESSIBILITY_COLORS
export type LocationType = keyof typeof LOCATION_COLORS

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type BadgeVariant = 'filled' | 'outline' | 'subtle'

interface BaseBadgeProps {
  size?: BadgeSize
  variant?: BadgeVariant
  showIcon?: boolean
  showTooltip?: boolean
  className?: string
}

export interface ProgramBadgeProps extends BaseBadgeProps {
  type: ProgramType
}

export interface FormatBadgeProps extends BaseBadgeProps {
  type: FormatType
}

export interface AccessibilityBadgeProps extends BaseBadgeProps {
  type: AccessibilityType
}

export interface LocationBadgeProps extends BaseBadgeProps {
  type: LocationType
}

// ============================================================
// SIZE CONFIGURATIONS
// ============================================================

const SIZE_CLASSES = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-0.5',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2'
} as const

const ICON_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16
} as const

// ============================================================
// BASE BADGE COMPONENT
// ============================================================

interface InternalBadgeProps {
  bgColor: string
  textColor: string
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  size?: BadgeSize
  variant?: BadgeVariant
  showIcon?: boolean
  tooltip?: string
  className?: string
}

function BaseBadge({
  bgColor,
  textColor,
  label,
  icon: Icon,
  size = 'sm',
  variant = 'filled',
  showIcon = false,
  tooltip,
  className
}: InternalBadgeProps) {
  const sizeClasses = SIZE_CLASSES[size]
  const iconSize = ICON_SIZES[size]

  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: bgColor,
          border: `1.5px solid ${bgColor}`
        }
      case 'subtle':
        return {
          backgroundColor: `${bgColor}20`,
          color: bgColor,
          border: 'none'
        }
      case 'filled':
      default:
        return {
          backgroundColor: bgColor,
          color: textColor,
          border: 'none'
        }
    }
  }

  const styles = getVariantStyles()

  const badge = (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md transition-all duration-200',
        'hover:opacity-90 hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        sizeClasses,
        className
      )}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        boxShadow: variant === 'filled' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
      }}
      title={tooltip}
      role="status"
      aria-label={tooltip || label}
    >
      {showIcon && Icon && (
        <Icon size={iconSize} className="flex-shrink-0" />
      )}
      <span>{label}</span>
    </span>
  )

  return badge
}

// ============================================================
// PROGRAM BADGE
// ============================================================

export function ProgramBadge({
  type,
  size = 'sm',
  variant = 'filled',
  showIcon = false,
  className
}: ProgramBadgeProps) {
  const config = PROGRAM_COLORS[type]
  if (!config) return null

  return (
    <BaseBadge
      bgColor={config.bg}
      textColor={config.text}
      label={config.label}
      size={size}
      variant={variant}
      showIcon={showIcon}
      tooltip={config.fullName}
      className={className}
    />
  )
}

// ============================================================
// FORMAT BADGE
// ============================================================

export function FormatBadge({
  type,
  size = 'sm',
  variant = 'filled',
  showIcon = true,
  className
}: FormatBadgeProps) {
  const config = FORMAT_COLORS[type]
  if (!config) return null

  return (
    <BaseBadge
      bgColor={config.bg}
      textColor={config.text}
      label={config.label}
      icon={config.icon}
      size={size}
      variant={variant}
      showIcon={showIcon}
      tooltip={config.description}
      className={className}
    />
  )
}

// ============================================================
// ACCESSIBILITY BADGE
// ============================================================

export function AccessibilityBadge({
  type,
  size = 'sm',
  variant = 'filled',
  showIcon = true,
  className
}: AccessibilityBadgeProps) {
  const config = ACCESSIBILITY_COLORS[type]
  if (!config) return null

  return (
    <BaseBadge
      bgColor={config.bg}
      textColor={config.text}
      label={config.label}
      icon={config.icon}
      size={size}
      variant={variant}
      showIcon={showIcon}
      tooltip={config.description}
      className={className}
    />
  )
}

// ============================================================
// LOCATION BADGE
// ============================================================

export function LocationBadge({
  type,
  size = 'sm',
  variant = 'filled',
  showIcon = true,
  className
}: LocationBadgeProps) {
  const config = LOCATION_COLORS[type]
  if (!config) return null

  return (
    <BaseBadge
      bgColor={config.bg}
      textColor={config.text}
      label={config.label}
      icon={config.icon}
      size={size}
      variant={variant}
      showIcon={showIcon}
      tooltip={config.description}
      className={className}
    />
  )
}

// ============================================================
// MEETING BADGES (COMPOSITE)
// Renders all badges for a meeting based on its data
// ============================================================

export interface MeetingBadgesProps {
  programType?: ProgramType | string
  formats?: string[]
  accessibility?: string[]
  isVirtual?: boolean
  isHybrid?: boolean
  size?: BadgeSize
  variant?: BadgeVariant
  maxBadges?: number
  className?: string
}

/**
 * Parse format strings into FormatType
 */
function parseFormatType(format: string): FormatType | null {
  const normalized = format.toLowerCase().replace(/[\s-_]/g, '')

  const mappings: Record<string, FormatType> = {
    'open': 'open',
    'o': 'open',
    'closed': 'closed',
    'c': 'closed',
    'discussion': 'discussion',
    'd': 'discussion',
    'speaker': 'speaker',
    's': 'speaker',
    'stepstudy': 'stepStudy',
    'step': 'stepStudy',
    'bigbook': 'bigBook',
    'bb': 'bigBook',
    'b': 'bigBook'
  }

  return mappings[normalized] || null
}

/**
 * Parse accessibility strings into AccessibilityType
 */
function parseAccessibilityType(access: string): AccessibilityType | null {
  const normalized = access.toLowerCase().replace(/[\s-_]/g, '')

  const mappings: Record<string, AccessibilityType> = {
    'wheelchair': 'wheelchair',
    'wc': 'wheelchair',
    'accessible': 'wheelchair',
    'asl': 'asl',
    'signlanguage': 'asl',
    'hearingloop': 'hearingLoop',
    'hearing': 'hearingLoop',
    'loop': 'hearingLoop'
  }

  return mappings[normalized] || null
}

/**
 * Composite component that renders all relevant badges for a meeting
 */
export function MeetingBadges({
  programType,
  formats = [],
  accessibility = [],
  isVirtual = false,
  isHybrid = false,
  size = 'sm',
  variant = 'filled',
  maxBadges = 5,
  className
}: MeetingBadgesProps) {
  const badges: React.ReactNode[] = []

  // 1. Program badge (always first if present)
  if (programType) {
    const normalizedType = programType.toLowerCase() as ProgramType
    if (PROGRAM_COLORS[normalizedType]) {
      badges.push(
        <ProgramBadge
          key={`program-${normalizedType}`}
          type={normalizedType}
          size={size}
          variant={variant}
        />
      )
    }
  }

  // 2. Location badge (virtual/hybrid/in-person)
  if (isHybrid) {
    badges.push(
      <LocationBadge
        key="location-hybrid"
        type="hybrid"
        size={size}
        variant={variant}
      />
    )
  } else if (isVirtual) {
    badges.push(
      <LocationBadge
        key="location-virtual"
        type="virtual"
        size={size}
        variant={variant}
      />
    )
  }

  // 3. Format badges
  for (const format of formats) {
    const formatType = parseFormatType(format)
    if (formatType && badges.length < maxBadges) {
      badges.push(
        <FormatBadge
          key={`format-${formatType}`}
          type={formatType}
          size={size}
          variant={variant}
        />
      )
    }
  }

  // 4. Accessibility badges
  for (const access of accessibility) {
    const accessType = parseAccessibilityType(access)
    if (accessType && badges.length < maxBadges) {
      badges.push(
        <AccessibilityBadge
          key={`access-${accessType}`}
          type={accessType}
          size={size}
          variant={variant}
        />
      )
    }
  }

  // Show overflow indicator if we hit max
  const hasMore = (formats.length + accessibility.length + (programType ? 1 : 0) + (isVirtual || isHybrid ? 1 : 0)) > maxBadges

  if (badges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {badges}
      {hasMore && (
        <span
          className="text-xs text-muted-foreground"
          title="More attributes available"
        >
          +more
        </span>
      )}
    </div>
  )
}

// ============================================================
// UTILITY: GET PROGRAM COLOR BY TYPE
// ============================================================

export function getProgramColor(type: string): { bg: string; text: string } | null {
  const normalized = type.toLowerCase() as ProgramType
  const config = PROGRAM_COLORS[normalized]

  if (!config) return null

  return {
    bg: config.bg,
    text: config.text
  }
}

// ============================================================
// UTILITY: FORMAT MEETING TYPE FOR DISPLAY
// ============================================================

export function formatMeetingType(type: string): string {
  const normalized = type.toLowerCase() as ProgramType
  const config = PROGRAM_COLORS[normalized]

  return config?.fullName || type.toUpperCase()
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  ProgramBadge,
  FormatBadge,
  AccessibilityBadge,
  LocationBadge,
  MeetingBadges,
  PROGRAM_COLORS,
  FORMAT_COLORS,
  ACCESSIBILITY_COLORS,
  LOCATION_COLORS,
  getProgramColor,
  formatMeetingType
}
