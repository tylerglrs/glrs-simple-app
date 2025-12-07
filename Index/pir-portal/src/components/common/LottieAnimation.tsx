import { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';
import { cn } from '@/lib/utils';

// Pre-import animation data for better bundling
import confettiAnimation from '../../../public/animations/confetti.json';
import successAnimation from '../../../public/animations/success.json';
import fireAnimation from '../../../public/animations/fire.json';
import loadingAnimation from '../../../public/animations/loading.json';
import heartAnimation from '../../../public/animations/heart.json';

// Animation types available
export type AnimationType = 'confetti' | 'success' | 'fire' | 'loading' | 'heart';

const animations: Record<AnimationType, unknown> = {
  confetti: confettiAnimation,
  success: successAnimation,
  fire: fireAnimation,
  loading: loadingAnimation,
  heart: heartAnimation,
};

interface LottieAnimationProps {
  animation: AnimationType;
  className?: string;
  size?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  onComplete?: () => void;
}

export function LottieAnimation({
  animation,
  className,
  size = 100,
  loop = true,
  autoplay = true,
  speed = 1,
  onComplete,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  const animationData = animations[animation];

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      onComplete={onComplete}
      className={cn('pointer-events-none', className)}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    />
  );
}

// Convenience components for common use cases
export function ConfettiAnimation({
  size = 400,
  onComplete,
  ...props
}: Omit<LottieAnimationProps, 'animation'>) {
  return (
    <LottieAnimation
      animation="confetti"
      size={size}
      loop={false}
      onComplete={onComplete}
      {...props}
    />
  );
}

export function SuccessAnimation({
  size = 80,
  onComplete,
  ...props
}: Omit<LottieAnimationProps, 'animation'>) {
  return (
    <LottieAnimation
      animation="success"
      size={size}
      loop={false}
      onComplete={onComplete}
      {...props}
    />
  );
}

export function FireAnimation({
  size = 40,
  ...props
}: Omit<LottieAnimationProps, 'animation'>) {
  return (
    <LottieAnimation
      animation="fire"
      size={size}
      loop={true}
      {...props}
    />
  );
}

export function LoadingAnimation({
  size = 60,
  ...props
}: Omit<LottieAnimationProps, 'animation'>) {
  return (
    <LottieAnimation
      animation="loading"
      size={size}
      loop={true}
      {...props}
    />
  );
}

export function HeartAnimation({
  size = 40,
  ...props
}: Omit<LottieAnimationProps, 'animation'>) {
  return (
    <LottieAnimation
      animation="heart"
      size={size}
      loop={true}
      {...props}
    />
  );
}

export default LottieAnimation;