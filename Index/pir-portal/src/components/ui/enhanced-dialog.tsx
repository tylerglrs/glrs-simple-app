import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// =============================================================================
// TYPES
// =============================================================================

export type ModalVariant =
  | 'centered'
  | 'centered-large'
  | 'sheet-left'
  | 'sheet-right'
  | 'bottom-sheet'
  | 'fullscreen'
  | 'popover'

export interface EnhancedDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: ModalVariant
  showCloseButton?: boolean
  overlayClassName?: string
  disableAnimation?: boolean
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const centeredVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

const sheetLeftVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

const sheetRightVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

const bottomSheetVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

const fullscreenVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
}

const popoverVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.1 },
  },
}

// Get animation variants based on modal variant
const getAnimationVariants = (variant: ModalVariant) => {
  switch (variant) {
    case 'sheet-left':
      return sheetLeftVariants
    case 'sheet-right':
      return sheetRightVariants
    case 'bottom-sheet':
      return bottomSheetVariants
    case 'fullscreen':
      return fullscreenVariants
    case 'popover':
      return popoverVariants
    case 'centered':
    case 'centered-large':
    default:
      return centeredVariants
  }
}

// =============================================================================
// STYLE CONFIGURATIONS
// =============================================================================

const getVariantStyles = (variant: ModalVariant, isMobile: boolean): string => {
  const baseStyles = 'z-50 bg-background shadow-lg border'

  switch (variant) {
    case 'centered':
      return cn(
        baseStyles,
        'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-[95vw] sm:max-w-[450px] rounded-xl',
        'max-h-[90vh] overflow-hidden'
      )
    case 'centered-large':
      return cn(
        baseStyles,
        'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-[95vw] sm:max-w-[550px] rounded-xl',
        'max-h-[90vh] overflow-hidden'
      )
    case 'sheet-left':
      return cn(
        baseStyles,
        'fixed left-0 top-0 h-full',
        'w-[85vw] sm:w-[350px] rounded-r-xl',
        'border-l-0 border-t-0 border-b-0'
      )
    case 'sheet-right':
      return cn(
        baseStyles,
        'fixed right-0 top-0 h-full',
        'w-[85vw] sm:w-[400px] rounded-l-xl',
        'border-r-0 border-t-0 border-b-0'
      )
    case 'bottom-sheet':
      return cn(
        baseStyles,
        'fixed bottom-0 left-0 right-0',
        'w-full rounded-t-2xl',
        isMobile ? 'max-h-[85vh]' : 'max-h-[70vh] max-w-[500px] left-[50%] translate-x-[-50%]',
        'border-b-0 border-l-0 border-r-0'
      )
    case 'fullscreen':
      return cn(
        'fixed inset-0 z-50 bg-background',
        'w-full h-full',
        'border-0 rounded-none'
      )
    case 'popover':
      return cn(
        baseStyles,
        'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-[320px] rounded-xl',
        'max-h-[400px] overflow-hidden'
      )
    default:
      return cn(
        baseStyles,
        'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-[95vw] sm:max-w-[450px] rounded-xl'
      )
  }
}

// =============================================================================
// COMPONENTS
// =============================================================================

const EnhancedDialog = DialogPrimitive.Root

const EnhancedDialogTrigger = DialogPrimitive.Trigger

const EnhancedDialogPortal = DialogPrimitive.Portal

const EnhancedDialogClose = DialogPrimitive.Close

// Overlay with Framer Motion
const EnhancedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: ModalVariant
  }
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild {...props}>
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
      className={cn(
        'fixed inset-0 z-50',
        variant === 'fullscreen' ? 'bg-background' : 'bg-black/60 backdrop-blur-sm',
        className
      )}
    />
  </DialogPrimitive.Overlay>
))
EnhancedDialogOverlay.displayName = 'EnhancedDialogOverlay'

// Main Content with Framer Motion
const EnhancedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  EnhancedDialogContentProps
>(
  (
    {
      className,
      children,
      variant = 'centered',
      showCloseButton = true,
      overlayClassName,
      disableAnimation = false,
      ...props
    },
    ref
  ) => {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const animationVariants = getAnimationVariants(variant)
    const variantStyles = getVariantStyles(variant, isMobile)

    // For mobile, auto-upgrade centered to bottom-sheet for better UX
    const effectiveAnimationVariants =
      isMobile && (variant === 'centered' || variant === 'centered-large')
        ? bottomSheetVariants
        : animationVariants

    const effectiveStyles =
      isMobile && (variant === 'centered' || variant === 'centered-large')
        ? getVariantStyles('bottom-sheet', isMobile)
        : variantStyles

    return (
      <EnhancedDialogPortal>
        <AnimatePresence mode="wait">
          <EnhancedDialogOverlay variant={variant} className={overlayClassName} />
          <DialogPrimitive.Content ref={ref} asChild {...props}>
            <motion.div
              variants={disableAnimation ? undefined : effectiveAnimationVariants}
              initial={disableAnimation ? undefined : 'hidden'}
              animate={disableAnimation ? undefined : 'visible'}
              exit={disableAnimation ? undefined : 'exit'}
              className={cn(effectiveStyles, className)}
            >
              {children}
              {showCloseButton && variant !== 'fullscreen' && (
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </AnimatePresence>
      </EnhancedDialogPortal>
    )
  }
)
EnhancedDialogContent.displayName = 'EnhancedDialogContent'

// Header
const EnhancedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
EnhancedDialogHeader.displayName = 'EnhancedDialogHeader'

// Footer
const EnhancedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
EnhancedDialogFooter.displayName = 'EnhancedDialogFooter'

// Title
const EnhancedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
EnhancedDialogTitle.displayName = 'EnhancedDialogTitle'

// Description
const EnhancedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
EnhancedDialogDescription.displayName = 'EnhancedDialogDescription'

// =============================================================================
// SPECIALIZED VARIANTS
// =============================================================================

// Bottom sheet with drag handle
interface BottomSheetContentProps extends EnhancedDialogContentProps {
  showDragHandle?: boolean
}

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(({ className, children, showDragHandle = true, ...props }, ref) => (
  <EnhancedDialogContent
    ref={ref}
    variant="bottom-sheet"
    className={cn('pt-2', className)}
    {...props}
  >
    {showDragHandle && (
      <div className="flex justify-center pb-2">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
      </div>
    )}
    {children}
  </EnhancedDialogContent>
))
BottomSheetContent.displayName = 'BottomSheetContent'

// Fullscreen with custom header slot
interface FullscreenContentProps extends Omit<EnhancedDialogContentProps, 'showCloseButton'> {
  headerContent?: React.ReactNode
  onBack?: () => void
}

const FullscreenContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  FullscreenContentProps
>(({ className, children, headerContent, onBack, ...props }, ref) => (
  <EnhancedDialogContent
    ref={ref}
    variant="fullscreen"
    showCloseButton={false}
    className={cn('flex flex-col', className)}
    {...props}
  >
    {headerContent && (
      <div className="flex-shrink-0 border-b">
        {headerContent}
      </div>
    )}
    <div className="flex-1 overflow-auto">{children}</div>
  </EnhancedDialogContent>
))
FullscreenContent.displayName = 'FullscreenContent'

// Sheet content with side-specific styling
interface SheetContentProps extends EnhancedDialogContentProps {
  side?: 'left' | 'right'
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = 'right', ...props }, ref) => (
  <EnhancedDialogContent
    ref={ref}
    variant={side === 'left' ? 'sheet-left' : 'sheet-right'}
    className={cn('flex flex-col', className)}
    {...props}
  >
    {children}
  </EnhancedDialogContent>
))
SheetContent.displayName = 'SheetContent'

// =============================================================================
// EXPORTS
// =============================================================================

export {
  EnhancedDialog,
  EnhancedDialogPortal,
  EnhancedDialogOverlay,
  EnhancedDialogTrigger,
  EnhancedDialogClose,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogFooter,
  EnhancedDialogTitle,
  EnhancedDialogDescription,
  // Specialized variants
  BottomSheetContent,
  FullscreenContent,
  SheetContent,
}
