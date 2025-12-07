import { useState, useCallback, useRef } from 'react'
import { Image, Send, Loader2, Lock, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useToast } from '@/hooks/use-toast'
import { CommunityMessage } from './CommunityMessage'
import { getInitials } from '../hooks/useCommunity'
import type { CommunityMessage as CommunityMessageType, Comment } from '../types'

// ============================================================
// TYPES
// ============================================================

interface CommunityChatProps {
  messages: CommunityMessageType[]
  loading: boolean
  error: string | null
  currentUserId: string
  currentUserName: string
  currentUserImage?: string
  isCoachOrAdmin: boolean
  privacySettings?: {
    communityParticipation?: boolean
    anonymousPosting?: boolean
  }
  comments: Record<string, Comment[]>
  loadingComments: Record<string, boolean>
  submittingComment: boolean
  uploading: boolean
  uploadProgress: number
  onSendMessage: (content: string, imageUrl?: string, isAnonymous?: boolean) => Promise<boolean>
  onUploadImage: (file: File) => Promise<string | null>
  onDeleteMessage: (messageId: string) => Promise<boolean>
  onReportMessage: (messageId: string) => Promise<boolean>
  onBlockUser: (userId: string) => Promise<boolean>
  onReaction: (messageId: string, reactionType: 'heart' | 'support' | 'celebrate') => Promise<void>
  onLoadComments: (messageId: string) => Promise<void>
  onAddComment: (messageId: string, content: string) => Promise<boolean>
  onDeleteComment: (messageId: string, commentId: string) => Promise<boolean>
  onAvatarClick: (userId: string, isAnonymous: boolean) => void
  onImageClick: (imageUrl: string) => void
  onNavigateToPrivacy?: () => void
}

// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-8 w-full" />
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
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Send className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">No posts yet</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Be the first to share something with the community!
        </p>
      </CardContent>
    </Card>
  )
}

// ============================================================
// PARTICIPATION DISABLED OVERLAY
// ============================================================

interface DisabledOverlayProps {
  onNavigateToPrivacy?: () => void
}

function DisabledOverlay({ onNavigateToPrivacy }: DisabledOverlayProps) {
  return (
    <div
      onClick={onNavigateToPrivacy}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/95 rounded-xl cursor-pointer"
    >
      <Lock className="h-8 w-8 text-muted-foreground" />
      <div className="text-center px-4">
        <p className="font-semibold text-foreground mb-1">
          Community Participation Disabled
        </p>
        <p className="text-sm text-muted-foreground">
          Click here to enable in Privacy Settings
        </p>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function CommunityChat({
  messages,
  loading,
  error,
  currentUserId,
  currentUserName,
  currentUserImage,
  isCoachOrAdmin,
  privacySettings,
  comments,
  loadingComments,
  submittingComment,
  uploading,
  uploadProgress,
  onSendMessage,
  onUploadImage,
  onDeleteMessage,
  onReportMessage,
  onBlockUser,
  onReaction,
  onLoadComments,
  onAddComment,
  onDeleteComment,
  onAvatarClick,
  onImageClick,
  onNavigateToPrivacy,
}: CommunityChatProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [messageText, setMessageText] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)

  const isParticipationDisabled = privacySettings?.communityParticipation === false
  const isAnonymousEnabled = privacySettings?.anonymousPosting === true

  // Handle image selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Image too large',
        description: 'Please select an image under 5MB',
      })
      return
    }

    setSelectedImage(file)
    setSelectedImagePreview(URL.createObjectURL(file))
  }, [toast])

  // Clear selected image
  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null)
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview)
    }
    setSelectedImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [selectedImagePreview])

  // Send message
  const handleSend = useCallback(async () => {
    if (isParticipationDisabled) {
      onNavigateToPrivacy?.()
      return
    }

    if (!messageText.trim() && !selectedImage) return

    try {
      let imageUrl: string | undefined

      if (selectedImage) {
        const url = await onUploadImage(selectedImage)
        if (!url) {
          toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: 'Could not upload image. Please try again.',
          })
          return
        }
        imageUrl = url
      }

      const success = await onSendMessage(messageText, imageUrl, isAnonymousEnabled)

      if (success) {
        setMessageText('')
        clearSelectedImage()
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to post',
          description: 'Could not send your message. Please try again.',
        })
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
    }
  }, [
    isParticipationDisabled,
    messageText,
    selectedImage,
    isAnonymousEnabled,
    onNavigateToPrivacy,
    onSendMessage,
    onUploadImage,
    clearSelectedImage,
    toast,
  ])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="space-y-4">
      {/* Create Post Card */}
      <Card className="relative overflow-hidden">
        {isParticipationDisabled && (
          <DisabledOverlay onNavigateToPrivacy={onNavigateToPrivacy} />
        )}
        <CardContent className={cn('p-4', isParticipationDisabled && 'opacity-50')}>
          <div className="flex gap-3">
            <Avatar className={cn('flex-shrink-0', isMobile ? 'h-9 w-9' : 'h-10 w-10')}>
              <AvatarImage src={currentUserImage} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(currentUserName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What's on your mind?"
                className="rounded-full bg-muted border-0"
                disabled={isParticipationDisabled}
              />

              {/* Image Preview */}
              {selectedImagePreview && (
                <div className="relative inline-block">
                  <img
                    src={selectedImagePreview}
                    alt="Selected"
                    className="max-h-32 rounded-lg"
                  />
                  <button
                    onClick={clearSelectedImage}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading... {uploadProgress}%</span>
                </div>
              )}

              {/* Anonymous Posting Toggle */}
              <div
                onClick={onNavigateToPrivacy}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors',
                  isAnonymousEnabled
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <Checkbox
                  checked={isAnonymousEnabled}
                  className="pointer-events-none"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Post anonymously</p>
                  <p className="text-xs text-muted-foreground">
                    {isAnonymousEnabled
                      ? 'Enabled in Privacy Settings'
                      : 'Click to change in Privacy Settings'}
                  </p>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isParticipationDisabled}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParticipationDisabled || uploading}
                  className="flex-1"
                >
                  <Image className="h-5 w-5 mr-2" />
                  Photo
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={
                    isParticipationDisabled ||
                    uploading ||
                    (!messageText.trim() && !selectedImage)
                  }
                  className="px-6"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Feed */}
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
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {messages.map((message) => (
            <CommunityMessage
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isMyDayPost={false}
              comments={comments[message.id] || []}
              loadingComments={loadingComments[message.id]}
              submittingComment={submittingComment}
              onReaction={(type) => onReaction(message.id, type)}
              onLoadComments={() => onLoadComments(message.id)}
              onAddComment={(content) => onAddComment(message.id, content)}
              onDeleteComment={(commentId) => onDeleteComment(message.id, commentId)}
              onDelete={() => onDeleteMessage(message.id)}
              onReport={() => onReportMessage(message.id)}
              onBlock={() => onBlockUser(message.senderId)}
              onAvatarClick={onAvatarClick}
              onImageClick={onImageClick}
              isCoachOrAdmin={isCoachOrAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommunityChat
