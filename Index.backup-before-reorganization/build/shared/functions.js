// ============================================================
// GLRS LIGHTHOUSE - CLOUD FUNCTIONS SERVICE
// ============================================================
// Firebase Cloud Functions integrations
// Part of modular architecture - handles Cloud Function calls
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.services = window.GLRSApp.services || {};

// Initialize Cloud Functions (if available)
let functions = null;
if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.functions) {
  functions = firebase.functions();
  window.GLRSApp.functions = functions;
  window.functions = functions;
  console.log('✅ Firebase Functions initialized');
} else {
  console.warn('⚠️ Firebase Functions not available');
}

// ============================================================
// CLOUD FUNCTION WRAPPERS
// ============================================================

window.GLRSApp.services.functions = {
  // Generic callable function wrapper
  callFunction: async (functionName, data = {}) => {
    if (!functions) {
      throw new Error('Firebase Functions not initialized');
    }
    try {
      const callable = functions.httpsCallable(functionName);
      const result = await callable(data);
      return result.data;
    } catch (error) {
      console.error(`Error calling function ${functionName}:`, error);
      throw error;
    }
  }

  // Example functions (to be implemented when Cloud Functions are added):

  // Send notification
  // sendNotification: async (userId, notification) => {
  //     return await window.GLRSApp.services.functions.callFunction('sendNotification', {
  //         userId,
  //         notification
  //     });
  // },

  // Generate report
  // generateReport: async (userId, reportType, dateRange) => {
  //     return await window.GLRSApp.services.functions.callFunction('generateReport', {
  //         userId,
  //         reportType,
  //         dateRange
  //     });
  // },

  // Process payment
  // processPayment: async (userId, amount, paymentMethod) => {
  //     return await window.GLRSApp.services.functions.callFunction('processPayment', {
  //         userId,
  //         amount,
  //         paymentMethod
  //     });
  // }
};

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

// Expose callFunction at root level
window.callFunction = window.GLRSApp.services.functions.callFunction;
console.log('✅ functions.js loaded - Cloud Functions service available');