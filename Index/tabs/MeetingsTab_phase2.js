// Index/MeetingsTab.js
// Meetings tab - Phase 2: Cleared Home content, ready for meetings functionality
const { useState, useEffect } = React;

function MeetingsTab() {
    // Local state hooks
    const [user, setUser] = useState(null);
    const [activeBroadcast, setActiveBroadcast] = useState(null);
    const [broadcastDismissed, setBroadcastDismissed] = useState(false);
    const [userData, setUserData] = useState(null);

    // Mobile responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Load current user from Firebase auth
    useEffect(() => {
        const unsubscribeAuth = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Initialize Lucide icons on component mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ MeetingsTab: Lucide icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load user data
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            try {
                const db = firebase.firestore();
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, [user]);

    // Load active broadcast
    useEffect(() => {
        const loadBroadcast = async () => {
            try {
                const db = firebase.firestore();
                const broadcastSnap = await db.collection('broadcasts')
                    .where('active', '==', true)
                    .where('startDate', '<=', new Date())
                    .where('endDate', '>=', new Date())
                    .limit(1)
                    .get();

                if (!broadcastSnap.empty) {
                    setActiveBroadcast(broadcastSnap.docs[0].data());
                }
            } catch (error) {
                console.error('Error loading broadcast:', error);
            }
        };

        loadBroadcast();
    }, []);

    return (
        <>
            {activeBroadcast && !broadcastDismissed && (
                <div className="broadcast-banner">
                    <div className="broadcast-content">
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <i data-lucide="megaphone" style={{width: '24px', height: '24px', color: 'var(--color-accent)'}}></i>
                            <div>
                                <div style={{fontWeight: 'bold', color: 'var(--color-accent)'}}>Announcement</div>
                                <div style={{color: 'white', marginTop: '5px'}}>{activeBroadcast.message}</div>
                            </div>
                        </div>
                    </div>
                    <button className="broadcast-dismiss" onClick={() => {
                        setBroadcastDismissed(true);
                        setActiveBroadcast(null);
                    }}>×</button>
                </div>
            )}

            {/* MEETINGS TAB PLACEHOLDER - Phase 2 Complete, Ready for Phase 3 */}
            <div style={{
                minHeight: 'calc(100vh - 140px)',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #14b8a6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '30px 20px' : '50px 30px'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: isMobile ? '16px' : '20px',
                    padding: isMobile ? '30px 20px' : '50px 40px',
                    maxWidth: isMobile ? '90%' : '600px',
                    textAlign: 'center',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        width: isMobile ? '60px' : '80px',
                        height: isMobile ? '60px' : '80px',
                        margin: '0 auto 20px',
                        background: 'linear-gradient(135deg, #14b8a6, #0EA5E9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i data-lucide="calendar" style={{
                            width: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            color: 'white'
                        }}></i>
                    </div>

                    <h2 style={{
                        fontSize: isMobile ? '24px' : '32px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: isMobile ? '12px' : '16px'
                    }}>
                        Meetings Tab
                    </h2>

                    <p style={{
                        fontSize: isMobile ? '16px' : '18px',
                        color: '#64748b',
                        lineHeight: '1.6',
                        marginBottom: isMobile ? '16px' : '20px'
                    }}>
                        Phase 2 Complete: Home content cleared
                    </p>

                    <div style={{
                        background: '#f1f5f9',
                        borderRadius: isMobile ? '8px' : '12px',
                        padding: isMobile ? '16px' : '20px',
                        marginTop: isMobile ? '20px' : '24px'
                    }}>
                        <p style={{
                            fontSize: isMobile ? '14px' : '16px',
                            color: '#475569',
                            lineHeight: '1.5',
                            margin: 0
                        }}>
                            <strong>Next:</strong> Phase 3 will add meetings functionality<br/>
                            (TODAY, UPCOMING, BROWSE, HISTORY tabs)
                        </p>
                    </div>

                    {userData && (
                        <div style={{
                            marginTop: isMobile ? '20px' : '24px',
                            padding: isMobile ? '12px' : '16px',
                            background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(14,165,233,0.1))',
                            borderRadius: isMobile ? '8px' : '12px',
                            fontSize: isMobile ? '13px' : '14px',
                            color: '#64748b'
                        }}>
                            Welcome, {userData.firstName || 'User'}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MeetingsTab = MeetingsTab;

console.log('✅ MeetingsTab component loaded - Phase 2 (Home content cleared)');
console.log('✅ MeetingsTab component loaded - Phase 2 (local state + direct Firebase)');
// LegalInfoModals.js - Legal and informational modals
// ✅ PHASE 6B: Extracted from ModalContainer.js (3 modals)
// 3-Layer Architecture: Component → Firebase → Component

function LegalInfoModals({ modalType, onClose }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Presentational modals only (no data fetching)
    // - Receives modalType as prop
    // - Uses onClose callback to notify parent
    // - No useState needed (static content)
    // - No Firebase queries (informational only)
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'terms':
                return <TermsModal onClose={onClose} />;

            case 'privacy_policy':
                return <PrivacyPolicyModal onClose={onClose} />;

            case 'about':
                return <AboutModal onClose={onClose} />;

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// TERMS OF SERVICE MODAL
// ═══════════════════════════════════════════════════════════

function TermsModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Terms of Service</h3>
            <div style={{fontSize: '14px', lineHeight: '1.6', opacity: 0.9}}>
                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>1. Acceptance of Terms</h4>
                <p>By using GLRS Recovery Services, you agree to these terms.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>2. Service Description</h4>
                <p>GLRS provides recovery coaching and support services. We are not a medical provider.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>3. User Responsibilities</h4>
                <p>You are responsible for maintaining the confidentiality of your account.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>4. Privacy</h4>
                <p>Your use of our services is also governed by our Privacy Policy.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>5. Disclaimers</h4>
                <p>Our services are not a substitute for medical treatment or professional therapy.</p>
            </div>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                I Understand
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// PRIVACY POLICY MODAL
// ═══════════════════════════════════════════════════════════

function PrivacyPolicyModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Privacy Policy</h3>
            <div style={{fontSize: '14px', lineHeight: '1.6', opacity: 0.9}}>
                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Information We Collect</h4>
                <p>We collect information you provide directly, including recovery data and personal information.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>How We Use Your Information</h4>
                <p>Your data is used to provide recovery support services and track your progress.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Data Protection</h4>
                <p>We implement appropriate security measures to protect your information.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Your Rights</h4>
                <p>You have the right to access, update, or delete your personal information.</p>
            </div>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                Close
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ABOUT MODAL
// ═══════════════════════════════════════════════════════════

function AboutModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>About GLRS</h3>
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <img
                    src="glrs-logo.png"
                    alt="GLRS Logo"
                    style={{
                        width: '80px',
                        height: 'auto',
                        objectFit: 'contain',
                        margin: '0 auto'
                    }}
                />
            </div>
            <div style={{fontSize: '14px', lineHeight: '1.6', opacity: 0.9}}>
                <p style={{marginBottom: '15px'}}>
                    <strong>Guiding Light Recovery Services</strong>
                </p>
                <p style={{marginBottom: '15px'}}>
                    Version 1.0.0
                </p>
                <p style={{marginBottom: '15px'}}>
                    GLRS Recovery Connect is a comprehensive recovery support platform designed to help individuals
                    maintain their sobriety journey with daily check-ins, goal tracking, and coach support.
                </p>
                <p style={{marginBottom: '15px'}}>
                    © 2024 Guiding Light Recovery Services. All rights reserved.
                </p>
            </div>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                Close
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

// Register to global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LegalInfoModals = LegalInfoModals;

console.log('✅ LegalInfoModals.js loaded - 3 legal/info modals (3-layer architecture)');
// ============================================================
// GLRS LIGHTHOUSE - MODAL COMPONENTS
// ============================================================
// Pure presentational modal components
// Extracted from PIRapp.js for modularity
// ============================================================

const ImageModal = ({ imageUrl, onClose }) => {  // ✅ PHASE 2: Refactored to receive props (Facebook-style web modal)
    if (!imageUrl) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                cursor: 'pointer',
                padding: '40px 20px'
            }}
        >
            {/* Image container with max width like Facebook */}
            <div
                style={{
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)'
                    }}
                />
            </div>
            {/* Close button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
                ✕
            </button>
        </div>
    );
};

// ==========================================
// PHASE 2: APP STORE COMPLIANCE MODALS
// ==========================================

// First-Launch Disclaimer Modal
const DisclaimerModal = ({ onAccept }) => {  // ✅ PHASE 2: Refactored to receive callback
    const [checkboxChecked, setCheckboxChecked] = useState(false);

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
                    color: '#fff',
                    borderRadius: '15px 15px 0 0'
                }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
                        Welcome to Recovery Compass
                    </h2>
                    <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                        Please read this important information before using the app
                    </p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div style={{
                        padding: '20px',
                        background: '#fff3cd',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid #ffc107'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                            ⚕️ Medical Disclaimer
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#856404', lineHeight: '1.6' }}>
                            <strong>This app is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong>
                            <br/><br/>
                            Recovery Compass is a recovery support tool designed to complement professional treatment.
                            It should not replace in-person therapy, medical care, or emergency services.
                            <br/><br/>
                            <strong>If you are experiencing a medical or mental health emergency, call 911 or go to the nearest emergency room immediately.</strong>
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="lock" style={{width: '20px', height: '20px', color: 'var(--color-primary)'}}></i>
                            Privacy & Confidentiality
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            Your privacy is our priority. We use industry-standard encryption and HIPAA-compliant practices
                            to protect your information. However, no electronic system is 100% secure.
                            Please avoid sharing sensitive information you're not comfortable storing digitally.
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="message-circle" style={{width: '20px', height: '20px', color: 'var(--color-primary)'}}></i>
                            Peer Support Disclaimer
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            Community features connect you with others in recovery. While peer support can be valuable,
                            remember that other users are not medical professionals. Always consult your healthcare provider
                            for medical advice.
                        </p>
                    </div>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: '#e7f5ff',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={checkboxChecked}
                            onChange={(e) => setCheckboxChecked(e.target.checked)}
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '12px',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>
                            I have read and understand these disclaimers and agree to the Terms of Service and Privacy Policy
                        </span>
                    </label>

                    <button
                        onClick={() => {
                            if (!checkboxChecked) {
                                alert('Please check the box to confirm you understand and agree');
                                return;
                            }
                            if (onAccept) onAccept();
                        }}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
                            color: '#fff',
                            padding: '15px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Continue to App
                    </button>
                </div>
            </div>
        </div>
    );
};

// Legal Modal Component (Terms, Privacy, Data Handling)
const LegalModal = ({ modalType, onClose }) => {  // ✅ PHASE 2: Refactored to receive props
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

    const selectedContent = content[modalType] || content.terms;

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
                        {selectedContent.title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: '#999'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    padding: '30px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333',
                        margin: 0
                    }}>
                        {selectedContent.body}
                    </pre>
                </div>

                <div style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #ddd'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            background: '#0077CC',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Crisis Resources Modal
const CrisisModal = ({ onClose }) => {  // ✅ PHASE 2: Refactored to receive callback
    const resources = [
        {
            name: '988 Suicide & Crisis Lifeline',
            number: '988',
            description: '24/7 free and confidential support',
            action: () => window.location.href = 'tel:988'
        },
        {
            name: 'Crisis Text Line',
            number: 'Text HOME to 741741',
            description: 'Free 24/7 text support',
            action: () => window.location.href = 'sms:741741&body=HOME'
        },
        {
            name: 'SAMHSA National Helpline',
            number: '1-800-662-4357',
            description: 'Treatment referral and information',
            action: () => window.location.href = 'tel:18006624357'
        },
        {
            name: 'Veterans Crisis Line',
            number: '988 (Press 1)',
            description: 'Support for veterans and their families',
            action: () => window.location.href = 'tel:988'
        },
        {
            name: 'Emergency Services',
            number: '911',
            description: 'Life-threatening emergencies',
            action: () => window.location.href = 'tel:911'
        }
    ];

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #DC143C',
                    background: '#DC143C',
                    color: '#fff',
                    borderRadius: '15px 15px 0 0'
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i data-lucide="alert-octagon" style={{width: '28px', height: '28px'}}></i>
                        Crisis Resources
                    </h2>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                        If you're in crisis or need immediate help, please use one of these resources
                    </p>
                </div>

                <div style={{ padding: '20px' }}>
                    {resources.map((resource, index) => (
                        <div key={index} style={{
                            padding: '15px',
                            marginBottom: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            border: '1px solid #ddd'
                        }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '18px' }}>
                                {resource.name}
                            </h3>
                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                {resource.description}
                            </p>
                            <button
                                onClick={resource.action}
                                style={{
                                    background: '#DC143C',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <i data-lucide="phone" style={{width: '18px', height: '18px', marginRight: '8px'}}></i>
                                {resource.number}
                            </button>
                        </div>
                    ))}

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#fff3cd',
                        borderRadius: '10px',
                        border: '1px solid #ffc107'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                            <strong>⚠️ Important:</strong> If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '20px',
                            background: '#6c757d',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// NAMESPACE EXPOSURE
// ============================================================

// Register modals globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.modals = {
    ImageModal,
    DisclaimerModal,
    LegalModal,
    CrisisModal
};

console.log('✅ SharedModals.js loaded - Phase 2 (4 modal components refactored to props)');

// ═══════════════════════════════════════════════════════════
// PULL-TO-REFRESH INDICATOR COMPONENT
// Visual indicator shown during pull-to-refresh gesture
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const PullToRefreshIndicator = ({
    pulling,
    pullDistance,
    refreshing
}) => {
    if (!pulling) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: `translateX(-50%) translateY(${Math.min(pullDistance, 80)}px)`,
            zIndex: 999,
            transition: refreshing ? 'transform 0.3s' : 'none'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(6, 148, 148, 0.3)',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}>
                <i
                    data-lucide={refreshing ? "loader" : "arrow-down"}
                    style={{width: '24px', height: '24px', color: '#fff'}}
                ></i>
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.PullToRefreshIndicator = PullToRefreshIndicator;

console.log('✅ PullToRefreshIndicator component loaded');
// ═══════════════════════════════════════════════════════════
// MODAL RENDERER COMPONENT
// Centralized modal declarations extracted from PIRapp.js
// Renders all app-level modals based on state
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const ModalRenderer = ({
    // Modal States
    showDisclaimerModal,
    showTermsModal,
    showPrivacyModal,
    showDataHandlingModal,
    showCrisisModal,
    showIncompleteTasksModal,

    // Setters
    onCloseDisclaimerModal,
    onCloseTermsModal,
    onClosePrivacyModal,
    onCloseDataHandlingModal,
    onCloseCrisisModal,
    onCloseIncompleteTasksModal,

    // Data needed for rendering
    goals,
    assignments
}) => {
    return (
        <>
            {/* Phase 2: First-Launch Disclaimer Modal */}
            {showDisclaimerModal && (
                <window.GLRSApp.modals.DisclaimerModal
                    onAccept={() => {
                        localStorage.setItem('disclaimerAccepted', 'true');
                        localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
                        if (onCloseDisclaimerModal) onCloseDisclaimerModal();
                    }}
                />
            )}

            {/* Phase 2: Legal Modals */}
            {showTermsModal && (
                <window.GLRSApp.modals.LegalModal
                    type="terms"
                    onClose={() => { if (onCloseTermsModal) onCloseTermsModal(); }}
                />
            )}

            {showPrivacyModal && (
                <window.GLRSApp.modals.LegalModal
                    type="privacy"
                    onClose={() => { if (onClosePrivacyModal) onClosePrivacyModal(); }}
                />
            )}

            {showDataHandlingModal && (
                <window.GLRSApp.modals.LegalModal
                    type="dataHandling"
                    onClose={() => { if (onCloseDataHandlingModal) onCloseDataHandlingModal(); }}
                />
            )}

            {/* Phase 2: Crisis Resources Modal */}
            {showCrisisModal && (
                <window.GLRSApp.modals.CrisisModal
                    onClose={() => { if (onCloseCrisisModal) onCloseCrisisModal(); }}
                />
            )}
            {/* Incomplete Tasks Modal */}
            {showIncompleteTasksModal && goals && (
                <div
                    style={{
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
                    }}
                    onClick={() => { if (onCloseIncompleteTasksModal) onCloseIncompleteTasksModal(); }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '15px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #FFA500',
                            background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                            color: '#fff',
                            borderRadius: '15px 15px 0 0'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>⚠️ Incomplete Tasks</h2>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                You have unfinished tasks from your goals. Complete them to make progress!
                            </p>

                            {goals
                                .filter(goal => goal.status === 'active')
                                .map(goal => {
                                    const incompleteTasks = (assignments || [])
                                        .filter(a => a.goalId === goal.id && a.status !== 'completed');

                                    if (incompleteTasks.length === 0) return null;

                                    return (
                                        <div key={goal.id} style={{
                                            marginBottom: '20px',
                                            padding: '15px',
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            border: '1px solid #ddd'
                                        }}>
                                            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
                                                {goal.title}
                                            </h3>
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                {incompleteTasks.map(task => (
                                                    <li key={task.id} style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                                        {task.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })
                            }

                            <button
                                onClick={() => { if (onCloseIncompleteTasksModal) onCloseIncompleteTasksModal(); }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#FFA500',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.ModalRenderer = ModalRenderer;

console.log('✅ ModalRenderer component loaded');
// ═══════════════════════════════════════════════════════════
// MAIN CONTENT COMPONENT
// View router - renders appropriate tab based on currentView
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const MainContent = ({
    contentRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    currentView,
    loading,
    userData,
    goals,
    assignments,
    checkIns,
    resources
}) => {

    // LoadingSpinner component reference
    const LoadingSpinner = window.GLRSApp.components.LoadingSpinner;
    return (
        <div
            className="content"
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {currentView === 'meetings' && (
                loading || !userData ?
                    React.createElement(LoadingSpinner, { message: 'Loading meeting data...' }) :
                    React.createElement(window.GLRSApp.components.MeetingsTab)
            )}

            {currentView === 'tasks' && (
                loading || !goals || !assignments ?
                    React.createElement(LoadingSpinner, { message: 'Loading your tasks...' }) :
                    React.createElement(window.GLRSApp.components.TasksTab)
            )}

            {currentView === 'progress' && (
                loading || !checkIns ?
                    React.createElement(LoadingSpinner, { message: 'Loading your progress...' }) :
                    React.createElement(window.GLRSApp.components.JourneyTab)
            )}

            {currentView === 'connect' && (
                loading ?
                    React.createElement(LoadingSpinner, { message: 'Loading community...' }) :
                    React.createElement(window.GLRSApp.components.CommunityTab)
            )}

            {currentView === 'guides' && (
                loading || !resources ?
                    React.createElement(LoadingSpinner, { message: 'Loading resources...' }) :
                    React.createElement(window.GLRSApp.components.ResourcesView)
            )}

            {currentView === 'notifications' && (
                loading ?
                    React.createElement(LoadingSpinner, { message: 'Loading notifications...' }) :
                    React.createElement(window.GLRSApp.components.NotificationsTab)
            )}

            {currentView === 'profile' && (
                loading || !userData ?
                    React.createElement(LoadingSpinner, { message: 'Loading profile...' }) :
                    React.createElement(window.GLRSApp.components.ProfileView)
            )}
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MainContent = MainContent;

console.log('✅ MainContent component loaded');

// ═══════════════════════════════════════════════════════════
// LOADING SPINNER COMPONENT
// Reusable loading indicator with optional message
// ═══════════════════════════════════════════════════════════

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return React.createElement('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '15px'
        }
    }, [
        React.createElement('div', {
            key: 'spinner',
            style: {
                width: '50px',
                height: '50px',
                border: '4px solid rgba(6, 148, 148, 0.2)',
                borderTop: '4px solid #069494',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }),
        React.createElement('div', {
            key: 'message',
            style: {
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
            }
        }, message)
    ]);
};

// Register globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LoadingSpinner = LoadingSpinner;

console.log('✅ LoadingSpinner component loaded');

// ═══════════════════════════════════════════════════════════
// LEGAL FOOTER COMPONENT
// Terms of Service, Privacy Policy, and Data Handling links
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const LegalFooter = ({
    onShowTermsModal,
    onShowPrivacyModal,
    onShowDataHandlingModal
}) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '70px'
        }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (onShowTermsModal) onShowTermsModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Terms of Service
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (onShowPrivacyModal) onShowPrivacyModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Privacy Policy
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (onShowDataHandlingModal) onShowDataHandlingModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Data Handling
                </a>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                © 2025 Guiding Light Recovery Services. All rights reserved.
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LegalFooter = LegalFooter;

console.log('✅ LegalFooter component loaded');
// ═══════════════════════════════════════════════════════════
// HEADERBAR COMPONENT
// Top navigation bar with view-specific actions and sidebar
// ✅ PHASE 1: Updated with Recovery Compass, User icon, and sidebar
// ═══════════════════════════════════════════════════════════

const HeaderBar = ({
    currentView,
    onShowProfileModal,
    onMarkAllNotificationsAsRead,
    userData,
    user
}) => {
    // Sidebar state (local to HeaderBar component)
    const [showSidebar, setShowSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Re-initialize Lucide icons when sidebar opens/closes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [showSidebar]);

    return (
        <>
            <div className="header">
                <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px' }}>
                    {currentView === 'meetings' && (
                        <>
                            <button
                                onClick={() => {
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                    setShowSidebar(true);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#14b8a6'
                                }}
                                title="Open sidebar"
                            >
                                <i data-lucide="menu" style={{width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px'}}></i>
                            </button>
                            <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>Meetings</span>
                        </>
                    )}
                    {currentView === 'connect' && 'Community'}
                    {currentView === 'notifications' && 'Notifications'}
                </div>
                <div className="header-actions">
                    {currentView === 'connect' && (
                        <button className="header-btn">
                            <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                        </button>
                    )}
                    {currentView === 'notifications' && (
                        <button className="header-btn" onClick={() => { if (onMarkAllNotificationsAsRead) onMarkAllNotificationsAsRead(); }}>
                            <span>Mark All Read</span>
                        </button>
                    )}
                    {/* User icon - navigates to profile */}
                    <button
                        className="header-btn"
                        onClick={() => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('light');
                            }
                            window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'profile' } }));
                        }}
                        style={{
                            width: isMobile ? '36px' : '40px',
                            height: isMobile ? '36px' : '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                        title="Profile"
                    >
                        <i data-lucide="user" style={{width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px'}}></i>
                    </button>
                </div>
            </div>

            {/* Sidebar Backdrop */}
            {showSidebar && (
                <div
                    onClick={() => {
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                        setShowSidebar(false);
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                />
            )}

            {/* Sidebar Panel */}
            {showSidebar && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: isMobile ? '280px' : '320px',
                        backgroundColor: '#fff',
                        zIndex: 9999,
                        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
                        animation: 'slideInLeft 0.3s ease-out',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Sidebar Header */}
                    <div style={{
                        padding: isMobile ? '20px 16px' : '24px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="compass" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
                            <h2 style={{
                                margin: 0,
                                fontSize: isMobile ? '18px' : '20px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Home
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                setShowSidebar(false);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '8px',
                                cursor: 'pointer',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Close sidebar"
                        >
                            <i data-lucide="x" style={{width: '24px', height: '24px'}}></i>
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div style={{
                        flex: 1,
                        padding: isMobile ? '24px 16px' : '32px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: isMobile ? '80px' : '96px',
                            height: isMobile ? '80px' : '96px',
                            borderRadius: '50%',
                            backgroundColor: '#f0fdfa',
                            border: '3px solid #14b8a6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: isMobile ? '20px' : '24px'
                        }}>
                            <i data-lucide="construction" style={{width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', color: '#14b8a6'}}></i>
                        </div>

                        <h3 style={{
                            fontSize: isMobile ? '18px' : '20px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: isMobile ? '12px' : '16px'
                        }}>
                            Sidebar Under Construction
                        </h3>

                        <p style={{
                            fontSize: isMobile ? '14px' : '15px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            maxWidth: '260px',
                            margin: 0
                        }}>
                            We're thinking about the best ways to serve you
                        </p>
                    </div>

                    {/* Sidebar Footer (Optional) */}
                    <div style={{
                        padding: isMobile ? '16px' : '20px',
                        borderTop: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            margin: 0
                        }}>
                            Check back soon for updates
                        </p>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideInLeft {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.HeaderBar = HeaderBar;

console.log('✅ HeaderBar component loaded');
// ═══════════════════════════════════════════════════════════
// CRISIS BUTTON COMPONENT
// Floating emergency resources button
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const CrisisButton = ({ onShowCrisisModal }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            zIndex: 999
        }}>
            <button
                onClick={() => { if (onShowCrisisModal) onShowCrisisModal(true); }}
                style={{
                    background: '#DC143C',
                    color: '#fff',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 20, 60, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Crisis Resources"
            >
                <i data-lucide="alert-octagon" style={{width: '32px', height: '32px'}}></i>
            </button>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.CrisisButton = CrisisButton;

console.log('✅ CrisisButton component loaded');
// ═══════════════════════════════════════════════════════════
// BOTTOM NAVIGATION COMPONENT
// Main app navigation bar with 6 tabs
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const BottomNavigation = ({
    currentView,
    onChangeView,
    unreadCount
}) => {
    return (
        <div className="bottom-nav">
            <div
                className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('tasks');
                }}
            >
                <i data-lucide="check-square" className="nav-icon"></i>
                <div className="nav-label">Tasks</div>
            </div>
            <div
                className={`nav-item ${currentView === 'progress' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('progress');
                }}
            >
                <i data-lucide="trending-up" className="nav-icon"></i>
                <div className="nav-label">Journey</div>
            </div>
            <div
                className={`nav-item ${currentView === 'meetings' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('meetings');
                }}
            >
                <i data-lucide="calendar" className="nav-icon"></i>
                <div className="nav-label">Meetings</div>
            </div>
            <div
                className={`nav-item ${currentView === 'connect' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('connect');
                }}
            >
                <i data-lucide="message-circle" className="nav-icon"></i>
                <div className="nav-label">Connect</div>
            </div>
            <div
                className={`nav-item ${currentView === 'guides' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('guides');
                }}
            >
                <i data-lucide="book-open" className="nav-icon"></i>
                <div className="nav-label">Guides</div>
            </div>
            <div
                className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('notifications');
                }}
            >
                <i data-lucide="bell" className="nav-icon"></i>
                <div className="nav-label">Notifications</div>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '50%',
                        marginRight: '-16px',
                        background: '#ff4757',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.BottomNavigation = BottomNavigation;

console.log('✅ BottomNavigation component loaded');

