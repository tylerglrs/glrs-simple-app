import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTimeOfDay as useTimeOfDayHook, useTimeGradient, getCurrentTimeOfDay as getTimeOfDayNow, type TimeOfDay } from '@/hooks/useTimeOfDay';

interface TimeOfDayBackgroundProps {
  children: ReactNode;
  className?: string;
  /** Override auto-detection for testing */
  forceTimeOfDay?: TimeOfDay;
  /** Show the background image (subtle) */
  showBackgroundImage?: boolean;
}

// Re-export the type for consumers
export type { TimeOfDay };

// Greeting messages based on time of day
export const greetings: Record<TimeOfDay, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
};

// Icons for time of day (use with Lucide)
export const timeOfDayIcons: Record<TimeOfDay, string> = {
  morning: 'Sun',
  afternoon: 'Sun',
  evening: 'Sunset',
  night: 'Moon',
};

// Re-export the hook for convenience
export function useTimeOfDay(forceTimeOfDay?: TimeOfDay) {
  return useTimeOfDayHook(forceTimeOfDay);
}

export function TimeOfDayBackground({
  children,
  className,
  forceTimeOfDay,
  showBackgroundImage = true,
}: TimeOfDayBackgroundProps) {
  const timeOfDay = useTimeOfDayHook(forceTimeOfDay);
  const gradient = useTimeGradient(forceTimeOfDay);

  return (
    <div
      className={cn(
        'min-h-screen relative',
        className
      )}
    >
      {/* Vibrant gradient layer - fixed at viewport top, fades to transparent */}
      <div
        className="fixed inset-x-0 top-0 h-72 pointer-events-none z-0 transition-all duration-[2000ms]"
        style={{
          background: gradient,
          maskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
        }}
      />

      {/* Subtle base gradient for the rest of the page */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-[2000ms]"
        style={{
          background: timeOfDay === 'night'
            ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 30%, #f1f5f9 100%)'
            : timeOfDay === 'evening'
            ? 'linear-gradient(180deg, rgba(251,146,60,0.05) 0%, white 40%, #f8fafc 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, white 30%, #f8fafc 100%)',
        }}
      />

      {/* Content layer - above gradient */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Export utility function for use in other components
export function getGreeting(name?: string): string {
  const timeOfDay = getTimeOfDayNow();
  const greeting = greetings[timeOfDay];
  return name ? `${greeting}, ${name}` : greeting;
}

export function getCurrentTimeOfDay(): TimeOfDay {
  return getTimeOfDayNow();
}

export default TimeOfDayBackground;