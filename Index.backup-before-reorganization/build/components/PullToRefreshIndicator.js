// ═══════════════════════════════════════════════════════════
// PULL-TO-REFRESH INDICATOR COMPONENT
// Visual indicator shown during pull-to-refresh gesture
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const PullToRefreshIndicator = () => {
  // Get state from Context
  const {
    pulling,
    pullDistance,
    refreshing
  } = useAppContext();
  if (!pulling) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: `translateX(-50%) translateY(${Math.min(pullDistance, 80)}px)`,
      zIndex: 999,
      transition: refreshing ? 'transform 0.3s' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(6, 148, 148, 0.3)',
      animation: refreshing ? 'spin 1s linear infinite' : 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": refreshing ? "loader" : "arrow-down",
    style: {
      width: '24px',
      height: '24px',
      color: '#fff'
    }
  })));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.PullToRefreshIndicator = PullToRefreshIndicator;
console.log('✅ PullToRefreshIndicator component loaded');