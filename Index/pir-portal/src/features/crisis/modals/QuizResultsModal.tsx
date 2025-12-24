import { X, CheckCircle, Phone, Calendar, ExternalLink } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { QuizType, QuizAnswer } from '../types'

// =============================================================================
// TYPES
// =============================================================================

interface QuizResultsModalProps {
  quizType: QuizType
  answers: QuizAnswer[]
  savedAt: Date | null
  onClose: () => void
  onRetake: () => void
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getResultMessage(quizType: QuizType, score: number): { title: string; message: string } {
  if (quizType === 'amIAnAddict') {
    if (score >= 0.7) {
      return {
        title: 'Your answers suggest you may benefit from support',
        message:
          'Many people in recovery have answered similarly. You are not alone, and help is available. Consider reaching out to a recovery coach or attending a support meeting.',
      }
    } else if (score >= 0.4) {
      return {
        title: 'Your answers indicate some concerning patterns',
        message:
          'While not everyone who answers "yes" to some questions has an addiction, these patterns may be worth exploring further with a professional.',
      }
    } else {
      return {
        title: 'Your answers suggest lower risk',
        message:
          'Based on your responses, you may not currently be experiencing addiction. However, if you have concerns, speaking with a professional is always a good idea.',
      }
    }
  } else {
    // Crisis Self-Assessment
    if (score >= 0.6) {
      return {
        title: 'You may be experiencing significant distress',
        message:
          'Based on your answers, you may benefit from immediate support. Please consider reaching out to a crisis line or mental health professional.',
      }
    } else if (score >= 0.3) {
      return {
        title: 'You may be experiencing some challenges',
        message:
          'Your responses suggest you may be going through a difficult time. Consider talking to someone you trust or a professional about how you are feeling.',
      }
    } else {
      return {
        title: 'You appear to be managing well',
        message:
          'Based on your responses, you seem to be coping effectively. Remember that support is always available if your situation changes.',
      }
    }
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function QuizResultsModal({
  quizType,
  answers,
  savedAt,
  onClose,
  onRetake,
}: QuizResultsModalProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const yesCount = answers.filter((a) => a.answer === 'yes').length
  const score = yesCount / answers.length
  const percentage = Math.round(score * 100)

  const title = quizType === 'amIAnAddict' ? 'Am I An Addict?' : 'Crisis Self-Assessment'
  const { title: resultTitle, message: resultMessage } = getResultMessage(quizType, score)

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title} - Results</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{yesCount}</span>
                <span className="text-xl text-gray-500">/{answers.length}</span>
                <p className="text-sm text-gray-500 mt-1">"Yes" responses</p>
              </div>

              <Progress value={percentage} className="h-3 mb-2" />
              <p className="text-sm text-gray-500">{percentage}%</p>
            </div>

            {/* Result Message */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">{resultTitle}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{resultMessage}</p>
            </div>

            {/* Saved confirmation */}
            {user && savedAt && (
              <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 rounded-lg p-3">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>
                  Results saved to your profile on{' '}
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(savedAt)}
                </span>
              </div>
            )}

            {/* Recommended Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Recommended Next Steps</h4>

              <div className="grid grid-cols-1 gap-2">
                <a
                  href="tel:510-770-6068"
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <Phone className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contact GLRS</p>
                    <p className="text-xs text-gray-500">(510) 770-6068</p>
                  </div>
                </a>

                <button
                  onClick={() => {
                    onClose()
                    navigate('/meetings')
                  }}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Find a Meeting</p>
                    <p className="text-xs text-gray-500">Browse support meetings</p>
                  </div>
                </button>

                <a
                  href="https://www.glrecoveryservices.com/ourpackages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <ExternalLink className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Explore Our Services</p>
                    <p className="text-xs text-gray-500">View recovery coaching packages</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={onRetake}>
              Retake Quiz
            </Button>
            <Button onClick={onClose} className="bg-teal-600 hover:bg-teal-700">
              Done
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default QuizResultsModal
