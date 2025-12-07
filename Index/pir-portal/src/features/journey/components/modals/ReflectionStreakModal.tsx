import { Moon } from 'lucide-react'
import { StreakModal, type StreakModalProps } from './StreakModal'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionStreakModalProps extends Omit<StreakModalProps, 'title' | 'icon' | 'color'> {}

// =============================================================================
// COMPONENT
// =============================================================================

export function ReflectionStreakModal(props: ReflectionStreakModalProps) {
  return (
    <StreakModal
      {...props}
      title="Reflection Streak"
      icon={<Moon className="h-5 w-5 text-indigo-500" />}
      color="#6366f1"
    />
  )
}

export default ReflectionStreakModal
