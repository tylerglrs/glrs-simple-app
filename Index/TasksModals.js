{/* Tasks Tab Modals */}
{/* 1. Mood Pattern Modal */}
{showMoodPatternModal && (
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
    }}
    onClick={() => setShowMoodPatternModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Mood Improvement Tips
                    </h3>
                    <button
                        onClick={() => setShowMoodPatternModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Practice 5 minutes of deep breathing when you wake up',
                        'Get 15-30 minutes of sunlight exposure daily',
                        'Maintain a consistent sleep schedule',
                        'Limit caffeine intake after 2pm',
                        'Exercise for at least 20 minutes per day',
                        'Connect with a friend or family member',
                        'Write down three things you are grateful for'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowMoodPatternModal(false);
                        setCurrentView('guides');
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 2. Craving Pattern Modal */}
{showCravingPatternModal && (
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
    }}
    onClick={() => setShowCravingPatternModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Craving Management Tips
                    </h3>
                    <button
                        onClick={() => setShowCravingPatternModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Use the 5-4-3-2-1 grounding technique when cravings hit',
                        'Call your sponsor or accountability partner immediately',
                        'Remove yourself from triggering environments',
                        'Engage in physical activity to redirect energy',
                        'Practice HALT: Check if you are Hungry, Angry, Lonely, or Tired',
                        'Keep a craving journal to identify patterns and triggers'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowCravingPatternModal(false);
                        setCurrentView('guides');
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 3. Anxiety Pattern Modal */}
{showAnxietyPatternModal && (
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
    }}
    onClick={() => setShowAnxietyPatternModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Anxiety Reduction Tips
                    </h3>
                    <button
                        onClick={() => setShowAnxietyPatternModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Practice box breathing: inhale 4 counts, hold 4, exhale 4, hold 4',
                        'Limit news and social media consumption',
                        'Establish a calming bedtime routine',
                        'Challenge anxious thoughts with evidence-based thinking',
                        'Engage in progressive muscle relaxation',
                        'Avoid excessive caffeine and sugar',
                        'Connect with nature through outdoor walks'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowAnxietyPatternModal(false);
                        setCurrentView('guides');
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 4. Sleep Pattern Modal */}
{showSleepPatternModal && (
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
    }}
    onClick={() => setShowSleepPatternModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Sleep Quality Tips
                    </h3>
                    <button
                        onClick={() => setShowSleepPatternModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {[
                        'Maintain a consistent sleep schedule, even on weekends',
                        'Avoid screens 1 hour before bedtime',
                        'Keep your bedroom cool, dark, and quiet',
                        'Avoid large meals and alcohol before bed',
                        'Create a relaxing bedtime routine',
                        'Exercise regularly, but not within 3 hours of bedtime',
                        'Consider melatonin or magnesium supplements after consulting your doctor'
                    ].map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#058585', flexShrink: 0, marginTop: '2px' }}></i>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowSleepPatternModal(false);
                        setCurrentView('guides');
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    View Related Resources
                </button>
            </div>
        </div>
    </div>
)}

{/* 5. Generic Tips Modal (Fallback) */}
{showTipsModal && patternDetection && (
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
    }}
    onClick={() => setShowTipsModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Pattern Insights
                    </h3>
                    <button
                        onClick={() => setShowTipsModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Pattern Message */}
                <div style={{
                    background: '#FFF8E1',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    border: '1px solid #FFD54F'
                }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '8px'
                    }}>
                        {patternDetection.message}
                    </div>
                    {patternDetection.day && (
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#666666'
                        }}>
                            Day: {patternDetection.day} | Value: {patternDetection.value}
                        </div>
                    )}
                </div>

                {/* Tips List */}
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Recommended Actions
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {patternDetection.tips.map((tip, index) => (
                        <div key={index} style={{
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#058585',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                {index + 1}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                lineHeight: '1.5'
                            }}>
                                {tip}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowTipsModal(false);
                        setCurrentView('guides');
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    View Related Guides
                </button>
            </div>
        </div>
    </div>
)}

{/* 6. Coping Technique Modal */}
{showCopingTechniqueModal && (() => {
    const dayOfMonth = new Date().getDate();
    const technique = copingTechniques.find(t => t.day === dayOfMonth) || copingTechniques[0];

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
        }}
        onClick={() => setShowCopingTechniqueModal(false)}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide={technique.icon} style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '400',
                                    color: '#000000'
                                }}>
                                    {technique.title}
                                </h3>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666',
                                    marginTop: '4px'
                                }}>
                                    {technique.category} • Day {technique.day}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCopingTechniqueModal(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Large Icon Display */}
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        marginBottom: '20px',
                        background: technique.category === 'Breathing' ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' :
                                    technique.category === 'Mindfulness' ? 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' :
                                    technique.category === 'Physical' ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' :
                                    technique.category === 'Cognitive' ? 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)' :
                                    'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
                        borderRadius: '12px'
                    }}>
                        <i data-lucide={technique.icon} style={{
                            width: '64px',
                            height: '64px',
                            color: technique.category === 'Breathing' ? '#1976D2' :
                                   technique.category === 'Mindfulness' ? '#7B1FA2' :
                                   technique.category === 'Physical' ? '#388E3C' :
                                   technique.category === 'Cognitive' ? '#F57F17' :
                                   '#E64A19',
                            marginBottom: '12px'
                        }}></i>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#666666',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {technique.category} Technique
                        </div>
                    </div>

                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000000',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i data-lucide="list-checks" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                        How to Practice
                    </h4>

                    {/* Description with proper line breaks and enhanced styling */}
                    <div style={{
                        background: '#F5F5F5',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px',
                        border: '1px solid #E0E0E0'
                    }}>
                        {technique.description.split('\n').map((line, index) => {
                            const isNumbered = /^\d+\./.test(line.trim());
                            const isBold = line.includes('Optimizes') || line.includes('Reduces') || line.includes('Improves');

                            return (
                                <div key={index} style={{
                                    fontSize: '14px',
                                    fontWeight: isBold ? 'bold' : '400',
                                    color: isBold ? '#058585' : '#000000',
                                    lineHeight: '1.6',
                                    marginBottom: line.trim() === '' ? '12px' : '6px',
                                    paddingLeft: isNumbered ? '0' : '0',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                }}>
                                    {isNumbered && <span style={{ color: '#058585', fontWeight: 'bold', minWidth: '20px' }}>{line.match(/^\d+\./)?.[0]}</span>}
                                    <span>{isNumbered ? line.replace(/^\d+\.\s*/, '') : (line.trim() || '\u00A0')}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Benefits Badge */}
                    <div style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i data-lucide="heart-pulse" style={{ width: '20px', height: '20px', color: '#2E7D32' }}></i>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#2E7D32'
                        }}>
                            Evidence-Based Technique
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            triggerHaptic('light');
                            setShowCopingTechniqueModal(false);
                        }}
                        style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
})()}

{/* 7. Milestone Modal */}
{showMilestoneModal && (
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
    }}
    onClick={() => setShowMilestoneModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i data-lucide="trophy" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Recovery Milestones
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowMilestoneModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {console.log('🔍 Milestone Modal Debug:', { user, sobrietyDate: user?.sobrietyDate, hasDate: !!user?.sobrietyDate })}
                {!user?.sobrietyDate ? (
                    /* No sobriety date set */
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <i data-lucide="calendar-x" style={{ width: '64px', height: '64px', color: '#058585', marginBottom: '20px' }}></i>
                        <h4 style={{ fontSize: '18px', fontWeight: '400', color: '#000000', marginBottom: '12px' }}>
                            Set Your Sobriety Date
                        </h4>
                        <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px', lineHeight: '1.6' }}>
                            To track your recovery milestones, please set your sobriety date in your profile settings.
                        </p>
                        <button
                            onClick={() => {
                                triggerHaptic('medium');
                                setShowMilestoneModal(false);
                                setCurrentView('profile');
                            }}
                            style={{
                                padding: '12px 24px',
                                background: '#058585',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: '400',
                                cursor: 'pointer'
                            }}
                        >
                            Go to Profile
                        </button>
                    </div>
                ) : allMilestones.length === 0 ? (
                    /* Milestones not loaded yet */
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <i data-lucide="loader" style={{ width: '48px', height: '48px', color: '#058585', marginBottom: '20px', animation: 'spin 1s linear infinite' }}></i>
                        <p style={{ fontSize: '14px', color: '#666666' }}>Loading milestones...</p>
                    </div>
                ) : (
                    /* Milestones loaded - show content */
                    <>
                        {nextMilestone && (
                            /* Progress Card */
                            <div style={{
                                background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px',
                                color: '#FFFFFF'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <i data-lucide={nextMilestone.icon} style={{ width: '32px', height: '32px' }}></i>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            {nextMilestone.achieved ?
                                                'All Milestones Complete!' :
                                                `Next: ${nextMilestone.label}`
                                            }
                                        </div>
                                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                            {nextMilestone.achieved ?
                                                `${nextMilestone.daysSober} days sober` :
                                                `${nextMilestone.daysUntil} ${nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go`
                                            }
                                        </div>
                                    </div>
                                </div>
                                {!nextMilestone.achieved && (
                                    <>
                                        {/* Progress Bar */}
                                        <div style={{
                                            background: 'rgba(255,255,255,0.3)',
                                            borderRadius: '10px',
                                            height: '8px',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                background: '#FFFFFF',
                                                height: '100%',
                                                width: `${nextMilestone.progressPercentage}%`,
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                        <div style={{ fontSize: '12px', textAlign: 'right', opacity: 0.9 }}>
                                            {nextMilestone.progressPercentage}% complete
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* All Milestones List */}
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '12px'
                        }}>
                            All Milestones
                        </h4>
                        <div style={{ marginBottom: '20px' }}>
                            {allMilestones.map((milestone, index) => (
                                <div key={index} style={{
                                    background: milestone.achieved ? '#E8F5E9' : '#F5F5F5',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    border: milestone.achieved ? '1px solid #4CAF50' : '1px solid #E0E0E0'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: milestone.achieved ?
                                            'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' :
                                            '#E0E0E0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <i data-lucide={milestone.achieved ? 'check' : milestone.icon}
                                           style={{
                                               width: '20px',
                                               height: '20px',
                                               color: milestone.achieved ? '#FFFFFF' : '#999999'
                                           }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            color: '#000000',
                                            marginBottom: '2px'
                                        }}>
                                            {milestone.label} ({milestone.days} days)
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '400',
                                            color: '#666666'
                                        }}>
                                            {milestone.achieved ?
                                                `Achieved on ${milestone.dateString}` :
                                                `Target: ${milestone.dateString}`
                                            }
                                        </div>
                                    </div>
                                    {milestone.achieved && (
                                        <div style={{
                                            fontSize: '20px'
                                        }}>
                                            🎉
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                setShowMilestoneModal(false);
                            }}
                            style={{
                                width: '100%',
                                height: '48px',
                                background: '#058585',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
)}

{/* 8. Past Reflections Modal */}
{showPastReflectionsModal && (() => {
    // Filter reflections based on selected filter
    const getFilteredReflections = () => {
        if (reflectionFilter === 'all') {
            return reflectionData;
        } else if (reflectionFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reflectionData.filter(r => {
                const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                return reflectionDate >= weekAgo;
            });
        } else if (reflectionFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            return reflectionData.filter(r => {
                const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                return reflectionDate >= monthAgo;
            });
        }
        return reflectionData;
    };

    const filteredReflections = getFilteredReflections();

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
        }}
        onClick={() => {
            setShowPastReflectionsModal(false);
            setSelectedReflection(null);
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    position: 'sticky',
                    top: 0,
                    background: '#FFFFFF',
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="book-open" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Past Reflections
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                setShowPastReflectionsModal(false);
                                setSelectedReflection(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px'
                    }}>
                        {['all', 'week', 'month'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => {
                                    triggerHaptic('light');
                                    setReflectionFilter(filter);
                                    setSelectedReflection(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: reflectionFilter === filter ? '#058585' : '#F5F5F5',
                                    color: reflectionFilter === filter ? '#FFFFFF' : '#666666',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
                    {filteredReflections.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999999'
                        }}>
                            <i data-lucide="book-open" style={{ width: '48px', height: '48px', color: '#E0E0E0', marginBottom: '12px' }}></i>
                            <div style={{ fontSize: '14px', fontWeight: '400' }}>
                                No reflections found
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredReflections.map((reflection, index) => {
                                const reflectionDate = reflection.createdAt?.toDate ?
                                    reflection.createdAt.toDate() : new Date(reflection.createdAt);
                                const isExpanded = selectedReflection?.id === reflection.id;

                                return (
                                    <div key={reflection.id || index} style={{
                                        background: '#F8F9FA',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: isExpanded ? '2px solid #058585' : '1px solid #E5E5E5',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setSelectedReflection(isExpanded ? null : reflection);
                                    }}>
                                        {/* Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: isExpanded ? '16px' : '0'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#000000',
                                                    marginBottom: '4px'
                                                }}>
                                                    {reflectionDate.toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                {reflection.overallDay && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '400',
                                                        color: '#666666'
                                                    }}>
                                                        Daily Score: {reflection.overallDay}/10
                                                    </div>
                                                )}
                                            </div>
                                            <i data-lucide={isExpanded ? 'chevron-up' : 'chevron-down'}
                                               style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px'
                                            }}>
                                                {/* Prompt Response */}
                                                {reflection.promptResponse && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Prompt Response
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.promptResponse}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Challenges */}
                                                {reflection.challenges && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Challenges
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.challenges}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Gratitude */}
                                                {reflection.gratitude && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Gratitude
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.gratitude}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tomorrow's Goal */}
                                                {reflection.tomorrowGoal && (
                                                    <div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#058585',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Tomorrow's Goal
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '400',
                                                            color: '#000000',
                                                            lineHeight: '1.5',
                                                            background: '#FFFFFF',
                                                            padding: '10px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {reflection.tomorrowGoal}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
})()}

{/* 9. Quick Gratitude Modal */}
{showGratitudeModal && (
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
    }}
    onClick={() => {
        setShowGratitudeModal(false);
        setGratitudeTheme('');
        setGratitudeText('');
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i data-lucide="heart" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Gratitude Entry
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            setShowGratitudeModal(false);
                            setGratitudeTheme('');
                            setGratitudeText('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Theme Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#000000',
                        marginBottom: '12px'
                    }}>
                        Select a Theme
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '8px'
                    }}>
                        {gratitudeThemes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    triggerHaptic('light');
                                    setGratitudeTheme(theme.id);
                                }}
                                style={{
                                    padding: '12px',
                                    background: gratitudeTheme === theme.id ? theme.color : '#F5F5F5',
                                    color: gratitudeTheme === theme.id ? '#FFFFFF' : '#000000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <i data-lucide={theme.icon}
                                   style={{
                                       width: '20px',
                                       height: '20px',
                                       color: gratitudeTheme === theme.id ? '#FFFFFF' : theme.color
                                   }}></i>
                                <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
                                    {theme.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gratitude Text */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#000000',
                        marginBottom: '8px'
                    }}>
                        What are you grateful for?
                    </h4>
                    <textarea
                        value={gratitudeText}
                        onChange={(e) => setGratitudeText(e.target.value)}
                        placeholder="Express your gratitude..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            border: '1px solid #E5E5E5',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={() => {
                        triggerHaptic('medium');
                        saveGratitude();
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Save Gratitude
                </button>
            </div>
        </div>
    </div>
)}

{/* Weekly Progress Report Modal */}
{showWeeklyReportModal && (() => {
    // Calculate week-specific stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Check-in stats for the week
    const thisWeekCheckIns = checkInData.filter(c => {
        const checkInDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
        return checkInDate >= weekAgo;
    });

    const weekCheckInCount = thisWeekCheckIns.length;
    const weekCheckInRate = Math.round((weekCheckInCount / 7) * 100);

    const weekMoodScores = thisWeekCheckIns
        .filter(c => c.morningData?.mood !== undefined || c.eveningData?.mood !== undefined)
        .map(c => c.morningData?.mood ?? c.eveningData?.mood);
    const weekAvgMood = weekMoodScores.length > 0
        ? (weekMoodScores.reduce((a, b) => a + b, 0) / weekMoodScores.length).toFixed(1)
        : 'N/A';

    const weekCravingsScores = thisWeekCheckIns
        .filter(c => c.morningData?.craving !== undefined || c.eveningData?.craving !== undefined)
        .map(c => c.morningData?.craving ?? c.eveningData?.craving);
    const weekAvgCravings = weekCravingsScores.length > 0
        ? (weekCravingsScores.reduce((a, b) => a + b, 0) / weekCravingsScores.length).toFixed(1)
        : 'N/A';

    const weekAnxietyScores = thisWeekCheckIns
        .filter(c => c.morningData?.anxiety !== undefined || c.eveningData?.anxiety !== undefined)
        .map(c => c.morningData?.anxiety ?? c.eveningData?.anxiety);
    const weekAvgAnxiety = weekAnxietyScores.length > 0
        ? (weekAnxietyScores.reduce((a, b) => a + b, 0) / weekAnxietyScores.length).toFixed(1)
        : 'N/A';

    const weekSleepScores = thisWeekCheckIns
        .filter(c => c.morningData?.sleep !== undefined || c.eveningData?.sleep !== undefined)
        .map(c => c.morningData?.sleep ?? c.eveningData?.sleep);
    const weekAvgSleep = weekSleepScores.length > 0
        ? (weekSleepScores.reduce((a, b) => a + b, 0) / weekSleepScores.length).toFixed(1)
        : 'N/A';

    // Reflection stats for the week
    const thisWeekReflections = reflectionData.filter(r => {
        const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return reflectionDate >= weekAgo;
    });

    const weekReflectionCount = thisWeekReflections.length;
    const weekDailyScores = thisWeekReflections.filter(r => r.dailyScore).map(r => r.dailyScore);
    const weekAvgDailyScore = weekDailyScores.length > 0
        ? (weekDailyScores.reduce((a, b) => a + b, 0) / weekDailyScores.length).toFixed(1)
        : 'N/A';

    // Gratitude entries for the week
    const weekGratitudes = thisWeekReflections.filter(r => r.gratitude && r.gratitude.length > 0).length;

    // Assignment progress for the week
    const thisWeekAssignments = assignments.filter(a => {
        if (!a.createdAt) return false;
        const assignmentDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        return assignmentDate >= weekAgo;
    });

    const weekAssignmentsCompleted = thisWeekAssignments.filter(a => a.status === 'completed').length;
    const weekAssignmentsTotal = thisWeekAssignments.length;
    const weekCompletionRate = weekAssignmentsTotal > 0
        ? Math.round((weekAssignmentsCompleted / weekAssignmentsTotal) * 100)
        : 0;

    // Coach notes for the week
    const thisWeekCoachNotes = coachNotes.filter(n => {
        if (!n.createdAt) return false;
        const noteDate = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
        return noteDate >= weekAgo;
    });

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
        }}
        onClick={() => setShowWeeklyReportModal(false)}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #E5E5E5',
                    position: 'sticky',
                    top: 0,
                    background: '#FFFFFF',
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="calendar-check" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }}>
                                Weekly Progress Report
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowWeeklyReportModal(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                        </button>
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#666666',
                        marginTop: '8px'
                    }}>
                        Last 7 Days • {new Date(weekAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                    {/* Check-In Summary */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                        borderRadius: '12px',
                        color: '#FFFFFF'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                                Check-In Summary
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Check-In Rate</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekCheckInRate}%
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                                    {weekCheckInCount}/7 days
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Mood</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekAvgMood}
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>out of 10</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Cravings</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekAvgCravings}
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>intensity</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Anxiety</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {weekAvgAnxiety}
                                </div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>level</div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Sleep Quality</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {weekAvgSleep}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>out of 10</div>
                        </div>
                    </div>

                    {/* Reflection Summary */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#F5F5F5',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="book-open" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                Reflection Summary
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Reflections</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekReflectionCount}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Avg Daily Score</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekAvgDailyScore}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Gratitudes</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekGratitudes}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Progress */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#F5F5F5',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="clipboard-check" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                Assignment Progress
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Completed</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekAssignmentsCompleted}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999999' }}>
                                    of {weekAssignmentsTotal} assignments
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Completion Rate</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#058585' }}>
                                    {weekCompletionRate}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streaks */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#F5F5F5',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="flame" style={{ width: '20px', height: '20px', color: '#FF6B6B' }}></i>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                Current Streaks
                            </h4>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Check-In Streak</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B6B' }}>
                                    {checkInStreak}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999999' }}>days</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#666666' }}>Reflection Streak</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B6B' }}>
                                    {reflectionStreak}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999999' }}>days</div>
                            </div>
                        </div>
                    </div>

                    {/* Coach Notes */}
                    {thisWeekCoachNotes.length > 0 ? (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: '#FFF9E6',
                            borderRadius: '12px',
                            border: '1px solid #FFE066'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '12px'
                            }}>
                                <i data-lucide="message-circle" style={{ width: '20px', height: '20px', color: '#F59E0B' }}></i>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                                    Coach Notes This Week
                                </h4>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>
                                {thisWeekCoachNotes.length} note{thisWeekCoachNotes.length !== 1 ? 's' : ''} from your coach
                            </div>
                            {thisWeekCoachNotes.slice(0, 3).map((note, index) => (
                                <div key={note.id || index} style={{
                                    padding: '10px',
                                    background: '#FFFFFF',
                                    borderRadius: '8px',
                                    marginBottom: index < Math.min(2, thisWeekCoachNotes.length - 1) ? '8px' : 0,
                                    border: '1px solid #E5E5E5'
                                }}>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#999999',
                                        marginBottom: '4px'
                                    }}>
                                        {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#000000',
                                        lineHeight: '1.4'
                                    }}>
                                        {note.note?.substring(0, 100)}{note.note?.length > 100 ? '...' : ''}
                                    </div>
                                </div>
                            ))}
                            {thisWeekCoachNotes.length > 3 && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#058585',
                                    marginTop: '8px',
                                    textAlign: 'center'
                                }}>
                                    + {thisWeekCoachNotes.length - 3} more note{thisWeekCoachNotes.length - 3 !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: '#F5F5F5',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <i data-lucide="message-circle" style={{ width: '32px', height: '32px', color: '#CCCCCC', marginBottom: '8px' }}></i>
                            <div style={{ fontSize: '14px', color: '#999999' }}>
                                No coach notes this week
                            </div>
                        </div>
                    )}

                    {/* Summary Message */}
                    <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#2E7D32',
                            marginBottom: '8px'
                        }}>
                            {weekCheckInRate >= 85 && weekReflectionCount >= 5 ? 'Outstanding Week!' :
                             weekCheckInRate >= 70 && weekReflectionCount >= 3 ? 'Great Progress!' :
                             weekCheckInRate >= 50 ? 'Keep Going!' : 'You\'ve Got This!'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#1B5E20',
                            lineHeight: '1.5'
                        }}>
                            {weekCheckInRate >= 85 && weekReflectionCount >= 5 ?
                                'You\'re crushing it! Your consistency is inspiring.' :
                             weekCheckInRate >= 70 && weekReflectionCount >= 3 ?
                                'You\'re making excellent progress. Keep up the momentum!' :
                             weekCheckInRate >= 50 ?
                                'You\'re building great habits. Every day counts!' :
                                'Remember, progress isn\'t always linear. We\'re here to support you.'}
                        </div>
                    </div>

                    {/* Export/Share Button */}
                    <button
                        onClick={async () => {
                            try {
                                const reportText = `Weekly Progress Report\nLast 7 Days\n\nCheck-In Summary:\n- Check-In Rate: ${weekCheckInRate}% (${weekCheckInCount}/7 days)\n- Avg Mood: ${weekAvgMood}/10\n- Avg Cravings: ${weekAvgCravings}/10\n- Avg Anxiety: ${weekAvgAnxiety}/10\n- Avg Sleep Quality: ${weekAvgSleep}/10\n\nReflection Summary:\n- Reflections: ${weekReflectionCount}\n- Avg Daily Score: ${weekAvgDailyScore}/10\n- Gratitudes: ${weekGratitudes}\n\nAssignment Progress:\n- Completed: ${weekAssignmentsCompleted}/${weekAssignmentsTotal}\n- Completion Rate: ${weekCompletionRate}%\n\nCurrent Streaks:\n- Check-In Streak: ${checkInStreak} days\n- Reflection Streak: ${reflectionStreak} days`;

                                if (navigator.share) {
                                    await navigator.share({
                                        title: 'Weekly Progress Report',
                                        text: reportText
                                    });
                                } else {
                                    // Fallback: copy to clipboard
                                    await navigator.clipboard.writeText(reportText);
                                    alert('Report copied to clipboard!');
                                }
                            } catch (error) {
                                if (error.name !== 'AbortError') {
                                    console.error('Share/export error:', error);
                                    alert('Unable to share report. Please try again.');
                                }
                            }
                        }}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i data-lucide="share-2" style={{ width: '20px', height: '20px' }}></i>
                        Export / Share Report
                    </button>
                </div>
            </div>
        </div>
    );
})()}

{/* 2. Streak Calendar Modal */}
{showStreakModal && (
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
    }}
    onClick={() => setShowStreakModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Check-In Streak
                    </h3>
                    <button
                        onClick={() => setShowStreakModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Back Button */}
                <button
                    onClick={() => setShowStreakModal(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: '#058585',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        padding: 0
                    }}
                >
                    <i data-lucide="arrow-left" style={{ width: '20px', height: '20px' }}></i>
                    Back to Check-In
                </button>

                {/* Current Streak Summary */}
                <div style={{
                    background: '#E0F7FA',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#058585',
                        marginBottom: '4px'
                    }}>
                        {checkInStreak} {checkInStreak === 1 ? 'Day' : 'Days'}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#666666'
                    }}>
                        Current Streak
                    </div>
                </div>

                {/* All Check-Ins List */}
                <div style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    All Check-Ins in Streak
                </div>

                {/* Check-In Items - Vertical List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {streakCheckIns.length > 0 ? streakCheckIns.map((checkIn, index) => {
                        const checkInDate = checkIn.createdAt?.toDate ?
                            checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                        const dateStr = checkInDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });

                        // Get morning data (primary source for scores)
                        const mood = checkIn.morningData?.mood ?? checkIn.eveningData?.mood ?? 'N/A';
                        const craving = checkIn.morningData?.craving ?? checkIn.eveningData?.craving ?? 'N/A';
                        const anxiety = checkIn.morningData?.anxiety ?? checkIn.eveningData?.anxiety ?? 'N/A';
                        const sleep = checkIn.morningData?.sleep ?? checkIn.eveningData?.sleep ?? 'N/A';

                        return (
                            <div
                                key={checkIn.id}
                                style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                            >
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    marginBottom: '6px'
                                }}>
                                    Day {streakCheckIns.length - index} - {dateStr}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <span>Mood: {mood}</span>
                                    <span>Craving: {craving}</span>
                                    <span>Anxiety: {anxiety}</span>
                                    <span>Sleep: {sleep}</span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#999999',
                            fontSize: '14px'
                        }}>
                            No check-ins in streak yet. Start checking in daily to build your streak!
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
)}

{/* Calendar Heatmap Modal - 365-day check-in visualization */}
{showCalendarHeatmapModal && (
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
    }}
    onClick={() => {
        setShowCalendarHeatmapModal(false);
        setSelectedCalendarDay(null);
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                position: 'sticky',
                top: 0,
                background: '#FFFFFF',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i data-lucide="calendar" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#000000'
                        }}>
                            Check-In Calendar
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            setShowCalendarHeatmapModal(false);
                            setSelectedCalendarDay(null);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>

                {/* View Mode Toggle */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '15px'
                }}>
                    {['week', 'month'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => {
                                triggerHaptic('light');
                                setCalendarViewMode(mode);
                                setSelectedCalendarDay(null);
                            }}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: calendarViewMode === mode ? '2px solid #058585' : '1px solid #E5E5E5',
                                background: calendarViewMode === mode ? 'rgba(5, 133, 133, 0.1)' : '#FFFFFF',
                                color: calendarViewMode === mode ? '#058585' : '#666666',
                                fontSize: '14px',
                                fontWeight: calendarViewMode === mode ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <i data-lucide={mode === 'week' ? 'calendar-days' : 'calendar'}
                               style={{ width: '16px', height: '16px' }}></i>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Month Navigation */}
                {calendarViewMode === 'month' && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: '#F8F9FA',
                        borderRadius: '8px'
                    }}>
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                const newMonth = new Date(calendarCurrentMonth);
                                newMonth.setMonth(newMonth.getMonth() - 1);
                                setCalendarCurrentMonth(newMonth);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#000000'
                        }}>
                            {calendarCurrentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>

                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                const newMonth = new Date(calendarCurrentMonth);
                                newMonth.setMonth(newMonth.getMonth() + 1);
                                setCalendarCurrentMonth(newMonth);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                )}

                {/* Week Navigation */}
                {calendarViewMode === 'week' && (() => {
                    // Get Monday as start of week (ISO 8601 standard)
                    const getMonday = (d) => {
                        const date = new Date(d);
                        const day = date.getDay();
                        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                        return new Date(date.setDate(diff));
                    };

                    const monday = getMonday(calendarCurrentWeek);
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);

                    return (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: '#F8F9FA',
                            borderRadius: '8px'
                        }}>
                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    const newWeek = new Date(calendarCurrentWeek);
                                    newWeek.setDate(newWeek.getDate() - 7);
                                    setCalendarCurrentWeek(newWeek);
                                    setSelectedCalendarDay(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                {monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>

                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    const newWeek = new Date(calendarCurrentWeek);
                                    newWeek.setDate(newWeek.getDate() + 7);
                                    setCalendarCurrentWeek(newWeek);
                                    setSelectedCalendarDay(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#058585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    );
                })()}

                {/* Jump to Today Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        const today = new Date();
                        setCalendarCurrentMonth(today);
                        setCalendarCurrentWeek(today);
                        setSelectedCalendarDay(null);
                    }}
                    style={{
                        width: '100%',
                        marginTop: '12px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #058585',
                        background: '#FFFFFF',
                        color: '#058585',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <i data-lucide="calendar-check" style={{ width: '16px', height: '16px' }}></i>
                    Jump to Today
                </button>

                {/* Legend */}
                <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    border: '1px solid #E5E5E5'
                }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#000000',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i data-lucide="info" style={{ width: '16px', height: '16px', color: '#058585' }}></i>
                        Daily Check-In Status
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#00A86B', flexShrink: 0 }}></div>
                            <span style={{ fontSize: '12px', color: '#666666' }}>
                                Morning & Evening Check-Ins Completed
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#7FD4AA', flexShrink: 0 }}></div>
                            <span style={{ fontSize: '12px', color: '#666666' }}>
                                Only Morning OR Evening Completed
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#E5E5E5', flexShrink: 0 }}></div>
                            <span style={{ fontSize: '12px', color: '#666666' }}>
                                No Check-Ins Completed
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div style={{ padding: '20px' }}>
                {(() => {
                    // Get user's timezone
                    const userTimezone = user.timezone || "America/Los_Angeles";

                    // Helper function to get color based on check-in count
                    const getColorForCount = (count) => {
                        if (count >= 2) return '#00A86B'; // Dark green - both check-ins
                        if (count === 1) return '#7FD4AA'; // Light green - one check-in
                        return '#E5E5E5'; // Gray - no check-in
                    };

                    // Generate calendar data for the selected view mode
                    if (calendarViewMode === 'month') {
                        // Month view - Calendar grid for current month
                        const year = calendarCurrentMonth.getFullYear();
                        const month = calendarCurrentMonth.getMonth();

                        // Get first day of month and how many days in month
                        const firstDayOfMonth = new Date(year, month, 1);
                        const lastDayOfMonth = new Date(year, month + 1, 0);
                        const daysInMonth = lastDayOfMonth.getDate();
                        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

                        // Build calendar grid
                        const calendarDays = [];

                        // Add empty cells for days before month starts
                        for (let i = 0; i < startingDayOfWeek; i++) {
                            calendarDays.push(null);
                        }

                        // Add all days in month
                        for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(year, month, day);
                            const dateKey = date.toISOString().split('T')[0];
                            const dayData = calendarHeatmapData.find(d => d.dateKey === dateKey);

                            calendarDays.push({
                                date: date,
                                dateKey: dateKey,
                                day: day,
                                count: dayData ? dayData.count : 0,
                                data: dayData
                            });
                        }

                        // Group into weeks
                        const weeks = [];
                        for (let i = 0; i < calendarDays.length; i += 7) {
                            weeks.push(calendarDays.slice(i, i + 7));
                        }

                        return (
                            <div>
                                {/* Weekday headers */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '8px',
                                    marginBottom: '12px',
                                    paddingBottom: '8px',
                                    borderBottom: '2px solid #E5E5E5'
                                }}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                        <div key={i} style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#666666',
                                            textAlign: 'center'
                                        }}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(7, 1fr)',
                                            gap: '8px'
                                        }}>
                                            {week.map((day, dayIndex) => {
                                                if (!day) {
                                                    return <div key={dayIndex} style={{ aspectRatio: '1' }}></div>;
                                                }

                                                const isToday = day.dateKey === new Date().toISOString().split('T')[0];
                                                const isSelected = selectedCalendarDay?.dateKey === day.dateKey;

                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        onClick={() => {
                                                            if (day.data) {
                                                                triggerHaptic('light');
                                                                setSelectedCalendarDay(day);
                                                            }
                                                        }}
                                                        style={{
                                                            aspectRatio: '1',
                                                            borderRadius: '8px',
                                                            background: getColorForCount(day.count),
                                                            border: isToday ? '3px solid #FF8C00' : (isSelected ? '3px solid #058585' : '1px solid #DDD'),
                                                            cursor: day.data ? 'pointer' : 'default',
                                                            transition: 'all 0.2s',
                                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                                            boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {/* Day number */}
                                                        <span style={{
                                                            fontSize: '14px',
                                                            fontWeight: isToday ? '700' : '500',
                                                            color: day.count > 0 ? '#FFFFFF' : '#999999'
                                                        }}>
                                                            {day.day}
                                                        </span>

                                                        {/* Indicator dots for check-ins */}
                                                        {day.data && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '4px',
                                                                display: 'flex',
                                                                gap: '2px'
                                                            }}>
                                                                {day.data.morningCheckIn && (
                                                                    <div style={{
                                                                        width: '4px',
                                                                        height: '4px',
                                                                        borderRadius: '50%',
                                                                        background: '#FFFFFF'
                                                                    }}></div>
                                                                )}
                                                                {day.data.eveningCheckIn && (
                                                                    <div style={{
                                                                        width: '4px',
                                                                        height: '4px',
                                                                        borderRadius: '50%',
                                                                        background: '#FFFFFF'
                                                                    }}></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Selected Day Details */}
                                {selectedCalendarDay && selectedCalendarDay.data && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
                                        borderRadius: '12px',
                                        border: '2px solid #058585',
                                        animation: 'fadeIn 0.3s'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '16px'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#000000',
                                                    marginBottom: '4px'
                                                }}>
                                                    {selectedCalendarDay.date.toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#666666',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <i data-lucide="check-circle" style={{ width: '14px', height: '14px', color: '#00A86B' }}></i>
                                                    {selectedCalendarDay.count} check-in{selectedCalendarDay.count !== 1 ? 's' : ''} completed
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedCalendarDay(null)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px'
                                                }}
                                            >
                                                <i data-lucide="x" style={{ width: '18px', height: '18px', color: '#666666' }}></i>
                                            </button>
                                        </div>

                                        {/* Morning Check-In */}
                                        {selectedCalendarDay.data.morningCheckIn && (
                                            <div style={{
                                                marginBottom: selectedCalendarDay.data.eveningCheckIn ? '16px' : '0',
                                                padding: '15px',
                                                background: '#FFFFFF',
                                                borderRadius: '8px',
                                                border: '1px solid #E5E5E5'
                                            }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#058585',
                                                    marginBottom: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <i data-lucide="sunrise" style={{ width: '16px', height: '16px' }}></i>
                                                    Morning Check-In
                                                </div>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i data-lucide="smile" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                        <span style={{ fontSize: '13px', color: '#666666' }}>
                                                            Mood: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.mood ?? 'N/A'}</strong>
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i data-lucide="flame" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                        <span style={{ fontSize: '13px', color: '#666666' }}>
                                                            Craving: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.craving ?? 'N/A'}</strong>
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i data-lucide="alert-circle" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                        <span style={{ fontSize: '13px', color: '#666666' }}>
                                                            Anxiety: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.anxiety ?? 'N/A'}</strong>
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i data-lucide="moon" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                                        <span style={{ fontSize: '13px', color: '#666666' }}>
                                                            Sleep: <strong style={{ color: '#000000' }}>{selectedCalendarDay.data.morningCheckIn.sleep ?? 'N/A'}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Evening Check-In */}
                                        {selectedCalendarDay.data.eveningCheckIn && (
                                            <div style={{
                                                padding: '15px',
                                                background: '#FFFFFF',
                                                borderRadius: '8px',
                                                border: '1px solid #E5E5E5'
                                            }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#058585',
                                                    marginBottom: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <i data-lucide="sunset" style={{ width: '16px', height: '16px' }}></i>
                                                    Evening Check-In
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#666666',
                                                    lineHeight: '1.6'
                                                }}>
                                                    {/* Overall Day Score */}
                                                    {selectedCalendarDay.data.eveningCheckIn.overallDay !== undefined && (
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <strong>Overall Day:</strong> {selectedCalendarDay.data.eveningCheckIn.overallDay}/10
                                                        </div>
                                                    )}

                                                    {/* Gratitude */}
                                                    {selectedCalendarDay.data.eveningCheckIn.gratitude && (
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <strong>Gratitude:</strong> {selectedCalendarDay.data.eveningCheckIn.gratitude}
                                                        </div>
                                                    )}

                                                    {/* Challenges */}
                                                    {selectedCalendarDay.data.eveningCheckIn.challenges && (
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <strong>Challenges:</strong> {selectedCalendarDay.data.eveningCheckIn.challenges}
                                                        </div>
                                                    )}

                                                    {/* Tomorrow's Goal */}
                                                    {selectedCalendarDay.data.eveningCheckIn.tomorrowGoal && (
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <strong>Tomorrow's Goal:</strong> {selectedCalendarDay.data.eveningCheckIn.tomorrowGoal}
                                                        </div>
                                                    )}

                                                    {/* Prompt Response (if exists) */}
                                                    {selectedCalendarDay.data.eveningCheckIn.promptResponse && (
                                                        <div>
                                                            <strong>Reflection:</strong> {selectedCalendarDay.data.eveningCheckIn.promptResponse}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        // Week view - Monday to Sunday
                        // Get Monday as start of week (ISO 8601 standard)
                        const getMonday = (d) => {
                            const date = new Date(d);
                            const day = date.getDay();
                            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                            return new Date(date.setDate(diff));
                        };

                        const monday = getMonday(calendarCurrentWeek);

                        // Generate 7 days for the week (Monday to Sunday)
                        const weekDays = [];
                        for (let i = 0; i < 7; i++) {
                            const date = new Date(monday);
                            date.setDate(monday.getDate() + i);

                            // Create dateKey the same way we do in loadCalendarHeatmapData
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateKey = `${year}-${month}-${day}`;

                            const dayData = calendarHeatmapData.find(d => d.dateKey === dateKey);

                            weekDays.push({
                                date: date,
                                dateKey: dateKey,
                                day: date.getDate(),
                                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                                count: dayData ? dayData.count : 0,
                                data: dayData
                            });
                        }

                        return (
                            <div>
                                {/* Week summary header */}
                                <div style={{
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(5, 133, 133, 0.2)'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#000000',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <i data-lucide="calendar-days" style={{ width: '16px', height: '16px', color: '#058585' }}></i>
                                        {weekDays[0].date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#666666'
                                    }}>
                                        {(() => {
                                            // Calculate how many days to count based on current week
                                            const today = new Date();
                                            const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                                            // Check if today falls within this week
                                            const isCurrentWeek = weekDays.some(d => d.dateKey === todayDateKey);

                                            let totalDays = 7;
                                            if (isCurrentWeek) {
                                                // Find which day of the week today is (0 = Monday, 6 = Sunday)
                                                const todayIndex = weekDays.findIndex(d => d.dateKey === todayDateKey);
                                                totalDays = todayIndex + 1; // +1 because index is 0-based
                                            }

                                            const daysWithCheckIns = weekDays.slice(0, totalDays).filter(d => d.count > 0).length;
                                            return `${daysWithCheckIns} out of ${totalDays} days with check-ins`;
                                        })()}
                                    </div>
                                </div>

                                {/* Week days - Large cards */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    {weekDays.map((day, dayIndex) => {
                                        const isToday = day.dateKey === new Date().toISOString().split('T')[0];
                                        const isSelected = selectedCalendarDay?.dateKey === day.dateKey;

                                        return (
                                            <div
                                                key={dayIndex}
                                                onClick={() => {
                                                    if (day.data) {
                                                        triggerHaptic('light');
                                                        setSelectedCalendarDay(day);
                                                    }
                                                }}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    background: getColorForCount(day.count),
                                                    border: isToday ? '3px solid #FF8C00' : (isSelected ? '3px solid #058585' : '2px solid #E5E5E5'),
                                                    cursor: day.data ? 'pointer' : 'default',
                                                    transition: 'all 0.2s',
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                    boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <div style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '8px',
                                                            background: day.count > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '1px solid rgba(255,255,255,0.5)'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                color: day.count > 0 ? '#FFFFFF' : '#999999'
                                                            }}>
                                                                {day.dayName.toUpperCase()}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '18px',
                                                                fontWeight: '700',
                                                                color: day.count > 0 ? '#FFFFFF' : '#999999'
                                                            }}>
                                                                {day.day}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div style={{
                                                                fontSize: '15px',
                                                                fontWeight: '600',
                                                                color: day.count > 0 ? '#FFFFFF' : '#000000',
                                                                marginBottom: '4px'
                                                            }}>
                                                                {isToday && <span style={{ marginRight: '6px' }}>(Today)</span>}
                                                                {day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                color: day.count > 0 ? 'rgba(255,255,255,0.9)' : '#666666',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}>
                                                                {day.count === 0 && (
                                                                    <>
                                                                        <i data-lucide="x-circle" style={{ width: '14px', height: '14px' }}></i>
                                                                        No check-ins
                                                                    </>
                                                                )}
                                                                {day.count === 1 && (
                                                                    <>
                                                                        <i data-lucide="check" style={{ width: '14px', height: '14px' }}></i>
                                                                        1 check-in completed
                                                                    </>
                                                                )}
                                                                {day.count === 2 && (
                                                                    <>
                                                                        <i data-lucide="check-check" style={{ width: '14px', height: '14px' }}></i>
                                                                        Both check-ins completed
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Check-in indicators */}
                                                    {day.data && (
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '8px'
                                                        }}>
                                                            {day.data.morningCheckIn && (
                                                                <div style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    background: 'rgba(255,255,255,0.3)',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600',
                                                                    color: '#FFFFFF',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <i data-lucide="sunrise" style={{ width: '12px', height: '12px' }}></i>
                                                                    AM
                                                                </div>
                                                            )}
                                                            {day.data.eveningCheckIn && (
                                                                <div style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    background: 'rgba(255,255,255,0.3)',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600',
                                                                    color: '#FFFFFF',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <i data-lucide="sunset" style={{ width: '12px', height: '12px' }}></i>
                                                                    PM
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expanded details when selected */}
                                                {isSelected && day.data && (
                                                    <div style={{
                                                        marginTop: '16px',
                                                        paddingTop: '16px',
                                                        borderTop: '1px solid rgba(255,255,255,0.3)'
                                                    }}>
                                                        {/* Morning Check-In */}
                                                        {day.data.morningCheckIn && (
                                                            <div style={{
                                                                marginBottom: day.data.eveningCheckIn ? '12px' : '0',
                                                                padding: '12px',
                                                                background: 'rgba(255,255,255,0.2)',
                                                                borderRadius: '8px'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    color: '#FFFFFF',
                                                                    marginBottom: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}>
                                                                    <i data-lucide="sunrise" style={{ width: '14px', height: '14px' }}></i>
                                                                    Morning Check-In
                                                                </div>
                                                                <div style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                                                    gap: '8px',
                                                                    fontSize: '12px',
                                                                    color: 'rgba(255,255,255,0.9)'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <i data-lucide="smile" style={{ width: '12px', height: '12px' }}></i>
                                                                        Mood: <strong>{day.data.morningCheckIn.mood ?? 'N/A'}</strong>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <i data-lucide="flame" style={{ width: '12px', height: '12px' }}></i>
                                                                        Craving: <strong>{day.data.morningCheckIn.craving ?? 'N/A'}</strong>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <i data-lucide="alert-circle" style={{ width: '12px', height: '12px' }}></i>
                                                                        Anxiety: <strong>{day.data.morningCheckIn.anxiety ?? 'N/A'}</strong>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <i data-lucide="moon" style={{ width: '12px', height: '12px' }}></i>
                                                                        Sleep: <strong>{day.data.morningCheckIn.sleep ?? 'N/A'}</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Evening Check-In */}
                                                        {day.data.eveningCheckIn && (
                                                            <div style={{
                                                                padding: '12px',
                                                                background: 'rgba(255,255,255,0.2)',
                                                                borderRadius: '8px'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    color: '#FFFFFF',
                                                                    marginBottom: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}>
                                                                    <i data-lucide="sunset" style={{ width: '14px', height: '14px' }}></i>
                                                                    Evening Check-In
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '12px',
                                                                    color: 'rgba(255,255,255,0.9)',
                                                                    lineHeight: '1.5'
                                                                }}>
                                                                    {/* Overall Day Score */}
                                                                    {day.data.eveningCheckIn.overallDay !== undefined && (
                                                                        <div style={{ marginBottom: '6px' }}>
                                                                            <strong>Overall Day:</strong> {day.data.eveningCheckIn.overallDay}/10
                                                                        </div>
                                                                    )}

                                                                    {/* Gratitude */}
                                                                    {day.data.eveningCheckIn.gratitude && (
                                                                        <div style={{ marginBottom: '6px' }}>
                                                                            <strong>Gratitude:</strong> {day.data.eveningCheckIn.gratitude}
                                                                        </div>
                                                                    )}

                                                                    {/* Challenges */}
                                                                    {day.data.eveningCheckIn.challenges && (
                                                                        <div style={{ marginBottom: '6px' }}>
                                                                            <strong>Challenges:</strong> {day.data.eveningCheckIn.challenges}
                                                                        </div>
                                                                    )}

                                                                    {/* Tomorrow's Goal */}
                                                                    {day.data.eveningCheckIn.tomorrowGoal && (
                                                                        <div style={{ marginBottom: '6px' }}>
                                                                            <strong>Tomorrow's Goal:</strong> {day.data.eveningCheckIn.tomorrowGoal}
                                                                        </div>
                                                                    )}

                                                                    {/* Prompt Response (if exists) */}
                                                                    {day.data.eveningCheckIn.promptResponse && (
                                                                        <div>
                                                                            <strong>Reflection:</strong> {day.data.eveningCheckIn.promptResponse}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    </div>
)}

{/* 3. Reflection Streak Detail Modal */}
{showReflectionStreakModal && (
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
    }}
    onClick={() => setShowReflectionStreakModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Reflection Streak
                    </h3>
                    <button
                        onClick={() => setShowReflectionStreakModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Back Button */}
                <button
                    onClick={() => setShowReflectionStreakModal(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: '#058585',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        padding: 0
                    }}
                >
                    <i data-lucide="arrow-left" style={{ width: '20px', height: '20px' }}></i>
                    Back to Reflections
                </button>

                {/* Current Streak Summary */}
                <div style={{
                    background: '#E0F7FA',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#058585',
                        marginBottom: '4px'
                    }}>
                        {reflectionStreak} {reflectionStreak === 1 ? 'Day' : 'Days'}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#666666'
                    }}>
                        Current Streak
                    </div>
                </div>

                {/* All Reflections List */}
                <div style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    All Reflections in Streak
                </div>

                {/* Reflection Items - Vertical List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {streakReflections.length > 0 ? streakReflections.map((reflection, index) => {
                        const reflectionDate = reflection.createdAt?.toDate ?
                            reflection.createdAt.toDate() : new Date(reflection.createdAt);
                        const dateStr = reflectionDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });

                        const overallDay = reflection.overallDay ?? reflection.dailyScore ?? 'N/A';
                        const hasGratitude = reflection.gratitude && reflection.gratitude.length > 0;

                        // Score color coding
                        const scoreColor = overallDay >= 8 ? '#4CAF50' :
                                          overallDay >= 6 ? '#FFA726' :
                                          overallDay >= 4 ? '#FF7043' :
                                          overallDay !== 'N/A' ? '#DC143C' : '#999999';

                        return (
                            <div
                                key={reflection.id}
                                style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        Day {streakReflections.length - index} - {dateStr}
                                    </div>
                                    {hasGratitude && (
                                        <i data-lucide="heart" style={{
                                            width: '16px',
                                            height: '16px',
                                            color: '#FF6B6B'
                                        }}></i>
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <i data-lucide="smile" style={{
                                        width: '16px',
                                        height: '16px',
                                        color: scoreColor
                                    }}></i>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: scoreColor
                                    }}>
                                        Overall Day Score: {overallDay}{overallDay !== 'N/A' ? '/10' : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#999999',
                            fontSize: '14px'
                        }}>
                            No reflections in streak yet. Start reflecting daily to build your streak!
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
)}

{/* 4. Mood Insights Modal */}
{showMoodInsightsModal && (
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
    }}
    onClick={() => setShowMoodInsightsModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Mood Insights
                    </h3>
                    <button
                        onClick={() => setShowMoodInsightsModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Average Mood */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#666666',
                        marginBottom: '8px'
                    }}>
                        7-Day Average
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#058585',
                        marginBottom: '4px'
                    }}>
                        {moodWeekData.thisWeekAvg || '—'}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: moodWeekData.difference > 0 ? '#00A86B' : moodWeekData.difference < 0 ? '#DC143C' : '#666666'
                    }}>
                        {moodWeekData.difference > 0 ? '↑' : moodWeekData.difference < 0 ? '↓' : '—'} {moodWeekData.difference > 0 ? '+' : ''}{moodWeekData.difference || '0'} from last week
                    </div>
                </div>

                {/* Weekly Breakdown */}
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Weekly Breakdown
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {moodWeekData.weekData && moodWeekData.weekData.map((dayData, index) => {
                        const score = dayData.mood;
                        const barWidth = score ? (score / 10) * 100 : 0; // Out of 10, not 5!

                        return (
                            <div key={dayData.dateKey} style={{
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '400',
                                        color: '#000000'
                                    }}>
                                        {dayData.dayName}
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: score ? '#058585' : '#999999'
                                    }}>
                                        {score ? score.toFixed(1) : 'No check-in'}
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: '#E5E5E5',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${barWidth}%`,
                                        height: '100%',
                                        background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowMoodInsightsModal(false);
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}

{/* Overall Day Insights Modal */}
{showOverallDayInsightsModal && (
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
    }}
    onClick={() => setShowOverallDayInsightsModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        Overall Day Insights
                    </h3>
                    <button
                        onClick={() => setShowOverallDayInsightsModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Average Overall Day Score */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: '#666666',
                        marginBottom: '8px'
                    }}>
                        7-Day Average
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#058585',
                        marginBottom: '4px'
                    }}>
                        {overallDayWeekData.thisWeekAvg || '—'}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '400',
                        color: overallDayWeekData.difference > 0 ? '#00A86B' : overallDayWeekData.difference < 0 ? '#DC143C' : '#666666'
                    }}>
                        {overallDayWeekData.difference > 0 ? '↑' : overallDayWeekData.difference < 0 ? '↓' : '—'} {overallDayWeekData.difference > 0 ? '+' : ''}{overallDayWeekData.difference || '0'} from last week
                    </div>
                </div>

                {/* Weekly Breakdown */}
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px'
                }}>
                    Last 7 Reflections
                </h4>
                <div style={{ marginBottom: '20px' }}>
                    {overallDayWeekData.weekData && overallDayWeekData.weekData.map((dayData, index) => {
                        const score = dayData.overallDay;
                        const barWidth = score ? (score / 10) * 100 : 0; // Out of 10

                        return (
                            <div key={dayData.dateKey} style={{
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '4px'
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#000000'
                                        }}>
                                            {dayData.dayName}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#666666'
                                        }}>
                                            {dayData.date ? new Date(dayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#058585'
                                    }}>
                                        {score ? score.toFixed(1) : '—'}
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: '#E5E5E5',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${barWidth}%`,
                                        height: '100%',
                                        background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowOverallDayInsightsModal(false);
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}

{/* Gratitude Themes Modal */}
{showGratitudeThemesModal && (
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
    }}
    onClick={() => setShowGratitudeThemesModal(false)}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#000000'
                    }}>
                        💚 Gratitude Themes
                    </h3>
                    <button
                        onClick={() => setShowGratitudeThemesModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                <p style={{
                    fontSize: '14px',
                    color: '#666666',
                    marginBottom: '20px'
                }}>
                    The most common themes from your gratitude reflections, ranked by frequency.
                </p>

                {/* Themes List */}
                {reflectionStats.gratitudeThemes && reflectionStats.gratitudeThemes.length > 0 ? (
                    <div style={{ marginBottom: '20px' }}>
                        {reflectionStats.gratitudeThemes.map((theme, index) => {
                            const maxCount = reflectionStats.gratitudeThemes[0].count;
                            const barWidth = (theme.count / maxCount) * 100;

                            return (
                                <div key={index} style={{
                                    marginBottom: '16px',
                                    padding: '14px',
                                    background: index === 0 ? 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(5,133,133,0.1) 100%)' : '#F8F9FA',
                                    borderRadius: '10px',
                                    border: index === 0 ? '2px solid #00A86B' : '1px solid #E5E5E5'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                color: '#666666',
                                                minWidth: '30px'
                                            }}>
                                                {index + 1}.
                                            </span>
                                            <span style={{
                                                fontSize: '16px',
                                                fontWeight: index === 0 ? 'bold' : '400',
                                                color: '#000000'
                                            }}>
                                                {theme.theme}
                                            </span>
                                            {index === 0 && <span style={{ fontSize: '16px' }}>⭐</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {theme.percentage && (
                                                <div style={{
                                                    padding: '4px 12px',
                                                    background: '#00A86B',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: '#FFFFFF'
                                                }}>
                                                    {theme.percentage}%
                                                </div>
                                            )}
                                            <div style={{
                                                padding: '4px 12px',
                                                background: '#058585',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                color: '#FFFFFF'
                                            }}>
                                                {theme.count} {theme.count === 1 ? 'time' : 'times'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{
                                        width: '100%',
                                        height: '6px',
                                        background: '#E5E5E5',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${barWidth}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #00A86B 0%, #058585 100%)',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#999999'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Themes Yet</div>
                        <div>Gratitude themes will appear here after Cloud Functions processes your reflections.</div>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowGratitudeThemesModal(false);
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}

{/* Gratitude Journal Modal */}
{showGratitudeJournalModal && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}
    onClick={() => {
        triggerHaptic('light');
        setShowGratitudeJournalModal(false);
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    Gratitude Journal
                </h3>
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowGratitudeJournalModal(false);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <p style={{
                    fontSize: '14px',
                    color: '#666666',
                    marginBottom: '20px'
                }}>
                    All your gratitude entries from evening reflections.
                </p>

                {/* Gratitude Insights Panel */}
                {gratitudeInsights && gratitudeInsights.computed && (
                    <div style={{
                        background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px',
                        color: '#FFFFFF'
                    }}>
                        <h4 style={{
                            margin: '0 0 16px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            Your Gratitude Insights
                        </h4>

                        {/* Core Values - Top 3 themes by emotional weight */}
                        {gratitudeInsights.computed.topThemes && gratitudeInsights.computed.topThemes.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    opacity: 0.9
                                }}>
                                    Core Values
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    {gratitudeInsights.computed.topThemes.slice(0, 3).map((theme, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            {theme.theme} ({theme.percentage}%)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gratitude Gaps - Categories that need attention */}
                        {gratitudeInsights.computed.gaps && gratitudeInsights.computed.gaps.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    opacity: 0.9
                                }}>
                                    Growth Opportunities
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    lineHeight: '1.5'
                                }}>
                                    {gratitudeInsights.computed.gaps[0].severity === 'high' ? (
                                        <span>Consider reflecting on <strong>{gratitudeInsights.computed.gaps[0].category}</strong> - it's been {gratitudeInsights.computed.gaps[0].daysSinceLast} days since your last mention.</span>
                                    ) : (
                                        <span>You might explore gratitude for <strong>{gratitudeInsights.computed.gaps[0].category}</strong> to deepen your practice.</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Last Computed Timestamp */}
                        {gratitudeInsights.computed.lastComputed && (
                            <div style={{
                                fontSize: '11px',
                                opacity: 0.7,
                                marginTop: '12px'
                            }}>
                                Insights updated {new Date(gratitudeInsights.computed.lastComputed.toDate()).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                )}

                {/* Gratitude Entries List */}
                {gratitudeJournalData.length > 0 ? (
                    <div style={{ marginBottom: '20px' }}>
                        {gratitudeJournalData.map((entry, index) => (
                            <div key={entry.id} style={{
                                marginBottom: '16px',
                                padding: '16px',
                                background: '#F8F9FA',
                                borderRadius: '12px',
                                border: '1px solid #E5E5E5'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#058585'
                                    }}>
                                        {new Date(entry.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    {entry.overallDay && (
                                        <div style={{
                                            padding: '4px 10px',
                                            background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            color: '#FFFFFF'
                                        }}>
                                            Day: {entry.overallDay}/10
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#333333',
                                    lineHeight: '1.6',
                                    marginBottom: '12px'
                                }}>
                                    {entry.gratitude}
                                </div>
                                <button
                                    onClick={async () => {
                                        if (confirm('Share this gratitude with the community?')) {
                                            const result = await shareToCommunity('gratitude', entry.gratitude, 'checkIns', entry.id);
                                            if (result.success) {
                                                alert('Gratitude shared to community! 🎉');
                                            } else {
                                                alert('Error sharing to community');
                                            }
                                        }
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#058585',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                    Share Gratitude
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#999999'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Gratitude Entries Yet</div>
                        <div>Express gratitude in your evening reflections. Cloud Functions will analyze patterns and reveal your core values to support your recovery.</div>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowGratitudeJournalModal(false);
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}

{/* Challenges History Modal */}
{showChallengesHistoryModal && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}
    onClick={() => {
        triggerHaptic('light');
        setShowChallengesHistoryModal(false);
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    Challenges History
                </h3>
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowChallengesHistoryModal(false);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                <p style={{
                    fontSize: '14px',
                    color: '#666666',
                    marginBottom: '20px'
                }}>
                    Review the challenges you've faced and overcome in your recovery journey.
                </p>

                {/* Cloud Functions Insights Panel */}
                {challengesInsights && challengesInsights.categories && Object.keys(challengesInsights.categories).length > 0 && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #FFF3CD 0%, #FFE6A8 100%)',
                        borderRadius: '15px',
                        border: '2px solid #FFA500'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i data-lucide="brain" style={{ width: '20px', height: '20px', color: '#FFFFFF' }}></i>
                            </div>
                            <div>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#856404'
                                }}>
                                    Challenge Patterns
                                </h4>
                                <p style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    color: '#856404',
                                    opacity: 0.8
                                }}>
                                    Analyzed by Cloud Functions
                                </p>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#856404',
                                marginBottom: '12px'
                            }}>
                                Challenge Categories
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(challengesInsights.categories)
                                    .sort((a, b) => b[1].count - a[1].count)
                                    .slice(0, 5)
                                    .map(([category, data]) => (
                                        <div key={category} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px',
                                            background: '#FFFFFF',
                                            borderRadius: '8px',
                                            border: '1px solid #FFE6A8'
                                        }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#333333',
                                                textTransform: 'capitalize'
                                            }}>
                                                {category.replace(/_/g, ' ')}
                                            </div>
                                            <div style={{
                                                padding: '4px 12px',
                                                background: '#FF8C00',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                color: '#FFFFFF'
                                            }}>
                                                {data.count} {data.count === 1 ? 'time' : 'times'}
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {challengesInsights.totalChallenges && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                                    borderRadius: '8px',
                                    border: '1px solid #FFE6A8'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#856404',
                                        marginBottom: '4px'
                                    }}>
                                        Total Challenges Tracked
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#FF8C00'
                                    }}>
                                        {challengesInsights.totalChallenges}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Challenges List */}
                {challengesHistoryData.length > 0 ? (
                    <div style={{ marginBottom: '20px' }}>
                        {challengesHistoryData.map((entry, index) => (
                            <div key={entry.id} style={{
                                marginBottom: '16px',
                                padding: '16px',
                                background: '#FFF3CD',
                                borderRadius: '12px',
                                border: '1px solid #FFA500'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#856404'
                                    }}>
                                        {new Date(entry.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    {entry.overallDay && (
                                        <div style={{
                                            padding: '4px 10px',
                                            background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            color: '#FFFFFF'
                                        }}>
                                            Day: {entry.overallDay}/10
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#333333',
                                    lineHeight: '1.6'
                                }}>
                                    {entry.challenges}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#999999'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Challenges Yet</div>
                        <div>Document your challenges in evening reflections. Cloud Functions will analyze patterns and provide insights to support your recovery.</div>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowChallengesHistoryModal(false);
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}

{/* Challenge Check-In Modal */}
{showChallengeCheckInModal && selectedChallenge && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}
    onClick={() => {
        triggerHaptic('light');
        setShowChallengeCheckInModal(false);
        setSelectedChallenge(null);
        setChallengeCheckInStatus('');
        setChallengeCheckInNotes('');
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    Challenge Check-In
                </h3>
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowChallengeCheckInModal(false);
                        setSelectedChallenge(null);
                        setChallengeCheckInStatus('');
                        setChallengeCheckInNotes('');
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {/* Challenge Text */}
                <div style={{
                    padding: '16px',
                    background: '#FFF3CD',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '1px solid #FFA500'
                }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#856404',
                        marginBottom: '8px'
                    }}>
                        Your Challenge:
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#333333',
                        lineHeight: '1.6'
                    }}>
                        {selectedChallenge.challengeText}
                    </div>
                </div>

                {/* Status Selection */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333333',
                        marginBottom: '12px'
                    }}>
                        How are things going? *
                    </label>

                    <div style={{
                        display: 'grid',
                        gap: '10px'
                    }}>
                        {[
                            { value: 'resolved', label: 'Resolved', color: '#00A86B', desc: 'I overcame this challenge!' },
                            { value: 'better', label: 'Getting Better', color: '#4CAF50', desc: 'Making progress' },
                            { value: 'same', label: 'About the Same', color: '#FFA500', desc: 'No change yet' },
                            { value: 'worse', label: 'Gotten Worse', color: '#FF6B6B', desc: 'Struggling more' },
                            { value: 'help', label: 'Need Help', color: '#DC143C', desc: 'I need support' }
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => {
                                    triggerHaptic('light');
                                    setChallengeCheckInStatus(status.value);
                                }}
                                style={{
                                    padding: '14px',
                                    background: challengeCheckInStatus === status.value ? status.color : '#FFFFFF',
                                    border: `2px solid ${status.color}`,
                                    borderRadius: '12px',
                                    color: challengeCheckInStatus === status.value ? '#FFFFFF' : status.color,
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div>{status.label}</div>
                                    <div style={{
                                        fontSize: '11px',
                                        opacity: challengeCheckInStatus === status.value ? 0.9 : 0.7,
                                        marginTop: '2px'
                                    }}>
                                        {status.desc}
                                    </div>
                                </div>
                                {challengeCheckInStatus === status.value && (
                                    <div style={{ fontSize: '18px' }}>●</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes Field */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333333',
                        marginBottom: '8px'
                    }}>
                        Notes about your progress *
                    </label>
                    <textarea
                        value={challengeCheckInNotes}
                        onChange={(e) => setChallengeCheckInNotes(e.target.value)}
                        placeholder={
                            challengeCheckInStatus === 'resolved' ? 'What helped you overcome this challenge?' :
                            challengeCheckInStatus === 'better' ? 'What strategies are working for you?' :
                            challengeCheckInStatus === 'worse' ? 'What is making this harder right now?' :
                            challengeCheckInStatus === 'help' ? 'What kind of support do you need?' :
                            'Share your thoughts on how you are handling this challenge...'
                        }
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={() => {
                        triggerHaptic('medium');
                        submitChallengeCheckIn();
                    }}
                    disabled={!challengeCheckInStatus || !challengeCheckInNotes.trim()}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: challengeCheckInStatus && challengeCheckInNotes.trim() ? '#058585' : '#CCCCCC',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: challengeCheckInStatus && challengeCheckInNotes.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                >
                    {challengeCheckInStatus === 'resolved' ? '🎉 Mark as Resolved' : '✅ Save Check-In'}
                </button>

                {/* Cancel Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowChallengeCheckInModal(false);
                        setSelectedChallenge(null);
                        setChallengeCheckInStatus('');
                        setChallengeCheckInNotes('');
                    }}
                    style={{
                        width: '100%',
                        height: '48px',
                        background: 'transparent',
                        border: 'none',
                        color: '#666666',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}

{/* Breakthrough Celebration Modal */}
{showBreakthroughModal && breakthroughData && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
        animation: 'fadeIn 0.3s ease-in'
    }}
    onClick={() => {
        triggerHaptic('light');
        setShowBreakthroughModal(false);
        setBreakthroughData(null);
    }}>
        <div style={{
            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            padding: '40px 30px',
            textAlign: 'center',
            color: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0, 168, 107, 0.4)',
            animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Title */}
            <h2 style={{
                margin: '0 0 12px 0',
                fontSize: '28px',
                fontWeight: 'bold'
            }}>
                Breakthrough Moment!
            </h2>

            {/* Subtitle */}
            <p style={{
                fontSize: '16px',
                opacity: 0.9,
                marginBottom: '24px',
                lineHeight: '1.5'
            }}>
                You've overcome a challenge that once held you back.
            </p>

            {/* Challenge Text */}
            {breakthroughData.challengeText && (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        opacity: 0.9
                    }}>
                        Your Challenge:
                    </div>
                    <div style={{
                        fontSize: '15px',
                        lineHeight: '1.6'
                    }}>
                        {breakthroughData.challengeText}
                    </div>
                </div>
            )}

            {/* Days Since Last Mention */}
            {breakthroughData.daysSinceLastMention && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        marginBottom: '4px',
                        opacity: 0.9
                    }}>
                        It's been
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                    }}>
                        {breakthroughData.daysSinceLastMention}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        opacity: 0.9
                    }}>
                        days since you mentioned this challenge
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                marginBottom: '28px',
                fontSize: '15px',
                lineHeight: '1.6',
                fontStyle: 'italic'
            }}>
                "Every challenge you overcome makes you stronger. This breakthrough is proof of your resilience and growth."
            </div>

            {/* Share Button */}
            <button
                onClick={async () => {
                    if (confirm('Share this breakthrough with the community to inspire others?')) {
                        const breakthroughContent = `Breakthrough! Overcame: "${breakthroughData.challengeText}" - ${breakthroughData.daysSinceLastMention} days challenge-free!`;
                        const result = await shareToCommunity('breakthrough', breakthroughContent, 'challenges_tracking', breakthroughData.challengeId || 'unknown');
                        if (result.success) {
                            alert('Breakthrough shared to community! 🎉');
                        } else {
                            alert('Error sharing to community');
                        }
                    }
                }}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid #FFFFFF',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                <i data-lucide="share-2" style={{ width: '20px', height: '20px' }}></i>
                Share Breakthrough
            </button>

            {/* Close Button */}
            <button
                onClick={() => {
                    triggerHaptic('medium');
                    setShowBreakthroughModal(false);
                    setBreakthroughData(null);
                }}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#00A86B',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                ✨ Continue
            </button>
        </div>
    </div>
)}

{/* Goal Achievement Tracker Modal */}
{showTomorrowGoalsModal && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}
    onClick={() => {
        triggerHaptic('light');
        setShowTomorrowGoalsModal(false);
        setGoalStatus('');
        setGoalNotes('');
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    🏆 Goal Achievement Tracker
                </h3>
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowTomorrowGoalsModal(false);
                        setGoalStatus('');
                        setGoalNotes('');
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {/* If there's a yesterday's goal to check in on */}
                {yesterdayGoal ? (
                    <>
                        <p style={{
                            fontSize: '14px',
                            color: '#666666',
                            marginBottom: '20px'
                        }}>
                            Did you accomplish your goal from yesterday?
                        </p>

                        {/* Yesterday's Goal Display */}
                        <div style={{
                            padding: '16px',
                            background: '#E7F5FF',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            border: '1px solid #058585'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#666666',
                                marginBottom: '8px'
                            }}>
                                Yesterday's Goal:
                            </div>
                            <div style={{
                                fontSize: '15px',
                                color: '#333333',
                                lineHeight: '1.6',
                                fontWeight: '500'
                            }}>
                                {yesterdayGoal.goal}
                            </div>
                        </div>

                        {/* Status Options */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#333333',
                                marginBottom: '12px'
                            }}>
                                How did it go? *
                            </label>

                            <div style={{ display: 'grid', gap: '10px' }}>
                                {[
                                    { value: 'yes', label: 'Yes', desc: 'Completed it!', color: '#00A86B' },
                                    { value: 'almost', label: 'Almost', desc: 'Got close', color: '#4CAF50' },
                                    { value: 'partially', label: 'Partially', desc: 'Made progress', color: '#FFA500' },
                                    { value: 'no', label: 'No', desc: 'Didn\'t complete', color: '#FF6B6B' },
                                    { value: 'didnt_try', label: 'Didn\'t Try', desc: 'Couldn\'t attempt', color: '#999999' }
                                ].map(status => (
                                    <button
                                        key={status.value}
                                        onClick={() => {
                                            triggerHaptic('light');
                                            setGoalStatus(status.value);
                                        }}
                                        style={{
                                            padding: '12px',
                                            background: goalStatus === status.value ? status.color : '#FFFFFF',
                                            border: `2px solid ${status.color}`,
                                            borderRadius: '10px',
                                            color: goalStatus === status.value ? '#FFFFFF' : status.color,
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'left',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div>{status.label}</div>
                                            <div style={{
                                                fontSize: '11px',
                                                opacity: goalStatus === status.value ? 0.9 : 0.7,
                                                marginTop: '2px'
                                            }}>
                                                {status.desc}
                                            </div>
                                        </div>
                                        {goalStatus === status.value && (
                                            <div style={{ fontSize: '16px' }}>●</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#333333',
                                marginBottom: '8px'
                            }}>
                                Notes (optional)
                            </label>
                            <textarea
                                value={goalNotes}
                                onChange={(e) => setGoalNotes(e.target.value)}
                                placeholder={
                                    goalStatus === 'yes' ? 'What helped you succeed?' :
                                    goalStatus === 'almost' ? 'What got in the way?' :
                                    goalStatus === 'no' ? 'What prevented you from completing it?' :
                                    'Any thoughts about this goal...'
                                }
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => {
                                triggerHaptic('medium');
                                submitGoalAchievement();
                            }}
                            disabled={!goalStatus}
                            style={{
                                width: '100%',
                                height: '48px',
                                background: goalStatus ? '#058585' : '#CCCCCC',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: goalStatus ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s'
                            }}
                        >
                            {goalStatus === 'yes' ? '🎉 Record Success' : '✅ Record Progress'}
                        </button>
                    </>
                ) : (
                    /* No yesterday's goal - show stats and history */
                    <>
                        <p style={{
                            fontSize: '14px',
                            color: '#666666',
                            marginBottom: '20px'
                        }}>
                            Track your goal completion rate and build your achievement streak!
                        </p>

                        {/* Goal Stats Cards */}
                        {goalStats.totalGoals > 0 ? (
                            <>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '12px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        color: '#FFFFFF'
                                    }}>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {goalStats.completionRate}%
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                            Success Rate
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        color: '#FFFFFF'
                                    }}>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {goalStats.currentStreak}
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                            Current Streak
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        color: '#FFFFFF'
                                    }}>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {goalStats.bestStreak}
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                            Best Streak
                                        </div>
                                    </div>
                                </div>

                                {/* Goal History Timeline */}
                                <h4 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#333'
                                }}>
                                    Recent Goals ({goalStats.totalGoals} total)
                                </h4>

                                <div style={{ marginBottom: '20px' }}>
                                    {goalHistory.slice(0, 10).map((goal, index) => (
                                        <div key={goal.id} style={{
                                            padding: '14px',
                                            marginBottom: '10px',
                                            background: '#F8F9FA',
                                            borderRadius: '10px',
                                            borderLeft: `4px solid ${
                                                goal.status === 'yes' ? '#00A86B' :
                                                goal.status === 'almost' ? '#4CAF50' :
                                                goal.status === 'partially' ? '#FFA500' :
                                                goal.status === 'no' ? '#FF6B6B' : '#999999'
                                            }`
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '6px'
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    fontWeight: '600'
                                                }}>
                                                    {goal.checkedInAt && new Date(goal.checkedInAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: goal.status === 'yes' ? '#00A86B' :
                                                           goal.status === 'almost' ? '#4CAF50' :
                                                           goal.status === 'partially' ? '#FFA500' :
                                                           goal.status === 'no' ? '#FF6B6B' : '#999999'
                                                }}>
                                                    {goal.status === 'yes' ? '✅ Completed' :
                                                     goal.status === 'almost' ? '⚡ Almost' :
                                                     goal.status === 'partially' ? '🟡 Partial' :
                                                     goal.status === 'no' ? '❌ No' : '🤷 Skipped'}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#333',
                                                lineHeight: '1.5'
                                            }}>
                                                {goal.goal}
                                            </div>
                                            {goal.notes && (
                                                <div style={{
                                                    marginTop: '8px',
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Note: {goal.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#999999'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                                <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
                                    No goals tracked yet
                                </div>
                                <div style={{ fontSize: '14px' }}>
                                    Set a goal in your evening reflection and check back tomorrow to record your progress!
                                </div>
                            </div>
                        )}

                        {/* Back Button */}
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                setShowTomorrowGoalsModal(false);
                            }}
                            style={{
                                width: '100%',
                                height: '48px',
                                background: '#058585',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Back
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
)}

135.19 KB •2,419 lines
•
Formatting may be inconsistent from source
 {/* INCOMPLETE TASKS MODAL */}
        {showIncompleteTasksModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#058585'
                        }}>
                            Incomplete Tasks
                        </h2>
                        <div
                            onClick={() => setShowIncompleteTasksModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {/* Morning Check-In Status */}
                        {!checkInStatus.morning && (
                            <div
                                onClick={() => {
                                    setShowIncompleteTasksModal(false);
                                    setActiveTaskTab('checkin');
                                }}
                                style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
                                    borderRadius: '12px',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    border: '2px solid rgba(255, 165, 0, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <i data-lucide="sun" style={{ width: '24px', height: '24px', color: '#FFA500' }}></i>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                                        Morning Check-In
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666666' }}>
                                        Not completed today
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                            </div>
                        )}

                        {/* Evening Reflection Status */}
                        {!checkInStatus.evening && (
                            <div
                                onClick={() => {
                                    setShowIncompleteTasksModal(false);
                                    setActiveTaskTab('reflections');
                                }}
                                style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
                                    borderRadius: '12px',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    border: '2px solid rgba(255, 165, 0, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <i data-lucide="moon" style={{ width: '24px', height: '24px', color: '#FFA500' }}></i>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                                        Evening Reflection
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666666' }}>
                                        Not completed today
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                            </div>
                        )}

                        {/* Incomplete Assignments */}
                        {(() => {
                            const incompleteAssignments = assignments.filter(a => a.status !== 'completed');

                            if (incompleteAssignments.length === 0 && checkInStatus.morning && checkInStatus.evening) {
                                return (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: '#666666'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                            All Caught Up!
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            You have no incomplete tasks
                                        </div>
                                    </div>
                                );
                            }

                            return incompleteAssignments.map(assignment => {
                                const isOverdue = assignment.dueDate && assignment.dueDate.toDate() < new Date();

                                return (
                                    <div
                                        key={assignment.id}
                                        onClick={() => {
                                            setShowIncompleteTasksModal(false);
                                            setActiveTaskTab('golden');
                                        }}
                                        style={{
                                            padding: '16px',
                                            background: isOverdue
                                                ? 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)'
                                                : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                            borderRadius: '12px',
                                            marginBottom: '12px',
                                            cursor: 'pointer',
                                            border: isOverdue
                                                ? '2px solid rgba(220, 20, 60, 0.3)'
                                                : '2px solid rgba(5, 133, 133, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <i data-lucide="clipboard-list" style={{
                                            width: '24px',
                                            height: '24px',
                                            color: isOverdue ? '#DC143C' : '#058585'
                                        }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                                                {assignment.title}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#666666' }}>
                                                {isOverdue ? (
                                                    <span style={{ color: '#DC143C', fontWeight: '600' }}>
                                                        Overdue: {assignment.dueDate.toDate().toLocaleDateString()}
                                                    </span>
                                                ) : assignment.dueDate ? (
                                                    `Due: ${assignment.dueDate.toDate().toLocaleDateString()}`
                                                ) : (
                                                    'No due date'
                                                )}
                                            </div>
                                        </div>
                                        <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: '#666666' }}></i>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>
        )}

        {/* HABIT TRACKER MODAL */}
        {showHabitTrackerModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowHabitTrackerModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#058585',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="repeat" style={{ width: '24px', height: '24px' }}></i>
                            Habit Tracker
                        </h2>
                        <div
                            onClick={() => setShowHabitTrackerModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {!showHabitHistory ? (
                            <>
                                {/* Add New Habit */}
                                <div style={{
                                    marginBottom: '20px',
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '12px'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333333',
                                        marginBottom: '8px'
                                    }}>
                                        Add New Habit
                                    </label>
                                    <input
                                        type="text"
                                        value={newHabitName}
                                        onChange={(e) => setNewHabitName(e.target.value)}
                                        placeholder="e.g., Drink 8 glasses of water"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '15px',
                                            marginBottom: '10px'
                                        }}
                                        onKeyPress={async (e) => {
                                            if (e.key === 'Enter' && newHabitName.trim()) {
                                                try {
                                                    await db.collection('habits').add({
                                                        userId: user.uid,
                                                        name: newHabitName.trim(),
                                                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                    });
                                                    setNewHabitName('');
                                                } catch (error) {
                                                    alert('Error adding habit');
                                                }
                                            }
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={async () => {
                                                if (newHabitName.trim()) {
                                                    try {
                                                        await db.collection('habits').add({
                                                            userId: user.uid,
                                                            name: newHabitName.trim(),
                                                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                        });
                                                        setNewHabitName('');
                                                        alert('Habit added! 🎯');
                                                    } catch (error) {
                                                        alert('Error adding habit');
                                                    }
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px 20px',
                                                background: '#058585',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (newHabitName.trim()) {
                                                    try {
                                                        const docRef = await db.collection('habits').add({
                                                            userId: user.uid,
                                                            name: newHabitName.trim(),
                                                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                        });
                                                        const habitName = newHabitName.trim();
                                                        setNewHabitName('');

                                                        const result = await shareToCommunity('habit_commitment', `Committing to: ${habitName}`, 'habits', docRef.id);
                                                        if (result.success) {
                                                            alert('Habit added and commitment shared to community! 🎯');
                                                        } else {
                                                            alert('Habit added, but error sharing to community');
                                                        }
                                                    } catch (error) {
                                                        alert('Error adding habit');
                                                    }
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                            Add & Share
                                        </button>
                                    </div>
                                </div>

                                {/* Today's Habits */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                            Today's Habits
                                        </h3>
                                        <button
                                            onClick={() => setShowHabitHistory(true)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#f8f9fa',
                                                color: '#058585',
                                                border: '1px solid #058585',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View History
                                        </button>
                                    </div>

                                    {habits.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '30px 20px',
                                            color: '#999999',
                                            fontSize: '14px'
                                        }}>
                                            No habits yet. Add your first habit above!
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {habits.map(habit => {
                                                const isCompleted = todayHabits.some(th => th.habitId === habit.id);

                                                return (
                                                    <div
                                                        key={habit.id}
                                                        style={{
                                                            padding: '12px 15px',
                                                            background: isCompleted ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)' : '#f8f9fa',
                                                            borderRadius: '10px',
                                                            border: isCompleted ? '2px solid rgba(0, 168, 107, 0.3)' : '1px solid #e9ecef',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isCompleted}
                                                            onChange={async () => {
                                                                if (isCompleted) {
                                                                    const completion = todayHabits.find(th => th.habitId === habit.id);
                                                                    if (completion) {
                                                                        await db.collection('habitCompletions').doc(completion.id).delete();
                                                                    }
                                                                } else {
                                                                    await db.collection('habitCompletions').add({
                                                                        userId: user.uid,
                                                                        habitId: habit.id,
                                                                        habitName: habit.name,
                                                                        completedAt: firebase.firestore.FieldValue.serverTimestamp()
                                                                    });
                                                                }
                                                            }}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                        <span style={{
                                                            flex: 1,
                                                            fontSize: '15px',
                                                            color: '#333333',
                                                            textDecoration: isCompleted ? 'line-through' : 'none',
                                                            opacity: isCompleted ? 0.7 : 1
                                                        }}>
                                                            {habit.name}
                                                        </span>
                                                        {isCompleted && (
                                                            <>
                                                                <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#00A86B' }}></i>
                                                                <button
                                                                    onClick={async () => {
                                                                        const completion = todayHabits.find(th => th.habitId === habit.id);
                                                                        if (completion && confirm('Share this habit completion with the community?')) {
                                                                            const result = await shareToCommunity('habit', `Completed: ${habit.name}`, 'habitCompletions', completion.id);
                                                                            if (result.success) {
                                                                                alert('Habit completion shared to community! 🎉');
                                                                            } else {
                                                                                alert('Error sharing to community');
                                                                            }
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        background: '#058585',
                                                                        color: '#fff',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                                                    Share
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* History View */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                        Habit History
                                    </h3>
                                    <button
                                        onClick={() => setShowHabitHistory(false)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#058585',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Back to Today
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {habits.map(habit => {
                                        // Count how many times this habit was completed
                                        const completionCount = todayHabits.filter(th => th.habitId === habit.id).length;

                                        return (
                                            <div
                                                key={habit.id}
                                                style={{
                                                    padding: '12px 15px',
                                                    background: '#f8f9fa',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e9ecef'
                                                }}
                                            >
                                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                                                    {habit.name}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#666666' }}>
                                                    Created: {habit.createdAt ? new Date(habit.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* QUICK REFLECTION MODAL */}
        {showQuickReflectionModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowQuickReflectionModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#058585',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="message-circle" style={{ width: '24px', height: '24px' }}></i>
                            Quick Reflection
                        </h2>
                        <div
                            onClick={() => setShowQuickReflectionModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {!showReflectionHistory ? (
                            <>
                                {/* Add New Reflection */}
                                <div style={{
                                    marginBottom: '20px'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333333',
                                        marginBottom: '8px'
                                    }}>
                                        What's on your mind?
                                    </label>
                                    <textarea
                                        value={newReflection}
                                        onChange={(e) => setNewReflection(e.target.value)}
                                        placeholder="Share a quick thought, feeling, or reflection..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '15px',
                                            minHeight: '120px',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        marginTop: '10px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '10px'
                                        }}>
                                            <button
                                                onClick={async () => {
                                                    if (newReflection.trim()) {
                                                        try {
                                                            await db.collection('quickReflections').add({
                                                                userId: user.uid,
                                                                reflection: newReflection.trim(),
                                                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                            });
                                                            setNewReflection('');
                                                            alert('Reflection saved!');
                                                        } catch (error) {
                                                            alert('Error saving reflection');
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 24px',
                                                    background: '#058585',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (newReflection.trim()) {
                                                        try {
                                                            const docRef = await db.collection('quickReflections').add({
                                                                userId: user.uid,
                                                                reflection: newReflection.trim(),
                                                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                            });
                                                            const reflectionText = newReflection.trim();
                                                            setNewReflection('');

                                                            const result = await shareToCommunity('reflection', reflectionText, 'quickReflections', docRef.id);
                                                            if (result.success) {
                                                                alert('Reflection saved and shared to community! 🎉');
                                                            } else {
                                                                alert('Reflection saved, but error sharing to community');
                                                            }
                                                        } catch (error) {
                                                            alert('Error saving reflection');
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 24px',
                                                    background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <i data-lucide="share-2" style={{ width: '16px', height: '16px' }}></i>
                                                Save & Share
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setShowReflectionHistory(true)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#f8f9fa',
                                                color: '#058585',
                                                border: '1px solid #058585',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View History
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Reflections */}
                                {quickReflections.length > 0 && (
                                    <div style={{ marginTop: '25px' }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                            Recent Reflections ({quickReflections.length})
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {quickReflections.slice(0, 3).map(reflection => (
                                                <div
                                                    key={reflection.id}
                                                    style={{
                                                        padding: '12px 15px',
                                                        background: '#f8f9fa',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e9ecef'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '14px', color: '#333333', marginBottom: '6px', lineHeight: '1.5' }}>
                                                                {reflection.reflection}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#999999' }}>
                                                                {reflection.createdAt ? new Date(reflection.createdAt.toDate()).toLocaleString() : 'Just now'}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('Share this reflection with the community?')) {
                                                                    const result = await shareToCommunity('reflection', reflection.reflection, 'quickReflections', reflection.id);
                                                                    if (result.success) {
                                                                        alert('Reflection shared to community! 🎉');
                                                                    } else {
                                                                        alert('Error sharing to community');
                                                                    }
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#058585',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                                            Share
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* History View */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                        All Reflections ({quickReflections.length})
                                    </h3>
                                    <button
                                        onClick={() => setShowReflectionHistory(false)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#058585',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Back
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {quickReflections.map(reflection => (
                                        <div
                                            key={reflection.id}
                                            style={{
                                                padding: '12px 15px',
                                                background: '#f8f9fa',
                                                borderRadius: '10px',
                                                border: '1px solid #e9ecef'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '14px', color: '#333333', marginBottom: '6px', lineHeight: '1.5' }}>
                                                        {reflection.reflection}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#999999' }}>
                                                        {reflection.createdAt ? new Date(reflection.createdAt.toDate()).toLocaleString() : 'Just now'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Share this reflection with the community?')) {
                                                            const result = await shareToCommunity('reflection', reflection.reflection, 'quickReflections', reflection.id);
                                                            if (result.success) {
                                                                alert('Reflection shared to community! 🎉');
                                                            } else {
                                                                alert('Error sharing to community');
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#058585',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* THIS WEEK'S TASKS MODAL */}
        {showThisWeekTasksModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowThisWeekTasksModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#058585',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="calendar-days" style={{ width: '24px', height: '24px' }}></i>
                            This Week's Tasks
                        </h2>
                        <div
                            onClick={() => setShowThisWeekTasksModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {(() => {
                            const today = new Date();
                            const startOfWeek = new Date(today);
                            startOfWeek.setDate(today.getDate() - today.getDay());
                            startOfWeek.setHours(0, 0, 0, 0);

                            const endOfWeek = new Date(startOfWeek);
                            endOfWeek.setDate(startOfWeek.getDate() + 7);

                            const thisWeekAssignments = assignments.filter(assignment => {
                                if (!assignment.dueDate) return false;
                                const dueDate = assignment.dueDate.toDate();
                                return dueDate >= startOfWeek && dueDate < endOfWeek;
                            });

                            if (thisWeekAssignments.length === 0) {
                                return (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: '#666666'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                            No Tasks This Week
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            You don't have any tasks due this week
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <div style={{ fontSize: '14px', color: '#666666', marginBottom: '15px' }}>
                                        {thisWeekAssignments.length} task{thisWeekAssignments.length !== 1 ? 's' : ''} due this week
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {thisWeekAssignments.map(assignment => {
                                            const dueDate = assignment.dueDate.toDate();
                                            const isOverdue = dueDate < today;
                                            const isToday = dueDate.toDateString() === today.toDateString();

                                            return (
                                                <div
                                                    key={assignment.id}
                                                    style={{
                                                        padding: '12px 15px',
                                                        background: assignment.status === 'completed'
                                                            ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)'
                                                            : isOverdue
                                                            ? 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)'
                                                            : isToday
                                                            ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)'
                                                            : '#f8f9fa',
                                                        borderRadius: '10px',
                                                        border: assignment.status === 'completed'
                                                            ? '2px solid rgba(0, 168, 107, 0.3)'
                                                            : isOverdue
                                                            ? '2px solid rgba(220, 20, 60, 0.3)'
                                                            : isToday
                                                            ? '2px solid rgba(255, 165, 0, 0.3)'
                                                            : '1px solid #e9ecef'
                                                    }}
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'start',
                                                        gap: '10px'
                                                    }}>
                                                        {assignment.status === 'completed' ? (
                                                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#00A86B', marginTop: '2px' }}></i>
                                                        ) : isOverdue ? (
                                                            <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#DC143C', marginTop: '2px' }}></i>
                                                        ) : (
                                                            <i data-lucide="circle" style={{ width: '20px', height: '20px', color: '#058585', marginTop: '2px' }}></i>
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{
                                                                fontSize: '15px',
                                                                fontWeight: '600',
                                                                color: '#333333',
                                                                marginBottom: '4px',
                                                                textDecoration: assignment.status === 'completed' ? 'line-through' : 'none'
                                                            }}>
                                                                {assignment.title}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#666666' }}>
                                                                Due: {dueDate.toLocaleDateString()}
                                                                {isToday && ' (Today)'}
                                                                {isOverdue && assignment.status !== 'completed' && ' (Overdue)'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        )}

        {/* OVERDUE ITEMS MODAL */}
        {showOverdueItemsModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowOverdueItemsModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#DC143C',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="alert-circle" style={{ width: '24px', height: '24px' }}></i>
                            Overdue Items
                        </h2>
                        <div
                            onClick={() => setShowOverdueItemsModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const overdueAssignments = assignments.filter(assignment => {
                                if (!assignment.dueDate || assignment.status === 'completed') return false;
                                const dueDate = assignment.dueDate.toDate();
                                return dueDate < today;
                            });

                            if (overdueAssignments.length === 0) {
                                return (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: '#666666'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                            No Overdue Items!
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            You're all caught up. Great work!
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#DC143C',
                                        marginBottom: '15px',
                                        fontWeight: '600'
                                    }}>
                                        {overdueAssignments.length} overdue item{overdueAssignments.length !== 1 ? 's' : ''}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {overdueAssignments.map(assignment => {
                                            const dueDate = assignment.dueDate.toDate();
                                            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

                                            return (
                                                <div
                                                    key={assignment.id}
                                                    style={{
                                                        padding: '12px 15px',
                                                        background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)',
                                                        borderRadius: '10px',
                                                        border: '2px solid rgba(220, 20, 60, 0.3)'
                                                    }}
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'start',
                                                        gap: '10px'
                                                    }}>
                                                        <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#DC143C', marginTop: '2px' }}></i>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{
                                                                fontSize: '15px',
                                                                fontWeight: '600',
                                                                color: '#333333',
                                                                marginBottom: '4px'
                                                            }}>
                                                                {assignment.title}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#DC143C', fontWeight: '600' }}>
                                                                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue (Due: {dueDate.toLocaleDateString()})
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        )}

        {/* MARK COMPLETE MODAL */}
        {showMarkCompleteModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowMarkCompleteModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#00A86B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="check-circle" style={{ width: '24px', height: '24px' }}></i>
                            Mark Complete
                        </h2>
                        <div
                            onClick={() => setShowMarkCompleteModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {(() => {
                            const incompleteAssignments = assignments.filter(a => a.status !== 'completed');

                            if (incompleteAssignments.length === 0) {
                                return (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: '#666666'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                            All Done!
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            You have no incomplete tasks
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <div style={{ fontSize: '14px', color: '#666666', marginBottom: '15px' }}>
                                        {incompleteAssignments.length} incomplete task{incompleteAssignments.length !== 1 ? 's' : ''}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {incompleteAssignments.map(assignment => (
                                            <div
                                                key={assignment.id}
                                                style={{
                                                    padding: '12px 15px',
                                                    background: '#f8f9fa',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e9ecef',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    onChange={async () => {
                                                        if (confirm(`Mark "${assignment.title}" as complete?`)) {
                                                            try {
                                                                await db.collection('assignments').doc(assignment.id).update({
                                                                    status: 'completed',
                                                                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                                                                });
                                                            } catch (error) {
                                                                alert('Error marking task complete');
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '15px',
                                                        fontWeight: '600',
                                                        color: '#333333',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {assignment.title}
                                                    </div>
                                                    {assignment.dueDate && (
                                                        <div style={{ fontSize: '13px', color: '#666666' }}>
                                                            Due: {assignment.dueDate.toDate().toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        )}

        {/* PROGRESS STATS MODAL */}
        {showProgressStatsModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowProgressStatsModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#058585',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="trending-up" style={{ width: '24px', height: '24px' }}></i>
                            Progress Stats
                        </h2>
                        <div
                            onClick={() => setShowProgressStatsModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {(() => {
                            const totalAssignments = assignments.length;
                            const completedAssignments = assignments.filter(a => a.status === 'completed').length;
                            const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

                            const totalGoals = goals.length;
                            const activeGoals = goals.filter(g => g.status === 'active').length;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {/* Overall Completion Rate */}
                                    <div style={{
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(5, 133, 133, 0.3)'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#666666', marginBottom: '8px' }}>
                                            Overall Completion Rate
                                        </div>
                                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#058585', marginBottom: '10px' }}>
                                            {completionRate}%
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666666' }}>
                                            {completedAssignments} of {totalAssignments} tasks completed
                                        </div>
                                    </div>

                                    {/* Tasks Stats */}
                                    <div style={{
                                        padding: '15px',
                                        background: '#f8f9fa',
                                        borderRadius: '10px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                            Tasks Overview
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>Total Tasks:</span>
                                                <span style={{ fontWeight: '600', color: '#333333' }}>{totalAssignments}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>Completed:</span>
                                                <span style={{ fontWeight: '600', color: '#00A86B' }}>{completedAssignments}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>In Progress:</span>
                                                <span style={{ fontWeight: '600', color: '#FFA500' }}>{totalAssignments - completedAssignments}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goals Stats */}
                                    <div style={{
                                        padding: '15px',
                                        background: '#f8f9fa',
                                        borderRadius: '10px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                            Goals Overview
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>Total Goals:</span>
                                                <span style={{ fontWeight: '600', color: '#333333' }}>{totalGoals}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>Active:</span>
                                                <span style={{ fontWeight: '600', color: '#058585' }}>{activeGoals}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Habits Stats */}
                                    <div style={{
                                        padding: '15px',
                                        background: '#f8f9fa',
                                        borderRadius: '10px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                            Habits Overview
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>Total Habits:</span>
                                                <span style={{ fontWeight: '600', color: '#333333' }}>{habits.length}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#666666' }}>Completed Today:</span>
                                                <span style={{ fontWeight: '600', color: '#00A86B' }}>{todayHabits.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        )}

        {/* GOAL PROGRESS MODAL */}
        {showGoalProgressModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowGoalProgressModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#058585',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="target" style={{ width: '24px', height: '24px' }}></i>
                            Goal Progress
                        </h2>
                        <div
                            onClick={() => setShowGoalProgressModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {goals.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#666666'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                                    No Goals Yet
                                </div>
                                <div style={{ fontSize: '14px' }}>
                                    Start adding goals to track your progress
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {goals.map(goal => {
                                    const progress = goal.progress || 0;

                                    return (
                                        <div
                                            key={goal.id}
                                            style={{
                                                padding: '15px',
                                                background: '#f8f9fa',
                                                borderRadius: '12px',
                                                border: '1px solid #e9ecef'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#333333',
                                                marginBottom: '10px'
                                            }}>
                                                {goal.goalName || goal.name}
                                            </div>

                                            {/* Progress Bar */}
                                            <div style={{
                                                width: '100%',
                                                height: '8px',
                                                background: '#e9ecef',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                marginBottom: '8px'
                                            }}>
                                                <div style={{
                                                    width: `${progress}%`,
                                                    height: '100%',
                                                    background: progress === 100
                                                        ? 'linear-gradient(90deg, #00A86B 0%, #008554 100%)'
                                                        : 'linear-gradient(90deg, #058585 0%, #044c4c 100%)',
                                                    transition: 'width 0.3s ease'
                                                }}></div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ fontSize: '13px', color: '#666666' }}>
                                                    {goal.assignments?.filter(a => a.status === 'completed').length || 0} / {goal.assignments?.length || 0} tasks completed
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: progress === 100 ? '#00A86B' : '#058585'
                                                }}>
                                                    {progress}%
                                                </div>
                                            </div>

                                            {progress === 100 && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Share this goal completion with the community?')) {
                                                            const result = await shareToCommunity('goal', `Completed goal: ${goal.goalName || goal.name}`, 'goals', goal.id);
                                                            if (result.success) {
                                                                alert('Goal completion shared to community! 🎉');
                                                            } else {
                                                                alert('Error sharing to community');
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '12px',
                                                        padding: '8px 16px',
                                                        background: '#00A86B',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <i data-lucide="share-2" style={{ width: '16px', height: '16px' }}></i>
                                                    Share Goal Completion
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* TODAY'S WINS MODAL */}
        {showTodayWinsModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }} onClick={() => setShowTodayWinsModal(false)}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '2px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#FFA500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <i data-lucide="star" style={{ width: '24px', height: '24px' }}></i>
                            Today's Wins
                        </h2>
                        <div
                            onClick={() => setShowTodayWinsModal(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {!showWinsHistory ? (
                            <>
                                {/* Add New Win */}
                                <div style={{
                                    marginBottom: '20px'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333333',
                                        marginBottom: '8px'
                                    }}>
                                        Add a win for today
                                    </label>
                                    <input
                                        type="text"
                                        value={newWin}
                                        onChange={(e) => setNewWin(e.target.value)}
                                        placeholder="e.g., Completed morning workout"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '15px',
                                            marginBottom: '10px'
                                        }}
                                        onKeyPress={async (e) => {
                                            if (e.key === 'Enter' && newWin.trim()) {
                                                try {
                                                    await db.collection('wins').add({
                                                        userId: user.uid,
                                                        win: newWin.trim(),
                                                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                    });
                                                    setNewWin('');
                                                } catch (error) {
                                                    alert('Error adding win');
                                                }
                                            }
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={async () => {
                                                if (newWin.trim()) {
                                                    try {
                                                        await db.collection('wins').add({
                                                            userId: user.uid,
                                                            win: newWin.trim(),
                                                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                        });
                                                        setNewWin('');
                                                        alert('Win added! 🎉');
                                                    } catch (error) {
                                                        alert('Error adding win');
                                                    }
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px 20px',
                                                background: '#FFA500',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (newWin.trim()) {
                                                    try {
                                                        const docRef = await db.collection('wins').add({
                                                            userId: user.uid,
                                                            win: newWin.trim(),
                                                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                        });
                                                        const winText = newWin.trim();
                                                        setNewWin('');

                                                        const result = await shareToCommunity('win', winText, 'wins', docRef.id);
                                                        if (result.success) {
                                                            alert('Win added and shared to community! 🎉');
                                                        } else {
                                                            alert('Win added, but error sharing to community');
                                                        }
                                                    } catch (error) {
                                                        alert('Error adding win');
                                                    }
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                            Add & Share
                                        </button>
                                    </div>
                                </div>

                                {/* Today's Wins List */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                        Today's Wins ({todayWins.length})
                                    </h3>
                                    <button
                                        onClick={() => setShowWinsHistory(true)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#f8f9fa',
                                            color: '#FFA500',
                                            border: '1px solid #FFA500',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View History
                                    </button>
                                </div>

                                {todayWins.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '30px 20px',
                                        color: '#999999',
                                        fontSize: '14px'
                                    }}>
                                        No wins yet today. Add your first win above!
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {todayWins.map(win => (
                                            <div
                                                key={win.id}
                                                style={{
                                                    padding: '12px 15px',
                                                    background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
                                                    borderRadius: '10px',
                                                    border: '2px solid rgba(255, 165, 0, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}
                                            >
                                                <i data-lucide="star" style={{ width: '20px', height: '20px', color: '#FFA500' }}></i>
                                                <span style={{
                                                    flex: 1,
                                                    fontSize: '15px',
                                                    color: '#333333'
                                                }}>
                                                    {win.win}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Share this win with the community?')) {
                                                            const result = await shareToCommunity('win', win.win, 'wins', win.id);
                                                            if (result.success) {
                                                                alert('Win shared to community! 🎉');
                                                            } else {
                                                                alert('Error sharing to community');
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#058585',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <i data-lucide="share-2" style={{ width: '14px', height: '14px' }}></i>
                                                    Share
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* History View */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333333' }}>
                                        All Wins
                                    </h3>
                                    <button
                                        onClick={() => setShowWinsHistory(false)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#FFA500',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Back to Today
                                    </button>
                                </div>

                                <div style={{ fontSize: '13px', color: '#666666', marginBottom: '15px' }}>
                                    Showing wins from all time
                                </div>

                                {todayWins.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '30px 20px',
                                        color: '#999999',
                                        fontSize: '14px'
                                    }}>
                                        No wins recorded yet
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {todayWins.map(win => (
                                            <div
                                                key={win.id}
                                                style={{
                                                    padding: '12px 15px',
                                                    background: '#f8f9fa',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e9ecef'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '6px'
                                                }}>
                                                    <i data-lucide="star" style={{ width: '16px', height: '16px', color: '#FFA500' }}></i>
                                                    <span style={{ fontSize: '15px', color: '#333333', flex: 1 }}>
                                                        {win.win}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#999999', paddingLeft: '26px' }}>
                                                    {win.createdAt ? new Date(win.createdAt.toDate()).toLocaleDateString() : 'Today'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* TASKS SIDEBAR - Slides from LEFT */}
        {showSidebar && (
            <>
                {/* Backdrop */}
                <div
                    onClick={() => setShowSidebar(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998
                    }}
                />

                {/* Sidebar Panel */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '280px',
                    background: '#FFFFFF',
                    boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 9999,
                    padding: '20px',
                    overflowY: 'auto',
                    animation: 'slideInLeft 0.3s ease-out'
                }}>
                    {/* Close Button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px',
                        paddingBottom: '15px',
                        borderBottom: '2px solid #f0f0f0'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#058585'
                        }}>
                            Quick Tools
                        </h2>
                        <div
                            onClick={() => setShowSidebar(false)}
                            style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '24px', height: '24px', color: '#666666' }}></i>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Habit Tracker */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowHabitTrackerModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="repeat" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Habit Tracker
                            </span>
                        </div>

                        {/* Quick Reflection */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowQuickReflectionModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="message-circle" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Quick Reflection
                            </span>
                        </div>

                        {/* This Week's Tasks */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowThisWeekTasksModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="calendar-days" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                This Week's Tasks
                            </span>
                        </div>

                        {/* Overdue Items */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowOverdueItemsModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#DC143C' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Overdue Items
                            </span>
                        </div>

                        {/* Mark Complete */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowMarkCompleteModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="check-circle" style={{ width: '20px', height: '20px', color: '#00A86B' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Mark Complete
                            </span>
                        </div>

                        {/* Progress Stats */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowProgressStatsModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="trending-up" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Progress Stats
                            </span>
                        </div>

                        {/* Goal Progress */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowGoalProgressModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="target" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Goal Progress
                            </span>
                        </div>

                        {/* Today's Wins */}
                        <div
                            onClick={() => {
                                if (typeof triggerHaptic === 'function') triggerHaptic('light');
                                setShowSidebar(false);
                                setShowTodayWinsModal(true);
                            }}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                        >
                            <i data-lucide="star" style={{ width: '20px', height: '20px', color: '#FFA500' }}></i>
                            <span style={{ color: '#333333', fontWeight: '500', fontSize: '15px' }}>
                                Today's Wins
                            </span>
                        </div>
                    </div>
                </div>
            </>
        )}

       {showModal && (
    <ModalContainer 
        type={showModal}
        onClose={() => setShowModal(null)}
        data={{
            notifications,
            userData,
            user,
            resources,
            activeTopicRoom,
            topicRoomMessages,
            coachInfo,
            googleConnected,
            googleToken,
            googleTokenExpiry,
            syncingGoogle,
            connectGoogleCalendar,
            disconnectGoogleCalendar
        }}
        handlers={{
            markNotificationAsRead,
            markAllNotificationsAsRead,
            handleMorningCheckIn,
            handleEveningReflection,
            sendTopicMessage: async (message, image) => {
                if (activeTopicRoom) {
                    await sendTopicRoomMessage(activeTopicRoom.id, message, image);
                }
            },
            exportDataAsJSON,
            exportDataAsPDF
        }}
    />
)}

{modalImage && (
    <ImageModal
        imageUrl={modalImage}
        onClose={() => setModalImage(null)}
    />
)}
{/* Streaks Modal */}
{showStreaksModal && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                position: 'sticky',
                top: 0,
                background: '#FFFFFF',
                zIndex: 10
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    🔥 Your Check-In Streaks
                </h3>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Current Streak */}
                {streakData.currentStreak > 0 && (
                    <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '2px solid #058585'
                    }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            Current Streak
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#058585' }}>
                            🔥 {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                            Keep it up! Check in today to extend your streak.
                        </div>
                    </div>
                )}

                {/* All Streaks List */}
                <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000' }}>
                    All Streaks
                </div>

                {streakData.allStreaks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {streakData.allStreaks.map((streak, index) => {
                            const startDate = new Date(streak.startDate);
                            const endDate = new Date(streak.endDate);
                            const isLongest = index === 0; // First in sorted array is longest
                            const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        padding: '14px',
                                        background: isLongest ? '#FFF9E6' : '#F8F9FA',
                                        borderRadius: '10px',
                                        border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                                                {streak.length} {streak.length === 1 ? 'day' : 'days'}
                                                {isLongest && <span style={{ marginLeft: '8px', fontSize: '14px' }}>⭐ Longest</span>}
                                                {isCurrent && <span style={{ marginLeft: '8px', fontSize: '14px' }}>← Current</span>}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {' - '}
                                                {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '24px' }}>
                                            🔥
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#999'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
                        <div>Start checking in to build your first streak!</div>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowStreaksModal(false);
                    }}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}

{/* Reflection Streaks Modal */}
{showReflectionStreaksModal && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    }}>
        <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E5E5',
                position: 'sticky',
                top: 0,
                background: '#FFFFFF',
                zIndex: 10
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000000'
                }}>
                    🌙 Your Reflection Streaks
                </h3>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Current Streak */}
                {reflectionStreakData.currentStreak > 0 && (
                    <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '2px solid #058585'
                    }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            Current Streak
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#058585' }}>
                            🔥 {reflectionStreakData.currentStreak} {reflectionStreakData.currentStreak === 1 ? 'day' : 'days'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                            Keep it up! Reflect tonight to extend your streak.
                        </div>
                    </div>
                )}

                {/* All Streaks List */}
                <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000' }}>
                    All Streaks
                </div>

                {reflectionStreakData.allStreaks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reflectionStreakData.allStreaks.map((streak, index) => {
                            const startDate = new Date(streak.startDate);
                            const endDate = new Date(streak.endDate);
                            const isLongest = index === 0; // First in sorted array is longest
                            const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        padding: '14px',
                                        background: isLongest ? '#FFF9E6' : '#F8F9FA',
                                        borderRadius: '10px',
                                        border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                                                {streak.length} {streak.length === 1 ? 'day' : 'days'}
                                                {isLongest && <span style={{ marginLeft: '8px', fontSize: '14px' }}>⭐ Longest</span>}
                                                {isCurrent && <span style={{ marginLeft: '8px', fontSize: '14px' }}>← Current</span>}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {' - '}
                                                {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '24px' }}>
                                            🔥
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#999'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</div>
                        <div>Start reflecting daily to build your first streak!</div>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setShowReflectionStreaksModal(false);
                    }}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        height: '48px',
                        background: '#058585',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    </div>
)}
  {/* Quick Tools Section */}
            <div style={{
                padding: '0 20px 100px 20px',
                marginTop: '20px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#000000',
                    marginBottom: '12px',
                    marginTop: '24px'
                }}>
                    Quick Tools
                </h3>

                {/* Set Today's Intentions */}
                <div
                    data-action="set-intentions"
                    style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                    onClick={() => {
                        if (typeof triggerHaptic === 'function') triggerHaptic('light');
                        setShowIntentionsModal(true);
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <i data-lucide="compass" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Set Today's Intentions
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                color: '#666666'
                            }}>
                                Define your focus for the day
                            </div>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                </div>

                {/* Progress Snapshot */}
                <div
                    data-action="progress-snapshot"
                    style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                    onClick={() => {
                        if (typeof triggerHaptic === 'function') triggerHaptic('light');
                        setShowProgressSnapshotModal(true);
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                        <div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Progress Snapshot
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                color: '#666666'
                            }}>
                                View all goals and stats
                            </div>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                </div>
            </div>

            {/* Set Today's Intentions Modal */}
            {showIntentionsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #E9ECEF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i data-lucide="compass" style={{ width: '24px', height: '24px', color: '#0077CC' }}></i>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#000000'
                                }}>
                                    Set Today's Intentions
                                </h2>
                            </div>
                            <div
                                onClick={() => setShowIntentionsModal(false)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{
                                    width: '24px',
                                    height: '24px',
                                    color: '#666666'
                                }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(5,133,133,0.1) 100%)',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: '1px solid rgba(0,119,204,0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <i data-lucide="lightbulb" style={{ width: '20px', height: '20px', color: '#0077CC', flexShrink: 0, marginTop: '2px' }}></i>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: '#000000',
                                        lineHeight: '1.5'
                                    }}>
                                        Setting daily intentions helps you stay focused on what matters most in your recovery journey. Take a moment to define your purpose for today.
                                    </p>
                                </div>
                            </div>

                            <textarea
                                placeholder="What are your intentions for today? (e.g., 'Stay present and grateful', 'Reach out to my support network', 'Practice self-care')"
                                value={currentReflection}
                                onChange={(e) => setCurrentReflection(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    border: '1px solid #CED4DA',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    marginBottom: '16px'
                                }}
                            />

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <button
                                    onClick={async () => {
                                        if (!currentReflection.trim()) {
                                            alert('Please write your intentions for today');
                                            return;
                                        }

                                        try {
                                            // Save as daily pledge
                                            await db.collection('pledges').add({
                                                userId: user.uid,
                                                intention: currentReflection,
                                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                            });

                                            // Save as activity
                                            await db.collection('activities').add({
                                                userId: user.uid,
                                                type: 'intention',
                                                description: currentReflection,
                                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                            });

                                            alert('✨ Your intentions have been set for today!');
                                            setCurrentReflection('');
                                            setShowIntentionsModal(false);
                                        } catch (error) {
                                            alert('Error saving your intentions. Please try again.');
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px 24px',
                                        background: 'linear-gradient(135deg, #0077CC 0%, #058585 100%)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <i data-lucide="check" style={{ width: '18px', height: '18px' }}></i>
                                    Set Intentions
                                </button>
                            </div>

                            {/* View Past Intentions */}
                            <button
                                data-action="past-intentions"
                                onClick={async () => {
                                    try {
                                        const intentionsSnap = await db.collection('pledges')
                                            .where('userId', '==', user.uid)
                                            .orderBy('createdAt', 'desc')
                                            .limit(20)
                                            .get();

                                        const intentionsData = [];
                                        intentionsSnap.forEach(doc => {
                                            intentionsData.push({
                                                id: doc.id,
                                                ...doc.data()
                                            });
                                        });

                                        setPastIntentions(intentionsData);
                                        setShowPastIntentionsModal(true);
                                    } catch (error) {
                                        alert('Error loading past intentions');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#F8F9FA',
                                    color: '#0077CC',
                                    border: '1px solid #E9ECEF',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i data-lucide="history" style={{ width: '18px', height: '18px' }}></i>
                                View Past Intentions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Snapshot Modal */}
            {showProgressSnapshotModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #E9ECEF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i data-lucide="bar-chart-3" style={{ width: '24px', height: '24px', color: '#0077CC' }}></i>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#000000'
                                }}>
                                    Progress Snapshot
                                </h2>
                            </div>
                            <div
                                onClick={() => setShowProgressSnapshotModal(false)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{
                                    width: '24px',
                                    height: '24px',
                                    color: '#666666'
                                }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            {/* Overview Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                {/* Active Goals */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(0,119,204,0.05) 100%)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0,119,204,0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <i data-lucide="target" style={{ width: '20px', height: '20px', color: '#0077CC' }}></i>
                                        <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Active Goals</span>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0077CC' }}>
                                        {activeGoals}
                                    </div>
                                </div>

                                {/* Active Objectives */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(5,133,133,0.1) 0%, rgba(5,133,133,0.05) 100%)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(5,133,133,0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <i data-lucide="list-checks" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                        <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Objectives</span>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#058585' }}>
                                        {activeObjectives}
                                    </div>
                                </div>

                                {/* Active Tasks */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(0,168,107,0.05) 100%)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0,168,107,0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <i data-lucide="clipboard-list" style={{ width: '20px', height: '20px', color: '#00A86B' }}></i>
                                        <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Active Tasks</span>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00A86B' }}>
                                        {activeAssignments}
                                    </div>
                                </div>

                                {/* Completion Rate */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(255,140,0,0.1) 0%, rgba(255,140,0,0.05) 100%)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,140,0,0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <i data-lucide="trending-up" style={{ width: '20px', height: '20px', color: '#FF8C00' }}></i>
                                        <span style={{ fontSize: '12px', color: '#666666', fontWeight: '500' }}>Completion</span>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF8C00' }}>
                                        {completionRate}%
                                    </div>
                                </div>
                            </div>

                            {/* Progress Details */}
                            <div style={{
                                background: '#F8F9FA',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <i data-lucide="activity" style={{ width: '18px', height: '18px', color: '#0077CC' }}></i>
                                    Overall Progress
                                </h3>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', color: '#666666' }}>Completed Tasks</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#000000' }}>
                                            {completedAssignments} / {totalAssignments}
                                        </span>
                                    </div>
                                    <div style={{
                                        background: '#E9ECEF',
                                        borderRadius: '8px',
                                        height: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(90deg, #0077CC 0%, #00A86B 100%)',
                                            height: '100%',
                                            width: `${completionRate}%`,
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '12px',
                                    marginTop: '16px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#999999', marginBottom: '4px' }}>Goals</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>
                                            {goals.length} Total
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#999999', marginBottom: '4px' }}>Objectives</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>
                                            {objectives.length} Total
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Motivational Message */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(5,133,133,0.1) 100%)',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(0,119,204,0.2)',
                                textAlign: 'center'
                            }}>
                                <i data-lucide="trophy" style={{ width: '32px', height: '32px', color: '#0077CC', marginBottom: '8px' }}></i>
                                <p style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: '#000000',
                                    fontWeight: '500'
                                }}>
                                    {completionRate >= 75 ? '🌟 Outstanding progress! Keep up the amazing work!' :
                                     completionRate >= 50 ? '💪 You\'re doing great! Stay focused on your goals!' :
                                     completionRate >= 25 ? '🎯 Good start! Keep building momentum!' :
                                     '🚀 Every journey begins with a single step. You\'ve got this!'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Past Intentions Modal */}
            {showPastIntentionsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #E9ECEF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i data-lucide="history" style={{ width: '24px', height: '24px', color: '#0077CC' }}></i>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#000000'
                                }}>
                                    Past Intentions
                                </h2>
                            </div>
                            <div
                                onClick={() => setShowPastIntentionsModal(false)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{
                                    width: '24px',
                                    height: '24px',
                                    color: '#666666'
                                }}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            {pastIntentions.length === 0 ? (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    border: '2px dashed #0077CC'
                                }}>
                                    <i data-lucide="compass" style={{
                                        width: '48px',
                                        height: '48px',
                                        color: '#0077CC',
                                        marginBottom: '12px'
                                    }}></i>
                                    <h3 style={{
                                        color: '#000000',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        margin: '0 0 8px 0'
                                    }}>
                                        No Intentions Yet
                                    </h3>
                                    <p style={{
                                        color: '#666666',
                                        fontSize: '14px',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>
                                        Start setting your daily intentions to build momentum in your recovery journey.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {pastIntentions.map((intention, index) => {
                                        const date = intention.createdAt?.toDate();
                                        const dateStr = date ? date.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        }) : 'Unknown date';
                                        const timeStr = date ? date.toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : '';

                                        return (
                                            <div key={intention.id} style={{
                                                background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                border: '1px solid rgba(0,119,204,0.2)'
                                            }}>
                                                {/* Date Header */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px',
                                                    paddingBottom: '12px',
                                                    borderBottom: '1px solid rgba(0,119,204,0.1)'
                                                }}>
                                                    <i data-lucide="calendar" style={{ width: '16px', height: '16px', color: '#0077CC' }}></i>
                                                    <span style={{
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        color: '#0077CC'
                                                    }}>
                                                        {dateStr}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#666666',
                                                        marginLeft: 'auto'
                                                    }}>
                                                        {timeStr}
                                                    </span>
                                                </div>

                                                {/* Intention Content */}
                                                <div style={{ marginBottom: '8px' }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: '#666666',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        marginBottom: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <i data-lucide="target" style={{ width: '14px', height: '14px' }}></i>
                                                        Intentions
                                                    </div>
                                                    {intention.intention && intention.intention.trim() !== '' ? (
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '14px',
                                                            color: '#000000',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {intention.intention}
                                                        </p>
                                                    ) : (
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '13px',
                                                            color: '#999999',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            Daily pledge made (no text provided)
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Render Modal */}
            <ItemModal />
        </>
    );