/**
 * AIContextDisplay Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Displays AI-specific data for crisis alerts:
 * - AI feature badge
 * - Trigger keywords (highlighted in red)
 * - Full message with keyword highlighting
 * - AI response (or "LLM Bypassed" indicator)
 * - Resources displayed indicator
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bot,
  Zap,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CrisisAlert, AIFeature } from '../types'

interface AIContextDisplayProps {
  alert: CrisisAlert
}

// AI Feature labels and colors
const aiFeatureConfig: Record<
  AIFeature,
  { label: string; color: string; bgColor: string }
> = {
  anchor: {
    label: 'Anchor AI Chat',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  daily_oracle: {
    label: 'Daily Oracle',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  voice_companion: {
    label: 'Voice Companion',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  story_mode: {
    label: 'Story Mode',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  guided_checkin: {
    label: 'Guided Check-in',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
  },
  prompt_cards: {
    label: 'Prompt Cards',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
}

/**
 * Highlights keywords within text
 */
function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length || !text) return text

  // Create a regex to match any of the keywords (case insensitive)
  const pattern = keywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
    .join('|')

  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) => {
    const isKeyword = keywords.some(
      (k) => k.toLowerCase() === part.toLowerCase()
    )
    if (isKeyword) {
      return (
        <span
          key={index}
          className="bg-red-200 text-red-800 px-1 rounded font-medium"
        >
          {part}
        </span>
      )
    }
    return part
  })
}

export function AIContextDisplay({ alert }: AIContextDisplayProps) {
  const featureConfig = alert.aiFeature
    ? aiFeatureConfig[alert.aiFeature]
    : null

  return (
    <div className="space-y-4">
      {/* AI Feature Badge */}
      {alert.aiFeature && featureConfig && (
        <div className="flex items-center gap-2">
          <Badge className={cn('gap-1', featureConfig.bgColor, featureConfig.color)}>
            <Bot className="h-3 w-3" />
            {featureConfig.label}
          </Badge>

          {alert.llmBypassed && (
            <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
              <Zap className="h-3 w-3" />
              LLM Bypassed
            </Badge>
          )}
        </div>
      )}

      {/* Trigger Keywords */}
      {alert.triggerKeywords.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Trigger Keywords Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {alert.triggerKeywords.map((keyword, index) => (
                <Badge
                  key={index}
                  className="bg-red-100 text-red-700 hover:bg-red-200"
                >
                  "{keyword}"
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full User Message */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Full User Message
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {highlightKeywords(alert.fullMessage, alert.triggerKeywords)}
          </div>
        </CardContent>
      </Card>

      {/* Context (if different from full message) */}
      {alert.context && alert.context !== alert.fullMessage && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-gray-700">
              Surrounding Context
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
              {highlightKeywords(alert.context, alert.triggerKeywords)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {alert.llmBypassed ? (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Crisis Protocol Activated
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-sm text-amber-700">
              The LLM was bypassed due to crisis detection. The user was shown
              crisis resources directly without AI-generated content.
            </p>
          </CardContent>
        </Card>
      ) : alert.aiResponse ? (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="p-3 bg-purple-50 rounded-lg text-sm text-gray-700 leading-relaxed border border-purple-100">
              {alert.aiResponse}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Resources Displayed Status */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {alert.resourcesDisplayed ? (
            <>
              <div className="p-1.5 bg-green-100 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-700">
                Crisis resources were displayed
              </span>
            </>
          ) : (
            <>
              <div className="p-1.5 bg-gray-200 rounded-full">
                <XCircle className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-sm text-gray-500">
                Crisis resources were not displayed
              </span>
            </>
          )}
        </div>

        {alert.resourcesDisplayed && (
          <Badge variant="outline" className="text-xs">
            988, Crisis Text Line, 911
          </Badge>
        )}
      </div>

      {/* Check-in specific data */}
      {alert.source === 'checkin' && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-gray-700">
              Check-in Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {alert.checkinType && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Check-in Type:</span>
                <span className="font-medium capitalize">{alert.checkinType}</span>
              </div>
            )}
            {alert.concerningScore !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Concerning Score:</span>
                <span
                  className={cn(
                    'font-medium',
                    alert.concerningScore >= 7
                      ? 'text-red-600'
                      : alert.concerningScore >= 5
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                  )}
                >
                  {alert.concerningScore}/10
                </span>
              </div>
            )}
            {alert.concerningFields && alert.concerningFields.length > 0 && (
              <div className="pt-2">
                <span className="text-sm text-gray-500">Concerning Fields:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {alert.concerningFields.map((field, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SOS specific data */}
      {alert.source === 'sos' && (
        <Card className="border-red-200">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              SOS Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {alert.sosTriggeredFrom && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Triggered From:</span>
                <span className="font-medium capitalize">{alert.sosTriggeredFrom}</span>
              </div>
            )}
            {alert.sosLocation && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium font-mono text-xs">
                  {alert.sosLocation.latitude.toFixed(6)},{' '}
                  {alert.sosLocation.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AIContextDisplay
