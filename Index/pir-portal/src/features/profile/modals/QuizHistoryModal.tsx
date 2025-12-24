import { useState } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuizResults } from '@/features/crisis/hooks/useQuizResults'
import type { QuizType, QuizResult } from '@/features/crisis/types'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

interface QuizHistoryModalProps {
  onClose: () => void
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface QuizSectionProps {
  title: string
  icon: React.ReactNode
  quizType: QuizType
  results: QuizResult[]
  totalQuestions: number
}

function QuizSection({ title, icon, quizType, results, totalQuestions }: QuizSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  if (results.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">{icon}</div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Not yet taken</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/crisis-resources')}
              className="text-teal-600 border-teal-600 hover:bg-teal-50"
            >
              Take Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestResult = results[0]
  const latestScore = Math.round(latestResult.score * 100)

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        {/* Summary */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-teal-600">{icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                <span>
                  Completed {results.length} time{results.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="text-right mr-2">
              <p className="text-sm font-medium text-gray-900">
                {latestResult.yesCount}/{totalQuestions}
              </p>
              <p className="text-xs text-gray-500">{latestScore}%</p>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded History */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {formatDate(result.completedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {result.yesCount}/{result.totalQuestions}
                  </p>
                  <Progress
                    value={result.score * 100}
                    className="h-1.5 w-16 mt-1"
                  />
                </div>
              </div>
            ))}

            {/* Progress insight */}
            {results.length >= 2 && (
              <div className="p-3 bg-teal-50 rounded-lg">
                <p className="text-sm text-teal-700">
                  {results[0].score < results[results.length - 1].score ? (
                    <>
                      Your score has improved by{' '}
                      {Math.round(
                        (results[results.length - 1].score - results[0].score) * 100
                      )}
                      % since your first quiz.
                    </>
                  ) : results[0].score > results[results.length - 1].score ? (
                    <>
                      Your score has decreased by{' '}
                      {Math.round(
                        (results[0].score - results[results.length - 1].score) * 100
                      )}
                      % since your first quiz.
                    </>
                  ) : (
                    'Your score has remained consistent.'
                  )}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/crisis-resources')}
              className="w-full"
            >
              Retake Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuizHistoryModal({ onClose }: QuizHistoryModalProps) {
  const navigate = useNavigate()
  const { quizResults, loading, error, getQuizHistory } = useQuizResults()

  // Set iOS status bar to match modal header color (teal-500)
  useStatusBarColor('#14B8A6', true)

  const amIAnAddictResults = getQuizHistory('amIAnAddict')
  const crisisResults = getQuizHistory('crisisSelfAssessment')

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6" />
            Self-Assessment History
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading quiz history...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : quizResults.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  No assessments taken yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Take a self-assessment to track your progress over time.
                </p>
                <Button
                  onClick={() => {
                    onClose()
                    navigate('/crisis-resources')
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Take Your First Quiz
                </Button>
              </div>
            ) : (
              <>
                <QuizSection
                  title="Am I An Addict?"
                  icon={<ClipboardCheck className="h-5 w-5" />}
                  quizType="amIAnAddict"
                  results={amIAnAddictResults}
                  totalQuestions={12}
                />

                <QuizSection
                  title="Crisis Self-Assessment"
                  icon={<AlertCircle className="h-5 w-5" />}
                  quizType="crisisSelfAssessment"
                  results={crisisResults}
                  totalQuestions={8}
                />

                {/* Link to crisis resources */}
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Crisis Resources
                        </p>
                        <p className="text-sm text-gray-500">
                          Access 24/7 support and helplines
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onClose()
                          navigate('/crisis-resources')
                        }}
                        className="text-teal-600 border-teal-600 hover:bg-teal-50"
                      >
                        View
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default QuizHistoryModal
