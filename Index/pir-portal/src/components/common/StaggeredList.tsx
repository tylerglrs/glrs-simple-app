import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface StaggeredListProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function StaggeredList({ children, className, delay = 0 }: StaggeredListProps) {
  return (
    <motion.div
      variants={{
        ...staggerContainer,
        show: {
          ...staggerContainer.show,
          transition: {
            ...staggerContainer.show.transition,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggeredItem({ children, className }: StaggeredItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// Convenience component for rendering a list with stagger
interface StaggeredRenderListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  itemClassName?: string
  delay?: number
}

export function StaggeredRenderList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  delay = 0,
}: StaggeredRenderListProps<T>) {
  return (
    <StaggeredList className={className} delay={delay}>
      {items.map((item, index) => (
        <StaggeredItem key={keyExtractor(item, index)} className={itemClassName}>
          {renderItem(item, index)}
        </StaggeredItem>
      ))}
    </StaggeredList>
  )
}

// Grid variant
interface StaggeredGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
  delay?: number
}

export function StaggeredGrid({ children, columns = 2, className, delay = 0 }: StaggeredGridProps) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns]

  return (
    <motion.div
      variants={{
        ...staggerContainer,
        show: {
          ...staggerContainer.show,
          transition: {
            ...staggerContainer.show.transition,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={cn('grid gap-3', gridClass, className)}
    >
      {children}
    </motion.div>
  )
}
