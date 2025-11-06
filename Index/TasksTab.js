// Index/TasksTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

function TasksTab(app) {
    const {
        activeTaskTab,
        setActiveTaskTab,
        triggerHaptic,
        checkInStatus,
        morningCheckInData,
        setMorningCheckInData,
        handleMorningCheckIn,
        loadStreak,
        loadCheckIns,
        loadStreakCheckIns,
        loadDailyTasksStatus,
        checkInStreak,
        setShowStreakModal,
        weeklyStats,
        setShowCalendarHeatmapModal,
        loadCalendarHeatmapData,
        loadMoodWeekData,
        setShowMoodInsightsModal,
        streakData,
        setShowStreaksModal,
        setCurrentView,
        patternDetection,
        setShowMoodPatternModal,
        setShowCravingPatternModal,
        setShowAnxietyPatternModal,
        setShowSleepPatternModal,
        coachNotes,
        nextMilestone,
        setShowMilestoneModal,
        copingTechniques,
        setShowCopingTechniqueModal,
        setShowWeeklyReportModal,
        eveningReflectionData,
        setEveningReflectionData,
        handleEveningReflection,
        reflectionStreak,
        loadStreakReflections,
        setShowReflectionStreakModal,
        reflectionStats,
        reflectionStreakData,
        setShowOverallDayInsightsModal,
        loadOverallDayWeekData,
        setShowGratitudeThemesModal,
        setShowReflectionStreaksModal,
        setShowPastReflectionsModal,
        setShowGratitudeModal,
        loadGratitudeJournal,
        loadGratitudeInsights,
        setShowGratitudeJournalModal,
        loadChallengesHistory,
        loadChallengesInsights,
        setShowChallengesHistoryModal,
        loadGoalAchievementData,
        setShowTomorrowGoalsModal,
        shareReflections,
        goals,
        assignments,
        handleAssignmentComplete,
        handleReflectionSave,
        setDueToday,
        user,
        sobrietyDays
    } = app;

    return (
        <>
            {/* TASKS SUB-NAVIGATION */}
            <div style={{
                background: '#058585',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: '48px',
                position: 'fixed',
                top: '40px',
                left: 0,
                right: 0,
                zIndex: 99,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setActiveTaskTab('checkin');
                    }}
                    style={{
                        flex: 1,
                        height: '100%',
                        background: 'none',
                        border: 'none',
                        color: activeTaskTab === 'checkin' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        fontWeight: activeTaskTab === 'checkin' ? 'bold' : '400',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    Check-In
                    {activeTaskTab === 'checkin' && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '2px',
                            background: '#FFFFFF'
                        }} />
                    )}
                </button>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setActiveTaskTab('reflections');
                    }}
                    style={{
                        flex: 1,
                        height: '100%',
                        background: 'none',
                        border: 'none',
                        color: activeTaskTab === 'reflections' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        fontWeight: activeTaskTab === 'reflections' ? 'bold' : '400',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    Reflections
                    {activeTaskTab === 'reflections' && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '2px',
                            background: '#FFFFFF'
                        }} />
                    )}
                </button>

                <button
                    onClick={() => {
                        triggerHaptic('light');
                        setActiveTaskTab('golden');
                    }}
                    style={{
                        flex: 1,
                        height: '100%',
                        background: 'none',
                        border: 'none',
                        color: activeTaskTab === 'golden' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        fontWeight: activeTaskTab === 'golden' ? 'bold' : '400',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    The Golden Thread
                    {activeTaskTab === 'golden' && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '2px',
                            background: '#FFFFFF'
                        }} />
                    )}
                </button>
            </div>

            {/* WHITE CONTAINER FOR ALL TAB CONTENT */}
            <div style={{
                background: '#FFFFFF',
                minHeight: '100vh',
                paddingBottom: '80px',
                paddingTop: '48px'
            }}>
                {/* CHECK-IN TAB */}
                {activeTaskTab === 'checkin' && (
                <div style={{
                    padding: '16px 5%',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    {/* Morning Check-In Section */}
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '10px'
                    }}>
                        Morning Check-In
                    </h3>

                    {/* Check if morning check-in is already complete */}
                    {(() => {
                        return checkInStatus.morning;
                    })() ? (
                        // COMPLETE STATE - Show completion message
                        <div style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                            borderRadius: '12px',
                            padding: '30px 20px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            border: '2px solid rgba(5, 133, 133, 0.2)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '15px' }}>✅</div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#058585',
                                marginBottom: '8px'
                            }}>
                                Morning Check-In Complete!
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#666',
                                margin: 0
                            }}>
                                Great job! Your morning check-in has been recorded. Come back tomorrow for your next check-in.
                            </p>
                        </div>
                    ) : (
                        // PENDING STATE - Show form
                        <>
                    {/* Mood Card */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '8px'
                        }}>
                            Mood
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: '70px',
                            overflow: 'hidden'
                        }}>
                            {/* Highlight Box Behind Selected Number */}
                            <div style={{
                                position: 'absolute',
                                width: '70px',
                                height: '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />

                            {/* Left Vertical Divider */}
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />

                            {/* Right Vertical Divider */}
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />

                            {/* Left Gradient Fade */}
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />

                            {/* Right Gradient Fade */}
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />

                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = 60 + 20; // width + gap
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.mood && centerIndex >= 0 && centerIndex <= 10) {
                                    triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, mood: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, mood: rating }));
                                        }}
                                        style={{
                                            minWidth: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.mood === rating ? '32px' : '20px',
                                            fontWeight: morningCheckInData.mood === rating ? 'bold' : '400',
                                            color: morningCheckInData.mood === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.mood === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Craving Card - Same structure as Mood */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '8px'
                        }}>
                            Craving
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: '70px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '70px',
                                height: '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = 60 + 20;
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.craving && centerIndex >= 0 && centerIndex <= 10) {
                                    triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, craving: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, craving: rating }));
                                        }}
                                        style={{
                                            minWidth: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.craving === rating ? '32px' : '20px',
                                            fontWeight: morningCheckInData.craving === rating ? 'bold' : '400',
                                            color: morningCheckInData.craving === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.craving === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Anxiety Card - Same structure */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '8px'
                        }}>
                            Anxiety
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: '70px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '70px',
                                height: '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = 60 + 20;
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.anxiety && centerIndex >= 0 && centerIndex <= 10) {
                                    triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, anxiety: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, anxiety: rating }));
                                        }}
                                        style={{
                                            minWidth: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.anxiety === rating ? '32px' : '20px',
                                            fontWeight: morningCheckInData.anxiety === rating ? 'bold' : '400',
                                            color: morningCheckInData.anxiety === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.anxiety === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sleep Card - Same structure */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '8px'
                        }}>
                            Sleep
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            height: '70px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '70px',
                                height: '60px',
                                background: 'rgba(5, 133, 133, 0.12)',
                                borderRadius: '12px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% - 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '1px',
                                height: '50px',
                                background: 'rgba(5, 133, 133, 0.3)',
                                left: 'calc(50% + 40px)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                left: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '60px',
                                height: '100%',
                                background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                right: 0,
                                top: 0,
                                pointerEvents: 'none',
                                zIndex: 3
                            }} />
                            <div
                            className="swipeable-picker-container"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                padding: '0 calc(50% - 30px)',
                                width: '100%',
                                touchAction: 'pan-x'
                            }}
                            onScroll={(e) => {
                                const container = e.target;
                                const scrollLeft = container.scrollLeft;
                                const itemWidth = 60 + 20;
                                const centerIndex = Math.round(scrollLeft / itemWidth);
                                if (centerIndex !== morningCheckInData.sleep && centerIndex >= 0 && centerIndex <= 10) {
                                    triggerHaptic('light');
                                    setMorningCheckInData(prev => ({ ...prev, sleep: centerIndex }));
                                }
                            }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                    <div
                                        key={rating}
                                        onClick={() => {
                                            triggerHaptic('light');
                                            setMorningCheckInData(prev => ({ ...prev, sleep: rating }));
                                        }}
                                        style={{
                                            minWidth: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: morningCheckInData.sleep === rating ? '32px' : '20px',
                                            fontWeight: morningCheckInData.sleep === rating ? 'bold' : '400',
                                            color: morningCheckInData.sleep === rating ? '#058585' : '#cccccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: morningCheckInData.sleep === rating ? 'scale(1.2)' : 'scale(1)',
                                            scrollSnapAlign: 'center',
                                            userSelect: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {rating}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <button
                            onClick={async () => {
                                triggerHaptic('success');

                                try {
                                    await handleMorningCheckIn(morningCheckInData);
                                    await new Promise(resolve => setTimeout(resolve, 200));
                                    await loadStreak();
                                    await loadCheckIns();
                                    await loadStreakCheckIns();
                                    await loadDailyTasksStatus();
                                    alert('Check-in submitted! ✅');
                                    setMorningCheckInData({
                                        mood: null,
                                        craving: null,
                                        anxiety: null,
                                        sleep: null
                                    });
                                } catch (error) {
                                    alert('Failed to submit check-in. Please try again.');
                                }
                            }}
                            disabled={morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null}
                            style={{
                                width: '120px',
                                height: '40px',
                                background: (morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null) ? '#cccccc' : '#058585',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: '400',
                                cursor: (morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Submit
                        </button>
                    </div>
                    </>

                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={async () => {
                        triggerHaptic('light');
                        await loadStreakCheckIns();
                        setShowStreakModal(true);
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Check-In Streak
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {checkInStreak > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#058585'
                                    }}>
                                        {checkInStreak} {checkInStreak === 1 ? 'day' : 'days'}
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    Start checking in daily!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Header */}
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '10px',
                        marginTop: '20px'
                    }}>
                        Quick Stats
                    </h3>

                    {/* Check Rate Stat Card - Clickable */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={async () => {
                        triggerHaptic('light');
                        setShowCalendarHeatmapModal(true);
                        await loadCalendarHeatmapData();
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Check Rate
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {weeklyStats.checkRate > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        {weeklyStats.checkRate}%
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    No data yet
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Avg Mood Stat Card */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={async () => {
                        triggerHaptic('light');
                        await loadMoodWeekData();
                        setShowMoodInsightsModal(true);
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Avg Mood
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {weeklyStats.avgMood > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        {weeklyStats.avgMood}
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    No data yet
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Longest Streak Stat Card */}
                    <div style={{
                        width: '100%',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => {
                        triggerHaptic('light');
                        setShowStreaksModal(true);
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '400',
                            color: '#000000'
                        }}>
                            Longest Streak
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {streakData.longestStreak > 0 ? (
                                <>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#000000'
                                    }}>
                                        🔥 {streakData.longestStreak} {streakData.longestStreak === 1 ? 'day' : 'days'}
                                    </span>
                                    <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                </>
                            ) : (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#999999',
                                    fontStyle: 'italic'
                                }}>
                                    No data yet
                                </span>
                            )}
                        </div>
                    </div>

                    {/* View Check-In Trends Button */}
                    <button style={{
                        width: '100%',
                        height: '48px',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid #058585',
                        color: '#058585',
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onClick={() => {
                        triggerHaptic('light');
                        setCurrentView('progress');
                    }}>
                        <i data-lucide="bar-chart-3" style={{ width: '20px', height: '20px' }}></i>
                        View Check-In Trends
                    </button>

                    {/* Pattern Detection Cards - 4 Types */}
                    {patternDetection && patternDetection.type === 'mood' && (
                        <div style={{
                            width: '100%',
                            background: '#E8F5E9',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #4CAF50'
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i data-lucide="activity" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                    Mood Pattern Detected
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    {patternDetection.message}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    setShowMoodPatternModal(true);
                                }}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                View Mood Tips
                            </button>
                        </div>
                    )}

                    {patternDetection && patternDetection.type === 'craving' && (
                        <div style={{
                            width: '100%',
                            background: '#FFEBEE',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #EF5350'
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i data-lucide="flame" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                    Craving Pattern Detected
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    {patternDetection.message}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    setShowCravingPatternModal(true);
                                }}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                View Craving Tips
                            </button>
                        </div>
                    )}

                    {patternDetection && patternDetection.type === 'anxiety' && (
                        <div style={{
                            width: '100%',
                            background: '#FFF3E0',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #FFB74D'
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i data-lucide="alert-circle" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                    Anxiety Pattern Detected
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    {patternDetection.message}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    setShowAnxietyPatternModal(true);
                                }}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                View Anxiety Tips
                            </button>
                        </div>
                    )}

                    {patternDetection && patternDetection.type === 'sleep' && (
                        <div style={{
                            width: '100%',
                            background: '#E3F2FD',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #64B5F6'
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i data-lucide="moon" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                    Sleep Pattern Detected
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    {patternDetection.message}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    setShowSleepPatternModal(true);
                                }}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    background: '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: 'pointer'
                                }}
                            >
                                View Sleep Tips
                            </button>
                        </div>
                    )}

                    {/* Coach Notes Card */}
                    {coachNotes.length > 0 && (
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            triggerHaptic('light');
                            alert(coachNotes[0].note || 'Coach note available');
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <i data-lucide="message-square" style={{ width: '20px', height: '20px', color: '#058585' }}></i>
                                Coach Notes
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                color: '#666666'
                            }}>
                                "{coachNotes[0].note || 'New note from your coach'}"
                            </div>
                        </div>
                    )}

                    {/* Bottom Features Section */}
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: '#000000',
                        marginBottom: '12px',
                        marginTop: '24px'
                    }}>
                        Quick Tools
                    </h3>

                    {/* 1. Emergency SOS Button */}
                    <div style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #DC143C 0%, #B01030 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '8px',
                        boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
                        cursor: 'pointer',
                        border: '2px solid #DC143C'
                    }}
                    onClick={() => {
                        triggerHaptic('medium');
                        alert('Crisis resources:\n\n988 Suicide & Crisis Lifeline\nCall or Text 988\n\nCrisis Text Line\nText HOME to 741741\n\nSAMHSA National Helpline\n1-800-662-4357');
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i data-lucide="alert-octagon" style={{ width: '28px', height: '28px', color: '#FFFFFF' }}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#FFFFFF',
                                    marginBottom: '4px'
                                }}>
                                    Emergency Support
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: 'rgba(255,255,255,0.9)'
                                }}>
                                    24/7 crisis resources and helplines
                                </div>
                            </div>
                            <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)' }}></i>
                        </div>
                    </div>

                    {/* 2. Weekly Progress Summary */}
                    <div style={{
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
                        triggerHaptic('light');
                        setShowWeeklyReportModal(true);
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <i data-lucide="calendar-check" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000'
                                }}>
                                    Weekly Progress Report
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    View detailed analytics and insights
                                </div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                    </div>

                    {/* 3. Share Progress */}
                    <div style={{
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
                    onClick={async () => {
                        try {
                            triggerHaptic('light');
                            const shareText = checkInStreak > 0
                                ? `${checkInStreak} ${checkInStreak === 1 ? 'day' : 'days'} check-in streak! Proud of my progress in recovery. ${weeklyStats.checkRate}% check-in rate this month.`
                                : 'Starting my recovery journey! Following my daily check-ins and reflections.';

                            if (navigator.share) {
                                await navigator.share({
                                    title: 'My Recovery Progress',
                                    text: shareText,
                                });
                            } else {
                                alert(`Share your progress:\n\n${shareText}`);
                            }
                        } catch (error) {
                            if (error.name !== 'AbortError') {
                                console.error('Share error:', error);
                                alert('Unable to share. Please try again.');
                            }
                        }
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <i data-lucide="share-2" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000'
                                }}>
                                    Share Your Progress
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#666666'
                                }}>
                                    Celebrate milestones with supporters
                                </div>
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                    </div>

                    {/* 4. Daily Coping Technique */}
                    {(() => {
                        const dayOfMonth = new Date().getDate();
                        const technique = copingTechniques.find(t => t.day === dayOfMonth) || copingTechniques[0];

                        return (
                            <div style={{
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
                                triggerHaptic('light');
                                setShowCopingTechniqueModal(true);
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <i data-lucide={technique.icon} style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            color: '#000000'
                                        }}>
                                            {technique.title}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '400',
                                            color: '#666666'
                                        }}>
                                            Today's coping technique • {technique.category}
                                        </div>
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                            </div>
                        );
                    })()}

                    {/* 5. Recovery Milestones */}
                    {nextMilestone && (
                        <div style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                            boxShadow: '0 4px 12px rgba(5, 133, 133, 0.3)',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            triggerHaptic('light');
                            setShowMilestoneModal(true);
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <i data-lucide={nextMilestone.icon} style={{ width: '28px', height: '28px', color: '#FFFFFF' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#FFFFFF',
                                        marginBottom: '4px'
                                    }}>
                                        {nextMilestone.achieved ?
                                            'All Milestones Complete!' :
                                            `Next: ${nextMilestone.label}`
                                        }
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '400',
                                        color: 'rgba(255,255,255,0.9)'
                                    }}>
                                        {nextMilestone.achieved ?
                                            `${sobrietyDays} days sober - Amazing!` :
                                            `${nextMilestone.daysUntil} ${nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go • ${nextMilestone.progressPercentage}% there`
                                        }
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)' }}></i>
                            </div>
                        </div>
                    )}
                </div>
            )}
                    )}
{/* REFLECTIONS TAB */}
                {activeTaskTab === 'reflections' && (
                    <div style={{
                        padding: '16px 5%',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {/* Evening Reflections Section */}
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '10px'
                        }}>
                            Evening Reflections
                        </h3>

                        {/* Check if evening reflection is already complete */}
                        {checkInStatus.evening ? (
                            // COMPLETE STATE - Show completion message
                            <div style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
                                borderRadius: '12px',
                                padding: '30px 20px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                border: '2px solid rgba(5, 133, 133, 0.2)'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '15px' }}>✅</div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#058585',
                                    marginBottom: '8px'
                                }}>
                                    Evening Reflection Complete!
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    margin: 0
                                }}>
                                    Great job! Your evening reflection has been recorded. Come back tomorrow for your next reflection.
                                </p>
                            </div>
                        ) : (
                            // PENDING STATE - Show form
                            <>
                        {/* Daily Reflection Prompt */}
                        <div style={{
                            width: '100%',
                            background: '#E3F2FD',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '12px',
                            border: '1px solid #90CAF9'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#000000',
                                marginBottom: '8px'
                            }}>
                                Today's Reflection Prompt
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#666666',
                                fontStyle: 'italic'
                            }}>
                                "What challenged you today, and what did you learn from it?"
                            </div>
                        </div>

                        {/* Prompt Response Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px'
                            }}>
                                Your Response
                            </div>
                            <textarea
                                value={eveningReflectionData.promptResponse}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, promptResponse: e.target.value }))}
                                placeholder="Reflect on today's prompt..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Overall Day Card - Scrolling Picker */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px'
                            }}>
                                Overall Day
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                height: '70px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    width: '70px',
                                    height: '60px',
                                    background: 'rgba(5, 133, 133, 0.12)',
                                    borderRadius: '12px',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '1px',
                                    height: '50px',
                                    background: 'rgba(5, 133, 133, 0.3)',
                                    left: 'calc(50% - 40px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '1px',
                                    height: '50px',
                                    background: 'rgba(5, 133, 133, 0.3)',
                                    left: 'calc(50% + 40px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '60px',
                                    height: '100%',
                                    background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                    left: 0,
                                    top: 0,
                                    pointerEvents: 'none',
                                    zIndex: 3
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '60px',
                                    height: '100%',
                                    background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                    right: 0,
                                    top: 0,
                                    pointerEvents: 'none',
                                    zIndex: 3
                                }} />
                                <div
                                    className="swipeable-picker-container"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        overflowX: 'auto',
                                        overflowY: 'hidden',
                                        scrollSnapType: 'x mandatory',
                                        WebkitOverflowScrolling: 'touch',
                                        scrollBehavior: 'smooth',
                                        padding: '0 calc(50% - 30px)',
                                        width: '100%',
                                        touchAction: 'pan-x'
                                    }}
                                    onScroll={(e) => {
                                        const container = e.target;
                                        const scrollLeft = container.scrollLeft;
                                        const itemWidth = 80;
                                        const centerIndex = Math.round(scrollLeft / itemWidth);
                                        setEveningReflectionData(prev => ({ ...prev, overallDay: centerIndex }));
                                    }}
                                >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <div
                                            key={num}
                                            style={{
                                                minWidth: '60px',
                                                height: '60px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: eveningReflectionData.overallDay === num ? '36px' : '24px',
                                                fontWeight: eveningReflectionData.overallDay === num ? 'bold' : '400',
                                                color: eveningReflectionData.overallDay === num ? '#058585' : '#CCCCCC',
                                                transition: 'all 0.2s',
                                                scrollSnapAlign: 'center',
                                                cursor: 'pointer',
                                                userSelect: 'none'
                                            }}
                                            onClick={(e) => {
                                                triggerHaptic('light');
                                                setEveningReflectionData(prev => ({ ...prev, overallDay: num }));
                                                const container = e.target.closest('.swipeable-picker-container');
                                                if (container) {
                                                    const itemWidth = 80;
                                                    container.scrollLeft = num * itemWidth;
                                                }
                                            }}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Challenges Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px'
                            }}>
                                Today's Challenges
                            </div>
                            <textarea
                                value={eveningReflectionData.challenges}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, challenges: e.target.value }))}
                                placeholder="What challenges did you face today?"
                                style={{
                                    width: '100%',
                                    minHeight: '60px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Gratitude Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px'
                            }}>
                                What I'm Grateful For
                            </div>
                            <textarea
                                value={eveningReflectionData.gratitude}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, gratitude: e.target.value }))}
                                placeholder="What are you grateful for today?"
                                style={{
                                    width: '100%',
                                    minHeight: '60px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Tomorrow's Goal Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000',
                                marginBottom: '8px'
                            }}>
                                Tomorrow's Goal
                            </div>
                            <textarea
                                value={eveningReflectionData.tomorrowGoal}
                                onChange={(e) => setEveningReflectionData(prev => ({ ...prev, tomorrowGoal: e.target.value }))}
                                placeholder="What's your goal for tomorrow?"
                                style={{
                                    width: '100%',
                                    minHeight: '60px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    color: '#000000',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <button
                                onClick={async () => {
                                    triggerHaptic('success');
                                    await handleEveningReflection(eveningReflectionData);
                                }}
                                disabled={eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal}
                                style={{
                                    width: '120px',
                                    height: '40px',
                                    background: (eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal) ? '#cccccc' : '#058585',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '400',
                                    cursor: (eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Submit
                            </button>
                        </div>
                            </>
                        )}

                        {/* Reflection Streak Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={async () => {
                            triggerHaptic('light');
                            await loadStreakReflections();
                            setShowReflectionStreakModal(true);
                        }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Reflection Streak
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {reflectionStreak > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#058585'
                                        }}>
                                            {reflectionStreak} {reflectionStreak === 1 ? 'day' : 'days'}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        Start reflecting daily!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Header */}
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '400',
                            color: '#000000',
                            marginBottom: '10px',
                            marginTop: '20px'
                        }}>
                            Reflection Stats
                        </h3>

                        {/* Total This Month Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={async () => {
                            triggerHaptic('light');
                            setShowCalendarHeatmapModal(true);
                            await loadCalendarHeatmapData();
                        }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Total Reflections
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {reflectionStats.totalThisMonth > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#000000'
                                        }}>
                                            {reflectionStats.totalThisMonth}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        0
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Avg Daily Score Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={async () => {
                            triggerHaptic('light');
                            await loadOverallDayWeekData();
                            setShowOverallDayInsightsModal(true);
                        }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Avg Daily Score
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {reflectionStats.avgDailyScore > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#000000'
                                        }}>
                                            {reflectionStats.avgDailyScore}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        No data
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Top Gratitude Theme Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            if (reflectionStats.gratitudeThemes && reflectionStats.gratitudeThemes.length > 0) {
                                triggerHaptic('light');
                                setShowGratitudeThemesModal(true);
                            }
                        }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Top Gratitude Theme
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {reflectionStats.topGratitudeTheme ? (
                                    <>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            color: '#058585'
                                        }}>
                                            {reflectionStats.topGratitudeTheme}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        No gratitudes yet
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Longest Streak Stat Card */}
                        <div style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            triggerHaptic('light');
                            setShowReflectionStreaksModal(true);
                        }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                color: '#000000'
                            }}>
                                Longest Streak
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {reflectionStreakData.longestStreak > 0 ? (
                                    <>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: '#000000'
                                        }}>
                                            🔥 {reflectionStreakData.longestStreak} {reflectionStreakData.longestStreak === 1 ? 'day' : 'days'}
                                        </span>
                                        <i data-lucide="chevron-right" style={{ width: '16px', height: '16px', color: '#666666' }}></i>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '400',
                                        color: '#999999',
                                        fontStyle: 'italic'
                                    }}>
                                        No data yet
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* View Past Reflections Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            triggerHaptic('light');
                            setShowPastReflectionsModal(true);
                        }}>
                            View Past Reflections
                        </button>

                        {/* Quick Tools Section */}
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#000000',
                            marginTop: '24px',
                            marginBottom: '12px'
                        }}>
                            Quick Tools
                        </h3>

                        {/* Gratitude Entry Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#058585',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={() => {
                            triggerHaptic('light');
                            setShowGratitudeModal(true);
                        }}>
                            <i data-lucide="heart" style={{ width: '16px', height: '16px' }}></i>
                            Gratitude Entry
                        </button>

                        {/* Gratitude Journal Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            triggerHaptic('light');
                            await loadGratitudeJournal();
                            await loadGratitudeInsights();
                            setShowGratitudeJournalModal(true);
                        }}>
                            <i data-lucide="book-heart" style={{ width: '16px', height: '16px' }}></i>
                            Gratitude Journal
                        </button>

                        {/* Challenges History Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            triggerHaptic('light');
                            await loadChallengesHistory();
                            await loadChallengesInsights();
                            setShowChallengesHistoryModal(true);
                        }}>
                            <i data-lucide="alert-triangle" style={{ width: '16px', height: '16px' }}></i>
                            Challenges History
                        </button>

                        {/* Goal Achievement Tracker Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={async () => {
                            triggerHaptic('light');
                            await loadGoalAchievementData();
                            setShowTomorrowGoalsModal(true);
                        }}>
                            <i data-lucide="trophy" style={{ width: '16px', height: '16px' }}></i>
                            Goal Tracker
                        </button>

                        {/* Share Reflections Button */}
                        <button style={{
                            width: '100%',
                            height: '48px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #058585',
                            color: '#058585',
                            fontSize: '14px',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onClick={() => {
                            shareReflections();
                        }}>
                            <i data-lucide="share-2" style={{ width: '16px', height: '16px' }}></i>
                            Share Reflections
                        </button>
                    </div>
                )}

                {/* THE GOLDEN THREAD TAB */}
                {activeTaskTab === 'golden' && (
                    <div style={{ padding: '16px 5%' }}>
                        {React.createElement(window.GLRSApp.components.GoalsTasksView, {
                            user: user,
                            goals: goals,
                            assignments: assignments,
                            onAssignmentComplete: handleAssignmentComplete,
                            onReflectionSave: handleReflectionSave,
                            onShowGratitudeModal: () => setShowGratitudeModal(true),
                            onDueTodayChange: setDueToday
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

window.GLRSApp.components.TasksTab = TasksTab;
console.log('✅ TasksTab component loaded successfully');

                  