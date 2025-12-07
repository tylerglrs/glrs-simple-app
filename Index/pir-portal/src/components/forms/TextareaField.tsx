import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  rows?: number
  maxLength?: number
  showCharCount?: boolean
  helperText?: string
  className?: string
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  helperText,
  className,
}: TextareaFieldProps<T>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
  })

  const charCount = value?.length ?? 0

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <Textarea
        id={name}
        ref={ref}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />
      <div className="flex items-center justify-between">
        <div>
          {helperText && !error && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
          {error && (
            <p className="text-xs text-destructive">{error.message}</p>
          )}
        </div>
        {showCharCount && maxLength && (
          <span
            className={cn(
              'text-xs',
              charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-muted-foreground',
              charCount >= maxLength && 'text-destructive'
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
