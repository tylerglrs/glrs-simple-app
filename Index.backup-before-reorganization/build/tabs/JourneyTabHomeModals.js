// ================================================================
// JOURNEY/HOME TAB MODALS - Savings Jar Feature
// Extracted from ModalContainer.js Lines 17625-18258 (634 lines)
// Original comment: "JOURNEYTAB MODALS - Copied from JourneyTab.js"
// Date: Current session
// ================================================================

// JourneyTabHomeModals Component
// Renders 4 savings-related modals for Journey/Home tabs
function JourneyTabHomeModals({
  // Visibility state props
  showSetGoalModal,
  showJarModal,
  showAddCountdownModal,
  showUpdateAmountModal,
  // Close handler props
  setShowSetGoalModal,
  setShowJarModal,
  setShowAddCountdownModal,
  setShowUpdateAmountModal,
  // Data props
  userData,
  savingsGoals,
  activeSavingsGoal,
  setActiveSavingsGoal,
  actualMoneySaved,
  setActualMoneySaved,
  customGoalItems,
  setCustomGoalItems,
  tempAmount,
  setTempAmount,
  // Function props
  calculateSobrietyDays
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, showSetGoalModal && (() => {
    // Calculate totalDays and dailyCost for modal scope
    const modalTotalDays = calculateSobrietyDays(userData.sobrietyDate);
    const dailyCost = userData?.dailyCost || 20;
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
      onClick: () => setShowSetGoalModal(false)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
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
        borderBottom: '2px solid #058585',
        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
        color: '#fff',
        borderRadius: '15px 15px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '20px'
      }
    }, "Choose Your Savings Goal"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowSetGoalModal(false),
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0',
        lineHeight: '1'
      }
    }, "\xD7")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '20px'
      }
    }, "Select a goal to track your progress. Your savings will be measured against this goal."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }
    }, savingsGoals.map((goal, index) => {
      const totalSaved = modalTotalDays * dailyCost;
      const progress = Math.min(100, totalSaved / goal.amount * 100);
      const achieved = totalSaved >= goal.amount;
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        onClick: () => {
          setActiveSavingsGoal(goal);
          setShowSetGoalModal(false);
        },
        style: {
          padding: '16px',
          border: activeSavingsGoal?.name === goal.name ? '2px solid #058585' : '1px solid #ddd',
          borderRadius: '10px',
          cursor: 'pointer',
          background: achieved ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)' : '#fff',
          transition: 'all 0.2s ease'
        },
        onMouseEnter: e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        },
        onMouseLeave: e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": goal.icon,
        style: {
          width: '24px',
          height: '24px',
          strokeWidth: 2,
          color: '#058585'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '16px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2px'
        }
      }, goal.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '14px',
          color: '#666'
        }
      }, "$", goal.amount.toLocaleString())), achieved && /*#__PURE__*/React.createElement("div", {
        style: {
          background: '#00A86B',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600'
        }
      }, "ACHIEVED")), /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: '6px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: `${progress}%`,
          height: '100%',
          background: achieved ? '#00A86B' : '#058585',
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: '12px',
          color: '#666',
          marginTop: '6px'
        }
      }, Math.round(progress), "% progress"));
    })))));
  })(), showJarModal && (() => {
    // Calculate totalDays and dailyCost for modal scope
    const modalTotalDays = calculateSobrietyDays(userData.sobrietyDate);
    const dailyCost = userData?.dailyCost || 20;
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
      onClick: () => setShowJarModal(false)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
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
        borderBottom: '2px solid #FFD700',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
        color: '#333',
        borderRadius: '15px 15px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "piggy-bank",
      style: {
        width: '24px',
        height: '24px',
        strokeWidth: 2
      }
    }), "Your Savings Jar"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowJarModal(false),
      style: {
        background: 'none',
        border: 'none',
        color: '#333',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0',
        lineHeight: '1'
      }
    }, "\xD7")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '24px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '30px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '16px'
      }
    }, "Based on your sobriety, you would have spent:"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#058585',
        marginBottom: '8px'
      }
    }, "$", (modalTotalDays * dailyCost).toLocaleString()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#999'
      }
    }, "Virtual Savings ($", dailyCost, "/day \xD7 ", modalTotalDays, " days)")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, #ddd 50%, transparent 100%)',
        marginBottom: '20px'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px'
      }
    }, "Money you've actually saved:"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#00A86B',
        marginBottom: '8px'
      }
    }, "$", actualMoneySaved.toLocaleString()), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setTempAmount(actualMoneySaved.toString());
        setShowUpdateAmountModal(true);
      },
      style: {
        background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
      }
    }, "Update Amount")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#f8f9fa',
        borderRadius: '10px',
        padding: '16px',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '12px'
      }
    }, "Savings Breakdown"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        color: '#666'
      }
    }, "Days Sober:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#333'
      }
    }, modalTotalDays)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        color: '#666'
      }
    }, "Daily Cost:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#333'
      }
    }, "$", dailyCost)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        color: '#666'
      }
    }, "Total Virtual:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#058585'
      }
    }, "$", (modalTotalDays * dailyCost).toLocaleString())), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '1px',
        background: '#ddd',
        margin: '8px 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        color: '#666'
      }
    }, "Actual Saved:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#00A86B'
      }
    }, "$", actualMoneySaved.toLocaleString()))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '20px',
        padding: '12px',
        background: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: '12px',
        color: '#856404'
      }
    }, "\uD83D\uDCA1 Tip: Keep your actual savings separate to build your emergency fund!")))));
  })(), showAddCountdownModal && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setShowAddCountdownModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '2px solid #058585',
      background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
      color: '#fff',
      borderRadius: '15px 15px 0 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px'
    }
  }, "Add Custom Goal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAddCountdownModal(false),
    style: {
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }
  }, "Goal Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "customGoalName",
    placeholder: "e.g., New Laptop, Vacation, Car Repair",
    style: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }
  }, "Target Amount ($)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "customGoalAmount",
    placeholder: "e.g., 1500",
    min: "1",
    style: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }
  }, "Choose Icon"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '8px'
    }
  }, ['dollar-sign', 'shopping-cart', 'home', 'car', 'plane', 'heart', 'gift', 'trophy', 'star', 'zap', 'music', 'book'].map(iconName => /*#__PURE__*/React.createElement("button", {
    key: iconName,
    onClick: e => {
      document.querySelectorAll('.custom-goal-icon-btn').forEach(btn => {
        btn.style.border = '2px solid #ddd';
        btn.style.background = '#fff';
      });
      e.currentTarget.style.border = '2px solid #058585';
      e.currentTarget.style.background = 'rgba(5, 133, 133, 0.1)';
      e.currentTarget.dataset.selected = 'true';
    },
    className: "custom-goal-icon-btn",
    "data-icon": iconName,
    style: {
      padding: '12px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      background: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": iconName,
    style: {
      width: '20px',
      height: '20px',
      strokeWidth: 2,
      color: '#058585'
    }
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const name = document.getElementById('customGoalName').value;
      const amount = parseFloat(document.getElementById('customGoalAmount').value);
      const selectedIcon = document.querySelector('.custom-goal-icon-btn[data-selected="true"]');
      const icon = selectedIcon ? selectedIcon.dataset.icon : 'target';
      if (!name || !amount || amount <= 0) {
        alert('Please enter a valid name and amount');
        return;
      }
      const newGoal = {
        name,
        amount,
        icon,
        custom: true
      };
      setCustomGoalItems([...customGoalItems, newGoal]);
      setShowAddCountdownModal(false);

      // Clear form
      document.getElementById('customGoalName').value = '';
      document.getElementById('customGoalAmount').value = '';
      document.querySelectorAll('.custom-goal-icon-btn').forEach(btn => {
        btn.style.border = '2px solid #ddd';
        btn.style.background = '#fff';
        btn.dataset.selected = 'false';
      });
    },
    style: {
      width: '100%',
      background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
      color: '#fff',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Add Goal")))), showUpdateAmountModal && /*#__PURE__*/React.createElement("div", {
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
      zIndex: 10001,
      padding: '20px'
    },
    onClick: () => setShowUpdateAmountModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '15px',
      maxWidth: '400px',
      width: '100%'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '2px solid #058585',
      background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
      color: '#fff',
      borderRadius: '15px 15px 0 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '20px'
    }
  }, "Update Savings Amount"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowUpdateAmountModal(false),
    style: {
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '16px'
    }
  }, "Enter the amount you've actually saved so far."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }
  }, "Amount ($)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: tempAmount,
    onChange: e => setTempAmount(e.target.value),
    min: "0",
    step: "0.01",
    placeholder: "0.00",
    autoFocus: true,
    style: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #058585',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    onKeyPress: e => {
      if (e.key === 'Enter') {
        const amount = parseFloat(tempAmount);
        if (!isNaN(amount) && amount >= 0) {
          setActualMoneySaved(amount);
          setShowUpdateAmountModal(false);
        } else {
          alert('Please enter a valid amount');
        }
      }
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowUpdateAmountModal(false),
    style: {
      flex: 1,
      background: '#f0f0f0',
      color: '#666',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const amount = parseFloat(tempAmount);
      if (!isNaN(amount) && amount >= 0) {
        setActualMoneySaved(amount);
        setShowUpdateAmountModal(false);
      } else {
        alert('Please enter a valid amount');
      }
    },
    style: {
      flex: 1,
      background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
      color: '#fff',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }, "Update"))))));
}

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.JourneyTabHomeModals = JourneyTabHomeModals;