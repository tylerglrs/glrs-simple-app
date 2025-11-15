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
