// ═══════════════════════════════════════════════════════════
// APP INITIALIZATION HOOKS
// Custom hooks for PIRapp lifecycle management
// ═══════════════════════════════════════════════════════════

// ==========================================
// PULL-TO-REFRESH HOOK
// ==========================================

const usePullToRefresh = ({
  contentRef,
  pullStartY,
  currentView,
  setPulling,
  setPullDistance,
  setRefreshing,
  loadAllData,
  loadCheckIns,
  loadGoals,
  loadAssignments,
  loadCommunityMessages,
  loadTopicRooms,
  loadResources
}) => {
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger haptic feedback (if available)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Reload data based on current view
      if (currentView === 'home') {
        await loadAllData();
      } else if (currentView === 'progress') {
        await loadCheckIns();
      } else if (currentView === 'tasks') {
        await loadGoals();
        await loadAssignments();
      } else if (currentView === 'connect') {
        await loadCommunityMessages();
        await loadTopicRooms();
      } else if (currentView === 'profile') {
        await loadResources();
      }

      // Show success notification
      window.GLRSApp.utils.showNotification('Refreshed', 'success');
    } catch (error) {
      window.GLRSApp.utils.showNotification('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
      setPullDistance(0);
      setPulling(false);
    }
  };
  const handleTouchStart = e => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop;

    // Only allow pull-to-refresh when at the top
    if (scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };
  const handleTouchMove = e => {
    if (!contentRef.current || pullStartY.current === 0) return;
    const scrollTop = contentRef.current.scrollTop;
    if (scrollTop > 0) {
      setPulling(false);
      setPullDistance(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStartY.current;
    if (distance > 0 && distance <= 120) {
      setPulling(true);
      setPullDistance(distance);
      e.preventDefault(); // Prevent scroll
    }
  };
  const handleTouchEnd = () => {
    if (pulling && pullDistance > 80) {
      handleRefresh();
    } else {
      setPulling(false);
      setPullDistance(0);
    }
    pullStartY.current = 0;
  };
  return {
    handleRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

// ==========================================
// DATA LOADING & LISTENERS HOOK
// ==========================================

const useDataLoading = (user, db, listenersRef, broadcastDismissed, setters, loaders) => {
  React.useEffect(() => {
    if (user) {
      window.GLRSApp.loaders.loadAllData();
      window.GLRSApp.listeners.setupRealtimeListeners(db, user, listenersRef, broadcastDismissed, {
        setNotifications: setters.setNotifications,
        setUnreadCount: setters.setUnreadCount,
        setCommunityMessages: setters.setCommunityMessages,
        setActiveBroadcast: setters.setActiveBroadcast
      }, {
        loadGoals: loaders.loadGoals,
        loadAssignments: loaders.loadAssignments,
        loadHabits: loaders.loadHabits,
        loadTodayHabits: loaders.loadTodayHabits,
        loadQuickReflections: loaders.loadQuickReflections,
        loadTodayWins: loaders.loadTodayWins
      });
      loaders.loadGoogleConnection();
    }
    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);
};

// ==========================================
// LUCIDE ICONS INITIALIZATION HOOK
// ==========================================

const useLucideIcons = dependencies => {
  React.useEffect(() => {
    if (typeof lucide !== 'undefined') {
      // Use setTimeout to ensure React finishes rendering before creating icons
      // Increased delay to 100ms to ensure all DOM updates complete
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }, dependencies);
};

// ==========================================
// SOBRIETY CALCULATION HOOK
// ==========================================

const useSobrietyCalculation = (userData, setSobrietyDays, setMoneySaved) => {
  React.useEffect(() => {
    if (userData?.sobrietyDate) {
      const calculateStats = () => {
        const days = window.GLRSApp.utils.calculateSobrietyDays(userData.sobrietyDate);
        setSobrietyDays(days);

        // Use the user's custom daily cost, default to 20 if not set
        const dailyCost = userData.dailyCost || 20;
        setMoneySaved(days * dailyCost);
      };
      calculateStats();
      const interval = setInterval(calculateStats, 60000);
      return () => clearInterval(interval);
    }
  }, [userData]);
};

// ==========================================
// MODAL ICONS HOOK
// ==========================================

const useModalIcons = showModal => {
  React.useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [showModal]);
};

// ==========================================
// JOURNEY TAB ICONS HOOK
// ==========================================

const useJourneyTabIcons = (currentView, journeyTab) => {
  React.useEffect(() => {
    if (currentView === 'journey') {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentView, journeyTab]);
};

// ==========================================
// SAVINGS DATA LOADER HOOK
// ==========================================

const useSavingsData = (user, db, setSavingsItems, setSavingsGoals, setMoneyMapStops, setActiveSavingsGoal, setActualMoneySaved, setCustomGoalItems) => {
  React.useEffect(() => {
    if (!user) return;
    const loadSavingsData = async () => {
      try {
        // Load savings items
        const itemsSnapshot = await db.collection('savingsItems').orderBy('minCost', 'asc').get();
        if (!itemsSnapshot.empty) {
          const items = itemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSavingsItems(items);
        }

        // Load savings goals
        const goalsSnapshot = await db.collection('savingsGoals').orderBy('amount', 'asc').get();
        if (!goalsSnapshot.empty) {
          const goals = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSavingsGoals(goals);
        }

        // Load money map stops
        const stopsSnapshot = await db.collection('moneyMapStops').orderBy('amount', 'asc').get();
        if (!stopsSnapshot.empty) {
          const stops = stopsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMoneyMapStops(stops);
        }

        // Load user's savings preferences
        const prefsDoc = await db.collection('users').doc(user.uid).collection('savingsPreferences').doc('current').get();
        if (prefsDoc.exists) {
          const prefs = prefsDoc.data();
          if (prefs.activeSavingsGoal) setActiveSavingsGoal(prefs.activeSavingsGoal);
          if (prefs.actualMoneySaved) setActualMoneySaved(prefs.actualMoneySaved);
          if (prefs.customGoalItems) setCustomGoalItems(prefs.customGoalItems);
        }
      } catch (error) {
        console.error('Error loading savings data:', error);
      }
    };
    loadSavingsData();
  }, [user]);
};

// ==========================================
// SAVINGS PREFERENCES SAVER HOOK
// ==========================================

const useSavingsPreferences = (user, db, activeSavingsGoal, actualMoneySaved, customGoalItems) => {
  React.useEffect(() => {
    if (!user) return;
    const savePreferences = async () => {
      try {
        await db.collection('users').doc(user.uid).collection('savingsPreferences').doc('current').set({
          activeSavingsGoal,
          actualMoneySaved,
          customGoalItems,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, {
          merge: true
        });
      } catch (error) {
        console.error('Error saving savings preferences:', error);
      }
    };

    // Debounce saves
    const timeoutId = setTimeout(savePreferences, 1000);
    return () => clearTimeout(timeoutId);
  }, [activeSavingsGoal, actualMoneySaved, customGoalItems, user]);
};

// ==========================================
// PROGRESS CHARTS INITIALIZATION HOOK
// ==========================================

const useProgressCharts = (currentView, moodChartData, cravingChartData, chartRef, cravingChartRef) => {
  React.useEffect(() => {
    if (currentView === 'progress' && moodChartData && cravingChartData) {
      setTimeout(() => {
        const moodCanvas = document.getElementById('moodChart');
        const cravingCanvas = document.getElementById('cravingCanvas');

        // Destroy existing charts
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        if (cravingChartRef.current) {
          cravingChartRef.current.destroy();
        }
        if (moodCanvas) {
          const ctx = moodCanvas.getContext('2d');
          chartRef.current = new Chart(ctx, {
            type: 'line',
            data: moodChartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10
                }
              }
            }
          });
        }
        if (cravingCanvas) {
          const ctx = cravingCanvas.getContext('2d');
          cravingChartRef.current = new Chart(ctx, {
            type: 'line',
            data: cravingChartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10
                }
              }
            }
          });
        }
      }, 100);
    }
  }, [currentView, moodChartData, cravingChartData]);
};

// ==========================================
// JOURNEY WELLNESS GRAPHS HOOK
// ==========================================

const useJourneyWellnessGraphs = (currentView, journeyTab, expandedGraph, checkIns) => {
  React.useEffect(() => {
    if (currentView === 'progress' && journeyTab === 'wellness' && expandedGraph && checkIns.length > 0) {
      setTimeout(() => {
        // Generate full 31-day date range
        const today = new Date();
        const last31Days = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          last31Days.push(date);
        }

        // Create labels from full 31-day range
        const labels = last31Days.map(date => date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }));

        // Helper function to find check-in for a specific date
        const findCheckInForDate = date => {
          return checkIns.find(c => {
            const checkInDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            return checkInDate.toDateString() === date.toDateString();
          });
        };

        // Map check-ins to full 31-day range
        const moodData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.morningData?.mood ?? null;
        });
        const cravingData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.morningData?.craving ?? null;
        });
        const anxietyData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.morningData?.anxiety ?? null;
        });
        const sleepData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.eveningData?.sleepQuality ?? null;
        });
        const overallData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.eveningData?.overallDay ?? null;
        });

        // Render expanded graph
        if (expandedGraph === 'mood') {
          const canvas = document.getElementById('journeyMoodChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyMoodChart && typeof window.journeyMoodChart.destroy === 'function') {
              window.journeyMoodChart.destroy();
            }
            window.journeyMoodChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Mood',
                  data: moodData,
                  borderColor: '#058585',
                  backgroundColor: 'rgba(5, 133, 133, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#058585',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#058585',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#058585',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Mood: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'cravings') {
          const canvas = document.getElementById('journeyCravingsChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyCravingsChart && typeof window.journeyCravingsChart.destroy === 'function') {
              window.journeyCravingsChart.destroy();
            }
            window.journeyCravingsChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Cravings Intensity',
                  data: cravingData,
                  borderColor: '#DC143C',
                  backgroundColor: 'rgba(220, 20, 60, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#DC143C',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#DC143C',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#DC143C',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Cravings: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'anxiety') {
          const canvas = document.getElementById('journeyAnxietyChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyAnxietyChart && typeof window.journeyAnxietyChart.destroy === 'function') {
              window.journeyAnxietyChart.destroy();
            }
            window.journeyAnxietyChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Anxiety Level',
                  data: anxietyData,
                  borderColor: '#FFA500',
                  backgroundColor: 'rgba(255, 165, 0, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#FFA500',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#FFA500',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#FFA500',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Anxiety: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'sleep') {
          const canvas = document.getElementById('journeySleepChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeySleepChart && typeof window.journeySleepChart.destroy === 'function') {
              window.journeySleepChart.destroy();
            }
            window.journeySleepChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Sleep Quality',
                  data: sleepData,
                  borderColor: '#9c27b0',
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#9c27b0',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#9c27b0',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#9c27b0',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Sleep Quality: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'overall') {
          const canvas = document.getElementById('journeyOverallChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyOverallChart && typeof window.journeyOverallChart.destroy === 'function') {
              window.journeyOverallChart.destroy();
            }
            window.journeyOverallChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Overall Day Rating',
                  data: overallData,
                  borderColor: '#4A90E2',
                  backgroundColor: 'rgba(74, 144, 226, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#4A90E2',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#4A90E2',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#4A90E2',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Overall Day Rating: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        }

        // Render sparklines for collapsed graphs
        const renderSparkline = (canvasId, data, color) => {
          const canvas = document.getElementById(canvasId);
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const chartKey = canvasId.replace('journey', '').replace('Sparkline', '');
            if (window[`journey${chartKey}SparklineChart`]) {
              window[`journey${chartKey}SparklineChart`].destroy();
            }
            window[`journey${chartKey}SparklineChart`] = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  data: data,
                  borderColor: color,
                  borderWidth: 2,
                  backgroundColor: `${color}1a`,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: color,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: color,
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: color,
                    borderWidth: 1
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        };
        if (expandedGraph !== 'mood') renderSparkline('journeyMoodSparkline', moodData, '#058585');
        if (expandedGraph !== 'cravings') renderSparkline('journeyCravingsSparkline', cravingData, '#DC143C');
        if (expandedGraph !== 'anxiety') renderSparkline('journeyAnxietySparkline', anxietyData, '#FFA500');
        if (expandedGraph !== 'sleep') renderSparkline('journeySleepSparkline', sleepData, '#9c27b0');
        if (expandedGraph !== 'overall') renderSparkline('journeyOverallSparkline', overallData, '#4A90E2');

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      }, 100);
    }
  }, [currentView, journeyTab, expandedGraph, checkIns]);
};

// ==========================================
// PROFILE COMPLETION CHECK HOOK
// ==========================================

const useProfileCompletion = (userData, showModal, setShowModal, db, user) => {
  React.useEffect(() => {
    if (userData && !userData.profileComplete) {
      const checkProfileCompletion = () => {
        if (userData.firstName && userData.lastName && userData.phone) {
          db.collection('users').doc(user.uid).update({
            profileComplete: true
          });
        } else if (!showModal) {
          setTimeout(() => {
            if (!localStorage.getItem('profilePromptShown')) {
              setShowModal('profilePrompt');
              localStorage.setItem('profilePromptShown', 'true');
            }
          }, 5000);
        }
      };
      checkProfileCompletion();
    }
  }, [userData, showModal]);
};

// ==========================================
// MIDNIGHT RESET HOOK
// ==========================================

const useMidnightReset = (user, setCheckInStatus) => {
  React.useEffect(() => {
    const checkMidnightReset = () => {
      const now = new Date();
      const userTimezone = user.timezone || "America/Los_Angeles";
      const userNow = new Date(now.toLocaleString("en-US", {
        timeZone: userTimezone
      }));
      const hours = userNow.getHours();
      const minutes = userNow.getMinutes();
      const seconds = userNow.getSeconds();

      // Calculate milliseconds until midnight (user's timezone)
      const msUntilMidnight = ((23 - hours) * 60 * 60 + (59 - minutes) * 60 + (60 - seconds)) * 1000;

      // Set timeout for midnight reset
      const midnightTimer = setTimeout(() => {
        // Reset daily tasks
        window.GLRSApp.loaders.loadDailyTasksStatus();
        window.GLRSApp.loaders.loadCheckIns();
        setCheckInStatus({
          morning: false,
          evening: false
        });

        // Set up daily interval
        const dailyInterval = setInterval(() => {
          window.GLRSApp.loaders.loadDailyTasksStatus();
          window.GLRSApp.loaders.loadCheckIns();
          setCheckInStatus({
            morning: false,
            evening: false
          });
        }, 24 * 60 * 60 * 1000); // Every 24 hours

        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);
      return () => clearTimeout(midnightTimer);
    };
    checkMidnightReset();
  }, []);
};

// ==========================================
// PATTERN DETECTION HOOK
// ==========================================

const usePatternDetection = (checkIns, setPatternDetection) => {
  React.useEffect(() => {
    if (checkIns.length > 0) {
      const pattern = window.GLRSApp.shared.patternDetection.detectPatterns(checkIns);
      setPatternDetection(pattern);
    }
  }, [checkIns]);
};

// Register hooks globally
window.GLRSApp = window.GLRSApp || {
  hooks: {}
};
window.GLRSApp.hooks = {
  usePullToRefresh,
  useDataLoading,
  useLucideIcons,
  useSobrietyCalculation,
  useModalIcons,
  useJourneyTabIcons,
  useSavingsData,
  useSavingsPreferences,
  useProgressCharts,
  useJourneyWellnessGraphs,
  useProfileCompletion,
  useMidnightReset,
  usePatternDetection
};
console.log('✅ App initialization hooks loaded');