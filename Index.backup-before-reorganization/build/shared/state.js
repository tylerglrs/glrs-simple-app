// ============================================================
// GLRS LIGHTHOUSE - STATE MANAGEMENT
// ============================================================
// Session and local storage utilities
// Provides state persistence across page reloads
// ============================================================

window.GLRSApp = window.GLRSApp || {};

// ============================================================
// STATE PERSISTENCE UTILITIES
// ============================================================

window.GLRSApp.state = {
  // --------------------------------------------------------
  // SESSION STORAGE (temporary - clears on browser close)
  // --------------------------------------------------------

  // Save page state to sessionStorage
  savePageState: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving page state:', error);
      return false;
    }
  },
  // Restore page state from sessionStorage
  restorePageState: (key, defaultValue = null) => {
    try {
      const serialized = sessionStorage.getItem(key);
      if (serialized === null) {
        return defaultValue;
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error restoring page state:', error);
      return defaultValue;
    }
  },
  // Clear specific page state
  clearPageState: key => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing page state:', error);
      return false;
    }
  },
  // Clear all page state
  clearAllPageState: () => {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all page state:', error);
      return false;
    }
  },
  // --------------------------------------------------------
  // LOCAL STORAGE (persistent - survives browser close)
  // --------------------------------------------------------

  // Save user preference to localStorage
  savePreference: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`glrs_${key}`, serialized);
      return true;
    } catch (error) {
      console.error('Error saving preference:', error);
      return false;
    }
  },
  // Get user preference from localStorage
  getPreference: (key, defaultValue = null) => {
    try {
      const serialized = localStorage.getItem(`glrs_${key}`);
      if (serialized === null) {
        return defaultValue;
      }
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error getting preference:', error);
      return defaultValue;
    }
  },
  // Clear specific preference
  clearPreference: key => {
    try {
      localStorage.removeItem(`glrs_${key}`);
      return true;
    } catch (error) {
      console.error('Error clearing preference:', error);
      return false;
    }
  },
  // Clear all preferences
  clearAllPreferences: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('glrs_'));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing all preferences:', error);
      return false;
    }
  },
  // --------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------

  // Check if storage is available
  isStorageAvailable: (type = 'localStorage') => {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
};
console.log(' state.js loaded - State persistence utilities available');