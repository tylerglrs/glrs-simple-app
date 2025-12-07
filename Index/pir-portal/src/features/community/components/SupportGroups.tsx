import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { GradientCard, CommunityIllustration, SupportIllustration } from '@/components/common'
import { staggerContainer, staggerItem, haptics } from '@/lib/animations'
import type { SupportGroup, SupportGroupType } from '../types'

// ============================================================
// TYPES
// ============================================================

interface SupportGroupsProps {
  groups: SupportGroup[]
  loading: boolean
  error: string | null
}

// ============================================================
// CONSTANTS
// ============================================================

const GROUP_TYPE_STYLES: Record<
  SupportGroupType,
  { bg: string; text: string; label: string }
> = {
  AA: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'AA',
  },
  NA: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    label: 'NA',
  },
  SMART: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    label: 'SMART',
  },
  Refuge: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Refuge',
  },
  Other: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    label: 'Other',
  },
}

// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex justify-center mb-4">
          <SupportIllustration size="lg" className="w-32 h-32 opacity-80" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          No support groups available
        </h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Check back later for available support groups in your area.
        </p>
      </CardContent>
    </Card>
  )
}

// ============================================================
// SUPPORT GROUP CARD
// ============================================================

interface SupportGroupCardProps {
  group: SupportGroup
}

function SupportGroupCard({ group }: SupportGroupCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const typeStyle = GROUP_TYPE_STYLES[group.type] || GROUP_TYPE_STYLES.Other

  const handleJoinMeeting = () => {
    haptics.tap()
    if (group.link) {
      window.open(group.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div variants={staggerItem}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className={cn('p-4', isMobile ? 'p-3' : 'p-4')}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className={cn('font-semibold text-foreground', isMobile ? 'text-base' : 'text-lg')}>
              {group.name}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                'font-semibold text-xs shrink-0',
                typeStyle.bg,
                typeStyle.text
              )}
            >
              {typeStyle.label}
            </Badge>
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{group.day}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{group.time}</span>
            </div>
            {group.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="line-clamp-1">{group.location}</span>
              </div>
            )}
            {!group.location && group.link && (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary shrink-0" />
                <span>Virtual Meeting</span>
              </div>
            )}
          </div>

          {/* Join Button */}
          {group.link && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleJoinMeeting}
                className="mt-4 w-full sm:w-auto"
                size={isMobile ? 'default' : 'sm'}
              >
                <Video className="h-4 w-4 mr-2" />
                Join Virtual Meeting
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SupportGroups({ groups, loading, error }: SupportGroupsProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GradientCard gradient="from-purple-50 to-indigo-100" className="overflow-hidden relative">
          {/* Decorative pattern */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-200/30 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-indigo-200/20 translate-y-1/2 -translate-x-1/2" />
          </div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              Support Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 relative z-10 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              Join a support group that fits your schedule. Virtual meetings are
              available for remote participation.
            </p>
            <CommunityIllustration size="sm" className="w-16 h-16 opacity-70 shrink-0 hidden sm:block" />
          </CardContent>
        </GradientCard>
      </motion.div>

      {/* Groups List */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {groups.map((group) => (
            <SupportGroupCard key={group.id} group={group} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default SupportGroups
