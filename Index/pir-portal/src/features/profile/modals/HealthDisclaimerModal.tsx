/**
 * Health Disclaimer Modal
 *
 * Displays health disclaimers and AI usage information.
 * Required for Apple App Store compliance (Guideline 1.4.1).
 */

import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Heart, Phone, Sparkles, CheckCircle } from 'lucide-react'

interface HealthDisclaimerModalProps {
  onClose: () => void
}

export function HealthDisclaimerModal({ onClose }: HealthDisclaimerModalProps) {
  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            Health Information
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Main Disclaimer */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Important Health Disclaimer</h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      This app is not intended to provide medical advice, diagnosis, or treatment.
                      Guiding Light Recovery Services provides compassionate, results-oriented peer
                      support - not clinical treatment.
                    </p>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-4 mt-4">
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Always seek the advice of your physician or qualified health provider with
                    any questions you may have regarding a medical condition. If you are
                    experiencing a mental health crisis, please contact emergency services
                    or call <span className="font-semibold">988</span> (Suicide & Crisis Lifeline).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Features Notice */}
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-violet-900 mb-2">AI-Powered Features</h3>
                    <p className="text-violet-800 text-sm leading-relaxed mb-3">
                      Some features of Recovery Compass use artificial intelligence to provide
                      personalized insights about your recovery patterns.
                    </p>
                    <ul className="text-violet-800 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>AI-generated content is clearly labeled</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>AI insights are not a substitute for professional advice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>AI may occasionally produce inaccurate information</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What We Provide */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="h-6 w-6 text-teal-500 shrink-0" />
                  <h3 className="font-semibold text-slate-900">What Recovery Compass Provides</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-teal-800 text-sm">Peer support and recovery coaching</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-teal-800 text-sm">Tools to track your recovery journey</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-teal-800 text-sm">Connection to meetings and support groups</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-teal-800 text-sm">Access to crisis resources when needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crisis Resources */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Crisis Resources</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div>
                      <p className="font-semibold text-red-900">988</p>
                      <p className="text-sm text-red-700">Suicide & Crisis Lifeline</p>
                    </div>
                    <a
                      href="tel:988"
                      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div>
                      <p className="font-semibold text-red-900">741741</p>
                      <p className="text-sm text-red-700">Crisis Text Line (text HOME)</p>
                    </div>
                    <a
                      href="sms:741741&body=HOME"
                      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Text
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div>
                      <p className="font-semibold text-red-900">911</p>
                      <p className="text-sm text-red-700">Emergency Services</p>
                    </div>
                    <a
                      href="tel:911"
                      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button onClick={onClose}>I Understand</Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default HealthDisclaimerModal
