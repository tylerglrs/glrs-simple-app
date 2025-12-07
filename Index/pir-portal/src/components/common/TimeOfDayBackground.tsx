import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimeOfDayBackgroundProps {
  children: ReactNode;
  className?: string;
  /** Override auto-detection for testing */
  forceTimeOfDay?: TimeOfDay;
  /** Show the background image (subtle) */
  showBackgroundImage?: boolean;
}

/**
 * Time ranges:
 * - Morning: 5:00 AM - 11:59 AM
 * - Afternoon: 12:00 PM - 4:59 PM
 * - Evening: 5:00 PM - 7:59 PM
 * - Night: 8:00 PM - 4:59 AM
 */
function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

const gradientClasses: Record<TimeOfDay, string> = {
  morning: 'bg-gradient-morning',
  afternoon: 'bg-gradient-afternoon',
  evening: 'bg-gradient-evening',
  night: 'bg-gradient-night',
};

// Base path must match vite.config.ts base setting
const BASE_PATH = '/Index/pir-portal/dist';

const backgroundImages: Record<TimeOfDay, string> = {
  morning: `${BASE_PATH}/images/backgrounds/morning-bg.svg`,
  afternoon: `${BASE_PATH}/images/backgrounds/afternoon-bg.svg`,
  evening: `${BASE_PATH}/images/backgrounds/evening-bg.svg`,
  night: `${BASE_PATH}/images/backgrounds/night-bg.svg`,
};

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

export function useTimeOfDay(forceTimeOfDay?: TimeOfDay) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
    if (forceTimeOfDay) return forceTimeOfDay;
    return getTimeOfDay(new Date().getHours());
  });

  useEffect(() => {
    if (forceTimeOfDay) {
      setTimeOfDay(forceTimeOfDay);
      return;
    }

    // Update time of day every minute
    const updateTimeOfDay = () => {
      setTimeOfDay(getTimeOfDay(new Date().getHours()));
    };

    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, [forceTimeOfDay]);

  return timeOfDay;
}

export function TimeOfDayBackground({
  children,
  className,
  forceTimeOfDay,
  showBackgroundImage = true,
}: TimeOfDayBackgroundProps) {
  const timeOfDay = useTimeOfDay(forceTimeOfDay);

  return (
    <div
      className={cn(
        'min-h-screen relative',
        gradientClasses[timeOfDay],
        className
      )}
    >
      {showBackgroundImage && (
        <div
          className="fixed inset-0 pointer-events-none opacity-50 -z-10"
          style={{
            backgroundImage: `url(${backgroundImages[timeOfDay]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {children}
    </div>
  );
}

// Export utility function for use in other components
export function getGreeting(name?: string): string {
  const timeOfDay = getTimeOfDay(new Date().getHours());
  const greeting = greetings[timeOfDay];
  return name ? `${greeting}, ${name}` : greeting;
}

export function getCurrentTimeOfDay(): TimeOfDay {
  return getTimeOfDay(new Date().getHours());
}

export default TimeOfDayBackground;