// ============================================================
// GLRS LIGHTHOUSE - CRISIS MODAL
// ============================================================
// Crisis resources and emergency helplines modal
// Part of modular architecture - modal components
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.modals = window.GLRSApp.modals || {};

// Crisis Modal Component - Emergency resources and helplines
const CrisisModal = ({ onClose }) => {
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

// Expose to global namespace
window.GLRSApp.modals.CrisisModal = CrisisModal;

// Backward compatibility
window.CrisisModal = CrisisModal;

console.log('✅ CrisisModal loaded');
