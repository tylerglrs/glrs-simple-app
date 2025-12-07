// ==========================================
// TENANT STATUS BANNER COMPONENT
// ==========================================
// Shows trial expiration warning banners for tenant users
// Used by all admin pages

const { useState, useEffect } = React;

function StatusBanner({ user }) {
    const [tenantStatus, setTenantStatus] = useState(null);

    useEffect(() => {
        if (user && user.tenantStatus) {
            setTenantStatus(user.tenantStatus);
        }
    }, [user]);

    // Don't show banner for SuperAdmins or if no status
    if (!tenantStatus || !user || user.role === 'superadmin') {
        return null;
    }

    // Only show for Trial status with days remaining
    if (!tenantStatus.isTrial || !tenantStatus.daysRemaining) {
        return null;
    }

    const daysRemaining = tenantStatus.daysRemaining;
    const isUrgent = daysRemaining <= 7;
    const isCritical = daysRemaining <= 3;

    return (
        <div style={{
            background: isCritical
                ? 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)'
                : isUrgent
                    ? 'linear-gradient(135deg, #FF8C00 0%, #FF6347 100%)'
                    : 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: isCritical ? 'pulse 2s infinite' : 'none'
        }}>
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.8; }
                    }
                `}
            </style>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {isCritical ? '🚨' : '⏰'}
                    {isCritical ? 'URGENT: ' : ''}
                    Trial Period Ending Soon
                </div>
                <div style={{ fontSize: '14px', opacity: 0.95 }}>
                    {daysRemaining === 1
                        ? 'Your trial expires tomorrow!'
                        : daysRemaining === 0
                            ? 'Your trial expires today!'
                            : `Your trial expires in ${daysRemaining} days`
                    }
                    {tenantStatus.trialEndDate && (
                        <span style={{ marginLeft: '10px', fontSize: '13px', opacity: 0.85 }}>
                            (Ends {tenantStatus.trialEndDate.toLocaleDateString()})
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={() => {
                    alert(
                        `Trial Information\n\n` +
                        `Your trial period will end on ${tenantStatus.trialEndDate?.toLocaleDateString()}.\n\n` +
                        `After this date, your account will be suspended and all users will lose access.\n\n` +
                        `To continue using GLRS, please contact support to upgrade your account:\n\n` +
                        `Email: support@glrecoveryservices.com\n` +
                        `Phone: (555) 555-1234`
                    );
                }}
                style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Upgrade Account
            </button>
        </div>
    );
}

// Export for use in all pages
window.StatusBanner = StatusBanner;

console.log('✅ Status Banner component loaded');
