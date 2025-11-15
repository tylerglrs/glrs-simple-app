// ═══════════════════════════════════════════════════════════
// CRISIS BUTTON COMPONENT
// Floating emergency resources button
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const CrisisButton = () => {
  // Get state from Context
  const {
    setShowCrisisModal
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      zIndex: 999
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowCrisisModal(true),
    style: {
      background: '#DC143C',
      color: '#fff',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(220, 20, 60, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: "Crisis Resources"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '32px',
      height: '32px'
    }
  })));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.CrisisButton = CrisisButton;
console.log('✅ CrisisButton component loaded');