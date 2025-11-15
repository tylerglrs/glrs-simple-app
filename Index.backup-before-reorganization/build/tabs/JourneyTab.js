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
