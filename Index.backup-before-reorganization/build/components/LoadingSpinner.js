// ═══════════════════════════════════════════════════════════
// LOADING SPINNER COMPONENT
// Reusable loading indicator with optional message
// ═══════════════════════════════════════════════════════════

const LoadingSpinner = ({
  message = 'Loading...'
}) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '15px'
    }
  }, [React.createElement('div', {
    key: 'spinner',
    style: {
      width: '50px',
      height: '50px',
      border: '4px solid rgba(6, 148, 148, 0.2)',
      borderTop: '4px solid #069494',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  }), React.createElement('div', {
    key: 'message',
    style: {
      color: '#666',
      fontSize: '14px',
      fontWeight: '500'
    }
  }, message)]);
};

// Register globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LoadingSpinner = LoadingSpinner;
console.log('✅ LoadingSpinner component loaded');