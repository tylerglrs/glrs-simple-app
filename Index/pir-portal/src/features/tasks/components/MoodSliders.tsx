import { useRef, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Smile,
  Flame,
  Brain,
  Moon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// =============================================================================
// TYPES
// =============================================================================

export interface SliderConfig {
  key: string
  label: string
  icon: LucideIcon
  lowLabel: string
  highLabel: string
  description?: string
}

export interface MoodSlidersProps {
  values: {
    mood: number | null
    craving: number | null
    anxiety: number | null
    sleep: number | null
  }
  onChange: (key: string, value: number) => void
  disabled?: boolean
}

// =============================================================================
// SLIDER CONFIGURATIONS
// =============================================================================

const SLIDER_CONFIGS: SliderConfig[] = [
  {
    key: 'mood',
    label: 'Mood',
    icon: Smile,
    lowLabel: 'Low',
    highLabel: 'High',
    description: 'How are you feeling emotionally?',
  },
  {
    key: 'craving',
    label: 'Craving',
    icon: Flame,
    lowLabel: 'None',
    highLabel: 'Strong',
    description: 'Any urges or cravings today?',
  },
  {
    key: 'anxiety',
    label: 'Anxiety',
    icon: Brain,
    lowLabel: 'Calm',
    highLabel: 'Anxious',
    description: 'How anxious do you feel?',
  },
  {
    key: 'sleep',
    label: 'Sleep Quality',
    icon: Moon,
    lowLabel: 'Poor',
    highLabel: 'Great',
    description: 'How well did you sleep?',
  },
]

// =============================================================================
// SWIPEABLE PICKER COMPONENT
// =============================================================================

interface SwipeablePickerProps {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

function SwipeablePicker({ value, onChange, disabled }: SwipeablePickerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // Item dimensions based on mobile/desktop
  const itemWidth = isMobile ? 50 : 60
  const gap = isMobile ? 15 : 20

  // Calculate scroll position for a value
  const getScrollPosition = useCallback(
    (val: number) => val * (itemWidth + gap),
    [itemWidth, gap]
  )

  // Initialize scroll position when value changes externally
  useEffect(() => {
    if (containerRef.current && value !== null && !hasInitialized.current) {
      containerRef.current.scrollLeft = getScrollPosition(value)
      hasInitialized.current = true
    }
  }, [value, getScrollPosition])

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (disabled) return

      const container = e.currentTarget
      const scrollLeft = container.scrollLeft
      const centerIndex = Math.round(scrollLeft / (itemWidth + gap))
      const clampedValue = Math.max(0, Math.min(10, centerIndex))

      if (clampedValue !== value) {
        onChange(clampedValue)
      }
    },
    [disabled, itemWidth, gap, value, onChange]
  )

  // Handle click on number
  const handleClick = useCallback(
    (num: number) => {
      if (disabled) return

      onChange(num)
      hasInitialized.current = true

      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: getScrollPosition(num),
          behavior: 'smooth',
        })
      }
    },
    [disabled, onChange, getScrollPosition]
  )

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: isMobile ? 60 : 70 }}
    >
      {/* Highlight box behind selected number */}
      <div
        className="absolute pointer-events-none z-[1]"
        style={{
          width: isMobile ? 60 : 70,
          height: isMobile ? 50 : 60,
          background: 'rgba(5, 133, 133, 0.12)',
          borderRadius: 12,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Vertical dividers */}
      <div
        className="absolute pointer-events-none z-[2]"
        style={{
          width: 1,
          height: isMobile ? 40 : 50,
          background: 'rgba(5, 133, 133, 0.3)',
          left: isMobile ? 'calc(50% - 35px)' : 'calc(50% - 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        className="absolute pointer-events-none z-[2]"
        style={{
          width: 1,
          height: isMobile ? 40 : 50,
          background: 'rgba(5, 133, 133, 0.3)',
          left: isMobile ? 'calc(50% + 35px)' : 'calc(50% + 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Left fade gradient */}
      <div
        className="absolute left-0 top-0 pointer-events-none z-[3]"
        style={{
          width: 60,
          height: '100%',
          background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Right fade gradient */}
      <div
        className="absolute right-0 top-0 pointer-events-none z-[3]"
        style={{
          width: 60,
          height: '100%',
          background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          gap: isMobile ? 15 : 20,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          padding: isMobile ? '0 calc(50% - 25px)' : '0 calc(50% - 30px)',
          width: '100%',
          touchAction: 'pan-x',
        }}
        onScroll={handleScroll}
      >
        {Array.from({ length: 11 }, (_, i) => i).map((num) => (
          <div
            key={num}
            className={cn(
              'flex items-center justify-center cursor-pointer select-none transition-all duration-200',
              disabled && 'pointer-events-none opacity-50'
            )}
            style={{
              minWidth: isMobile ? 50 : 60,
              height: isMobile ? 50 : 60,
              fontSize: value === num ? (isMobile ? 28 : 36) : isMobile ? 18 : 24,
              fontWeight: value === num ? 'bold' : 400,
              color: value === num ? '#058585' : '#CCCCCC',
              scrollSnapAlign: 'center',
            }}
            onClick={() => handleClick(num)}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// SINGLE SLIDER CARD
// =============================================================================

interface SliderCardProps {
  config: SliderConfig
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

function SliderCard({ config, value, onChange, disabled }: SliderCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const Icon = config.icon

  return (
    <Card className="overflow-hidden">
      <CardContent className={cn('pt-4', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('text-teal-600', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
          <span className={cn('font-medium', isMobile ? 'text-sm' : 'text-base')}>
            {config.label}
          </span>
          {value !== null && (
            <span
              className={cn(
                'ml-auto font-bold text-teal-600',
                isMobile ? 'text-lg' : 'text-xl'
              )}
            >
              {value}
            </span>
          )}
        </div>

        {/* Description */}
        {config.description && (
          <p className={cn('text-muted-foreground mb-3', isMobile ? 'text-xs' : 'text-sm')}>
            {config.description}
          </p>
        )}

        {/* Swipeable Picker */}
        <SwipeablePicker value={value} onChange={onChange} disabled={disabled} />

        {/* Labels */}
        <div className="flex justify-between mt-2">
          <span className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
            {config.lowLabel}
          </span>
          <span className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
            {config.highLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MoodSliders({ values, onChange, disabled }: MoodSlidersProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className={cn('space-y-3', isMobile ? 'space-y-2' : 'space-y-3')}>
      {SLIDER_CONFIGS.map((config) => (
        <SliderCard
          key={config.key}
          config={config}
          value={values[config.key as keyof typeof values]}
          onChange={(value) => onChange(config.key, value)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

// =============================================================================
// SINGLE PICKER EXPORT (for reflection view)
// =============================================================================

export interface SinglePickerProps {
  label: string
  description?: string
  value: number | null
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
  disabled?: boolean
}

export function SinglePicker({
  label,
  description,
  value,
  onChange,
  lowLabel = '0',
  highLabel = '10',
  disabled,
}: SinglePickerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Card className="overflow-hidden">
      <CardContent className={cn('pt-4', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('font-medium', isMobile ? 'text-sm' : 'text-base')}>
            {label}
          </span>
          {value !== null && (
            <span
              className={cn(
                'ml-auto font-bold text-teal-600',
                isMobile ? 'text-lg' : 'text-xl'
              )}
            >
              {value}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={cn('text-muted-foreground mb-3', isMobile ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}

        {/* Swipeable Picker */}
        <SwipeablePicker value={value} onChange={onChange} disabled={disabled} />

        {/* Labels */}
        <div className="flex justify-between mt-2">
          <span className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
            {lowLabel}
          </span>
          <span className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
            {highLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default MoodSliders
