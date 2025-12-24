import { useState } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  HelpCircle,
  Phone,
  AlertTriangle,
  Mail,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  CalendarX,
  ShieldCheck,
  Download,
} from 'lucide-react'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// FAQ DATA
// =============================================================================

interface FAQItem {
  question: string
  answer: string
  icon: React.ReactNode
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I complete a check-in?',
    answer:
      'Navigate to the Tasks tab and tap on Morning Check-in or Evening Reflection. Follow the prompts to record your mood, thoughts, and any notes for the day.',
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  {
    question: 'How do I contact my coach?',
    answer:
      "You can contact your coach by messaging them directly in the app through the Messages tab, or by calling or emailing them using the contact information in your profile. Your coach's email and work phone number are available in the Home tab.",
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    question: 'What if I miss a check-in?',
    answer:
      "Missing occasional check-ins is okay. Focus on building consistency over time. Your coach will be notified of patterns but understands that life happens. Just get back on track when you can.",
    icon: <CalendarX className="h-4 w-4" />,
  },
  {
    question: 'Is my data private and secure?',
    answer:
      'Yes, your data is encrypted and stored securely. Only you and your assigned coach can see your check-ins and progress. We follow HIPAA guidelines and industry best practices for data protection.',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    question: 'How do I export my data?',
    answer:
      "Go to Profile > Data Management > Export Data. You can download all your check-ins, goals, and progress data in JSON format for your records.",
    icon: <Download className="h-4 w-4" />,
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface HelpModalProps {
  onClose: () => void
}

export function HelpModal({ onClose }: HelpModalProps) {
  const [openItems, setOpenItems] = useState<number[]>([])

  // Set iOS status bar to match modal header color (teal-500)
  useStatusBarColor('#14B8A6', true)

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <HelpCircle className="h-6 w-6" />
            Help & Support
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Crisis Hotlines - PROMINENT */}
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-amber-800">Need Immediate Help?</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                  <div>
                    <div className="font-semibold text-amber-900">Crisis Line</div>
                    <div className="text-sm text-amber-700">24/7 Suicide & Crisis Lifeline</div>
                  </div>
                  <a
                    href="tel:988"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    988
                  </a>
                </div>

                <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                  <div>
                    <div className="font-semibold text-amber-900">SAMHSA Helpline</div>
                    <div className="text-sm text-amber-700">
                      Substance Abuse & Mental Health Services
                    </div>
                  </div>
                  <a
                    href="tel:1-800-662-4357"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    1-800-662-HELP
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-500" />
                Contact Support
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <a
                      href="mailto:info@glrecoveryservices.com"
                      className="text-sm text-teal-600 hover:underline"
                    >
                      info@glrecoveryservices.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">Contact Your Coach</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-teal-500" />
              Frequently Asked Questions
            </h3>

            <div className="space-y-2">
              {FAQ_ITEMS.map((item, index) => (
                <Collapsible
                  key={index}
                  open={openItems.includes(index)}
                  onOpenChange={() => toggleItem(index)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="text-teal-500">{item.icon}</div>
                          <span className="font-medium text-sm">{item.question}</span>
                        </div>
                        {openItems.includes(index) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-0">
                        <div className="pl-7 text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>

          {/* Crisis Resources Link */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Crisis Resources</div>
                  <div className="text-sm text-muted-foreground">
                    Comprehensive crisis support and resources
                  </div>
                </div>
                <a
                  href="/crisis-resources"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  View Resources
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Legal Info Note */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              For Privacy Policy, Terms & Conditions, and Health Disclaimers,
              visit Profile → Legal & Policies.
            </p>
          </div>
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

export default HelpModal
