import confetti from 'canvas-confetti';

// ============================================
// REDUCED MOTION CHECK
// ============================================

/**
 * Check if user prefers reduced motion (accessibility)
 * Returns true if animations should be disabled/reduced
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get motion-safe animation duration
 * Returns 0 if reduced motion is preferred
 */
export const getMotionSafeDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0 : duration;
};

// ============================================
// FRAMER MOTION VARIANTS
// ============================================

// Page transition variants
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.3,
};

// Staggered list animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// Fade variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Scale variants
export const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
};

export const popIn = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 15 } },
};

// Card hover effect
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { type: 'spring' as const, stiffness: 400, damping: 17 } },
  tap: { scale: 0.98 },
};

// Button press effect
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Slide variants for drawers/modals
export const slideUp = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
};

export const slideDown = {
  hidden: { y: '-100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } },
  exit: { y: '-100%', opacity: 0, transition: { duration: 0.2 } },
};

export const slideRight = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
};

// ============================================
// SPRING CONFIGURATIONS
// ============================================

export const springConfig = {
  default: { type: 'spring' as const, stiffness: 400, damping: 17 },
  soft: { type: 'spring' as const, stiffness: 200, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 500, damping: 15 },
  stiff: { type: 'spring' as const, stiffness: 600, damping: 30 },
};

// ============================================
// CONFETTI CELEBRATIONS
// ============================================

// Basic celebration burst
export const celebrate = () => {
  // Respect reduced motion preference
  if (prefersReducedMotion()) return;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#069494', '#fbbf24', '#fb7185', '#6366f1', '#22c55e'],
  });
};

// Milestone celebration (more dramatic)
export const milestoneCelebration = () => {
  // Respect reduced motion preference
  if (prefersReducedMotion()) return;

  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const colors = ['#069494', '#fbbf24', '#fb7185'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

// Streak celebration (fire themed)
export const streakCelebration = () => {
  // Respect reduced motion preference
  if (prefersReducedMotion()) return;

  const colors = ['#f97316', '#ef4444', '#fbbf24'];

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors,
    shapes: ['circle'],
  });
};

// Achievement unlocked
export const achievementCelebration = () => {
  // Respect reduced motion preference
  if (prefersReducedMotion()) return;

  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#fbbf24', '#f59e0b', '#d97706'],
  };

  confetti({
    ...defaults,
    particleCount: 30,
    scalar: 1.2,
    shapes: ['star'],
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.75,
    shapes: ['circle'],
  });
};

// Check-in completion
export const checkInCelebration = () => {
  // Respect reduced motion preference
  if (prefersReducedMotion()) return;

  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.65 },
    colors: ['#069494', '#14b8a6', '#5eead4'],
    scalar: 0.8,
  });
};

// ============================================
// HAPTIC FEEDBACK
// ============================================

const hasHaptics = () => 'vibrate' in navigator;

export const haptics = {
  // Light tap (button press)
  tap: () => {
    if (hasHaptics()) navigator.vibrate(10);
  },
  // Medium tap (selection)
  select: () => {
    if (hasHaptics()) navigator.vibrate(20);
  },
  // Success pattern
  success: () => {
    if (hasHaptics()) navigator.vibrate([10, 50, 10]);
  },
  // Warning pattern
  warning: () => {
    if (hasHaptics()) navigator.vibrate([30, 30, 30]);
  },
  // Error pattern
  error: () => {
    if (hasHaptics()) navigator.vibrate([50, 50, 50, 50, 50]);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get time-of-day based gradient class
export const getTimeGradient = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'bg-gradient-morning';
  if (hour >= 12 && hour < 17) return 'bg-gradient-afternoon';
  if (hour >= 17 && hour < 20) return 'bg-gradient-evening';
  return 'bg-gradient-night';
};

// Get greeting based on time of day
export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

// Get metric color classes
export const getMetricColors = (metric: 'mood' | 'energy' | 'anxiety' | 'sleep' | 'craving') => {
  const colors = {
    mood: { bg: 'bg-mood-light', text: 'text-mood', border: 'border-mood/20', gradient: 'from-indigo-50 to-blue-50' },
    energy: { bg: 'bg-energy-light', text: 'text-energy', border: 'border-energy/20', gradient: 'from-amber-50 to-orange-50' },
    anxiety: { bg: 'bg-anxiety-light', text: 'text-anxiety', border: 'border-anxiety/20', gradient: 'from-red-50 to-orange-50' },
    sleep: { bg: 'bg-sleep-light', text: 'text-sleep', border: 'border-sleep/20', gradient: 'from-blue-50 to-indigo-50' },
    craving: { bg: 'bg-craving-light', text: 'text-craving', border: 'border-craving/20', gradient: 'from-pink-50 to-rose-50' },
  };
  return colors[metric];
};

// Get score color based on value (1-10 scale)
export const getScoreColor = (score: number, inverted = false) => {
  const value = inverted ? 10 - score : score;
  if (value >= 8) return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' };
  if (value >= 6) return { bg: 'bg-teal-100', text: 'text-teal-700', bar: 'bg-teal-500' };
  if (value >= 4) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' };
  if (value >= 2) return { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
};

// Get streak color based on days
export const getStreakColor = (days: number) => {
  if (days >= 365) return { bg: 'bg-rose-100', text: 'text-rose-700', icon: 'text-rose-500', label: 'Legendary' };
  if (days >= 90) return { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-500', label: 'Epic' };
  if (days >= 30) return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'text-amber-500', label: 'Great' };
  if (days >= 7) return { bg: 'bg-teal-100', text: 'text-teal-700', icon: 'text-teal-500', label: 'Building' };
  return { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'text-slate-400', label: 'Starting' };
};
