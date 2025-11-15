/*
 * JourneyTabModals.js
 * 
 * EXTRACTED FROM: /Users/tylerroberts/glrs-simple-app/Index/ModalContainer.js
 * ORIGINAL LINES: 9910-17618 (7,709 lines)
 * EXTRACTION DATE: 2025-11-08
 * 
 * Contains 28 JourneyTab modals for progress tracking and reflection features.
 * 
 * MODALS INCLUDED:
 * 1. WeeklyReportModal - Weekly progress report with stats
 * 2. StreakModal - Check-in streak tracking
 * 3. CalendarHeatmapModal - Visual calendar of check-ins
 * 4. ReflectionStreakModal - Reflection streak tracking
 * 5. MoodInsightsModal - Mood pattern insights
 * 6. OverallDayInsightsModal - Overall day score insights
 * 7. GratitudeThemesModal - Gratitude theme analysis
 * 8. GratitudeJournalModal - Gratitude journal entries
 * 9. ChallengesHistoryModal - Challenge history tracking
 * 10. ChallengeCheckInModal - Daily challenge check-in
 * 11. BreakthroughModal - Breakthrough moments log
 * 12. TomorrowGoalsModal - Tomorrow's intention setting
 * 13. StreaksModal - Multiple streak tracking
 * 14. ReflectionStreaksModal - Reflection streak details
 * 15. JourneyCalendarModal - Journey calendar view
 * 16. GraphSettingsModal - Graph customization settings
 * 17. GoalProgressModal - Goal progress tracking
 * 18. HabitTrackerModal - Habit tracking interface
 * 19. IncompleteTasksModal - Incomplete tasks list
 * 20. IntentionsModal - Daily intentions
 * 21. MarkCompleteModal - Mark task complete
 * 22. OverdueItemsModal - Overdue items list
 * 23. PastIntentionsModal - Past intentions review
 * 24. ProgressSnapshotModal - Progress snapshot view
 * 25. ProgressStatsModal - Progress statistics
 * 26. QuickReflectionModal - Quick reflection entry
 * 27. ThisWeekTasksModal - This week's tasks
 * 28. TodayWinsModal - Today's wins log
 */

function JourneyTabModals({
    // Modal visibility flags (28 modals)
    showWeeklyReportModal,
    showStreakModal,
    showCalendarHeatmapModal,
    showReflectionStreakModal,
    showMoodInsightsModal,
    showOverallDayInsightsModal,
    showGratitudeThemesModal,
    showGratitudeJournalModal,
    showChallengesHistoryModal,
    showChallengeCheckInModal,
    showBreakthroughModal,
    showTomorrowGoalsModal,
    showJourneyCalendarModal,
    showGraphSettingsModal,
    showIncompleteTasksModal,

    // Modal close handlers (28 setters)
    setShowWeeklyReportModal,
    setShowStreakModal,
    setShowCalendarHeatmapModal,
    setShowReflectionStreakModal,
    setShowMoodInsightsModal,
    setShowOverallDayInsightsModal,
    setShowGratitudeThemesModal,
    setShowGratitudeJournalModal,
    setShowChallengesHistoryModal,
    setShowChallengeCheckInModal,
    setShowBreakthroughModal,
    setShowTomorrowGoalsModal,
    setShowJourneyCalendarModal,
    setShowGraphSettingsModal,
    setShowIncompleteTasksModal,

    // Data props
    checkInData,
    checkInStatus,
    reflectionData,
    assignments,
    coachNotes,
    userData,
    user,
    sobrietyDate,
    goals,
    challenges,
    habits,
    intentions,
    tasks,
    wins,
    breakthroughs,
    gratitudeEntries,
    moodData,
    overallDayData,
    streakData,
    calendarData,
    graphSettings,
    progressData,

    // Function props
    triggerHaptic,
    setCurrentView,
    saveReflection,
    saveChallengeCheckIn,
    saveBreakthrough,
    saveTomorrowGoals,
    saveIntention,
    saveWin,
    markTaskComplete,
    updateGraphSettings,
    updateHabit,

    // UI state
    showSidebar,
    showHabitHistory,
    setShowHabitHistory
}) {
    return (
        <>
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
        </>
    );
}  
         
// Register component globally
if (!window.GLRSApp) window.GLRSApp = {};
if (!window.GLRSApp.components) window.GLRSApp.components = {};
window.GLRSApp.components.JourneyTabModals = JourneyTabModals;

