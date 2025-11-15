// ============================================================
// GLRS LIGHTHOUSE - MODAL COMPONENTS
// ============================================================
// Pure presentational modal components
// Extracted from PIRapp.js for modularity
// ============================================================

const ImageModal = ({
  imageUrl,
  onClose
}) => {
  if (!imageUrl) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: imageUrl,
    style: {
      maxWidth: '90%',
      maxHeight: '90%',
      objectFit: 'contain'
    },
    onClick: e => e.stopPropagation()
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '30px',
      cursor: 'pointer'
    }
  }, "\u2715"));
};

// ==========================================
// PHASE 2: APP STORE COMPLIANCE MODALS
// ==========================================

// First-Launch Disclaimer Modal
const DisclaimerModal = ({
  onAccept
}) => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '15px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '30px',
      background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
      color: '#fff',
      borderRadius: '15px 15px 0 0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 10px 0',
      fontSize: '28px'
    }
  }, "Welcome to Recovery Compass"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '16px',
      opacity: 0.9
    }
  }, "Please read this important information before using the app")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      background: '#fff3cd',
      borderRadius: '10px',
      marginBottom: '20px',
      border: '1px solid #ffc107'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 15px 0',
      color: '#856404'
    }
  }, "\u2695\uFE0F Medical Disclaimer"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '14px',
      color: '#856404',
      lineHeight: '1.6'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "This app is NOT a substitute for professional medical advice, diagnosis, or treatment."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "Recovery Compass is a recovery support tool designed to complement professional treatment. It should not replace in-person therapy, medical care, or emergency services.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "If you are experiencing a medical or mental health emergency, call 911 or go to the nearest emergency room immediately."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '10px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 15px 0',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "lock",
    style: {
      width: '20px',
      height: '20px',
      color: 'var(--color-primary)'
    }
  }), "Privacy & Confidentiality"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.6'
    }
  }, "Your privacy is our priority. We use industry-standard encryption and HIPAA-compliant practices to protect your information. However, no electronic system is 100% secure. Please avoid sharing sensitive information you're not comfortable storing digitally.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '10px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 15px 0',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '20px',
      height: '20px',
      color: 'var(--color-primary)'
    }
  }), "Peer Support Disclaimer"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.6'
    }
  }, "Community features connect you with others in recovery. While peer support can be valuable, remember that other users are not medical professionals. Always consult your healthcare provider for medical advice.")), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      background: '#e7f5ff',
      borderRadius: '10px',
      marginBottom: '20px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checkboxChecked,
    onChange: e => setCheckboxChecked(e.target.checked),
    style: {
      width: '20px',
      height: '20px',
      marginRight: '12px',
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      color: '#333'
    }
  }, "I have read and understand these disclaimers and agree to the Terms of Service and Privacy Policy")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!checkboxChecked) {
        alert('Please check the box to confirm you understand and agree');
        return;
      }
      onAccept();
    },
    style: {
      width: '100%',
      background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }, "Continue to App"))));
};

// Legal Modal Component (Terms, Privacy, Data Handling)
const LegalModal = ({
  type,
  onClose
}) => {
  const content = {
    terms: {
      title: 'Terms of Service',
      body: `Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing or using Recovery Compass, you agree to be bound by these Terms of Service.

2. SERVICE DESCRIPTION
Recovery Compass is a recovery support application designed to complement professional treatment.

3. USER RESPONSIBILITIES
- Provide accurate information
- Maintain confidentiality of your account
- Use the service responsibly and lawfully
- Not share sensitive medical information in community features

4. MEDICAL DISCLAIMER
This service is NOT a substitute for professional medical advice. Always consult healthcare providers for medical decisions.

5. PRIVACY
Your use is governed by our Privacy Policy. We protect your data using industry-standard encryption.

6. LIABILITY LIMITATION
Recovery Compass is provided "as is" without warranties. We are not liable for any damages arising from use.

7. TERMINATION
We may suspend or terminate access for violations of these terms.

8. GOVERNING LAW
These terms are governed by the laws of [Your State/Country].

9. CONTACT
For questions: support@glrecoveryservices.com`
    },
    privacy: {
      title: 'Privacy Policy',
      body: `Last Updated: January 2025

1. INFORMATION WE COLLECT
- Account information (name, email)
- Recovery data (check-ins, goals, progress)
- Usage data (features accessed, session duration)
- Device information (device type, OS version)

2. HOW WE USE YOUR INFORMATION
- Provide and improve our services
- Communicate with you about your account
- Track your recovery progress
- Personalize your experience
- Comply with legal obligations

3. INFORMATION SHARING
We DO NOT sell your personal information. We may share data only:
- With your explicit consent
- With your assigned coach/treatment team
- To comply with legal requirements
- With service providers under strict confidentiality agreements

4. DATA SECURITY
- Industry-standard encryption (AES-256)
- HIPAA-compliant practices
- Secure data transmission (HTTPS)
- Regular security audits
- Limited employee access

5. YOUR RIGHTS (GDPR/CCPA)
- Access your data
- Correct inaccurate data
- Request data deletion
- Export your data
- Opt out of communications

6. DATA RETENTION
We retain your data while your account is active and for 7 years after closure (HIPAA compliance).

7. COOKIES
We use essential cookies for functionality. No third-party advertising cookies.

8. CHILDREN'S PRIVACY
Our service is not intended for users under 13. We comply with COPPA.

9. CHANGES TO POLICY
We'll notify you of material changes via email or in-app notification.

10. CONTACT
Privacy questions: privacy@glrecoveryservices.com`
    },
    dataHandling: {
      title: 'Data Handling & Your Rights',
      body: `Last Updated: January 2025

WHAT DATA WE COLLECT

Recovery Data:
- Daily check-ins (mood, cravings, anxiety, sleep)
- Goals and assignments
- Progress tracking
- Community messages
- Resource usage

Account Data:
- Name, email, profile photo
- Subscription information
- Login history
- Device information

HOW WE PROTECT YOUR DATA

Encryption:
- AES-256 encryption for sensitive data
- Secure data transmission (HTTPS/TLS)
- Encrypted backups
- Zero-knowledge architecture (where applicable)

Access Controls:
- Role-based access (coaches see only assigned clients)
- Multi-factor authentication available
- Regular security audits
- Employee background checks

HIPAA Compliance:
- Business Associate Agreements with partners
- Regular compliance training
- Breach notification procedures
- Audit logging

YOUR RIGHTS

Access: Request a copy of your data anytime
Correction: Update inaccurate information
Deletion: Request permanent account deletion
Export: Download your data in JSON format
Portability: Transfer data to another service
Opt-out: Unsubscribe from non-essential emails

DATA RETENTION

Active Accounts: Data retained while account is active
Closed Accounts: Data retained for 7 years (HIPAA requirement)
Deletion Requests: 30-day grace period, then permanent deletion
Backups: Removed from backups within 90 days

THIRD-PARTY SERVICES

We use these trusted partners:
- Firebase (Google) - Database and authentication
- Stripe - Payment processing (PCI-DSS compliant)
- SendGrid - Email delivery
All partners sign data processing agreements.

DATA BREACHES

In the unlikely event of a breach:
- You'll be notified within 72 hours
- We'll report to authorities as required
- We'll provide credit monitoring if SSNs exposed
- We'll publish transparency reports

INTERNATIONAL TRANSFERS

Data is stored in US data centers (Firebase).
If you're in EU/EEA, we use Standard Contractual Clauses.

EXERCISING YOUR RIGHTS

Email: privacy@glrecoveryservices.com
Phone: 1-800-XXX-XXXX
In-app: Profile → Settings → Data Management

We respond to requests within 30 days.`
    }
  };
  const selectedContent = content[type] || content.terms;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '15px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 30px',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      color: '#333',
      fontSize: '24px'
    }
  }, selectedContent.title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'transparent',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#999'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '30px',
      overflowY: 'auto',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("pre", {
    style: {
      whiteSpace: 'pre-wrap',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333',
      margin: 0
    }
  }, selectedContent.body)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 30px',
      borderTop: '1px solid #ddd'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      background: '#0077CC',
      color: '#fff',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }, "Close"))));
};

// Crisis Resources Modal
const CrisisModal = ({
  onClose
}) => {
  const resources = [{
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    description: '24/7 free and confidential support',
    action: () => window.location.href = 'tel:988'
  }, {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Free 24/7 text support',
    action: () => window.location.href = 'sms:741741&body=HOME'
  }, {
    name: 'SAMHSA National Helpline',
    number: '1-800-662-4357',
    description: 'Treatment referral and information',
    action: () => window.location.href = 'tel:18006624357'
  }, {
    name: 'Veterans Crisis Line',
    number: '988 (Press 1)',
    description: 'Support for veterans and their families',
    action: () => window.location.href = 'tel:988'
  }, {
    name: 'Emergency Services',
    number: '911',
    description: 'Life-threatening emergencies',
    action: () => window.location.href = 'tel:911'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '2px solid #DC143C',
      background: '#DC143C',
      color: '#fff',
      borderRadius: '15px 15px 0 0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '28px',
      height: '28px'
    }
  }), "Crisis Resources"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0 0',
      fontSize: '14px',
      opacity: 0.9
    }
  }, "If you're in crisis or need immediate help, please use one of these resources")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, resources.map((resource, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      padding: '15px',
      marginBottom: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #ddd'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 5px 0',
      color: '#333',
      fontSize: '18px'
    }
  }, resource.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 10px 0',
      color: '#666',
      fontSize: '14px'
    }
  }, resource.description), /*#__PURE__*/React.createElement("button", {
    onClick: resource.action,
    style: {
      background: '#DC143C',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "phone",
    style: {
      width: '18px',
      height: '18px',
      marginRight: '8px'
    }
  }), resource.number))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '20px',
      padding: '15px',
      background: '#fff3cd',
      borderRadius: '10px',
      border: '1px solid #ffc107'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '13px',
      color: '#856404'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "\u26A0\uFE0F Important:"), " If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginTop: '20px',
      background: '#6c757d',
      color: '#fff',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      width: '100%'
    }
  }, "Close"))));
};

// ============================================================
// NAMESPACE EXPOSURE
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.modals = {
  ImageModal,
  DisclaimerModal,
  LegalModal,
  CrisisModal
};
console.log('✅ Modals.js loaded - 4 modal components available');