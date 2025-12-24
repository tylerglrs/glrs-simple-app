import { useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import type { QuizType, QuizQuestion, QuizAnswer } from '../types'
import {
  AM_I_AN_ADDICT_QUESTIONS,
  CRISIS_ASSESSMENT_QUESTIONS,
} from '../types'

// =============================================================================
// TYPES
// =============================================================================

interface QuizModalProps {
  quizType: QuizType
  onClose: () => void
  onComplete: (answers: QuizAnswer[]) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function QuizModal({ quizType, onClose, onComplete }: QuizModalProps) {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, 'yes' | 'no'>>({})

  const questions: QuizQuestion[] =
    quizType === 'amIAnAddict'
      ? AM_I_AN_ADDICT_QUESTIONS
      : CRISIS_ASSESSMENT_QUESTIONS

  const title =
    quizType === 'amIAnAddict' ? 'Am I An Addict?' : 'Crisis Self-Assessment'

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isAnswered = answers[currentQuestion.id] !== undefined
  const isLastQuestion = currentIndex === questions.length - 1
  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  const handleAnswer = useCallback((answer: 'yes' | 'no') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }))
  }, [currentQuestion.id])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, questions.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const handleComplete = useCallback(() => {
    const formattedAnswers: QuizAnswer[] = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id],
    }))
    onComplete(formattedAnswers)
  }, [answers, questions, onComplete])

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-md mx-auto">
            <p className="text-lg text-gray-900 mb-8 text-center leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* Answer Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer('yes')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  answers[currentQuestion.id] === 'yes'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">Yes</span>
              </button>

              <button
                onClick={() => handleAnswer('no')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  answers[currentQuestion.id] === 'no'
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">No</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {/* Save reminder */}
          {user && (
            <p className="text-xs text-gray-500 text-center mb-3">
              Your answers will be saved to your profile
            </p>
          )}
          {!user && (
            <p className="text-xs text-gray-500 text-center mb-3 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Log in to save your results
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                disabled={!allAnswered}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
              >
                View Results
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default QuizModal
