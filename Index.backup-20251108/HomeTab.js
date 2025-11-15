// Index/HomeTab.js
function HomeTab({ app }) {  // ✅ FIXED: Destructure props to extract app object
    const {
        activeBroadcast,
        broadcastDismissed,
        dismissBroadcast,
        coachInfo,
        sobrietyDays,
        dailyQuote,
        nextMilestone,
        milestones,
        selectedMood,
        setSelectedMood,
        pledgeMade,
        handlePledge,
        triggerHaptic,
        setCurrentView,
        userData,
        moneySaved,
        checkInStreak,
        totalCheckIns,
        complianceRate,
        setShowProfileModal,
        setShowMilestoneModal,
        setShowIntentionsModal,
        setShowProgressSnapshotModal
    } = app;

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
                    <button className="broadcast-dismiss" onClick={dismissBroadcast}>×</button>
                </div>
            )}

            {/* HERO SECTION - Teal background with sobriety counter */}
            <div className="hero-section">
                {coachInfo && (
                    <div className="coach-info-card">
                        <h3 style={{color: '#4CAF50', marginBottom: '10px'}}>Your Recovery Coach</h3>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <div style={{fontSize: '18px', fontWeight: 'bold', color: 'white'}}>
                                    {coachInfo.displayName || coachInfo.firstName + ' ' + coachInfo.lastName}
                                </div>
                                {coachInfo.credentials && (
                                    <div style={{fontSize: '14px', opacity: 0.8, marginTop: '5px'}}>
                                        {coachInfo.credentials}
                                    </div>
                                )}
                            </div>
                            {coachInfo.phone && (
                                <a href={`tel:${coachInfo.phone}`} style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    padding: '8px 15px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '14px'
                                }}>
                                    <i data-lucide="phone" style={{width: '16px', height: '16px', marginRight: '6px'}}></i>
                                    Contact
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div className="hero-background">
                    <div className="day-counter-container">
                        <div className="large-number">{sobrietyDays}</div>
                        <div className="large-text">Days Strong</div>
                        <div className="motivational-quote">
                            {dailyQuote?.quote || "One day at a time."}
                        </div>
                        {dailyQuote?.author && (
                            <div style={{fontSize: '12px', opacity: 0.7, marginTop: '5px'}}>
                                — {dailyQuote.author}
                            </div>
                        )}
                    </div>
                </div>
                
                {nextMilestone && (
                    <div className="milestone-preview">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <div style={{fontSize: '18px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <i data-lucide={nextMilestone.icon || 'target'} style={{width: '20px', height: '20px'}}></i>
                                    <span>Next: {nextMilestone.title}</span>
                                </div>
                                <div style={{color: 'rgba(255,255,255,0.7)', marginTop: '5px', fontSize: '14px'}}>
                                    {nextMilestone.description}
                                </div>
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4CAF50'}}>
                                    {nextMilestone.daysRequired - sobrietyDays}
                                </div>
                                <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.7)'}}>
                                    days to go
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* END HERO SECTION */}

            {/* BODY SECTION - White background with cards */}
            <div className="body-section">
                {/* Milestone Timeline with Achievement Badges */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <h3 style={{
                        color: '#fff',
                        fontSize: 'var(--font-lg)',
                        fontWeight: 'bold',
                        marginBottom: 'var(--space-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                    }}>
                        <i data-lucide="trophy" style={{width: '24px', height: '24px', color: 'var(--color-accent)'}}></i>
                        <span>Milestone Journey</span>
                    </h3>
                    <div style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: 'var(--space-3)',
                        paddingBottom: 'var(--space-2)'
                    }}>
                        {milestones?.slice(0, 10).map((milestone, index) => {
                            const achieved = sobrietyDays >= milestone.days;
                            const isNext = nextMilestone && milestone.days === nextMilestone.daysRequired;

                            return (
                                <div key={index} style={{
                                    minWidth: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)'
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: achieved
                                            ? 'linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%)'
                                            : isNext
                                                ? 'linear-gradient(135deg, var(--color-accent) 0%, #FF6B35 100%)'
                                                : 'rgba(255,255,255,0.1)',
                                        border: isNext ? '3px solid var(--color-accent)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        boxShadow: achieved ? '0 4px 12px rgba(46, 204, 113, 0.4)' : 'none',
                                        animation: isNext ? 'pulse 2s infinite' : 'none'
                                    }}>
                                        <i data-lucide={milestone.icon || 'award'}
                                           style={{
                                               width: '32px',
                                               height: '32px',
                                               color: achieved || isNext ? '#fff' : 'rgba(255,255,255,0.3)'
                                           }}></i>
                                        {achieved && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-4px',
                                                right: '-4px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i data-lucide="check" style={{width: '16px', height: '16px', color: 'var(--color-success)'}}></i>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-xs)',
                                        fontWeight: '600',
                                        color: achieved ? '#fff' : isNext ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
                                        textAlign: 'center'
                                    }}>
                                        {milestone.days}d
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mood-tracker">
                    <div style={{color: 'white', marginBottom: '15px'}}>
                        How are you feeling today?
                    </div>
                    <div className="mood-options">
                        {[
                            { value: 'great', label: 'Great', icon: 'smile' },
                            { value: 'good', label: 'Good', icon: 'meh' },
                            { value: 'okay', label: 'Okay', icon: 'frown' },
                            { value: 'struggling', label: 'Struggling', icon: 'frown' },
                            { value: 'crisis', label: 'Crisis', icon: 'alert-circle' }
                        ].map(mood => (
                            <div
                                key={mood.value}
                                className={`mood-button ${selectedMood === mood.value ? 'selected' : ''}`}
                                onClick={() => setSelectedMood(mood.value)}
                            >
                                <i data-lucide={mood.icon} className="mood-icon"></i>
                                <div className="mood-label">{mood.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Quick Tools Section - Home Tab */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '20px',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '20px',
                        fontWeight: '600'
                    }}>Quick Tools</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                setShowIntentionsModal(true);
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '16px',
                                color: 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                Set Today's Intentions
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.9 }}>
                                Define your focus for the day
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                setShowProgressSnapshotModal(true);
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '16px',
                                color: 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                Progress Snapshot
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.9 }}>
                                View all goals and stats
                            </div>
                        </button>
                    </div>
                </div>
                
                <button
                    onClick={() => setCurrentView('guides')}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <i data-lucide="book-open" style={{width: '24px', height: '24px', marginRight: '8px'}}></i>
                    Recovery Resources
                    <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px'
                    }}>
                        {userData?.newResourcesCount || 0} New
                    </span>
                </button>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><i data-lucide="dollar-sign"></i></div>
                        <div className="stat-value">${(moneySaved || 0).toLocaleString()}</div>
                        <div className="stat-label">Money Saved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i data-lucide="calendar-days"></i></div>
                        <div className="stat-value">{sobrietyDays || 0}</div>
                        <div className="stat-label">Total Days</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i data-lucide="flame"></i></div>
                        <div className="stat-value">{checkInStreak || 0}</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i data-lucide="calendar-check"></i></div>
                        <div className="stat-value">{Math.floor((sobrietyDays || 0) / 7)}</div>
                        <div className="stat-label">Weeks Clean</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i data-lucide="check-circle"></i></div>
                        <div className="stat-value">{totalCheckIns || 0}</div>
                        <div className="stat-label">Total Check-ins</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><i data-lucide="bar-chart-2"></i></div>
                        <div className="stat-value">{complianceRate?.checkIn || 0}%</div>
                        <div className="stat-label">Check-in Rate</div>
                    </div>
                </div>
            </div>
        </>
    );
}

window.GLRSApp.components.HomeTab = HomeTab;