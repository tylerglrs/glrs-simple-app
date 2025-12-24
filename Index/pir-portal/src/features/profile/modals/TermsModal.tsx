/**
 * Terms & Conditions Modal
 *
 * Displays the full terms of service in-app for Apple App Store compliance.
 * Guideline 5.1.1 - Terms must be accessible within the app.
 */

import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText } from 'lucide-react'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

interface TermsModalProps {
  onClose: () => void
}

export function TermsModal({ onClose }: TermsModalProps) {
  // Set iOS status bar to match modal header color (slate-600)
  useStatusBarColor('#475569', true)

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <FileText className="h-6 w-6" />
            Terms &amp; Conditions
          </h2>
          <p className="text-sm text-white/70 mt-1">Guiding Light Recovery Services LLC</p>
          <p className="text-xs text-white/50 mt-0.5">Last Modified: 12/21/24 | Effective Date: 12/21/24</p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
            {/* 1. General */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">1. General</h3>
              <p className="mb-3">
                These Terms and Conditions ("Agreement") govern the use of the website, mobile application, and services ("Services") that are made available by Guiding Light Recovery Services LLC ("Company," "we," "us," or "our"). By accessing our website at glrecoveryservices.com, using the Recovery Compass application, or utilizing our peer support and recovery coaching services, you ("User," "you," or "your") acknowledge that you have read, understood, and agree to be bound by this Agreement.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                <p className="text-amber-800 font-medium">
                  Our services are peer support and recovery coaching only. We do not provide therapy, counseling, medical treatment, or clinical mental health services.
                </p>
              </div>
              <p>
                Your use of our website, application, or services constitutes acceptance of this Agreement. If you do not agree to these terms, you must discontinue use of our website, application, and services immediately.
              </p>
            </section>

            {/* 2. Description of Services */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">2. Description of Services</h3>
              <p className="mb-3">We provide peer support and recovery coaching services including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Recovery Success Planning (RSP) sessions</li>
                <li>One-on-one peer support meetings</li>
                <li>Transportation support to recovery-related appointments</li>
                <li>Family support groups and education</li>
                <li>Recovery navigation assistance</li>
                <li>Virtual and in-person service options</li>
              </ul>
              <p className="mb-3">We offer four comprehensive service packages:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li><strong>Foundation Package ($800/month):</strong> Entry-level recovery support</li>
                <li><strong>Growth Package ($1,300/month):</strong> Enhanced support with family involvement</li>
                <li><strong>Transformation Package ($1,600/month):</strong> Comprehensive recovery support</li>
                <li><strong>Intensive Package ($2,200/month):</strong> Maximum support and accountability</li>
              </ul>
              <p>
                Full in-person services are available in San Francisco, Alameda, Contra Costa, San Mateo, Santa Clara, and Santa Cruz Counties. Limited in-person and virtual services are available in Marin, Sonoma, Napa, and Solano Counties. Virtual services are available throughout California and beyond.
              </p>
            </section>

            {/* 3. Recovery Compass Application */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Recovery Compass Application</h3>
              <p className="mb-3">
                The Recovery Compass application ("App") is provided as part of our peer support services to enhance your recovery journey. The App includes features such as:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Daily check-ins for tracking mood, cravings, sleep, and overall wellness</li>
                <li>Goal setting and progress tracking</li>
                <li>Secure messaging with your assigned recovery coach</li>
                <li>Access to educational resources and recovery guides</li>
                <li>Meeting finder for locating recovery support meetings</li>
                <li>Community features for peer connection and support</li>
                <li>AI-powered insights and personalized recovery suggestions</li>
                <li>Savings and financial goal tracking</li>
                <li>Habit tracking and streak monitoring</li>
                <li>Evening reflection journaling</li>
              </ul>
              <p className="font-medium text-slate-800">
                The App is intended as a supplemental tool to support your recovery journey and peer coaching relationship. It is not a substitute for professional medical care, clinical treatment, or emergency services. App features may be modified, updated, or discontinued at our discretion with reasonable notice to users.
              </p>
            </section>

            {/* 4. App Account and Security */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">4. App Account and Security</h3>
              <p className="mb-3">To use the App, you must create an account with accurate and complete information. You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your account information remains current and accurate</li>
              </ul>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Share your account credentials with others</li>
                <li>Create multiple accounts</li>
                <li>Use another person's account without authorization</li>
                <li>Attempt to bypass security measures</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these terms or exhibit suspicious activity.</p>
            </section>

            {/* 5. App Data Collection and Use */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">5. App Data Collection and Use</h3>
              <p className="mb-3">Through the App, we collect information you provide including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Check-in responses (mood, cravings, sleep quality, anxiety levels)</li>
                <li>Goals, reflections, and journal entries</li>
                <li>Messages sent to your coach and community posts</li>
                <li>Profile information and recovery milestones</li>
                <li>Habit completions and streak data</li>
                <li>Feedback and survey responses</li>
              </ul>
              <p className="mb-3">This data is used to:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Provide and improve our services</li>
                <li>Enable your coach to support your recovery journey</li>
                <li>Generate personalized insights and recommendations</li>
                <li>Track your progress over time</li>
                <li>Improve our App features and user experience</li>
              </ul>
              <p>Your data is protected according to our Privacy Policy and applicable confidentiality regulations. AI-powered features analyze your data to provide personalized insights, but all AI-generated content is supplemental guidance and not clinical advice.</p>
            </section>

            {/* 6. Community Guidelines */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">6. Community Guidelines</h3>
              <p className="mb-3">When using community features within the App, you agree to:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Treat all members with respect and dignity</li>
                <li>Maintain confidentiality of other members' shared information</li>
                <li>Refrain from sharing harmful, offensive, or inappropriate content</li>
                <li>Avoid promoting substances, illegal activities, or dangerous behaviors</li>
                <li>Support others' recovery journeys without judgment</li>
                <li>Report concerning content or behavior to our team</li>
              </ul>
              <p>We reserve the right to remove content and suspend users who violate community guidelines. The community space is for peer support only and is not monitored by clinical professionals.</p>
            </section>

            {/* 7. User Responsibilities and Conduct */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">7. User Responsibilities and Conduct</h3>
              <p className="mb-3">You agree to use our website, App, and services for lawful purposes only. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Provide false or misleading information during consultation or service provision</li>
                <li>Use services for any unlawful or prohibited purpose</li>
                <li>Interfere with or disrupt our website, App, or services</li>
                <li>Attempt to gain unauthorized access to our systems or other users' information</li>
              </ul>
              <p className="mb-3">You acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Our relationship is professional peer support, not clinical treatment</li>
                <li>Services are supplemental to, not a replacement for, clinical care when needed</li>
                <li>We maintain professional boundaries consistent with peer support standards</li>
                <li>Emergency situations require contacting appropriate emergency services</li>
              </ul>
            </section>

            {/* 8. Booking, Cancellation, and Payment Terms */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">8. Booking, Cancellation, and Payment Terms</h3>
              <p className="mb-3"><strong>Booking:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>All services require advance booking through our website, App, or by phone</li>
                <li>Consultations are subject to availability and must be scheduled at least 24 hours in advance</li>
                <li>Virtual services require appropriate technology and internet connectivity</li>
                <li>Transportation services require 24-48 hours advance notice when possible</li>
              </ul>
              <p className="mb-3"><strong>Cancellation:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Client cancellations require 24-hour advance notice for session cancellations</li>
                <li>Sessions cancelled with less than 24 hours notice may be charged at full rate</li>
                <li>Failure to attend scheduled sessions without notice will be charged at full rate</li>
                <li>We will provide reasonable notice for cancellations on our part</li>
              </ul>
              <p className="mb-3"><strong>Payment:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Service packages are billed monthly in advance, with payment due on the first of each month</li>
                <li>Late payments may result in service suspension after 10 days past due</li>
                <li>Add-on services are billed separately and due upon service completion</li>
                <li>All payments are processed through secure third-party payment processors</li>
              </ul>
              <p className="mb-3"><strong>Refunds:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Refunds for unused services may be available on a prorated basis</li>
                <li>We will work to resolve service concerns before considering refunds</li>
                <li>Refunds may be available for documented emergency situations</li>
                <li>Approved refunds will be processed within 7-10 business days</li>
              </ul>
            </section>

            {/* 9. Confidentiality and Privacy */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">9. Confidentiality and Privacy</h3>
              <p className="mb-3">We maintain strict confidentiality of all information shared during our professional relationship and through the App, consistent with:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Federal confidentiality regulations (42 CFR Part 2) when applicable</li>
                <li>California state confidentiality laws</li>
                <li>Professional ethical standards for peer support services</li>
                <li>Our Privacy Policy (incorporated herein by reference)</li>
              </ul>
              <p className="mb-3">Confidentiality may be limited when:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Disclosure is required by law or court order</li>
                <li>There is imminent danger to your safety or the safety of others</li>
                <li>You provide written consent for information sharing</li>
                <li>For legitimate business purposes such as billing and scheduling</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">Emergency Situations</p>
                <p className="text-red-700">
                  Our services and App are not designed for crisis intervention. In emergency situations involving imminent danger, we may need to contact emergency services (911), mental health crisis teams, law enforcement when necessary for safety, or your emergency contacts when appropriate.
                </p>
                <p className="text-red-700 mt-2 font-medium">
                  If you are in crisis, please call 988 (Suicide &amp; Crisis Lifeline) or 911 immediately.
                </p>
              </div>
            </section>

            {/* 10. Limitation of Liability and Disclaimers */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">10. Limitation of Liability and Disclaimers</h3>
              <p className="mb-3">You acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Our services are peer support and coaching, not clinical treatment</li>
                <li>We do not diagnose, treat, or cure any medical or mental health conditions</li>
                <li>Services and the App are not a substitute for professional medical or clinical care</li>
                <li>Individual results may vary, and we cannot guarantee specific outcomes</li>
              </ul>
              <p className="mb-3">To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Our total liability shall not exceed the amount paid for services in the preceding 12 months</li>
                <li>We are not liable for indirect, incidental, special, or consequential damages</li>
                <li>We are not responsible for outcomes resulting from your decisions or actions</li>
                <li>Our liability is limited to the direct cost of services provided</li>
              </ul>
              <p className="mb-3">Website and App content is provided "as is" without warranties of any kind. We do not guarantee uninterrupted website or App availability or functionality. AI-generated insights and recommendations are not professional advice and should not replace clinical guidance.</p>
            </section>

            {/* 11. Intellectual Property */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">11. Intellectual Property</h3>
              <p className="mb-3">All website content, App content, materials, and resources provided during services are protected by copyright and other intellectual property laws. This includes:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Website and App design and functionality</li>
                <li>Recovery planning templates and materials</li>
                <li>Educational resources and handouts</li>
                <li>AI algorithms and generated content</li>
                <li>Service methodologies and processes</li>
              </ul>
              <p className="mb-3">You may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reproduce or distribute our proprietary materials without permission</li>
                <li>Use our service methodologies for competing business purposes</li>
                <li>Share login credentials or access information with others</li>
                <li>Reverse engineer or copy our website or App functionality</li>
                <li>Scrape, harvest, or extract data from our platforms</li>
              </ul>
            </section>

            {/* 12. Indemnification */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">12. Indemnification</h3>
              <p>
                You agree to indemnify, defend, and hold harmless Guiding Light Recovery Services LLC, its officers, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from your use of our website, App, or services, your violation of this Agreement, your violation of any law or regulation, any false or misleading information you provide, content you post in community features, or your decisions or actions taken based on our peer support services or App features.
              </p>
            </section>

            {/* 13. Dispute Resolution */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">13. Dispute Resolution</h3>
              <p className="mb-3">Before initiating formal legal proceedings, we encourage informal resolution through:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Direct communication with your assigned peer support specialist</li>
                <li>Discussion with our management team</li>
                <li>Mediation through a mutually agreed upon mediator</li>
              </ul>
              <p>This Agreement is governed by the laws of the State of California, without regard to conflict of law principles. Any legal proceedings must be brought in the appropriate courts of California. For disputes exceeding $10,000, both parties agree to binding arbitration under the rules of the American Arbitration Association, conducted in California.</p>
            </section>

            {/* 14. Termination */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">14. Termination</h3>
              <p className="mb-3">You may terminate services and close your App account at any time by providing written notice or using the account deletion feature in the App. Upon termination:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>You remain responsible for payment of services already provided</li>
                <li>Unused prepaid services may be refunded on a prorated basis</li>
                <li>All confidentiality obligations continue after termination</li>
                <li>Your App data will be deleted according to our data retention policies</li>
                <li>You must return any proprietary materials provided during services</li>
              </ul>
              <p className="mb-3">We may terminate services and App access immediately for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Non-payment of fees after appropriate notice</li>
                <li>Violation of this Agreement or our policies</li>
                <li>Violation of community guidelines</li>
                <li>Behavior that endangers the safety of our staff or other clients</li>
                <li>Circumstances that make continued service provision inappropriate</li>
              </ul>
            </section>

            {/* 15. General Provisions */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">15. General Provisions</h3>
              <p className="mb-3">
                This Agreement, together with our Privacy Policy and Service Agreements, constitutes the entire agreement between you and Guiding Light Recovery Services LLC regarding website, App, and service use.
              </p>
              <p className="mb-3">
                We reserve the right to modify this Agreement at any time. Material changes will be communicated through email notification to active clients, App notifications, prominent website notices, direct communication during scheduled sessions, and posted updates with effective dates.
              </p>
              <p>
                If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect. You may not assign your rights under this Agreement without our written consent. We may assign our rights and obligations under this Agreement without notice. Our failure to enforce any provision of this Agreement does not constitute a waiver of that provision or any other provision.
              </p>
            </section>

            {/* 16. Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">16. Contact Information</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-800 mb-2">Guiding Light Recovery Services LLC</p>
                <p>Email:{' '}
                  <a href="mailto:info@glrecoveryservices.com" className="text-teal-600 hover:underline">
                    info@glrecoveryservices.com
                  </a>
                </p>
                <p>Phone: (510) 770-6068</p>
                <p className="text-slate-500 text-xs mt-2">Business hours: Monday - Friday, 8:00 AM - 5:00 PM PST</p>
              </div>
            </section>

            {/* 17. Acknowledgment */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">17. Acknowledgment</h3>
              <p className="mb-3">By using our website, App, or services, you acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You have read and understood this Agreement</li>
                <li>You agree to be bound by all terms and conditions</li>
                <li>You understand the peer support nature of our services</li>
                <li>You understand the App is a supplemental tool, not clinical treatment</li>
                <li>You have had the opportunity to ask questions about this Agreement</li>
                <li>You consent to the collection and use of information as described in our Privacy Policy</li>
              </ul>
            </section>

            {/* Footer */}
            <section className="border-t pt-4 mt-6">
              <p className="text-xs text-slate-500 text-center">
                &copy; 2025 Guiding Light Recovery Services LLC. All rights reserved.
              </p>
              <p className="text-xs text-slate-400 text-center mt-1">
                CONFIDENTIAL RECOVERY SUPPORT SERVICES - CALIFORNIA LICENSED &amp; INSURED
              </p>
            </section>
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

export default TermsModal
