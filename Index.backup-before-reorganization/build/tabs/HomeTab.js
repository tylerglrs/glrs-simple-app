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
