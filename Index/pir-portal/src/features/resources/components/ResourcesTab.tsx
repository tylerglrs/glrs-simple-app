import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PullToRefresh, TabHeader } from '@/components/common'
import { useTab } from '@/contexts/TabContext'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Search,
  X,
  BookOpen,
  Globe,
  Heart,
  ChevronLeft,
  ChevronRight,
  HeartOff,
  FileText,
  Filter,
  ArrowUpDown,
  Plus,
  Check,
  ClipboardList,
} from 'lucide-react'
import { useResourcesData, RESOURCE_TYPE_OPTIONS, SORT_OPTIONS } from '../hooks/useResources'
import { useModalStore } from '@/stores/modalStore'
import { haptics, staggerContainer } from '@/lib/animations'
import type { ResourceWithProgress, ResourceCategory, ResourceType, SortOption } from '../hooks/useResources'

// =============================================================================
// CATEGORY IMAGE MAPPING - Use static imports for proper bundling
// =============================================================================

import copingImg from '/images/categories/coping.svg'
import relapseImg from '/images/categories/relapse.svg'
import dailyImg from '/images/categories/daily.svg'
import educationImg from '/images/categories/education.svg'
import supportImg from '/images/categories/support.svg'
import lifeImg from '/images/categories/life.svg'

const CATEGORY_IMAGES: Record<string, string> = {
  coping: copingImg,
  relapse: relapseImg,
  daily: dailyImg,
  education: educationImg,
  support: supportImg,
  life: lifeImg,
}

// =============================================================================
// TAB ICON MAPPING
// =============================================================================

const tabIcons: Record<string, typeof BookOpen> = {
  BookOpen: BookOpen,
  Globe: Globe,
  Heart: Heart,
}

// =============================================================================
// HORIZONTAL CATEGORY CAROUSEL
// =============================================================================

interface CategoryCarouselProps {
  categories: ResourceCategory[]
  counts: Record<string, number>
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

function CategoryCarousel({
  categories,
  counts,
  selectedCategory,
  onCategorySelect,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    haptics.tap()
    // Always select a category (don't toggle to null)
    onCategorySelect(categoryId)
  }

  return (
    <div className="relative">
      {/* Left Scroll Button */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id
          const count = counts[category.id] || 0
          const imageUrl = CATEGORY_IMAGES[category.id] || CATEGORY_IMAGES.education

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0"
            >
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  'relative w-[160px] h-[120px] md:w-[180px] md:h-[140px] rounded-2xl overflow-hidden',
                  'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                  isSelected
                    ? 'ring-3 ring-teal-500 ring-offset-2 shadow-xl'
                    : 'shadow-lg hover:shadow-xl'
                )}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />

                {/* Gradient Overlay for text readability */}
                <div
                  className={cn(
                    'absolute inset-0 transition-all duration-300',
                    isSelected
                      ? 'bg-gradient-to-t from-teal-900/90 via-teal-800/60 to-teal-700/40'
                      : 'bg-gradient-to-t from-black/80 via-black/40 to-black/20'
                  )}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <h3 className="font-bold text-white text-sm md:text-base drop-shadow-lg line-clamp-1">
                    {category.name}
                  </h3>
                  <span className="text-white/80 text-xs drop-shadow-md">
                    {count} {count === 1 ? 'guide' : 'guides'}
                  </span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Right Scroll Button */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// TEAL RESOURCE CARD
// =============================================================================

interface TealResourceCardProps {
  resource: ResourceWithProgress
  onClick: () => void
  onToggleFavorite: (resourceId: string, resourceTitle?: string) => void
  isFavorite: boolean
  index: number
}

function TealResourceCard({
  resource,
  onClick,
  onToggleFavorite,
  isFavorite,
  index,
}: TealResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
        onClick={onClick}
      >
        <CardContent className="p-4 flex flex-col h-full min-h-[140px]">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white text-xs capitalize border-0"
            >
              <FileText className="h-3 w-3 mr-1" />
              {resource.type || 'pdf'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 -mr-1 -mt-1 text-white/80 hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                haptics.tap()
                onToggleFavorite(resource.id, resource.title)
              }}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-all',
                  isFavorite ? 'fill-red-400 text-red-400' : 'text-white/70'
                )}
              />
            </Button>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-white text-sm md:text-base line-clamp-2 flex-grow">
            {resource.title}
          </h4>

          {/* Description */}
          <p className="text-white/70 text-xs line-clamp-2 mt-2">
            {resource.description || 'Tap to view this resource'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// RESOURCE GRID
// =============================================================================

interface ResourceGridProps {
  resources: ResourceWithProgress[]
  onResourceClick: (resource: ResourceWithProgress) => void
  onToggleFavorite: (resourceId: string, resourceTitle?: string) => void
  favoriteIds: string[]
  isLoading: boolean
}

function ResourceGrid({
  resources,
  onResourceClick,
  onToggleFavorite,
  favoriteIds,
  isLoading,
}: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[140px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No resources found</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Try selecting a different category or adjusting your search
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4"
    >
      {resources.map((resource, index) => (
        <TealResourceCard
          key={resource.id}
          resource={resource}
          onClick={() => onResourceClick(resource)}
          onToggleFavorite={onToggleFavorite}
          isFavorite={resource.isFavorite ?? false}
          index={index}
        />
      ))}
    </motion.div>
  )
}

// =============================================================================
// SEARCH RESULTS OVERLAY
// =============================================================================

interface SearchResultsOverlayProps {
  results: ResourceWithProgress[]
  onResourceClick: (resource: ResourceWithProgress) => void
  onToggleFavorite: (resourceId: string, resourceTitle?: string) => void
  favoriteIds: string[]
  searchQuery: string
  onClose: () => void
}

function SearchResultsOverlay({
  results,
  onResourceClick,
  onToggleFavorite,
  favoriteIds,
  searchQuery,
  onClose,
}: SearchResultsOverlayProps) {
  if (!searchQuery.trim()) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 z-50 mt-2 mx-4 max-h-[60vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700"
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
        <span className="text-sm font-medium">
          {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchQuery}"
        </span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {results.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No matching guides found</p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {results.slice(0, 10).map((resource) => (
            <motion.button
              key={resource.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ backgroundColor: 'rgba(13, 148, 136, 0.1)' }}
              className="w-full p-3 rounded-lg text-left transition-colors flex items-start gap-3"
              onClick={() => {
                onResourceClick(resource)
                onClose()
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{resource.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {resource.description || 'No description'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  haptics.tap()
                  onToggleFavorite(resource.id, resource.title)
                }}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    resource.isFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>
            </motion.button>
          ))}
          {results.length > 10 && (
            <p className="text-center text-xs text-muted-foreground py-2">
              +{results.length - 10} more results
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}

// =============================================================================
// FAVORITES EMPTY STATE
// =============================================================================

function FavoritesEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <HeartOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        Tap the heart icon on any guide to save it here for quick access
      </p>
    </motion.div>
  )
}

// =============================================================================
// LIBRARY EMPTY STATE
// =============================================================================

function LibraryEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No resources in this category yet</h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        Browse Public Guides to add resources to your library
      </p>
    </motion.div>
  )
}

// =============================================================================
// 3x2 CATEGORY GRID FOR MY LIBRARY
// =============================================================================

interface LibraryCategoryGridProps {
  categories: ResourceCategory[]
  counts: Record<string, number>
  onCategorySelect: (categoryId: string) => void
}

function LibraryCategoryGrid({
  categories,
  counts,
  onCategorySelect,
}: LibraryCategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4">
      {categories.map((category, index) => {
        const count = counts[category.id] || 0
        const imageUrl = CATEGORY_IMAGES[category.id] || CATEGORY_IMAGES.education

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => {
                haptics.tap()
                onCategorySelect(category.id)
              }}
              className={cn(
                'relative w-full aspect-[4/3] rounded-2xl overflow-hidden',
                'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                'shadow-lg hover:shadow-xl'
              )}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <h3 className="font-bold text-white text-sm md:text-base drop-shadow-lg line-clamp-1">
                  {category.name}
                </h3>
                <span className="text-white/80 text-xs drop-shadow-md">
                  {count} {count === 1 ? 'guide' : 'guides'}
                </span>
              </div>

              {/* Count Badge */}
              {count > 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-teal-500 text-white text-xs font-medium">
                  {count}
                </div>
              )}
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}

// =============================================================================
// LIBRARY RESOURCE CARD (with assigned badge)
// =============================================================================

interface LibraryResourceCardProps {
  resource: ResourceWithProgress
  onClick: () => void
  onToggleFavorite: (resourceId: string, resourceTitle?: string) => void
  isFavorite: boolean
  index: number
}

function LibraryResourceCard({
  resource,
  onClick,
  onToggleFavorite,
  isFavorite,
  index,
}: LibraryResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
        onClick={onClick}
      >
        <CardContent className="p-4 flex flex-col h-full min-h-[140px]">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white text-xs capitalize border-0"
              >
                <FileText className="h-3 w-3 mr-1" />
                {resource.type || 'pdf'}
              </Badge>
              {resource.isAssigned && (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/80 text-white text-xs border-0"
                >
                  <ClipboardList className="h-3 w-3 mr-1" />
                  Assigned
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 -mr-1 -mt-1 text-white/80 hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                haptics.tap()
                onToggleFavorite(resource.id, resource.title)
              }}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-all',
                  isFavorite ? 'fill-red-400 text-red-400' : 'text-white/70'
                )}
              />
            </Button>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-white text-sm md:text-base line-clamp-2 flex-grow">
            {resource.title}
          </h4>

          {/* Description */}
          <p className="text-white/70 text-xs line-clamp-2 mt-2">
            {resource.description || 'Tap to view this resource'}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// PUBLIC GUIDES RESOURCE CARD (with Add to Library button)
// =============================================================================

interface PublicResourceCardProps {
  resource: ResourceWithProgress
  onClick: () => void
  onToggleFavorite: (resourceId: string, resourceTitle?: string) => void
  onToggleLibrary: (resourceId: string) => void
  isFavorite: boolean
  isInLibrary: boolean
  index: number
}

function PublicResourceCard({
  resource,
  onClick,
  onToggleFavorite,
  onToggleLibrary,
  isFavorite,
  isInLibrary,
  index,
}: PublicResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
        onClick={onClick}
      >
        <CardContent className="p-4 flex flex-col h-full min-h-[160px]">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white text-xs capitalize border-0"
            >
              <FileText className="h-3 w-3 mr-1" />
              {resource.type || 'pdf'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 -mr-1 -mt-1 text-white/80 hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                haptics.tap()
                onToggleFavorite(resource.id, resource.title)
              }}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-all',
                  isFavorite ? 'fill-red-400 text-red-400' : 'text-white/70'
                )}
              />
            </Button>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-white text-sm md:text-base line-clamp-2 flex-grow">
            {resource.title}
          </h4>

          {/* Description */}
          <p className="text-white/70 text-xs line-clamp-2 mt-2 mb-3">
            {resource.description || 'Tap to view this resource'}
          </p>

          {/* Add to Library Button */}
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "w-full h-8 text-xs font-medium transition-all",
              isInLibrary
                ? "bg-white/30 text-white hover:bg-white/40"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
            onClick={(e) => {
              e.stopPropagation()
              haptics.tap()
              onToggleLibrary(resource.id)
            }}
          >
            {isInLibrary ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                In My Library
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add to Library
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// FILTER BAR COMPONENT
// =============================================================================

interface FilterBarProps {
  filterType: ResourceType | 'all'
  setFilterType: (type: ResourceType | 'all') => void
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
}

function FilterBar({ filterType, setFilterType, sortBy, setSortBy }: FilterBarProps) {
  const isFilterActive = filterType !== 'all'
  const isSortNonDefault = sortBy !== 'newest'

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {/* Type Filter */}
      <div className="flex-1">
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as ResourceType | 'all')}
        >
          <SelectTrigger
            className={cn(
              "h-9 text-sm",
              isFilterActive && "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className={cn("h-3.5 w-3.5", isFilterActive && "text-teal-600")} />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="flex-1">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger
            className={cn(
              "h-9 text-sm",
              isSortNonDefault && "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            )}
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className={cn("h-3.5 w-3.5", isSortNonDefault && "text-teal-600")} />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ResourcesTab() {
  const {
    filteredResources,
    categoryCounts,
    libraryCategoryCounts,
    selectedCategory,
    setSelectedCategory,
    selectedTab,
    setSelectedTab,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    isLoading,
    categories,
    tabs,
    resources,
    favoriteIds,
    toggleFavorite,
    favoritesCount,
    libraryCount,
    toggleLibrary,
    libraryIds,
  } = useResourcesData()

  const { openModal } = useModalStore()
  const { setActiveTab } = useTab()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Pull-to-refresh handler - data is real-time, but provides visual feedback
  const handleRefresh = useCallback(async () => {
    // Real-time listeners keep data fresh, but we provide visual feedback
    await new Promise((resolve) => setTimeout(resolve, 500))
  }, [])
  // Track if viewing category detail in library (null = show grid, string = show category)
  const [libraryViewCategory, setLibraryViewCategory] = useState<string | null>(null)

  /**
   * Handle resource click - open PDF directly in new tab (Safari handles viewing)
   * Falls back to modal for resources without PDF URL
   */
  const handleResourceClick = (resource: ResourceWithProgress) => {
    haptics.tap()

    // Open PDF directly in new tab - Safari handles PDF viewing natively
    if (resource.url) {
      window.open(resource.url, '_blank')
    } else {
      // Fall back to modal for resources without URL
      openModal('resourceViewer', { resource })
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  // Handle library category click - show detail view
  const handleLibraryCategoryClick = (categoryId: string) => {
    setLibraryViewCategory(categoryId)
  }

  // Handle back to library grid
  const handleBackToLibraryGrid = () => {
    setLibraryViewCategory(null)
  }

  // Reset library view when switching tabs
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    setLibraryViewCategory(null)
  }

  // Get selected category info
  const selectedCategoryInfo = categories.find((c) => c.id === selectedCategory)
  const libraryViewCategoryInfo = categories.find((c) => c.id === libraryViewCategory)

  // Check if a resource is in the library (assigned or self-added)
  const isResourceInLibrary = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    return resource?.isInLibrary || false
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header - using standardized TabHeader */}
      <TabHeader
        title="Guides"
        onMenuClick={() => setSidebarOpen(true)}
        onProfileClick={() => setActiveTab('profile')}
      />

      {/* Tab Navigation - scrolls with content */}
      <div className="px-4 py-2">
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full h-7 p-0 grid grid-cols-3 bg-transparent rounded-none border-0">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab.icon] || BookOpen
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex items-center justify-center gap-1 text-[11px]',
                    'h-full rounded-none border-b-2',
                    'data-[state=active]:bg-transparent data-[state=active]:border-slate-700',
                    'data-[state=active]:text-slate-800 data-[state=active]:font-medium',
                    'data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                  {tab.id === 'favorites' && favoritesCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                      {favoritesCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content with Pull-to-Refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-y-auto">
        {/* ============================================================ */}
        {/* MY LIBRARY TAB */}
        {/* ============================================================ */}
        {selectedTab === 'library' && (
          <div className="space-y-6 pb-20">
            {/* Show Category Detail View if a category is selected */}
            {libraryViewCategory ? (
              <>
                {/* Back Navigation */}
                <div className="px-4 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 -ml-2"
                    onClick={handleBackToLibraryGrid}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Library
                  </Button>
                </div>

                {/* Category Header */}
                <div className="flex items-center gap-2 px-4">
                  <h2 className="font-semibold text-lg">
                    {libraryViewCategoryInfo?.name}
                  </h2>
                  <Badge variant="secondary">
                    {libraryCategoryCounts[libraryViewCategory] || 0}
                  </Badge>
                </div>

                {/* Filter Bar */}
                <FilterBar
                  filterType={filterType}
                  setFilterType={setFilterType}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />

                {/* Resources in this category */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={libraryViewCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(() => {
                      const libraryResourcesInCategory = filteredResources.filter(
                        r => r.isInLibrary && r.category === libraryViewCategory
                      )

                      if (libraryResourcesInCategory.length === 0) {
                        return <LibraryEmptyState />
                      }

                      return (
                        <motion.div
                          initial="hidden"
                          animate="show"
                          variants={staggerContainer}
                          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4"
                        >
                          {libraryResourcesInCategory.map((resource, index) => (
                            <LibraryResourceCard
                              key={resource.id}
                              resource={resource}
                              onClick={() => handleResourceClick(resource)}
                              onToggleFavorite={toggleFavorite}
                              isFavorite={resource.isFavorite ?? false}
                              index={index}
                            />
                          ))}
                        </motion.div>
                      )
                    })()}
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <>
                {/* Library Grid View (3x2 categories) */}
                <div className="px-4 pt-4">
                  <h2 className="text-lg font-semibold mb-1">My Library</h2>
                  <p className="text-sm text-muted-foreground">
                    {libraryCount} {libraryCount === 1 ? 'guide' : 'guides'} in your library
                  </p>
                </div>

                {/* 3x2 Category Grid */}
                <LibraryCategoryGrid
                  categories={categories}
                  counts={libraryCategoryCounts}
                  onCategorySelect={handleLibraryCategoryClick}
                />
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* PUBLIC GUIDES TAB */}
        {/* ============================================================ */}
        {selectedTab === 'public' && (
          <div className="space-y-6 pb-20">
            {/* Search Bar */}
            <div className="px-4 pt-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search all guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="pl-9 h-11 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Results Overlay */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <SearchResultsOverlay
                    results={filteredResources}
                    onResourceClick={handleResourceClick}
                    onToggleFavorite={toggleFavorite}
                    favoriteIds={favoriteIds}
                    searchQuery={searchQuery}
                    onClose={clearSearch}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Filter Bar */}
            <FilterBar
              filterType={filterType}
              setFilterType={setFilterType}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Category Carousel */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold px-4">Browse by Category</h2>
              <CategoryCarousel
                categories={categories}
                counts={categoryCounts}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>

            {/* Selected Category Resources - Always shown since category is always selected */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 px-4">
                  <h2 className="font-semibold text-lg">
                    {selectedCategoryInfo?.name}
                  </h2>
                  <Badge variant="secondary">
                    {filteredResources.filter(r => r.category === selectedCategory).length}
                  </Badge>
                </div>

                {/* Public Resources Grid with Add to Library */}
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-[160px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredResources.filter(r => r.category === selectedCategory).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 px-4 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No resources found</h3>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                      Try selecting a different category
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4"
                  >
                    {filteredResources
                      .filter(r => r.category === selectedCategory)
                      .map((resource, index) => (
                        <PublicResourceCard
                          key={resource.id}
                          resource={resource}
                          onClick={() => handleResourceClick(resource)}
                          onToggleFavorite={toggleFavorite}
                          onToggleLibrary={toggleLibrary}
                          isFavorite={resource.isFavorite ?? false}
                          isInLibrary={isResourceInLibrary(resource.id)}
                          index={index}
                        />
                      ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ============================================================ */}
        {/* MY FAVORITES TAB */}
        {/* ============================================================ */}
        {selectedTab === 'favorites' && (
          <div className="space-y-6 pb-20">
            {/* Search Bar */}
            <div className="px-4 pt-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="pl-9 h-11 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Results Overlay */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <SearchResultsOverlay
                    results={filteredResources}
                    onResourceClick={handleResourceClick}
                    onToggleFavorite={toggleFavorite}
                    favoriteIds={favoriteIds}
                    searchQuery={searchQuery}
                    onClose={clearSearch}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Favorites Content */}
            {filteredResources.length === 0 && !searchQuery ? (
              <FavoritesEmptyState />
            ) : (
              <ResourceGrid
                resources={filteredResources}
                onResourceClick={handleResourceClick}
                onToggleFavorite={toggleFavorite}
                favoriteIds={favoriteIds}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </PullToRefresh>
    </div>
  )
}

export default ResourcesTab
