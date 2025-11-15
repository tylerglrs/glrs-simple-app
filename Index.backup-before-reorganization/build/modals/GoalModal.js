// Goals and Tasks View Component with Popup Details and Reflections - UPDATED
function GoalsTasksView({
  user,
  goals,
  assignments,
  onAssignmentComplete,
  onReflectionSave,
  onShowGratitudeModal,
  onDueTodayChange
}) {
  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedObjectives, setExpandedObjectives] = useState({});
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [reflections, setReflections] = useState({});
  const [objectives, setObjectives] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [currentReflection, setCurrentReflection] = useState('');
  const [showIntentionsModal, setShowIntentionsModal] = useState(false);
  const [showProgressSnapshotModal, setShowProgressSnapshotModal] = useState(false);
  const [showPastIntentionsModal, setShowPastIntentionsModal] = useState(false);
  const [pastIntentions, setPastIntentions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load objectives when component mounts or goals change
  useEffect(() => {
    loadObjectives();
  }, [goals]);

  // Reinitialize Lucide icons when modals or sidebar open
  useEffect(() => {
    if (showIntentionsModal || showProgressSnapshotModal || showPastIntentionsModal || showSidebar) {
      setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      }, 100);
    }
  }, [showIntentionsModal, showProgressSnapshotModal, showPastIntentionsModal, showSidebar]);

  // Reinitialize icons when goals or objectives change
  useEffect(() => {
    setTimeout(() => {
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    }, 100);
  }, [goals, objectives, expandedGoals, expandedObjectives, pastIntentions]);
  const loadObjectives = async () => {
    try {
      const objectivesSnap = await db.collection('objectives').where('userId', '==', user.uid).orderBy('order', 'asc').get();
      const objectivesList = [];
      objectivesSnap.forEach(doc => {
        objectivesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setObjectives(objectivesList);
    } catch (error) {}
  };
  const toggleGoal = goalId => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };
  const toggleObjective = objectiveId => {
    setExpandedObjectives(prev => ({
      ...prev,
      [objectiveId]: !prev[objectiveId]
    }));
  };
  const openItemModal = (item, type) => {
    setSelectedItem({
      ...item,
      type
    });
    setShowModal(true);
    setShowReflectionForm(false);
    setCurrentReflection('');
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setShowReflectionForm(false);
    setCurrentReflection('');
  };
  const calculateGoalProgress = goalId => {
    const goalAssignments = assignments.filter(a => a.goalId === goalId);
    if (goalAssignments.length === 0) return 0;
    const completed = goalAssignments.filter(a => a.status === 'completed').length;
    return Math.round(completed / goalAssignments.length * 100);
  };
  const formatDate = date => {
    if (!date) return 'Not set';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const getDueDateStatus = (date, isCompleted) => {
    if (isCompleted) return {
      text: 'Completed',
      color: '#4CAF50'
    };
    if (!date) return {
      text: 'No due date',
      color: 'rgba(255,255,255,0.5)'
    };
    const dueDate = date.toDate ? date.toDate() : new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return {
      text: 'Overdue',
      color: '#ff453a'
    };
    if (diffDays === 0) return {
      text: 'Due Today',
      color: '#ff9500'
    };
    if (diffDays === 1) return {
      text: 'Due Tomorrow',
      color: '#ff9500'
    };
    if (diffDays <= 7) return {
      text: `Due in ${diffDays} days`,
      color: '#ffd60a'
    };
    return {
      text: formatDate(date),
      color: 'rgba(255,255,255,0.7)'
    };
  };
  const makeLinksClickable = text => {
    if (!text) return null;

    // Regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return /*#__PURE__*/React.createElement("a", {
          key: index,
          href: part,
          target: "_blank",
          rel: "noopener noreferrer",
          style: {
            color: '#4fc3f7',
            textDecoration: 'underline'
          }
        }, part);
      }
      return /*#__PURE__*/React.createElement("span", {
        key: index
      }, part);
    });
  };

  // Modal Component with Reflection Support
  const ItemModal = () => {
    if (!selectedItem || !showModal) return null;
    const isCompleted = selectedItem.status === 'completed';
    const typeColors = {
      objective: 'linear-gradient(135deg, #058585 0%, #046B6B 100%)',
      assignment: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#1a1a1a',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: typeColors[selectedItem.type]
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
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
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'rgba(0,0,0,0.3)',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        color: 'white'
      }
    }, selectedItem.type.toUpperCase()), isCompleted && /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '18px',
        height: '18px',
        color: 'white'
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: closeModal,
      style: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        cursor: 'pointer',
        color: 'white',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "\xD7")), /*#__PURE__*/React.createElement("h3", {
      style: {
        color: 'white',
        margin: '10px 0 0 0',
        fontSize: '20px',
        textDecoration: isCompleted ? 'line-through' : 'none'
      }
    }, selectedItem.title)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px'
      }
    }, selectedItem.description && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '12px',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }
    }, "Description"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'white',
        fontSize: '14px',
        lineHeight: '1.6',
        background: 'rgba(255,255,255,0.05)',
        padding: '12px',
        borderRadius: '8px'
      }
    }, makeLinksClickable(selectedItem.description))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '13px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '14px',
        height: '14px'
      }
    }), /*#__PURE__*/React.createElement("span", null, "Created:"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'white'
      }
    }, formatDate(selectedItem.createdAt))), selectedItem.dueDate && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '13px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clock",
      style: {
        width: '14px',
        height: '14px'
      }
    }), /*#__PURE__*/React.createElement("span", null, "Due:"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: getDueDateStatus(selectedItem.dueDate, isCompleted).color === '#4CAF50' ? '#0077CC' : getDueDateStatus(selectedItem.dueDate, isCompleted).color
      }
    }, formatDate(selectedItem.dueDate))), selectedItem.completedAt && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#0077CC',
        fontSize: '13px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '14px',
        height: '14px'
      }
    }), /*#__PURE__*/React.createElement("span", null, "Completed:"), /*#__PURE__*/React.createElement("span", null, formatDate(selectedItem.completedAt)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px',
        background: isCompleted ? 'rgba(0,119,204,0.1)' : 'rgba(255,152,0,0.1)',
        borderRadius: '8px',
        border: `1px solid ${isCompleted ? 'rgba(0,119,204,0.3)' : 'rgba(255,152,0,0.3)'}`,
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: isCompleted ? '#0077CC' : '#ff9800',
        fontSize: '13px',
        fontWeight: '500'
      }
    }, "Status: ", isCompleted ? 'Completed' : 'Active')), selectedItem.reflection && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '15px',
        padding: '12px',
        background: 'rgba(0,119,204,0.1)',
        borderRadius: '8px',
        borderLeft: '3px solid #0077CC'
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        color: '#0077CC',
        fontSize: '12px',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }
    }, "Your Reflection"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: '13px',
        margin: 0,
        lineHeight: '1.6'
      }
    }, selectedItem.reflection)), selectedItem.type === 'assignment' && !isCompleted && showReflectionForm && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        color: 'white',
        fontSize: '14px',
        display: 'block',
        marginBottom: '10px',
        fontWeight: '500'
      }
    }, "Add your reflection:"), /*#__PURE__*/React.createElement("textarea", {
      value: currentReflection,
      onChange: e => setCurrentReflection(e.target.value),
      placeholder: "What did you learn? How did this help your recovery?",
      style: {
        width: '100%',
        minHeight: '100px',
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        color: 'white',
        fontSize: '14px',
        resize: 'vertical'
      },
      autoFocus: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '12px',
        display: 'flex',
        gap: '10px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        onReflectionSave(selectedItem.id, currentReflection);
        closeModal();
      },
      style: {
        flex: 1,
        padding: '10px',
        background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px'
      }
    }, "Submit Reflection & Complete"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setShowReflectionForm(false);
        setCurrentReflection('');
      },
      style: {
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px'
      }
    }, "Cancel"))), selectedItem.type === 'assignment' && !isCompleted && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
      }
    }, !showReflectionForm && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowReflectionForm(true),
      style: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px'
      }
    }, "Complete with Reflection"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        onAssignmentComplete(selectedItem.id, true);
        closeModal();
      },
      style: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px'
      }
    }, "Mark Complete Only"))))));
  };
  if (goals.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        padding: '40px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 'var(--space-4)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "target",
      style: {
        width: '48px',
        height: '48px',
        color: 'var(--color-primary)'
      }
    })), /*#__PURE__*/React.createElement("p", null, "No goals assigned yet."), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '14px',
        marginTop: '10px'
      }
    }, "Your coach will create goals for your recovery journey."));
  }

  // Calculate summary stats
  const activeGoals = goals.filter(g => g.status !== 'completed').length;
  const activeObjectives = objectives.filter(o => o.status !== 'completed').length;
  const activeAssignments = assignments.filter(a => a.status !== 'completed').length;
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const completionRate = totalAssignments > 0 ? Math.round(completedAssignments / totalAssignments * 100) : 0;

  // Separate active and completed goals
  const activeGoalsData = goals.filter(g => g.status !== 'completed');
  const completedGoalsData = goals.filter(g => g.status === 'completed');

  // Calculate assignments due today
  const calculateDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;

    // TODO: Add check-ins and reflections when user data is passed
    // For now, count only assignments and objectives

    // Count assignments due today
    const assignmentsDueToday = assignments.filter(a => {
      if (a.status === 'completed') return false;
      if (!a.dueDate) return false;
      const dueDate = a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
    count += assignmentsDueToday;

    // Count objectives due today
    const objectivesDueToday = objectives.filter(o => {
      if (o.status === 'completed') return false;
      if (!o.dueDate) return false;
      const dueDate = o.dueDate.toDate ? o.dueDate.toDate() : new Date(o.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
    count += objectivesDueToday;
    return count;
  };
  const dueToday = calculateDueToday();

  // Update parent component with due today count
  useEffect(() => {
    if (onDueTodayChange) {
      onDueTodayChange(dueToday);
    }
  }, [dueToday, onDueTodayChange]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px',
      paddingBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: '#000000',
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '16px 0 12px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: '20px',
      height: '20px',
      color: '#0077CC'
    }
  }), "Active Goals (", activeGoalsData.length, ")"), activeGoalsData.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, rgba(0,119,204,0.05) 0%, rgba(5,133,133,0.05) 100%)',
      borderRadius: '12px',
      padding: '40px 20px',
      textAlign: 'center',
      border: '2px dashed #0077CC'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: '56px',
      height: '56px',
      color: '#0077CC',
      marginBottom: '16px'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#000000',
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 8px 0'
    }
  }, "Your Goal Journey Awaits"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#666666',
      fontSize: '14px',
      margin: '0 0 16px 0',
      lineHeight: '1.5'
    }
  }, "Your coach will create personalized goals tailored to your recovery journey. Check back soon to see your customized roadmap to success."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#0077CC',
      fontSize: '13px',
      fontWeight: '500'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sparkles",
    style: {
      width: '16px',
      height: '16px'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Goals will appear here once assigned"))) : activeGoalsData.map(goal => {
    const goalObjectives = objectives.filter(o => o.goalId === goal.id);
    const goalProgress = calculateGoalProgress(goal.id);
    const isExpanded = expandedGoals[goal.id];
    const isGoalCompleted = goal.status === 'completed';
    const dueDateStatus = getDueDateStatus(goal.dueDate, isGoalCompleted);
    return /*#__PURE__*/React.createElement("div", {
      key: goal.id,
      style: {
        background: '#FFFFFF',
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `3px solid ${isGoalCompleted ? '#0077CC' : '#0077CC'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => toggleGoal(goal.id),
      style: {
        padding: '16px',
        cursor: 'pointer',
        borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.08)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right",
      style: {
        width: '20px',
        height: '20px',
        color: '#666666',
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        flexShrink: 0,
        marginTop: '2px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        color: '#FFFFFF'
      }
    }, "GOAL"), isGoalCompleted && /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '16px',
        height: '16px',
        color: '#0077CC'
      }
    })), /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#000000',
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: isGoalCompleted ? 'line-through' : 'none',
        opacity: isGoalCompleted ? 0.6 : 1
      }
    }, goal.title))), goal.description && /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#666666',
        fontSize: '13px',
        marginBottom: '12px',
        paddingLeft: '32px',
        lineHeight: '1.5'
      }
    }, makeLinksClickable(goal.description)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '16px',
        marginBottom: '12px',
        paddingLeft: '32px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#999999',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '12px',
        height: '12px'
      }
    }), formatDate(goal.createdAt)), goal.dueDate && /*#__PURE__*/React.createElement("span", {
      style: {
        color: dueDateStatus.color === '#4CAF50' ? '#0077CC' : dueDateStatus.color,
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '500'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clock",
      style: {
        width: '12px',
        height: '12px'
      }
    }), dueDateStatus.text)), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingLeft: '32px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#E9ECEF',
        borderRadius: '4px',
        height: '6px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(90deg, #0077CC 0%, #005A9C 100%)',
        width: `${goalProgress}%`,
        height: '100%',
        transition: 'width 0.3s ease'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666',
        fontSize: '11px',
        fontWeight: '500'
      }
    }, goalProgress, "% Complete"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#999999',
        fontSize: '11px'
      }
    }, goalObjectives.length, " Objectives \u2022 ", assignments.filter(a => a.goalId === goal.id).length, " Tasks")))), isExpanded && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 16px 16px 16px'
      }
    }, goalObjectives.length === 0 ? /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#999999',
        fontSize: '13px',
        paddingLeft: '32px',
        margin: '12px 0'
      }
    }, "No objectives created yet.") : goalObjectives.map(objective => {
      const objectiveAssignments = assignments.filter(a => a.objectiveId === objective.id);
      const isObjectiveCompleted = objective.status === 'completed';
      const isObjectiveExpanded = expandedObjectives[objective.id];
      return /*#__PURE__*/React.createElement("div", {
        key: objective.id,
        style: {
          marginTop: '12px',
          marginLeft: '20px',
          paddingLeft: '16px',
          borderLeft: '2px solid #058585'
        }
      }, /*#__PURE__*/React.createElement("div", {
        onClick: e => {
          e.stopPropagation();
          toggleObjective(objective.id);
        },
        style: {
          background: '#F8F9FA',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
          cursor: 'pointer',
          transition: 'background 0.2s',
          border: '1px solid #E9ECEF'
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = '#E9ECEF';
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = '#F8F9FA';
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "chevron-right",
        style: {
          width: '16px',
          height: '16px',
          color: '#666666',
          transform: isObjectiveExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          background: 'linear-gradient(135deg, #058585 0%, #046B6B 100%)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          letterSpacing: '0.5px'
        }
      }, "OBJECTIVE"), isObjectiveCompleted && /*#__PURE__*/React.createElement("i", {
        "data-lucide": "check-circle",
        style: {
          width: '14px',
          height: '14px',
          color: '#058585'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#000000',
          fontSize: '13px',
          fontWeight: '500',
          textDecoration: isObjectiveCompleted ? 'line-through' : 'none',
          opacity: isObjectiveCompleted ? 0.6 : 1,
          flex: 1
        }
      }, objective.title), /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#999999',
          fontSize: '11px'
        }
      }, objectiveAssignments.length, " tasks"))), isObjectiveExpanded && objectiveAssignments.map(assignment => {
        const isAssignmentCompleted = assignment.status === 'completed';
        return /*#__PURE__*/React.createElement("div", {
          key: assignment.id,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: '20px',
            marginBottom: '8px',
            paddingLeft: '16px',
            borderLeft: '1px solid #CED4DA'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: isAssignmentCompleted,
          disabled: isAssignmentCompleted,
          onChange: e => {
            if (!isAssignmentCompleted && e.target.checked) {
              onAssignmentComplete(assignment.id, true);
            }
          },
          style: {
            width: '20px',
            height: '20px',
            cursor: isAssignmentCompleted ? 'not-allowed' : 'pointer',
            accentColor: '#00A86B',
            flexShrink: 0
          }
        }), /*#__PURE__*/React.createElement("div", {
          onClick: () => openItemModal(assignment, 'assignment'),
          style: {
            flex: 1,
            background: '#FFFFFF',
            borderRadius: '6px',
            padding: '10px',
            border: '1px solid #E9ECEF',
            cursor: 'pointer',
            transition: 'background 0.2s'
          },
          onMouseEnter: e => {
            e.currentTarget.style.background = '#F8F9FA';
          },
          onMouseLeave: e => {
            e.currentTarget.style.background = '#FFFFFF';
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '8px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: '0.5px'
          }
        }, "TASK"), isAssignmentCompleted && /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-circle",
          style: {
            width: '12px',
            height: '12px',
            color: '#00A86B'
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            color: '#000000',
            fontSize: '12px',
            textDecoration: isAssignmentCompleted ? 'line-through' : 'none',
            opacity: isAssignmentCompleted ? 0.5 : 1,
            flex: 1
          }
        }, assignment.title), /*#__PURE__*/React.createElement("i", {
          "data-lucide": "arrow-right",
          style: {
            width: '12px',
            height: '12px',
            color: '#CCCCCC'
          }
        }))));
      }));
    })));
  })), completedGoalsData.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px',
      paddingBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: '#000000',
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '16px 0 12px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle",
    style: {
      width: '20px',
      height: '20px',
      color: '#0077CC'
    }
  }), "Completed Goals (", completedGoalsData.length, ")"), completedGoalsData.map(goal => {
    const goalObjectives = objectives.filter(o => o.goalId === goal.id);
    const goalProgress = calculateGoalProgress(goal.id);
    const isExpanded = expandedGoals[goal.id];
    const isGoalCompleted = goal.status === 'completed';
    const dueDateStatus = getDueDateStatus(goal.dueDate, isGoalCompleted);
    return /*#__PURE__*/React.createElement("div", {
      key: goal.id,
      style: {
        background: '#FFFFFF',
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `3px solid ${isGoalCompleted ? '#0077CC' : '#0077CC'}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => toggleGoal(goal.id),
      style: {
        padding: '16px',
        cursor: 'pointer',
        borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.08)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right",
      style: {
        width: '20px',
        height: '20px',
        color: '#666666',
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        flexShrink: 0,
        marginTop: '2px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        color: '#FFFFFF'
      }
    }, "GOAL"), isGoalCompleted && /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '16px',
        height: '16px',
        color: '#0077CC'
      }
    })), /*#__PURE__*/React.createElement("h3", {
      style: {
        color: '#000000',
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: isGoalCompleted ? 'line-through' : 'none',
        opacity: isGoalCompleted ? 0.6 : 1
      }
    }, goal.title))), goal.description && /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#666666',
        fontSize: '13px',
        marginBottom: '12px',
        paddingLeft: '32px',
        lineHeight: '1.5'
      }
    }, makeLinksClickable(goal.description)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '16px',
        marginBottom: '12px',
        paddingLeft: '32px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#999999',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '12px',
        height: '12px'
      }
    }), formatDate(goal.createdAt)), goal.completedAt && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#0077CC',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '500'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "check-circle",
      style: {
        width: '12px',
        height: '12px'
      }
    }), "Completed ", formatDate(goal.completedAt))), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingLeft: '32px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#E9ECEF',
        borderRadius: '4px',
        height: '6px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(90deg, #0077CC 0%, #005A9C 100%)',
        width: `${goalProgress}%`,
        height: '100%',
        transition: 'width 0.3s ease'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666666',
        fontSize: '11px',
        fontWeight: '500'
      }
    }, goalProgress, "% Complete"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#999999',
        fontSize: '11px'
      }
    }, goalObjectives.length, " Objectives \u2022 ", assignments.filter(a => a.goalId === goal.id).length, " Tasks")))), isExpanded && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 16px 16px 16px'
      }
    }, goalObjectives.length === 0 ? /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#999999',
        fontSize: '13px',
        paddingLeft: '32px',
        margin: '12px 0'
      }
    }, "No objectives created yet.") : goalObjectives.map(objective => {
      const objectiveAssignments = assignments.filter(a => a.objectiveId === objective.id);
      const isObjectiveCompleted = objective.status === 'completed';
      const isObjectiveExpanded = expandedObjectives[objective.id];
      return /*#__PURE__*/React.createElement("div", {
        key: objective.id,
        style: {
          marginTop: '12px',
          marginLeft: '20px',
          paddingLeft: '16px',
          borderLeft: '2px solid #058585'
        }
      }, /*#__PURE__*/React.createElement("div", {
        onClick: e => {
          e.stopPropagation();
          toggleObjective(objective.id);
        },
        style: {
          background: '#F8F9FA',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
          cursor: 'pointer',
          transition: 'background 0.2s',
          border: '1px solid #E9ECEF'
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = '#E9ECEF';
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = '#F8F9FA';
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": "chevron-right",
        style: {
          width: '16px',
          height: '16px',
          color: '#666666',
          transform: isObjectiveExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          background: 'linear-gradient(135deg, #058585 0%, #046B6B 100%)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          letterSpacing: '0.5px'
        }
      }, "OBJECTIVE"), isObjectiveCompleted && /*#__PURE__*/React.createElement("i", {
        "data-lucide": "check-circle",
        style: {
          width: '14px',
          height: '14px',
          color: '#058585'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#000000',
          fontSize: '13px',
          fontWeight: '500',
          textDecoration: isObjectiveCompleted ? 'line-through' : 'none',
          opacity: isObjectiveCompleted ? 0.6 : 1,
          flex: 1
        }
      }, objective.title), /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#999999',
          fontSize: '11px'
        }
      }, objectiveAssignments.length, " tasks"))), isObjectiveExpanded && objectiveAssignments.map(assignment => {
        const isAssignmentCompleted = assignment.status === 'completed';
        return /*#__PURE__*/React.createElement("div", {
          key: assignment.id,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: '20px',
            marginBottom: '8px',
            paddingLeft: '16px',
            borderLeft: '1px solid #CED4DA'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: isAssignmentCompleted,
          disabled: isAssignmentCompleted,
          onChange: e => {
            if (!isAssignmentCompleted && e.target.checked) {
              onAssignmentComplete(assignment.id, true);
            }
          },
          style: {
            width: '20px',
            height: '20px',
            cursor: isAssignmentCompleted ? 'not-allowed' : 'pointer',
            accentColor: '#00A86B',
            flexShrink: 0
          }
        }), /*#__PURE__*/React.createElement("div", {
          onClick: () => openItemModal(assignment, 'assignment'),
          style: {
            flex: 1,
            background: '#FFFFFF',
            borderRadius: '6px',
            padding: '10px',
            border: '1px solid #E9ECEF',
            cursor: 'pointer',
            transition: 'background 0.2s'
          },
          onMouseEnter: e => {
            e.currentTarget.style.background = '#F8F9FA';
          },
          onMouseLeave: e => {
            e.currentTarget.style.background = '#FFFFFF';
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '8px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: '0.5px'
          }
        }, "TASK"), isAssignmentCompleted && /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-circle",
          style: {
            width: '12px',
            height: '12px',
            color: '#00A86B'
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            color: '#000000',
            fontSize: '12px',
            textDecoration: isAssignmentCompleted ? 'line-through' : 'none',
            opacity: isAssignmentCompleted ? 0.5 : 1,
            flex: 1
          }
        }, assignment.title), /*#__PURE__*/React.createElement("i", {
          "data-lucide": "arrow-right",
          style: {
            width: '12px',
            height: '12px',
            color: '#CCCCCC'
          }
        }))));
      }));
    })));
  })));
}

// Expose to global namespace
window.GLRSApp.components.GoalsTasksView = GoalsTasksView;