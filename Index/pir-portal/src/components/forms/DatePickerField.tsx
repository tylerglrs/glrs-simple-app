import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DatePickerFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  helperText?: string
  className?: string
}

export function DatePickerField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Pick a date',
  disabled = false,
  minDate,
  maxDate,
  helperText,
  className,
}: DatePickerFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  })

  // Handle Date or Timestamp values
  const getDateValue = (): Date | undefined => {
    if (!value) return undefined
    // Check for Date instance
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return value as Date
    }
    // Check for Firestore Timestamp (has toDate method)
    if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
      return (value as { toDate: () => Date }).toDate()
    }
    // Check for string or number
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value)
    }
    return undefined
  }
  const dateValue = getDateValue()

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateValue && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={onChange}
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  )
}
