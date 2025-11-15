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
  return /*#__PURE__*/React.createElement(React.Fragment, null, showWeeklyReportModal && (() => {
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
    const weekCheckInRate = Math.round(weekCheckInCount / 7 * 100);
    const weekMoodScores = thisWeekCheckIns.filter(c => c.morningData?.mood !== undefined || c.eveningData?.mood !== undefined).map(c => c.morningData?.mood ?? c.eveningData?.mood);
    const weekAvgMood = weekMoodScores.length > 0 ? (weekMoodScores.reduce((a, b) => a + b, 0) / weekMoodScores.length).toFixed(1) : 'N/A';
    const weekCravingsScores = thisWeekCheckIns.filter(c => c.morningData?.craving !== undefined || c.eveningData?.craving !== undefined).map(c => c.morningData?.craving ?? c.eveningData?.craving);
    const weekAvgCravings = weekCravingsScores.length > 0 ? (weekCravingsScores.reduce((a, b) => a + b, 0) / weekCravingsScores.length).toFixed(1) : 'N/A';
    const weekAnxietyScores = thisWeekCheckIns.filter(c => c.morningData?.anxiety !== undefined || c.eveningData?.anxiety !== undefined).map(c => c.morningData?.anxiety ?? c.eveningData?.anxiety);
    const weekAvgAnxiety = weekAnxietyScores.length > 0 ? (weekAnxietyScores.reduce((a, b) => a + b, 0) / weekAnxietyScores.length).toFixed(1) : 'N/A';
    const weekSleepScores = thisWeekCheckIns.filter(c => c.morningData?.sleep !== undefined || c.eveningData?.sleep !== undefined).map(c => c.morningData?.sleep ?? c.eveningData?.sleep);
    const weekAvgSleep = weekSleepScores.length > 0 ? (weekSleepScores.reduce((a, b) => a + b, 0) / weekSleepScores.length).toFixed(1) : 'N/A';

    // Reflection stats for the week
    const thisWeekReflections = reflectionData.filter(r => {
      const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      return reflectionDate >= weekAgo;
    });
    const weekReflectionCount = thisWeekReflections.length;
    const weekDailyScores = thisWeekReflections.filter(r => r.dailyScore).map(r => r.dailyScore);
    const weekAvgDailyScore = weekDailyScores.length > 0 ? (weekDailyScores.reduce((a, b) => a + b, 0) / weekDailyScores.length).toFixed(1) : 'N/A';

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
    const weekCompletionRate = weekAssignmentsTotal > 0 ? Math.round(weekAssignmentsCompleted / weekAssignmentsTotal * 100) : 0;

    // Coach notes for the week
    const thisWeekCoachNotes = coachNotes.filter(n => {
      if (!n.createdAt) return false;
      const noteDate = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
      return noteDate >= weekAgo;
    });
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
      },
      onClick: () => setShowWeeklyReportModal(false)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFFFF',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 0,
        background: '#FFFFFF',
        zIndex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar-check",
      style: {
        width: '24px',
        height: '24px',
        color: '#058585'
      }
    }), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#000000'
      }
    }, "Weekly Progress Report")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowWeeklyReportModal(false),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "x",
      style: {
        width: '20px',
        height: '20px',
        color: '#666666'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666',
        marginTop: '8px'
      }
    }, "Last 7 Days \u2022 ", new Date(weekAgo).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }), " - ", new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '24px',
        padding: '16px',
        background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
        borderRadius: '12px',
        color: '#FFFFFF'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '20px',
        height: '20px'
      }
    }), /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold'
      }
    }, "Check-In Summary")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        opacity: 0.9
      }
    }, "Check-In Rate"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold'
      }
    }, weekCheckInRate, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        opacity: 0.8
      }
    }, weekCheckInCount, "/7 days")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        opacity: 0.9
      }
    }, "Avg Mood"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold'
      }
    }, weekAvgMood), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        opacity: 0.8
      }
    }, "out of 10")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        opacity: 0.9
      }
    }, "Avg Cravings"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold'
      }
    }, weekAvgCravings), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        opacity: 0.8
      }
    }, "intensity")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        opacity: 0.9
      }
    }, "Avg Anxiety"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold'
      }
    }, weekAvgAnxiety), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        opacity: 0.8
      }
    }, "level"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        opacity: 0.9
      }
    }, "Avg Sleep Quality"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold'
      }
    }, weekAvgSleep), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        opacity: 0.8
      }
    }, "out of 10"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '24px',
        padding: '16px',
        background: '#F5F5F5',
        borderRadius: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "book-open",
      style: {
        width: '20px',
        height: '20px',
        color: '#058585'
      }
    }), /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000'
      }
    }, "Reflection Summary")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Reflections"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#058585'
      }
    }, weekReflectionCount)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Avg Daily Score"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#058585'
      }
    }, weekAvgDailyScore)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Gratitudes"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#058585'
      }
    }, weekGratitudes)))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '24px',
        padding: '16px',
        background: '#F5F5F5',
        borderRadius: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clipboard-check",
      style: {
        width: '20px',
        height: '20px',
        color: '#058585'
      }
    }), /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000'
      }
    }, "Assignment Progress")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Completed"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#058585'
      }
    }, weekAssignmentsCompleted), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999999'
      }
    }, "of ", weekAssignmentsTotal, " assignments")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Completion Rate"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#058585'
      }
    }, weekCompletionRate, "%")))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '24px',
        padding: '16px',
        background: '#F5F5F5',
        borderRadius: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "flame",
      style: {
        width: '20px',
        height: '20px',
        color: '#FF6B6B'
      }
    }), /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000'
      }
    }, "Current Streaks")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Check-In Streak"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#FF6B6B'
      }
    }, checkInStreak), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999999'
      }
    }, "days")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, "Reflection Streak"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#FF6B6B'
      }
    }, reflectionStreak), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999999'
      }
    }, "days")))), thisWeekCoachNotes.length > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '16px',
        padding: '16px',
        background: '#FFF9E6',
        borderRadius: '12px',
        border: '1px solid #FFE066'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "message-circle",
      style: {
        width: '20px',
        height: '20px',
        color: '#F59E0B'
      }
    }), /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000'
      }
    }, "Coach Notes This Week")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666',
        marginBottom: '8px'
      }
    }, thisWeekCoachNotes.length, " note", thisWeekCoachNotes.length !== 1 ? 's' : '', " from your coach"), thisWeekCoachNotes.slice(0, 3).map((note, index) => /*#__PURE__*/React.createElement("div", {
      key: note.id || index,
      style: {
        padding: '10px',
        background: '#FFFFFF',
        borderRadius: '8px',
        marginBottom: index < Math.min(2, thisWeekCoachNotes.length - 1) ? '8px' : 0,
        border: '1px solid #E5E5E5'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999999',
        marginBottom: '4px'
      }
    }, note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) : 'Recent'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#000000',
        lineHeight: '1.4'
      }
    }, note.note?.substring(0, 100), note.note?.length > 100 ? '...' : ''))), thisWeekCoachNotes.length > 3 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#058585',
        marginTop: '8px',
        textAlign: 'center'
      }
    }, "+ ", thisWeekCoachNotes.length - 3, " more note", thisWeekCoachNotes.length - 3 !== 1 ? 's' : '')) : /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '16px',
        padding: '16px',
        background: '#F5F5F5',
        borderRadius: '12px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "message-circle",
      style: {
        width: '32px',
        height: '32px',
        color: '#CCCCCC',
        marginBottom: '8px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#999999'
      }
    }, "No coach notes this week")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        borderRadius: '12px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: '8px'
      }
    }, weekCheckInRate >= 85 && weekReflectionCount >= 5 ? 'Outstanding Week!' : weekCheckInRate >= 70 && weekReflectionCount >= 3 ? 'Great Progress!' : weekCheckInRate >= 50 ? 'Keep Going!' : 'You\'ve Got This!'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#1B5E20',
        lineHeight: '1.5'
      }
    }, weekCheckInRate >= 85 && weekReflectionCount >= 5 ? 'You\'re crushing it! Your consistency is inspiring.' : weekCheckInRate >= 70 && weekReflectionCount >= 3 ? 'You\'re making excellent progress. Keep up the momentum!' : weekCheckInRate >= 50 ? 'You\'re building great habits. Every day counts!' : 'Remember, progress isn\'t always linear. We\'re here to support you.')), /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
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
      },
      style: {
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
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "share-2",
      style: {
        width: '20px',
        height: '20px'
      }
    }), "Export / Share Report"))));
  })(), showStreakModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowStreakModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '400px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Check-In Streak"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowStreakModal(false),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowStreakModal(false),
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-left",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "Back to Check-In"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#E0F7FA',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#058585',
      marginBottom: '4px'
    }
  }, checkInStreak, " ", checkInStreak === 1 ? 'Day' : 'Days'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, "Current Streak")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "All Check-Ins in Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, streakCheckIns.length > 0 ? streakCheckIns.map((checkIn, index) => {
    const checkInDate = checkIn.createdAt?.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
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
    return /*#__PURE__*/React.createElement("div", {
      key: checkIn.id,
      style: {
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '8px',
        padding: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: '6px'
      }
    }, "Day ", streakCheckIns.length - index, " - ", dateStr), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: '400',
        color: '#666666',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Mood: ", mood), /*#__PURE__*/React.createElement("span", null, "Craving: ", craving), /*#__PURE__*/React.createElement("span", null, "Anxiety: ", anxiety), /*#__PURE__*/React.createElement("span", null, "Sleep: ", sleep)));
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      textAlign: 'center',
      color: '#999999',
      fontSize: '14px'
    }
  }, "No check-ins in streak yet. Start checking in daily to build your streak!"))))), showCalendarHeatmapModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => {
      setShowCalendarHeatmapModal(false);
      setSelectedCalendarDay(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      position: 'sticky',
      top: 0,
      background: '#FFFFFF',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar",
    style: {
      width: '24px',
      height: '24px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#000000'
    }
  }, "Check-In Calendar")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowCalendarHeatmapModal(false);
      setSelectedCalendarDay(null);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginBottom: '15px'
    }
  }, ['week', 'month'].map(mode => /*#__PURE__*/React.createElement("button", {
    key: mode,
    onClick: () => {
      triggerHaptic('light');
      setCalendarViewMode(mode);
      setSelectedCalendarDay(null);
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": mode === 'week' ? 'calendar-days' : 'calendar',
    style: {
      width: '16px',
      height: '16px'
    }
  }), mode.charAt(0).toUpperCase() + mode.slice(1)))), calendarViewMode === 'month' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: '#F8F9FA',
      borderRadius: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      const newMonth = new Date(calendarCurrentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setCalendarCurrentMonth(newMonth);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#058585",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "15 18 9 12 15 6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#000000'
    }
  }, calendarCurrentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      const newMonth = new Date(calendarCurrentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setCalendarCurrentMonth(newMonth);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#058585",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  })))), calendarViewMode === 'week' && (() => {
    // Get Monday as start of week (ISO 8601 standard)
    const getMonday = d => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(date.setDate(diff));
    };
    const monday = getMonday(calendarCurrentWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        background: '#F8F9FA',
        borderRadius: '8px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        triggerHaptic('light');
        const newWeek = new Date(calendarCurrentWeek);
        newWeek.setDate(newWeek.getDate() - 7);
        setCalendarCurrentWeek(newWeek);
        setSelectedCalendarDay(null);
      },
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#058585",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#058585",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })), monday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }), " - ", sunday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        triggerHaptic('light');
        const newWeek = new Date(calendarCurrentWeek);
        newWeek.setDate(newWeek.getDate() + 7);
        setCalendarCurrentWeek(newWeek);
        setSelectedCalendarDay(null);
      },
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#058585",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    }))));
  })(), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      const today = new Date();
      setCalendarCurrentMonth(today);
      setCalendarCurrentWeek(today);
      setSelectedCalendarDay(null);
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-check",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Jump to Today"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '15px',
      padding: '15px',
      background: '#F8F9FA',
      borderRadius: '8px',
      border: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info",
    style: {
      width: '16px',
      height: '16px',
      color: '#058585'
    }
  }), "Daily Check-In Status"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      background: '#00A86B',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666'
    }
  }, "Morning & Evening Check-Ins Completed")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      background: '#7FD4AA',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666'
    }
  }, "Only Morning OR Evening Completed")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      background: '#E5E5E5',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666'
    }
  }, "No Check-Ins Completed"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, (() => {
    // Get user's timezone
    const userTimezone = user.timezone || "America/Los_Angeles";

    // Helper function to get color based on check-in count
    const getColorForCount = count => {
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
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '2px solid #E5E5E5'
        }
      }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: '12px',
          fontWeight: '600',
          color: '#666666',
          textAlign: 'center'
        }
      }, day))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }
      }, weeks.map((week, weekIndex) => /*#__PURE__*/React.createElement("div", {
        key: weekIndex,
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }
      }, week.map((day, dayIndex) => {
        if (!day) {
          return /*#__PURE__*/React.createElement("div", {
            key: dayIndex,
            style: {
              aspectRatio: '1'
            }
          });
        }
        const isToday = day.dateKey === new Date().toISOString().split('T')[0];
        const isSelected = selectedCalendarDay?.dateKey === day.dateKey;
        return /*#__PURE__*/React.createElement("div", {
          key: dayIndex,
          onClick: () => {
            if (day.data) {
              triggerHaptic('light');
              setSelectedCalendarDay(day);
            }
          },
          style: {
            aspectRatio: '1',
            borderRadius: '8px',
            background: getColorForCount(day.count),
            border: isToday ? '3px solid #FF8C00' : isSelected ? '3px solid #058585' : '1px solid #DDD',
            cursor: day.data ? 'pointer' : 'default',
            transition: 'all 0.2s',
            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '14px',
            fontWeight: isToday ? '700' : '500',
            color: day.count > 0 ? '#FFFFFF' : '#999999'
          }
        }, day.day), day.data && /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'absolute',
            bottom: '4px',
            display: 'flex',
            gap: '2px'
          }
        }, day.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
          style: {
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#FFFFFF'
          }
        }), day.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
          style: {
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#FFFFFF'
          }
        })));
      })))), selectedCalendarDay && selectedCalendarDay.data && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
          borderRadius: '12px',
          border: '2px solid #058585',
          animation: 'fadeIn 0.3s'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '18px',
          fontWeight: '600',
          color: '#000000',
          marginBottom: '4px'
        }
      }, selectedCalendarDay.date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666666',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "check-circle",
        style: {
          width: '14px',
          height: '14px',
          color: '#00A86B'
        }
      }), selectedCalendarDay.count, " check-in", selectedCalendarDay.count !== 1 ? 's' : '', " completed")), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSelectedCalendarDay(null),
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "x",
        style: {
          width: '18px',
          height: '18px',
          color: '#666666'
        }
      }))), selectedCalendarDay.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: selectedCalendarDay.data.eveningCheckIn ? '16px' : '0',
          padding: '15px',
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E5E5'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#058585',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "sunrise",
        style: {
          width: '16px',
          height: '16px'
        }
      }), "Morning Check-In"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "smile",
        style: {
          width: '16px',
          height: '16px',
          color: '#666666'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, "Mood: ", /*#__PURE__*/React.createElement("strong", {
        style: {
          color: '#000000'
        }
      }, selectedCalendarDay.data.morningCheckIn.mood ?? 'N/A'))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "flame",
        style: {
          width: '16px',
          height: '16px',
          color: '#666666'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, "Craving: ", /*#__PURE__*/React.createElement("strong", {
        style: {
          color: '#000000'
        }
      }, selectedCalendarDay.data.morningCheckIn.craving ?? 'N/A'))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "alert-circle",
        style: {
          width: '16px',
          height: '16px',
          color: '#666666'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, "Anxiety: ", /*#__PURE__*/React.createElement("strong", {
        style: {
          color: '#000000'
        }
      }, selectedCalendarDay.data.morningCheckIn.anxiety ?? 'N/A'))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "moon",
        style: {
          width: '16px',
          height: '16px',
          color: '#666666'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, "Sleep: ", /*#__PURE__*/React.createElement("strong", {
        style: {
          color: '#000000'
        }
      }, selectedCalendarDay.data.morningCheckIn.sleep ?? 'N/A'))))), selectedCalendarDay.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '15px',
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E5E5'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#058585',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "sunset",
        style: {
          width: '16px',
          height: '16px'
        }
      }), "Evening Check-In"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666666',
          lineHeight: '1.6'
        }
      }, selectedCalendarDay.data.eveningCheckIn.overallDay !== undefined && /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("strong", null, "Overall Day:"), " ", selectedCalendarDay.data.eveningCheckIn.overallDay, "/10"), selectedCalendarDay.data.eveningCheckIn.gratitude && /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("strong", null, "Gratitude:"), " ", selectedCalendarDay.data.eveningCheckIn.gratitude), selectedCalendarDay.data.eveningCheckIn.challenges && /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("strong", null, "Challenges:"), " ", selectedCalendarDay.data.eveningCheckIn.challenges), selectedCalendarDay.data.eveningCheckIn.tomorrowGoal && /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("strong", null, "Tomorrow's Goal:"), " ", selectedCalendarDay.data.eveningCheckIn.tomorrowGoal), selectedCalendarDay.data.eveningCheckIn.promptResponse && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Reflection:"), " ", selectedCalendarDay.data.eveningCheckIn.promptResponse)))));
    } else {
      // Week view - Monday to Sunday
      // Get Monday as start of week (ISO 8601 standard)
      const getMonday = d => {
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
          dayName: date.toLocaleDateString('en-US', {
            weekday: 'short'
          }),
          count: dayData ? dayData.count : 0,
          data: dayData
        });
      }
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '15px',
          background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(5, 133, 133, 0.2)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#000000',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "calendar-days",
        style: {
          width: '16px',
          height: '16px',
          color: '#058585'
        }
      }), weekDays[0].date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      }), " - ", weekDays[6].date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, (() => {
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
      })())), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }
      }, weekDays.map((day, dayIndex) => {
        const isToday = day.dateKey === new Date().toISOString().split('T')[0];
        const isSelected = selectedCalendarDay?.dateKey === day.dateKey;
        return /*#__PURE__*/React.createElement("div", {
          key: dayIndex,
          onClick: () => {
            if (day.data) {
              triggerHaptic('light');
              setSelectedCalendarDay(day);
            }
          },
          style: {
            padding: '16px',
            borderRadius: '12px',
            background: getColorForCount(day.count),
            border: isToday ? '3px solid #FF8C00' : isSelected ? '3px solid #058585' : '2px solid #E5E5E5',
            cursor: day.data ? 'pointer' : 'default',
            transition: 'all 0.2s',
            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
            boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: day.count > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.5)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            fontWeight: '600',
            color: day.count > 0 ? '#FFFFFF' : '#999999'
          }
        }, day.dayName.toUpperCase()), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '18px',
            fontWeight: '700',
            color: day.count > 0 ? '#FFFFFF' : '#999999'
          }
        }, day.day)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '15px',
            fontWeight: '600',
            color: day.count > 0 ? '#FFFFFF' : '#000000',
            marginBottom: '4px'
          }
        }, isToday && /*#__PURE__*/React.createElement("span", {
          style: {
            marginRight: '6px'
          }
        }, "(Today)"), day.date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            color: day.count > 0 ? 'rgba(255,255,255,0.9)' : '#666666',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, day.count === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x-circle",
          style: {
            width: '14px',
            height: '14px'
          }
        }), "No check-ins"), day.count === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check",
          style: {
            width: '14px',
            height: '14px'
          }
        }), "1 check-in completed"), day.count === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-check",
          style: {
            width: '14px',
            height: '14px'
          }
        }), "Both check-ins completed")))), day.data && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: '8px'
          }
        }, day.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.3)',
            fontSize: '11px',
            fontWeight: '600',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "sunrise",
          style: {
            width: '12px',
            height: '12px'
          }
        }), "AM"), day.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.3)',
            fontSize: '11px',
            fontWeight: '600',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "sunset",
          style: {
            width: '12px',
            height: '12px'
          }
        }), "PM"))), isSelected && day.data && /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.3)'
          }
        }, day.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: day.data.eveningCheckIn ? '12px' : '0',
            padding: '12px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "sunrise",
          style: {
            width: '14px',
            height: '14px'
          }
        }), "Morning Check-In"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.9)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "smile",
          style: {
            width: '12px',
            height: '12px'
          }
        }), "Mood: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.mood ?? 'N/A')), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "flame",
          style: {
            width: '12px',
            height: '12px'
          }
        }), "Craving: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.craving ?? 'N/A')), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "alert-circle",
          style: {
            width: '12px',
            height: '12px'
          }
        }), "Anxiety: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.anxiety ?? 'N/A')), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "moon",
          style: {
            width: '12px',
            height: '12px'
          }
        }), "Sleep: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.sleep ?? 'N/A')))), day.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '12px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "sunset",
          style: {
            width: '14px',
            height: '14px'
          }
        }), "Evening Check-In"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.5'
          }
        }, day.data.eveningCheckIn.overallDay !== undefined && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '6px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Overall Day:"), " ", day.data.eveningCheckIn.overallDay, "/10"), day.data.eveningCheckIn.gratitude && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '6px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Gratitude:"), " ", day.data.eveningCheckIn.gratitude), day.data.eveningCheckIn.challenges && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '6px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Challenges:"), " ", day.data.eveningCheckIn.challenges), day.data.eveningCheckIn.tomorrowGoal && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '6px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Tomorrow's Goal:"), " ", day.data.eveningCheckIn.tomorrowGoal), day.data.eveningCheckIn.promptResponse && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Reflection:"), " ", day.data.eveningCheckIn.promptResponse)))));
      })));
    }
  })()))), showReflectionStreakModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowReflectionStreakModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '400px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Reflection Streak"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowReflectionStreakModal(false),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowReflectionStreakModal(false),
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-left",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "Back to Reflections"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#E0F7FA',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#058585',
      marginBottom: '4px'
    }
  }, reflectionStreak, " ", reflectionStreak === 1 ? 'Day' : 'Days'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, "Current Streak")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "All Reflections in Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, streakReflections.length > 0 ? streakReflections.map((reflection, index) => {
    const reflectionDate = reflection.createdAt?.toDate ? reflection.createdAt.toDate() : new Date(reflection.createdAt);
    const dateStr = reflectionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const overallDay = reflection.overallDay ?? reflection.dailyScore ?? 'N/A';
    const hasGratitude = reflection.gratitude && reflection.gratitude.length > 0;

    // Score color coding
    const scoreColor = overallDay >= 8 ? '#4CAF50' : overallDay >= 6 ? '#FFA726' : overallDay >= 4 ? '#FF7043' : overallDay !== 'N/A' ? '#DC143C' : '#999999';
    return /*#__PURE__*/React.createElement("div", {
      key: reflection.id,
      style: {
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '8px',
        padding: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#000000'
      }
    }, "Day ", streakReflections.length - index, " - ", dateStr), hasGratitude && /*#__PURE__*/React.createElement("i", {
      "data-lucide": "heart",
      style: {
        width: '16px',
        height: '16px',
        color: '#FF6B6B'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "smile",
      style: {
        width: '16px',
        height: '16px',
        color: scoreColor
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: scoreColor
      }
    }, "Overall Day Score: ", overallDay, overallDay !== 'N/A' ? '/10' : '')));
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      textAlign: 'center',
      color: '#999999',
      fontSize: '14px'
    }
  }, "No reflections in streak yet. Start reflecting daily to build your streak!"))))), showMoodInsightsModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowMoodInsightsModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Mood Insights"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowMoodInsightsModal(false),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666',
      marginBottom: '8px'
    }
  }, "7-Day Average"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#058585',
      marginBottom: '4px'
    }
  }, moodWeekData.thisWeekAvg || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: moodWeekData.difference > 0 ? '#00A86B' : moodWeekData.difference < 0 ? '#DC143C' : '#666666'
    }
  }, moodWeekData.difference > 0 ? '↑' : moodWeekData.difference < 0 ? '↓' : '—', " ", moodWeekData.difference > 0 ? '+' : '', moodWeekData.difference || '0', " from last week")), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Weekly Breakdown"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, moodWeekData.weekData && moodWeekData.weekData.map((dayData, index) => {
    const score = dayData.mood;
    const barWidth = score ? score / 10 * 100 : 0; // Out of 10, not 5!

    return /*#__PURE__*/React.createElement("div", {
      key: dayData.dateKey,
      style: {
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '14px',
        fontWeight: '400',
        color: '#000000'
      }
    }, dayData.dayName), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: score ? '#058585' : '#999999'
      }
    }, score ? score.toFixed(1) : 'No check-in')), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '8px',
        background: '#E5E5E5',
        borderRadius: '4px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${barWidth}%`,
        height: '100%',
        background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
        transition: 'width 0.3s'
      }
    })));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowMoodInsightsModal(false);
    },
    style: {
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
    }
  }, "Back")))), showOverallDayInsightsModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowOverallDayInsightsModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Overall Day Insights"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowOverallDayInsightsModal(false),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666',
      marginBottom: '8px'
    }
  }, "7-Day Average"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#058585',
      marginBottom: '4px'
    }
  }, overallDayWeekData.thisWeekAvg || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: overallDayWeekData.difference > 0 ? '#00A86B' : overallDayWeekData.difference < 0 ? '#DC143C' : '#666666'
    }
  }, overallDayWeekData.difference > 0 ? '↑' : overallDayWeekData.difference < 0 ? '↓' : '—', " ", overallDayWeekData.difference > 0 ? '+' : '', overallDayWeekData.difference || '0', " from last week")), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Last 7 Reflections"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, overallDayWeekData.weekData && overallDayWeekData.weekData.map((dayData, index) => {
    const score = dayData.overallDay;
    const barWidth = score ? score / 10 * 100 : 0; // Out of 10

    return /*#__PURE__*/React.createElement("div", {
      key: dayData.dateKey,
      style: {
        marginBottom: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#000000'
      }
    }, dayData.dayName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666666'
      }
    }, dayData.date ? new Date(dayData.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : '')), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#058585'
      }
    }, score ? score.toFixed(1) : '—')), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '8px',
        background: '#E5E5E5',
        borderRadius: '4px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${barWidth}%`,
        height: '100%',
        background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
        transition: 'width 0.3s'
      }
    })));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowOverallDayInsightsModal(false);
    },
    style: {
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
    }
  }, "Back")))), showGratitudeThemesModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowGratitudeThemesModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "\uD83D\uDC9A Gratitude Themes"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowGratitudeThemesModal(false),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '20px'
    }
  }, "The most common themes from your gratitude reflections, ranked by frequency."), reflectionStats.gratitudeThemes && reflectionStats.gratitudeThemes.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, reflectionStats.gratitudeThemes.map((theme, index) => {
    const maxCount = reflectionStats.gratitudeThemes[0].count;
    const barWidth = theme.count / maxCount * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      style: {
        marginBottom: '16px',
        padding: '14px',
        background: index === 0 ? 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(5,133,133,0.1) 100%)' : '#F8F9FA',
        borderRadius: '10px',
        border: index === 0 ? '2px solid #00A86B' : '1px solid #E5E5E5'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#666666',
        minWidth: '30px'
      }
    }, index + 1, "."), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '16px',
        fontWeight: index === 0 ? 'bold' : '400',
        color: '#000000'
      }
    }, theme.theme), index === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '16px'
      }
    }, "\u2B50")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }
    }, theme.percentage && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 12px',
        background: '#00A86B',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#FFFFFF'
      }
    }, theme.percentage, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 12px',
        background: '#058585',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#FFFFFF'
      }
    }, theme.count, " ", theme.count === 1 ? 'time' : 'times'))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '6px',
        background: '#E5E5E5',
        borderRadius: '3px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${barWidth}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #00A86B 0%, #058585 100%)',
        transition: 'width 0.3s'
      }
    })));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999999'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px'
    }
  }, "No Themes Yet"), /*#__PURE__*/React.createElement("div", null, "Gratitude themes will appear here after Cloud Functions processes your reflections.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowGratitudeThemesModal(false);
    },
    style: {
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
    }
  }, "Back")))), showGratitudeJournalModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowGratitudeJournalModal(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "Gratitude Journal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowGratitudeJournalModal(false);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      overflowY: 'auto',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '20px'
    }
  }, "All your gratitude entries from evening reflections."), gratitudeInsights && gratitudeInsights.computed && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 16px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, "Your Gratitude Insights"), gratitudeInsights.computed.topThemes && gratitudeInsights.computed.topThemes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '8px',
      opacity: 0.9
    }
  }, "Core Values"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, gratitudeInsights.computed.topThemes.slice(0, 3).map((theme, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '8px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      backdropFilter: 'blur(10px)'
    }
  }, theme.theme, " (", theme.percentage, "%)")))), gratitudeInsights.computed.gaps && gratitudeInsights.computed.gaps.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '8px',
      opacity: 0.9
    }
  }, "Growth Opportunities"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255, 255, 255, 0.15)',
      padding: '12px',
      borderRadius: '12px',
      fontSize: '13px',
      lineHeight: '1.5'
    }
  }, gratitudeInsights.computed.gaps[0].severity === 'high' ? /*#__PURE__*/React.createElement("span", null, "Consider reflecting on ", /*#__PURE__*/React.createElement("strong", null, gratitudeInsights.computed.gaps[0].category), " - it's been ", gratitudeInsights.computed.gaps[0].daysSinceLast, " days since your last mention.") : /*#__PURE__*/React.createElement("span", null, "You might explore gratitude for ", /*#__PURE__*/React.createElement("strong", null, gratitudeInsights.computed.gaps[0].category), " to deepen your practice."))), gratitudeInsights.computed.lastComputed && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.7,
      marginTop: '12px'
    }
  }, "Insights updated ", new Date(gratitudeInsights.computed.lastComputed.toDate()).toLocaleDateString())), gratitudeJournalData.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, gratitudeJournalData.map((entry, index) => /*#__PURE__*/React.createElement("div", {
    key: entry.id,
    style: {
      marginBottom: '16px',
      padding: '16px',
      background: '#F8F9FA',
      borderRadius: '12px',
      border: '1px solid #E5E5E5'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#058585'
    }
  }, new Date(entry.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })), entry.overallDay && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 10px',
      background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#FFFFFF'
    }
  }, "Day: ", entry.overallDay, "/10")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#333333',
      lineHeight: '1.6',
      marginBottom: '12px'
    }
  }, entry.gratitude), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (confirm('Share this gratitude with the community?')) {
        const result = await shareToCommunity('gratitude', entry.gratitude, 'checkIns', entry.id);
        if (result.success) {
          alert('Gratitude shared to community! 🎉');
        } else {
          alert('Error sharing to community');
        }
      }
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Share Gratitude")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999999'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px'
    }
  }, "No Gratitude Entries Yet"), /*#__PURE__*/React.createElement("div", null, "Express gratitude in your evening reflections. Cloud Functions will analyze patterns and reveal your core values to support your recovery.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowGratitudeJournalModal(false);
    },
    style: {
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
    }
  }, "Back")))), showChallengesHistoryModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowChallengesHistoryModal(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "Challenges History"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowChallengesHistoryModal(false);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      overflowY: 'auto',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '20px'
    }
  }, "Review the challenges you've faced and overcome in your recovery journey."), challengesInsights && challengesInsights.categories && Object.keys(challengesInsights.categories).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #FFF3CD 0%, #FFE6A8 100%)',
      borderRadius: '15px',
      border: '2px solid #FFA500'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "brain",
    style: {
      width: '20px',
      height: '20px',
      color: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#856404'
    }
  }, "Challenge Patterns"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '12px',
      color: '#856404',
      opacity: 0.8
    }
  }, "Analyzed by Cloud Functions"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '12px',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#856404',
      marginBottom: '12px'
    }
  }, "Challenge Categories"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, Object.entries(challengesInsights.categories).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([category, data]) => /*#__PURE__*/React.createElement("div", {
    key: category,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      background: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #FFE6A8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333333',
      textTransform: 'capitalize'
    }
  }, category.replace(/_/g, ' ')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 12px',
      background: '#FF8C00',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#FFFFFF'
    }
  }, data.count, " ", data.count === 1 ? 'time' : 'times')))), challengesInsights.totalChallenges && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '16px',
      padding: '12px',
      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
      borderRadius: '8px',
      border: '1px solid #FFE6A8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#856404',
      marginBottom: '4px'
    }
  }, "Total Challenges Tracked"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#FF8C00'
    }
  }, challengesInsights.totalChallenges)))), challengesHistoryData.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, challengesHistoryData.map((entry, index) => /*#__PURE__*/React.createElement("div", {
    key: entry.id,
    style: {
      marginBottom: '16px',
      padding: '16px',
      background: '#FFF3CD',
      borderRadius: '12px',
      border: '1px solid #FFA500'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#856404'
    }
  }, new Date(entry.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })), entry.overallDay && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 10px',
      background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#FFFFFF'
    }
  }, "Day: ", entry.overallDay, "/10")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#333333',
      lineHeight: '1.6'
    }
  }, entry.challenges)))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999999'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px'
    }
  }, "No Challenges Yet"), /*#__PURE__*/React.createElement("div", null, "Document your challenges in evening reflections. Cloud Functions will analyze patterns and provide insights to support your recovery.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowChallengesHistoryModal(false);
    },
    style: {
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
    }
  }, "Back")))), showChallengeCheckInModal && selectedChallenge && /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowChallengeCheckInModal(false);
      setSelectedChallenge(null);
      setChallengeCheckInStatus('');
      setChallengeCheckInNotes('');
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '20px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '85vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "Challenge Check-In"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowChallengeCheckInModal(false);
      setSelectedChallenge(null);
      setChallengeCheckInStatus('');
      setChallengeCheckInNotes('');
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      overflowY: 'auto',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: '#FFF3CD',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #FFA500'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#856404',
      marginBottom: '8px'
    }
  }, "Your Challenge:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#333333',
      lineHeight: '1.6'
    }
  }, selectedChallenge.challengeText)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '12px'
    }
  }, "How are things going? *"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '10px'
    }
  }, [{
    value: 'resolved',
    label: 'Resolved',
    color: '#00A86B',
    desc: 'I overcame this challenge!'
  }, {
    value: 'better',
    label: 'Getting Better',
    color: '#4CAF50',
    desc: 'Making progress'
  }, {
    value: 'same',
    label: 'About the Same',
    color: '#FFA500',
    desc: 'No change yet'
  }, {
    value: 'worse',
    label: 'Gotten Worse',
    color: '#FF6B6B',
    desc: 'Struggling more'
  }, {
    value: 'help',
    label: 'Need Help',
    color: '#DC143C',
    desc: 'I need support'
  }].map(status => /*#__PURE__*/React.createElement("button", {
    key: status.value,
    onClick: () => {
      triggerHaptic('light');
      setChallengeCheckInStatus(status.value);
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, status.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: challengeCheckInStatus === status.value ? 0.9 : 0.7,
      marginTop: '2px'
    }
  }, status.desc)), challengeCheckInStatus === status.value && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '18px'
    }
  }, "\u25CF"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '8px'
    }
  }, "Notes about your progress *"), /*#__PURE__*/React.createElement("textarea", {
    value: challengeCheckInNotes,
    onChange: e => setChallengeCheckInNotes(e.target.value),
    placeholder: challengeCheckInStatus === 'resolved' ? 'What helped you overcome this challenge?' : challengeCheckInStatus === 'better' ? 'What strategies are working for you?' : challengeCheckInStatus === 'worse' ? 'What is making this harder right now?' : challengeCheckInStatus === 'help' ? 'What kind of support do you need?' : 'Share your thoughts on how you are handling this challenge...',
    style: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('medium');
      submitChallengeCheckIn();
    },
    disabled: !challengeCheckInStatus || !challengeCheckInNotes.trim(),
    style: {
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
    }
  }, challengeCheckInStatus === 'resolved' ? '🎉 Mark as Resolved' : '✅ Save Check-In'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowChallengeCheckInModal(false);
      setSelectedChallenge(null);
      setChallengeCheckInStatus('');
      setChallengeCheckInNotes('');
    },
    style: {
      width: '100%',
      height: '48px',
      background: 'transparent',
      border: 'none',
      color: '#666666',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '8px'
    }
  }, "Cancel")))), showBreakthroughModal && breakthroughData && /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowBreakthroughModal(false);
      setBreakthroughData(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
      borderRadius: '24px',
      maxWidth: '500px',
      width: '100%',
      padding: '40px 30px',
      textAlign: 'center',
      color: '#FFFFFF',
      boxShadow: '0 20px 60px rgba(0, 168, 107, 0.4)',
      animation: 'slideUp 0.4s ease-out'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 12px 0',
      fontSize: '28px',
      fontWeight: 'bold'
    }
  }, "Breakthrough Moment!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '16px',
      opacity: 0.9,
      marginBottom: '24px',
      lineHeight: '1.5'
    }
  }, "You've overcome a challenge that once held you back."), breakthroughData.challengeText && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '8px',
      opacity: 0.9
    }
  }, "Your Challenge:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '15px',
      lineHeight: '1.6'
    }
  }, breakthroughData.challengeText)), breakthroughData.daysSinceLastMention && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      marginBottom: '4px',
      opacity: 0.9
    }
  }, "It's been"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '4px'
    }
  }, breakthroughData.daysSinceLastMention), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.9
    }
  }, "days since you mentioned this challenge")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      marginBottom: '28px',
      fontSize: '15px',
      lineHeight: '1.6',
      fontStyle: 'italic'
    }
  }, "\"Every challenge you overcome makes you stronger. This breakthrough is proof of your resilience and growth.\""), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (confirm('Share this breakthrough with the community to inspire others?')) {
        const breakthroughContent = `Breakthrough! Overcame: "${breakthroughData.challengeText}" - ${breakthroughData.daysSinceLastMention} days challenge-free!`;
        const result = await shareToCommunity('breakthrough', breakthroughContent, 'challenges_tracking', breakthroughData.challengeId || 'unknown');
        if (result.success) {
          alert('Breakthrough shared to community! 🎉');
        } else {
          alert('Error sharing to community');
        }
      }
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "Share Breakthrough"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('medium');
      setShowBreakthroughModal(false);
      setBreakthroughData(null);
    },
    style: {
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
    }
  }, "\u2728 Continue"))), showTomorrowGoalsModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowTomorrowGoalsModal(false);
      setGoalStatus('');
      setGoalNotes('');
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '85vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "\uD83C\uDFC6 Goal Achievement Tracker"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowTomorrowGoalsModal(false);
      setGoalStatus('');
      setGoalNotes('');
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      overflowY: 'auto',
      flex: 1
    }
  }, yesterdayGoal ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '20px'
    }
  }, "Did you accomplish your goal from yesterday?"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: '#E7F5FF',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #058585'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#666666',
      marginBottom: '8px'
    }
  }, "Yesterday's Goal:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '15px',
      color: '#333333',
      lineHeight: '1.6',
      fontWeight: '500'
    }
  }, yesterdayGoal.goal)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '12px'
    }
  }, "How did it go? *"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '10px'
    }
  }, [{
    value: 'yes',
    label: 'Yes',
    desc: 'Completed it!',
    color: '#00A86B'
  }, {
    value: 'almost',
    label: 'Almost',
    desc: 'Got close',
    color: '#4CAF50'
  }, {
    value: 'partially',
    label: 'Partially',
    desc: 'Made progress',
    color: '#FFA500'
  }, {
    value: 'no',
    label: 'No',
    desc: 'Didn\'t complete',
    color: '#FF6B6B'
  }, {
    value: 'didnt_try',
    label: 'Didn\'t Try',
    desc: 'Couldn\'t attempt',
    color: '#999999'
  }].map(status => /*#__PURE__*/React.createElement("button", {
    key: status.value,
    onClick: () => {
      triggerHaptic('light');
      setGoalStatus(status.value);
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, status.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: goalStatus === status.value ? 0.9 : 0.7,
      marginTop: '2px'
    }
  }, status.desc)), goalStatus === status.value && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px'
    }
  }, "\u25CF"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '8px'
    }
  }, "Notes (optional)"), /*#__PURE__*/React.createElement("textarea", {
    value: goalNotes,
    onChange: e => setGoalNotes(e.target.value),
    placeholder: goalStatus === 'yes' ? 'What helped you succeed?' : goalStatus === 'almost' ? 'What got in the way?' : goalStatus === 'no' ? 'What prevented you from completing it?' : 'Any thoughts about this goal...',
    style: {
      width: '100%',
      minHeight: '80px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('medium');
      submitGoalAchievement();
    },
    disabled: !goalStatus,
    style: {
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
    }
  }, goalStatus === 'yes' ? '🎉 Record Success' : '✅ Record Progress')) :
  /*#__PURE__*/
  /* No yesterday's goal - show stats and history */
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '20px'
    }
  }, "Track your goal completion rate and build your achievement streak!"), goalStats.totalGoals > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
      borderRadius: '12px',
      textAlign: 'center',
      color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '4px'
    }
  }, goalStats.completionRate, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.9
    }
  }, "Success Rate")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
      borderRadius: '12px',
      textAlign: 'center',
      color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '4px'
    }
  }, goalStats.currentStreak), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.9
    }
  }, "Current Streak")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      textAlign: 'center',
      color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '4px'
    }
  }, goalStats.bestStreak), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.9
    }
  }, "Best Streak"))), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333'
    }
  }, "Recent Goals (", goalStats.totalGoals, " total)"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, goalHistory.slice(0, 10).map((goal, index) => /*#__PURE__*/React.createElement("div", {
    key: goal.id,
    style: {
      padding: '14px',
      marginBottom: '10px',
      background: '#F8F9FA',
      borderRadius: '10px',
      borderLeft: `4px solid ${goal.status === 'yes' ? '#00A86B' : goal.status === 'almost' ? '#4CAF50' : goal.status === 'partially' ? '#FFA500' : goal.status === 'no' ? '#FF6B6B' : '#999999'}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#666',
      fontWeight: '600'
    }
  }, goal.checkedInAt && new Date(goal.checkedInAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: goal.status === 'yes' ? '#00A86B' : goal.status === 'almost' ? '#4CAF50' : goal.status === 'partially' ? '#FFA500' : goal.status === 'no' ? '#FF6B6B' : '#999999'
    }
  }, goal.status === 'yes' ? '✅ Completed' : goal.status === 'almost' ? '⚡ Almost' : goal.status === 'partially' ? '🟡 Partial' : goal.status === 'no' ? '❌ No' : '🤷 Skipped')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      color: '#333',
      lineHeight: '1.5'
    }
  }, goal.goal), goal.notes && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#666',
      fontStyle: 'italic'
    }
  }, "Note: ", goal.notes))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999999'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      marginBottom: '12px'
    }
  }, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '8px',
      fontSize: '16px',
      fontWeight: '600'
    }
  }, "No goals tracked yet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px'
    }
  }, "Set a goal in your evening reflection and check back tomorrow to record your progress!")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowTomorrowGoalsModal(false);
    },
    style: {
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
    }
  }, "Back"))))), "135.19 KB \u20222,419 lines \u2022 Formatting may be inconsistent from source", showIncompleteTasksModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '16px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '2px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#058585'
    }
  }, "Incomplete Tasks"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowIncompleteTasksModal(false),
    style: {
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '24px',
      height: '24px',
      color: '#666666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      overflowY: 'auto',
      flex: 1
    }
  }, !checkInStatus.morning && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setShowIncompleteTasksModal(false);
      setActiveTaskTab('checkin');
    },
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
      borderRadius: '12px',
      marginBottom: '12px',
      cursor: 'pointer',
      border: '2px solid rgba(255, 165, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sun",
    style: {
      width: '24px',
      height: '24px',
      color: '#FFA500'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '4px'
    }
  }, "Morning Check-In"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      color: '#666666'
    }
  }, "Not completed today")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })), !checkInStatus.evening && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setShowIncompleteTasksModal(false);
      setActiveTaskTab('reflections');
    },
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
      borderRadius: '12px',
      marginBottom: '12px',
      cursor: 'pointer',
      border: '2px solid rgba(255, 165, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "moon",
    style: {
      width: '24px',
      height: '24px',
      color: '#FFA500'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '4px'
    }
  }, "Evening Reflection"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      color: '#666666'
    }
  }, "Not completed today")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '20px',
      height: '20px',
      color: '#666666'
    }
  })), (() => {
    const incompleteAssignments = assignments.filter(a => a.status !== 'completed');
    if (incompleteAssignments.length === 0 && checkInStatus.morning && checkInStatus.evening) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666666'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '48px',
          marginBottom: '16px'
        }
      }, "\u2705"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          fontWeight: '600',
          color: '#333333',
          marginBottom: '8px'
        }
      }, "All Caught Up!"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px'
        }
      }, "You have no incomplete tasks"));
    }
    return incompleteAssignments.map(assignment => {
      const isOverdue = assignment.dueDate && assignment.dueDate.toDate() < new Date();
      return /*#__PURE__*/React.createElement("div", {
        key: assignment.id,
        onClick: () => {
          setShowIncompleteTasksModal(false);
          setActiveTaskTab('golden');
        },
        style: {
          padding: '16px',
          background: isOverdue ? 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)' : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
          borderRadius: '12px',
          marginBottom: '12px',
          cursor: 'pointer',
          border: isOverdue ? '2px solid rgba(220, 20, 60, 0.3)' : '2px solid rgba(5, 133, 133, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "clipboard-list",
        style: {
          width: '24px',
          height: '24px',
          color: isOverdue ? '#DC143C' : '#058585'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '15px',
          fontWeight: '600',
          color: '#333333',
          marginBottom: '4px'
        }
      }, assignment.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, isOverdue ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#DC143C',
          fontWeight: '600'
        }
      }, "Overdue: ", assignment.dueDate.toDate().toLocaleDateString()) : assignment.dueDate ? `Due: ${assignment.dueDate.toDate().toLocaleDateString()}` : 'No due date')), /*#__PURE__*/React.createElement("i", {
        "data-lucide": "chevron-right",
        style: {
          width: '20px',
          height: '20px',
          color: '#666666'
        }
      }));
    });
  })()))));
}

// Register component globally
if (!window.GLRSApp) window.GLRSApp = {};
if (!window.GLRSApp.components) window.GLRSApp.components = {};
window.GLRSApp.components.JourneyTabModals = JourneyTabModals;