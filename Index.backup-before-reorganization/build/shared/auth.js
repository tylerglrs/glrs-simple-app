// ============================================================
// GLRS LIGHTHOUSE - AUTHENTICATION UTILITIES
// ============================================================
// Firebase authentication helper functions
// Extracted from PIRapp.js for modularity
// ============================================================

window.GLRSApp = window.GLRSApp || {};

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

// Get current authenticated user (Firebase auth + Firestore data)
window.GLRSApp.authUtils = {
  // Get current user ID
  getCurrentUserId: () => {
    const user = firebase.auth().currentUser;
    return user ? user.uid : null;
  },
  // Check if user is authenticated
  isAuthenticated: () => {
    return firebase.auth().currentUser !== null;
  },
  // Get current Firebase auth user object
  getCurrentUser: () => {
    return firebase.auth().currentUser;
  },
  // Handle user logout
  handleLogout: async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await firebase.auth().signOut();
        console.log(' User signed out');
      } catch (error) {
        console.error('L Logout error:', error);
        alert('Error signing out. Please try again.');
      }
    }
  },
  // Get current user email
  getCurrentUserEmail: () => {
    const user = firebase.auth().currentUser;
    return user ? user.email : null;
  },
  // Check if user email is verified
  isEmailVerified: () => {
    const user = firebase.auth().currentUser;
    return user ? user.emailVerified : false;
  }
};
console.log('✅ auth.js loaded - Authentication utilities available at window.GLRSApp.authUtils');