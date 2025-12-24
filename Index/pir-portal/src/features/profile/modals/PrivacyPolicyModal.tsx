/**
 * Privacy Policy Modal
 *
 * Displays the full privacy policy in-app for Apple App Store compliance.
 * Guideline 5.1.1 - Privacy policy must be accessible within the app.
 */

import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield } from 'lucide-react'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

interface PrivacyPolicyModalProps {
  onClose: () => void
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  // Set iOS status bar to match modal header color (slate-600)
  useStatusBarColor('#475569', true)

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Shield className="h-6 w-6" />
            Privacy Policy
          </h2>
          <p className="text-sm text-white/70 mt-1">Guiding Light Recovery Services LLC</p>
          <p className="text-xs text-white/50 mt-0.5">Effective Date: 12/21/24 | Last Updated: 12/21/24</p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
            {/* Important Notice */}
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-amber-900 mb-2">Important Notice Regarding Recovery Services</h3>
              <p className="text-amber-800">
                Guiding Light Recovery Services LLC ("Company," "we," "us," or "our") provides non-clinical peer support and recovery coaching services. This Privacy Policy governs the collection, use, and disclosure of information in connection with our website, Recovery Compass mobile application, administrative portals, and services. By accessing our website, using our applications, or utilizing our services, you acknowledge and agree to the terms of this Privacy Policy. Our services are non-clinical peer support and recovery coaching only. We do not provide therapy, counseling, medical treatment, or clinical mental health services.
              </p>
            </section>

            {/* What Information Do We Collect */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">What Information Do We Collect?</h3>
              <p className="mb-3">
                When you visit our website, use the Recovery Compass application, or engage our services, you may provide us with two types of information: personal information you knowingly choose to disclose that is collected on an individual basis, and website and application use information collected on an aggregate basis as you and others browse our website or use our applications.
              </p>
              <p className="mb-3">
                We may request that you voluntarily supply us with personal information, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li><strong>Contact information:</strong> full name, email address, postal address, home or work telephone number, and emergency contact information</li>
                <li><strong>Recovery-related information:</strong> length of time in recovery, sobriety date, substances of concern, current support systems, transportation needs, family involvement, and recovery goals</li>
                <li><strong>Service information:</strong> preferred service package, urgency of support needs, and additional information relevant to peer support services</li>
                <li><strong>Communication records:</strong> content of email messages, in-app messages, consultation notes, progress reports, and scheduling information</li>
                <li><strong>Financial information:</strong> payment information processed through secure third-party payment processors</li>
              </ul>
            </section>

            {/* Recovery Compass Application Data */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Recovery Compass Application Data</h3>
              <p className="mb-3">The Recovery Compass application collects additional information to support your recovery journey and enable peer coaching services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Check-In Data:</strong> Daily and evening check-in responses including mood ratings, craving levels, sleep quality, anxiety levels, energy levels, and overall day ratings.</li>
                <li><strong>Goals and Progress:</strong> Recovery goals you set, milestones achieved, habit tracking data, streak information, and progress toward personal objectives.</li>
                <li><strong>Reflections and Journals:</strong> Evening reflections, gratitude entries, journal notes, breakthrough moments, challenges faced, and personal insights you choose to record.</li>
                <li><strong>Messaging:</strong> Content of messages exchanged with your assigned recovery coach through the secure in-app messaging system.</li>
                <li><strong>Community Participation:</strong> Posts, comments, and interactions within peer support spaces.</li>
                <li><strong>Meeting and Activity Data:</strong> Information about recovery meetings you attend or save, including meeting preferences, attendance logs, and meeting goals.</li>
                <li><strong>Financial Tracking:</strong> Information about savings goals, deposits, and financial milestones related to your recovery journey.</li>
                <li><strong>AI Insights Data:</strong> To provide personalized insights and recommendations, our AI-powered features analyze your check-in patterns, mood trends, and recovery progress.</li>
                <li><strong>Device and Technical Information:</strong> Device type, operating system, app version, crash reports, and performance data.</li>
              </ul>
            </section>

            {/* Administrative Portal Data */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Administrative Portal Data</h3>
              <p className="mb-3">Our administrative portal (Coach Portal and Admin Portal) is used by recovery coaches, administrators, and authorized staff to provide and manage peer support services. Through these portals, authorized personnel may access:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Client Information:</strong> Contact details, recovery information, and service history</li>
                <li><strong>Check-In and Progress Data:</strong> Access to client check-ins, goals, and progress</li>
                <li><strong>Communication Records:</strong> Messages exchanged between coaches and clients, session notes, and service documentation</li>
                <li><strong>Administrative Data:</strong> Scheduling information, assignment tracking, and service delivery records</li>
                <li><strong>Coach and Staff Information:</strong> Professional contact information, role assignments, and system access logs</li>
              </ul>
              <p className="mt-3">Access to client information through administrative portals is restricted to authorized personnel on a need-to-know basis and is subject to strict confidentiality requirements and access controls.</p>
            </section>

            {/* Website and Cookie Information */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Website and Cookie Information</h3>
              <p className="mb-3">Our site and applications utilize standard technologies including "cookies" and web server logs to collect information about usage patterns:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Date and time of visits and session duration</li>
                <li>Pages and screens viewed and navigation patterns</li>
                <li>Referring websites and exit pages</li>
                <li>Device information, browser type, and IP address</li>
                <li>Geographic location (general area, not specific address)</li>
              </ul>
              <p>Cookie information is collected on an aggregate, non-personally identifiable basis. You may configure your browser settings to refuse cookies or alert you when cookies are being sent.</p>
            </section>

            {/* How Do We Use Your Information */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">How Do We Use the Information That You Provide to Us?</h3>
              <p className="mb-3">We use personal information for legitimate business purposes including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li><strong>Primary service purposes:</strong> Administering peer support and recovery coaching services, scheduling appointments, and maintaining service records</li>
                <li><strong>Communication purposes:</strong> Responding to inquiries, providing service updates, and maintaining ongoing peer support relationships</li>
                <li><strong>Safety and support:</strong> Maintaining emergency contact information and assessing support needs</li>
                <li><strong>Quality improvement:</strong> Evaluating service effectiveness and implementing improvements</li>
              </ul>
              <p className="mb-3">For the Recovery Compass application specifically, we use your information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide daily check-in and reflection features</li>
                <li>Enable secure messaging with your coach</li>
                <li>Generate personalized AI-powered insights and recommendations</li>
                <li>Track your progress and celebrate milestones</li>
                <li>Facilitate community peer support features</li>
                <li>Send reminders and notifications you have enabled</li>
                <li>Continuously improve application features and user experience</li>
              </ul>
            </section>

            {/* Information Sharing and Disclosure */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Information Sharing and Disclosure</h3>
              <p className="font-semibold text-slate-800 mb-3">We do not sell, trade, or otherwise transfer personal information to outside parties except as specifically outlined in this Privacy Policy.</p>
              <p className="mb-3">We may share personal information with trusted third-party service providers who assist in:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Payment processing and billing services</li>
                <li>Scheduling and appointment management systems</li>
                <li>Email communications and marketing platforms</li>
                <li>Website and application hosting and technical support services</li>
                <li>Cloud storage and data processing services</li>
                <li>AI and analytics services for personalized insights</li>
                <li>Virtual meeting and video conferencing platforms</li>
              </ul>
              <p className="mb-3">We may disclose personal information when:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Legally required by law, court order, subpoena, or other legal process</li>
                <li>Necessary to protect our legal rights, safety, or the safety of others</li>
                <li>Required by applicable state or federal regulations governing peer support services</li>
                <li>Necessary to prevent immediate harm to individuals</li>
              </ul>
            </section>

            {/* Information Security */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Information Security and Protection</h3>
              <p className="mb-3">We implement comprehensive security measures to protect personal information:</p>
              <h4 className="font-semibold text-slate-800 mt-3 mb-2">Technical Safeguards:</h4>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Encryption of sensitive data transmission and storage</li>
                <li>Secure server software and SSL certificates</li>
                <li>Secure authentication and login procedures</li>
                <li>Regular security assessments and vulnerability testing</li>
                <li>Access controls and authentication protocols</li>
              </ul>
              <h4 className="font-semibold text-slate-800 mt-3 mb-2">Administrative Safeguards:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Employee and coach training on confidentiality and privacy protection</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Role-based access controls in administrative portals</li>
                <li>Regular review of privacy and security policies</li>
                <li>Incident response procedures for potential data breaches</li>
              </ul>
            </section>

            {/* Your Privacy Rights */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Your Privacy Rights and Choices</h3>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Request access to personal information we maintain about you</li>
                <li>Request correction of inaccurate or incomplete personal information</li>
                <li>Request deletion of your personal information and account</li>
                <li>Export your data in a portable format</li>
                <li>Provide updated information for our records</li>
                <li>Ask questions about our privacy practices and this Privacy Policy</li>
              </ul>
              <p>To exercise any of these rights, please email us at <a href="mailto:info@glrecoveryservices.com" className="text-teal-600 hover:underline">info@glrecoveryservices.com</a> or call us at (510) 770-6068.</p>
            </section>

            {/* California Residents */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">California Residents (CCPA)</h3>
              <p className="mb-3">California residents may have additional rights under the California Consumer Privacy Act (CCPA), including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The right to know what personal information is collected</li>
                <li>The right to delete personal information (subject to certain exceptions)</li>
                <li>The right to opt out of the sale of personal information (we do not sell personal information)</li>
                <li>The right to non-discrimination for exercising privacy rights</li>
              </ul>
            </section>

            {/* Special Considerations */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Special Considerations for Recovery Services</h3>
              <p className="mb-3">Recovery-related information receives enhanced protection consistent with:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Federal confidentiality regulations (42 CFR Part 2) when applicable</li>
                <li>State confidentiality laws governing peer support services</li>
                <li>Professional ethical standards for recovery coaching</li>
                <li>Industry best practices for substance abuse support services</li>
              </ul>
              <p>In situations involving imminent danger to health or safety, we may need to disclose information to appropriate emergency services, healthcare providers, or law enforcement agencies. Such disclosures will be limited to information necessary to address the emergency situation.</p>
            </section>

            {/* AI-Powered Features */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">AI-Powered Features and Data Processing</h3>
              <p className="mb-3">
                The Recovery Compass application includes AI-powered features that analyze your check-in data, patterns, and progress to provide personalized insights and recommendations. This processing is performed to support your recovery journey and is not used for any other purpose.
              </p>
              <p className="font-medium text-slate-800">
                AI-generated insights are supplemental guidance only and do not constitute clinical advice or treatment recommendations.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Children's Privacy</h3>
              <p>
                Our services, website, and applications are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Notice of Changes and Updates</h3>
              <p className="mb-3">We reserve the right to modify this Privacy Policy at any time. We will provide reasonable advance notice of material changes through:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email notification to registered users</li>
                <li>In-app notifications</li>
                <li>Prominent website notices</li>
                <li>Direct communication during service appointments</li>
                <li>Posted updates with effective dates</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Information</h3>
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

export default PrivacyPolicyModal
