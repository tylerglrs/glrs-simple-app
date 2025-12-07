import { useState, useCallback, useMemo } from 'react'
import {
  Heart,
  Handshake,
  PartyPopper,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Flag,
  Ban,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { formatTimeAgo, getInitials } from '../hooks/useCommunity'
import type { CommunityMessage as CommunityMessageType, MyDayPost, Comment } from '../types'

// ============================================================
// REACTION BUTTON COMPONENT
// ============================================================

interface ReactionButtonProps {
  icon: typeof Heart
  label: string
  count: number
  isActive: boolean
  activeColor: string
  onClick: () => void
}

function ReactionButton({
  icon: Icon,
  label,
  count,
  isActive,
  activeColor,
  onClick,
}: ReactionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'flex-1 h-9 gap-1.5 font-normal transition-colors',
        isActive && activeColor
      )}
    >
      <Icon className={cn('h-4 w-4', isActive && 'fill-current')} />
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && <span className="text-xs opacity-70">({count})</span>}
    </Button>
  )
}

// ============================================================
// COMMENT COMPONENT
// ============================================================

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  isCoachOrAdmin: boolean
  onDelete: () => void
  onAvatarClick: (userId: string, isAnonymous: boolean) => void
}

function CommentItem({
  comment,
  currentUserId,
  isCoachOrAdmin,
  onDelete,
  onAvatarClick,
}: CommentItemProps) {
  const canDelete = comment.userId === currentUserId || isCoachOrAdmin

  return (
    <div className="flex gap-2 mb-2">
      <Avatar
        className={cn(
          'h-6 w-6 flex-shrink-0',
          !comment.isAnonymous && 'cursor-pointer hover:ring-2 hover:ring-primary/50'
        )}
        onClick={() => onAvatarClick(comment.userId, comment.isAnonymous)}
      >
        <AvatarImage src={comment.userProfileImageUrl || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
          {getInitials(comment.userDisplayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={cn(
                'text-sm font-semibold text-foreground',
                !comment.isAnonymous && 'cursor-pointer hover:text-primary'
              )}
              onClick={() => onAvatarClick(comment.userId, comment.isAnonymous)}
            >
              {comment.userDisplayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
            {canDelete && (
              <button
                onClick={onDelete}
                className="ml-auto text-muted-foreground hover:text-destructive p-0.5"
                title="Delete comment"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-foreground break-words whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface CommunityMessageProps {
  message: CommunityMessageType | MyDayPost
  currentUserId: string
  isMyDayPost?: boolean
  comments?: Comment[]
  loadingComments?: boolean
  submittingComment?: boolean
  onReaction: (reactionType: 'heart' | 'support' | 'celebrate') => Promise<void>
  onLoadComments: () => Promise<void>
  onAddComment: (content: string) => Promise<boolean>
  onDeleteComment: (commentId: string) => Promise<boolean>
  onDelete: () => Promise<boolean>
  onReport: () => Promise<boolean>
  onBlock?: () => Promise<boolean>
  onAvatarClick: (userId: string, isAnonymous: boolean) => void
  onImageClick: (imageUrl: string) => void
  isCoachOrAdmin: boolean
}

export function CommunityMessage({
  message,
  currentUserId,
  isMyDayPost = false,
  comments = [],
  loadingComments = false,
  submittingComment = false,
  onReaction,
  onLoadComments,
  onAddComment,
  onDeleteComment,
  onDelete,
  onReport,
  onBlock,
  onAvatarClick,
  onImageClick,
  isCoachOrAdmin,
}: CommunityMessageProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  // Get the correct fields based on message type
  const userId = isMyDayPost
    ? (message as MyDayPost).userId
    : (message as CommunityMessageType).senderId
  const userName = isMyDayPost
    ? (message as MyDayPost).userDisplayName
    : (message as CommunityMessageType).senderName
  const userImage = isMyDayPost
    ? (message as MyDayPost).userProfileImageUrl
    : (message as CommunityMessageType).senderProfileImageUrl
  const imageUrl = !isMyDayPost ? (message as CommunityMessageType).imageUrl : undefined

  const isOwnPost = userId === currentUserId
  const canDelete = isOwnPost || isCoachOrAdmin
  const canBlock = !isOwnPost && !message.isAnonymous && onBlock

  // Reaction counts
  const heartCount = message.reactions?.heart?.length || 0
  const supportCount = message.reactions?.support?.length || 0
  const celebrateCount = message.reactions?.celebrate?.length || 0
  const currentReaction = message.reactedBy?.[currentUserId]

  // My Day post type badge
  const postTypeBadge = useMemo(() => {
    if (!isMyDayPost) return null
    const post = message as MyDayPost
    return post.type === 'reflection' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        Reflection
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        Win
      </span>
    )
  }, [isMyDayPost, message])

  // Toggle comments
  const handleToggleComments = useCallback(async () => {
    if (!showComments && comments.length === 0) {
      await onLoadComments()
    }
    setShowComments((prev) => !prev)
  }, [showComments, comments.length, onLoadComments])

  // Submit comment
  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || submittingComment) return
    const success = await onAddComment(commentText.trim())
    if (success) {
      setCommentText('')
    }
  }, [commentText, submittingComment, onAddComment])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmitComment()
      }
    },
    [handleSubmitComment]
  )

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            className={cn(
              isMobile ? 'h-9 w-9' : 'h-10 w-10',
              !message.isAnonymous && 'cursor-pointer hover:ring-2 hover:ring-primary/50'
            )}
            onClick={() => onAvatarClick(userId, message.isAnonymous)}
          >
            <AvatarImage src={userImage || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'font-semibold text-foreground',
                  !message.isAnonymous && 'cursor-pointer hover:text-primary'
                )}
                onClick={() => onAvatarClick(userId, message.isAnonymous)}
              >
                {userName || 'Anonymous'}
              </span>
              {postTypeBadge}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(message.createdAt)}
            </p>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReport()}>
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
              {canBlock && (
                <DropdownMenuItem
                  onClick={() => onBlock()}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {message.content && (
          <p className="text-foreground text-sm md:text-base leading-relaxed mb-3 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="mb-3 -mx-4 md:mx-0">
            <img
              src={imageUrl}
              alt="Post content"
              className={cn(
                'w-full object-cover cursor-pointer hover:opacity-95 transition-opacity',
                isMobile ? 'max-h-80' : 'max-w-md rounded-lg'
              )}
              onClick={() => onImageClick(imageUrl)}
            />
          </div>
        )}

        {/* Reactions */}
        <div className="border-t pt-2">
          <div className="flex gap-1 mb-2">
            <ReactionButton
              icon={Heart}
              label="Heart"
              count={heartCount}
              isActive={currentReaction === 'heart'}
              activeColor="text-red-500"
              onClick={() => onReaction('heart')}
            />
            <ReactionButton
              icon={Handshake}
              label="Support"
              count={supportCount}
              isActive={currentReaction === 'support'}
              activeColor="text-blue-500"
              onClick={() => onReaction('support')}
            />
            <ReactionButton
              icon={PartyPopper}
              label="Celebrate"
              count={celebrateCount}
              isActive={currentReaction === 'celebrate'}
              activeColor="text-amber-500"
              onClick={() => onReaction('celebrate')}
            />
          </div>

          {/* Comment count toggle */}
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            <MessageCircle className="h-4 w-4" />
            {message.commentCount || 0} comments
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t">
            {/* Comments List */}
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-2 mb-3">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    isCoachOrAdmin={isCoachOrAdmin}
                    onDelete={() => onDeleteComment(comment.id)}
                    onAvatarClick={onAvatarClick}
                  />
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div className="flex gap-2 items-center">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a comment..."
                className="flex-1 rounded-full"
                disabled={submittingComment}
                maxLength={280}
              />
              <Button
                size="icon"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
                className="rounded-full h-9 w-9"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {commentText.length > 250 && (
              <p
                className={cn(
                  'text-xs text-right mt-1',
                  commentText.length > 280 ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {commentText.length}/280
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CommunityMessage
