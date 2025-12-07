import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MoodSliderProps {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
  disabled?: boolean
  showValue?: boolean
  colorScale?: 'mood' | 'intensity' | 'neutral'
  className?: string
}

// Color scales for different slider types
const colorScales = {
  mood: [
    'bg-red-500', // 1 - Very negative
    'bg-red-400', // 2
    'bg-orange-500', // 3
    'bg-orange-400', // 4
    'bg-yellow-500', // 5 - Neutral
    'bg-yellow-400', // 6
    'bg-lime-500', // 7
    'bg-green-400', // 8
    'bg-green-500', // 9
    'bg-emerald-500', // 10 - Very positive
  ],
  intensity: [
    'bg-green-500', // 1 - Low (good for craving/anxiety)
    'bg-green-400',
    'bg-lime-500',
    'bg-yellow-400',
    'bg-yellow-500', // 5
    'bg-orange-400',
    'bg-orange-500',
    'bg-red-400',
    'bg-red-500',
    'bg-red-600', // 10 - High (bad for craving/anxiety)
  ],
  neutral: [
    'bg-primary/20',
    'bg-primary/30',
    'bg-primary/40',
    'bg-primary/50',
    'bg-primary/60',
    'bg-primary/70',
    'bg-primary/80',
    'bg-primary/90',
    'bg-primary',
    'bg-primary',
  ],
}

export function MoodSlider({
  value,
  onChange,
  label,
  min = 1,
  max = 10,
  disabled = false,
  showValue = true,
  colorScale = 'mood',
  className,
}: MoodSliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10)
      onChange(newValue)
    },
    [onChange]
  )

  const getThumbColor = () => {
    const scale = colorScales[colorScale]
    const index = Math.min(value - min, scale.length - 1)
    return scale[index]
  }

  const getTrackGradient = () => {
    const percentage = ((value - min) / (max - min)) * 100
    return `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--muted) ${percentage}%, var(--muted) 100%)`
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {showValue && (
          <span
            className={cn(
              'text-lg font-bold transition-transform',
              isDragging && 'scale-110',
              getThumbColor().replace('bg-', 'text-')
            )}
          >
            {value}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className={cn(
            'w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity',
            'bg-muted',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-6',
            '[&::-webkit-slider-thumb]:h-6',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:shadow-lg',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-6',
            '[&::-moz-range-thumb]:h-6',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:shadow-lg',
            '[&::-moz-range-thumb]:cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            background: getTrackGradient(),
          }}
        />
        {/* Scale labels */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs text-muted-foreground">{min}</span>
          <span className="text-xs text-muted-foreground">{max}</span>
        </div>
      </div>
    </div>
  )
}
