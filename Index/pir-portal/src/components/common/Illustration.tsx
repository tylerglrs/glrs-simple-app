import { cn } from '@/lib/utils';

// Available illustration types
export type IllustrationType =
  | 'meditation'
  | 'achievement'
  | 'celebration'
  | 'community'
  | 'coping'
  | 'education'
  | 'empty-state'
  | 'evening'
  | 'goals'
  | 'gratitude'
  | 'journal'
  | 'journey'
  | 'life-skills'
  | 'morning'
  | 'relapse-prevention'
  | 'support';

interface IllustrationProps {
  name: IllustrationType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  alt?: string;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
  full: 'w-full h-auto',
};

// Base path must match vite.config.ts base setting
const BASE_PATH = '/Index/pir-portal/dist';

/**
 * Component to display SVG illustrations from the public/illustrations folder
 *
 * Usage:
 * <Illustration name="meditation" size="md" />
 * <Illustration name="achievement" className="w-40 h-40" />
 */
export function Illustration({
  name,
  className,
  size = 'md',
  alt,
}: IllustrationProps) {
  return (
    <img
      src={`${BASE_PATH}/illustrations/${name}.svg`}
      alt={alt || `${name} illustration`}
      className={cn(sizeClasses[size], className)}
      loading="lazy"
    />
  );
}

/**
 * Pre-built illustration components for common use cases
 */
export function MeditationIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="meditation" className={className} size={size} />;
}

export function AchievementIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="achievement" className={className} size={size} />;
}

export function CelebrationIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="celebration" className={className} size={size} />;
}

export function CommunityIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="community" className={className} size={size} />;
}

export function JourneyIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="journey" className={className} size={size} />;
}

export function MorningIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="morning" className={className} size={size} />;
}

export function EveningIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="evening" className={className} size={size} />;
}

export function EmptyStateIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="empty-state" className={className} size={size} />;
}

export function GoalsIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="goals" className={className} size={size} />;
}

export function GratitudeIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="gratitude" className={className} size={size} />;
}

export function JournalIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="journal" className={className} size={size} />;
}

export function EducationIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="education" className={className} size={size} />;
}

export function CopingIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="coping" className={className} size={size} />;
}

export function LifeSkillsIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="life-skills" className={className} size={size} />;
}

export function RelapsePreventionIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="relapse-prevention" className={className} size={size} />;
}

export function SupportIllustration({ className, size }: Omit<IllustrationProps, 'name'>) {
  return <Illustration name="support" className={className} size={size} />;
}

export default Illustration;