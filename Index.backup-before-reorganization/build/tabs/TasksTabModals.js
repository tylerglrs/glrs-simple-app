// ================================================================
// TASKS TAB MODALS - Extracted from ModalContainer.js
// Lines 8350-9909 (1,560 lines)
// Date: Current session
// ================================================================

// TasksTabModals Component
// Renders 9 pattern-related modals for Tasks tab functionality
function TasksTabModals({
  // Visibility state props
  showMoodPatternModal,
  showCravingPatternModal,
  showAnxietyPatternModal,
  showSleepPatternModal,
  showTipsModal,
  showCopingTechniqueModal,
  showMilestoneModal,
  showPastReflectionsModal,
  showGratitudeModal,
  // Close handler props
  setShowMoodPatternModal,
  setShowCravingPatternModal,
  setShowAnxietyPatternModal,
  setShowSleepPatternModal,
  setShowTipsModal,
  setShowCopingTechniqueModal,
  setShowMilestoneModal,
  setShowPastReflectionsModal,
  setShowGratitudeModal,
  // Data props
  patternDetection,
  copingTechniques,
  user,
  sobrietyDate,
  allMilestones,
  nextMilestone,
  reflectionData,
  reflectionFilter,
  setReflectionFilter,
  selectedReflection,
  setSelectedReflection,
  gratitudeThemes,
  gratitudeTheme,
  setGratitudeTheme,
  gratitudeText,
  setGratitudeText,
  // Function props
  triggerHaptic,
  setCurrentView,
  saveGratitude
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, showMoodPatternModal && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowMoodPatternModal(false)
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
  }, "Mood Improvement Tips"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowMoodPatternModal(false),
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
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, ['Practice 5 minutes of deep breathing when you wake up', 'Get 15-30 minutes of sunlight exposure daily', 'Maintain a consistent sleep schedule', 'Limit caffeine intake after 2pm', 'Exercise for at least 20 minutes per day', 'Connect with a friend or family member', 'Write down three things you are grateful for'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      background: '#F5F5F5',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585',
      flexShrink: 0,
      marginTop: '2px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      lineHeight: '1.5'
    }
  }, tip)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowMoodPatternModal(false);
      setCurrentView('guides');
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
  }, "View Related Resources")))), showCravingPatternModal && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowCravingPatternModal(false)
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
  }, "Craving Management Tips"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowCravingPatternModal(false),
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
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, ['Use the 5-4-3-2-1 grounding technique when cravings hit', 'Call your sponsor or accountability partner immediately', 'Remove yourself from triggering environments', 'Engage in physical activity to redirect energy', 'Practice HALT: Check if you are Hungry, Angry, Lonely, or Tired', 'Keep a craving journal to identify patterns and triggers'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      background: '#F5F5F5',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585',
      flexShrink: 0,
      marginTop: '2px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      lineHeight: '1.5'
    }
  }, tip)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowCravingPatternModal(false);
      setCurrentView('guides');
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
  }, "View Related Resources")))), showAnxietyPatternModal && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowAnxietyPatternModal(false)
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
  }, "Anxiety Reduction Tips"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAnxietyPatternModal(false),
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
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, ['Practice box breathing: inhale 4 counts, hold 4, exhale 4, hold 4', 'Limit news and social media consumption', 'Establish a calming bedtime routine', 'Challenge anxious thoughts with evidence-based thinking', 'Engage in progressive muscle relaxation', 'Avoid excessive caffeine and sugar', 'Connect with nature through outdoor walks'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      background: '#F5F5F5',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585',
      flexShrink: 0,
      marginTop: '2px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      lineHeight: '1.5'
    }
  }, tip)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowAnxietyPatternModal(false);
      setCurrentView('guides');
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
  }, "View Related Resources")))), showSleepPatternModal && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowSleepPatternModal(false)
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
  }, "Sleep Quality Tips"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSleepPatternModal(false),
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
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, ['Maintain a consistent sleep schedule, even on weekends', 'Avoid screens 1 hour before bedtime', 'Keep your bedroom cool, dark, and quiet', 'Avoid large meals and alcohol before bed', 'Create a relaxing bedtime routine', 'Exercise regularly, but not within 3 hours of bedtime', 'Consider melatonin or magnesium supplements after consulting your doctor'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      background: '#F5F5F5',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585',
      flexShrink: 0,
      marginTop: '2px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      lineHeight: '1.5'
    }
  }, tip)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowSleepPatternModal(false);
      setCurrentView('guides');
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
  }, "View Related Resources")))), showTipsModal && patternDetection && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowTipsModal(false)
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
  }, "Pattern Insights"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowTipsModal(false),
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
      background: '#FFF8E1',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      border: '1px solid #FFD54F'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, patternDetection.message), patternDetection.day && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, "Day: ", patternDetection.day, " | Value: ", patternDetection.value)), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, patternDetection.tips.map((tip, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      background: '#F5F5F5',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, index + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      lineHeight: '1.5'
    }
  }, tip)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowTipsModal(false);
      setCurrentView('guides');
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
  }, "View Related Guides")))), showCopingTechniqueModal && (() => {
    const dayOfMonth = new Date().getDate();
    const technique = copingTechniques.find(t => t.day === dayOfMonth) || copingTechniques[0];
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
      onClick: () => setShowCopingTechniqueModal(false)
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
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": technique.icon,
      style: {
        width: '24px',
        height: '24px',
        color: '#058585'
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '400',
        color: '#000000'
      }
    }, technique.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: '400',
        color: '#666666',
        marginTop: '4px'
      }
    }, technique.category, " \u2022 Day ", technique.day))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowCopingTechniqueModal(false),
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
        padding: '20px',
        marginBottom: '20px',
        background: technique.category === 'Breathing' ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' : technique.category === 'Mindfulness' ? 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' : technique.category === 'Physical' ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' : technique.category === 'Cognitive' ? 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)' : 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
        borderRadius: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": technique.icon,
      style: {
        width: '64px',
        height: '64px',
        color: technique.category === 'Breathing' ? '#1976D2' : technique.category === 'Mindfulness' ? '#7B1FA2' : technique.category === 'Physical' ? '#388E3C' : technique.category === 'Cognitive' ? '#F57F17' : '#E64A19',
        marginBottom: '12px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }
    }, technique.category, " Technique")), /*#__PURE__*/React.createElement("h4", {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "list-checks",
      style: {
        width: '20px',
        height: '20px',
        color: '#058585'
      }
    }), "How to Practice"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#F5F5F5',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #E0E0E0'
      }
    }, technique.description.split('\n').map((line, index) => {
      const isNumbered = /^\d+\./.test(line.trim());
      const isBold = line.includes('Optimizes') || line.includes('Reduces') || line.includes('Improves');
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        style: {
          fontSize: '14px',
          fontWeight: isBold ? 'bold' : '400',
          color: isBold ? '#058585' : '#000000',
          lineHeight: '1.6',
          marginBottom: line.trim() === '' ? '12px' : '6px',
          paddingLeft: isNumbered ? '0' : '0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }
      }, isNumbered && /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#058585',
          fontWeight: 'bold',
          minWidth: '20px'
        }
      }, line.match(/^\d+\./)?.[0]), /*#__PURE__*/React.createElement("span", null, isNumbered ? line.replace(/^\d+\.\s*/, '') : line.trim() || '\u00A0'));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "heart-pulse",
      style: {
        width: '20px',
        height: '20px',
        color: '#2E7D32'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#2E7D32'
      }
    }, "Evidence-Based Technique")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        triggerHaptic('light');
        setShowCopingTechniqueModal(false);
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
    }, "Got It"))));
  })(), showMilestoneModal && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowMilestoneModal(false)
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
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trophy",
    style: {
      width: '24px',
      height: '24px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Recovery Milestones")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowMilestoneModal(false),
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
  }, !user?.sobrietyDate ?
  /*#__PURE__*/
  /* No sobriety date set */
  React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-x",
    style: {
      width: '64px',
      height: '64px',
      color: '#058585',
      marginBottom: '20px'
    }
  }), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Set Your Sobriety Date"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '24px',
      lineHeight: '1.6'
    }
  }, "To track your recovery milestones, please set your sobriety date in your profile settings."), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('medium');
      setShowMilestoneModal(false);
      setCurrentView('profile');
    },
    style: {
      padding: '12px 24px',
      background: '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: 'pointer'
    }
  }, "Go to Profile")) : allMilestones.length === 0 ?
  /*#__PURE__*/
  /* Milestones not loaded yet */
  React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "loader",
    style: {
      width: '48px',
      height: '48px',
      color: '#058585',
      marginBottom: '20px',
      animation: 'spin 1s linear infinite'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666666'
    }
  }, "Loading milestones...")) :
  /*#__PURE__*/
  /* Milestones loaded - show content */
  React.createElement(React.Fragment, null, nextMilestone &&
  /*#__PURE__*/
  /* Progress Card */
  React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": nextMilestone.icon,
    style: {
      width: '32px',
      height: '32px'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  }, nextMilestone.achieved ? 'All Milestones Complete!' : `Next: ${nextMilestone.label}`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.9
    }
  }, nextMilestone.achieved ? `${nextMilestone.daysSober} days sober` : `${nextMilestone.daysUntil} ${nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go`))), !nextMilestone.achieved && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.3)',
      borderRadius: '10px',
      height: '8px',
      overflow: 'hidden',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      height: '100%',
      width: `${nextMilestone.progressPercentage}%`,
      transition: 'width 0.3s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      textAlign: 'right',
      opacity: 0.9
    }
  }, nextMilestone.progressPercentage, "% complete"))), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "All Milestones"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, allMilestones.map((milestone, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    style: {
      background: milestone.achieved ? '#E8F5E9' : '#F5F5F5',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: milestone.achieved ? '1px solid #4CAF50' : '1px solid #E0E0E0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: milestone.achieved ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : '#E0E0E0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": milestone.achieved ? 'check' : milestone.icon,
    style: {
      width: '20px',
      height: '20px',
      color: milestone.achieved ? '#FFFFFF' : '#999999'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '2px'
    }
  }, milestone.label, " (", milestone.days, " days)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#666666'
    }
  }, milestone.achieved ? `Achieved on ${milestone.dateString}` : `Target: ${milestone.dateString}`)), milestone.achieved && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px'
    }
  }, "\uD83C\uDF89")))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowMilestoneModal(false);
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
  }, "Close"))))), showPastReflectionsModal && (() => {
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
      onClick: () => {
        setShowPastReflectionsModal(false);
        setSelectedReflection(null);
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFFFF',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
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
      "data-lucide": "book-open",
      style: {
        width: '24px',
        height: '24px',
        color: '#058585'
      }
    }), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '400',
        color: '#000000'
      }
    }, "Past Reflections")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setShowPastReflectionsModal(false);
        setSelectedReflection(null);
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
        marginTop: '16px'
      }
    }, ['all', 'week', 'month'].map(filter => /*#__PURE__*/React.createElement("button", {
      key: filter,
      onClick: () => {
        triggerHaptic('light');
        setReflectionFilter(filter);
        setSelectedReflection(null);
      },
      style: {
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
      }
    }, filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month')))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px',
        flex: 1,
        overflow: 'auto'
      }
    }, filteredReflections.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#999999'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "book-open",
      style: {
        width: '48px',
        height: '48px',
        color: '#E0E0E0',
        marginBottom: '12px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        fontWeight: '400'
      }
    }, "No reflections found")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }
    }, filteredReflections.map((reflection, index) => {
      const reflectionDate = reflection.createdAt?.toDate ? reflection.createdAt.toDate() : new Date(reflection.createdAt);
      const isExpanded = selectedReflection?.id === reflection.id;
      return /*#__PURE__*/React.createElement("div", {
        key: reflection.id || index,
        style: {
          background: '#F8F9FA',
          borderRadius: '12px',
          padding: '16px',
          border: isExpanded ? '2px solid #058585' : '1px solid #E5E5E5',
          cursor: 'pointer',
          transition: 'all 0.2s'
        },
        onClick: () => {
          triggerHaptic('light');
          setSelectedReflection(isExpanded ? null : reflection);
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isExpanded ? '16px' : '0'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '4px'
        }
      }, reflectionDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })), reflection.overallDay && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '12px',
          fontWeight: '400',
          color: '#666666'
        }
      }, "Daily Score: ", reflection.overallDay, "/10")), /*#__PURE__*/React.createElement("i", {
        "data-lucide": isExpanded ? 'chevron-up' : 'chevron-down',
        style: {
          width: '20px',
          height: '20px',
          color: '#666666'
        }
      })), isExpanded && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }
      }, reflection.promptResponse && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#058585',
          marginBottom: '6px'
        }
      }, "Prompt Response"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: '400',
          color: '#000000',
          lineHeight: '1.5',
          background: '#FFFFFF',
          padding: '10px',
          borderRadius: '8px'
        }
      }, reflection.promptResponse)), reflection.challenges && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#058585',
          marginBottom: '6px'
        }
      }, "Challenges"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: '400',
          color: '#000000',
          lineHeight: '1.5',
          background: '#FFFFFF',
          padding: '10px',
          borderRadius: '8px'
        }
      }, reflection.challenges)), reflection.gratitude && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#058585',
          marginBottom: '6px'
        }
      }, "Gratitude"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: '400',
          color: '#000000',
          lineHeight: '1.5',
          background: '#FFFFFF',
          padding: '10px',
          borderRadius: '8px'
        }
      }, reflection.gratitude)), reflection.tomorrowGoal && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#058585',
          marginBottom: '6px'
        }
      }, "Tomorrow's Goal"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: '400',
          color: '#000000',
          lineHeight: '1.5',
          background: '#FFFFFF',
          padding: '10px',
          borderRadius: '8px'
        }
      }, reflection.tomorrowGoal))));
    })))));
  })(), showGratitudeModal && /*#__PURE__*/React.createElement("div", {
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
      setShowGratitudeModal(false);
      setGratitudeTheme('');
      setGratitudeText('');
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '85vh',
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
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "heart",
    style: {
      width: '24px',
      height: '24px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Gratitude Entry")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowGratitudeModal(false);
      setGratitudeTheme('');
      setGratitudeText('');
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
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '12px'
    }
  }, "Select a Theme"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '8px'
    }
  }, gratitudeThemes.map(theme => /*#__PURE__*/React.createElement("button", {
    key: theme.id,
    onClick: () => {
      triggerHaptic('light');
      setGratitudeTheme(theme.id);
    },
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": theme.icon,
    style: {
      width: '20px',
      height: '20px',
      color: gratitudeTheme === theme.id ? '#FFFFFF' : theme.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      lineHeight: '1.2'
    }
  }, theme.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "What are you grateful for?"), /*#__PURE__*/React.createElement("textarea", {
    value: gratitudeText,
    onChange: e => setGratitudeText(e.target.value),
    placeholder: "Express your gratitude...",
    style: {
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
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('medium');
      saveGratitude();
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
  }, "Save Gratitude")))));
}

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.TasksTabModals = TasksTabModals;