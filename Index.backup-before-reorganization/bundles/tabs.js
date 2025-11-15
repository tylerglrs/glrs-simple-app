// Index/HomeTab.js
function HomeTab() {
  // ✅ PHASE 8C-1: Converted to use Context API
  // Get state from Context instead of props
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
  } = useAppContext();
  return /*#__PURE__*/React.createElement(React.Fragment, null, activeBroadcast && !broadcastDismissed && /*#__PURE__*/React.createElement("div", {
    className: "broadcast-banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "broadcast-content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "megaphone",
    style: {
      width: '24px',
      height: '24px',
      color: 'var(--color-accent)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'bold',
      color: 'var(--color-accent)'
    }
  }, "Announcement"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'white',
      marginTop: '5px'
    }
  }, activeBroadcast.message)))), /*#__PURE__*/React.createElement("button", {
    className: "broadcast-dismiss",
    onClick: dismissBroadcast
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "hero-section"
  }, coachInfo && /*#__PURE__*/React.createElement("div", {
    className: "coach-info-card"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#4CAF50',
      marginBottom: '10px'
    }
  }, "Your Recovery Coach"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white'
    }
  }, coachInfo.displayName || coachInfo.firstName + ' ' + coachInfo.lastName), coachInfo.credentials && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.8,
      marginTop: '5px'
    }
  }, coachInfo.credentials)), coachInfo.phone && /*#__PURE__*/React.createElement("a", {
    href: `tel:${coachInfo.phone}`,
    style: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '8px 15px',
      borderRadius: '20px',
      color: 'white',
      textDecoration: 'none',
      fontSize: '14px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "phone",
    style: {
      width: '16px',
      height: '16px',
      marginRight: '6px'
    }
  }), "Contact"))), /*#__PURE__*/React.createElement("div", {
    className: "hero-background"
  }, /*#__PURE__*/React.createElement("div", {
    className: "day-counter-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "large-number"
  }, sobrietyDays), /*#__PURE__*/React.createElement("div", {
    className: "large-text"
  }, "Days Strong"), /*#__PURE__*/React.createElement("div", {
    className: "motivational-quote"
  }, dailyQuote?.quote || "One day at a time."), dailyQuote?.author && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      opacity: 0.7,
      marginTop: '5px'
    }
  }, "\u2014 ", dailyQuote.author))), nextMilestone && /*#__PURE__*/React.createElement("div", {
    className: "milestone-preview"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '18px',
      color: 'white',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": nextMilestone.icon || 'target',
    style: {
      width: '20px',
      height: '20px'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Next: ", nextMilestone.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.7)',
      marginTop: '5px',
      fontSize: '14px'
    }
  }, nextMilestone.description)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4CAF50'
    }
  }, nextMilestone.daysRequired - sobrietyDays), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.7)'
    }
  }, "days to go"))))), /*#__PURE__*/React.createElement("div", {
    className: "body-section"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      border: '1px solid #E5E5E5',
      backdropFilter: 'blur(10px)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      marginBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#fff',
      fontSize: 'var(--font-lg)',
      fontWeight: 'bold',
      marginBottom: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trophy",
    style: {
      width: '24px',
      height: '24px',
      color: 'var(--color-accent)'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Milestone Journey")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      overflowX: 'auto',
      gap: 'var(--space-3)',
      paddingBottom: 'var(--space-2)'
    }
  }, milestones?.slice(0, 10).map((milestone, index) => {
    const achieved = sobrietyDays >= milestone.days;
    const isNext = nextMilestone && milestone.days === nextMilestone.daysRequired;
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      style: {
        minWidth: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: achieved ? 'linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%)' : isNext ? 'linear-gradient(135deg, var(--color-accent) 0%, #FF6B35 100%)' : 'rgba(255,255,255,0.1)',
        border: isNext ? '3px solid var(--color-accent)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: achieved ? '0 4px 12px rgba(46, 204, 113, 0.4)' : 'none',
        animation: isNext ? 'pulse 2s infinite' : 'none'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": milestone.icon || 'award',
      style: {
        width: '32px',
        height: '32px',
        color: achieved || isNext ? '#fff' : 'rgba(255,255,255,0.3)'
      }
    }), achieved && /*#__PURE__*/React.createElement("div", {
      style: {
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
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check",
      style: {
        width: '16px',
        height: '16px',
        color: 'var(--color-success)'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--font-xs)',
        fontWeight: '600',
        color: achieved ? '#fff' : isNext ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
        textAlign: 'center'
      }
    }, milestone.days, "d"));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mood-tracker"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'white',
      marginBottom: '15px'
    }
  }, "How are you feeling today?"), /*#__PURE__*/React.createElement("div", {
    className: "mood-options"
  }, [{
    value: 'great',
    label: 'Great',
    icon: 'smile'
  }, {
    value: 'good',
    label: 'Good',
    icon: 'meh'
  }, {
    value: 'okay',
    label: 'Okay',
    icon: 'frown'
  }, {
    value: 'struggling',
    label: 'Struggling',
    icon: 'frown'
  }, {
    value: 'crisis',
    label: 'Crisis',
    icon: 'alert-circle'
  }].map(mood => /*#__PURE__*/React.createElement("div", {
    key: mood.value,
    className: `mood-button ${selectedMood === mood.value ? 'selected' : ''}`,
    onClick: () => setSelectedMood(mood.value)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": mood.icon,
    className: "mood-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mood-label"
  }, mood.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px 0',
      fontSize: '20px',
      fontWeight: '600'
    }
  }, "Quick Tools"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowIntentionsModal(true);
    },
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px'
    }
  }, "Set Today's Intentions"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      opacity: 0.9
    }
  }, "Define your focus for the day")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowProgressSnapshotModal(true);
    },
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px'
    }
  }, "Progress Snapshot"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      opacity: 0.9
    }
  }, "View all goals and stats")))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentView('guides'),
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "book-open",
    style: {
      width: '24px',
      height: '24px',
      marginRight: '8px'
    }
  }), "Recovery Resources", /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'rgba(255,255,255,0.2)',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '12px'
    }
  }, userData?.newResourcesCount || 0, " New")), /*#__PURE__*/React.createElement("div", {
    className: "stats-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "dollar-sign"
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, "$", (moneySaved || 0).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Money Saved")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-days"
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, sobrietyDays || 0), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Total Days")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "flame"
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, checkInStreak || 0), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Day Streak")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, Math.floor((sobrietyDays || 0) / 7)), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Weeks Clean")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle"
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, totalCheckIns || 0), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Total Check-ins")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bar-chart-2"
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, complianceRate?.checkIn || 0, "%"), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Check-in Rate")))));
}
window.GLRSApp.components.HomeTab = HomeTab;
// Index/JourneyTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
function JourneyTab() {
  // ✅ PHASE 8C-2: Converted to use Context API
  // Get state from Context instead of props
  const {
    journeyTab,
    setJourneyTab,
    triggerHaptic,
    lifeCardIndex,
    setLifeCardIndex,
    lifeCardsRef,
    handleLifeTouchStart,
    handleLifeTouchMove,
    handleLifeTouchEnd,
    userData,
    calculateSobrietyDays,
    getRecoveryMilestones,
    dailyQuotes,
    loadDailyQuotes,
    financesCardIndex,
    setFinancesCardIndex,
    financesCardsRef,
    handleFinancesTouchStart,
    handleFinancesTouchMove,
    handleFinancesTouchEnd,
    savingsCarouselRef,
    savingsCarouselIndex,
    setSavingsCarouselIndex,
    savingsCarouselTouchStart,
    setSavingsCarouselTouchStart,
    activeSavingsGoal,
    setActiveSavingsGoal,
    actualMoneySaved,
    setActualMoneySaved,
    customGoalItems,
    setCustomGoalItems,
    tempAmount,
    setTempAmount,
    savingsItems,
    savingsGoals,
    moneyMapStops,
    wellnessCardIndex,
    setWellnessCardIndex,
    wellnessCardsRef,
    handleWellnessTouchStart,
    handleWellnessTouchMove,
    handleWellnessTouchEnd,
    checkIns,
    expandedGraph,
    setExpandedGraph,
    checkInData,
    missedMoodCheckIns,
    missedCravingCheckIns,
    missedAnxietyCheckIns,
    missedSleepCheckIns,
    missedOverallCheckIns,
    setShowModal
  } = useAppContext();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#058585',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '48px',
      position: 'fixed',
      top: '48px',
      left: 0,
      right: 0,
      zIndex: 99,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setJourneyTab('life');
    },
    style: {
      flex: 1,
      height: '100%',
      background: 'none',
      border: 'none',
      color: journeyTab === 'life' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
      fontSize: '14px',
      fontWeight: journeyTab === 'life' ? 'bold' : '400',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s'
    }
  }, "Life", journeyTab === 'life' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setJourneyTab('finances');
    },
    style: {
      flex: 1,
      height: '100%',
      background: 'none',
      border: 'none',
      color: journeyTab === 'finances' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
      fontSize: '14px',
      fontWeight: journeyTab === 'finances' ? 'bold' : '400',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s'
    }
  }, "Finances", journeyTab === 'finances' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setJourneyTab('wellness');
    },
    style: {
      flex: 1,
      height: '100%',
      background: 'none',
      border: 'none',
      color: journeyTab === 'wellness' ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
      fontSize: '14px',
      fontWeight: journeyTab === 'wellness' ? 'bold' : '400',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s'
    }
  }, "Wellness", journeyTab === 'wellness' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: '#FFFFFF'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      minHeight: '100vh',
      paddingBottom: '80px',
      paddingTop: '96px'
    }
  }, journeyTab === 'life' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      background: '#069494',
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: lifeCardsRef,
    onTouchStart: handleLifeTouchStart,
    onTouchMove: handleLifeTouchMove,
    onTouchEnd: handleLifeTouchEnd,
    style: {
      width: '100%',
      padding: '0 15px'
    }
  }, lifeCardIndex === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, userData?.sobrietyDate ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star",
    style: {
      width: '48px',
      height: '48px',
      color: '#FFFFFF',
      marginBottom: '16px',
      strokeWidth: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      color: '#FFFFFF',
      marginBottom: '20px',
      fontWeight: '400',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  }, "SOBRIETY DATE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '36px',
      fontWeight: '700',
      color: '#FFFFFF',
      lineHeight: '1.2',
      marginBottom: '8px'
    }
  }, (() => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = userData.sobrietyDate.split('-');
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '400',
      marginTop: '12px'
    }
  }, "Your recovery journey started")) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#FFFFFF',
      fontSize: '16px'
    }
  }, "Set your sobriety date in profile")), lifeCardIndex === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (!userData?.sobrietyDate) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#FFFFFF',
          fontSize: '16px'
        }
      }, "Set your sobriety date in profile");
    }
    const totalDays = calculateSobrietyDays(userData.sobrietyDate);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "flame",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "DAYS SOBER"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, totalDays.toLocaleString()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "Your streak continues"));
  })()), lifeCardIndex === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (!userData?.sobrietyDate) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#FFFFFF',
          fontSize: '16px'
        }
      }, "Set your sobriety date in profile");
    }

    // FIXED: Use getRecoveryMilestones() for accurate date-based calculations
    const allMilestones = getRecoveryMilestones(userData.sobrietyDate);
    const nextMilestone = allMilestones.find(m => !m.achieved);
    if (!nextMilestone) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '48px',
          marginBottom: '20px'
        }
      }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '24px',
          fontWeight: '700',
          color: '#FFFFFF'
        }
      }, "All Milestones Achieved!"));
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "target",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "NEXT MILESTONE"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '48px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, nextMilestone.daysUntil), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, nextMilestone.daysUntil === 1 ? 'day' : 'days', " until ", nextMilestone.title));
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px',
      paddingBottom: '10px'
    }
  }, [0, 1, 2].map(index => /*#__PURE__*/React.createElement("div", {
    key: index,
    onClick: () => setLifeCardIndex(index),
    style: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#FFFFFF',
      opacity: lifeCardIndex === index ? 1.0 : 0.5,
      transition: 'opacity 0.3s ease',
      cursor: 'pointer'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 5%',
      maxWidth: '600px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      color: '#058585',
      fontSize: '16px',
      marginBottom: '12px',
      fontWeight: '600'
    }
  }, "Recovery Milestones"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid rgba(5, 133, 133, 0.2)',
      overflowX: 'auto',
      overflowY: 'hidden'
    }
  }, userData?.sobrietyDate ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '40px',
      minWidth: 'max-content',
      paddingBottom: '10px'
    }
  }, (() => {
    const milestones = getRecoveryMilestones(userData.sobrietyDate);
    return milestones.map((milestone, index) => /*#__PURE__*/React.createElement("div", {
      key: index,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '80px',
        position: 'relative'
      }
    }, index > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '-40px',
        top: '20px',
        width: '40px',
        height: '2px',
        background: milestone.achieved ? '#058585' : 'rgba(5, 133, 133, 0.3)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: milestone.achieved ? '#058585' : '#FFFFFF',
        border: `3px solid ${milestone.achieved ? '#058585' : 'rgba(5, 133, 133, 0.3)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        marginBottom: '8px',
        transition: 'all 0.3s ease',
        boxShadow: milestone.achieved ? '0 2px 8px rgba(5, 133, 133, 0.4)' : 'none'
      }
    }, milestone.achieved ? '✓' : /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#999',
        fontSize: '14px'
      }
    }, milestone.days)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: milestone.achieved ? '600' : '400',
        color: milestone.achieved ? '#058585' : '#999',
        textAlign: 'center',
        whiteSpace: 'nowrap'
      }
    }, milestone.icon, " ", milestone.title), !milestone.achieved && milestone.daysUntil !== undefined && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '10px',
        color: '#999',
        marginTop: '4px'
      }
    }, milestone.daysUntil === 0 ? 'Today!' : milestone.daysUntil === 1 ? 'Tomorrow' : `${milestone.daysUntil} days`)));
  })()) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px',
      color: '#999',
      fontSize: '14px'
    }
  }, "Set your recovery start date in profile to see milestones"))), userData?.sobrietyDate && (() => {
    const allMilestones = getRecoveryMilestones(userData.sobrietyDate);
    const upcomingMilestones = allMilestones.filter(m => !m.achieved).slice(0, 3);
    const gradients = [{
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#667eea',
      lightBg: 'rgba(102, 126, 234, 0.1)'
    },
    // Purple
    {
      bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      text: '#f5576c',
      lightBg: 'rgba(245, 87, 108, 0.1)'
    },
    // Pink
    {
      bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      text: '#4facfe',
      lightBg: 'rgba(79, 172, 254, 0.1)'
    } // Blue
    ];
    return upcomingMilestones.map((milestone, index) => {
      // FIXED: Use the correct timezone-aware calculation instead of recalculating
      const currentDaysSober = calculateSobrietyDays(userData.sobrietyDate);
      const progress = Math.min(100, Math.round(currentDaysSober / milestone.days * 100));
      const daysRemaining = milestone.days - currentDaysSober;
      const gradient = gradients[index];
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        style: {
          background: '#FFFFFF',
          border: '2px solid #069494',
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }, /*#__PURE__*/React.createElement("h3", {
        style: {
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          background: gradient.bg,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }
      }, milestone.icon, " Next Milestone: ", milestone.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          fontWeight: '400',
          color: '#666',
          marginBottom: '16px'
        }
      }, daysRemaining, " ", daysRemaining === 1 ? 'day' : 'days', " remaining"), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative',
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          right: '8px',
          top: '-24px',
          fontSize: '14px',
          fontWeight: '700',
          color: gradient.text
        }
      }, progress, "%"), /*#__PURE__*/React.createElement("div", {
        style: {
          background: '#E0E0E0',
          height: '12px',
          borderRadius: '6px',
          position: 'relative',
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: gradient.bg,
          height: '100%',
          borderRadius: '6px',
          width: `${progress}%`,
          transition: 'width 0.5s ease'
        }
      }))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '12px',
          color: '#999',
          marginTop: '8px',
          textAlign: 'right'
        }
      }, "Target: ", (() => {
        const date = new Date(milestone.date);
        const month = date.toLocaleDateString('en-US', {
          month: 'short'
        });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
      })()));
    });
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
      borderRadius: '12px',
      padding: '20px',
      border: '2px solid rgba(5, 133, 133, 0.2)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      marginBottom: '10px'
    }
  }, "\uD83D\uDCA1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontStyle: 'italic',
      color: '#058585',
      lineHeight: '1.6',
      marginBottom: '8px'
    }
  }, (() => {
    // Load quotes from Firestore on first render
    if (dailyQuotes.length === 0) {
      loadDailyQuotes();
      // Return placeholder while loading
      return "One day at a time.";
    }

    // Calculate day of year for daily rotation
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % dailyQuotes.length;
    const selectedQuote = dailyQuotes[quoteIndex];
    return selectedQuote?.quote || "One day at a time.";
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#999'
    }
  }, (() => {
    if (dailyQuotes.length === 0) return "Daily Inspiration";
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % dailyQuotes.length;
    const selectedQuote = dailyQuotes[quoteIndex];
    return selectedQuote?.author ? `— ${selectedQuote.author}` : "Daily Inspiration";
  })())))), journeyTab === 'finances' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      background: '#069494',
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: financesCardsRef,
    onTouchStart: handleFinancesTouchStart,
    onTouchMove: handleFinancesTouchMove,
    onTouchEnd: handleFinancesTouchEnd,
    style: {
      width: '100%',
      padding: '0 15px'
    }
  }, financesCardIndex === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    const dailyCost = userData?.dailyCost || 0;

    // Show placeholder if no daily cost set
    if (dailyCost === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "info",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "SET YOUR DAILY COST"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '24px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.4',
          marginBottom: '12px'
        }
      }, "Get Started"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "Add your substance's daily cost in profile"));
    }

    // Calculate total savings
    const totalDays = calculateSobrietyDays(userData.sobrietyDate);
    const totalSaved = totalDays * dailyCost;
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(totalSaved);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "piggy-bank",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "TOTAL SAVED"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, formattedTotal), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "$", dailyCost, " per day average"));
  })()), financesCardIndex === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    const dailyCost = userData?.dailyCost || 0;
    if (dailyCost === 0 || !userData?.sobrietyDate) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#FFFFFF',
          fontSize: '16px'
        }
      }, "Set your daily cost in profile");
    }

    // Calculate savings for current month
    const [year, month, day] = userData.sobrietyDate.split('-');
    const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    let daysThisMonth = 0;
    if (sobrietyDateObj < monthStart) {
      // Been sober the whole month so far
      daysThisMonth = now.getDate();
    } else if (sobrietyDateObj.getMonth() === now.getMonth() && sobrietyDateObj.getFullYear() === now.getFullYear()) {
      // Started sobriety this month
      const diffTime = now - sobrietyDateObj;
      daysThisMonth = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    const savedThisMonth = daysThisMonth * dailyCost;
    const formattedMonth = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(savedThisMonth);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "SAVED THIS MONTH"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, formattedMonth), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, daysThisMonth, " ", daysThisMonth === 1 ? 'day' : 'days', " this month"));
  })()), financesCardIndex === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    const dailyCost = userData?.dailyCost || 0;
    if (dailyCost === 0 || !userData?.sobrietyDate) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          color: '#FFFFFF',
          fontSize: '16px'
        }
      }, "Set your daily cost in profile");
    }

    // Calculate savings for current year
    const [year, month, day] = userData.sobrietyDate.split('-');
    const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    let daysThisYear = 0;
    if (sobrietyDateObj < yearStart) {
      // Been sober the whole year so far
      const diffTime = now - yearStart;
      daysThisYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else if (sobrietyDateObj.getFullYear() === now.getFullYear()) {
      // Started sobriety this year
      const diffTime = now - sobrietyDateObj;
      daysThisYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    const savedThisYear = daysThisYear * dailyCost;
    const formattedYear = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(savedThisYear);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "trending-up",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "SAVED THIS YEAR"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, formattedYear), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, daysThisYear, " ", daysThisYear === 1 ? 'day' : 'days', " in ", now.getFullYear()));
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px',
      paddingBottom: '10px'
    }
  }, [0, 1, 2].map(index => /*#__PURE__*/React.createElement("div", {
    key: index,
    onClick: () => setFinancesCardIndex(index),
    style: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#FFFFFF',
      opacity: financesCardIndex === index ? 1.0 : 0.5,
      transition: 'opacity 0.3s ease',
      cursor: 'pointer'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 5%',
      maxWidth: '600px',
      margin: '0 auto'
    }
  }, (() => {
    const dailyCost = userData?.dailyCost || 0;
    if (dailyCost === 0) {
      return null; // Don't show features if no daily cost set
    }
    const totalDays = calculateSobrietyDays(userData.sobrietyDate);
    const totalSaved = totalDays * dailyCost;

    // Load carousel items from Firestore (filtered to show progress)
    const carouselItems = savingsItems.filter(item => totalSaved >= item.minCost * 0.1);

    // Combine default goals with user's custom goals
    const allGoals = [...savingsGoals, ...customGoalItems];

    // Create countdown items from goals + custom items
    const sortedCountdown = allGoals.map(item => {
      const cost = item.amount || item.cost;
      const daysAway = Math.max(0, Math.ceil((cost - totalSaved) / dailyCost));
      const progress = Math.min(100, totalSaved / cost * 100);
      return {
        ...item,
        cost,
        daysAway,
        progress
      };
    }).sort((a, b) => a.daysAway - b.daysAway);
    return /*#__PURE__*/React.createElement(React.Fragment, null, carouselItems.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#058585',
        fontSize: '18px',
        marginBottom: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "shopping-bag",
      style: {
        width: '20px',
        height: '20px',
        strokeWidth: 2
      }
    }), "Your Savings Can Buy..."), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      ref: savingsCarouselRef,
      onTouchStart: e => setSavingsCarouselTouchStart(e.touches[0].clientX),
      onTouchEnd: e => {
        const touchEnd = e.changedTouches[0].clientX;
        const distance = savingsCarouselTouchStart - touchEnd;
        const threshold = 50;
        if (distance > threshold && savingsCarouselIndex < carouselItems.length - 1) {
          setSavingsCarouselIndex(savingsCarouselIndex + 1);
        } else if (distance < -threshold && savingsCarouselIndex > 0) {
          setSavingsCarouselIndex(savingsCarouselIndex - 1);
        }
      },
      style: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: '10px'
      }
    }, carouselItems.map((item, index) => {
      const progress = Math.min(100, totalSaved / item.minCost * 100);
      const canAfford = totalSaved >= item.minCost;
      const daysAway = canAfford ? 0 : Math.ceil((item.minCost - totalSaved) / dailyCost);
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        style: {
          minWidth: '85%',
          background: canAfford ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)' : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: canAfford ? '2px solid #00A86B' : '2px solid rgba(5, 133, 133, 0.2)',
          scrollSnapAlign: 'start'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": item.icon,
        style: {
          width: '24px',
          height: '24px',
          strokeWidth: 2,
          color: '#058585',
          marginBottom: '4px'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          fontWeight: '600',
          color: '#333'
        }
      }, item.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#666',
          marginTop: '2px'
        }
      }, "$", item.minCost.toLocaleString(), " - $", item.maxCost.toLocaleString())), canAfford && /*#__PURE__*/React.createElement("div", {
        style: {
          background: '#00A86B',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }
      }, "UNLOCKED! \uD83C\uDF89")), /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: '8px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: `${progress}%`,
          height: '100%',
          background: canAfford ? '#00A86B' : '#058585',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666'
        }
      }, canAfford ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#00A86B',
          fontWeight: '600'
        }
      }, "\u2705 You can afford this now!") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: '600'
        }
      }, Math.round(progress), "% there"), ' • ', /*#__PURE__*/React.createElement("span", null, daysAway, " ", daysAway === 1 ? 'day' : 'days', " away"))));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '12px'
      }
    }, carouselItems.map((_, index) => /*#__PURE__*/React.createElement("div", {
      key: index,
      onClick: () => setSavingsCarouselIndex(index),
      style: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: savingsCarouselIndex === index ? '#058585' : '#ddd',
        cursor: 'pointer',
        transition: 'background 0.3s ease'
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#058585',
        fontSize: '18px',
        marginBottom: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "target",
      style: {
        width: '20px',
        height: '20px',
        strokeWidth: 2
      }
    }), "Your Active Savings Challenge"), activeSavingsGoal ? /*#__PURE__*/React.createElement("div", {
      style: {
        background: activeSavingsGoal.amount <= totalSaved ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)' : 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
        borderRadius: '12px',
        padding: '24px',
        border: activeSavingsGoal.amount <= totalSaved ? '2px solid #00A86B' : '2px solid rgba(5, 133, 133, 0.2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": activeSavingsGoal.icon,
      style: {
        width: '36px',
        height: '36px',
        strokeWidth: 2,
        color: '#058585',
        marginBottom: '8px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "Goal: ", activeSavingsGoal.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#058585',
        marginBottom: '4px'
      }
    }, "$", totalSaved.toLocaleString(), " / $", activeSavingsGoal.amount.toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: '12px',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${Math.min(100, totalSaved / activeSavingsGoal.amount * 100)}%`,
        height: '100%',
        background: activeSavingsGoal.amount <= totalSaved ? '#00A86B' : 'linear-gradient(90deg, #058585 0%, #069494 100%)',
        borderRadius: '6px',
        transition: 'width 0.3s ease'
      }
    })), activeSavingsGoal.amount <= totalSaved ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#00A86B',
        marginBottom: '16px'
      }
    }, "\u2705 GOAL ACHIEVED! \uD83C\uDF89"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowModal('setGoal'),
      style: {
        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
      }
    }, "Set New Challenge")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        textAlign: 'center'
      }
    }, Math.ceil((activeSavingsGoal.amount - totalSaved) / dailyCost), " days away", ' • ', Math.round(totalSaved / activeSavingsGoal.amount * 100), "% complete")) : /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
        borderRadius: '12px',
        padding: '32px',
        border: '2px solid rgba(5, 133, 133, 0.2)',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "target",
      style: {
        width: '48px',
        height: '48px',
        color: '#058585',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: '#333',
        marginBottom: '12px',
        fontWeight: '600'
      }
    }, "Set Your First Savings Goal"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '20px'
      }
    }, "Choose a goal to work towards and track your progress"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowModal('setGoal'),
      style: {
        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
      }
    }, "Choose a Goal")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginTop: '16px'
      }
    }, savingsGoals.map((goal, index) => {
      const progress = Math.min(100, totalSaved / goal.amount * 100);
      const daysAway = Math.max(0, Math.ceil((goal.amount - totalSaved) / dailyCost));
      const achieved = totalSaved >= goal.amount;
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        onClick: () => setActiveSavingsGoal(goal),
        style: {
          background: achieved ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
          borderRadius: '10px',
          padding: '16px 12px',
          border: achieved ? '1px solid #00A86B' : '1px solid #ddd',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        },
        onMouseEnter: e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        },
        onMouseLeave: e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": goal.icon,
        style: {
          width: '24px',
          height: '24px',
          strokeWidth: 2,
          color: '#058585',
          marginBottom: '6px'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '4px'
        }
      }, goal.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '12px',
          color: '#666',
          marginBottom: '8px'
        }
      }, "$", goal.amount.toLocaleString()), achieved ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '11px',
          color: '#00A86B',
          fontWeight: '600'
        }
      }, "Complete! \u2728") : /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '11px',
          color: '#666'
        }
      }, daysAway, " ", daysAway === 1 ? 'day' : 'days', " away"));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#058585',
        fontSize: '18px',
        marginBottom: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "piggy-bank",
      style: {
        width: '20px',
        height: '20px',
        strokeWidth: 2
      }
    }), "Your Virtual Savings Jar"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)',
        borderRadius: '12px',
        padding: '32px',
        border: '2px solid rgba(255,215,0,0.3)',
        textAlign: 'center',
        cursor: 'pointer'
      },
      onClick: () => setShowModal('jar')
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '120px',
        height: '160px',
        margin: '0 auto 20px',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
        borderRadius: '8px',
        border: '3px solid rgba(5, 133, 133, 0.3)',
        overflow: 'hidden',
        boxShadow: 'inset 0 -4px 8px rgba(255,215,0,0.2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${Math.min(100, totalSaved / (activeSavingsGoal?.amount || 10000) * 100)}%`,
        background: 'linear-gradient(180deg, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0.6) 100%)',
        transition: 'height 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '8px',
        fontSize: '20px'
      }
    }, "\uD83D\uDCB0\uD83D\uDCB0"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: '-8px',
        left: '-4px',
        right: '-4px',
        height: '12px',
        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#058585',
        marginBottom: '8px'
      }
    }, "$", totalSaved.toLocaleString()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '12px'
      }
    }, activeSavingsGoal ? `${Math.round(totalSaved / activeSavingsGoal.amount * 100)}% Full` : 'Tap to set a goal'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#058585',
        fontWeight: '500'
      }
    }, "\uD83D\uDC46 Tap jar for details")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
        borderRadius: '10px',
        padding: '16px',
        border: '1px solid #ddd'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#333',
        marginBottom: '12px',
        fontWeight: '600'
      }
    }, "\uD83D\uDCB5 Actual Money Set Aside"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: actualMoneySaved >= totalSaved ? '#00A86B' : '#FF8C00',
        marginBottom: '8px'
      }
    }, "$", actualMoneySaved.toLocaleString()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '12px'
      }
    }, actualMoneySaved >= totalSaved ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#00A86B'
      }
    }, "\u2705 You've saved it all! Amazing discipline!") : /*#__PURE__*/React.createElement("span", null, "You've actually saved $", actualMoneySaved.toLocaleString(), " of your $", totalSaved.toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        const amount = prompt('How much have you actually set aside?', actualMoneySaved);
        if (amount && !isNaN(amount)) {
          setActualMoneySaved(parseFloat(amount));
        }
      },
      style: {
        flex: 1,
        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
        color: '#fff',
        padding: '10px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
      }
    }, "Update Amount")))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#058585',
        fontSize: '18px',
        marginBottom: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "scale",
      style: {
        width: '20px',
        height: '20px',
        strokeWidth: 2
      }
    }), "Your Reality Check"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)',
        borderRadius: '12px',
        padding: '24px',
        border: '2px solid rgba(220, 20, 60, 0.2)',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#DC143C',
        marginBottom: '16px'
      }
    }, "\uD83D\uDCB8 If You'd Kept Using (", totalDays, " days):"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Would Have Spent:"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#DC143C'
      }
    }, "-$", totalSaved.toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Plus Interest (20% APR):"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#DC143C'
      }
    }, "-$", Math.round(totalSaved * 0.34).toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Health Costs (Estimated):"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#DC143C'
      }
    }, "-$", Math.round(totalDays * 4).toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Total Cost:"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#DC143C'
      }
    }, "-$", (totalSaved + Math.round(totalSaved * 0.34) + Math.round(totalDays * 4)).toLocaleString()))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)',
        borderRadius: '12px',
        padding: '24px',
        border: '2px solid rgba(0, 168, 107, 0.3)',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#00A86B',
        marginBottom: '8px'
      }
    }, "\u2728 Your Actual Savings:"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#00A86B',
        marginBottom: '16px'
      }
    }, "+$", totalSaved.toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid rgba(5, 133, 133, 0.2)',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "NET GAIN"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#058585',
        marginBottom: '8px'
      }
    }, "$", (totalSaved + totalSaved + Math.round(totalSaved * 0.34) + Math.round(totalDays * 4)).toLocaleString(), " \uD83D\uDC9A"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic'
      }
    }, "You've reclaimed your financial future."))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#058585',
        fontSize: '18px',
        marginBottom: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clock",
      style: {
        width: '20px',
        height: '20px',
        strokeWidth: 2
      }
    }), "Coming Soon - You're Almost There!"), sortedCountdown.slice(0, 5).map((item, index) => {
      const unlocked = item.daysAway === 0;
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        style: {
          background: unlocked ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.15) 0%, rgba(0, 168, 107, 0.05) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
          borderRadius: '10px',
          padding: '16px',
          border: unlocked ? '2px solid #00A86B' : '1px solid #ddd',
          marginBottom: '12px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": item.icon,
        style: {
          width: '20px',
          height: '20px',
          strokeWidth: 2,
          color: '#058585',
          marginBottom: '4px'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '15px',
          fontWeight: '600',
          color: '#333'
        }
      }, item.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666'
        }
      }, "$", item.cost.toLocaleString())), unlocked && /*#__PURE__*/React.createElement("div", {
        style: {
          background: '#00A86B',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }
      }, "UNLOCKED! \uD83C\uDF89")), !unlocked && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: '8px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: `${item.progress}%`,
          height: '100%',
          background: '#058585',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666'
        }
      }, "\u23F3 ", item.daysAway, " ", item.daysAway === 1 ? 'day' : 'days', " away", ' • ', Math.round(item.progress), "% there")), unlocked && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#00A86B',
          fontWeight: '600'
        }
      }, "\u2705 You can afford this NOW"));
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowModal('addCountdown'),
      style: {
        width: '100%',
        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
        color: '#058585',
        padding: '14px',
        borderRadius: '8px',
        border: '2px dashed #058585',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
      }
    }, "+ Add Custom Goal")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#058585',
        fontSize: '18px',
        marginBottom: '15px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "map",
      style: {
        width: '20px',
        height: '20px',
        strokeWidth: 2
      }
    }), "Your Money Map Journey"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
        borderRadius: '12px',
        padding: '24px',
        border: '2px solid rgba(5, 133, 133, 0.2)'
      }
    }, moneyMapStops.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '40px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, "\uD83D\uDDFA\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px'
      }
    }, "No Money Map Milestones Yet"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666'
      }
    }, "Money map milestones will appear here as they are added by your coach.")) : moneyMapStops.map((stop, index) => {
      const achieved = totalSaved >= stop.amount;
      const nextAmount = index < moneyMapStops.length - 1 ? moneyMapStops[index + 1].amount : Infinity;
      const isCurrent = !achieved && (index === 0 || totalSaved >= (index > 0 ? moneyMapStops[index - 1].amount : 0));
      return /*#__PURE__*/React.createElement("div", {
        key: index
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: index === 7 ? 0 : '20px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          opacity: achieved || isCurrent ? 1 : 0.3,
          transform: achieved ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": stop.icon,
        style: {
          width: '32px',
          height: '32px',
          strokeWidth: 2,
          color: achieved ? '#00A86B' : isCurrent ? '#058585' : '#999'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '15px',
          fontWeight: '600',
          color: achieved ? '#00A86B' : isCurrent ? '#058585' : '#999',
          marginBottom: '2px'
        }
      }, stop.milestone, achieved && ' ✅', isCurrent && ' ← YOU ARE HERE'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '13px',
          color: '#666'
        }
      }, stop.label))), index < 7 && /*#__PURE__*/React.createElement("div", {
        style: {
          width: '3px',
          height: '30px',
          background: achieved ? '#00A86B' : 'linear-gradient(180deg, rgba(5, 133, 133, 0.3) 0%, rgba(5, 133, 133, 0.1) 100%)',
          marginLeft: '16px',
          marginBottom: '8px',
          borderRadius: '2px'
        }
      }));
    }))));
  })())), journeyTab === 'wellness' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      background: '#069494',
      padding: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: wellnessCardsRef,
    onTouchStart: handleWellnessTouchStart,
    onTouchMove: handleWellnessTouchMove,
    onTouchEnd: handleWellnessTouchEnd,
    style: {
      width: '100%',
      padding: '0 15px'
    }
  }, wellnessCardIndex === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (checkIns.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "smile",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE MOOD"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "Complete check-ins to track"));
    }
    const moodScores = checkIns.filter(c => c.morningData?.mood !== undefined).map(c => c.morningData.mood);
    if (moodScores.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "smile",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE MOOD"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "No mood data available"));
    }
    const avg = (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "smile",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "AVERAGE MOOD"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, avg, " / 10"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "Based on ", moodScores.length, " check-ins"));
  })()), wellnessCardIndex === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (checkIns.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "flame",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE CRAVING"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "Complete check-ins to track"));
    }
    const cravingScores = checkIns.filter(c => c.morningData?.craving !== undefined).map(c => c.morningData.craving);
    if (cravingScores.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "flame",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE CRAVING"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "No craving data available"));
    }
    const avg = (cravingScores.reduce((a, b) => a + b, 0) / cravingScores.length).toFixed(1);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "flame",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "AVERAGE CRAVING"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, avg, " / 10"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "Based on ", cravingScores.length, " check-ins"));
  })()), wellnessCardIndex === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (checkIns.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "alert-circle",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE ANXIETY"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "Complete check-ins to track"));
    }
    const anxietyScores = checkIns.filter(c => (c.morningData?.anxiety ?? c.morningData?.anxietyLevel) !== undefined).map(c => c.morningData?.anxiety ?? c.morningData?.anxietyLevel);
    if (anxietyScores.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "alert-circle",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE ANXIETY"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "No anxiety data available"));
    }
    const avg = (anxietyScores.reduce((a, b) => a + b, 0) / anxietyScores.length).toFixed(1);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "alert-circle",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "AVERAGE ANXIETY"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, avg, " / 10"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "Based on ", anxietyScores.length, " check-ins"));
  })()), wellnessCardIndex === 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (checkIns.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "moon",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE SLEEP"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "Complete check-ins to track"));
    }
    const sleepScores = checkIns.filter(c => (c.morningData?.sleep ?? c.morningData?.sleepQuality) !== undefined).map(c => c.morningData?.sleep ?? c.morningData?.sleepQuality);
    if (sleepScores.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "moon",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "AVERAGE SLEEP"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "No sleep data available"));
    }
    const avg = (sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length).toFixed(1);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "moon",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "AVERAGE SLEEP"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, avg, " / 10"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "Based on ", sleepScores.length, " check-ins"));
  })()), wellnessCardIndex === 4 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#069494',
      borderRadius: '12px',
      padding: '32px 24px',
      border: '2px solid #FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, (() => {
    if (checkIns.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "star",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "OVERALL DAY RATING"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "Complete evening reflections to track"));
    }
    const overallScores = checkIns.filter(c => c.eveningData?.overallDay !== undefined).map(c => c.eveningData.overallDay);
    if (overallScores.length === 0) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "star",
        style: {
          width: '48px',
          height: '48px',
          color: '#FFFFFF',
          marginBottom: '16px',
          strokeWidth: 2
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '20px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, "OVERALL DAY RATING"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '64px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.2',
          marginBottom: '12px'
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }
      }, "No evening reflection data available"));
    }
    const avg = (overallScores.reduce((a, b) => a + b, 0) / overallScores.length).toFixed(1);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "star",
      style: {
        width: '48px',
        height: '48px',
        color: '#FFFFFF',
        marginBottom: '16px',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
        marginBottom: '20px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    }, "OVERALL DAY RATING"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.2',
        marginBottom: '12px'
      }
    }, avg, " / 10"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400'
      }
    }, "Based on ", overallScores.length, " evening reflections"));
  })())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '20px'
    }
  }, [0, 1, 2, 3, 4].map(index => /*#__PURE__*/React.createElement("div", {
    key: index,
    onClick: () => setWellnessCardIndex(index),
    style: {
      width: wellnessCardIndex === index ? '24px' : '8px',
      height: '8px',
      borderRadius: '4px',
      background: wellnessCardIndex === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      maxWidth: '600px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      color: '#058585',
      fontSize: '16px',
      marginBottom: '12px',
      fontWeight: '600'
    }
  }, "Wellness Trends"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setExpandedGraph(expandedGraph === 'mood' ? null : 'mood'),
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expandedGraph === 'mood' ? '12px' : '0'
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
      width: '18px',
      height: '18px',
      color: '#069494',
      strokeWidth: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    }
  }, "Mood Trend")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": expandedGraph === 'mood' ? 'chevron-down' : 'chevron-right',
    style: {
      width: '16px',
      height: '16px',
      color: '#999',
      strokeWidth: 2
    }
  })), expandedGraph === 'mood' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '220px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyMoodChart",
    style: {
      maxHeight: '220px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '10px',
      fontSize: '14px'
    }
  }, missedMoodCheckIns > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      marginBottom: '5px'
    }
  }, "Missed ", missedMoodCheckIns, " check-ins in the last 31 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#999'
    }
  }, "Stay consistent to avoid gaps in your wellness picture")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#00A86B',
      fontWeight: 'bold',
      marginBottom: '5px'
    }
  }, "Perfect streak! All 31 check-ins completed \uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#00A86B'
    }
  }, "Keep up the great work!")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '120px',
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyMoodSparkline",
    style: {
      maxHeight: '120px'
    }
  }))), (() => {
    // Calculate this week and last week averages
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 14);
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 7);

    // Filter check-ins for this week
    const thisWeekCheckIns = checkInData.filter(c => {
      const date = c.date?.toDate?.() || new Date(c.date);
      return date >= thisWeekStart && date <= today;
    });

    // Filter check-ins for last week
    const lastWeekCheckIns = checkInData.filter(c => {
      const date = c.date?.toDate?.() || new Date(c.date);
      return date >= lastWeekStart && date < lastWeekEnd;
    });

    // Calculate averages for this week
    const thisWeekMood = thisWeekCheckIns.length > 0 ? thisWeekCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / thisWeekCheckIns.length : null;
    const thisWeekCravings = thisWeekCheckIns.length > 0 ? thisWeekCheckIns.reduce((sum, c) => sum + (c.cravings || 0), 0) / thisWeekCheckIns.length : null;
    const thisWeekAnxiety = thisWeekCheckIns.length > 0 ? thisWeekCheckIns.reduce((sum, c) => sum + (c.anxiety || 0), 0) / thisWeekCheckIns.length : null;
    const thisWeekSleep = thisWeekCheckIns.length > 0 ? thisWeekCheckIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / thisWeekCheckIns.length : null;

    // Calculate averages for last week
    const lastWeekMood = lastWeekCheckIns.length > 0 ? lastWeekCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / lastWeekCheckIns.length : null;
    const lastWeekCravings = lastWeekCheckIns.length > 0 ? lastWeekCheckIns.reduce((sum, c) => sum + (c.cravings || 0), 0) / lastWeekCheckIns.length : null;
    const lastWeekAnxiety = lastWeekCheckIns.length > 0 ? lastWeekCheckIns.reduce((sum, c) => sum + (c.anxiety || 0), 0) / lastWeekCheckIns.length : null;
    const lastWeekSleep = lastWeekCheckIns.length > 0 ? lastWeekCheckIns.reduce((sum, c) => sum + (c.sleep || 0), 0) / lastWeekCheckIns.length : null;

    // Calculate improvements
    const moodChange = thisWeekMood !== null && lastWeekMood !== null ? thisWeekMood - lastWeekMood : null;
    const cravingsChange = thisWeekCravings !== null && lastWeekCravings !== null ? lastWeekCravings - thisWeekCravings : null; // Lower is better
    const anxietyChange = thisWeekAnxiety !== null && lastWeekAnxiety !== null ? lastWeekAnxiety - thisWeekAnxiety : null; // Lower is better
    const sleepChange = thisWeekSleep !== null && lastWeekSleep !== null ? thisWeekSleep - lastWeekSleep : null;

    // Count improvements
    const improvements = [moodChange, cravingsChange, anxietyChange, sleepChange].filter(c => c > 0).length;
    const totalMetrics = [moodChange, cravingsChange, anxietyChange, sleepChange].filter(c => c !== null).length;

    // Don't show card if not enough data
    if (totalMetrics === 0) return null;
    const isImproving = improvements >= totalMetrics / 2;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, rgba(0, 119, 204, 0.05) 0%, rgba(0, 168, 107, 0.05) 100%)',
        border: `2px solid ${isImproving ? '#00A86B' : '#FFA500'}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "trending-up",
      style: {
        width: '24px',
        height: '24px',
        color: isImproving ? '#00A86B' : '#FFA500',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#333'
      }
    }, "Week-Over-Week Progress")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }
    }, moodChange !== null && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px',
        border: `2px solid ${moodChange > 0 ? '#00A86B' : moodChange < 0 ? '#DC143C' : '#DDD'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Mood"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": moodChange > 0 ? 'arrow-up' : moodChange < 0 ? 'arrow-down' : 'minus',
      style: {
        width: '16px',
        height: '16px',
        color: moodChange > 0 ? '#00A86B' : moodChange < 0 ? '#DC143C' : '#999',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: moodChange > 0 ? '#00A86B' : moodChange < 0 ? '#DC143C' : '#333'
      }
    }, Math.abs(moodChange).toFixed(1))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999',
        marginTop: '4px'
      }
    }, thisWeekMood.toFixed(1), " vs ", lastWeekMood.toFixed(1))), cravingsChange !== null && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px',
        border: `2px solid ${cravingsChange > 0 ? '#00A86B' : cravingsChange < 0 ? '#DC143C' : '#DDD'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Cravings"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": cravingsChange > 0 ? 'arrow-down' : cravingsChange < 0 ? 'arrow-up' : 'minus',
      style: {
        width: '16px',
        height: '16px',
        color: cravingsChange > 0 ? '#00A86B' : cravingsChange < 0 ? '#DC143C' : '#999',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: cravingsChange > 0 ? '#00A86B' : cravingsChange < 0 ? '#DC143C' : '#333'
      }
    }, Math.abs(cravingsChange).toFixed(1))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999',
        marginTop: '4px'
      }
    }, thisWeekCravings.toFixed(1), " vs ", lastWeekCravings.toFixed(1))), anxietyChange !== null && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px',
        border: `2px solid ${anxietyChange > 0 ? '#00A86B' : anxietyChange < 0 ? '#DC143C' : '#DDD'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Anxiety"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": anxietyChange > 0 ? 'arrow-down' : anxietyChange < 0 ? 'arrow-up' : 'minus',
      style: {
        width: '16px',
        height: '16px',
        color: anxietyChange > 0 ? '#00A86B' : anxietyChange < 0 ? '#DC143C' : '#999',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: anxietyChange > 0 ? '#00A86B' : anxietyChange < 0 ? '#DC143C' : '#333'
      }
    }, Math.abs(anxietyChange).toFixed(1))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999',
        marginTop: '4px'
      }
    }, thisWeekAnxiety.toFixed(1), " vs ", lastWeekAnxiety.toFixed(1))), sleepChange !== null && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px',
        border: `2px solid ${sleepChange > 0 ? '#00A86B' : sleepChange < 0 ? '#DC143C' : '#DDD'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '4px'
      }
    }, "Sleep"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": sleepChange > 0 ? 'arrow-up' : sleepChange < 0 ? 'arrow-down' : 'minus',
      style: {
        width: '16px',
        height: '16px',
        color: sleepChange > 0 ? '#00A86B' : sleepChange < 0 ? '#DC143C' : '#999',
        strokeWidth: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: sleepChange > 0 ? '#00A86B' : sleepChange < 0 ? '#DC143C' : '#333'
      }
    }, Math.abs(sleepChange).toFixed(1))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#999',
        marginTop: '4px'
      }
    }, thisWeekSleep.toFixed(1), " vs ", lastWeekSleep.toFixed(1)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: isImproving ? 'rgba(0, 168, 107, 0.1)' : 'rgba(255, 165, 0, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": isImproving ? 'thumbs-up' : 'heart',
      style: {
        width: '20px',
        height: '20px',
        color: isImproving ? '#00A86B' : '#FFA500',
        strokeWidth: 2,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: '14px',
        color: '#333',
        lineHeight: '1.4'
      }
    }, isImproving ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#00A86B'
      }
    }, "Great progress!"), " You improved in ", improvements, " out of ", totalMetrics, " wellness areas this week. Keep up the excellent work!") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#FFA500'
      }
    }, "Stay strong!"), " Recovery has ups and downs. Focus on the areas you improved and keep showing up each day."))));
  })(), /*#__PURE__*/React.createElement("div", {
    onClick: () => setExpandedGraph(expandedGraph === 'cravings' ? null : 'cravings'),
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expandedGraph === 'cravings' ? '12px' : '0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "flame",
    style: {
      width: '18px',
      height: '18px',
      color: '#FF6B35',
      strokeWidth: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    }
  }, "Craving Intensity")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": expandedGraph === 'cravings' ? 'chevron-down' : 'chevron-right',
    style: {
      width: '16px',
      height: '16px',
      color: '#999',
      strokeWidth: 2
    }
  })), expandedGraph === 'cravings' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '220px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyCravingsChart",
    style: {
      maxHeight: '220px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '10px',
      fontSize: '14px'
    }
  }, missedCravingCheckIns > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      marginBottom: '5px'
    }
  }, "Missed ", missedCravingCheckIns, " check-ins in the last 31 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#999'
    }
  }, "Stay consistent to avoid gaps in your wellness picture")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#00A86B',
      fontWeight: 'bold',
      marginBottom: '5px'
    }
  }, "Perfect streak! All 31 check-ins completed \uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#00A86B'
    }
  }, "Keep up the great work!")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '120px',
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyCravingsSparkline",
    style: {
      maxHeight: '120px'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    onClick: () => setExpandedGraph(expandedGraph === 'anxiety' ? null : 'anxiety'),
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expandedGraph === 'anxiety' ? '12px' : '0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-circle",
    style: {
      width: '18px',
      height: '18px',
      color: '#FFB627',
      strokeWidth: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    }
  }, "Anxiety Level")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": expandedGraph === 'anxiety' ? 'chevron-down' : 'chevron-right',
    style: {
      width: '16px',
      height: '16px',
      color: '#999',
      strokeWidth: 2
    }
  })), expandedGraph === 'anxiety' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '220px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyAnxietyChart",
    style: {
      maxHeight: '220px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '10px',
      fontSize: '14px'
    }
  }, missedAnxietyCheckIns > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      marginBottom: '5px'
    }
  }, "Missed ", missedAnxietyCheckIns, " check-ins in the last 31 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#999'
    }
  }, "Stay consistent to avoid gaps in your wellness picture")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#00A86B',
      fontWeight: 'bold',
      marginBottom: '5px'
    }
  }, "Perfect streak! All 31 check-ins completed \uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#00A86B'
    }
  }, "Keep up the great work!")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '120px',
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyAnxietySparkline",
    style: {
      maxHeight: '120px'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    onClick: () => setExpandedGraph(expandedGraph === 'sleep' ? null : 'sleep'),
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expandedGraph === 'sleep' ? '12px' : '0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "moon",
    style: {
      width: '18px',
      height: '18px',
      color: '#4A90E2',
      strokeWidth: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    }
  }, "Sleep Quality")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": expandedGraph === 'sleep' ? 'chevron-down' : 'chevron-right',
    style: {
      width: '16px',
      height: '16px',
      color: '#999',
      strokeWidth: 2
    }
  })), expandedGraph === 'sleep' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '220px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeySleepChart",
    style: {
      maxHeight: '220px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '10px',
      fontSize: '14px'
    }
  }, missedSleepCheckIns > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      marginBottom: '5px'
    }
  }, "Missed ", missedSleepCheckIns, " check-ins in the last 31 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#999'
    }
  }, "Stay consistent to avoid gaps in your wellness picture")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#00A86B',
      fontWeight: 'bold',
      marginBottom: '5px'
    }
  }, "Perfect streak! All 31 check-ins completed \uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#00A86B'
    }
  }, "Keep up the great work!")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '120px',
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeySleepSparkline",
    style: {
      maxHeight: '120px'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    onClick: () => setExpandedGraph(expandedGraph === 'overall' ? null : 'overall'),
    style: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: expandedGraph === 'overall' ? '12px' : '0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star",
    style: {
      width: '18px',
      height: '18px',
      color: '#4A90E2',
      strokeWidth: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    }
  }, "Overall Day Rating")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": expandedGraph === 'overall' ? 'chevron-down' : 'chevron-right',
    style: {
      width: '16px',
      height: '16px',
      color: '#999',
      strokeWidth: 2
    }
  })), expandedGraph === 'overall' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '220px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyOverallChart",
    style: {
      maxHeight: '220px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '10px',
      fontSize: '14px'
    }
  }, missedOverallCheckIns > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      marginBottom: '5px'
    }
  }, "Missed ", missedOverallCheckIns, " check-ins in the last 31 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#999'
    }
  }, "Stay consistent to avoid gaps in your wellness picture")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#00A86B',
      fontWeight: 'bold',
      marginBottom: '5px'
    }
  }, "Perfect streak! All 31 check-ins completed \uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#00A86B'
    }
  }, "Keep up the great work!")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: '120px',
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "journeyOverallSparkline",
    style: {
      maxHeight: '120px'
    }
  }))))))));
}

// Export the component
window.GLRSApp.components.JourneyTab = JourneyTab;
// Index/TasksTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
function TasksTab() {
  // ✅ PHASE 8C-2: Converted to use Context API
  // Get state from Context instead of props
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
    weeklyStats,
    loadCalendarHeatmapData,
    loadMoodWeekData,
    streakData,
    setCurrentView,
    patternDetection,
    coachNotes,
    nextMilestone,
    copingTechniques,
    eveningReflectionData,
    setEveningReflectionData,
    handleEveningReflection,
    reflectionStreak,
    loadStreakReflections,
    reflectionStats,
    reflectionStreakData,
    loadOverallDayWeekData,
    loadGratitudeJournal,
    loadGratitudeInsights,
    loadChallengesHistory,
    loadChallengesInsights,
    loadGoalAchievementData,
    shareReflections,
    goals,
    assignments,
    handleAssignmentComplete,
    handleReflectionSave,
    setDueToday,
    user,
    sobrietyDays,
    setShowModal
  } = useAppContext();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#058585',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '48px',
      position: 'fixed',
      top: '48px',
      left: 0,
      right: 0,
      zIndex: 99,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setActiveTaskTab('checkin');
    },
    style: {
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
    }
  }, "Check-In", activeTaskTab === 'checkin' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setActiveTaskTab('reflections');
    },
    style: {
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
    }
  }, "Reflections", activeTaskTab === 'reflections' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setActiveTaskTab('golden');
    },
    style: {
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
    }
  }, "The Golden Thread", activeTaskTab === 'golden' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: '#FFFFFF'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      minHeight: '100vh',
      paddingBottom: '80px',
      paddingTop: '96px'
    }
  }, activeTaskTab === 'checkin' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 5%',
      maxWidth: '600px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '10px'
    }
  }, "Morning Check-In"), (() => {
    return checkInStatus.morning;
  })() ?
  /*#__PURE__*/
  // COMPLETE STATE - Show completion message
  React.createElement("div", {
    style: {
      width: '100%',
      background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
      borderRadius: '12px',
      padding: '30px 20px',
      marginBottom: '20px',
      textAlign: 'center',
      border: '2px solid rgba(5, 133, 133, 0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '64px',
      marginBottom: '15px'
    }
  }, "\u2705"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#058585',
      marginBottom: '8px'
    }
  }, "Morning Check-In Complete!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666',
      margin: 0
    }
  }, "Great job! Your morning check-in has been recorded. Come back tomorrow for your next check-in.")) :
  /*#__PURE__*/
  // PENDING STATE - Show form
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Mood"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: '70px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% - 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% + 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      right: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "swipeable-picker-container",
    style: {
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
    },
    onScroll: e => {
      const container = e.target;
      const scrollLeft = container.scrollLeft;
      const itemWidth = 60 + 20; // width + gap
      const centerIndex = Math.round(scrollLeft / itemWidth);
      if (centerIndex !== morningCheckInData.mood && centerIndex >= 0 && centerIndex <= 10) {
        triggerHaptic('light');
        setMorningCheckInData(prev => ({
          ...prev,
          mood: centerIndex
        }));
      }
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => /*#__PURE__*/React.createElement("div", {
    key: rating,
    onClick: () => {
      triggerHaptic('light');
      setMorningCheckInData(prev => ({
        ...prev,
        mood: rating
      }));
    },
    style: {
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
    }
  }, rating))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Craving"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: '70px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% - 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% + 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      right: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "swipeable-picker-container",
    style: {
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
    },
    onScroll: e => {
      const container = e.target;
      const scrollLeft = container.scrollLeft;
      const itemWidth = 60 + 20;
      const centerIndex = Math.round(scrollLeft / itemWidth);
      if (centerIndex !== morningCheckInData.craving && centerIndex >= 0 && centerIndex <= 10) {
        triggerHaptic('light');
        setMorningCheckInData(prev => ({
          ...prev,
          craving: centerIndex
        }));
      }
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => /*#__PURE__*/React.createElement("div", {
    key: rating,
    onClick: () => {
      triggerHaptic('light');
      setMorningCheckInData(prev => ({
        ...prev,
        craving: rating
      }));
    },
    style: {
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
    }
  }, rating))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Anxiety"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: '70px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% - 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% + 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      right: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "swipeable-picker-container",
    style: {
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
    },
    onScroll: e => {
      const container = e.target;
      const scrollLeft = container.scrollLeft;
      const itemWidth = 60 + 20;
      const centerIndex = Math.round(scrollLeft / itemWidth);
      if (centerIndex !== morningCheckInData.anxiety && centerIndex >= 0 && centerIndex <= 10) {
        triggerHaptic('light');
        setMorningCheckInData(prev => ({
          ...prev,
          anxiety: centerIndex
        }));
      }
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => /*#__PURE__*/React.createElement("div", {
    key: rating,
    onClick: () => {
      triggerHaptic('light');
      setMorningCheckInData(prev => ({
        ...prev,
        anxiety: rating
      }));
    },
    style: {
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
    }
  }, rating))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Sleep"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: '70px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% - 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% + 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      right: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "swipeable-picker-container",
    style: {
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
    },
    onScroll: e => {
      const container = e.target;
      const scrollLeft = container.scrollLeft;
      const itemWidth = 60 + 20;
      const centerIndex = Math.round(scrollLeft / itemWidth);
      if (centerIndex !== morningCheckInData.sleep && centerIndex >= 0 && centerIndex <= 10) {
        triggerHaptic('light');
        setMorningCheckInData(prev => ({
          ...prev,
          sleep: centerIndex
        }));
      }
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => /*#__PURE__*/React.createElement("div", {
    key: rating,
    onClick: () => {
      triggerHaptic('light');
      setMorningCheckInData(prev => ({
        ...prev,
        sleep: rating
      }));
    },
    style: {
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
    }
  }, rating))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
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
    },
    disabled: morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null,
    style: {
      width: '120px',
      height: '40px',
      background: morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null ? '#cccccc' : '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: morningCheckInData.mood == null || morningCheckInData.craving == null || morningCheckInData.anxiety == null || morningCheckInData.sleep == null ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s'
    }
  }, "Submit"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadStreakCheckIns();
      setShowModal('streak');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Check-In Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, checkInStreak > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#058585'
    }
  }, checkInStreak, " ", checkInStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "Start checking in daily!"))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '10px',
      marginTop: '20px'
    }
  }, "Quick Stats"), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      setShowModal('calendarHeatmap');
      await loadCalendarHeatmapData();
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Check Rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, weeklyStats.checkRate > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, weeklyStats.checkRate, "%"), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "No data yet"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadMoodWeekData();
      setShowModal('moodInsights');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Avg Mood"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, weeklyStats.avgMood > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, weeklyStats.avgMood), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "No data yet"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowModal('streaks');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Longest Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, streakData.longestStreak > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "\uD83D\uDD25 ", streakData.longestStreak, " ", streakData.longestStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "No data yet"))), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setCurrentView('progress');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bar-chart-3",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "View Check-In Trends"), patternDetection && patternDetection.type === 'mood' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#E8F5E9',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #4CAF50'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "activity",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), "Mood Pattern Detected"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, patternDetection.message)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowModal('moodPattern');
    },
    style: {
      width: '100%',
      height: '40px',
      background: '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: 'pointer'
    }
  }, "View Mood Tips")), patternDetection && patternDetection.type === 'craving' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFEBEE',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #EF5350'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "flame",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), "Craving Pattern Detected"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, patternDetection.message)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowModal('cravingPattern');
    },
    style: {
      width: '100%',
      height: '40px',
      background: '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: 'pointer'
    }
  }, "View Craving Tips")), patternDetection && patternDetection.type === 'anxiety' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFF3E0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #FFB74D'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), "Anxiety Pattern Detected"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, patternDetection.message)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowModal('anxietyPattern');
    },
    style: {
      width: '100%',
      height: '40px',
      background: '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: 'pointer'
    }
  }, "View Anxiety Tips")), patternDetection && patternDetection.type === 'sleep' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#E3F2FD',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #64B5F6'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "moon",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), "Sleep Pattern Detected"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666'
    }
  }, patternDetection.message)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      triggerHaptic('light');
      setShowModal('sleepPattern');
    },
    style: {
      width: '100%',
      height: '40px',
      background: '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: 'pointer'
    }
  }, "View Sleep Tips")), coachNotes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer'
    },
    onClick: () => {
      triggerHaptic('light');
      alert(coachNotes[0].note || 'Coach note available');
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-square",
    style: {
      width: '20px',
      height: '20px',
      color: '#058585'
    }
  }), "Coach Notes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#666666'
    }
  }, "\"", coachNotes[0].note || 'New note from your coach', "\"")), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '12px',
      marginTop: '24px'
    }
  }, "Quick Tools"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: 'linear-gradient(135deg, #DC143C 0%, #B01030 100%)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '8px',
      boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
      cursor: 'pointer',
      border: '2px solid #DC143C'
    },
    onClick: () => {
      triggerHaptic('medium');
      alert('Crisis resources:\n\n988 Suicide & Crisis Lifeline\nCall or Text 988\n\nCrisis Text Line\nText HOME to 741741\n\nSAMHSA National Helpline\n1-800-662-4357');
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
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '28px',
      height: '28px',
      color: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: '4px'
    }
  }, "Emergency Support"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '400',
      color: 'rgba(255,255,255,0.9)'
    }
  }, "24/7 crisis resources and helplines")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '20px',
      height: '20px',
      color: 'rgba(255,255,255,0.7)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowModal('weeklyReport');
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
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Weekly Progress Report"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#666666'
    }
  }, "View detailed analytics and insights"))), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      try {
        triggerHaptic('light');
        const shareText = checkInStreak > 0 ? `${checkInStreak} ${checkInStreak === 1 ? 'day' : 'days'} check-in streak! Proud of my progress in recovery. ${weeklyStats.checkRate}% check-in rate this month.` : 'Starting my recovery journey! Following my daily check-ins and reflections.';
        if (navigator.share) {
          await navigator.share({
            title: 'My Recovery Progress',
            text: shareText
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
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '24px',
      height: '24px',
      color: '#058585'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Share Your Progress"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#666666'
    }
  }, "Celebrate milestones with supporters"))), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })), (() => {
    const dayOfMonth = new Date().getDate();
    const technique = copingTechniques.find(t => t.day === dayOfMonth) || copingTechniques[0];
    return /*#__PURE__*/React.createElement("div", {
      style: {
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
      },
      onClick: () => {
        triggerHaptic('light');
        setShowModal('copingTechnique');
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
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        fontWeight: '400',
        color: '#000000'
      }
    }, technique.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: '400',
        color: '#666666'
      }
    }, "Today's coping technique \u2022 ", technique.category))), /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right",
      style: {
        width: '16px',
        height: '16px',
        color: '#666666'
      }
    }));
  })(), nextMilestone && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(5, 133, 133, 0.3)',
      cursor: 'pointer'
    },
    onClick: () => {
      triggerHaptic('light');
      setShowModal('milestone');
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
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": nextMilestone.icon,
    style: {
      width: '28px',
      height: '28px',
      color: '#FFFFFF'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: '4px'
    }
  }, nextMilestone.achieved ? 'All Milestones Complete!' : `Next: ${nextMilestone.label}`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: '400',
      color: 'rgba(255,255,255,0.9)'
    }
  }, nextMilestone.achieved ? `${sobrietyDays} days sober - Amazing!` : `${nextMilestone.daysUntil} ${nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go • ${nextMilestone.progressPercentage}% there`)), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '20px',
      height: '20px',
      color: 'rgba(255,255,255,0.7)'
    }
  })))), activeTaskTab === 'reflections' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 5%',
      maxWidth: '600px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '10px'
    }
  }, "Evening Reflections"), checkInStatus.evening ?
  /*#__PURE__*/
  // COMPLETE STATE - Show completion message
  React.createElement("div", {
    style: {
      width: '100%',
      background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(5, 133, 133, 0.05) 100%)',
      borderRadius: '12px',
      padding: '30px 20px',
      marginBottom: '20px',
      textAlign: 'center',
      border: '2px solid rgba(5, 133, 133, 0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '64px',
      marginBottom: '15px'
    }
  }, "\u2705"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#058585',
      marginBottom: '8px'
    }
  }, "Evening Reflection Complete!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: '#666',
      margin: 0
    }
  }, "Great job! Your evening reflection has been recorded. Come back tomorrow for your next reflection.")) :
  /*#__PURE__*/
  // PENDING STATE - Show form
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#E3F2FD',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      border: '1px solid #90CAF9'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Today's Reflection Prompt"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#666666',
      fontStyle: 'italic'
    }
  }, "\"What challenged you today, and what did you learn from it?\"")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Your Response"), /*#__PURE__*/React.createElement("textarea", {
    value: eveningReflectionData.promptResponse,
    onChange: e => setEveningReflectionData(prev => ({
      ...prev,
      promptResponse: e.target.value
    })),
    placeholder: "Reflect on today's prompt...",
    style: {
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
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Overall Day"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: '70px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% - 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '1px',
      height: '50px',
      background: 'rgba(5, 133, 133, 0.3)',
      left: 'calc(50% + 40px)',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
      right: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "swipeable-picker-container",
    style: {
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
    },
    onScroll: e => {
      const container = e.target;
      const scrollLeft = container.scrollLeft;
      const itemWidth = 80;
      const centerIndex = Math.round(scrollLeft / itemWidth);
      setEveningReflectionData(prev => ({
        ...prev,
        overallDay: centerIndex
      }));
    }
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => /*#__PURE__*/React.createElement("div", {
    key: num,
    style: {
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
    },
    onClick: e => {
      triggerHaptic('light');
      setEveningReflectionData(prev => ({
        ...prev,
        overallDay: num
      }));
      const container = e.target.closest('.swipeable-picker-container');
      if (container) {
        const itemWidth = 80;
        container.scrollLeft = num * itemWidth;
      }
    }
  }, num))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Today's Challenges"), /*#__PURE__*/React.createElement("textarea", {
    value: eveningReflectionData.challenges,
    onChange: e => setEveningReflectionData(prev => ({
      ...prev,
      challenges: e.target.value
    })),
    placeholder: "What challenges did you face today?",
    style: {
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
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "What I'm Grateful For"), /*#__PURE__*/React.createElement("textarea", {
    value: eveningReflectionData.gratitude,
    onChange: e => setEveningReflectionData(prev => ({
      ...prev,
      gratitude: e.target.value
    })),
    placeholder: "What are you grateful for today?",
    style: {
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
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '8px'
    }
  }, "Tomorrow's Goal"), /*#__PURE__*/React.createElement("textarea", {
    value: eveningReflectionData.tomorrowGoal,
    onChange: e => setEveningReflectionData(prev => ({
      ...prev,
      tomorrowGoal: e.target.value
    })),
    placeholder: "What's your goal for tomorrow?",
    style: {
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
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      triggerHaptic('success');
      await handleEveningReflection(eveningReflectionData);
    },
    disabled: eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal,
    style: {
      width: '120px',
      height: '40px',
      background: eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal ? '#cccccc' : '#058585',
      border: 'none',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '400',
      cursor: eveningReflectionData.overallDay === null || !eveningReflectionData.challenges || !eveningReflectionData.gratitude || !eveningReflectionData.tomorrowGoal ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s'
    }
  }, "Submit"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadStreakReflections();
      setShowModal('reflectionStreak');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Reflection Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, reflectionStreak > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#058585'
    }
  }, reflectionStreak, " ", reflectionStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "Start reflecting daily!"))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: '400',
      color: '#000000',
      marginBottom: '10px',
      marginTop: '20px'
    }
  }, "Reflection Stats"), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      setShowModal('calendarHeatmap');
      await loadCalendarHeatmapData();
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Total Reflections"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, reflectionStats.totalThisMonth > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, reflectionStats.totalThisMonth), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "0"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadOverallDayWeekData();
      setShowModal('overallDayInsights');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Avg Daily Score"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, reflectionStats.avgDailyScore > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, reflectionStats.avgDailyScore), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "No data"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      if (reflectionStats.gratitudeThemes && reflectionStats.gratitudeThemes.length > 0) {
        triggerHaptic('light');
        setShowModal('gratitudeThemes');
      }
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Top Gratitude Theme"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, reflectionStats.topGratitudeTheme ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#058585'
    }
  }, reflectionStats.topGratitudeTheme), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "No gratitudes yet"))), /*#__PURE__*/React.createElement("div", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowModal('reflectionStreaks');
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#000000'
    }
  }, "Longest Streak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, reflectionStreakData.longestStreak > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#000000'
    }
  }, "\uD83D\uDD25 ", reflectionStreakData.longestStreak, " ", reflectionStreakData.longestStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: '16px',
      height: '16px',
      color: '#666666'
    }
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      fontWeight: '400',
      color: '#999999',
      fontStyle: 'italic'
    }
  }, "No data yet"))), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowModal('pastReflections');
    }
  }, "View Past Reflections"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#000000',
      marginTop: '24px',
      marginBottom: '12px'
    }
  }, "Quick Tools"), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: () => {
      triggerHaptic('light');
      setShowModal('gratitude');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "heart",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Gratitude Entry"), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadGratitudeJournal();
      await loadGratitudeInsights();
      setShowModal('gratitudeJournal');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "book-heart",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Gratitude Journal"), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadChallengesHistory();
      await loadChallengesInsights();
      setShowModal('challengesHistory');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-triangle",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Challenges History"), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: async () => {
      triggerHaptic('light');
      await loadGoalAchievementData();
      setShowModal('tomorrowGoals');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trophy",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Goal Tracker"), /*#__PURE__*/React.createElement("button", {
    style: {
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
    },
    onClick: () => {
      shareReflections();
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "share-2",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Share Reflections")), activeTaskTab === 'golden' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 5%'
    }
  }, React.createElement(window.GLRSApp.components.GoalsTasksView, {
    user: user,
    goals: goals,
    assignments: assignments,
    onAssignmentComplete: handleAssignmentComplete,
    onReflectionSave: handleReflectionSave,
    onShowGratitudeModal: () => setShowModal('gratitude'),
    onDueTodayChange: setDueToday
  }))));
}
window.GLRSApp.components.TasksTab = TasksTab;
// Index/CommunityTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
function CommunityTab() {
  // ✅ PHASE 8C-3: Converted to use Context API
  // Get state from Context instead of props
  const {
    activeChat,
    setActiveChat,
    communityMessages,
    sendCommunityMessage,
    user,
    uploadChatImage,
    flagContent,
    setModalImage,
    topicRooms,
    enterTopicRoom,
    supportGroups,
    meetings,
    emergencyResources,
    triggerHaptic,
    triggerSOS,
    CommunityChat
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    className: "section-content"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'white',
      marginBottom: '20px'
    }
  }, "Community Connect"), /*#__PURE__*/React.createElement("div", {
    className: "chat-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'main' ? 'active' : ''}`,
    onClick: () => setActiveChat('main')
  }, "GLRS Community"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'rooms' ? 'active' : ''}`,
    onClick: () => setActiveChat('rooms')
  }, "Topic Rooms"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'groups' ? 'active' : ''}`,
    onClick: () => setActiveChat('groups')
  }, "Support Groups"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'meetings' ? 'active' : ''}`,
    onClick: () => setActiveChat('meetings')
  }, "Meetings")), activeChat === 'main' && /*#__PURE__*/React.createElement(CommunityChat, {
    messages: communityMessages,
    onSendMessage: sendCommunityMessage,
    currentUserId: user?.uid,
    uploadChatImage: uploadChatImage,
    flagContent: flagContent,
    setModalImage: setModalImage
  }), activeChat === 'rooms' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#f4c430',
      marginBottom: '20px'
    }
  }, "Recovery Topic Rooms"), topicRooms?.length > 0 ? topicRooms.map(room => /*#__PURE__*/React.createElement("div", {
    key: room.id,
    className: "room-card",
    onClick: () => enterTopicRoom(room)
  }, /*#__PURE__*/React.createElement("div", {
    className: "room-icon"
  }, room.icon ? room.icon : /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '24px',
      height: '24px'
    }
  })), /*#__PURE__*/React.createElement("h4", null, room.name), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.7)'
    }
  }, room.description))) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-square",
    style: {
      width: '48px',
      height: '48px',
      color: 'var(--color-text-secondary)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty-state-text"
  }, "No topic rooms available yet."))), activeChat === 'groups' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#f4c430',
      marginBottom: '20px'
    }
  }, "Support Groups"), supportGroups?.length > 0 ? supportGroups.map(group => /*#__PURE__*/React.createElement("div", {
    key: group.id,
    className: "support-group-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-header"
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      color: 'white'
    }
  }, group.name), /*#__PURE__*/React.createElement("span", {
    className: `badge ${group.type === 'AA' ? 'badge-primary' : group.type === 'NA' ? 'badge-warning' : group.type === 'SMART' ? 'badge-success' : 'badge-secondary'}`
  }, group.type)), group.description && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '10px'
    }
  }, group.description), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar",
    style: {
      width: '14px',
      height: '14px'
    }
  }), group.day), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock",
    style: {
      width: '14px',
      height: '14px'
    }
  }), group.time), group.location && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin",
    style: {
      width: '14px',
      height: '14px'
    }
  }), group.location), !group.location && group.link && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "video",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Virtual Meeting")), group.link && /*#__PURE__*/React.createElement("button", {
    className: "join-btn",
    onClick: () => window.open(group.link, '_blank'),
    style: {
      marginTop: '10px'
    }
  }, "Join Virtual Meeting"))) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users",
    style: {
      width: '48px',
      height: '48px',
      color: 'var(--color-primary)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty-state-text"
  }, "No support groups available yet."))), activeChat === 'meetings' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#f4c430',
      marginBottom: '20px'
    }
  }, "Scheduled Group Meetings"), meetings?.length > 0 ? meetings.map(meeting => {
    const meetingDate = meeting.scheduledTime?.toDate ? meeting.scheduledTime.toDate() : new Date(meeting.scheduledTime);
    return /*#__PURE__*/React.createElement("div", {
      key: meeting.id,
      className: "meeting-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "meeting-header"
    }, /*#__PURE__*/React.createElement("h4", null, meeting.meetingTitle || 'Group Recovery Session'), /*#__PURE__*/React.createElement("span", {
      className: `status-badge ${meeting.status === 'scheduled' ? 'scheduled' : meeting.status === 'completed' ? 'completed' : 'cancelled'}`
    }, meeting.status)), /*#__PURE__*/React.createElement("div", {
      className: "meeting-type"
    }, meeting.type || 'Group Session'), /*#__PURE__*/React.createElement("div", {
      className: "meeting-details"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '14px',
        height: '14px'
      }
    }), meetingDate.toLocaleDateString()), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clock",
      style: {
        width: '14px',
        height: '14px'
      }
    }), meetingDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "timer",
      style: {
        width: '14px',
        height: '14px'
      }
    }), "Duration: ", meeting.duration || '60', " minutes"), meeting.isGlobal && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "globe",
      style: {
        width: '14px',
        height: '14px'
      }
    }), "All PIRs Invited")), meeting.notes && /*#__PURE__*/React.createElement("div", {
      className: "meeting-notes",
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "file-text",
      style: {
        width: '14px',
        height: '14px',
        marginTop: '2px'
      }
    }), meeting.notes), meeting.meetingLink && /*#__PURE__*/React.createElement("button", {
      className: "join-btn",
      onClick: () => window.open(meeting.meetingLink, '_blank')
    }, "Join Virtual Meeting"));
  }) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar",
    style: {
      width: '48px',
      height: '48px',
      color: 'var(--color-primary)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty-state-text"
  }, "No group meetings scheduled."))), /*#__PURE__*/React.createElement("div", {
    className: "crisis-resources"
  }, /*#__PURE__*/React.createElement("div", {
    className: "crisis-title"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '20px',
      height: '20px',
      marginRight: '8px',
      color: '#DC143C'
    }
  }), "Crisis Resources"), emergencyResources?.length > 0 ? emergencyResources.map(resource => /*#__PURE__*/React.createElement("div", {
    key: resource.id,
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "crisis-number"
  }, resource.phone && /*#__PURE__*/React.createElement("a", {
    href: `tel:${resource.phone}`
  }, resource.phone)), /*#__PURE__*/React.createElement("div", {
    className: "crisis-description"
  }, resource.title), /*#__PURE__*/React.createElement("small", {
    style: {
      opacity: 0.7
    }
  }, resource.available || '24/7'))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "crisis-number"
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:988"
  }, "988")), /*#__PURE__*/React.createElement("div", {
    className: "crisis-description"
  }, "Suicide & Crisis Lifeline")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "crisis-number"
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:1-800-662-4357"
  }, "1-800-662-HELP")), /*#__PURE__*/React.createElement("div", {
    className: "crisis-description"
  }, "SAMHSA National Helpline"))), /*#__PURE__*/React.createElement("button", {
    className: "sos-btn",
    onClick: () => {
      triggerHaptic('error');
      triggerSOS();
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '18px',
      height: '18px',
      marginRight: '8px'
    }
  }), "SOS - I Need Help Now")));
}
// Community Chat Component - FULLY UPDATED VERSION
function CommunityChat({
  messages,
  onSendMessage,
  currentUserId,
  uploadChatImage,
  flagContent,
  setModalImage
}) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [likes, setLikes] = useState({});
  const [showComments, setShowComments] = useState({});
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };
  const handleSend = async () => {
    if ((message.trim() || selectedImage) && !uploading) {
      setUploading(true);
      try {
        let imageUrl = null;
        if (selectedImage && uploadChatImage) {
          imageUrl = await uploadChatImage(selectedImage, 'community', 'main');
        }
        await onSendMessage(message, imageUrl);
        setMessage('');
        setSelectedImage(null);
        const fileInput = document.getElementById('community-image-input');
        if (fileInput) fileInput.value = '';
      } catch (error) {
        alert('Failed to send message');
      } finally {
        setUploading(false);
      }
    }
  };
  const handleLike = msgId => {
    setLikes(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };
  const getInitials = name => {
    if (!name) return 'A';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };
  const formatTimeAgo = timestamp => {
    if (!timestamp?.toDate) return 'now';
    const date = timestamp.toDate();
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 'var(--font-sm)',
      fontWeight: 'bold',
      flexShrink: 0
    }
  }, getInitials('You')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "What's on your mind?",
    value: message,
    onChange: e => setMessage(e.target.value),
    onKeyPress: e => e.key === 'Enter' && handleSend(),
    style: {
      width: '100%',
      padding: 'var(--space-3)',
      border: '1px solid #ddd',
      borderRadius: 'var(--radius-lg)',
      fontSize: 'var(--font-base)',
      background: '#f8f9fa',
      outline: 'none'
    }
  }), selectedImage && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)',
      padding: 'var(--space-2)',
      background: '#e7f5ff',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--font-sm)',
      color: '#333'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "image",
    style: {
      width: '16px',
      height: '16px',
      marginRight: '8px'
    }
  }), selectedImage.name), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSelectedImage(null),
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '16px',
      height: '16px',
      color: '#666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-3)',
      paddingTop: 'var(--space-3)',
      borderTop: '1px solid #eee'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    id: "community-image-input",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: handleImageSelect
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => document.getElementById('community-image-input').click(),
    style: {
      flex: 1,
      padding: 'var(--space-2)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-1)',
      fontSize: 'var(--font-sm)',
      color: '#666',
      fontWeight: '500'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "image",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "Photo"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSend,
    disabled: uploading || !message.trim() && !selectedImage,
    style: {
      padding: 'var(--space-2) var(--space-4)',
      background: uploading || !message.trim() && !selectedImage ? '#ccc' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      color: '#fff',
      fontSize: 'var(--font-sm)',
      fontWeight: 'bold',
      cursor: uploading || !message.trim() && !selectedImage ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)'
    }
  }, uploading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "loader",
    style: {
      width: '16px',
      height: '16px',
      animation: 'spin 1s linear infinite'
    }
  }), "Posting...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "send",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Post")))))), /*#__PURE__*/React.createElement("div", null, messages?.length > 0 ? messages.slice().reverse().map(msg => /*#__PURE__*/React.createElement("div", {
    key: msg.id,
    style: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 'var(--font-sm)',
      fontWeight: 'bold',
      marginRight: 'var(--space-3)'
    }
  }, getInitials(msg.senderName)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: '600',
      color: '#333',
      fontSize: 'var(--font-base)'
    }
  }, msg.senderName || 'Anonymous'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--font-xs)',
      color: '#666'
    }
  }, formatTimeAgo(msg.createdAt))), msg.senderId !== currentUserId && flagContent && /*#__PURE__*/React.createElement("button", {
    onClick: () => flagContent('community_message', {
      messageId: msg.id,
      messageContent: msg.content,
      messageImageUrl: msg.imageUrl || null,
      authorId: msg.senderId,
      authorName: msg.senderName
    }),
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "flag",
    style: {
      width: '16px',
      height: '16px',
      color: '#999'
    }
  }))), msg.content && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#333',
      fontSize: 'var(--font-base)',
      lineHeight: '1.5',
      marginBottom: msg.imageUrl ? 'var(--space-3)' : 0
    }
  }, msg.content), msg.imageUrl && /*#__PURE__*/React.createElement("img", {
    src: msg.imageUrl,
    alt: "Post content",
    style: {
      width: '100%',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    },
    onClick: () => setModalImage(msg.imageUrl)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-3)',
      paddingTop: 'var(--space-3)',
      borderTop: '1px solid #eee'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleLike(msg.id),
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      fontSize: 'var(--font-sm)',
      fontWeight: '500',
      color: likes[msg.id] ? 'var(--color-danger)' : '#666',
      padding: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "heart",
    style: {
      width: '18px',
      height: '18px',
      fill: likes[msg.id] ? 'var(--color-danger)' : 'none'
    }
  }), "Like"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowComments(prev => ({
      ...prev,
      [msg.id]: !prev[msg.id]
    })),
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      fontSize: 'var(--font-sm)',
      fontWeight: '500',
      color: '#666',
      padding: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '18px',
      height: '18px'
    }
  }), "Comment")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 'var(--space-8)',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users",
    style: {
      width: '48px',
      height: '48px',
      color: '#ccc',
      marginBottom: 'var(--space-3)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      fontSize: 'var(--font-base)'
    }
  }, "No posts yet. Be the first to share!")), /*#__PURE__*/React.createElement("div", {
    ref: messagesEndRef
  })));
}

// Export the component
window.GLRSApp.components.CommunityTab = CommunityTab;
// Recovery Resources View Component - No Favorites
function ResourcesView() {
  // ✅ PHASE 8C-3: Converted to use Context API
  // Get state from Context instead of props
  const {
    user,
    userData,
    setCurrentView // replaces onBack callback
  } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [notes, setNotes] = useState({});
  const [progress, setProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resourceCounts, setResourceCounts] = useState({});
  const [totalResourceCount, setTotalResourceCount] = useState(0);
  const [newResourceIds, setNewResourceIds] = useState([]);
  const [userNames, setUserNames] = useState({});
  const categories = [{
    id: 'coping',
    name: 'Coping Skills',
    icon: 'brain',
    color: 'var(--color-success)'
  }, {
    id: 'relapse',
    name: 'Relapse Prevention',
    icon: 'shield',
    color: 'var(--color-warning)'
  }, {
    id: 'daily',
    name: 'Daily Tools',
    icon: 'calendar-check',
    color: 'var(--color-info)'
  }, {
    id: 'education',
    name: 'Education',
    icon: 'book-open',
    color: 'var(--color-secondary)'
  }, {
    id: 'support',
    name: 'Support',
    icon: 'users',
    color: 'var(--color-primary)'
  }, {
    id: 'life',
    name: 'Life Skills',
    icon: 'sparkles',
    color: 'var(--color-accent)'
  }];
  useEffect(() => {
    loadAllResources();
    loadUserPreferences();
  }, [user?.uid]);
  useEffect(() => {
    if (allResources.length > 0) {
      checkNewResources();
      loadUserNames();
    }
  }, [allResources]);
  useEffect(() => {
    if (selectedCategory) {
      filterCategoryResources();
    }
  }, [selectedCategory, activeTab, allResources]);
  const loadUserNames = async () => {
    try {
      const uniqueUserIds = [...new Set(allResources.map(r => r.addedBy).filter(Boolean))];
      const names = {};
      for (const userId of uniqueUserIds) {
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            names[userId] = data.displayName || `${data.firstName} ${data.lastName}` || 'Unknown';
          }
        } catch (error) {
          names[userId] = 'Unknown';
        }
      }
      setUserNames(names);
    } catch (error) {}
  };
  const loadAllResources = async () => {
    try {
      const assignedQuery = await db.collection('resources').where('assignedTo', 'array-contains', user.uid).where('active', '==', true).get();
      const globalQuery = await db.collection('resources').where('isGlobal', '==', true).where('active', '==', true).get();
      const resourceMap = new Map();
      assignedQuery.forEach(doc => {
        resourceMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          isAssigned: true
        });
      });
      globalQuery.forEach(doc => {
        if (!resourceMap.has(doc.id)) {
          resourceMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            isAssigned: false
          });
        }
      });
      const allResourcesList = Array.from(resourceMap.values());
      setAllResources(allResourcesList);
      setTotalResourceCount(allResourcesList.length);
      const counts = {};
      categories.forEach(cat => {
        counts[cat.id] = allResourcesList.filter(r => r.category === cat.id).length;
      });
      setResourceCounts(counts);
    } catch (error) {}
  };
  const filterCategoryResources = () => {
    let filtered = allResources.filter(r => r.category === selectedCategory);
    if (activeTab === 'assigned') {
      filtered = filtered.filter(r => r.isAssigned);
    } else {
      filtered = filtered.filter(r => !r.isAssigned);
    }
    setResources(filtered);
  };
  const checkNewResources = async () => {
    try {
      const lastViewDoc = await db.collection('users').doc(user.uid).collection('preferences').doc('lastResourceView').get();
      const lastView = lastViewDoc.exists ? lastViewDoc.data().timestamp : null;
      if (lastView && lastView.toDate) {
        const newResources = allResources.filter(r => r.addedAt && r.addedAt.toDate && r.addedAt.toDate() > lastView.toDate());
        setNewResourceIds(newResources.map(r => r.id));
      }
      await db.collection('users').doc(user.uid).collection('preferences').doc('lastResourceView').set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {}
  };
  const loadUserPreferences = async () => {
    try {
      const prefDoc = await db.collection('users').doc(user.uid).collection('preferences').doc('resources').get();
      if (prefDoc.exists) {
        const data = prefDoc.data();
        setNotes(data.notes || {});
        setProgress(data.progress || {});
      }
    } catch (error) {
      setNotes({});
      setProgress({});
    }
  };
  const updateProgress = async (resourceId, status) => {
    const newProgress = {
      ...progress,
      [resourceId]: {
        status: status,
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : progress[resourceId]?.completedAt || null
      }
    };
    setProgress(newProgress);
    const saved = await savePreferences({
      progress: newProgress
    });
    if (saved) {
      try {
        await db.collection('activities').add({
          userId: user.uid,
          type: 'resource_progress',
          resourceId: resourceId,
          status: status,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {}
      showNotification(`Progress updated to ${status}`, 'success');
    }
  };
  const saveNote = async (resourceId, note) => {
    const newNotes = {
      ...notes,
      [resourceId]: note
    };
    setNotes(newNotes);
    const saved = await savePreferences({
      notes: newNotes
    });
    if (saved) {
      showNotification('Note saved', 'success');
    }
  };
  const savePreferences = async updates => {
    try {
      const currentPrefs = {
        notes: notes,
        progress: progress,
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(user.uid).collection('preferences').doc('resources').set(currentPrefs, {
        merge: true
      });
      return true;
    } catch (error) {
      showNotification('Failed to save - check permissions', 'error');
      return false;
    }
  };
  const recordView = async resourceId => {
    try {
      await db.collection('users').doc(user.uid).collection('resourceViews').doc(resourceId).set({
        viewedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {}
  };
  const showNotification = (message, type) => {
    const existingToast = document.querySelector('.resource-toast');
    if (existingToast) {
      existingToast.remove();
    }
    const toast = document.createElement('div');
    toast.className = 'resource-toast';
    toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };
  const getFilteredResources = () => {
    if (!searchQuery) return resources;
    return resources.filter(resource => resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) || resource.category.toLowerCase().includes(searchQuery.toLowerCase()));
  };
  const handleResourceClick = async resource => {
    if (!resource || !resource.id) {
      return;
    }
    let completeResource = resource;
    if (!resource.category || !resource.title) {
      completeResource = allResources.find(r => r.id === resource.id) || resource;
    }
    setSelectedResource(completeResource);
    try {
      await recordView(resource.id);
    } catch (error) {}
  };

  // Category Selection View
  if (!selectedCategory) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px'
      }
    }, /*#__PURE__*/React.createElement("style", null, `
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '30px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setCurrentView('home'),
      style: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '10px',
        transition: 'all 0.3s'
      }
    }, "\u2190"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        color: 'white'
      }
    }, "Recovery Resources"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '5px 0 0 0',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }
    }, totalResourceCount, " resources available"))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Search all resources...",
      value: searchQuery,
      onChange: e => setSearchQuery(e.target.value),
      style: {
        width: '100%',
        padding: '15px 20px 15px 50px',
        background: 'rgba(255,255,255,0.9)',
        border: 'none',
        borderRadius: '15px',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '20px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "search",
      style: {
        width: '18px',
        height: '18px'
      }
    })))), searchQuery && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 15px 0'
      }
    }, "Search Results (", allResources.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase())).length, ")"), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: '300px',
        overflowY: 'auto'
      }
    }, allResources.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase())).map(resource => /*#__PURE__*/React.createElement("div", {
      key: resource.id,
      onClick: () => handleResourceClick(resource),
      style: {
        padding: '10px',
        marginBottom: '10px',
        background: 'rgba(103,58,183,0.05)',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 'bold'
      }
    }, resource.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#666'
      }
    }, categories.find(c => c.id === resource.category)?.name))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }
    }, categories.map(category => /*#__PURE__*/React.createElement("button", {
      key: category.id,
      onClick: () => setSelectedCategory(category.id),
      style: {
        background: 'rgba(255,255,255,0.95)',
        border: 'none',
        borderRadius: '20px',
        padding: '25px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden'
      }
    }, newResourceIds.some(id => allResources.find(r => r.id === id && r.category === category.id)) && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#ff4444',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold'
      }
    }, "NEW"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '64px',
        height: '64px',
        background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto var(--space-3)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": category.icon,
      style: {
        width: '32px',
        height: '32px',
        color: '#fff'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '5px'
      }
    }, category.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: category.color,
        fontWeight: 'bold'
      }
    }, resourceCounts[category.id] || 0, " resources")))));
  }

  // Resource List View
  if (!selectedResource) {
    const category = categories.find(c => c.id === selectedCategory);
    const filteredResources = getFilteredResources();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSelectedCategory(null),
      style: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '10px'
      }
    }, "\u2190"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        color: 'white'
      }
    }, category?.icon, " ", category?.name), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '5px 0 0 0',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }
    }, filteredResources.length, " resources"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '15px',
        padding: '5px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setActiveTab('assigned'),
      style: {
        flex: 1,
        padding: '12px',
        background: activeTab === 'assigned' ? 'white' : 'transparent',
        color: activeTab === 'assigned' ? '#764ba2' : 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s'
      }
    }, "Assigned (", resources.filter(r => r.isAssigned).length, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setActiveTab('global'),
      style: {
        flex: 1,
        padding: '12px',
        background: activeTab === 'global' ? 'white' : 'transparent',
        color: activeTab === 'global' ? '#764ba2' : 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s'
      }
    }, "Global (", resources.filter(r => !r.isAssigned).length, ")"))), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'white',
        padding: '40px'
      }
    }, "Loading resources...") : filteredResources.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        padding: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px'
      }
    }, "No resources found.") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }
    }, filteredResources.map(resource => /*#__PURE__*/React.createElement("div", {
      key: resource.id,
      style: {
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '20px',
        position: 'relative',
        transition: 'all 0.3s',
        cursor: 'pointer'
      },
      onClick: () => handleResourceClick(resource)
    }, newResourceIds.includes(resource.id) && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#ff4444',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: 'bold'
      }
    }, "NEW"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        color: '#333',
        margin: '0 0 8px 0',
        fontSize: '18px'
      }
    }, resource.title), resource.description && /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#666',
        fontSize: '14px',
        margin: '0 0 15px 0',
        lineHeight: '1.5'
      }
    }, resource.description), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '15px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: progress[resource.id]?.status === 'completed' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : progress[resource.id]?.status === 'in-progress' ? 'linear-gradient(135deg, #ff9800, #f57c00)' : 'linear-gradient(135deg, #9e9e9e, #757575)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    }, progress[resource.id]?.status === 'completed' ? '✓ Completed' : progress[resource.id]?.status === 'in-progress' ? '⏳ In Progress' : '○ Not Started'), resource.addedAt && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'rgba(103,58,183,0.1)',
        color: '#673ab7',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '12px',
        height: '12px',
        marginRight: '4px'
      }
    }), "Added ", resource.addedAt.toDate ? new Date(resource.addedAt.toDate()).toLocaleDateString() : new Date(resource.addedAt).toLocaleDateString()), progress[resource.id]?.completedAt && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'rgba(76,175,80,0.1)',
        color: '#4CAF50',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px'
      }
    }, "\u2705 Completed ", new Date(progress[resource.id].completedAt).toLocaleDateString())), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: progress[resource.id]?.status || 'not-started',
      onChange: e => {
        e.stopPropagation();
        updateProgress(resource.id, e.target.value);
      },
      onClick: e => e.stopPropagation(),
      style: {
        padding: '8px 12px',
        background: 'white',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        color: '#333',
        cursor: 'pointer',
        fontWeight: '500'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "not-started"
    }, "Not Started"), /*#__PURE__*/React.createElement("option", {
      value: "in-progress"
    }, "In Progress"), /*#__PURE__*/React.createElement("option", {
      value: "completed"
    }, "Completed")), notes[resource.id] && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'rgba(33,150,243,0.1)',
        color: '#2196F3',
        padding: '8px 12px',
        borderRadius: '10px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "file-text",
      style: {
        width: '14px',
        height: '14px',
        marginRight: '4px'
      }
    }), "Has notes"))))))));
  }
  return /*#__PURE__*/React.createElement(ResourceViewer, {
    resource: selectedResource,
    onBack: () => setSelectedResource(null),
    onUpdateNote: note => saveNote(selectedResource.id, note),
    currentNote: notes[selectedResource.id],
    progress: progress[selectedResource.id],
    onUpdateProgress: status => updateProgress(selectedResource.id, status),
    userName: userNames[selectedResource.addedBy] || 'Unknown'
  });
}

// Resource Viewer Component
function ResourceViewer({
  resource,
  onBack,
  onUpdateNote,
  currentNote,
  progress,
  onUpdateProgress,
  userName
}) {
  const [note, setNote] = useState(currentNote || '');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const handlePrint = () => {
    window.print();
  };
  const handleDownload = async () => {
    if (resource.fileURL) {
      window.open(resource.fileURL, '_blank');
    } else if (resource.content) {
      const blob = new Blob([resource.content], {
        type: 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      zIndex: 9999,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
      padding: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '5px 10px',
      borderRadius: '8px'
    }
  }, "\u2190"), /*#__PURE__*/React.createElement("h2", {
    style: {
      flex: 1,
      textAlign: 'center',
      margin: 0,
      color: 'white',
      fontSize: '18px'
    }
  }, resource.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handlePrint,
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "printer",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleDownload,
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "download",
    style: {
      width: '18px',
      height: '18px'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '15px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'white',
      fontSize: '14px'
    }
  }, "Progress:"), /*#__PURE__*/React.createElement("select", {
    value: progress?.status || 'not-started',
    onChange: e => onUpdateProgress(e.target.value),
    style: {
      padding: '6px 12px',
      background: 'rgba(255,255,255,0.9)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "not-started"
  }, "Not Started"), /*#__PURE__*/React.createElement("option", {
    value: "in-progress"
  }, "In Progress"), /*#__PURE__*/React.createElement("option", {
    value: "completed"
  }, "Completed")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }
  }, resource.content ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      lineHeight: '1.8',
      color: '#333'
    }
  }, resource.content.split('\n').map((paragraph, index) => /*#__PURE__*/React.createElement("p", {
    key: index,
    style: {
      marginBottom: '15px'
    }
  }, paragraph))) : resource.embedUrl ? /*#__PURE__*/React.createElement("iframe", {
    src: resource.embedUrl,
    style: {
      width: '100%',
      height: '600px',
      border: 'none',
      borderRadius: '10px'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px',
      textAlign: 'center',
      color: '#999'
    }
  }, /*#__PURE__*/React.createElement("p", null, "This resource is available externally."), /*#__PURE__*/React.createElement("a", {
    href: resource.url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: 'inline-block',
      marginTop: '20px',
      padding: '12px 24px',
      background: '#9c27b0',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none'
    }
  }, "Open Resource")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '40px',
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '10px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 15px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "Personal Notes"), showNoteInput ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    placeholder: "Add your thoughts, reflections, or key takeaways...",
    style: {
      width: '100%',
      minHeight: '100px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'vertical'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '10px',
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onUpdateNote(note);
      setShowNoteInput(false);
    },
    style: {
      padding: '8px 16px',
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, "Save Note"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setNote(currentNote || '');
      setShowNoteInput(false);
    },
    style: {
      padding: '8px 16px',
      background: '#999',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, "Cancel"))) : /*#__PURE__*/React.createElement("div", null, currentNote ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 10px 0',
      whiteSpace: 'pre-wrap'
    }
  }, currentNote), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setNote(currentNote);
      setShowNoteInput(true);
    },
    style: {
      padding: '8px 16px',
      background: '#9c27b0',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, "Edit Note")) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowNoteInput(true),
    style: {
      padding: '8px 16px',
      background: '#9c27b0',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  }, "Add Note"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '20px',
      padding: '15px',
      background: '#f9f9f9',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#666'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Category:"), " ", resource.category), resource.addedAt && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Added:"), " ", resource.addedAt.toDate ? new Date(resource.addedAt.toDate()).toLocaleDateString() : new Date(resource.addedAt).toLocaleDateString()), progress?.completedAt && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Completed:"), " ", new Date(progress.completedAt).toLocaleDateString()), userName && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Added by:"), " ", userName))));
}

// Expose ResourcesView to global namespace
window.GLRSApp.components.ResourcesView = ResourcesView;
// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS TAB COMPONENT
// Display and manage user notifications
// ✅ PHASE 8C-4: Created with Context API
// ═══════════════════════════════════════════════════════════

function NotificationsTab() {
  // Get state from Context
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    user,
    triggerHaptic
  } = useAppContext();
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Filter notifications based on current filter
  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    } else if (filter === 'read') {
      return notifications.filter(n => n.read);
    }
    return notifications;
  }, [notifications, filter]);
  const unreadCount = React.useMemo(() => {
    return notifications?.filter(n => !n.read).length || 0;
  }, [notifications]);
  const handleNotificationClick = async notification => {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');

    // Mark as read if unread
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Handle notification action based on type
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };
  const handleMarkAllRead = async () => {
    if (typeof triggerHaptic === 'function') triggerHaptic('medium');
    await markAllNotificationsAsRead();
  };
  const getNotificationIcon = type => {
    switch (type) {
      case 'achievement':
        return 'trophy';
      case 'milestone':
        return 'star';
      case 'assignment':
        return 'clipboard';
      case 'message':
        return 'message-circle';
      case 'reminder':
        return 'clock';
      case 'alert':
        return 'alert-circle';
      case 'system':
        return 'info';
      default:
        return 'bell';
    }
  };
  const getNotificationColor = type => {
    switch (type) {
      case 'achievement':
        return '#FFD700';
      case 'milestone':
        return '#f4c430';
      case 'assignment':
        return '#0077CC';
      case 'message':
        return '#9c27b0';
      case 'reminder':
        return '#FF8C00';
      case 'alert':
        return '#DC143C';
      case 'system':
        return '#666';
      default:
        return '#0077CC';
    }
  };
  const formatTimeAgo = timestamp => {
    if (!timestamp?.toDate) return 'now';
    const date = timestamp.toDate();
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 15px 0',
      color: 'white'
    }
  }, "Notifications"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '15px',
      padding: '5px',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('all'),
    style: {
      flex: 1,
      padding: '10px',
      background: filter === 'all' ? 'white' : 'transparent',
      color: filter === 'all' ? '#764ba2' : 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s'
    }
  }, "All (", notifications?.length || 0, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('unread'),
    style: {
      flex: 1,
      padding: '10px',
      background: filter === 'unread' ? 'white' : 'transparent',
      color: filter === 'unread' ? '#764ba2' : 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s'
    }
  }, "Unread (", unreadCount, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('read'),
    style: {
      flex: 1,
      padding: '10px',
      background: filter === 'read' ? 'white' : 'transparent',
      color: filter === 'read' ? '#764ba2' : 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s'
    }
  }, "Read")), unreadCount > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: handleMarkAllRead,
    style: {
      width: '100%',
      padding: '12px',
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px',
      transition: 'all 0.3s'
    }
  }, "Mark All as Read")), filteredNotifications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.8)',
      padding: '40px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell-off",
    style: {
      width: '64px',
      height: '64px',
      marginBottom: '20px',
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px'
    }
  }, "No ", filter === 'all' ? '' : filter, " notifications"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.8
    }
  }, "You're all caught up!")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, filteredNotifications.map(notification => /*#__PURE__*/React.createElement("div", {
    key: notification.id,
    onClick: () => handleNotificationClick(notification),
    style: {
      background: notification.read ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
      borderRadius: '15px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: notification.read ? 'none' : '2px solid #f4c430',
      position: 'relative'
    }
  }, !notification.read && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#0077CC'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${getNotificationColor(notification.type)}, ${getNotificationColor(notification.type)}cc)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": getNotificationIcon(notification.type),
    style: {
      width: '20px',
      height: '20px',
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingRight: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: notification.read ? '500' : 'bold',
      color: '#333',
      marginBottom: '5px',
      fontSize: '15px'
    }
  }, notification.title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.4',
      marginBottom: '8px'
    }
  }, notification.message), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#999',
      fontSize: '12px'
    }
  }, formatTimeAgo(notification.createdAt))))))));
}

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.NotificationsTab = NotificationsTab;
console.log('✅ NotificationsTab component loaded');
// Enhanced ProfileView Component with all missing features
function ProfileView() {
  // ✅ PHASE 8C-4: Converted to use Context API
  // Get state from Context instead of props
  const {
    user,
    userData,
    profileImage,
    resources,
    setShowModal,
    // was setShowModal
    // handleLogout - REMOVED, now use window.GLRSApp.authUtils.handleLogout
    handleImageSelect,
    // was onImageUpload
    fileInputRef,
    coachInfo,
    googleConnected
  } = useAppContext();
  const [profileStats, setProfileStats] = useState({
    checkInRate: 0,
    assignmentRate: 0,
    currentStreak: 0,
    avgMood: 0,
    avgCraving: 0
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 10;
    if (userData?.firstName) completed++;
    if (userData?.lastName) completed++;
    if (userData?.phone) completed++;
    if (userData?.sobrietyDate) completed++;
    if (userData?.substance) completed++;
    if (userData?.dailyCost) completed++;
    if (userData?.emergencyContacts?.length > 0) completed++;
    if (userData?.address?.city) completed++;
    if (userData?.profileImageUrl) completed++;
    if (userData?.dateOfBirth) completed++;
    return Math.round(completed / total * 100);
  };

  // Load profile stats
  useEffect(() => {
    loadProfileStats();
  }, [user]);
  const loadProfileStats = async () => {
    try {
      // Get user's account creation date
      const userDoc = await db.collection('users').doc(user.uid).get();
      const accountCreatedDate = userDoc.data()?.createdAt?.toDate() || new Date();

      // Calculate days since account creation (max 30 days for recent performance)
      const today = new Date();
      const daysSinceCreation = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24));
      const daysToCheck = Math.min(daysSinceCreation, 30); // Cap at 30 days

      // Skip calculation if account is less than 1 day old
      if (daysToCheck < 1) {
        setProfileStats({
          checkInRate: 0,
          assignmentRate: 0,
          currentStreak: 0,
          avgMood: 0,
          avgCraving: 0
        });
        return;
      }

      // Calculate check-in rate based on days since joining
      const dateToCheckFrom = new Date();
      dateToCheckFrom.setDate(dateToCheckFrom.getDate() - daysToCheck);
      const checkInsSnap = await db.collection('checkIns').where('userId', '==', user.uid).where('createdAt', '>=', dateToCheckFrom).get();

      // COUNT ONLY MORNING CHECK-INS
      let morningCheckInCount = 0;
      let totalMood = 0;
      let totalCraving = 0;
      let moodCount = 0;
      checkInsSnap.forEach(doc => {
        const data = doc.data();
        if (data.morningData) {
          morningCheckInCount++;

          // Calculate average mood (and craving for potential future use)
          if (data.morningData.mood) {
            totalMood += data.morningData.mood;
            moodCount++;
          }
          if (data.morningData.craving) {
            totalCraving += data.morningData.craving;
          }
        }
      });

      // Calculate check-in rate - CAPPED AT 100%
      const checkInRate = Math.min(100, Math.round(morningCheckInCount / daysToCheck * 100));

      // Calculate LIFETIME task completion (all check-ins + reflections + assignments)
      const taskCompletion = await calculateLifetimeTaskCompletion(user.uid);

      // Get current streak
      const streakDoc = await db.collection('streaks').doc(user.uid).get();
      const currentStreak = streakDoc.exists ? streakDoc.data().currentStreak || 0 : 0;

      // Use the lifetime task completion rate instead of just assignment rate
      const assignmentRate = taskCompletion.completionRate; // This is now ALL tasks, not just assignments

      setProfileStats({
        checkInRate,
        assignmentRate,
        // This now represents total task completion, not just assignments
        currentStreak,
        avgMood: moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 0,
        avgCraving: moodCount > 0 ? (totalCraving / moodCount).toFixed(1) : 0
      });
    } catch (error) {}
  };
  // Helper functions for task calculations - can be called by admin.html
  const calculateLifetimeTaskCompletion = async userId => {
    try {
      // Get user's account creation date
      const userDoc = await db.collection('users').doc(userId).get();
      const accountCreatedDate = userDoc.data()?.createdAt?.toDate() || new Date();

      // Calculate total days since joining
      const today = new Date();
      const daysSinceJoining = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include today

      // Get ALL check-ins (no date filter for lifetime)
      const checkInsSnap = await db.collection('checkIns').where('userId', '==', userId).get();

      // Count morning check-ins and evening reflections separately
      let morningCheckInsCompleted = 0;
      let eveningReflectionsCompleted = 0;
      checkInsSnap.forEach(doc => {
        const data = doc.data();
        if (data.morningData) {
          morningCheckInsCompleted++;
        }
        if (data.eveningData) {
          eveningReflectionsCompleted++;
        }
      });

      // Get ALL assignments (lifetime)
      const assignmentsSnap = await db.collection('assignments').where('userId', '==', userId).get();
      let totalAssignments = 0;
      let completedAssignments = 0;
      assignmentsSnap.forEach(doc => {
        totalAssignments++;
        if (doc.data().status === 'completed') {
          completedAssignments++;
        }
      });

      // Calculate totals
      const expectedDailyTasks = daysSinceJoining * 2; // Morning + Evening each day
      const totalExpectedTasks = expectedDailyTasks + totalAssignments;
      const totalCompletedTasks = morningCheckInsCompleted + eveningReflectionsCompleted + completedAssignments;

      // Calculate percentage
      const completionRate = totalExpectedTasks > 0 ? Math.round(totalCompletedTasks / totalExpectedTasks * 100) : 0;
      return {
        completionRate,
        totalCompleted: totalCompletedTasks,
        totalExpected: totalExpectedTasks,
        breakdown: {
          morningCheckIns: morningCheckInsCompleted,
          eveningReflections: eveningReflectionsCompleted,
          assignments: completedAssignments,
          expectedDailyTasks: expectedDailyTasks,
          totalAssignments: totalAssignments
        }
      };
    } catch (error) {
      return {
        completionRate: 0,
        totalCompleted: 0,
        totalExpected: 0
      };
    }
  };
  const handleFileInputChange = e => {
    const file = e.target.files[0];
    if (file) {
      handleImageSelect(file); // Call app object function
    }
  };
  const profileCompletion = calculateProfileCompletion();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "profile-menu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-avatar",
    onClick: () => fileInputRef.current?.click()
  }, profileImage ? /*#__PURE__*/React.createElement("img", {
    src: profileImage,
    alt: "Profile"
  }) : (userData?.displayName || userData?.firstName || user.email || 'U').charAt(0).toUpperCase(), /*#__PURE__*/React.createElement("div", {
    className: "profile-avatar-upload"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "camera",
    style: {
      width: '16px',
      height: '16px'
    }
  }))), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "image/*",
    className: "upload-input",
    onChange: handleFileInputChange
  }), /*#__PURE__*/React.createElement("div", {
    className: "profile-name"
  }, userData?.displayName || userData?.firstName || 'User'), /*#__PURE__*/React.createElement("div", {
    className: "profile-email"
  }, user.email), profileCompletion < 100 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      opacity: 0.8,
      marginBottom: '5px'
    }
  }, "Profile ", profileCompletion, "% Complete"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '10px',
      height: '8px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #f4c430 0%, #ff9500 100%)',
      width: `${profileCompletion}%`,
      height: '100%',
      transition: 'width 0.3s ease'
    }
  }))), userData?.sobrietyDate && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '15px',
      padding: '10px',
      background: 'rgba(76, 175, 80, 0.1)',
      borderRadius: '10px',
      border: '1px solid rgba(76, 175, 80, 0.3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4CAF50'
    }
  }, window.getSobrietyDays(userData.sobrietyDate), " Days Clean"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      opacity: 0.8,
      marginTop: '5px'
    }
  }, "Since ", new Date(userData.sobrietyDate).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })))), "  ", /*#__PURE__*/React.createElement("div", {
    className: "menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-title"
  }, "My Stats"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      padding: '0 15px',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '10px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#f4c430'
    }
  }, profileStats.checkInRate, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.7
    }
  }, "Check-in Rate")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '10px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#4CAF50'
    }
  }, profileStats.assignmentRate, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.7
    }
  }, "Lifetime Task")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '10px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#ff9500'
    }
  }, profileStats.currentStreak), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.7
    }
  }, "Day Streak")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '10px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#9c27b0'
    }
  }, profileStats.avgMood, "/10"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      opacity: 0.7
    }
  }, "Avg Mood")))), coachInfo && /*#__PURE__*/React.createElement("div", {
    className: "menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-title"
  }, "My Coach"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '15px',
      margin: '0 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'bold',
      marginBottom: '5px'
    }
  }, coachInfo.displayName || coachInfo.firstName + ' ' + coachInfo.lastName), coachInfo.credentials && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.8,
      marginBottom: '5px'
    }
  }, coachInfo.credentials), coachInfo.phone && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px'
    }
  }, "\uD83D\uDCDE ", /*#__PURE__*/React.createElement("a", {
    href: `tel:${coachInfo.phone}`,
    style: {
      color: '#f4c430',
      textDecoration: 'none'
    }
  }, coachInfo.phone)))), /*#__PURE__*/React.createElement("div", {
    className: "menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-title"
  }, "Account"), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('personalInfo')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "user",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Personal Information")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('recoveryInfo')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Recovery Settings")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('password')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "lock",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Password & Security")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('notifications')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Notification Settings")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('googleCalendar')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Google Calendar")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow",
    style: {
      color: googleConnected ? '#4CAF50' : 'rgba(255,255,255,0.5)',
      fontWeight: googleConnected ? 'bold' : 'normal'
    }
  }, googleConnected ? '✓ Connected' : 'Not Connected')), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('emergency')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-circle",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Emergency Contacts")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A"))), /*#__PURE__*/React.createElement("div", {
    className: "menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-title"
  }, "Support"), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('help')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "help-circle",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Help & Support")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('feedback')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-square",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Send Feedback")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('export')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "download",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Export My Data")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A"))), /*#__PURE__*/React.createElement("div", {
    className: "menu-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-title"
  }, "About"), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('terms')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "file-text",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Terms of Service")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('privacy_policy')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "shield",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "Privacy Policy")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "menu-item",
    onClick: () => setShowModal('about')
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-item-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info",
    style: {
      width: '18px',
      height: '18px'
    }
  })), /*#__PURE__*/React.createElement("span", null, "About GLRS")), /*#__PURE__*/React.createElement("span", {
    className: "menu-arrow"
  }, "\u203A"))), /*#__PURE__*/React.createElement("div", {
    className: "menu-section"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-danger",
    onClick: window.GLRSApp.authUtils.handleLogout
  }, "Sign Out"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      padding: '14px',
      background: 'transparent',
      border: '1px solid rgba(255, 71, 87, 0.5)',
      borderRadius: '10px',
      color: '#ff4757',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px'
    },
    onClick: () => setShowModal('deleteAccount')
  }, "Delete Account"))));
}

// Expose ProfileView to global namespace
window.GLRSApp.components.ProfileView = ProfileView;
