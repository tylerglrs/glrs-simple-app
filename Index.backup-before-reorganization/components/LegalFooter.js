// ═══════════════════════════════════════════════════════════
// LEGAL FOOTER COMPONENT
// Terms of Service, Privacy Policy, and Data Handling links
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const LegalFooter = () => {
    // Get state from Context
    const {
        setShowTermsModal,
        setShowPrivacyModal,
        setShowDataHandlingModal
    } = useAppContext();
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
                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Terms of Service
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Privacy Policy
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowDataHandlingModal(true); }}
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
