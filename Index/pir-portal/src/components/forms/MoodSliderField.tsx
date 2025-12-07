import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { MoodSlider } from '@/components/common/MoodSlider'
import { cn } from '@/lib/utils'

interface MoodSliderFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  min?: number
  max?: number
  disabled?: boolean
  showValue?: boolean
  colorScale?: 'mood' | 'intensity' | 'neutral'
  className?: string
  helperText?: string
}

export function MoodSliderField<T extends FieldValues>({
  name,
  control,
  label,
  min = 1,
  max = 10,
  disabled = false,
  showValue = true,
  colorScale = 'mood',
  className,
  helperText,
}: MoodSliderFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  })

  return (
    <div className={cn('space-y-1', className)}>
      <MoodSlider
        value={value ?? 5}
        onChange={onChange}
        label={label}
        min={min}
        max={max}
        disabled={disabled}
        showValue={showValue}
        colorScale={colorScale}
      />
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  )
}
