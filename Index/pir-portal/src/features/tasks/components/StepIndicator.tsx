import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface Step {
  id: string
  label: string
  description?: string
}

export interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  variant?: 'horizontal' | 'vertical' | 'dots'
  showLabels?: boolean
  showDescriptions?: boolean
  onStepClick?: (stepIndex: number) => void
  allowClickPast?: boolean
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StepIndicator({
  steps,
  currentStep,
  variant = 'horizontal',
  showLabels = true,
  showDescriptions = false,
  onStepClick,
  allowClickPast = false,
  className,
}: StepIndicatorProps) {
  const handleStepClick = (index: number) => {
    if (!onStepClick) return
    if (!allowClickPast && index > currentStep) return
    onStepClick(index)
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && (allowClickPast || index <= currentStep)

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              disabled={!isClickable}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                isCompleted && 'bg-green-500',
                isCurrent && 'bg-teal-500 w-6',
                !isCompleted && !isCurrent && 'bg-gray-300',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
              title={step.label}
            />
          )
        })}
      </div>
    )
  }

  if (variant === 'vertical') {
    return (
      <div className={cn('space-y-0', className)}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1
          const isClickable = onStepClick && (allowClickPast || index <= currentStep)

          return (
            <div key={step.id} className="flex">
              {/* Step indicator column */}
              <div className="flex flex-col items-center mr-4">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-green-500 border-green-500 text-white',
                    isCurrent && 'bg-teal-500 border-teal-500 text-white',
                    !isCompleted && !isCurrent && 'bg-white border-gray-300 text-gray-400',
                    isClickable && 'cursor-pointer hover:opacity-80',
                    !isClickable && 'cursor-default'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                {!isLast && (
                  <div className={cn(
                    'w-0.5 h-full min-h-[24px] my-1',
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                )}
              </div>

              {/* Step content */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                {showLabels && (
                  <p className={cn(
                    'font-medium',
                    isCompleted && 'text-green-700',
                    isCurrent && 'text-teal-700',
                    !isCompleted && !isCurrent && 'text-gray-500'
                  )}>
                    {step.label}
                  </p>
                )}
                {showDescriptions && step.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Default: horizontal
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1
        const isClickable = onStepClick && (allowClickPast || index <= currentStep)

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <button
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isCurrent && 'bg-teal-500 border-teal-500 text-white',
                  !isCompleted && !isCurrent && 'bg-white border-gray-300 text-gray-400',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>

              {/* Step label */}
              {showLabels && (
                <p className={cn(
                  'text-xs font-medium mt-2 text-center max-w-[80px]',
                  isCompleted && 'text-green-700',
                  isCurrent && 'text-teal-700',
                  !isCompleted && !isCurrent && 'text-gray-500'
                )}>
                  {step.label}
                </p>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                'flex-1 h-0.5 mx-2',
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// PRESET VARIANTS
// =============================================================================

export function CheckInStepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number
  onStepClick?: (step: number) => void
}) {
  const steps: Step[] = [
    { id: 'mood', label: 'Mood' },
    { id: 'craving', label: 'Craving' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'sleep', label: 'Sleep' },
  ]

  return (
    <StepIndicator
      steps={steps}
      currentStep={currentStep}
      variant="dots"
      showLabels={false}
      onStepClick={onStepClick}
      allowClickPast={false}
    />
  )
}

export function ReflectionStepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number
  onStepClick?: (step: number) => void
}) {
  const steps: Step[] = [
    { id: 'overall', label: 'Overall' },
    { id: 'reflection', label: 'Reflection' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'tomorrow', label: 'Tomorrow' },
  ]

  return (
    <StepIndicator
      steps={steps}
      currentStep={currentStep}
      variant="dots"
      showLabels={false}
      onStepClick={onStepClick}
      allowClickPast={false}
    />
  )
}

export default StepIndicator
