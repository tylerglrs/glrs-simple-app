// ================================================================
// TASKS SIDEBAR MODALS - Extracted from ModalContainer.js backup
// Lines 13928-17616 (3,689 lines)
// Contains: Quick Actions sidebar, 8 Quick Action modals, Additional modals
// ================================================================

function TasksSidebarModals({
  // Sidebar control
  showSidebar,
  setShowSidebar,
  // 8 Quick Action Modal visibility flags
  showHabitTrackerModal,
  showQuickReflectionModal,
  showThisWeekTasksModal,
  showOverdueItemsModal,
  showMarkCompleteModal,
  showProgressStatsModal,
  showGoalProgressModal,
  showTodayWinsModal,
  // 8 Quick Action Modal setters
  setShowHabitTrackerModal,
  setShowQuickReflectionModal,
  setShowThisWeekTasksModal,
  setShowOverdueItemsModal,
  setShowMarkCompleteModal,
  setShowProgressStatsModal,
  setShowGoalProgressModal,
  setShowTodayWinsModal,
  // Additional modal visibility flags
  showIntentionsModal,
  showProgressSnapshotModal,
  showPastIntentionsModal,
  // Additional modal setters
  setShowIntentionsModal,
  setShowProgressSnapshotModal,
  setShowPastIntentionsModal,
  // Streak modals
  showStreaksModal,
  showReflectionStreaksModal,
  setShowStreaksModal,
  setShowReflectionStreaksModal,
  // Data props
  user,
  goals,
  objectives,
  assignments,
  habits,
  todayHabits,
  quickReflections,
  todayWins,
  newHabitName,
  setNewHabitName,
  newReflection,
  setNewReflection,
  newWin,
  setNewWin,
  showHabitHistory,
  setShowHabitHistory,
  showReflectionHistory,
  setShowReflectionHistory,
  showWinsHistory,
  setShowWinsHistory,
  currentReflection,
  setCurrentReflection,
  pastIntentions,
  graphDateRange,
  setGraphDateRange,
  selectedRange,
  setSelectedRange,
  activeGoals,
  activeObjectives,
  activeAssignments,
  completionRate,
  completedAssignments,
  totalAssignments,
  streakData,
  reflectionStreakData,
  // Functions
  shareToCommunity,
  triggerHaptic,
  exportGraphsToPDF,
  shareGraphsPDF
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, showHabitTrackerModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowHabitTrackerModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#058585',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "repeat",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Habit Tracker"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowHabitTrackerModal(false),
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
  }, !showHabitHistory ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '12px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '8px'
    }
  }, "Add New Habit"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: newHabitName,
    onChange: e => setNewHabitName(e.target.value),
    placeholder: "e.g., Drink 8 glasses of water",
    style: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '15px',
      marginBottom: '10px'
    },
    onKeyPress: async e => {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
      flex: 1,
      padding: '10px 20px',
      background: '#058585',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Add"), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Add & Share"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    }
  }, "Today's Habits"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowHabitHistory(true),
    style: {
      padding: '6px 12px',
      background: '#f8f9fa',
      color: '#058585',
      border: '1px solid #058585',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "View History")), habits.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '30px 20px',
      color: '#999999',
      fontSize: '14px'
    }
  }, "No habits yet. Add your first habit above!") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, habits.map(habit => {
    const isCompleted = todayHabits.some(th => th.habitId === habit.id);
    return /*#__PURE__*/React.createElement("div", {
      key: habit.id,
      style: {
        padding: '12px 15px',
        background: isCompleted ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)' : '#f8f9fa',
        borderRadius: '10px',
        border: isCompleted ? '2px solid rgba(0, 168, 107, 0.3)' : '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: isCompleted,
      onChange: async () => {
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
      },
      style: {
        width: '20px',
        height: '20px',
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: '15px',
        color: '#333333',
        textDecoration: isCompleted ? 'line-through' : 'none',
        opacity: isCompleted ? 0.7 : 1
      }
    }, habit.name), isCompleted && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '20px',
        height: '20px',
        color: '#00A86B'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        const completion = todayHabits.find(th => th.habitId === habit.id);
        if (completion && confirm('Share this habit completion with the community?')) {
          const result = await shareToCommunity('habit', `Completed: ${habit.name}`, 'habitCompletions', completion.id);
          if (result.success) {
            alert('Habit completion shared to community! 🎉');
          } else {
            alert('Error sharing to community');
          }
        }
      },
      style: {
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
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "share-2",
      style: {
        width: '14px',
        height: '14px'
      }
    }), "Share")));
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    }
  }, "Habit History"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowHabitHistory(false),
    style: {
      padding: '6px 12px',
      background: '#058585',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Back to Today")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, habits.map(habit => {
    // Count how many times this habit was completed
    const completionCount = todayHabits.filter(th => th.habitId === habit.id).length;
    return /*#__PURE__*/React.createElement("div", {
      key: habit.id,
      style: {
        padding: '12px 15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#333333',
        marginBottom: '4px'
      }
    }, habit.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666666'
      }
    }, "Created: ", habit.createdAt ? new Date(habit.createdAt.toDate()).toLocaleDateString() : 'N/A'));
  })))))), showQuickReflectionModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowQuickReflectionModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#058585',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Quick Reflection"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowQuickReflectionModal(false),
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
  }, !showReflectionHistory ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
  }, "What's on your mind?"), /*#__PURE__*/React.createElement("textarea", {
    value: newReflection,
    onChange: e => setNewReflection(e.target.value),
    placeholder: "Share a quick thought, feeling, or reflection...",
    style: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '15px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
      flex: 1,
      padding: '10px 24px',
      background: '#058585',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Save"), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Save & Share")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowReflectionHistory(true),
    style: {
      padding: '8px 16px',
      background: '#f8f9fa',
      color: '#058585',
      border: '1px solid #058585',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "View History"))), quickReflections.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '25px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    }
  }, "Recent Reflections (", quickReflections.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, quickReflections.slice(0, 3).map(reflection => /*#__PURE__*/React.createElement("div", {
    key: reflection.id,
    style: {
      padding: '12px 15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#333333',
      marginBottom: '6px',
      lineHeight: '1.5'
    }
  }, reflection.reflection), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#999999'
    }
  }, reflection.createdAt ? new Date(reflection.createdAt.toDate()).toLocaleString() : 'Just now')), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (confirm('Share this reflection with the community?')) {
        const result = await shareToCommunity('reflection', reflection.reflection, 'quickReflections', reflection.id);
        if (result.success) {
          alert('Reflection shared to community! 🎉');
        } else {
          alert('Error sharing to community');
        }
      }
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Share"))))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    }
  }, "All Reflections (", quickReflections.length, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowReflectionHistory(false),
    style: {
      padding: '6px 12px',
      background: '#058585',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Back")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, quickReflections.map(reflection => /*#__PURE__*/React.createElement("div", {
    key: reflection.id,
    style: {
      padding: '12px 15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#333333',
      marginBottom: '6px',
      lineHeight: '1.5'
    }
  }, reflection.reflection), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#999999'
    }
  }, reflection.createdAt ? new Date(reflection.createdAt.toDate()).toLocaleString() : 'Just now')), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (confirm('Share this reflection with the community?')) {
        const result = await shareToCommunity('reflection', reflection.reflection, 'quickReflections', reflection.id);
        if (result.success) {
          alert('Reflection shared to community! 🎉');
        } else {
          alert('Error sharing to community');
        }
      }
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Share"))))))))), showThisWeekTasksModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowThisWeekTasksModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#058585',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-days",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "This Week's Tasks"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowThisWeekTasksModal(false),
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
  }, (() => {
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
      }, "\uD83D\uDCC5"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          fontWeight: '600',
          color: '#333333',
          marginBottom: '8px'
        }
      }, "No Tasks This Week"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px'
        }
      }, "You don't have any tasks due this week"));
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666666',
        marginBottom: '15px'
      }
    }, thisWeekAssignments.length, " task", thisWeekAssignments.length !== 1 ? 's' : '', " due this week"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    }, thisWeekAssignments.map(assignment => {
      const dueDate = assignment.dueDate.toDate();
      const isOverdue = dueDate < today;
      const isToday = dueDate.toDateString() === today.toDateString();
      return /*#__PURE__*/React.createElement("div", {
        key: assignment.id,
        style: {
          padding: '12px 15px',
          background: assignment.status === 'completed' ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)' : isOverdue ? 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)' : isToday ? 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)' : '#f8f9fa',
          borderRadius: '10px',
          border: assignment.status === 'completed' ? '2px solid rgba(0, 168, 107, 0.3)' : isOverdue ? '2px solid rgba(220, 20, 60, 0.3)' : isToday ? '2px solid rgba(255, 165, 0, 0.3)' : '1px solid #e9ecef'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'start',
          gap: '10px'
        }
      }, assignment.status === 'completed' ? /*#__PURE__*/React.createElement("i", {
        "data-lucide": "check-circle",
        style: {
          width: '20px',
          height: '20px',
          color: '#00A86B',
          marginTop: '2px'
        }
      }) : isOverdue ? /*#__PURE__*/React.createElement("i", {
        "data-lucide": "alert-circle",
        style: {
          width: '20px',
          height: '20px',
          color: '#DC143C',
          marginTop: '2px'
        }
      }) : /*#__PURE__*/React.createElement("i", {
        "data-lucide": "circle",
        style: {
          width: '20px',
          height: '20px',
          color: '#058585',
          marginTop: '2px'
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
          marginBottom: '4px',
          textDecoration: assignment.status === 'completed' ? 'line-through' : 'none'
        }
      }, assignment.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666666'
        }
      }, "Due: ", dueDate.toLocaleDateString(), isToday && ' (Today)', isOverdue && assignment.status !== 'completed' && ' (Overdue)'))));
    })));
  })()))), showOverdueItemsModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowOverdueItemsModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#DC143C',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-circle",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Overdue Items"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowOverdueItemsModal(false),
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
  }, (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueAssignments = assignments.filter(assignment => {
      if (!assignment.dueDate || assignment.status === 'completed') return false;
      const dueDate = assignment.dueDate.toDate();
      return dueDate < today;
    });
    if (overdueAssignments.length === 0) {
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
      }, "No Overdue Items!"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px'
        }
      }, "You're all caught up. Great work!"));
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#DC143C',
        marginBottom: '15px',
        fontWeight: '600'
      }
    }, overdueAssignments.length, " overdue item", overdueAssignments.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    }, overdueAssignments.map(assignment => {
      const dueDate = assignment.dueDate.toDate();
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      return /*#__PURE__*/React.createElement("div", {
        key: assignment.id,
        style: {
          padding: '12px 15px',
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)',
          borderRadius: '10px',
          border: '2px solid rgba(220, 20, 60, 0.3)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'start',
          gap: '10px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "alert-circle",
        style: {
          width: '20px',
          height: '20px',
          color: '#DC143C',
          marginTop: '2px'
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
          color: '#DC143C',
          fontWeight: '600'
        }
      }, daysOverdue, " day", daysOverdue !== 1 ? 's' : '', " overdue (Due: ", dueDate.toLocaleDateString(), ")"))));
    })));
  })()))), showMarkCompleteModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowMarkCompleteModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#00A86B',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Mark Complete"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowMarkCompleteModal(false),
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
  }, (() => {
    const incompleteAssignments = assignments.filter(a => a.status !== 'completed');
    if (incompleteAssignments.length === 0) {
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
      }, "All Done!"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px'
        }
      }, "You have no incomplete tasks"));
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666666',
        marginBottom: '15px'
      }
    }, incompleteAssignments.length, " incomplete task", incompleteAssignments.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }
    }, incompleteAssignments.map(assignment => /*#__PURE__*/React.createElement("div", {
      key: assignment.id,
      style: {
        padding: '12px 15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: false,
      onChange: async () => {
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
      },
      style: {
        width: '20px',
        height: '20px',
        cursor: 'pointer'
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
    }, assignment.title), assignment.dueDate && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666666'
      }
    }, "Due: ", assignment.dueDate.toDate().toLocaleDateString()))))));
  })()))), showProgressStatsModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowProgressStatsModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#058585',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trending-up",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Progress Stats"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowProgressStatsModal(false),
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
  }, (() => {
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const completionRate = totalAssignments > 0 ? Math.round(completedAssignments / totalAssignments * 100) : 0;
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
        borderRadius: '12px',
        border: '2px solid rgba(5, 133, 133, 0.3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666666',
        marginBottom: '8px'
      }
    }, "Overall Completion Rate"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#058585',
        marginBottom: '10px'
      }
    }, completionRate, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666666'
      }
    }, completedAssignments, " of ", totalAssignments, " tasks completed")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#333333'
      }
    }, "Tasks Overview"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "Total Tasks:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#333333'
      }
    }, totalAssignments)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "Completed:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#00A86B'
      }
    }, completedAssignments)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "In Progress:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#FFA500'
      }
    }, totalAssignments - completedAssignments)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#333333'
      }
    }, "Goals Overview"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "Total Goals:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#333333'
      }
    }, totalGoals)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "Active:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#058585'
      }
    }, activeGoals)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#333333'
      }
    }, "Habits Overview"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "Total Habits:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#333333'
      }
    }, habits.length)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666'
      }
    }, "Completed Today:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: '600',
        color: '#00A86B'
      }
    }, todayHabits.length)))));
  })()))), showGoalProgressModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowGoalProgressModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#058585',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Goal Progress"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowGoalProgressModal(false),
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
  }, goals.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '8px'
    }
  }, "No Goals Yet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px'
    }
  }, "Start adding goals to track your progress")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }
  }, goals.map(goal => {
    const progress = goal.progress || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: goal.id,
      style: {
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#333333',
        marginBottom: '10px'
      }
    }, goal.goalName || goal.name), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '8px',
        background: '#e9ecef',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${progress}%`,
        height: '100%',
        background: progress === 100 ? 'linear-gradient(90deg, #00A86B 0%, #008554 100%)' : 'linear-gradient(90deg, #058585 0%, #044c4c 100%)',
        transition: 'width 0.3s ease'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666666'
      }
    }, goal.assignments?.filter(a => a.status === 'completed').length || 0, " / ", goal.assignments?.length || 0, " tasks completed"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: progress === 100 ? '#00A86B' : '#058585'
      }
    }, progress, "%")), progress === 100 && /*#__PURE__*/React.createElement("button", {
      onClick: async () => {
        if (confirm('Share this goal completion with the community?')) {
          const result = await shareToCommunity('goal', `Completed goal: ${goal.goalName || goal.name}`, 'goals', goal.id);
          if (result.success) {
            alert('Goal completion shared to community! 🎉');
          } else {
            alert('Error sharing to community');
          }
        }
      },
      style: {
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
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "share-2",
      style: {
        width: '16px',
        height: '16px'
      }
    }), "Share Goal Completion"));
  }))))), showTodayWinsModal && /*#__PURE__*/React.createElement("div", {
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
    },
    onClick: () => setShowTodayWinsModal(false)
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
    },
    onClick: e => e.stopPropagation()
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
      color: '#FFA500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star",
    style: {
      width: '24px',
      height: '24px'
    }
  }), "Today's Wins"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowTodayWinsModal(false),
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
  }, !showWinsHistory ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
  }, "Add a win for today"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: newWin,
    onChange: e => setNewWin(e.target.value),
    placeholder: "e.g., Completed morning workout",
    style: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '15px',
      marginBottom: '10px'
    },
    onKeyPress: async e => {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
      flex: 1,
      padding: '10px 20px',
      background: '#FFA500',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Add"), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Add & Share"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    }
  }, "Today's Wins (", todayWins.length, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowWinsHistory(true),
    style: {
      padding: '6px 12px',
      background: '#f8f9fa',
      color: '#FFA500',
      border: '1px solid #FFA500',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "View History")), todayWins.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '30px 20px',
      color: '#999999',
      fontSize: '14px'
    }
  }, "No wins yet today. Add your first win above!") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, todayWins.map(win => /*#__PURE__*/React.createElement("div", {
    key: win.id,
    style: {
      padding: '12px 15px',
      background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
      borderRadius: '10px',
      border: '2px solid rgba(255, 165, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star",
    style: {
      width: '20px',
      height: '20px',
      color: '#FFA500'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: '15px',
      color: '#333333'
    }
  }, win.win), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (confirm('Share this win with the community?')) {
        const result = await shareToCommunity('win', win.win, 'wins', win.id);
        if (result.success) {
          alert('Win shared to community! 🎉');
        } else {
          alert('Error sharing to community');
        }
      }
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Share"))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    }
  }, "All Wins"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowWinsHistory(false),
    style: {
      padding: '6px 12px',
      background: '#FFA500',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Back to Today")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      color: '#666666',
      marginBottom: '15px'
    }
  }, "Showing wins from all time"), todayWins.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '30px 20px',
      color: '#999999',
      fontSize: '14px'
    }
  }, "No wins recorded yet") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, todayWins.map(win => /*#__PURE__*/React.createElement("div", {
    key: win.id,
    style: {
      padding: '12px 15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star",
    style: {
      width: '16px',
      height: '16px',
      color: '#FFA500'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '15px',
      color: '#333333',
      flex: 1
    }
  }, win.win)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#999999',
      paddingLeft: '26px'
    }
  }, win.createdAt ? new Date(win.createdAt.toDate()).toLocaleDateString() : 'Today')))))))), showSidebar && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowSidebar(false),
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9998
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      paddingBottom: '15px',
      borderBottom: '2px solid #f0f0f0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#058585'
    }
  }, "Quick Tools"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowSidebar(false),
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
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowHabitTrackerModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "repeat",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Habit Tracker")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowQuickReflectionModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Quick Reflection")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowThisWeekTasksModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-days",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "This Week's Tasks")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowOverdueItemsModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#DC143C'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Overdue Items")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowMarkCompleteModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#00A86B'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Mark Complete")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowProgressStatsModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trending-up",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Progress Stats")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowGoalProgressModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Goal Progress")), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setShowSidebar(false);
      setShowTodayWinsModal(true);
    },
    style: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      border: '1px solid #e9ecef'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star",
    style: {
      width: '20px',
      height: '20px',
      color: '#FFA500'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#333333',
      fontWeight: '500',
      fontSize: '15px'
    }
  }, "Today's Wins"))))), showStreaksModal && /*#__PURE__*/React.createElement("div", {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      position: 'sticky',
      top: 0,
      background: '#FFFFFF',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "\uD83D\uDD25 Your Check-In Streaks")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, streakData.currentStreak > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '2px solid #058585'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px'
    }
  }, "Current Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#058585'
    }
  }, "\uD83D\uDD25 ", streakData.currentStreak, " ", streakData.currentStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#666',
      marginTop: '8px'
    }
  }, "Keep it up! Check in today to extend your streak.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#000'
    }
  }, "All Streaks"), streakData.allStreaks.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, streakData.allStreaks.map((streak, index) => {
    const startDate = new Date(streak.startDate);
    const endDate = new Date(streak.endDate);
    const isLongest = index === 0; // First in sorted array is longest
    const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      style: {
        padding: '14px',
        background: isLongest ? '#FFF9E6' : '#F8F9FA',
        borderRadius: '10px',
        border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#000',
        marginBottom: '4px'
      }
    }, streak.length, " ", streak.length === 1 ? 'day' : 'days', isLongest && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '8px',
        fontSize: '14px'
      }
    }, "\u2B50 Longest"), isCurrent && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '8px',
        fontSize: '14px'
      }
    }, "\u2190 Current")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666'
      }
    }, startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }), ' - ', endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px'
      }
    }, "\uD83D\uDD25")));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      marginBottom: '12px'
    }
  }, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("div", null, "Start checking in to build your first streak!")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowStreaksModal(false);
    },
    style: {
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
    }
  }, "Back")))), showReflectionStreaksModal && /*#__PURE__*/React.createElement("div", {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E5E5E5',
      position: 'sticky',
      top: 0,
      background: '#FFFFFF',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "\uD83C\uDF19 Your Reflection Streaks")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, reflectionStreakData.currentStreak > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '2px solid #058585'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px'
    }
  }, "Current Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#058585'
    }
  }, "\uD83D\uDD25 ", reflectionStreakData.currentStreak, " ", reflectionStreakData.currentStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#666',
      marginTop: '8px'
    }
  }, "Keep it up! Reflect tonight to extend your streak.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#000'
    }
  }, "All Streaks"), reflectionStreakData.allStreaks.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, reflectionStreakData.allStreaks.map((streak, index) => {
    const startDate = new Date(streak.startDate);
    const endDate = new Date(streak.endDate);
    const isLongest = index === 0; // First in sorted array is longest
    const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      style: {
        padding: '14px',
        background: isLongest ? '#FFF9E6' : '#F8F9FA',
        borderRadius: '10px',
        border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#000',
        marginBottom: '4px'
      }
    }, streak.length, " ", streak.length === 1 ? 'day' : 'days', isLongest && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '8px',
        fontSize: '14px'
      }
    }, "\u2B50 Longest"), isCurrent && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '8px',
        fontSize: '14px'
      }
    }, "\u2190 Current")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666'
      }
    }, startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }), ' - ', endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px'
      }
    }, "\uD83D\uDD25")));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '48px',
      marginBottom: '12px'
    }
  }, "\uD83C\uDF19"), /*#__PURE__*/React.createElement("div", null, "Start reflecting daily to build your first streak!")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowReflectionStreaksModal(false);
    },
    style: {
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
    }
  }, "Back")))), showIntentionsModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '16px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px',
      borderBottom: '1px solid #E9ECEF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "compass",
    style: {
      width: '24px',
      height: '24px',
      color: '#0077CC'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#000000'
    }
  }, "Set Today's Intentions")), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowIntentionsModal(false),
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
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(5,133,133,0.1) 100%)',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid rgba(0,119,204,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "lightbulb",
    style: {
      width: '20px',
      height: '20px',
      color: '#0077CC',
      flexShrink: 0,
      marginTop: '2px'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '13px',
      color: '#000000',
      lineHeight: '1.5'
    }
  }, "Setting daily intentions helps you stay focused on what matters most in your recovery journey. Take a moment to define your purpose for today."))), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "What are your intentions for today? (e.g., 'Stay present and grateful', 'Reach out to my support network', 'Practice self-care')",
    value: currentReflection,
    onChange: e => setCurrentReflection(e.target.value),
    style: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      border: '1px solid #CED4DA',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      marginBottom: '16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check",
    style: {
      width: '18px',
      height: '18px'
    }
  }), "Set Intentions")), /*#__PURE__*/React.createElement("button", {
    "data-action": "past-intentions",
    onClick: async () => {
      try {
        const intentionsSnap = await db.collection('pledges').where('userId', '==', user.uid).orderBy('createdAt', 'desc').limit(20).get();
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
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "history",
    style: {
      width: '18px',
      height: '18px'
    }
  }), "View Past Intentions")))), showProgressSnapshotModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '16px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px',
      borderBottom: '1px solid #E9ECEF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bar-chart-3",
    style: {
      width: '24px',
      height: '24px',
      color: '#0077CC'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#000000'
    }
  }, "Progress Snapshot")), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowProgressSnapshotModal(false),
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
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(0,119,204,0.05) 100%)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(0,119,204,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: '20px',
      height: '20px',
      color: '#0077CC'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666',
      fontWeight: '500'
    }
  }, "Active Goals")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#0077CC'
    }
  }, activeGoals)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(5,133,133,0.1) 0%, rgba(5,133,133,0.05) 100%)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(5,133,133,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "list-checks",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666',
      fontWeight: '500'
    }
  }, "Objectives")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#058585'
    }
  }, activeObjectives)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(0,168,107,0.05) 100%)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(0,168,107,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clipboard-list",
    style: {
      width: '20px',
      height: '20px',
      color: '#00A86B'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666',
      fontWeight: '500'
    }
  }, "Active Tasks")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#00A86B'
    }
  }, activeAssignments)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(255,140,0,0.1) 0%, rgba(255,140,0,0.05) 100%)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255,140,0,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trending-up",
    style: {
      width: '20px',
      height: '20px',
      color: '#FF8C00'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#666666',
      fontWeight: '500'
    }
  }, "Completion")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#FF8C00'
    }
  }, completionRate, "%"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F8F9FA',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px 0',
      fontSize: '14px',
      fontWeight: '600',
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "activity",
    style: {
      width: '18px',
      height: '18px',
      color: '#0077CC'
    }
  }), "Overall Progress"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: '#666666'
    }
  }, "Completed Tasks"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#000000'
    }
  }, completedAssignments, " / ", totalAssignments)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#E9ECEF',
      borderRadius: '8px',
      height: '8px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(90deg, #0077CC 0%, #00A86B 100%)',
      height: '100%',
      width: `${completionRate}%`,
      transition: 'width 0.3s ease'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#999999',
      marginBottom: '4px'
    }
  }, "Goals"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#000000'
    }
  }, goals.length, " Total")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#999999',
      marginBottom: '4px'
    }
  }, "Objectives"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#000000'
    }
  }, objectives.length, " Total")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(0,119,204,0.1) 0%, rgba(5,133,133,0.1) 100%)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(0,119,204,0.2)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trophy",
    style: {
      width: '32px',
      height: '32px',
      color: '#0077CC',
      marginBottom: '8px'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '14px',
      color: '#000000',
      fontWeight: '500'
    }
  }, completionRate >= 75 ? '🌟 Outstanding progress! Keep up the amazing work!' : completionRate >= 50 ? '💪 You\'re doing great! Stay focused on your goals!' : completionRate >= 25 ? '🎯 Good start! Keep building momentum!' : '🚀 Every journey begins with a single step. You\'ve got this!'))))), showPastIntentionsModal && /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '16px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px',
      borderBottom: '1px solid #E9ECEF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "history",
    style: {
      width: '24px',
      height: '24px',
      color: '#0077CC'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#000000'
    }
  }, "Past Intentions")), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowPastIntentionsModal(false),
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
      padding: '24px'
    }
  }, pastIntentions.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
      borderRadius: '12px',
      padding: '40px 20px',
      textAlign: 'center',
      border: '2px dashed #0077CC'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "compass",
    style: {
      width: '48px',
      height: '48px',
      color: '#0077CC',
      marginBottom: '12px'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#000000',
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 8px 0'
    }
  }, "No Intentions Yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#666666',
      fontSize: '14px',
      margin: 0,
      lineHeight: '1.5'
    }
  }, "Start setting your daily intentions to build momentum in your recovery journey.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, pastIntentions.map((intention, index) => {
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
    return /*#__PURE__*/React.createElement("div", {
      key: intention.id,
      style: {
        background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(0,119,204,0.2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(0,119,204,0.1)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '16px',
        height: '16px',
        color: '#0077CC'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#0077CC'
      }
    }, dateStr), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#666666',
        marginLeft: 'auto'
      }
    }, timeStr)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "target",
      style: {
        width: '14px',
        height: '14px'
      }
    }), "Intentions"), intention.intention && intention.intention.trim() !== '' ? /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: '14px',
        color: '#000000',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
      }
    }, intention.intention) : /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: '13px',
        color: '#999999',
        fontStyle: 'italic'
      }
    }, "Daily pledge made (no text provided)")));
  }))))));
}

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.TasksSidebarModals = TasksSidebarModals;