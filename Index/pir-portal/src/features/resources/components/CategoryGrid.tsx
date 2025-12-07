import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem, haptics } from '@/lib/animations'
import type { ResourceCategory } from '../hooks/useResources'
import type { IllustrationType } from '@/components/common/Illustration'

// Base path for illustrations
const BASE_PATH = '/Index/pir-portal/dist'

interface CategoryGridProps {
  categories: ResourceCategory[]
  counts: Record<string, number>
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  className?: string
}

// Map category names to illustration names
const categoryIllustrations: Record<string, IllustrationType> = {
  'coping-skills': 'coping',
  'relapse-prevention': 'relapse-prevention',
  'daily-tools': 'journal',
  'education': 'education',
  'support': 'support',
  'life-skills': 'life-skills',
  // Fallbacks for common variations
  'coping': 'coping',
  'wellness': 'meditation',
  'relationships': 'community',
  'work-career': 'goals',
  'crisis-toolkit': 'support',
}

// Color mapping for card backgrounds and accents
const categoryColors: Record<string, { bg: string; accent: string; border: string }> = {
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
    accent: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
    accent: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
    accent: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40',
    accent: 'bg-purple-500',
    border: 'border-purple-200 dark:border-purple-800',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40',
    accent: 'bg-teal-500',
    border: 'border-teal-200 dark:border-teal-800',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40',
    accent: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800',
  },
}

// Helper to get illustration name from category
function getIllustrationName(categoryId: string, categoryName: string): IllustrationType {
  // Try exact ID match first
  if (categoryIllustrations[categoryId]) {
    return categoryIllustrations[categoryId]
  }
  // Try lowercase name with hyphen
  const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '-')
  if (categoryIllustrations[normalizedName]) {
    return categoryIllustrations[normalizedName]
  }
  // Default to education
  return 'education'
}

export function CategoryGrid({
  categories,
  counts,
  selectedCategory,
  onCategorySelect,
  className,
}: CategoryGridProps) {
  const handleCategoryClick = (categoryId: string, isSelected: boolean) => {
    haptics.tap()
    onCategorySelect(isSelected ? null : categoryId)
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={cn('grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4', className)}
    >
      {categories.map((category) => {
        const illustrationName = getIllustrationName(category.id, category.name)
        const isSelected = selectedCategory === category.id
        const count = counts[category.id] || 0
        const colors = categoryColors[category.color] || categoryColors.teal

        return (
          <motion.div
            key={category.id}
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-300 border-2 h-full overflow-hidden relative',
                'hover:shadow-xl hover:shadow-black/10',
                isSelected
                  ? cn(colors.border, 'ring-2 ring-primary ring-offset-2')
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/30'
              )}
              onClick={() => handleCategoryClick(category.id, isSelected)}
            >
              {/* Full Background Illustration */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  src={`${BASE_PATH}/illustrations/${illustrationName}.svg`}
                  alt=""
                  className={cn(
                    'w-full h-full object-cover',
                    'transition-all duration-300',
                    isSelected ? 'scale-105 opacity-25' : 'opacity-15 group-hover:opacity-20'
                  )}
                />
                {/* Gradient overlay for text readability */}
                <div className={cn(
                  'absolute inset-0',
                  'bg-gradient-to-t from-white via-white/80 to-white/40',
                  'dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900/40'
                )} />
              </div>

              <CardContent className="relative z-10 p-4 md:p-5 flex flex-col items-center justify-end text-center h-full min-h-[140px] md:min-h-[160px]">
                {/* Floating Illustration Preview */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, delay: 0.15 }}
                  className="mb-3"
                >
                  <img
                    src={`${BASE_PATH}/illustrations/${illustrationName}.svg`}
                    alt={category.name}
                    className={cn(
                      'w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg',
                      'transition-transform duration-300',
                      isSelected ? 'scale-110' : 'scale-100'
                    )}
                    loading="lazy"
                  />
                </motion.div>

                {/* Name */}
                <h3
                  className={cn(
                    'font-semibold text-sm md:text-base mb-1.5 line-clamp-1 drop-shadow-sm',
                    'text-gray-800 dark:text-gray-100'
                  )}
                >
                  {category.name}
                </h3>

                {/* Count Badge */}
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium px-2.5 py-0.5',
                    isSelected
                      ? cn(colors.accent, 'text-white')
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 backdrop-blur-sm'
                  )}
                >
                  {count} {count === 1 ? 'resource' : 'resources'}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default CategoryGrid
